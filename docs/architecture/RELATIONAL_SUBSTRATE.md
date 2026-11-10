# Engram Relational Substrate (ERS)

**Status:** Accepted architectural direction; initial append-only D1 event-log slice implemented; broader persistence and authorization remain pending.  
**Scope:** Canonical model for identity, memory, knowledge, reasoning artifacts, agents, tasks, events, contexts, authority, and integrations.  
**Deployment posture:** Cloud-first. D1 is the current persistence foundation; storage may evolve behind Engram-owned repositories.

## 1. Decision

Engram will use one shared relational substrate to represent entities, relationships, events, contexts, evidence, and authority across platform domains.

ERS is a **logical and semantic model**, not a requirement to place all data in one table, one database, or one service. Domain modules retain clear ownership and may use specialized storage behind stable contracts.

The Engram Knowledge Graph is the queryable semantic view over ERS. Engram E8 Presence is a derived, interactive geometric view over selected ERS data. Neither view becomes a second source of truth.

## 2. Core invariants

1. **Canonical identity:** Every entity has a stable, opaque identifier independent of provider, model, runtime, or client.
2. **Explicit tenancy:** Every record is scoped to a personal owner or an organization/workspace tenant. Authorization is checked server-side on every read and mutation.
3. **Typed relationships:** Edges have a defined predicate, direction, cardinality policy, and domain semantics.
4. **Provenance:** Assertions and derived conclusions retain who/what supplied them, when, by which method, and from which source.
5. **Temporal integrity:** The model distinguishes when something is true in the represented world from when Engram learned or recorded it.
6. **Authority separation:** A statement's existence does not grant permission to act on it. Identity, grants, approvals, and policy decisions are explicit.
7. **Immutable history:** Events and audit records are append-only. Corrections supersede or retract assertions; they do not silently rewrite history.
8. **Derived geometry:** E8 coordinates, layouts, projections, and visual caches are reproducible derived artifacts, never canonical identity or knowledge.
9. **Domain ownership:** Identity, Memory, Knowledge, Reasoning, Orchestration, Runtime, and Integrations own their domain rules while sharing ERS primitives.
10. **Cloud continuity:** Durable state and background work live in Engram Cloud; clients are not required to remain online.

## 3. Universal primitives

### 3.1 Entity

An entity is a stable referent: person, agent, organization, device, concept, memory, task, integration, document, or other domain object.

Minimum envelope:
- `id`: opaque stable ID (UUID/ULID; never encode mutable meaning in the ID)
- `tenant_id`: personal or workspace security boundary
- `entity_type`: namespaced, versioned type
- `domain_owner`: module responsible for lifecycle and validation
- `created_at`, `updated_at`
- `status`: lifecycle state
- optional `external_refs`: provider-scoped identifiers, never canonical IDs

Domain-specific attributes remain in typed tables or versioned payloads. Do not turn the entity table into an unvalidated JSON dumping ground.

### 3.2 Relationship

A relationship is a typed, directed assertion between entities.

Minimum envelope:
- `id`, `tenant_id`
- `subject_id`, `predicate`, `object_id`
- `qualifiers`: bounded typed attributes (for example role, weight, modality)
- `valid_from`, `valid_to`: represented-world validity
- `recorded_at`, `superseded_at`: system knowledge history
- `assertion_id` / provenance reference
- `status`: active, superseded, retracted, disputed

Predicates are namespaced and governed by a registry. Avoid free-form relationship strings in production writes. Directionality and inverse semantics must be explicit; do not assume every predicate is symmetric.

### 3.3 Event

An event records an occurrence or state transition: a user statement, memory approval, task creation, agent delegation, tool invocation, integration update, or policy decision.

Events are append-only and include:
- event ID and tenant
- event type and schema version
- actor identity and actor type
- subject/target references
- occurred time and recorded time
- correlation/causation IDs
- source and provenance
- bounded payload and sensitivity classification

Events support audit and reconstruction. They are not automatically facts: an event saying an agent proposed something does not prove the proposal is true or approved.

### 3.4 Context

Context describes the frame in which an assertion or operation is meaningful: conversation, task, project, time window, location scope, device session, or reasoning run.

Contexts are explicit references with ownership, lifecycle, and access policy. Context can constrain retrieval and interpretation but cannot override authorization.

### 3.5 Authority

Authority is modeled separately from semantic relationships. It includes:
- principal (user, agent, service, integration)
- resource or resource scope
- action
- grant source and policy
- constraints (time, budget, environment, data class)
- approval requirement and approval record
- expiry, revocation, and audit linkage

A relationship such as `agent collaborates_with user` never implies permission to access the user's data or execute an action.

## 4. Assertions, evidence, and provenance

ERS distinguishes:
- **Assertion:** a claim or relationship proposed as meaningful.
- **Evidence:** source material supporting or contradicting an assertion.
- **Provenance:** how the assertion entered Engram.
- **Assessment:** confidence, reliability, and review status assigned under a named method.

Provenance classes should include user-stated, user-approved, imported, observed, tool-produced, and model-inferred. Model-inferred content must remain visibly inferred and must not silently become user-approved memory.

Confidence is not truth and must be accompanied by method/version and source context where available. Conflicting assertions may coexist. Retrieval should surface conflict rather than silently selecting one.

## 5. Temporal model

Use two time axes where the domain requires them:

- **Valid time:** when the assertion applies in the world.
- **Transaction time:** when Engram recorded, changed status, or superseded it.

All timestamps use UTC. Use explicit intervals and null semantics; avoid overwriting a past assertion when new evidence changes the current view. Event time and ingestion time are distinct.

## 6. Domain mapping

| Domain | ERS representation | Domain-owned rules |
|---|---|---|
| Identity | user, agent, service, device entities; membership and identity relationships | authentication, lifecycle, identity proofing |
| Memory | memory entities; assertion/evidence links; approval and correction events | consent, retention, export, deletion, retrieval eligibility |
| Knowledge | concept/document entities; typed semantic relationships; evidence | ontology, entity resolution, contradiction handling |
| Reasoning | run entities; premise/conclusion assertions; model and tool events | provider routing, validation, budgets |
| Agents | agent entities; capability and delegation relationships | manifests, scopes, runtime binding |
| Tasks | task entities; dependency and assignment relationships; lifecycle events | scheduling, retries, cancellation, approvals |
| Integrations | integration/device entities; external references; ingestion events | credentials, scopes, webhook validation |
| Presence | view state and user interaction events; derived geometry references | rendering, accessibility, interaction |

A conversation message remains a domain record linked to its session/context and events. It is not automatically a durable memory or a knowledge assertion.

## 7. Storage architecture

Start with a modular D1 implementation, not a premature graph database or microservice split.

Proposed logical persistence groups:
- `ers_entities`
- `ers_relationships`
- `ers_events`
- `ers_contexts`
- `ers_assertions`
- `ers_evidence`
- `ers_authority_grants`
- `ers_approvals`
- domain tables for memories, tasks, agent runs, sessions, integrations, and identity

These are a target vocabulary, **not an instruction to create every table immediately**. Before migrations, design constraints, indexes, tenant model, deletion semantics, and data backfill. Existing Better Auth `user`, `users`, `ai_sessions`, `messages`, and `memories` tables must be reconciled through additive migrations and compatibility adapters. No destructive rename or implicit ownership change.

Repositories should expose typed operations (for example `createEntity`, `assertRelationship`, `appendEvent`, `recordEvidence`, `checkAuthority`) and enforce tenant filters centrally. Domain services remain responsible for business validation.\n\n**Implemented first slice:** `server/src/db/migrations/0003_ers_events.sql` defines the event table and tenant/time indexes. `server/src/ers/d1-events.ts` provides append and paginated list operations. The adapter currently accepts only authenticated personal-user scopes using `personal:<user-id>` tenant IDs; it rejects workspace scopes and delegated-agent actors until membership and authority resolution exist. Event types are registry-checked, timestamps must be canonical UTC ISO strings, payloads are limited to 16 KiB, and the adapter exposes no update/delete operation. The migration has not been applied to any remote D1 database.

## 8. E8 mathematical representation

E8 is a genuine mathematical structure, not a metaphorical label for an arbitrary 8D graph.

The standard E8 root system has 240 roots in eight-dimensional Euclidean space. Under the conventional normalization, roots have squared length 2. The E8 lattice is a discrete subset of `R^8`; the root system is not the whole lattice.

ERS must not:
- claim every graph node is an E8 root;
- assign the 240 roots one-to-one to all entities;
- treat semantic similarity as mathematical adjacency without validation;
- make E8 coordinates authoritative identifiers or facts.

Proposed derived pipeline:
1. Select an authorized, bounded ERS subgraph for a user and a specific context.
2. Build a versioned feature representation from typed relations, temporal signals, evidence, and domain metadata.
3. Compute or retrieve a learned/engineered embedding.
4. Map the representation into an eight-dimensional working space using a documented, versioned transform.
5. Evaluate E8-informed quantization, root-neighborhood, or symmetry-preserving layouts as **candidate visualization methods**, measuring distortion and stability.
6. Project the result into a 2D/3D view (for example, a Coxeter-plane projection or another documented projection).
7. Store only derived coordinates/layout metadata with algorithm version, source snapshot, and invalidation key.

The first prototype should compare at least:
- ordinary force-directed graph layout;
- generic 8D embedding followed by projection;
- E8-informed lattice/root-neighborhood layout.

Evaluate neighborhood preservation, relationship-type legibility, temporal stability, collision rate, interaction latency, and user comprehension. If E8 does not improve a measured property, keep it as an optional visual mode rather than forcing it into retrieval or storage.

The same authorized ERS query can feed both the Knowledge Graph and E8 Presence, but the graph query and rendering pipeline remain separate systems with separate caches and failure modes.

## 9. Query and authorization flow

1. Authenticate the caller and resolve tenant membership.
2. Resolve principal and request context.
3. Check policy before fetching protected records.
4. Query domain repositories with tenant and scope constraints.
5. Return provenance-bearing results and explicit conflict states.
6. For visualization, pass only authorized, minimized graph data to the projection service.
7. Record sensitive reads, mutations, approvals, and executions in the audit stream where policy requires.

Never rely on client-supplied tenant IDs, entity IDs, or E8 coordinates as proof of access. A visual node click must resolve back to a server-authorized entity query.

## 10. Initial implementation sequence

1. Define shared TypeScript contracts and predicate/type registries without changing current persistence.
2. Add ERS repository interfaces and tenant-aware authorization boundary.
3. Extend the initial append-only event slice with automated D1 repository tests, then add assertion/evidence persistence.
4. Adapt existing memory records as ERS entities/assertions while preserving current API behavior.
5. Add relationship query endpoints and tests for cross-tenant isolation.
6. Add task/agent event integration only after authority and approval semantics are tested.
7. Build an offline E8 geometry prototype against synthetic and anonymized sample graphs; compare against baseline layouts.
8. Integrate E8 Presence only after projection quality, performance, accessibility, and privacy behavior are validated.

## 11. Acceptance criteria

- A stable entity can be referenced consistently across domains and providers.
- Relationships are typed, tenant-scoped, provenance-bearing, and temporally inspectable.
- Events are append-only and distinguish actor, occurrence, and ingestion time.
- Assertions preserve evidence, uncertainty, contradiction, and correction history.
- Authority is independently checked; semantic relationships never grant permissions.
- Existing memory and conversation behavior remains compatible during migration.
- Cross-tenant tests prove that IDs cannot be used to retrieve or mutate another tenant's data.
- E8 geometry is versioned and reproducible, and does not become canonical storage.
- A baseline comparison demonstrates whether E8-informed layout provides measurable value.
- No deployment or remote D1 migration is performed as part of this architecture decision.
