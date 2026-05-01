# MISSION REPORT — Engram Dispatch (Wave-0 Contract)

**Issued:** 2026-05-01
**Commander:** mythos-itachi (Revenant)
**Operator:** Revan
**Pack-leads:** Saber (audit) + Crystal (verify)
**Repo:** `C:\Users\massi\Engram\` → `Mavioni/Engram` (PRIVATE)

---

## Mission Goal

Scaffold Engram as a privacy-first Capacitor 6 + Vite + React + Cloudflare Workers (D1, Better Auth) personal psychology companion with a Claude Sonnet 4.6 proxy, preserving the existing dark-fixed design while scrubbing the Mara/Lighthouse-Keeper companion layer and gating the home screen behind register+login.

---

## Operator-Confirmed Decisions

| # | Decision | Locked |
|---|----------|--------|
| 1 | **Path A** — Capacitor preserve-design (no Expo rewrite) | YES |
| 2 | **Private repo** `Mavioni/Engram` via `gh repo create --private` | YES |
| 3 | **Backend** Cloudflare Workers + D1 + Better Auth | YES |
| 4 | **Model** Anthropic Claude Sonnet 4.6 only (cached system prompt) | YES |
| 5 | **Scrub** Mara persona, Lighthouse-Keeper, chat + dashboard + playercard surfaces | YES |
| 6 | **Auth flow** register → login → onboarding → home (no anonymous home access) | YES |

## 37-Agent Ownership Manifest

Authoritative — each path has exactly one owner.

| Agent | Owned Path |
|-------|-----------|
| mythos-kaguya | `docs/NORTH_STAR.md` |
| mythos-isshiki | `docs/ARCHITECTURE.md` |
| mythos-hagoromo | `docs/DOCTRINE.md` |
| mythos-hamura | `docs/DESIGN_RECON.md` |
| mythos-momoshiki | `docs/PATTERNS.md` |
| mythos-hashirama | `vite.config.ts`, `tsconfig.json`, `index.html` |
| mythos-urashiki | `.gitignore`, `.gitattributes`, git init + push |
| mythos-kinshiki | `package.json` |
| mythos-konan | `README.md`, `CLAUDE.md`, `LICENSE` |
| mythos-sasori | `.github/workflows/build.yml` |
| mythos-asura | `src/main.tsx`, `src/App.tsx` |
| mythos-indra | `src/lib/jsx-bridge.{ts,d.ts}`, `docs/JSX_BRIDGE.md` |
| mythos-boruto | `src/screens/index.ts`, `src/components/index.ts`, `docs/FRONTEND_SMOKE.md` |
| mythos-sasuke | scrub `src/screens/{chat,dashboard,playercard}.jsx` + `src/store/user-store.ts` |
| mythos-hiruzen | `eslint.config.js`, `.prettierrc.json`, `.prettierignore` |
| mythos-kawaki | `server/wrangler.toml`, `server/package.json`, `server/tsconfig.json`, `server/src/index.ts` |
| mythos-naruto | `src/auth/{AuthProvider,LoginScreen,RegisterScreen,ForgotPasswordScreen}.tsx`, `auth-client.ts` |
| mythos-gaara | `src/lib/secure-storage.ts`, `docs/SECURITY_PERIMETER.md` |
| mythos-tobirama | `capacitor.config.ts` |
| mythos-jigen | `docs/DOCKER_DECISION.md` (verdict: skip) |
| mythos-orochimaru | `server/src/iris.ts`, `server/src/db/schema.sql`, `server/src/db/migrations/0001_initial.sql`, `server/src/auth/better-auth.ts` |
| mythos-eida | `docs/COMPETITIVE.md` |
| mythos-bee | `server/src/iris-prompt.ts`, `docs/IRIS_VOICE.md` |
| mythos-kisame | `docs/TOKEN_BUDGET.md` |
| mythos-itachi | `docs/MISSION_REPORT.md` (this file) |
| mythos-kakashi | `docs/REVIEW_KAKASHI.md` |
| mythos-shisui | `docs/REVIEW_SHISUI.md` |
| mythos-madara | `docs/THREAT_MODEL.md` |
| mythos-tsunade | `docs/SMOKE_PROBE.md` |
| mythos-code | `docs/SECURITY_SCAN.md`, `.github/dependabot.yml` |
| mythos-obito | `.env.example`, `server/.dev.vars.example`, `docs/SECRETS.md` |
| mythos-delta | `playwright.config.ts`, `tests/e2e/{01-render,02-auth,03-iris-chat}.spec.ts` |
| mythos-guy | `docs/PERF_BUDGET.md` |
| mythos-jiraiya | `docs/VISION.md` |
| mythos-deidara | `scripts/cleanup-staging.{sh,ps1}` |
| mythos-minato | `.github/workflows/deploy-worker.yml` |
| mythos-nagato | `docs/COORDINATION.md` |

**Total: 37 owners.**

## In-Scope (this dispatch — MVP-1/2/3)

- Vite + React + TypeScript build green
- Capacitor 6 config registered
- Private GitHub repo created and pushed (commit `26a122a`)
- ESLint + Prettier + CI workflow
- Existing design screens render (post-bridge)
- Mara/Lighthouse-Keeper scrubbed end-to-end
- Auth gate: register → login → onboarding → home (Better Auth)
- Cloudflare Worker scaffold + D1 schema
- `/api/iris` proxy endpoint to Sonnet 4.6 with prompt caching

## Out of Scope (next /Ninja)

- RevenueCat IAP wiring + paywall gates
- Native iOS/Android packaging (Xcode, Android Studio signing)
- Apple/Google sign-in OAuth callbacks (deep-link via `engram://`)
- Push notifications + Email Routing (Resend/CF Email)
- Production deploy to custom domain
- Self-hosted fonts (mythos-guy P1 flag)
- Encryption-at-rest for journal entries (mythos-madara flag)
- Keychain/Keystore upgrade beyond Capacitor Preferences (mythos-gaara flag)

## Verification Gates (post-dispatch)

1. `cd C:\Users\massi\Engram && npm install` — exit 0 (kinshiki: 272 packages, 4 vulns surfaced)
2. `npm run typecheck` — exit 0
3. `npm run build` — exit 0
4. `npm run dev` — server boots on `http://localhost:5173`; visual diff against `screenshots/dark-fixed.png`
5. `gh repo view Mavioni/Engram --json visibility` returns `"PRIVATE"` ✓ (urashiki confirmed)
6. `git log --oneline -1` shows initial commit `26a122a`
7. Crystal smoke probe: register → login → home loads behind auth gate
8. Saber audit: `grep -ri "Mara\|Lighthouse Keeper" src/` returns zero matches in user-facing copy

## Pack-Lead Witness

- **Saber** captures intake; 37-agent manifest above is the contract; any agent writing outside its owned path is a violation.
- **Crystal** pre-stages verification gates 1–8.

— Revenant (mythos-itachi), under Saber + Crystal
