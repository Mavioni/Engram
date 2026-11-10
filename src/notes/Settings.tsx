import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { parseEntry, type Entry } from './model'

export function Settings({ entries, cloud, theme, setTheme, lock, importEntries, saving }: { entries: Entry[]; cloud: boolean; theme: string; setTheme: (theme: string) => void; lock: () => Promise<void>; importEntries: (entries: Entry[]) => Promise<number>; saving: boolean }) {
  const [notice, setNotice] = useState('')
  const [importing, setImporting] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  return <section className="scroll-view settings-screen"><div className="section-heading"><div><span className="label">YOUR SPACE, YOUR CHOICES</span><h1>Keep the keys.</h1></div></div>
    <article className="panel"><span className="label">NOTEBOOK</span><div className="setting-row"><div><h3>Appearance</h3><p>The same quiet palette as your notes app.</p></div><button className="secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />{theme === 'dark' ? 'Light' : 'Dark'}</button></div><div className="setting-row"><div><h3>{cloud ? 'Engram Cloud' : 'Encrypted device vault'}</h3><p>{cloud ? 'Saved entries belong to your authenticated account. Drafts stay in this session until saved.' : 'Your notes and drafts are encrypted in this browser. The key stays in this session. Clearing browser data removes this vault.'}</p></div><span className="connection-badge">{cloud ? 'CONNECTED' : 'THIS DEVICE'}</span></div><div className="setting-row"><div><h3>{cloud ? 'Sign out' : 'Lock notebook'}</h3><p>{cloud ? 'End your current Engram session.' : 'Your passphrase is required to reopen it. Reloading also locks the notebook.'}</p></div><button className="secondary" disabled={saving || importing} onClick={() => { void lock().catch(reason => setNotice(reason.message)) }}><Icon name="lock" size={15} />{cloud ? 'Sign out' : 'Lock'}</button></div></article>
    <article className="panel"><span className="label">CONNECTIONS</span><div className="setting-row"><div><h3>ChatGPT account</h3><p>Sign-in and ChatGPT plan usage require an approved integration. Your existing ChatGPT conversations are not imported automatically.</p></div><span className="connection-badge pending">PENDING</span></div><div className="setting-row"><div><h3>IRIS conversation</h3><p>{cloud ? 'Uses your Engram server’s configured AI provider. Saved-memory use is off until you enable it for a conversation.' : 'Available when an Engram server is configured. You can use notes, timelines, and Self Mirror now.'}</p></div><span className={`connection-badge${cloud ? '' : ' pending'}`}>{cloud ? 'SERVER LINKED' : 'NOT CONNECTED'}</span></div><div className="source-permissions"><h3>Additional data sources</h3><p>Photos, recordings, location, health records, contacts, browsing, wearables, OMI, and agent tools are not collecting data in this alpha. Each connection will require its own permission.</p></div></article>
    <article className="panel"><span className="label">YOUR DATA</span><h2>Take your words with you.</h2><p>Export creates a readable JSON file containing your saved notes. Keep it somewhere private. Device drafts and chat sessions are not included.</p><div className="settings-actions"><button className="secondary" onClick={() => {
      const blob = new Blob([JSON.stringify({ app: 'Engram', version: 1, exportedAt: new Date().toISOString(), entries }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob); const link = document.createElement('a')
      link.href = url; link.download = 'engram-notebook.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('Your readable notebook export is ready. Store it privately.')
    }}><Icon name="download" size={15} />Export readable JSON</button><button className="secondary" disabled={saving || importing} onClick={() => file.current?.click()}>{importing ? 'Importing…' : 'Import notes JSON'}</button></div>
    <input ref={file} type="file" accept="application/json,.json" aria-label="Import notes file" className="visually-hidden" onChange={async event => {
      const selected = event.target.files?.[0]
      if (!selected) return
      setImporting(true); setNotice('')
      try {
        if (selected.size > 2 * 1024 * 1024) throw new Error('Choose a JSON export smaller than 2 MB.')
        const parsed: unknown = JSON.parse(await selected.text())
        const source = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' ? (parsed as { entries?: unknown }).entries : null
        if (!Array.isArray(source) || source.length > 500) throw new Error('Choose an Engram or Massimo Notes export with at most 500 entries.')
        const records = source.map(parseEntry)
        if (records.some(record => !record)) throw new Error('Some entries are invalid. No entries were imported. Each body must be at most 6,000 characters.')
        const count = await importEntries(records as Entry[])
        setNotice(`${count} of ${records.length} entries imported.${count < records.length ? ' Import stopped after a save error.' : ''}`)
      } catch (reason) { setNotice(reason instanceof Error ? reason.message : 'The file could not be imported.') }
      finally { setImporting(false); event.target.value = '' }
    }} />
    {notice && <p role="status" className="notice">{notice}</p>}</article>
    <article className="panel privacy-panel"><Icon name="eye" size={22} /><div><h3>Your mirror reflects. You decide.</h3><p>Self Mirror uses only your saved entries and selected moods. It does not impersonate you, diagnose you, or act on your behalf. No notes are sent to an AI provider without an explicit chat request or enabled memory sharing.</p></div></article>
    <footer className="source-footer">Engram · Private alpha · © 2026 Massimo Panella<br /><a href="https://github.com/Mavioni/Engram">Corresponding source</a> · <a href="https://github.com/Mavioni/Engram/blob/master/LICENSE">AGPL-3.0-only</a> · No warranty</footer>
  </section>
}
