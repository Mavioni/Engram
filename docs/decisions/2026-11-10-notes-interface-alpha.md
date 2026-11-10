# Notes interface and private alpha

Massimo requested the interface from his uploaded `Massimo.apk`, with Engram's
memory, IRIS, and observation-only Self Mirror additions. This supersedes the
old screen/layout invariant only for the new notes workspace. The reference
uses charcoal/ivory surfaces, blue/terracotta accents, serif headings, five
bottom tabs, five moods, four composer layouts and four timeline views.

The source APK was inspected as an archive; its compiled third-party bundle
is a visual reference, not new application source. The workspace is implemented
as typed React modules alongside the preserved legacy screen files.

## Execution and data boundary

- A configured `VITE_API_URL` enables the existing Better Auth session and
  user-scoped memory API. D1 remains authoritative for connected entries.
- Without that configuration the distributable alpha uses a passphrase-encrypted
  device vault. This is a deliberately separate prototype mode, not cloud sync.
  AES-GCM ciphertext, salt and IV are stored in IndexedDB; the derived key is
  kept in memory. No authentication tokens or plaintext journals are persisted
  in browser storage. Losing the passphrase loses access to the device vault.
- Cloud users may explicitly open the separate device vault from sign-in.
- AI requests only run on explicit user submission to the existing authenticated
  API. Saved memory is off by default. Guest mode does not simulate AI responses.
- Self Mirror displays calculations over user-authored entries with source links.
  It never generates text as the user or claims consciousness replication.
- ChatGPT sign-in is a pending integration. The alpha never displays a working
  authorization button without a configured supported OAuth client.
- Sensitive-source ingestion, agent execution and third-party account capture
  remain future integrations. No passive capture is enabled by this UI change.

## Acceptance

Phone layouts must have no horizontal overflow. Create/edit/delete, filtering,
local dates, draft reload, encrypted storage, export, account scoping and the AI
request contract are checked. A static phone alpha is not evidence of a deployed
cloud backend. Funding or production-readiness claims must retain that distinction.
