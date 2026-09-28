/* Signal Deck protocol codec. Copyright (c) 2026 0xyvz. MIT. */
(function (scope) {
  'use strict';
  const digits = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const didPattern = /^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]{44}$/;
  const signaturePattern = /^[A-Za-z0-9_-]{85}[AQgw]$/;
  const fields = ['id', 'maker', 'px', 'qty', 'side', 'taker', 'until'];
  function ensure(condition, message) { if (!condition) throw new Error(message); }
  function publicBytes(did) {
    ensure(typeof did === 'string' && didPattern.test(did), 'Expected an Ed25519 DID.');
    const little = [0];
    for (const ch of did.substring(9)) {
      let carry = digits.indexOf(ch);
      ensure(carry >= 0, 'Unknown base58 character.');
      for (let j = 0; j < little.length; j++) {
        carry += little[j] * 58;
        little[j] = carry % 256;
        carry = Math.floor(carry / 256);
      }
      while (carry) { little.push(carry % 256); carry = Math.floor(carry / 256); }
    }
    const bytes = Uint8Array.from(little.reverse());
    ensure(bytes.length === 34 && bytes[0] === 237 && bytes[1] === 1, 'Unsupported public key codec.');
    return bytes.slice(2);
  }
  function checkedDid(value) { publicBytes(value); return value; }
  function checkedSignature(value) {
    ensure(typeof value === 'string' && signaturePattern.test(value), 'Expected a canonical 64-byte signature.');
    return value;
  }
  function terms(value) {
    ensure(value && typeof value === 'object' && !Array.isArray(value), 'Trade terms are missing.');
    ensure(Object.keys(value).length === fields.length && fields.every(f => Object.hasOwn(value, f)), 'Unexpected trade fields.');
    const out = Object.fromEntries(fields.map(f => [f, value[f]]));
    ensure(typeof out.id === 'string' && /^[\w-]{1,64}$/.test(out.id), 'Invalid trade identifier.');
    checkedDid(out.maker);
    if (out.taker !== 'any') checkedDid(out.taker);
    for (const f of ['px', 'qty']) {
      ensure(typeof out[f] === 'string' && /^\d{1,7}(\.\d{1,2})?$/.test(out[f]) && Number(out[f]) > 0, 'Price and quantity require positive decimal strings.');
    }
    ensure(Number(out.qty) >= 0.1, 'Minimum quantity is 0.10.');
    ensure(['sell', 'buy'].includes(out.side), 'Unknown trade direction.');
    ensure(Number.isSafeInteger(out.until) && out.until > 0, 'Expiry must be a positive integer.');
    return out;
  }
  function payload(value, signer) {
    const json = JSON.stringify(terms(value));
    return signer === undefined ? ['close-1', 'terms', json].join('|') : ['close-1', 'accept', json, checkedDid(signer)].join('|');
  }
  function object(text) {
    try { const v = JSON.parse(text); return v && !Array.isArray(v) && typeof v === 'object' ? v : null; }
    catch { return null; }
  }
  function lossless(source) {
    // Tokenize outside strings, protecting integer tokens before the JSON parser runs.
    const s = String(source); let out = '', i = 0;
    while (i < s.length) {
      if (s[i] === '"') {
        const start = i++;
        while (i < s.length) { if (s[i] === '\\') { i += 2; continue; } if (s[i++] === '"') break; }
        out += s.slice(start, i);
      } else if (s[i] === '-' || /[0-9]/.test(s[i])) {
        const start = i++;
        while (i < s.length && /[0-9eE+.\-]/.test(s[i])) i++;
        const token = s.slice(start, i);
        out += /^-?\d+$/.test(token) && !Number.isSafeInteger(Number(token)) ? JSON.stringify(token) : token;
      } else out += s[i++];
    }
    return JSON.parse(out);
  }
  const codec = Object.freeze({ didPattern, signaturePattern, publicBytes, checkedDid, checkedSignature, terms, payload, object, lossless });
  if (typeof module === 'object') module.exports = codec;
  else scope.SignalWire = codec;
})(globalThis);
