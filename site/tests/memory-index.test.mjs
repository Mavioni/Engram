import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMemoryIndex, filterMemory, graphNodeLimit, memoryGraph, memoryNeighbors, placeMemory, traceMemory} from '../web/memory-index.js';
import {validateEntry} from '../web/model.js';

const entry = (id, tags, fields = {}) => validateEntry({
  id, title:id, body:'', kind:'journal', tags, date:'2026-11-19', ...fields
});

test('memory indexes all record types and derives edges only from authored tags', () => {
  const index = buildMemoryIndex([
    entry('Morning journal',['Reading','Rest'],{body:'Finished the first chapter.'}),
    entry('Library plan',['reading'],{kind:'plan',done:false}),
    entry('Evening check-in',['REST'],{kind:'moment',mood:4}),
    entry('Untagged',[])
  ]);
  assert.equal(index.items.size,4);
  assert.equal(index.topics.size,2);
  assert.deepEqual([...index.topics.get('topic:reading').links],['entry:Morning journal','entry:Library plan']);
  assert.deepEqual([...memoryNeighbors(index,'entry:Morning journal')], [
    ['entry:Library plan',['topic:reading']], ['entry:Evening check-in',['topic:rest']]
  ]);
  assert.equal(memoryNeighbors(index,'entry:Untagged').size,0);
  assert.deepEqual(filterMemory(index,'reading','plan','').map(node=>node.title),['Library plan']);
  assert.deepEqual(filterMemory(index,'chapter rest','journal','topic:reading').map(node=>node.title),['Morning journal']);
  assert.deepEqual(filterMemory(index,'good','moment','').map(node=>node.title),['Evening check-in']);
});

test('traces follow the shortest chain and leave disconnected records independent', () => {
  const index = buildMemoryIndex([
    entry('A',['alpha','loop']), entry('B',['alpha','beta']), entry('C',['beta']),
    entry('D',['loop','extra']), entry('E',['extra','beta']), entry('F',[])
  ]);
  const path = traceMemory(index,'entry:A','entry:C');
  assert.deepEqual(path,['entry:A','topic:alpha','entry:B','topic:beta','entry:C']);
  assert.deepEqual(traceMemory(index,'entry:A','entry:F'),[]);
  const graph = memoryGraph(index,[],'entry:C',false,path);
  assert.equal(graph.edges.length,4);
  assert.ok(graph.nodes.every(node=>path.includes(node.key)));
});

test('graph rendering is bounded while the index reaches older entries', () => {
  const records = Array.from({length:180},(_,i)=>entry('Record '+i, ['Topic '+(i%20)]));
  records.push(entry('Older lantern case', ['Reading'], {date:'2025-01-01'}));
  const index = buildMemoryIndex(records);
  const matches = filterMemory(index,'','all','');
  const graph = memoryGraph(index,matches,undefined,false);
  assert.equal(graph.nodes.length,graphNodeLimit);
  assert.equal(matches.length,181);
  assert.deepEqual(filterMemory(index,'lantern','all','').map(node=>node.title),['Older lantern case']);
  const positions = placeMemory(graph,280,320);
  for (const {x,y} of positions.values()) {
    assert.ok(x >= 0 && x <= 280);
    assert.ok(y >= 0 && y <= 320);
  }
  assert.equal(positions.size,graphNodeLimit);
});
