import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MOBILE = { width: 390, height: 844 };

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const ctx = await browser.newContext({ viewport: MOBILE });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 15000 });
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const out = {};
  out.hasMobileBottomNav = !!document.querySelector('.mobile-bottom-nav');
  out.mobileBottomNavCount = document.querySelectorAll('.mobile-bottom-nav').length;
  out.navCandidates = [...document.querySelectorAll('[class*="bottom"]')].map(e => e.className);
  out.bodyChildren = [...document.body.children].map(e => e.tagName + '#' + e.id + '.' + (typeof e.className === 'string' ? e.className : ''));
  const bar = document.getElementById('pdp-buy-bar');
  const r = bar.getBoundingClientRect();
  out.bar = { top: r.top, bottom: r.bottom, h: r.height, w: r.width, pos: getComputedStyle(bar).position, bottomCss: getComputedStyle(bar).bottom };
  out.bodyPadBottom = getComputedStyle(document.body).paddingBottom;
  out.rootVars = (() => { const s = getComputedStyle(document.documentElement); return { barH: s.getPropertyValue('--pdp-buy-bar-h'), navH: s.getPropertyValue('--pdp-bottom-nav-h') }; })();
  out.barHTML = bar.outerHTML.slice(0, 1200);
  return out;
});
console.log(JSON.stringify(info, null, 2));
console.log('errors:', errors);

/* scroll probe */
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(300);
const after = await page.evaluate(() => {
  const bar = document.getElementById('pdp-buy-bar');
  const last = document.querySelector('.related-products');
  return { barTop: bar.getBoundingClientRect().top, lastBottom: last ? last.getBoundingClientRect().bottom : null, scrollY: window.scrollY, max: document.documentElement.scrollHeight - window.innerHeight };
});
console.log('scroll:', JSON.stringify(after));
await page.screenshot({ path: 'probe-mobile.png', fullPage: false });
await browser.close();
