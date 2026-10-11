import puppeteer from 'puppeteer-core';
import fs from 'fs';
const BASE = 'http://127.0.0.1:3000';
const cred = JSON.parse(fs.readFileSync('_repro_cred.json', 'utf8'));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.log('[console.' + m.type() + ']', m.text().slice(0, 250)); });

await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
await page.evaluate((c) => localStorage.setItem('as_session', JSON.stringify({ userId: c.userId, token: c.token, user: c.user })), cred);
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await page.evaluate(() => App.addToCart(1));
await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await page.waitForSelector('#checkout-form');

await page.evaluate(() => {
  window.__log = [];
  const origCreate = App.createOrder;
  App.createOrder = function (payload) {
    window.__log.push('createOrder called, userId=' + (payload && payload.userId) + ' items=' + JSON.stringify((payload && payload.items) || []).slice(0, 120));
    return origCreate.apply(this, arguments).then(function (r) { window.__log.push('createOrder resolved ' + JSON.stringify(r).slice(0, 150)); return r; }, function (e) { window.__log.push('createOrder rejected: ' + (e && e.message)); throw e; });
  };
  const f = document.querySelector('#checkout-form');
  f.addEventListener('submit', () => window.__log.push('submit event fired'), true);
  const ins = f.querySelectorAll('input.input');
  ins[0].value = 'BugHunt'; ins[1].value = 'Customer'; ins[2].value = '09128969852';
  if (ins[3]) ins[3].value = 'bug@test.com';
  const postal = f.querySelectorAll('input.input')[4]; if (postal) postal.value = '1234567890';
  const pv = document.querySelector('#province-select'); pv.selectedIndex = 1; pv.dispatchEvent(new Event('change', { bubbles: true }));
  const cv = document.querySelector('#city-select'); cv.selectedIndex = 1; cv.dispatchEvent(new Event('change', { bubbles: true }));
  const t = f.querySelector('textarea'); t.value = 'خیابان آزادی، پلاک ۱۲';
  const cod = document.querySelector('input[name="payment"][value="cod"]'); cod.checked = true; cod.dispatchEvent(new Event('change', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 400));
console.log('cart before submit:', JSON.stringify(await page.evaluate(() => App.getCart())).slice(0, 200));
await page.click('#checkout-form button[type="submit"]');
await new Promise((r) => setTimeout(r, 6000));
console.log('log:', JSON.stringify(await page.evaluate(() => window.__log), null, 1));
console.log('url:', page.url());
console.log('toast:', await page.evaluate(() => { const t = document.querySelector('.toast'); return t ? t.innerText.slice(0, 150) : 'none'; }));
await browser.close();
