import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarDays, filterEntries, notebookInsights, notebookJSON, parseNotebook, validateEntry} from '../web/model.js';

const record = (id, date, fields) => validateEntry({id, date, title:id, body:'', ...fields});

test('new records round-trip in the existing backup format without fabricating a mood', () => {
  const records = [
    record('journal', '2026-11-19', {kind:'journal', body:'I wrote about the walk.', tags:['Outside']}),
    record('plan', '2026-11-20', {kind:'plan', time:'23:59', done:false}),
    record('good feeling', '2026-11-18', {mood:4})
  ];
  assert.deepEqual(parseNotebook(notebookJSON(records)), records);
  assert.equal(records[0].mood, undefined);
  assert.equal(records[1].mood, undefined);
  assert.deepEqual(filterEntries(records, 'OUTSIDE'), [records[0]]);
  assert.deepEqual(filterEntries(records, 'good'), [records[2]]);
  assert.throws(() => record('too late', '2026-11-20', {kind:'plan', time:'24:00', done:false}));
  assert.throws(() => record('impossible', '2026-02-30', {kind:'plan', time:'', done:false}));
});

test('calendar stays aligned to Mondays across month and year boundaries', () => {
  const dates = calendarDays('2026-01-03', 'month');
  assert.equal(dates.length, 42);
  assert.equal(dates[0], '2025-12-29');
  assert.equal(dates.at(-1), '2026-02-08');
  assert.deepEqual(calendarDays('2024-02-29', 'week'), ['2024-02-26','2024-02-27','2024-02-28','2024-02-29','2024-03-01','2024-03-02','2024-03-03']);
});

test('Insights use actual written entries, check-ins and activity days, with streaks over all history', () => {
  const entries = [
    record('plan', '2026-11-20', {kind:'plan', done:true, tags:['Not writing']}),
    record('future', '2026-11-21', {kind:'journal', body:'A future entry.'}),
    record('new journal', '2026-11-19', {kind:'journal', body:'I wrote.', tags:['Outside']}),
    record('check-in', '2026-11-18', {mood:4, tags:['outside']}),
    record('second', '2026-11-18', {mood:3, body:'More writing'}),
    ...['2026-11-01','2026-11-02','2026-11-03'].map(date => record(date, date, {mood:1}))
  ];
  const week = notebookInsights(entries, 7, '2026-11-20');
  assert.equal(week.records.length, 3);
  assert.equal(week.writing.length, 2);
  assert.equal(week.activeDays, 2);
  assert.equal(week.current, 2);
  assert.equal(week.longest, 3);
  assert.equal(week.distribution.get(4), 1);
  assert.equal(week.distribution.get(3), 1);
  assert.equal(week.distribution.has(1), false);
  assert.deepEqual(week.tags, [{label:'Outside', count:2}]);
  assert.equal(week.week.find(day => day.date === '2026-11-18').count, 1);
  assert.equal(week.recent.length, 3);
  assert.equal(notebookInsights(entries, 30, '2026-11-20').records.length, 6);
});
