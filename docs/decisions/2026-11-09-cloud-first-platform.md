# ADR: Engram is a cloud-first platform

- Status: Accepted
- Date: 2026-11-09

## Context

The product must provide persistent intelligence, memory, and background execution without requiring a user's phone or workstation to remain online.

## Decision

Engram is cloud-first and cloud-authoritative. Identity, canonical memory, task state, orchestration policy, permissions, and audit live in hosted services. Clients are interaction surfaces and optional endpoints. Local inference or execution may be added as optional optimizations, not as prerequisites.

## Consequences

- Cloud security, cost, privacy, data residency, and resilience are first-order design requirements.
- Local-first assumptions in existing implementations must be reviewed before reuse.
- User devices may cache data but do not own canonical state.
