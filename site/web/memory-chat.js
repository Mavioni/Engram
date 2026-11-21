import {MEMORY_CATEGORIES} from './model.js';
import {collectRecall, profileRecall, readEngramIntent, recallQuestion} from './recall.js';

const starters = [
  'What do you remember about me?',
  'Help me reflect on today',
  'What did I write this week?',
  'What plans did I save?'
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

export function createMemoryChat({$, icon, entries, access, openRecord, openMemoryDraft}) {
  const form = $('#chat-form');
  const input = $('#chat-question');
  const log = $('#chat-log');
  let turns = [];
  let lastQuery;
  let lastLink, pendingDraft, draftRequest, lastQuestion;
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
    const meta = [MEMORY_CATEGORIES[source.memory?.category] ?? kinds[source.kind], dateLabel(source.date), source.mood,
      source.kind === 'plan' ? source.completed ? 'Completed' : 'Open' : null].filter(Boolean).join(' · ');
    button.append(el('small','chat-source-meta',meta), el('strong','chat-source-title',source.title));
    if (source.excerpt) button.append(el('span','chat-source-excerpt',source.excerpt));
    const mark = el('span','chat-source-icon');
    mark.innerHTML = icon('arrow-up');
    button.append(mark);
    button.addEventListener('click', () => openRecord(source.id));
    return button;
  }
  function chatAction(label, handle) {
    const button = el('button','text-button chat-turn-action',label);
    button.type = 'button';
    button.addEventListener('click',handle);
    return button;
  }
  function draftFrom(body = '') {
    let category = 'moment';
    if (/^i (?:prefer|love|like)\b/i.test(body)) category = 'preference';
    else if (/^(?:my goal|i want to|i plan to)\b/i.test(body)) category = 'goal';
    else if (/^(?:i realized|i learned)\b/i.test(body)) category = 'reflection';
    return {body,memory:{category,source:'engram-chat'}};
  }
  function buildReply(intent, question, notebook) {
    if (intent.mode === 'draft') return {
      text:intent.body ? 'I’ve opened your words as a draft. Edit it and save when it says what you want to keep.' :
        'What would you like to remember? You can write it in the draft.',
      draft:draftFrom(intent.body)
    };
    if (intent.mode === 'profile') {
      const sources = profileRecall(notebook,intent.category);
      return {sources,text:sources.length ?
        'Here’s what you’ve chosen to keep about yourself. Open an entry to read or revise it.' :
        'There are no saved memories in this view yet. Try “Remember that…” to start one.'};
    }
    const criteria = recallQuestion(intent.mode === 'reflection' ? intent.topic : question,lastQuery);
    const sources = criteria.terms.length || criteria.recent ? collectRecall(notebook,criteria) : [];
    lastQuery = criteria;
    if (intent.mode === 'reflection') return {sources, text:sources.length ?
      'Think about these moments together. What felt important then, and what feels important about them now?' :
      'Start with one detail that stands out to you. What made it worth noticing, and what would you like your future self to remember?'};
    return {sources,text:replyFor(notebook,sources,criteria)};
  }
  function submit(raw) {
    const question = raw.trim();
    if (!question || !access().ready) return;
    lastQuestion = question;
    const intent = readEngramIntent(question);
    const result = buildReply(intent,question,entries());
    const turn = message('user', question);
    const reply = message('engram', result.text);
    if (intent.mode !== 'draft') turn.append(chatAction('Keep as memory',()=>openMemoryDraft(draftFrom(question))));
    if (intent.mode !== 'draft' && !access().demo && access().owner) {
      reply.append(chatAction('Reflect with ChatGPT',() => {
        const connection = $('#chat-connection');
        connection.open = true;
        connection.querySelector('summary').focus();
      }));
    }
    if (result.draft) reply.append(chatAction('Review memory draft',()=>openMemoryDraft(result.draft)));
    if (result.sources?.length) {
      const references = el('div','chat-source-list');
      references.append(...result.sources.map(sourceCard));
      reply.append(references);
    }
    turns.push([turn, reply]);
    if (turns.length > conversationLimit) turns.shift().forEach(node => node.remove());
    $('#chat-starters').hidden = true;
    $('#chat-clear').hidden = false;
    log.append(turn, reply);
    log.scrollTop = Math.max(0, turn.offsetTop - log.offsetTop - 12);
    input.value = '';
    if (result.draft) openMemoryDraft(result.draft);
    else input.focus({preventScroll:true});
  }
  function showPending(next) {
    pendingDraft = next;
    $('#chat-pending').hidden = !next;
    $('#chat-pending-title').textContent = next?.title ?? '';
  }
  function reset() {
    turns = [];
    lastQuery = lastQuestion = lastLink = undefined;
    draftRequest?.abort();
    draftRequest = undefined;
    showPending(null);
    log.replaceChildren();
    input.value = '';
    $('#chat-clear').hidden = true;
    $('#chat-starters').hidden = false;
    $('#chat-link-status').textContent = '';
    $('#chat-copy-status').textContent = '';
    $('#chat-copy-text').hidden = true;
    $('#chat-copy-text').value = '';
    $('#chat-connection').open = false;
  }
  async function getPreparedDraft(id, owner) {
    draftRequest?.abort();
    const request = new AbortController();
    draftRequest = request;
    const statusLine = $('#chat-link-status');
    statusLine.textContent = 'Opening your memory draft…';
    const current = () => {
      const state = access();
      return draftRequest === request && !request.signal.aborted && state.active && !state.demo && state.owner === owner && state.draftId === id;
    };
    try {
      const response = await fetch('/api/memory-drafts/' + encodeURIComponent(id),{
        headers:{'X-Engram-Account':owner}, credentials:'same-origin', cache:'no-store', signal:request.signal
      });
      if (!response.ok) throw new Error(response.status === 404 ? 'This draft has expired or is unavailable in this account.' : 'Engram could not open this draft.');
      const {draft} = await response.json();
      if (!current()) return;
      if (draft?.id !== id || typeof draft.title !== 'string' || typeof draft.body !== 'string' || !Array.isArray(draft.tags) ||
          typeof draft.memory?.category !== 'string' || !Object.hasOwn(MEMORY_CATEGORIES,draft.memory.category) || draft.memory.source !== 'chatgpt') {
        throw new Error('This draft could not be read.');
      }
      showPending(draft);
      statusLine.textContent = '';
      openMemoryDraft(draft);
    } catch (error) {
      if (current()) statusLine.textContent = error.message;
    } finally {
      if (draftRequest === request) {
        if (!current()) lastLink = undefined;
        draftRequest = undefined;
      }
    }
  }
  function render(sourceId, draftId) {
    const {ready, status, demo, owner} = access();
    $('#chat-gate').hidden = ready;
    $('#chat-interface').hidden = !ready;
    $('#chat-connection').hidden = !ready || demo || status === 'device';
    $('#chat-gate-title').textContent = status === 'error' ? 'Your notebook couldn’t open' : status === 'guest' ? 'Sign in to open your Engram' : 'Opening your notebook…';
    $('#chat-signin').hidden = status !== 'guest';
    $('#chat-example').hidden = !['guest','error'].includes(status) || Boolean(draftId);
    $('#chat-retry').hidden = status !== 'error';
    if (!ready) return;
    const memoryCount = entries().filter(entry=>entry.memory).length;
    $('#chat-memory-count').textContent = memoryCount ? memoryCount + (memoryCount === 1 ? ' saved memory' : ' saved memories') : 'Notebook recall';
    const link = draftId ? 'draft:' + draftId : sourceId;
    if (pendingDraft && (pendingDraft.id !== draftId || entries().some(entry=>entry.id === pendingDraft.id))) showPending(null);
    if (link === lastLink) return;
    if (draftRequest && !draftId) { draftRequest.abort(); draftRequest = undefined; }
    lastLink = link;
    $('#chat-link-status').textContent = '';
    if (!link) return;
    if ((sourceId || draftId) && entries().some(entry => entry.id === (draftId ?? sourceId))) {
      openRecord(draftId ?? sourceId);
    } else if (draftId && owner && !demo) {
      getPreparedDraft(draftId,owner);
    } else {
      $('#chat-link-status').textContent = 'This source is unavailable in the current notebook.';
    }
  }
  $('#chat-new-memory').addEventListener('click',()=>openMemoryDraft(draftFrom()));
  $('#chat-review-draft').addEventListener('click',()=>{ if (pendingDraft) openMemoryDraft(pendingDraft); });
  $('#chat-copy-prompt').addEventListener('click',async () => {
    const help = 'Use the connected Engram app to help me reflect. Cite the Engram entries you use and distinguish my saved facts from your interpretation. If I ask you to remember something, prepare a draft for me to review.';
    const prompt = lastQuestion ? help + '\n\nMy question: ' + lastQuestion : help;
    const label = $('#chat-copy-status');
    const field = $('#chat-copy-text');
    try {
      await navigator.clipboard.writeText(prompt);
      field.hidden = true;
      label.textContent = 'Prompt copied. Paste it into ChatGPT when you’re ready.';
    } catch {
      field.value = prompt;
      field.hidden = false;
      field.focus();
      field.select();
      label.textContent = 'Copy the selected prompt into ChatGPT.';
    }
  });
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
