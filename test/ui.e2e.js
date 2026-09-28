'use strict';
const {test,expect}=require('@playwright/test');
const {generateKeyPairSync,sign}=require('node:crypto');
const {didFor}=require('../public/vault');
const {verifyOuter,verifyTrade,verifyOffer}=require('../lib/verify');
function actor(){const pair=generateKeyPairSync('ed25519');return {did:didFor(pair.publicKey.export({format:'jwk'}).x),privateKeyJwk:pair.privateKey.export({format:'jwk'}),sign:value=>sign(null,Buffer.from(value),pair.privateKey).toString('base64url')};}
function market(overrides={}){return {launch:{verified:true},generatedAt:'2026-09-26T12:00:00Z',market:{price:{n:4,ref:{px:'120.25'},limits:['114.24','126.26']},flow:{n:4,settled:[],void:[]},positions:{top:[]},pnl:{top:[]},flowTs:'2026-09-26T12:00:00Z'},registrations:[],minted:[],offers:[],trades:[],visibility:{offerRoomRegistered:true},...overrides};}
async function visit(page,data,route='market'){
 await page.clock.setFixedTime(new Date('2026-09-26T12:00:00Z'));
 await page.route('**/api/snapshot*',r=>r.fulfill({json:{ok:true,data}}));
 await page.goto('/#'+route);
}
async function identify(page,who){await page.locator('#keyFile').setInputFiles({name:'disposable-test-identity.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({did:who.did,privateKeyJwk:who.privateKeyJwk}))});await expect(page.locator('#identityDid')).toHaveText(who.did);}
function capture(page,posts){return page.route('**/api/post',r=>{posts.push(r.request().postDataJSON());return r.fulfill({json:{ok:true,data:{posted:{seq:1}}}});});}
test('market retains the price, responsive navigation and prediction defaults',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await visit(page,market());
 await expect(page.locator('#referencePrice')).toContainText('120');
 await expect(page.locator('#priceLimits')).toHaveText('114.24 – 126.26');
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 }
 await page.locator('#mobileMenu').click();await page.locator('[data-view-target="predict"]').click();
 await expect(page.locator('[data-view="predict"]')).toBeVisible();await expect(page.locator('#offerPrice')).toHaveValue('120.25');expect(errors).toEqual([]);
});
test('import stays local and registration submits one verifiable owner record',async({page})=>{
 const who=actor(),posts=[];await capture(page,posts);await visit(page,market(),'register');await identify(page,who);expect(posts).toHaveLength(0);
 await page.locator('#registerButton').click();await expect.poll(()=>posts.length).toBe(1);
 const p=posts[0];expect(JSON.parse(p.text)).toEqual({t:'owner',season:'close-1',key:who.did});
 expect(verifyOuter(p.room,{...p,from:p.did})).toBe(true);expect(p.text).not.toContain(who.privateKeyJwk.d);
 await expect(page.locator('#registrationPageBadge')).toHaveText('Bekliyor');
});
test('an old registration declaration is explicitly local and unlocks the ticket',async({page})=>{
 const who=actor();await visit(page,market({visibility:{registrationIncomplete:true,offerRoomRegistered:true}}),'register');await identify(page,who);
 await expect(page.locator('#registrationPageBadge')).toContainText('eksik');await page.locator('#confirmRegisteredButton').click();
 await expect(page.locator('#registrationPageBadge')).toContainText('Yerel');await page.locator('[data-view-target="predict"]').click();await expect(page.locator('#publishOfferButton')).toBeEnabled();
});
test('maker creates authenticated room registration and offer with inclusive expiry',async({page})=>{
 const who=actor(),posts=[];await capture(page,posts);await visit(page,market({minted:[who.did],visibility:{offerRoomRegistered:false}}),'predict');await identify(page,who);
 await page.locator('#offerDuration').selectOption('3');await page.locator('#publishOfferButton').click();await expect.poll(()=>posts.length).toBe(2);
 expect(JSON.parse(posts[0].text).t).toBe('room');const p=posts[1],offer=JSON.parse(p.text);
 expect(p.room).toBe('close1-offers');expect(offer.terms.until).toBe(7);expect(verifyOuter(p.room,{...p,from:p.did})).toBe(true);expect(verifyOffer({from:p.did},offer)).toBe(true);
});
test('taker countersigns and local portfolio survives a truncated feed',async({page})=>{
 const a=actor(),b=actor(),posts=[];
 const terms={id:'retained-trade',maker:a.did,px:'120.25',qty:'0.10',side:'sell',taker:'any',until:9};
 const record={t:'close-call.offer.v1',season:'close-1',terms,maker_sig:a.sign('close-1|terms|'+JSON.stringify(terms))};
 await capture(page,posts);await visit(page,market({minted:[b.did],offers:[{record}]}));await identify(page,b);
 await page.locator('[data-take="retained-trade"]').click();await page.locator('#acceptOfferButton').click();await expect.poll(()=>posts.length).toBe(1);
 const p=posts[0];expect(verifyTrade({from:p.did},JSON.parse(p.text))).toBe(true);expect(verifyOuter(p.room,{...p,from:p.did})).toBe(true);
 await page.locator('[data-view-target="desk"]').click();await expect(page.locator('#myTrades')).toContainText('retained-trade');
 await page.locator('#refreshButton').click();await expect(page.locator('#myTrades')).toContainText('retained-trade');await page.locator('[data-view-target="market"]').click();await expect(page.locator('[data-take="retained-trade"]')).toHaveCount(0);
});
test('modified shared offer cannot reach the relay',async({page})=>{
 const a=actor(),b=actor(),posts=[],terms={id:'tampered',maker:a.did,px:'120.25',qty:'0.10',side:'buy',taker:'any',until:9};
 const record={t:'close-call.offer.v1',season:'close-1',terms:{...terms,qty:'0.20'},maker_sig:a.sign('close-1|terms|'+JSON.stringify(terms))};
 await capture(page,posts);await visit(page,market({minted:[b.did]}),'desk');await identify(page,b);await page.locator('#offerPaste').fill(JSON.stringify(record));await page.locator('#reviewOfferButton').click();
 await expect(page.locator('#toast')).toContainText('doğrulanamadı');await expect(page.locator('#offerDialog')).toBeHidden();expect(posts).toHaveLength(0);
});
