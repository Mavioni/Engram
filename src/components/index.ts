// src/components/index.ts
// Side-effect barrel — pulls every component module so its exports register
// on `window` via the JSX-on-window bridge. Order matters: primitives and
// icons must register before any screen tries to consume them, so this barrel
// must be imported BEFORE `src/screens/index.ts` in `main.tsx`.
//
// Owned by mythos-boruto (Frontend Prime). Do not add logic here.

import './icons.jsx';
import './primitives.jsx';
import './browser-window.jsx';
import './tweaks-panel.jsx';

export {};
