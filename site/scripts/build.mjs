import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
const mimeTypes = {
  'index.html': 'text/html',
  'app.js': 'text/javascript',
  'model.js': 'text/javascript',
  'account.js': 'text/javascript',
  'workspace.js': 'text/javascript',
  'styles.css': 'text/css',
  'favicon.svg': 'image/svg+xml'
};
const assets = {};
for (const [file, type] of Object.entries(mimeTypes)) {
  assets['/' + file] = [type + '; charset=utf-8', await read('web/' + file)];
}
// Deploy a single Worker module. Serve only the public files listed above.
const model = assets['/model.js'][1].replace(/^export /gm, '');
const server = (await read('server/worker.mjs')).replace(/^export /gm, '');
const entry = [model, server, 'export default createNotebookWorker(' + JSON.stringify(assets) + ', validateEntry);'].join('\n');
await mkdir(path.join(root, 'dist/server'), {recursive: true});
await writeFile(path.join(root, 'dist/server/index.js'), entry);
await mkdir(path.join(root, 'dist/.openai'), {recursive: true});
await writeFile(path.join(root, 'dist/.openai/hosting.json'), await read('.openai/hosting.json'));
