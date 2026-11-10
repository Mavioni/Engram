import { useState } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { API_URL, SOURCE_URL } from './notes/api'
import { NotesWorkspace } from './notes/NotesWorkspace'
import { VaultGate } from './notes/VaultGate'
import { Icon } from './notes/Icon'
import type { VaultSession } from './notes/vault'

function CloudGate({ onDevice }: { onDevice: () => void }) {
  const { status, user, signIn, signUp, signOut } = useAuth()
  const [register, setRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (status === 'loading') return <main className="vault-gate"><p role="status">Opening Engram…</p></main>
  if (status === 'signed-in' && user) return <NotesWorkspace key={user.id} onLock={async () => { await signOut() }} />
  return <main className="vault-gate"><div className="gate-brand"><span className="brand-dot" /> ENGRAM <span className="label">PRIVATE ALPHA</span></div><div className="gate-content"><div className="gate-icon"><Icon name="eye" size={26} /></div><span className="label accent">ENGRAM CLOUD</span><h1>{register ? 'Begin with yourself.' : 'Welcome back.'}</h1><p>Your notebook, memory, and reflection. Sign in to your Engram account.</p><form onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = register ? await signUp.email({ email, password, name }) : await signIn.email({ email, password })
      if (result.error) setError(result.error.message ?? 'Sign-in could not be completed.')
      else setPassword('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Engram could not be reached.') }
    finally { setBusy(false) }
  }}>{register && <label>Display name<input autoComplete="name" value={name} onChange={event => setName(event.target.value)} required /></label>}<label>Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 12 : undefined} value={password} onChange={event => setPassword(event.target.value)} required /></label>{register && <p className="fine-print">Use at least 12 characters. Saved entries are stored in your Engram account. AI processing requires an explicit request.</p>}{error && <p className="error-message" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Connecting…' : register ? 'Create account' : 'Sign in'}<Icon name="arrow" size={16} /></button></form><button className="text-button" onClick={() => { setRegister(!register); setError('') }}>{register ? 'Already have an account? Sign in' : 'Create an Engram account'}</button><button className="text-button" onClick={onDevice}>Use a separate encrypted device notebook</button><p className="fine-print">ChatGPT account connection is pending. This is your Engram login.</p></div><footer><a href={SOURCE_URL}>Source · AGPL-3.0-only</a></footer></main>
}

export default function App() {
  const [device, setDevice] = useState(!API_URL)
  const [vault, setVault] = useState<VaultSession>()
  if (vault) return <NotesWorkspace vault={vault} onLock={async () => setVault(undefined)} />
  if (device) return <VaultGate onUnlocked={setVault} onCloud={API_URL ? () => setDevice(false) : undefined} />
  return <AuthProvider><CloudGate onDevice={() => setDevice(true)} /></AuthProvider>
}
