import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });

const probe = await page.evaluate(async () => {
  const src = await (await fetch('/assets/js/account.js?v=18')).text();
  const out = {};
  const tryEval = (name, code) => {
    try {
      (0, eval)(code);
      out[name] = 'OK';
    } catch (e) {
      out[name] = 'THROWS: ' + e.message + ' @ ' + (e.stack || '').split('\n')[1];
    }
  };

  const blockStart = src.indexOf('  var ORDER_STATUS_FA = {');
  const blockEnd = src.indexOf('  function renderOrderDetail(el) {');
  const block = src.slice(blockStart, blockEnd);

  tryEval('block_as_is', block + '\n;orderStatusLabel("cod");');
  tryEval('block_no_emdash', block.replace(/—/g, '-') + '\n;orderStatusLabel("cod");');
  tryEval('block_no_zwnj', block.replace(/‌/g, '') + '\n;orderStatusLabel("cod");');

  // just the FA object + the one function
  const faEnd = block.indexOf('  var ORDER_STATUS_FLOW');
  const faOnly = block.slice(0, faEnd) + block.slice(block.indexOf('  function orderStatusLabel'), block.indexOf('  function paymentMethodLabel'));
  tryEval('fa_plus_label_only', faOnly + '\n;orderStatusLabel("cod");');

  // FA object alone
  tryEval('fa_alone', block.slice(0, faEnd));

  return out;
});
console.log(JSON.stringify(probe, null, 2));

await browser.close();
