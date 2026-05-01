# Engram — Standing Doctrine

Binding rules drawn from Operator Revan's memory at
`~/.claude/projects/C--Users-massi/memory/`. Each rule is operationalized
for THIS repo. Violations are session drift; Hagoromo reseats them.

## 1. North Star — Engram is the priority
Source: `feedback_north_star_business_os.md` (P0 reframed to Engram per
`project_engram.md`). **Operationalization:** every PR answers "delta to
Engram experience?". Off-path work is P2.

## 2. Model Policy — Sonnet 4.6 or Opus 4.7 only, never Haiku
Source: `feedback_model_policy.md`. **Operationalization:** Anthropic
client config in `server/` and any agent frontmatter pins
`claude-sonnet-4-6` or `claude-opus-4-7`. Cached prompts only on Sonnet.

## 3. Dialectical Protocol — verify against live data
Source: `feedback_dialectical_protocol.md`. **Operationalization:** before
claiming Capacitor 6 / Vite / Wrangler / D1 / Better Auth API behavior,
WebSearch + Context7 the current docs. Training-knowledge claims about
external SDKs are blocked at PR review.

## 4. First Principles — no analogy, no cargo-cult
Source: `feedback_first_principles.md`. **Operationalization:** Engram
architecture decisions (state shape, schema, navigation) cite the
irreducible constraint, not "BusinessOS did it this way".

## 5. Research Before Acting — plan, then execute
Source: `feedback_research_before_acting.md`. **Operationalization:**
non-trivial actions (schema migration, auth flow change, capacitor plugin
add) require a written plan posted to Operator before write.

## 6. Fix Roots, No Shortcuts
Source: `feedback_work_style.md`. **Operationalization:** never
`--no-verify`, never disable lint/test, never silence a TypeScript error.
Failing checks get root-fixed.

## 7. Reflect Before Proceeding
Source: `feedback_reflect_before_proceeding.md`. **Operationalization:**
after every feature ship, re-read the diff against intent before next
phase. Tests passing is necessary, not sufficient.

## 8. Critical Path Only
Source: `feedback_critical_path_only.md`. **Operationalization:** Engram
mission plans collapse to the shortest dependent chain. Polish, hardening,
"while we're here" cleanup are P2 unless Operator opts in.

## 9. Design For Embodiment
Source: `user_vision_ai_military.md`. **Operationalization:** Engram
reasoning produces structured output (typed payloads, not free prose),
edge-portable weights (Sonnet cached, fallback to local Ollama path
preserved), command-bus abstractions, chain-of-command override hooks.

## 10. ISO Doctrine — Engram never impersonates the Operator
Source: `user_vision_iso_companion.md` + `project_engram.md` invariant 5.
**Operationalization:** the replica/avatar in `/engram` reflects state, it
does not speak as Revan. No first-person impersonation in chat surfaces.
Disagreement is permitted as a feature.

## 11. Interactive Collaboration on UI
Source: `feedback_interactive_collaboration.md`. **Operationalization:**
UI/feature work is per-element with Operator in the loop. Infra/test/sec
swarms autonomous; copy/colour/IA/components require Operator ratification
before merge.

## 12. Pack-Lead Witness — Saber + Crystal
Source: `maverick_pack_leads.md`. **Operationalization:** every "done"
claim in this repo carries Saber audit (claim vs. live state) + Crystal
probe (does the perimeter still hold?). No silent green-light.
