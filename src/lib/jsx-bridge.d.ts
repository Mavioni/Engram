// jsx-bridge.d.ts
//
// Type augmentation for the window-as-module-registry seam installed by
// src/lib/jsx-bridge.ts. The prototype .jsx files in src/screens and
// src/components write their components onto `window` via
// `Object.assign(window, { ChatScreen, ... })`. App.tsx and friends read
// them back as `window.ChatScreen`.
//
// Without this augmentation, tsc --noEmit reports TS2339 on every read.
// All entries are typed as `React.ComponentType<any>` because the
// prototype files are JS and have no exported prop types yet — promotion
// to precise prop types lands during Phase B (see docs/JSX_BRIDGE.md).

import type * as ReactNS from 'react';
import type * as ReactDOMNS from 'react-dom';

declare global {
  interface Window {
    // React surface mirrored onto window by jsx-bridge.ts
    React: typeof ReactNS;
    ReactDOM: typeof ReactDOMNS;

    useState: typeof ReactNS.useState;
    useEffect: typeof ReactNS.useEffect;
    useRef: typeof ReactNS.useRef;
    useMemo: typeof ReactNS.useMemo;
    useCallback: typeof ReactNS.useCallback;
    useContext: typeof ReactNS.useContext;
    useReducer: typeof ReactNS.useReducer;
    useLayoutEffect: typeof ReactNS.useLayoutEffect;
    createContext: typeof ReactNS.createContext;
    forwardRef: typeof ReactNS.forwardRef;
    memo: typeof ReactNS.memo;
    Fragment: typeof ReactNS.Fragment;
    createPortal: typeof ReactDOMNS.createPortal;

    // Screens
    ChatScreen: ReactNS.ComponentType<any>;
    DashboardScreen: ReactNS.ComponentType<any>;
    OnboardingScreen: ReactNS.ComponentType<any>;
    CheckinScreen: ReactNS.ComponentType<any>;
    JournalScreen: ReactNS.ComponentType<any>;
    MeditationScreen: ReactNS.ComponentType<any>;
    InsightsScreen: ReactNS.ComponentType<any>;
    PlayerCardScreen: ReactNS.ComponentType<any>;

    // Chrome / navigation
    NavBar: ReactNS.ComponentType<any>;
    TopBar: ReactNS.ComponentType<any>;
    ChromeWindow: ReactNS.ComponentType<any>;
    SectionHeader: ReactNS.ComponentType<any>;

    // Primitives
    Card: ReactNS.ComponentType<any>;
    Button: ReactNS.ComponentType<any>;
    Pill: ReactNS.ComponentType<any>;

    // Visual artifacts
    MoodOrb: ReactNS.ComponentType<any>;
    IrisAvatar: ReactNS.ComponentType<any>;

    // Index signature for additional prototype components registered via
    // Object.assign(window, ...) before App.tsx reads them. Keeps this
    // file from churning on every new prototype primitive while still
    // giving the named components above precise types.
    [key: string]: unknown;
  }
}

export {};
