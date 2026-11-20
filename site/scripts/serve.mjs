import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { previewDatabase } from './preview-db.mjs';
import './build.mjs';
const {default: worker} = await import('../dist/server/index.js');
const db = previewDatabase();
const sessions = new Set();
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}
const port = Number(option('--port') || process.env.PORT || 4777);
const host = option('--host') || '127.0.0.1';
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + req.headers.host);
    const session = (req.headers.cookie || '').split(';').map(item => item.trim()).find(item => item.startsWith('engram_preview='))?.slice(15);
    if (url.pathname === '/signin-with-chatgpt' || url.pathname === '/signout-with-chatgpt') {
      const signingIn = url.pathname.startsWith('/signin');
      const token = signingIn ? randomUUID() : '';
      if (signingIn) sessions.add(token); else sessions.delete(session);
      res.writeHead(303, {'Location': '/', 'Cache-Control': 'no-store', 'Set-Cookie': 'engram_preview=' + token + '; Path=/; HttpOnly; SameSite=Lax' + (signingIn ? '' : '; Max-Age=0')});
      res.end();
      return;
    }
    const headers = new Headers(req.headers);
    for (const key of [...headers.keys()]) if (key.startsWith('oai-authenticated-')) headers.delete(key);
    if (sessions.has(session)) {
      headers.set('oai-authenticated-user-id', session);
      headers.set('oai-authenticated-user-email', 'Preview account');
    }
    // Preview runs behind a reverse proxy; use its browser origin when forwarding.
    const origin = headers.get('origin');
    if (origin && headers.get('sec-fetch-site') === 'same-origin') url.protocol = new URL(origin).protocol;
    if (origin && headers.get('sec-fetch-site') === 'same-origin') url.host = new URL(origin).host;
    const options = {method: req.method, headers};
    if (!['GET', 'HEAD'].includes(req.method)) Object.assign(options, {body: req, duplex: 'half'});
    const result = await worker.fetch(new Request(url, options), {DB: db});
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    res.writeHead(500); res.end('Preview unavailable.');
  }
}).listen(port, host, () => console.log('Engram preview listening on port ' + port));
