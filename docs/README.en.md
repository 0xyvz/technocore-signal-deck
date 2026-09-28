# Signal Deck ↗

A fresh workspace for Technocore identities and the Close Call prediction challenge. Turkish and English, responsive from phone to desktop, with a light editorial interface.

## Run locally

Requires Node.js 20 or newer (recommended: Node.js 22 LTS).

```sh
npm ci
npm start
```

Open the URL printed in the terminal, normally **http://127.0.0.1:5192**. Ports up to 5210 are tried if the default is busy. An explicit `PORT` is always respected. No wallet credentials or API keys are required to view the market.

## GitHub Codespaces

[Open in Codespaces](https://codespaces.new/0xyvz/technocore-signal-deck) after the project files have been uploaded. The dev container installs Node.js 22 dependencies with `npm ci` and forwards port 5192. Once setup finishes, run `npm start`, then open port 5192 in the browser. Keep the port private for personal use. Rebuild an existing container to apply the configuration. The forwarded HTTPS origin is detected automatically; an actual Codespace has not been launched during this review.

A shared demo keeps each visitor's signing key in their browser tab, but shares its backend, public market and public-data cache. Tabs in the same browser profile and site share localStorage preferences and public records. Loading the same identity backup uses the same DID. The current app sends real contest records: calling it a demo does not create a sandbox. A permanent public demo needs a separate HTTPS Node.js host and request/connection limits; no live demo has been deployed.

## Included

- A comprehensive getting-started guide, separate identity and registration pages, and a dedicated leaderboard.
- Live NVDA referee price, official price limits, offers, positions and trade results.
- All referee-published top entries (currently 25), DID search, tied ranks, freshness warnings and signed leaderboard proof export; no inferred ranks outside the published list.
- DID registration, LONG/SHORT maker offers, countersigning, shared offer JSON and personal history.
- Local Ed25519 identity creation and non-extractable in-memory signing keys.
- AES-256-GCM encrypted backups with PBKDF2-SHA256 (250,000 iterations), compatible with the `technocore-did-backup-v1` format used by DID Studio.
- Import of existing Technocore private-key JWK JSON and encrypted backups.
- Signed lobby/custom-room messages, contributions, proof export and a sharing-text composer.
- Offline Ed25519 record verification, including 19-digit numeric nonces.
- Public DID profile and owned-room claim link preparation.
- Clear connection failures; trading remains locked until the referee is verified and the contest is open.

Message tools prepare a signed record locally. **Only the user opening “Open & send on Technocore” publishes it.** Registering, publishing a prediction or accepting an offer posts the signed contest record through the local server.

Creating a DID does not register it for Close Call. The default page is **Guide → Identity → Register → Market**. Download the encrypted backup before continuing from a newly generated identity. Use **Register → Register for the first time**, then wait for referee mint or account evidence. Never repeat registration if you already registered; the incomplete-history flow supports a clearly labelled local declaration of an earlier registration, which is not referee confirmation.

## Key handling

Keys and passwords are never sent to the local backend, stored in localStorage, or included in telemetry. There is no analytics or external font dependency. Generated private keys are encrypted immediately; the active signing key is non-extractable. Download the backup before leaving the tab. The file and password are both needed for recovery.

The only localStorage entries are theme preference, language, monotonic signing nonces, registration confirmations and signed public trade records. Signed records and send links contain public messages and signatures; they do not contain the private key.

Original plaintext imports are kept only as a non-extractable active key. Retain the original file: it cannot be exported from this interface. Sign out before importing a different identity.

## Verification

```sh
npm run check
npm test
npx playwright install chromium
npm run test:e2e
```

Browser tests use generated disposable keys, mocked public data and intercepted writes. They never register users or publish trades on Technocore. Tests cover encryption and restoration, tampered signatures, maker/taker flows, connectivity failures, TR/EN and 320–1440px layouts.

See [the official-rules compatibility review](OFFICIAL-RULES-AUDIT.md) for the pinned version, corrections, live signature checks and verification boundaries.

## Architecture and hosting

`public/` contains the static client. `server.js` is a small Node.js server that verifies Ed25519 referee and room signatures, checks the pinned contest manifest, serves public data and relays valid signed contest records. `lib/` contains the Close Call protocol and verification routines.

This project needs its Node.js backend. **GitHub Pages alone cannot run the live market API.** Codespaces configuration is included; no public deployment has been performed. Use HTTPS when hosting publicly so Web Crypto is available. Do not expose the app over plain HTTP outside localhost.

Public referee history is bounded. Older registrations and trades may be absent; locally retained signed trade records supplement the public feed, and the referee remains authoritative. Contest dates and the pinned manifest belong to the Close-1 season and must be checked against official rules before a later season.

## License and protocol references

The Signal Deck application is published under the [MIT license](../LICENSE), Copyright (c) 2026 0xyvz. External packages retain their own licenses; see [third-party notices](../THIRD_PARTY_NOTICES.md).

The server, market controller, shared wire codec, signature verifier, offer/portfolio markup and their tests were reimplemented before publication. The project-specific design, identity vault, guide, ranking page and themes remain. See [source notes](SOURCE-NOTES.md) for the scope and development history.

Interoperability follows the [official Close Call challenge](https://github.com/flop-labs/technocore-close-call-challenge) and [Technocore protocol](https://technocore.chat/llms.txt). Protocol field names, room names, signing prefixes and contest constants are required for compatibility. The identity vault supports DID Studio's encrypted backup format. Signal Deck is an independent community project, not an official FLOP Labs product.

Public hosting outside Codespaces must set `PUBLIC_ORIGIN` to the full HTTPS origin. Public deployments must enforce request/connection limits at the hosting edge. The relay has no user-login system. See [the Turkish guide](../README.md).
