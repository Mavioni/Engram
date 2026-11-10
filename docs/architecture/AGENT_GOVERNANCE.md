# Agent Governance and Authority

## Principle

An agent identity is persistent. Its authority is contextual, scoped, time-limited, auditable, and revocable.

## Engram retains authority

Engram is the source of truth for agent identity and lifecycle, principal and tenant association, capability grants and policy, task ownership and delegation lineage, approval evidence, and audit records.

A runtime may execute an action but cannot grant itself authority or become the source of truth for agent identity.

## Execution grant

Every runtime dispatch is bounded by an execution grant containing:
- Tenant, project, task, and agent IDs.
- Initiating principal and delegation lineage.
- Allowed tools and resource scopes.
- Allowed actions such as read, write, execute, publish, delete, or deploy.
- Expiry, rate limits, and cost/budget ceiling.
- Required approval state.
- Input artifact references and integrity metadata.
- Correlation and idempotency identifiers.

Agents cannot delegate more authority than they hold. Grants expire and can be revoked.

## High-impact actions

Require explicit user authorization and, where configured, an approval gate for external publication or messaging, financial commitments, destructive changes, production deployments, credential changes, permission changes, and sensitive-data access.

## Untrusted inputs

Treat prompts, retrieved documents, websites, emails, code, skills, plugins, MCP servers, tool outputs, and device data as untrusted. Defend against prompt injection, confused-deputy behavior, secret exfiltration, tool escalation, and cross-tenant leakage.

## Isolation

Execution uses sandboxed workspaces with explicit filesystem, process, network, and device permissions. No unrestricted host access by default.

## Audit trail

Record principal, agent identity, runtime and version, task, scopes, approvals, timestamps, artifact references, external side effects, and outcome. Logs must avoid leaking secrets and sensitive payloads.

## Agent coordination

Engram Orchestration owns task assignment, resource claims, conflict handling, handoffs, and recovery. Runtime-native coordination may be used behind the adapter but must not silently override Engram policy.
