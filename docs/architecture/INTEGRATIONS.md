# Integration Boundaries and Candidate Assessment

This is a candidate register, not a record of completed integrations.

| Candidate | Potential value | Engram-owned boundary | Required validation / status |
|---|---|---|---|
| OpenClaw | Agent runtime, gateway, tools, channels, device connectivity | Engram Runtime adapter; Engram retains task/policy/memory authority | Cloud deployment, sandboxing, scopes, events, sessions, secrets, license, maturity |
| OpenCoven | Agent identity contracts, durable sessions, governance and resource coordination | Engram Identity, Orchestration and Governance contracts | Exact project/license boundaries, local-first assumptions, cloud operation, protocol stability |
| OMI | Wearable capture, connected-device and application ecosystem | Engram Integrations and device identity; Engram owns canonical data | Upstream identity, APIs, data handling, consent, auth, license, deployment |
| Omarchy | Agent-friendly Linux desktop and developer workstation | Optional Engram Workstation profile | Distribution maintenance, device support, desktop-agent permission boundaries |
| Businesses-Manager / OSA | Existing orchestration, workflows, memory and business operations | Selective adapters/modules, not a second platform control plane | Coupling, license, cloud readiness, authorization, secrets, tests, upstream divergence |
| Project-Engram | Existing product and interface concepts | Feature-level reuse only after review | Local-first assumptions, license compatibility, data model and UX migration |
| Sakana AI Fugu | External multi-agent model/service | **Blocked**; no Engram provider adapter or product-development use until written authorization and revised/enterprise terms | Competing-service restriction, personal-data prohibition, prompt/output handling, model-improvement/training terms, retention/deletion, pricing, quotas, subprocessors, international transfers |
| OpenRouter | Model/provider routing | Optional Engram Reasoning provider adapter | Provider/model availability, pricing, data policy, limits, fallback |
| Meta TRIBE v2 | Neuroscience research | Research boundary only | Scientific relevance, compute, license and commercial permissions |
| BitNet | Efficient low-bit inference | Optional future inference optimization | Workload fit, quality, hardware economics and maintenance |

## Sakana AI Fugu admission gate — BLOCKED

Sakana AI is a Tokyo-based external AI company; Fugu is its multi-agent model/service. The published Sakana AI API Terms of Service reviewed on 2026-11-10 are a material blocker for Engram:

- The Terms, effective 2026-09-28, prohibit use of the service to develop or provide a product/service that competes with the service, including an AI service or API.
- The same Terms prohibit inputting personal information about the user or a third party.
- The Terms state that Sakana is not obligated to retain input/output content and may not be obligated to delete trained model weights, vendor caches, or audit logs.
- The API Privacy Policy, last updated 2026-07-21, says prompts, uploaded content, outputs, interaction/session data and other information may be processed to operate and improve the service, including model training/fine-tuning, subject to available opt-out controls and internal processes. It also describes international transfers and retention based on operational/legal needs.

Engram is itself an AI platform and its memory/context is expected to contain personal and potentially confidential data. The public terms therefore create a potential contractual and data-governance conflict. This is an engineering admission gate, not a legal conclusion.

**Do not create an Engram Fugu adapter, send user or project data to Fugu, or rely on Fugu during Engram development until Revenant A.I. LLC has obtained written authorization or an enterprise agreement that expressly permits the intended product-development use and establishes acceptable data processing, retention/deletion, training controls, security, subprocessors, and liability terms.** The contracting entity and authority to sign must be verified before accepting terms.

Official references:
- [Sakana AI API Terms of Service](https://console.sakana.ai/terms-of-service)
- [Sakana AI API Privacy Policy](https://console.sakana.ai/privacy-policy)
- [Sakana AI API Pricing](https://console.sakana.ai/pricing)
- [Sakana AI company information](https://sakana.ai/company-info/)

The API is paid. At review, the published subscription tiers were Standard $20/month, Pro $100/month, and Max $200/month; pay-as-you-go token pricing is model-specific and scheduled to change for some Fugu models. These rates are a snapshot, not a cost estimate or commitment. No account, API key, subscription, or request has been created for Engram.

## Adapter admission requirements

Every candidate needs a documented interface and version strategy, authentication and authorization model, data-flow and retention description, tenant/project isolation, timeouts and quotas, cancellation/retry behavior, audit mapping, license/dependency review, security assessment, and exit plan.

## Design rule

Use an external project where it removes meaningful engineering work without surrendering Engram's authoritative state or creating unbounded coupling. Do not integrate overlapping orchestration systems by default.
