import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 20000 });
await page.waitForTimeout(2500);
for (const frac of [0, 0.33, 0.66, 1]) {
  await page.evaluate(f => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(max * f));
  }, frac);
  await page.waitForTimeout(500);
  const res = await page.evaluate(() => {
    const bar = document.getElementById('pdp-buy-bar');
    const barTop = bar.getBoundingClientRect().top;
    const offenders = [];
    for (const e of document.querySelectorAll('#product-detail-content *')) {
      if (e === bar || bar.contains(e)) continue;           // ignore the bar itself
      const r = e.getBoundingClientRect();
      if (r.height <= 0 || r.width <= 0) continue;
      if (r.bottom > barTop + 1) {
        const cs = getComputedStyle(e);
        offenders.push({
          el: e.tagName + (e.id ? '#' + e.id : '') + '.' + (typeof e.className === 'string' ? e.className.trim().split(/\s+/).slice(0, 3).join('.') : ''),
          bottom: +r.bottom.toFixed(1),
          pos: cs.position, disp: cs.display, vis: cs.visibility, op: cs.opacity
        });
      }
    }
    return {
      scrollY: window.scrollY,
      max: document.documentElement.scrollHeight - window.innerHeight,
      barTop: +barTop.toFixed(1),
      barBottom: +bar.getBoundingClientRect().bottom.toFixed(1),
      gap: +(window.innerHeight - bar.getBoundingClientRect().bottom).toFixed(2),
      bodyPad: getComputedStyle(document.body).paddingBottom,
      offenders
    };
  });
  console.log(`frac=${frac}`, JSON.stringify(res));
}
await browser.close();
