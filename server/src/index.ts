/**
 * Engram API — Cloudflare Workers entry
 * Router skeleton. Auth + IRIS handlers wired by sibling cells (mythos-orochimaru / naruto).
 */
import { Hono } from "hono";

// --- Bindings ---
export type Env = {
  DB: D1Database;
  // Secrets (wrangler secret put ...)
  ANTHROPIC_API_KEY: string;
  BETTER_AUTH_SECRET: string;
  // Vars
  ENVIRONMENT: string;
  BETTER_AUTH_URL: string;
};

// --- Hono app ---
const app = new Hono<{ Bindings: Env; Variables: { user?: { id: string; email: string } } }>();

// Health
app.get("/", (c) => c.json({ ok: true, service: "engram-api" }));

// ---------------------------------------------------------------------------
// AUTH — Better Auth handler
// TODO(mythos-orochimaru): export `auth` from ./auth.ts (Better Auth instance
//   bound to D1 + BETTER_AUTH_SECRET). Mount via auth.handler(c.req.raw).
// ---------------------------------------------------------------------------
app.all("/api/auth/*", async (c) => {
  // TODO: const { auth } = await import("./auth");
  // return auth.handler(c.req.raw);
  return c.json({ error: "auth handler not wired" }, 501);
});

// ---------------------------------------------------------------------------
// AUTH MIDDLEWARE — gate routes below
// TODO(mythos-orochimaru): resolve session from cookie/Bearer via Better Auth,
//   attach user to c.set("user", ...) or 401.
// ---------------------------------------------------------------------------
const requireAuth = async (c: any, next: any) => {
  // TODO: const session = await auth.api.getSession({ headers: c.req.raw.headers });
  // if (!session) return c.json({ error: "unauthorized" }, 401);
  // c.set("user", session.user);
  return next();
};

// ---------------------------------------------------------------------------
// IRIS — Anthropic proxy (auth-required)
// TODO(mythos-orochimaru): implement ./iris.ts with handler(c, env).
// ---------------------------------------------------------------------------
app.post("/api/iris", requireAuth, async (c) => {
  // TODO: const { handleIris } = await import("./iris");
  // return handleIris(c);
  return c.json({ error: "iris handler not wired" }, 501);
});

// ---------------------------------------------------------------------------
// ME — current user profile (auth-required)
// ---------------------------------------------------------------------------
app.get("/api/me", requireAuth, async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "unauthorized" }, 401);
  return c.json({ user });
});

// 404
app.notFound((c) => c.json({ error: "not found" }, 404));

// Error
app.onError((err, c) => {
  console.error("[engram-api]", err);
  return c.json({ error: "internal" }, 500);
});

export default app;
