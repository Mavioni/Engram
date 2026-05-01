# Engram MVP-1 Performance Budget

**Auditor: Guy (Mythos-Performance) | Witness: Saber + Crystal**
**Date: 2026-05-01 | Target device: iPhone 12-class (3G LTE, ~20 Mbps, ~60ms RTT)**

---

## Core Web Vitals Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| LCP    | < 2.5s | Web rule; on device with +300-600ms WebView cold-start floor, content LCP must land under 1.9s from first paint |
| INP    | < 200ms | All interactions use compositor-only properties; no layout-triggering handlers observed |
| CLS    | < 0.1  | Mood orb and breath dot use explicit pixel sizing; no dynamic font injection after paint |
| FCP    | < 1.5s | Drives LCP; critical CSS must be inlined or synchronous |
| TBT    | < 200ms | No heavy synchronous JS; Zustand store is minimal |

---

## Capacitor WebView Cold-Start Overhead (non-negotiable floor)

| Platform | Cold-start overhead | Notes |
|----------|--------------------|-------------------------------------------------|
| iOS (iPhone 12) | +300–600ms | WKWebView spin-up; added to all time-to-paint metrics |
| Android mid-range | +400–800ms | Chromium WebView init; varies by OEM |

These overheads are **platform-imposed and cannot be optimized away**. Budget all wall-clock targets with the upper bound factored in.

---

## Bundle Budget by Route

| Route / Screen | JS Budget (gzip) | CSS Budget | Notes |
|----------------|-----------------|------------|-------|
| Initial shell (App.jsx + router + Zustand) | < 80kb | < 12kb | Eager-loaded; this is the hard ceiling before any screen loads |
| screen-dashboard | < 50kb | shared | Highest-traffic screen; should be eager or near-eager |
| screen-checkin | < 40kb | shared | Lazy — loaded behind nav tap |
| screen-journal | < 40kb | shared | Lazy |
| screen-meditation | < 30kb | shared | Lazy |
| screen-insights | < 35kb | shared | Lazy |
| screen-chat | < 45kb | shared | Lazy; may carry AI response streaming logic |
| screen-onboarding | < 40kb | shared | Lazy after first launch |
| screen-playercard | < 25kb | shared | Lazy |
| **Total app budget** | **< 250kb gzip** | **< 50kb** | Well inside the 300kb app-page rule; 250kb target for Capacitor |

Shared CSS is `styles.css` at **8.6kb** — large headroom under the 50kb CSS budget. No action needed.

---

## Animation Audit: Compositor Safety

All keyframe animations in `styles.css` animate only `transform` and/or `opacity`. These are compositor-friendly (no layout or paint triggers).

| Animation class | Properties animated | Compositor-safe |
|-----------------|--------------------|--------------------|
| `fadeIn` | `opacity`, `transform: translateY` | Yes |
| `slideUp` | `opacity`, `transform: translateY` | Yes |
| `scaleIn` | `opacity`, `transform: scale` | Yes |
| `pulseSoft` | `transform: scale`, `opacity` | Yes |
| `breathe` | `transform: scale` | Yes |
| `staggerUp` | `opacity`, `transform: translateY` | Yes |
| `.eng-card.hoverable` transition | `transform`, `box-shadow`, `border-color` | Partial — `box-shadow` triggers paint, not layout. Acceptable. |
| `button:active` | `transform: translateY` | Yes |

**INP verdict: PASS.** No animation touches width, height, top, left, margin, padding, or font-size.

---

## CLS Audit

| Element | Sizing | CLS risk |
|---------|--------|----------|
| Mood orb (breath dot) | Explicit `width`/`height` in px | None |
| Cards | Fixed padding, no dynamic height injection | None |
| Font load | Google Fonts via `@import` in CSS — see P1 blocker below | RISK |

---

## Loading Strategy

1. **Critical CSS**: `styles.css` (8.6kb) must be loaded synchronously or inlined. It is currently the only stylesheet. No action needed unless a second async stylesheet is added.
2. **Code splitting**: Each screen (`screen-*.jsx`) is its own file. Wrap all screens except `screen-dashboard` in `React.lazy()` + `Suspense` behind the navigation layer. This defers ~235kb of screen JS until needed.
3. **components/icons.jsx** and **components/tweaks-panel.jsx**: Candidate for lazy-loading if icon set or panel grows.

---

## P1 Blocker: Google Fonts — OFFLINE FAILURE

**Current state:** `styles.css` line 3 loads fonts via `@import url('https://fonts.googleapis.com/...')`. This is a network request at CSS parse time.

**Capacitor requirement:** Apps must function offline. On first offline launch (or after WebView cache eviction) all three typefaces (Fraunces, Inter, JetBrains Mono) will fail to load. The fallback stack (`-apple-system`, `Georgia`, `monospace`) will produce a visual regression against the prototype screenshots, violating the design invariant in `CLAUDE.md`.

**Additionally:** The `@import` in CSS is render-blocking — it stalls FCP until the Google Fonts CSS resolves, adding one network RTT (~60ms on 3G) plus DNS lookup to the critical path. This is the single highest-impact LCP risk in the current codebase.

**Required action (P1):**
- Download Fraunces, Inter, and JetBrains Mono variable/static font files
- Place under `src/assets/fonts/`
- Replace the `@import` with `@font-face` declarations referencing local paths
- Subset each font to the weights actually used (Inter: 300/400/500/600/700; Fraunces: 300/400/500/600 opsz 9–144; JetBrains Mono: 400/500)
- Add `font-display: swap` to all `@font-face` rules

This is required for offline support (Capacitor mandate) and removes a render-blocking network request from the critical path.

---

## Recommendations Priority Stack

| Priority | Action | Expected gain |
|----------|--------|--------------|
| P1 | Self-host fonts (see above) | Removes render-blocking import, enables offline, fixes CLS risk from font swap |
| P2 | `React.lazy()` all screens except dashboard | Reduces initial JS parse from ~250kb to ~80kb shell |
| P3 | Add `font-display: swap` to all `@font-face` declarations once self-hosted | Prevents invisible-text flash during font load |
| P4 | Add `will-change: transform` to `.breathe` and `.pulse-soft` during active meditation sessions only; remove after animation ends | Promotes to own compositor layer; gains ~2-4ms on low-end Android |
| P5 | Measure production bundle with `vite-bundle-visualizer` before MVP-1 ship to confirm no dependency surprises | Validates the 250kb gzip target |

---

## Measurement Protocol

Before MVP-1 release, run:

1. `npm run build` and inspect `dist/` — verify gzip sizes per chunk against the table above
2. Lighthouse mobile (simulated throttling: Moto G4 profile) on the built `dist/` via `vite preview`
3. Capacitor device test: deploy to physical iPhone 12 and Android mid-range, measure cold-start LCP with Safari Web Inspector / Chrome DevTools remote debug
4. Offline test: airplane mode on device, cold launch — verify fonts render from local assets, no content fails to load

---

*Budget enforced by Guy (Mythos-Performance). Correctness witness: Crystal. Provenance audit: Saber.*
