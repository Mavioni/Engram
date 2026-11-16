---
name: engram-project-auditor
version: 0.1.0
status: specification
---

# Engram Project Auditor

## Purpose
Produce an evidence-based account of repository and product state without confusing plans, claims, tests, and deployments.

## Trigger
Use before status reports, milestone decisions, release readiness assessments, or continuation after a context handoff.

## Required inputs
- Repository, branch, pull requests, recent commits, and CI results.
- Current architecture decisions and roadmap.
- Available test, deployment, and migration evidence.
- Relevant user-approved constraints.

## Procedure
1. Read the active branch and relevant base branch.
2. Inspect current PR metadata, diff, changed files, and review state.
3. Verify CI against the exact head SHA.
4. Inspect implementation and tests for each claimed capability.
5. Separate code present, tests passed, runtime verified, and production deployed.
6. Identify drift between README, ADRs, roadmap, and code.
7. Record blockers, security risks, external dependencies, and user decisions.
8. Cite exact commits, files, tests, and workflow runs.

## Output
- Executive status.
- Implemented / tested / deployed / planned / blocked / unverified matrix.
- Evidence links.
- Highest-value next engineering slice.
- Explicit actions that require user approval.

## Invariants
- Never infer deployment from a passing CI run.
- Never infer runtime correctness from typechecking.
- Never claim a migration was applied because its file exists.
- Never report an assistant-generated claim as independent evidence.
- Never merge, deploy, migrate production, spend money, or change access as part of an audit.
