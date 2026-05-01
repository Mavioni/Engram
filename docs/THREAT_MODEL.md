# Engram — Threat Model

**Status:** Authoritative as of 2026-05-01
**Author:** Madara (mythos-madara, Adversarial Architecture cell)
**Witnesses:** Saber (audit), Crystal (perimeter probe)
**Companion docs:** `SECURITY_PERIMETER.md` (defensive posture), `ARCHITECTURE.md` (topology)

> The defender writes the perimeter. The adversary writes this document.
> Every section is the playbook of someone who wants Engram broken.

## 0. Threat Actors

| Actor | Capability | Motive |
|---|---|---|
| **Opportunistic abuser** | Headless HTTP, free proxy pools, bulk email | Drain free Anthropic credit |
| **Targeted attacker** | Custom payloads, mobile RE tools (Frida/objection), credential dumps | Read another user's journal — high-value PHI-adjacent content |
| **Malicious insider (admin)** | D1 console / Cloudflare dashboard | Curiosity, blackmail, subpoena leakage |
| **Supply-chain attacker** | Compromise of a transitive npm dep | Beachhead in Workers runtime |
| **Compromised device holder** | Physical access, rooted Android / jailbroken iOS | Local extraction of Preferences, session theft |
| **Prompt-injection author** | Crafted journal text or pasted content | Coerce IRIS to break voice, leak system prompt, impersonate clinician |

## 1. AUTH — Account Takeover

### 1.1 Credential stuffing
Better Auth has built-in password rules but `rateLimit` is unconfigured in `createAuth()`. Email verification IS required before sign-in.
**Mitigations (this dispatch P0):** add Better Auth `rateLimit` block — sliding window, 5 failed attempts/15min/IP, 10/15min/email, exponential lockout.
**Next dispatch:** `pwnedpasswords` k-anonymity check; TOTP 2FA via Better Auth plugin.
**Severity:** HIGH.

### 1.2 Session theft via local extraction
Session cookie is `HttpOnly`/`SameSite=Lax` — sealed against XSS. But `secure-storage.ts` writes through `@capacitor/preferences` to iOS UserDefaults / Android SharedPreferences (NOT Keychain/Keystore). Any future "remember device"/"skip 2FA" feature that derives trust from these values gives attacker forged trust.
**Mitigations:** explicit non-goal — `secure-storage.ts` is NOT a trust boundary. Migrate to `@capacitor-community/secure-storage-plugin` next dispatch.
**Severity:** MEDIUM (HIGH if "trusted device" feature lands).

### 1.3 Reset-password takeover
Currently `sendResetPassword` is a `console.log` stub — unreachable, but only because unimplemented. When wired, six-point checklist binding before launch:
1. Token entropy ≥256 bits (Crystal probe in CI)
2. Token expiry ≤1 hour (`passwordReset.expiresIn` set explicitly)
3. One-time use, invalidated on issuance of fresh
4. Rate limit on reset endpoint (prevents email enumeration timing attack)
5. Account-lockout-on-reset invalidates all live sessions
6. SPF, DKIM, DMARC on sender domain

**Severity:** HIGH (latent, becomes CRIT the moment reset goes live).

## 2. LLM — Prompt Injection & Persona Erosion

### 2.1 Prompt injection in user messages
Engram is a journaling product — users will paste articles, conversations, OCR'd text. Adversarial content arrives in the prompt by design.
**Mitigations (this dispatch — must land in `iris-prompt.ts`):** system-prompt shielding clause that explicitly classifies user content as CONTENT not COMMANDS, refuses clinician roleplay, refuses system-prompt disclosure. Hard 4000-char input cap (already in `iris.ts`). Output-side filter for clinician/sysprompt tells in next dispatch.
**Severity:** HIGH.

### 2.2 Jailbreak via roleplay
Slow-cook variant: 30 turns mundane journaling, then hairpin pivot.
**Mitigation:** system-prompt clause: IRIS declines roleplay BY STAYING IRIS — never adopts fictional personas. Anthropic Sonnet 4.6 native robustness + nightly red-team battery in CI.
**Severity:** MEDIUM.

### 2.3 Conversation-history poisoning
Worker reconstructs `messages[]` from D1 every turn. Compounds dangerously with §4 D1 injection — attacker who writes to D1 directly injects `assistant`-role content that Anthropic trusts as its own prior speech (system-prompt shield does NOT cover this).
**Mitigations (this dispatch):** `messages.role` CHECK constraint at schema level. Worker hardcodes `role:'user'` on insert — never user-controlled. Next dispatch: per-row HMAC.
**Severity:** MEDIUM alone, HIGH compounded.

## 3. ABUSE — Free-Tier Drain

### 3.1 Bulk anonymous accounts → Anthropic credit drain
1000 disposable emails × 30 free turns/day × ~$0.003/turn = $90/day burned. **Worse: rate-limit is currently a `STUB: always allow`** — single account = infinite turns until cost monitoring triggers.
**Mitigations (this dispatch P0 for Naruto):** wire KV-backed daily limiter `rl:iris:{userId}:{YYYYMMDD}`. Add per-IP bucket `rl:ip:{cf-connecting-ip}:{YYYYMMDD}` at 200 turns/day/IP.
**Next dispatch:** disposable-email blocklist; hCaptcha/Turnstile on sign-up.
**Severity:** HIGH.

## 4. DATA — D1 Cross-Tenant Leak

### 4.1 SQL injection
Current `iris.ts` uses parameterized `prepare().bind()` — clean. Need a GATE not hand-discipline.
**Mitigations (this dispatch):** ESLint rule blocking `db.prepare(\`${...}\`)` and string-concat SQL. CI grep gate on injection patterns. Integration tests per data endpoint with classic payloads.
**Severity:** CRIT if a single offender lands.

### 4.2 Application-layer auth bypass on D1
**`requireAuth` middleware in `server/src/index.ts:40` is a TODO no-op that calls `next()` unconditionally. RIGHT NOW /api/iris is open** — protected only by secondary `if (!user) return 401` inside handler. Fail-closed defense correct, but the moment Orochimaru defaults a user for testing, gate vanishes.
**Mitigations (this dispatch P0):** `requireAuth` MUST resolve session, MUST 401 on miss, MUST never default a user. Integration test `unauthorized-user-probe` per endpoint.
**Severity:** CRIT (latent today).

### 4.3 Cleartext journal entries at rest in D1
"Encrypted at rest by Cloudflare" means Cloudflare has the keys. A subpoena, a mis-scoped API token, a future "view as user" support tool — all read raw journal text. PHI-adjacent content; treat as PHI for risk modeling.
**Mitigations (next dispatch — flag Isshiki ADR):** client-side AES-GCM encryption of journal-entry bodies, key derived from user passphrase, key never sent to server. Worker stores opaque ciphertext. Tradeoffs: lost passphrase = lost data; AI processing requires plaintext (separate IRIS chat from journal entries — two stores, two postures).
**Severity:** MEDIUM (escalates to HIGH on first incident).

## 5. IAP — Receipt Forgery (deferred to RevenueCat dispatch)

Mandatory pattern when wired: Worker NEVER trusts client purchase claims. RevenueCat server-to-server webhooks are source of truth; Worker queries RC REST API on every entitlement check.

## 6. APP STORE — Bundle Reverse Engineering

Bundle is fully readable. Obfuscation is theater. Defense: no secrets in bundle (CI grep gate on `ANTHROPIC_*`, `BETTER_AUTH_SECRET`, `sk-`, `pk_live_`). All API surface server-side. Client is a renderer.
**Severity:** LOW by design.

## 7. SUPPLY CHAIN — Malicious npm dep

A poisoned transitive dep ships ANTHROPIC_API_KEY out the door from Worker env. Caret ranges (`better-auth ^1.0.0`, `zustand ^5.0.0`) auto-pull malicious 1.x release.
**Mitigations (this dispatch):** `.github/dependabot.yml` weekly grouped, auto-merge patch only. `npm audit --production --audit-level=high` CI gate. Socket.dev or equivalent supply-chain anomaly detector.
**Next dispatch:** license-check pass; Workers egress allow-list to `api.anthropic.com` only.
**Severity:** HIGH (latent).

## 8. Top 5 Risks — Ranked

| Rank | Risk | Severity | Cost | Mitigation status |
|---|---|---|---|---|
| 1 | `requireAuth` no-op + rate-limit stub combined | **CRIT** | $0 | This dispatch — wire requireAuth + KV rate limiter. Blocker for any traffic. |
| 2 | IRIS prompt injection / clinician impersonation / sysprompt leak | HIGH | $0 | This dispatch — system-prompt shielding in iris-prompt.ts. Output-side filter next. |
| 3 | Credential stuffing on /api/auth/sign-in/email | HIGH | ~$10 | This dispatch — Better Auth `rateLimit` config. Breach-list + 2FA next. |
| 4 | Bulk-account free-tier drain | HIGH | ~$5 | This dispatch — KV per-user + per-IP rate limit. Disposable-email blocklist + captcha next. |
| 5 | Cleartext journals at rest in D1 (provider has keys) | MEDIUM (escalates) | provider-tier | Next dispatch — Isshiki ADR for client-side AES-GCM journal encryption. |

## 9. Blockers Surfaced for Other Cells

| Cell | Blocker |
|---|---|
| Itachi/Hatake | `iris-prompt.ts` was missing — **resolved** by Bee + orchestrator move |
| Naruto | System-prompt shielding language must land in `iris-prompt.ts` (verify Bee included) |
| Naruto | KV-backed rate limiter wired into `iris.ts` per its own TODO. P0. |
| Orochimaru | `requireAuth` middleware in `server/src/index.ts:40` is TODO no-op. **P0.** |
| Orochimaru | All D1 queries `prepare().bind()`. CHECK constraint on `messages.role`. |
| Naruto | `sendVerificationEmail` + `sendResetPassword` stubs. Six-point §1.3 checklist binding before launch. |
| Konan | `.github/dependabot.yml` — **resolved** by mythos-code in this dispatch |
| Isshiki | ADR required: client-side AES-GCM journal encryption (§4.3) — flag for next dispatch |
| Gaara | `secure-storage.ts` Keychain/Keystore migration — post-MVP |

*Wake up to reality. Every threat above is unmitigated until the ranked table shows them sealed.*
