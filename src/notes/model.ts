export const MOODS = [
  { id: 'radiant', label: 'Radiant', color: '#FBBF24', value: 5 },
  { id: 'steady', label: 'Steady', color: '#10B981', value: 4 },
  { id: 'cloudy', label: 'Cloudy', color: '#94A3B8', value: 3 },
  { id: 'heavy', label: 'Heavy', color: '#6366F1', value: 2 },
  { id: 'frayed', label: 'Frayed', color: '#EF4444', value: 1 },
] as const

export type Mood = typeof MOODS[number]['id']
export type Layout = 'classic' | 'compact' | 'voice' | 'chat'
export type Tab = 'today' | 'timeline' | 'insights' | 'recap' | 'settings'
export type Entry = {
  id: string
  date: string
  title: string
  body: string
  mood: Mood | null
  tags: string[]
  createdAt: number
  updatedAt: number
}
export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type Draft = { title: string; body: string; mood: Mood | null; tags: string[]; pendingThought?: string }
export type Notebook = { version: 1; entries: Entry[]; draft: Draft }
export const emptyDraft = (): Draft => ({ title: '', body: '', mood: null, tags: [], pendingThought: '' })
export const emptyNotebook = (): Notebook => ({ version: 1, entries: [], draft: emptyDraft() })
export const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/u).length : 0
export const moodOf = (id: Mood | null) => MOODS.find(mood => mood.id === id)

// Construct local calendar dates; UTC conversion can move a late-night entry.
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function dateLabel(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, options ?? { month: 'short', day: 'numeric', year: 'numeric' })
}
export function parseEntry(value: unknown): Entry | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Partial<Entry>
  if (typeof item.id !== 'string' || typeof item.body !== 'string' || item.body.length > 6000 ||
      typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(item.date) ||
      !Number.isFinite(new Date(`${item.date}T12:00:00`).getTime())) return null
  return {
    id: item.id, body: item.body, date: item.date,
    title: typeof item.title === 'string' ? item.title.slice(0, 160) : '',
    mood: MOODS.some(mood => mood.id === item.mood) ? item.mood as Mood : null,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 10).map(tag => tag.slice(0, 40)) : [],
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
    updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : Date.now(),
  }
}
