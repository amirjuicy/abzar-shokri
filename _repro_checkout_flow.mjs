import puppeteer from 'puppeteer-core';
import fs from 'fs';
const BASE = 'http://127.0.0.1:3000';
const cred = JSON.parse(fs.readFileSync('_repro_cred.json', 'utf8'));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 250)); });
page.on('request', (r) => { if (r.url().includes('/api/orders') && r.method() === 'POST') console.log('[req] POST /api/orders auth=', (r.headers().authorization || 'NONE').slice(0, 20)); });
page.on('response', async (r) => {
  const u = r.url();
  if ((u.includes('/api/orders') && r.request().method() === 'POST') || (u.includes('/api/users/') && u.includes('/orders'))) {
    let b = ''; try { b = (await r.text()).slice(0, 280); } catch (e) {}
    console.log('[res]', r.status(), r.request().method(), u.replace(BASE, ''), b);
  }
});

await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
await page.evaluate((c) => localStorage.setItem('as_session', JSON.stringify({ userId: c.userId, token: c.token, user: c.user })), cred);
await page.goto(BASE + '/shop', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.App && App.addToCart, { timeout: 15000 });
await page.evaluate(() => App.addToCart(1));

await page.goto(BASE + '/checkout', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#checkout-form');
await page.evaluate(() => {
  const f = document.querySelector('#checkout-form');
  const ins = f.querySelectorAll('input.input');
  ins[0].value = 'BugHunt'; ins[1].value = 'Customer'; ins[2].value = '09128969852';
  if (ins[3]) ins[3].value = 'bug@test.com';
  const postal = f.querySelectorAll('input.input')[4]; if (postal) postal.value = '1234567890';
  const pv = document.querySelector('#province-select'); pv.selectedIndex = 1; pv.dispatchEvent(new Event('change', { bubbles: true }));
  const cv = document.querySelector('#city-select'); cv.selectedIndex = 1; cv.dispatchEvent(new Event('change', { bubbles: true }));
  const t = f.querySelector('textarea'); t.value = 'خیابان آزادی، پلاک ۱۲'; t.dispatchEvent(new Event('input', { bubbles: true }));
  const cod = document.querySelector('input[name="payment"][value="cod"]'); cod.checked = true; cod.dispatchEvent(new Event('change', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 600));
console.log('valid:', await page.evaluate(() => document.querySelector('#checkout-form').checkValidity()));
// JS click bypasses the loader overlay (which only blocks real hit-testing)
await page.evaluate(() => document.querySelector('#checkout-form button[type="submit"]').click());
await new Promise((r) => setTimeout(r, 8000));
console.log('url after checkout:', page.url());
console.log('toast:', await page.evaluate(() => { const t = document.querySelector('.toast'); return t ? t.innerText.slice(0, 150) : 'none'; }));

console.log('== orders page ==');
await page.goto(BASE + '/account/orders', { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 3000));
console.log('TEXT:\n' + await page.evaluate(() => document.querySelector('#account-content').innerText.slice(0, 700)));

console.log('== hard reload ==');
await page.reload({ waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 3000));
console.log('TEXT after reload:\n' + await page.evaluate(() => document.querySelector('#account-content').innerText.slice(0, 700)));

await browser.close();
