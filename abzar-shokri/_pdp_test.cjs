const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const slug = 'bosch-gbh-2-26';
  const results = [];

  function log(name, pass, detail) {
    results.push({ name, pass, detail });
    console.log(`${pass ? '✓' : '✗'} ${name}: ${detail}`);
  }

  // ── Desktop tests ──
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await dctx.newPage();
  await dp.goto('http://127.0.0.1:3000/product.html?slug=' + slug, { waitUntil: 'networkidle' });
  await dp.waitForTimeout(2500);

  // 1. Page loads
  const title = await dp.title();
  log('Desktop page load', title.includes('GSR'), `title="${title}"`);

  // 2. Gallery present
  const gallery = await dp.$('.pdp-layout__gallery');
  log('Desktop gallery', !!gallery, gallery ? 'found' : 'missing');

  // 3. Main image present
  const mainImg = await dp.$('.pdp-main-image img');
  const mainImgSrc = mainImg ? await mainImg.getAttribute('src') : null;
  log('Desktop main image', !!mainImgSrc, mainImgSrc ? mainImgSrc.slice(0, 60) : 'missing');

  // 4. Thumbnails present
  const thumbs = await dp.$$('.pdp-thumb');
  log('Desktop thumbnails', thumbs.length > 0, `${thumbs.length} thumbnails`);

  // 5. Buy box present
  const buybox = await dp.$('.dk-buybox');
  log('Desktop buy box', !!buybox, buybox ? 'found' : 'missing');

  // 6. Add to cart button
  const addBtn = await dp.$('#product-add-to-cart');
  log('Desktop add-to-cart', !!addBtn, addBtn ? 'found' : 'missing');

  // 7. Click add to cart → transforms to qty stepper
  if (addBtn) {
    await addBtn.click();
    await dp.waitForTimeout(500);
    const stepper = await dp.$('#product-cart-control .qty-selector--buybox');
    log('Desktop add-to-cart → stepper', !!stepper, stepper ? 'stepper shown' : 'no stepper');
  }

  // 8. Specs grid
  const specs = await dp.$$('.pdp-spec-item');
  log('Desktop specs grid', specs.length > 0, `${specs.length} spec items`);

  // 9. Tabs
  const tabs = await dp.$$('.product-tabs__tab');
  log('Desktop tabs', tabs.length >= 4, `${tabs.length} tabs`);

  // 10. Click a tab
  if (tabs.length >= 3) {
    await tabs[2].click(); // specs tab
    await dp.waitForTimeout(300);
    const specsPanel = await dp.$('#tab-specs');
    const specsVisible = specsPanel ? await specsPanel.isVisible() : false;
    log('Desktop tab switch (specs)', specsVisible, specsVisible ? 'specs panel visible' : 'not visible');
  }

  // 11. Gallery thumbnail click
  if (thumbs.length > 1) {
    await thumbs[1].click();
    await dp.waitForTimeout(300);
    const activeThumb = await dp.$('.pdp-thumb.is-active');
    log('Desktop gallery thumb switch', !!activeThumb, activeThumb ? 'thumb activated' : 'no active thumb');
  }

  // 12. Wishlist toggle
  const wishlistBtn = await dp.$('.pdp-action-icon--wishlist');
  if (wishlistBtn) {
    await wishlistBtn.click();
    await dp.waitForTimeout(300);
    const isActive = await wishlistBtn.evaluate(el => el.classList.contains('is-active'));
    log('Desktop wishlist toggle', isActive, isActive ? 'wishlist active' : 'not active');
  }

  // 13. Mobile sticky buy bar (should NOT be visible on desktop)
  const buyBar = await dp.$('.pdp-buy-bar');
  const buyBarVisible = buyBar ? await buyBar.isVisible() : false;
  log('Desktop: no sticky buy bar', !buyBarVisible, buyBarVisible ? 'bar visible (wrong)' : 'bar hidden (correct)');

  await dp.screenshot({ path: '_pdp_desktop_final.png', fullPage: true });
  await dctx.close();

  // ── Mobile tests ──
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mctx.newPage();
  await mp.goto('http://127.0.0.1:3000/product.html?slug=' + slug, { waitUntil: 'networkidle' });
  await mp.waitForTimeout(2500);

  // 14. Mobile page loads
  const mTitle = await mp.title();
  log('Mobile page load', mTitle.includes('GSR'), `title="${mTitle}"`);

  // 15. Mobile gallery
  const mGallery = await mp.$('.pdp-layout__gallery');
  log('Mobile gallery', !!mGallery, mGallery ? 'found' : 'missing');

  // 16. Mobile buy box
  const mBuybox = await mp.$('.dk-buybox');
  log('Mobile buy box', !!mBuybox, mBuybox ? 'found' : 'missing');

  // 17. Mobile sticky buy bar visible
  const mBuyBar = await mp.$('.pdp-buy-bar');
  const mBuyBarVisible = mBuyBar ? await mBuyBar.isVisible() : false;
  log('Mobile sticky buy bar', mBuyBarVisible, mBuyBarVisible ? 'bar visible' : 'bar missing');

  // 18. Mobile add to cart
  const mAddBtn = await mp.$('#pdp-buy-bar-add');
  if (!mAddBtn) {
    // try the buy box add button
    const mBuyboxAdd = await mp.$('#product-add-to-cart');
    log('Mobile add-to-cart', !!mBuyboxAdd, mBuyboxAdd ? 'found in buybox' : 'missing');
  } else {
    log('Mobile add-to-cart', true, 'found in sticky bar');
  }

  // 19. Mobile: click add to cart
  const mAddBtnEl = mAddBtn || await mp.$('#product-add-to-cart');
  if (mAddBtnEl) {
    await mAddBtnEl.click();
    await mp.waitForTimeout(500);
    const mStepper = await mp.$('.pdp-buy-bar .qty-selector--buybox') || await mp.$('#product-cart-control .qty-selector--buybox');
    log('Mobile add-to-cart → stepper', !!mStepper, mStepper ? 'stepper shown' : 'no stepper');
  }

  // 20. Mobile tabs
  const mTabs = await mp.$$('.product-tabs__tab');
  log('Mobile tabs', mTabs.length >= 4, `${mTabs.length} tabs`);

  // 21. Mobile specs
  const mSpecs = await mp.$$('.pdp-spec-item');
  log('Mobile specs', mSpecs.length > 0, `${mSpecs.length} spec items`);

  // 22. Mobile: no desktop sticky buybox
  const mBuyboxWrap = await mp.$('.dk-buybox-wrap');
  const mBuyboxSticky = mBuyboxWrap ? await mBuyboxWrap.evaluate(el => getComputedStyle(el).position === 'sticky') : false;
  log('Mobile: buybox not sticky', !mBuyboxSticky, mBuyboxSticky ? 'sticky (check)' : 'not sticky (correct)');

  await mp.screenshot({ path: '_pdp_mobile_final.png', fullPage: true });
  await mctx.close();

  await browser.close();

  // Summary
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n═══ SUMMARY: ${passed} passed, ${failed} failed ═══`);
  if (failed > 0) {
    console.log('FAILED:');
    results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.name}: ${r.detail}`));
  }
})().catch(e => { console.error(e); process.exit(1); });
