/** Owner-scoped Notebook API. Not connected to the GitHub Pages local-only preview yet. */
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Env } from "./index";

type AppEnv = { Bindings: Env; Variables: { user: { id: string; email: string } } };
type Row = {
  id: string; kind: string; title: string; body: string; tags_json: string;
  done: number; mood_name: string|null; intensity: number|null; factors_json: string;
  created_at: number; updated_at: number; revision: number;
};
const types = new Set(["note","journal","task","mood"]);
const moods = new Set(["Radiant","Content","Calm","Neutral","Tender","Anxious","Low","Overwhelmed"]);
const factors = new Set(["Sleep","Work","Relationships","Body","Solitude","Creativity","Movement","Rest","Conflict","Joy","News / world","Money"]);

const serialize = (row: Row) => ({
  id: row.id, kind: row.kind, title: row.title, body: row.body,
  tags: JSON.parse(row.tags_json), done: Boolean(row.done),
  mood: row.mood_name, intensity: row.intensity, factors: JSON.parse(row.factors_json),
  createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString(),
  revision: row.revision,
});
function validate(value: unknown): value is {
  kind: string; title: string; body: string; tags: string[]; done?: boolean;
  mood?: string | null; intensity?: number | null; factors?: string[];
  expectedRevision?: number;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string,unknown>;
  return typeof v.kind === "string" && types.has(v.kind)
    && typeof v.title === "string" && v.title.length <= 200
    && typeof v.body === "string" && v.body.length <= 100000
    && Array.isArray(v.tags) && v.tags.length <= 30
    && v.tags.every(t => typeof t === "string" && t.length <= 64)
    && (v.done === undefined || typeof v.done === "boolean")
    && (v.mood === undefined || v.mood === null || (typeof v.mood === "string" && moods.has(v.mood)))
    && (v.intensity === undefined || v.intensity === null || (typeof v.intensity === "number" && Number.isInteger(v.intensity) && v.intensity >= 0 && v.intensity <= 100))
    && (v.factors === undefined || (Array.isArray(v.factors) && v.factors.length <= 12 && v.factors.every(f => typeof f === "string" && factors.has(f))))
    && (v.expectedRevision === undefined || (Number.isInteger(v.expectedRevision) && (v.expectedRevision as number) >= 0));
}
export function notebookRoutes(requireAuth: MiddlewareHandler<AppEnv>) {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth);

  app.get("/", async c => {
    const raw = Number(c.req.query("limit") ?? 100);
    const limit = Number.isInteger(raw) ? Math.min(Math.max(raw,1),200) : 100;
    const result = await c.env.DB.prepare(
      "SELECT * FROM notebook_entries WHERE owner_user_id = ? ORDER BY updated_at DESC, id ASC LIMIT ?"
    ).bind(c.get("user").id,limit).all<Row>();
    return c.json({ entries: (result.results ?? []).map(serialize), limit, partial: (result.results ?? []).length >= limit });
  });

  app.get("/:id", async c => {
    const row = await c.env.DB.prepare(
      "SELECT * FROM notebook_entries WHERE id = ? AND owner_user_id = ?"
    ).bind(c.req.param("id"),c.get("user").id).first<Row>();
    return row ? c.json({entry:serialize(row)}) : c.json({error:"not found"},404);
  });

  app.put("/:id", async c => {
    const id = c.req.param("id");
    if (id.length < 8 || id.length > 120 || !/^[\w-]+$/.test(id)) return c.json({error:"Invalid page ID"},400);
    let value: unknown;
    try { value = await c.req.json(); } catch { return c.json({error:"Invalid JSON"},400); }
    if (!validate(value)) return c.json({error:"Invalid page contents"},400);
    const input = value;
    const owner = c.get("user").id;
    const existing = await c.env.DB.prepare(
      "SELECT owner_user_id, revision FROM notebook_entries WHERE id = ?"
    ).bind(id).first<{owner_user_id:string;revision:number}>();
    if (existing && existing.owner_user_id !== owner) return c.json({error:"Page ID unavailable"},409);
    const expected = input.expectedRevision ?? 0;
    if (existing && existing.revision !== expected) return c.json({error:"Page changed on another device; resolve conflict before saving",revision:existing.revision},409);
    if (!existing && expected !== 0) return c.json({error:"Page missing; resolve conflict before saving"},409);
    const now = Date.now();
    const tags = JSON.stringify([...new Set(input.tags.map(tag=>tag.trim()).filter(Boolean))]);
    const noteFactors = JSON.stringify(input.factors ?? []);
    if (!existing) {
      await c.env.DB.prepare(
        "INSERT INTO notebook_entries (id,owner_user_id,kind,title,body,tags_json,done,mood_name,intensity,factors_json,created_at,updated_at,revision) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)"
      ).bind(id,owner,input.kind,input.title,input.body,tags,input.done?1:0,input.mood??null,input.intensity??null,noteFactors,now,now).run();
    } else {
      const updated = await c.env.DB.prepare(
        "UPDATE notebook_entries SET kind=?,title=?,body=?,tags_json=?,done=?,mood_name=?,intensity=?,factors_json=?,updated_at=?,revision=revision+1 WHERE id=? AND owner_user_id=? AND revision=?"
      ).bind(input.kind,input.title,input.body,tags,input.done?1:0,input.mood??null,input.intensity??null,noteFactors,now,id,owner,expected).run();
      if (!updated.meta.changes) return c.json({error:"Version conflict; refresh before saving"},409);
    }
    const row = await c.env.DB.prepare(
      "SELECT * FROM notebook_entries WHERE id=? AND owner_user_id=?"
    ).bind(id,owner).first<Row>();
    return c.json({entry:serialize(row!)},existing?200:201);
  });

  app.delete("/:id", async c => {
    const result = await c.env.DB.prepare(
      "DELETE FROM notebook_entries WHERE id=? AND owner_user_id=?"
    ).bind(c.req.param("id"),c.get("user").id).run();
    return result.meta.changes ? c.body(null,204) : c.json({error:"not found"},404);
  });

  return app;
}
