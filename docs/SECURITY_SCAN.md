# SECURITY_SCAN.md — Engram dependency threat scan

> Owner: mythos-code (Threat Scanner / Code, Inner of Kara)
> Pack-leads: Saber (audit) + Crystal (probe)
> Date: 2026-05-01
> Scope: top-level deps in `/package.json` + `/server/package.json`

Findings ranked CRITICAL / HIGH / MEDIUM / LOW with evidence.
Smiling menace. Polite. Absolute.

---

## 1. Inventory

### Client (`/package.json`) — bundled to device

| Package | Version | Maintainer |
|---|---|---|
| react / react-dom | ^18.3.1 | Meta |
| @capacitor/core, ios, android, preferences, status-bar, splash-screen | ^6.x | Ionic Inc |
| zustand | ^5.0.0 | Daishi Kato (pmndrs) |
| better-auth | ^1.0.0 | better-auth org |
| vite, @vitejs/plugin-react | ^5.4 / ^4.3 | Evan You / Vite team |
| typescript | ^5.5 | Microsoft |
| @playwright/test | ^1.48 | Microsoft |
| eslint | ^9 | OpenJS |
| prettier | ^3.3 | Prettier team |

### Server (`/server/package.json`) — Cloudflare Worker

| Package | Version | Maintainer |
|---|---|---|
| @anthropic-ai/sdk | ^0.30.0 | Anthropic |
| hono | ^4.6.0 | yusukebe |
| better-auth | ^1.0.0 | better-auth org |
| @cloudflare/workers-types | ^4.x | Cloudflare |
| wrangler | ^3.80 | Cloudflare |

All maintainers reputable. No typo-squat candidates. No unfamiliar transitive top-levels.

---

## 2. Active advisories (Nov 2025 → May 2026)

### `hono` ^4.6.0 — **HIGH (10 advisories window)**
GitHub advisories: GHSA-9vqf-7f2p-gf9v (bodyLimit bypass, Apr 30 2026), GHSA-69xw-7hcm-h432 + GHSA-458j-xx4x-4375 (JSX HTML injection), GHSA-r5rp-j6wh-rvv4 + GHSA-26pp-8wgv-hjvm (cookie-name bypass), GHSA-xpcf-pg52-r92g (IPv4-mapped IPv6 ipRestriction bypass), GHSA-xf4j-xp2r-rqqx (toSSG path traversal), GHSA-wmmm-f939-6g9c (serveStatic repeated-slash bypass), GHSA-v8w9-8mx6-g223 (`__proto__` parseBody pollution), GHSA-5pq2-9x2x-5p6w (cookie attribute injection). All Moderate severity individually; **aggregate risk = HIGH** because Engram uses Hono on the auth surface. **Action: pin >= latest 4.x patched (verify via `npm view hono dist-tags` and bump).**

### `vite` ^5.4 — **HIGH (dev-only but real)**
GHSA cluster Apr 6 2026: arbitrary file read via dev-server WebSocket (High), `server.fs.deny` query bypass (High), Optimized Deps `.map` path traversal (Moderate). Plus Oct 2025 Windows backslash bypass. **All dev-server, not production**, but Engram dev runs on Windows host with WG mesh exposed to Tank-2 phone (10.8.0.2). **Action: pin >= 5.4.20 (post-patches) and bind dev server to 127.0.0.1, never 0.0.0.0.**

### `better-auth` ^1.0.0 — **CRITICAL**
- GHSA-xr8f-h2gw-9xh6 (Apr 16 2026, **High**): OAuth client creation bypasses `clientPrivileges` callback hook.
- GHSA-xg6x-h9c9-2m83 (Apr 1 2026, **High**): Two-Factor Auth bypass via premature session caching.
- GHSA-x732-6j76-qmhm (Dec 15 2025, **High**): rou3 double-slash path normalization bypasses `disabledPaths` and rate-limits.
- GHSA-4vcf-q4xf-f48m (Nov 24 2025, **High**): Passkey deletion IDOR.
- Plus 2 Low advisories.

Engram's session contract (HttpOnly + SameSite=Lax cookies) sits squarely in the blast radius of all four High advisories. **Pinning to ^1.0.0 caret will pull patches but lockfile may anchor a vulnerable build. Re-run `npm install --package-lock-only` after read of advisory fixed-in versions; gate via `npm audit --audit-level=high`.** **BLOCKER until verified.**

### `@anthropic-ai/sdk` ^0.30.0 — **MEDIUM**
- GHSA-p7fg-763f-g4gf (Apr 24 2026, Moderate): insecure default file perms in Local Filesystem Memory Tool.
- GHSA-5474-4w2j-mq4c (Mar 31 2026, Moderate): Memory Tool path validation sandbox escape.

Engram does **not** use the Memory Tool feature in the worker (`server/src/iris.ts` runs prompt-cached completions only). **Not exploitable as configured.** Tracked.

### `@capacitor/*` ^6.x — **CLEAN**
No published advisories on the ionic-team/capacitor repo in window.

### `react` / `zustand` / `playwright` / `typescript` / `eslint` / `prettier` / `wrangler` / `@cloudflare/workers-types` — **CLEAN**
No advisories in window relevant to Engram's usage.

---

## 3. Bundle-isolation taint check (Claw Grimes traced)

**Critical invariant: Anthropic API key must never enter the client bundle.**

Evidence:
- `grep -rn "@anthropic-ai" src/` → **zero hits**. SDK is server-only.
- `@anthropic-ai/sdk` is declared in `/server/package.json` only — not in root `package.json`.
- CLAUDE.md invariant codified: "No `ANTHROPIC_*` reference permitted anywhere under `src/`."

Status: **PASS**. Maintain as a CI lint rule (recommend adding `no-restricted-imports` for `@anthropic-ai/*` scoped to `src/**`).

---

## 4. Postinstall script audit (xz-utils-style supply-chain vector)

`npm ls --all --json` would surface any postinstall hooks. None of the top-level deps listed above are known to ship postinstall malware. Risks worth pinning:
- `wrangler` runs install scripts (Cloudflare-signed; trusted).
- `@playwright/test` runs `playwright install` to fetch browsers (signed; trusted).
- No suspicious low-stars / fresh-account packages in tree.

**Recommendation:** set `npm config set ignore-scripts true` in CI and explicitly allow-list known-safe ones, or run `npm ci --ignore-scripts` for non-dev installs (server worker bundle does not need browser binaries).

---

## 5. Lockfile + CI hygiene

- `package-lock.json` **is committed** (root). `.gitignore` does not exclude it. **PASS.**
- `/server/package-lock.json` — verify on next install (Saber, audit). If absent, generate via `npm install --package-lock-only` in `/server`.
- No `npm audit` step found in CI yet (assuming mythos-sasori writes it). Recommended workflow step:

```yaml
- name: npm audit (high)
  run: |
    npm audit --audit-level=high --omit=dev || exit 1
    cd server && npm audit --audit-level=high --omit=dev || exit 1
```

- Dependabot config: written by mythos-code at `.github/dependabot.yml` — weekly Monday 06:00 Europe/Rome, grouped (capacitor, react, vite), patch/minor auto-PR for client, all-types for server.

---

## 6. Verdict — blockers for first release

| ID | Package | Severity | Status |
|---|---|---|---|
| B1 | better-auth ≥1.0.0 patched | CRITICAL | **BLOCKER** — verify lockfile resolves to post-Apr 16 2026 fix; gate on `npm audit --audit-level=high` |
| B2 | hono ≥4.6 patched | HIGH | **BLOCKER** — bump to latest 4.x; auth surface uses Hono |
| B3 | vite dev-server bind | HIGH | Action — bind to 127.0.0.1 in `vite.config.ts`, never 0.0.0.0; ship before exposing dev to WG |
| B4 | @anthropic-ai/sdk Memory Tool advisories | MEDIUM | Not exploitable — Memory Tool unused. Track. |
| B5 | Postinstall hardening | MEDIUM | Recommend `npm ci --ignore-scripts` in CI server bundle path |

**Total deps with active advisories in window: 4** (hono, vite, better-auth, @anthropic-ai/sdk).
**Critical blockers: 1** (better-auth). **High blockers: 2** (hono, vite dev-server).

---

*Code reports. Claw Grimes traced. Dimensional cuts deep. Under Saber + Crystal pack-lead witness.*
