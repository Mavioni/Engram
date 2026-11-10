# Engram Platform Architecture

**Status:** Target architecture baseline  
**Decision posture:** Cloud-first; candidate technologies remain subject to source, license, security, privacy, and operational audits.

## 1. System responsibility

Engram is the authoritative intelligence and coordination platform. **Engram Intelligence** is its primary user-facing intelligence capability: a coherent Engram-owned service and agent principal that interprets requests, assembles authorized context, reasons through replaceable providers, and coordinates approved work through Engram.

Engram—not an external model provider or runtime—owns user and agent identity, canonical memory and knowledge provenance, task lifecycle and approvals, authorization policy, provider selection and cost policy, and audit records. No model, provider account, or external agent platform is the canonical identity of Engram Intelligence.

External technologies may provide inference, multi-model coordination, execution, device capture, or workstation capabilities behind replaceable interfaces.

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

Owns conversational experience, request interpretation, context assembly, response synthesis, and routing into memory, reasoning, and orchestration. It is an Engram-owned capability and principal—not the identity of any model vendor. The current IRIS feature is a legacy implementation of part of this domain; migrate naming and contracts incrementally.

### Engram Identity

Owns stable identities and lifecycle for users, agents, service identities, devices, and integrations. Identity survives model and runtime changes. The primary Engram Intelligence principal has a stable Engram-issued ID, tenant scope, lifecycle status, versioned behavior configuration, and capability ceiling. Runtime authorization must still be evaluated against current grants; a capability ceiling does not itself confer authority.

### Engram Memory

Owns canonical durable records and provenance. Runtime transcripts, provider logs, device caches, and local files are not canonical memory unless ingested and validated.

Memory distinguishes observed facts, user-stated facts, inferences with confidence and provenance, user-approved self-model details, operational events, and imported references with source attribution. Memory supports inspection, correction, export, retention, and deletion.

### Engram Knowledge

Owns entities, relationships, evidence, and graph queries. It may use relational, graph, and vector technologies behind repository-owned interfaces.

### Engram Reasoning

Owns provider abstraction, routing policy, model selection, fallback, budget enforcement, structured-output validation, and inference tracing. Anthropic is the current implemented provider adapter. OpenAI and Sakana AI Fugu are candidate adapters, not yet implemented here.

Sakana AI is a Tokyo-based AI company. Its Fugu product is described by Sakana AI as a multi-agent system delivered through a single model/API. If admitted, Fugu sits behind an Engram Reasoning adapter as an external inference/coordination provider. It is not Engram's primary intelligence identity, canonical memory, authorization authority, task ledger, or control plane. Before sending non-public user data to it, validate contractual terms, data handling/retention, provider-pool controls, pricing, quotas, latency, and fallback behavior. Do not hard-code Engram's state machine to Fugu-specific semantics.

### Engram Orchestration

Owns task graphs, scheduling policy, delegation, approvals, retries, cancellation, and recovery. It decides what may execute and under what authority. A provider that internally coordinates models does not replace Engram's durable task ledger or authorization checks.

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
3. Engram resolves the active Engram Intelligence principal and its approved configuration.
4. Memory and Knowledge retrieve provenance-bearing records under user and tenant authorization.
5. Reasoning selects an approved model/provider under data policy and a bounded budget.
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
