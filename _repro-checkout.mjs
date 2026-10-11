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

// 1. Login through the real login page
await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
await page.waitForSelector('#login-form input, form input', { timeout: 15000 });
await page.evaluate(() => {
  const ins = document.querySelectorAll('form input');
  ins[0].value = '';
  return ins.length;
});
const inputs = await page.$$('form input');
await inputs[0].type(MOBILE);
await inputs[1].type(PASS);
await page.click('form button[type="submit"]');
await new Promise((r) => setTimeout(r, 3000));

const session = await page.evaluate(() => localStorage.getItem('as_session'));
console.log('session after login:', session);

// 2. Add a product to cart
await page.goto(BASE + '/shop', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1500));
const added = await page.evaluate(() => {
  try {
    if (window.App && App.addToCart) { App.addToCart(1); return true; }
  } catch (e) { return String(e); }
  return false;
});
console.log('addToCart:', added);
await new Promise((r) => setTimeout(r, 500));

const cart = await page.evaluate(() => { try { return JSON.stringify(App.getCart()); } catch (e) { return 'ERR ' + e.message; } });
console.log('cart:', cart);

// 3. Go through checkout (single-page checkout.js flow)
await page.goto(BASE + '/checkout', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2000));
await page.screenshot({ path: 'C:/Users/INO/Desktop/project/abzar-shokri/_checkout.png' });

// Dump available form fields to decide how to fill
const structure = await page.evaluate(() => {
  const out = { url: location.pathname, textareas: [], selects: [], radios: [], inputs: [], buttons: [] };
  document.querySelectorAll('textarea').forEach((t) => out.textareas.push({ ph: t.placeholder, name: t.name, id: t.id }));
  document.querySelectorAll('select').forEach((s) => out.selects.push({ name: s.name, id: s.id, opts: Array.from(s.options).slice(0, 5).map((o) => o.value) }));
  document.querySelectorAll('input[type=radio]').forEach((r) => out.radios.push({ name: r.name, value: r.value, checked: r.checked }));
  document.querySelectorAll('input:not([type=radio]):not([type=hidden])').forEach((i) => out.inputs.push({ name: i.name, id: i.id, type: i.type, ph: i.placeholder }));
  document.querySelectorAll('button, input[type=submit]').forEach((b) => out.buttons.push({ text: (b.textContent || '').trim().slice(0, 40), type: b.type, id: b.id }));
  return out;
});
console.log(JSON.stringify(structure, null, 1));

await browser.close();
