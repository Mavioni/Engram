import {addDays, calendarDays, dateObject, entryTitle, filterEntries, localDate, MOODS, notebookInsights, validateEntry} from './model.js';

export function createWorkspace({$, esc, icon, entries, access, commit, ensureCurrent, changed, openMoment, resetNotice}) {
  const labels = {month: 'Month', week: 'Week', agenda: 'Agenda'};
  const kinds = {journal: 'Journal', plan: 'Plan', moment: 'Check-in'};
  const calendar = {date: localDate(), mode: 'month'};
  const timeline = {query: '', filter: 'all', mode: 'list', limit: 30};
  let range = 30;
  let currentEditor;
  const dialog = $('#record-dialog'), form = $('#record-form');
  const dateLabel = (date, options) => new Intl.DateTimeFormat(undefined, options).format(dateObject(date));
  const readable = date => dateLabel(date, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
  const count = (number, unit) => `${number} ${unit}${number === 1 ? '' : 's'}`;
  const actions = (attribute, values, selected) => values.map(([key, label]) =>
    `<button type="button" ${attribute}="${key}" aria-pressed="${key === selected}">${label}</button>`).join('');
  const empty = message => `<p class="view-empty">${esc(message)}</p>`;
  const planList = () => entries().filter(entry => entry.kind === 'plan').sort((a, b) =>
    a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.createdAt.localeCompare(b.createdAt));
  const planTime = plan => {
    if (!plan.time) return 'All day';
    const [hour, minute] = plan.time.split(':').map(Number);
    return new Intl.DateTimeFormat(undefined, {hour:'numeric', minute:'2-digit', timeZone:'UTC'})
      .format(Date.UTC(2000, 0, 1, hour, minute));
  };
  function signedOut() {
    const info = access();
    const returnTo = encodeURIComponent('/#' + info.view);
    const signIn = `<a class="button button-dark" href="/signin-with-chatgpt?return_to=${returnTo}" target="_top">Sign in with ChatGPT ${icon('arrow')}</a>`;
    return `<section class="card view-gate"><h2>${info.status === 'guest' ? 'Open your private notebook' : info.status === 'error' ? 'Your notebook couldn’t open' : 'Opening your notebook…'}</h2><div>${info.status === 'guest' ? signIn : info.status === 'error' ? '<button type="button" class="button button-sage" data-action="retry">Try again</button>' : ''}${['guest', 'error'].includes(info.status) ? '<button type="button" class="text-button" data-action="demo">Explore an example</button>' : ''}</div></section>`;
  }
  function planRow(plan, showDate = false) {
    return `<div class="plan-row"><label class="plan-check"><input type="checkbox" data-plan-done="${esc(plan.id)}" aria-label="${esc((plan.done ? 'Reopen ' : 'Complete ') + plan.title)}"${plan.done ? ' checked' : ''}></label><button type="button" class="plan-open${plan.done ? ' complete' : ''}" data-record="${esc(plan.id)}"><span>${esc(plan.title)}</span><small>${showDate ? esc(dateLabel(plan.date, {month:'short', day:'numeric'})) + ' · ' : ''}${planTime(plan)}</small></button></div>`;
  }
  function renderPlanner() {
    const root = $('#planner-content');
    if (!access().ready) { root.innerHTML = signedOut(); return; }
    const plans = planList();
    const dates = calendar.mode === 'agenda' ? [] : calendarDays(calendar.date, calendar.mode);
    const totals = new Map();
    for (const plan of plans) totals.set(plan.date, (totals.get(plan.date) ?? 0) + 1);
    const isMonth = calendar.mode === 'month';
    const title = isMonth ? dateLabel(calendar.date, {month:'long', year:'numeric'}) : calendar.mode === 'week'
      ? dateLabel(dates[0], {month:'short', day:'numeric'}) + ' – ' + dateLabel(dates[6], {month:'short', day:'numeric', year:'numeric'})
      : 'Agenda';
    const today = localDate();
    const grid = dates.length ? `<div class="calendar-grid">${dates.slice(0, 7).map(date => `<span class="calendar-weekday" title="${esc(dateLabel(date, {weekday:'long'}))}">${esc(dateLabel(date, {weekday:'short'}))}</span>`).join('')}${dates.map(date => {
      const total = totals.get(date);
      return `<button type="button" class="calendar-day${isMonth && date.slice(0, 7) !== calendar.date.slice(0, 7) ? ' other-month' : ''}" data-calendar-date="${date}" aria-pressed="${date === calendar.date}" ${date === today ? 'aria-current="date"' : ''} aria-label="${esc(readable(date) + (total ? ' · ' + count(total, 'plan') : ''))}"><span>${Number(date.slice(-2))}</span>${total ? `<small aria-hidden="true">${total}</small>` : ''}</button>`;
    }).join('')}</div>` : '';
    const listed = calendar.mode === 'agenda' ? plans.filter(plan => plan.date >= calendar.date) : plans.filter(plan => plan.date === calendar.date);
    root.innerHTML = `<div class="view-tools"><div class="segments" role="group" aria-label="Calendar view">${actions('data-calendar-mode', Object.entries(labels), calendar.mode)}</div><button type="button" class="button button-sage" data-add-plan>${icon('plus')} Add plan</button></div>
      <div class="planner-layout${grid ? '' : ' agenda'}">${grid ? `<section class="card calendar" aria-label="Calendar"><div class="section-heading"><h2>${esc(title)}</h2><div class="calendar-nav"><button type="button" class="icon-button" aria-label="Previous ${calendar.mode}" data-calendar-step="-1">${icon('left')}</button><button type="button" class="icon-button" aria-label="Next ${calendar.mode}" data-calendar-step="1">${icon('right')}</button></div></div>${grid}</section>` : ''}
      <section class="card planner-items"><div class="section-heading"><h2>${calendar.mode === 'agenda' ? 'Upcoming plans' : esc(dateLabel(calendar.date, {weekday:'long', month:'short', day:'numeric'}))}</h2><button type="button" class="text-button" data-calendar-today>Today</button></div>
      ${calendar.mode === 'agenda' ? `<label class="agenda-date">Starting <input type="date" data-agenda-date value="${calendar.date}"></label>` : ''}
      ${listed.length ? listed.map(plan => planRow(plan, calendar.mode === 'agenda')).join('') : empty(calendar.mode === 'agenda' ? 'No upcoming plans from this date.' : 'You have no plans for this day.')}</section></div>`;
  }
  function renderToday() {
    const root = $('#today-plans');
    root.hidden = !access().ready;
    if (root.hidden) { root.replaceChildren(); return; }
    const plans = planList().filter(plan => plan.date === localDate());
    root.innerHTML = `<div class="section-heading"><h2>Today’s plans</h2><a href="#planner" aria-label="Open Planner">${icon('calendar')}</a></div>${plans.length ? plans.map(plan => planRow(plan)).join('') : empty('Nothing scheduled for today.')}<button type="button" class="text-button" data-add-plan="today">${icon('plus')} Add a plan</button>`;
  }
  function timelineResults() {
    const records = filterEntries(entries(), timeline.query).filter(entry => timeline.filter === 'all' || (entry.kind ?? 'moment') === timeline.filter);
    const cards = records.slice(0, timeline.limit);
    const root = $('#timeline-results');
    $('#timeline-count').textContent = `${records.length} ${records.length === 1 ? 'entry' : 'entries'}`;
    root.className = `timeline-results ${timeline.mode}`;
    root.innerHTML = cards.length ? cards.map((entry, index) => {
      const kind = entry.kind ?? 'moment';
      const heading = timeline.mode === 'list' && cards[index - 1]?.date !== entry.date
        ? `<h2 class="timeline-date">${esc(readable(entry.date))}</h2>` : '';
      const body = entry.body.replace(/\s+/g, ' ');
      return heading + `<button type="button" class="card timeline-record" data-record="${esc(entry.id)}"><span class="record-type">${kinds[kind]}${entry.mood ? ' · ' + MOODS[entry.mood - 1].label : ''}${kind === 'plan' ? ' · ' + (entry.done ? 'Completed' : planTime(entry)) : ''}</span><strong>${esc(entryTitle(entry))}</strong>${timeline.mode === 'grid' ? `<small>${esc(dateLabel(entry.date, {month:'short', day:'numeric', year:'numeric'}))}</small>` : ''}${body ? `<span class="record-preview">${esc(body.length > 155 ? body.slice(0, 155) + '…' : body)}</span>` : ''}</button>`;
    }).join('') : empty(timeline.query || timeline.filter !== 'all' ? 'No entries match your search.' : 'Your saved entries will appear here.');
    $('#timeline-more').hidden = records.length <= timeline.limit;
  }
  function renderTimeline() {
    const root = $('#timeline-content');
    if (!access().ready) { root.innerHTML = signedOut(); return; }
    const existing = $('#timeline-search');
    if (!existing) {
      root.innerHTML = `<div class="view-tools timeline-tools"><label class="search-box">${icon('search')}<input type="search" id="timeline-search" aria-label="Search Timeline" placeholder="Search titles, notes, or tags"></label><label class="timeline-filter"><span class="sr-only">Entry type</span><select id="timeline-filter"><option value="all">All entries</option><option value="journal">Journal</option><option value="moment">Check-ins</option><option value="plan">Plans</option></select></label><div class="segments" role="group" aria-label="Timeline layout"></div></div><p class="timeline-count" id="timeline-count" role="status"></p><div id="timeline-results"></div><button type="button" id="timeline-more" class="button button-dark" hidden>Show more entries</button>`;
      $('#timeline-search').value = timeline.query;
      $('#timeline-search').addEventListener('input', event => { timeline.query = event.target.value; timeline.limit = 30; timelineResults(); });
      $('#timeline-filter').value = timeline.filter;
      $('#timeline-filter').addEventListener('change', event => { timeline.filter = event.target.value; timeline.limit = 30; timelineResults(); });
      $('#timeline-more').addEventListener('click', () => {
        const shown = timeline.limit;
        timeline.limit += 30; timelineResults();
        $('#timeline-results').querySelectorAll('button')[shown]?.focus();
      });
    }
    root.querySelector('.segments').innerHTML = actions('data-timeline-mode', [['list', 'List'], ['grid', 'Grid']], timeline.mode);
    timelineResults();
  }
  function renderInsights() {
    const root = $('#insights-content');
    if (!access().ready) { root.innerHTML = signedOut(); return; }
    const data = notebookInsights(entries(), range);
    const numbers = [[data.records.length, 'Entries'], [data.writing.length, 'Written entries'], [data.activeDays, 'Active days'], [data.current, 'Current streak'], [data.longest, 'Longest streak']];
    const moods = [...data.distribution.values()].reduce((sum, value) => sum + value, 0);
    const max = Math.max(1, ...data.week.map(day => day.count));
    root.innerHTML = `<div class="view-tools"><div class="segments" role="group" aria-label="Insights range">${actions('data-insights-range', [[7,'7 days'],[30,'30 days'],[90,'90 days'],[365,'1 year']], range)}</div></div>
      <div class="insight-grid">${numbers.map(([value, label]) => `<div class="card insight-stat"><span>${label}</span><strong>${value}</strong>${label.includes('streak') ? '<small>days · all time</small>' : ''}</div>`).join('')}</div>
      <div class="insight-panels">
        <section class="card insight-panel"><h2>Writing this week</h2><p>Entries with written notes over the last 7 days</p>${max && data.week.some(day => day.count) ? `<ol class="writing-chart">${data.week.map(day => `<li aria-label="${esc(readable(day.date) + ' · ' + day.count + ' written')}"><span>${day.count}</span><i aria-hidden="true" style="--bar:${day.count / max}"></i><span aria-hidden="true">${esc(dateLabel(day.date, {weekday:'short'}))}</span></li>`).join('')}</ol>` : empty('Written entries from this week will appear here.')}</section>
        <section class="card insight-panel"><h2>Mood distribution</h2><p>${count(moods, 'check-in')} in this range</p>${moods ? `<ul class="metric-list">${MOODS.map(mood => { const amount = data.distribution.get(mood.value) ?? 0; return `<li><span>${mood.label}</span><meter min="0" max="${moods}" value="${amount}" aria-label="${mood.label}"></meter><span>${amount}</span></li>`; }).join('')}</ul>` : empty('Your mood check-ins will appear here.')}</section>
        <section class="card insight-panel"><h2>Recurring tags</h2><p>Tags and factors from your saved entries</p>${data.tags.length ? '<ul class="insight-tags">' + data.tags.slice(0,8).map(tag => `<li>${esc(tag.label)} <strong>${tag.count}</strong></li>`).join('') + '</ul>' : empty('Add a tag or factor to an entry to see it here.')}</section>
        <section class="card insight-panel"><h2>Weekly recap</h2><p>Your latest entries from the last 7 days</p>${data.recent.length ? '<ul class="recap-list">' + data.recent.slice(0,5).map(entry => `<li><button type="button" data-record="${esc(entry.id)}"><span>${esc(entryTitle(entry))}</span><small>${esc(dateLabel(entry.date, {month:'short', day:'numeric'}))}</small></button></li>`).join('') + '</ul>' : empty('There are no saved entries from this week yet.')}</section>
      </div>`;
  }
  function openEditor(kind, record = null, date = localDate()) {
    if (!access().ready || dialog.open) return;
    resetNotice();
    currentEditor = {record, kind, id: record?.id ?? crypto.randomUUID()};
    $('#record-kind').textContent = kinds[kind];
    $('#record-title').textContent = (record ? 'Edit ' : 'New ') + kinds[kind].toLowerCase() + (kind === 'journal' ? ' entry' : '');
    $('#record-time').hidden = kind !== 'plan';
    $('#remove-record').hidden = !record;
    $('#record-error').textContent = '';
    const {title, body, tags, time, date: day} = form.elements;
    title.required = kind === 'plan';
    title.value = record?.title ?? '';
    body.value = record?.body ?? '';
    tags.value = record?.tags.join(', ') ?? '';
    day.value = record?.date ?? date;
    time.value = record?.time ?? '';
    dialog.showModal();
    title.focus();
  }
  function openRecord(id) {
    const entry = entries().find(item => item.id === id);
    if (!entry) return;
    if (entry.kind) openEditor(entry.kind, entry);
    else openMoment(id);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const editor = currentEditor;
    const {record, kind, id} = editor;
    const values = new FormData(form);
    const controls = [...form.querySelectorAll('button,input,textarea')];
    controls.forEach(item => { item.disabled = true; });
    const stamp = new Date().toISOString();
    try {
      const item = validateEntry({id, kind, title: values.get('title'), body: values.get('body'), date: values.get('date'),
        tags: values.get('tags').split(','), time: values.get('time'), done: record?.done ?? false,
        createdAt: record?.createdAt ?? stamp, updatedAt: stamp});
      if (record) ensureCurrent(record);
      await commit(record ? entries().map(entry => entry.id === id ? item : entry) : [...entries(), item]);
      if (kind === 'plan') calendar.date = item.date;
      if (currentEditor === editor && dialog.open) dialog.close();
      changed(kind === 'plan' ? 'Plan saved.' : 'Journal entry saved.');
      document.querySelector('[data-record="' + CSS.escape(id) + '"]')?.focus();
    } catch (error) {
      if (currentEditor === editor) $('#record-error').textContent = error.message;
    } finally { controls.forEach(item => { item.disabled = false; }); }
  });
  $('#remove-record').addEventListener('click', async event => {
    const {record} = currentEditor;
    if (!record || !confirm(`Delete “${entryTitle(record)}” from your notebook?`)) return;
    const control = event.currentTarget;
    control.disabled = true;
    try {
      ensureCurrent(record);
      await commit(entries().filter(entry => entry.id !== record.id));
      dialog.close(); changed(record.kind === 'plan' ? 'Plan deleted.' : 'Journal entry deleted.');
    } catch (error) { $('#record-error').textContent = error.message; }
    finally { control.disabled = false; }
  });
  dialog.addEventListener('close', () => { form.reset(); currentEditor = null; });
  document.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target || !access().ready) return;
    const data = target.dataset;
    if (data.record) { openRecord(data.record); return; }
    if ('addPlan' in data) { openEditor('plan', null, data.addPlan === 'today' ? localDate() : calendar.date); return; }
    let selector;
    if (data.calendarMode) { calendar.mode = data.calendarMode; selector = `[data-calendar-mode="${calendar.mode}"]`; }
    if (data.calendarDate) { calendar.date = data.calendarDate; selector = `[data-calendar-date="${calendar.date}"]`; }
    if ('calendarToday' in data) { calendar.date = localDate(); selector = '[data-calendar-today]'; }
    if (data.calendarStep) {
      const step = Number(data.calendarStep);
      const day = dateObject(calendar.date);
      calendar.date = calendar.mode === 'month' ? localDate(new Date(day.getFullYear(), day.getMonth() + step, 1)) : addDays(calendar.date, step * 7);
      selector = `[data-calendar-step="${step}"]`;
    }
    if (selector) { renderPlanner(); document.querySelector(selector)?.focus(); return; }
    if (data.timelineMode) { timeline.mode = data.timelineMode; renderTimeline(); document.querySelector(`[data-timeline-mode="${timeline.mode}"]`)?.focus(); }
    if (data.insightsRange) { range = Number(data.insightsRange); renderInsights(); document.querySelector(`[data-insights-range="${range}"]`)?.focus(); }
  });
  document.addEventListener('change', async event => {
    const input = event.target;
    if ('agendaDate' in input.dataset && input.value && input.validity.valid) {
      calendar.date = input.value;
      renderPlanner(); document.querySelector('[data-agenda-date]')?.focus();
    }
    if (!input.dataset.planDone) return;
    const plan = entries().find(entry => entry.id === input.dataset.planDone);
    if (!plan || !access().ready) return;
    input.disabled = true;
    const repeatFocus = input.closest('.planner-items') ? '#planner-content' : '#today-plans';
    try {
      const done = input.checked;
      await commit(entries().map(entry => entry === plan ? {...plan, done, updatedAt:new Date().toISOString()} : entry));
      changed(done ? 'Plan completed.' : 'Plan reopened.');
      $(repeatFocus).querySelector('[data-plan-done="' + CSS.escape(plan.id) + '"]')?.focus();
    } catch (error) { input.checked = plan.done; changed(error.message); }
    finally { input.disabled = false; }
  });
  return {renderPlanner, renderToday, renderTimeline, renderInsights, openEditor, openRecord, reset: () => {
    timeline.query = ''; timeline.filter = 'all'; timeline.limit = 30;
    calendar.date = localDate(); calendar.mode = 'month'; range = 30;
    $('#timeline-content').replaceChildren();
    if (dialog.open) { form.reset(); dialog.close(); }
  }};
}
