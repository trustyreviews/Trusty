/**
 * Exchange a short-lived Meta User token for a permanent Page Access Token.
 *
 * One-time setup so FB_PAGE_ACCESS_TOKEN does not expire every hour.
 *
 * Step 1 (manual): Graph API Explorer → User token with page permissions
 *   https://developers.facebook.com/tools/explorer/
 *   App: Trusty | Type: User | Scopes: pages_show_list, pages_read_engagement,
 *   pages_read_user_content, pages_manage_posts, pages_manage_engagement
 *
 * Step 2–3 (this script): exchange User token → long-lived User token → Page token
 *
 * Usage:
 *   npm run fb:page-token
 *   npm run fb:page-token -- --write   # also updates FB_PAGE_ACCESS_TOKEN in .env
 *
 * Required .env:
 *   FB_APP_ID
 *   FB_APP_SECRET
 *   FB_SHORT_USER_TOKEN
 * Optional:
 *   FB_PAGE_ID (default: 1231064900087363)
 *   FB_GRAPH_VERSION (default: v25.0)
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PAGE_ID = '1231064900087363';
const DEFAULT_GRAPH_VERSION = 'v25.0';
const ENV_PATH = path.join(__dirname, '..', '.env');

const STEP1_HELP = `
Step 1 — get a short-lived USER token (manual, ~1 hour lifespan)

1. Open https://developers.facebook.com/tools/explorer/
2. App: Trusty (2462222147604346)
3. Token type: User (not Page)
4. Add permissions:
   pages_show_list, pages_read_engagement, pages_read_user_content,
   pages_manage_posts, pages_manage_engagement
5. Generate Access Token → copy it into .env as FB_SHORT_USER_TOKEN=

Then run: npm run fb:page-token
`;

function getConfig() {
  const appId = process.env.FB_APP_ID?.trim() || '';
  const appSecret = process.env.FB_APP_SECRET?.trim() || '';
  const shortUserToken = process.env.FB_SHORT_USER_TOKEN?.trim() || '';
  const pageId = process.env.FB_PAGE_ID?.trim() || DEFAULT_PAGE_ID;
  const graphVersion =
    process.env.FB_GRAPH_VERSION?.trim() || DEFAULT_GRAPH_VERSION;
  return { appId, appSecret, shortUserToken, pageId, graphVersion };
}

function graphBaseUrl(graphVersion) {
  return `https://graph.facebook.com/${graphVersion}`;
}

async function parseGraphResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok || payload?.error) {
    const err = payload?.error ?? {};
    const message =
      typeof err.message === 'string' && err.message.trim()
        ? err.message
        : `Graph API request failed (HTTP ${response.status})`;
    const error = new Error(message);
    error.code = err.code;
    error.type = err.type;
    error.fbtraceId = err.fbtrace_id;
    throw error;
  }
  return payload;
}

/**
 * Step 2: short-lived User token → long-lived User token (~60 days).
 */
async function exchangeLongLivedUserToken({
  appId,
  appSecret,
  shortUserToken,
  graphVersion,
}) {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortUserToken,
  });
  const url = `${graphBaseUrl(graphVersion)}/oauth/access_token?${params}`;
  const response = await fetch(url, { method: 'GET' });
  const payload = await parseGraphResponse(response);
  const accessToken = payload?.access_token?.trim();
  if (!accessToken) {
    throw new Error('Token exchange succeeded but no access_token was returned');
  }
  return accessToken;
}

/**
 * Step 3: long-lived User token → Page tokens via /me/accounts.
 */
async function fetchManagedPages({ longLivedUserToken, graphVersion }) {
  const params = new URLSearchParams({
    fields: 'id,name,access_token',
    access_token: longLivedUserToken,
  });
  const url = `${graphBaseUrl(graphVersion)}/me/accounts?${params}`;
  const response = await fetch(url, { method: 'GET' });
  const payload = await parseGraphResponse(response);
  return Array.isArray(payload?.data) ? payload.data : [];
}

function findPageToken(pages, pageId) {
  const match = pages.find((page) => String(page?.id) === String(pageId));
  const token = match?.access_token?.trim();
  if (!token) return null;
  return {
    pageId: String(match.id),
    pageName: typeof match.name === 'string' ? match.name : 'Unknown Page',
    accessToken: token,
  };
}

function writePageTokenToEnv(pageToken) {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(`.env not found at ${ENV_PATH}`);
  }
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  let replaced = false;
  const next = lines.map((line) => {
    if (line.startsWith('FB_PAGE_ACCESS_TOKEN=')) {
      replaced = true;
      return `FB_PAGE_ACCESS_TOKEN=${pageToken}`;
    }
    return line;
  });
  if (!replaced) {
    next.push(`FB_PAGE_ACCESS_TOKEN=${pageToken}`);
  }
  fs.writeFileSync(ENV_PATH, next.join(eol), 'utf8');
}

async function main() {
  const shouldWrite = process.argv.includes('--write');
  const { appId, appSecret, shortUserToken, pageId, graphVersion } =
    getConfig();

  if (!shortUserToken) {
    console.error('FB_SHORT_USER_TOKEN is not set in .env.\n');
    console.error(STEP1_HELP.trim());
    process.exit(1);
  }
  if (!appId || !appSecret) {
    console.error(
      'FB_APP_ID and FB_APP_SECRET are required in .env.\n' +
        'Find them at: Meta for Developers → Trusty → App settings → Basic'
    );
    process.exit(1);
  }

  console.log('[fb:page-token] Exchanging short-lived User token…');
  const longLivedUserToken = await exchangeLongLivedUserToken({
    appId,
    appSecret,
    shortUserToken,
    graphVersion,
  });
  console.log('[fb:page-token] Long-lived User token received.');

  console.log('[fb:page-token] Fetching managed Pages…');
  const pages = await fetchManagedPages({ longLivedUserToken, graphVersion });
  if (!pages.length) {
    throw new Error(
      'No Pages returned from /me/accounts. Confirm you are a Page admin and the User token has pages_show_list.'
    );
  }

  const page = findPageToken(pages, pageId);
  if (!page) {
    const available = pages
      .map((p) => `  - ${p.id}: ${p.name ?? '(no name)'}`)
      .join('\n');
    throw new Error(
      `Page ${pageId} not found in /me/accounts.\nAvailable Pages:\n${available}`
    );
  }

  console.log('');
  console.log('Permanent Page token ready:');
  console.log(`  Page: ${page.pageName} (${page.pageId})`);
  console.log(`  Token length: ${page.accessToken.length} chars`);
  console.log('');
  console.log('Verify at https://developers.facebook.com/tools/debug/accesstoken/');
  console.log('  Type: Page | Expires: Never');
  console.log('');

  if (shouldWrite) {
    writePageTokenToEnv(page.accessToken);
    console.log('Updated FB_PAGE_ACCESS_TOKEN in .env');
    console.log('Restart the API: npm run api');
  } else {
    console.log('Add to .env:');
    console.log(`FB_PAGE_ACCESS_TOKEN=${page.accessToken}`);
    console.log('');
    console.log('Or run: npm run fb:page-token -- --write');
  }
}

main().catch((err) => {
  console.error('[fb:page-token] Failed:', err.message);
  if (err.code != null) console.error('  code:', err.code);
  if (err.fbtraceId) console.error('  fbtraceId:', err.fbtraceId);
  process.exit(1);
});
