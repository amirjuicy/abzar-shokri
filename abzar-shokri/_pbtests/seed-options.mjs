// Seeds add-on options for product 1 through the real admin API flow.
const BASE = 'http://127.0.0.1:3000';

async function main() {
  const login = await fetch(BASE + '/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  }).then((r) => r.json());
  const token = login.token;
  if (!token) throw new Error('admin login failed: ' + JSON.stringify(login));
  const auth = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };

  // Clean any previous seeded options (idempotent re-runs).
  const existing = await fetch(BASE + '/api/admin/products/1/options', { headers: auth }).then((r) => r.json());
  for (const o of existing) {
    await fetch(BASE + '/api/admin/products/1/options/' + o.id, { method: 'DELETE', headers: auth });
  }

  const seeds = [
    { title: 'باتری یدکی ۴ آمپر', description: 'باتری لیتیوم-یون یدکی با ظرفیت ۴ آمپر ساعت', price: 850000, sortOrder: 1 },
    { title: 'کیف حمل برزنتی', description: 'کیف مقاوم حمل ابزار', price: 350000, discountPercent: 20, discountPrice: 280000, sortOrder: 2 },
    { title: 'ست مته الماسه', description: 'ست ۵ عددی مته الماسه', price: 220000, sortOrder: 3 },
    { title: 'گارانتی تمدیدشده ۲۴ ماهه', description: 'تمدید گارانتی به مدت ۲۴ ماه', price: 180000, isActive: false, sortOrder: 4 },
  ];
  for (const s of seeds) {
    const res = await fetch(BASE + '/api/admin/products/1/options', { method: 'POST', headers: auth, body: JSON.stringify(s) });
    const j = await res.json();
    console.log(res.status, j.id, j.title, j.price, j.discountPercent, j.discountPrice, j.isActive);
  }

  const pub = await fetch(BASE + '/api/products/1/options').then((r) => r.json());
  console.log('public options:', pub.map((o) => `${o.id}:${o.title}:${o.price}:${o.discountPrice ?? '-'}`).join(' | '));
}

main().catch((e) => { console.error(e); process.exit(1); });
