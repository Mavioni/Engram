import { isErsEventType, isErsProvenanceKind } from "./registry";
import type { ErsEvent, ErsPage, ErsQueryScope, Principal } from "./types";

const MAX_PAYLOAD_BYTES = 16_384;
const MAX_PAGE_SIZE = 100;
const PERSONAL_TENANT_PREFIX = "personal:";

type EventRow = {
  id: string;
  tenant_id: string;
  event_type: string;
  schema_version: number;
  actor_kind: string;
  actor_id: string;
  subject_json: string | null;
  target_json: string | null;
  context_id: string | null;
  occurred_at: string;
  recorded_at: string;
  correlation_id: string | null;
  causation_id: string | null;
  provenance_json: string;
  sensitivity: ErsEvent["sensitivity"];
  payload_json: string;
};

type EventCursor = { recordedAt: string; id: string };

function isCanonicalIso(value: string): boolean {
  if (!Number.isFinite(Date.parse(value))) return false;
  try { return new Date(value).toISOString() === value; } catch { return false; }
}

function samePrincipal(a: Principal, b: Principal): boolean {
  return a.kind === b.kind && a.id === b.id;
}

function assertPersonalUserScope(scope: ErsQueryScope): void {
  if (
    scope.tenant.kind !== "personal" ||
    scope.principal.kind !== "user" ||
    scope.tenant.ownerUserId !== scope.principal.id ||
    scope.tenant.tenantId !== PERSONAL_TENANT_PREFIX + scope.principal.id
  ) {
    throw new Error("ERS scope is not an authorized personal-user scope");
  }
}

function encodeCursor(cursor: EventCursor): string {
  const bytes = new TextEncoder().encode(JSON.stringify(cursor));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeCursor(value: string): EventCursor {
  if (value.length > 1024) throw new Error("invalid ERS event cursor");
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as EventCursor).recordedAt !== "string" ||
      typeof (parsed as EventCursor).id !== "string"
    ) throw new Error("invalid cursor");
    const cursor = parsed as EventCursor;
    if (!isCanonicalIso(cursor.recordedAt) || !cursor.id || cursor.id.length > 128) {
      throw new Error("invalid cursor");
    }
    return cursor;
  } catch {
    throw new Error("invalid ERS event cursor");
  }
}

function fromRow(row: EventRow): ErsEvent {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    eventType: row.event_type,
    schemaVersion: row.schema_version,
    actor: { kind: row.actor_kind as Principal["kind"], id: row.actor_id },
    ...(row.subject_json ? { subject: JSON.parse(row.subject_json) } : {}),
    ...(row.target_json ? { target: JSON.parse(row.target_json) } : {}),
    ...(row.context_id ? { contextId: row.context_id } : {}),
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    ...(row.correlation_id ? { correlationId: row.correlation_id } : {}),
    ...(row.causation_id ? { causationId: row.causation_id } : {}),
    provenance: JSON.parse(row.provenance_json),
    sensitivity: row.sensitivity,
    payload: JSON.parse(row.payload_json),
  };
}

/**
 * D1-backed append-only ERS event log.
 *
 * The first implementation deliberately supports personal-user tenants only.
 * Workspace and delegated-agent writes remain unavailable until membership and
 * authority resolution are implemented. The scope passed here must be built
 * from authenticated server context, never request-body tenant fields.
 */
export class D1ErsEventRepository {
  constructor(private readonly db: D1Database) {}

  async append(scope: ErsQueryScope, event: ErsEvent): Promise<void> {
    assertPersonalUserScope(scope);
    if (event.tenantId !== scope.tenant.tenantId) throw new Error("ERS event tenant mismatch");
    if (!samePrincipal(event.actor, scope.principal)) {
      throw new Error("delegated ERS event actors are not enabled");
    }
    if (!isErsEventType(event.eventType)) throw new Error("unregistered ERS event type");
    if (!Number.isSafeInteger(event.schemaVersion) || event.schemaVersion < 1) {
      throw new Error("invalid ERS event schema version");
    }
    if (!event.id || event.id.length > 128) throw new Error("invalid ERS event id");
    if (!isCanonicalIso(event.occurredAt) || !isCanonicalIso(event.recordedAt)) {
      throw new Error("invalid ERS event timestamp");
    }
    if (!["public", "internal", "confidential", "restricted"].includes(event.sensitivity)) {
      throw new Error("invalid ERS event sensitivity");
    }

    if (!isErsProvenanceKind(event.provenance?.kind) || typeof event.provenance.source !== "string" || !event.provenance.source.trim() || event.provenance.source.length > 300 || !isCanonicalIso(event.provenance.recordedAt)) {
      throw new Error("invalid ERS event provenance");
    }
    if (event.contextId && event.contextId.length > 128) throw new Error("invalid ERS event context");
    if (event.correlationId && event.correlationId.length > 128) throw new Error("invalid ERS event correlation id");
    if (event.causationId && event.causationId.length > 128) throw new Error("invalid ERS event causation id");

    const payloadJson = JSON.stringify(event.payload);
    const provenanceJson = JSON.stringify(event.provenance);
    const subjectJson = event.subject ? JSON.stringify(event.subject) : null;
    const targetJson = event.target ? JSON.stringify(event.target) : null;
    if (!payloadJson || new TextEncoder().encode(payloadJson).byteLength > MAX_PAYLOAD_BYTES) {
      throw new Error("ERS event payload exceeds the 16 KiB limit");
    }
    if (!provenanceJson || provenanceJson.length > 4096) throw new Error("ERS event provenance is invalid");
    if (subjectJson && subjectJson.length > 512) throw new Error("ERS event subject is invalid");
    if (targetJson && targetJson.length > 512) throw new Error("ERS event target is invalid");

    await this.db.prepare(
      `INSERT INTO ers_events (
        id, tenant_id, event_type, schema_version, actor_kind, actor_id,
        subject_json, target_json, context_id, occurred_at, recorded_at,
        correlation_id, causation_id, provenance_json, sensitivity, payload_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      event.id, event.tenantId, event.eventType, event.schemaVersion,
      event.actor.kind, event.actor.id, subjectJson, targetJson,
      event.contextId ?? null, event.occurredAt, event.recordedAt,
      event.correlationId ?? null, event.causationId ?? null,
      provenanceJson, event.sensitivity, payloadJson,
    ).run();
  }

  async list(
    scope: ErsQueryScope,
    filters: { eventTypes?: string[]; subjectId?: string; cursor?: string; limit?: number } = {},
  ): Promise<ErsPage<ErsEvent>> {
    assertPersonalUserScope(scope);
    const requestedLimit = filters.limit ?? 50;
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
      : 50;
    const where = ["tenant_id = ?"];
    const bindings: (string | number)[] = [scope.tenant.tenantId];

    if (filters.eventTypes?.length) {
      if (filters.eventTypes.length > 20 || filters.eventTypes.some((type) => !isErsEventType(type))) {
        throw new Error("invalid ERS event type filter");
      }
      where.push(`event_type IN (${filters.eventTypes.map(() => "?").join(", ")})`);
      bindings.push(...filters.eventTypes);
    }
    if (filters.subjectId !== undefined) {
      if (!filters.subjectId || filters.subjectId.length > 128) throw new Error("invalid ERS subject filter");
      where.push("json_extract(subject_json, '$.id') = ?");
      bindings.push(filters.subjectId);
    }
    if (filters.cursor) {
      const cursor = decodeCursor(filters.cursor);
      where.push("(recorded_at < ? OR (recorded_at = ? AND id < ?))");
      bindings.push(cursor.recordedAt, cursor.recordedAt, cursor.id);
    }

    const rows = await this.db.prepare(
      `SELECT * FROM ers_events WHERE ${where.join(" AND ")}
       ORDER BY recorded_at DESC, id DESC LIMIT ?`
    ).bind(...bindings, limit + 1).all<EventRow>();
    const hasMore = rows.results.length > limit;
    const pageRows = rows.results.slice(0, limit);
    const last = pageRows[pageRows.length - 1];
    return {
      items: pageRows.map(fromRow),
      ...(hasMore && last ? { nextCursor: encodeCursor({ recordedAt: last.recorded_at, id: last.id }) } : {}),
    };
  }
}
