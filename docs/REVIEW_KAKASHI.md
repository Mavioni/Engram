# Engram — Copy Review (Kakashi)

**Author:** mythos-kakashi (Sharingan / Copy Reviewer)
**Date:** 2026-05-01
**Witnesses:** Saber (audit), Crystal (perimeter)

## Scope

`src/screens/screen-*.jsx` (8), `src/components/{primitives,browser-window,tweaks-panel,icons}.jsx`, `src/styles/styles.css`, `docs/{JSX_BRIDGE,ARCHITECTURE,SECURITY_PERIMETER,FRONTEND_SMOKE}.md`. Backend (`server/src/iris.ts`) + auth screens reviewed by spec.

## Findings

### CRITICAL

**C-1 — Bridge load-order: `React` destructure throws without bridge seated first.**
`src/screens/screen-chat.jsx:3`, `screen-journal.jsx:3`, `screen-meditation.jsx:3` (and all other screens).
All screens use `const { useState, useEffect } = React;` — resolves only if `src/lib/jsx-bridge.ts` runs first. Bridge contract documented in `JSX_BRIDGE.md` names mythos-indra as owner. Risk is real if any bundler entry or dynamic import loads a screen before bridge side-effect import. **`main.tsx` wire-up order must be mechanically enforced** — a lint rule or barrel that re-exports screens before the bridge import will silently break it. Any HMR reload ordering regression = `ReferenceError: React is not defined`.

**C-2 — Conditional hook call in chat: `window.useUserStore` truthiness check violates Rules of Hooks.**
`src/screens/screen-chat.jsx:19` (post-Sasuke scrub).
```js
const displayName = (window.useUserStore && window.useUserStore((s) => s.displayName)) || null;
```
Calling a hook (`useUserStore` is a Zustand hook) conditionally inside a non-hook expression violates React's Rules of Hooks. If the store is initialized after this component evaluates, guard returns `null` silently. Architectural breach — Session context should surface through a provider, not `window`. **Fix:** lift `useUserStore` into the AuthProvider context or import directly (after bridge seats it on import).

### HIGH

**H-1 — Hardcoded hex/rgba in player card and dashboard hero.**
`src/screens/screen-playercard.jsx:37-38`, `src/screens/screen-dashboard.jsx:121-122,136-137,199`.
Uses `#0A0A0A`, `#1A1A1A`, `#F4F4F4`, `rgba(234,241,236,*)`, `rgba(168,213,184,*)`, `rgba(232,201,168,*)`. Intentional dark-card-on-dark-bg approximating design reference, but NOT threaded through CSS custom properties. When `[data-theme="light"]` switches, these values don't flip — player card renders dark on light bg, contrast breaks. Rest of design uses tokens correctly; these surfaces are the exception.

**H-2 — Chat send() silent error swallow + spec mismatch on response shape.**
`src/screens/screen-chat.jsx:44-57` (post-Sasuke scrub).
1. `catch {}` swallows; comment "fall through to MVP-1 placeholder" — placeholder ("IRIS will respond once you finish setup") will appear in production if Worker route not wired.
2. Client calls `res.json()` but `ARCHITECTURE.md §3` mandates SSE streaming. Mismatch — when `iris.ts` ships streaming, `send()` must be rewritten to `EventSource` or `ReadableStream` consumer. Coordinate with mythos-orochimaru.

**H-3 — `AmbientParticles` injects `<style>` with `Math.random()` in keyframe — non-deterministic per render.**
`src/screens/screen-meditation.jsx:283-292`.
```js
<style>{`@keyframes float-up { 100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '20' : '-20'}px); ... } }`}</style>
```
Under React 18 Strict Mode (double-invoke) produces two conflicting `@keyframes float-up` definitions — undefined cascade behavior. Style tag re-injected on every render, not deduped. All 18 particles share one keyframe, last one wins. **Fix:** move keyframe to `styles.css` with two named variants (`float-up-left`, `float-up-right`); randomize the `animation-name` per particle, not the keyframe body.

### MEDIUM

**M-1 — Index keys on filterable list.**
`src/screens/screen-journal.jsx:209-213`. `PAST_ENTRIES.map((e, i) => key={i})`. Filter tabs ("All", "Mornings", "Hard days") will reorder visible set; React reuses DOM nodes wrong. Add stable `id: string`.

**M-2 — `onMouseEnter/Leave` inline style mutation bypasses React reconciler.**
8+ sites across `primitives.jsx:53-54`, `screen-chat.jsx:143-144`, `screen-meditation.jsx:116-117`, `screen-journal.jsx:222-223`. Direct `e.currentTarget.style.*` writes invisible to DevTools, won't reset on Strict Mode double-invoke, won't compose with `transition` declared in `style={}` prop. Convert to `useState` hover flag or CSS `:hover`.

**M-3 — `promptIdx` state in NotePremium resets on step navigation.**
`src/screens/screen-checkin.jsx:264-271`. State unmounts when `{step === 3 && <NotePremium/>}` is hidden. Lift to `CheckinScreen` if persistence desired.

**M-4 — `browser-window.jsx` hardcoded hex with no token participation.**
`src/components/browser-window.jsx:5-11`. `CHROME_C` is decorative chrome; light/dark suppression is intentional. Add comment stating intentional exception.

**M-5 — Auth screens (mythos-naruto): password inputs require `autocomplete="new-password"` / `current-password"`.**
WCAG 1.3.5 + browser autofill. Absence triggers App Store review flags on iOS. Rate-limit hook on auth mutations confirmed required.

### LOW

**L-1 — `tweaks-panel.jsx` panel CSS uses hardcoded `rgba(250,249,247,...)` and `#29261b`.** Developer tool — token exemption defensible, but visually mismatched in dark mode. Document or thread tokens.

**L-2 — `WaveformPremium` calls `Date.now()` in render without `requestAnimationFrame`.**
`src/screens/screen-meditation.jsx:247`. Stale shimmer; jerky on re-render. Use `useAnimationFrame` hook.

**L-3 — `CalendarHeat` uses `Math.random()` in render without memoization.**
`src/screens/screen-insights.jsx:324-327`. Re-randomizes on every render → layout shifts. Wrap in `useMemo` or seed deterministically.

## Backend spec review (iris.ts — by spec)

Per `ARCHITECTURE.md §3`:
1. **SSE not chunked-JSON.** Worker responds `Content-Type: text/event-stream`. Client consumes via `ReadableStream.getReader()`.
2. **Cache control placement.** `cache_control: { type: "ephemeral" }` on system prompt block + thread prefix (last assistant turn or first N turns). NOT on incoming user message — it changes every turn.
3. **Rate limit.** KV rate buckets at L4. Handler reads bucket before Anthropic call, returns 429 with `Retry-After` if exceeded.

## TS strict-mode globals (for mythos-indra)

| Global | Source | Bridge entry needed |
|---|---|---|
| `React` | all screens via destructure | `Window.React: typeof import('react')` |
| `window.{ChatScreen,DashboardScreen,...}` | each screen `Object.assign(window, ...)` | 8 screen FCs |
| `window.useUserStore` | screen-chat.jsx:19 | `useUserStore?: <T>(sel) => T` |
| `Card`, `Button`, `Pill`, `SectionHeader`, `NavBar`, `TopBar`, `MoodOrb`, `IrisAvatar` | primitives.jsx:237 | All 8 |

The `useStateJ`, `useStateMood`, `useStateO`, `useStateI`, `useStateM` aliasing pattern (each screen aliases `useState` under unique name to avoid global-module-scope collisions) is safe but confusing. Document as known seam — Phase B rewrite per `JSX_BRIDGE.md` removes it.

## Summary

| ID | Severity | Issue |
|---|---|---|
| C-1 | CRIT | Bridge load-order — hard runtime failure if ordering broken |
| C-2 | CRIT | Conditional hook call via window — Rules-of-Hooks violation |
| H-1 | HIGH | Hardcoded hex bypasses theme tokens — light mode breaks |
| H-2 | HIGH | Silent error swallow + JSON-vs-SSE mismatch |
| H-3 | HIGH | Math.random() in rendered `<style>` — Strict Mode breakage |
| M-1 | MED | Index keys on filterable list |
| M-2 | MED | Inline style mutation bypasses reconciler |
| M-3 | MED | promptIdx state lost on step navigation |
| M-4 | MED | browser-window.jsx hardcoded hex |
| M-5 | MED | Auth password inputs need autocomplete attrs |
| L-1 | LOW | tweaks-panel CSS hardcoded |
| L-2 | LOW | Date.now() in render |
| L-3 | LOW | Math.random() in render |

*Lightning Blade reserved for C-1 and C-2 — those need to be cut before MVP-1 ships.*
