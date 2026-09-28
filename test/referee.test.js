'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {createSeedResolver}=require('../lib/referee');
const vault=require('../public/vault');
function fixture(){
 const pair=crypto.generateKeyPairSync('ed25519');const did=vault.didFor(pair.publicKey.export({format:'jwk'}).x);
 const room='d-close1-price';const nonce='1790000000000000001';
 const text=JSON.stringify({t:'seed',season:'close-1',package:'pinned-hash',rooms:[room]});
 const message={from:did,nonce,text,sig:crypto.sign(null,Buffer.from(`${room}|${nonce}|${text}`),pair.privateKey).toString('base64url')};
 return {room,message,refereeDid:did,season:'close-1',manifestSha256:'pinned-hash',officialRooms:[room]};
}
test('signed launch survives recent-history truncation and is cached after verification',async()=>{
 const f=fixture();let calls=0;const resolve=createSeedResolver({...f,readExport:async()=>{calls++;return 'not json\n'+JSON.stringify(f.message);}});
 assert.equal((await resolve([])).record.package,'pinned-hash');
 assert.equal((await resolve([])).from,f.refereeDid);assert.equal(calls,1);
});
test('invalid archived seed cannot unlock the launch; failed reads can recover',async()=>{
 const f=fixture();let body=JSON.stringify({...f.message,text:f.message.text.replace('pinned-hash','forged')});
 const resolve=createSeedResolver({...f,readExport:async()=>body});
 assert.equal(await resolve([]),null);body=JSON.stringify(f.message);assert.equal((await resolve([])).from,f.refereeDid);
 const wrongPin=createSeedResolver({...f,manifestSha256:'different',readExport:async()=>body});assert.equal(await wrongPin([f.message]),null);
});
