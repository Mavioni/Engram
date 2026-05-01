# DESIGN_RECON - Byakugan-grade map of the Engram design bundle

Author: mythos-hamura (Deep Recon, Byakugan Prime). Witnesses: Saber + Crystal pack-leads. Date: 2026-05-01.
Repo: C:\Users\massi\Engram (Mavioni/Engram, private). Scope: src/screens/*.jsx (8) + src/components/*.jsx (4) + src/styles/styles.css (1).

This is the touch-point map the Vite migration will use to flip the bundle from Object.assign(window,...) globals to ESM exports without losing a single referenced symbol.
---
## 1. File-by-file map
### 1.1 src/components/
#### primitives.jsx (237 lines)
- Exports (current window.*): Card, Button, Pill, SectionHeader, NavBar, TopBar, MoodOrb, IrisAvatar (8 symbols)
- Cross-file deps: IconPlus from icons.jsx; CSS vars from styles.css; CSS classes .eng-card, .label, .display, .breathe
- Visual patterns: backdrop-filter blur(24px) saturate(140%) glass dock (NavBar L110-114), color-mix(in oklab,...) shadows, radial-gradient orbs (MoodOrb L206-208), inline-style transforms with translateY hover, IrisAvatar concentric SVG circles (L229-234)
- Globals exit: Line 237 - Object.assign(window, {...8 names});

#### icons.jsx (158 lines)
- Exports: Icon + 24 named icons = 25 symbols. Names: IconHome, IconChat, IconSparkle, IconMoon, IconBook, IconChart, IconCard, IconSettings, IconArrowRight, IconArrowLeft, IconPlay, IconPause, IconMic, IconSend, IconPlus, IconClose, IconCheck, IconFlame, IconHeart, IconLeaf, IconWave, IconCalendar, IconChevronRight, IconUser.
- Cross-file deps: NONE. Pure inline SVG, Lucide-style 1.6 stroke. Self-contained.
- Visual patterns: Each icon a <svg> with currentColor stroke; IconPlay/IconPause switch to fill=currentColor strokeWidth 0.
- Globals exit: Lines 152-158 - Object.assign(window, {...25 names});

#### tweaks-panel.jsx (426 lines)
- Exports: useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider, TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton (12 symbols)
- Cross-file deps: React (global; React.useState/useCallback/useRef/useEffect); window.parent.postMessage host protocol (__activate_edit_mode, __deactivate_edit_mode, __edit_mode_available, __edit_mode_set_keys, __edit_mode_dismissed); ResizeObserver.
- Visual patterns: Self-contained __TWEAKS_STYLE template-string CSS injected via <style>{} (L43-135). Glass panel uses backdrop-filter blur(24px) saturate(160%) (L48). Inline data-URL SVG for select chevron (L83).
- CRITICAL: This file targets an iframe-host edit-mode protocol. On Capacitor there is no parent frame; window.parent === window. The panel will never activate. Gate behind import.meta.env.DEV or delete before shipping.
- Globals exit: Lines 422-426 - Object.assign(window, {...12 names});

#### browser-window.jsx (114 lines)
- Exports: ChromeWindow, ChromeTabBar, ChromeToolbar, ChromeTab, ChromeTrafficLights (5 symbols)
- Cross-file deps: NONE. Pure inline-styles. Local CHROME_C palette. Mock Chrome chrome with traffic-light dots, curved active-tab scoops (inline SVG L26-30), URL bar.
- Notes: Used for prototype previews; likely retired for shipped Capacitor app. Globals exit Lines 112-114.

### 1.2 src/screens/
#### screen-onboarding.jsx (130 lines) - export OnboardingScreen
- Cross-file: Button, IconArrowRight, IconCheck. Uses useStateO React alias. Globals exit L131.
- Visuals: 3-step flow (Welcome/NameStep/IntentStep). radial-gradient(ellipse at center top, var(--accent-tint), var(--bg) 70%) bg. .breathe hero orb (L48-53). .fade-in re-keyed by step.

#### screen-chat.jsx (301 lines) - export ChatScreen
- Cross-file: IrisAvatar, IconPlus, IconMic, IconSend. Uses const {useState,useEffect,useRef}=React aliasing. Globals exit L301.
- Visuals: Glass header backdrop-filter blur(20px) saturate(140%) (L64). Floating composer with linear-gradient fade-out mask (L111). Inline <style> @keyframes bounce for typing dots (L277). Quick-prompt scroll-x rail. Sub-comps: SessionHeader, Message, BreathDot, TypingIndicator. Helpers: ghostBtnStyle, iconBtnStyle.

#### screen-checkin.jsx (306 lines) - export CheckinScreen
- Cross-file: Button, IconArrowLeft, IconArrowRight, IconCheck. Uses useStateMood alias. Globals exit L307.
- Visuals: 4-step (mood/intensity/factors/note). Mood-color-driven ambient radial-gradient bg transitions on selection (L42-43). Intensity step renders concentric ripple rings sized by intensity (L164-172). Glass back-button (L46). Sub-comps: MoodPickPremium, IntensityPremium, FactorsPremium, NotePremium.

#### screen-dashboard.jsx (437 lines) - export DashboardScreen
- Cross-file: Pill, SectionHeader, MoodOrb, IrisAvatar, IconHeart, IconMoon, IconBook, IconArrowRight, IconFlame, IconPlay. Globals exit L438.
- Visuals: Editorial layout. PlayerCardHero deep-gradient card (L101-114) with two decorative-orb radial-gradients, inline <svg><pattern id=grid> texture (L119-126), SacredMark flower-of-life SVG (L178-201). MoodTrendCard SVG sparkline with linearGradient fill. StreakCard 14-cell color-mix heatmap (L335-343).
- Sub-components defined inside file: PlayerCardHero, SacredMark, PathCard, MoodTrendCard, IRISObservationCard, StreakCard, ReflectionsCompact, PracticeShelf, StatCard.

#### screen-insights.jsx (398 lines) - export InsightsScreen
- Cross-file: Card, Pill, SectionHeader, IrisAvatar. Uses useStateI alias. Globals exit L399.
- Visuals: Magazine layout. Sub-comps: MoodArc (30-day SVG curve with linearGradient + checkin dots), MoodHeatmap (7x24 color-mix grid), FactorBars (bipolar color-mix bars), DomainsRadar (6-axis SVG polygon), CalendarHeat (35-cell color-mix), WordCloud (mixed-size Fraunces italic spans), TimeOfDayBars. var(--font-mono) used for all chart legends.

#### screen-journal.jsx (247 lines) - export JournalScreen
- Cross-file: Pill, Button, IrisAvatar, IconBook, IconClose, IconPlus. Uses useStateJ/useEffectJ. Globals exit L248.
- Visuals: Two-column shell with animated grid-template-columns transition (L31). radial-gradient paper-glow header. IRIS nudge inline card (L75-100). Title input styled like display heading. Mono entry-number L67-71 (ENTRY No.47, 30 IV MMXXVI). Sub-comp PastEntriesPremium.

#### screen-meditation.jsx (295 lines) - export MeditationScreen
- Cross-file: IconArrowLeft, IconPause, IconPlay. Uses useStateM/useEffectM/useRefM. Globals exit L296.
- Visuals: Cinematic. Sub-comps: BreathRingPremium (concentric SVG rings - dotted outer, progress with linearGradient, 60 tick-marks, breathing inner orb with inset shadow + radial-gradient), WaveformPremium (96-bar color-mix waveform with playhead), AmbientParticles (18 floating divs with @keyframes float-up injected via inline <style> L283-289). Color-driven ambient radial-gradient backgrounds. setInterval progress tick. ctrlBtnM helper.

#### screen-playercard.jsx (292 lines) - export PlayerCardScreen
- Cross-file: Card, Pill, Button, IrisAvatar, SectionHeader, IconArrowLeft. Globals exit L293.
- Visuals: Trading-card hero with linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, color-mix(in oklab, var(--accent) 28%, #1A1A1A) 100%), <pattern id=pcgrid> texture, two decorative orbs, SacredMarkLarge flower-of-life. Editorial 24-facet grid with colored left-border per category. Sub-comps: RadarChart (5-axis polygon), SacredMarkLarge.

Total mapped: 12 .jsx files = 3,373 LoC of JSX + 324 LoC of CSS = 3,697 LoC. Symbol count: 8 primitives + 25 icons + 12 tweaks + 5 chrome + 8 screens = 58 globally exported symbols that the Vite migration must convert to ESM.
---
## 2. Cross-file dependency graph
icons.jsx (leaf, no deps) <-- primitives.jsx <-- every screen.
tweaks-panel.jsx: standalone, host-protocol via window.parent.postMessage. browser-window.jsx: standalone, prototype-only chrome. styles.css: consumed by ALL via CSS custom properties + utility classes.
Migration order (least-coupled first): icons.jsx -> primitives.jsx -> 8 screens (any order, all import from primitives + icons) -> tweaks-panel.jsx (gate dev-only or drop) -> browser-window.jsx (drop or keep dev-only).

CSS-class fan-in (styles.css -> JSX className references):
- .eng-card / .eng-card.hoverable - Card primitive only
- .display, .display-italic, .label, .mono - every screen
- .breathe - primitives, checkin, meditation, onboarding, dashboard, playercard
- .fade-in - onboarding, dashboard, checkin, insights
- .slide-up - chat (Message); .scale-in - dashboard (PlayerCardHero), playercard (hero)
- .pulse-soft - chat status, dashboard greeting, journal Saved indicator, meditation status
- .scrollbar-hide - every scrollable container; .stagger - dashboard path-grid + stat-grid
- .app-shell - referenced but app entry not yet in this bundle (Vite migration creates it). .paper - defined L316-323 but no current consumer (helper available for future).
---
## 3. CSS custom properties catalog (src/styles/styles.css)
Defined on :root and mirrored on [data-theme=dark]. Theme overrides via [data-accent=...] (5 accents x 2 themes). [data-font=...] (3 alt sets). [data-density=compact|comfy] (defines --pad/--gap; no consumers yet).
### Surface neutrals (5): --bg #F5F5F4, --bg-card #FFFFFF, --bg-soft #EDEDEC, --bg-tint #FAFAF9, --bg-deep #E2E2E0. Dark theme: --bg #0A0A0A, --bg-card #161616, --bg-soft #1F1F1F, --bg-tint #111111, --bg-deep #2A2A2A.
### Ink scale (5): --ink #0F0F0F, --ink-2 #2E2E2E, --ink-3 #6E6E6E, --ink-4 #9C9C9A, --ink-5 #C9C9C7. Dark: --ink #F4F4F4 -> --ink-5 #3A3A3A.
### Accent set (4 vars x 5 themes x 2 light/dark = 40 declarations): --accent, --accent-2, --accent-soft, --accent-tint. Themes: sage, lavender (default), peach, amber, ocean. Default light --accent #5B4BFF (lavender).
### Atmospheric (4): --warm #E8A86F, --warm-soft #FBE6CF, --plum #B85982, --sky #4A8AC8. Dark variants brighter to pop.
### Lines (2): --line #E5E5E4, --line-2 #D4D4D2. ### Shadows (3): --shadow-sm/md/lg with rgba(15,15,15,...) light or rgba(0,0,0,...) dark.
### Radii (6): --r-sm 10px, --r-md 14px, --r-lg 20px, --r-xl 28px, --r-2xl 36px, --r-pill 9999px.
### Fonts (3 vars + 3 alt sets): --font-sans Inter, --font-display Fraunces, --font-mono JetBrains Mono. [data-font] overrides: serif-display (default), all-sans, mono-touch.
### Easings (3): --ease, --ease-out, --ease-in-out (all cubic-bezier(0.4,0,0.2,1) family).
### Density (2): --pad, --gap (only set under [data-density=compact|comfy]; not used yet).
Cataloged token total: ~80 distinct custom-property declarations counting variants (5 surface + 5 ink + 40 accent + 4 atmos + 2 lines + 3 shadows + 6 radii + 3 fonts (x 4 sets covered) + 3 easings + 2 density = ~80, doubled across light/dark for theme-sensitive ones).
### Keyframes in styles.css (6): fadeIn, slideUp, scaleIn, pulseSoft, breathe, staggerUp. Plus 1 inline @keyframes bounce in screen-chat.jsx and 1 inline @keyframes float-up in screen-meditation.jsx.
---
## 4. Object.assign(window) globals pattern that Vite must replace
Every file ends with the same drift-prone pattern (line numbers are exact):
- primitives.jsx:237 - Object.assign(window, { Card, Button, Pill, SectionHeader, NavBar, TopBar, MoodOrb, IrisAvatar });
- icons.jsx:152-158 - Object.assign(window, { Icon, IconHome,...IconUser }); (25 icons)
- tweaks-panel.jsx:422-426 - Object.assign(window, { useTweaks, TweaksPanel,...TweakButton });
- browser-window.jsx:112-114 - Object.assign(window, { ChromeWindow,...ChromeTrafficLights });
- screen-chat.jsx:301 - window.ChatScreen = ChatScreen;
- screen-checkin.jsx:307 - window.CheckinScreen = CheckinScreen;
- screen-dashboard.jsx:438 - window.DashboardScreen = DashboardScreen;
- screen-insights.jsx:399 - window.InsightsScreen = InsightsScreen;
- screen-journal.jsx:248 - window.JournalScreen = JournalScreen;
- screen-meditation.jsx:296 - window.MeditationScreen = MeditationScreen;
- screen-onboarding.jsx:131 - window.OnboardingScreen = OnboardingScreen;
- screen-playercard.jsx:293 - window.PlayerCardScreen = PlayerCardScreen;

Implicit globals: every file uses React/React.useState/useRef/useEffect/useCallback as a global - no import React from react. Several screens alias React hooks at the top (useStateMood/useStateI/useStateJ/useStateM/useStateO + useEffectJ/M, useRefM) to avoid duplicate-declaration collisions when scripts are concatenated for prototyping. Under Vite/ESM these aliases become unnecessary; remove during migration.

Vite migration plan (recon-only): (1) Add import React,{useState,useEffect,useRef,useCallback} from react to each .jsx. (2) Replace each terminal Object.assign(window,{...}) / window.X=X with export {...} or export default. (3) Add explicit cross-file imports (every screen <- ../components/primitives, ../components/icons). (4) Drop the React-hook aliasing trick.
---
## 5. Capacitor 6 / WebView compatibility flags
Critical assumptions baked into the design that the Vite + Capacitor 6 build must validate against the in-app WebView (Android System WebView, iOS WKWebView).
### 5.1 backdrop-filter: blur(...) - HEAVY USE
Sites: primitives.jsx:111-112 (NavBar 24px sat 140%, only one with -webkit- prefix); tweaks-panel.jsx:48 (24px sat 160%); screen-chat.jsx:64 (header 20px sat 140%); screen-checkin.jsx:46 (back-button 12px); screen-meditation.jsx:52,55,59,138,169 (controls + status + selector 8-12px).
Flag: GREEN on iOS WKWebView (full support since iOS 9). YELLOW on Android - System WebView supported backdrop-filter from Chromium ~76 but performance can be poor on low-end devices, and saturate() is sometimes ignored. Only primitives.jsx:112 includes -webkit-backdrop-filter fallback. Migration must add the prefix at every site OR enable autoprefixer in Vite/PostCSS.
### 5.2 color-mix(in oklab, ...) - PERVASIVE
Hundreds of uses across all screens (NavBar shadow, mood radial-gradients, factor bars, heatmap cells, journal sidebar, meditation chapter pills, etc.). Used for blended color tokens.
Flag: YELLOW. color-mix() shipped in Chromium 111 (Mar 2023) and Safari 16.2 (Dec 2022). Capacitor 6 ships modern WebView baselines but Android System WebView lags - a phone last updated to WebView 100 fails every color-mix declaration. Verify minSdk; consider PostCSS plugin postcss-color-mix-function for static fallback OR pin Capacitor 6 android minSdkVersion >= 33 (Android 13 -> WebView 111+). Test on real devices, not just emulator.
### 5.3 @import url(https://fonts.googleapis.com/...) - styles.css L3
Single line @import imports Inter (300-700), Fraunces (300-600 + variable opsz/italics), JetBrains Mono (400/500) from Google Fonts CDN.
Flag: RED for offline-first apps. A Capacitor app launched offline hits the @import, fails silently, and falls back to system fonts - losing the entire typographic identity (Fraunces display italic is load-bearing for the editorial voice). Migration MUST self-host fonts (download to src/assets/fonts/, declare via @font-face with font-display:swap). Privacy concern too: every app launch pings Google. Self-host is mandatory.
### 5.4 Paper-grain SVG noise - styles.css L316-323
Site: .paper::before uses inline data:image/svg+xml URL with <feTurbulence type=fractalNoise baseFrequency=0.9 numOctaves=2> + feColorMatrix to mute alpha to 0.04. mix-blend-mode:multiply. Class has no current consumer in JSX bundle.
Flag: GREEN. feTurbulence is universally supported in WKWebView and modern Android System WebView. mix-blend-mode also broadly safe.
### 5.5 Inline <style> injection inside React components
Sites: tweaks-panel.jsx:234 injects ~90-line stylesheet via <style>{__TWEAKS_STYLE}</style>; screen-chat.jsx:277 inlines @keyframes bounce; screen-meditation.jsx:283-289 inlines @keyframes float-up.
Flag: GREEN functionally. Recommend lifting all three blocks into styles.css during migration so Vite can dedupe and PostCSS can autoprefix.
### 5.6 Iframe-host postMessage protocol (tweaks-panel.jsx)
Site: window.parent.postMessage({type:__edit_mode_available},*) on mount; listens for __activate_edit_mode/__deactivate_edit_mode; emits __edit_mode_set_keys, __edit_mode_dismissed.
Flag: RED for production. Inside a Capacitor WebView there is no separate parent frame; window.parent === window. The panel will never activate (its useEffect fires __edit_mode_available to itself and then listens for __activate_edit_mode that never arrives). Either retire the panel before shipping OR gate it behind import.meta.env.DEV so Vite tree-shakes it out of the production bundle.
### 5.7 prefers-reduced-motion - styles.css L307-313
Already honored - animation-duration + transition-duration collapse to 0.01ms when user has reduced-motion enabled. Flag: GREEN. Good practice already present.
### 5.8 oklab color space (inside color-mix) - same gating as 5.2.
### 5.9 aspect-ratio inline - dashboard StreakCard, insights CalendarHeat, journal sidebar mood-orbs. Flag: GREEN. Universal since 2021.
### 5.10 Scrollbar hiding (.scrollbar-hide) - ::-webkit-scrollbar{display:none} + scrollbar-width:none. Flag: GREEN.
---
## 6. Risks ranked for the Vite migration
1. RED - Google Fonts @import (offline + privacy). Self-host before first store submission.
2. RED - tweaks-panel.jsx postMessage to non-existent parent inside a Capacitor WebView. Gate behind import.meta.env.DEV or delete.
3. YELLOW - color-mix(in oklab) on older Android System WebView. Pin minSdk >= 33 or polyfill.
4. YELLOW - backdrop-filter without consistent -webkit- prefix at every site. Add autoprefixer to Vite/PostCSS pipeline.
5. GREEN - Globals -> ESM mechanical rewrite across 12 files. Well-bounded, deterministic, no semantic risk.
---
## 7. Inventory tally
- Files mapped: 13 (8 screens + 4 components + 1 stylesheet)
- JSX symbols cataloged: 58 (8 primitives + 25 icons + 12 tweaks + 5 chrome + 8 screens)
- Object.assign(window,...) / window.X = X exit lines to rewrite: 12
- CSS custom properties cataloged: ~80 (incl. theme/accent/font/density variants)
- Keyframe animations: 8 (6 in styles.css + bounce in chat + float-up in meditation; tweaks-panel adds inline transitions but no new @keyframes)
- Capacitor compatibility risks flagged: 10 (2 RED, 2 YELLOW, 6 GREEN)

Hamura sees the network. The cursor missed nothing. - mythos-hamura, witnessed by Saber + Crystal.
