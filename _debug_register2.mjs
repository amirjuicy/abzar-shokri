import puppeteer from 'puppeteer-core';
const MOBILE = '0912' + Math.floor(1000000 + Math.random() * 8999999);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:3000/register', { waitUntil: 'networkidle2' });
await page.type('#reg-firstname', 'BugHunt');
await page.type('#reg-lastname', 'Customer');
await page.type('#reg-mobile', MOBILE);
await page.type('#reg-password', 'test1234');
await page.type('#reg-password-confirm', 'test1234');
await page.click('#reg-terms');
const vals = await page.evaluate(() => ({
  fn: document.querySelector('#reg-firstname').value,
  mob: document.querySelector('#reg-mobile').value,
  pw: document.querySelector('#reg-password').value,
  pw2: document.querySelector('#reg-password-confirm').value,
  terms: document.querySelector('#reg-terms').checked,
  valid: document.querySelector('#register-form').checkValidity(),
  invalid: [...document.querySelector('#register-form').querySelectorAll(':invalid')].map((e) => e.id || e.type),
}));
console.log('after type:', JSON.stringify(vals));
await page.evaluate(() => document.querySelector('#register-form button[type=submit]').click());
await new Promise((r) => setTimeout(r, 3500));
console.log('url:', page.url());
console.log('session:', await page.evaluate(() => localStorage.getItem('as_session')));
console.log('body tail:', await page.evaluate(() => document.body.innerText.slice(-400)));
await browser.close();
console.log('MOBILE', MOBILE);
