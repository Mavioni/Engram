import type { AuthorityAction, ProvenanceKind } from "./types";

export const ERS_ENTITY_TYPES = [
  "identity.user",
  "identity.agent",
  "identity.service",
  "identity.device",
  "memory.record",
  "knowledge.concept",
  "knowledge.document",
  "reasoning.run",
  "agent.definition",
  "task.task",
  "event.event",
  "integration.connection",
  "presence.view",
] as const;

export type ErsEntityType = (typeof ERS_ENTITY_TYPES)[number];

export const ERS_PREDICATES = [
  "identity.member_of",
  "identity.owned_by",
  "identity.identified_by",
  "memory.derived_from",
  "memory.about",
  "knowledge.related_to",
  "knowledge.supports",
  "knowledge.contradicts",
  "reasoning.uses_premise",
  "reasoning.concludes",
  "agent.has_capability",
  "agent.delegates_to",
  "agent.assigned_to",
  "task.depends_on",
  "task.assigned_to",
  "integration.provides",
  "event.caused_by",
  "context.within",
] as const;

export type ErsPredicate = (typeof ERS_PREDICATES)[number];

export const ERS_EVENT_TYPES = [
  "entity.created",
  "entity.updated",
  "assertion.proposed",
  "assertion.accepted",
  "assertion.disputed",
  "assertion.superseded",
  "assertion.retracted",
  "memory.created",
  "memory.approved",
  "task.created",
  "task.started",
  "task.completed",
  "task.failed",
  "agent.delegated",
  "authority.granted",
  "authority.revoked",
  "approval.requested",
  "approval.decided",
  "integration.received",
] as const;

export type ErsEventType = (typeof ERS_EVENT_TYPES)[number];

export const ERS_PROVENANCE_KINDS: readonly ProvenanceKind[] = [
  "user_stated",
  "user_approved",
  "user_imported",
  "observed",
  "tool_produced",
  "model_inferred",
];

export const ERS_AUTHORITY_ACTIONS: readonly AuthorityAction[] = [
  "read",
  "create",
  "update",
  "delete",
  "execute",
  "delegate",
  "approve",
  "export",
];

const entityTypes = new Set<string>(ERS_ENTITY_TYPES);
const predicates = new Set<string>(ERS_PREDICATES);
const eventTypes = new Set<string>(ERS_EVENT_TYPES);
const provenanceKinds = new Set<string>(ERS_PROVENANCE_KINDS);
const authorityActions = new Set<string>(ERS_AUTHORITY_ACTIONS);

export const isErsEntityType = (value: string): value is ErsEntityType => entityTypes.has(value);
export const isErsPredicate = (value: string): value is ErsPredicate => predicates.has(value);
export const isErsEventType = (value: string): value is ErsEventType => eventTypes.has(value);
export const isErsProvenanceKind = (value: string): value is ProvenanceKind => provenanceKinds.has(value);
export const isErsAuthorityAction = (value: string): value is AuthorityAction => authorityActions.has(value);

export function isValidConfidence(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}
