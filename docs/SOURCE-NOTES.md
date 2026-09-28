# Signal Deck source notes

Application copyright: 2026 0xyvz. License: MIT.

## Scope of the pre-publication replacement

An unpublished prototype adapted parts of UfukNode / technocore-close-call-desk. That implementation was not accepted for publication. The following production paths now contain newly written application implementations:

- `public/wire.js`: shared field validation, canonical signing bytes, Ed25519 DID decoding and lossless integer-token reading.
- `lib/protocol.js`, `lib/verify.js`: protocol record constructors and Node signature adapter.
- `lib/feed.js`: injectable room reader, authenticated feed assembly, bounded public history and coalesced caching.
- `lib/relay.js`, `server.js`: signed-record submission policy and HTTP routing/static serving.
- `public/app.js`, `public/copy.js`: browser controller, delegated events, DOM-based market/portfolio rendering and interface copy.
- The prediction, portfolio and confirmation sections of `public/index.html`.
- `test/protocol.test.js`, `test/ui.e2e.js` and the test/start configuration; new feed tests cover authenticated rankings and failure recovery.

Project-specific guide, ranking, theme, identity-vault and security helpers were retained. DOM IDs and callable interfaces used by those modules were kept where needed to preserve behavior. Protocol facts (message keys, room identifiers, canonical ordering, DID encoding and signature payload format) remain compatible with the official specification.

This was a replacement within an existing prototype, not a claim that its author had never seen the reference source. A source comparison was used to locate retained prototype material; matching-line counts alone are not a legal determination of authorship. No earlier prototype source or Git history is included in the prepared upload folder.

## External components

Lucide and development tools retain their own notices in `THIRD_PARTY_NOTICES.md` and installed packages. Official protocol repositories and DID Studio are interoperability references; their licenses are not replaced by the Signal Deck license.
