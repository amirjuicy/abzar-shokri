import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const page = await ctx.newPage();
await page.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 20000 });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(400);
const out = await page.evaluate(() => {
  const barTop = document.getElementById('pdp-buy-bar').getBoundingClientRect().top;
  const rows = [];
  for (const e of document.querySelectorAll('main *, footer *')) {
    const r = e.getBoundingClientRect();
    if (r.height === 0 || r.width === 0) continue;
    if (r.bottom > barTop + 1) {
      const cs = getComputedStyle(e);
      rows.push({
        el: e.tagName + (e.id ? '#' + e.id : '') + '.' + (typeof e.className === 'string' ? e.className.trim().split(/\s+/).slice(0,3).join('.') : ''),
        bottom: +r.bottom.toFixed(1), top: +r.top.toFixed(1),
        pos: cs.position, vis: cs.visibility, op: cs.opacity
      });
    }
  }
  rows.sort((a,b) => b.bottom - a.bottom);
  return { barTop: +barTop.toFixed(1), scrollY: window.scrollY, max: document.documentElement.scrollHeight - window.innerHeight, rows: rows.slice(0, 15) };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
