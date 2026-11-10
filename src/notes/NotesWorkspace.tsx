import { useEffect, useState } from 'react'
import { Icon, type IconName } from './Icon'
import { Today } from './Today'
import { Timeline, EntryDetail } from './Timeline'
import { Mirror } from './Mirror'
import { Settings } from './Settings'
import { IrisPanel } from './IrisPanel'
import { useNotebook } from './useNotebook'
import type { Entry, Layout, Tab } from './model'
import type { VaultSession } from './vault'

const tabs: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'pen' }, { id: 'timeline', label: 'Timeline', icon: 'calendar' },
  { id: 'insights', label: 'Insights', icon: 'spark' }, { id: 'recap', label: 'Recap', icon: 'recap' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]
export function NotesWorkspace({ vault, onLock }: { vault?: VaultSession; onLock: () => Promise<void> }) {
  const [tab, setTab] = useState<Tab>('today')
  const [theme, setTheme] = useState(() => localStorage.getItem('engram.appearance') === 'light' ? 'light' : 'dark')
  const [layout, setLayout] = useState<Layout>('chat')
  const [selected, setSelected] = useState<Entry | null>(null)
  const [iris, setIris] = useState(false)
  const data = useNotebook(vault)
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('engram.appearance', theme) }, [theme])
  useEffect(() => {
    if (!iris && !selected) return
    const previous = document.activeElement as HTMLElement | null
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    const focusable = () => [...(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]') ?? [])]
    focusable()[0]?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !data.saving) { setIris(false); setSelected(null) }
      if (event.key !== 'Tab') return
      const items = focusable(); const first = items[0]; const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.removeEventListener('keydown', keydown); previous?.focus() }
  }, [iris, selected, data.saving])
  const lock = async () => {
    if (vault) await vault.save(data.notebook)
    await onLock()
  }
  return <div className="app-shell">
    <header className="top-bar"><div className="app-brand"><span className="brand-dot" /><span className="wordmark">ENGRAM</span><span className="brand-divider" /><h2>{tab === 'recap' ? 'Weekly recap' : tabs.find(item => item.id === tab)?.label}</h2></div><div className="top-actions"><span className="connection-status"><Icon name="lock" size={11} />{vault ? 'ON THIS DEVICE' : 'ENGRAM CLOUD'}</span><button className="icon-button" aria-label="Open IRIS" onClick={() => setIris(true)}><Icon name="eye" /></button><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button></div></header>
    {data.error && <div className="error-banner" role="alert"><span>{data.error}</span><button className="icon-button" aria-label="Dismiss error" onClick={data.clearError}><Icon name="close" size={14} /></button></div>}
    {data.loading && <div className="loading-bar" role="status">Loading your notebook…</div>}
    <main className="app-main" id="main-content">
      {tab === 'today' && <Today draft={data.notebook.draft} updateDraft={data.updateDraft} save={data.put} layout={layout} setLayout={setLayout} saving={data.saving} disabled={data.loading} draftStatus={data.draftStatus} onIris={() => setIris(true)} onMirror={() => setTab('insights')} />}
      {tab === 'timeline' && <Timeline entries={data.notebook.entries} open={setSelected} />}
      {(tab === 'insights' || tab === 'recap') && <Mirror entries={data.notebook.entries} open={setSelected} recap={tab === 'recap'} />}
      {tab === 'settings' && <Settings entries={data.notebook.entries} cloud={!vault} theme={theme} setTheme={setTheme} lock={lock} importEntries={data.importEntries} saving={data.saving} />}
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">{tabs.map(item => <button key={item.id} className={`bottom-nav-item${tab === item.id ? ' active' : ''}`} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}><Icon name={item.icon} size={20} /><span>{item.label}</span></button>)}</nav>
    {selected && <EntryDetail entry={data.notebook.entries.find(entry => entry.id === selected.id) ?? selected} close={() => setSelected(null)} put={data.put} remove={data.remove} saving={data.saving} />}
    {iris && <IrisPanel cloud={!vault} close={() => setIris(false)} />}
  </div>
}
