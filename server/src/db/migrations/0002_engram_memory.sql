-- Engram Memory: private, user-owned records with explicit provenance.
-- Apply with wrangler d1 migrations apply engram --local / --remote.

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'api',
  provenance TEXT NOT NULL CHECK(provenance IN ('user_stated', 'user_imported', 'user_approved')),
  confidence REAL CHECK(confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_memories_owner_updated
  ON memories(owner_user_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memories_owner_type
  ON memories(owner_user_id, memory_type) WHERE deleted_at IS NULL;
