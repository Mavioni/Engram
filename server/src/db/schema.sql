-- Engram D1 Schema
-- Authoritative DDL. Mirrors 0001_initial.sql (idempotent form).
-- Better Auth manages: user, account, session, verification tables.
-- Engram app manages: sessions (ai-sessions), messages, checkins, entitlements.

-- ---------------------------------------------------------------------------
-- Better Auth core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,   -- SQLite bool: 0/1
  image         TEXT,
  createdAt     INTEGER NOT NULL,             -- Unix timestamp ms
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
  id                  TEXT PRIMARY KEY,            -- mirrors Better Auth user.id
  email               TEXT NOT NULL UNIQUE,
  display_name        TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  archetype_json      TEXT,                        -- JSON blob, nullable until assessment complete
  assessment_complete INTEGER NOT NULL DEFAULT 0   -- 0=false, 1=true
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
-- Engram app: messages (billing + conversation history)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS messages (
  id               TEXT PRIMARY KEY,
  session_id       TEXT NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content          TEXT NOT NULL,
  tokens_in        INTEGER NOT NULL DEFAULT 0,
  tokens_out       INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- ---------------------------------------------------------------------------
-- Engram app: check-ins (mood / energy telemetry)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS checkins (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood         REAL NOT NULL CHECK(mood BETWEEN 0 AND 1),
  energy       REAL NOT NULL CHECK(energy BETWEEN 0 AND 1),
  factors_json TEXT,   -- JSON array of factor strings
  note         TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- ---------------------------------------------------------------------------
-- Engram app: entitlements (RevenueCat-backed)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS entitlements (
  user_id                TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                   TEXT NOT NULL CHECK(plan IN ('free', 'plus', 'pro')),
  valid_through          INTEGER,                  -- Unix ms, null = never expires
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
