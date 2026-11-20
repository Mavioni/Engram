import {handleMemoryMcp} from './memory-mcp.mjs';

const PAGE_SIZE = 64;
const MAX_MOMENTS = 5000;
const MAX_BODY_BYTES = 8 * 1024 * 1024;
const receiptPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const writerGuard = 'EXISTS (SELECT 1 FROM notebook_revisions WHERE owner_id = ? AND write_token = ?)';

function apiJson(data, status = 200) {
  return Response.json(data, {status, headers: {
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Cookie, OAI-Authenticated-User-ID'
  }});
}

function failure(status, code, message) {
  return apiJson({code, message}, status);
}

function accountFor(request) {
  const id = request.headers.get('oai-authenticated-user-id');
  if (!id) return null;
  const email = request.headers.get('oai-authenticated-user-email') || '';
  let name = request.headers.get('oai-authenticated-user-full-name') || '';
  if (request.headers.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf8') {
    try { name = decodeURIComponent(name); } catch { name = ''; }
  }
  return {id, label: name || email || 'Your account'};
}

async function readBody(request, limit = MAX_BODY_BYTES) {
  if (!request.body || Number(request.headers.get('Content-Length')) > limit) {
    throw new RangeError('This change is too large. Import a smaller backup.');
  }
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const parts = [];
  let size = 0;
  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new RangeError('This change is too large. Import a smaller backup.');
    }
    parts.push(decoder.decode(value, {stream: true}));
  }
  parts.push(decoder.decode());
  return JSON.parse(parts.join(''));
}

function checkedChange(input, validateEntry) {
  if (!input || typeof input.next !== 'string' || typeof input.base !== 'string' || !receiptPattern.test(input.next) ||
      (input.base !== '' && !receiptPattern.test(input.base)) || input.base === input.next ||
      !Array.isArray(input.put) || !Array.isArray(input.remove) ||
      input.put.length + input.remove.length > MAX_MOMENTS * 2 ||
      input.put.length > MAX_MOMENTS || input.remove.length > MAX_MOMENTS) {
    throw new Error('Invalid notebook change.');
  }
  const put = input.put.map(validateEntry);
  const remove = input.remove;
  if (!remove.every(id => typeof id === 'string' && id.length && id.length <= 100)) throw new Error('Invalid moment identifier.');
  const touched = [...put.map(e => e.id), ...remove];
  if (new Set(touched).size !== touched.length) throw new Error('A moment may only be changed once per save.');
  return {base: input.base, next: input.next, put, remove, touched};
}

// Keep every bound JSON string within D1's size limit, including large imports.
function chunkedJson(rows) {
  const chunks = [];
  let parts = [], units = 0;
  for (const row of rows) {
    const json = JSON.stringify(row);
    if (units + json.length > 340000 && parts.length) {
      chunks.push('[' + parts.join(',') + ']');
      parts = []; units = 0;
    }
    parts.push(json); units += json.length + 1;
  }
  if (parts.length) chunks.push('[' + parts.join(',') + ']');
  return chunks;
}

async function getPage(db, account, url) {
  const offset = Number(url.searchParams.get('offset') || '0');
  if (!Number.isInteger(offset) || offset < 0 || offset > MAX_MOMENTS) return failure(400, 'invalid_page', 'Invalid notebook page.');
  const [head, records] = await db.batch([
    db.prepare('SELECT revision FROM notebook_revisions WHERE owner_id = ?').bind(account.id),
    db.prepare('SELECT entry_json FROM notebook_moments WHERE owner_id = ? ORDER BY moment_id LIMIT ? OFFSET ?')
      .bind(account.id, PAGE_SIZE + 1, offset)
  ]);
  const revision = head.results[0]?.revision || '';
  const expected = url.searchParams.get('revision');
  if (expected !== null && expected !== revision) return failure(409, 'conflict', 'Your notebook changed on another device.');
  const entries = records.results.slice(0, PAGE_SIZE).map(row => JSON.parse(row.entry_json));
  return apiJson({account, revision, entries, nextOffset: records.results.length > PAGE_SIZE ? offset + PAGE_SIZE : null});
}

async function writeChange(db, owner, change) {
  const token = crypto.randomUUID();
  // Only the transaction that acquired this revision can alter its moments.
  // Use separately bound chunks for pathological imported identifiers as well.
  const touched = chunkedJson(change.touched);
  const exclusions = touched.map(() => 'AND moment_id NOT IN (SELECT value FROM json_each(?))').join(' ');
  const statements = [
    db.prepare("INSERT INTO notebook_revisions (owner_id, revision, write_token) VALUES (?, '', '') ON CONFLICT DO NOTHING").bind(owner),
    db.prepare(`UPDATE notebook_revisions SET revision = ?, write_token = ?
      WHERE owner_id = ? AND revision = ?
      AND (SELECT COUNT(*) FROM notebook_moments WHERE owner_id = ? ${exclusions}) + ? <= ?`)
      .bind(change.next, token, owner, change.base, owner, ...touched, change.put.length, MAX_MOMENTS)
  ];
  for (const ids of chunkedJson(change.remove)) {
    statements.push(db.prepare(`DELETE FROM notebook_moments WHERE owner_id = ? AND ${writerGuard}
      AND moment_id IN (SELECT value FROM json_each(?))`).bind(owner, owner, token, ids));
  }
  for (const records of chunkedJson(change.put)) {
    statements.push(db.prepare(`INSERT INTO notebook_moments (owner_id, moment_id, entry_json)
      SELECT ?, json_extract(value, '$.id'), value FROM json_each(?) WHERE ${writerGuard}
      ON CONFLICT(owner_id, moment_id) DO UPDATE SET entry_json = excluded.entry_json`).bind(owner, records, owner, token));
  }
  statements.push(db.prepare('SELECT revision FROM notebook_revisions WHERE owner_id = ?').bind(owner));
  const results = await db.batch(statements);
  const revision = results.at(-1).results[0].revision;
  if (revision === change.next) return apiJson({revision});
  if (revision === change.base) return failure(422, 'limit', 'A notebook can hold up to 5,000 moments.');
  return failure(409, 'conflict', 'Your notebook changed on another device.');
}

export function createNotebookWorker(assets, validateEntry) {
  return {async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/mcp') return handleMemoryMcp(request, env, accountFor(request), url.origin, apiJson, readBody);
    if (url.pathname !== '/api/notebook') {
      const name = url.pathname === '/' ? '/index.html' : url.pathname;
      const asset = Object.hasOwn(assets, name) && assets[name];
      if (!asset || !['GET', 'HEAD'].includes(request.method)) return new Response('Not found', {status: 404});
      return new Response(request.method === 'HEAD' ? null : asset[1], {headers: {
        'Content-Type': asset[0], 'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin'
      }});
    }
    const account = accountFor(request);
    if (!account) return failure(401, 'signed_out', 'Sign in with ChatGPT to open your notebook.');
    if (!['GET', 'PATCH'].includes(request.method)) return failure(405, 'method', 'Unsupported notebook action.');
    const expected = request.headers.get('X-Engram-Account');
    if ((expected || request.method === 'PATCH') && expected !== account.id) {
      return failure(409, 'account_changed', 'Your signed-in account changed. Reopen your notebook.');
    }
    try {
      const db = env.DB;
      if (request.method === 'GET') return await getPage(db, account, url);
      if (request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
          (request.headers.has('Origin') && request.headers.get('Origin') !== url.origin)) {
        return failure(403, 'origin', 'Open Engram directly to save this change.');
      }
      if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        return failure(415, 'content_type', 'A notebook change must be JSON.');
      }
      let change;
      try { change = checkedChange(await readBody(request), validateEntry); }
      catch (error) { return failure(error instanceof RangeError ? 413 : 400, 'invalid_change', error instanceof SyntaxError ? 'Invalid JSON.' : error.message); }
      return await writeChange(db, account.id, change);
    } catch {
      return failure(503, 'unavailable', 'Engram could not reach your notebook. Try again in a moment.');
    }
  }};
}
