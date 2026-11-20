export const STORAGE_KEY = 'engram.notebook.v1';
export const DRAFT_KEY = 'engram.draft.v1';
export const MOODS = [
  { value: 1, label: 'Very low', color: '#b5ade1', ink: '#655990' },
  { value: 2, label: 'Low', color: '#a9c7e3', ink: '#4d7393' },
  { value: 3, label: 'Okay', color: '#ead5a1', ink: '#8e7542' },
  { value: 4, label: 'Good', color: '#c1d8a2', ink: '#627a47' },
  { value: 5, label: 'Great', color: '#efb7a1', ink: '#a0634d' }
];
export const FACTORS = ['Work', 'People', 'Rest', 'Movement', 'Creativity', 'Outside'];
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const dateObject = date => new Date(`${date}T12:00:00`);
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = dateObject(value);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
}
export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  return tags.filter(tag => typeof tag === 'string').map(tag => tag.trim().slice(0, 30)).filter(tag => {
    const key = tag.toLocaleLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 12);
}
export function validateEntry(entry) {
  if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || entry.id.length > 100) throw new Error('A moment is missing its identifier.');
  if (typeof entry.body !== 'string' || entry.body.length > 10000) throw new Error('A note can have up to 10,000 characters.');
  const kind = entry.kind ?? 'moment';
  if (!['moment', 'journal', 'plan'].includes(kind)) throw new Error('Invalid notebook item type.');
  if (kind === 'moment' && (!Number.isInteger(entry.mood) || entry.mood < 1 || entry.mood > 5)) throw new Error('A moment has an invalid feeling.');
  if (!validDate(entry.date)) throw new Error('A notebook item has an invalid date.');
  if (entry.title !== undefined && (typeof entry.title !== 'string' || entry.title.length > 100)) throw new Error('A title is too long or invalid.');
  const title = (entry.title || '').trim();
  const body = entry.body.trim();
  const record = {id: entry.id, title, body, tags: normalizeTags(entry.tags), date: entry.date,
    createdAt: typeof entry.createdAt === 'string' ? entry.createdAt.slice(0, 40) : `${entry.date}T12:00:00`,
    updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt.slice(0, 40) : ''};
  if (kind === 'moment') return {...record, mood: entry.mood};
  if (kind === 'journal') {
    if (!title && !body) throw new Error('Add a title or some writing.');
    return {...record, kind};
  }
  if (!title) throw new Error('Give the plan a title.');
  const time = entry.time ?? '';
  if (typeof time !== 'string' || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) || typeof entry.done !== 'boolean') {
    throw new Error('Choose a valid plan time and completion status.');
  }
  return {...record, kind, time, done: entry.done};
}
export function parseNotebook(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('This file is not valid JSON.'); }
  if (data?.app !== 'engram' || data.version !== 1 || !Array.isArray(data.entries)) throw new Error('Choose a version 1 Engram JSON backup.');
  if (data.entries.length > 5000) throw new Error('A notebook can contain at most 5,000 moments.');
  const entries = data.entries.map(validateEntry);
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('The backup contains duplicate moment identifiers.');
  return entries;
}
export function mergeEntries(existing, incoming) {
  const ids = new Set(existing.map(entry => entry.id));
  const added = incoming.filter(entry => !ids.has(entry.id));
  if (existing.length + added.length > 5000) throw new Error('This import would exceed the limit of 5,000 moments.');
  return { entries: [...existing, ...added], added: added.length };
}
export function notebookJSON(entries) {
  return JSON.stringify({ app: 'engram', version: 1, exportedAt: new Date().toISOString(), entries }, null, 2);
}
export const entryTitle = entry => entry.title || (entry.body.length > 55 ? `${entry.body.slice(0, 55).trim()}…` : entry.body) || (entry.kind === 'journal' ? 'Journal entry' : 'Mood check-in');
export const sortedEntries = entries => [...entries].sort((a, b) => b.date.localeCompare(a.date) || (b.time ?? '').localeCompare(a.time ?? '') || b.createdAt.localeCompare(a.createdAt));
export function filterEntries(entries, search = '', mood = 'all') {
  const term = search.trim().toLocaleLowerCase();
  return sortedEntries(entries).filter(entry => (mood === 'all' || (mood === 'journal' ? entry.kind === 'journal' : entry.mood === Number(mood))) && (!term || [entry.title, entry.body, ...entry.tags, MOODS[entry.mood - 1]?.label].join(' ').toLocaleLowerCase().includes(term)));
}
export function weekData(entries, now = new Date()) {
  const end = dateObject(localDate(now));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(end); day.setDate(end.getDate() - 6 + i);
    const date = localDate(day);
    const notes = entries.filter(entry => entry.date === date);
    return { date, day, count: notes.length, average: averageMood(notes) };
  });
}
export function factorCounts(entries) {
  const counts = new Map();
  for (const entry of entries) for (const tag of normalizeTags(entry.tags)) {
    const key = tag.toLocaleLowerCase();
    const current = counts.get(key) || { label: tag, count: 0 };
    counts.set(key, { ...current, count: current.count + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
export function connections(entries) {
  const edges = [];
  for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
    const tags = new Set(entries[j].tags.map(tag => tag.toLocaleLowerCase()));
    const shared = entries[i].tags.filter(tag => tags.has(tag.toLocaleLowerCase()));
    if (shared.length) edges.push({ from: i, to: j, shared });
  }
  return edges;
}

function averageMood(entries) {
  const checkIns = entries.filter(entry => Number.isInteger(entry.mood));
  return checkIns.length ? checkIns.reduce((total, entry) => total + entry.mood, 0) / checkIns.length : null;
}

export function addDays(date, offset) {
  const day = dateObject(date);
  day.setDate(day.getDate() + offset);
  return localDate(day);
}

export function calendarDays(date, mode) {
  const day = dateObject(date);
  const first = mode === 'month' ? localDate(new Date(day.getFullYear(), day.getMonth(), 1)) : date;
  const monday = addDays(first, -((dateObject(first).getDay() + 6) % 7));
  return Array.from({length: mode === 'month' ? 42 : 7}, (_, index) => addDays(monday, index));
}

export function notebookInsights(entries, range, today = localDate()) {
  const start = addDays(today, 1 - range);
  const past = sortedEntries(entries.filter(entry => entry.kind !== 'plan' && entry.date <= today));
  const records = past.filter(entry => entry.date >= start);
  const writing = records.filter(entry => entry.body);
  const days = [...new Set(past.map(entry => entry.date))].reverse();
  let longest = 0, streak = 0, previous = '';
  for (const day of days) {
    streak = previous === addDays(day, -1) ? streak + 1 : 1;
    longest = Math.max(longest, streak);
    previous = day;
  }
  const active = new Set(days);
  let current = 0;
  for (let day = active.has(today) ? today : addDays(today, -1); active.has(day); day = addDays(day, -1)) current++;
  const recentStart = addDays(today, -6);
  const distribution = new Map();
  for (const entry of records) if (entry.mood) distribution.set(entry.mood, (distribution.get(entry.mood) ?? 0) + 1);
  return {records, writing, start, current, longest, activeDays: new Set(records.map(entry => entry.date)).size,
    distribution, tags: factorCounts(records), recent: records.filter(entry => entry.date >= recentStart),
    week: weekData(writing, dateObject(today))};
}
