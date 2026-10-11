import puppeteer from 'puppeteer-core';
import fs from 'fs';
const BASE = 'http://127.0.0.1:3000';
const cred = JSON.parse(fs.readFileSync('_repro_cred.json', 'utf8'));

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 250)); });
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/api/orders') || (u.includes('/api/users/') && u.includes('/orders'))) {
    let b = ''; try { b = (await r.text()).slice(0, 350); } catch (e) {}
    console.log('[res]', r.status(), r.request().method(), u.replace(BASE, ''), b);
  }
});

// Seed the session exactly like the register flow does.
await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
await page.evaluate((c) => {
  localStorage.setItem('as_session', JSON.stringify({ userId: c.userId, token: c.token, user: c.user }));
}, cred);
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await page.evaluate(() => App.addToCart(1));
console.log('cart:', JSON.stringify(await page.evaluate(() => App.getCart())).slice(0, 140));

await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await page.waitForSelector('#checkout-form', { timeout: 10000 });
await page.evaluate(() => {
  const pv = document.querySelector('#province-select');
  const cv = document.querySelector('#city-select');
  if (pv && pv.options.length > 1) { pv.selectedIndex = 1; pv.dispatchEvent(new Event('change', { bubbles: true })); }
  if (cv && cv.options.length > 1) { cv.selectedIndex = 1; cv.dispatchEvent(new Event('change', { bubbles: true })); }
});
await new Promise((r) => setTimeout(r, 600));
await page.evaluate(() => {
  const t = document.querySelector('#checkout-form textarea');
  if (t) { t.value = 'خیابان آزادی، پلاک ۱۲'; t.dispatchEvent(new Event('input', { bubbles: true })); }
  const cod = document.querySelector('input[name="payment"][value="cod"]');
  if (cod) { cod.checked = true; cod.dispatchEvent(new Event('change', { bubbles: true })); }
});
await new Promise((r) => setTimeout(r, 400));
const state = await page.evaluate(() => ({
  pv: document.querySelector('#province-select').value,
  cv: document.querySelector('#city-select').value,
  addr: document.querySelector('#checkout-form textarea').value,
  pay: (document.querySelector('input[name="payment"]:checked') || {}).value,
  session: !!localStorage.getItem('as_session'),
}));
console.log('checkout state:', JSON.stringify(state));

await page.click('#checkout-form button[type="submit"]');
await new Promise((r) => setTimeout(r, 7000));
console.log('url after checkout:', page.url());
const toast = await page.evaluate(() => { const t = document.querySelector('.toast'); return t ? t.innerText : 'none'; });
console.log('toast:', toast);

console.log('== orders page ==');
await page.goto(BASE + '/account/orders', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));
console.log('TEXT:\n' + await page.evaluate(() => document.querySelector('#account-content').innerText.slice(0, 700)));

console.log('== hard reload ==');
await page.reload({ waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));
console.log('TEXT after reload:\n' + await page.evaluate(() => document.querySelector('#account-content').innerText.slice(0, 700)));

await browser.close();
