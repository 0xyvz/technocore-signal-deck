# Third-party notices

Signal Deck application code is licensed by 0xyvz under MIT. This notice preserves licenses for external dependencies; those packages are not claimed as original Signal Deck work.

## Lucide icons

Runtime dependency: `lucide`, installed by npm and served locally as `/vendor/lucide.js`. Its distributed bundle includes its license header. Upstream: https://github.com/lucide-icons/lucide

The installed package's license follows verbatim:

```text
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## Development tools

`@playwright/test`, `playwright` and `playwright-core` are Apache-2.0 development dependencies. Their LICENSE and NOTICE files remain in the npm packages. They are not served to application visitors. Browser binaries installed for testing have their own upstream licenses.

Package versions and integrity hashes are recorded in `package-lock.json`.
