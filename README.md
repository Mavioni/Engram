# Engram

Engram — a quiet companion for your inner life.

A personal AI journaling and reflection app. Native iOS + Android via Capacitor, with a Cloudflare Workers edge API and Anthropic Claude powering the conversational layer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Native shell | Capacitor 6 (iOS WKWebView / Android WebView) |
| UI framework | React 18 + Vite 5 |
| State | Zustand 5 |
| Auth | Better Auth (cookie-bound, HttpOnly) |
| Edge API | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite at edge) |
| Cache / ephemera | Cloudflare KV |
| AI model | Anthropic Claude Sonnet 4.6 (prompt-cached) |

---

## Repository Layout

```
src/
  screens/        React screen components (one file per screen)
  components/     Shared primitives, icons, panels
  styles/         Global CSS tokens and base styles
server/           Cloudflare Worker source (edge API, /api/*)
docs/             Architecture, ADRs, vision, doctrine
screenshots/      UI reference screenshots
```

---

## Quickstart

```bash
npm install
npm run dev          # Vite dev server (browser)
npm run ios          # Sync + open Xcode
npm run android      # Sync + open Android Studio
```

Other scripts:

```bash
npm run lint         # ESLint (zero warnings required)
npm run typecheck    # tsc --noEmit
npm run test:e2e     # Playwright
npm run build        # Production Vite build
npm run sync         # cap sync (after build)
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values before running locally.
For the Cloudflare Worker, all secrets are bound via `wrangler secret put` — they are never committed and never exposed to the device.

See `.env.example` for the full list of required variables.

---

## License

MIT — see [LICENSE](LICENSE).
