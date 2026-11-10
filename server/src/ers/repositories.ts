import type {
  ApprovalRecord,
  AuthorityGrant,
  ErsAssertion,
  ErsContext,
  ErsEntity,
  ErsEvent,
  ErsEvidence,
  ErsPage,
  ErsQueryScope,
  ErsRelationship,
} from "./types";

/**
 * Tenant-scoped repository contracts.
 *
 * Implementations must derive tenant constraints from the authenticated
 * request scope, never from untrusted record payloads. These interfaces do
 * not themselves perform authorization; callers must check authority before
 * protected operations.
 */
export interface ErsEntityRepository {
  get(scope: ErsQueryScope, id: string): Promise<ErsEntity | null>;
  create(scope: ErsQueryScope, entity: ErsEntity): Promise<ErsEntity>;
  update(scope: ErsQueryScope, entity: ErsEntity): Promise<ErsEntity>;
}

export interface ErsAssertionRepository {
  get(scope: ErsQueryScope, id: string): Promise<ErsAssertion | null>;
  create(scope: ErsQueryScope, assertion: ErsAssertion): Promise<ErsAssertion>;
  listForEntity(scope: ErsQueryScope, entityId: string, cursor?: string, limit?: number): Promise<ErsPage<ErsAssertion>>;
}

export interface ErsRelationshipRepository {
  create(scope: ErsQueryScope, relationship: ErsRelationship): Promise<ErsRelationship>;
  listFrom(scope: ErsQueryScope, subjectId: string, cursor?: string, limit?: number): Promise<ErsPage<ErsRelationship>>;
  listTo(scope: ErsQueryScope, objectId: string, cursor?: string, limit?: number): Promise<ErsPage<ErsRelationship>>;
}

export interface ErsEvidenceRepository {
  add(scope: ErsQueryScope, evidence: ErsEvidence): Promise<ErsEvidence>;
  listForAssertion(scope: ErsQueryScope, assertionId: string): Promise<ErsEvidence[]>;
}

export interface ErsEventRepository {
  append(scope: ErsQueryScope, event: ErsEvent): Promise<void>;
  list(scope: ErsQueryScope, filters?: { eventTypes?: string[]; subjectId?: string; cursor?: string; limit?: number }): Promise<ErsPage<ErsEvent>>;
}

export interface ErsContextRepository {
  get(scope: ErsQueryScope, id: string): Promise<ErsContext | null>;
  create(scope: ErsQueryScope, context: ErsContext): Promise<ErsContext>;
}

export interface ErsAuthorityRepository {
  listGrants(scope: ErsQueryScope, principalId: string): Promise<AuthorityGrant[]>;
  getApproval(scope: ErsQueryScope, approvalId: string): Promise<ApprovalRecord | null>;
}

/** Authorization is a separate dependency from semantic graph traversal. */
export interface ErsAuthorizationService {
  can(
    scope: ErsQueryScope,
    action: AuthorityGrant["actions"][number],
    resource: { id: string; entityType: string } | { kind: "tenant"; id: string },
  ): Promise<boolean>;
}
