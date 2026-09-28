'use strict';

function httpError(status, message) { return Object.assign(new Error(message), { status }); }

function validateRequest(request, { host, publicOrigin = '' }) {
  let authority;
  try { authority = new URL(`http://${request.headers.host}`); }
  catch { throw httpError(400, 'Invalid Host header.'); }
  // A local server must not answer a rebinding domain pointing at loopback.
  if (['127.0.0.1', 'localhost', '::1'].includes(host)
      && !['127.0.0.1', 'localhost', '[::1]'].includes(authority.hostname)) {
    throw httpError(403, 'Host is not allowed.');
  }
  if (request.method !== 'POST') return;
  if (request.headers['sec-fetch-site'] === 'cross-site') throw httpError(403, 'Cross-site requests are not allowed.');
  const origin = request.headers.origin;
  if (origin) {
    const expected = publicOrigin || `${request.socket.encrypted ? 'https' : 'http'}://${authority.host}`;
    if (origin !== expected) throw httpError(403, 'Origin is not allowed.');
  }
  if ((request.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw httpError(415, 'Content-Type must be application/json.');
  }
}

async function readBoundedText(body, maxBytes) {
  let size = 0;
  const chunks = [];
  for await (const chunk of body) {
    const bytes = Buffer.from(chunk);
    size += bytes.length;
    if (size > maxBytes) throw httpError(413, 'Response or request body exceeds the size limit.');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchText(url, options = {}, { maxBytes = 4 * 1024 * 1024, timeoutMs = 12000, fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { ...options, redirect: 'error', signal: controller.signal });
    // Keep the deadline active while reading the response, not just its headers.
    const text = response.body ? await readBoundedText(response.body, maxBytes) : '';
    return { ok: response.ok, status: response.status, text: async () => text };
  } finally { clearTimeout(timer); }
}
module.exports = { httpError, validateRequest, readBoundedText, fetchText };
