import {MEMORY_CATEGORIES, normalizeTags} from '../web/model.js';

const memoryDraftIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const draftLifetime = 24 * 60 * 60 * 1000;
const maxActiveDrafts = 20;

export function checkedMemoryDraft(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Provide the memory to draft.');
  const {title, body, category, tags = []} = input;
  if (Object.keys(input).some(key=>!['title','body','category','tags'].includes(key)) ||
      typeof title !== 'string' || !title.trim() || title.length > 100 ||
      typeof body !== 'string' || !body.trim() || body.length > 2000 ||
      typeof category !== 'string' || !Object.hasOwn(MEMORY_CATEGORIES,category) ||
      !Array.isArray(tags) || tags.length > 12 || tags.some(tag=>typeof tag !== 'string' || tag.length > 30)) {
    throw new Error('A draft needs a title, memory category, and up to 2,000 characters of text.');
  }
  return {title:title.trim(),body:body.trim(),tags:normalizeTags(tags),memory:{category,source:'chatgpt'}};
}

export async function prepareMemoryDraft(db, owner, draft, time = Date.now()) {
  const json = JSON.stringify(draft);
  const hash = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(json));
  const digest = Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
  const [, result] = await db.batch([
    db.prepare('DELETE FROM notebook_memory_drafts WHERE owner_id = ? AND expires_at <= ?').bind(owner,time),
    db.prepare(`INSERT INTO notebook_memory_drafts (owner_id,id,digest,draft_json,expires_at)
      SELECT ?,?,?,?,? WHERE EXISTS (
        SELECT 1 FROM notebook_memory_drafts WHERE owner_id = ? AND digest = ?
      ) OR (SELECT count(*) FROM notebook_memory_drafts WHERE owner_id = ?) < ?
      ON CONFLICT(owner_id,digest) DO UPDATE SET expires_at = excluded.expires_at
      RETURNING id,expires_at AS expiresAt`)
      .bind(owner,crypto.randomUUID(),digest,json,time+draftLifetime,owner,digest,owner,maxActiveDrafts)
  ]);
  return result.results[0] ?? null;
}

export async function readMemoryDraft(db, owner, id, time = Date.now()) {
  if (!memoryDraftIdPattern.test(id)) return null;
  const [result] = await db.batch([
    db.prepare('SELECT draft_json FROM notebook_memory_drafts WHERE owner_id = ? AND id = ? AND expires_at > ?')
      .bind(owner,id,time)
  ]);
  const row = result.results[0];
  return row ? {...JSON.parse(row.draft_json),id} : null;
}
