import test from 'node:test';
import assert from 'node:assert/strict';
import {collectRecall, recallQuestion} from '../web/recall.js';
import {validateEntry} from '../web/model.js';
import {createNotebookWorker} from '../server/worker.mjs';
import {previewDatabase} from '../scripts/preview-db.mjs';

const journal = (id, title, body, date = '2026-11-18') =>
  validateEntry({id, kind:'journal', title, body, date, tags:[]});

test('prompt chips retrieve writing, plans and only mood check-ins when requested', () => {
  const notebook = [
    journal('j', 'At the lake', 'I read a chapter.'),
    validateEntry({id:'m', mood:4, title:'Feeling good', date:'2026-11-17', body:''}),
    validateEntry({id:'p', kind:'plan', title:'Call Mom', date:'2026-11-19', body:'', done:false})
  ];
  const today = '2026-11-20';
  const written = recallQuestion('What did I write this week?', undefined, today);
  assert.deepEqual(written.terms, []);
  assert.equal(written.from, '2026-11-16');
  assert.deepEqual(collectRecall(notebook, written).map(e => e.id), ['j']);
  assert.deepEqual(collectRecall(notebook, recallQuestion('What plans did I save?', undefined, today)).map(e => e.id), ['p']);
  assert.deepEqual(collectRecall(notebook, recallQuestion('Show my recent mood check-ins', undefined, today)).map(e => e.id), ['m']);
  const followUp = recallQuestion('What about last week?', recallQuestion('What did I write about the lake?', undefined, today), today);
  assert.deepEqual(followUp.terms, ['lake']);
  assert.deepEqual([followUp.from, followUp.to], ['2026-11-09','2026-11-15']);
});

test('recall ranks matching titles and preserves the matching part of long entries', () => {
  const sources = collectRecall([
    journal('long', 'Long entry', 'Start. ' + 'Some other thoughts. '.repeat(120) + 'We finally got to the blue lake.'),
    journal('top', 'Lake trip', 'Drove north.')
  ], recallQuestion('What did I write about the lake?'));
  assert.deepEqual(sources.map(source => source.id), ['top','long']);
  assert.match(sources[1].excerpt, /blue lake/);
  assert.ok(sources[1].excerpt.length <= 242);
});

test('ChatGPT memory tool authenticates before reading and returns bounded, owner-scoped sources', async t => {
  const DB = previewDatabase();
  t.after(() => DB.close());
  const app = createNotebookWorker({}, validateEntry);
  const send = (url, account, body, headers = {}) => app.fetch(new Request('https://engram.test' + url, {
    method: url === '/mcp' ? 'POST' : 'PATCH',
    headers: {'Content-Type':'application/json', ...(account ? {'oai-authenticated-user-id': account, 'X-Engram-Account': account} : {}), ...headers},
    body:JSON.stringify(body)
  }), {DB});
  const one = journal('lake space', 'Lake visit', 'Alice saw blue water.' + ' Other thoughts.'.repeat(500));
  const two = journal('bob', 'Lake visit', 'Bob saw something private.');
  for (const [owner, entry] of [['alice',one],['bob',two]]) {
    assert.equal((await send('/api/notebook', owner, {base:'', next:crypto.randomUUID(), put:[entry], remove:[]})).status, 200);
  }
  const rpc = (method, params) => ({id:1,jsonrpc:'2.0',method,params});
  const catalog = await (await send('/mcp', null, rpc('tools/list'))).json();
  assert.equal(catalog.result.tools[0].name, 'search_engram_memory');
  const search = args => rpc('tools/call', {name:'search_engram_memory', arguments:args});
  assert.equal((await send('/mcp', null, search({query:'lake'}))).status, 401);
  assert.equal((await send('/mcp', 'alice', search({query:'lake'}), {Origin:'https://elsewhere.test'})).status, 403);
  const extract = async args => {
    const data = await (await send('/mcp','alice',search(args))).json();
    assert.equal(data.result.isError, undefined);
    return JSON.parse(data.result.content[0].text).sources;
  };
  const [source] = await extract({query:'lake', limit:1});
  assert.match(source.excerpt, /Alice saw/);
  assert.ok(source.excerpt.length <= 242);
  assert.equal(source.url, 'https://engram.test/#chat/lake%20space');
  assert.deepEqual(await extract({query:'lake',from:'2026-11-19'}), []);
  const invalid = await (await send('/mcp','alice', search({query:'lake', owner:'bob'}))).json();
  assert.equal(invalid.result.isError, true);
});
