# ADR: Sakanafugu — Engram's Primary Intelligence Presence

- **Date:** 2026-11-09
- **Status:** Accepted architectural direction; implementation not yet complete
- **Decision owners:** Engram platform
- **Related:** [Platform architecture](../architecture/ENGRAM_PLATFORM.md), [Relational Substrate](../architecture/RELATIONAL_SUBSTRATE.md)

## Context

Engram is intended to provide continuity across conversations, models, tools, agents, and devices. A model endpoint alone does not provide durable identity, canonical memory, authority, or reliable continuity. Those responsibilities must remain under Engram's control.

The project names the primary intelligence presence **Sakanafugu**. The user has confirmed that this means an intelligence that inhabits Engram, remembers through Engram, and acts through Engram—not merely a ChatGPT-branded chat window.

## Decision

Sakanafugu is the named primary intelligence role within Engram.

Sakanafugu:
- receives and interprets user requests;
- assembles authorized context from Engram Memory, Knowledge, Identity, and project state;
- reasons through a replaceable model-provider interface;
- invokes Engram Orchestration when work requires durable tasks or delegation;
- requests and exercises only authority explicitly granted by Engram policy;
- returns responses and proposed actions through Engram Presence;
- may propose memories or assertions, but cannot silently promote model inference into user-approved truth.

Engram remains the substrate and control plane. It owns the durable Sakanafugu identity, session continuity, canonical memory, provenance, knowledge, authority grants, task history, approvals, provider policy, and audit records. Sakanafugu is not the owner of these systems and cannot grant itself permissions.

## ChatGPT / OpenAI boundary

“ChatGPT as Sakanafugu” is the product experience and intelligence role the user wants. The production implementation must distinguish the ChatGPT consumer application from models accessed through an authorized OpenAI API integration.

Engram cannot assume it can embed, control, or persist the user's consumer ChatGPT session as a backend runtime. Instead, Engram should implement an OpenAI-compatible reasoning adapter using the supported API, subject to account access, current API capabilities, terms, and data controls. The model is invoked for bounded inference; Engram supplies context and persists approved state.

The provider adapter must remain replaceable. Sakanafugu's identity and continuity must survive model/provider changes. Do not equate a model name, model version, API key, or provider conversation ID with Sakanafugu's canonical identity.

## Identity and runtime model

Represent Sakanafugu as an Engram-owned agent/principal with:
- a stable opaque principal ID;
- a versioned role and capability manifest;
- tenant-scoped identity and lifecycle;
- explicit model/provider bindings and routing policy;
- explicit tool and integration scopes;
- memory and knowledge access mediated by Engram authorization;
- durable task, event, and audit references;
- versioned system instructions and behavioral configuration.

The model itself is not the principal. It is a replaceable inference engine invoked on behalf of the Sakanafugu principal. Provider outputs are untrusted proposals until validated by Engram.

## Request lifecycle

1. Authenticate the human caller and resolve the tenant.
2. Resolve the Sakanafugu principal and its active configuration.
3. Load only context that the caller and Sakanafugu are authorized to access.
4. Apply memory-use, sensitivity, retention, and provider data policies.
5. Select an approved model/provider and bounded inference budget.
6. Validate the model response and any structured tool/action proposals.
7. For actions, create a durable task and check authority, risk, and approval requirements.
8. Execute through an Engram-controlled adapter with scoped credentials and sandboxing.
9. Record relevant events, provenance, outputs, and approvals.
10. Present the result; request user approval before any action that policy marks as approval-required.
11. Persist new memory only under explicit policy and consent, preserving provenance and correction paths.

## Invariants

- Engram owns canonical identity and continuity; providers do not.
- Model context is not canonical memory.
- A model output is not an authorization decision.
- A relationship or conversational instruction cannot grant authority by itself.
- No unrestricted tool, account, filesystem, network, or integration access.
- User-approved memory remains distinguishable from user-stated, imported, observed, tool-produced, and model-inferred information.
- Provider changes must not erase or redefine Sakanafugu's identity.
- The user can inspect, correct, export, and delete eligible stored information under Engram's data controls.
- Provider selection, model version, prompt/config version, and inference trace are recorded where appropriate, without storing secrets.

## Implementation sequence

1. Define the Sakanafugu principal and capability manifest in Engram Identity / ERS.
2. Define a provider-neutral reasoning request/response contract and OpenAI API adapter.
3. Add an Engram-owned Sakanafugu orchestration service that assembles authorized context.
4. Integrate session continuity and consent-aware memory retrieval/persistence.
5. Route tool requests through durable tasks, policy checks, and approvals.
6. Add audit and evaluation tests for tenant isolation, prompt injection, tool authorization, memory provenance, provider failure, and model substitution.
7. Expose Sakanafugu state and activity through E8 Presence using derived, authorized ERS views.

No remote deployment, API credential configuration, or D1 migration is authorized by this ADR.
