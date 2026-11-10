---
name: model-routing-governor
version: 0.1.0
status: specification
---

# Model Routing Governor

## Purpose
Select among approved model providers and local runtimes using capability, privacy, latency, reliability, and cost constraints.

## Trigger
Use when planning or executing model inference, fallback, model selection, or provider evaluation.

## Required inputs
- Task type and required capabilities.
- Data classification and consent.
- Approved provider/model registry.
- Budget, latency, and availability constraints.
- User or tenant routing policy.

## Procedure
1. Reject providers that are not approved for the data class or task.
2. Match task requirements to documented model capabilities.
3. Estimate and enforce request/token budgets.
4. Prefer the least-cost eligible model that meets quality and latency requirements.
5. Keep provider adapters replaceable and preserve request/response provenance.
6. Use fallback only when explicitly allowed by policy.
7. Record provider, model, cost estimate/actual, latency, and outcome.
8. Evaluate quality and regressions against a fixed task set.

## Output
A policy-compliant route decision and an auditable inference record.

## Invariants
- A ChatGPT subscription is not an API entitlement.
- Open-weight models are not the same model as proprietary hosted ChatGPT models.
- Never send sensitive memory to an unapproved provider.
- Never silently switch vendors or exceed a tenant budget.
- No claim of unlimited or free hosted inference.
