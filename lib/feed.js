'use strict';
const { CONTEST, ROOMS, parseJsonLossless, parseRecord } = require('./protocol');
const { verifyOuter, verifyOffer, verifyTrade } = require('./verify');
const { createSeedResolver } = require('./referee');
const rules = require('../public/contest-rules');
const officialNames = ['price', 'flow', 'state', 'positions', 'pnl'];
const officialRooms = officialNames.map(name => ROOMS[name]);
const list = value => Array.isArray(value) ? value : [];
const validMessages = (room, data) => list(data?.messages).filter(m => verifyOuter(room, m));
const entry = (message, room) => ({ room, ...message, record: parseRecord(message.text) });

class ContestFeed {
  constructor(read, authority = CONTEST) {
    this.authority = authority;
    this.read = read;
    this.history = new Map();
    this.archived = false;
    this.inFlight = null;
    this.cached = null;
    this.validUntil = 0;
    this.seed = createSeedResolver({ room: ROOMS.price, refereeDid: this.authority.refereeDid,
      season: this.authority.id, manifestSha256: this.authority.manifestSha256, officialRooms,
      readExport: () => this.read(`/r/${ROOMS.price}/export`),
    });
  }
  async room(name, optional = false) {
    try { return parseJsonLossless(await this.read(`/r/${name}?format=json&limit=200`)); }
    catch (error) { if (optional && error.upstreamStatus === 404) return { messages: [] }; throw error; }
  }
  retain(item) {
    const id = item.record.terms.id;
    if (!this.history.has(id)) this.history.set(id, item);
    while (this.history.size > 5000) this.history.delete(this.history.keys().next().value);
  }
  async archive() {
    if (this.archived) return;
    try {
      const lines = (await this.read(`/r/${ROOMS.trading}/export`)).split('\n');
      for (const line of lines) {
        try {
          const message = parseJsonLossless(line), item = entry(message, ROOMS.trading);
          if (verifyOuter(ROOMS.trading, message) && verifyTrade(message, item.record)) this.retain(item);
        } catch { /* A broken export row does not authenticate any trade. */ }
      }
      this.archived = true;
    } catch { /* Retry history recovery on a later snapshot. */ }
  }
  async snapshot() {
    if (this.cached && Date.now() < this.validUntil) return this.cached;
    if (!this.inFlight) {
      this.inFlight = this.collect().then(data => {
        this.cached = data; this.validUntil = Date.now() + 4000; return data;
      }).finally(() => { this.inFlight = null; });
    }
    return this.inFlight;
  }
  async collect() {
    const names = [...officialRooms, ROOMS.trading, ROOMS.offers];
    const [pages, ownership] = await Promise.all([
      Promise.all(names.map(name => this.room(name, name === ROOMS.offers))),
      Promise.all(officialRooms.map(async room => {
        try {
          const text = await this.read(`/kv/room-owners/${room}`);
          return text.split(/\s+/).includes(this.authority.refereeDid) ? this.authority.refereeDid : '';
        } catch { return ''; }
      })),
      this.archive(),
    ]);
    const rooms = new Map(names.map((name, i) => [name, validMessages(name, pages[i]).map(m => entry(m, name))]));
    const trusted = name => rooms.get(ROOMS[name]).filter(m => m.from === this.authority.refereeDid && m.record);
    const last = name => trusted(name).findLast(m => m.record.t === name) || null;
    const latest = Object.fromEntries(officialNames.map(name => [name, last(name)]));
    const seed = await this.seed(trusted('price'));
    const verified = Boolean(seed && ownership.every(owner => owner === this.authority.refereeDid));
    const final = trusted('price').findLast(m => m.record.t === 'final' && m.record.season === this.authority.id && rules.isDecimal(m.record.price));
    const summary = { mints: new Set(), settled: new Set(), void: new Map(), rooms: new Set([ROOMS.trading]) };
    for (const {record} of trusted('flow')) {
      for (const value of list(record.mints)) if (typeof value === 'string') summary.mints.add(value);
      for (const value of list(record.settled)) summary.settled.add(String(Array.isArray(value) ? value[0] : value));
      for (const value of list(record.void)) {
        const [id, why] = Array.isArray(value) ? value : typeof value === 'object' && value ? [value.id, value.reason] : [value, 'void'];
        summary.void.set(String(id), String(why || 'void'));
      }
      for (const value of list(record.rooms)) summary.rooms.add(Array.isArray(value) ? value[0] : value?.room || value?.name || value);
    }
    const registrations = [], offers = new Map();
    for (const name of [ROOMS.trading, ROOMS.offers]) {
      for (const item of rooms.get(name)) {
        const r = item.record;
        if (name === ROOMS.trading && r?.t === 'owner' && r.season === this.authority.id && r.key === item.from) registrations.push({ did: item.from, seq: item.seq, ts: item.ts });
        if (verifyOffer(item, r)) offers.set(r.terms.id, item);
        if (verifyTrade(item, r)) this.retain(item);
      }
    }
    const price = latest.price?.record || seed?.record || null;
    let limits = price?.limits;
    if (!Array.isArray(limits) || limits.length !== 2) {
      try { limits = rules.priceLimits(price?.ref?.px || price?.price); } catch { limits = []; }
    }
    const trades = Array.from(this.history.values()).slice(-150).reverse().map(item => {
      const id = item.record.terms.id;
      return { ...item, status: summary.settled.has(id) ? 'settled' : summary.void.has(id) ? 'void' : 'pending', reason: summary.void.get(id) || '' };
    });
    const active = Array.from(offers.values()).filter(({record:r}) => !this.history.has(r.terms.id) && r.terms.until >= rules.nextSweep(price) && rules.withinLimits(r.terms.px, limits));
    const pnl = latest.pnl;
    return {
      generatedAt: new Date().toISOString(),
      launch: { verified, refereeDid: this.authority.refereeDid, manifestSha256: this.authority.manifestSha256,
        roomOwners: Object.fromEntries(officialRooms.map((room, i) => [room, ownership[i]])), seed },
      market: {
        ...Object.fromEntries(officialNames.flatMap(name => [[name, latest[name]?.record || null], [`${name}Ts`, latest[name]?.ts || null]])),
        price: price ? { ...price, limits } : null, priceTs: latest.price?.ts || seed?.ts || null,
        final: final?.record || null, finalTs: final?.ts || null, pnlVerified: Boolean(pnl),
        pnlProof: pnl ? Object.fromEntries(['room', 'from', 'nonce', 'text', 'sig', 'seq', 'ts'].map(k => [k, k === 'nonce' ? String(pnl[k]) : pnl[k]])) : null,
      },
      registrations, minted: [...summary.mints], offers: active.slice(-150).reverse(), trades,
      visibility: { offerRoom: ROOMS.offers, offerRoomRegistered: summary.rooms.has(ROOMS.offers),
        registrationIncomplete: Number(trusted('flow')[0]?.record.n || 0) > 1 || trusted('flow').some(m => Number(m.record.omitted?.mints || 0) > 0),
        omittedMints: Number(latest.flow?.record.omitted?.mints || 0) },
    };
  }
}
module.exports = { ContestFeed };
