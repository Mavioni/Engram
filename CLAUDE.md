# CLAUDE.md — Engram project operating doctrine

## Mission

Engram is a personal AI journaling and reflection app. The design is a first-class artifact. The AI layer (Sonnet 4.6, prompt-cached, edge-only) is the product. The codebase is the instrument.

---

## Must-read on session start

Load all four before touching code:

1. This file (`CLAUDE.md`)
2. `docs/NORTH_STAR.md` — product vision and UX north star
3. `docs/ARCHITECTURE.md` — six-layer topology, bounded contexts, non-negotiables
4. `docs/DOCTRINE.md` — coding doctrine, design invariants, decision log

If any of these files are missing, stop and report before proceeding.

---

## Build loop (run in order, no shortcuts)

```
lint (zero warnings)
  -> typecheck (tsc --noEmit, zero errors)
    -> test:e2e (Playwright, all green)
      -> build (vite build)
        -> cap sync
```

A build is only complete when all five stages pass. Do not skip stages. Do not commit on a partial pass.

Shorthand:

```bash
npm run lint && npm run typecheck && npm run test:e2e && npm run build && npm run sync
```

---

## Commit format

Conventional commits. No `Co-Authored-By` lines. No attribution footers.

```
<type>(<scope>): <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`

Scopes mirror the repo layout: `screens`, `components`, `server`, `state`, `auth`, `docs`, `ci`

---

## Invariants (non-negotiable, every turn)

### Design
- The visual design is preserved 1:1 from the prototype (`prototype.html` + `screenshots/`).
- No layout changes, no color changes, no spacing changes without an explicit Operator directive.
- Reference screenshots in `screenshots/` are the ground truth for visual regression.

### ISO doctrine
- The AI companion persona in Engram is not authored. It emerges from the substrate.
- Do not write fixed personality strings, canned responses, or persona scripts.
- Conversation quality is a function of prompt architecture, not copy.

### Model policy
- Sonnet 4.6 only. Never Haiku. Never a smaller model.
- Prompt caching is mandatory on system prompt and thread prefix. This is cost discipline, not optional.
- Model model selection is not subject to debate during implementation.

### Secrets
- Anthropic API key lives in Cloudflare Worker secret bindings (`wrangler secret put`).
- No `ANTHROPIC_*` reference permitted anywhere under `src/`.
- No secrets in `.env` committed to the repo. `.env` is gitignored. `.env.example` holds keys only, never values.

### File size
- No file exceeds 800 lines. If a file approaches that ceiling, extract a module before adding more.

### Auth
- Sessions are cookie-bound, HttpOnly, SameSite=Lax via Better Auth.
- No tokens in localStorage, sessionStorage, or Capacitor Preferences.

### Data authority
- D1 is the source of truth for messages and threads. Zustand is a cache, never authoritative.
- Optimistic updates are always reconciled against server IDs.

---

## Placeholder scrub

Placeholder and dummy content was removed by mythos-sasuke. Do not re-introduce placeholder copy, lorem ipsum, or stub user data anywhere in the codebase.

---

## ANBU delegation

Specialized work routes to the appropriate Mythos swarm node. Claude Code (this session) is orchestrator and synthesizer. Writing code directly when a specialist exists is drift.

| Domain | Node |
|---|---|
| Architecture decisions | Isshiki (architect) |
| Screen / component code | Itachi / Hatake (code) |
| Edge Worker / API | Kiri (network) |
| Auth + security | Kakashi (redteam) |
| Tests + debugging | Crystal / anbu-qa |
| This file and docs | Konan (scribe) |

---

*End of doctrine. Modifications to invariants require an ADR in `docs/`.*
