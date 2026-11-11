# Engram — Notebook-first product specification (November 2026)

## Product promise

**The Notebook is the product. The Engram is the map.**

Engram starts with an honest, usable personal notebook. An individual captures life in their own words: notes, journal reflections, tasks, mood check-ins, important people, projects and things they want to remember. Engram turns only **their saved, attributable data** into a navigable 3D spatial map. The map is not a personality verdict, neuroscience model, consciousness replica, or AI-generated autobiography.

The Notebook must be useful when no AI provider, account, network connection, or backend is available. An AI companion is a distinct **opt-in interface** to user-authorized content, not the source of truth.

## First-use journey

1. Open the Pages site. No signup required for a local notebook.
2. See an empty, beautiful Notebook, with no simulated memories or fabricated statistics.
3. Create a note; title and body are saved automatically in the current browser.
4. Add tags to name connections between thoughts. Tags are user-authored.
5. Capture journal, tasks, and a mood with its intensity, contributing factors, and optional note.
6. Visit **Engram**. Every point is a saved, nonempty page. Shared tags alone generate visible links.
7. Rotate or zoom the 3D projection; select a point and open the original page. A text index remains available.
8. Visit **Today** for real task counts and recent authored reflections.
9. Visit **IRIS** for honest on-device keyword recall. No unconfigured AI service is presented as live.
10. Export a JSON backup in Settings, and import it on another browser if desired.

## Navigation architecture

- **Notebook** (default): page list, search/filter, direct editor, automatic local save, new note/journal/task.
- **Engram**: perspective-projected, interactive spatial visual of user-authored pages, plus accessible source list.
- **Today**: completed/open tasks, entry counts and recent reflection, all directly computed from saved data.
- **IRIS**: current on-device search/recall; future authorized AI conversations once identity and inference are verified.
- **Mood check-in**: prominent global capture action, with eight legible labels, intensity, factors and note.
- **Settings**: storage truth, data export/import, deletion, source/license.

Desktop uses a compact rail, search-driven page list, and generous editor. Mobile uses a bottom dock and list-to-editor navigation. UI vocabulary: calm, precise, original; generous white space; quiet shadows; accessible typography and labels. The 3D graph has a night-sky palette to distinguish *view* from *underlying data*.

## Real-data model

Each entry has a stable ID, entry kind, title, text, explicit tags, creation and modification timestamps, optional task completion state, and optional mood/intensity/factors.

- Nodes = nonempty user-authored entries. No fake placeholders.
- Links = shared, explicitly named tags. No speculative social/psychological inferences.
- Coordinates = deterministic spatial layout derived from stable entry IDs. A position is **not** an emotion/personality measurement.
- Opening any node navigates to the corresponding source page.
- IRIS results = exact content/label/tag matching, not fabricated answers.
- Today counts = filtered source records, not generated insights.

## Current persistence, trust, and limits

The GitHub Pages alpha uses browser localStorage under `engram.notebook.v2`. This ensures user entry and meaningful behavior without a backend, but **localStorage is not encrypted, cloud synced, or a disaster-safe backup**. Clearing site data, using another browser, or switching devices can lose the data. Users are shown this limitation and given JSON export/import.

Legacy prototype journal mock entries were fictional. They are not migrated. The existing `engram.user.v1` cache stores only numeric mood history; it does not contain prior user journal bodies to import.

A Better Auth-protected D1 Notebook API and migration `0006_notebook_entries.sql` have been authored for future user-consented cross-device sync. **Those endpoints are not used by the Pages preview**. They are neither claimed deployed nor verified. Cross-device sync must not silently start before the account association, consent, conflict handling, deployment and retention controls are proven.

The separate `0005_mood_checkins.sql` API remains in the backend for future compatibility. The local-first Notebook records mood entries directly to the same unified local source model.

## Privacy and safety invariants

1. User content cannot be silently forwarded to an inference provider or third party.
2. User-owned records must be isolated by authenticated server-side owner ID in cloud mode.
3. No inferred pattern may be presented as an established fact without evidence and an inspectable source.
4. Graph layouts and caches cannot become authoritative memories.
5. Users can inspect, correct, export and delete their own records.
6. No simulated engagement streaks, fake message histories, or overclaimed mental health diagnoses.
7. A local-only status must be distinguished from a live, verified cloud session.
8. A change to the data sync mode requires explicit user notice and affirmative opt-in.

## Delivery stages

**V2 local website (implemented in repository):** React Notebook, local auto-save, tags, journals, tasks, mood with factors, Today, deterministic 3D view, honest local recall, JSON import/export, responsive design and browser screenshot tests.

**Cloud-account phase (not complete):** deploy and verify Worker; apply D1 migrations; configure trusted origins, cookie/session flow and production API URLs; implement explicit login/identity and opt-in upload/download with conflict resolution, pagination, secure logout behavior and deletion. Prove authenticated CRUD and restoration from a second device.

**Intelligent Notebook phase (not complete):** consent-scoped retrieval, optional embedding/indexing, time-aware evidence, provenance, user-editable links and optional voice/image capture. Show exactly which notes are shared with inference.

**Life copilot phase (not complete):** agent-assisted planning, tasks, reminders, integration permissions, approvals and audit logs. Build and evaluate runtime adapters; do not claim human consciousness simulation.

**Reliability and launch (not complete):** battery/performance bounds for graph, a11y audits and keyboard/pointer coverage, production observability, backup/restore drills, PWA/mobile packaging, reproducible QA and responsive screenshot review.

## Definition of ready

The static local Notebook is ready for public testing only once current client typecheck, build, browser contracts, screenshot/overflow checks and Pages deployment pass.

The **full cloud Engram** must not be called ready until the public client, API, live sign-in/session, applied D1 migrations, round-trip authorized persistence and meaningful smoke tests are all independently verified.

## Licensing

The application continues under AGPL-3.0-only; the UI exposes the corresponding repository source.
