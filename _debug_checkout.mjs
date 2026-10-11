import puppeteer from 'puppeteer-core';
import fs from 'fs';
const BASE = 'http://127.0.0.1:3000';
const cred = JSON.parse(fs.readFileSync('_repro_cred.json', 'utf8'));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 300)); });
page.on('response', async (r) => { if (r.status() >= 400) console.log('[http' + r.status() + ']', r.request().method(), r.url().replace(BASE, '')); });

await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
await page.evaluate((c) => localStorage.setItem('as_session', JSON.stringify({ userId: c.userId, token: c.token, user: c.user })), cred);
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await page.evaluate(() => App.addToCart(1));

await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await page.waitForSelector('#checkout-form');
// Instrument
await page.evaluate(() => {
  window.__events = [];
  const f = document.querySelector('#checkout-form');
  f.addEventListener('submit', (e) => { window.__events.push('submit-preventDefault=' + e.defaultPrevented); }, true);
  f.addEventListener('invalid', (e) => { window.__events.push('invalid:' + (e.target.id || e.target.tagName) + ':' + (e.target.placeholder || '')); }, true);
});
await page.evaluate(() => {
  const pv = document.querySelector('#province-select');
  const cv = document.querySelector('#city-select');
  pv.selectedIndex = 1; pv.dispatchEvent(new Event('change', { bubbles: true }));
  cv.selectedIndex = 1; cv.dispatchEvent(new Event('change', { bubbles: true }));
  const t = document.querySelector('#checkout-form textarea');
  t.value = 'خیابان آزادی، پلاک ۱۲'; t.dispatchEvent(new Event('input', { bubbles: true }));
  const cod = document.querySelector('input[name="payment"][value="cod"]');
  cod.checked = true; cod.dispatchEvent(new Event('change', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 500));
const validInfo = await page.evaluate(() => {
  const f = document.querySelector('#checkout-form');
  return {
    checkValidity: f.checkValidity(),
    invalid: [...f.querySelectorAll(':invalid')].map((e) => ({ id: e.id, tag: e.tagName, type: e.type, ph: e.placeholder, hidden: e.offsetParent === null, value: (e.value || '').slice(0, 30) })),
    allRequired: [...f.querySelectorAll('[required]')].map((e) => ({ id: e.id || e.placeholder || e.name, tag: e.tagName, hidden: e.offsetParent === null })),
  };
});
console.log('validity:', JSON.stringify(validInfo, null, 1));
await page.click('#checkout-form button[type="submit"]');
await new Promise((r) => setTimeout(r, 4000));
console.log('events:', JSON.stringify(await page.evaluate(() => window.__events)));
console.log('url:', page.url());
await browser.close();
