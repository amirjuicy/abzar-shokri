import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MOBILE = { width: 390, height: 844 };

const browser = await chromium.launch({ headless: true, executablePath: CHROME });

async function probe(url, label) {
  const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 20000 });
  await page.waitForTimeout(1000);

  const facts = await page.evaluate(() => {
    const bar = document.getElementById('pdp-buy-bar');
    const cs = getComputedStyle(bar);
    const r = bar.getBoundingClientRect();
    // ancestor chain: any transform/filter/perspective/contain/will-change that
    // turns `fixed` into a container-relative box.
    const ancestors = [];
    let el = bar.parentElement;
    while (el && el !== document.documentElement) {
      const s = getComputedStyle(el);
      const suspicious = ['none', 'normal', '0px', 'auto', 'visible', 'flat', 'rgba(0, 0, 0, 0)', '0'].reduce((acc, v) => acc, false);
      const info = {
        tag: el.tagName + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
        position: s.position, transform: s.transform, filter: s.filter, perspective: s.perspective,
        backdropFilter: s.backdropFilter, contain: s.contain, willChange: s.willChange,
        opacity: s.opacity, paddingBottom: s.paddingBottom, marginBottom: s.marginBottom,
        overflow: s.overflow, rect: (rr => ({ top: Math.round(rr.top), bottom: Math.round(rr.bottom), h: Math.round(rr.height) }))(el.getBoundingClientRect()),
        matchesFixedAncestor: /fixed|sticky/.test(s.position)
      };
      const bad = (s.transform !== 'none') || (s.filter !== 'none') || (s.perspective !== 'none') ||
        (s.backdropFilter !== 'none' && s.backdropFilter !== '') || (s.contain !== 'none' && s.contain !== '') ||
        /transform|filter|paint|layout|strict/.test(s.willChange);
      if (bad || s.position !== 'static') ancestors.push({ ...info, suspiciousAncestor: bad });
      el = el.parentElement;
    }

    const nav = document.querySelector('.mobile-bottom-nav');
    const rootS = getComputedStyle(document.documentElement);
    const barRules = [];
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
      const walk = (list, media) => {
        for (const rule of list) {
          if (rule.media) { walk(rule.cssRules, rule.conditionText); continue; }
          if (rule.selectorText && /#pdp-buy-bar|\.pdp-buy-bar(\s|,|:|\{)/.test(rule.selectorText)) {
            barRules.push({ sheet: sheet.href ? sheet.href.split('/').pop() : 'inline', media: media || 'all',
              selector: rule.selectorText, css: rule.style.cssText });
          }
        }
      };
      walk(rules, null);
    }

    const bottomPoint = document.elementFromPoint(Math.round(window.innerWidth / 2), window.innerHeight - 2);
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight, dvh: window.innerHeight, visualH: window.visualViewport && window.visualViewport.height },
      bar: {
        rect: { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), h: +r.height.toFixed(1), w: +r.width.toFixed(1) },
        position: cs.position, bottom: cs.bottom, marginTop: cs.marginTop, marginBottom: cs.marginBottom,
        paddingBottom: cs.paddingBottom, zIndex: cs.zIndex, left: cs.left, right: cs.right
      },
      gapToViewportBottom: +(window.innerHeight - r.bottom).toFixed(2),
      rootVars: { barH: rootS.getPropertyValue('--pdp-buy-bar-h').trim(), navH: rootS.getPropertyValue('--pdp-bottom-nav-h').trim() },
      bodyPadBottom: getComputedStyle(document.body).paddingBottom,
      bodyClasses: document.body.className,
      nav: nav ? { h: nav.getBoundingClientRect().height, display: getComputedStyle(nav).display } : null,
      elementAtVeryBottom: bottomPoint ? bottomPoint.tagName + (bottomPoint.id ? '#' + bottomPoint.id : '') + '.' + (typeof bottomPoint.className === 'string' ? bottomPoint.className : '') : null,
      safeAreaProbe: (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;bottom:0;padding-bottom:env(safe-area-inset-bottom);visibility:hidden'; document.body.appendChild(d); const v = getComputedStyle(d).paddingBottom; d.remove(); return v; })(),
      ancestors, barRules
    };
  });

  console.log('==== ' + label + ' ====');
  console.log(JSON.stringify(facts, null, 2));
  if (errors.length) console.log('errors:', errors);

  const positions = [];
  for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
    const p = await page.evaluate(f => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * f));
      const bar = document.getElementById('pdp-buy-bar');
      const r = bar.getBoundingClientRect();
      return { scrollY: window.scrollY, barTop: +r.top.toFixed(1), barBottom: +r.bottom.toFixed(1), gap: +(window.innerHeight - r.bottom).toFixed(2) };
    }, frac);
    await page.waitForTimeout(150);
    positions.push({ frac, ...p });
  }
  console.log('scroll positions:', JSON.stringify(positions));
  await page.screenshot({ path: `_pbtests/shots/deep-${label}.png` });
  await ctx.close();
}

await probe(`${BASE}/product/1`, 'pdp');
await browser.close();
