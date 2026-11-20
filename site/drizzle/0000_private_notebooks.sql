CREATE TABLE notebook_revisions (
  owner_id TEXT PRIMARY KEY NOT NULL,
  revision TEXT NOT NULL,
  write_token TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE notebook_moments (
  owner_id TEXT NOT NULL REFERENCES notebook_revisions(owner_id),
  moment_id TEXT NOT NULL,
  entry_json TEXT NOT NULL,
  PRIMARY KEY (owner_id, moment_id)
);
