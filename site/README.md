# Engram Notebook

Engram is a private notebook with journal entries, mood check-ins, dated plans, a searchable Timeline, Insights, a 3D memory view, a breathing timer and JSON backup. Visitors can explore an in-memory example. Sign in with ChatGPT to use a personal notebook on multiple devices.

## Storage

Sites supplies the signed-in visitor identity to the Worker. The Worker scopes every notebook query and write to that identity. Cloudflare D1 stores saved records. Plans, journal entries and earlier mood check-ins share the existing owner-scoped record store and revision transaction. The release requires the existing initialization migration and introduces no new DDL. Notebook revisions prevent stale edits from overwriting newer saves. Drafts stay in account-scoped session storage in the current tab. Your space includes export, import, account-wide clear and sign-out. Earlier browser-only notebooks can be imported explicitly from that screen.

Plans use the calendar date and wall-clock time you enter. The same date and time display on any device. This release supports one-time plans. Insights count saved journal and check-in activity, with a selectable date range and all-time streaks.

## Memory chat

The Chat screen uses your current Engram session and searches the notebook already loaded in the browser. Replies are based on matching excerpts, and the chat resets when the page or account changes. It can be used in the example notebook without signing in.

The optional private Engram plugin lets a ChatGPT conversation search the signed-in user’s Engram notebook with `search_engram_memory`. The Worker authenticates each tool invocation and returns up to six dated sources with short excerpts. The tool cannot modify the notebook. It does not use OpenAI API keys or access ChatGPT history. The browser-side chat does not call a model.

## Develop

Use Node 24 or later. Run `npm test` for model, HTTP and account-isolation checks. Run `npm run build` to embed the assets under `web/` and the Worker into `dist/server/index.js`. Run `npm run dev` for an isolated preview with a disposable SQLite database and simulated sign-in. Hosted sign-in and database migrations are provided by Sites.

The `drizzle/` directory contains versioned schema migrations. Add a migration for each schema change. Keep existing migrations intact. The offline single-file notebook can still be produced with `node scripts/package-deliverable.mjs`. When opened as a file, it uses browser-local storage.
