"use strict";

// Studio copy is separate from the contest protocol so each screen can evolve independently.
$$('[data-i18n]').forEach(node => { if (!i18n.tr[node.dataset.i18n]) i18n.tr[node.dataset.i18n] = node.textContent; });
Object.assign(i18n.tr, {
  community: "Bağımsız Technocore çalışma alanı", desk: "Portföyüm", rules: "Rehber", liveMarket: "Bir sonraki hamlen.", newCall: "Tahmin oluştur", reference: "Referans fiyat", owners: "Katılımcılar", refereeFeed: "Hakem radarı", liveBoard: "Liderlik tablosu", tradeTape: "Son işlemler", makerCall: "Tahmin sahibi", myDeskTitle: "Hamlelerin, bir arada.", rulesTitle: "Oyunu tanı.", makeCallTitle: "Yönünü belirle.", oneBet: "BİR TAHMİNLE BAŞLAR", account: "KİŞİSEL ALANIN", forget: "Oturumu kapat", keyLocal: "Özel anahtar yalnızca bu sekmede kalır.", canonicalRules: "Resmî kuralları aç", verifying: "Hakem doğrulanıyor", launchLive: "Canlı ve doğrulandı", launchInvalid: "Doğrulama bekleniyor", noOffers: "Şu anda bu yönde açık teklif yok.", noPersonalCalls: "İlk tahminin burada görünecek.", noPersonalTrades: "İlk karşı imzalı işlemin burada görünecek.",
  connectionFailed: "Canlı veriye ulaşılamıyor. Son veriler güncel olmayabilir; yeniden bağlantı kurulana kadar işlemler durduruldu. Kimlik araçlarını kullanmaya devam edebilirsin.", actionsUnavailable: "İşlem için güncel, doğrulanmış piyasa verisi ve açık yarışma süresi gerekiyor.", contestClosed: "Kapandı", enterBackupPassword: "Şifreli yedek seçildi. Parolanı girip “Seçilen yedeği aç” düğmesine bas.", passwordMismatch: "Parolalar aynı olmalı ve en az 12 karakter içermeli.", generated: "Kimliğin hazır. Şifreli yedeğini şimdi indir.", restored: "Yedek açıldı. Aynı DID ile devam ediyorsun.", badBackup: "Yedek açılamadı. Parolanı ve dosyanı kontrol et.", backupDownloaded: "Şifreli yedek indirildi. Dosyayı ve parolanı güvenle sakla.", identityActive: "Önce mevcut kimlikten çıkış yap.", invalidRoom: "Oda adı küçük harf, rakam, tire veya alt çizgiyle 1–48 karakter olmalı.", invalidMessage: "Mesaj 1–4096 karakter arasında olmalı.", invalidLink: "Geçerli bir https:// bağlantısı ve kısa açıklama gir.", validSignature: "İmza geçerli. Bu DID belirtilen oda, nonce ve metni imzaladı.", invalidSignature: "İmza doğrulanmadı. Oda, metin, nonce, DID veya imza değiştirilmiş olabilir.", invalidRecord: "Kayıt okunamadı. room, from, nonce, text ve sig alanlarını içeren JSON kullan.", signatureMeaning: "İmza, mesajın doğruluğunu veya hakem yetkisini tek başına kanıtlamaz.", proofRequired: "Geçerli içerik bağlantısı, açıklama ve kayıt numarası gir.", tooLongUrl: "Bu mesaj URL ile gönderim için fazla uzun. Mesajı kısalt.", draftInvalidated: "İçerik değişti. Göndermek için kaydı yeniden imzala.", importedPlain: "DID içe aktarıldı. Orijinal anahtar dosyanı güvenli sakla; bu sekme anahtarın kopyasını tutmaz.", backupBeforeExit: "Şifreli yedeğini henüz indirmedin. Önce yedeği indir, ardından oturumu kapat."
});
Object.assign(i18n.en, {
  community: "Independent Technocore workspace", desk: "Portfolio", rules: "Guide", liveMarket: "Your next move.", newCall: "Make a prediction", reference: "Reference price", owners: "Participants", refereeFeed: "Referee radar", liveBoard: "Leaderboard", tradeTape: "Recent trades", makerCall: "Prediction maker", myDeskTitle: "Your moves, together.", rulesTitle: "Know the game.", makeCallTitle: "Choose your direction.", oneBet: "IT STARTS WITH A PREDICTION", account: "YOUR WORKSPACE", forget: "Sign out", canonicalRules: "Read official rules", noOffers: "No open offers in this direction yet.", noPersonalCalls: "Your first prediction will appear here.", noPersonalTrades: "Your first countersigned trade will appear here.",
  studio: "Identity & tools", marketEyebrow: "ONE IDEA. TWO SIGNATURES.", marketIntro: "Read the market. Pick a direction. Put your signature behind it.", verifiedPrice: "Signed referee price", rangeCaption: "Within ±5% of the reference", interestCaption: "Total referee position", ownersCaption: "Registered contest identities", loading: "Loading the live market…", startTitle: "Your first move is your identity.", startText: "Create or import a DID. Use one identity for predictions and signed contributions.", openStudio: "Open identity studio", studioEyebrow: "YOUR KEY. YOUR SIGNATURE.", studioTitle: "Start with your identity.", studioIntro: "Create, back up, sign. All in this tab.", browserOnly: "Encrypted in your browser", identityVault: "Identity vault", publicIdentity: "YOUR PUBLIC IDENTITY", copyDid: "Copy DID", vaultIntro: "Create once, keep it safe. Your password unlocks the encrypted backup; it never leaves this tab.", password: "Backup password", passwordHint: "At least 12 characters. To restore, enter your existing backup password.", passwordRepeat: "Repeat password (new identity)", generateIdentity: "Create a new DID", unlockBackup: "Unlock selected backup", backupWarning: "Download your backup. Closing this tab erases the key; you need both the file and your password to recover this identity.", downloadBackup: "Download encrypted backup", toolbox: "Signature workshop", messageTool: "Message", contributionTool: "Contribution", verifyTool: "Verify", profileTool: "Profile & room", messageTitle: "Put your name behind your words.", messageIntro: "Introduce yourself in the lobby or prepare a message for any room. Review the signed record before sending.", room: "Room", message: "Message", prepareSigned: "Prepare signed record", contributionTitle: "Leave a trace of your work.", contributionIntro: "Share your published guide, tool or content on Technocore with the same DID.", contributionLink: "Public contribution link", contributionTopic: "What does it explain?", sequence: "Record sequence after sending (seq)", buildProof: "Create sharing text", verifyTitle: "Don't guess. Verify.", verifyIntro: "Check a record’s Ed25519 signature in this browser. No connected identity required.", recordJson: "Signed record JSON", verifySignature: "Verify signature", profileTitle: "Make yourself discoverable.", profileIntro: "Profile notes are public and unsigned. Notes may expire after 7 days without an update.", profileNote: "Profile note", prepareProfile: "Prepare profile link", ownedRoom: "Room to claim", ownedRoomHelp: "Ownership is set on creation. Only your key can write to this room.", prepareClaim: "Prepare ownership signature", readyReview: "Ready. Review before sending.", openAndSend: "Open & send on Technocore", downloadRecord: "Download proof JSON", sendNotice: "Opening the link sends the record to Technocore. Preparing it does not send anything.", independent: "Independent community tool. Not an official FLOP Labs product.",
  connectionFailed: "Live data is unavailable. Displayed data may be out of date; trading is paused until reconnection. Identity tools are still available.", actionsUnavailable: "Actions require current, verified market data and an open contest.", contestClosed: "Closed", enterBackupPassword: "Encrypted backup selected. Enter its password and choose “Unlock selected backup”.", passwordMismatch: "Passwords must match and contain at least 12 characters.", generated: "Identity ready. Download your encrypted backup now.", restored: "Backup restored. You are using the same DID.", badBackup: "Could not unlock this backup. Check the password and file.", backupDownloaded: "Encrypted backup downloaded. Keep the file and password safe.", identityActive: "Sign out of the current identity first.", invalidRoom: "Use 1–48 lowercase letters, digits, hyphens or underscores for the room.", invalidMessage: "Message must contain 1–4096 characters.", invalidLink: "Enter a valid https:// link and a short description.", validSignature: "Signature valid. This DID signed the specified room, nonce and text.", invalidSignature: "Signature invalid. The room, text, nonce, DID or signature may have changed.", invalidRecord: "Could not read the record. Use JSON containing room, from, nonce, text and sig.", signatureMeaning: "A valid signature alone does not prove the message is true or the signer is an official referee.", proofRequired: "Enter a valid contribution link, description and record sequence.", tooLongUrl: "This message is too long for a signed URL. Shorten the message.", draftInvalidated: "Content changed. Sign the record again before sending.", importedPlain: "DID imported. Keep your original key file safe; this tab does not keep an exportable copy.", backupBeforeExit: "Your encrypted backup has not been downloaded. Download it before signing out."
});
let pendingBackup = null;
let encryptedBackup = null;
let backupSaved = true;
let signedRecord = null;

async function connectIdentity(identity) {
  if (state.did) throw new Error(t("identityActive"));
  state.key = identity.key;
  state.did = identity.did;
  state.fingerprint = (await sha256(identity.did)).slice(0, 16);
  encryptedBackup = identity.backup || null;
  backupSaved = !identity.backup;
  pendingBackup = null;
  $("#vaultPassword").value = "";
  $("#vaultConfirm").value = "";
  $("#keyFile").value = "";
  $("#unlockBackup").classList.add("hidden");
  $("#backupNotice").classList.toggle("hidden", !encryptedBackup);
  $("#vaultStatus").classList.remove("error");
  $("#vaultStatus").textContent = t(identity.backup ? "generated" : "importedPlain");
  renderAll();
  showToast(t("keyLoaded"));
}
function clearStudioSession() {
  pendingBackup = null;
  encryptedBackup = null;
  signedRecord = null;
  backupSaved = true;
  $("#backupNotice").classList.add("hidden");
  $("#unlockBackup").classList.add("hidden");
  $("#signedOutput").classList.add("hidden");
  $("#sendSignedLink").removeAttribute("href");
  $("#signedPreview").textContent = "";
  $("#vaultPassword").value = "";
  $("#vaultConfirm").value = "";
  $("#vaultStatus").textContent = "";
}
function downloadJson(value, name) {
  const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = objectUrl; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
function needIdentity() { if (!state.key || !state.did) throw new Error(t("connectFirst")); }
function invalidateSigned() {
  signedRecord = null;
  $("#signedOutput").classList.add("hidden");
  $("#sendSignedLink").removeAttribute("href");
}
function showSigned(record, url, downloadable = true) {
  if (url.length > 15000) throw new Error(t("tooLongUrl"));
  signedRecord = downloadable ? record : null;
  $("#signedPreview").textContent = JSON.stringify(record, null, 2);
  $("#sendSignedLink").href = url;
  $("#downloadRecord").classList.toggle("hidden", !downloadable);
  $("#signedOutput").classList.remove("hidden");
}
async function prepareMessage(room, rawText) {
  needIdentity();
  invalidateSigned();
  if (!/^[a-z0-9][a-z0-9_-]{0,47}$/.test(room)) throw new Error(t("invalidRoom"));
  const text = singleLine(rawText);
  if (!text || [...text].length > 4096) throw new Error(t("invalidMessage"));
  const nonce = nextNonce();
  const sig = await signPayload(`${room}|${nonce}|${text}`);
  const record = { format: "technocore-signed-record-v1", room, from: state.did, nonce, text, sig };
  const url = `https://technocore.chat/r/${room}/say-signed/${state.did}/${sig}/${nonce}/${encodeURIComponent(text)}?format=json`;
  showSigned(record, url);
}
function contribution() {
  const topic = singleLine($("#contributionTopic").value);
  let url;
  try { url = new URL($("#contributionUrl").value.trim()); } catch { throw new Error(t("invalidLink")); }
  if (url.protocol !== "https:" || !url.hostname.includes(".") || url.username || url.password || !topic) throw new Error(t("invalidLink"));
  return { url: url.href, topic };
}
function taskButton(id, action) {
  const button = $(id);
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    try { await action(); }
    catch (error) { showToast(error.message); if (["#generateIdentity", "#unlockBackup"].includes(id)) { $("#vaultStatus").textContent = error.message; $("#vaultStatus").classList.add("error"); } }
    finally { button.disabled = id === "#generateIdentity" ? Boolean(state.did) : false; }
  });
}
taskButton("#generateIdentity", async () => {
  if (state.did) throw new Error(t("identityActive"));
  const password = $("#vaultPassword").value;
  if (password.length < 12 || password !== $("#vaultConfirm").value) throw new Error(t("passwordMismatch"));
  await connectIdentity(await SignalVault.create(password));
});
taskButton("#unlockBackup", async () => {
  if (state.did) throw new Error(t("identityActive"));
  let identity;
  try { identity = await SignalVault.restore(pendingBackup, $("#vaultPassword").value); }
  catch { throw new Error(t("badBackup")); }
  await connectIdentity(identity);
  backupSaved = true;
  if (typeof renderJourney === "function") renderJourney(); // The file being restored is already a backup the user possesses.
  $("#vaultStatus").textContent = t("restored");
});
taskButton("#downloadBackup", async () => {
  if (!encryptedBackup) return;
  downloadJson(encryptedBackup, `signal-deck-${state.fingerprint}.encrypted.json`);
  backupSaved = true;
  $("#vaultStatus").textContent = t("backupDownloaded");
  if (typeof renderJourney === "function") renderJourney();
});
taskButton("#copyDid", async () => { needIdentity(); await navigator.clipboard.writeText(state.did); showToast(t("copyDid")); });
taskButton("#signMessage", () => prepareMessage($("#messageRoom").value.trim(), $("#messageText").value));
taskButton("#signContribution", async () => {
  const { url, topic } = contribution();
  const text = state.language === "tr" ? `Technocore için bir katkı yayınladım: ${url} — ${topic}` : `I published a Technocore contribution: ${url} — ${topic}`;
  await prepareMessage("technocore", text);
});
taskButton("#downloadRecord", () => { if (signedRecord) downloadJson(signedRecord, `signal-deck-proof-${signedRecord.nonce}.json`); });
taskButton("#buildProof", () => {
  needIdentity();
  const { url, topic } = contribution();
  const seq = $("#proofSequence").value.trim();
  if (!/^[1-9]\d{0,18}$/.test(seq)) throw new Error(t("proofRequired"));
  $("#proofText").value = `Technocore · ${topic}\n\n${url}\n\nDID: ${state.did}\n${state.language === "tr" ? "İmzalı kayıt" : "Signed record"}: technocore / seq ${seq}\nhttps://technocore.chat/r/technocore?since=${BigInt(seq)-1n}&format=json`;
  $("#proofText").classList.remove("hidden");
  $("#copyProof").classList.remove("hidden");
});
taskButton("#copyProof", async () => { await navigator.clipboard.writeText($("#proofText").value); showToast(t("copy")); });
taskButton("#verifyRecord", async () => {
  const result = $("#verifyResult");
  result.classList.remove("hidden", "error");
  try {
    const record = SignalVault.readRecord($("#verifyJson").value.trim());
    const valid = await verifyDidSignature(record.did, `${record.room}|${record.nonce}|${record.text}`, record.sig);
    result.classList.toggle("error", !valid);
    result.textContent = `${t(valid ? "validSignature" : "invalidSignature")}\n${record.did}\n${t("signatureMeaning")}`;
  } catch { result.classList.add("error"); result.textContent = t("invalidRecord"); }
});
taskButton("#prepareProfile", async () => {
  needIdentity(); invalidateSigned();
  const text = singleLine($("#profileNote").value);
  if (!text || [...text].length > 8192) throw new Error(t("invalidMessage"));
  const address = `https://technocore.chat/kv/did-${state.fingerprint.slice(0, 2)}/${state.fingerprint.slice(2)}`;
  showSigned({ type: "unsigned-public-profile", did: state.did, note: text, address }, `${address}/set/${encodeURIComponent(text)}`, false);
});
taskButton("#prepareClaim", async () => {
  needIdentity(); invalidateSigned();
  const body = $("#ownedRoom").value.trim().replace(/^d-/, "");
  const room = `d-${body}`;
  if (!body || !/^[a-z0-9][a-z0-9_-]{0,47}$/.test(room)) throw new Error(t("invalidRoom"));
  const nonce = nextNonce();
  const sig = await signPayload(`room-owners|${room}|${nonce}|${state.did}`);
  showSigned({ type: "room-ownership-claim", room, did: state.did, nonce, sig, if_absent: true }, `https://technocore.chat/kv/room-owners/${room}/set-signed/${state.did}/${sig}/${nonce}/${encodeURIComponent(state.did)}?if_absent=1`, false);
});
$$('[data-tool]').forEach(button => button.addEventListener("click", () => {
  $$('[data-tool]').forEach(item => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", String(item === button)); });
  $$('[data-tool-view]').forEach(view => view.classList.toggle("active", view.dataset.toolView === button.dataset.tool));
  invalidateSigned();
}));
["#messageRoom", "#messageText", "#contributionUrl", "#contributionTopic", "#profileNote", "#ownedRoom"].forEach(id => $(id).addEventListener("input", invalidateSigned));
$("#messageText").addEventListener("input", () => { $("#messageCount").textContent = `${[...singleLine($("#messageText").value)].length} / 4096`; });
$("#forgetButton").addEventListener("click", event => { if (!backupSaved) { event.stopImmediatePropagation(); showToast(t("backupBeforeExit")); } }, true);
window.addEventListener("beforeunload", event => { if (!backupSaved) { event.preventDefault(); event.returnValue = ""; } });
function routeView() { const view = location.hash.slice(1) || "rules"; if (["market", "predict", "desk", "rules", "studio", "register", "leaderboard"].includes(view)) showView(view); }
window.addEventListener("hashchange", routeView);
document.addEventListener("keydown", event => {
  const dialog = $("#offerDialog");
  if (dialog.classList.contains("hidden")) return;
  if (event.key === "Escape") { dialog.classList.add("hidden"); state.selectedOffer = null; }
  if (event.key === "Tab") {
    const first = $("#closeDialog"), last = $("#acceptOfferButton");
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
Object.assign(i18n.tr, {
  "globalPriceHelp": "Sonuçlanan işlemlerin hacim ağırlıklı fiyatı",
  "baseFee": "Taraf başına en düşük ücret (%1)",
  "collateral": "Tamamı açılışsa teminat (ücret hariç)",
  "feeFormula": "max(%1 temel ücret, fiyat avantajı)",
  "feePreviewHelp": "Bu yalnızca %1 taban ücrettir. Kesin ücret sweep kapanışında belirlenir: alıcı için max(%1 × fiyat × miktar, (kapanış − fiyat) × miktar); satıcı için max(%1 × fiyat × miktar, (fiyat − kapanış) × miktar). Mevcut pozisyonu kapatan kısım yeni teminat bağlamaz. Bakiye kontrolünü hakem yapar.",
  "invalidPrecision": "Fiyat ve miktar pozitif olmalı, en fazla 2 ondalık basamak içermeli. Miktar en az 0,10 NVDA olmalı; girişler otomatik yuvarlanmaz.",
  "locallyConfirmed": "Yerel onay · hakem teyidi yok",
  "notOpened": "Açılmadı",
  "finalPrice": "Kesinleşen final fiyatı",
  "rule2Text": "İşlem, maker ve taker imzası ister. Kendi anahtarınla iki tarafı da imzalamak protokolde mümkündür; iki ücret ödersin, pozisyon değişmez. Signal Deck bu maliyetli işlemi oluşturmaz, geçmişte gösterir.",
  "rule4Text": "Yalnızca yeni açılan kontratlar giriş fiyatı kadar POLF bağlar. Temel ücret her taraf için %1’dir; sweep kapanışına göre fiyat avantajı daha yüksekse onun yerine bu fark ödenir. Toplanmaz. Pozisyon kapatmadan gelecek tutar, aynı işlemin yeni açılışını finanse edemez.",
  "rule5Text": "Son sweep ve işlem kilidi 4 Ekim 2026 09:00 UTC (Türkiye 12:00). Final, aynı gün 10:00 UTC (Türkiye 13:00) öncesindeki son Hyperliquid xyz:NVDA işleminin fiyatıdır; ortalama veya mum fiyatı değildir.",
  "rule6Text": "Final skoru, kapanıştan sonraki POLF eksi 10.000’dir. En yüksek üç sıra 1.000.000 FLOP paylaşır; eşitlikte paylaşılan sıralar bölüşülür. Mainnet açılışından itibaren 90 gün içinde aynı DID ile ana ağ adresi imzalanarak talep edilir.",
  "ownOffer": "Signal Deck kendi teklifini kabul ettirmez: iki tarafın ücretini ödersin ve pozisyonun değişmez.",
  "waitMint": "Kayıt gönderildi; hakemin mint onayı bekleniyor.",
  "ruleReferee": "Hakem sonraki sweep’te kabul veya geçersizlik kararını yayımlar.",
  "officialTrades": "Hakem sonucu ayrıca beklenen çift imzalı kayıtlar",
  "globalPrice": "Yarışma global fiyatı",
  "offerDuration": "Teklif süresi (üst sınır)"
});
Object.assign(i18n.en, {
  "globalPriceHelp": "Volume-weighted price of settled contest trades",
  "baseFee": "Minimum fee per side (1%)",
  "collateral": "Collateral if all contracts open (excl. fee)",
  "feeFormula": "max(1% base fee, price advantage)",
  "feePreviewHelp": "This is only the 1% fee floor. The final fee is set at the sweep close: buyer max(1% × price × quantity, (close − price) × quantity); seller max(1% × price × quantity, (price − close) × quantity). Closing existing contracts requires no new collateral. The referee checks available funds.",
  "invalidPrecision": "Price and quantity must be positive with at most 2 decimal places. Quantity must be at least 0.10 NVDA. Inputs are never silently rounded.",
  "locallyConfirmed": "Local confirmation · not referee-verified",
  "notOpened": "Not open",
  "finalPrice": "Final settlement price",
  "rule2Text": "A trade needs maker and taker signatures. Signing both sides with the same key is valid under the protocol but pays both fees and changes no position. Signal Deck displays these historical trades but does not create them.",
  "rule4Text": "Only newly opened contracts tie up their entry value in POLF. Each side pays the greater of the 1% base fee and its price advantage at the sweep close, not their sum. Closing proceeds cannot fund new openings in the same trade.",
  "rule5Text": "The final sweep and trading lock are 4 October 2026 at 09:00 UTC. Settlement uses the last Hyperliquid xyz:NVDA trade before 10:00 UTC that day, not a candle or average.",
  "rule6Text": "Final score is POLF after settlement minus 10,000. The highest three places share 1,000,000 FLOP; tied owners share the places they span. Claim by signing a mainnet address with the same owner key within 90 days of mainnet launch.",
  "ownOffer": "Signal Deck blocks self-acceptance: you would pay both fees without changing your position.",
  "waitMint": "Registration posted; waiting for referee mint evidence.",
  "ruleReferee": "The referee reports settlement or a void reason at the next sweep.",
  "officialTrades": "Countersigned records; referee outcome checked separately",
  "globalPrice": "Contest global price",
  "offerDuration": "Offer duration (maximum)"
});
applyLanguage();
routeView();
