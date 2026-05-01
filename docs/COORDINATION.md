# COORDINATION — Six-Paths Dispatch Graph

> Authored by mythos-nagato. Six-Paths Coordinator.
> Witness: Saber (Auditor) + Crystal (Security monitor).
> Date: 2026-05-01

## Dispatch Phases

### PHASE 0 — Independent (no file-level deps, full parallelism)

29 agents: hashirama, kinshiki, konan, tobirama, hiruzen, gaara, bee, eida, kisame, guy, jiraiya, kaguya, isshiki, hagoromo, hamura, momoshiki, itachi, nagato, shisui, kakashi, madara, tsunade, code, jigen, obito, deidara, minato, sasori, kawaki.

All unblocked at dispatch time. May write before phase peers complete.

### PHASE 1 — Needs Phase-0 outputs to exist

```
hashirama (vite/ts) ───────┬──► asura (main + App)
                           ├──► boruto (screens barrel)
gaara (secure-storage) ────┼──► naruto (auth screens)
                           └──► sasuke (user-store scrub)

kawaki (wrangler + server)─┐
bee (iris-prompt) ─────────┼──► orochimaru (iris.ts)
[better-auth scaffold] ────┘

asura + boruto + naruto + orochimaru ──► delta (Playwright e2e)
```

Phase-1 agents: 6 (asura, boruto, naruto, sasuke, orochimaru, delta).

### PHASE 2 — Sequential gate, after ALL others finish

```
[ALL PHASE-0] ──┐
[ALL PHASE-1] ──┴──► urashiki (git init + push)
```

1 agent. Sleeps 90s, then commits + pushes to private GitHub.

## Agent Count Summary

| Phase | Count | Notes |
|-------|-------|-------|
| Phase 0 | 29 | Full parallel |
| Phase 1 | 6 | File deps on Phase-0 |
| Phase 2 | 1 | Sequential gate |
| **Total** | **36** | nagato is Phase-0 (#18); 37th = swarm coordinator self-reference |

## Ownership Gaps — Deva Path Analysis

| File / Path | Severity | Recommendation |
|---|---|---|
| `src/lib/iris-stream.ts` (SSE client helper) | HIGH | Asura claims; or Sasuke inline fallback for MVP-1 |
| `src/lib/api-client.ts` (generic fetch wrapper) | HIGH | Asura |
| `src/types/` (shared TypeScript interfaces) | HIGH | Hashirama or new Phase-0 agent |
| `server/auth.ts` (better-auth route mounting) | HIGH | Kawaki explicitly; Orochimaru calls, never writes |
| `public/` (icons, manifest.json for PWA) | MEDIUM | No owner; next dispatch |
| `android/res/` + `ios/Assets.xcassets/` (app icons, splash) | MEDIUM | Next dispatch — dedicated asset agent |
| `tsconfig.node.json` | LOW | Hashirama covers; confirmed |
| `capacitor.config.ts` platform plugins | LOW | Tobirama owns |

## Blocker Register

| Blocker | Blocks | Severity | Resolution |
|---|---|---|---|
| hashirama vite.config + tsconfig before asura | asura, boruto | P0 | hashirama Phase-0; asura waits for file |
| gaara secure-storage API before naruto | naruto | P0 | gaara Phase-0 |
| kawaki server/index.ts shape before orochimaru iris wiring | orochimaru | P0 | kawaki Phase-0 |
| `src/types/` ownership gap | asura, orochimaru, delta | P1 | Assign barrel to Phase-0 |
| urashiki done-signal timing | git push | P2 | Sleeps 90s; assumes others flush |
| shisui + kakashi review docs collision | docs/REVIEW.md | P1 | Resolved — shisui→REVIEW_SHISUI.md, kakashi→REVIEW_KAKASHI.md |

## ASCII Full Dispatch Graph

```
PHASE 0 (parallel wall)
┌──────────────────────────────────────────────────────────────────┐
│ hashirama  kinshiki  konan   tobirama  hiruzen  gaara  bee       │
│ eida  kisame  guy  jiraiya  kaguya  isshiki  hagoromo  hamura    │
│ momoshiki  itachi  nagato  shisui  kakashi  madara  tsunade      │
│ code  jigen  obito  deidara  minato  sasori  kawaki              │
└───────────────────────────┬──────────────────────────────────────┘
                            │ outputs exist
                            ▼
PHASE 1 (partial parallel — each unblocks as deps land)
┌──────────────────────────────────────────────────────────────────┐
│  asura ◄── hashirama+kinshiki                                    │
│  boruto ◄── hashirama                                            │
│  naruto ◄── hashirama + gaara                                    │
│  sasuke (semantic order — after asura imports user-store)        │
│  orochimaru ◄── kawaki + bee                                     │
│  delta ◄── asura + boruto + naruto + orochimaru                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ all writes flushed
                            ▼
PHASE 2 (sequential gate)
┌──────────────────────────────────────────────────────────────────┐
│  urashiki → git init → git add -A → first commit → push          │
└──────────────────────────────────────────────────────────────────┘
```

## Naraka Path — Verification Questions

1. Does any Phase-1 agent write to a path also claimed by a Phase-0 agent? — No collisions detected; review-doc overlap resolved (shisui/kakashi split).
2. Does urashiki have a reliable done-signal? — Sleep-based heuristic; orchestrator (operator-side) confirms via post-dispatch verification.
3. Is `src/types/` resolved before delta writes Playwright imports? — Currently NO. Flag for next dispatch — types barrel needed.

*Six Paths deployed. The pain of a failed coordination is worse than any single agent's error. — Nagato*
