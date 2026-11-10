/**
 * Engram API — Cloudflare Workers entry point.
 *
 * Authentication is resolved from Better Auth on every protected request.
 * Engram remains the authority for application authorization; this first
 * slice establishes authenticated user context before tenant-scoped policy
 * and resource grants are introduced.
 */
import { Hono } from "hono";
import type { MiddlewareHandler, Next } from "hono";
import { createAuth } from "./auth/better-auth";
import { handleIris } from "./iris";
import { memoryRoutes } from "./memory";

export type Env = {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  BETTER_AUTH_SECRET: string;
  ENVIRONMENT: string;
  BETTER_AUTH_URL: string;
};

type UserContext = { id: string; email: string };
type AppEnv = {
  Bindings: Env;
  Variables: { user: UserContext };
};

const app = new Hono<AppEnv>();

app.get("/", (c) => c.json({ ok: true, service: "engram-api" }));

// Better Auth owns sign-up, sign-in, sign-out, and session protocol endpoints.
app.all("/api/auth/*", async (c) => {
  if (!c.env.BETTER_AUTH_SECRET || !c.env.BETTER_AUTH_URL || !c.env.DB) {
    return c.json({ error: "authentication is not configured" }, 503);
  }

  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Fail-closed session middleware. Requests without a valid session never
// reach protected application handlers.
const requireAuth: MiddlewareHandler<AppEnv> = async (c, next: Next) => {
  if (!c.env.BETTER_AUTH_SECRET || !c.env.BETTER_AUTH_URL || !c.env.DB) {
    return c.json({ error: "authentication is not configured" }, 503);
  }

  const auth = createAuth(c.env);
  const result = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!result?.user?.id || !result.user.email) {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("user", {
    id: result.user.id,
    email: result.user.email,
  });

  await next();
};

// /api/iris remains a compatibility route during the client migration.
app.post("/api/iris", requireAuth, handleIris);
app.post("/api/intelligence", requireAuth, handleIris);

// Canonical user-owned persistent memory API.
app.route("/api/memory", memoryRoutes(requireAuth));

app.get("/api/me", requireAuth, (c) => {
  return c.json({ user: c.get("user") });
});

app.notFound((c) => c.json({ error: "not found" }, 404));

app.onError((err, c) => {
  console.error("[engram-api]", err);
  return c.json({ error: "internal" }, 500);
});

export default app;
