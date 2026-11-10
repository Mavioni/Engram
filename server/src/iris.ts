/**
 * Engram — IRIS route handler
 * POST /api/iris  (auth-required; mounted in index.ts)
 *
 * Responsibilities:
 *  1. Validate + scrub incoming messages
 *  2. Call Anthropic Sonnet 4.6 with prompt-cached system prompt
 *  3. Stream response as Server-Sent Events (SSE)
 *  4. Persist token usage to D1 `messages` table for billing
 *  5. Rate-limit stub (TODO: enforce free-tier 30 turns/day via KV)
 *  6. Graceful error handling (Anthropic 429 / 5xx)
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Context } from "hono";
import type { Env } from "./index";
import { IRIS_SYSTEM_PROMPT } from "./iris-prompt";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL = "claude-sonnet-4-6" as const;
const MAX_TOKENS = 800;
const MAX_CONTENT_CHARS = 4000;
const FALLBACK_MESSAGE =
  "I'm having a moment of stillness. Let's continue shortly.";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IrisMessage {
  role: "user" | "assistant";
  content: string;
}

interface IrisRequestBody {
  messages: IrisMessage[];
  sessionId?: string;
}

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal prompt-injection scrub:
 *  - Truncate to MAX_CONTENT_CHARS
 *  - Strip null bytes
 *  - Collapse repeated newlines (>3 → 2) to resist token-padding attacks
 */
function scrubContent(raw: string): string {
  return raw
    .replace(/\0/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, MAX_CONTENT_CHARS);
}

function isValidRole(role: unknown): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

function validateMessages(raw: unknown): IrisMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("messages must be a non-empty array");
  }
  return raw.map((m, i) => {
    if (!m || typeof m !== "object") throw new Error(`messages[${i}] invalid`);
    const { role, content } = m as Record<string, unknown>;
    if (!isValidRole(role)) throw new Error(`messages[${i}].role invalid`);
    if (typeof content !== "string" || content.trim() === "") {
      throw new Error(`messages[${i}].content invalid`);
    }
    return { role, content: scrubContent(content) };
  });
}

/** Persist a single message row to D1. Fire-and-forget — never throws. */
async function persistMessage(
  db: D1Database,
  params: {
    id: string;
    sessionId: string;
    role: "user" | "assistant" | "system";
    content: string;
    tokensIn: number;
    tokensOut: number;
    cacheReadTokens: number;
  }
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO messages
           (id, session_id, role, content, tokens_in, tokens_out, cache_read_tokens, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        params.id,
        params.sessionId,
        params.role,
        params.content,
        params.tokensIn,
        params.tokensOut,
        params.cacheReadTokens,
        Date.now()
      )
      .run();
  } catch (err) {
    // Non-fatal: billing audit failure must not break the response stream.
    console.error("[iris] D1 persist error", err);
  }
}

/** Generate a ULID-style ID (timestamp prefix + random suffix, URL-safe). */
function newId(): string {
  const ts = Date.now().toString(36).toUpperCase().padStart(9, "0");
  const rand = Math.random().toString(36).slice(2, 11).toUpperCase();
  return `${ts}${rand}`;
}

// ---------------------------------------------------------------------------
// Rate-limit stub
// ---------------------------------------------------------------------------

/**
 * TODO(free-tier-enforcement): enforce 30 IRIS turns/day for free-plan users.
 * Implementation sketch:
 *   1. Read entitlements.plan for userId from D1.
 *   2. If plan === 'free', check KV key `rl:iris:{userId}:{YYYYMMDD}` (atomic counter).
 *   3. If counter >= 30, return 429.
 *   4. Increment counter with TTL = seconds until midnight UTC.
 * Requires: KV binding added to wrangler.toml + Env type.
 */
async function checkRateLimit(
  _userId: string,
  _env: Env
): Promise<{ allowed: boolean; remaining: number }> {
  // STUB: always allow until KV binding is wired.
  return { allowed: true, remaining: 30 };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function handleIris(
  c: Context<{ Bindings: Env; Variables: { user: { id: string; email: string } } }>
): Promise<Response> {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "unauthorized" }, 401);
  }

  // ----- Rate limit -----
  const { allowed, remaining } = await checkRateLimit(user.id, c.env);
  if (!allowed) {
    return c.json(
      { error: "daily IRIS limit reached", remaining: 0 },
      429,
      { "X-RateLimit-Remaining": "0" }
    );
  }

  // ----- Parse + validate body -----
  let body: IrisRequestBody;
  try {
    body = await c.req.json<IrisRequestBody>();
  } catch {
    return c.json({ error: "invalid JSON body" }, 400);
  }

  let messages: IrisMessage[];
  try {
    messages = validateMessages(body.messages);
  } catch (err) {
    return c.json({ error: String(err) }, 422);
  }

  const sessionId = body.sessionId ?? newId();

  // ----- Anthropic client -----
  const anthropic = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY });

  // ----- Check if client accepts SSE -----
  const acceptsSSE =
    c.req.header("Accept")?.includes("text/event-stream") ?? false;

  // ---------------------------------------------------------------------------
  // STREAMING path (preferred)
  // ---------------------------------------------------------------------------
  if (acceptsSSE) {
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const writeSSE = async (event: string, data: string): Promise<void> => {
      await writer.write(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
    };

    // Run streaming in background; return the readable immediately.
    (async () => {
      let assistantContent = "";
      let usage: TokenUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 };

      try {
        const stream = await anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          // Prompt-cache the system block: cache_control ephemeral pins this
          // block in the 5-minute prompt-cache window, collapsing ~90% of
          // system-prompt token cost on subsequent turns (ARCHITECTURE.md §4).
          system: [
            {
              type: "text",
              text: IRIS_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        // Stream content deltas to client
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            assistantContent += chunk.delta.text;
            await writeSSE("delta", JSON.stringify({ text: chunk.delta.text }));
          }

          // Capture usage from the final message event
          if (chunk.type === "message_delta" && chunk.usage) {
            usage.outputTokens = chunk.usage.output_tokens ?? 0;
          }
          if (chunk.type === "message_start" && chunk.message.usage) {
            usage.inputTokens = chunk.message.usage.input_tokens ?? 0;
            // cache_read_input_tokens is a prompt-caching extension field
            usage.cacheReadTokens =
              (chunk.message.usage as Record<string, number>)
                .cache_read_input_tokens ?? 0;
          }
        }

        // Signal completion with stop reason
        const finalMsg = await stream.finalMessage();
        await writeSSE(
          "done",
          JSON.stringify({ stopReason: finalMsg.stop_reason })
        );
      } catch (err: unknown) {
        const isAnthropicError =
          err instanceof Anthropic.APIError;
        const status = isAnthropicError ? err.status : 500;

        if (status === 429 || (status >= 500 && status < 600)) {
          await writeSSE(
            "error",
            JSON.stringify({ message: FALLBACK_MESSAGE, code: status })
          );
        } else {
          await writeSSE(
            "error",
            JSON.stringify({ message: "unexpected error", code: status })
          );
        }
        console.error("[iris] Anthropic stream error", err);
      } finally {
        // ----- Persist assistant message + token usage -----
        if (assistantContent) {
          await persistMessage(c.env.DB, {
            id: newId(),
            sessionId,
            role: "assistant",
            content: assistantContent,
            tokensIn: usage.inputTokens,
            tokensOut: usage.outputTokens,
            cacheReadTokens: usage.cacheReadTokens,
          });
        }
        await writer.close();
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "X-RateLimit-Remaining": String(remaining - 1),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // NON-STREAMING fallback
  // ---------------------------------------------------------------------------
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: IRIS_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    const usage: TokenUsage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheReadTokens:
        (response.usage as Record<string, number>).cache_read_input_tokens ?? 0,
    };

    // Persist
    await persistMessage(c.env.DB, {
      id: newId(),
      sessionId,
      role: "assistant",
      content,
      tokensIn: usage.inputTokens,
      tokensOut: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
    });

    return c.json(
      { content, stopReason: response.stop_reason },
      200,
      { "X-RateLimit-Remaining": String(remaining - 1) }
    );
  } catch (err: unknown) {
    const isAnthropicError = err instanceof Anthropic.APIError;
    const status = isAnthropicError ? err.status : 500;
    console.error("[iris] Anthropic non-stream error", err);

    if (status === 429 || (status >= 500 && status < 600)) {
      return c.json(
        { content: FALLBACK_MESSAGE, stopReason: "error", code: status },
        200 // Return 200 with fallback so client renders gracefully
      );
    }

    return c.json({ error: "inference error" }, 500);
  }
}
