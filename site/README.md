# Engram Notebook

Engram is a private notebook with journal entries, mood check-ins, dated plans, a searchable Timeline, Insights, a memory graph, a breathing timer and JSON backup. Visitors can explore an in-memory example. Sign in with ChatGPT to use a personal notebook on multiple devices.

## Storage

Sites supplies the signed-in visitor identity to the Worker. The Worker scopes every notebook query and write to that identity. Cloudflare D1 stores saved records. Plans, journal entries and earlier mood check-ins share the existing owner-scoped record store and revision transaction. The release requires the existing initialization migration and introduces no new DDL. Notebook revisions prevent stale edits from overwriting newer saves. Drafts stay in account-scoped session storage in the current tab. Your space includes export, import, account-wide clear and sign-out. Earlier browser-only notebooks can be imported explicitly from that screen.

Plans use the calendar date and wall-clock time you enter. The same date and time display on any device. This release supports one-time plans. Insights count saved journal and check-in activity, with a selectable date range and all-time streaks.

## Memory graph

The Memory tab indexes journal entries, mood check-ins, and plans from the active notebook. Tags become topic nodes and provide every graph edge. The index searches the full notebook, the inspector shows related entries, and trace follows the shortest chain of shared tags. The graph renders up to 68 nodes at a time; the index and trace use the full notebook. The graph is rendered locally and requires no additional service.

The explorer’s graph, index, inspector, and trace workflow were inspired by [GitNexus](https://github.com/abhigyanpatwari/GitNexus). It uses Engram’s notebook model and renderer.

## Engram Chat and saved memories

The Chat screen can recall notebook entries, offer guided reflection prompts, and open a memory draft from “Remember that…” or any message you choose to keep. The in-browser chat is session-scoped. Only saving the draft adds it to the notebook. Saved memories use editable journal records with a category and provenance, so they can be inspected, found, edited, exported, or deleted through existing notebook workflows.

“What do you remember about me?” reads only memories the user saved intentionally. The Memory explorer can filter to those entries. Category labels are personal facts, preferences, people, goals, moments, and reflections.

The private Engram app in ChatGPT supports grounded search, a limited view of the saved profile, and preparation of memory drafts. It stores only the draft details in the user’s D1 account. Drafts are accessible for 24 hours through an authenticated review link and removed from the draft table when saved. Expired drafts are pruned on later draft preparation. Signed-out viewers and other accounts cannot retrieve them. Draft preparation does not alter the notebook’s saved memories.

ChatGPT generates answers in the connected ChatGPT conversation. The website’s recall and guided reflection features run in the browser. ChatGPT’s AI capability does not depend on sharing an API key with Engram.

## Develop

Use Node 24 or later. Run `npm test` for model, HTTP and account-isolation checks. Run `npm run build` to embed the assets under `web/` and the Worker into `dist/server/index.js`. Run `npm run dev` for an isolated preview with a disposable SQLite database and simulated sign-in. Hosted sign-in and database migrations are provided by Sites.

The `drizzle/` directory contains versioned schema migrations. Add a migration for each schema change. Keep existing migrations intact. The offline single-file notebook can still be produced with `node scripts/package-deliverable.mjs`. When opened as a file, it uses browser-local storage.
