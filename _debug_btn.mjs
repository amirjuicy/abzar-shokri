import puppeteer from 'puppeteer-core';
import fs from 'fs';
const BASE = 'http://127.0.0.1:3000';
const cred = JSON.parse(fs.readFileSync('_repro_cred.json', 'utf8'));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
await page.evaluate((c) => localStorage.setItem('as_session', JSON.stringify({ userId: c.userId, token: c.token, user: c.user })), cred);
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await page.evaluate(() => App.addToCart(1));
await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await page.waitForSelector('#checkout-form');
const btnInfo = await page.evaluate(() => {
  const f = document.querySelector('#checkout-form');
  const btn = f.querySelector('button[type="submit"]');
  const r = btn.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const at = document.elementFromPoint(cx, cy);
  return {
    btnRect: { x: r.x, y: r.y, w: r.width, h: r.height },
    btnDisabled: btn.disabled, btnText: btn.textContent.trim().slice(0, 40),
    btnInForm: btn.form === f,
    elementAtPoint: at ? (at.tagName + '.' + at.className).slice(0, 120) : null,
    overlays: [...document.querySelectorAll('.site-loader, .pwa-install-modal, [class*="loader"]')].map((e) => ({ cls: e.className.slice(0, 60), hidden: e.hidden, display: getComputedStyle(e).display })),
  };
});
console.log(JSON.stringify(btnInfo, null, 1));
// Try requestSubmit
const res = await page.evaluate(() => {
  window.__log = [];
  const f = document.querySelector('#checkout-form');
  f.addEventListener('submit', () => window.__log.push('submit!'), true);
  try { f.requestSubmit(); } catch (e) { return 'requestSubmit threw: ' + e.message; }
  return 'ok';
});
console.log('requestSubmit:', res);
await new Promise((r) => setTimeout(r, 500));
console.log('log:', await page.evaluate(() => window.__log));
await browser.close();
