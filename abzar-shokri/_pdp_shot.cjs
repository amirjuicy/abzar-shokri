const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const slug = process.argv[2] || 'bosch-gbh-2-26';

  // Desktop
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await dctx.newPage();
  await dp.goto('http://127.0.0.1:3000/product.html?slug=' + slug, { waitUntil: 'networkidle' });
  await dp.waitForTimeout(2500);
  await dp.screenshot({ path: '_pdp_desktop.png', fullPage: true });
  // Also capture just the top (above the fold)
  await dp.screenshot({ path: '_pdp_desktop_fold.png', fullPage: false });
  console.log('desktop done');

  // Mobile
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mctx.newPage();
  await mp.goto('http://127.0.0.1:3000/product.html?slug=' + slug, { waitUntil: 'networkidle' });
  await mp.waitForTimeout(2500);
  await mp.screenshot({ path: '_pdp_mobile.png', fullPage: true });
  await mp.screenshot({ path: '_pdp_mobile_fold.png', fullPage: false });
  console.log('mobile done');

  // Tablet
  const tctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tp = await tctx.newPage();
  await tp.goto('http://127.0.0.1:3000/product.html?slug=' + slug, { waitUntil: 'networkidle' });
  await tp.waitForTimeout(2500);
  await tp.screenshot({ path: '_pdp_tablet.png', fullPage: true });
  console.log('tablet done');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
