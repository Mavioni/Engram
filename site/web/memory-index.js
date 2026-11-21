import {entryTitle, MOODS, sortedEntries} from './model.js';

export const memoryKinds = {journal:'Journal', moment:'Check-in', plan:'Plan', topic:'Topic'};
const topicKey = label => label.normalize('NFKC').toLowerCase();
export const graphNodeLimit = 68;

export function buildMemoryIndex(entries) {
  const items = new Map();
  const topics = new Map();
  for (const entry of sortedEntries(entries)) {
    const node = {key:'entry:' + entry.id, title:entryTitle(entry), kind:entry.kind ?? 'moment', entry, links:new Set()};
    items.set(node.key, node);
    for (const label of entry.tags) {
      const key = 'topic:' + topicKey(label);
      if (!topics.has(key)) topics.set(key, {key, title:label, kind:'topic', links:new Set()});
      node.links.add(key);
      topics.get(key).links.add(node.key);
    }
  }
  return {items, topics, nodes:new Map([...items, ...topics])};
}

export function filterMemory(index, query, kind, topic) {
  const terms = topicKey(query).trim().split(/\s+/).filter(Boolean);
  const records = [...index.items.values()].filter(node => {
    if ((kind !== 'all' && kind !== node.kind) || (topic && !node.links.has(topic))) return false;
    const {entry} = node;
    const metadata = topicKey([node.title, entry.date, ...entry.tags, MOODS[entry.mood - 1]?.label].join(' '));
    let body;
    return terms.every(term => metadata.includes(term) || (body ??= topicKey(entry.body)).includes(term));
  });
  return records;
}

export function memoryNeighbors(index, key) {
  const start = index.nodes.get(key);
  const related = new Map();
  if (!start) return related;
  if (start.kind === 'topic') {
    for (const id of start.links) related.set(id, []);
  } else {
    for (const topic of start.links) for (const id of index.topics.get(topic).links) {
      if (id === key) continue;
      if (!related.has(id)) related.set(id, []);
      related.get(id).push(topic);
    }
  }
  return new Map([...related].sort(([a, tagsA],[b, tagsB]) => tagsB.length - tagsA.length ||
    index.items.get(b).entry.date.localeCompare(index.items.get(a).entry.date)));
}

export function traceMemory(index, from, to) {
  if (!index.nodes.has(from) || !index.nodes.has(to)) return [];
  const parents = new Map([[from, null]]);
  const queue = [from];
  for (let i = 0; i < queue.length && !parents.has(to); i++) {
    for (const neighbor of index.nodes.get(queue[i]).links) {
      if (parents.has(neighbor)) continue;
      parents.set(neighbor, queue[i]);
      queue.push(neighbor);
    }
  }
  if (!parents.has(to)) return [];
  const path = [];
  for (let id = to; id !== null; id = parents.get(id)) path.push(id);
  return path.reverse();
}

export function memoryGraph(index, matches, selected, focus, path = []) {
  const nodes = new Map();
  const add = key => {
    if (key && nodes.size < graphNodeLimit && index.nodes.has(key)) nodes.set(key, index.nodes.get(key));
  };
  if (path.length) {
    add(path[0]); add(path.at(-1));
    path.forEach(add);
  } else if (focus && selected) {
    add(selected);
    index.nodes.get(selected)?.links.forEach(add);
    for (const id of memoryNeighbors(index, selected).keys()) add(id);
  } else {
    add(selected);
    const hubCounts = new Map();
    for (const node of matches) for (const topic of node.links) hubCounts.set(topic, (hubCounts.get(topic) ?? 0) + 1);
    const hubs = [...hubCounts].sort((a,b) => b[1] - a[1]).slice(0, 16);
    if (selected) index.nodes.get(selected)?.links.forEach(add);
    for (const [key] of hubs) add(key);
    for (const node of matches) add(node.key);
  }
  const edges = [];
  for (const node of nodes.values()) if (node.kind !== 'topic') for (const link of node.links) {
    if (nodes.has(link)) edges.push([node.key, link]);
  }
  return {nodes:[...nodes.values()], edges};
}

export function placeMemory(graph, width, height) {
  const centerX = width / 2, centerY = height / 2;
  const count = graph.nodes.length;
  if (count === 1) return new Map([[graph.nodes[0].key, {x:centerX,y:centerY}]]);
  const anchored = new Map();
  let topics = 0;
  for (const node of graph.nodes) if (node.kind === 'topic') topics++;
  let topic = 0;
  const nodes = graph.nodes.map((node, i) => {
    const isTopic = node.kind === 'topic';
    const angle = isTopic ? topic++ * 2 * Math.PI / topics - Math.PI / 2 : i * 2.399963;
    const spread = isTopic ? .27 : .41 * Math.sqrt((i + 1) / count);
    const point = {x:centerX + Math.cos(angle) * width * spread, y:centerY + Math.sin(angle) * height * spread};
    anchored.set(node.key, point);
    return point;
  });
  const springs = graph.edges.map(([a,b]) => [anchored.get(a),anchored.get(b)]);
  const separation = Math.min(75, Math.sqrt(width * height / Math.max(6, count)) * .75);
  for (let iteration = 0; iteration < 35; iteration++) {
    const strength = 1 - iteration / 45;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x || .01, dy = a.y - b.y;
      const distance = Math.hypot(dx,dy);
      const push = Math.min(12, separation * separation / (distance * distance)) * strength;
      a.x += dx / distance * push; b.x -= dx / distance * push;
      a.y += dy / distance * push; b.y -= dy / distance * push;
    }
    for (const [a,b] of springs) {
      const dx = a.x - b.x, dy = a.y - b.y;
      const distance = Math.max(1, Math.hypot(dx,dy));
      const pull = (distance - separation) * .045 * strength;
      a.x -= dx / distance * pull; b.x += dx / distance * pull;
      a.y -= dy / distance * pull; b.y += dy / distance * pull;
    }
    for (const point of nodes) {
      point.x = Math.max(34, Math.min(width - 34, point.x + (centerX - point.x) * .012));
      point.y = Math.max(30, Math.min(height - 42, point.y + (centerY - point.y) * .012));
    }
  }
  return anchored;
}
