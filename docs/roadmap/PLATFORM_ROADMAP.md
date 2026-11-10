# Engram Platform Roadmap

## Phase 0 — Source and requirements audit
- [ ] Verify upstream repository identities, licenses, branches, and active status.
- [ ] Audit OpenClaw runtime, gateway, permissions, sessions, tools, and remote deployment.
- [ ] Audit OpenCoven contracts, session/governance model, repository boundaries, and cloud suitability.
- [ ] Audit OSA implementation and coupling to Businesses-Manager.
- [ ] Audit OMI upstream and device/capture interfaces.
- [ ] Assess Omarchy as an optional workstation endpoint.
- [ ] Validate Fugu and OpenRouter APIs, costs, privacy, terms, and fallback.
- [ ] Produce a scored capability, risk, and license matrix.

## Phase 1 — Platform contracts and threat model
- [ ] Define Engram user, agent, service, and device identity.
- [ ] Define tenant and project isolation.
- [ ] Define memory schema, provenance, consent, retention, correction, export, and deletion.
- [ ] Define task lifecycle, events, idempotency, retries, cancellation, and approvals.
- [ ] Define inference provider adapter and structured output contract.
- [ ] Define runtime adapter and conformance tests.
- [ ] Complete threat model and data-flow review.

## Phase 2 — Secure cloud foundation
- [ ] Enforce authentication on all protected endpoints.
- [ ] Implement authorization and tenant-scoped data access.
- [ ] Add rate limits, abuse controls, secrets management, and audit.
- [ ] Establish durable task/session state and observability.
- [ ] Implement memory provenance and user data controls.

## Phase 3 — Intelligence vertical slice
- [ ] Evolve current conversation route into Engram Intelligence API.
- [ ] Add canonical persistent conversation/session model.
- [ ] Implement Engram Memory retrieval and write policy.
- [ ] Add provider-independent inference adapter.
- [ ] Add budget and usage controls.
- [ ] Preserve current reflection and assessment features within Engram.

## Phase 4 — Governed agent execution
- [ ] Implement task queue and scheduler.
- [ ] Implement runtime adapter contract and conformance suite.
- [ ] Prototype OpenClaw adapter after security review.
- [ ] Select OSA-derived capabilities only where they add distinct value.
- [ ] Implement sandboxed execution, scoped grants, approvals, and audit.
- [ ] Add agent coordination, resource claims, and conflict recovery.

## Phase 5 — Ecosystem clients and integrations
- [ ] Add OMI device/capture integration.
- [ ] Add optional Engram Workstation profile/environment based on Omarchy.
- [ ] Add further channels, APIs, and runtime adapters.
- [ ] Evaluate specialist reasoning coordination.

## Release gates

Each phase requires passing tests, security review, operational runbooks, cost estimates, rollback plans, and updated decision records. An upstream feature list is not evidence of an Engram integration.
