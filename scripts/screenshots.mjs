// Baut die Seite, startet die Vorschau und speichert Screenshots
// aller Seiten in drei Breiten unter screenshots/.
// Aufruf: npm run shots            (alle Seiten)
//         npm run shots -- /about/ (nur bestimmte Pfade)
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { chromium } from 'playwright';

const PORT = 4329;
const BASE = `http://localhost:${PORT}`;
// In der Cloud-Umgebung liegt Chromium vorinstalliert hier; lokal nutzt Playwright sein eigenes.
const CLOUD_CHROMIUM = '/opt/pw-browsers/chromium';
const VIEWPORTS = [
  { name: 'mobil', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1440, height: 900 },
];

function findPages(dir, root = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return findPages(path, root);
    if (entry !== 'index.html') return [];
    const rel = relative(root, dir);
    return [rel ? `/${rel}/` : '/'];
  });
}

execSync('npx astro build', { stdio: 'inherit' });
const paths = process.argv.slice(2).length ? process.argv.slice(2) : findPages('dist');

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
try {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(BASE);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const browser = await chromium.launch({
    executablePath: existsSync(CLOUD_CHROMIUM) ? CLOUD_CHROMIUM : undefined,
  });
  mkdirSync('screenshots', { recursive: true });
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport });
    for (const path of paths) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const slug = path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'start';
      const file = `screenshots/${slug}--${viewport.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
    }
    await page.close();
  }
  await browser.close();
} finally {
  server.kill();
}
