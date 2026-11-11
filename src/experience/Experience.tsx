import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { EngramGraph } from './EngramGraph'
import { dateLabel, entryTitle, exportNotebook, downloadRawNotebook, freshEntry, readNotebookStorage, MOOD_FACTORS, MOOD_NAMES, parseImport, shortText, STORAGE_KEY, type EntryKind, type MoodName, type NotebookEntry } from './model'
import './experience.css'

type View = 'notebook' | 'engram' | 'today' | 'iris'
type Filter = 'all' | EntryKind
const sections: Array<{ id: View; label: string; icon: string }> = [
  { id:'notebook',label:'Notebook',icon:'notebook' },
  { id:'engram',label:'Engram',icon:'orbits' },
  { id:'today',label:'Today',icon:'sun' },
  { id:'iris',label:'IRIS',icon:'iris' },
]
function Icon({ name, size=20 }: {name:string;size?:number}) {
  const paths: Record<string,ReactNode> = {
    notebook:<><rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 3v18M12 8h5M12 12h5"/></>,
    orbits:<><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(35 12 12)"/></>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    iris:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></>,
    plus:<path d="M12 5v14M5 12h14"/>,
    search:<><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/></>,
    left:<path d="m15 18-6-6 6-6"/>,
    arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,
    mood:<><circle cx="12" cy="12" r="9"/><path d="M8 14s1.4 2 4 2 4-2 4-2M8.5 9.5h.01M15.5 9.5h.01"/></>,
    trash:<><path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6m4-6v6"/></>,
    download:<><path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></>,
    check:<path d="m5 12 5 5L20 7"/>,
    close:<path d="M5 5l14 14M19 5 5 19"/>,
    journal:<><path d="M5 4h14v17H7a2 2 0 0 1-2-2V4ZM5 19a2 2 0 0 1 2-2h12M9 8h6"/></>,
    task:<><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 12 3 3 7-7"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.notebook}</svg>
}
function KindIcon({kind}: {kind:EntryKind}) {return <span className={`kind-icon kind-${kind}`}><Icon name={kind==='note'?'notebook':kind==='mood'?'mood':kind==='task'?'task':'journal'} size={16}/></span>}
const kindLabel: Record<EntryKind,string> = {note:'Note',journal:'Journal',task:'Task',mood:'Mood'}

export default function Experience() {
  const [initialNotebook] = useState(readNotebookStorage)
  const [entries,setEntries] = useState<NotebookEntry[]>(initialNotebook.entries)
  const [storageBlocked,setStorageBlocked] = useState(Boolean(initialNotebook.error))
  const [view,setView] = useState<View>('notebook')
  const [filter,setFilter] = useState<Filter>('all')
  const [selectedId,setSelectedId] = useState<string|null>(null)
  const [showEditor,setShowEditor] = useState(false)
  const [search,setSearch] = useState('')
  const [settings,setSettings] = useState(false)
  const [checkin,setCheckin] = useState(false)
  const [storageError,setStorageError] = useState(initialNotebook.error ?? '')
  const [notice,setNotice] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (storageBlocked) return // Preserve the original unreadable bytes.
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(entries)); setStorageError('') }
    catch { setStorageError('Unable to save on this device. Export your notes and check browser storage.') }
  },[entries,storageBlocked])
  useEffect(() => {
    const onStorage=(e:StorageEvent)=>{
      if(e.key!==STORAGE_KEY) return
      const snapshot=readNotebookStorage()
      if(snapshot.error){setStorageBlocked(true);setStorageError(snapshot.error);return}
      setStorageBlocked(false)
      setEntries(snapshot.entries)
    }
    window.addEventListener('storage',onStorage)
    return ()=>window.removeEventListener('storage',onStorage)
  },[])
  const create = useCallback((kind:EntryKind='note') => {
    if(storageBlocked){setNotice('Notebook is read-only until the stored data is recovered or explicitly erased.');return}
    if(kind==='mood'){setCheckin(true);return}
    const entry=freshEntry(kind)
    setEntries(prev=>[entry,...prev]);setView('notebook');setSelectedId(entry.id);setShowEditor(true);setFilter('all')
  },[storageBlocked])
  useEffect(()=>{
    const keyHandler=(e:KeyboardEvent)=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setView('notebook');setShowEditor(false);searchRef.current?.focus()}
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();create()}
    }
    window.addEventListener('keydown',keyHandler);return()=>window.removeEventListener('keydown',keyHandler)
  },[create])
  const sorted = useMemo(()=>[...entries].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),[entries])
  const filtered = useMemo(()=>sorted.filter(e=>{
    if(filter!=='all' && e.kind!==filter)return false
    const q=search.toLowerCase().trim()
    return !q || [e.title,e.body,...e.tags,e.mood||'',...(e.factors||[])].some(text=>text.toLowerCase().includes(q))
  }),[sorted,filter,search])
  const active = entries.find(e=>e.id===selectedId)??null
  const update=(id:string,patch:Partial<NotebookEntry>)=>{
    if(storageBlocked){setNotice('Notebook is read-only until the stored data is recovered or explicitly erased.');return}
    setEntries(prev=>prev.map(e=>e.id===id?{...e,...patch,updatedAt:new Date().toISOString()}:e))
  }
  const remove=(id:string)=>{
    if(storageBlocked){setNotice('Notebook is read-only until the stored data is recovered or explicitly erased.');return}
    if(!window.confirm('Delete this page from this browser? This cannot be undone.'))return
    setEntries(prev=>prev.filter(e=>e.id!==id));setSelectedId(null);setShowEditor(false)
  }
  const open=(id:string)=>{setSelectedId(id);setView('notebook');setFilter('all');setSearch('');setShowEditor(true)}
  const addMood=(mood:MoodName,intensity:number,factors:string[],body:string)=>{
    if(storageBlocked){setNotice('Notebook is read-only until the stored data is recovered or explicitly erased.');return}
    const entry=freshEntry('mood')
    entry.mood=mood;entry.intensity=intensity;entry.factors=factors;entry.body=body
    entry.title=`Feeling ${mood.toLowerCase()}`
    setEntries(prev=>[entry,...prev]);setCheckin(false);setNotice('Check-in saved to your Notebook');setView('notebook');setSelectedId(entry.id);setShowEditor(true)
  }
  const doImport=async(e:ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];e.target.value='';if(!file)return
    if(storageBlocked){setNotice('Export a recovery copy and erase unreadable local data before importing.');return}
    try {
      if(file.size>20_000_000)throw new Error('This backup is too large for browser import.')
      const incoming=parseImport(await file.text())
      const existing=new Set(entries.map(x=>x.id));const added=incoming.filter(x=>!existing.has(x.id))
      setEntries(prev=>[...added,...prev]);setNotice(`Imported ${added.length} page${added.length===1?'':'s'}; duplicates skipped.`);setSettings(false)
    }catch(error){setNotice(error instanceof Error?error.message:'Unable to import this file.')}
  }
  const eraseLocalNotebook = () => {
    const warning = storageBlocked
      ? 'Permanently erase unreadable Notebook data on this device? Download a recovery copy first. This cannot be undone.'
      : 'Permanently erase every Notebook page on this device? Export a backup first if needed.'
    if(!window.confirm(warning))return
    try {
      localStorage.removeItem(STORAGE_KEY)
      setStorageBlocked(false)
      setStorageError('')
      setEntries([])
      setSelectedId(null)
      setShowEditor(false)
      setSettings(false)
      setNotice('Local Notebook erased.')
    } catch {
      setStorageError('Unable to erase local data. Check browser storage permissions.')
    }
  }
  const overview = useMemo(()=>({
    notes:entries.filter(e=>e.kind==='note'||e.kind==='journal').length,
    openTasks:entries.filter(e=>e.kind==='task'&&!e.done).length,
    moods:entries.filter(e=>e.kind==='mood').length,
    tags:new Set(entries.flatMap(e=>e.tags.map(t=>t.toLowerCase()))).size,
  }),[entries])

  return <div className="eng-app">
    <aside className="eng-sidebar">
      <button className="brand" onClick={()=>{setView('notebook');setShowEditor(false)}} aria-label="Engram home">
        <span className="brand-mark"><span/></span>
        <span><b>engram<span className="brand-period">.</span></b><small>YOUR MIND, IN CONTEXT</small></span>
      </button>
      <span className="sidebar-caption">YOUR SPACE</span>
      <nav className="side-links" aria-label="Main navigation">{sections.map(s=><button key={s.id} className={view===s.id?'current':''} aria-current={view===s.id?'page':undefined} onClick={()=>{setView(s.id);setShowEditor(false)}}><Icon name={s.icon}/><span>{s.label}</span>{s.id==='notebook'&&<em>{entries.length}</em>}</button>)}</nav>
      <div className="side-break"/>
      <span className="sidebar-caption">CAPTURE</span>
      <div className="side-captures"><button onClick={()=>create('note')}><Icon name="plus" size={17}/>New note</button><button onClick={()=>create('journal')}><Icon name="journal" size={17}/>Journal entry</button><button onClick={()=>create('task')}><Icon name="task" size={17}/>New task</button><button onClick={()=>setCheckin(true)}><Icon name="mood" size={17}/>Mood check-in</button></div>
      <div className="sidebar-bottom"><div className="sidebar-privacy"><span className="privacy-dot"/>On this device<small>Local Notebook · No cloud sync</small></div><button className="side-settings" onClick={()=>setSettings(true)}><Icon name="settings" size={18}/> Settings</button></div>
    </aside>

    <div className="eng-main">
      <header className="eng-topbar"><div className="top-left"><span className="top-breadcrumb">ENGRAM</span><span className="top-slash">/</span><span>{sections.find(s=>s.id===view)?.label}</span></div><div className="top-actions"><span className="save-status"><span/>{storageError?'Storage unavailable':'Stored in this browser'}</span><button className="top-icon" aria-label="Settings" onClick={()=>setSettings(true)}><Icon name="settings" size={19}/></button><button className="button primary top-new" onClick={()=>create('note')}><Icon name="plus" size={17}/>New page</button></div></header>
      {storageError && <div className="storage-error" role="alert">{storageError}</div>}
      {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><Icon name="close" size={16}/></button></div>}

      {view==='notebook' && <main className="notebook-layout">
        <section className={`notebook-list ${showEditor?'mobile-hidden':''}`} aria-label="Notebook pages">
          <div className="notebook-list-head"><div className="overline">THE NOTEBOOK</div><h1>Make room<br/>for thought<span className="soft-period">.</span></h1><p>Your thoughts, plans, memories and moments. One place for everything that matters.</p></div>
          <div className="notebook-search"><Icon name="search" size={18}/><input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your notebook" aria-label="Search your notebook"/><kbd>⌘ K</kbd></div>
          <div className="filters" aria-label="Filter pages">{(['all','note','journal','task','mood'] as Filter[]).map(f=><button key={f} className={filter===f?'chosen':''} onClick={()=>setFilter(f)} aria-pressed={filter===f}>{f==='all'?'All':f==='mood'?'Mood':f==='journal'?'Journal':f==='task'?'Tasks':'Notes'}</button>)}</div>
          <div className="entries-heading"><span>{filtered.length} {filtered.length===1?'PAGE':'PAGES'}</span><span>RECENT FIRST</span></div>
          <div className="entries" aria-live="polite">{filtered.length===0 ? <div className="notebook-empty"><span className="empty-glyph"><Icon name="notebook" size={30}/></span><h3>{entries.length?'No matching pages yet.':'Your notebook starts here.'}</h3><p>{entries.length?'Try another search or filter.':'Capture a thought, write a journal entry, or save something you need to remember.'}</p><button className="button primary" onClick={()=>create('note')}><Icon name="plus" size={16}/>Create first page</button></div> : filtered.map(e=><button key={e.id} className={`entry-row ${selectedId===e.id?'selected':''}`} onClick={()=>open(e.id)}><KindIcon kind={e.kind}/><span className="entry-text"><strong>{entryTitle(e)}</strong><span>{shortText(e.body,90)||[e.kind==='mood'?e.mood:e.done?'Completed':null,...e.tags].filter(Boolean).join(' · ')||'Start writing…'}</span><small>{dateLabel(e.updatedAt)} · {kindLabel[e.kind]}</small></span><Icon name="arrow" size={16}/></button>)}</div>
        </section>
        <section className={`notebook-editor ${!showEditor?'mobile-hidden':''}`} aria-label="Page editor">{active ? <article className="editor-inner" key={active.id}><button className="back-mobile" onClick={()=>setShowEditor(false)}><Icon name="left" size={17}/>All pages</button><div className="editor-toolbar"><span className="editor-kind"><KindIcon kind={active.kind}/>{kindLabel[active.kind]}</span><div className="editor-tools"><span className="autosave">{storageError ? "Not saved — storage unavailable" : "✓ Auto-saved locally"}</span><button className="icon-button" title="Delete page" aria-label="Delete page" onClick={()=>remove(active.id)}><Icon name="trash" size={18}/></button></div></div>
          {active.kind==='task' && <label className="task-complete"><input type="checkbox" checked={Boolean(active.done)} onChange={e=>update(active.id,{done:e.target.checked})}/>{active.done?'Task completed':'Mark task complete'}</label>}
          {active.kind==='mood' && <div className="mood-display"><span className="overline">CHECK-IN</span><strong>{active.mood}</strong><span>Intensity {active.intensity??0}%</span>{Boolean(active.factors?.length)&&<div className="mood-factors">{active.factors?.map(f=><span key={f}>{f}</span>)}</div>}</div>}
          <input className="editor-title" aria-label="Page title" placeholder="Untitled page" maxLength={200} value={active.title} onChange={e=>update(active.id,{title:e.target.value})}/>
          <div className="editor-meta">Created {dateLabel(active.createdAt)} <span>·</span> Updated {dateLabel(active.updatedAt)}</div>
          <textarea className="editor-body" aria-label="Page content" placeholder={active.kind==='journal'?'What happened today? What matters to you?':active.kind==='task'?'Add context, steps or what needs to happen…':active.kind==='mood'?'What was on your mind?':'Start anywhere. This page is yours.'} value={active.body} onChange={e=>update(active.id,{body:e.target.value})}/>
          <div className="editor-tags"><span className="overline">CONNECTIONS / TAGS</span><input key={active.id} aria-label="Tags, comma separated" placeholder="Add tags separated by commas…" defaultValue={active.tags.join(', ')} onBlur={e=>update(active.id,{tags:[...new Set(e.target.value.split(',').map(x=>x.trim()).filter(Boolean))].slice(0,30).map(t=>t.slice(0,64))})} onKeyDown={e=>{if(e.key==='Enter'){e.currentTarget.blur()}}}/><small>Shared tags create real connections in your Engram.</small></div>
        </article> : <div className="editor-welcome"><div className="welcome-symbol" aria-hidden="true"><span/><span/><span/></div><div className="overline">A SPACE TO THINK</div><h2>Your life,<br/><i>in your words.</i></h2><p>Select a page or start writing. Everything you capture becomes part of your personal Engram.</p><button className="button primary" onClick={()=>create('note')}><Icon name="plus" size={16}/>Write something</button><span className="editor-footnote">Nothing here is generated or interpreted without you.</span></div>}</section>
      </main>}

      {view==='engram' && <main className="page-view engram-view"><div className="page-heading"><div className="overline">THE LIVING MAP</div><h1>This is your <i>Engram.</i></h1><p>A living, three-dimensional view of what you've actually written. Not a personality score. Not an imagined profile.</p></div><EngramGraph entries={entries} onOpen={open}/><div className="page-note">Your graph is computed on this device from saved pages. Shared tags create the connections; the spatial layout is a navigation aid, not a scientific measurement of consciousness.</div></main>}

      {view==='today' && <main className="page-view today-view"><div className="page-heading"><div className="overline">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}).toUpperCase()}</div><h1>A clearer view<br/><i>of today.</i></h1><p>Only what you've actually recorded. No invented productivity statistics.</p></div><div className="metric-grid"><div><span>YOUR PAGES</span><strong>{entries.length}</strong><small>In your Notebook</small></div><div><span>OPEN TASKS</span><strong>{overview.openTasks}</strong><small>Still in progress</small></div><div><span>MOOD CHECK-INS</span><strong>{overview.moods}</strong><small>Moments recorded</small></div><div><span>UNIQUE TAGS</span><strong>{overview.tags}</strong><small>Connections you named</small></div></div>
        <div className="today-columns"><section className="today-card"><div className="section-head"><div><span className="overline">NEXT UP</span><h2>Things on your mind.</h2></div><button onClick={()=>create('task')}><Icon name="plus" size={17}/> Add task</button></div>{entries.filter(e=>e.kind==='task'&&!e.done).length ? entries.filter(e=>e.kind==='task'&&!e.done).slice(0,7).map(e=><label className="task-line" key={e.id}><input type="checkbox" checked={false} onChange={()=>update(e.id,{done:true})}/><span>{entryTitle(e)}</span><button onClick={()=>open(e.id)} aria-label={`Open ${entryTitle(e)}`}><Icon name="arrow" size={16}/></button></label>):<p className="muted-empty">No open tasks. Add one when there's something you want to keep track of.</p>}</section><section className="today-card"><div className="section-head"><div><span className="overline">RECENTLY RECORDED</span><h2>Moments worth keeping.</h2></div><button onClick={()=>setCheckin(true)}><Icon name="plus" size={17}/> Check in</button></div>{sorted.filter(e=>e.kind==='mood'||e.kind==='journal').length?sorted.filter(e=>e.kind==='mood'||e.kind==='journal').slice(0,5).map(e=><button className="recent-line" key={e.id} onClick={()=>open(e.id)}><KindIcon kind={e.kind}/><span><strong>{entryTitle(e)}</strong><small>{dateLabel(e.createdAt)}</small></span><Icon name="arrow" size={16}/></button>):<p className="muted-empty">Your reflections and mood check-ins will appear here as you add them.</p>}</section></div></main>}

      {view==='iris' && <main className="page-view iris-view"><div className="page-heading"><div className="overline">IRIS / PERSONAL RECALL</div><h1>Find your <i>thread.</i></h1><p>Ask your Notebook what you've written. For now, this is private, keyword-based recall — not a connected AI model.</p></div><div className="iris-layout"><div className="iris-presence"><div className="iris-orb" aria-hidden="true"><i/><i/><i/></div><div className="overline">YOUR REFLECTION COMPANION</div><h2>Start with what you know.</h2><p>IRIS can help you retrieve your own words while full conversational intelligence awaits a verified backend connection.</p><span className="iris-status">● Local recall only · Cloud AI not connected</span></div><div className="iris-search"><label htmlFor="iris-query" className="overline">SEARCH YOUR MEMORY</label><div className="iris-query"><Icon name="search" size={20}/><input id="iris-query" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try a person, place, feeling, or topic…"/></div><div className="iris-results">{search.trim()?filteredByQuery(entries,search).length ? filteredByQuery(entries,search).slice(0,20).map(e=><button key={e.id} onClick={()=>open(e.id)}><span className="overline">{kindLabel[e.kind]} · {dateLabel(e.updatedAt)}</span><strong>{entryTitle(e)}</strong><small>{shortText(e.body,180)||'No text yet.'}</small><span className="open-note">Open page →</span></button>):<div className="muted-empty">No matching pages found. IRIS only reports what your Notebook contains.</div>:<div className="muted-empty">Search for a word or topic to find matching pages in your Notebook. Your content stays in your browser.</div>}</div></div></div></main>}
    </div>
    <nav className="eng-mobile-nav" aria-label="Mobile navigation">{sections.map(s=><button key={s.id} className={view===s.id?'current':''} aria-current={view===s.id?'page':undefined} onClick={()=>{setView(s.id);setShowEditor(false)}}><Icon name={s.icon} size={20}/><span>{s.label}</span></button>)}<button onClick={()=>setCheckin(true)}><Icon name="plus" size={20}/><span>Check in</span></button></nav>

    {checkin&&<MoodDialog onClose={()=>setCheckin(false)} onSave={addMood}/>}
    {settings&&<div className="modal-scrim" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSettings(false)}}><section className="settings-sheet" role="dialog" aria-modal="true" aria-label="Notebook settings"><div className="modal-head"><div><span className="overline">YOUR DATA / YOUR CONTROL</span><h2>Notebook settings</h2></div><button className="icon-button" aria-label="Close settings" onClick={()=>setSettings(false)}><Icon name="close"/></button></div><div className="settings-section"><h3>Local storage</h3><p>Your pages are saved automatically to this browser's local storage. They are <b>not encrypted or synced to the cloud</b>. Clearing browser data or using another device will not restore them. Export backups regularly.</p><div className="setting-count">{storageBlocked?'Existing saved pages could not be loaded. Original data has not been overwritten.':`${entries.length} pages saved on this device`}</div></div><div className="settings-section"><h3>Own your words</h3><p>Export a portable JSON backup of all your Notebook entries, or import an existing Engram Notebook v2 backup.</p><div className="settings-buttons">{storageBlocked?<button className="button primary" onClick={()=>{try{downloadRawNotebook();setNotice('Recovery copy downloaded.')}catch(error){setNotice(error instanceof Error?error.message:'Unable to export recovery copy.')}}}><Icon name="download" size={17}/>Download recovery copy</button>:<><button className="button primary" onClick={()=>exportNotebook(entries)}><Icon name="download" size={17}/>Export backup</button><button className="button subtle" onClick={()=>importRef.current?.click()}>Import backup</button></>}<input ref={importRef} type="file" accept=".json,application/json" hidden onChange={doImport}/></div></div><div className="settings-section danger"><h3>Erase this device's notebook</h3><p>This permanently deletes the local pages in this browser only. It does not affect any server records.</p><button onClick={eraseLocalNotebook}>Erase local Notebook</button></div><div className="settings-source">Engram · Open source under AGPL-3.0-only · <a href="https://github.com/Mavioni/Engram" target="_blank" rel="noreferrer">View source</a></div></section></div>}
  </div>
}

function filteredByQuery(entries:NotebookEntry[],search:string) {
  const q=search.toLowerCase().trim()
  return entries.filter(e=>[e.title,e.body,...e.tags,e.mood||'',...(e.factors||[])].some(text=>text.toLowerCase().includes(q))).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))
}

function MoodDialog({onClose,onSave}:{onClose:()=>void;onSave:(mood:MoodName,intensity:number,factors:string[],body:string)=>void}) {
  const [mood,setMood]=useState<MoodName|null>(null)
  const [intensity,setIntensity]=useState(60)
  const [factors,setFactors]=useState<string[]>([])
  const [note,setNote]=useState('')
  return <div className="modal-scrim" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="mood-sheet" role="dialog" aria-modal="true" aria-label="Mood check-in"><div className="modal-head"><div><span className="overline">A MOMENT FOR YOURSELF</span><h2>How are you feeling?</h2><p>Choose the word that fits. There's no right answer.</p></div><button className="icon-button" aria-label="Close check-in" onClick={onClose}><Icon name="close"/></button></div><div className="mood-choice-grid">{MOOD_NAMES.map(m=><button key={m} className={m===mood?'chosen':''} aria-pressed={m===mood} onClick={()=>setMood(m)}><span className={`mood-gem gem-${m.toLowerCase()}`}/><strong>{m}</strong></button>)}</div><label className="range-label">Intensity <span>{intensity}%</span><input type="range" min="0" max="100" step="5" value={intensity} onChange={e=>setIntensity(Number(e.target.value))}/></label><span className="overline">WHAT MIGHT BE INFLUENCING IT? (OPTIONAL)</span><div className="factor-grid">{MOOD_FACTORS.map(f=><button key={f} className={factors.includes(f)?'chosen':''} aria-pressed={factors.includes(f)} onClick={()=>setFactors(prev=>prev.includes(f)?prev.filter(x=>x!==f):[...prev,f])}>{f}</button>)}</div><label className="mood-note-label">A note to yourself (optional)<textarea maxLength={10000} value={note} onChange={e=>setNote(e.target.value)} placeholder="What made today feel this way?"/></label><div className="modal-footer"><button className="button subtle" onClick={onClose}>Cancel</button><button className="button primary" disabled={!mood} onClick={()=>{if(mood)onSave(mood,intensity,factors,note)}}><Icon name="check" size={17}/>Save check-in</button></div></section></div>
}
