import puppeteer from 'puppeteer-core';
const BASE = 'http://127.0.0.1:3000';
const MOBILE = '0912' + Math.floor(1000000 + Math.random() * 8999999);
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => console.log('[console.' + m.type() + ']', m.text().slice(0, 300)));
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/api/auth')) {
    let b = ''; try { b = (await r.text()).slice(0, 300); } catch (e) {}
    console.log('[res]', r.status(), u.replace(BASE, ''), b);
  }
  if (r.status() >= 400) console.log('[http' + r.status() + ']', r.request().method(), u.replace(BASE, ''));
});
await page.goto(BASE + '/register', { waitUntil: 'networkidle2' });
await page.waitForSelector('#reg-firstname', { timeout: 10000 });
console.log('register page loaded, scripts ok? App=', await page.evaluate(() => typeof window.App));
await page.type('#reg-firstname', 'BugHunt');
await page.type('#reg-lastname', 'Customer');
await page.type('#reg-mobile', MOBILE);
await page.type('#reg-password', 'test1234');
await page.type('#reg-password-confirm', 'test1234');
await page.click('#reg-terms');
await page.evaluate(() => {
  const f = document.querySelector('#register-form');
  const btn = f.querySelector('button[type="submit"]');
  btn.click();
});
await new Promise((r) => setTimeout(r, 4000));
console.log('url:', page.url());
console.log('session:', await page.evaluate(() => localStorage.getItem('as_session')));
console.log('toast:', await page.evaluate(() => { const t = document.querySelector('.toast, [class*="toast"]'); return t ? t.innerText : 'none'; }));
await browser.close();
console.log('MOBILE=', MOBILE);
