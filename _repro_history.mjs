import puppeteer from 'puppeteer-core';

const BASE = 'http://127.0.0.1:3000';
const MOBILE = '0912' + Math.floor(1000000 + Math.random() * 8999999);
const PASS = 'test1234';
const FIRST = 'BugHunt', LAST = 'Customer';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 200)); });
page.on('request', (r) => {
  const u = r.url();
  if (u.includes('/api/') && (r.method() === 'POST' || u.includes('/orders'))) {
    console.log('[req]', r.method(), u.replace(BASE, ''), 'auth=', (r.headers().authorization || 'NONE').slice(0, 24));
  }
});
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/api/users/') && u.includes('/orders')) {
    let b = ''; try { b = (await r.text()).slice(0, 400); } catch (e) {}
    console.log('[res]', r.status(), u.replace(BASE, ''), b);
  }
  if (u.endsWith('/api/orders') && r.request().method() === 'POST') {
    let b = ''; try { b = (await r.text()).slice(0, 300); } catch (e) {}
    console.log('[res] POST /api/orders', r.status(), b);
  }
});

console.log('== 1. Register via UI ==');
await page.goto(BASE + '/register', { waitUntil: 'networkidle2' });
await page.waitForSelector('#reg-firstname', { timeout: 10000 });
await page.type('#reg-firstname', FIRST);
await page.type('#reg-lastname', LAST);
await page.type('#reg-mobile', MOBILE);
await page.type('#reg-password', PASS);
await page.type('#reg-password-confirm', PASS);
await page.click('#reg-terms');
await page.click('#register-form button[type="submit"]');
await new Promise((r) => setTimeout(r, 3000));
const session = await page.evaluate(() => localStorage.getItem('as_session'));
console.log('session after register:', session ? session.slice(0, 160) : 'NULL');
const userId = session ? JSON.parse(session).userId : null;
console.log('userId:', userId);

console.log('== 2. Add to cart ==');
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await page.evaluate(() => App.addToCart(1));
const cart = await page.evaluate(() => App.getCart());
console.log('cart:', JSON.stringify(cart).slice(0, 160));

console.log('== 3. Checkout ==');
await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await page.waitForSelector('#checkout-form', { timeout: 10000 });
// province/city may be custom dropdowns; set selects + fire change
await page.evaluate(() => {
  const pv = document.querySelector('#province-select');
  const cv = document.querySelector('#city-select');
  if (pv && pv.options.length > 1) { pv.selectedIndex = 1; pv.dispatchEvent(new Event('change', { bubbles: true })); }
  if (cv && cv.options.length > 1) { setTimeout(() => { cv.selectedIndex = 1; cv.dispatchEvent(new Event('change', { bubbles: true })); }, 300); }
});
await new Promise((r) => setTimeout(r, 800));
await page.evaluate(() => {
  const t = document.querySelector('#checkout-form textarea');
  if (t) { t.value = 'خیابان آزادی، پلاک ۱۲'; t.dispatchEvent(new Event('input', { bubbles: true })); }
  const cod = document.querySelector('input[name="payment"][value="cod"]');
  if (cod) { cod.checked = true; cod.dispatchEvent(new Event('change', { bubbles: true })); cod.click(); }
});
await new Promise((r) => setTimeout(r, 500));
const formState = await page.evaluate(() => ({
  pv: document.querySelector('#province-select') && document.querySelector('#province-select').value,
  cv: document.querySelector('#city-select') && document.querySelector('#city-select').value,
  addr: document.querySelector('#checkout-form textarea') && document.querySelector('#checkout-form textarea').value,
  pay: document.querySelector('input[name="payment"]:checked') && document.querySelector('input[name="payment"]:checked').value,
  btn: document.querySelector('#checkout-form button[type="submit"]') && document.querySelector('#checkout-form button[type="submit"]').textContent.trim(),
}));
console.log('form state:', JSON.stringify(formState));
await page.click('#checkout-form button[type="submit"]');
await new Promise((r) => setTimeout(r, 6000));
console.log('url after checkout:', page.url());

console.log('== 4. Account orders page ==');
await page.goto(BASE + '/account/orders', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));
const ordersHtml = await page.evaluate(() => {
  const el = document.querySelector('#account-content');
  return el ? el.innerText.slice(0, 800) : 'NO #account-content';
});
console.log('ORDERS PAGE TEXT:\n' + ordersHtml);

console.log('== 5. Hard reload ==');
await page.reload({ waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));
const ordersHtml2 = await page.evaluate(() => {
  const el = document.querySelector('#account-content');
  return el ? el.innerText.slice(0, 800) : 'NO #account-content';
});
console.log('ORDERS PAGE (reload) TEXT:\n' + ordersHtml2);

console.log('== 6. In-page API check as this user ==');
const apiCheck = await page.evaluate(async (uid) => {
  const s = JSON.parse(localStorage.getItem('as_session'));
  const r = await fetch('/api/users/' + encodeURIComponent(uid) + '/orders', { headers: { Authorization: 'Bearer ' + s.token } });
  const t = await r.text();
  return { status: r.status, body: t.slice(0, 400) };
}, userId);
console.log('direct fetch:', JSON.stringify(apiCheck));

console.log('== 7. localStorage cached orders ==');
const cached = await page.evaluate((uid) => localStorage.getItem('as_user_' + uid + '_orders'), userId);
console.log('cache:', cached ? cached.slice(0, 300) : 'NULL');

require('fs').writeFileSync('C:/Users/INO/Desktop/project/abzar-shokri/_repro_history_out.json', JSON.stringify({ mobile: MOBILE, pass: PASS, userId }, null, 2));
await browser.close();
console.log('DONE userId=', userId, 'mobile=', MOBILE);
