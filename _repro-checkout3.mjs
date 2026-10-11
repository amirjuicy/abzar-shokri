import puppeteer from 'puppeteer-core';

const BASE = 'http://127.0.0.1:3000';
const MOBILE = '09129998877';
const PASS = 'test1234';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('request', (r) => {
  const u = r.url();
  if (u.includes('/api/orders') && r.method() === 'POST') console.log('[req] POST /api/orders auth=', r.headers().authorization || 'NONE');
});
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/api/orders') && !u.includes('card-receipt')) {
    let body = ''; try { body = (await r.text()).slice(0, 260); } catch (e) {}
    console.log('[res]', r.status(), body);
  }
  if (u.includes('/api/auth/login') && r.request().method() === 'POST') {
    let body = ''; try { body = (await r.text()).slice(0, 200); } catch (e) {}
    console.log('[login res]', r.status(), body);
  }
});

// ── Login with explicit selector ──
await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
await page.waitForSelector('#login-identifier, input[type="text"], input[name="identifier"]', { timeout: 10000 });
const sel = await page.evaluate(() => {
  const cands = ['#login-identifier', 'input[name="identifier"]', 'input[type="tel"]'];
  for (const c of cands) if (document.querySelector(c)) return c;
  // find the input inside the card/form that also has a password sibling
  const pw = document.querySelector('input[type="password"]');
  if (pw && pw.form) { const ins = pw.form.querySelectorAll('input'); return ins[0].id || ins[0].name || ''; }
  return '';
});
console.log('identifier selector:', JSON.stringify(sel));
const idInput = sel ? await page.$(sel) : (await page.$$('input[type="text"]'))[0];
const pwInput = await page.$('input[type="password"]');
await idInput.click({ clickCount: 3 });
await idInput.type(MOBILE);
await pwInput.type(PASS);
await page.evaluate(() => {
  const pw = document.querySelector('input[type="password"]');
  const btn = (pw.form && pw.form.querySelector('button[type="submit"]')) || document.querySelector('button[type="submit"]');
  btn.click();
});
await new Promise((r) => setTimeout(r, 3500));
const session1 = await page.evaluate(() => localStorage.getItem('as_session'));
console.log('session after login:', session1 ? session1.slice(0, 120) : 'NULL');
if (!session1) { console.log('LOGIN FAILED — abort'); await browser.close(); process.exit(1); }

// ── Cart ──
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await page.evaluate(() => App.addToCart(1));
await new Promise((r) => setTimeout(r, 600));

// ── Checkout ──
await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

const mid = await page.evaluate(() => ({
  session: (localStorage.getItem('as_session') || 'NULL').slice(0, 80),
  loggedIn: (function () { try { return App.isLoggedIn(); } catch (e) { return 'ERR'; } })(),
  user: (function () { try { var u = App.getCurrentUser(); return u && u.id; } catch (e) { return 'ERR'; } })(),
}));
console.log('checkout state:', JSON.stringify(mid));

await page.evaluate(() => {
  const pv = document.querySelector('#province-select');
  if (pv) { pv.value = 'تهران'; pv.dispatchEvent(new Event('change', { bubbles: true })); }
});
await new Promise((r) => setTimeout(r, 700));
await page.evaluate(() => {
  const cv = document.querySelector('#city-select');
  if (cv && cv.options.length > 1) { cv.value = cv.options[1].value; cv.dispatchEvent(new Event('change', { bubbles: true })); }
  const ta = document.querySelector('#checkout-form textarea');
  if (ta) { ta.value = 'خیابان تست، پلاک ۱'; ta.dispatchEvent(new Event('input', { bubbles: true })); }
  const postal = document.querySelector('#checkout-form input[placeholder="XXXXXXXXXX"]');
  if (postal) { postal.value = '1234567890'; postal.dispatchEvent(new Event('input', { bubbles: true })); }
  const cod = document.querySelector('input[name="payment"][value="cod"]');
  if (cod) { cod.checked = true; cod.dispatchEvent(new Event('change', { bubbles: true })); }
});
await new Promise((r) => setTimeout(r, 400));

await page.evaluate(() => {
  document.querySelector('#checkout-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
});
await new Promise((r) => setTimeout(r, 9000));
console.log('final url:', page.url());

// ── My Orders page ──
await page.goto(BASE + '/account/orders', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 3000));
const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 700));
console.log('MY ORDERS PAGE:', text);
const rows = await page.evaluate(() => Array.from(document.querySelectorAll('.orders-table tbody tr')).map((tr) => tr.cells[0] && tr.cells[0].textContent));
console.log('order rows:', JSON.stringify(rows));

await browser.close();
