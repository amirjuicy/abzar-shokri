/* Reproduces the reported "bar sits too high" on a client that still holds the
 * old (pre-fix) service-worker shell, then verifies the sw.js version bump
 * makes the client converge to the fixed, flush bar.
 *
 * Steps:
 *  1. fresh client registers the SW, then its cache is overwritten with the
 *     HEAD (pre-fix) copies of pages.css / product.js / common.js  -> old shell
 *  2. load /product/1  -> expect the bar floated ~57px above the bottom (bug)
 *  3. sw.js bumped to v40 by the caller before running step "after"  -> the
 *     registration updates, old cache is dropped -> expect gap 0 (flush)
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const BASE = 'http://127.0.0.1:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REPO = 'C:/Users/INO/Desktop/project/abzar-shokri';

const oldCss = execSync('git show HEAD:abzar-shokri/assets/css/pages.css', { cwd: REPO, maxBuffer: 1 << 24 }).toString('utf8');
const oldJs = execSync('git show HEAD:abzar-shokri/assets/js/product.js', { cwd: REPO, maxBuffer: 1 << 24 }).toString('utf8');
const oldCommon = execSync('git show HEAD:abzar-shokri/assets/js/common.js', { cwd: REPO, maxBuffer: 1 << 24 }).toString('utf8');

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const page = await ctx.newPage();

async function measure(label) {
  await page.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 20000 });
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => {
    const bar = document.getElementById('pdp-buy-bar');
    const r = bar.getBoundingClientRect();
    const nav = document.querySelector('.mobile-bottom-nav');
    return {
      gap: +(window.innerHeight - r.bottom).toFixed(1),
      navPresent: !!nav,
      navH: nav ? +nav.getBoundingClientRect().height.toFixed(1) : 0,
      navVar: getComputedStyle(document.documentElement).getPropertyValue('--pdp-bottom-nav-h').trim(),
      bottomCss: getComputedStyle(bar).bottom,
      count: document.querySelectorAll('#pdp-buy-bar').length
    };
  });
  console.log(label, JSON.stringify(m));
  return m;
}

/* --- 1. register SW with the current (un-bumped) cache name --- */
await page.goto(`${BASE}/shop`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
const swReady = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  return !!reg;
});
console.log('service worker registered:', swReady);

/* --- 2. overwrite the shell cache with the pre-fix files (old client) --- */
const seeded = await page.evaluate(async ({ css, js, common }) => {
  const keys = await caches.keys();
  const name = keys.find(k => k.startsWith('abzar-shokri-'));
  if (!name) return { ok: false, reason: 'no cache', keys };
  const cache = await caches.open(name);
  const put = async (path, body) => {
    const url = new URL(path, location.origin).href;
    await cache.put(url, new Response(body, { headers: { 'Content-Type': path.endsWith('.css') ? 'text/css' : 'application/javascript' } }));
  };
  await put('assets/css/pages.css', css);
  await put('assets/js/product.js', js);
  await put('assets/js/common.js', common);
  return { ok: true, cache: name, keys };
}, { css: oldCss, js: oldJs, common: oldCommon });
console.log('seeded old shell:', JSON.stringify(seeded));

const before = await measure('BEFORE fix reaches client (old shell):');
console.log('=> symptom reproduced:', before.gap > 40 ? 'YES — bar floats above the bottom edge' : 'no');

/* --- 3. sw.js is now bumped to v40 by the caller: force an update --- */
const bumped = process.argv.includes('--expect-bump');
if (bumped) {
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r && r.update()));
  await page.waitForTimeout(3000);
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r && r.update()));
  await page.waitForTimeout(3000);
  const after = await measure('AFTER sw bump (v40 shell):');
  const cachesNow = await page.evaluate(() => caches.keys());
  console.log('caches now:', JSON.stringify(cachesNow));
  console.log('=> converged:', after.gap === 0 && !after.navPresent && after.count === 1 ? 'YES — flush, single bar, no nav overlap' : 'NO');
}

await browser.close();
