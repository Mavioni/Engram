# Engram — Security Perimeter

**Status:** Authoritative as of 2026-05-01
**Author:** Gaara (mythos-gaara, Sand Perimeter cell)
**Witnesses:** Saber (auditor), Crystal (perimeter probe)

---

## 1. Secrets — Server-Side Only

All cryptographic secrets are confined to Cloudflare Workers environment bindings.
They are set via `wrangler secret put` and never appear in source code, `.env` files
committed to the repo, build artifacts, or Capacitor app bundles.

| Secret | Location | Rotation cadence |
|---|---|---|
| `ANTHROPIC_API_KEY` | Workers env (wrangler secret) | Quarterly or on suspected exposure |
| `BETTER_AUTH_SECRET` | Workers env (wrangler secret) | Quarterly or on suspected exposure |
| Signing certs / TLS material | Cloudflare-managed (edge cert) | Auto-renewed by CF |

**Enforcement gate:** No reference to `ANTHROPIC_*` is permitted anywhere under `src/`.
CI must verify this with a grep gate on every push.

`.env` is gitignored. `.env.example` holds key names only, never values.

---

## 2. Token Storage

### 2.1 Auth Session Token (Better Auth)

Better Auth session tokens are **NOT stored in Capacitor Preferences, localStorage,
or sessionStorage.**

Session state is cookie-bound: `HttpOnly`, `SameSite=Lax`, delivered by the Cloudflare
Worker on auth response. The Capacitor WebView forwards cookies automatically on
same-origin requests. No client-side code reads or writes the session token.

This is CLAUDE.md invariant #2 and is non-negotiable.

### 2.2 Non-Session Device Data (Capacitor Preferences)

`src/lib/secure-storage.ts` wraps `@capacitor/preferences` for data that must
survive app restart but is not the session credential:

- Push notification device tokens
- Device binding identifiers (for multi-device session management)
- Onboarding completion state
- Offline draft reference IDs (message queue metadata, not content)

#### Known Gap — Android / iOS Storage Encryption

| Platform | Backing store | Encrypted at rest? |
|---|---|---|
| iOS | `NSUserDefaults` (via Capacitor Preferences) | No — UserDefaults is NOT Keychain |
| Android | `SharedPreferences` | No — unencrypted by default |
| Web | `localStorage` | No |

**Risk:** Any data written through `secure-storage.ts` on iOS or Android is
accessible to a rooted/jailbroken device or a physical extraction tool.

**Upgrade path (post-MVP P1):** Migrate `setToken` / `getToken` to
`@capacitor-community/secure-storage-plugin`, which backs storage with iOS Keychain
and Android Keystore (AES-256 encrypted). The API surface is identical; the migration
is a single import swap with no call-site changes.

The upgrade is deferred to post-MVP because:
- Auth session tokens (highest sensitivity) are cookie-bound and never touch this layer.
- MVP-1 Preferences data (push tokens, device IDs) has limited blast radius.
- The community plugin requires an additional native dependency and Capacitor sync step.

---

## 3. Content Security Policy — WebView

Capacitor injects its own bridge headers into the WebView. We add an explicit CSP
`<meta>` tag in `index.html` to constrain the WebView content layer independently.

### 3.1 MVP-1 CSP (index.html meta tag)

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self'
              https://engram-api.workers.dev
              https://*.workers.dev
              capacitor:
              ionic:;
  media-src 'none';
  object-src 'none';
  frame-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

**Why `'unsafe-inline'` on script-src (MVP-1):**
Vite's React JSX pipeline currently injects inline `<script>` blocks in development
and the production bundle retains some inline initialization. Eliminating this requires
completing the Vite nonce-injection migration (see P1 hardening below).

**Replace `*.workers.dev` with the actual subdomain** once the Workers route is
provisioned (e.g., `https://engram-api.massimo.workers.dev`).

### 3.2 P1 Hardening — Nonce-Based CSP (post-Vite-migration)

Once inline JSX is refactored to module scripts:

```
script-src 'self' 'nonce-{PER_REQUEST_NONCE}';
```

The nonce is generated server-side per WebView load (Workers) and injected into the
HTML response. `'unsafe-inline'` is removed entirely.

This is a **MEDIUM** severity gap at MVP-1 and a **P1** item before the app reaches
public distribution.

---

## 4. D1 Authorization Posture

Cloudflare D1 does not have native Row-Level Security (RLS) comparable to PostgreSQL.

**Mitigation:** Every Worker handler enforces authorization at the application layer
before issuing any D1 query:

1. Extract session from cookie (`validateSession(request)` — Better Auth middleware).
2. Verify `session.userId` matches the resource owner field in the query predicate.
3. Return `403 Forbidden` immediately if the check fails — never execute the query.

This pattern must be present in every read and write handler in `workers/`. It is
not optional and cannot be delegated to a shared middleware alone (middleware can be
bypassed by direct handler calls in tests; explicit checks cannot).

**Gap vs. native RLS:** Application-layer checks are susceptible to developer error
(missing check on a new route). Mitigations:
- Code review gate: every new D1 query must show the auth check above it.
- Integration tests must include an unauthorized-user probe for every data endpoint.

---

## 5. App Store / Play Store Privacy

### 5.1 Data Collected — MVP-1

| Data type | Collected | Purpose | Encrypted in transit | Stored at edge |
|---|---|---|---|---|
| Email address | Yes | Auth (Better Auth) | Yes (TLS 1.3) | D1 `users` table |
| Display name | Yes | Profile | Yes | D1 `users` table |
| Mood check-in data | Yes | Core feature | Yes | D1 `check_ins` table |
| Journal entries | Yes | Core feature | Yes | D1 `messages` table |
| IRIS chat messages | Yes | AI companion feature | Yes | D1 `messages` table |
| Push notification token | Yes | Notifications (post-MVP) | Yes | Capacitor Preferences (device-local) + Workers KV |
| Analytics / telemetry | No | — | — | — |

### 5.2 ATT (App Tracking Transparency — iOS)

No third-party ad networks, cross-app tracking, or IDFA/IDFV use in MVP-1.
ATT prompt is **not required** for MVP-1.
If analytics are added post-MVP, re-evaluate before submission.

### 5.3 Play Store Data Safety Form

Required declarations for MVP-1:

- **Data collected:** Email, name, app activity (mood, journal, chat)
- **Data shared with third parties:** Anthropic API (message content for inference,
  no retention per Anthropic API TOS). Declare as "third-party processor" not
  "data sharing for advertising."
- **Data encrypted in transit:** Yes
- **Users can request deletion:** Yes — account deletion endpoint required before
  public launch (P1 blocker for store submission).

---

## 6. Threat Summary

| Threat | Current posture | Residual risk | Priority |
|---|---|---|---|
| LLM key extraction from device | Key never on device; Workers-only | Negligible | Sealed |
| Session token theft (XSS) | HttpOnly cookie; no JS access | Low | Sealed |
| Session token theft (CSRF) | SameSite=Lax cookie | Low (state-changing via GET blocked) | Sealed — add `SameSite=Strict` after confirming no cross-site redirect flows |
| Preferences data extraction (rooted device) | Unencrypted UserDefaults / SharedPreferences | Medium — upgrade to Keychain/Keystore post-MVP | P1 post-MVP |
| CSP bypass via unsafe-inline | Present at MVP-1 | Medium — no exfil path identified yet, but XSS→inline-exec possible | P1 — nonce migration |
| Unauthorized D1 access (missing auth check) | Manual per-handler enforcement | Medium — no native RLS | P1 — integration test gate |
| Secrets committed to repo | Gitignore + CI grep gate | Low | Active gate |

---

*End of perimeter. Modifications require a new ADR or amendment to this document.*
