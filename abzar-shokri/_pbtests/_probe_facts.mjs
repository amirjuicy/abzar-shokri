import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('pageerror: ' + String(e)));
await page.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#pdp-buy-bar', { state: 'attached', timeout: 15000 });
await page.waitForTimeout(900);

const out = await page.evaluate(() => {
  const p = AppData.products.find(x => x.id === 1);
  return {
    productCount: AppData.products.length,
    ids: AppData.products.map(x => x.id).slice(0, 30),
    p: p ? {
      id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice,
      discount: p.discount, wholesalePrice: p.wholesalePrice, inStock: p.inStock,
      oldPriceType: typeof p.oldPrice, keys: Object.keys(p),
    } : null,
    buyboxAmount: (document.querySelector('.dk-buybox__amount') || {}).textContent,
    barAmount: (document.querySelector('.pdp-buy-bar__amount') || {}).textContent,
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
