'use strict';

function publicOrigin(env, port) {
  if (env.PUBLIC_ORIGIN) return new URL(env.PUBLIC_ORIGIN).origin;
  if (env.CODESPACES !== 'true') return '';
  const name = env.CODESPACE_NAME;
  const domain = env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  if (!name || !domain) return '';
  // Derive only from trusted process settings, never request or proxy headers.
  if (!/^[a-z0-9-]+$/i.test(name) || !/^[a-z0-9.-]+$/i.test(domain)) throw new Error('Invalid Codespaces forwarding settings.');
  return `https://${name}-${port}.${domain}`;
}
module.exports = {publicOrigin};
