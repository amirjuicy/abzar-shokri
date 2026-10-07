/* Real-Chrome verification: a custom store.logo must REPLACE the original
   yellow/bolt logo rendering completely (no bolt SVG left behind, no yellow
   badge background/shadow showing through), every storefront logo location
   must behave the same way, the admin sidebar bolt logo must stay untouched,
   and removing the custom logo must restore the original yellow/bolt logo
   exactly. */
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

const PAGES = [
  'index.html', 'shop.html', 'login.html', 'register.html',
  'forgot-password.html', 'checkout-step1.html', 'checkout-step2.html',
  'checkout-step3.html', 'checkout-step4.html', 'about.html', 'contact.html',
];

/* Probe every logo slot: what it renders (img vs svg), whether the custom
   marker class is present, and the computed badge chrome (background,
   gradient, shadow) that makes the original logo the "yellow logo". */
async function probe(page) {
  return page.evaluate(() => {
    const slots = [];
    document.querySelectorAll('[data-store-logo]').forEach((el, i) => {
      const img = el.querySelector('img.store-logo__img');
      const svg = el.querySelector('svg');
      const cs = getComputedStyle(el);
      slots.push({
        i,
        cls: (el.className || '').toString(),
        kind: img ? 'img' : svg ? 'svg' : 'empty',
        src: img ? img.getAttribute('src') : null,
        hasSvg: !!svg,
        customClass: el.classList.contains('store-logo--custom'),
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage,
        shadow: cs.boxShadow,
      });
    });
    const f32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
    return {
      slots,
      favicon: f32 ? f32.getAttribute('href') : null,
      storeLogoGlobal: (window.StoreLogo && window.StoreLogo.get()) || '',
    };
  });
}

async function waitForSlotsSettled(page, timeout = 15000) {
  const deadline = Date.now() + timeout;
  let prev = null, stableSince = 0;
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
      if (Date.now() - stableSince > 700) return;
    } else { prev = sig; stableSince = 0; }
    await sleep(250);
  }
}

/* The API is rate limited and shells fetch /api/settings asynchronously, so a
   slow response can leave a page on the fallback when we first probe it.
   Retry until the rendered slots match the expected mode. */
async function loadAndProbe(page, url, mode, logoUrl) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(`${BASE}/${url}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-store-logo]', { timeout: 15000 }).catch(() => {});
    await waitForSlotsSettled(page);
    await sleep(600);
    const p = await probe(page);
    const applied = Object.values(p.slots).some((s) => s.kind === 'img');
    if (applied === (mode === 'custom') || attempt === 3) return p;
    console.log(`   (${url}: settings not applied yet, retrying)`);
    await sleep(4000);
  }
}

/* Hard assertions about the badge chrome for one probe result. */
function assertSlots(label, p, mode, logoUrl) {
  const keys = p.slots.map((s) => s.cls + '#' + s.i);
  if (!keys.length) { check(`${label}: has logo slots`, false, 'none found'); return; }
  for (const s of p.slots) {
    const id = `${label}: ${s.cls}#${s.i}`;
    if (mode === 'custom') {
      check(`${id} renders the saved logo`, s.kind === 'img' && s.src === logoUrl, JSON.stringify({ kind: s.kind, src: s.src }));
      check(`${id} bolt SVG fully gone`, !s.hasSvg, '');
      check(`${id} yellow badge background gone`, s.bg === 'rgba(0, 0, 0, 0)' && s.bgImage === 'none', `bg=${s.bg} bgImage=${s.bgImage}`);
      check(`${id} badge shadow gone`, s.shadow === 'none', s.shadow);
      check(`${id} marked as custom`, s.customClass === true, '');
    } else {
      check(`${id} falls back to bolt SVG`, s.kind === 'svg' && s.hasSvg, JSON.stringify({ kind: s.kind }));
      check(`${id} not marked as custom`, s.customClass === false, '');
      const yellow = s.bg === 'rgb(245, 196, 0)' || /gradient/.test(s.bgImage);
      const transparent = s.bg === 'rgba(0, 0, 0, 0)' && s.bgImage === 'none';
      check(`${id} original badge chrome intact`, yellow || transparent, `bg=${s.bg} bgImage=${s.bgImage}`);
    }
  }
}

(async () => {
  fs.mkdirSync(TMP, { recursive: true });

  /* ── Deterministic start: no saved logo, no derived icons ── */
  const boot = await (await fetch(`${BASE}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  })).json();
  const adminAuth = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + boot.token };
  await fetch(`${BASE}/api/settings`, {
    method: 'PUT', headers: adminAuth, body: JSON.stringify({ 'store.logo': '' }),
  });
  await fetch(`${BASE}/api/admin/store-logo/icons`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + boot.token } });

  /* Customer session so auth-gated shells render their real chrome. */
  const custEmail = 'logo-replace@shop.test';
  const custPass = 'Verify12345!';
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'کاربر', lastName: 'تست', mobile: '09120000009', email: custEmail, password: custPass }),
    });
    if (r.ok) custToken = (await r.json()).token;
  }
  console.log('customer session:', custToken ? 'established' : 'unavailable');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));

  /* ── 0. BASELINE: no custom logo -> bolt SVG + yellow badge everywhere ── */
  console.log('\n=== BASELINE (no custom logo) ===');
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  if (custToken) await page.evaluate((t) => localStorage.setItem('as_session', t), custToken);
  const baseline = {};
  for (const url of PAGES) {
    baseline[url] = await loadAndProbe(page, url, 'baseline');
    assertSlots(`baseline ${url}`, baseline[url], 'baseline');
  }
  check('baseline favicon is the bundled bolt icon',
    baseline['index.html'].favicon === 'assets/icons/favicon-32.png', baseline['index.html'].favicon);

  /* ── 1. Upload a distinctive (magenta) test logo through the real APIs ── */
  console.log('\n=== SET custom logo ===');
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 600; c.height = 600;
    const x = c.getContext('2d');
    x.fillStyle = '#e84393'; x.fillRect(0, 0, 600, 600);
    x.fillStyle = '#ffffff';
    x.font = 'bold 200px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('AS', 300, 310);
    return c.toDataURL('image/png');
  });
  fs.writeFileSync(TEST_PNG, Buffer.from(dataUrl.split(',')[1], 'base64'));
  check('test logo file written', fs.statSync(TEST_PNG).size > 1000, TEST_PNG);

  const b64 = fs.readFileSync(TEST_PNG).toString('base64');
  const up = await page.evaluate(async (args) => {
    const blob = await (await fetch('data:image/png;base64,' + args.b64)).blob();
    const fd = new FormData();
    fd.append('image', blob, 'test-logo.png');
    const r = await fetch(args.base + '/api/admin/gallery/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + args.token },
      body: fd,
    });
    return { status: r.status, body: await r.json() };
  }, { base: BASE, token: boot.token, b64 });
  check('logo uploaded via gallery API', up.status === 201, JSON.stringify(up.body));
  const logoUrl = up.body.url;

  /* Derived PWA/favicon icons, same as the admin UI produces. */
  for (const size of [32, 180, 192, 512]) {
    const iconB64 = await page.evaluate((s) => {
      const c = document.createElement('canvas');
      c.width = s; c.height = s;
      const x = c.getContext('2d');
      x.fillStyle = '#e84393'; x.fillRect(0, 0, s, s);
      return c.toDataURL('image/png').split(',')[1];
    }, size);
    const ir = await page.evaluate(async (args) => {
      const blob = await (await fetch('data:image/png;base64,' + args.b64)).blob();
      const fd = new FormData();
      fd.append('icon', blob, `icon-${args.size}.png`);
      fd.append('size', String(args.size));
      const r = await fetch(args.base + '/api/admin/store-logo/icons', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + args.token },
        body: fd,
      });
      return r.status;
    }, { base: BASE, token: boot.token, b64: iconB64, size });
    check(`derived icon ${size} uploaded`, ir === 201, `status=${ir}`);
  }

  const saved = await (await fetch(`${BASE}/api/settings`, {
    method: 'PUT', headers: adminAuth, body: JSON.stringify({ 'store.logo': logoUrl }),
  })).json();
  check('store.logo persisted', saved['store.logo'] === logoUrl, saved['store.logo']);

  /* ── 2. CUSTOM LOGO: original yellow/bolt must be COMPLETELY gone ── */
  console.log('\n=== CUSTOM LOGO (original must be gone) ===');
  const custom = {};
  for (const url of PAGES) {
    custom[url] = await loadAndProbe(page, url, 'custom', logoUrl);
    assertSlots(`custom ${url}`, custom[url], 'custom', logoUrl);
  }
  check('custom favicon uses derived icon',
    /store\/icon-32\.png/.test(custom['index.html'].favicon || ''), custom['index.html'].favicon);

  /* Admin sidebar bolt logo must be untouched by the custom logo. */
  await page.evaluate((t) => localStorage.setItem('as_admin_session', JSON.stringify({ token: t, admin: {} })), boot.token);
  await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle2' });
  await sleep(1200);
  const adminSidebar = await page.evaluate(() => {
    const el = document.querySelector('.admin-sidebar__logo');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { hasSvg: !!el.querySelector('svg'), hasImg: !!el.querySelector('img'), bgImage: cs.backgroundImage, bg: cs.backgroundColor };
  });
  check('admin sidebar logo still the bolt SVG', !!adminSidebar && adminSidebar.hasSvg && !adminSidebar.hasImg, JSON.stringify(adminSidebar));
  check('admin sidebar badge still yellow', !!adminSidebar && /gradient/.test(adminSidebar.bgImage), JSON.stringify(adminSidebar));

  /* ── 3. REMOVE the logo -> original yellow/bolt restored exactly ── */
  console.log('\n=== REMOVE custom logo (original must come back) ===');
  await fetch(`${BASE}/api/admin/store-logo`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + boot.token } });
  const after = await (await fetch(`${BASE}/api/settings`)).json();
  check('store.logo cleared', after['store.logo'] === '', JSON.stringify(after['store.logo']));

  const restored = {};
  for (const url of PAGES) {
    restored[url] = await loadAndProbe(page, url, 'baseline');
    assertSlots(`restored ${url}`, restored[url], 'baseline');
  }
  check('restored favicon is the bundled bolt icon',
    restored['index.html'].favicon === 'assets/icons/favicon-32.png', restored['index.html'].favicon);

  /* Admin sidebar still untouched after the logo round-trip. */
  await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle2' });
  await sleep(1200);
  const adminSidebar2 = await page.evaluate(() => {
    const el = document.querySelector('.admin-sidebar__logo');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { hasSvg: !!el.querySelector('svg'), hasImg: !!el.querySelector('img'), bgImage: cs.backgroundImage };
  });
  check('admin sidebar logo still the bolt SVG (after round-trip)', !!adminSidebar2 && adminSidebar2.hasSvg && !adminSidebar2.hasImg, JSON.stringify(adminSidebar2));
  check('admin sidebar badge still yellow (after round-trip)', !!adminSidebar2 && /gradient/.test(adminSidebar2.bgImage), JSON.stringify(adminSidebar2));

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach((f) => console.log('  - ' + f.name + (f.detail ? '  -> ' + f.detail : '')));
    process.exit(1);
  }
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
