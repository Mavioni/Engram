import { test } from 'node:test'
import assert from 'node:assert/strict'
import 'fake-indexeddb/auto'
import { unlockVault, vaultExists } from '../../src/notes/vault'
import { countWords, emptyNotebook, localDate, parseEntry } from '../../src/notes/model'

test('word counts include empty and multiline input correctly', () => {
  assert.equal(countWords(''), 0)
  assert.equal(countWords('  '), 0)
  assert.equal(countWords('One thought.\n\nAnother moment.'), 4)
})

test('local dates keep the authored calendar day in Phoenix at midnight', () => {
  const previous = process.env.TZ
  process.env.TZ = 'America/Phoenix'
  try {
    assert.equal(localDate(new Date('2026-11-11T06:59:00Z')), '2026-11-10')
    assert.equal(localDate(new Date('2026-11-11T07:01:00Z')), '2026-11-11')
  } finally { process.env.TZ = previous }
})

test('imports reject invalid entries and preserve the original title and date', () => {
  assert.equal(parseEntry({ id: 'x', body: 'note', date: 'bad' }), null)
  assert.equal(parseEntry({ id: 'x', body: 'a'.repeat(6001), date: '2026-11-10' }), null)
  assert.equal(parseEntry({ id: 'x', body: 'note', title: 'Original title', date: '2026-11-10', mood: 'heavy' })?.title, 'Original title')
})

async function envelope() {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('engram-private-alpha', 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  try {
    return await new Promise<{ ciphertext: number[]; iv: number[] }>((resolve, reject) => {
      const request = db.transaction('vault').objectStore('vault').get('notebook')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally { db.close() }
}

test('vault encrypts, locks, restores drafts, rejects wrong passwords, and serializes writes', async () => {
  assert.equal(await vaultExists(), false)
  await assert.rejects(unlockVault('short', true), /at least 12/u)
  const session = await unlockVault('Test-only-passphrase-349!', true)
  assert.equal(await vaultExists(), true)
  const data = emptyNotebook()
  data.draft.body = 'A private draft that must never be plaintext in storage.'
  data.draft.pendingThought = 'Unsent private thought'
  data.entries.push({ id: 'private-1', date: '2026-11-10', title: 'Private title', body: 'A saved private entry.', mood: 'steady', tags: ['work'], createdAt: 1, updatedAt: 1 })
  await session.save(data)
  const first = await envelope()
  assert.ok(!JSON.stringify(first).includes('Private title'))
  assert.ok(!new TextDecoder().decode(new Uint8Array(first.ciphertext)).includes('private draft'))
  await assert.rejects(unlockVault('wrong-passphrase-349!', false), /did not unlock/u)
  const unlocked = await unlockVault('Test-only-passphrase-349!', false)
  assert.equal(unlocked.notebook.entries[0].title, 'Private title')
  assert.equal(unlocked.notebook.draft.pendingThought, 'Unsent private thought')
  await Promise.all([session.save({ ...data, draft: { ...data.draft, body: 'old draft' } }), session.save({ ...data, draft: { ...data.draft, body: 'new draft' } })])
  const restored = await unlockVault('Test-only-passphrase-349!', false)
  assert.equal(restored.notebook.draft.body, 'new draft')
  assert.notDeepEqual(first.iv, (await envelope()).iv)
  await assert.rejects(unlockVault('another-passphrase', true), /already exists/u)
})
