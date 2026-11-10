# Integration Boundaries and Candidate Assessment

This is a candidate register, not a record of completed integrations.

| Candidate | Potential value | Engram-owned boundary | Required validation |
|---|---|---|---|
| OpenClaw | Agent runtime, gateway, tools, channels, device connectivity | Engram Runtime adapter; Engram retains task/policy/memory authority | Cloud deployment, sandboxing, scopes, events, sessions, secrets, license, maturity |
| OpenCoven | Agent identity contracts, durable sessions, governance and resource coordination | Engram Identity, Orchestration and Governance contracts | Exact project/license boundaries, local-first assumptions, cloud operation, protocol stability |
| OMI | Wearable capture, connected-device and application ecosystem | Engram Integrations and device identity; Engram owns canonical data | Upstream identity, APIs, data handling, consent, auth, license, deployment |
| Omarchy | Agent-friendly Linux desktop and developer workstation | Optional Engram Workstation profile | Distribution maintenance, device support, desktop-agent permission boundaries |
| Businesses-Manager / OSA | Existing orchestration, workflows, memory and business operations | Selective adapters/modules, not a second platform control plane | Coupling, license, cloud readiness, authorization, secrets, tests, upstream divergence |
| Project-Engram | Existing product and interface concepts | Feature-level reuse only after review | Local-first assumptions, license compatibility, data model and UX migration |
| Sakana AI Fugu | External multi-agent model/service exposed through the Sakana API | Optional Engram Reasoning provider adapter; never canonical identity or task authority | Official API compatibility, account access, pricing, model-pool controls, data use/retention, quotas, latency, availability, terms, fallback |
| OpenRouter | Model/provider routing | Optional Engram Reasoning provider adapter | Provider/model availability, pricing, data policy, limits, fallback |
| Meta TRIBE v2 | Neuroscience research | Research boundary only | Scientific relevance, compute, license and commercial permissions |
| BitNet | Efficient low-bit inference | Optional future inference optimization | Workload fit, quality, hardware economics and maintenance |

## Sakana AI Fugu boundary

Fugu is a Sakana AI product, not an Engram subsystem. Its role is to provide an optional, replaceable inference/coordination endpoint behind the Engram Reasoning contract. Engram must continue to own user/agent identity, tenant authorization, memory, durable task state, approvals, usage budgets, and audit history.

No Fugu integration is considered complete until an adapter is implemented and tested, credentials are held server-side, per-request data is minimized, usage is metered, provider failures/timeouts are bounded, and a direct-provider fallback path is validated. Do not transmit sensitive or tenant-confidential memory before contractual and data-handling review.

## Adapter admission requirements

Every candidate needs a documented interface and version strategy, authentication and authorization model, data-flow and retention description, tenant/project isolation, timeouts and quotas, cancellation/retry behavior, audit mapping, license/dependency review, security assessment, and exit plan.

## Design rule

Use an external project where it removes meaningful engineering work without surrendering Engram's authoritative state or creating unbounded coupling. Do not integrate overlapping orchestration systems by default.
