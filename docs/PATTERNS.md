# Engram — Pattern Codex

Distilled from prototype substrate. Reusable across screens. Feed to ReasoningBank.

## 1. Glass-Dock NavBar with Center CTA  *(ECC-WORTHY)*
Location: `src/components/primitives.jsx:101-164`
Reuse: floating bottom nav, `color-mix` translucent fill + `backdropFilter: blur(24px) saturate(140%)`, active item morphs from icon-only to icon+label via padding shift, divider+circular accent CTA at end.
Promotion: ECC skill `glass-dock-nav` — generic mobile/PWA navigation primitive.

## 2. MoodOrb — Radial-Gradient Affect Pebble
Location: `src/components/primitives.jsx:192-214`
Reuse: encode 2D scalar (valence×energy) as `radial-gradient(circle at 35% 30%, mix(hue, white), hue)` + inset shadow scaled by energy. Pair with `.breathe` keyframe for live state.
Promotion: skill `affect-orb` — generic two-axis emotion glyph.

## 3. Card Hover-Lift
Location: `src/components/primitives.jsx:3-20` + `src/styles/styles.css:267-273`
Reuse: any `<Card onClick>` becomes `.eng-card.hoverable` → `translateY(-2px)` + shadow upgrade on hover, 240ms ease.
Promotion: token-only, stays local.

## 4. Accent-Token Skin via `[data-accent]`  *(ECC-WORTHY)*
Location: `src/styles/styles.css:86-147`
Reuse: 5 named accents × 2 themes = 10 palettes, each redefining `--accent / --accent-2 / --accent-soft / --accent-tint`. Toggle via `document.documentElement.dataset.accent`. Components consume `var(--accent)` only — never literals.
Promotion: ECC skill `data-attr-skin-system` — multi-axis theme dispatch (theme × accent × density × font).

## 5. Staggered Reveal Container `.stagger`  *(ECC-WORTHY)*
Location: `src/styles/styles.css:279-296`
Reuse: add `class="stagger"` to any list/grid; first 10 children auto-fade-up with 60ms cascade. No JS, no library. Respects `prefers-reduced-motion` via global rule (l.307-313).
Promotion: ECC skill `css-only-stagger` — drop-in entrance choreography.

## 6. Paper-Grain SVG Noise Overlay
Location: `src/styles/styles.css:316-324`
Reuse: any container marked `.paper` gets a `::before` data-URI SVG `feTurbulence` layer at 4% alpha, `mix-blend-mode: multiply`. Kills flat-plastic feel without raster assets.
Promotion: skill `paper-noise-overlay`.

## 7. IrisAvatar — Concentric Ring Glyph
Location: `src/components/primitives.jsx:217-235`
Reuse: AI agent avatar = gradient disc + 3 concentric SVG circles (filled core r=3, mid stroke r=7 @ 0.6, halo stroke r=10 @ 0.3). Sizes proportionally by `size` prop.
Promotion: stays local — Engram-IRIS-specific.

## 8. Display-Italic Fraunces Accent
Location: `src/styles/styles.css:207-208`, used inline across screens
Reuse: `class="display-italic"` for emotional callouts in copy ("how *are* you?"). Pair with sans for tension. Fraunces opsz 9..144 weights 300-600.
Promotion: skill `editorial-italic-accent`.

## 9. Density Tokens `[data-density]`
Location: `src/styles/styles.css:149-156`
Reuse: `--pad` and `--gap` swap on `compact|normal|comfy`. Components reference vars; spacing rescales site-wide via single root attribute flip.
Promotion: bundle into `data-attr-skin-system` skill (#4).

## 10. Color-Mix Soft Shadow with Accent Glow
Location: `primitives.jsx:114, 156` — `box-shadow: 0 6px 18px color-mix(in oklab, var(--accent) 40%, transparent)`
Reuse: shadows tinted by accent, not neutral grey — CTAs feel "lit from within". `color-mix(in oklab, ...)` keeps perceptual neutrality.
Promotion: skill snippet inside `glass-dock-nav` (#1).

## Cross-cutting invariants
- Border-radius scale `--r-sm/md/lg/xl/2xl/pill` — never raw px.
- Easing `--ease` (cubic-bezier 0.4,0,0.2,1) on every transition.
- Reduced-motion blanket override (`styles.css:307-313`) — composable with all animations above.
- All accent-aware components pull `var(--accent*)` — zero literals — making pattern #4 lossless across the codex.
