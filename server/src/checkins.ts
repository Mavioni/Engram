import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Env } from "./index";

type AppEnv = { Bindings: Env; Variables: { user: { id: string; email: string } } };
const ALLOWED_FACTORS = new Set(["Sleep","Work","Relationships","Body","Solitude","Creativity","Movement","Rest","Conflict","Joy","News / world","Money"]);
const MOODS = new Set(["radiant","content","calm","neutral","tender","anxious","low","overwhelmed"]);

export function checkinRoutes(requireAuth: MiddlewareHandler<AppEnv>) {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth);

  app.post("/", async (c) => {
    let body: unknown;
    try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return c.json({ error: "Invalid check-in" }, 400);
    const input = body as Record<string, unknown>;
    if (typeof input.moodName !== "string" || !MOODS.has(input.moodName)
      || typeof input.mood !== "number" || !Number.isFinite(input.mood) || input.mood < 0 || input.mood > 1
      || typeof input.energy !== "number" || !Number.isFinite(input.energy) || input.energy < 0 || input.energy > 1
      || typeof input.intensity !== "number" || !Number.isFinite(input.intensity) || input.intensity < 0 || input.intensity > 1
      || !Array.isArray(input.factors) || input.factors.length > 12 || input.factors.some((f) => typeof f !== "string" || !ALLOWED_FACTORS.has(f))
      || typeof input.note !== "string" || input.note.length > 10000) {
      return c.json({ error: "Invalid check-in fields" }, 400);
    }
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    await c.env.DB.prepare(
      "INSERT INTO mood_checkins (id, owner_user_id, mood_name, mood, energy, intensity, factors_json, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, c.get("user").id, input.moodName, input.mood, input.energy, input.intensity, JSON.stringify(input.factors), input.note, createdAt).run();
    return c.json({ checkin: { id, moodName: input.moodName, mood: input.mood, energy: input.energy, intensity: input.intensity, factors: input.factors, note: input.note, createdAt } }, 201);
  });

  app.get("/", async (c) => {
    const result = await c.env.DB.prepare(
      "SELECT id, mood_name, mood, energy, intensity, factors_json, note, created_at FROM mood_checkins WHERE owner_user_id = ? ORDER BY created_at DESC LIMIT 50"
    ).bind(c.get("user").id).all();
    return c.json({ checkins: (result.results ?? []).map((row) => ({
      id: row.id, moodName: row.mood_name, mood: row.mood, energy: row.energy, intensity: row.intensity,
      factors: JSON.parse(String(row.factors_json)), note: row.note, createdAt: row.created_at,
    })) });
  });

  return app;
}
