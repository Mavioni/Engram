import { STORAGE_KEY, DRAFT_KEY, MOODS, FACTORS, localDate, dateObject, validDate, normalizeTags, validateEntry, parseNotebook, mergeEntries, notebookJSON, entryTitle, sortedEntries, filterEntries, weekData } from './model.js';
import { loadCloudNotebook, saveCloudNotebook } from './account.js';
import { createWorkspace } from './workspace.js';
import { createMemoryChat } from './memory-chat.js';
import { createMemoryExplorer } from './memory-explorer.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const uid = () => globalThis.crypto?.randomUUID?.() || `moment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const icons = {
  iris:'<ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-38 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(38 12 12)"/><circle cx="12" cy="12" r="2.4"/>',
  notebook:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M8 3v18M3 7h4M3 12h4M3 17h4M12 8h4M12 12h4"/>',
  chart:'<path d="M4 4v16h17M8 14l4-5 4 2 5-7"/>',
  network:'<circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="m6.5 6.5 3.3 3.3m4.8 0L18.5 7M7 18l3-3m4.5-.3 4 3"/>',
  arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
  'arrow-up':'<path d="M6 18 18 6M6 6h12v12"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  leaf:'<path d="M20 4C9 2 3 8 5 15s15 8 15-11ZM5 20 16 9M10 15v-5m0 5h5"/>',
  settings:'<path d="m9.5 3-.7 2.2-2 .9-2.1-.5-2 3.5 1.5 1.6v2.6l-1.5 1.6 2 3.5 2.1-.5 2 .9.7 2.2h5l.7-2.2 2-.9 2.1.5 2-3.5-1.5-1.6v-2.6l1.5-1.6-2-3.5-2.1.5-2-.9-.7-2.2Z"/><circle cx="12" cy="12" r="3"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h2m3 0h2m-7 3h2"/>',
  timeline:'<path d="M7 3v18M13 5h7M13 12h7M13 19h7"/><circle cx="7" cy="5" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="7" cy="19" r="2"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  right:'<path d="m9 6 6 6-6 6"/>',
  chat:'<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6ZM8 9h8m-8 3h5"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM21 2v4m-2-2h4"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload:'<path d="M12 15V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  check:'<path d="m5 12 4 4 10-10"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1.8 8M4 4v6h6"/>',
  work:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a25 25 0 0 0 18 0M12 11v4"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-15a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5"/>',
  rest:'<path d="M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z"/>',
  movement:'<path d="m3 12 4-8 4 16 4-12 3 4h3"/>',
  creativity:'<path d="m4 17 12-12 4 4L8 21H4v-4ZM14 7l4 4"/>',
  outside:'<path d="m12 3 6 8h-3l5 7H4l5-7H6l6-8ZM12 18v4"/>'
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.sparkles}</svg>`; }
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); }); }
function face(value) {
  const mood = MOODS[value - 1];
  const mouths = ['M16 28 Q24 19 32 28', 'M18 27 Q24 22 30 27', 'M18 26 H30', 'M17 24 Q24 32 31 24', 'M16 23 Q24 36 32 23Z'];
  return `<svg class="face" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="${mood.color}"/><circle cx="17" cy="19" r="1.7" fill="${mood.ink}"/><circle cx="31" cy="19" r="1.7" fill="${mood.ink}"/><path d="${mouths[value - 1]}" fill="${value === 5 ? mood.ink : 'none'}" stroke="${mood.ink}" stroke-width="1.7" stroke-linecap="round"/></svg>`;
}
hydrateIcons();

const state = { entries: [], demo: [], mode: 'personal', mood: null, tags: [], customTags: [], draft: null, view: 'notebook', memoryOnly: false, blocked: false, raw: null, lastDeleted: null, noteId: null };
let toastTimer, draftTimer, breathInterval;
const pageSize = 30;
let noteLimit = pageSize;
let personalDraft = null;
const now = () => new Date();
const activeEntries = () => state.mode === 'demo' ? state.demo : state.entries;
const notebookEntries = () => activeEntries().filter(entry => entry.kind !== 'plan');
const dateLabel = (date, options = { month: 'short', day: 'numeric' }) => new Intl.DateTimeFormat(undefined, options).format(dateObject(date));
function warnStorage(message) { $('#storage-warning').textContent = message; $('#storage-warning').hidden = false; $('#storage-label').textContent = 'Check notebook storage'; }
const deviceOnly = location.protocol === 'file:';
let accountStatus = deviceOnly ? 'device' : 'loading';
let account = null, revision = '', writing = false, refreshing = false, draftId = uid();
const canUseNotebook = () => accountStatus === 'ready' || accountStatus === 'device';
function draftStore() {
  return deviceOnly ? [localStorage, DRAFT_KEY] : [sessionStorage, 'engram.draft.account.' + account.id];
}
function readDraft() {
  try { const [storage, key] = draftStore(); return JSON.parse(storage.getItem(key)); }
  catch { return null; }
}
function forgetDraft() {
  try { const [storage, key] = draftStore(); storage.removeItem(key); } catch {}
}
if (deviceOnly) {
  try {
    state.raw = localStorage.getItem(STORAGE_KEY);
    if (state.raw) state.entries = parseNotebook(state.raw);
    state.draft = readDraft();
  } catch {
    if (state.raw) { state.blocked = true; warnStorage('Your saved notebook could not be read. Export the original from Your space before clearing it.'); }
    else { state.memoryOnly = true; warnStorage('Browser storage is unavailable. Export your notebook before closing.'); }
  }
}
function legacyAvailable() {
  if (accountStatus !== 'ready') return false;
  try {
    if (localStorage.getItem(STORAGE_KEY) !== null) return true;
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return Boolean(draft?.body || draft?.title || draft?.mood || draft?.tags?.length);
  }
  catch { return false; }
}
function updateAccountUI() {
  const guest = accountStatus === 'guest', offline = accountStatus === 'error';
  const personal = canUseNotebook(), demo = state.mode === 'demo';
  $('#account-welcome').hidden = personal || demo;
  $('#entry-form').hidden = !personal && !demo;
  $('.moments-section').hidden = !personal && !demo;
  $('#header-signin').hidden = !guest || demo;
  $('.top-new').hidden = !personal && !demo;
  $('#welcome-signin').hidden = !guest;
  $('#retry-account').hidden = !offline;
  $('#welcome-demo').hidden = !guest && !offline;
  $('#welcome-heading').textContent = guest ? 'Start your private notebook.' : offline ? 'Your notebook couldn’t open.' : 'Opening your notebook…';
  $('#welcome-copy').textContent = guest ? 'Keep a moment, notice a pattern, and come back to it on any device.' : offline ? 'Check your connection and try again. Your saved moments are kept in your account.' : 'Checking your session.';
  $('#space-label').textContent = account?.label || (deviceOnly ? 'On this device' : 'Notebook settings');
  $('#storage-label').textContent = writing ? 'Saving…' : account ? 'Account notebook' : deviceOnly ? (state.blocked ? 'Check notebook storage' : state.memoryOnly ? 'Session only' : 'Saved on this device') : guest ? 'Notebook settings' : offline ? 'Connection needed' : 'Opening notebook…';
  $('#account-label').textContent = account?.label || (deviceOnly ? 'Device notebook' : 'Your account');
  $('#account-description').textContent = account ? 'Your saved moments follow your ChatGPT account across devices.' : deviceOnly ? 'Your notebook is saved in this browser on this device.' : 'Sign in to keep your moments in a private notebook.';
  $('#account-detail').textContent = account ? 'Your draft stays in this tab. Saved moments are available when you sign in to Engram with the same account.' : deviceOnly ? 'Export a backup before clearing browser data.' : 'Anyone can explore the example notebook.';
  $('#settings-signin').hidden = !guest;
  $('#settings-signout').hidden = !account;
  $('.settings-actions').hidden = !personal;
  $('#clear-description').textContent = deviceOnly ? 'Remove saved moments and the draft on this device' : 'Remove saved moments from your account on every device';
  $('#legacy-panel').hidden = !legacyAvailable();
  $('#leave-demo-label').textContent = personal ? 'Back to my notebook' : 'Leave example';
  $('#demo-banner').hidden = !demo;
  $('.example-button').hidden = demo;
  $('#save-entry').disabled = writing;
}
function resetAccountView() {
  clearTimeout(draftTimer); clearTimeout(toastTimer);
  if ($('#note-dialog').open) $('#note-dialog').close();
  if ($('#settings-dialog').open) $('#settings-dialog').close();
  $('#note-dialog-content').replaceChildren(); $('#toast').hidden = true;
  $('#settings-message').textContent = ''; $('#storage-warning').hidden = true;
  $('#search-notes').value = ''; $('#mood-filter').value = 'all';
  state.mode = 'personal'; state.entries = []; state.draft = null; state.lastDeleted = null;
  personalDraft = null; state.noteId = null; state.demo = []; restoreDraft(null);
  workspace.reset();
  memoryChat.reset();
  memoryExplorer.reset();
  noteLimit = pageSize;
  for (const selector of ['#notes-list', '#week-dots', '#planner-content', '#insights-content', '#today-plans']) $(selector).replaceChildren();
  $('#import-file').value = '';
}
async function refreshNotebook() {
  if (deviceOnly || refreshing || writing) return;
  refreshing = true;
  try {
    const snapshot = await loadCloudNotebook();
    const nextAccount = snapshot?.account || null;
    const changed = nextAccount?.id !== account?.id;
    if (changed || (!nextAccount && accountStatus !== 'guest')) resetAccountView();
    account = nextAccount; revision = snapshot?.revision || '';
    accountStatus = account ? 'ready' : 'guest';
    state.entries = snapshot?.entries || [];
    if (changed && account) { state.draft = readDraft(); restoreDraft(state.draft); }
    $('#storage-warning').hidden = true;
  } catch {
    if (account && state.mode === 'personal') saveDraft();
    resetAccountView(); account = null; revision = ''; accountStatus = 'error';
  } finally {
    refreshing = false; updateAccountUI(); renderAll();
  }
}
async function commitEntries(entries, personal = false) {
  if (writing) throw new Error('A save is already in progress.');
  if (!personal && state.mode === 'demo') { state.demo = entries; return; }
  if (!canUseNotebook() || refreshing) throw new Error('Wait for your notebook to open, then try again.');
  if (state.blocked) throw new Error('Export your original notebook in Your space before clearing the unreadable saved data.');
  if (entries.length > 5000) throw new Error('Your notebook can hold up to 5,000 moments.');
  if (deviceOnly) {
    try { localStorage.setItem(STORAGE_KEY, notebookJSON(entries)); state.raw = null; }
    catch { state.memoryOnly = true; warnStorage('Browser storage is unavailable. Export your notebook before closing.'); }
    state.entries = entries; return;
  }
  writing = true; updateAccountUI();
  try {
    revision = await saveCloudNotebook(account, revision, state.entries, entries);
    state.entries = entries;
  } catch (error) {
    if (['conflict', 'signed_out', 'account_changed'].includes(error.code)) {
      writing = false;
      await refreshNotebook();
      if (error.code === 'conflict') throw new Error('Another device changed this notebook. The latest moments are loaded. Review them and try again.');
    }
    throw error;
  } finally {
    writing = false; updateAccountUI();
  }
}
$('#retry-account').addEventListener('click', refreshNotebook);
$('#settings-signout').addEventListener('click', () => {
  clearTimeout(draftTimer); forgetDraft(); resetAccountView();
  account = null; accountStatus = 'guest'; revision = ''; renderAll(); updateAccountUI();
});
function toast(message, undo = false) {
  clearTimeout(toastTimer); $('#toast-message').textContent = message; $('#toast-undo').hidden = !undo; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, undo ? 10000 : 6000);
}
$('#toast-dismiss').addEventListener('click', () => { $('#toast').hidden = true; });
$('#toast-undo').addEventListener('click', async () => {
  const removed = state.lastDeleted;
  if (!removed || removed.mode !== state.mode) return;
  try { if (activeEntries().some(entry => entry.id === removed.entry.id)) throw new Error('This moment is already in your notebook.'); await commitEntries([...activeEntries(), removed.entry]); state.lastDeleted = null; renderAll(); toast('Moment restored.'); }
  catch (error) { toast(error.message); }
});

function renderMoodPicker() {
  $('#mood-picker').innerHTML = MOODS.map(mood => `<button type="button" class="mood-option${state.mood === mood.value ? ' selected' : ''}" data-mood="${mood.value}" style="--mood-color:${mood.color}" aria-pressed="${state.mood === mood.value}">${face(mood.value)}<span class="mood-name">${mood.label}</span></button>`).join('');
}
function renderFactors() {
  const factors = [...new Map([...FACTORS, ...state.customTags, ...state.tags].map(tag => [tag.toLocaleLowerCase(), tag])).values()];
  $('#factor-picker').innerHTML = factors.map(tag => `<button type="button" class="factor-chip${state.tags.includes(tag) ? ' selected' : ''}" data-tag="${esc(tag)}" aria-pressed="${state.tags.includes(tag)}">${icon(icons[tag.toLowerCase()] ? tag.toLowerCase() : 'plus')}${esc(tag)}</button>`).join('');
}
function captureDraft() { return { id: draftId, title: $('#entry-title').value, body: $('#entry-body').value, mood: state.mood, tags: [...state.tags], date: $('#entry-date').value }; }
function saveDraft() {
  if (state.mode === 'demo' || state.blocked || !canUseNotebook()) return;
  const draft = captureDraft(); state.draft = draft;
  try {
    const [storage, key] = draftStore();
    if (draft.title || draft.body || draft.mood || draft.tags.length) storage.setItem(key, JSON.stringify(draft));
    else storage.removeItem(key);
  } catch { /* The open form retains the draft if browser storage is unavailable. */ }
}
function restoreDraft(draft) {
  draftId = typeof draft?.id === 'string' && draft.id.length > 0 && draft.id.length <= 100 ? draft.id : uid();
  $('#entry-title').value = typeof draft?.title === 'string' ? draft.title.slice(0, 100) : '';
  $('#entry-body').value = typeof draft?.body === 'string' ? draft.body.slice(0, 10000) : '';
  $('#entry-writing').open = Boolean($('#entry-title').value || $('#entry-body').value);
  $('#entry-date').value = validDate(draft?.date) ? draft.date : localDate();
  state.mood = MOODS.some(mood => mood.value === draft?.mood) ? draft.mood : null;
  state.tags = normalizeTags(draft?.tags); state.customTags = state.tags.filter(tag => !FACTORS.includes(tag));
  $('#form-message').textContent = ''; renderMoodPicker(); renderFactors();
}
restoreDraft(state.draft);
$('#mood-picker').addEventListener('click', event => {
  const button = event.target.closest('[data-mood]'); if (!button) return;
  state.mood = Number(button.dataset.mood);
  renderMoodPicker();
  $('#mood-picker .selected').focus({ preventScroll: true });
  $('#form-message').textContent = '';
  saveDraft();
});
$('#factor-picker').addEventListener('click', event => {
  const button = event.target.closest('[data-tag]'); if (!button) return;
  const tag = button.dataset.tag;
  if (state.tags.includes(tag)) state.tags = state.tags.filter(item => item !== tag);
  else if (state.tags.length < 12) state.tags.push(tag);
  else { toast('Choose up to 12 factors for a moment.'); return; }
  renderFactors(); saveDraft();
});
function addTag() {
  const input = $('#custom-tag'); const tag = input.value.trim();
  if (!tag) return;
  if (state.tags.length >= 12) { toast('Choose up to 12 factors for a moment.'); return; }
  const existing = [...FACTORS, ...state.customTags, ...state.tags].find(item => item.toLowerCase() === tag.toLowerCase());
  const value = existing || tag.slice(0, 30);
  state.tags = normalizeTags([...state.tags, value]);
  if (!FACTORS.includes(value)) state.customTags = normalizeTags([...state.customTags, value]);
  input.value = ''; input.parentElement.classList.remove('has-value'); renderFactors(); saveDraft();
}
$('#add-tag').addEventListener('click', addTag);
$('#custom-tag').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } });
$('#custom-tag').addEventListener('input', event => { event.target.parentElement.classList.toggle('has-value', !!event.target.value.trim()); });
['#entry-title', '#entry-body', '#entry-date'].forEach(selector => $(selector).addEventListener('input', () => { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 250); }));
$('#entry-body').addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); $('#entry-form').requestSubmit(); } });
$('#entry-form').addEventListener('submit', async event => {
  event.preventDefault(); clearTimeout(draftTimer);
  if (!state.mood) { $('#form-message').textContent = 'Choose the feeling that’s closest to this moment.'; $('#mood-picker button').focus(); return; }
  try {
    const captured = JSON.stringify(captureDraft());
    const entry = validateEntry({ id: draftId, title: $('#entry-title').value.trim(), body: $('#entry-body').value.trim(), mood: state.mood, tags: state.tags, date: $('#entry-date').value, createdAt: now().toISOString() });
    const existing = activeEntries().find(item => item.id === entry.id);
    if (existing && (existing.body !== entry.body || existing.title !== entry.title || existing.date !== entry.date || existing.mood !== entry.mood || JSON.stringify(existing.tags) !== JSON.stringify(entry.tags))) {
      throw new Error('This draft already has a saved moment. Open that moment to edit it.');
    }
    if (!existing) await commitEntries([...activeEntries(), entry]);
    if (captured === JSON.stringify(captureDraft())) {
      restoreDraft(null); state.draft = null;
      if (state.mode === 'personal') forgetDraft();
    } else { draftId = uid(); saveDraft(); }
    renderAll();
    toast(state.mode === 'demo' ? 'Example moment added for this visit.' : state.memoryOnly ? 'Kept for this session. Export before closing.' : deviceOnly ? 'A little moment, kept.' : 'Moment saved to your notebook.');
  } catch (error) { $('#form-message').textContent = error.message; }
});

function noteCard(entry) {
  const mood = MOODS[entry.mood - 1];
  const link = entry.kind === 'journal' ? 'data-record' : 'data-note';
  return `<button class="note-card" ${link}="${esc(entry.id)}"><span class="note-card-symbol">${mood ? face(entry.mood) : icon('notebook')}</span><div class="note-card-content"><div class="note-card-meta"><span>${esc(dateLabel(entry.date, { month: 'short', day: 'numeric', year: 'numeric' }))}</span><span>·</span><span class="mood-label">${mood?.label ?? 'Journal'}</span></div><h3>${esc(entryTitle(entry))}</h3>${entry.body ? `<p>${esc(entry.body)}</p>` : ''}${entry.tags.length ? `<div class="note-tags">${entry.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : ''}</div><span>${icon('arrow-up')}</span></button>`;
}
function renderNotes() {
  const saved = notebookEntries();
  const entries = filterEntries(saved, $('#search-notes').value, $('#mood-filter').value);
  $('#moment-count').textContent = saved.length;
  $('#notes-more').hidden = entries.length <= noteLimit;
  $('#notes-list').innerHTML = entries.length ? entries.slice(0, noteLimit).map(entry => noteCard(entry)).join('') : `<div class="empty-state"><span>${icon('notebook')}</span><h3>${saved.length ? 'A thought, waiting to be found.' : 'Your story starts here.'}</h3><p>${saved.length ? 'Try another word or feeling.' : 'Choose a feeling to keep your first moment.'}</p>${saved.length ? '<button class="text-button" data-action="reset-search">Clear filters</button>' : ''}</div>`;
}
$('#search-notes').addEventListener('input', resetNotebookPage);
$('#mood-filter').addEventListener('change', resetNotebookPage);
function resetNotebookPage() { noteLimit = pageSize; renderNotes(); }
function showMore(list, previousLimit, render) {
  render();
  $(list).querySelectorAll('.note-card')[previousLimit]?.focus();
}
$('#notes-more').addEventListener('click', () => showMore('#notes-list', noteLimit, () => { noteLimit += pageSize; renderNotes(); }));
function renderWeek() {
  const days = weekData(notebookEntries());
  $('#week-range').textContent = `${dateLabel(days[0].date)} — ${dateLabel(days[6].date)}`;
  $('#week-dots').innerHTML = days.map((day, index) => {
    const label = `${dateLabel(day.date, { month: 'short', day: 'numeric', weekday: 'long' })}: ${plural(day.count, 'moment')}${day.average ? `, average ${day.average.toFixed(1)} out of 5` : ''}`;
    return `<div class="day-dot${index === 6 ? ' today' : ''}" role="img" aria-label="${esc(label)}" title="${esc(label)}"><span>${dateLabel(day.date, { weekday: 'narrow' })}</span><span class="week-circle${day.average ? ' has-mood' : ''}">${day.average ? face(Math.round(day.average)) : ''}</span></div>`;
  }).join('');
  $('#week-note-count').textContent = `${plural(days.reduce((total, day) => total + day.count, 0), 'moment')} this week`;
  const count = notebookEntries().length;
  $('#memory-card-count').textContent = count ? `${plural(count, 'moment')} · A story only you can tell` : 'Your story grows with every entry';
}
function openNote(id) {
  const entry = activeEntries().find(entry => entry.id === id); if (!entry) return;
  state.noteId = id; const mood = MOODS[entry.mood - 1];
  $('#note-dialog-content').innerHTML = `<div class="modal-top"><span class="eyebrow">A MOMENT YOU KEPT</span><button class="icon-button" data-close="note-dialog" aria-label="Close moment">${icon('close')}</button></div><h2 id="note-dialog-title">${esc(entryTitle(entry))}</h2><div class="note-detail-meta">${face(entry.mood)}<span>${mood.label} · ${esc(dateLabel(entry.date, { month: 'long', day: 'numeric', year: 'numeric' }))}</span></div>${entry.body ? `<div class="note-detail-body">${esc(entry.body)}</div>` : ''}<div class="note-tags">${entry.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div><div class="note-detail-actions"><button class="button button-sage" id="edit-note">Edit this moment ${icon('arrow')}</button><button class="delete-button" id="delete-note">${icon('trash')} Delete</button></div>`;
  if (!$('#note-dialog').open) $('#note-dialog').showModal();
  $('#edit-note').addEventListener('click', () => editNote(id));
  $('#delete-note').addEventListener('click', async () => {
    try { ensureCurrentMoment(entry); await commitEntries(activeEntries().filter(item => item.id !== id)); state.lastDeleted = { entry, mode: state.mode }; $('#note-dialog').close(); renderAll(); toast('Moment removed.', true); }
    catch (error) { toast(error.message); }
  });
}
function ensureCurrentMoment(entry) {
  const current = activeEntries().find(item => item.id === entry.id);
  if (JSON.stringify(current) !== JSON.stringify(entry)) throw new Error('This entry changed. Copy any edits, then reopen it to review the latest version.');
}
function editNote(id) {
  const entry = activeEntries().find(entry => entry.id === id); if (!entry) return;
  $('#note-dialog-content').innerHTML = `<div class="modal-top"><span class="eyebrow">MAKE IT YOURS</span><button class="icon-button" data-close="note-dialog" aria-label="Close editor">${icon('close')}</button></div><h2 id="note-dialog-title">Edit this moment.</h2><form id="edit-form" class="edit-form" style="margin-top:25px"><label>Title<input id="edit-title" maxlength="100" value="${esc(entry.title)}"></label><label>Your words (optional)<textarea id="edit-body" maxlength="10000">${esc(entry.body)}</textarea></label><label>Feeling<select id="edit-mood">${MOODS.map(mood => `<option value="${mood.value}"${mood.value === entry.mood ? ' selected' : ''}>${mood.label}</option>`).join('')}</select></label><label>Date<input id="edit-date" type="date" value="${entry.date}" required></label><label>Factors, separated by commas<input id="edit-tags" maxlength="380" value="${esc(entry.tags.join(', '))}"></label><p class="edit-error" id="edit-error" role="status"></p><div class="edit-buttons"><button type="button" class="text-button" id="cancel-edit">Cancel</button><button type="submit" class="button button-sage">Save changes ${icon('check')}</button></div></form>`;
  $('#cancel-edit').addEventListener('click', () => openNote(id));
  $('#edit-form').addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const updated = validateEntry({ ...entry, title: $('#edit-title').value, body: $('#edit-body').value, mood: Number($('#edit-mood').value), date: $('#edit-date').value, tags: $('#edit-tags').value.split(','), updatedAt: now().toISOString() });
      ensureCurrentMoment(entry);
      await commitEntries(activeEntries().map(item => item.id === id ? updated : item)); renderAll(); openNote(id); toast(state.memoryOnly ? 'Changed for this session. Export before closing.' : 'Moment updated.');
    } catch (error) { const message = $('#edit-error'); if (message) message.textContent = error.message; else toast(error.message); }
  });
  $('#edit-title').focus();
}

function makeDemoEntries() {
  const samples = [
    { title: 'A slower kind of morning', body: 'Left my phone on the table and made a cup of tea. There was nothing extraordinary about it. I think that was the good part.', mood: 4, tags: ['Rest', 'Outside'], offset: 0 },
    { title: 'An idea worth coming back to', body: 'Spent an hour making something without worrying about where it would go. I want to remember how that felt.', mood: 5, tags: ['Creativity', 'Work'], offset: 1 },
    { title: 'A walk with no destination', body: 'Stepped outside when the afternoon started feeling heavy. Watched the light move through the trees. Came back with a little more room in my head.', mood: 3, tags: ['Outside', 'Movement'], offset: 2 },
    { title: 'Good company', body: 'A long conversation with a friend. We didn’t solve much, but being heard was enough for today.', mood: 4, tags: ['People', 'Rest'], offset: 3 },
    { title: 'A full day', body: 'Too many tabs open, in every sense. Writing this down so I can leave some of it here tonight.', mood: 2, tags: ['Work'], offset: 4 },
    { title: 'The small things', body: 'Music while making dinner. An open window. A few lines in a notebook. These are things I want to notice more often.', mood: 4, tags: ['Creativity', 'Rest'], offset: 6 }
  ];
  const moments = samples.map((sample, i) => { const date = now(); date.setDate(date.getDate() - sample.offset); return validateEntry({ id: `example-${i}`, ...sample, date: localDate(date), createdAt: date.toISOString() }); });
  return [...moments,
    validateEntry({id:'example-journal', kind:'journal', title:'Something to return to', body:'An unhurried afternoon with a book.', date:localDate(), tags:['Rest','Reading'], memory:{category:'reflection',source:'journal'}}),
    validateEntry({id:'example-plan', kind:'plan', title:'Make time to read', body:'A few pages before dinner.', date:localDate(), time:'17:30', done:false, tags:['Reading']})];
}
function toggleDemo(enabled) {
  if (writing) return;
  if (enabled === (state.mode === 'demo')) return;
  memoryChat.reset();
  memoryExplorer.reset();
  noteLimit = pageSize;
  clearTimeout(draftTimer); state.lastDeleted = null;
  if (enabled && state.mode !== 'demo') { saveDraft(); personalDraft = captureDraft(); state.demo = makeDemoEntries(); state.mode = 'demo'; restoreDraft(null); }
  else if (!enabled && state.mode !== 'personal') { state.mode = 'personal'; restoreDraft(personalDraft || state.draft); }
  $('#search-notes').value = ''; $('#mood-filter').value = 'all';
  $('#demo-banner').hidden = state.mode !== 'demo';
  updateAccountUI(); renderAll();
}
const viewLabels = {notebook:'Notebook', planner:'Planner', timeline:'Timeline', insights:'Insights', memory:'Memory', chat:'Chat'};
function setView(hash) {
  const [view, encodedId, rawDraftId] = hash.split('/');
  state.chatSource = undefined;
  state.chatDraft = undefined;
  $('#chat-signin').href = '/signin-with-chatgpt?return_to=%2F%23chat';
  if (view === 'chat' && encodedId) {
    try {
      if (encodedId === 'draft' && rawDraftId) {
        const id = decodeURIComponent(rawDraftId);
        if (/^[0-9a-f-]{36}$/i.test(id)) state.chatDraft = id;
      } else {
        state.chatSource = decodeURIComponent(encodedId);
      }
      $('#chat-signin').href = '/signin-with-chatgpt?return_to=' + encodeURIComponent('/#chat/' + encodedId + (state.chatDraft ? '/' + state.chatDraft : ''));
    } catch { /* Ignore incomplete source links. */ }
  }
  const requested = view === 'patterns' ? 'insights' : view;
  state.view = Object.hasOwn(viewLabels, requested) ? requested : 'notebook';
  $$('.view').forEach(element => { const active = element.id === `view-${state.view}`; element.hidden = !active; element.classList.toggle('active', active); });
  $$('[data-view]').forEach(element => { const active = element.dataset.view === state.view; element.classList.toggle('active', active); if (active) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current'); });
  $('#current-view-label').textContent = viewLabels[state.view];
  document.title = `${viewLabels[state.view]} · Engram`;
  renderAll();
}
window.addEventListener('hashchange', () => {
  setView(location.hash.slice(1));
  if (!state.deferFocus) ($(`#view-${state.view} h1`) ?? $('#main')).focus({preventScroll:true});
  state.deferFocus = false;
  window.scrollTo({ top: 0 });
});
document.addEventListener('click', event => {
  const close = event.target.closest('[data-close]'); if (close) { $(`#${close.dataset.close}`).close(); return; }
  const note = event.target.closest('[data-note]'); if (note) { openNote(note.dataset.note); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'retry') refreshNotebook();
  else if (action === 'write') workspace.openEditor('journal');
  else if (action === 'new' || action === 'reflect-breath') {
    if ($('#breath-dialog').open) $('#breath-dialog').close();
    if (canUseNotebook() && state.mode === 'demo') toggleDemo(false);
    if (!canUseNotebook() && state.mode !== 'demo') { location.hash = 'notebook'; $('#welcome-signin').focus(); return; }
    if (location.hash !== '#notebook') { state.deferFocus = true; location.hash = 'notebook'; }
    setView('notebook');
    const wantsToWrite = action === 'reflect-breath';
    if (wantsToWrite) $('#entry-writing').open = true;
    const target = wantsToWrite ? $('#entry-body') : ($('#mood-picker .selected') || $('#mood-picker button'));
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
  } else if (action === 'settings') { updateAccountUI(); $('#settings-message').textContent = ''; $('#settings-dialog').showModal(); }
  else if (action === 'breathe') { resetBreath(); $('#breath-dialog').showModal(); }
  else if (action === 'demo') toggleDemo(true);
  else if (action === 'leave-demo') toggleDemo(false);
  else if (action === 'reset-search') { $('#search-notes').value = ''; $('#mood-filter').value = 'all'; resetNotebookPage(); }
});
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); }));

function downloadNotebook(contents, name) {
  const blob = new Blob([contents], {type: 'application/json'});
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('#export-notes').addEventListener('click', () => {
  if (!canUseNotebook()) return;
  const contents = state.blocked && state.raw ? state.raw : notebookJSON(state.entries);
  downloadNotebook(contents, 'Engram-Notebook-' + localDate() + '.json');
  $('#settings-message').textContent = state.blocked ? 'The original saved data was exported.' : 'Exported ' + plural(state.entries.length, 'moment') + '. Keep the backup somewhere private.';
});
async function importMoments(incoming) {
  const merged = mergeEntries(state.entries, incoming);
  await commitEntries(merged.entries, true);
  if (state.mode === 'demo') toggleDemo(false); else renderAll();
  return plural(merged.added, 'moment') + ' added. ' + (incoming.length - merged.added) + ' already in your notebook.';
}
$('#import-notes').addEventListener('click', () => {
  if (state.blocked) { $('#settings-message').textContent = 'Export the original, then clear the unreadable notebook before importing.'; return; }
  if (canUseNotebook()) $('#import-file').click();
});
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  const owner = account?.id;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('Choose a JSON backup smaller than 5 MB.');
    const incoming = parseNotebook(await file.text());
    if (owner !== account?.id) throw new Error('Your account changed. Choose the file again.');
    $('#settings-message').textContent = await importMoments(incoming);
  } catch (error) { $('#settings-message').textContent = error.message; }
  finally { event.target.value = ''; }
});
$('#legacy-import').addEventListener('click', async () => {
  if (!account || !confirm('Add the earlier notebook from this browser to ' + account.label + '? Its original copy will stay on this device.')) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { /* An unreadable draft does not prevent importing valid moments. */ }
    const result = await importMoments(raw ? parseNotebook(raw) : []);
    let importedDraft = false;
    if ((draft?.body || draft?.title || draft?.mood) && !$('#entry-title').value && !$('#entry-body').value && !state.mood) {
      restoreDraft(draft); saveDraft(); importedDraft = true;
    }
    $('#settings-message').textContent = result + (importedDraft ? ' The earlier draft is open in this tab.' : '');
  } catch (error) { $('#settings-message').textContent = error.message; }
});
$('#legacy-export').addEventListener('click', () => {
  if (!account) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY), draft = localStorage.getItem(DRAFT_KEY);
    if (raw) downloadNotebook(raw, 'Engram-Device-' + localDate() + '.json');
    else if (draft) downloadNotebook(draft, 'Engram-Device-Draft.json');
  } catch { $('#settings-message').textContent = 'The browser could not read the earlier copy.'; }
});
$('#legacy-forget').addEventListener('click', () => {
  if (!account || !confirm('Remove the earlier notebook and draft from this browser? Your account notebook will stay available.')) return;
  try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(DRAFT_KEY); updateAccountUI(); $('#settings-message').textContent = 'Earlier device copy removed.'; }
  catch { $('#settings-message').textContent = 'The browser could not remove the earlier copy.'; }
});
$('#clear-notes').addEventListener('click', async () => {
  if (!canUseNotebook() || writing) return;
  const place = deviceOnly ? 'this browser' : 'your account on every device';
  if (!confirm('Permanently clear all moments from ' + place + ' and the draft in this tab? Export a backup first if you want to keep them.')) return;
  try {
    if (deviceOnly) { localStorage.removeItem(STORAGE_KEY); state.entries = []; }
    else await commitEntries([], true);
    forgetDraft(); state.draft = null; state.raw = null; state.blocked = false; state.memoryOnly = false;
    state.lastDeleted = null; personalDraft = null; memoryChat.reset(); memoryExplorer.reset();
    if (state.mode === 'demo') toggleDemo(false);
    restoreDraft(null); renderAll(); updateAccountUI(); $('#storage-warning').hidden = true;
    $('#settings-message').textContent = 'Your notebook has been cleared.';
  } catch (error) { $('#settings-message').textContent = error.message; }
});

let breathStart = 0;
function resetBreath() { clearInterval(breathInterval); breathStart = 0; $('#breath-orb').className = 'breath-orb'; $('#breath-phase').textContent = 'Make a little space'; $('#breath-time').textContent = '60 seconds, just for you'; $('#start-breath').innerHTML = `Begin a quiet minute ${icon('arrow')}`; }
function updateBreath() {
  const elapsed = (Date.now() - breathStart) / 1000;
  if (elapsed >= 60) { clearInterval(breathInterval); breathStart = 0; $('#breath-orb').className = 'breath-orb'; $('#breath-phase').textContent = 'A little space, made.'; $('#breath-time').textContent = 'One minute. One moment for yourself.'; $('#start-breath').innerHTML = `Take another minute ${icon('reset')}`; return; }
  const phase = elapsed % 12;
  const [name, label] = phase < 4 ? ['inhale','Breathe in'] : phase < 6 ? ['hold','A gentle pause'] : ['exhale','Breathe out'];
  if (!$('#breath-orb').classList.contains(name)) { $('#breath-orb').className = `breath-orb ${name}`; $('#breath-phase').textContent = label; }
  $('#breath-time').textContent = `${Math.ceil(60 - elapsed)} seconds of space`;
}
$('#start-breath').addEventListener('click', () => { if (breathStart) { resetBreath(); return; } breathStart = Date.now(); $('#start-breath').innerHTML = `End this minute ${icon('close')}`; updateBreath(); breathInterval = setInterval(updateBreath, 150); });
$('#breath-dialog').addEventListener('close', resetBreath);

const workspace = createWorkspace({
  $, esc, icon, entries:activeEntries,
  access: () => ({view:state.view, ready:canUseNotebook() || state.mode === 'demo', status:accountStatus}),
  commit:commitEntries, ensureCurrent:ensureCurrentMoment,
  changed:message => { renderAll(); toast(message); }, openMoment:openNote,
  resetNotice:() => { $('#toast').hidden = true; }
});
const memoryChat = createMemoryChat({
  $, icon, entries: activeEntries, openRecord: workspace.openRecord, openMemoryDraft: workspace.openMemoryDraft,
  access: () => ({ready:canUseNotebook() || state.mode === 'demo', status:accountStatus, demo:state.mode === 'demo',
    owner:account?.id, active:state.view === 'chat', draftId:state.chatDraft})
});
const memoryExplorer = createMemoryExplorer({
  $, entries:activeEntries, openRecord:workspace.openRecord,
  access: () => ({ready:canUseNotebook() || state.mode === 'demo', status:accountStatus})
});
function renderAll() {
  switch (state.view) {
    case 'planner': workspace.renderPlanner(); break;
    case 'timeline': workspace.renderTimeline(); break;
    case 'insights': workspace.renderInsights(); break;
    case 'chat': memoryChat.render(state.chatSource,state.chatDraft); break;
    case 'memory': memoryExplorer.render(); break;
    default: renderNotes(); renderWeek(); workspace.renderToday();
  }
}
$$('.view h1').forEach(heading => heading.tabIndex = -1);
$('#today-label').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(now()).toUpperCase();
updateAccountUI(); setView(location.hash.slice(1) || 'notebook');
if (!deviceOnly) {
  refreshNotebook();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(draftTimer); saveDraft(); }
    else refreshNotebook();
  });
  window.addEventListener('pagehide', event => { if (event.persisted) document.documentElement.style.visibility = 'hidden'; });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
}
window.addEventListener('beforeunload', () => { clearTimeout(draftTimer); saveDraft(); });
