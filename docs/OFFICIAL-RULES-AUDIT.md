# Close-1 compatibility review — updated 28 September 2026

Reference: [flop-labs/technocore-close-call-challenge](https://github.com/flop-labs/technocore-close-call-challenge/tree/66c1da36538e4b1c685417d2f66922906b13fea0).

The reviewed commit is `66c1da36538e4b1c685417d2f66922906b13fea0`. The manifest SHA-256 pinned in Signal Deck is `bae09812e25eb6f1369c611f24964f7ea0acafddfc45301a16f33f941296dafa`.

The official package's `scripts/verify.py` verified 15 artifacts; `scripts/build.py --check` found current generated files, and its 18 Python unit tests passed. The review compared `contest.json`, `close-call-game.md` and the generated reference fold. This is a compatibility review, not a complete security audit or independent replay of the live ledger.

## Corrections and behavior

- Shared browser/server rules pin opening, lock, final-price time, sweep cadence, minimum quantity and fee settings.
- Exact decimal strings, the documented seven-key terms shape, canonical signatures and inward-rounded inclusive ±5% price limits are enforced. Prices are not silently rounded on submission.
- Each side pays `max(1% × price × quantity, closing-price advantage × quantity)`. The preview is explicitly a fee floor because the sweep's closing price is not known yet.
- A one-sweep offer expires at the next sweep, not one later. A price record containing completed `n` falls back to `n + 1` when `for` is absent.
- Creating an identity is separate from registration. A later flow timestamp does not imply mint acceptance. Local previous-registration declarations are labelled separately from referee evidence.
- Official self-trades are valid records and remain readable/verifiable. The interface intentionally prevents creating them; the guide explains the distinction and their two fees.
- The global price is the contest's settled-trade VWAP, not the external Hyperliquid reference. The guide explains new-position collateral, final scoring, prize ties and claim timing.
- Truncated flow counts include the signed `omitted` totals where present. Missing personal records are not treated as zero balances.
- A signed seed that has fallen outside the latest 200 messages is recovered from the price-room export. Its signer, outer signature, season, manifest and room set are checked before caching; current room owners are still checked on each snapshot. Failed or forged recovery keeps trading locked.

## What the leaderboard proves

At the live check (snapshot `2026-09-26T11:20:06.145Z`), launch verification passed and the `d-close1-pnl` record for sweep 279 contained 25 entries. Its outer Ed25519 signature also passed a separate local verification. All published entries are displayed, with exact score strings, tied ranks, DID search, source time and downloadable signed evidence.

This proves authenticity relative to the configured referee DID, `did:key:z6MkowHQwsx9xr84WbWN3YCnKutyBnBXkT1ChKY4uEAAMzte`. The rules repository alone does not independently establish that key's real-world owner. Room sequence and server timestamps are metadata; the outer signature covers room, nonce and text, not the timestamp.

The public top list is not a complete leaderboard or final prize result. We cannot derive ranks or scores for DIDs outside it. We do not retrieve and replay every hash-addressed sweep file, reconcile every historical trade-ID collision, or recompute all balances. Registration, room, and outcome histories are bounded; locally retained signed records help preserve the user's submitted records but are not referee acceptance evidence. The referee remains authoritative.

## Validation

Local syntax checks, 20 Node unit tests and 17 browser scenarios pass. Browser scenarios use disposable generated identities, mocked snapshots and intercepted network writes; no live registration or trade is submitted. Checks cover backup recovery, signed maker/taker records, onboarding order, stale and unverified rankings, all 25 entries, ties, search, proof download, registration evidence, language switching and 320–1440px layouts. A unit test also checks Codespaces HTTPS origin handling; an actual Codespace has not been launched.

The pre-publication implementation replacement retains the above protocol behavior. New tests exercise exact signing bytes, relay rejection, shared feed caching, forged ranking rejection and wrong-owner launch locking. See [source notes](SOURCE-NOTES.md).

Live read-only check after replacement: `2026-09-28T12:34:56.644Z`; launch verified, PnL signature verified, 25 published entries. No registration or trade was submitted.
