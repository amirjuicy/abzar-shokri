import puppeteer from 'puppeteer-core';

const BASE = 'http://127.0.0.1:3000';
const MOBILE = '09129998877';
const PASS = 'test1234';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const net = [];
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/api/auth') || u.includes('/api/orders') || u.includes('/api/users')) {
    let body = '';
    try { body = (await r.text()).slice(0, 300); } catch {}
    net.push(`${r.status()} ${r.request().method()} ${u.replace(BASE, '')} :: ${body}`);
  }
});
page.on('pageerror', (e) => net.push('PAGEERROR: ' + e.message));

console.log('== LOGIN ==');
await page.goto(BASE + '/login', { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => {
  document.querySelector('#login-identifier').value = '09129998877';
  document.querySelector('#login-password').value = 'test1234';
  document.querySelector('#login-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
});
await page.waitForFunction(() => location.pathname.startsWith('/account'), { timeout: 8000 }).catch(() => {});
console.log('URL after login:', page.url());

console.log('== MY ORDERS PAGE ==');
await page.goto(BASE + '/account/orders', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 3000));
const content = await page.evaluate(() => {
  const el = document.querySelector('#account-content');
  return el ? el.innerHTML.slice(0, 2000) : 'NO #account-content';
});
console.log('CONTENT HTML:\n' + content);
console.log('\n== NETWORK ==');
net.forEach((l) => console.log(l));

await browser.close();
