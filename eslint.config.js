// Engram ESLint flat config (ESM)
// Hiruzen — Polyglot Professor. Per-language, per-glob rules.
//
// Targets:
//   - src/**/*.{js,jsx,ts,tsx}        (Vite + React frontend)
//   - server/src/**/*.ts              (Cloudflare Worker)
//
// Notable exceptions:
//   - src/screens/*.jsx and src/components/*.jsx may use the
//     `Object.assign(window, ...)` bridge pattern (mythos-indra). Those globs
//     relax `no-restricted-globals` and `no-redeclare` accordingly.
//   - React 17+ JSX transform (Vite) — `react/react-in-jsx-scope` is off.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // ── Global ignores ─────────────────────────────────────────────────────────
  {
    ignores: [
      "dist/**",
      "ios/**",
      "android/**",
      ".wrangler/**",
      "node_modules/**",
      "screenshots/**",
      "prototype.html",
      "**/*.min.js",
    ],
  },

  // ── @eslint/js recommended (all targeted files) ────────────────────────────
  js.configs.recommended,

  {
    files: ["public/sw.js"],
    languageOptions: { globals: { self: "readonly", caches: "readonly", fetch: "readonly", URL: "readonly", Response: "readonly" } },
  },

  // ── TypeScript (typescript-eslint recommended set) ─────────────────────────
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ["src/**/*.{ts,tsx}", "server/src/**/*.ts", "tests/**/*.ts", "*.ts"],
  })),

  // ── Frontend: src/**/*.{js,jsx,ts,tsx} ─────────────────────────────────────
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Browser
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        MutationObserver: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },
    settings: {
      react: { version: "18.3" },
    },
    rules: {
      // Vite + React 17+ JSX transform: no need for React in scope.
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",

      // Hooks: rules-of-hooks must be hard-error.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility: warn by default, do not block builds.
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": ["warn", { allowExpressionValues: true }],

      // No console in app code (warn — `lint (zero warnings)` doctrine still
      // catches it). Allowlisted in scripts/ and tests/ below.
      "no-console": ["warn", { allow: ["error", "warn"] }],

      // Allow unused props prefixed with `_`.
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Use the TypeScript-aware rule for declarations and type-only parameters.
  {
    files: ["**/*.{ts,tsx}"],
    rules: { "no-unused-vars": "off" },
  },

  // ── Bridge-pattern exception: window assignment in screens + components ────
  // mythos-indra wires React state into `window.__ENGRAM__` for cross-screen
  // observability. Relax the globals/redeclare rules ONLY for these globs.
  {
    files: ["src/screens/*.jsx", "src/components/*.jsx"],
    rules: {
      "no-restricted-globals": "off",
      "no-redeclare": "off",
      "no-undef": "off", // window/document handled by globals above
    },
  },

  // ── Server: Cloudflare Worker (server/src/**/*.ts) ─────────────────────────
  {
    files: ["server/src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        // Cloudflare Worker / Web-standard runtime
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        crypto: "readonly",
        caches: "readonly",
        addEventListener: "readonly",
        console: "readonly",
        // D1 / KV / R2 bindings are typed via env, not globals.
      },
    },
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // ── Scripts: allow console freely ──────────────────────────────────────────
  {
    files: ["scripts/**/*.{js,ts,mjs,cjs}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        document: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },

  // ── Tests: Playwright + console allowed ────────────────────────────────────
  {
    files: ["tests/**/*.{js,ts,mjs}", "**/*.test.{js,ts,jsx,tsx}", "**/*.spec.{js,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
