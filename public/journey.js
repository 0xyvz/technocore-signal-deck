"use strict";

Object.assign(i18n.tr, {
  studioNav: "Kimlik", registerNav: "Kayıt", leaderboardNav: "Sıralama",
  guideTitle: "İlk imzandan önce,\noyunu tanı.",
  registrationNoKey: "İlk adım kimliğin. Önce DID oluştur veya mevcut kimliğini yükle; ardından buraya dön.",
  registrationNew: "Bağlı DID henüz public kayıtlarda görünmüyor. İlk kez katılıyorsan aşağıdaki düğme ile tek bir kayıt mesajı imzala.",
  registrationWaiting: "Kayıt mesajın gönderildi. Hakemin mint onayı henüz görülmedi; tekrar kayıt gönderme. Akış 15 saniyede bir yenilenir.",
  registrationUnknownText: "Public geçmiş eksik. Daha önce kaydolduysan tekrar kayıt gönderme. Yerel onay, resmî hakem onayı değildir.",
  registrationConfirmedText: "Önceki kayıt beyanın bu tarayıcıda saklandı. Public veride hakem onayı görülmedi; nihai uygunluğu işlem sırasında hakem kontrol eder.",
  registrationReadyText: "Bu DID için hakem imzalı mint veya hesap kaydı bulundu. Piyasaya geçip teklif oluşturabilir veya uygun bir teklifi kabul edebilirsin.",
  studioNeedIdentity: "Kimliğini hazırla; ardından yarışma kaydına geç.",
  studioNeedBackup: "Devam etmeden önce şifreli yedeğini indir.",
  studioNextReady: "Kimliğin hazır. Şimdi aynı DID ile yarışma kaydını kontrol et.",
  rankingVerified: "Hakem imzası doğrulandı", rankingUnverified: "Doğrulanmış sıralama verisi bekleniyor",
  rankingAge: "Kaynak mesajı: {age}. Her sweep’te güncellenir; canlı skorlar final sonucu değildir.",
  rankingStale: "Son alınan veri gösteriliyor. Mesajın yaşı veya bağlantı durumu nedeniyle güncel sıralama olarak değerlendirme.",
  rankingUnknownAge: "Kaynak mesajın zamanı doğrulanamadı. Güncellik bilgisi yok.",
  rankingNoData: "Henüz doğrulanmış bir sıralama kaydı yok.",
  rankingNoMatches: "Yayımlanan üst listede bu DID bulunamadı. Tam katılımcı listesinde arama yapılamaz.",
  rankingConnect: "Kendi DID’ini listede işaretlemek için kimliğini bağla.",
  rankingOutside: "Bağlı DID bu yayımlanan listede görünmüyor. Tam sırası ve skoru bu veriden belirlenemez.",
  rankingMine: "Senin yayımlanan sıran: {rank} · Canlı PnL: {score} POLF",
  rankingYou: "Sen", rankingTie: "Eşit skor", rankingIncomplete: "Kapsam: {count} yayımlanmış DID",
  rankingVerifiedMeaning: "İmza, kaynağın sabitlenmiş hakem DID’i olduğunu doğrular; tüm defteri yeniden hesapladığımız anlamına gelmez.",
  rankingNextRefresh: "Yenile", registrationDetails: "Kayıt durumum",
});
Object.assign(i18n.en, {
  studioNav: "Identity", registerNav: "Register", leaderboardNav: "Leaderboard",
  railLearn: "Learn the system", railIdentity: "Prepare identity", railRegister: "Join the contest", railMarket: "Open the market",
  guideEyebrow: "SIGNAL DECK / GETTING STARTED", guideTitle: "Before your first signature,\nknow the game.",
  guideLead: "Prepare your Technocore identity, register for Close Call, and sign a prediction about NVDA’s price with another participant.",
  guideStart: "01 · Prepare my identity", guideStarting: "Starting balance per DID", guideSweep: "Referee checks every", minutes: "minutes", guidePrize: "Prize pool for the top three places", guideUnitNote: "POLF is contest accounting. FLOP is the prize unit. They are different.",
  guideWhat: "You do not buy NVDA shares here. Close Call is a contest in one futures contract based on NVDA’s price. Signal Deck is an independent interface; the official referee accepts trades and keeps the accounts.",
  guidePathLabel: "START IN FOUR STEPS", guidePathTitle: "Know what comes next.",
  stepIdentityTitle: "Prepare your identity", stepIdentityText: "New here? Create a DID and download its encrypted backup. Already have an identity? Import the same file; do not create a new identity on each visit.", goIdentity: "Open identity studio",
  stepRegisterTitle: "Register once", stepRegisterText: "Creating an identity does not register for the contest. On the registration page, sign the owner message with your DID, then wait for referee mint evidence.", goRegister: "Open registration",
  stepTradeTitle: "Make or accept a prediction", stepTradeText: "Take the opposite side of an open offer or sign your own price and direction. A maker-only signature does not create a position.", goMarket: "Explore the market",
  stepFollowTitle: "Follow the referee result", stepFollowText: "Track pending, settled and void records in your portfolio. The leaderboard only shows the top entries published by the referee.", goDesk: "Open portfolio",
  guideMechanics: "HOW PREDICTIONS WORK", guideTwoSides: "One price, two sides, two signatures.", longExplainer: "The side that benefits when the price rises above entry.", shortExplainer: "The side that benefits when the price falls below entry.",
  guideTradeSteps: "The maker signs the price, quantity, direction, taker and last valid sweep. The taker countersigns the opposite side, and the record is posted to a registered room. It is final only when the referee reports settled; time, price or funds failures produce a void result.",
  exampleLabel: "SIMPLE EXAMPLE · BEFORE FEES", exampleText: "If you open a long of 1 NVDA at 200 and the final price is 210, the price difference is +10 POLF; the short side loses 10 POLF. Fees also reduce the score. This is not a promise of profit.",
  guideCosts: "LIMITS AND COSTS", guideCostTitle: "Check before you sign.", guideLimitTitle: "Price limits", guideLimitText: "The price must be within ±5% of the previous sweep’s reference. The reference is Hyperliquid’s last xyz:NVDA trade; the global price is the volume-weighted price of settled contest trades.",
  guideQtyTitle: "Quantity and collateral", guideQtyText: "Minimum 0.10 NVDA, with 0.01 price and quantity steps. Newly opened contracts tie up their entry value in POLF. There is no leverage. Free cash must cover new collateral and the fee.",
  guideFeeTitle: "Fee: the greater of two amounts", guideFeeText: "Each side pays at least 1% of the trade’s value. If its price advantage at the sweep close is larger, it pays that gap times quantity instead. The two amounts are not added; the final fee is known at the close.",
  guideExpiryTitle: "Expiry and cancellation", guideExpiryText: "An offer can settle through its last valid sweep. There is no official cancellation message for a signed open offer. The first valid countersigned record for a trade ID settles.",
  guideDates: "CLOSE-1 / 2026 TIMELINE", guideDatesTitle: "Know the closing times.", guideOpen: "Opening", guideOpenLocal: "15:00 in Türkiye", guideLock: "Last sweep / trading lock", guideLockLocal: "12:00 in Türkiye", guideFinal: "Final price", guideFinalLocal: "Last trade before 13:00 in Türkiye",
  guideGlossary: "Words you’ll see", defDid: "Your public identity. The private key signs on its behalf.", defPolf: "The contest accounting unit; it is not a token you buy or withdraw in this interface.", defSweep: "The referee’s five-minute round that applies registrations and trades in order.", defStatus: "Outcome not yet observed / accepted by the referee / rejected with a reason.", defScoreTitle: "Live score", defScore: "PnL marked at the contest global price. It is not the final score; the final calculation is POLF after settlement minus 10,000.",
  guideFaq: "Before you continue", faqBackupQ: "What happens when I close the tab?", faqBackupA: "The private key is removed from memory. Restore the same DID using your encrypted backup and password. If you imported a plaintext key, keep the original file. There is no central account-recovery service.",
  faqRegistrationQ: "I registered before but cannot see confirmation.", faqRegistrationA: "The referee may truncate large mint lists. Do not register again. “I registered before” only saves your local declaration; it is not displayed as referee confirmation. The referee decides actual eligibility.",
  faqRankingQ: "Why can’t I see myself on the leaderboard?", faqRankingA: "The public feed currently publishes only its top 25 entries. We cannot determine the rank or score of other DIDs from this data. Absence does not mean an unregistered identity or a zero score.",
  faqPrizeQ: "How are prizes determined?", faqSelfQ: "Can I accept my own offer?", faqToolsQ: "Are identity tools required for the contest?", faqToolsA: "Message, contribution, profile and room tools are optional; Close Call registration does not require them. Opening a prepared send link publishes to Technocore. Preparing it alone does not send it.", guideReadyLabel: "READY FOR YOUR FIRST STEP", guideReadyTitle: "One identity. All your moves.",
  registrationEyebrow: "02 / JOIN THE CONTEST", registrationTitle: "Connect your identity to the contest.", registrationIntro: "Creating a DID and joining Close Call are separate steps. Register once with the same identity.", registrationIdentity: "Identity to register", registrationConnect: "Prepare your identity first", regStageIdentity: "Identity connected", regStageIdentityHelp: "Private key stays in this tab", regStagePost: "Registration message posted", regStageMint: "Referee registration evidence found", regStageMintHelp: "A signed mint or account entry was observed", registrationContinue: "Continue to market", registrationMint: "Starting balance issued once when the referee accepts registration. Creating a DID alone does not issue it.", registrationOnce: "Joining for the first time? Sign a registration message. Signing happens only in this tab.", registrationWait: "Wait for the next sweep. A later timestamp alone does not confirm registration.", registrationRepeat: "Already joined? Do not register again. A local declaration is labelled separately when public history is incomplete.", openFlow: "Read referee flow", registrationDetails: "My registration",
  registrationNoKey: "Your identity comes first. Create or import a DID, then return here.", registrationNew: "The connected DID is not visible in public records. If this is your first registration, sign one owner message below.", registrationWaiting: "Your registration was posted. No referee mint evidence has been seen yet; do not register again. The feed refreshes every 15 seconds.", registrationUnknownText: "Public history is incomplete. Do not register again if you already joined. Local confirmation is not referee evidence.", registrationConfirmedText: "Your previous-registration declaration is saved in this browser. Referee evidence is not visible in the public feed; the referee checks eligibility when processing a trade.", registrationReadyText: "A referee-signed mint or account entry was found for this DID. You can continue to the market to create or accept an offer.",
  studioContinue: "02 · Continue to registration", studioNeedIdentity: "Prepare your identity, then continue to contest registration.", studioNeedBackup: "Download your encrypted backup before continuing.", studioNextReady: "Your identity is ready. Check contest registration using this same DID.",
  rankingSeparate: "Explore the leaderboard", rankingSeparateText: "The referee’s published top entries have their own page.", rankingEyebrow: "TOP ENTRIES PUBLISHED BY THE REFEREE", rankingTitle: "Every signature has a score.", rankingIntro: "Live PnL standings. Not a final prize result.", rankingSource: "Open source room", rankingCoverage: "Published entries", rankingCoverageHint: "Not the complete participant list", rankingMark: "Score valuation price", rankingMarkHint: "Global mark in the PnL message", rankingSweep: "Referee sweep", rankingProof: "Download signed record", rankingTableTitle: "Live standings", rankingRank: "Rank", rankingIdentity: "Participant DID", rankingScore: "Live PnL · POLF", rankingLimitNote: "No rank or score is inferred for DIDs outside this list. Tied scores share a rank number; official final results determine prize sharing.",
  rankingVerified: "Referee signature verified", rankingUnverified: "Waiting for verified standings", rankingAge: "Source message: {age}. Updated each sweep; live scores are not final results.", rankingStale: "Showing the last received data. Its age or connection status means it should not be treated as current standings.", rankingUnknownAge: "The source message timestamp is unavailable. Freshness is unknown.", rankingNoData: "No verified standings record is available yet.", rankingNoMatches: "This DID was not found in the published top list. The full participant list cannot be searched here.", rankingConnect: "Connect your identity to highlight your DID in the list.", rankingOutside: "Your connected DID is not in this published list. Its complete rank and score cannot be determined from this data.", rankingMine: "Your published rank: {rank} · Live PnL: {score} POLF", rankingYou: "You", rankingTie: "Tied score", rankingIncomplete: "Coverage: {count} published DIDs", rankingVerifiedMeaning: "The signature authenticates the pinned referee DID; it does not mean the full ledger was independently recomputed.", rankingNextRefresh: "Refresh"
});

function rankingData() {
  const market = state.snapshot?.market;
  if (!state.snapshot?.launch.verified || !market?.pnlVerified) return [];
  const top = Array.isArray(market.pnl?.top) ? market.pnl.top : [];
  const valid = top.filter(row => Array.isArray(row) && DID_RE.test(row[0]) && /^-?\d{1,20}(?:\.\d{1,12})?$/.test(String(row[1])));
  // Preserve the order published by the referee. Normalize decimal scores only for ties.
  const scoreKey = score => {
    const negative = String(score).startsWith("-");
    const [integer, fraction = ""] = String(score).replace(/^-/, "").split(".");
    return (negative ? -1n : 1n) * BigInt(integer + fraction.padEnd(12, "0"));
  };
  let previous = null, rank = 0;
  return valid.map(([did, score], index) => {
    const key = scoreKey(score);
    if (key !== previous) rank = index + 1;
    previous = key;
    return { did, score, rank, tied: valid.some((row, other) => other !== index && scoreKey(row[1]) === key) };
  });
}
function renderRankingFreshness() {
  const market = state.snapshot?.market;
  const verified = Boolean(state.snapshot?.launch.verified && market?.pnlVerified);
  $("#rankingVerification").textContent = t(verified ? "rankingVerified" : "rankingUnverified");
  const timestamp = Date.parse(market?.pnlTs);
  const age = Date.now() - timestamp;
  const behind = Number(market?.price?.n || 0) - Number(market?.pnl?.n || 0) > 1;
  const stale = state.connectionError || Date.now() - state.lastSuccess > 60000 || age > 720000 || behind;
  $("#rankingFreshness").textContent = !verified ? t("rankingNoData") : !Number.isFinite(timestamp) ? t("rankingUnknownAge") : stale ? t("rankingStale") : t("rankingAge", { age: relativeTime(market.pnlTs) });
  $("#rankingFreshness").closest(".ranking-notice").classList.toggle("stale", stale || !verified || !Number.isFinite(timestamp));
  $("#downloadRankingProof").disabled = !(verified && market?.pnlProof);
}
function renderRanking() {
  const market = state.snapshot?.market;
  const rows = rankingData();
  const query = $("#rankingSearch").value.trim().toLowerCase();
  const visible = rows.filter(row => row.did.toLowerCase().includes(query));
  const verified = Boolean(state.snapshot?.launch.verified && market?.pnlVerified);
  $("#rankingCount").textContent = verified ? String(rows.length) : "—";
  $("#rankingMark").textContent = verified && market.pnl?.mark != null ? `${formatNumber(market.pnl.mark)} POLF` : "—";
  $("#rankingSweep").textContent = verified && Number.isSafeInteger(market.pnl?.n) ? `#${market.pnl.n}` : "—";
  const timestamp = Date.parse(market?.pnlTs);
  $("#rankingTimestamp").textContent = verified && Number.isFinite(timestamp) ? new Date(timestamp).toLocaleString(state.language === "tr" ? "tr-TR" : "en-GB", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }) + " UTC" : "—";
  $("#rankingVisible").textContent = String(visible.length);
  $("#leaderboard").innerHTML = visible.length ? visible.map(({ did, score, rank, tied }) => `<div class="ranking-row ${did === state.did ? "me" : ""}"><span class="rank-number">${rank.toString().padStart(2, "0")}</span><div class="rank-identity"><code>${escapeHtml(did)}</code><div>${did === state.did ? `<span class="ranking-you">${t("rankingYou")}</span>` : ""}${tied ? `<small>${t("rankingTie")}</small>` : ""}</div></div><strong class="${Number(score) >= 0 ? "positive" : "negative"}">${escapeHtml(score)}</strong><button type="button" class="icon-button" data-copy-did="${escapeHtml(did)}" aria-label="${t("copyDid")}"><i data-lucide="copy"></i></button></div>`).join("") : `<div class="empty-state"><i data-lucide="list-filter"></i><span>${t(rows.length ? "rankingNoMatches" : "rankingNoData")}</span></div>`;
  const mine = rows.find(row => row.did === state.did);
  $("#rankingPersonal").textContent = !state.did ? t("rankingConnect") : mine ? t("rankingMine", { rank: mine.rank, score: mine.score }) : t("rankingOutside");
  renderRankingFreshness();
  if (window.lucide) window.lucide.createIcons();
}
function renderJourney() {
  const view = $(".view.active")?.dataset.view;
  $("#journeyRail").classList.toggle("hidden", !["rules", "studio", "register"].includes(view));
  $$("#journeyRail [data-go]").forEach(button => { button.classList.toggle("current", button.dataset.go === view); if (button.dataset.go === view) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current"); });
  $$('[data-view-target]').forEach(button => { if (button.dataset.viewTarget === view) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
  const registration = registrationState();
  const verified = registration === "ready";
  const local = registration === "confirmed";
  const connected = Boolean(state.did);
  const posted = Boolean(latestRegistration()) || localRegistrationProof()?.source === "posted";
  $("#registrationDid").textContent = state.did || t("notConnected");
  const copy = { disconnected: "registrationNoKey", notRegistered: "registrationNew", waiting: "registrationWaiting", unknown: "registrationUnknownText", confirmed: "registrationConfirmedText", ready: "registrationReadyText" };
  $("#registrationNextText").textContent = t(copy[registration]);
  $("#registrationPageBadge").textContent = !connected ? t("connectFirst") : verified ? t("ready") : local ? t("locallyConfirmed") : registration === "waiting" ? t("pending") : registration === "unknown" ? t("registrationUnknown") : t("notRegistered");
  $("#registrationPageBadge").className = `status-badge ${verified ? "live" : "neutral"}`;
  $("#registerIdentityFirst").classList.toggle("hidden", connected);
  $("#regStepIdentity").classList.toggle("done", connected);
  $("#regStepPosted").classList.toggle("done", posted || verified);
  $("#regStepMint").classList.toggle("done", verified);
  $("#registrationContinue").disabled = !(connected && (verified || local));
  $("#studioContinue").disabled = !connected || !backupSaved;
  $("#studioNextHint").textContent = t(!connected ? "studioNeedIdentity" : !backupSaved ? "studioNeedBackup" : "studioNextReady");
}
$("#rankingSearch").addEventListener("input", renderRanking);
$("#leaderboard").addEventListener("click", async event => {
  const button = event.target.closest("[data-copy-did]");
  if (!button) return;
  try { await navigator.clipboard.writeText(button.dataset.copyDid); showToast(t("copyDid")); } catch (error) { showToast(error.message); }
});
$("#downloadRankingProof").addEventListener("click", () => {
  const market = state.snapshot?.market;
  if (state.snapshot?.launch.verified && market?.pnlVerified && market.pnlProof) downloadJson(market.pnlProof, `signal-deck-referee-pnl-${market.pnl.n}.json`);
});
applyLanguage();
renderJourney();
renderRanking();
