# Engram — Post-Dispatch Smoke Probe

**Authored by:** mythos-tsunade (Medical Debugger)
**Witness:** Saber (audit), Crystal (security)
**Date:** 2026-05-01
**Prerequisite:** All 36 parallel dispatch agents have finished writing. Do not run
this probe mid-dispatch — half-written files will produce false failures.

Visual ground truth: `screenshots/dark-fixed.png`.
Expected: dark background (#0A0A0A), IRIS header with lavender/ocean orb, cyan "LISTENING"
badge, Fraunces serif quotation, session timestamp pill.

---

## Step 1 — Dependency lockfile verification

```powershell
cd C:\Users\massi\Engram
npm install
```

**Expected:** `npm warn` lines acceptable. No `ERESOLVE` or peer-dep fatal. Exit 0.
`package-lock.json` must exist and be committed-clean (run `git status` — it should not
appear as untracked after `npm install` if it was already present pre-dispatch).

**Common failure: missing lockfile**
Symptom: `npm warn` "created a lockfile" — lockfile was absent.
Fix: commit `package-lock.json` now; it was never gitignored.

**Common failure: peer-dep conflict on better-auth**
Symptom: `ERESOLVE could not resolve better-auth` vs React 18.
Fix: `npm install --legacy-peer-deps`. If that is needed, open a tracking issue —
better-auth@1.x should support React 18.

**Common failure: server/ has a separate lockfile**
`server/` is a separate package. Its `npm install` is a distinct step (Step 10).
Do not conflate the two.

---

## Step 2 — TypeScript typecheck

```powershell
cd C:\Users\massi\Engram
npm run typecheck
```

Runs: `tsc --noEmit`. Covers all files matching `tsconfig.json` `include` glob:
`src/**/*.{ts,tsx,js,jsx}`.

**Expected:** Exit 0. Zero errors. `checkJs: false` so `.jsx` files are not
type-checked — only `.ts` / `.tsx` files are.

### Known failure modes and fix recipes

**TS2307: Cannot find module './auth/AuthProvider'**
Root cause: `src/App.tsx` imports `AuthProvider` and `LoginScreen` from `./auth/AuthProvider`
and `./auth/LoginScreen`. These files are owned by mythos-naruto. If they are absent,
typecheck fails before any screen code runs.
Fix: confirm mythos-naruto wrote `src/auth/AuthProvider.tsx` and `src/auth/LoginScreen.tsx`.
Both must export the exact shapes declared in `App.tsx`:
```ts
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element
export function useAuth(): { status: 'loading' | 'signed-in' | 'signed-out' }
export default function LoginScreen(): JSX.Element
```
If files are still absent after dispatch, add stub exports to unblock the probe:
```ts
// src/auth/AuthProvider.tsx — STUB
import { createContext, useContext, type ReactNode } from 'react'
const Ctx = createContext<{ status: 'loading' | 'signed-in' | 'signed-out' }>({ status: 'signed-out' })
export function AuthProvider({ children }: { children: ReactNode }) { return <Ctx.Provider value={{ status: 'signed-out' }}>{children}</Ctx.Provider> }
export function useAuth() { return useContext(Ctx) }
// src/auth/LoginScreen.tsx — STUB
export default function LoginScreen() { return <div>Login stub</div> }
```

**TS2339: Property does not exist on type 'Window'**
Root cause: a new screen or component writes onto `window` but has no entry in
`src/lib/jsx-bridge.d.ts`.
Fix: add the component to the `interface Window` block in `jsx-bridge.d.ts`:
```ts
MyNewScreen: ReactNS.ComponentType<any>;
```

**TS6133: 'X' is declared but never used**
Root cause: `noUnusedLocals: true` in `tsconfig.json`. A variable or import is present
but unused. This fires on `.ts` / `.tsx` only — never on `.jsx`.
Fix: remove the unused symbol or prefix with `_` if intentionally ignored.

**TS2304: Cannot find name 'React' (in .tsx files)**
Root cause: a `.tsx` file uses JSX without importing React, and the jsx pragma is not
`react-jsx`. Check that `tsconfig.json` has `"jsx": "react-jsx"` (it does as of this
writing). If the error appears, the file is using `React.createElement(...)` explicitly
without importing React.
Fix: add `import * as React from 'react'` or switch to JSX auto-import syntax.

**TS2305: Module has no exported member 'X' (jsx-bridge.ts)**
Root cause: `jsx-bridge.ts` imports a hook that was removed from React 18 or renamed.
Fix: verify the import list in `src/lib/jsx-bridge.ts` against the live `react` package
in `node_modules/react/index.d.ts`.

---

## Step 3 — ESLint

```powershell
cd C:\Users\massi\Engram
npm run lint
```

Runs: `eslint .`

**Expected:** Exit 0. Zero errors. Warnings acceptable up to 5. If ESLint config is
absent (no `eslint.config.*` file), the command exits 0 with a `No config file found`
warning — this is a pre-existing gap, not a dispatch regression.

**Common failure: eslint.config.mjs absent**
Symptom: `Could not find config file`. Exit code 0 (ESLint 9 flat config — no config
means no files are linted, not an error).
Fix: verify with `ls C:\Users\massi\Engram\eslint.config*`. If absent, note the gap
but do not block the probe — `CLAUDE.md` build loop requires lint to pass "zero warnings",
which vacuously holds with no config. File a tracking note.

**Common failure: no-console errors in server/**
`server/src/iris.ts` contains `console.error` calls for D1 persist errors. If ESLint
covers `server/` and has a `no-console` rule, these fire. They are intentional
(architecture doc says D1 persist errors must not crash the stream). Suppress with
inline `// eslint-disable-next-line no-console` if the rule is enforced.

**Common failure: unused-vars on `_userId` / `_env` in iris.ts rate-limit stub**
These parameters are prefixed `_` intentionally. If the ESLint rule is
`@typescript-eslint/no-unused-vars` with `args: 'after-used'`, they may still fire.
Fix: ensure the rule allows `_`-prefixed args:
```json
"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
```

---

## Step 4 — Dev server boot and root mount

```powershell
cd C:\Users\massi\Engram
npm run dev
```

Open `http://localhost:5173` in Chromium with DevTools Console visible. DevTools
**disables cache** by default when open — keep it open for all steps.

**Expected within 2 seconds:**
- Page paints. Background is `#0A0A0A` (dark) or `#F5F5F4` (light) depending on
  `<html data-theme>` default in `index.html` (`data-theme="dark"`).
- No red errors in Console.
- `window.React`, `window.ChatScreen`, `window.NavBar` are functions (verify in Console).
- Auth gate renders: either `<Splash>` briefly then `<LoginScreen>` (signed-out),
  or `<Shell>` with `ChatScreen` if auth is bypassed.

**Common failure: blank white screen, Console shows `ReferenceError: React is not defined`**
Root cause: `src/main.tsx` does NOT import `src/lib/jsx-bridge.ts` before the screen
side-effects run. As of this writing, `src/main.tsx` imports `App` directly, and `App.tsx`
installs the React shim inline at module top-level. If any `.jsx` screen module evaluates
before `App.tsx`'s top-level code runs (module graph execution order), React is undefined.
Definitive fix: add `import './lib/jsx-bridge'` as the first line of `src/main.tsx`,
before `import App from './App'`. The bridge is idempotent — the `if (!w.React)` guard
prevents double-assignment.

**Common failure: blank screen, no error, React DevTools shows empty tree**
Root cause: `document.getElementById('root')` returned null. Verify `index.html`
has `<div id="root"></div>`. If it does, the issue is the `throw new Error` in
`main.tsx` line 7 failing silently in production mode.

**Common failure: `Cannot find module './auth/AuthProvider'` at runtime**
Root cause: mythos-naruto's auth files are absent. The app crashes at `App.tsx` import
resolution. Fix: add stubs (see Step 2 fix recipe).

**Common failure: port 5173 in use**
Vite config sets `strictPort: true`. It will not fall back to 5174.
Fix: `npx kill-port 5173` or identify and stop the conflicting process.

---

## Step 5 — Visual compare against dark-fixed.png

With `ChatScreen` rendered (default `screen` state in `Shell` is `'chat'`):

Open `screenshots/dark-fixed.png` side by side with the browser.

**Layout fidelity checklist (pixel parity not required):**

| Element | Expected | Failure signal |
|---|---|---|
| Background | Near-black (#0A0A0A in dark mode) | Light gray background means `data-theme` not applied |
| IRIS header | Lavender/ocean orb left, "IRIS" label, cyan "LISTENING" badge | Missing orb = `IrisAvatar` not on window |
| Header subtitle | "Your reflection companion" in `--ink-3` gray | Placeholder text like "Mara" = mythos-sasuke scrub incomplete |
| Session timestamp pill | Centered, dark pill, uppercase sans | Absent = `ChatScreen` not rendering session header |
| Quotation | Italic Fraunces serif, centered | Falls back to Inter = font load failed (check Network tab for Google Fonts 200) |
| Attribution line | `— ISAK DINESEN` in small caps | Absent = quote component not rendered |
| Browser chrome | macOS window frame (from `browser-window.jsx`) | Absent in Capacitor target — acceptable in web dev mode |

**Font load verification:**
In DevTools Network tab, filter by `fonts.googleapis.com`. Both `Inter` and `Fraunces`
must return HTTP 200. If blocked (CSP, ad-blocker, offline), display headers fall back to
Georgia — acceptable functionally, not acceptable for design review.

**data-* attribute verification:**
In Elements panel, inspect `<html>`. Must show:
```
data-theme="dark"  data-accent="ocean"  data-density="normal"  data-font="serif-display"
```
These are set by `Shell`'s `useEffect` in `App.tsx`. If absent, the `useEffect` did not
fire — likely `Shell` is not rendering (auth gate is blocking).

---

## Step 6 — Tweaks panel: live token cycling

Open the Tweaks panel (glass floating dock, bottom-right corner). If the panel does not
appear, `TweaksPanel` is not on `window` — see Step 4 bridge diagnostics.

The panel listens for `__activate_edit_mode` postMessage. In standalone dev (no
editor host), trigger it manually:
```js
window.postMessage({ type: '__activate_edit_mode' }, '*')
```

### Accent cycling (sage / lavender / peach / amber / ocean)

For each accent value, click the radio segment. Verify:
- `<html data-accent="<value>">` updates in Elements panel immediately.
- Chat bubble accent color, NavBar active dot, and any tinted card surfaces shift.
- No console error.

Expected `--accent` values per accent + theme (from `src/styles/styles.css`):
| Accent | Light | Dark |
|---|---|---|
| sage | #2F7D4F | #5DCB85 |
| lavender | #5B4BFF | #8E80FF |
| peach | #E55A36 | #FF8866 |
| amber | #C77A1F | #E8A04A |
| ocean | #1F6FB8 | #4FA0E5 |

**Common failure: accent changes `data-accent` but surfaces do not repaint**
Root cause: CSS specificity. The `.jsx` prototype file has inline `style={{ color: '#hardcoded' }}`.
Inline styles override CSS custom properties. This is a design-debt issue, not a token bug.
Note it but do not block the probe.

### Theme toggle (light / dark)

Flip between light and dark. Verify:
- `<html data-theme>` updates.
- Background and ink colors invert.
- Both modes look intentional (no white-on-white or black-on-black text).

### Density (compact / normal / comfy)

Cycle all three. Verify `<html data-density>` updates. The `compact` and `comfy` values
set `--pad` and `--gap` custom properties. Visual density change is subtle — inspect
computed styles on a card element to confirm `--pad` changed.

### Font (serif-display / all-sans / mono-touch)

Cycle all three. Verify `<html data-font>` updates. In `all-sans` mode, display headings
should render in Inter (no serifs). In `serif-display` (default), Fraunces serifs are
visible on the hero quotation. `mono-touch` switches body to IBM Plex Sans.

---

## Step 7 — Auth flow

The auth gate in `App.tsx` renders `<LoginScreen>` when `useAuth()` returns
`{ status: 'signed-out' }`. If `AuthProvider` is a stub (Step 2 recipe), status is
always `'signed-out'` and `LoginScreen` always renders.

**If mythos-naruto shipped a real auth flow:**

Navigate to the login/register surface. If it lives at `/auth/login`, Vite serves it as
a SPA — the URL in the browser bar changes but there is no server-side route. Verify:

1. Register a test user (e.g., `smoke@test.local` / `TestPass1!`).
2. `POST /api/auth/sign-up` is issued to `http://localhost:8787` (Wrangler dev, Step 10).
   Without the Worker running, this request will fail with `ERR_CONNECTION_REFUSED`.
   The client must handle this gracefully — no crash, a visible error message.
3. If the Worker is running: registration succeeds, email verification stub fires
   (`console.log` in `better-auth.ts` — visible in Wrangler dev terminal).
   Note: `requireEmailVerification: true` is set, so the user must be verified before
   sign-in. In local dev this means manually marking the user verified in D1, or
   temporarily setting `requireEmailVerification: false`.
4. Complete onboarding (`OnboardingScreen`): Welcome → Name input → Intent selection →
   tap "Begin with IRIS". `onComplete` callback fires → `setScreen('chat')`.
5. `ChatScreen` renders with the user's entered name in the header greeting (NOT "Mara" —
   `CLAUDE.md` placeholder scrub invariant). `displayName` comes from `useUserStore`
   hydrated via Capacitor Preferences.

**If mythos-naruto shipped a bypass / dev-mode auth:**
Auth gate may pass directly to `Shell`. Skip the registration sub-steps and confirm
`ChatScreen` renders with `displayName` null or empty-stated (not a hardcoded name).

**Common failure: onboarding name does not propagate to ChatScreen**
Root cause: `OnboardingScreen` collects the name locally but does not call
`useUserStore().setDisplayName(name)` before invoking `onComplete`.
Fix: wire `setDisplayName` in `OnboardingScreen`'s `next` callback at step 2.

---

## Step 8 — IRIS chat: send a test message

With `ChatScreen` visible, send: `I'm feeling stuck`

### Scenario A: Worker not running (local, no `wrangler dev`)

The fetch to `/api/iris` (or however `screen-chat.jsx` calls the edge) will fail.
Expected: the UI shows a graceful error state — "I'm having a moment of stillness.
Let's continue shortly." (the `FALLBACK_MESSAGE` in `server/src/iris.ts`), or a
user-friendly "offline" indicator.
Not acceptable: unhandled promise rejection in console, blank/frozen UI, or error
boundary crash.

### Scenario B: Worker running locally (Step 10 completed first)

`POST /api/iris` hits Wrangler dev at `http://localhost:8787`.
Current state of `server/src/index.ts`: `requireAuth` is a passthrough stub
(always calls `next()` without checking the session). The route forwards to the iris
handler — but the handler is currently a `501` stub:
```ts
return c.json({ error: "iris handler not wired" }, 501)
```
mythos-orochimaru owns wiring `handleIris`. If that wiring is complete post-dispatch,
the handler calls Anthropic. If `ANTHROPIC_API_KEY` is not set as a wrangler secret,
the Worker returns a 500 or SSE error event.
Expected with key set: SSE stream opens, delta events arrive, UI renders streamed text.
Expected without key: graceful fallback message.

**Common failure: ChatScreen does not send to `/api/iris` at all**
Root cause: `screen-chat.jsx` may send to a different endpoint, use a hard-coded base
URL, or not call the Worker at all (pure placeholder). Inspect Network tab for any
outbound fetch on message send.

**Common failure: CORS error on fetch to localhost:8787**
Root cause: Wrangler dev does not add CORS headers by default.
`better-auth.ts` lists `trustedOrigins` but those are for Better Auth only.
Fix: add a Hono CORS middleware in `server/src/index.ts`:
```ts
import { cors } from 'hono/cors'
app.use('*', cors({ origin: 'http://localhost:5173', credentials: true }))
```

---

## Step 9 — Capacitor sync

```powershell
cd C:\Users\massi\Engram
npm run sync
```

Runs: `cap sync`. Requires Capacitor CLI (`@capacitor/cli` is in devDependencies).

**If Xcode (iOS) and Android Studio are not installed:**
`cap sync` will still run but will warn about missing native toolchains. This is not
a failure. Expected output:
```
[info] Syncing iOS platform
[warn] Xcode not found — skipping CocoaPods install
[info] Syncing Android platform
[warn] Android Studio not found — skipping Gradle
```
Both `ios/` and `android/` directories will be created (Capacitor scaffolds them).
Exit 0.

**If `cap sync` fails with `No Capacitor configuration found`:**
Root cause: `capacitor.config.ts` or `capacitor.config.json` is absent. Capacitor
requires this file in the project root.
Expected content (minimum):
```ts
import { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'app.engram',
  appName: 'Engram',
  webDir: 'dist',
}
export default config
```
Fix: create `capacitor.config.ts` with the above. Then re-run `npm run build` first
(Capacitor syncs from `dist/`, not the dev server), then `cap sync`.

**If `cap sync` fails with `web assets directory dist does not exist`:**
Root cause: `npm run build` has not been run. `cap sync` copies from `dist/`.
Fix: run `npm run build` first, then `npm run sync`.
Note: Step 9 in the full build loop (`CLAUDE.md`) always runs after `build`.

---

## Step 10 — Server: Wrangler dev + IRIS 401 probe

```powershell
cd C:\Users\massi\Engram\server
npm install
npx wrangler dev --local
```

`--local` runs the Worker in a local V8 isolate without phoning home to Cloudflare.
D1 will use a local SQLite file in `.wrangler/state/`.

**Expected startup:**
```
⛅️ wrangler dev --local
...
[mf:inf] Ready on http://localhost:8787
```

### Probe: GET / (health check)

```powershell
Invoke-WebRequest -Uri http://localhost:8787/ -Method GET | Select-Object -ExpandProperty Content
```

Expected: `{"ok":true,"service":"engram-api"}`

### Probe: POST /api/iris without auth (expect 401)

```powershell
Invoke-WebRequest -Uri http://localhost:8787/api/iris -Method POST `
  -ContentType "application/json" `
  -Body '{"messages":[{"role":"user","content":"hello"}]}' |
  Select-Object -ExpandProperty StatusCode
```

**IMPORTANT KNOWN STATE:** `server/src/index.ts` `requireAuth` middleware is a
passthrough stub. It does NOT check the session — it calls `next()` unconditionally.
The iris route is currently a 501 stub, not a 401 gated route.

**Therefore the expected response as of post-dispatch is NOT 401 — it is 501.**
A 401 response requires mythos-orochimaru to wire `requireAuth` to call Better Auth's
`getSession` and return 401 on missing session.

Acceptance criteria for this probe step:
- If `requireAuth` is still a passthrough: expect `{"error":"iris handler not wired"}` with
  HTTP 501. Document this as a known gap; do not fail the probe.
- If mythos-orochimaru wired `requireAuth` + `handleIris`: expect HTTP 401 with
  `{"error":"unauthorized"}` on unauthenticated POST. This is the target state.

**Common failure: `wrangler dev` fails with `database_id = "TODO_OPERATOR_FILL"`**
Root cause: `wrangler.toml` has a placeholder D1 database ID.
Fix for local dev: replace `TODO_OPERATOR_FILL` with any UUID:
```toml
database_id = "00000000-0000-0000-0000-000000000000"
```
Local `--local` mode does not validate the UUID against Cloudflare's API.

**Common failure: `wrangler dev` fails on missing secrets**
`ANTHROPIC_API_KEY` and `BETTER_AUTH_SECRET` are not in `wrangler.toml` (correct by
design — secrets live in worker environment, not source). In local dev, provide them
via a `.dev.vars` file (gitignored):
```
ANTHROPIC_API_KEY=sk-ant-...
BETTER_AUTH_SECRET=any-local-secret-string
```
Wrangler automatically reads `.dev.vars` for local runs.

**Common failure: `better-auth` import fails in Worker isolate**
Better Auth may use Node.js APIs not available in the CF Workers runtime even with
`nodejs_compat` flag. Watch the Wrangler terminal for `[mf:err]` lines. If Better Auth
fails to load, the `/api/auth/*` route returns 500 instead of 501. This is a known
risk noted in `server/src/auth/better-auth.ts`.

---

## Pass criteria

The smoke is green when all of the following hold:

| # | Check | Status |
|---|---|---|
| 1 | `npm install` exits 0, lockfile present | |
| 2 | `npm run typecheck` exits 0, zero errors | |
| 3 | `npm run lint` exits 0, errors = 0 | |
| 4 | Dev server boots, root mounts in <2s, no red console errors | |
| 5 | ChatScreen matches dark-fixed.png layout fidelity (5/7 elements pass) | |
| 6 | All five accents cycle live on `<html data-accent>`; theme, density, font update | |
| 7 | Auth flow reaches ChatScreen with non-placeholder displayName | |
| 8 | Sending "I'm feeling stuck" produces response or graceful fallback (no crash) | |
| 9 | `cap sync` exits 0 (native dirs created or warn-only) | |
| 10 | Wrangler dev boots; POST /api/iris returns 401 or 501 (documented state) | |

Any red console error that persists after the auth gate resolves is a blocker.
A mis-scoped permission, secret in source, or placeholder name ("Mara") is a blocker
per `CLAUDE.md` invariants.

---

## Known pre-existing gaps (not dispatch regressions)

- `src/auth/AuthProvider.tsx` and `src/auth/LoginScreen.tsx` were owned by
  mythos-naruto and may not yet exist — Step 7 stub recipe covers the probe path.
- `server/src/index.ts` `requireAuth` is a passthrough — 401 probe will return 501 until
  mythos-orochimaru wires the middleware.
- `capacitor.config.ts` may be absent — Step 9 covers the scaffold recipe.
- Rate-limit enforcement in `iris.ts` is a stub (always allows) — not a smoke failure.
- Email verification in `better-auth.ts` is a stub (`console.log` only) — not a smoke
  failure for local dev.

---

*End of probe. Authored Tsunade-style: diagnose the root, fix the root, document why
it will not recur. No patches over symptoms.*
