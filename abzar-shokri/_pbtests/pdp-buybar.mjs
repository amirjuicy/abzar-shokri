/* Playwright checks for the fixed mobile purchase bar on the product
 * detail page (product.js .pdp-buy-bar + pages.css) of the active
 * storefront served on :3000.
 *
 *   node _pbtests/pdp-buybar.mjs
 *
 * Covers: mobile + desktop viewports, retail / wholesale pricing toggle,
 * discounted / non-discounted products, out-of-stock, add-to-cart wiring,
 * bottom-space reservation and "no duplicate bar".
 *
 * Expectations are derived from the page's own state (AppData.products +
 * App.getProductPrice + Format) rather than hard-coded numbers, so the
 * checks assert the bar reuses the existing data / discount / cart logic.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(process.cwd(), '_pbtests', 'shots');

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   [' + detail + ']' : ''));
  return !!cond;
}
function near(a, b, tol = 1) { return Math.abs(a - b) <= tol; }

async function openProduct(ctx, id) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(`${BASE}/product/${id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  /* 'attached': on desktop the bar exists but is display:none by design. */
  await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 15000 });
  await page.waitForFunction(() => !document.getElementById('site-loader'), null, { timeout: 20000 }).catch(() => {});
  /* This build renders AppData from the bundled catalog (no live sync), so
     the bar is final as soon as product.js has run. */
  await page.waitForTimeout(400);
  return { page, errors };
}

/* Product facts straight from the page's own resolved product. */
const PRODUCT_FACTS = (id) => {
  const p = AppData.products.find(x => x.id === id);
  return {
    id, inStock: !!p.inStock,
    price: p.price, oldPrice: p.oldPrice || null, discount: p.discount || 0,
    wholesalePrice: p.wholesalePrice || null,
    retail: App.getProductPrice(p, 'retail'),
    wholesale: App.getProductPrice(p, 'wholesale'),
    retailText: Format.price(App.getProductPrice(p, 'retail')),
    wholesaleText: Format.price(App.getProductPrice(p, 'wholesale')),
    oldText: p.oldPrice ? Format.priceWithCurrency(p.oldPrice) : null,
    buyboxPriceText: (document.querySelector('.dk-buybox__amount') || {}).textContent || null,
  };
};

const BAR_PROBE = () => {
  const bar = document.getElementById('pdp-buy-bar');
  const nav = document.querySelector('.mobile-bottom-nav');
  const btn = document.querySelector('#pdp-buy-bar-cart .dk-buybox__add-btn');
  const stepper = document.querySelector('#pdp-buy-bar-cart .qty-selector');
  const price = document.getElementById('pdp-buy-bar-price');
  const amount = document.querySelector('.pdp-buy-bar__amount');
  const badge = document.querySelector('.pdp-buy-bar__discount-badge');
  const old = document.querySelector('.pdp-buy-bar__old-price');
  const currency = document.querySelector('.pdp-buy-bar__currency svg');
  const toggle = document.querySelector('#pdp-buy-bar .priceChanger');
  const buyboxAdd = document.querySelector('.dk-buybox__cart .dk-buybox__add-btn, #product-cart-control .qty-selector');
  const rect = el => (el ? el.getBoundingClientRect() : null);
  const cs = el => (el ? getComputedStyle(el) : null);
  return {
    count: document.querySelectorAll('#pdp-buy-bar').length,
    bodyClass: document.body.classList.contains('has-pdp-buy-bar'),
    display: cs(bar) ? cs(bar).display : null,
    position: cs(bar) ? cs(bar).position : null,
    background: cs(bar) ? cs(bar).backgroundColor : null,
    borderTopWidth: cs(bar) ? cs(bar).borderTopWidth : null,
    borderTopStyle: cs(bar) ? cs(bar).borderTopStyle : null,
    zIndex: cs(bar) ? cs(bar).zIndex : null,
    bar: rect(bar), nav: rect(nav),
    btn: rect(btn), btnDisabled: btn ? btn.disabled : null,
    stepper: rect(stepper),
    price: rect(price),
    amountText: amount ? amount.textContent.trim() : null,
    badgeText: badge ? badge.textContent.trim() : null,
    oldText: old ? old.textContent.trim() : null,
    oldDecoration: old ? cs(old).textDecorationLine : null,
    currencySize: currency ? [Math.round(currency.getBoundingClientRect().width), Math.round(currency.getBoundingClientRect().height)] : null,
    toggleCount: document.querySelectorAll('#pdp-buy-bar .priceChanger').length,
    toggleActive: toggle ? (toggle.querySelector('span.active') || {}).textContent || null : null,
    buybox: rect(buyboxAdd),
    buyboxVisible: buyboxAdd ? cs(buyboxAdd).display !== 'none' && !!buyboxAdd.offsetParent : false,
    bodyPadBottom: cs(document.body).paddingBottom,
    viewport: { w: window.innerWidth, h: window.innerHeight },
  };
};

/* Is any page content hidden behind the fixed bar when scrolled to the end? */
const OVERLAP_PROBE = () => {
  window.scrollTo(0, document.documentElement.scrollHeight);
  const bar = document.getElementById('pdp-buy-bar');
  const barTop = bar.getBoundingClientRect().top;
  const last = document.querySelector('.related-products') ||
    document.querySelector('#product-detail-content > *:last-child');
  const r = last ? last.getBoundingClientRect() : null;
  return {
    barTop,
    lastBottom: r ? r.bottom : null,
    scrollY: window.scrollY,
    maxScroll: document.documentElement.scrollHeight - window.innerHeight,
  };
};

/* The authoritative cart, as the app itself sees it. */
const CART_PROBE = () => ({
  cart: (window.App && App.getCart ? App.getCart() : []).map(x => ({
    key: x.key, id: x.id, price: x.price, basePrice: x.basePrice,
    pricingMode: x.pricingMode, quantity: x.quantity,
  })),
  mode: window.ProductDetail && window.ProductDetail.getPricingMode ? window.ProductDetail.getPricingMode() : null,
});

async function freshCart(page, id) {
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(600);
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });

  /* Discover the fixture set from the page's own catalog. */
  const probe = await browser.newContext({ viewport: MOBILE });
  const probePage = await probe.newPage();
  await probePage.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded' });
  /* AppData is a top-level const (global lexical binding, not window.AppData) */
  await probePage.waitForFunction(() => typeof AppData !== 'undefined' && AppData.products && AppData.products.length > 0, null, { timeout: 15000 });
  const ids = await probePage.evaluate(() => AppData.products.map(p => ({
    id: p.id, inStock: !!p.inStock,
    hasOldPrice: !!p.oldPrice, discount: p.discount || 0,
    hasWholesale: !!(p.wholesalePrice && Number(p.wholesalePrice) > 0),
  })));
  await probe.close();
  const pick = pred => ids.filter(pred).map(x => x.id);
  const wholesaleId = (pick(x => x.hasWholesale && x.inStock)[0]);
  const discountedId = (pick(x => x.hasOldPrice && x.inStock)[0]);
  const plainId = (pick(x => !x.hasOldPrice && !x.hasWholesale && x.inStock)[0]);
  const outOfStockId = (pick(x => !x.inStock)[0]);
  const fixtures = [wholesaleId, discountedId, plainId, outOfStockId]
    .filter((v, i, a) => v != null && a.indexOf(v) === i);
  console.log(`fixtures: wholesale=${wholesaleId} discounted=${discountedId} plain=${plainId} outOfStock=${outOfStockId}\n`);

  /* ── Desktop: the bar must stay out of the way ─────────────── */
  for (const id of fixtures) {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const { page, errors } = await openProduct(ctx, id);
    const f = await page.evaluate(PRODUCT_FACTS, id);
    const s = await page.evaluate(BAR_PROBE);
    const tag = `desktop[${id} ${f.inStock ? 'in-stock' : 'out-of-stock'}]`;
    check(`${tag} bar hidden on desktop`, s.display === 'none', `display=${s.display}`);
    check(`${tag} bar occupies no layout box`, s.bar.width === 0 && s.bar.height === 0,
      `${s.bar.width}x${s.bar.height}`);
    check(`${tag} desktop body padding untouched`, s.bodyPadBottom === '0px', s.bodyPadBottom);
    check(`${tag} desktop buy box still visible`, s.buyboxVisible && s.buybox.width > 0,
      `w=${Math.round(s.buybox.width)}`);
    check(`${tag} desktop price still the buy-box price`,
      s.amountText === f.buyboxPriceText, `bar=${s.amountText} buybox=${f.buyboxPriceText}`);
    check(`${tag} no JS errors`, errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: path.join(OUT, `buybar-desktop-${id}.png`) });
    await ctx.close();
  }

  /* ── Mobile: geometry, pricing and discount logic ──────────── */
  for (const id of fixtures) {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const { page, errors } = await openProduct(ctx, id);
    const f = await page.evaluate(PRODUCT_FACTS, id);
    const s = await page.evaluate(BAR_PROBE);
    const tag = `mobile[${id} ${f.inStock ? 'in-stock' : 'out-of-stock'}]`;

    /* exactly one bar — no duplicates after re-render / catalog refresh */
    check(`${tag} exactly one buy bar`, s.count === 1, `count=${s.count}`);
    check(`${tag} bottom-space reserve flag set`, s.bodyClass === true);
    check(`${tag} bar visible + fixed`, s.display === 'flex' && s.position === 'fixed',
      `${s.display}/${s.position}`);
    check(`${tag} white background`, s.background === 'rgb(255, 255, 255)', s.background);
    check(`${tag} subtle top border`,
      s.borderTopWidth === '1px' && s.borderTopStyle === 'solid',
      `${s.borderTopWidth} ${s.borderTopStyle}`);
    check(`${tag} spans full viewport width`,
      near(s.bar.left, 0) && near(s.bar.right, s.viewport.w),
      `left=${s.bar.left} right=${s.bar.right}`);
    check(`${tag} sits directly above the mobile bottom nav`,
      near(s.bar.bottom, s.nav.top, 1), `bar.bottom=${s.bar.bottom} nav.top=${s.nav.top}`);
    check(`${tag} z-index above the bottom nav`,
      Number(s.zIndex) > 200, `z-index=${s.zIndex}`);

    /* bottom space reserved so content is never hidden behind the bar */
    const padPx = parseFloat(s.bodyPadBottom);
    check(`${tag} body reserves bar + nav band`,
      padPx >= s.bar.height + s.nav.height - 1,
      `pad=${s.bodyPadBottom} bar=${s.bar.height} nav=${s.nav.height}`);
    await page.evaluate(OVERLAP_PROBE);
    await page.waitForTimeout(200);
    const ov = await page.evaluate(OVERLAP_PROBE);
    check(`${tag} page bottom not obscured by bar`,
      ov.lastBottom !== null && ov.lastBottom <= ov.barTop + 1,
      `lastBottom=${Math.round(ov.lastBottom)} barTop=${Math.round(ov.barTop)} (scrolled ${Math.round(ov.scrollY)}/${Math.round(ov.maxScroll)})`);

    if (!f.inStock) {
      check(`${tag} bar shows a disabled out-of-stock control`,
        s.btnDisabled === true && s.btn && near(s.btn.height, 48), `disabled=${s.btnDisabled} h=${s.btn.height}`);
      check(`${tag} out-of-stock bar price still correct`, s.amountText === f.retailText,
        `${s.amountText} vs ${f.retailText}`);
    } else {
      /* 48px Add to Cart on the LEFT, pricing on the RIGHT */
      check(`${tag} Add to Cart button is 48px`,
        near(s.btn.height, 48) && near(s.btn.width, s.bar.width * 0.45, 4),
        `${Math.round(s.btn.width)}x${Math.round(s.btn.height)}`);
      const btnCx = s.btn.left + s.btn.width / 2;
      const priceCx = s.price.left + s.price.width / 2;
      check(`${tag} button on the left, price on the right`, btnCx < priceCx,
        `btn.cx=${Math.round(btnCx)} price.cx=${Math.round(priceCx)} viewport=${s.viewport.w}`);

      /* discount logic identical to the in-page buy box */
      check(`${tag} discount badge ${f.oldPrice ? 'shown' : 'hidden'}`,
        f.oldPrice ? !!s.badgeText : !s.badgeText, `badge=${s.badgeText}`);
      check(`${tag} old price ${f.oldPrice ? 'shown + struck' : 'hidden'}`,
        f.oldPrice ? (s.oldText === f.oldText && String(s.oldDecoration).includes('line-through')) : !s.oldText,
        `old=${s.oldText} deco=${s.oldDecoration}`);
      if (f.oldPrice) {
        check(`${tag} badge matches product discount`, s.badgeText === '٪' + f.discount, s.badgeText);
      }
      check(`${tag} current price reuses App.getProductPrice(retail)`,
        s.amountText === f.retailText, `${s.amountText} vs ${f.retailText}`);
      check(`${tag} Toman icon rendered`,
        !!s.currencySize && s.currencySize[0] > 4 && s.currencySize[1] > 4, JSON.stringify(s.currencySize));
      check(`${tag} bar never duplicates the page priceChanger id`,
        s.toggleCount === (f.hasWholesale ? 1 : 0), `toggleCount=${s.toggleCount} wholesale=${f.hasWholesale}`);
    }

    check(`${tag} no JS errors`, errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: path.join(OUT, `buybar-mobile-${id}.png`) });
    await ctx.close();
  }

  /* ── Wholesale toggle drives the bar price ─────────────────── */
  if (wholesaleId != null) {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const { page, errors } = await openProduct(ctx, wholesaleId);
    const f = await page.evaluate(PRODUCT_FACTS, wholesaleId);
    await page.click('#pdp-buy-bar .priceChanger span[data-mode="wholesale"]');
    await page.waitForTimeout(300);
    const after = await page.evaluate(BAR_PROBE);
    const c = await page.evaluate(CART_PROBE);
    check('mobile[wholesale] bar price follows the wholesale toggle',
      after.amountText === f.wholesaleText && after.amountText !== f.retailText,
      `${f.retailText} -> ${after.amountText} (want ${f.wholesaleText})`);
    check('mobile[wholesale] toggle marks the wholesale option active',
      (after.toggleActive || '').trim() === 'قیمت عمده', after.toggleActive);
    check('mobile[wholesale] shared pricing state updated', c.mode === 'wholesale', c.mode);

    await page.click('#pdp-buy-bar .priceChanger span[data-mode="retail"]');
    await page.waitForTimeout(300);
    check('mobile[wholesale] switching back restores retail',
      (await page.evaluate(BAR_PROBE)).amountText === f.retailText);
    check('mobile[wholesale] no JS errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  /* ── Add to cart from the bar uses the existing cart handler ── */
  {
    const id = discountedId ?? plainId;
    const ctx = await browser.newContext({ viewport: MOBILE });
    const { page, errors } = await openProduct(ctx, id);
    await freshCart(page, id);
    const f = await page.evaluate(PRODUCT_FACTS, id);

    await page.click('#pdp-buy-bar-add');
    await page.waitForTimeout(700);
    let c = await page.evaluate(CART_PROBE);
    check('mobile[cart] bar add-to-cart adds the retail line',
      !!(c.cart && c.cart.length === 1 && c.cart[0].key === id + '_retail' &&
         c.cart[0].pricingMode === 'retail' && c.cart[0].quantity === 1 &&
         c.cart[0].price === f.retail),
      JSON.stringify(c.cart));

    /* control flips to the shared quantity stepper, in both places */
    check('mobile[cart] bar switches to the quantity stepper', !!(await page.$('#pdp-buy-bar-qty')));
    check('mobile[cart] buy box shows the same stepper', !!(await page.$('#product-qty')));
    check('mobile[cart] no duplicate add buttons left',
      !(await page.$('#pdp-buy-bar-add')) && !(await page.$('#product-add-to-cart')));

    await page.click('#pdp-buy-bar-cart .qty-selector__btn--plus');
    await page.waitForTimeout(600);
    c = await page.evaluate(CART_PROBE);
    check('mobile[cart] bar stepper updates the shared cart',
      c.cart && c.cart[0] && c.cart[0].quantity === 2, JSON.stringify(c.cart));

    /* Structural anti-duplication guarantee: the bar is emitted inside
       #product-detail-content, which product.js replaces wholesale via
       innerHTML, so a re-render can never leave a second bar behind. */
    check('mobile[cart] bar lives in the re-rendered content root and stays single',
      await page.evaluate(() =>
        document.querySelectorAll('#product-detail-content > #pdp-buy-bar').length === 1 &&
        document.querySelectorAll('#pdp-buy-bar').length === 1));
    check('mobile[cart] no JS errors', errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: path.join(OUT, 'buybar-mobile-incart.png') });
    await ctx.close();
  }

  /* ── Wholesale line added from the bar keeps its own key ───── */
  if (wholesaleId != null) {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const { page } = await openProduct(ctx, wholesaleId);
    await freshCart(page, wholesaleId);
    const f = await page.evaluate(PRODUCT_FACTS, wholesaleId);
    await page.click('#pdp-buy-bar .priceChanger span[data-mode="wholesale"]');
    await page.waitForTimeout(300);
    await page.click('#pdp-buy-bar-add');
    await page.waitForTimeout(700);
    const c = await page.evaluate(CART_PROBE);
    check('mobile[wholesale] bar add uses the wholesale price',
      !!(c.cart && c.cart.length === 1 && c.cart[0].key === wholesaleId + '_wholesale' &&
         c.cart[0].price === f.wholesale),
      JSON.stringify(c.cart));
    await ctx.close();
  }

  /* ── Legacy .html URL must resolve to the same single bar ───── */
  {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/product.html?slug=makita-5903b`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 15000 });
    await page.waitForTimeout(400);
    const url = page.url();
    check('mobile[route] legacy /product.html?slug= lands on the clean URL with one bar',
      /\/product\/makita-5903b$/.test(url) &&
      (await page.evaluate(() => document.querySelectorAll('#pdp-buy-bar').length)) === 1, url);
    await ctx.close();
  }

  /* ── Other storefront pages must NOT grow a bar ─────────────── */
  for (const p of ['/shop', '/']) {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1200);
    check(`mobile[scope] no buy bar on ${p}`,
      (await page.evaluate(() => document.querySelectorAll('#pdp-buy-bar').length)) === 0 &&
      !(await page.evaluate(() => document.body.classList.contains('has-pdp-buy-bar'))));
    await ctx.close();
  }

  await browser.close();

  const failed = results.filter(r => !r.ok);
  console.log('\n' + '='.repeat(66));
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('\nFAILURES:');
    for (const f of failed) console.log('  - ' + f.name + (f.detail ? '   [' + f.detail + ']' : ''));
  }
  console.log(`screenshots: ${OUT}`);
  process.exit(failed.length ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });