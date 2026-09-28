'use strict';
const {test,expect}=require('@playwright/test');
const crypto=require('node:crypto');
const fs=require('node:fs/promises');
const vault=require('../public/vault');
const ids=Array.from({length:25},()=>{const pair=crypto.generateKeyPairSync('ed25519');return {did:vault.didFor(pair.publicKey.export({format:'jwk'}).x),privateKeyJwk:pair.privateKey.export({format:'jwk'})};});
const snapshot={launch:{verified:true},market:{price:{n:288,for:289,ref:{px:'225.15'},limits:['213.90','236.40'],global:'225.04'},flow:{n:288,mints:[],settled:['sample'],void:[],omitted:{settled:100}},flowTs:'2026-09-26T12:00:00Z',positions:{top:[]},pnl:{n:288,mark:'225.04',top:ids.map((id,i)=>[id.did,i<2?'50.00':String(50-i)])},pnlVerified:true,pnlTs:'2026-09-26T12:00:00Z',pnlProof:{room:'d-close1-pnl',text:'public signed fixture',sig:'fixture'}},minted:[],registrations:[],offers:[],trades:[],visibility:{offerRoomRegistered:true}};
async function setup(page,data=snapshot){await page.clock.setFixedTime(new Date('2026-09-26T12:00:00Z'));await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/api/snapshot*',route=>route.fulfill({json:{ok:true,data}}));await page.route('**/api/post',route=>route.abort());}
async function importKey(page,key){await page.locator('#keyFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(key))});}
test('guide opens first and the path leads to identity then registration',async({page})=>{
 await setup(page);await page.goto('/');await expect(page.locator('[data-view="rules"]')).toBeVisible();
 await page.locator('.guide-hero [data-go="studio"]').click();await expect(page.locator('#studioContinue')).toBeDisabled();
 await importKey(page,ids[0]);await expect(page.locator('#studioContinue')).toBeEnabled();await page.locator('#studioContinue').click();
 await expect(page.locator('[data-view="register"]')).toBeVisible();await expect(page.locator('#registrationDid')).toHaveText(ids[0].did);
 // A signed PnL entry is public account evidence for this test identity.
 await expect(page.locator('#regStepMint')).toHaveClass(/done/);await expect(page.locator('#registrationContinue')).toBeEnabled();
 const duplicates=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);return ids.filter((x,i)=>ids.indexOf(x)!==i);});expect(duplicates).toEqual([]);
});
test('standings show all published rows, tied ranks, full-DID search and public proof',async({page})=>{
 await setup(page);await page.goto('/#leaderboard');await expect(page.locator('.ranking-row')).toHaveCount(25);
 await expect(page.locator('.rank-number').nth(0)).toHaveText('01');await expect(page.locator('.rank-number').nth(1)).toHaveText('01');await expect(page.locator('.rank-number').nth(2)).toHaveText('03');
 await expect(page.locator('#rankingVerification')).toContainText('doğrulandı');
 await page.locator('#rankingSearch').fill(ids[24].did);await expect(page.locator('.ranking-row')).toHaveCount(1);await expect(page.locator('.rank-number')).toHaveText('25');
 const event=page.waitForEvent('download');await page.locator('#downloadRankingProof').click();const file=await event;expect(JSON.parse(await fs.readFile(await file.path(),'utf8'))).toEqual(snapshot.market.pnlProof);
 await page.locator('#rankingSearch').fill('not-a-published-DID');await expect(page.locator('#leaderboard')).toContainText('bulunamadı');
 await page.locator('[data-language="en"]').click();await expect(page.locator('#leaderboard')).toContainText('not found');
});
test('unverified standings are hidden and old verified records are labelled stale',async({page})=>{
 await setup(page,{...snapshot,market:{...snapshot.market,pnlVerified:false}});await page.goto('/#leaderboard');await expect(page.locator('.ranking-row')).toHaveCount(0);await expect(page.locator('#downloadRankingProof')).toBeDisabled();
 await page.route('**/api/snapshot*',route=>route.fulfill({json:{ok:true,data:{...snapshot,market:{...snapshot.market,pnlTs:'2026-09-25T12:00:00Z'}}}}));
 await page.locator('#refreshButton').click();await expect(page.locator('.ranking-row')).toHaveCount(25);await expect(page.locator('#rankingFreshness')).toContainText('Son alınan veri');
});
test('later flow alone does not confirm a registration; omitted outcomes count toward totals',async({page})=>{
 const key=ids[0];await setup(page,{...snapshot,registrations:[{did:key.did,ts:'2026-09-25T12:00:00Z'}],market:{...snapshot.market,pnl:{top:[]}}});await page.goto('/#register');await importKey(page,key);
 await expect(page.locator('#registrationPageBadge')).toHaveText('Bekliyor');await expect(page.locator('#regStepMint')).not.toHaveClass(/done/);await expect(page.locator('#registrationContinue')).toBeDisabled();
 await page.goto('/#market');await expect(page.locator('#settledLast')).toHaveText('101');
});
