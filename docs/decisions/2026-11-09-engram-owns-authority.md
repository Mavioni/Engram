# ADR: Engram owns authoritative identity, memory, and policy

- Status: Accepted
- Date: 2026-11-09

## Decision

Engram owns canonical user and agent identity, memory, knowledge provenance, task state, authorization, approvals, and audit history. External providers and runtimes are replaceable execution or inference dependencies.

## Consequences

- Runtime-specific IDs are mapped to stable Engram IDs.
- Runtime changes do not destroy identity or canonical memory.
- Every external action is authorized through Engram policy.
- Imported data requires provenance, source attribution, and consent basis.
