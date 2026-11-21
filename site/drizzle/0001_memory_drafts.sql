CREATE TABLE IF NOT EXISTS notebook_memory_drafts (
  owner_id TEXT NOT NULL,
  id TEXT NOT NULL,
  digest TEXT NOT NULL,
  draft_json TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, digest)
);
