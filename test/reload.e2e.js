'use strict';
const {test,expect}=require('@playwright/test');

test('application survives globals injected by other scripts before startup',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/snapshot*',route=>route.fulfill({status:503,json:{ok:false}}));
 await page.route('**/theme.js',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:'var t = "external-script", $ = "external-selector", state = "external-state";\n'+await response.text()});
 });
 await page.goto('/');
 for(let reload=0;reload<2;reload++){
  if(reload)await page.reload();
  await page.locator('[data-view-target="studio"]').click();
  await expect(page.locator('[data-view="studio"]')).toBeVisible();
  await page.locator('[data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  const theme=await page.locator('html').getAttribute('data-theme');
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme',theme);
  await page.locator('[data-view-target="leaderboard"]').click();
  await expect(page.locator('[data-view="leaderboard"]')).toBeVisible();
 }
 expect(errors).toEqual([]);
});

test('theme remains clickable during a reload while later scripts are loading',async({page})=>{
 await page.route('**/api/snapshot*',route=>route.fulfill({status:503,json:{ok:false}}));
 await page.goto('/#leaderboard');
 let release;
 const pending=new Promise(resolve=>{release=resolve;});
 await page.route('**/workspace.js',async route=>{await pending;await route.continue();});
 try {
  await page.reload({waitUntil:'commit'});
  await expect(page.locator('#themeToggle')).toBeVisible();
  const before=await page.locator('html').getAttribute('data-theme');
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',before==='dark'?'light':'dark',{timeout:2000});
 } finally {release();}
});

test('navigation, language and theme work after repeated reloads without market data',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/snapshot*',route=>route.fulfill({status:503,json:{ok:false}}));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#leaderboard');
 for(let i=0;i<3;i++){
  await page.reload();
  await page.locator('#mobileMenu').click();
  await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-expanded','true');
  await page.locator('[data-view-target="studio"]').click();
  await expect(page.locator('[data-view="studio"]')).toBeVisible();
  const language=i%2?'tr':'en';
  await page.locator(`[data-language="${language}"]`).click();
  await expect(page.locator('html')).toHaveAttribute('lang',language);
  const before=await page.locator('html').getAttribute('data-theme');
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',before==='dark'?'light':'dark');
  await page.goto('/#leaderboard');
 }
 expect(errors).toEqual([]);
});

test('menus and language do not wait for the optional icon library after reload',async({page})=>{
 await page.route('**/api/snapshot*',route=>route.fulfill({status:503,json:{ok:false}}));
 await page.setViewportSize({width:390,height:844});await page.goto('/#leaderboard');
 let release;const pending=new Promise(resolve=>{release=resolve;});
 await page.route('**/vendor/lucide.js',async route=>{await pending;await route.continue();});
 try {
  await page.reload({waitUntil:'commit'});
  await page.locator('#mobileMenu').click();
  await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-expanded','true',{timeout:2000});
  await page.locator('[data-view-target="studio"]').click();
  await expect(page.locator('[data-view="studio"]')).toBeVisible();
  await page.locator('[data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
 } finally {release();}
});
