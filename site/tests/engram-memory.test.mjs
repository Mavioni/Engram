import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMemoryIndex,filterMemory} from '../web/memory-index.js';
import {notebookJSON,parseNotebook,validateEntry} from '../web/model.js';
import {profileRecall,readEngramIntent} from '../web/recall.js';
import {checkedMemoryDraft,prepareMemoryDraft,readMemoryDraft} from '../server/memory-drafts.mjs';
import {createNotebookWorker} from '../server/worker.mjs';
import {previewDatabase} from '../scripts/preview-db.mjs';

const record = (id,fields = {}) => validateEntry({
  id, kind:'journal', title:id, body:'My words.', tags:['Reading'], date:'2026-11-20', ...fields
});

test('explicit chat memory intents are separate from recall and curated profile entries survive backups', () => {
  assert.deepEqual(readEngramIntent('Remember that I like early walks.'),
    {mode:'draft',body:'I like early walks.'});
  assert.deepEqual(readEngramIntent('What did I remember about Arizona?'),{mode:'recall'});
  assert.deepEqual(readEngramIntent('Help me reflect on last week.'),{mode:'reflection',topic:'last week'});
  assert.deepEqual(readEngramIntent('What are my goals?'),{mode:'profile',category:'goal'});
  const memory = record('My goal',{memory:{category:'goal',source:'engram-chat'}});
  const library = [record('Journal page'),memory];
  assert.deepEqual(parseNotebook(notebookJSON(library)),library);
  assert.deepEqual(profileRecall(library).map(source=>source.id),[memory.id]);
  assert.deepEqual(profileRecall(library,'person'),[]);
  assert.deepEqual(filterMemory(buildMemoryIndex(library),'goal','memory','').map(item=>item.key),['entry:My goal']);
  assert.throws(()=>record('Invalid',{memory:{category:['goal'],source:'engram-chat'}}),/category/);
});

test('ChatGPT prepares an owner-only draft and a confirmed save makes it discoverable as a durable memory', async t => {
  const DB = previewDatabase();
  t.after(()=>DB.close());
  const worker = createNotebookWorker({},validateEntry);
  const send = (owner,path,method,body,headers = {}) => worker.fetch(new Request('https://engram.test' + path,{
    method,headers:{...(owner ? {'OAI-Authenticated-User-ID':owner,'X-Engram-Account':owner} : {}),
      ...(body ? {'Content-Type':'application/json'} : {}), ...headers},
    ...(body ? {body:JSON.stringify(body)} : {})
  }),{DB});
  const call = (owner,name,args) => send(owner,'/mcp','POST',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}});
  const result = async response => JSON.parse((await response.json()).result.content[0].text);
  const args = {title:'Fresh air',body:'I like evening walks.',category:'preference',tags:['Outside']};
  assert.equal((await call(null,'prepare_engram_memory',args)).status,401);
  const prepared = await result(await call('alice','prepare_engram_memory',args));
  assert.equal(prepared.status,'awaiting_review');
  assert.equal(await result(await call('alice','prepare_engram_memory',args)).then(value=>value.reviewUrl),prepared.reviewUrl);
  assert.deepEqual((await (await send('alice','/api/notebook','GET')).json()).entries,[]);
  const draftId = prepared.reviewUrl.split('/').at(-1);
  const endpoint = '/api/memory-drafts/' + draftId;
  assert.equal((await send(null,endpoint,'GET')).status,401);
  assert.equal((await send('bob',endpoint,'GET')).status,404);
  assert.equal((await send('alice',endpoint,'GET',null,{'X-Engram-Account':'bob'})).status,409);
  const {draft} = await (await send('alice',endpoint,'GET')).json();
  assert.equal(draft.memory.source,'chatgpt');
  const saved = record(draft.id,{...draft,body:'I prefer evening walks after work.'});
  const change = {base:'',next:crypto.randomUUID(),put:[saved],remove:[]};
  assert.equal((await send('alice','/api/notebook','PATCH', change)).status,200);
  assert.equal((await send('alice',endpoint,'GET')).status,404);
  assert.equal((await send('alice','/api/notebook','PATCH', change)).status,200);
  const profile = await result(await call('alice','get_engram_profile',{category:'preference'}));
  assert.equal(profile.sources.length,1);
  assert.equal(profile.sources[0].excerpt,'I prefer evening walks after work.');
  assert.equal(profile.sources[0].memory.source,'chatgpt');
  assert.deepEqual((await result(await call('bob','get_engram_profile',{}))).sources,[]);
  assert.equal((await result(await call('alice','search_engram_memory',{category:'preference'}))).sources.length,1);
});

test('drafts cannot be opened after expiry and are capped per owner', async t => {
  const DB = previewDatabase();
  t.after(()=>DB.close());
  const draft = num => checkedMemoryDraft({title:'Memory '+num,body:'Experience '+num,category:'moment'});
  const prepared = await Promise.all(Array.from({length:20},(_,i)=>prepareMemoryDraft(DB,'alice',draft(i),10)));
  assert.equal(await prepareMemoryDraft(DB,'alice',draft(21),10),null);
  assert.ok(await prepareMemoryDraft(DB,'bob',draft(21),10));
  assert.ok(await readMemoryDraft(DB,'alice',prepared[0].id,11));
  assert.equal(await readMemoryDraft(DB,'alice',prepared[0].id,prepared[0].expiresAt),null);
  assert.ok(await prepareMemoryDraft(DB,'alice',draft(21),prepared[0].expiresAt));
});
