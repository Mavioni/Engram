/**
 * Engram — Better Auth configuration
 * D1-backed sessions. Email/password + stubs for Apple + Google OAuth.
 * Secrets injected via Cloudflare Worker bindings (never in source).
 */

import { betterAuth } from "better-auth";
import type { Env } from "../index";

// ---------------------------------------------------------------------------
// Factory — call once per request with the live D1 binding.
// Better Auth's D1 adapter accepts a D1Database directly.
// ---------------------------------------------------------------------------

export function createAuth(env: Env) {
  return betterAuth({
    // ----- secret -----
    secret: env.BETTER_AUTH_SECRET,

    // ----- base URL -----
    // Needed for absolute redirect URLs in OAuth flows and email links.
    baseURL: env.BETTER_AUTH_URL,

    // ----- database -----
    // Better Auth ships a first-class D1 adapter. The adapter receives the
    // live binding so it works correctly across isolate restarts.
    database: {
      type: "sqlite",
      // @ts-expect-error — Better Auth D1 adapter accepts D1Database at this key.
      // Verified against better-auth@1.x source: packages/better-auth/src/adapters/d1.
      db: env.DB,
    },

    // ----- email + password -----
    emailAndPassword: {
      enabled: true,
      // Require email verification before first sign-in (stub: email sending
      // is wired in sendVerificationEmail below).
      requireEmailVerification: true,
    },

    // ----- email verification -----
    emailVerification: {
      sendOnSignUp: true,
      // TODO(naruto-followup): replace stub with Cloudflare Email Routing or
      // Resend SDK call. Flag: needs RESEND_API_KEY wrangler secret.
      sendVerificationEmail: async ({ user, url, _token }) => {
        console.log(
          `[auth] verification email stub — user=${user.email} url=${url}`
        );
        // STUB: no-op until email provider is provisioned.
      },
    },

    // ----- password reset -----
    // TODO(naruto-followup): wire to Cloudflare Email Routing or Resend.
    // Flag: needs RESEND_API_KEY wrangler secret.
    // @ts-expect-error — sendResetPassword signature varies across versions; stub cast.
    sendResetPassword: async ({ user, url, _token }: { user: { email: string }; url: string; _token: string }) => {
      console.log(
        `[auth] reset-password email stub — user=${user.email} url=${url}`
      );
      // STUB: no-op until email provider is provisioned.
    },

    // ----- social providers (scaffolded; activate on provisioning) -----
    socialProviders: {
      // TODO(naruto-followup): wire on App Store / Play Store provisioning.
      // Uncomment and fill env bindings when Apple Developer + Google OAuth
      // credentials are available.

      // apple: {
      //   clientId: env.APPLE_CLIENT_ID,         // wrangler secret put APPLE_CLIENT_ID
      //   clientSecret: env.APPLE_CLIENT_SECRET,  // wrangler secret put APPLE_CLIENT_SECRET
      // },

      // google: {
      //   clientId: env.GOOGLE_CLIENT_ID,         // wrangler secret put GOOGLE_CLIENT_ID
      //   clientSecret: env.GOOGLE_CLIENT_SECRET,  // wrangler secret put GOOGLE_CLIENT_SECRET
      // },
    },

    // ----- session -----
    session: {
      // HttpOnly, SameSite=Lax per doctrine (ARCHITECTURE.md §6 invariant 2).
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5-minute cache; real expiry controlled by expiresAt in DB
      },
    },

    // ----- trusted origins -----
    // Restricts CORS. Widen in production once custom domain is confirmed.
    trustedOrigins: [
      "http://localhost:5173", // Vite dev
      "http://localhost:8787", // Wrangler dev
      "capacitor://localhost", // Capacitor iOS/Android
      "http://localhost",      // Android WebView
    ],
  });
}

// ---------------------------------------------------------------------------
// Re-exported type for use in iris.ts and index.ts
// ---------------------------------------------------------------------------

export type AuthInstance = ReturnType<typeof createAuth>;
