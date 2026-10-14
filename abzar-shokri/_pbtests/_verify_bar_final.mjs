import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const VIEWPORTS = [
  { name: 'iphone-390', width: 390, height: 844 },
  { name: 'small-360', width: 360, height: 640 },
  { name: 'large-414', width: 414, height: 896 },
  { name: 'breakpoint-768', width: 768, height: 1024 }
];

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
let pass = 0, fail = 0;
const check = (label, ok, detail) => {
  console.log((ok ? 'PASS  ' : 'FAIL  ') + label + '   [' + detail + ']');
  ok ? pass++ : fail++;
};

async function open(vp, url) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/429/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 20000 });
  // wait for the site loader to be gone so we measure the real page
  await page.waitForFunction(() => {
    const l = document.querySelector('.site-loader');
    return !l || getComputedStyle(l).display === 'none' || l.hasAttribute('hidden') || document.body.classList.contains('is-site-loading') === false;
  }, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}

for (const vp of VIEWPORTS) {
  const { ctx, page, errors } = await open(vp, `${BASE}/product/1`);

  const base = await page.evaluate(() => {
    const bar = document.getElementById('pdp-buy-bar');
    const cs = getComputedStyle(bar);
    const r = bar.getBoundingClientRect();
    const nav = document.querySelector('.mobile-bottom-nav');
    return {
      pos: cs.position, bottom: cs.bottom, mt: cs.marginTop, mb: cs.marginBottom,
      padB: cs.paddingBottom, z: cs.zIndex,
      gap: +(window.innerHeight - r.bottom).toFixed(2),
      barH: +r.height.toFixed(1), w: +r.width.toFixed(1), vw: window.innerWidth,
      navH: nav ? +nav.getBoundingClientRect().height.toFixed(1) : null,
      rootNav: getComputedStyle(document.documentElement).getPropertyValue('--pdp-bottom-nav-h').trim(),
      rootBar: getComputedStyle(document.documentElement).getPropertyValue('--pdp-buy-bar-h').trim(),
      barCount: document.querySelectorAll('#pdp-buy-bar').length,
      duplicateBars: document.querySelectorAll('.mobile-purchase-bar').length,
      price: (document.querySelector('.pdp-buy-bar__amount') || {}).textContent || '',
      btn: !!document.querySelector('#pdp-buy-bar-add'),
      dir: getComputedStyle(bar).direction,
      // transformed ancestors would re-anchor position:fixed
      anchoredToViewport: (() => { let e = bar.parentElement; while (e && e !== document.documentElement) { const s = getComputedStyle(e); if (s.transform !== 'none' || s.filter !== 'none' || s.perspective !== 'none' || s.backdropFilter !== 'none' || (s.contain && s.contain !== 'none')) return false; e = e.parentElement; } return true; })()
    };
  });

  check(`${vp.name} bar is fixed`, base.pos === 'fixed', `position=${base.pos}`);
  check(`${vp.name} flush at load (gap<=0.5px)`, base.gap <= 0.5, `gap=${base.gap}px bottom=${base.bottom} padB=${base.padB}`);
  check(`${vp.name} no margin offset`, base.mt === '0px' && base.mb === '0px', `mt=${base.mt} mb=${base.mb}`);
  check(`${vp.name} anchored to viewport (no transformed parent)`, base.anchoredToViewport, `anchored=${base.anchoredToViewport}`);
  check(`${vp.name} exactly one bar`, base.barCount === 1 && base.duplicateBars === 0, `pdp=${base.barCount} dup=${base.duplicateBars}`);
  check(`${vp.name} nav band accounted`, base.navH === null ? base.rootNav === '0px' : base.rootNav === Math.round(base.navH) + 'px', `nav=${base.navH} --pdp-bottom-nav-h=${base.rootNav}`);
  check(`${vp.name} price/button/RTL intact`, base.price.length > 0 && base.btn && base.dir === 'rtl', `price=${base.price} btn=${base.btn} dir=${base.dir}`);

  // scroll through the whole page — the bar must not move
  const scrolls = [];
  for (const frac of [0, 0.33, 0.66, 1]) {
    const s = await page.evaluate(f => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * f));
      const r = document.getElementById('pdp-buy-bar').getBoundingClientRect();
      return { y: window.scrollY, gap: +(window.innerHeight - r.bottom).toFixed(2), top: +r.top.toFixed(1) };
    }, frac);
    await page.waitForTimeout(200);
    scrolls.push(s);
  }
  const allFlush = scrolls.every(s => s.gap <= 0.5);
  const barStatic = new Set(scrolls.map(s => s.top)).size === 1;
  check(`${vp.name} flush while scrolling`, allFlush, scrolls.map(s => `y=${s.y}:gap=${s.gap}`).join(' '));
  check(`${vp.name} bar does not move while scrolling`, barStatic, scrolls.map(s => s.top).join(','));

  if (vp.name === 'iphone-390') {
    await page.screenshot({ path: '_pbtests/shots/final-mobile-bottom.png' });
    // content at page bottom must not be hidden behind the bar.
    // Re-scroll to the true bottom first: lazy images can grow the page
    // after the scroll loop, which would make this measure a mid-page state.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    const last = await page.evaluate(() => {
      const bar = document.getElementById('pdp-buy-bar');
      const barTop = bar.getBoundingClientRect().top;
      const els = [...document.querySelectorAll('main *')].filter(e => e !== bar && !bar.contains(e));
      const maxBottom = Math.max(...els.map(e => e.getBoundingClientRect().bottom));
      return {
        contentBottom: +maxBottom.toFixed(1), barTop: +barTop.toFixed(1),
        scrollY: window.scrollY, max: document.documentElement.scrollHeight - window.innerHeight,
        gap: +(window.innerHeight - bar.getBoundingClientRect().bottom).toFixed(2)
      };
    });
    check('iphone-390 last content not covered by bar', last.contentBottom <= last.barTop + 1, `content=${last.contentBottom} barTop=${last.barTop}`);
  }

  check(`${vp.name} no JS errors`, errors.length === 0, errors.join(' | ') || 'none');
  await ctx.close();
}

// desktop must be untouched: bar hidden, no body padding added
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 20000 });
  await page.waitForTimeout(800);
  const d = await page.evaluate(() => {
    const bar = document.getElementById('pdp-buy-bar');
    const r = bar.getBoundingClientRect();
    return { display: getComputedStyle(bar).display, w: r.width, h: r.height, bodyPad: getComputedStyle(document.body).paddingBottom, buybox: document.querySelector('.dk-buybox-wrap') ? document.querySelector('.dk-buybox-wrap').getBoundingClientRect().width : 0 };
  });
  check('desktop bar hidden', d.display === 'none' && d.w === 0 && d.h === 0, `display=${d.display} ${d.w}x${d.h}`);
  check('desktop body padding untouched', d.bodyPad === '0px', `pad=${d.bodyPad}`);
  check('desktop buy box visible', d.buybox > 0, `w=${d.buybox}`);
  await page.screenshot({ path: '_pbtests/shots/final-desktop.png' });
  await ctx.close();
}

// a non-PDP page must keep its mobile bottom nav untouched
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/shop`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const s = await page.evaluate(() => {
    const nav = document.querySelector('.mobile-bottom-nav');
    return { hasNav: !!nav, h: nav ? nav.getBoundingClientRect().height : 0, bottom: nav ? getComputedStyle(nav).bottom : null, bar: !!document.getElementById('pdp-buy-bar') };
  });
  check('/shop keeps its mobile bottom nav', s.hasNav && s.bottom === '0px' && !s.bar, JSON.stringify(s));
  await page.screenshot({ path: '_pbtests/shots/final-shop-nav.png' });
  await ctx.close();
}

console.log('='.repeat(66));
console.log(`${pass}/${pass + fail} checks passed`);
if (fail) { console.log('FAILURES: ' + fail); process.exitCode = 1; }
await browser.close();
