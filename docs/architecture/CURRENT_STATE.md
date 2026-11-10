# Current Implementation Assessment

**Repository:** Mavioni/Engram  
**Branch reviewed:** master  
**Review basis:** repository source, package lock, Worker configuration, and D1 schema.  
**Note:** This assessment describes the reviewed baseline before the Engram Intelligence principal correction on branch `fix/engram-intelligence-identity`.

## Existing foundation

- Client: React, Vite, TypeScript, Capacitor.
- API: Cloudflare Workers with Hono.
- Persistence: Cloudflare D1.
- Authentication: Better Auth 1.6.9, using its native D1 binding support.
- Inference: Anthropic SDK behind the Engram Reasoning provider contract; Anthropic remains the only implemented provider adapter.

## Implemented platform slices

- Better Auth protocol endpoints are mounted at /api/auth/*.
- Protected API routes resolve the Better Auth session and fail closed with 401 when no authenticated session exists.
- Missing authentication configuration returns 503.
- /api/intelligence is the canonical route; /api/iris remains a compatibility route.
- Persistent memory is keyed directly to the canonical Better Auth user.id.
- Authenticated /api/memory endpoints support list, create, update, and soft-delete.
- All memory reads and mutations are scoped by the authenticated user ID; owner IDs are never accepted from request bodies.
- Memory records include type, source, provenance, optional confidence, expiry, and timestamps.
- Engram Intelligence can retrieve up to 20 non-expired user memories (bounded to 6,000 characters) only when the request explicitly sets `useMemory: true`; retrieved content is framed as untrusted reference data.
- Conversation sessions are created under the authenticated user, and client-supplied session IDs are accepted only when ownership is verified. New sessions are returned to clients.
- Engram Reasoning defines provider-neutral request, response, usage, and streaming-event contracts; Anthropic is isolated in its own adapter.
- The latest user turn and assistant response are persisted against the verified session.
- Model-inferred memories are not silently persisted. Existing memory provenance remains limited to user_stated, user_imported, and user_approved at the API boundary.
- D1 migration directory is explicitly configured as src/db/migrations.
- ERS now has initial shared TypeScript contracts for entities, assertions, relationships, evidence, contexts, events, principals, tenant scopes, authority grants, approvals, and paginated query results.
- ERS includes initial namespaced registries for entity types, predicates, event types, provenance kinds, and authority actions, plus confidence validation.
- ERS defines tenant-scoped repository interfaces for entities, assertions, relationships, evidence, events, contexts, authority grants, and a separate authorization service contract.

## Engram Intelligence principal correction

The prior branch contained a mistakenly named principal contract, repository, and unapplied migration for a component called "Sakanafugu". That name is not an Engram product or architecture element. The correction branch replaces the TypeScript contract and repository with Engram Intelligence terminology.

The existing migration 0004 is retained as historical migration input. New migration 0005 creates the canonical `engram_intelligence_principals` table, copies any existing rows into it, and removes the legacy table. This preserves an applied migration history if migration 0004 has already run. Migration 0005 is additive and has not been applied remotely by this change.

The new principal contract/repository is still an isolated identity slice. It is not yet called from the authenticated request lifecycle, does not yet establish a production tenant model, and must not be presented as a complete authorization service.

## ERS implementation boundary

The initial ERS slice is contracts and interfaces only. It does not yet provide complete D1 repositories for all ERS primitives, generic API endpoints, authorization enforcement, or an E8 projection implementation. The current personal-user ownership model is not yet a complete personal/workspace tenant model. Interfaces must be implemented and tested before they are treated as security controls.

## Remaining gaps and risks

- The chat client calls the configured cloud API origin, sends the expected transcript payload, retains the server-issued conversation session ID, and exposes a default-off explicit memory opt-in.
- Credentialed API CORS and Better Auth trusted origins accept local development origins plus an explicit comma-separated APP_ORIGINS deployment variable.
- Production BETTER_AUTH_URL and APP_ORIGINS must be configured before deployment; production CORS, cookie behavior, and trusted-origin settings still require smoke tests.
- Authentication establishes identity, not organization/project authorization or shared-workspace tenancy.
- The Engram Intelligence principal repository is not yet wired into authenticated request handling or the Intelligence route.
- Email verification and password-reset delivery are not configured; verification mail remains disabled.
- Engram Reasoning currently has only the Anthropic adapter. OpenAI routing and provider fallback are not yet implemented.
- Sakana AI Fugu is not admitted as a provider. Its published API terms create a potential conflict with Engram product development and prohibit inputting personal data. Do not implement or call it until written authorization or revised enterprise terms have been obtained and reviewed.
- Rate-limit enforcement remains a stub.
- Legacy profile mirroring can fail if an existing profile row has a conflicting email under a different ID; migration reconciliation is still needed.
- Memory retention, export, correction history, and account-erasure workflows remain incomplete.
- A Playwright client contract test mocks the Better Auth session and Intelligence endpoint, then checks transcript shape, session continuity, and explicit memory opt-in.
- GitHub Actions CI runs client typecheck/build/browser tests and a separate Cloudflare Worker typecheck; current branch CI must be checked independently.
- No remote D1 migration, backend deployment, or production smoke test is performed by the correction branch.

## Migration constraints

1. Preserve applied migration files; use additive follow-up migrations to change schemas.
2. Preserve existing reflection and assessment capabilities as Engram features.
3. Do not declare authorization, encryption, tenant isolation, or rate limiting complete based solely on dependencies or documentation.
4. Do not add external runtimes or providers before their audits and interface decisions.
5. The repository is licensed under GNU AGPL-3.0-only. Third-party dependencies retain their own licenses; review provenance and compatibility before incorporating external code. Network deployments of modified versions must provide users access to the corresponding source under AGPL section 13.
6. Do not treat ERS interfaces or E8-derived coordinates as proof of authorization or canonical truth.

## Next engineering priorities

1. Run server typecheck, Playwright client tests, and authenticated API integration tests against local D1.
2. Resolve the Engram Intelligence principal from authenticated server context and test tenant isolation before wiring it into the conversation lifecycle.
3. Implement a concrete tenant resolution model and authorization service before exposing generic ERS reads.
4. Add append-only D1 event and assertion/evidence persistence with additive migrations.
5. Adapt existing memory records through compatibility repositories without breaking /api/memory.
6. Add cross-tenant isolation, provenance, temporal-history, and memory-retrieval tests.
7. Add memory export, retention, correction history, and account deletion workflows.
8. Complete rate limits and abuse controls.
9. Define durable task, audit, and runtime adapter contracts.
