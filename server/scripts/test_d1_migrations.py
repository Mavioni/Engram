#!/usr/bin/env python3
"""Exercise the ordered Engram D1 migration chain using Python's SQLite engine.

This is a local schema test only. It never contacts Cloudflare or a remote D1 DB.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

MIGRATIONS = Path(__file__).resolve().parents[1] / "src" / "db" / "migrations"


def run_migration(db: sqlite3.Connection, number: str) -> None:
    path = MIGRATIONS / f"{number}.sql"
    if not path.is_file():
        raise AssertionError(f"Missing migration: {path}")
    db.executescript(path.read_text(encoding="utf-8"))


def check_fresh_install() -> None:
    db = sqlite3.connect(":memory:")
    try:
        db.execute("PRAGMA foreign_keys = ON")
        for number in ("0001_initial", "0002_engram_memory", "0003_ers_events",
                       "0004_sakanafugu_principal", "0005_engram_intelligence_principal"):
            run_migration(db, number)

        tables = {
            row[0]
            for row in db.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
        assert "engram_intelligence_principals" in tables
        assert "sakanafugu_principals" not in tables

        indexes = {
            row[0]
            for row in db.execute(
                "SELECT name FROM sqlite_master WHERE type = 'index'"
            )
        }
        assert "idx_engram_intelligence_principals_tenant_status" in indexes
    finally:
        db.close()


def check_legacy_row_migration() -> None:
    db = sqlite3.connect(":memory:")
    try:
        db.execute("PRAGMA foreign_keys = ON")
        for number in ("0001_initial", "0002_engram_memory", "0003_ers_events",
                       "0004_sakanafugu_principal"):
            run_migration(db, number)

        config = {
            "version": 1,
            "behaviorProfile": "default",
            "instructionSetVersion": "engram-intelligence-v1",
            "capabilityCeiling": ["conversation.respond", "reasoning.invoke"],
            "modelBindings": [{
                "provider": "anthropic",
                "model": "claude-sonnet-4-6",
                "policyProfile": "default",
            }],
        }
        timestamp = "2026-11-10T13:00:00.000Z"
        db.execute(
            """
            INSERT INTO sakanafugu_principals (
                id, tenant_id, canonical_name, display_name, status,
                configuration_version, configuration_json, created_at, updated_at
            ) VALUES (?, ?, 'sakanafugu', ?, 'active', ?, ?, ?, ?)
            """,
            (
                "legacy-principal-1",
                "personal:user-1",
                "Engram Intelligence",
                1,
                json.dumps(config, separators=(",", ":")),
                timestamp,
                timestamp,
            ),
        )

        run_migration(db, "0005_engram_intelligence_principal")

        row = db.execute(
            """
            SELECT id, tenant_id, canonical_name, display_name, status,
                   configuration_version, configuration_json
            FROM engram_intelligence_principals
            WHERE tenant_id = ?
            """,
            ("personal:user-1",),
        ).fetchone()
        assert row is not None, "legacy principal was not copied"
        assert row[0] == "legacy-principal-1"
        assert row[1] == "personal:user-1"
        assert row[2] == "engram-intelligence"
        assert row[3] == "Engram Intelligence"
        assert row[4] == "active"
        assert row[5] == 1
        assert json.loads(row[6]) == config

        old_table = db.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
            ("sakanafugu_principals",),
        ).fetchone()
        assert old_table is None, "legacy principal table was not removed"

        # The canonical (tenant, principal name) key must prevent duplicates.
        db.execute(
            """
            INSERT OR IGNORE INTO engram_intelligence_principals (
                id, tenant_id, canonical_name, display_name, status,
                configuration_version, configuration_json, created_at, updated_at
            ) VALUES (?, ?, 'engram-intelligence', ?, 'active', ?, ?, ?, ?)
            """,
            (
                "duplicate-principal",
                "personal:user-1",
                "Engram Intelligence",
                1,
                json.dumps(config),
                timestamp,
                timestamp,
            ),
        )
        count = db.execute(
            "SELECT COUNT(*) FROM engram_intelligence_principals WHERE tenant_id = ?",
            ("personal:user-1",),
        ).fetchone()[0]
        assert count == 1, "tenant uniqueness constraint did not prevent duplicate principal"
    finally:
        db.close()


if __name__ == "__main__":
    check_fresh_install()
    check_legacy_row_migration()
    print("D1 migration checks passed (fresh install and legacy-principal upgrade).")
