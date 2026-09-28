'use strict';
// Signal Deck HTTP entry point. Copyright (c) 2026 0xyvz. MIT.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { ContestFeed } = require('./lib/feed');
const { checkSubmission } = require('./lib/relay');
const { fetchText, readBoundedText, validateRequest, httpError } = require('./lib/http-safety');
const { publicOrigin } = require('./lib/runtime');
const upstream = 'https://technocore.chat';
const staticRoot = path.resolve(__dirname, 'public');
const bindAddress = process.env.HOST || (process.env.CODESPACES === 'true' ? '0.0.0.0' : '127.0.0.1');
const fixedPort = process.env.PORT || process.argv[2];
let listeningPort = Number(fixedPort || 5192);
if (!Number.isInteger(listeningPort) || listeningPort < 1 || listeningPort > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
async function upstreamText(route, init) {
  const reply = await fetchText(upstream + route, init);
  if (!reply.ok) {
    const error = httpError(502, 'Technocore could not complete this request.');
    error.upstreamStatus = reply.status; throw error;
  }
  return reply.text();
}
const feed = new ContestFeed(upstreamText);
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.json':'application/json' };
const security = {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};
async function resource(url) {
  // Keep shared application declarations out of the page's global scope.
  // Extensions and injected scripts can otherwise collide with names such as t.
  if (url === '/workspace.js') {
    const sources = await Promise.all(['app.js', 'copy.js', 'studio.js', 'journey.js'].map(name => fs.readFile(path.join(staticRoot, name), 'utf8')));
    return { data: `(function () {\n'use strict';\n${sources.join('\n;\n')}\n})();\n`, type: mime['.js'] };
  }
  if (url === '/vendor/lucide.js') return { data: await fs.readFile(path.join(__dirname, 'node_modules/lucide/dist/umd/lucide.min.js')), type: mime['.js'] };
  let decoded;
  try { decoded = decodeURIComponent(url); } catch { throw httpError(400, 'Invalid URL encoding.'); }
  const parts = decoded.split('/');
  if (parts.some(p => p.startsWith('.') || p.includes('\\')) || decoded.includes('\0')) throw httpError(404, 'File not found.');
  const target = path.resolve(staticRoot, '.' + (decoded === '/' ? '/index.html' : decoded));
  if (!target.startsWith(staticRoot + path.sep)) throw httpError(404, 'File not found.');
  return { data: await fs.readFile(target), type: mime[path.extname(target)] || 'application/octet-stream' };
}
async function dispatch(req, pathname) {
  if (req.method === 'GET' && pathname === '/api/health') return {ok:true, technocore:upstream};
  if (req.method === 'GET' && pathname === '/api/snapshot') return {ok:true, data:await feed.snapshot()};
  if (req.method === 'POST' && pathname === '/api/post') {
    let input;
    try { input = JSON.parse(await readBoundedText(req, 65536)); } catch (error) { if (error.status) throw error; throw httpError(400, 'Invalid JSON.'); }
    const {room, signed} = checkSubmission(input);
    const text = await upstreamText(`/r/${room}?format=json`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(signed)});
    feed.validUntil = 0;
    let data; try { data = JSON.parse(text); } catch { throw httpError(502, 'Technocore returned an unreadable receipt.'); }
    return {ok:true, data};
  }
  throw httpError(404, 'Unknown API route.');
}
const server = http.createServer(async (req, res) => {
  const send = (status, data, type = 'application/json') => {
    res.writeHead(status, {...security, 'Content-Type':`${type}; charset=utf-8`});
    res.end(req.method === 'HEAD' ? undefined : data);
  };
  try {
    validateRequest(req, {host:bindAddress, publicOrigin:publicOrigin(process.env, listeningPort)});
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname.startsWith('/api/')) return send(200, JSON.stringify(await dispatch(req, pathname)));
    if (!['GET','HEAD'].includes(req.method)) throw httpError(405, 'Use GET to read files.');
    const file = await resource(pathname); send(200, file.data, file.type);
  } catch (error) {
    const status = ['ENOENT','EISDIR'].includes(error.code) ? 404 : error.status || 500;
    send(status, JSON.stringify({ok:false, error:status === 404 ? 'Not found.' : error.status ? error.message : 'The request could not be completed.'}));
  }
});
Object.assign(server, { requestTimeout:15000, headersTimeout:10000, maxRequestsPerSocket:100 });
server.on('error', error => {
  if (error.code !== 'EADDRINUSE' || fixedPort || listeningPort >= 5210) throw error;
  server.listen(++listeningPort, bindAddress);
});
server.on('listening', () => console.log(`Signal Deck: ${publicOrigin(process.env, listeningPort) || `http://${bindAddress}:${listeningPort}`}`));
server.listen(listeningPort, bindAddress);
module.exports = server;
