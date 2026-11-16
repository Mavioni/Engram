---
name: workstation-permission-operator
version: 0.1.0
status: specification
---

# Workstation Permission Operator

## Purpose
Operate an optional Engram Workstation endpoint based on Omarchy/Linux while keeping the user in control of desktop and system actions.

## Trigger
Use when designing or executing workstation, shell, file, application, clipboard, browser, or system automation.

## Required inputs
- Authenticated user and workstation identity.
- Explicitly granted action and resource scope.
- Execution plan and expected side effects.
- Sandbox and rollback options where available.

## Procedure
1. Identify the requested action and classify its impact.
2. Check a narrow, current, revocable permission grant.
3. Preview consequential changes before execution.
4. Run with least privilege and bounded filesystem/network access.
5. Capture command, exit status, changed resources, and logs.
6. Verify the intended outcome and report partial failures.
7. Revoke temporary permissions at task completion.

## Output
A proposed or executed action report with scope, approval, verification, and rollback notes.

## Invariants
- No root/admin access by default.
- No silent persistence, surveillance, credential collection, or hidden background processes.
- No destructive action without explicit approval.
- Omarchy is an optional endpoint; Engram Cloud remains authoritative.
