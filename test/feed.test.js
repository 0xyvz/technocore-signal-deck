'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {generateKeyPairSync,sign}=require('node:crypto');
const {didFor}=require('../public/vault');
const {ContestFeed}=require('../lib/feed');
const {CONTEST,ROOMS}=require('../lib/protocol');
function fixture(){
 const pair=generateKeyPairSync('ed25519'),did=didFor(pair.publicKey.export({format:'jwk'}).x);
 const settings={...CONTEST,refereeDid:did};let nonce=1790000000000000000n;
 function signed(room,record){const text=JSON.stringify(record),n=String(++nonce);return {from:did,nonce:n,text,sig:sign(null,Buffer.from(`${room}|${n}|${text}`),pair.privateKey).toString('base64url'),ts:'2026-09-27T10:00:00Z',seq:Number(nonce%100n)};}
 const rooms=Object.fromEntries(Object.values(ROOMS).map(room=>[room,[]]));
 const names=['price','flow','state','positions','pnl'].map(key=>ROOMS[key]);
 const seed=signed(ROOMS.price,{t:'seed',season:'close-1',package:CONTEST.manifestSha256,rooms:names,price:'100.00'});
 rooms[ROOMS.price]=[signed(ROOMS.price,{t:'price',n:30,ref:{px:'100.00'}})];
 rooms[ROOMS.flow]=[signed(ROOMS.flow,{t:'flow',n:30,mints:[did],settled:[],void:[],rooms:['close1-offers'],omitted:{mints:2}})];
 rooms[ROOMS.pnl]=[signed(ROOMS.pnl,{t:'pnl',n:30,mark:'100.00',top:[[did,'12.00']]})];
 let owner=did,calls=0;
 const read=async route=>{calls++;if(route.startsWith('/kv/'))return owner;if(route.endsWith('/export'))return route.includes(ROOMS.price)?JSON.stringify(seed):'';return JSON.stringify({messages:rooms[route.split('/')[2].split('?')[0]]});};
 return {rooms,settings,signed,read,get calls(){return calls;},setOwner:value=>{owner=value;}};
}
test('feed recovers the signed launch, authenticates rankings and coalesces concurrent requests',async()=>{
 const f=fixture(),feed=new ContestFeed(f.read,f.settings);
 const [a,b]=await Promise.all([feed.snapshot(),feed.snapshot()]);assert.strictEqual(a,b);assert.equal(a.launch.verified,true);
 assert.equal(a.market.pnlVerified,true);assert.equal(a.market.pnlProof.nonce, f.rooms[ROOMS.pnl][0].nonce);assert.deepEqual(a.market.price.limits,['95.00','105.00']);
 assert.equal(a.visibility.registrationIncomplete,true);assert.equal(a.visibility.offerRoomRegistered,true);
 const calls=f.calls;await feed.snapshot();assert.equal(f.calls,calls);
});
test('a changed signature cannot populate standings and a wrong room owner locks launch',async()=>{
 const f=fixture();f.rooms[ROOMS.pnl][0].text=f.rooms[ROOMS.pnl][0].text.replace('12.00','999.00');f.setOwner('someone-else');
 const value=await new ContestFeed(f.read,f.settings).snapshot();assert.equal(value.market.pnlVerified,false);assert.equal(value.market.pnl,null);assert.equal(value.launch.verified,false);
});
test('failure never returns an expired snapshot as fresh data',async()=>{
 const f=fixture();let offline=false;const feed=new ContestFeed(route=>{if(offline)throw Error('offline');return f.read(route);},f.settings);
 await feed.snapshot();feed.validUntil=0;offline=true;await assert.rejects(feed.snapshot(),/offline/);assert.equal(feed.inFlight,null);
});
