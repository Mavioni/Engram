-- ERS event log: append-only occurrence and audit history.
-- Personal tenants use the stable namespace "personal:<authenticated-user-id>".
-- Workspace and delegated-agent event writes are intentionally not enabled yet.

CREATE TABLE IF NOT EXISTS ers_events (
  id TEXT PRIMARY KEY CHECK(length(id) BETWEEN 1 AND 128),
  tenant_id TEXT NOT NULL CHECK(length(tenant_id) BETWEEN 1 AND 256),
  event_type TEXT NOT NULL CHECK(length(event_type) BETWEEN 1 AND 120),
  schema_version INTEGER NOT NULL CHECK(schema_version >= 1),
  actor_kind TEXT NOT NULL CHECK(actor_kind IN ('user', 'agent', 'service', 'integration')),
  actor_id TEXT NOT NULL CHECK(length(actor_id) BETWEEN 1 AND 256),
  subject_json TEXT CHECK(subject_json IS NULL OR (json_valid(subject_json) AND length(subject_json) <= 512)),
  target_json TEXT CHECK(target_json IS NULL OR (json_valid(target_json) AND length(target_json) <= 512)),
  context_id TEXT,
  occurred_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  correlation_id TEXT,
  causation_id TEXT,
  provenance_json TEXT NOT NULL CHECK(json_valid(provenance_json) AND length(provenance_json) <= 4096),
  sensitivity TEXT NOT NULL CHECK(sensitivity IN ('public', 'internal', 'confidential', 'restricted')),
  payload_json TEXT NOT NULL CHECK(json_valid(payload_json) AND length(payload_json) <= 16384)
);

CREATE INDEX IF NOT EXISTS idx_ers_events_tenant_recorded
  ON ers_events(tenant_id, recorded_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_ers_events_tenant_type_recorded
  ON ers_events(tenant_id, event_type, recorded_at DESC, id DESC);

-- Subject filtering uses JSON extraction; keep the indexed tenant/time scan bounded.
