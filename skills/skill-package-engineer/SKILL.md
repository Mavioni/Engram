---
name: skill-package-engineer
version: 0.1.0
status: specification
---

# Skill Package Engineer

## Purpose
Create, review, version, test, and maintain reusable Engram skill packages without treating prompts as executable capabilities.

## Trigger
Use when adding or changing an Engram skill, plugin adapter, agent procedure, or tool workflow.

## Required inputs
- Capability requirement and user value.
- Available tools and their schemas.
- Required permissions and data access.
- Test cases and failure conditions.

## Procedure
1. Define one bounded capability and its activation conditions.
2. Document required inputs, outputs, and unavailable dependencies.
3. Specify permission checks and approval gates.
4. Separate reasoning instructions from executable tools and runtime code.
5. Add positive, negative, adversarial, and regression tests.
6. Version the package and record provenance.
7. Verify that the skill cannot claim an action succeeded without tool evidence.
8. Review for overlap, privilege escalation, prompt injection, and data leakage.

## Output
A versioned skill package, test plan, and capability/permission declaration.

## Invariants
- A skill file does not add new model weights, tools, or system privileges.
- Never fabricate tool results or claim background execution.
- Never grant a skill broader authority than its caller.
- Every external side effect requires the appropriate user and runtime authorization.
