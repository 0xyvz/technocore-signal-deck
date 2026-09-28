"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { webcrypto } = require("node:crypto");
if (!globalThis.crypto) Object.defineProperty(globalThis, "crypto", { value: webcrypto });
const vault = require("../public/vault");

test("encrypted backup round trip preserves identity, signatures, and a non-extractable key", async () => {
  const identity = await vault.create("a-long-test-passphrase");
  assert.equal(identity.key.extractable, false);
  assert.match(identity.did, /^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]{44}$/);
  assert.equal(identity.backup.format, "technocore-did-backup-v1");
  assert.equal(identity.backup.d, undefined);
  const restored = await vault.restore(JSON.parse(JSON.stringify(identity.backup)), "a-long-test-passphrase");
  assert.equal(restored.did, identity.did);
  assert.equal(restored.key.extractable, false);
  const message = new TextEncoder().encode("lobby|1790000000000000001|hello");
  assert.deepEqual(await crypto.subtle.sign("Ed25519", restored.key, message), await crypto.subtle.sign("Ed25519", identity.key, message));
  await assert.rejects(crypto.subtle.exportKey("jwk", restored.key));
  await assert.rejects(vault.restore(identity.backup, "wrong-passphrase"));
  await assert.rejects(vault.restore({ ...identity.backup, did: "did:key:wrong" }, "a-long-test-passphrase"));
  await assert.rejects(vault.restore({ ...identity.backup, data: identity.backup.data.slice(0,-4) + "AAAA" }, "a-long-test-passphrase"));
});

test("plaintext import rejects mismatched public and private key material", async () => {
  const one = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const two = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const jwk1 = await crypto.subtle.exportKey("jwk", one.privateKey);
  const jwk2 = await crypto.subtle.exportKey("jwk", two.privateKey);
  await assert.rejects(vault.load({ ...jwk1, x: jwk2.x }));
  assert.equal((await vault.load({ privateKeyJwk: jwk1 })).did, vault.didFor(jwk1.x));
  await assert.rejects(vault.create("short"));
});

test("verifier parsing preserves 19-digit nonces and exact message content", () => {
  const raw = '{"room":"lobby","posted":{"from":"did:key:example","nonce":1790000000000000001,"text":"text with 1790000000000000002 and \\"nonce\\":1234567890123456789","sig":"signature"}}';
  const record = vault.readRecord(raw);
  assert.equal(record.nonce, "1790000000000000001");
  assert.equal(record.text, 'text with 1790000000000000002 and "nonce":1234567890123456789');
  assert.equal(record.room, "lobby");
  assert.throws(() => vault.readRecord('{"room":"bad room"}'));
});
