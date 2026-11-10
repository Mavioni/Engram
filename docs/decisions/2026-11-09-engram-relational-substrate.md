# ADR: Engram Relational Substrate and E8 Presence

- **Date:** 2026-11-09
- **Status:** Accepted
- **Decision owners:** Engram platform
- **Related:** [Relational Substrate architecture](../architecture/RELATIONAL_SUBSTRATE.md)

## Context

Engram needs a coherent model spanning identity, memory, knowledge, reasoning, agents, tasks, events, integrations, and user-facing presence. Separate domain silos would make provenance, authorization, temporal reasoning, and cross-domain queries difficult. A single monolithic schema or service would create tight coupling and prevent independent evolution.

Engram also intends to use the E8 lattice/root system as the mathematical foundation for its visual presence. The visual representation must remain grounded in actual data without confusing a geometric projection with canonical knowledge.

## Decision

Adopt the Engram Relational Substrate (ERS) as the shared logical model built from entities, typed relationships, events, contexts, assertions/evidence, and authority.

Domain modules retain ownership of their validation and lifecycle rules. ERS does not require one physical database, one table, or one service. Begin with modular cloud-hosted persistence and typed repository interfaces.

The Engram Knowledge Graph is a semantic query view over ERS. Engram E8 Presence is a derived visualization view over authorized ERS query results. They share a source model but remain distinct technical systems.

E8 coordinates and projections are versioned, reproducible derived data. They are not identifiers, permissions, facts, or canonical storage. E8-informed layouts must be evaluated against conventional graph-layout baselines before being used as the only presentation method.

## Consequences

### Positive
- Shared identity and relationship semantics across platform domains.
- Provenance, evidence, temporal validity, and authority can be queried consistently.
- Knowledge exploration and spatial presence can use the same authorized subgraph.
- Domain modules and storage engines can evolve behind stable contracts.
- The visual layer can expose relationships without owning or mutating canonical truth.

### Costs and risks
- Requires careful ontology, predicate registry, tenant model, and schema governance.
- Entity resolution and contradiction management are nontrivial.
- Generic abstractions can become overengineered if introduced before real use cases.
- E8 mapping may add complexity without improving graph comprehension; it must be tested.
- Existing D1 tables require additive migration and compatibility, not a destructive rewrite.

## Rejected alternatives

1. **Independent graph per domain:** duplicates identity, provenance, and authorization semantics.
2. **One universal JSON document:** weak constraints, poor queryability, and unclear ownership.
3. **Make E8 the database:** confuses geometric representation with semantic truth and access control.
4. **Adopt a dedicated graph database immediately:** premature before query volume and operational needs justify it.
5. **Force every entity onto one of the 240 E8 roots:** mathematically incorrect as a scalable identity mapping.

## Guardrails

- Authorization is evaluated independently of graph connectivity.
- Model-inferred assertions are never silently promoted to user-approved memory.
- Events and audit records are append-only; corrections are explicit.
- Tenant isolation is mandatory at repository and query boundaries.
- Existing client, memory, and conversation behavior remains compatible during staged migration.
- No remote migration or deployment is authorized by this ADR.
