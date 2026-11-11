/** Engram Notebook: the user's notes are canonical; every visualization is derived. */
export type EntryKind = 'note' | 'journal' | 'task' | 'mood'
export type MoodName = 'Radiant' | 'Content' | 'Calm' | 'Neutral' | 'Tender' | 'Anxious' | 'Low' | 'Overwhelmed'
export type NotebookEntry = {
  id: string
  kind: EntryKind
  title: string
  body: string
  tags: string[]
  createdAt: string
  updatedAt: string
  done?: boolean
  mood?: MoodName
  intensity?: number
  factors?: string[]
}

export const MOOD_NAMES: MoodName[] = ['Radiant','Content','Calm','Neutral','Tender','Anxious','Low','Overwhelmed']
export const MOOD_FACTORS = ['Sleep','Work','Relationships','Body','Solitude','Creativity','Movement','Rest','Conflict','Joy','News / world','Money']
export const STORAGE_KEY = 'engram.notebook.v2'
const kinds: EntryKind[] = ['note','journal','task','mood']
const isRecord = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

export function isEntry(v: unknown): v is NotebookEntry {
  return isRecord(v) && typeof v.id === 'string' && v.id.length < 120 &&
    kinds.includes(v.kind as EntryKind) && typeof v.title === 'string' && v.title.length <= 200 &&
    typeof v.body === 'string' && v.body.length <= 100000 &&
    Array.isArray(v.tags) && v.tags.length <= 30 &&
    v.tags.every(t => typeof t === 'string' && t.length <= 64) &&
    typeof v.createdAt === 'string' && !Number.isNaN(Date.parse(v.createdAt)) &&
    typeof v.updatedAt === 'string' && !Number.isNaN(Date.parse(v.updatedAt)) &&
    (v.mood === undefined || MOOD_NAMES.includes(v.mood as MoodName)) &&
    (v.factors === undefined || (Array.isArray(v.factors) && v.factors.every(f => typeof f === 'string' && MOOD_FACTORS.includes(f)))) &&
    (v.intensity === undefined || (typeof v.intensity === 'number' && v.intensity >= 0 && v.intensity <= 100)) &&
    (v.done === undefined || typeof v.done === 'boolean')
}

export function loadEntries(): NotebookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isEntry)
  } catch { return [] }
}
export function freshEntry(kind: EntryKind): NotebookEntry {
  const now = new Date().toISOString()
  return { id: crypto.randomUUID(), kind, title: '', body: '', tags: [], createdAt: now, updatedAt: now, ...(kind === 'task' ? {done: false} : {}) }
}
export const dateLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, {month:'short',day:'numeric',year:'numeric'})
export const shortText = (text: string, max = 120) => text.replace(/\s+/g,' ').trim().slice(0,max)
export const entryTitle = (entry: NotebookEntry) => entry.title.trim() || (entry.kind === 'mood' && entry.mood ? `Feeling ${entry.mood.toLowerCase()}` : entry.kind === 'task' ? 'Untitled task' : 'Untitled page')
export function exportNotebook(entries: NotebookEntry[]) {
  const blob = new Blob([JSON.stringify({ format: 'engram-notebook', version: 2, exportedAt: new Date().toISOString(), entries }, null, 2)], { type:'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `engram-notebook-${new Date().toISOString().slice(0,10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function parseImport(content: string): NotebookEntry[] {
  const parsed: unknown = JSON.parse(content)
  if (!isRecord(parsed) || parsed.format !== 'engram-notebook' || parsed.version !== 2 || !Array.isArray(parsed.entries) || parsed.entries.length > 20000 || !parsed.entries.every(isEntry)) {
    throw new Error('This is not a valid Engram Notebook v2 backup.')
  }
  return parsed.entries as NotebookEntry[]
}
