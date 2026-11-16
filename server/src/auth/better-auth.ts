/**
 * Engram — Better Auth configuration.
 *
 * The D1 binding is injected per request so the configuration remains valid
 * across Cloudflare Worker isolate lifetimes.
 *
 * Email delivery is intentionally not simulated. Verification and password
 * reset must not log one-time URLs or tokens. Until a real mail provider is
 * configured, email verification is not required and sign-up verification
 * mail is disabled.
 */
import { betterAuth } from "better-auth";
import type { Env } from "../index";

export function createAuth(env: Env) {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required");
  }
  if (!env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is required");
  }

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    // Better Auth 1.6.9 includes native Cloudflare D1 support.
    database: env.DB,

    emailAndPassword: {
      enabled: true,
      // Do not lock new users out while email delivery is unconfigured.
      // Re-enable only after verification delivery and callback handling are live.
      requireEmailVerification: false,
    },

    emailVerification: {
      sendOnSignUp: false,
    },

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },

    // Developer origins must never be trusted implicitly by a production Worker.
    trustedOrigins: [
      ...(env.ENVIRONMENT === "development"
        ? ["http://localhost:5173", "http://localhost:8787", "capacitor://localhost", "http://localhost"]
        : []),
      ...(env.APP_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean),
    ],
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
