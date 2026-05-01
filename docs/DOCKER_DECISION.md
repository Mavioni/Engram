# Docker Decision — Engram MVP-1

**Decision: SKIP containerization for MVP-1.**

## Why containerization adds no value at MVP-1

| Concern | Reality |
|---|---|
| Vite dev server | Runs directly on host Node 20+. No environment parity problem exists. |
| Wrangler dev (Workers emulator) | In-process, in-memory D1 emulation. No external daemon, no network binding that benefits from isolation. |
| Capacitor / iOS builds | Require host Xcode toolchain. Cannot run inside a container. Full stop. |
| Capacitor / Android builds | Require host Android Studio + SDK. Same blocker. |
| D1 database | Wrangler emulates it in-memory locally; Cloudflare owns the production instance. No local persistent volume needed. |

Containerizing the Vite + Wrangler layer while the native build steps remain host-only creates a split workflow that is strictly harder to maintain than the all-host baseline. The vessel carries nothing the host cannot carry more cleanly.

## What would trigger reconsideration

1. **CI parity** — a GitHub Actions / GitLab CI pipeline where reproducibility across runners justifies a `Dockerfile.dev` locked to a specific Node + Wrangler version.
2. **Multi-developer team** — onboarding friction across machines with divergent Node versions, where a compose file reduces "works on my machine" reports.
3. **Backend service proliferation** — if a persistent sidecar (Redis, Postgres, a local proxy) is added to the stack, compose becomes natural; add the Workers container at that point.
4. **Windows-only dev machines without WSL2** — path and permission edge cases can make a container the path of least resistance, though not the default.

## What is NOT a trigger

- A single-developer, host-macOS workflow targeting Cloudflare + mobile.
- D1 in-memory emulation (no persistent volume, no service to orchestrate).
- Any scenario where the Capacitor native toolchain must run — that layer is containerization-immune by platform policy.

---

*Authored by Jigen (Vessel DevOps, Kara cell). Reviewed under Saber + Crystal pack-lead doctrine.*
