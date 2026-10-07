/* Abzar Shokri — Admin Dashboard (real backend data only).
 * Replaces all hardcoded dashboard mocks with live values from:
 *   GET /api/admin/summary  — aggregates (revenue, orders, users, stock, 7-day sales, top products)
 *   GET /api/orders         — recent orders with customers
 * No mock fallback: empty states are rendered when the database has no rows.
 */
(function () {
  'use strict';

  var API = (function () {
    try { return new URL('/api/', window.location.href).toString().replace(/\/$/, ''); }
    catch (e) { return '/api'; }
  })();

  function tok() { try { var s = JSON.parse(localStorage.getItem('as_admin_session') || 'null'); return (s && s.token) || ''; } catch (e) { return ''; } }
  function get(path) {
    var h = {};
    var t = tok();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return fetch(API + path, { headers: h }).then(function (res) {
      if (!res.ok) throw new Error('API ' + res.status);
      return res.json();
    });
  }
  function fa(n) {
    try { return Number(n || 0).toLocaleString('fa-IR'); }
    catch (e) { return String(n == null ? 0 : n); }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  var STATUS_META = {
    pending: { text: 'در انتظار پرداخت', badge: 'adm-badge--warning' },
    awaiting_payment_approval: { text: 'در انتظار تأیید پرداخت', badge: 'adm-badge--warning' },
    awaiting_order_approval: { text: 'در انتظار تأیید سفارش', badge: 'adm-badge--warning' },
    approved: { text: 'تأیید شد / آماده ارسال', badge: 'adm-badge--success' },
    processing: { text: 'در حال پردازش', badge: 'adm-badge--primary' },
    shipped: { text: 'ارسال‌شده', badge: 'adm-badge--info' },
    delivered: { text: 'تحویل‌شده', badge: 'adm-badge--success' },
    cancelled: { text: 'لغوشده', badge: 'adm-badge--danger' }
  };
  function normStatus(s) {
    s = String(s || 'pending').toLowerCase();
    if (s === 'shipping') return 'shipped';
    if (s === 'canceled') return 'cancelled';
    return STATUS_META[s] ? s : 'pending';
  }
  function customerName(c) {
    if (!c) return 'مشتری';
    var n = ((c.firstName || '') + ' ' + (c.lastName || '')).trim();
    return n || c.mobile || c.email || 'مشتری';
  }

  function renderStats(s) {
    var rev = $('adm-stat-revenue');
    if (rev) rev.innerHTML = fa(s.todayRevenue) + ' <small style="font-size:12px;color:var(--text-muted)">تومان</small>';
    var ord = $('adm-stat-orders');
    if (ord) ord.textContent = fa(s.todayOrders);
    var usr = $('adm-stat-users');
    if (usr) usr.textContent = fa(s.usersCount);
    var stk = $('adm-stat-stock');
    if (stk) stk.textContent = fa(s.outOfStock);
    var d1 = $('adm-stat-revenue-delta');
    if (d1) d1.textContent = 'مجموع کل: ' + fa(s.totalRevenue) + ' تومان';
    var d2 = $('adm-stat-orders-delta');
    if (d2) d2.textContent = fa(s.pendingOrders) + ' سفارش در انتظار';
    var d3 = $('adm-stat-users-delta');
    if (d3) d3.textContent = fa(s.usersCount) + ' کاربر ثبت‌شده';
    var d4 = $('adm-stat-stock-delta');
    if (d4) d4.textContent = fa(s.lowStock) + ' کالا با موجودی کم';
    var badge = $('adm-nav-orders-badge');
    if (badge) badge.textContent = fa(s.totalOrders);
  }

  function renderChart(s) {
    var chart = $('adm-sales-chart');
    var total = $('adm-sales-total');
    var legend = $('adm-sales-legend');
    var days = s.last7Days || [];
    var sum = days.reduce(function (a, d) { return a + (Number(d.revenue) || 0); }, 0);
    var max = Math.max.apply(null, days.map(function (d) { return Number(d.orders) || 0; }).concat([1]));
    if (total) total.textContent = 'مجموع ۷ روز: ' + fa(sum) + ' تومان';
    if (chart) {
      if (!days.length) {
        chart.innerHTML = '<p style="font-size:13px;color:var(--text-muted);padding:16px">داده‌ای ثبت نشده است.</p>';
      } else {
        chart.innerHTML = days.map(function (d) {
          var h = Math.max(4, Math.round(((Number(d.orders) || 0) / max) * 100));
          var day = '';
          try { day = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(new Date(d.date + 'T12:00:00')); }
          catch (e) { day = d.date; }
          return '<div class="adm-chart__col"><span class="adm-chart__value">' + fa(d.orders) +
            '</span><span class="adm-chart__bar" style="height:' + h + '%"></span>' +
            '<span class="adm-chart__day">' + esc(day) + '</span></div>';
        }).join('');
      }
    }
    if (legend) {
      var n = days.length ? days.reduce(function (a, d) { return a + (Number(d.orders) || 0); }, 0) : 0;
      legend.innerHTML = '<span class="adm-chart__legend-item">مجموع سفارش ۷ روز: <strong>' + fa(n) + '</strong></span>' +
        '<span class="adm-chart__legend-item">مجموع فروش ۷ روز: <strong>' + fa(sum) + ' تومان</strong></span>';
    }
  }

  function renderTop(s) {
    var box = $('adm-top-products');
    if (!box) return;
    var list = s.topProducts || [];
    if (!list.length) {
      box.innerHTML = '<p style="font-size:13px;color:var(--text-muted);padding:12px">هنوز فروشی ثبت نشده است.</p>';
      return;
    }
    box.innerHTML = list.map(function (t) {
      var img = t.image ? '../assets/images/products/' + String(t.image).split('/').pop() : '../assets/images/products/placeholder.svg';
      return '<div class="adm-top-item"><span class="adm-top-item__thumb"><img src="' + esc(img) +
        '" alt="' + esc(t.name) + '"></span><div class="adm-top-item__meta"><span class="adm-top-item__name">' +
        esc(t.name) + '</span><span class="adm-top-item__cat">' + esc(t.category || '') +
        '</span></div><span class="adm-top-item__sold">' + fa(t.sold) + ' فروش</span></div>';
    }).join('');
  }

  function renderRecent(orders) {
    var tbody = $('adm-recent-orders');
    if (!tbody) return;
    var recent = (orders || []).slice(0, 5);
    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted)">هنوز هیچ سفارشی ثبت نشده است.</td></tr>';
      return;
    }
    tbody.innerHTML = recent.map(function (o) {
      var st = normStatus(o.status);
      var meta = STATUS_META[st];
      var name = customerName(o.customer);
      return '<tr data-status="' + st + '"><td><span class="adm-order-id">' + esc(o.id) +
        '</span></td><td><span class="adm-user"><span class="adm-user__avatar">' + esc((name || 'م').trim().charAt(0) || 'م') +
        '</span><span class="adm-user__name">' + esc(name) + '</span></span></td><td>' + esc(o.date || '—') +
        '</td><td>' + fa(o.total) + '</td><td><span class="adm-badge ' + meta.badge + '">' + meta.text +
        '</span></td><td><div class="adm-table__cell-actions"><a class="adm-btn-icon" href="#/orders" title="مشاهده">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
        '</a></div></td></tr>';
    }).join('');
  }

  function clearDashboard() {
    var rev = $('adm-stat-revenue');
    if (rev) rev.textContent = '…';
    var ord = $('adm-stat-orders');
    if (ord) ord.textContent = '…';
    var usr = $('adm-stat-users');
    if (usr) usr.textContent = '…';
    var stk = $('adm-stat-stock');
    if (stk) stk.textContent = '…';
    var d1 = $('adm-stat-revenue-delta');
    if (d1) d1.textContent = '';
    var d2 = $('adm-stat-orders-delta');
    if (d2) d2.textContent = '';
    var d3 = $('adm-stat-users-delta');
    if (d3) d3.textContent = '';
    var d4 = $('adm-stat-stock-delta');
    if (d4) d4.textContent = '';
    var badge = $('adm-nav-orders-badge');
    if (badge) badge.textContent = '';
    var total = $('adm-sales-total');
    if (total) total.textContent = '';
    var legend = $('adm-sales-legend');
    if (legend) legend.innerHTML = '';
    var chart = $('adm-sales-chart');
    if (chart) chart.innerHTML = '<p style="font-size:13px;color:var(--text-muted);padding:16px">در حال بارگذاری…</p>';
    var top = $('adm-top-products');
    if (top) top.innerHTML = '<p style="font-size:13px;color:var(--text-muted);padding:12px">در حال بارگذاری…</p>';
    var tbody = $('adm-recent-orders');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted)">در حال بارگذاری…</td></tr>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    clearDashboard();
    get('/admin/summary').then(function (s) {
      renderStats(s || {});
      renderChart(s || {});
      renderTop(s || {});
    }).catch(function () {});
    get('/orders').then(renderRecent).catch(function () {});
  });
})();
