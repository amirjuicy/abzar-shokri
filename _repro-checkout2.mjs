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
  if (u.includes('/api/orders')) console.log('[req]', r.method(), u, r.postData() ? r.postData().slice(0, 400) : '');
});
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/api/orders') && !u.includes('card-receipt')) {
    let body = ''; try { body = (await r.text()).slice(0, 500); } catch (e) {}
    console.log('[res]', r.status(), u, body);
  }
});

// Login
await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
const inputs = await page.$$('form input');
await inputs[0].type(MOBILE);
await inputs[1].type(PASS);
await page.click('form button[type="submit"]');
await new Promise((r) => setTimeout(r, 3000));

// Cart
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await page.evaluate(() => App.addToCart(1));
await new Promise((r) => setTimeout(r, 500));

// Checkout
await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

// Fill: province/city selects, address textarea, cod payment
await page.evaluate(() => {
  const pv = document.querySelector('#province-select');
  if (pv) {
    pv.value = 'تهران';
    pv.dispatchEvent(new Event('change', { bubbles: true }));
  }
});
await new Promise((r) => setTimeout(r, 600));
await page.evaluate(() => {
  const cv = document.querySelector('#city-select');
  if (cv && cv.options.length > 1) {
    cv.value = cv.options[1].value;
    cv.dispatchEvent(new Event('change', { bubbles: true }));
  }
});
await new Promise((r) => setTimeout(r, 300));

await page.evaluate(() => {
  const ta = document.querySelector('#checkout-form textarea');
  if (ta) { ta.value = 'خیابان تست، پلاک ۱'; ta.dispatchEvent(new Event('input', { bubbles: true })); }
  const postal = document.querySelector('#checkout-form input[placeholder="XXXXXXXXXX"]');
  if (postal) { postal.value = '1234567890'; postal.dispatchEvent(new Event('input', { bubbles: true })); }
  const cod = document.querySelector('input[name="payment"][value="cod"]');
  if (cod) { cod.checked = true; cod.dispatchEvent(new Event('change', { bubbles: true })); }
});
await new Promise((r) => setTimeout(r, 300));

const before = await page.evaluate(() => JSON.stringify({
  user: (function () { try { return App.getCurrentUser(); } catch (e) { return null; } })(),
  session: localStorage.getItem('as_session'),
}));
console.log('state before submit:', before);

// Submit
await page.evaluate(() => {
  const form = document.querySelector('#checkout-form');
  if (form) {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
});

// checkout.js has a 2000ms setTimeout before posting; wait for redirect
await new Promise((r) => setTimeout(r, 9000));
console.log('final url:', page.url());

const ordersView = await page.evaluate(() => document.body.innerText.slice(0, 600));
console.log('page text:', ordersView.replace(/\n+/g, ' | ').slice(0, 500));

await browser.close();
