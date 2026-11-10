# ADR: Execution engines integrate through replaceable adapters

- Status: Proposed
- Date: 2026-11-09

## Context

OpenClaw, OpenCoven, and OSA overlap in runtime, sessions, coordination, and governance capabilities. Selecting one as the entire platform would create unnecessary coupling and duplicate control planes.

## Proposed decision

Define a versioned Engram Runtime API. Evaluate each candidate against that contract and reuse only capabilities that pass cloud, security, license, and operational review. Engram Orchestration remains authoritative for task state and permissions.

## Consequences

- Runtime adapters require capability discovery and conformance tests.
- Runtime-specific limitations must be visible to orchestration.
- Local-first runtimes are not assumed to be cloud-native.
- Source reuse is gated by license and security review.
