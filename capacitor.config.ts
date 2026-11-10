// Engram — Capacitor 6 configuration
//
// Deep-link scheme `engram://` is RESERVED for future OAuth callback flows
// (Apple Sign-In / Google Sign-In deep-back, password-reset returns, magic
// links). It is NOT active in this revision — activation is gated on
// mythos-naruto's auth flow landing. When activated, register the scheme
// in iOS Info.plist (CFBundleURLTypes) and Android AndroidManifest.xml
// (intent-filter android:scheme="engram") via the Capacitor App plugin.

import type { CapacitorConfig } from '@capacitor/cli';

const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'app.engram.companion',
  appName: 'Engram',
  webDir: 'dist',

  server: {
    // Dev-time hostname; prod builds use bundled assets.
    hostname: 'localhost',
    iosScheme: 'engram',
    // Android requires https scheme for plugins relying on secure-context
    // APIs (crypto.subtle, ServiceWorker, etc.).
    androidScheme: 'https',
  },

  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0A',
      launchAutoHide: true,
    },
    Preferences: {},
    // Keyboard config takes effect once @capacitor/keyboard is installed.
    Keyboard: {
      resize: 'native',
    },
  },

  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'engram',
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    // Disable WebView debugging in production builds; enable only in dev.
    webContentsDebuggingEnabled: !isProduction,
  },
};

export default config;
