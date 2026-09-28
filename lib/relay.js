'use strict';
const { CONTEST, ROOMS, parseRecord } = require('./protocol');
const { verifyOuter, verifyOffer, verifyTrade } = require('./verify');
const { httpError } = require('./http-safety');
function checkSubmission(input) {
  const bad = message => { throw httpError(400, message); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) bad('A signed record is required.');
  const room = input.room || ROOMS.trading;
  if (![ROOMS.trading, ROOMS.offers].includes(room)) bad('This relay only handles Close Call rooms.');
  for (const key of ['did', 'text', 'nonce', 'sig']) if (typeof input[key] !== 'string') bad(`Missing string field: ${key}.`);
  const {did, text, nonce, sig} = input;
  if (!text.length || [...text].length > 4096 || text !== text.replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Zl}\p{Zp}]/gu, ' ').trim()) bad('Message must already be normalized to one line.');
  const sender = {from: did, text, nonce, sig};
  if (!verifyOuter(room, sender)) bad('The room signature does not match this message.');
  const record = parseRecord(text);
  const registration = room === ROOMS.trading && record?.season === CONTEST.id
    && ((record.t === 'owner' && record.key === did) || (record.t === 'room' && record.room === ROOMS.offers));
  if (!registration && !verifyOffer(sender, record) && !verifyTrade(sender, record)) bad('Unrecognized or incorrectly signed contest record.');
  return {room, signed: {did, text, nonce, sig}};
}
module.exports = { checkSubmission };
