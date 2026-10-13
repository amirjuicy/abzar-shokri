import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', String(e)));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE-ERR:', m.text()); });
await page.goto('http://127.0.0.1:3000/product/1', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.dk-buybox', { timeout: 15000 });
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(() => {
  const q = s => document.querySelector(s);
  return {
    priceChangers: [...document.querySelectorAll('.priceChanger')].map(e => e.outerHTML),
    buyboxPrice: q('.dk-buybox__price') ? q('.dk-buybox__price').innerHTML : null,
    finalPrice: q('#product-detail-price') ? q('#product-detail-price').innerHTML : null,
    cartControl: q('#product-cart-control') ? q('#product-cart-control').innerHTML : null,
    pdpOptions: !!q('#pdp-options'),
    hasIconsToman: typeof Icons !== 'undefined' && !!Icons.toman,
    iconsKeys: typeof Icons !== 'undefined' ? Object.keys(Icons).length : 0,
    hasProductDetail: typeof window.ProductDetail,
    getProductPrice: typeof window.App?.getProductPrice,
    hasWholesale: window.App ? window.App.getProductPrice(AppData.products.find(p=>p.id===1), 'wholesale') : null,
    bodyClass: document.body.className,
    navRect: (() => { const n = document.querySelector('.mobile-bottom-nav'); const r = n && n.getBoundingClientRect(); return r ? {h: r.height, top: r.top, w: r.width} : null; })(),
    chatFab: !!document.querySelector('.chat-fab'),
    chatFabRect: (() => { const c = document.querySelector('.chat-fab'); const r = c && c.getBoundingClientRect(); return r ? {h: r.height, bottom: r.bottom, left: r.left} : null; })(),
    bodyPadBottom: getComputedStyle(document.body).paddingBottom,
    lastSection: (() => { const l = document.querySelector('#product-detail-content > *:last-child'); return l ? l.className : null; })(),
  };
}), null, 2));
await browser.close();