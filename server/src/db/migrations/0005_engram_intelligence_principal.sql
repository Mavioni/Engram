-- Rename the historical Engram Intelligence principal table without
-- rewriting migration 0004. This works for fresh and already-migrated D1 DBs:
-- migration 0004 creates sakanafugu_principals; this migration copies any rows
-- into the canonical table and then removes the legacy table.
--
-- This migration is not auto-applied by Worker deployment. Review and apply
-- explicitly in the intended D1 environment after verifying migration history.

CREATE TABLE IF NOT EXISTS engram_intelligence_principals (
  id TEXT PRIMARY KEY CHECK(length(id) BETWEEN 1 AND 128),
  tenant_id TEXT NOT NULL CHECK(length(tenant_id) BETWEEN 1 AND 256),
  canonical_name TEXT NOT NULL CHECK(canonical_name = 'engram-intelligence'),
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

INSERT OR IGNORE INTO engram_intelligence_principals (
  id, tenant_id, canonical_name, display_name, status,
  configuration_version, configuration_json, created_at, updated_at
)
SELECT
  id, tenant_id, 'engram-intelligence', display_name, status,
  configuration_version, configuration_json, created_at, updated_at
FROM sakanafugu_principals;

DROP INDEX IF EXISTS idx_sakanafugu_principals_tenant_status;
DROP TABLE sakanafugu_principals;

CREATE INDEX IF NOT EXISTS idx_engram_intelligence_principals_tenant_status
  ON engram_intelligence_principals(tenant_id, status);
