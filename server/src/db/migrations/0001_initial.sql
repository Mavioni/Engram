-- Migration: 0001_initial
-- Idempotent. Safe to run with `wrangler d1 migrations apply engram --local`
-- and `wrangler d1 migrations apply engram --remote`.
-- All statements use CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.

-- ---------------------------------------------------------------------------
-- Better Auth core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image         TEXT,
  createdAt     INTEGER NOT NULL,
  updatedAt     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
  id                    TEXT PRIMARY KEY,
  accountId             TEXT NOT NULL,
  providerId            TEXT NOT NULL,
  userId                TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accessToken           TEXT,
  refreshToken          TEXT,
  idToken               TEXT,
  accessTokenExpiresAt  INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope                 TEXT,
  password              TEXT,
  createdAt             INTEGER NOT NULL,
  updatedAt             INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id        TEXT PRIMARY KEY,
  expiresAt INTEGER NOT NULL,
  token     TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification (
  id         TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value      TEXT NOT NULL,
  expiresAt  INTEGER NOT NULL,
  createdAt  INTEGER,
  updatedAt  INTEGER
);

-- ---------------------------------------------------------------------------
-- Engram app: extended user profile
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  email               TEXT NOT NULL UNIQUE,
  display_name        TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  archetype_json      TEXT,
  assessment_complete INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Engram app: AI conversation sessions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at   INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  ended_at     INTEGER,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  model        TEXT NOT NULL DEFAULT 'claude-sonnet-4-6'
);

-- ---------------------------------------------------------------------------
-- Engram app: messages
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS messages (
  id                TEXT PRIMARY KEY,
  session_id        TEXT NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content           TEXT NOT NULL,
  tokens_in         INTEGER NOT NULL DEFAULT 0,
  tokens_out        INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- ---------------------------------------------------------------------------
-- Engram app: check-ins
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS checkins (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood         REAL NOT NULL CHECK(mood BETWEEN 0 AND 1),
  energy       REAL NOT NULL CHECK(energy BETWEEN 0 AND 1),
  factors_json TEXT,
  note         TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- ---------------------------------------------------------------------------
-- Engram app: entitlements
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS entitlements (
  user_id                TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                   TEXT NOT NULL CHECK(plan IN ('free', 'plus', 'pro')),
  valid_through          INTEGER,
  revenuecat_customer_id TEXT,
  PRIMARY KEY (user_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_session_id   ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id   ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id      ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_account_user_id       ON account(userId);
CREATE INDEX IF NOT EXISTS idx_session_user_id       ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token         ON session(token);
