# Secrets & Credentials

## Where secrets live

| Secret | Location | Committed? | Notes |
|--------|----------|------------|-------|
| `ANTHROPIC_API_KEY` | `server/.dev.vars` (local) / Cloudflare secret (prod) | No | Anthropic Console |
| `BETTER_AUTH_SECRET` | `server/.dev.vars` (local) / Cloudflare secret (prod) | No | 32+ random chars |
| `BETTER_AUTH_URL` | `server/.dev.vars` (local) / `wrangler.toml` [vars] (prod) | Prod URL only | Not secret; safe in config |
| `APPLE_CLIENT_SECRET` | `server/.dev.vars` (local) / Cloudflare secret (prod) | No | Private key JWT; rotate yearly |
| `GOOGLE_CLIENT_SECRET` | `server/.dev.vars` (local) / Cloudflare secret (prod) | No | Google Cloud Console |
| `VITE_APPLE_CLIENT_ID` | `.env` (local) / build env (CI) | Template only | Public OAuth client ID |
| `VITE_GOOGLE_CLIENT_ID` | `.env` (local) / build env (CI) | Template only | Public OAuth client ID |
| `VITE_REVENUECAT_IOS_KEY` | `.env` (local) / build env (CI) | Template only | Public RevenueCat SDK key |
| `VITE_REVENUECAT_ANDROID_KEY` | `.env` (local) / build env (CI) | Template only | Public RevenueCat SDK key |

## Gitignored files (never commit)

- `.env` — frontend secrets / public IDs with real values
- `server/.dev.vars` — backend secrets for local Wrangler dev

## Committed templates (safe to commit — placeholders only)

- `.env.example` — frontend template
- `server/.dev.vars.example` — backend template

## Generating BETTER_AUTH_SECRET

```sh
openssl rand -base64 32
```

Or with Node.js:

```js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Minimum length: 32 characters. Store the output in `.dev.vars` locally and as a
Cloudflare secret in production (see below).

## Provisioning secrets in production (Cloudflare Workers)

Use `wrangler secret put` for each secret value:

```sh
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
wrangler secret put APPLE_CLIENT_SECRET
wrangler secret put GOOGLE_CLIENT_SECRET
```

Each command prompts for the value interactively so it is never written to shell history.

To list currently provisioned secrets (values hidden):

```sh
wrangler secret list
```

## Rotation procedure

1. Generate a new value (use the snippet above for `BETTER_AUTH_SECRET`).
2. Run `wrangler secret put <KEY>` with the new value — Cloudflare replaces atomically.
3. Update your local `server/.dev.vars` to match.
4. For OAuth secrets (`APPLE_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET`), revoke the old
   credential in the provider console before or immediately after rotation.
5. Redeploy the Worker (`wrangler deploy`) to pick up the new binding.

## On compromise

If any secret is suspected exposed:
1. Rotate immediately via provider console + `wrangler secret put`.
2. Audit Cloudflare Worker logs for anomalous requests.
3. Check git history — if a real value was ever committed, treat it as permanently
   compromised and rotate regardless of whether the commit was later removed.
