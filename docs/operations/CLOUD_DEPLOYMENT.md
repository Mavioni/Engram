# Engram — Production Cloud Deployment Runbook

**Status:** The deployment workflow is staged in source control. No successful Worker deployment, production sign-in, or multi-device synchronization is implied by this document.

## Scope and trust boundary

The public Notebook at https://mavioni.github.io/Engram/ is currently **local only**. The Pages client does not call the authenticated Notebook API or upload browser notes. Do not label the cloud experience as ready until the end-to-end acceptance gates below pass.

Source is AGPL-3.0-only; maintain a visible link to the corresponding source in any network deployment.

## 1. Prepare GitHub production environment

Configure the GitHub Actions **production** environment for `Mavioni/Engram`. Consider requiring a human reviewer for database migrations and production deployments.

Set these **secrets**, never repository files or workflow logs:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token scoped for this account's Workers and D1 deployment/migration permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Target Cloudflare account |
| `BETTER_AUTH_SECRET` | Long, cryptographically random secret for session signing |
| `ANTHROPIC_API_KEY` | Current server-side inference adapter credential |

Set these **production environment variables**:

| Variable | Example / validation |
|---|---|
| `BETTER_AUTH_URL` | Actual public HTTPS **API origin** for the deployed `engram-api` Worker, without `/api` or a trailing path |
| `APP_ORIGINS` | `https://mavioni.github.io`; other allowed origins comma-separated, without a `/Engram/` path |

The Worker deployment workflow runs on pushes to **master** touching `server/**` or its own workflow, or by manual dispatch. It fails explicitly if any required input is missing. It does not silently deploy a Worker with nonfunctional authentication.

No wildcard or unverified public origin should be placed in `APP_ORIGINS`.

## 2. Confirm Cloudflare infrastructure

- Confirm that the target Cloudflare account owns the intended `engram-api` Worker and `engram` D1 database.
- Check the D1 binding and identifier in `server/wrangler.toml`.
- Map and verify the URL configured as `BETTER_AUTH_URL` to this specific Worker; if using a custom hostname, configure the Worker route or domain in Cloudflare before expecting the smoke test to pass.
- Plan production backups and migration recovery before importing actual user content.
- Treat the first migration run as a real schema change. Review **all** SQL migrations in `server/src/db/migrations`; do not assume they are safe on a database with existing production data.

The workflow discovers migrations in `server/src/db/migrations`, the path used by `wrangler.toml`. It executes `d1 migrations apply engram --remote` before deploying. It does **not** use `--persist-to`, which is a local-only flag.

If the migration step fails, deployment stops. Inspect the error and the D1 migration ledger before rerunning. Do not reset a live D1 database to make CI pass.

## 3. Deploy and verify

From GitHub Actions, run **Deploy Worker** on `master`, after setting the production environment and confirming the migrations are reviewed.

A successful workflow proves only these automated checks:

1. The Worker typechecks.
2. Remote D1 migrations report successful application.
3. Wrangler reports Worker deployment success.
4. `GET /` on the configured public API origin responds with `{ "ok": true, "service": "engram-api" }`.
5. `GET /api/me` without credentials responds **401**, not 200 or 503.
6. That API response contains a CORS allow-origin header for `https://mavioni.github.io`.
7. `GET /api/auth/get-session` responds HTTP 200 without a session.

These checks **do not** prove user sign-up, session cookies, authorized persistence, browser authentication, cloud upload, or cross-device data restoration.

## 4. Cross-origin authentication risk

The GitHub Pages site and a `workers.dev` or separate API domain are different sites. Cookie-based authentication across these origins can be blocked by browsers' third-party cookie policies. A valid CORS response is **not** proof that cookies persist.

Before implementing cloud sync, test an actual browser login/session/logout cycle under the planned production origins. Prefer a verified same-site client/API deployment or a carefully designed browser-compatible authentication strategy over weakening cookie security. Do not add client-side long-lived secrets.

The current static website must retain local behavior until sign-in and account ownership are verified.

## 5. Connected Notebook acceptance gates

- [ ] Create an account and sign in from the public client.
- [ ] Verify session persistence, logout invalidation, and secure cookie behavior on target desktop/mobile browsers.
- [ ] Apply the `0006_notebook_entries.sql` migration and verify it through authenticated CRUD.
- [ ] Create a test note, journal, task and mood, then retrieve them only as the owning user.
- [ ] Confirm a second account cannot read or mutate those records, including guessing entry IDs.
- [ ] Verify revision conflicts return 409 without silently dropping either copy.
- [ ] Test opt-in upload of existing local pages, with preview, counts, and explicit user consent.
- [ ] Test second-device download and merging, duplicate IDs, tombstones/deletion, and backup restoration.
- [ ] Verify account deletion and retention rules; document how data leaves the system.
- [ ] Test broken connections, session expiry, migration rollback, and production observability.

Only then may the UI claim **cloud sync connected**. The IRIS AI interface and agent features are separate gates and must not be implied by backend deployment.

## 6. Safe rollback

If migration or deployment fails, leave the public Pages Notebook local-only. Review Cloudflare deployment history and D1 recovery options; revert Worker deployment only after checking whether the new code has changed data formats. A prior Worker version is not guaranteed to be compatible with a forward-only schema migration. Preserve user data over restoring a green dashboard.
