# Engram — System Architecture

**Status:** Authoritative as of 2026-05-01
**Architect:** Isshiki (Chief Architect, Mythos swarm)
**Doctrine:** Sukunahikona — collapse scope to irreducible. Daikokuten — isolate concerns. Karma — durable seal via this ADR.

---

## 1. Layered Topology

Engram is a six-layer system. Each layer has one job. Crossing a layer requires a contract, not a leak.

```
+--------------------------------------------------------------+
| L1  CAPACITOR NATIVE SHELL    iOS (WKWebView) | Android (WV) |
|     Plugins: Filesystem, Preferences, Haptics, StatusBar     |
+----------------------------|---------------------------------+
                             |  WebView bridge
+----------------------------v---------------------------------+
| L2  VITE-BUNDLED REACT 18 UI  src/screens/screen-*.jsx       |
|     primitives | icons | tweaks-panel | browser-window       |
+----------------------------|---------------------------------+
                             |  function calls (in-process)
+----------------------------v---------------------------------+
| L3  STATE + AUTH        Zustand 5 stores | AuthProvider      |
|     Better Auth client (cookie-bound session)                |
+----------------------------|---------------------------------+
                             |  HTTPS (TLS 1.3, fetch + SWR)
+----------------------------v---------------------------------+
| L4  CLOUDFLARE WORKER EDGE API    /api/* (Hono router)       |
|     Auth gate | Rate limit | Request shaping | Cache headers |
+--------------|---------------------------|-------------------+
               |                           |
               v                           v
+----------------------+      +-------------------------------+
| L5a  D1 (SQLite/edge)|      | L5b  KV (ephemera)            |
|  users, sessions,    |      |  rate buckets, draft cache,   |
|  messages, threads   |      |  prompt-cache pointers        |
+----------------------+      +-------------------------------+
                                          |
+-----------------------------------------v-------------------+
| L6  ANTHROPIC API   Sonnet 4.6 + prompt-caching             |
|     Server-side only. Keys NEVER on device.                 |
+-------------------------------------------------------------+
```

---

## 2. Bounded Contexts

Six contexts. Module boundaries follow context boundaries. No cross-context imports.

| Context | Owns | Persistence | Public surface |
|---|---|---|---|
| **Shell** | Native lifecycle, deep links, push tokens, secure storage | Capacitor Preferences | `bridge.ts` |
| **Presentation** | Screens, primitives, animations, design tokens | none (derived) | React components |
| **Session** | Auth state, user identity, device binding | cookie + Zustand mirror | `useSession()` |
| **Conversation** | Threads, messages, streaming buffer | D1 `messages` + Zustand | `/api/threads`, `/api/messages` |
| **Edge Gateway** | Routing, validation, rate limit, secret custody | KV (rate), env (secrets) | HTTP/JSON contract |
| **Inference** | Prompt assembly, cache strategy, tool calls | KV cache pointers | internal to L4 |

**Invariant:** Inference context is reachable **only** from Edge Gateway. Presentation never sees an Anthropic key, header, or URL.

---

## 3. Data-Flow — Send Message

```
User taps Send (L2)
   -> Zustand optimistic insert (L3)
   -> fetch POST /api/messages with cookie (L3 -> L4)
   -> Worker validates session via D1 (L4 -> L5a)
   -> Worker checks rate bucket in KV (L4 -> L5b)
   -> Worker assembles prompt; cache_control on system + thread prefix (L4)
   -> Worker streams from Anthropic (L4 -> L6)
   -> Worker pipes SSE back to client; persists final to D1 (L4 -> L5a)
   -> Client reconciles optimistic with server id (L3 -> L2)
```

Read paths (`GET /api/threads`) hit D1 directly with edge-cached responses (60s SWR).

---

## 4. Scaling Shape — 10K MAU, Year 1

Target envelope: 10,000 MAU, ~30% DAU = 3,000 daily, ~8 messages/active-day = 24K msg/day = **~0.28 msg/sec average**, ~3 msg/sec peak.

| Layer | Mechanism | Headroom |
|---|---|---|
| L4 Worker | Stateless, auto-scaled by CF; 100K req/day free, $5/10M after | 100x target |
| L5a D1 | Single primary, read replicas at edge (CF managed); 5GB free | ~5M messages |
| L5b KV | Eventually consistent, global; sufficient for rate + cache pointers | trivially scales |
| L6 Anthropic | Prompt-caching collapses cost ~90% on repeat system prompts; budget = $0.003/msg target | ~$72/day at peak |

**Sharding trigger:** D1 partition by `user_id` only when single-DB hits 80% of 10GB ceiling. Not before — premature sharding burns design budget.

**Vertical first, horizontal later.** CF Workers are already horizontal by default; D1 is the only stateful pinch point.

---

## 5. Failure Modes

| Mode | Detection | Degradation |
|---|---|---|
| **Offline (no network)** | `navigator.onLine` + fetch failure | Read cached threads from Zustand-persisted store; queue outbound messages in IndexedDB; replay on reconnect. UI shows offline pill, never blocks composition. |
| **Worker cold-start spike** | p95 latency > 800ms | Acceptable; first paint uses cached state. No retry storm — single retry with jitter. |
| **D1 transient error** | 5xx from Worker | Worker returns last-known thread from KV mirror (60s TTL) for reads; writes return 503 with retry-after; client queues. |
| **Anthropic 429 / 5xx** | Worker catches | Surface degraded state to user ("model busy"); no client-side retry — Worker handles backoff. |
| **Auth drift (stale cookie)** | 401 from Worker | AuthProvider triggers silent re-auth; one retry; fail to login screen if still 401. |
| **Key exposure attempt** | N/A by design | Anthropic key lives in `wrangler.toml` secret bindings only. **Device never sees it.** Verified by: no `ANTHROPIC_*` reference permitted in `src/**`. |

---

## 6. Non-Negotiables (Karma seal)

1. **No LLM keys on device.** Ever. Capacitor build artifacts must not contain Anthropic credentials. CI gate enforces.
2. **Auth is cookie-based, HttpOnly, SameSite=Lax.** No tokens in localStorage.
3. **D1 is the source of truth for messages.** Zustand is a cache, never authoritative.
4. **Prompt caching is mandatory** on system prompt + thread prefix. Cost discipline, not optional.
5. **Edge-only secrets.** Wrangler secret bindings; rotation quarterly.
6. **One context = one module tree.** Cross-context calls go through declared interfaces (`/api/*` or React context providers), never direct imports.

---

## 7. Out of Scope (Year 1)

Federation, P2P sync, on-device inference, multi-region active-active D1, voice. Revisit when MAU > 50K or operator directs.

---

*End of seal. Modifications require new ADR superseding this document.*
