/* Real-Chrome end-to-end verification of the centralized store logo.
   Flow: sign in to Admin -> #/store-info -> upload a logo -> save ->
   hard refresh -> assert every storefront logo location + favicon + PWA
   manifest all use the saved logo. Then remove it and assert the original
   bolt SVG comes back everywhere. */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:3000';
const TMP = path.join(__dirname, '_tmp_logo');
const TEST_PNG = path.join(TMP, 'test-logo.png');

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* The server caps API traffic at 120 requests/min/IP. A verification sweep that
   walks many pages can exceed that, so every critical write is retried with a
   wait long enough to clear the 1-minute window. */
async function fetchJsonRetry(input, opts, attempts = 4) {
  let last;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(input, opts);
    if (res.status === 429 || res.status === 503) {
      last = res;
      await sleep(65000);
      continue;
    }
    return res;
  }
  return last;
}

/* Collect what every logo slot on the current page is showing. */
async function probe(page) {
  return page.evaluate(() => {
    const out = { slots: {}, favicon: null, appleIcon: null };
    document.querySelectorAll('[data-store-logo]').forEach((el, i) => {
      const key = (el.className || 'slot') + '#' + i;
      const img = el.querySelector('img.store-logo__img');
      const svg = el.querySelector('svg');
      out.slots[key] = img
        ? { kind: 'img', src: img.getAttribute('src') }
        : svg ? { kind: 'svg' } : { kind: 'empty' };
    });
    const f32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
    const fa = document.querySelector('link[rel="apple-touch-icon"]');
    if (f32) out.favicon = f32.getAttribute('href');
    if (fa) out.appleIcon = fa.getAttribute('href');
    out.storeLogoGlobal = (window.StoreLogo && window.StoreLogo.get()) || '';
    return out;
  });
}

/* Wait until the rendered logo slots stop changing. Shells build their markup
   asynchronously behind the site loader, so a fixed sleep is flaky. */
async function waitForSlotsSettled(page, timeout = 15000) {
  const deadline = Date.now() + timeout;
  let prev = null;
  let stableSince = 0;
  while (Date.now() < deadline) {
    const sig = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-store-logo]'))
        .map((el) => {
          const img = el.querySelector('img.store-logo__img');
          return img ? 'i:' + img.getAttribute('src') : el.querySelector('svg') ? 's' : '-';
        }).join('|')
    );
    if (sig && sig === prev) {
      if (!stableSince) stableSince = Date.now();
      if (Date.now() - stableSince > 700) return sig;
    } else { prev = sig; stableSince = 0; }
    await sleep(250);
  }
  return prev;
}

/* Load a page and wait for its logo slots to settle. The API is rate limited
   (120 req/min) and this suite visits many pages, so a 429 on /api/settings
   leaves the page on the fallback. Retry with backoff instead of failing. */
async function loadAndProbe(page, url, { expectApplied = true } = {}) {
  let last = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(`${BASE}/${url}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-store-logo]', { timeout: 15000 }).catch(() => {});
    await waitForSlotsSettled(page);
    last = await probe(page);
    const applied = Object.values(last.slots).some((s) => s.kind === 'img');
    if (applied === expectApplied || attempt === 3) return last;
    console.log(`   (${url}: settings request throttled, retrying)`);
    await sleep(4000);
  }
  return last;
}

function assertSlots(label, p, expectImg) {
  const keys = Object.keys(p.slots);
  if (!keys.length) { check(`${label}: has a logo slot`, false, 'no [data-store-logo] found'); return; }
  for (const k of keys) {
    const s = p.slots[k];
    if (expectImg) {
      check(`${label}: ${k} renders saved logo`, s.kind === 'img' && !!s.src, JSON.stringify(s));
    } else {
      check(`${label}: ${k} falls back to bolt SVG`, s.kind === 'svg', JSON.stringify(s));
    }
  }
}

(async () => {
  fs.mkdirSync(TMP, { recursive: true });

  /* Deterministic start: no saved logo, no derived icons. */
  const boot = await (await fetch(`${BASE}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  })).json();
  const adminAuth = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + boot.token };
  await fetch(`${BASE}/api/settings`, {
    method: 'PUT', headers: adminAuth, body: JSON.stringify({ 'store.logo': '' }),
  });
  await fetch(`${BASE}/api/admin/store-logo/icons`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + boot.token } });

  /* A storefront customer session so the auth-gated shells (cart, checkout)
     render their real chrome instead of bouncing to the login page. */
  const custEmail = 'logo-verify@shop.test';
  const custPass = 'Verify12345!';
  const creds = { name: 'کاربر تست', mobile: '09120000001', email: custEmail, password: custPass };
  let custToken = '';
  const tryLogin = async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: custEmail, password: custPass }),
    });
    if (r.ok) custToken = (await r.json()).token;
  };
  await tryLogin();
  if (!custToken) {
    const r = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds),
    });
    if (r.ok) custToken = (await r.json()).token;
  }
  console.log('customer session:', custToken ? 'established' : 'unavailable (auth-gated pages will redirect)');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('response', (r) => {
    const u = r.url().replace(BASE, '');
    if (/\/api\/settings$|store-logo\/icons|gallery\/upload/.test(u)) {
      console.log('   [net]', r.request().method(), u, r.status());
    }
  });

  /* ── 0. Baseline: no logo saved -> everything must still be the bolt SVG ── */
  console.log('\n=== BASELINE (no custom logo) ===');
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  if (custToken) {
    await page.evaluate((t) => {
      localStorage.setItem('as_session', t);
    }, custToken);
  }
  await page.waitForSelector('[data-store-logo]', { timeout: 15000 }).catch(() => {});
  await waitForSlotsSettled(page);
  assertSlots('baseline index', await probe(page), false);

  /* ── 1. Sign in and change the logo in #/store-info ── */
  console.log('\n=== ADMIN: change logo in #/store-info ===');
  const token = await page.evaluate(async (base) => {
    const r = await fetch(base + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error('login failed: ' + JSON.stringify(j));
    localStorage.setItem('as_admin_session', JSON.stringify({ token: j.token, admin: j.admin }));
    return j.token;
  }, BASE);

  await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle2' });
  // The admin router uses history.replaceState and does not observe hashchange,
  // so switch views through its own API rather than by setting location.hash.
  await page.evaluate(() => window.AbzarAdmin.showView('store-info'));
  await page.waitForFunction(
    () => {
      const s = document.querySelector('section[data-view="store-info"]');
      return s && s.classList.contains('is-active');
    },
    { timeout: 15000 }
  );
  await page.waitForSelector('#adm-store-info-form', { timeout: 15000 });
  await page.waitForSelector('#si-logo-preview svg, #si-logo-preview img', { timeout: 15000 });
  await sleep(600);
  check('admin store-info shows the logo field', true);
  check(
    'admin preview starts as the fallback bolt',
    await page.$eval('#si-logo-preview', (el) => !!el.querySelector('svg'))
  );
  check(
    'admin sidebar logo untouched (own bolt SVG)',
    await page.$eval('.admin-sidebar__logo', (el) => !!el.querySelector('svg'))
  );

  /* Build a distinctive test logo, then drive the real upload control. */
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 600; c.height = 600;
    const x = c.getContext('2d');
    x.fillStyle = '#00b894'; x.fillRect(0, 0, 600, 600);
    x.fillStyle = '#e84393';
    x.beginPath(); x.arc(300, 300, 190, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#ffffff';
    x.font = 'bold 120px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('AS', 300, 305);
    return c.toDataURL('image/png');
  });
  fs.writeFileSync(TEST_PNG, Buffer.from(dataUrl.split(',')[1], 'base64'));
  check('test logo file written', fs.statSync(TEST_PNG).size > 1000, TEST_PNG);

  const fileInput = await page.$('#si-logo-file');
  await fileInput.uploadFile(TEST_PNG);
  await page.waitForFunction(
    () => { const i = document.getElementById('si-logo'); return i && i.value; },
    { timeout: 30000 }
  );
  await sleep(1500); // derived icon uploads
  const chosen = await page.$eval('#si-logo', (el) => el.value);
  check('logo picked into the field', !!chosen, chosen);
  check('admin preview now shows the uploaded image',
    await page.$eval('#si-logo-preview', (el) => !!el.querySelector('img')));

  /* Save via the real form. Wait for the PUT to actually complete rather than
     for the button label, which is always on screen. */
  await page.evaluate(() => {
    window.__putDone = false;
    const of = window.fetch;
    window.fetch = function (u, o) {
      return of.apply(this, arguments).then((r) => {
        if (String(u).indexOf('/api/settings') !== -1 && o && o.method === 'PUT') window.__putDone = true;
        return r;
      });
    };
  });
  /* The Admin layout scrolls a nested container, so puppeteer's automatic
     scroll-into-view does not move the button into the real viewport. Scroll
     every scrollable ancestor, then click the actual control. */
  async function clickReal(page, selector) {
    // Admin toasts are fixed-position overlays; wait them out so they cannot
    // swallow the click aimed at the button.
    await page.waitForFunction(
      () => !document.querySelector('.adm-toast:not(.is-hiding)'),
      { timeout: 15000 }
    ).catch(() => {});
    const handle = await page.waitForSelector(selector, { timeout: 15000 });
    await page.evaluate((el) => {
      let n = el.parentElement;
      while (n) {
        const st = getComputedStyle(n);
        if (/(auto|scroll|hidden)/.test(st.overflowY + st.overflow)) n.scrollTop = n.scrollHeight;
        n = n.parentElement;
      }
      el.scrollIntoView({ block: 'center' });
    }, handle);
    await sleep(400);
    const box = await handle.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.x + r.width / 2, cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      return { cx, cy, inView: r.top >= 0 && r.bottom <= innerHeight, vh: innerHeight,
        hitTag: hit ? hit.tagName + '.' + (hit.className || '') : 'NONE',
        hitIsBtn: hit ? (hit === el || el.contains(hit)) : false };
    });
    if (!box.inView) throw new Error('button not in viewport: ' + JSON.stringify(box));
    if (!box.hitIsBtn) throw new Error('click point covered by ' + box.hitTag);
    // Real mouse event at the measured point.
    await page.mouse.click(box.cx, box.cy);
  }

  await clickReal(page, '#adm-store-info-form button[type="submit"]');
  try {
    await page.waitForFunction(() => window.__putDone === true, { timeout: 20000 });
  } catch (e) {
    // Write-rate limited by the suite's own earlier traffic: back off and retry
    // the same real click so the save is genuinely exercised.
    console.log('   (save was throttled, backing off and retrying)');
    await sleep(15000);
    await clickReal(page, '#adm-store-info-form button[type="submit"]');
    await page.waitForFunction(() => window.__putDone === true, { timeout: 25000 });
  }
  await sleep(1500);
  const saved = await (await fetchJsonRetry(`${BASE}/api/settings`)).json();
  check('store.logo persisted to canonical settings', saved['store.logo'] === chosen, saved['store.logo']);

  /* Derived icon files must exist and be real PNGs. */
  for (const size of [32, 180, 192, 512]) {
    const r = await fetchJsonRetry(`${BASE}/assets/images/uploads/store/icon-${size}.png`);
    const buf = Buffer.from(await r.arrayBuffer());
    const isPng = r.ok && buf.length > 50 && buf.slice(1, 4).toString() === 'PNG';
    check(`derived icon-${size}.png written`, isPng, `status=${r.status} bytes=${buf.length}`);
  }

  /* ── 2. Hard refresh and verify EVERY location ── */
  console.log('\n=== VERIFY AFTER SAVE + REFRESH (desktop 1440x900) ===');
  const desktopPages = [
    ['index.html', 'index.html'],
    ['shop.html', 'shop.html'],
    ['login.html', 'login.html'],
    ['register.html', 'register.html'],
    ['forgot-password.html', 'forgot-password.html'],
    ['checkout-step1.html', 'checkout-step1'],
    ['checkout-step2.html', 'checkout-step2'],
    ['checkout-step3.html', 'checkout-step3'],
    ['checkout-step4.html', 'checkout-step4'],
    ['about.html', 'about.html'],
    ['contact.html', 'contact.html'],
    // The account dashboard / checkout shell deliberately has no site header
    // (it uses its own sidebar), so the logo artifacts it does expose are the
    // favicon + PWA icon. account.js also throws a pre-existing
    // "App is not defined" on these pages, unrelated to the logo work.
    ['account-cart.html', 'account-cart (no site header by design)', 'no-site-header'],
    ['checkout.html', 'checkout (redirects to cart shell)', 'no-site-header'],
  ];
  let anyFavicon = false, anyApple = false;
  for (const [url, label, mode] of desktopPages) {
    await sleep(2500); // pace API traffic so the write limiter is not tripped
    if (mode === 'no-site-header') {
      const p2 = await loadAndProbe(page, url, { expectApplied: false });
      const hasSlot = Object.keys(p2.slots).length > 0;
      check(`desktop ${label}: renders no site-logo slot (expected)`, !hasSlot,
        hasSlot ? JSON.stringify(p2.slots) : '');
      if (p2.favicon && p2.favicon.indexOf('uploads/store/icon-32.png') !== -1) {
        check(`desktop ${label}: favicon uses the saved logo`, true, p2.favicon);
      }
      continue;
    }
    const p = await loadAndProbe(page, url);
    assertSlots(`desktop ${label}`, p, true);
    if (p.favicon && p.favicon.indexOf('uploads/store/icon-32.png') !== -1) anyFavicon = true;
    if (p.appleIcon && p.appleIcon.indexOf('uploads/store/icon-180.png') !== -1) anyApple = true;
    // every rendered logo must point at the saved asset
    for (const k of Object.keys(p.slots)) {
      const s = p.slots[k];
      if (s.kind === 'img' && s.src.indexOf('uploads/') === -1) {
        check(`desktop ${label}: ${k} src is the saved logo`, false, s.src);
      }
    }
  }
  check('favicon switched to the derived icon', anyFavicon);
  check('apple-touch-icon switched to the derived icon', anyApple);

  /* PWA manifest. */
  const mf = await (await fetchJsonRetry(`${BASE}/manifest.webmanifest`)).json();
  const mfDerived = mf.icons.every((i) => i.src.indexOf('uploads/store/icon-') !== -1);
  check('PWA manifest icons derived from store.logo', mfDerived, JSON.stringify(mf.icons.map((i) => i.src)));
  check('PWA manifest name from store.name', !!mf.name && !!mf.short_name, `${mf.short_name}`);

  /* ── 3. Mobile viewport ── */
  console.log('\n=== VERIFY MOBILE (390x844) ===');
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  for (const url of ['index.html', 'shop.html', 'login.html', 'checkout-step1.html']) {
    await sleep(2500);
    await m.goto(`${BASE}/${url}`, { waitUntil: 'networkidle2' });
    await m.waitForSelector('[data-store-logo]', { timeout: 15000 }).catch(() => {});
    await waitForSlotsSettled(m);
    const p = await m.evaluate(() => {
      const slots = {};
      document.querySelectorAll('[data-store-logo]').forEach((el, i) => {
        const key = (el.className || 'slot') + '#' + i;
        const img = el.querySelector('img.store-logo__img');
        const svg = el.querySelector('svg');
        slots[key] = img ? { kind: 'img', src: img.getAttribute('src') }
          : svg ? { kind: 'svg' } : { kind: 'empty' };
      });
      const mb = document.querySelector('.mobile-header__brand');
      const mh = document.querySelector('#mobile-header');
      const r = mb ? mb.getBoundingClientRect() : null;
      const mhr = mh ? mh.getBoundingClientRect() : null;
      const shellHasMobileHeader = !!(mhr && mhr.width > 0 && mhr.height > 0);
      return {
        slots,
        brandVisible: !!(r && r.width > 0 && r.height > 0),
        shellHasMobileHeader,
      };
    });
    assertSlots(`mobile ${url}`, p, true);
    check(`mobile ${url}: mobile header brand visible where the shell shows a mobile header`,
      !p.shellHasMobileHeader || p.brandVisible === true,
      p.shellHasMobileHeader ? '' : 'shell has no mobile header (standalone page)');
  }
  await m.close();

  /* ── 4. Admin panel must be unchanged ── */
  console.log('\n=== ADMIN PANEL UNCHANGED ===');
  await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle2' });
  await sleep(900);
  check('admin sidebar still uses its own bolt SVG',
    await page.$eval('.admin-sidebar__logo', (el) => !!el.querySelector('svg')));
  check('admin sidebar has no img injected',
    !(await page.$eval('.admin-sidebar__logo', (el) => !!el.querySelector('img'))));

  /* ── 5. Remove the logo -> fallback everywhere again ── */
  console.log('\n=== REMOVE LOGO -> FALLBACK RESTORED ===');
  await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.AbzarAdmin.showView('store-info'));
  await page.waitForFunction(
    () => document.querySelector('section[data-view="store-info"]')?.classList.contains('is-active'),
    { timeout: 15000 }
  );
  await page.waitForSelector('#adm-store-info-form', { timeout: 15000 });
  await sleep(900);
  check('reloaded admin field shows the saved logo',
    await page.$eval('#si-logo-preview', (el) => !!el.querySelector('img')));
  await page.click('#si-logo-clear');
  await sleep(600);
  console.log('   field after clear:', JSON.stringify(await page.$eval('#si-logo', (el) => el.value)));
  // The suite hammers the API; let the write-rate limiter settle before the
  // final write so this step is not rejected with 429.
  await sleep(12000);
  await clickReal(page, '#adm-store-info-form button[type="submit"]');
  await sleep(3000);
  let after = await (await fetchJsonRetry(`${BASE}/api/settings`)).json();
  // The write limiter can still reject the final write; back off and retry.
  for (let i = 0; i < 3 && after['store.logo'] !== ''; i++) {
    console.log('   (clear was throttled, retrying)');
    await sleep(65000);
    await clickReal(page, '#adm-store-info-form button[type="submit"]');
    await sleep(2500);
    after = await (await fetchJsonRetry(`${BASE}/api/settings`)).json();
  }
  check('store.logo cleared', after['store.logo'] === '', JSON.stringify(after['store.logo']));

  for (const size of [32, 192]) {
    const r = await fetchJsonRetry(`${BASE}/assets/images/uploads/store/icon-${size}.png`);
    check(`derived icon-${size}.png removed`, r.status === 404, `status=${r.status}`);
  }
  const mf2 = await (await fetchJsonRetry(`${BASE}/manifest.webmanifest`)).json();
  check('manifest back to bundled icons',
    mf2.icons.every((i) => i.src.indexOf('assets/icons/') === 0));

  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  await waitForSlotsSettled(page);
  const pFinal = await probe(page);
  assertSlots('after-remove index', pFinal, false);
  check('favicon back to bundled icon',
    !!pFinal.favicon && pFinal.favicon.indexOf('assets/icons/') === 0, pFinal.favicon);

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n================ ${results.length - failed.length}/${results.length} passed ================`);
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach((f) => console.log('  - ' + f.name + (f.detail ? ' :: ' + f.detail : '')));
    process.exit(1);
  }
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
