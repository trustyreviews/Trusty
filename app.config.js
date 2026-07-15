const fs = require('fs');
const path = require('path');

const root = __dirname;

const SERVER_ONLY_KEYS = new Set([
  'FB_PAGE_ACCESS_TOKEN',
  'FB_APP_SECRET',
  'FB_SHORT_USER_TOKEN',
]);

const CLIENT_SECRET_KEYS = new Set([
  'GEMINI_API_KEY',
  'EXPO_PUBLIC_GEMINI_API_KEY',
]);

function loadDotEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  const publicWebBuild = process.env.TRUSTY_PUBLIC_WEB_BUILD === '1';
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
      if (publicWebBuild && CLIENT_SECRET_KEYS.has(key)) return;
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

loadDotEnv();

const publicWebBuild = process.env.TRUSTY_PUBLIC_WEB_BUILD === '1';
const localApiBase = process.env.EXPO_PUBLIC_API_BASE_URL || '';
const productionApiBase = process.env.PRODUCTION_API_BASE_URL || '';

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      geminiApiKey: publicWebBuild
        ? ''
        : process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          '',
      apiBaseUrl: publicWebBuild
        ? productionApiBase
        : localApiBase,
    },
  },
};
