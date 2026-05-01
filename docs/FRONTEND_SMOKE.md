# Frontend smoke procedure

Owned by mythos-boruto. Run this any time you touch a screen, primitive, the
JSX-on-window bridge, or a token in `src/styles/`. The test is fast and
visual — it is the cheapest way to confirm that the design preserved 1:1
from `prototype.html` is still intact.

Visual ground truth: `screenshots/dark-fixed.png` (chat in dark + lavender),
`screenshots/dark-2.png`, `screenshots/dark-lavender-chat.png`,
`screenshots/no-chrome.png`. Treat these as the regression baseline per
`CLAUDE.md` design invariants.

## 1. Boot the dev server

```bash
npm run dev
```

Open http://localhost:5173 in a Chromium-based browser with DevTools docked.
Throttling: none. Cache: disabled while DevTools is open.

## 2. Confirm the bridge mounted

Before anything else, check the DevTools console:

- No red errors. Yellow warnings from React StrictMode are acceptable.
- No `ReferenceError: <ComponentName> is not defined`. If you see one,
  `src/components/index.ts` is missing an entry, or
  `src/screens/index.ts` ran before components registered. Components must
  import first in `main.tsx`.
- `window.NavBar`, `window.Card`, `window.Button`, `window.IrisAvatar`,
  `window.ChatScreen` are all functions when typed at the prompt.

## 3. Verify typography + tokens load

- Display headers render in Fraunces (serif, optical-size axis active on the
  hero numerals on the dashboard and player card). If they fall back to a
  generic serif, the font preload in `index.html` is broken or the CSS in
  `src/styles/` did not load.
- Body copy renders in the system UI sans stack.
- Toggling the Tweaks panel "Accent" control updates accent-tinted surfaces
  live (chat bubble accent, dashboard PathCard tint, NavBar active dot).
- `<html data-theme="dark" data-accent="ocean">` switches when Tweaks are
  changed — confirm in the Elements panel.

## 4. Cycle every screen via the Tweaks panel

Open the Tweaks panel (bottom-right glass dock). The `Screen` segmented
control cycles the eight registered surfaces. Confirm each mounts without
console errors and matches the reference screenshot.

| # | Screen window export | Entry route / state | Reference |
|---|----------------------|---------------------|-----------|
| 1 | `OnboardingScreen` | initial mount when no profile is persisted (`onComplete` advances to dashboard) | onboarding flow, no screenshot — verify Welcome → Name → Intent steps advance |
| 2 | `DashboardScreen` | post-onboarding home; tap PlayerCardHero → playercard | `dark-2.png`, `no-chrome.png` |
| 3 | `CheckinScreen` | NavBar tab `checkin`; mood → intensity → factors → note | follows checkin flow |
| 4 | `ChatScreen` | NavBar tab `chat`; IRIS thread, suggested replies | `dark-fixed.png`, `dark-lavender-chat.png` |
| 5 | `MeditationScreen` | NavBar tab `meditation`; breath ring + waveform | matches meditation reference |
| 6 | `JournalScreen` | NavBar tab `journal`; prompt → past entries drawer | matches journal reference |
| 7 | `InsightsScreen` | NavBar tab `insights`; mood arc, heatmap, radar, time-of-day | matches insights reference |
| 8 | `PlayerCardScreen` | reached from `DashboardScreen`'s PlayerCardHero tap; back via header arrow | matches player-card reference |

For each screen confirm:

- NavBar glass dock is visible and pinned to the bottom safe area.
- The active NavBar dot animates to the current tab.
- Hero typography uses the Fraunces serif on display-size headers.
- Accents respond live to the Tweaks `Accent` control.
- No console errors, no layout shift on mount, no overflow at 320 / 375 /
  768 / 1024 / 1440 viewports (use the DevTools device toolbar).

## 5. Tweaks panel sanity

- The panel is draggable by its header and stays clamped to the viewport.
- Closing the panel posts `__edit_mode_dismissed` (visible on the host's
  toolbar toggle if running inside the editor host).
- `Theme` toggle flips `<html data-theme>` between `dark` and `light` and
  both modes feel intentional (per `web/design-quality.md`).
- `Density` segmented control updates `<html data-density>`.
- `Font` segmented control updates `<html data-font>`.

## 6. Pass criteria

The smoke is green only if every row in section 4 passes, every box in
section 3 passes, and the console is clean. Anything red blocks commit per
the `CLAUDE.md` build loop (lint → typecheck → test:e2e → build → cap sync).
