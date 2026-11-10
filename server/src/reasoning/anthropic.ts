import Anthropic from "@anthropic-ai/sdk";
import type {
  ReasoningProvider,
  ReasoningRequest,
  ReasoningResponse,
  ReasoningStreamEvent,
} from "./types";

function cacheReadInputTokens(usage: unknown): number {
  if (!usage || typeof usage !== "object") return 0;
  const value = (usage as { cache_read_input_tokens?: unknown }).cache_read_input_tokens;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * Anthropic implementation of the Engram Reasoning contract.
 * Vendor-specific request and streaming event details stay inside this file.
 */
export class AnthropicReasoningProvider implements ReasoningProvider {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required");
    this.client = new Anthropic({ apiKey });
  }

  private systemBlocks(request: ReasoningRequest) {
    return [
      {
        type: "text" as const,
        text: request.systemPrompt,
        cache_control: { type: "ephemeral" as const },
      },
      ...(request.context
        ? [{ type: "text" as const, text: request.context }]
        : []),
    ];
  }

  async complete(request: ReasoningRequest): Promise<ReasoningResponse> {
    const response = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens,
      system: this.systemBlocks(request),
      messages: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    return {
      content: response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join(""),
      stopReason: response.stop_reason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens:
          cacheReadInputTokens(response.usage),
      },
    };
  }

  async *stream(request: ReasoningRequest): AsyncIterable<ReasoningStreamEvent> {
    const stream = this.client.messages.stream({
      model: request.model,
      max_tokens: request.maxTokens,
      system: this.systemBlocks(request),
      messages: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text_delta", text: event.delta.text };
      }

      if (event.type === "message_start" && event.message.usage) {
        yield {
          type: "usage",
          usage: {
            inputTokens: event.message.usage.input_tokens ?? 0,
            cacheReadTokens:
              cacheReadInputTokens(event.message.usage),
          },
        };
      }

      if (event.type === "message_delta" && event.usage) {
        yield {
          type: "usage",
          usage: { outputTokens: event.usage.output_tokens ?? 0 },
        };
      }
    }

    const finalMessage = await stream.finalMessage();
    yield { type: "completed", stopReason: finalMessage.stop_reason };
  }
}

export function createAnthropicReasoningProvider(apiKey: string): ReasoningProvider {
  return new AnthropicReasoningProvider(apiKey);
}
