/**
 * Export Expo web build into docs/app for GitHub Pages.
 * Run: npm run build:web
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'dist-web');
const dest = path.join(root, 'docs', 'app');

// Public GitHub Pages build — never embed secrets in the static bundle.
process.env.TRUSTY_PUBLIC_WEB_BUILD = '1';

function rm(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDir(src, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

// Load non-secret .env values for the public GitHub Pages bundle.
const envPath = path.join(root, '.env');
const SERVER_ONLY_KEYS = new Set([
  'GEMINI_API_KEY',
  'EXPO_PUBLIC_GEMINI_API_KEY',
  'FB_PAGE_ACCESS_TOKEN',
  'FB_APP_SECRET',
  'FB_SHORT_USER_TOKEN',
]);

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!key || SERVER_ONLY_KEYS.has(key)) return;
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

// Never ship local API URLs or secrets in the public site bundle.
for (const key of SERVER_ONLY_KEYS) {
  delete process.env[key];
}

const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL || '';
if (/localhost|127\.0\.0\.1|192\.168\./i.test(apiBase)) {
  process.env.EXPO_PUBLIC_API_BASE_URL =
    process.env.PRODUCTION_API_BASE_URL || '';
}

if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  console.warn(
    '[build:web] No public API URL — set PRODUCTION_API_BASE_URL in .env for live Facebook/AI on trustydirect.com.'
  );
}

console.log('[build:web] Exporting Expo web bundle (baseUrl /app)…');
execSync('npx expo export --platform web --output-dir dist-web --clear', {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

rm(dest);
copyDir(out, dest);
console.log(`[build:web] Copied to ${path.relative(root, dest)}`);
