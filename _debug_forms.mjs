import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:3000/register', { waitUntil: 'networkidle2' });
const info = await page.evaluate(() => {
  return [...document.querySelectorAll('form')].map((f, i) => ({
    i, id: f.id, hidden: f.offsetParent === null,
    required: [...f.querySelectorAll('input,textarea,select')].filter((el) => el.required).map((el) => ({
      id: el.id || el.name || el.type, type: el.type, hidden: el.offsetParent === null,
    })),
  }));
});
console.log(JSON.stringify(info, null, 1));
await page.type('#reg-firstname', 'BugHunt'); await page.type('#reg-lastname', 'Customer');
await page.type('#reg-mobile', '0912' + Math.floor(1000000 + Math.random() * 8999999));
await page.type('#reg-password', 'test1234'); await page.type('#reg-password-confirm', 'test1234');
await page.click('#reg-terms');
const valid = await page.evaluate(() => {
  const f = document.querySelector('#register-form');
  return { novalidate: f.noValidate, checkValidity: f.checkValidity(), invalid: [...f.querySelectorAll(':invalid')].map((e) => e.id || e.type) };
});
console.log('validity:', JSON.stringify(valid));
await browser.close();
