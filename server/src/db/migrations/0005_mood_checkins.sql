-- Store complete, user-owned mood reflections independently of legacy users rows.
CREATE TABLE IF NOT EXISTS mood_checkins (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  mood_name TEXT NOT NULL CHECK(mood_name IN ('radiant','content','calm','neutral','tender','anxious','low','overwhelmed')),
  mood REAL NOT NULL CHECK(mood BETWEEN 0 AND 1),
  energy REAL NOT NULL CHECK(energy BETWEEN 0 AND 1),
  intensity REAL NOT NULL CHECK(intensity BETWEEN 0 AND 1),
  factors_json TEXT NOT NULL DEFAULT '[]',
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_owner_created ON mood_checkins(owner_user_id, created_at DESC);
