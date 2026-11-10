// Engram — root App.
// Ports prototype.html's App() function to a real ESM module.
//
// TODO(indra-bridge): the legacy screen-*.jsx + components/*.jsx modules were
// authored as Babel-in-browser scripts that read `React` as a global and
// publish their components via `window.ChatScreen = ChatScreen`. To keep them
// untouched (mythos-sasuke owns the eventual ESM rewrite), we install React on
// `window` BEFORE side-effect-importing those files, then pull the components
// back off `window`. mythos-indra is investigating a cleaner ESM bridge.

import * as React from 'react'
import { useEffect, useState, type ReactNode } from 'react'
import ReactDOM from 'react-dom'

// 1) Publish React/ReactDOM as globals so the legacy .jsx modules resolve them.
//    This must happen at module top-level, BEFORE the side-effect imports below.
type GlobalShim = {
  React: typeof React
  ReactDOM: typeof ReactDOM
  ENGRAM_API_URL: string
}
const globalShim = window as unknown as Window & GlobalShim
globalShim.React = React
globalShim.ReactDOM = ReactDOM
globalShim.ENGRAM_API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787"

// 2) Side-effect imports — each file mutates `window.<Name>` on load.
//    Order matters: primitives + icons before screens that use them.
// Dynamic imports are deliberate: the legacy JSX modules read React from
// window at module evaluation time. Static imports would execute before the
// global shim below is installed.
await import('./components/icons.jsx')
await import('./components/primitives.jsx')
await import('./components/tweaks-panel.jsx')
await import('./components/browser-window.jsx')
await import('./screens/screen-onboarding.jsx')
await import('./screens/screen-chat.jsx')
await import('./screens/screen-dashboard.jsx')
await import('./screens/screen-checkin.jsx')
await import('./screens/screen-journal.jsx')
await import('./screens/screen-meditation.jsx')
await import('./screens/screen-insights.jsx')
await import('./screens/screen-playercard.jsx')

// 3) Auth provider — owned by mythos-naruto. Assume export shape:
//    export function AuthProvider({ children }: { children: ReactNode }): JSX.Element
//    export function useAuth(): { status: 'loading' | 'signed-in' | 'signed-out' }
import { AuthProvider, useAuth } from './auth/AuthProvider'
import LoginScreen from './auth/LoginScreen'

// ----- types pulled off the window shim -------------------------------------

type ScreenId =
  | 'onboarding'
  | 'chat'
  | 'dashboard'
  | 'checkin'
  | 'journal'
  | 'meditation'
  | 'insights'
  | 'playercard'

type ScreenProps = { onNavigate: (id: ScreenId) => void }
type OnboardingProps = { onComplete: () => void }
type IconCmp = (props: { size?: number; color?: string }) => JSX.Element

interface LegacyGlobals {
  ChatScreen: React.ComponentType<ScreenProps>
  DashboardScreen: React.ComponentType<ScreenProps>
  CheckinScreen: React.ComponentType<ScreenProps>
  JournalScreen: React.ComponentType<ScreenProps>
  MeditationScreen: React.ComponentType<ScreenProps>
  InsightsScreen: React.ComponentType<ScreenProps>
  PlayerCardScreen: React.ComponentType<ScreenProps>
  OnboardingScreen: React.ComponentType<OnboardingProps>
  NavBar: React.ComponentType<{
    active: ScreenId
    onChange: (id: ScreenId) => void
    items: Array<{ id: ScreenId; label: string; icon: IconCmp }>
  }>
  TweaksPanel: React.ComponentType<{ title?: string; children?: ReactNode }>
  TweakSection: React.ComponentType<{ title?: string; children?: ReactNode }>
  TweakRadio: React.ComponentType<{
    label: string
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
  }>
  TweakSelect: React.ComponentType<{
    label: string
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
  }>
  TweakButton: React.ComponentType<{
    label: string
    onClick: () => void
    children?: ReactNode
  }>
  IconHome: IconCmp
  IconChat: IconCmp
  IconBook: IconCmp
  IconMoon: IconCmp
  IconChart: IconCmp
  IconCard: IconCmp
  useTweaks: <T extends Record<string, string>>(
    defaults: T,
  ) => [T, (key: keyof T, value: string) => void]
}

const W = window as unknown as Window & LegacyGlobals

// ----- tweak defaults (mirrors prototype.html) ------------------------------

const TWEAK_DEFAULTS = {
  theme: 'dark',
  accent: 'ocean',
  density: 'normal',
  font: 'serif-display',
  moodViz: 'orb',
  playerCardLayout: 'hero',
} as const

type Tweaks = { [K in keyof typeof TWEAK_DEFAULTS]: string }

// Local fallback if the legacy useTweaks isn't on window for some reason.
function useTweaksFallback(defaults: Tweaks): [Tweaks, (k: keyof Tweaks, v: string) => void] {
  const [tweaks, setTweaks] = useState<Tweaks>(defaults)
  const setTweak = (key: keyof Tweaks, value: string) =>
    setTweaks((prev) => ({ ...prev, [key]: value }))
  return [tweaks, setTweak]
}

// ----- shell ---------------------------------------------------------------

function Shell() {
  const useTweaks = W.useTweaks ?? useTweaksFallback
  const [tweaks, setTweak] = useTweaks<Tweaks>({ ...TWEAK_DEFAULTS })
  const [screen, setScreen] = useState<ScreenId>('chat')

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = tweaks.theme
    root.dataset.accent = tweaks.accent
    root.dataset.density = tweaks.density
    root.dataset.font = tweaks.font
  }, [tweaks])

  const navItems: Array<{ id: ScreenId; label: string; icon: IconCmp }> = [
    { id: 'dashboard', label: 'Today', icon: W.IconHome },
    { id: 'chat', label: 'IRIS', icon: W.IconChat },
    { id: 'journal', label: 'Journal', icon: W.IconBook },
    { id: 'meditation', label: 'Practice', icon: W.IconMoon },
    { id: 'insights', label: 'Insights', icon: W.IconChart },
    { id: 'playercard', label: 'Engram', icon: W.IconCard },
  ]

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <W.OnboardingScreen onComplete={() => setScreen('chat')} />
      case 'chat':
        return <W.ChatScreen onNavigate={setScreen} />
      case 'dashboard':
        return <W.DashboardScreen onNavigate={setScreen} />
      case 'checkin':
        return <W.CheckinScreen onNavigate={setScreen} />
      case 'journal':
        return <W.JournalScreen onNavigate={setScreen} />
      case 'meditation':
        return <W.MeditationScreen onNavigate={setScreen} />
      case 'insights':
        return <W.InsightsScreen onNavigate={setScreen} />
      case 'playercard':
        return <W.PlayerCardScreen onNavigate={setScreen} />
      default:
        return <W.ChatScreen onNavigate={setScreen} />
    }
  }

  const hideNav = screen === 'onboarding' || screen === 'checkin' || screen === 'meditation'

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
      data-screen-label={screen}
    >
      {renderScreen()}
      {!hideNav && W.NavBar ? (
        <W.NavBar active={screen} onChange={setScreen} items={navItems} />
      ) : null}

      {W.TweaksPanel ? (
        <W.TweaksPanel title="Tweaks">
          <W.TweakSection title="Appearance">
            <W.TweakRadio
              label="Theme"
              value={tweaks.theme}
              onChange={(v) => setTweak('theme', v)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
            <W.TweakRadio
              label="Accent"
              value={tweaks.accent}
              onChange={(v) => setTweak('accent', v)}
              options={[
                { value: 'sage', label: 'Sage' },
                { value: 'lavender', label: 'Lavender' },
                { value: 'peach', label: 'Peach' },
                { value: 'amber', label: 'Amber' },
                { value: 'ocean', label: 'Ocean' },
              ]}
            />
            <W.TweakRadio
              label="Density"
              value={tweaks.density}
              onChange={(v) => setTweak('density', v)}
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'normal', label: 'Normal' },
                { value: 'comfy', label: 'Comfy' },
              ]}
            />
            <W.TweakSelect
              label="Typography"
              value={tweaks.font}
              onChange={(v) => setTweak('font', v)}
              options={[
                { value: 'serif-display', label: 'Fraunces + Inter (default)' },
                { value: 'all-sans', label: 'Inter only' },
                { value: 'mono-touch', label: 'Inter + IBM Plex' },
              ]}
            />
          </W.TweakSection>

          <W.TweakSection title="Navigation">
            <W.TweakButton label="Onboarding" onClick={() => setScreen('onboarding')}>
              View →
            </W.TweakButton>
            <W.TweakButton label="Mood check-in flow" onClick={() => setScreen('checkin')}>
              Open →
            </W.TweakButton>
          </W.TweakSection>
        </W.TweaksPanel>
      ) : null}
    </div>
  )
}

// ----- splash --------------------------------------------------------------

function Splash() {
  return (
    <div
      role="status"
      aria-busy="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg, #0a0a0a)',
        color: 'var(--ink, #f5f5f5)',
        fontFamily: 'var(--font-display, serif)',
        letterSpacing: '0.08em',
      }}
    >
      <div style={{ opacity: 0.7, fontSize: 14, textTransform: 'uppercase' }}>Engram</div>
    </div>
  )
}

// ----- auth gate -----------------------------------------------------------

function AuthGate() {
  const { status } = useAuth()

  if (status === 'loading') return <Splash />
  if (status === 'signed-out') return <LoginScreen />
  return <Shell />
}

// ----- root ----------------------------------------------------------------

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
