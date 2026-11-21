import {dateObject, MOODS} from './model.js';
import {buildMemoryIndex, filterMemory, memoryGraph, memoryKinds, memoryNeighbors, placeMemory, traceMemory} from './memory-index.js';

export function createMemoryExplorer({$, entries, access, openRecord}) {
  const root = $('#view-memory');
  const stage = $('#memory-stage'), svg = $('#memory-svg'), viewport = $('#memory-viewport');
  const results = $('#memory-results'), details = $('#memory-details');
  const query = $('#memory-query'), kind = $('#memory-kind'), topic = $('#memory-topic');
  const count = (number, label) => `${number} ${label}${number === 1 ? '' : 's'}`;
  const dateLabel = new Intl.DateTimeFormat(undefined, {month:'short', day:'numeric', year:'numeric'});
  const pageSize = 24;
  let source, index;
  let selected, start, destination;
  let path = [], matches = [];
  let mode = 'graph', focused = false, limit = pageSize;
  let view = {scale:1,x:0,y:0};
  let drag;

  function html(tag, css = '', text) {
    const element = document.createElement(tag);
    element.className = css;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function mark(kind) {
    const node = html('span','memory-marker node-' + kind);
    node.setAttribute('aria-hidden','true');
    return node;
  }
  function nodeButton(node, label) {
    const button = html('button','memory-item');
    button.type = 'button';
    button.dataset.memoryNode = node.key;
    if (node.key === selected) button.setAttribute('aria-current','true');
    const line = html('span','memory-item-text');
    line.append(html('strong','',node.title), html('small','',label ?? describe(node)));
    button.append(mark(node.kind),line);
    return button;
  }
  function action(label, key, className = 'text-button') {
    const button = html('button',className,label);
    button.type = 'button';
    button.dataset.memoryAction = key;
    return button;
  }
  function describe(node) {
    if (node.kind === 'topic') return `${node.links.size} ${node.links.size === 1 ? 'entry' : 'entries'}`;
    return [memoryKinds[node.kind], dateLabel.format(dateObject(node.entry.date)),
      node.kind === 'moment' ? MOODS[node.entry.mood - 1]?.label : null].filter(Boolean).join(' · ');
  }
  function updateTopics() {
    const previous = topic.value;
    const tags = [...index.topics.values()];
    const sorted = tags.sort((a,b) => b.links.size - a.links.size || a.title.localeCompare(b.title));
    const choices = sorted.slice(0,100);
    const selectedTopic = index.topics.get(previous);
    if (selectedTopic && !choices.includes(selectedTopic)) choices.push(selectedTopic);
    topic.replaceChildren(new Option('All topics',''), ...choices.sort((a,b)=>a.title.localeCompare(b.title))
      .map(node => new Option(node.title,node.key)));
    topic.value = selectedTopic ? previous : '';
    topic.disabled = !tags.length;
  }
  function renderResults() {
    const shown = matches.slice(0,limit);
    const list = document.createDocumentFragment();
    for (const node of shown) list.append(nodeButton(node));
    if (!shown.length) list.append(html('p','memory-placeholder',source.length ? 'No matching entries.' : 'Your saved entries will appear here.'));
    results.replaceChildren(list);
    $('#memory-count').textContent = `${matches.length} of ${index.items.size} entries`;
    $('#memory-more').hidden = shown.length === matches.length;
    $('#memory-clear-search').hidden = !query.value && kind.value === 'all' && !topic.value;
  }
  function section(title, nodes) {
    const group = html('div','memory-detail-group');
    group.append(html('h3','',title), ...nodes);
    return group;
  }
  function renderDetails() {
    const node = index.nodes.get(selected);
    details.replaceChildren();
    if (!node) {
      details.append(html('p','memory-placeholder','Select a node or an index entry to see its topics and connections.'));
      return;
    }
    const intro = html('div','memory-detail-top');
    intro.append(html('p','memory-detail-label',describe(node)),html('h3','memory-detail-title',node.title));
    if (node.entry?.body) intro.append(html('p','memory-excerpt',node.entry.body.length > 215 ? node.entry.body.slice(0,215) + '…' : node.entry.body));
    const controls = html('div','memory-node-actions');
    if (node.entry) controls.append(action('Open entry','open','button button-sage'));
    controls.append(action(focused ? 'Show overview' : 'Focus neighborhood','focus','button button-dark'));
    controls.append(action(start === node.key ? 'Cancel trace' : 'Trace from here', start === node.key ? 'clear-trace' : 'start-trace'));
    if (node.kind === 'topic') controls.append(action('Filter to this topic','filter-topic'));
    details.append(intro,controls);
    if (start) {
      const origin = index.nodes.get(start);
      let caption = 'Select another node or index entry.';
      if (destination) caption = path.length ? count(path.length - 1, 'link') : 'No path through shared tags.';
      const trace = section('Trace', [html('p','memory-excerpt',`From ${origin.title}. ${caption}`)]);
      if (path.length) {
        const stepList = html('ol','memory-trace');
        for (const key of path.slice(0,68)) {
          const step = html('li');
          step.append(nodeButton(index.nodes.get(key)));
          stepList.append(step);
        }
        trace.append(stepList);
        if (path.length > 68) trace.append(html('p','memory-excerpt','The first 68 nodes are listed.'));
      }
      if (start !== selected) trace.append(action('Clear trace','clear-trace'));
      details.append(trace);
    }
    if (node.kind !== 'topic' && node.links.size) details.append(section('Topics',[...node.links].map(id=>nodeButton(index.topics.get(id)))));
    const neighbors = memoryNeighbors(index, selected);
    if (!neighbors.size) {
      details.append(html('p','memory-placeholder',node.links.size ? 'No other entries share these topics.' : 'Add a tag to connect this entry with related records.'));
      return;
    }
    const cards = [...neighbors].slice(0,12).map(([id,tags])=>nodeButton(index.items.get(id),
      tags.length ? tags.map(key=>index.topics.get(key).title).join(' · ') : undefined));
    if (neighbors.size > cards.length) cards.push(html('p','memory-excerpt',`Showing ${cards.length} of ${neighbors.size} connected entries.`));
    details.append(section(node.kind === 'topic' ? 'Tagged entries' : 'Related entries', cards));
  }
  function graphic(tag, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg',tag);
    for (const [name,value] of Object.entries(attributes)) element.setAttribute(name,String(value));
    return element;
  }
  function transformGraph() {
    viewport.setAttribute('transform',`translate(${view.x} ${view.y}) scale(${view.scale})`);
    $('#memory-zoom-out').disabled = !viewport.childElementCount || view.scale <= .65;
    $('#memory-zoom-in').disabled = !viewport.childElementCount || view.scale >= 2.7;
    $('#memory-fit').disabled = !viewport.childElementCount;
  }
  function renderGraph() {
    const visible = graphVisible();
    if (!visible) return;
    const width = Math.max(220,stage.clientWidth), height = Math.max(230,stage.clientHeight);
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const graph = memoryGraph(index,matches,selected,focused,path);
    const positions = placeMemory({...graph,nodes:[...graph.nodes].sort((a,b)=>a.key.localeCompare(b.key))},width,height);
    const lineLayer = graphic('g',{'aria-hidden':'true'});
    const nodeLayer = graphic('g',{});
    const steps = new Map(path.map((id,i)=>[id,i]));
    for (const [from,to] of graph.edges) {
      const a = positions.get(from), b = positions.get(to);
      const active = Math.abs(steps.get(from) - steps.get(to)) === 1;
      const adjacent = from === selected || to === selected;
      lineLayer.append(graphic('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:active ? 'memory-edge trace' : adjacent ? 'memory-edge adjacent' : 'memory-edge'}));
    }
    let labels = 0;
    for (const node of graph.nodes) {
      const point = positions.get(node.key);
      const current = node.key === selected;
      const stroke = current ? ' is-selected' : steps.has(node.key) ? ' on-trace' : '';
      const g = graphic('g',{transform:`translate(${point.x} ${point.y})`,role:'button',tabindex:0,
        class:'memory-dot node-' + node.kind + stroke,'aria-label':`${memoryKinds[node.kind]}: ${node.title}`,
        'aria-pressed':current,'data-memory-node':node.key});
      const title = graphic('title',{}); title.textContent = node.title;
      const target = graphic('circle',{r:20,class:'memory-hit'});
      const size = node.kind === 'topic' ? 9 : 6;
      const dot = node.kind === 'topic' ? graphic('rect',{x:-size,y:-size,width:size*2,height:size*2,rx:3,transform:'rotate(45)',class:'memory-node-glyph'})
        : graphic('circle',{r:size,class:'memory-node-glyph'});
      const show = current || (node.kind === 'topic' && labels++ < 9) || (graph.nodes.length < 12);
      const label = graphic('text',{y:node.kind === 'topic' ? 27 : 22,class:show ? 'memory-node-label visible' : 'memory-node-label','aria-hidden':'true'});
      label.textContent = node.title.length > 22 ? node.title.slice(0,21) + '…' : node.title;
      g.append(title,target,dot,label);
      nodeLayer.append(g);
    }
    viewport.replaceChildren(...(graph.nodes.length ? [lineLayer,nodeLayer] : []));
    $('#memory-graph-count').textContent = (path.length ? 'Trace · ' : focused ? 'Neighborhood · ' : '') + count(graph.nodes.length,'node') + ' · ' + count(graph.edges.length,'link');
    $('#memory-empty').hidden = Boolean(graph.nodes.length);
    $('#memory-empty-text').textContent = source.length ? 'No entries match these filters.' : 'Add an entry with tags to start your graph.';
    $('#memory-add').hidden = Boolean(source.length);
    transformGraph();
  }
  function graphVisible() {
    return index && mode === 'graph' && access().ready && !root.hidden && stage.clientWidth > 0;
  }
  function updateLayout() {
    root.classList.toggle('memory-list-mode',mode === 'list');
    $('#memory-network').hidden = mode !== 'graph';
    $('#memory-graph-mode').setAttribute('aria-pressed',mode === 'graph');
    $('#memory-list-mode').setAttribute('aria-pressed',mode === 'list');
  }
  function render() {
    const {ready,status} = access();
    $('#memory-shell').hidden = !ready;
    $('#memory-gate').hidden = ready;
    $('#memory-gate-title').textContent = status === 'guest' ? 'Sign in to open your memory' : status === 'error' ? 'Your notebook couldn’t open' : 'Opening your notebook…';
    $('#memory-signin').hidden = status !== 'guest';
    $('#memory-example').hidden = !['guest','error'].includes(status);
    $('#memory-retry').hidden = status !== 'error';
    if (!ready) return;
    const next = entries();
    if (source !== next || !index) {
      source = next;
      index = buildMemoryIndex(source);
      updateTopics();
    }
    if (!index.nodes.has(selected)) { selected = undefined; focused = false; }
    if (!index.nodes.has(start)) { start = undefined; destination = undefined; path = []; }
    else if (destination && !index.nodes.has(destination)) { destination = undefined; path = []; }
    else if (destination) path = traceMemory(index,start,destination);
    matches = filterMemory(index,query.value,kind.value,topic.value);
    updateLayout();
    renderResults();
    renderDetails();
    renderGraph();
  }
  function resetView() {
    view = {scale:1,x:0,y:0};
    transformGraph();
  }
  function reset() {
    source = index = selected = start = destination = undefined;
    path = []; matches = []; mode = 'graph'; focused = false; limit = pageSize;
    query.value = ''; kind.value = 'all'; topic.replaceChildren(new Option('All topics',''));
    results.replaceChildren(); details.replaceChildren(); viewport.replaceChildren();
    $('#memory-count').textContent = ''; $('#memory-graph-count').textContent = '';
    $('#memory-announcement').textContent = '';
    resetView();
  }
  function activate(key, area) {
    const node = index.nodes.get(key);
    if (!node) return;
    selected = key;
    if (start && start !== key && !path.includes(key)) {
      destination = key;
      path = traceMemory(index,start,destination);
      resetView();
    }
    render();
    const target = area.querySelector(`[data-memory-node="${CSS.escape(key)}"]`);
    (target || details.querySelector('button'))?.focus({preventScroll:true});
    $('#memory-announcement').textContent = node.title + ' selected. ' + (path.length ? count(path.length - 1,'link') + ' in this trace.' : destination ? 'No path through shared tags.' : 'See Inspector for details.');
  }
  function filter() {
    selected = start = destination = undefined;
    path = []; focused = false; limit = pageSize;
    resetView(); render();
  }
  query.addEventListener('input',filter);
  kind.addEventListener('change',filter);
  topic.addEventListener('change',filter);
  $('#memory-clear-search').addEventListener('click', () => {
    query.value = ''; kind.value = 'all'; topic.value = ''; filter(); query.focus();
  });
  $('#memory-more').addEventListener('click', () => {
    const previous = limit;
    limit += pageSize; renderResults();
    results.children[previous]?.focus();
  });
  $('#memory-graph-mode').addEventListener('click', () => { mode = 'graph'; render(); });
  $('#memory-list-mode').addEventListener('click', () => { mode = 'list'; render(); });
  root.addEventListener('click',event => {
    const item = event.target.closest('[data-memory-node]');
    if (item) { activate(item.dataset.memoryNode,item.closest('svg') ?? (results.contains(item) ? results : details)); return; }
    const button = event.target.closest('[data-memory-action]');
    if (!button || !selected) return;
    const command = button.dataset.memoryAction;
    if (command === 'open') { openRecord(index.nodes.get(selected).entry.id); return; }
    if (command === 'filter-topic') {
      if (![...topic.options].some(option=>option.value === selected)) topic.add(new Option(index.nodes.get(selected).title,selected));
      topic.value = selected; filter(); topic.focus(); return;
    }
    if (command === 'focus') {
      focused = !focused; start = destination = undefined; path = [];
    }
    if (command === 'start-trace') { start = selected; destination = undefined; path = []; focused = false; }
    if (command === 'clear-trace') { start = destination = undefined; path = []; }
    resetView(); render();
    details.querySelector(`[data-memory-action="${command === 'start-trace' ? 'clear-trace' : command === 'clear-trace' ? 'start-trace' : command}"]`)?.focus({preventScroll:true});
    if (command === 'start-trace') $('#memory-announcement').textContent = 'Trace started. Select another node or index entry.';
  });
  svg.addEventListener('keydown',event => {
    const item = event.target.closest('[data-memory-node]');
    if (!item || !['Enter',' '].includes(event.key)) return;
    event.preventDefault();
    activate(item.dataset.memoryNode,svg);
  });
  function setZoom(factor) {
    const scale = Math.max(.65,Math.min(2.7,view.scale*factor));
    const x = stage.clientWidth/2, y = stage.clientHeight/2;
    view = {scale,x:x - (x-view.x)*scale/view.scale,y:y - (y-view.y)*scale/view.scale};
    transformGraph();
  }
  $('#memory-zoom-in').addEventListener('click',()=>setZoom(1.25));
  $('#memory-zoom-out').addEventListener('click',()=>setZoom(.8));
  $('#memory-fit').addEventListener('click',resetView);
  svg.addEventListener('pointerdown',event => {
    if (event.button !== 0 || !viewport.childElementCount || event.target.closest('[data-memory-node]')) return;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,offsetX:view.x,offsetY:view.y};
    svg.setPointerCapture(event.pointerId);
    stage.classList.add('is-panning');
  });
  svg.addEventListener('pointermove',event => {
    if (drag?.id !== event.pointerId) return;
    view.x = drag.offsetX + event.clientX - drag.x;
    view.y = drag.offsetY + event.clientY - drag.y;
    transformGraph();
  });
  svg.addEventListener('lostpointercapture', () => { drag = undefined; stage.classList.remove('is-panning'); });
  new ResizeObserver(() => { if (graphVisible()) renderGraph(); }).observe(stage);
  return {render,reset};
}
