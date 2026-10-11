import puppeteer from 'puppeteer-core';
import { DatabaseSync } from 'node:sqlite';

const DB = 'C:/Users/INO/Desktop/project/abzar-shokri/abzar-shokri/data/abzar-shokri.db';
const BASE = 'http://127.0.0.1:3000';
const ORDER_ID = 'ORD-MV3UAX670ZL';
const OWNER_ID = 'u_mucd2sgsiwhpu';

const db = new DatabaseSync(DB);
const token = 'verify_token_' + Date.now().toString(36);
db.prepare("INSERT INTO customer_sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").run(token, OWNER_ID);

const SL_RE = /function orderStatusLabel\(s\) \{[\s\S]*?\n  \}/;

const variants = {
  rename_t: (b) => b.replace(SL_RE, "function orderStatusLabel(s) {\n    var lbl = String(s || '');\n    return ORDER_STATUS_FA[lbl] || lbl || '—';\n  }"),
  no_fallback: (b) => b.replace(SL_RE, "function orderStatusLabel(s) {\n    var t = String(s || '');\n    return ORDER_STATUS_FA[t];\n  }"),
  no_string: (b) => b.replace(SL_RE, "function orderStatusLabel(s) {\n    var t = s || '';\n    return ORDER_STATUS_FA[t] || t || '—';\n  }"),
  no_var: (b) => b.replace(SL_RE, "function orderStatusLabel(s) {\n    return ORDER_STATUS_FA[s || ''] || s || '—';\n  }"),
  no_emdash: (b) => b.replace(SL_RE, "function orderStatusLabel(s) {\n    var t = String(s || '');\n    return ORDER_STATUS_FA[t] || t || 'x';\n  }"),
};

try {
  for (const [name, mutate] of Object.entries(variants)) {
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setBypassServiceWorker(true);

    await page.setRequestInterception(true);
    page.on('request', async (req) => {
      if (req.url().includes('/assets/js/account.js')) {
        const res = await fetch(req.url());
        let body = await res.text();
        const blockStart = body.indexOf('  var ORDER_STATUS_FA = {');
        const blockEnd = body.indexOf('  function renderOrderDetail(el) {');
        let mutated = 'none';
        if (blockStart !== -1 && blockEnd !== -1) {
          const block = body.slice(blockStart, blockEnd);
          const newBlock = mutate(block);
          mutated = newBlock === block ? 'NO-MATCH' : 'applied';
          body = body.slice(0, blockStart) + newBlock + body.slice(blockEnd);
        }
        console.log(`[${name}] mutation: ${mutated}`);
        await req.respond({ status: 200, contentType: 'application/javascript', body });
      } else {
        await req.continue();
      }
    });

    await page.evaluateOnNewDocument((uid, tok) => {
      try {
        localStorage.setItem('as_session', JSON.stringify({
          userId: uid, token: tok,
          user: { id: uid, firstName: 'سید امیر حسین', lastName: 'موسوی', mobile: '09303797187', email: 'amirhosseinm8403@gmail.com', joinDate: '۱۴۰۵/۶/۱' },
        }));
      } catch (e) {}
    }, OWNER_ID, token);

    await page.goto(BASE + '/account/orders/' + ORDER_ID, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2500));

    const state = await page.evaluate(() => ({
      timeline: [...document.querySelectorAll('.order-timeline__step-name')].map((e) => e.textContent.trim()),
    }));
    console.log(name, '=> timeline:', JSON.stringify(state.timeline));
    await browser.close();
  }
} finally {
  db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
  console.log('cleaned up temp session');
}
