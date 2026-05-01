# JSX Bridge — design-prototype to ESM seam

## Problem

The design prototype was authored as a set of `.jsx` files under
`src/screens/` and `src/components/`. Two patterns in those files do not
compose with Vite's ESM module system:

1. `const { useState, useEffect } = React;` — assumes a browser-global
   `React` symbol.
2. `Object.assign(window, { ChatScreen, NavBar, ... });` — assumes
   `window` is the module registry.

Vite expects ESM `import` / `export`. Booting the app as-authored produces
`ReferenceError: React is not defined` on the first screen evaluation.

## Decision

We adopt **Option A: a window-shim bridge**, not a per-file rewrite.

| Criterion | A (bridge) | B (rewrite each .jsx) |
|---|---|---|
| Time to MVP-1 | Minutes | Hours, file-by-file |
| Touches design files | No | Yes — every screen + primitive |
| Risk to design 1:1 invariant (`CLAUDE.md`) | Zero | Visual diff per file |
| Touches mythos-sasuke's scrub work | No | Yes — coordination required |
| Type safety | Window-augmented, `any` props | Precise prop types possible |
| Long-term cleanliness | Carries a global seam | Idiomatic ESM |
| Tree-shake / dead-code elim | Inhibited | Native |

Algorithm A dominates B on every MVP-critical axis. B dominates A only on
long-term cleanliness, which is a Phase-B concern.

## Implementation

Two files own the seam:

- `src/lib/jsx-bridge.ts` — runtime shim. Imports React + hooks + ReactDOM
  via ESM and assigns them onto `window` if not already present.
  Side-effect import only. Must be the **first** import in
  `src/main.tsx`, before any `.jsx` screen or component module evaluates.

- `src/lib/jsx-bridge.d.ts` — `declare global { interface Window { ... } }`
  augmentation. Lists every component the prototype writes onto `window`
  so that consumer code (`App.tsx`, screen wiring) can read
  `window.ChatScreen` without `tsc --noEmit` complaints.

### Wire-up contract

`src/main.tsx` must look like:

```ts
import './lib/jsx-bridge';        // FIRST. Side-effect.
import './styles/global.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// ... prototype .jsx imports below this line
```

Any prototype file imported before `jsx-bridge` will throw
`React is not defined`. The dev-mode diagnostic in `jsx-bridge.ts` logs an
error to the console if the shim was not seated in time.

### What the shim installs

Surfaced on `window` (idempotent — only set if undefined):

- `React`, `ReactDOM`
- Hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`,
  `useContext`, `useReducer`, `useLayoutEffect`
- Factories: `createContext`, `forwardRef`, `memo`, `Fragment`
- `createPortal` (used by modal primitives in the prototype)

### What prototype files do, unchanged

```jsx
// src/screens/ChatScreen.jsx — unmodified
const { useState, useEffect } = React;

function ChatScreen(props) { /* ... */ }

Object.assign(window, { ChatScreen });
```

The destructure now resolves against `window.React`. The
`Object.assign(window, ...)` writes onto the real `Window` object, which
is the registry `App.tsx` reads from.

## Migration path — Phase B

Phase B is an explicit `/Ninja` follow-up after MVP-1 ships. It converts
each `.jsx` prototype file to idiomatic ESM:

1. Rename `.jsx` → `.tsx` per file (one PR per screen).
2. Replace `const { useState } = React;` with
   `import { useState } from 'react';`.
3. Replace `Object.assign(window, { Foo });` with `export { Foo };`.
4. Update consumer (`App.tsx`) to `import { Foo } from './screens/Foo';`.
5. Delete the corresponding entry from `jsx-bridge.d.ts`.
6. When the last prototype consumer is migrated, delete
   `src/lib/jsx-bridge.ts`, `src/lib/jsx-bridge.d.ts`, and the
   first-import line in `main.tsx`.

Phase B can be done incrementally — bridge entries and ESM imports
coexist, because `import` is hoisted and the bridge is idempotent.

## Constraints / known limitations

- **Tree-shaking is inhibited** for prototype components: every entry on
  `window` is reachable, so Vite cannot drop unused screens. Acceptable
  for MVP-1 (8 screens, all reachable).
- **Hot-module reload** of a prototype file replaces the `window` entry
  on re-evaluation. `Object.assign` semantics make this safe.
- **SSR** is not supported by this bridge — `window` is undefined on the
  server. Engram is Capacitor + CSR only, so this is acceptable. If SSR
  is ever introduced, Phase B is a hard prerequisite.
- **Index signature on `Window`** in `jsx-bridge.d.ts` types unknown keys
  as `unknown` to keep the file from churning, but reduces type
  precision for consumers reading non-listed entries. Add the entry by
  name when promoted.

## Owner

`mythos-indra` (Algorithm Prime) owns this bridge. Modifications require
an ADR if they change the wire-up contract above.
