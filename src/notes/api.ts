import { parseEntry, type Entry, type ChatMessage } from "./model";

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/u, "") ?? "";
export const SOURCE_URL = `https://github.com/Mavioni/Engram/tree/${import.meta.env.VITE_SOURCE_REF || "feat/notes-interface-alpha"}`;
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("Connect an Engram server to use cloud features.");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Your session expired. Sign in again."
        : body.error || "The request could not be completed.",
    );
  return body;
}
type MemoryRecord = { id: string; memory_type: string; content: string };
export async function loadEntries(): Promise<Entry[]> {
  const result: Entry[] = [];
  for (let offset = 0; ; offset += 100) {
    const response = await request<{ memories: MemoryRecord[]; pagination: { hasMore: boolean } }>(
      `/api/memory?limit=100&offset=${offset}`,
    );
    for (const memory of response.memories) {
      if (memory.memory_type !== "journal_entry") continue;
      try {
        const entry = parseEntry({ ...JSON.parse(memory.content), id: memory.id });
        if (entry) result.push(entry);
      } catch {
        /* Non-journal or older incompatible memory stays on the server. */
      }
    }
    if (!response.pagination.hasMore) break;
  }
  return result;
}
export async function saveEntry(entry: Entry, existing: boolean): Promise<Entry> {
  const response = await request<{ memory: MemoryRecord }>(
    existing ? `/api/memory/${encodeURIComponent(entry.id)}` : "/api/memory",
    {
      method: existing ? "PATCH" : "POST",
      body: JSON.stringify({
        memoryType: "journal_entry",
        content: JSON.stringify(entry),
        source: "engram_notes",
        provenance: "user_stated",
      }),
    },
  );
  return { ...entry, id: response.memory.id };
}
export const removeEntry = (id: string) =>
  request<void>(`/api/memory/${encodeURIComponent(id)}`, { method: "DELETE" });
export const reflect = (messages: ChatMessage[], useMemory: boolean, sessionId?: string) =>
  request<{ content: string; sessionId: string }>("/api/intelligence", {
    method: "POST",
    body: JSON.stringify({ messages, useMemory, ...(sessionId ? { sessionId } : {}) }),
  });
