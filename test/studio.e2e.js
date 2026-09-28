"use strict";
const { test, expect } = require("@playwright/test");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const vault = require("../public/vault");
const snapshot = { generatedAt: "2026-09-26T12:00:00Z", launch: { verified: true }, market: { price: { for: 289, ref: { px: "225.67" }, global: "226.10", limits: ["214.39", "236.95"] }, priceTs: "2026-09-26T12:00:00Z", state: { owners: 825126 }, positions: { open: "704493.10", longs: 18, shorts: 12, top: [] }, flow: { settled: [], void: [] }, pnl: { top: [] } }, registrations: [], minted: [], offers: [], trades: [], visibility: { offerRoomRegistered: true } };
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-26T12:00:00Z"));
  await page.route("**/api/snapshot*", route => route.fulfill({ json: { ok: true, data: snapshot } }));
  await page.route("https://technocore.chat/**", route => route.abort());
});

test("create, download, forget and restore identity without sending key data", async ({ page }) => {
  const posts = [];
  page.on("request", request => { if (request.method() === "POST") posts.push(request.url()); });
  await page.goto("/#studio");
  await page.locator("#vaultPassword").fill("secure-passphrase-for-test");
  await page.locator("#vaultConfirm").fill("secure-passphrase-for-test");
  await page.locator("#generateIdentity").click();
  await expect(page.locator("#identityDid")).toHaveText(/^did:key:z6Mk/);
  const did = await page.locator("#identityDid").textContent();
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#downloadBackup").click();
  const download = await downloadEvent;
  const backup = JSON.parse(await fs.readFile(await download.path(), "utf8"));
  expect(backup.did).toBe(did);
  expect(backup.d).toBeUndefined();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain("secure-passphrase");
  await page.locator("#forgetButton").click();
  await expect(page.locator("#identityDid")).toHaveText("-");
  await page.locator("#keyFile").setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
  await page.locator("#vaultPassword").fill("wrong-password");
  await page.locator("#unlockBackup").click();
  await expect(page.locator("#vaultStatus")).toContainText("Yedek açılamadı");
  await expect(page.locator("#identityDid")).toHaveText("-");
  await page.locator("#vaultPassword").fill("secure-passphrase-for-test");
  await page.locator("#unlockBackup").click();
  await expect(page.locator("#identityDid")).toHaveText(did);
  await page.locator("#messageText").fill("Merhaba\nTechnocore");
  await page.locator("#signMessage").click();
  await expect(page.locator("#signedOutput")).toBeVisible();
  const signed = JSON.parse(await page.locator("#signedPreview").textContent());
  expect(signed.text).toBe("Merhaba Technocore");
  await page.locator('[data-tool="verify"]').click();
  await page.locator("#verifyJson").fill(JSON.stringify(signed));
  await page.locator("#verifyRecord").click();
  await expect(page.locator("#verifyResult")).toContainText("İmza geçerli");
  signed.text += "tampered";
  await page.locator("#verifyJson").fill(JSON.stringify(signed));
  await page.locator("#verifyRecord").click();
  await expect(page.locator("#verifyResult")).toContainText("İmza doğrulanmadı");
  expect(posts).toHaveLength(0);
});

test("verifies a server record with a numeric 19-digit nonce without an identity", async ({ page }) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const did = vault.didFor(publicKey.export({ format: "jwk" }).x);
  const nonce = "1790000000000000001";
  const sig = crypto.sign(null, Buffer.from(`lobby|${nonce}|test`), privateKey).toString("base64url");
  const raw = `{"room":"lobby","posted":{"from":"${did}","nonce":${nonce},"text":"test","sig":"${sig}"}}`;
  await page.goto("/#studio");
  await page.locator('[data-tool="verify"]').click();
  await page.locator("#verifyJson").fill(raw);
  await page.locator("#verifyRecord").click();
  await expect(page.locator("#verifyResult")).toContainText("İmza geçerli");
});

test("all views and language switching fit desktop and mobile", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    for (const view of ["market", "predict", "desk", "studio", "rules", "register", "leaderboard"]) {
      await page.goto(`/#${view}`);
      await expect(page.locator(`[data-view="${view}"]`)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      if ([1440, 390].includes(width) && ["rules", "register", "leaderboard"].includes(view)) await page.screenshot({ path: `test-results/${view}-${width}.png`, fullPage: true });
    }
  }
  await page.locator('[data-language="en"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/#studio");
  await expect(page.locator("h1:visible")).toHaveText("Start with your identity.");
  expect(errors).toEqual([]);
});

test("connection failure is visible and cannot enable publishing", async ({ page }) => {
  await page.route("**/api/snapshot*", route => route.fulfill({ status: 503, json: { ok: false } }));
  await page.goto("/");
  await expect(page.locator("#connectionError")).toBeVisible();
  await page.goto("/#predict");
  await expect(page.locator("#publishOfferButton")).toBeDisabled();
});
