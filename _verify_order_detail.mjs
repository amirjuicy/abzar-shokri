import puppeteer from 'puppeteer-core';
import { DatabaseSync } from 'node:sqlite';

const DB = 'C:/Users/INO/Desktop/project/abzar-shokri/abzar-shokri/data/abzar-shokri.db';
const BASE = 'http://127.0.0.1:3000';
const ORDER_ID = 'ORD-MV3UAX670ZL';
const OWNER_ID = 'u_mucd2sgsiwhpu';

const db = new DatabaseSync(DB);
const token = 'verify_token_' + Date.now().toString(36);
db.prepare("INSERT INTO customer_sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").run(token, OWNER_ID);

let failures = 0;
function check(name, cond) {
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
  if (!cond) failures++;
}

try {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));

  await page.evaluateOnNewDocument((uid, tok) => {
    try {
      localStorage.setItem('as_session', JSON.stringify({
        userId: uid,
        token: tok,
        user: { id: uid, firstName: 'سید امیر حسین', lastName: 'موسوی', mobile: '09303797187', email: 'amirhosseinm8403@gmail.com', joinDate: '۱۴۰۵/۶/۱' },
      }));
    } catch (e) {}
  }, OWNER_ID, token);

  await page.goto(BASE + '/account', { waitUntil: 'domcontentloaded' });

  console.log('== 1. API shape (raw data path) ==');
  const apiRes = await page.evaluate(async (oid, tok) => {
    const r = await fetch('/api/orders/' + oid, { headers: { Authorization: 'Bearer ' + tok } });
    return { status: r.status, body: await r.json() };
  }, ORDER_ID, token);
  check('GET /api/orders/:id returns 200', apiRes.status === 200);
  console.log('  paymentMethod:', apiRes.body.paymentMethod, '| timeline:', JSON.stringify(apiRes.body.timeline));
  check('API paymentMethod is raw code "cod"', apiRes.body.paymentMethod === 'cod');
  check('API timeline event has status+date (no step field)', apiRes.body.timeline[0].status === 'awaiting_order_approval' && !('step' in apiRes.body.timeline[0]));

  console.log('== 2. Order detail page rendering ==');
  await page.goto(BASE + '/account/orders/' + ORDER_ID, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));

  const pmText = await page.evaluate(() => {
    const ps = [...document.querySelectorAll('.account-content p')];
    const el = ps.find((p) => p.textContent.includes('پرداخت') || p.textContent === 'cod' || p.textContent === 'online' || p.textContent === 'card');
    return el ? el.textContent.trim() : null;
  });
  console.log('  payment method text:', JSON.stringify(pmText));
  check('payment method shows «پرداخت در محل» for cod', pmText === 'پرداخت در محل');

  const timeline = await page.evaluate(() => {
    const steps = [...document.querySelectorAll('.order-timeline__step')];
    return steps.map((s) => ({
      name: s.querySelector('.order-timeline__step-name').textContent.trim(),
      done: s.classList.contains('is-done'),
    }));
  });
  console.log('  timeline steps:', JSON.stringify(timeline));
  check('timeline has 1 step', timeline.length === 1);
  check('timeline title is «در انتظار تأیید سفارش» (not undefined)', timeline[0] && timeline[0].name === 'در انتظار تأیید سفارش');
  check('timeline step marked is-done (current status reached)', timeline[0] && timeline[0].done === true);
  const bodyText = await page.evaluate(() => document.body.innerText);
  check('no "undefined" anywhere on page', !bodyText.includes('undefined'));

  console.log('== 3. Label maps: every payment method + status ==');
  const labels = await page.evaluate(() => ({
    pm: {
      cod: paymentMethodLabel('cod'),
      online: paymentMethodLabel('online'),
      card: paymentMethodLabel('card'),
      unknown: paymentMethodLabel('bitcoin'),
      empty: paymentMethodLabel(''),
    },
    st: {
      pending: orderStatusLabel('pending'),
      awaiting_payment_approval: orderStatusLabel('awaiting_payment_approval'),
      awaiting_order_approval: orderStatusLabel('awaiting_order_approval'),
      approved: orderStatusLabel('approved'),
      processing: orderStatusLabel('processing'),
      shipped: orderStatusLabel('shipped'),
      delivered: orderStatusLabel('delivered'),
      cancelled: orderStatusLabel('cancelled'),
      unknown: orderStatusLabel('weird_status'),
      empty: orderStatusLabel(''),
    },
    done: {
      initialOfAwaitingOrder: orderTimelineDone({ status: 'awaiting_order_approval' }, 'awaiting_order_approval'),
      initialOfDelivered: orderTimelineDone({ status: 'awaiting_order_approval' }, 'delivered'),
      pendingOfDelivered: orderTimelineDone({ status: 'pending' }, 'delivered'),
      aheadOfCurrent: orderTimelineDone({ status: 'shipped' }, 'pending'),
      unknownVsUnknown: orderTimelineDone({ status: 'weird' }, 'weird'),
      unknownVsKnown: orderTimelineDone({ status: 'weird' }, 'delivered'),
      explicitDone: orderTimelineDone({ status: 'shipped', done: false }, 'delivered'),
      nullEvent: orderTimelineDone(null, 'delivered'),
    },
  }));
  console.log('  paymentMethodLabel:', JSON.stringify(labels.pm));
  console.log('  orderStatusLabel:', JSON.stringify(labels.st));
  console.log('  orderTimelineDone:', JSON.stringify(labels.done));

  check('cod -> پرداخت در محل', labels.pm.cod === 'پرداخت در محل');
  check('online -> پرداخت آنلاین', labels.pm.online === 'پرداخت آنلاین');
  check('card -> کارت به کارت', labels.pm.card === 'کارت به کارت');
  check('unknown payment falls back to raw value', labels.pm.unknown === 'bitcoin');
  check('empty payment falls back to dash', labels.pm.empty === '—');

  check('pending label', labels.st.pending === 'در انتظار پرداخت');
  check('awaiting_payment_approval label', labels.st.awaiting_payment_approval === 'در انتظار تأیید پرداخت');
  check('awaiting_order_approval label', labels.st.awaiting_order_approval === 'در انتظار تأیید سفارش');
  check('approved label', labels.st.approved === 'تأیید شد / آماده ارسال');
  check('processing label', labels.st.processing === 'در حال پردازش');
  check('shipped label', labels.st.shipped === 'ارسال‌شده');
  check('delivered label', labels.st.delivered === 'تحویل‌شده');
  check('cancelled label', labels.st.cancelled === 'لغوشده');
  check('unknown status falls back to raw value', labels.st.unknown === 'weird_status');
  check('empty status falls back to dash', labels.st.empty === '—');

  check('event at current status is done', labels.done.initialOfAwaitingOrder === true);
  check('past event of delivered order is done', labels.done.initialOfDelivered === true);
  check('pending event of delivered order is done', labels.done.pendingOfDelivered === true);
  check('event ahead of current status is not done', labels.done.aheadOfCurrent === false);
  check('unknown==unknown counts as done', labels.done.unknownVsUnknown === true);
  check('unknown vs known not done', labels.done.unknownVsKnown === false);
  check('explicit t.done wins', labels.done.explicitDone === false);
  check('null event not done', labels.done.nullEvent === false);

  await page.screenshot({ path: 'C:/Users/INO/AppData/Local/Temp/opencode/order-detail-verify.png', fullPage: true });
  await browser.close();
} finally {
  db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
  console.log('cleaned up temp session');
}

console.log(failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
