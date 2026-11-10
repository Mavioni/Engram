# Phone notebook alpha

The notes interface is based on Massimo's uploaded notes app: charcoal surfaces,
serif display headings, blue accents, five moods, five tabs and multiple composer
and timeline layouts. The new source is under `src/notes`.

## Device preview

The preview is a separate encrypted notebook on the current device. It supports
create/edit/delete, titles, local dates, mood and tag filters, draft restoration,
four timeline layouts, Self Mirror, seven-day recap and JSON import/export.
It works offline after the app shell has been cached. Open in Chrome on Android
and use its menu's Install app / Add to Home screen command when offered.

A passphrase of at least 12 characters is required. The app stores AES-GCM
ciphertext in IndexedDB with a randomly generated salt and IV. A PBKDF2-derived
key stays in memory until the notebook is locked or the page is closed. There
is no recovery service. Clearing site data removes the device notebook. Export
readable JSON in Settings and protect the exported file separately.

This is functional device storage, not verified cloud deployment. The prototype
does not use ChatGPT plan usage and incurs no model requests in device mode.
Voice uses keyboard dictation for now; no microphone recorder or passive capture
is implemented. Location, health, contacts, browsing, wearable, OMI, OpenClaw and
other external integrations do not collect data in this alpha.

## Connected builds

Set `VITE_API_URL` to the Engram API origin at build time. The app uses Better
Auth and the existing user-scoped memory API. Journal entries are stored as
`journal_entry` memories with user-stated provenance. The cloud service remains
authoritative; drafts stay in the current browser session. The alpha UI does not
claim end-to-end cloud encryption. IRIS sends only explicit requests; saved-memory
sharing is off until enabled for a conversation. Its backend currently uses the
existing provider adapter. ChatGPT integration requires separate supported OAuth
configuration and is not implemented by this interface change.

## Verification and packaging

Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:unit`,
`npm run build`, `npm run test:e2e`, and `npm run sync`. Browser tests require
`npx playwright install --with-deps chromium`; CI performs that installation.
They exercise note CRUD, draft reload, import/export, layouts, AI consent,
provider errors and offline reopening of the production build.

For the device preview, build without `VITE_API_URL`, then run
`node scripts/build-notes-preview.mjs`. The GitHub Pages workflow publishes
the `preview` directory. Its `alpha` subdirectory can be published independently
of backend branches; this does not merge or deploy the Worker or migrate D1.
