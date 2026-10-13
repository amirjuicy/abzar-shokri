import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = path.join(__dirname, '_shots');
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 430, height: 800 },
];

const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: vp });
  await page.goto('http://127.0.0.1:3100/product.html?id=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: path.join(SHOTS_DIR, `product-${vp.width}.png`),
    fullPage: false,
  });

  const bar = await page.locator('.mobile-purchase-bar').boundingBox();
  const priceWrap = await page.locator('.mobile-purchase-bar__price-wrap').boundingBox();
  const cartWrap = await page.locator('.mobile-purchase-bar__cart-wrap').boundingBox();
  const bottomNav = await page.locator('.mobile-bottom-nav');
  const bottomNavVisible = await bottomNav.isVisible().catch(() => false);
  const addBtn = await page.locator('#mobile-add-to-cart').boundingBox().catch(() => null);
  const amount = await page.locator('.mobile-purchase-bar__amount').textContent().catch(() => null);
  const bodyClass = await page.evaluate(() => document.body.className);

  const priceRight = priceWrap && cartWrap ? priceWrap.x > cartWrap.x : null;
  const noOverlap = bar && bottomNavVisible ? bar.y >= 56 : null;

  console.log(`\n=== ${vp.width}x${vp.height} ===`);
  console.log(`bar:`, bar ? `${bar.width}x${bar.height} @ y=${bar.y}` : 'NOT FOUND');
  console.log(`price x=${priceWrap?.x.toFixed(0)}, cart x=${cartWrap?.x.toFixed(0)}, price on right=${priceRight}`);
  console.log(`addBtn:`, addBtn ? `${addBtn.width}x${addBtn.height} @ x=${addBtn.x.toFixed(0)}` : 'NOT FOUND');
  console.log(`bottomNav visible=${bottomNavVisible}, no overlap=${noOverlap}`);
  console.log(`body class=${bodyClass}`);
  console.log(`price=${amount}`);

  await page.close();
}

await browser.close();
console.log('\nScreenshots saved to', SHOTS_DIR);
