# ADR: Engram Intelligence as the Primary Intelligence Capability

- **Date:** 2026-11-10
- **Status:** Accepted architectural direction; implementation in progress
- **Decision owner:** Engram platform
- **Company direction:** Revenant A.I. LLC is the company designated by the user to develop and steward Engram. Current legal standing and state qualification are outside this software decision and must be verified separately.
- **Related:** [Platform architecture](../architecture/ENGRAM_PLATFORM.md), [Relational Substrate](../architecture/RELATIONAL_SUBSTRATE.md), [Integration boundaries](../architecture/INTEGRATIONS.md), [Sakana Fugu admission gate](2026-11-10-sakana-fugu-admission-gate.md)

## Context

Engram must provide continuity across conversations, models, tools, agents, and devices. A model endpoint alone does not provide durable identity, canonical memory, authority, or reliable continuity. Those responsibilities remain under Engram's control.

The prior ADR used the name "Sakanafugu" after incorrectly conflating the user's reference to Sakana AI and its Fugu product. That name is not an Engram component. The product and architectural name is **Engram Intelligence**.

## Decision

Engram Intelligence is the primary user-facing intelligence capability and its canonical principal is owned by Engram.

Engram Intelligence:
- receives and interprets user requests;
- assembles authorized context from Engram Identity, Memory, Knowledge, and project state;
- reasons through replaceable model/provider adapters;
- invokes Engram Orchestration when work requires durable tasks or delegation;
- requests and exercises only authority granted by Engram policy;
- returns responses and proposed actions through Engram Presence;
- may propose memories or assertions, but cannot silently promote model inference into user-approved truth.

Engram owns the durable principal, session continuity, canonical memory, provenance, knowledge, authority grants, task history, approvals, provider policy, and audit records. The principal cannot grant itself permissions.

## External provider boundary: Sakana AI Fugu

Sakana AI and Fugu are external company/product names. They are not the name, identity, or control plane of Engram Intelligence.

The public Sakana AI API Terms reviewed on 2026-11-10 prohibit use of the API service to develop or provide competing AI services and prohibit submitting personal information. Its privacy policy also describes possible use of service interaction data for model training/fine-tuning and does not specify a fixed universal retention period. These terms create a material conflict with Engram's intended product and data model.

Therefore, Fugu is **not admitted as an Engram provider** at this time. Do not implement, invoke, or use Fugu for Engram product development, and do not send Engram user, project, or memory data, unless Revenant A.I. LLC obtains written permission or an enterprise agreement that expressly resolves the intended product use and required data protections. See the separate admission-gate ADR.

## Provider boundary

Anthropic is the currently implemented provider adapter. OpenAI is a candidate, not an implemented integration in this decision. A production adapter must use the provider's supported API, server-side credentials, explicit timeout and token limits, bounded retries, usage accounting, and a direct-provider fallback where configured.

Do not equate a model name, model version, API key, provider conversation ID, or provider account with the canonical identity of Engram Intelligence. Provider changes must not erase or redefine Engram's identity or memory.

## Identity and runtime model

Represent Engram Intelligence as an Engram-owned agent/principal with:
- a stable opaque principal ID;
- a tenant-scoped identity and lifecycle;
- a versioned behavior and instruction configuration reference;
- an explicit capability ceiling;
- explicit provider/model bindings and routing policy;
- memory and knowledge access mediated by Engram authorization;
- durable task, event, and audit references.

A capability ceiling is not itself an authority grant. Current authorization must be checked at the time of every protected read, delegation, or action. Provider credentials are resolved only from server-side secret bindings and never stored in principal configuration.

## Request lifecycle

1. Authenticate the human caller and derive tenant scope from trusted server context.
2. Resolve the active Engram Intelligence principal and its configuration.
3. Load only context that caller and principal are authorized to access.
4. Apply consent, sensitivity, retention, and provider data policies.
5. Select an approved provider/model and bounded inference budget.
6. Treat provider output and proposed tool calls as untrusted data.
7. For actions, create a durable task and check authority, risk, and approval requirements.
8. Execute through an Engram-controlled adapter with scoped credentials and sandboxing.
9. Record relevant events, provenance, outputs, and approvals.
10. Present the result; require approval for actions classified as approval-required.
11. Persist new memory only under explicit policy and consent, preserving provenance and correction paths.

## Invariants

- Engram owns canonical identity and continuity; providers do not.
- Model context is not canonical memory.
- A model output is not an authorization decision.
- Conversational instructions cannot grant authority by themselves.
- No unrestricted tool, account, filesystem, network, or integration access.
- User-approved memory remains distinguishable from user-stated, imported, observed, tool-produced, and model-inferred information.
- Provider changes must not erase or redefine Engram Intelligence identity.
- The user can inspect, correct, export, and delete eligible stored information under Engram's data controls.
- Provider selection, model version, prompt/config version, and inference trace are recorded where appropriate, without storing secrets.

## Implementation sequence

1. Correct the prior principal name and preserve migration history with an additive migration.
2. Integrate the principal into authenticated server context using a trusted tenant-resolution rule.
3. Add tests for principal persistence, tenant isolation, malformed stored configuration, and capability-ceiling validation.
4. Implement provider adapters only after data, cost, contract, and policy admission.
5. Integrate session continuity and consent-aware memory retrieval/persistence.
6. Route tool requests through durable tasks, policy checks, approvals, and audited runtime adapters.
7. Expose Engram Intelligence state through E8 Presence using derived, authorized ERS views.

No remote deployment, production secret configuration, or remote D1 migration is authorized by this ADR.
