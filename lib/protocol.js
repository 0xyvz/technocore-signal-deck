'use strict';
// Public protocol facts and record constructors; Signal Deck / 0xyvz.
const wire = require('../public/wire');
const rules = require('../public/contest-rules');
const ROOMS = Object.freeze(Object.fromEntries([
  ['trading', 'close1'], ['offers', 'close1-offers'],
  ...['flow', 'state', 'price', 'positions', 'pnl'].map(name => [name, `d-close1-${name}`]),
]));
const CONTEST = Object.freeze(Object.assign({}, rules.config, {
  room: ROOMS.trading,
  refereeDid: 'did:key:z6MkowHQwsx9xr84WbWN3YCnKutyBnBXkT1ChKY4uEAAMzte',
  manifestSha256: 'bae09812e25eb6f1369c611f24964f7ea0acafddfc45301a16f33f941296dafa',
}));
function offerRecord(input, signature) {
  return { t: 'close-call.offer.v1', season: CONTEST.id, terms: wire.terms(input), maker_sig: wire.checkedSignature(signature) };
}
function tradeRecord(input, taker, makerSignature, acceptance) {
  const record = offerRecord(input, makerSignature);
  wire.checkedDid(taker);
  if (!['any', taker].includes(record.terms.taker)) throw new Error('The designated counterparty must accept this offer.');
  return { ...record, t: 'trade', taker, taker_sig: wire.checkedSignature(acceptance) };
}
module.exports = {
  CONTEST, ROOMS, offerRecord, tradeRecord,
  DID_RE: wire.didPattern, SIG_RE: wire.signaturePattern,
  makeTerms: wire.terms, compact: JSON.stringify,
  compactTerms: input => JSON.stringify(wire.terms(input)),
  makerPayload: input => wire.payload(input), takerPayload: wire.payload,
  ownerRecord: did => ({ t: 'owner', season: CONTEST.id, key: wire.checkedDid(did) }),
  requireDid: wire.checkedDid, requireSignature: wire.checkedSignature,
  parseRecord: wire.object, parseJsonLossless: wire.lossless,
  isWithinLimits: rules.withinLimits, oppositeSide: side => side === 'buy' ? 'sell' : 'buy',
};
