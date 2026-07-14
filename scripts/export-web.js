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

console.log('[build:web] Exporting Expo web bundle (baseUrl /app)…');
execSync('npx expo export --platform web --output-dir dist-web', {
  cwd: root,
  stdio: 'inherit',
});

rm(dest);
copyDir(out, dest);
console.log(`[build:web] Copied to ${path.relative(root, dest)}`);
