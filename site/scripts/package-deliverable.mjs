import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'outputs', 'Engram-Notebook');
await mkdir(output, { recursive: true });
let html = await readFile(path.join(root, 'web', 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'web', 'styles.css'), 'utf8');
const model = (await readFile(path.join(root, 'web', 'model.js'), 'utf8')).replace(/^export /gm, '');
const account = (await readFile(path.join(root, 'web', 'account.js'), 'utf8')).replace(/^export /gm, '');
const workspace = (await readFile(path.join(root, 'web', 'workspace.js'), 'utf8')).replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '');
const extra = await Promise.all(['recall.js', 'memory-chat.js', 'memory-index.js', 'memory-explorer.js'].map(async name =>
  (await readFile(path.join(root, 'web', name), 'utf8')).replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '')));
const app = (await readFile(path.join(root, 'web', 'app.js'), 'utf8')).replace(/^import[^\n]+\n/gm, '');
const favicon = await readFile(path.join(root, 'web', 'favicon.svg'), 'utf8');
html = html.replace('<link rel="stylesheet" href="/styles.css">', () => `<style>${css}</style>`)
  .replace('<script type="module" src="/app.js"></script>', '')
  .replace('href="/favicon.svg"', () => `href="data:image/svg+xml,${encodeURIComponent(favicon)}"`)
  .replace('</body>', () => `<script>\n${model}\n${account}\n${workspace}\n${extra.join('\n')}\n${app}\n</script>\n</body>`);
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1]);
if (html.includes('src="/app.js"') || html.includes('href="/styles.css"')) throw new Error('The standalone notebook still references local assets.');
await writeFile(path.join(output, 'Engram-Notebook.html'), html);
for (const item of ['web', 'server', 'drizzle', 'scripts', 'tests', 'package.json', 'README.md', '.gitignore', '.openai']) {
  await cp(path.join(root, item), path.join(output, 'source', item), { recursive: true });
}
await writeFile(path.join(output, 'START-HERE.txt'), 'ENGRAM NOTEBOOK\n\nOpen Engram-Notebook.html in a modern browser. No installation is needed.\n\nYour moments stay in that browser on that device. Use Your space to export a JSON backup. Keep the HTML file in the same location so the browser can keep associating its storage with this notebook.\n\nThe source folder contains the hosted edition with ChatGPT sign-in and account-based storage. Run npm test for its automated checks or npm run dev for a disposable local preview.\n');
console.log(JSON.stringify({ output, html: path.join(output, 'Engram-Notebook.html') }));
