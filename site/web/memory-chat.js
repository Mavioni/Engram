import {collectRecall, recallQuestion} from './recall.js';

const starters = [
  'What did I write this week?',
  'What plans did I save?',
  'Show my recent mood check-ins'
];
const kinds = {moment:'Check-in', journal:'Journal', plan:'Plan'};
const conversationLimit = 24;

function replyFor(entries, sources, query) {
  if (!entries.length) return 'Your notebook is empty. Add an entry or a plan, then ask me about it here.';
  if (!query.terms.length && !query.recent) return 'Ask me about a topic, date, mood, or plan in your notebook.';
  if (!sources.length) return 'I couldn’t find a matching entry. Try a different phrase or a wider date range.';
  return sources.length === 1
    ? 'I found one matching entry. Open it for the full context.'
    : `Here are ${sources.length} matching entries. Open any source for the full context.`;
}

export function createMemoryChat({$, icon, entries, access, openRecord}) {
  const form = $('#chat-form');
  const input = $('#chat-question');
  const log = $('#chat-log');
  let turns = [];
  let lastQuery;
  let lastSourceLink;
  const el = (name, className, value) => {
    const node = document.createElement(name);
    node.className = className;
    if (value) node.textContent = value;
    return node;
  };
  const dateLabel = date => new Date(date + 'T12:00:00').toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});

  function message(sender, text) {
    const bubble = el('article', `chat-turn turn-${sender}`);
    bubble.append(el('strong','turn-author', sender === 'user' ? 'You' : 'Engram'), el('p','turn-text',text));
    return bubble;
  }
  function sourceCard(source) {
    const button = el('button','chat-source');
    button.type = 'button';
    const meta = [kinds[source.kind], dateLabel(source.date), source.mood,
      source.kind === 'plan' ? source.completed ? 'Completed' : 'Open' : null].filter(Boolean).join(' · ');
    button.append(el('small','chat-source-meta',meta), el('strong','chat-source-title',source.title));
    if (source.excerpt) button.append(el('span','chat-source-excerpt',source.excerpt));
    const mark = el('span','chat-source-icon');
    mark.innerHTML = icon('arrow-up');
    button.append(mark);
    button.addEventListener('click', () => openRecord(source.id));
    return button;
  }
  function submit(raw) {
    const question = raw.trim();
    if (!question || !access().ready) return;
    const criteria = recallQuestion(question, lastQuery);
    const notebook = entries();
    const sources = criteria.terms.length || criteria.recent ? collectRecall(notebook, criteria) : [];
    lastQuery = criteria;
    const turn = message('user', question);
    const reply = message('engram', replyFor(notebook, sources, criteria));
    if (sources.length) {
      const references = el('div','chat-source-list');
      references.append(...sources.map(sourceCard));
      reply.append(references);
    }
    turns.push([turn, reply]);
    if (turns.length > conversationLimit) turns.shift().forEach(node => node.remove());
    $('#chat-starters').hidden = true;
    $('#chat-clear').hidden = false;
    log.append(turn, reply);
    log.scrollTop = Math.max(0, turn.offsetTop - log.offsetTop - 12);
    input.value = '';
    input.focus({preventScroll:true});
  }
  function reset() {
    turns = [];
    lastQuery = undefined;
    lastSourceLink = undefined;
    log.replaceChildren();
    input.value = '';
    $('#chat-clear').hidden = true;
    $('#chat-starters').hidden = false;
    $('#chat-link-status').textContent = '';
    $('#chat-connection').open = false;
  }
  function render(sourceId) {
    const {ready, status, demo} = access();
    $('#chat-gate').hidden = ready;
    $('#chat-interface').hidden = !ready;
    $('#chat-connection').hidden = !ready || demo || status === 'device';
    $('#chat-gate-title').textContent = status === 'error' ? 'Your notebook couldn’t open' : status === 'guest' ? 'Sign in to recall your entries' : 'Opening your notebook…';
    $('#chat-signin').hidden = status !== 'guest';
    $('#chat-example').hidden = !['guest','error'].includes(status);
    $('#chat-retry').hidden = status !== 'error';
    if (!sourceId) { lastSourceLink = undefined; $('#chat-link-status').textContent = ''; }
    if (ready && sourceId && sourceId !== lastSourceLink) {
      lastSourceLink = sourceId;
      if (entries().some(entry => entry.id === sourceId)) {
        $('#chat-link-status').textContent = '';
        openRecord(sourceId);
      } else {
        $('#chat-link-status').textContent = 'This source is unavailable in the current notebook.';
      }
    }
  }
  for (const prompt of starters) {
    const button = el('button','chat-starter',prompt);
    button.type = 'button';
    button.addEventListener('click', () => submit(prompt));
    $('#chat-starters').append(button);
  }
  form.addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
  });
  $('#chat-clear').addEventListener('click', () => { reset(); input.focus(); });
  return {reset, render};
}
