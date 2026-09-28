'use strict';
const {parseRecord, parseJsonLossless}=require('./protocol');
const {verifyOuter}=require('./verify');

// Launch proof is immutable but eventually falls outside the room's recent page.
// Only a signed seed matching all pinned settings may enter the in-memory cache.
function createSeedResolver({room, refereeDid, season, manifestSha256, officialRooms, readExport}) {
  let cached = null;
  function valid(message) {
    const record = parseRecord(message?.text);
    return record?.t === 'seed' && message.from === refereeDid
      && record.season === season && record.package === manifestSha256
      && Array.isArray(record.rooms) && officialRooms.every(name=>record.rooms.includes(name))
      && verifyOuter(room,message) ? {...message, record} : null;
  }
  return async function resolve(recent) {
    for (const message of [...recent].reverse()) { const seed=valid(message); if (seed) { cached=seed; return cached; } }
    if (cached) return cached;
    try {
      for (const line of (await readExport()).split('\n')) {
        let message; try { message=parseJsonLossless(line); } catch { continue; }
        const seed=valid(message); if (seed) { cached=seed; return cached; }
      }
    } catch { /* Keep the launch locked and retry on the next refresh. */ }
    return null;
  };
}
module.exports={createSeedResolver};
