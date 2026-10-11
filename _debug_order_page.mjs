import puppeteer from 'puppeteer-core';
import { DatabaseSync } from 'node:sqlite';

const DB = 'C:/Users/INO/Desktop/project/abzar-shokri/abzar-shokri/data/abzar-shokri.db';
const BASE = 'http://127.0.0.1:3000';
const OWNER_ID = 'u_mucd2sgsiwhpu';

const db = new DatabaseSync(DB);
const token = 'verify_token_' + Date.now().toString(36);
db.prepare("INSERT INTO customer_sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").run(token, OWNER_ID);

try {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setBypassServiceWorker(true);

  await page.evaluateOnNewDocument((uid, tok) => {
    try {
      localStorage.setItem('as_session', JSON.stringify({
        userId: uid, token: tok,
        user: { id: uid, firstName: 'سید امیر حسین', lastName: 'موسوی', mobile: '09303797187', email: 'amirhosseinm8403@gmail.com', joinDate: '۱۴۰۵/۶/۱' },
      }));
    } catch (e) {}
  }, OWNER_ID, token);

  await page.goto(BASE + '/account/orders/ORD-MV3UAX670ZL', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  const probe = await page.evaluate(async () => {
    const src = await (await fetch('/assets/js/account.js?v=18')).text();
    const fnText = src.match(/function orderStatusLabel\(s\) \{[\s\S]*?\n  \}/)[0];
    const out = {};
    const FA = { cod: 'x' };

    // strict mode variant
    try {
      const f = new Function('ORDER_STATUS_FA', "'use strict';\n" + fnText + '; return orderStatusLabel;')(FA);
      out.strict = 'OK: ' + f('cod');
    } catch (e) { out.strict = 'THROWS: ' + e.message; }

    // IIFE-wrapped variant (mimics the real file structure)
    try {
      const f = new Function('ORDER_STATUS_FA', "(function(){\n'use strict';\n" + fnText + "; return orderStatusLabel;})()")(FA);
      out.iife = 'OK: ' + f('cod');
    } catch (e) { out.iife = 'THROWS: ' + e.message; }

    // eval the whole file in global scope
    try {
      (0, eval)(src);
      out.fullFileEval = 'OK';
    } catch (e) { out.fullFileEval = 'THROWS: ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]; }

    return out;
  });
  console.log(JSON.stringify(probe, null, 2));

  await browser.close();
} finally {
  db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
  console.log('cleaned up temp session');
}
