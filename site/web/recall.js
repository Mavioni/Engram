import {addDays, entryTitle, localDate, MOODS} from './model.js';

const stopWords = new Set(('a an and any are about did do does find for from have how i in is it me my of on or please s show so tell that the this to up was were what when where which with would you notebook entry entries journal note notes record records remember memory something' +
  ' can could has had some there get give see saved save write written wrote last').split(' '));

export function recallKind(entry) {
  return entry.kind ?? 'moment';
}

export function recallTerms(query) {
  const words = query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return [...new Set(words.filter(word => !stopWords.has(word)))].slice(0, 8);
}

export function recallQuestion(message, previous, today = localDate()) {
  const text = message.trim().toLowerCase();
  const onlyTime = /^(?:(?:what about|and|from|in|during)\s+)?(?:(?:last|past|this) (?:week|month|\d{1,3} days)|today|yesterday)\??$/i.test(text);
  const followUp = /^(?:and |what about |how about |tell me more|more (?:please|about)|show (?:me )?more)/i.test(text);
  const dated = /\b(today|yesterday|(?:last|past|this) (?:week|month|\d{1,3} days))\b/i.exec(text)?.[0];
  const newest = /\b(recent|latest|last (?:few|entries)|newest)\b/i.test(text);
  const queryText = (dated ? text.replace(dated, ' ') : text).replace(/\b(recent|latest|newest|last few|tell me more|show me more|what about|how about)\b/g, ' ');
  let terms = onlyTime ? [] : recallTerms(queryText);
  if (!terms.length && followUp) terms = previous?.terms ?? [];
  let from = followUp ? previous?.from : undefined;
  let to = followUp ? previous?.to : undefined;
  if (dated) {
    const days = Number(/\d+/.exec(dated)?.[0]) || (dated.endsWith('week') ? 7 : dated.endsWith('month') ? 30 : 1);
    to = dated === 'yesterday' ? addDays(today, -1) : today;
    from = addDays(to, 1 - Math.min(days, 365));
    if (dated === 'this week' || dated === 'last week') {
      const weekday = (new Date(today + 'T12:00:00').getDay() + 6) % 7;
      from = addDays(today, -weekday - (dated === 'last week' ? 7 : 0));
      if (dated === 'last week') to = addDays(from, 6);
    }
    if (dated === 'this month') from = today.slice(0, 7) + '-01';
  }
  const kind = /\b(plans?|tasks?)\b/.test(text) ? 'plan' : /\b(mood|feel|felt|feelings|check[ -]?ins?)\b/.test(text) ? 'moment' : followUp ? previous?.kind : undefined;
  terms = terms.filter(term => !(kind === 'plan' && ['plan','plans','task','tasks'].includes(term)) &&
    !(kind === 'moment' && ['mood','feel','felt','feeling','feelings','check','checkin','checkins','ins'].includes(term)));
  const writing = /\b(write|wrote|written|writing)\b/.test(text) || Boolean(followUp && previous?.writing);
  return {terms, from, to, kind, writing, recent: newest || Boolean(dated || kind || (followUp && previous?.recent))};
}

export function recallExcerpt(body, terms, size = 240) {
  const clean = body.replace(/\s+/g, ' ').trim();
  const lower = clean.toLowerCase();
  const indexes = terms.map(term => lower.indexOf(term)).filter(index => index >= 0);
  const match = indexes.length ? Math.min(...indexes) : 0;
  const start = Math.max(0, Math.min(match - 70, clean.length - size));
  const part = clean.slice(start, start + size).replace(/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/gu, '').trim();
  return (start ? '…' : '') + part + (start + size < clean.length ? '…' : '');
}

export function recallSource(entry, terms) {
  return {
    id: entry.id, kind: recallKind(entry), date: entry.date, title: entryTitle(entry),
    excerpt: recallExcerpt(entry.body, terms),
    ...(entry.mood ? {mood: MOODS[entry.mood - 1]?.label} : {}),
    ...(entry.kind === 'plan' ? {time: entry.time, completed: entry.done} : {})
  };
}

export function collectRecall(entries, criteria, limit = 5) {
  const {terms, from, to, kind, writing} = criteria;
  return entries.filter(entry => (!kind || recallKind(entry) === kind) &&
      (!writing || (recallKind(entry) !== 'plan' && Boolean(entry.body))) &&
      (!from || entry.date >= from) && (!to || entry.date <= to))
    .map(entry => {
      const mood = entry.mood ? MOODS[entry.mood - 1]?.label ?? '' : '';
      const labels = [entry.title, ...entry.tags, mood].join(' ').toLowerCase();
      const body = entry.body.toLowerCase();
      const score = terms.reduce((total, term) => total + (labels.includes(term) ? 3 : body.includes(term) ? 1 : 0), 0);
      return {entry, score};
    }).filter(match => match.score || !terms.length)
    .sort((a, b) => b.score - a.score || b.entry.date.localeCompare(a.entry.date) || b.entry.createdAt.localeCompare(a.entry.createdAt))
    .slice(0, limit).map(({entry}) => recallSource(entry, terms));
}
