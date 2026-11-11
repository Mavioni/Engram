-- Engram Notebook: durable per-user pages for an explicit future sync flow.
-- This table is NOT populated automatically by the static Pages preview.
CREATE TABLE IF NOT EXISTS notebook_entries (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('note','journal','task','mood')),
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
  mood_name TEXT CHECK (mood_name IN ('Radiant','Content','Calm','Neutral','Tender','Anxious','Low','Overwhelmed')),
  intensity INTEGER CHECK (intensity BETWEEN 0 AND 100),
  factors_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_notebook_owner_updated ON notebook_entries(owner_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notebook_owner_kind ON notebook_entries(owner_user_id, kind);
