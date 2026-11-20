import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { previewDatabase } from '../scripts/preview-db.mjs';
import { createNotebookWorker } from '../server/worker.mjs';
import { validateEntry } from '../web/model.js';
import { loadCloudNotebook, saveCloudNotebook } from '../web/account.js';

function moment(id, body = 'The walk helped me unwind.') {
  return validateEntry({id, body, title: '', mood: 4, tags: ['Outside'], date: '2026-11-16'});
}
function change(base = '', put = [], remove = []) { return {base, next: randomUUID(), put, remove}; }
function setup(t) {
  const DB = previewDatabase();
  t.after(() => DB.close());
  const app = createNotebookWorker({'/index.html': ['text/html', 'Public notebook']}, validateEntry);
  return async (owner, url = '/api/notebook', options = {}) => {
    const headers = new Headers(options.headers);
    if (owner) headers.set('oai-authenticated-user-id', owner);
    return app.fetch(new Request(new URL(url, 'https://engram.test'), {...options, headers}), {DB});
  };
}
function patch(call, owner, data, extra = {}) {
  return call(owner, '/api/notebook', {method: 'PATCH', headers: {
    'Content-Type': 'application/json', 'X-Engram-Account': owner || '', ...extra
  }, body: JSON.stringify(data)});
}
test('visitors can open the site, but anonymous reads and writes have no notebook access', async t => {
  const call = setup(t);
  assert.equal((await call(null, '/')).status, 200);
  assert.equal((await call(null)).status, 401);
  assert.equal((await patch(call, null, change('', [moment('private')]))).status, 401);
  assert.equal((await call(null, '/server/worker.mjs')).status, 404);
  assert.deepEqual((await (await call('alice')).json()).entries, []);
});
test('account ownership is enforced on every read, update, import and deletion', async t => {
  const call = setup(t);
  const a = change('', [moment('same', 'Alice wrote this')]);
  const b = change('', [moment('same', 'Bob wrote this')]);
  assert.equal((await patch(call, 'alice', a)).status, 200);
  assert.equal((await patch(call, 'bob', b)).status, 200);
  assert.equal((await patch(call, 'bob', change(b.next, [], ['same']), {'X-Engram-Account': 'alice'})).status, 409);
  const edited = change(a.next, [moment('same', 'Alice edited'), moment('imported')]);
  assert.equal((await patch(call, 'alice', edited)).status, 200);
  const read = await call('alice', '/api/notebook?owner=bob');
  assert.match(read.headers.get('cache-control'), /no-store/);
  assert.equal((await read.json()).entries.find(e => e.id === 'same').body, 'Alice edited');
  assert.equal((await patch(call, 'alice', change(edited.next, [], ['same','imported']))).status, 200);
  const bob = await (await call('bob')).json();
  assert.deepEqual(bob.entries, b.put);
  assert.equal(bob.revision, b.next);
});
test('a mood check-in can sync without a note and then be edited', async t => {
  const call = setup(t);
  t.mock.method(globalThis, 'fetch', (url, init) => call('alice', url, init));
  const checkIn = moment('check-in', '');
  const first = await loadCloudNotebook();
  await saveCloudNotebook(first.account, first.revision, [], [checkIn]);
  const second = await loadCloudNotebook();
  assert.deepEqual(second.entries, [checkIn]);
  const edited = moment(checkIn.id, 'Something to remember.');
  await saveCloudNotebook(second.account, second.revision, second.entries, [edited]);
  assert.deepEqual((await loadCloudNotebook()).entries, [edited]);
});
test('same-receipt retries are idempotent and stale writers cannot clobber or resurrect entries', async t => {
  const call = setup(t);
  const first = change('', [moment('one')]);
  const retry = await patch(call, 'alice', first);
  assert.equal(retry.status, 200);
  assert.deepEqual(await (await patch(call, 'alice', first)).json(), {revision:first.next});
  const deletion = change(first.next, [], ['one']);
  assert.equal((await patch(call, 'alice', deletion)).status, 200);
  assert.equal((await patch(call, 'alice', change(first.next, [moment('one', 'older device')]))).status, 409);
  assert.equal((await patch(call, 'alice', first)).status, 409);
  assert.deepEqual((await (await call('alice')).json()).entries, []);
});
test('invalid imports and cross-origin writes are rejected without changing the notebook', async t => {
  const call = setup(t);
  const valid = change('', [moment('first')]);
  assert.equal((await patch(call, 'alice', valid, {Origin:'https://elsewhere.test'})).status, 403);
  assert.equal((await patch(call, 'alice', valid, {'Content-Type':'text/plain'})).status, 415);
  assert.equal((await patch(call, 'alice', change('', [moment('ok'), {...moment('bad'), mood:9}]))).status, 400);
  assert.equal((await patch(call, 'alice', change('', [moment('duplicate'),moment('duplicate')]))).status, 400);
  assert.deepEqual((await (await call('alice')).json()).entries, []);
});
test('two clients load the same account across pages and detect changes during pagination', async t => {
  const call = setup(t);
  let signedIn = 'alice';
  t.mock.method(globalThis, 'fetch', (url, init) => call(signedIn, url, init));
  const first = await loadCloudNotebook();
  const entries = Array.from({length: 135}, (_, i) => moment('import-' + i));
  const revision = await saveCloudNotebook(first.account, first.revision, [], entries);
  const secondDevice = await loadCloudNotebook();
  assert.equal(secondDevice.revision, revision);
  assert.equal(secondDevice.entries.length, entries.length);
  assert.deepEqual(new Set(secondDevice.entries.map(n=>n.id)), new Set(entries.map(n=>n.id)));
  const latest = change(revision, [moment('next')]);
  assert.equal((await patch(call, 'alice', latest)).status, 200);
  const stalePage = await call('alice','/api/notebook?offset=64&revision=' + revision);
  assert.equal(stalePage.status, 409);
  signedIn = 'bob';
  assert.deepEqual((await loadCloudNotebook()).entries, []);
  await assert.rejects(() => saveCloudNotebook(first.account, latest.next, [], [moment('cross-account')]), {code:'account_changed'});
  signedIn = null;
  assert.equal(await loadCloudNotebook(), null);
});
test('a lost write response is retried once under the same receipt', async t => {
  const call = setup(t); let discard = true;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    const reply = await call('alice', url, init);
    if (init.method === 'PATCH' && discard) { discard = false; throw new TypeError('Lost reply'); }
    return reply;
  });
  const first = await loadCloudNotebook();
  const rev = await saveCloudNotebook(first.account, '', [], [moment('retry')]);
  const again = await loadCloudNotebook();
  assert.equal(again.revision, rev);
  assert.equal(again.entries.length, 1);
});
test('the database enforces the notebook limit and a replacement at capacity still succeeds', async t => {
  const call = setup(t);
  const fill = change('', Array.from({length:5000}, (_,i) => moment('m-' + i)));
  assert.equal((await patch(call, 'alice', fill)).status, 200);
  assert.equal((await patch(call, 'alice', change(fill.next,[moment('extra')]))).status, 422);
  assert.equal((await patch(call, 'alice', change(fill.next,[moment('extra')],['m-0']))).status, 200);
});

test('existing moments, standalone journals and timed plans share revisions and survive a fresh client', async t => {
  const call = setup(t);
  const legacy = moment('existing');
  const first = change('', [legacy]);
  assert.equal((await patch(call, 'alice', first)).status, 200);
  const journal = validateEntry({id:'journal', kind:'journal', title:'My words', body:'A reflection.', date:'2026-11-16'});
  const plan = validateEntry({id:'plan', kind:'plan', title:'Go for a walk', body:'', date:'2026-11-17', time:'16:30', done:false});
  const second = change(first.next, [journal, plan]);
  assert.equal((await patch(call, 'alice', second)).status, 200);
  const completion = change(second.next, [{...plan, done:true}]);
  assert.equal((await patch(call, 'alice', completion)).status, 200);
  assert.equal((await patch(call, 'alice', change(second.next, [{...plan, time:'19:00'}]))).status, 409);
  const snapshot = await (await call('alice')).json();
  assert.equal(snapshot.revision, completion.next);
  assert.deepEqual(snapshot.entries, [legacy, journal, {...plan, done:true}]);
  assert.deepEqual((await (await call('bob')).json()).entries, []);
});
