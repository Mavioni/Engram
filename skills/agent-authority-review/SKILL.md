---
name: agent-authority-review
version: 0.1.0
status: specification
---

# Agent Authority Review

## Purpose
Ensure agents and external runtimes act only within explicit, scoped, revocable authority granted by Engram and the user.

## Trigger
Use before enabling a tool, agent, workstation action, external runtime, or delegated task.

## Required inputs
- Requesting principal and tenant.
- Requested action and resource scope.
- User approval state.
- Tool/runtime identity and trust level.
- Data classification and execution environment.

## Procedure
1. Authenticate the principal and resolve tenant scope server-side.
2. Check an explicit authority grant for the exact action and resource.
3. Apply least privilege, time limits, and resource limits.
4. Require user approval for consequential or irreversible actions.
5. Execute in a sandbox with scoped filesystem, network, and secret access.
6. Record request, grant, approval, execution, result, and revocation events.
7. Validate outputs before they affect canonical memory or external systems.
8. Revoke or expire grants when the task completes or risk changes.

## Output
An allow / deny / require-approval decision with rationale and an auditable execution envelope.

## Invariants
- Authentication is not authorization.
- Capability ceilings are not a substitute for runtime grants.
- No unrestricted shell, filesystem, browser, or network authority by default.
- No secret exposure in prompts, logs, or generated artifacts.
- No autonomous external action without the required authority and approval.
