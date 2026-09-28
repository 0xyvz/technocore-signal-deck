'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync, sign} = require('node:crypto');
const wire = require('../public/wire');
const {didFor} = require('../public/vault');
const protocol = require('../lib/protocol');
const verifier = require('../lib/verify');
const {checkSubmission} = require('../lib/relay');
function person() {
  const pair = generateKeyPairSync('ed25519');
  return {did:didFor(pair.publicKey.export({format:'jwk'}).x), sign:text => sign(null,Buffer.from(text),pair.privateKey).toString('base64url')};
}
function deal(maker, taker='any') { return {until:91,side:'sell',qty:'0.10',px:'120.25',maker:maker.did,id:'new-codec-example',taker}; }
test('wire encoding agrees with hand-built protocol bytes regardless of input field order', () => {
  const a = person(), input = deal(a);
  const expected = `{"id":"new-codec-example","maker":"${a.did}","px":"120.25","qty":"0.10","side":"sell","taker":"any","until":91}`;
  assert.equal(protocol.compactTerms(input),expected);
  assert.equal(wire.payload(input),'close-1|terms|'+expected);
  assert.deepEqual(protocol.ownerRecord(a.did),{t:'owner',season:'close-1',key:a.did});
  for (const invalid of [{...input,qty:0.1},{...input,px:'1e2'},{...input,qty:'0.09'},{...input,extra:1},{...input,until:'91'},{...input,id:'<img>'}]) assert.throws(() => wire.terms(invalid));
});
test('both parties authenticate the exact agreement and the designated taker', () => {
  const a=person(),b=person(),c=person(),input=deal(a,b.did);
  const offer=protocol.offerRecord(input,a.sign(wire.payload(input)));
  assert.equal(verifier.verifyOffer({from:a.did},offer),true);
  const trade=protocol.tradeRecord(input,b.did,offer.maker_sig,b.sign(wire.payload(input,b.did)));
  assert.equal(verifier.verifyTrade({from:a.did},trade),true);
  assert.equal(verifier.verifyTrade({from:b.did},trade),true);
  assert.equal(verifier.verifyTrade({from:c.did},trade),false);
  assert.equal(verifier.verifyTrade({from:b.did},{...trade,terms:{...trade.terms,qty:'0.20'}}),false);
  assert.throws(() => protocol.tradeRecord(input,c.did,offer.maker_sig,c.sign(wire.payload(input,c.did))));
  const self=deal(a,a.did);
  assert.equal(verifier.verifyTrade({from:a.did},protocol.tradeRecord(self,a.did,a.sign(wire.payload(self)),a.sign(wire.payload(self,a.did)))),true);
});
test('relay rejects invalid envelopes, foreign rooms, modified text and noncanonical signatures', () => {
  const a=person(),text=JSON.stringify(protocol.ownerRecord(a.did)),nonce='1790000000000000039';
  const body={room:'close1',did:a.did,text,nonce,sig:a.sign(['close1',nonce,text].join('|'))};
  assert.equal(checkSubmission(body).signed.text,text);
  for (const change of [{room:'lobby'},{text:text+'\n'},{nonce:'1790000000000000040'},{did:person().did},{text:'{}'},{sig:body.sig.slice(0,-1)+'B'}]) assert.throws(() => checkSubmission({...body,...change}));
  assert.equal(verifier.verifySignature(a.did,['close1',nonce,text].join('|'),body.sig),true);
});
test('JSON reader preserves huge integers and escaped strings while leaving decimals numeric', () => {
  const value=wire.lossless('{"nonce":1790000000000000039,"neg":-9007199254740993,"text":"\\\"1790000000000000039\\\"","nested":[1,0.5,1e2]}');
  assert.equal(value.nonce,'1790000000000000039'); assert.equal(value.neg,'-9007199254740993');
  assert.equal(value.text,'"1790000000000000039"'); assert.deepEqual(value.nested,[1,0.5,100]);
  assert.throws(() => wire.lossless('{"nonce":notjson}'));
});
