# Engram Platform Architecture

**Status:** Target architecture baseline  
**Decision posture:** Cloud-first; candidate technologies remain subject to source, license, security, and operational audits.

## 1. System responsibility

Engram is the authoritative intelligence and coordination platform. It provides persistent identity and a user experience across models, agent runtimes, devices, and clients.

Engram—not an external runtime—owns user and agent identity, canonical memory and knowledge provenance, task lifecycle and approvals, authorization policy, provider selection and cost policy, and audit records.

External technologies may provide inference, execution, device capture, or workstation capabilities behind replaceable interfaces.

## 2. Logical architecture

    ENGRAM CLIENTS
    Mobile / Web / Workstation / OMI
                  |
             ENGRAM CLOUD
                  |
       API Gateway + Authentication
                  |
          ENGRAM INTELLIGENCE
                  |
      +-----------+------------+
      |           |            |
   IDENTITY     MEMORY      REASONING
      |           |            |
      +-----------+------------+
                  |
         ENGRAM ORCHESTRATION
                  |
      Policy / Tasks / Approvals
                  |
          ENGRAM RUNTIME API
                  |
       +----------+-----------+
       |          |           |
    OpenClaw     OSA       Other runtimes
    adapter   adapter       / adapters

Cross-cutting: tenant isolation, secrets, audit, observability,
cost controls, provenance, backups, retention, deletion, governance.

## 3. Domains

### Engram Intelligence
Owns conversational experience, request interpretation, context assembly, response synthesis, and routing into memory, reasoning, and orchestration. The current IRIS feature is a legacy implementation of part of this domain; migrate naming and contracts incrementally.

### Engram Identity
Owns stable identities and lifecycle for users, agents, service identities, devices, and integrations. Identity survives model and runtime changes.

### Engram Memory
Owns canonical durable records and provenance. Runtime transcripts, provider logs, device caches, and local files are not canonical memory unless ingested and validated.

Memory distinguishes observed facts, user-stated facts, inferences with confidence and provenance, user-approved self-model details, operational events, and imported references with source attribution. Memory supports inspection, correction, export, retention, and deletion.

### Engram Knowledge
Owns entities, relationships, evidence, and graph queries. It may use relational, graph, and vector technologies behind repository-owned interfaces.

### Engram Reasoning
Owns provider abstraction, routing policy, model selection, fallback, budget enforcement, structured-output validation, and inference tracing. Anthropic is the current provider implementation. OpenRouter and direct providers are candidates. Sakana Fugu is a candidate coordination service, not a mandatory dependency.

### Engram Orchestration
Owns task graphs, scheduling policy, delegation, approvals, retries, cancellation, and recovery. It decides what may execute and under what authority.

### Engram Runtime
Provides versioned adapters for execution engines. OpenClaw is the primary runtime candidate to audit. OSA may contribute specialized workflows. OpenCoven informs identity, session, governance, and coordination design. Avoid duplicate schedulers, agent registries, or permission systems without a demonstrated need.

### Engram Integrations
Owns external connection registry, scopes, credential references, event ingestion, and adapter lifecycle. OMI devices, messaging channels, external APIs, and workstation endpoints connect here.

### Engram Presence
Owns the coherent conversational and visual experience across mobile and web. A future 3D presence is an interface feature, not a separate intelligence authority.

## 4. Cloud-first deployment

Core services and canonical state are hosted. User devices are not required to remain online for background work to continue.

- Engram Cloud: identity, memory, reasoning, orchestration, task state, audit, and API.
- Engram Mobile / Web: primary clients.
- Engram Workstation: optional desktop endpoint; Omarchy may be a supported base/profile.
- OMI endpoints: optional capture and device interfaces.
- Local state: cache, temporary offline drafts, and explicitly authorized endpoint execution only.

OpenCoven's local-first design and OpenClaw's deployment model must be verified against remote execution and isolation requirements before adoption.

## 5. Primary request flow

1. Client authenticates to Engram.
2. Gateway resolves tenant, user, session, and request limits.
3. Intelligence loads only authorized context.
4. Memory and Knowledge retrieve provenance-bearing records.
5. Reasoning selects a model/provider under policy and budget.
6. Orchestration creates a durable task if action is required.
7. Policy checks scopes, risk, approvals, and execution budget.
8. Runtime adapter dispatches a bounded execution envelope.
9. Runtime returns structured events and artifact references.
10. Engram validates and records results, audit events, and approved memory updates.
11. Client receives response and durable task status.

## 6. Initial implementation strategy

Do not split every logical domain into a separate microservice immediately. Start with a modular cloud application and explicit internal contracts. Extract independently deployable services only when scaling, security isolation, or operational ownership requires it.

The first vertical slice should be authentication/tenant isolation, conversation, persistent session, memory provenance, one inference adapter, and audit. Governed agent execution follows only after threat modelling and sandbox design.

## 7. Explicit non-goals

- Rebuilding a Linux distribution or wearable ecosystem.
- Making one model provider or agent runtime mandatory.
- Treating model context windows or runtime session files as canonical memory.
- Promising unlimited hosted inference.
- Giving agents unrestricted host, filesystem, network, or account access by default.
