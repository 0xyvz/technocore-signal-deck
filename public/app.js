/* Signal Deck application controller — Copyright (c) 2026 0xyvz, MIT. */
'use strict';
const $ = query => document.querySelector(query);
const $$ = query => Array.from(document.querySelectorAll(query));
const CONTEST = { ...SignalContest.config, room:'close1', offerRoom:'close1-offers' };
const DID_RE = SignalWire.didPattern, SIG_RE = SignalWire.signaturePattern;
const preferences = {
  read(key, fallback = null) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  write(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
};
const state = {language:localStorage.getItem('signal-deck-language') === 'en' ? 'en' : 'tr',
  did:'', key:null, fingerprint:'', snapshot:null, lastSuccess:0, connectionError:false,
  side:'buy', offerFilter:'all', selectedOffer:null, refreshing:false, registering:false};
const i18n = {tr:{}, en:{}};
for (const node of $$('[data-i18n]')) i18n.tr[node.dataset.i18n] = node.textContent.trim();
const t = (key, vars = {}) => (i18n[state.language][key] ?? i18n.tr[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => vars[name] ?? match);
const compact = JSON.stringify;
const parseRecord = SignalWire.object;
const makeTerms = SignalWire.terms;
const makerPayload = input => SignalWire.payload(input);
const takerPayload = SignalWire.payload;
const singleLine = value => String(value).replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Zl}\p{Zp}]/gu, ' ').trim();
const shortDid = value => value ? value.substring(0, 14) + '…' + value.substring(value.length - 8) : '—';
const formatNumber = (value, decimals = 2) => new Intl.NumberFormat(state.language === 'tr' ? 'tr-TR' : 'en-US', {minimumFractionDigits:decimals, maximumFractionDigits:decimals}).format(Number(value));
function escapeHtml(value) { const node = document.createElement('span'); node.textContent = String(value); return node.innerHTML.replaceAll('"','&quot;').replaceAll("'",'&#39;'); }
const bytesToBase64url = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const base64urlToBytes = text => Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')), c => c.charCodeAt(0));
async function sha256(text) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), byte => byte.toString(16).padStart(2,'0')).join(''); }
function nextNonce() {
  const name = `close-call-nonce:${state.fingerprint}`;
  let old; try { old = BigInt(localStorage.getItem(name) || '0'); } catch { old = 0n; }
  const time = BigInt(Date.now()) * 1000000n;
  const next = (time > old ? time : old + 1n).toString();
  localStorage.setItem(name, next); return next;
}
async function signPayload(value) {
  if (!state.key) throw Error(t('connectFirst'));
  return bytesToBase64url(new Uint8Array(await crypto.subtle.sign('Ed25519', state.key, new TextEncoder().encode(value))));
}
async function verifyDidSignature(did, value, signature) {
  try {
    SignalWire.checkedSignature(signature);
    const key = await crypto.subtle.importKey('raw', SignalWire.publicBytes(did), 'Ed25519', false, ['verify']);
    return await crypto.subtle.verify('Ed25519', key, base64urlToBytes(signature), new TextEncoder().encode(value));
  } catch { return false; }
}
async function verifyOfferRecord(record) {
  try { return record.t === 'close-call.offer.v1' && record.season === CONTEST.id && await verifyDidSignature(record.terms.maker, makerPayload(record.terms), record.maker_sig); }
  catch { return false; }
}
async function api(url, options) {
  const reply = await fetch(url, {...options, signal:AbortSignal.timeout(20000)});
  let body; try { body = await reply.json(); } catch { throw Error(t('connectionFailed')); }
  if (!reply.ok || !body.ok) throw Error(body.error || t('connectionFailed'));
  return body.data ?? body;
}
async function postRecord(record, room = CONTEST.room) {
  const text = singleLine(compact(record)), nonce = nextNonce();
  const sig = await signPayload([room,nonce,text].join('|'));
  return api('/api/post', {method:'POST', headers:{'Content-Type':'application/json'}, body:compact({room, text, nonce, sig, did:state.did})});
}
async function importKeyFile(file) {
  if (file.size > 65536) throw Error(t('invalidKey'));
  if (state.did) throw Error(t('identityActive'));
  const value = JSON.parse(await file.text());
  if (value.format !== 'technocore-did-backup-v1') return connectIdentity(await SignalVault.load(value));
  pendingBackup = value; showView('studio');
  $('#unlockBackup').classList.remove('hidden');
  $('#vaultStatus').textContent = t('enterBackupPassword'); $('#vaultPassword').focus();
}
function forgetKey() {
  state.key = null; state.did = ''; state.fingerprint = ''; state.selectedOffer = null;
  $('#keyFile').value = ''; $('#offerDialog').classList.add('hidden');
  clearStudioSession(); renderAll(); showToast(t('keyForgotten'));
}
const storageName = type => `close-call-${type}:${state.did}`;
const localRegistrationProof = () => state.did ? preferences.read(storageName('registration')) : null;
function saveRegistrationProof(source) { preferences.write(storageName('registration'), {source, ts:new Date().toISOString()}); }
function latestRegistration() { return state.snapshot?.registrations?.findLast(row => row.did === state.did) || null; }
function registrationState() {
  const data = state.snapshot;
  if (!state.did || !data) return 'disconnected';
  const account = [data.market.positions?.top, data.market.pnl?.top].some(rows => rows?.some(row => row[0] === state.did));
  if (account || data.minted?.includes(state.did)) return 'ready';
  const proof = localRegistrationProof();
  if (proof?.source === 'confirmed') return 'confirmed';
  const posted = latestRegistration()?.ts || (proof?.source === 'posted' ? proof.ts : '');
  if (posted && !(data.visibility?.registrationIncomplete && Date.parse(data.market.flowTs) > Date.parse(posted))) return 'waiting';
  return data.visibility?.registrationIncomplete ? 'unknown' : 'notRegistered';
}
const registrationReady = () => ['confirmed','ready'].includes(registrationState());
const tradeRoomReady = () => state.snapshot?.visibility?.offerRoomRegistered === true;
const currentSweep = () => SignalContest.nextSweep(state.snapshot?.market.price);
const marketPrice = () => Number(state.snapshot?.market.price?.ref?.px || state.snapshot?.market.price?.price || 0);
function marketLimits() {
  const price = state.snapshot?.market.price;
  if (price?.limits?.length === 2) return price.limits;
  try { return SignalContest.priceLimits(price?.ref?.px || price?.price); } catch { return []; }
}
const actionsReady = () => Boolean(state.snapshot?.launch?.verified && !state.snapshot?.market.final && !state.connectionError && Date.now() - state.lastSuccess < 60000 && SignalContest.tradingOpen());
function requireLiveActions() { if (!actionsReady()) throw Error(t('actionsUnavailable')); }
function localTrades() {
  const stored = state.did ? preferences.read(storageName('trades'), []) : [];
  return (Array.isArray(stored) ? stored : []).flatMap(item => {
    try {
      const record = item.record; makeTerms(record.terms);
      SignalWire.checkedDid(record.taker); SignalWire.checkedSignature(record.maker_sig); SignalWire.checkedSignature(record.taker_sig);
      if (record.t !== 'trade' || record.season !== CONTEST.id || ![record.terms.maker,record.taker].includes(state.did)) return [];
      return [{record, ts:item.ts, status:'pending', reason:''}];
    } catch { return []; }
  });
}
function saveLocalTrade(record) {
  const items = localTrades().filter(item => item.record.terms.id !== record.terms.id);
  preferences.write(storageName('trades'), [...items, {record, ts:new Date().toISOString()}].slice(-100));
}
function personalTrades() {
  const merged = new Map(localTrades().map(row => [row.record.terms.id,row]));
  for (const row of state.snapshot?.trades || []) if ([row.record.terms.maker,row.record.taker].includes(state.did)) merged.set(row.record.terms.id,row);
  return [...merged.values()].reverse();
}
const acceptedTradeIds = () => new Set(personalTrades().map(row => row.record.terms.id));
function relativeTime(iso) {
  const age = Math.max(0, Math.floor((Date.now() - Date.parse(iso))/1000));
  if (!Number.isFinite(age)) return '—';
  return age < 5 ? t('updatedNow') : age < 60 ? t('secondsAgo',{n:age}) : t('minutesAgo',{n:Math.floor(age/60)});
}
function offerDirection(record, opposite = false) { return (record.terms.side === 'buy') !== opposite ? 'long' : 'short'; }
function textAt(id, value) { const target = document.getElementById(id); if (target) target.textContent = value ?? '—'; }
function element(tag, text, classes) {
  const el = document.createElement(tag); if (text !== undefined) el.textContent = text;
  if (classes) el.className = classes; return el;
}
function emptyList(target, key) { target.replaceChildren(element('div',t(key),'empty-state')); }
function badge(id, text, enabled) { const el = document.getElementById(id); el.textContent = text; el.className = 'status-badge ' + (enabled ? 'live' : 'neutral'); }
function refreshIcons() { window.lucide?.createIcons(); }
function renderLaunch() {
  const trusted = Boolean(state.snapshot?.launch?.verified && !state.connectionError);
  badge('launchBadge',t(trusted ? 'launchLive' : 'launchInvalid'),trusted);
  $('#launchWarning').classList.toggle('hidden',trusted);
}
function renderIdentity() {
  for (const id of ['identityDid','predictSignerDid']) textAt(id,state.did || '-');
  for (const id of ['identityName','predictSignerName']) textAt(id,state.did ? `DID ${state.fingerprint}` : t('notConnected'));
  $('#identityDot').classList.toggle('connected',Boolean(state.did));
  $('#forgetButton').classList.toggle('hidden',!state.did);
  $('#copyDid').disabled = !state.did; $('#generateIdentity').disabled = Boolean(state.did);
}
function renderMetrics() {
  const m = state.snapshot?.market || {}, p = m.price || {}, bounds = marketLimits();
  const reference = m.final?.price || p.ref?.px || p.price || p.applied;
  const count = key => Array.isArray(m.flow?.[key]) ? m.flow[key].length + Number(m.flow.omitted?.[key] || 0) : '—';
  const values = {
    priceKind:t(m.final ? 'finalPrice' : 'reference'), referenceUnit:m.final ? 'POLF' : 'USD',
    referencePrice:reference ? (m.final ? '' : '$') + formatNumber(reference) : '—',
    priceAge:relativeTime(m.finalTs || p.ref?.time || m.priceTs), sweepNumber:p.n ?? (m.price ? currentSweep()-1 : '—'),
    priceLimits:bounds.join(' – ') || '—', nextLimits:bounds.join(' — ') || '—',
    globalPrice:p.global == null ? '—' : formatNumber(p.global) + ' POLF', openInterest:formatNumber(m.positions?.open || 0) + ' NVDA',
    ownerCount:m.state?.owners ?? state.snapshot?.registrations?.length ?? '—', longAccounts:m.positions?.longs, shortAccounts:m.positions?.shorts,
    settledLast:count('settled'), voidLast:count('void'), lastUpdated:relativeTime(state.snapshot?.generatedAt),
    rangeLow:bounds[0], rangeCurrent:reference, rangeHigh:bounds[1], priceHelp:bounds.length ? t('priceRangeHint',{low:bounds[0],high:bounds[1]}) : '—',
  };
  Object.entries(values).forEach(([id,value]) => textAt(id,value));
  if (reference && !$('#offerPrice').dataset.touched) $('#offerPrice').value = Number(reference).toFixed(2);
}
function renderOffers() {
  const accepted = acceptedTradeIds();
  const rows = (state.snapshot?.offers || []).filter(row => !accepted.has(row.record.terms.id) && (state.offerFilter === 'all' || offerDirection(row.record) === state.offerFilter));
  const target = $('#offerList'); target.replaceChildren(); textAt('offerSummary',rows.length);
  if (!rows.length) return emptyList(target,'noOffers');
  for (const {record:r} of rows) {
    const dir = offerDirection(r), item = element('div',undefined,'offer-row market-columns');
    const maker = element('div',undefined,'call-cell'), chip = element('span',dir === 'long' ? '↗' : '↘',`direction-chip ${dir}`), detail = element('div');
    const did = element('code',shortDid(r.terms.maker)); did.title = r.terms.maker;
    detail.append(element('strong',dir.toUpperCase()),did); maker.append(chip,detail);
    const take = element('button',t(dir === 'long' ? 'takeShort' : 'takeLong'),'take-button');
    take.type = 'button'; take.dataset.take = r.terms.id;
    take.disabled = !state.did || !actionsReady() || !registrationReady() || r.terms.maker === state.did || !['any',state.did].includes(r.terms.taker);
    item.append(maker,element('strong',r.terms.px),element('span',r.terms.qty),element('span',`#${r.terms.until}`),take); target.append(item);
  }
}
function tradeRow(row, tape = false) {
  const result = element('div',undefined,tape ? 'tape-row' : 'desk-row');
  if (tape) result.append(element('span',offerDirection(row.record).toUpperCase(),`tape-side ${offerDirection(row.record)}`));
  const details = element('div',undefined,tape ? 'tape-data' : '');
  details.append(element('strong',`${row.record.terms.qty} @ ${row.record.terms.px}`),element('code',row.record.terms.id + (row.reason ? ` · ${row.reason}` : '')));
  const status = ['pending','settled','void'].includes(row.status) ? row.status : 'pending';
  result.append(details,element('span',t(status),`trade-status ${status}`)); return result;
}
function renderTape() { $('#tradeTape').replaceChildren(...(state.snapshot?.trades || []).slice(0,12).map(row => tradeRow(row,true))); }
function renderDesk() {
  const done = acceptedTradeIds(), target = $('#myOffers'); target.replaceChildren();
  const mine = (state.snapshot?.offers || []).filter(row => row.record.terms.maker === state.did && !done.has(row.record.terms.id));
  for (const {record:r} of mine) {
    const row = element('div',undefined,'desk-row'), details = element('div');
    details.append(element('strong',`${offerDirection(r).toUpperCase()} · ${r.terms.qty} @ ${r.terms.px}`),element('code',t('sweepExpiry',{n:r.terms.until})));
    const copy = element('button',t('copy'),'secondary'); copy.type = 'button'; copy.dataset.copy = r.terms.id;
    row.append(details,copy); target.append(row);
  }
  if (!mine.length) emptyList(target,'noPersonalCalls');
  const trades = personalTrades(); $('#myTrades').replaceChildren(...trades.map(row => tradeRow(row)));
  if (!trades.length) emptyList($('#myTrades'),'noPersonalTrades');
  for (const [id,kind] of [['myPosition','positions'],['myScore','pnl']]) {
    const value = state.snapshot?.market[kind]?.top?.find(row => row[0] === state.did)?.[1];
    textAt(id,!state.did ? '—' : value ?? t('publicTopOnly'));
  }
}
function renderEligibility() {
  const status = registrationState(), enabled = Boolean(state.did && registrationReady() && actionsReady());
  const statusKey = {ready:'ready',confirmed:'locallyConfirmed',waiting:'posted',unknown:'registrationUnknown',notRegistered:'notRegistered',disconnected:'notRegistered'}[status];
  let hint = !state.did ? 'connectFirst' : !actionsReady() ? 'actionsLocked' : status === 'notRegistered' ? 'registerFirst' : status === 'waiting' ? 'waitMint' : statusKey;
  if (!SignalContest.tradingOpen()) hint = Date.now() < Date.parse(CONTEST.opening) ? 'notOpened' : 'contestClosed';
  badge('eligibilityBadge',t(hint),enabled); badge('predictSignerBadge',t(hint),enabled);
  textAt('registrationStatus',t(statusKey)); $('#publishOfferButton').disabled = !enabled || Boolean(state.publishing);
  const eligible = ['unknown','notRegistered'].includes(status);
  $('#registerButton').disabled = !state.did || !actionsReady() || !eligible || state.registering;
  $('#registerButton').classList.toggle('hidden',!eligible);
  for (const id of ['confirmRegisteredButton','registrationNotice']) document.getElementById(id).classList.toggle('hidden',status !== 'unknown');
}
function renderOrderPreview() {
  const px = $('#offerPrice').value, qty = $('#offerQty').value, notional = Number(px)*Number(qty);
  textAt('collateralPreview',notional > 0 ? formatNumber(notional) + ' POLF' : '—');
  let fee = '—'; try { fee = formatNumber(SignalContest.baseFee(px,qty),6) + ' POLF'; } catch {}
  textAt('feePreview',fee); textAt('sidePreview',state.side === 'buy' ? 'LONG' : 'SHORT');
  $('#sidePreview').className = state.side === 'buy' ? 'positive' : 'negative';
  textAt('expiryHelp',t('expiresAtSweep',{n:SignalContest.expirySweep(state.snapshot?.market.price,Number($('#offerDuration').value || 6))}));
  const limits = marketLimits(), width = Number(limits[1])-Number(limits[0]);
  $('#rangeMarker').style.left = `${width > 0 ? Math.max(0,Math.min(100,(Number(px)-Number(limits[0]))/width*100)) : 50}%`;
}
function renderAll() {
  renderIdentity(); renderLaunch(); renderMetrics(); renderOffers(); renderTape(); renderDesk(); renderEligibility(); renderOrderPreview();
  if (typeof renderJourney === 'function') renderJourney();
  if (typeof renderRanking === 'function') renderRanking();
  refreshIcons();
}
function applyLanguage() {
  document.documentElement.lang = state.language;
  for (const node of $$('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const button of $$('[data-language]')) button.classList.toggle('active',button.dataset.language === state.language);
  renderAll();
}
async function refreshSnapshot(notify = false) {
  if (state.refreshing) return;
  state.refreshing = true;
  $('#refreshButton').setAttribute('aria-busy','true');
  try {
    const snapshot = await api('/api/snapshot');
    state.snapshot = snapshot; state.lastSuccess = Date.now(); state.connectionError = false;
    $('#connectionError').classList.add('hidden');
    if (notify) showToast(t('refreshed'));
  } catch {
    state.connectionError = true; textAt('connectionError',t('connectionFailed'));
    $('#connectionError').classList.remove('hidden');
    if (notify) showToast(t('connectionFailed'));
  } finally {
    state.refreshing = false; $('#refreshButton').removeAttribute('aria-busy'); renderAll();
  }
}
async function registerOwner() {
  requireLiveActions();
  if (!state.did) throw Error(t('connectFirst'));
  if (state.registering || !['unknown','notRegistered'].includes(registrationState())) return;
  state.registering = true; renderEligibility();
  const did = state.did;
  try {
    await postRecord({t:'owner',season:CONTEST.id,key:did});
    if (state.did === did) saveRegistrationProof('posted');
    await refreshSnapshot(); showToast(t('registrationPosted'));
  } finally { state.registering = false; renderAll(); }
}
function confirmPreviousRegistration() {
  if (!state.did) throw Error(t('connectFirst'));
  saveRegistrationProof('confirmed'); renderAll(); showToast(t('registrationConfirmed'));
}
const requestTradeRoomRegistration = () => postRecord({t:'room',season:CONTEST.id,room:CONTEST.offerRoom});
async function publishOffer() {
  if (state.publishing) return;
  requireLiveActions(); if (!registrationReady()) throw Error(t('registerFirst'));
  const terms = makeTerms({id:crypto.randomUUID(), maker:state.did, px:$('#offerPrice').value.trim(), qty:$('#offerQty').value.trim(), side:state.side,
    taker:$('#takerMode').value === 'specific' ? $('#specificTaker').value.trim() : 'any', until:SignalContest.expirySweep(state.snapshot.market.price,Number($('#offerDuration').value))});
  if (!SignalContest.withinLimits(terms.px,marketLimits())) throw Error(t('outsideLimits'));
  state.publishing = true; renderEligibility();
  try {
    const signature = await signPayload(makerPayload(terms)), pending = !tradeRoomReady();
    if (pending) await requestTradeRoomRegistration();
    if (state.did !== terms.maker) throw Error(t('connectFirst'));
    requireLiveActions();
    await postRecord({t:'close-call.offer.v1',season:CONTEST.id,terms,maker_sig:signature},CONTEST.offerRoom);
    await refreshSnapshot(); showView('market'); showToast(t(pending ? 'offerPostedRoomPending' : 'offerPosted'));
  } finally { state.publishing = false; renderEligibility(); }
}
function checkAcceptance(record) {
  requireLiveActions();
  if (!state.did) throw Error(t('connectFirst'));
  if (!registrationReady()) throw Error(t('registerFirst'));
  const terms = makeTerms(record?.terms);
  if (terms.maker === state.did) throw Error(t('ownOffer'));
  if (!['any',state.did].includes(terms.taker)) throw Error(t('reservedOffer'));
  if (terms.until < currentSweep()) throw Error(t('expiredOffer'));
  if (acceptedTradeIds().has(terms.id)) throw Error(t('tradePosted'));
  if (!SignalContest.withinLimits(terms.px,marketLimits())) throw Error(t('outsideLimits'));
  return terms;
}
async function openOfferDialog(value) {
  const record = value.record || value;
  checkAcceptance(record);
  if (!await verifyOfferRecord(record)) throw Error(t('invalidOffer'));
  checkAcceptance(record); state.selectedOffer = record;
  const rows = [['makerCall',offerDirection(record).toUpperCase()],['makerSide',offerDirection(record,true).toUpperCase()],['price',record.terms.px+' POLF'],['quantity',record.terms.qty+' NVDA'],['signingDid',shortDid(record.terms.maker)],['expires','#'+record.terms.until]];
  $('#dialogOffer').replaceChildren(...rows.map(([label,value]) => { const row = element('div'); row.append(element('span',t(label)),element('strong',value)); return row; }));
  $('#offerDialog').classList.remove('hidden'); $('#closeDialog').focus();
}
async function acceptSelectedOffer() {
  if (state.accepting) return;
  const record = state.selectedOffer, terms = checkAcceptance(record), taker = state.did;
  state.accepting = true; $('#acceptOfferButton').disabled = true;
  try {
    if (!await verifyOfferRecord(record)) throw Error(t('invalidOffer'));
    if (!tradeRoomReady()) { await requestTradeRoomRegistration(); await refreshSnapshot(); throw Error(t('tradeRoomWaiting')); }
    if (state.did !== taker) throw Error(t('connectFirst'));
    checkAcceptance(record);
    const signature = await signPayload(takerPayload(terms,taker));
    if (state.did !== taker) throw Error(t('connectFirst'));
    const trade = {t:'trade',season:CONTEST.id,terms,taker,maker_sig:record.maker_sig,taker_sig:signature};
    await postRecord(trade,CONTEST.offerRoom);
    if (state.did === taker) saveLocalTrade(trade);
    closeOfferDialog(); await refreshSnapshot(); showToast(t('tradePosted'));
  } finally { state.accepting = false; $('#acceptOfferButton').disabled = false; }
}
function closeOfferDialog() { $('#offerDialog').classList.add('hidden'); state.selectedOffer = null; }
async function copyOffer(id) {
  const record = state.snapshot?.offers.find(row => row.record.terms.id === id)?.record;
  if (record) { await navigator.clipboard.writeText(compact(record)); showToast(t('copied')); }
}
function showView(name) {
  if (!$$('.view').some(view => view.dataset.view === name)) name = 'rules';
  for (const view of $$('.view')) view.classList.toggle('active',view.dataset.view === name);
  for (const link of $$('[data-view-target]')) link.classList.toggle('active',link.dataset.viewTarget === name);
  $('.sidebar').classList.remove('open'); $('#mobileMenu').setAttribute('aria-expanded','false');
  history.replaceState({},'',`#${name}`);
  if (typeof renderJourney === 'function') renderJourney();
  window.scrollTo(0,0);
}
let toastTimer;
function showToast(message) {
  textAt('toast',message); $('#toast').classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'),3600);
}
function updateCountdown() {
  const now = Date.now(), opening = Date.parse(CONTEST.opening), interval = CONTEST.sweepSeconds*1000;
  const seconds = Math.ceil((interval - ((now-opening)%interval))/1000);
  textAt('sweepCountdown',!SignalContest.tradingOpen() ? t(now < opening ? 'notOpened' : 'contestClosed') : [Math.floor(seconds/60),seconds%60].map(v => String(v).padStart(2,'0')).join(':'));
  renderEligibility();
  if (typeof renderRankingFreshness === 'function') renderRankingFreshness();
  if (state.snapshot) { textAt('lastUpdated',relativeTime(state.snapshot.generatedAt)); textAt('priceAge',relativeTime(state.snapshot.market.finalTs || state.snapshot.market.price?.ref?.time || state.snapshot.market.priceTs)); }
}
// One delegated listener also handles rows created after refresh.
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  const task = async () => {
    const data = button.dataset;
    if (data.viewTarget || data.go) return showView(data.viewTarget || data.go);
    if (data.language) { state.language = data.language; localStorage.setItem('signal-deck-language',state.language); return applyLanguage(); }
    if (data.side) { state.side = data.side; $$('[data-side]').forEach(el => el.classList.toggle('active',el === button)); return renderOrderPreview(); }
    if (data.offerFilter) { state.offerFilter = data.offerFilter; $$('[data-offer-filter]').forEach(el => el.classList.toggle('active',el === button)); return renderOffers(); }
    if (data.take) { const row = state.snapshot?.offers.find(row => row.record.terms.id === data.take); if (row) return openOfferDialog(row); }
    if (data.copy) return copyOffer(data.copy);
    const actions = {
      mobileMenu:() => $('#mobileMenu').setAttribute('aria-expanded',String($('.sidebar').classList.toggle('open'))),
      refreshButton:() => refreshSnapshot(true), forgetButton:forgetKey, registerButton:registerOwner,
      confirmRegisteredButton:confirmPreviousRegistration, publishOfferButton:publishOffer,
      closeDialog:closeOfferDialog, acceptOfferButton:acceptSelectedOffer,
      reviewOfferButton:() => { const record = parseRecord($('#offerPaste').value); if (!record) throw Error(t('invalidOffer')); return openOfferDialog(record); },
    };
    return actions[button.id]?.();
  };
  task().catch(error => showToast(error.message));
});
document.addEventListener('input', event => {
  if (['offerPrice','offerQty','offerDuration'].includes(event.target.id)) {
    if (event.target.id === 'offerPrice') event.target.dataset.touched = 'true'; renderOrderPreview();
  }
});
document.addEventListener('change', event => {
  if (event.target.id === 'keyFile' && event.target.files[0]) importKeyFile(event.target.files[0]).catch(error => showToast(error.message));
  if (event.target.id === 'takerMode') $('#specificTakerField').classList.toggle('hidden',event.target.value !== 'specific');
});
$('#offerDialog').addEventListener('click',event => { if (event.target.id === 'offerDialog') closeOfferDialog(); });
document.addEventListener('keydown',event => { if (event.key === 'Escape') closeOfferDialog(); });
$('#iconLibrary').addEventListener('load',refreshIcons,{once:true});
// The icon download and the upstream network cannot block event binding.
refreshSnapshot(); setInterval(() => refreshSnapshot(),15000); setInterval(updateCountdown,1000);
