/* Signal Deck's independently implemented, browser-only identity vault. */
"use strict";
(function (root) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const encoder = new TextEncoder();
  const format = "technocore-did-backup-v1";
  const algorithm = "PBKDF2-SHA256-250000/AES-256-GCM";
  const encode = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  function decode(text) {
    if (typeof text !== "string" || !/^[A-Za-z0-9_-]+$/.test(text) || text.length > 16000) throw new Error("Invalid backup encoding.");
    return Uint8Array.from(atob(text.replaceAll("-", "+").replaceAll("_", "/")), c => c.charCodeAt(0));
  }
  function didFor(x) {
    const bytes = decode(x);
    if (bytes.length !== 32) throw new Error("Invalid Ed25519 public key.");
    let value = 0xed01n;
    for (const byte of bytes) value = value * 256n + BigInt(byte);
    let result = "";
    while (value) { result = alphabet[Number(value % 58n)] + result; value /= 58n; }
    return `did:key:z${result}`;
  }
  async function load(payload) {
    const jwk = payload.privateKeyJwk || payload;
    if (jwk.kty !== "OKP" || jwk.crv !== "Ed25519" || decode(jwk.d).length !== 32) throw new Error("Invalid Ed25519 private key.");
    const did = didFor(jwk.x);
    if (payload.did && payload.did !== did) throw new Error("The backup DID does not match the key.");
    const key = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x: jwk.x, d: jwk.d, ext: true }, "Ed25519", false, ["sign"]);
    const pub = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x: jwk.x }, "Ed25519", false, ["verify"]);
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const sig = await crypto.subtle.sign("Ed25519", key, challenge);
    if (!await crypto.subtle.verify("Ed25519", pub, sig, challenge)) throw new Error("Public and private keys do not match.");
    return { did, key };
  }
  async function derive(password, salt) {
    const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 250000 }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encrypt(jwk, password) {
    if (password.length < 12) throw new Error("Use a passphrase of at least 12 characters.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await derive(password, salt);
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(jwk)));
    return { format, alg: algorithm, did: didFor(jwk.x), salt: encode(salt), iv: encode(iv), data: encode(data), created: new Date().toISOString() };
  }
  async function create(password) {
    if (password.length < 12) throw new Error("Use a passphrase of at least 12 characters.");
    const pair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
    const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
    const backup = await encrypt(jwk, password);
    const identity = await load(jwk);
    // Only the encrypted backup and a non-extractable signing key leave this function.
    return { ...identity, backup };
  }
  async function restore(backup, password) {
    if (backup?.format !== format || backup.alg !== algorithm) throw new Error("Unsupported backup format.");
    const salt = decode(backup.salt), iv = decode(backup.iv);
    if (salt.length !== 16 || iv.length !== 12) throw new Error("Invalid backup parameters.");
    const key = await derive(password, salt);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, decode(backup.data));
    const jwk = JSON.parse(new TextDecoder().decode(plaintext));
    return { ...await load({ did: backup.did, privateKeyJwk: jwk }), backup };
  }
  // Preserve 19-digit nonces before JSON.parse can round them. Only JSON value tokens are changed.
  function readRecord(raw) {
    if (typeof raw !== "string" || raw.length > 65536) throw new Error("Invalid record size.");
    const lossless = raw.replace(/"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g, token => /^\d{16,}$/.test(token) ? `"${token}"` : token);
    let data = JSON.parse(lossless);
    if (data?.posted) data = { room: data.room, ...data.posted };
    const { room, nonce, text, sig } = data || {};
    const did = data?.from || data?.did;
    if (!/^[a-z0-9][a-z0-9_-]{0,47}$/.test(room) || !/^\d{1,19}$/.test(String(nonce)) || typeof text !== "string" || typeof did !== "string" || typeof sig !== "string") throw new Error("Expected room, from, nonce, text and sig.");
    return { room, did, nonce: String(nonce), text, sig };
  }
  const api = { create, restore, load, encrypt, didFor, readRecord };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SignalVault = api;
})(globalThis);
