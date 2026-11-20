import test from 'node:test';
import assert from 'node:assert/strict';
import { localDate, validDate, normalizeTags, validateEntry, parseNotebook, mergeEntries, notebookJSON, entryTitle, filterEntries, weekData, factorCounts, connections } from '../web/model.js';
const entry = (id, overrides = {}) => validateEntry({ id, body: 'A real moment.', title: '', date: '2026-11-16', mood: 4, tags: [], ...overrides });

test('export and import preserve multilingual text and only notebook fields', () => {
  const original = entry('a', { title: '静かな朝 🌿', body: 'A <script> is just notebook text.\nAnother line.', tags: ['Rest'], arbitrary: 'not retained' });
  const restored = parseNotebook(notebookJSON([original]));
  assert.deepEqual(restored, [original]);
  assert.equal('arbitrary' in restored[0], false);
});
test('a mood check-in can be restored from backup without written text', () => {
  const checkIn = entry('check-in', {body: '  ', mood: 2, tags: ['Rest']});
  assert.equal(checkIn.body, '');
  assert.equal(entryTitle(checkIn), 'Mood check-in');
  assert.deepEqual(parseNotebook(notebookJSON([checkIn])), [checkIn]);
  assert.deepEqual(filterEntries([checkIn], 'rest', '2'), [checkIn]);
});
test('a malformed import fails before a partially valid notebook can be used', () => {
  for (const invalid of [ { mood: 6 }, { mood: '4' }, { date: '2026-02-30' }, { body: null }, { body: 'x'.repeat(10001) }, { id: '' }, { title: 'x'.repeat(101) } ]) {
    assert.throws(() => parseNotebook(JSON.stringify({ app:'engram', version:1, entries:[entry('a'), {...entry('b'), ...invalid}] })));
  }
  assert.throws(() => parseNotebook('{broken'));
  assert.throws(() => parseNotebook(JSON.stringify({app:'other',version:1,entries:[]})));
  assert.throws(() => parseNotebook(notebookJSON([entry('a'), entry('a')])));
});
test('import merges new IDs without overwriting an existing moment', () => {
  const existing = entry('a', { body:'My edited original.' });
  const result = mergeEntries([existing], [entry('a', { body:'Old backup.' }), entry('b')]);
  assert.equal(result.added, 1);
  assert.deepEqual(result.entries, [existing, entry('b')]);
});
test('real calendar dates are validated, including leap days', () => {
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2026-11-31'), false);
  assert.equal(validDate('2026-13-01'), false);
  assert.equal(validDate('2026-1-01'), false);
  assert.equal(localDate(new Date(2026, 10, 16, 23)), '2026-11-16');
});
test('tags are bounded and deduplicated case-insensitively', () => {
  assert.deepEqual(normalizeTags([' Rest ', 'rest', '', 'Outside', null, 42]), ['Rest','Outside']);
  assert.equal(normalizeTags(Array.from({length:20}, (_,i)=>`tag-${i}`)).length, 12);
  assert.equal(normalizeTags(['x'.repeat(50)])[0].length, 30);
});
test('search combines exact mood filtering with words, factors and feeling names', () => {
  const entries = [entry('a', { title:'Quiet morning', tags:['Outside'], mood:4 }), entry('b', { title:'A full day', mood:2 })];
  assert.deepEqual(filterEntries(entries, 'outside', '4').map(e=>e.id), ['a']);
  assert.equal(filterEntries(entries, 'outside', '2').length, 0);
  assert.deepEqual(filterEntries(entries, 'LOW').map(e=>e.id), ['b']);
});
test('daily summaries average same-day entries and leave missing days empty', () => {
  const days = weekData([entry('a',{mood:2}), entry('b',{mood:4}), entry('c',{date:'2026-11-10',mood:5}), entry('d',{date:'2026-11-09'}), entry('e',{date:'2026-11-17'})], new Date(2026,10,16,23));
  assert.equal(days.length, 7);
  assert.equal(days[0].date, '2026-11-10');
  assert.equal(days[6].average, 3);
  assert.equal(days[6].count, 2);
  assert.equal(days[1].average, null);
  assert.equal(days.reduce((n,d)=>n+d.count,0), 3);
});
test('memory connections come only from shared factors, never shared moods', () => {
  const entries = [entry('a',{tags:['Rest','Outside']}), entry('b',{tags:['rest']}), entry('c',{tags:['Work']}), entry('d',{tags:['Outside']})];
  assert.deepEqual(connections(entries), [{from:0,to:1,shared:['Rest']},{from:0,to:3,shared:['Outside']}]);
  assert.deepEqual(connections([entry('a'),entry('b')]), []);
  assert.deepEqual(factorCounts(entries), [{label:'Outside',count:2},{label:'Rest',count:2},{label:'Work',count:1}]);
});
