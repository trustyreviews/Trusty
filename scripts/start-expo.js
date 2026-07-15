/**
 * Start Expo with GEMINI_API_KEY available to the app as EXPO_PUBLIC_GEMINI_API_KEY.
 * Draft with AI calls Gemini directly — no separate `npm run api` process needed.
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const isWin = process.platform === 'win32';

const env = { ...process.env };
if (!env.EXPO_PUBLIC_GEMINI_API_KEY && env.GEMINI_API_KEY) {
  env.EXPO_PUBLIC_GEMINI_API_KEY = env.GEMINI_API_KEY;
}

const expoArgs = ['expo', 'start', ...process.argv.slice(2)];
const child = spawn(isWin ? 'npx.cmd' : 'npx', expoArgs, {
  cwd: root,
  stdio: 'inherit',
  shell: isWin,
  env,
});

child.on('exit', (code) => process.exit(code ?? 0));
