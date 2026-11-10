/**
 * Engram Relational Substrate (ERS) — shared domain contracts.
 *
 * These contracts define the logical model only. They do not imply a
 * persistence schema, grant permissions, or make derived geometry canonical.
 */

export type ErsId = string;
export type TenantId = string;
export type IsoTimestamp = string;

export type TenantScope =
  | { kind: "personal"; tenantId: TenantId; ownerUserId: string }
  | { kind: "workspace"; tenantId: TenantId; workspaceId: string };

export type Principal =
  | { kind: "user"; id: string }
  | { kind: "agent"; id: string }
  | { kind: "service"; id: string }
  | { kind: "integration"; id: string };

export type EntityStatus = "active" | "archived" | "deleted";

export interface EntityRef {
  id: ErsId;
  entityType: string;
}

export interface ErsEntity<TAttributes extends Record<string, unknown> = Record<string, unknown>> {
  id: ErsId;
  tenantId: TenantId;
  entityType: string;
  schemaVersion: number;
  domainOwner: string;
  attributes: TAttributes;
  status: EntityStatus;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

export type ProvenanceKind =
  | "user_stated"
  | "user_approved"
  | "user_imported"
  | "observed"
  | "tool_produced"
  | "model_inferred";

export interface Provenance {
  kind: ProvenanceKind;
  source: string;
  actor?: Principal;
  recordedAt: IsoTimestamp;
  method?: string;
  methodVersion?: string;
  sourceRef?: string;
}

export type AssertionStatus = "proposed" | "accepted" | "disputed" | "superseded" | "retracted";

export interface ErsAssertion {
  id: ErsId;
  tenantId: TenantId;
  subject: EntityRef;
  predicate: string;
  object: EntityRef | { value: string | number | boolean | null; valueType: string };
  qualifiers?: Record<string, string | number | boolean | null>;
  status: AssertionStatus;
  provenance: Provenance;
  confidence?: number;
  confidenceMethod?: string;
  validFrom?: IsoTimestamp;
  validTo?: IsoTimestamp;
  recordedAt: IsoTimestamp;
  supersedes?: ErsId;
}

export interface ErsRelationship extends ErsAssertion {
  object: EntityRef;
}

export interface ErsEvidence {
  id: ErsId;
  tenantId: TenantId;
  assertionId: ErsId;
  evidenceType: "source" | "supporting" | "contradicting" | "review";
  contentRef: string;
  provenance: Provenance;
  createdAt: IsoTimestamp;
}

export interface ErsContext {
  id: ErsId;
  tenantId: TenantId;
  contextType: string;
  parentContextId?: ErsId;
  createdAt: IsoTimestamp;
  expiresAt?: IsoTimestamp;
  attributes?: Record<string, string | number | boolean | null>;
}

export interface ErsEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: ErsId;
  tenantId: TenantId;
  eventType: string;
  schemaVersion: number;
  actor: Principal;
  subject?: EntityRef;
  target?: EntityRef;
  contextId?: ErsId;
  occurredAt: IsoTimestamp;
  recordedAt: IsoTimestamp;
  correlationId?: string;
  causationId?: string;
  provenance: Provenance;
  sensitivity: "public" | "internal" | "confidential" | "restricted";
  payload: TPayload;
}

export type AuthorityAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "execute"
  | "delegate"
  | "approve"
  | "export";

export interface AuthorityGrant {
  id: ErsId;
  tenantId: TenantId;
  principal: Principal;
  resource: EntityRef | { kind: "tenant"; id: TenantId };
  actions: AuthorityAction[];
  constraints?: {
    expiresAt?: IsoTimestamp;
    maxCost?: number;
    environments?: string[];
    dataClasses?: string[];
    requiresApproval?: boolean;
  };
  grantedBy: Principal;
  grantedAt: IsoTimestamp;
  revokedAt?: IsoTimestamp;
}

export interface ApprovalRecord {
  id: ErsId;
  tenantId: TenantId;
  grantId?: ErsId;
  requestedBy: Principal;
  decidedBy?: Principal;
  action: AuthorityAction;
  resource: EntityRef;
  status: "pending" | "approved" | "rejected" | "expired" | "revoked";
  requestedAt: IsoTimestamp;
  decidedAt?: IsoTimestamp;
  rationale?: string;
}

export interface ErsQueryScope {
  tenant: TenantScope;
  principal: Principal;
  contextId?: ErsId;
}

export interface ErsPage<T> {
  items: T[];
  nextCursor?: string;
}
