import { Hono, type MiddlewareHandler } from "hono";
import type { Env } from "./index";

type User = { id: string; email: string };
type AppEnv = { Bindings: Env; Variables: { user: User } };
const MAX_CONTENT = 8000;
const SOURCES = new Set(["user_stated", "user_imported", "user_approved"]);

export function memoryRoutes(auth: MiddlewareHandler<AppEnv>) {
  const app = new Hono<AppEnv>();
  app.use("*", auth);

  app.get("/", async (c) => {
    const limitValue = Number(c.req.query("limit") ?? 50);
    const offsetValue = Number(c.req.query("offset") ?? 0);
    const limit = Number.isInteger(limitValue) ? Math.min(Math.max(limitValue, 1), 100) : 50;
    const offset = Number.isInteger(offsetValue) ? Math.max(offsetValue, 0) : 0;
    const result = await c.env.DB.prepare(
      "SELECT id, memory_type, content, source, provenance, confidence, created_at, updated_at, expires_at FROM memories WHERE owner_user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT ? OFFSET ?"
    ).bind(c.get("user").id, limit, offset).all();
    return c.json({ memories: result.results ?? [], pagination: { limit, offset, hasMore: (result.results?.length ?? 0) === limit } });
  });

  app.post("/", async (c) => {
    let body: unknown;
    try { body = await c.req.json(); } catch { return c.json({ error: "invalid JSON body" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return c.json({ error: "body must be an object" }, 422);
    const input = body as Record<string, unknown>;
    const content = typeof input.content === "string" ? input.content.trim() : "";
    if (!content || content.length > MAX_CONTENT) return c.json({ error: "content length is invalid" }, 422);
    const type = typeof input.memoryType === "string" ? input.memoryType : "note";
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(type)) return c.json({ error: "memoryType is invalid" }, 422);
    const provenance = typeof input.provenance === "string" ? input.provenance : "user_stated";
    if (!SOURCES.has(provenance)) return c.json({ error: "provenance is invalid" }, 422);
    const source = typeof input.source === "string" ? input.source.trim() : "api";
    if (source.length > 300) return c.json({ error: "source is too long" }, 422);
    const confidence = input.confidence === undefined ? null : input.confidence;
    if (confidence !== null && (typeof confidence !== "number" || !Number.isFinite(confidence) || confidence < 0 || confidence > 1)) return c.json({ error: "confidence must be between 0 and 1" }, 422);
    const expiresAt = input.expiresAt === undefined ? null : input.expiresAt;
    if (expiresAt !== null && (typeof expiresAt !== "number" || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now())) return c.json({ error: "expiresAt must be a future timestamp in milliseconds" }, 422);
    const id = crypto.randomUUID();
    const now = Date.now();
    await c.env.DB.prepare("INSERT INTO memories (id, owner_user_id, memory_type, content, source, provenance, confidence, created_at, updated_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, c.get("user").id, type, content, source, provenance, confidence, now, now, expiresAt).run();
    const memory = await c.env.DB.prepare("SELECT id, memory_type, content, source, provenance, confidence, created_at, updated_at, expires_at FROM memories WHERE id = ? AND owner_user_id = ?").bind(id, c.get("user").id).first();
    return c.json({ memory }, 201);
  });

  app.patch("/:id", async (c) => {
    let body: unknown;
    try { body = await c.req.json(); } catch { return c.json({ error: "invalid JSON body" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return c.json({ error: "body must be an object" }, 422);
    const input = body as Record<string, unknown>;
    const id = c.req.param("id");
    const existing = await c.env.DB.prepare("SELECT id FROM memories WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL").bind(id, c.get("user").id).first();
    if (!existing) return c.json({ error: "memory not found" }, 404);
    const sets: string[] = []; const values: (string | number | null)[] = [];
    if (input.content !== undefined) { if (typeof input.content !== "string" || !input.content.trim() || input.content.trim().length > MAX_CONTENT) return c.json({ error: "content is invalid" }, 422); sets.push("content = ?"); values.push(input.content.trim()); }
    if (input.memoryType !== undefined) { if (typeof input.memoryType !== "string" || !/^[a-z][a-z0-9_]{0,39}$/.test(input.memoryType)) return c.json({ error: "memoryType is invalid" }, 422); sets.push("memory_type = ?"); values.push(input.memoryType); }
    if (input.source !== undefined) { if (typeof input.source !== "string" || input.source.length > 300) return c.json({ error: "source is invalid" }, 422); sets.push("source = ?"); values.push(input.source.trim()); }
    if (input.provenance !== undefined) { if (typeof input.provenance !== "string" || !SOURCES.has(input.provenance)) return c.json({ error: "provenance is invalid" }, 422); sets.push("provenance = ?"); values.push(input.provenance); }
    if (input.confidence !== undefined) { if (input.confidence !== null && (typeof input.confidence !== "number" || !Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1)) return c.json({ error: "confidence is invalid" }, 422); sets.push("confidence = ?"); values.push(input.confidence as number | null); }
    if (input.expiresAt !== undefined) { if (input.expiresAt !== null && (typeof input.expiresAt !== "number" || !Number.isSafeInteger(input.expiresAt) || input.expiresAt <= Date.now())) return c.json({ error: "expiresAt is invalid" }, 422); sets.push("expires_at = ?"); values.push(input.expiresAt as number | null); }
    if (!sets.length) return c.json({ error: "no supported fields to update" }, 422);
    sets.push("updated_at = ?"); values.push(Date.now(), id, c.get("user").id);
    await c.env.DB.prepare("UPDATE memories SET " + sets.join(", ") + " WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL").bind(...values).run();
    const memory = await c.env.DB.prepare("SELECT id, memory_type, content, source, provenance, confidence, created_at, updated_at, expires_at FROM memories WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL").bind(id, c.get("user").id).first();
    return c.json({ memory });
  });

  app.delete("/:id", async (c) => {
    const now = Date.now();
    const result = await c.env.DB.prepare("UPDATE memories SET deleted_at = ?, updated_at = ? WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL").bind(now, now, c.req.param("id"), c.get("user").id).run();
    if (!result.meta.changes) return c.json({ error: "memory not found" }, 404);
    return c.body(null, 204);
  });
  return app;
}