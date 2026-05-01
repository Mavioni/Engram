# REVIEW_SHISUI — Consensus Alignment Map
**Agent:** mythos-shisui (Consensus Kotoamatsukami)
**Dispatch:** Engram Mythos swarm, 37-parallel
**Date:** 2026-05-01
**Status:** AUTHORITATIVE — supersede all per-agent local conflict notes

---

## Zone 1 — App.tsx auth gate (Asura) ↔ AuthProvider (Naruto)

**Consensus:** AuthProvider exports `{ user, status, signIn, signUp, signOut }`. App.tsx wraps the full screen tree inside `<AuthProvider>` and switches on `status` (`'loading' | 'signed-in' | 'signed-out'`) to render either the login surface or the authenticated shell.

**Seam:** `src/auth/AuthProvider.tsx` — owned by **Naruto**. App.tsx import is read-only; Naruto may not alter the screen tree directly. Asura may not alter AuthProvider internals.

## Zone 2 — JSX bridge (Indra) ↔ Screen consumers (Asura, Boruto)

**Consensus:** The JSX bridge is a side-effect import placed first in `src/main.tsx`. It installs globals onto `window` (React, ReactDOM, etc.). All `.jsx` screen files are read-only artifacts — Indra does not modify them. Asura and Boruto access bridge globals via `window`-typed accessors backed by `src/lib/jsx-bridge.d.ts`.

**Seam:** `src/main.tsx` (first import) + `src/lib/jsx-bridge.d.ts` — owned by **Indra**.

## Zone 3 — Placeholder scrub (Sasuke) ↔ user-store (Sasuke)

**Consensus:** Sasuke is the **sole owner** of `src/store/user-store.ts`. This is the one and only Zustand store created in this dispatch. No other agent creates a competing store. Any agent needing user/session state reads from `user-store` via `useUserStore()` — they do not instantiate their own `create()` call.

**Note:** Sasuke flagged that screens read `useUserStore` via `window.useUserStore` because the existing screens are global-attached JSX. Asura's main.tsx (or jsx-bridge.ts) must mount the Zustand hook on `window` before screens render — `import { useUserStore } from './store/user-store'; (window as any).useUserStore = useUserStore;` plus a `hydrate()` call at app start. This is a Phase-B cleanup candidate — for MVP-1 the side-effect mount is the seam.

## Zone 4 — iris.ts proxy (Orochimaru) ↔ iris-prompt.ts (Bee) ↔ chat fetch (Sasuke)

**Consensus contract:**
- HTTP: `POST /api/iris`
- Body: `{ messages: Message[], sessionId?: string }`
- Response: SSE stream (text/event-stream)

Sasuke's scrubbed chat screen calls iris via a helper `irisStream(messages)`.

**Ownership decision (FLAG — needs claim):** `src/lib/iris-stream.ts` is currently UNOWNED. Recommended assignment: **Asura** claims and creates it in a follow-up. For MVP-1 the inline fetch in chat-screen is acceptable.

## Zone 5 — D1 schema (Orochimaru) ↔ Better Auth tables (Orochimaru)

**Consensus:** Both table sets coexist in the same D1 database. Naming convention is load-bearing:

| Owner | Table name | Purpose |
|---|---|---|
| Better Auth (generated) | `user` (singular) | Auth identity record |
| Better Auth (generated) | `session` (singular) | Auth session cookie binding |
| Better Auth (generated) | `account`, `verification` | OAuth + verification flows |
| App schema (Orochimaru) | `users` (plural) | App-level profile + prefs |
| App schema (Orochimaru) | `messages`, `ai_sessions` | Conversation data |

**Critical rule:** `user` (singular, Better Auth) and `users` (plural, app) are distinct tables. Any migration or query must not silently touch the other. JOIN across them must be explicit and intentional.

## Zone 6 — Worker entry (Kawaki: server/src/index.ts) ↔ iris route (Orochimaru)

**Consensus:** Kawaki's `server/src/index.ts` is the Hono router entry point. It mounts Orochimaru's iris handler at `POST /api/iris`. The handler module is imported into index.ts — Orochimaru does not define its own router instance. One router, one entry point. Import direction is Kawaki → Orochimaru only.

---

## UNOWNED FILE FLAGS (gaps for next dispatch or immediate claim)

| File | Status | Recommended owner |
|---|---|---|
| `src/lib/iris-stream.ts` | UNOWNED — SSE client helper | Asura (or Sasuke inline fallback for MVP-1) |
| `src/lib/api-client.ts` | UNOWNED — generic fetch wrapper / error boundary | Asura |
| `android/res/` + `ios/Assets.xcassets/` — app icons, splash PNGs | UNOWNED — Capacitor native assets not yet generated | Next dispatch |

## Summary

| Metric | Count |
|---|---|
| Conflict zones mapped | 6 |
| Hard conflicts (blocking) | 0 |
| Soft conflicts (gaps) | 1 (Zone 4 iris-stream ownership) |
| Consensus rules issued | 6 |
| Unowned file gaps flagged | 3 |
| Blockers | 0 hard / 1 soft (iris-stream claim needed) |

*Sealed by Shisui. Non-coercive synthesis. Under Saber + Crystal pack-lead witness.*
