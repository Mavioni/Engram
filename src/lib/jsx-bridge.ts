// jsx-bridge.ts
//
// Algorithmic seam between the design-authored .jsx prototype files and the
// ESM module system Vite expects. The prototype was authored against a
// browser-global React (`const { useState } = React;`) and uses
// `Object.assign(window, { Component })` as an ad-hoc module registry.
//
// Rather than rewriting every screen file (which would touch
// mythos-sasuke's placeholder-scrub and burn the design 1:1 invariant in
// docs/CLAUDE.md), we install a one-time global shim. Each prototype file
// then runs untouched: it reads React off `window`, and writes its exports
// onto `window`. App.tsx reads them back as `window.ChatScreen` etc.
//
// Side-effect import only. Must be the FIRST import in src/main.tsx,
// before any .jsx screen / component module evaluates.
//
// Migration path to proper ESM exports: see docs/JSX_BRIDGE.md, "Phase B".

import * as React from 'react';
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
  useReducer,
  useLayoutEffect,
  createContext,
  forwardRef,
  memo,
  Fragment,
} from 'react';
import * as ReactDOM from 'react-dom';
import { createPortal } from 'react-dom';

// ----------------------------------------------------------------------------
// Global React surface
// ----------------------------------------------------------------------------
// The prototype destructures hooks from a global `React` and also references
// bare `useState` / `useEffect` in some files. Expose both shapes.
//
// We use a typed cast to `unknown as Record<string, unknown>` once at the
// boundary; downstream the augmentation in jsx-bridge.d.ts gives us types.

type GlobalLike = Record<string, unknown>;
const w = window as unknown as GlobalLike;

if (!w.React) {
  w.React = React;
}

// Hook surface — destructured form used by prototype files
const hookSurface: Record<string, unknown> = {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
  useReducer,
  useLayoutEffect,
  createContext,
  forwardRef,
  memo,
  Fragment,
};

for (const [name, value] of Object.entries(hookSurface)) {
  if (w[name] === undefined) {
    w[name] = value;
  }
}

// ReactDOM surface — some prototype primitives use createPortal for modals
if (!w.ReactDOM) {
  w.ReactDOM = ReactDOM;
}
if (w.createPortal === undefined) {
  w.createPortal = createPortal;
}

// ----------------------------------------------------------------------------
// Diagnostic — fires once at boot if the shim has not been wired in time.
// Detects the case where a prototype file evaluates before this module.
// ----------------------------------------------------------------------------
if (import.meta.env.DEV) {
  // Use a microtask so the registration above has settled.
  queueMicrotask(() => {
    if (!w.React || !w.useState) {
      console.error(
        '[jsx-bridge] React global not installed before prototype evaluation. ' +
          'Confirm `import "./lib/jsx-bridge"` is the first import in main.tsx.'
      );
    }
  });
}

export {};
