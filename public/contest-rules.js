"use strict";
// Factual Close-1 settings verified against the official contest.json at 66c1da3.
// Shared by the browser and server so timing, tick sizes and fee arithmetic agree.
(function (root) {
  const config = Object.freeze({
    id: "close-1", rulesVersion: "0.1-draft", market: "xyz:NVDA",
    opening: "2026-09-25T12:00:00Z", lock: "2026-10-04T09:00:00Z",
    finalPriceTime: "2026-10-04T10:00:00Z", sweepSeconds: 300, lockSweep: 2556,
    mint: "10000", minQty: 0.1, limitWindow: "0.05", feeRate: "0.01",
    prizePool: 1000000, prizePlaces: 3, claimWindowDays: 90,
  });
  function isDecimal(value) { return typeof value === "string" && /^[0-9]{1,7}(?:\.[0-9]{1,2})?$/.test(value) && Number(value) > 0; }
  function cents(value) {
    if (!isDecimal(value)) throw new Error("Expected a positive decimal string with at most two decimal places.");
    const [integer, fraction = ""] = value.split(".");
    return BigInt(integer) * 100n + BigInt(fraction.padEnd(2, "0"));
  }
  function scaled(value, digits) {
    const text = value.toString().padStart(digits + 1, "0");
    return `${text.slice(0, -digits)}.${text.slice(-digits)}`;
  }
  function priceLimits(reference) {
    const ref = cents(reference);
    // The inclusive +/-5% interval is rounded inward to the allowed 0.01 tick.
    return [scaled((ref * 95n + 99n) / 100n, 2), scaled(ref * 105n / 100n, 2)];
  }
  function withinLimits(price, limits) {
    try { const value = cents(price); return Array.isArray(limits) && limits.length === 2 && value >= cents(limits[0]) && value <= cents(limits[1]); }
    catch { return false; }
  }
  function nextSweep(price) {
    if (Number.isSafeInteger(price?.for) && price.for > 0) return price.for;
    if (Number.isSafeInteger(price?.n) && price.n >= 0) return price.n + 1;
    return 1;
  }
  function expirySweep(price, duration) {
    if (!Number.isSafeInteger(duration) || duration < 1) throw new Error("Invalid sweep duration.");
    return Math.min(config.lockSweep, nextSweep(price) + duration - 1);
  }
  function tradingOpen(now = Date.now()) { return now >= Date.parse(config.opening) && now < Date.parse(config.lock); }
  function baseFee(price, quantity) { return scaled(cents(price) * cents(quantity), 6); }
  function sideFees(side, price, quantity, closingPrice) {
    if (!["buy", "sell"].includes(side)) throw new Error("Invalid side.");
    const px = cents(price), qty = cents(quantity), closing = cents(closingPrice);
    const base = px * qty; // millionths of a POLF
    const advantage = (closing - px) * qty * 100n;
    const buyer = advantage > base ? advantage : base;
    const seller = -advantage > base ? -advantage : base;
    return side === "buy" ? { maker: scaled(buyer, 6), taker: scaled(seller, 6) } : { maker: scaled(seller, 6), taker: scaled(buyer, 6) };
  }
  function exactTermsShape(terms) {
    return terms && !Array.isArray(terms)
      && Object.keys(terms).sort().join(",") === "id,maker,px,qty,side,taker,until"
      && ["id", "maker", "side", "taker"].every(key => typeof terms[key] === "string")
      && isDecimal(terms.px) && isDecimal(terms.qty) && Number.isSafeInteger(terms.until);
  }
  const api = { config, isDecimal, priceLimits, withinLimits, nextSweep, expirySweep, tradingOpen, baseFee, sideFees, exactTermsShape };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SignalContest = api;
})(globalThis);
