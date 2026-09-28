# Security model

Signal Deck signs locally using Web Crypto Ed25519. It imports active keys with `extractable: false`. Generated backups use AES-256-GCM, a fresh 16-byte salt and 12-byte IV, and PBKDF2-SHA256 with 250,000 iterations. The backup format is compatible with Technocore DID Studio. Public/private key consistency and the backup DID are checked on import.

Do not paste private keys into messages, contribution fields, issues, or verification fields. The identity file input is the only place a key file belongs. Do not commit key files to Git. The repository ignores common private-key and environment-file patterns; always review staged files before publishing.

The backend only accepts signed Close Call protocol messages for the two supported rooms; it is not an arbitrary proxy. The browser stops trade actions on connection failure, expired session data, unverified launch or contest closure. Upstream room posts and errors are untrusted.

A prepared signed URL publishes a public record when opened. A downloaded proof is cryptographic evidence of signed content, not proof of contest acceptance or an independently authenticated timestamp. Profile notes are public and unsigned. Ownership claim links only succeed if the room can be claimed under the current protocol.

No live transactions are executed by automated tests. Please report potential vulnerabilities privately to the eventual repository owner, without including real keys or passphrases.

## Pre-publication review (26 September 2026)

The review covered key handling, imported records, signature validation, HTML rendering, repository contents and HTTP boundaries. `npm audit` reported zero known vulnerabilities at the time of the check; this is not a guarantee against unknown vulnerabilities or a third-party penetration test.

The server rejects cross-origin browser posts and non-JSON post bodies, restricts Host headers when bound to loopback, limits incoming bodies to 64 KiB and upstream bodies to 4 MiB, and retains at most 5,000 observed trades. Upstream deadlines cover reading the body as well as headers. Upstream redirects are rejected. Fresh requests share a short cache. HTTP request/header timeouts are enabled. Private-file extensions and backup folders are ignored by Git.

Use `PUBLIC_ORIGIN` behind an HTTPS proxy. Origin checks are not authentication: non-browser clients can still submit valid public signatures, and signatures may be replayed subject to Technocore's nonce rules. Public deployments need hosting-layer rate and connection limits; the app has no distributed rate limiter or user login. Bounded history may omit older records. A compromised browser, extension, operating system, dependency or deployment can misuse in-memory signing keys even when those keys are non-extractable.

Do not report real private keys or passwords in public GitHub issues. This project has not undergone an independent security audit.
