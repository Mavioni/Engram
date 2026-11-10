-- Sakanafugu principal persistence.
-- Engram owns this identity record; model-provider identities remain replaceable.
-- This migration is local/deployment-reviewed only. It is never auto-applied remotely.

CREATE TABLE IF NOT EXISTS sakanafugu_principals (
  id TEXT PRIMARY KEY CHECK(length(id) BETWEEN 1 AND 128),
  tenant_id TEXT NOT NULL CHECK(length(tenant_id) BETWEEN 1 AND 256),
  canonical_name TEXT NOT NULL CHECK(canonical_name = 'sakanafugu'),
  display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 1 AND 120),
  status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'retired')),
  configuration_version INTEGER NOT NULL CHECK(configuration_version >= 1),
  configuration_json TEXT NOT NULL CHECK(
    json_valid(configuration_json) AND length(configuration_json) <= 16384
  ),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(tenant_id, canonical_name)
);

CREATE INDEX IF NOT EXISTS idx_sakanafugu_principals_tenant_status
  ON sakanafugu_principals(tenant_id, status);
