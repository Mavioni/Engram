const accountEndpoint = '/api/notebook';

async function requestNotebook(url, options = {}) {
  const response = await fetch(url, {credentials: 'same-origin', cache: 'no-store', ...options});
  let data;
  try { data = await response.json(); }
  catch { throw new Error('Engram could not open your notebook. Check your connection and try again.'); }
  if (!response.ok) {
    const error = new Error(data.message || 'Your notebook could not be reached.');
    error.code = data.code;
    throw error;
  }
  return data;
}

export async function loadCloudNotebook() {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const first = await requestNotebook(accountEndpoint);
      const entries = [...first.entries];
      let offset = first.nextOffset;
      while (offset !== null) {
        const query = new URLSearchParams({offset: String(offset), revision: first.revision});
        const page = await requestNotebook(accountEndpoint + '?' + query, {headers: {'X-Engram-Account': first.account.id}});
        entries.push(...page.entries);
        offset = page.nextOffset;
      }
      return {account: first.account, revision: first.revision, entries};
    } catch (error) {
      if (error.code === 'signed_out') return null;
      if (attempt === 2 || !['account_changed', 'conflict'].includes(error.code)) throw error;
    }
  }
}

export async function saveCloudNotebook(account, revision, before, after) {
  const current = new Map(before.map(entry => [entry.id, entry]));
  const remaining = new Set(after.map(entry => entry.id));
  const put = after.filter(entry => entry !== current.get(entry.id));
  const remove = before.filter(entry => !remaining.has(entry.id)).map(entry => entry.id);
  if (!put.length && !remove.length) return revision;
  const body = JSON.stringify({base: revision, next: crypto.randomUUID(), put, remove});
  const options = {method: 'PATCH', headers: {'Content-Type': 'application/json', 'X-Engram-Account': account.id}, body};
  // A lost response can be retried with the same receipt without saving twice.
  for (let attempt = 0; ; attempt++) {
    try { return (await requestNotebook(accountEndpoint, options)).revision; }
    catch (error) {
      if (attempt || (error.code && error.code !== 'unavailable')) throw error;
    }
  }
}
