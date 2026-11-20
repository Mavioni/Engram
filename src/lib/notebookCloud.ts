/**
 * Explicit, opt-in cloud boundary for the Notebook.
 * Importing this module does not make a network request or upload local data.
 */
import { isEntry, type NotebookEntry } from '../experience/model'

export type CloudEntry = NotebookEntry & { revision: number }
export type CloudSession = { user: { id: string; email: string } }
export type CloudPage = { entries: CloudEntry[]; limit: number; partial: boolean; nextCursor: string | null }

export class CloudApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'CloudApiError'
  }
}

function apiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (!raw) throw new Error('Cloud API URL is not configured. Local Notebook data has not been uploaded.')
  const url = new URL(raw)
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('VITE_API_URL must be a plain API origin.')
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) {
    throw new Error('Cloud API must use HTTPS outside local development.')
  }
  return url.origin
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiOrigin()}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Accept': 'application/json', ...init.headers },
  })
  if (!response.ok) {
    throw new CloudApiError(
      response.status === 401 ? 'Sign in to use cloud storage.' :
      response.status === 409 ? 'A newer copy exists. Resolve the conflict before saving.' :
      response.status === 503 ? 'Cloud authentication is not configured.' :
      `Cloud request failed (HTTP ${response.status}).`,
      response.status,
    )
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

function isCloudEntry(value: unknown): value is CloudEntry {
  return isEntry(value) && typeof (value as unknown as Record<string, unknown>).revision === 'number'
    && Number.isInteger((value as unknown as Record<string, number>).revision)
    && (value as unknown as Record<string, number>).revision >= 1
}

export const notebookCloud = {
  /** Check the server-side session without modifying local Notebook data. */
  async session(): Promise<CloudSession | null> {
    try {
      const data = await request<CloudSession>('/api/me')
      if (!data?.user?.id || !data.user.email) throw new Error('Unexpected session response.')
      return data
    } catch (error) {
      if (error instanceof CloudApiError && error.status === 401) return null
      throw error
    }
  },
  /** Returns one bounded page. Never interpret partial=true as a complete backup. */
  async list(limit = 100, cursor?: string): Promise<CloudPage> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new Error('Invalid page size.')
    const data = await request<CloudPage>(`/api/notebook?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)
    if (!Array.isArray(data?.entries) || !data.entries.every(isCloudEntry) || typeof data.partial !== 'boolean' ||
      !(data.nextCursor === null || (typeof data.nextCursor === 'string' && /^\\d{1,16}:[\\w-]{8,120}$/.test(data.nextCursor))) ||
      (data.partial && !data.nextCursor)) {
      throw new Error('Unexpected cloud Notebook response; local data was not changed.')
    }
    return data
  },
  /** Retrieve all cloud pages without changing local Notebook state.
   * A bounded traversal avoids infinite loops on malformed responses.
   * Concurrent writes may change the ordering; reconcile by ID before importing.
   */
  async listAll(): Promise<CloudEntry[]> {
    const entries = new Map<string, CloudEntry>()
    let cursor: string | undefined
    const visited = new Set<string>()
    for (let pageNumber = 0; pageNumber < 500; pageNumber++) {
      const page = await notebookCloud.list(200, cursor)
      for (const entry of page.entries) entries.set(entry.id, entry)
      if (!page.partial) return [...entries.values()]
      if (!page.nextCursor || visited.has(page.nextCursor)) throw new Error('Cloud pagination did not advance. Local data is unchanged.')
      visited.add(page.nextCursor)
      cursor = page.nextCursor
    }
    throw new Error('Cloud Notebook exceeded the safe pagination limit. Local data is unchanged.')
  },
  /** Caller must obtain affirmative sync consent and resolve any conflicts first. */
  async put(entry: NotebookEntry, expectedRevision = 0): Promise<CloudEntry> {
    if (!isEntry(entry) || !/^[\w-]{8,120}$/.test(entry.id)) throw new Error('Invalid Notebook entry.')
    if (!Number.isInteger(expectedRevision) || expectedRevision < 0) throw new Error('Invalid expected revision.')
    const data = await request<{ entry: CloudEntry }>(`/api/notebook/${encodeURIComponent(entry.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: entry.kind, title: entry.title, body: entry.body, tags: entry.tags,
        done: entry.done ?? false, mood: entry.mood ?? null,
        intensity: entry.intensity ?? null, factors: entry.factors ?? [],
        expectedRevision,
      }),
    })
    if (!isCloudEntry(data?.entry)) throw new Error('Unexpected save response.')
    return data.entry
  },
  async remove(id: string): Promise<void> {
    if (!/^[\w-]{8,120}$/.test(id)) throw new Error('Invalid Notebook entry ID.')
    await request<void>(`/api/notebook/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}
