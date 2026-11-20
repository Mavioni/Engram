import { useState, type FormEvent } from 'react'
import { notebookCloud, CloudApiError } from '../lib/notebookCloud'

type Account = { id: string; email: string }
type Props = { onClose: () => void }

/** Account access is deliberately separate from local Notebook data.
 * Signing in never uploads, merges, or deletes local entries.
 */
export function CloudAccountDialog({ onClose }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [account, setAccount] = useState<Account | null>(null)
  const [status, setStatus] = useState('Cloud sync is not enabled. Your local Notebook stays on this device.')
  const [busy, setBusy] = useState(false)

  const origin = import.meta.env.VITE_API_URL?.trim()
  const safeOrigin = (() => {
    if (!origin) return null
    try {
      const url = new URL(origin)
      return url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password &&
        (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname)))
        ? url.origin : null
    } catch { return null }
  })()

  async function checkSession() {
    setBusy(true)
    try {
      const result = await notebookCloud.session()
      setAccount(result?.user ?? null)
      setStatus(result ? 'Signed in. Notebook sync is not enabled yet.' : 'No active cloud session. Local pages are unchanged.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to check cloud session.')
    } finally { setBusy(false) }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!safeOrigin || busy) return
    setBusy(true)
    setStatus('')
    try {
      const endpoint = mode === 'sign-in' ? 'sign-in/email' : 'sign-up/email'
      const response = await fetch(`${safeOrigin}/api/auth/${endpoint}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, ...(mode === 'sign-up' ? { name: email.trim().split('@')[0] } : {}) }),
      })
      if (!response.ok) {
        setStatus(response.status === 503 ? 'Cloud authentication is not configured.' :
          response.status === 429 ? 'Too many requests. Try again later.' :
          'Authentication failed. Check your details or server configuration.')
        return
      }
      const session = await notebookCloud.session()
      setAccount(session?.user ?? null)
      setPassword('')
      setStatus(session ? 'Signed in. No Notebook entries have been uploaded.' :
        'Request accepted, but a browser session could not be verified. Check cookie and origin configuration.')
    } catch (error) {
      setStatus(error instanceof CloudApiError || error instanceof Error ? error.message : 'Unable to contact the cloud API.')
    } finally { setBusy(false) }
  }

  async function signOut() {
    if (!safeOrigin || busy) return
    setBusy(true)
    try {
      const response = await fetch(`${safeOrigin}/api/auth/sign-out`, { method: 'POST', credentials: 'include' })
      if (!response.ok) throw new Error('Sign-out request failed.')
      setAccount(null)
      setStatus('Signed out of the cloud account. Local Notebook entries remain on this device.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to sign out.')
    } finally { setBusy(false) }
  }

  return <div className="modal-scrim" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="settings-sheet" role="dialog" aria-modal="true" aria-label="Cloud account">
      <div className="modal-head"><div><span className="overline">ENGRAM CLOUD</span><h2>Account access</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Close account dialog">×</button></div>
      <div className="settings-section">
        <p>Account access is separate from Notebook synchronization. Signing in does not upload your notes, tasks, journals, or mood entries.</p>
        {!safeOrigin ? <p role="status">Cloud API URL is not configured. Your Notebook remains local.</p> :
          account ? <div><p>Signed in as <strong>{account.email}</strong>.</p><button className="button subtle" disabled={busy} onClick={signOut}>Sign out</button></div> :
          <form onSubmit={submit}>
            <label>Email <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
            <label>Password <input type="password" required minLength={8} autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
            <div className="settings-buttons"><button className="button primary" type="submit" disabled={busy}>{mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
              <button className="button subtle" type="button" disabled={busy} onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>{mode === 'sign-in' ? 'Create an account' : 'Use existing account'}</button></div>
          </form>}
        {safeOrigin && <button className="button subtle" disabled={busy} onClick={checkSession}>Check session</button>}
        <p role="status" aria-live="polite">{status}</p>
      </div>
    </section>
  </div>
}
