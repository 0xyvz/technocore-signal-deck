'use strict';
const { createPublicKey, verify } = require('node:crypto');
const codec = require('../public/wire');
function publicKeyFromDid(did) {
  const der = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(codec.publicBytes(did))]);
  return createPublicKey({ key: der, format: 'der', type: 'spki' });
}
function verifySignature(did, payload, signature) {
  try {
    codec.checkedSignature(signature);
    if (typeof payload !== 'string') return false;
    return verify(null, Buffer.from(payload), publicKeyFromDid(did), Buffer.from(signature, 'base64url'));
  } catch { return false; }
}
function verifyOuter(room, message) {
  if (!message || typeof message.text !== 'string' || !/^\d{1,19}$/.test(String(message.nonce))) return false;
  return verifySignature(message.from, [room, message.nonce, message.text].join('|'), message.sig);
}
function verifyOffer(message, record) {
  try {
    return record?.season === 'close-1' && record.t === 'close-call.offer.v1'
      && message.from === record.terms.maker
      && verifySignature(message.from, codec.payload(record.terms), record.maker_sig);
  } catch { return false; }
}
function verifyTrade(message, record) {
  try {
    if (record?.t !== 'trade' || record.season !== 'close-1') return false;
    const deal = codec.terms(record.terms);
    if (![deal.maker, record.taker].includes(message.from) || !['any', record.taker].includes(deal.taker)) return false;
    return verifySignature(deal.maker, codec.payload(deal), record.maker_sig)
      && verifySignature(record.taker, codec.payload(deal, record.taker), record.taker_sig);
  } catch { return false; }
}
module.exports = { publicKeyFromDid, verifySignature, verifyOuter, verifyOffer, verifyTrade };
