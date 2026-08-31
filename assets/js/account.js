/* ================================================================
   Abzar Shokri — Account Pages
   All data is user-scoped via localStorage.
   Shows empty states when user has no data.
   ================================================================ */
(function() {
  'use strict';
  var $ = function(s,c) { return (c||document).querySelector(s); };
  var $$ = function(s,c) { return [...(c||document).querySelectorAll(s)]; };

  function getPage() {
    var path = window.location.pathname;
    if (path.includes('orders/')) return 'order-detail';
    if (path.includes('orders')) return 'orders';
    if (path.includes('profile')) return 'profile';
    if (path.includes('addresses')) return 'addresses';
    if (path.includes('wishlist')) return 'wishlist';
    return 'dashboard';
  }

  function render() {
    /* ── Update sidebar with current user data ──────────── */
    updateSidebar();
    bindLogout();

    /* ── Auth Guard ──────────────────────────────────────── */
    if (!App.isLoggedIn()) {
      var content = $('#account-content');
      if (content) {
        content.innerHTML = '\
          <div class="empty-state" style="padding:var(--space-16) 0">\
            <span class="empty-state__icon" style="width:80px;height:80px">' + Icons.user + '</span>\
            <h3 class="empty-state__title">برای مشاهده پنل کاربری وارد شوید</h3>\
            <p class="empty-state__text">ابتدا باید به حساب کاربری خود وارد شوید یا ثبت‌نام کنید.</p>\
            <div style="display:flex;gap:var(--space-3);justify-content:center">\
              <a href="login.html" class="btn btn-primary btn-lg">ورود</a>\
              <a href="register.html" class="btn btn-secondary btn-lg">ثبت‌نام</a>\
            </div>\
          </div>';
      }
      highlightNav();
      return;
    }

    var page = getPage();
    var content = $('#account-content');
    if (!content) return;

    switch(page) {
      case 'dashboard': renderDashboard(content); break;
      case 'orders': renderOrders(content); break;
      case 'order-detail': renderOrderDetail(content); break;
      case 'profile': renderProfile(content); break;
      case 'addresses': renderAddresses(content); break;
      case 'wishlist': renderWishlist(content); break;
    }
    highlightNav();
  }

  /* ── Sidebar: populate from current user ────────────────── */
  function updateSidebar() {
    var user = App.getCurrentUser();
    var nameEl = $('.account-sidebar__name');
    var emailEl = $('.account-sidebar__email');
    if (user) {
      if (nameEl) nameEl.textContent = user.firstName + ' ' + user.lastName;
      if (emailEl) emailEl.textContent = user.email || user.mobile;
    } else {
      if (nameEl) nameEl.textContent = 'مهمان';
      if (emailEl) emailEl.textContent = 'ورود نکرده‌اید';
    }
  }

  function bindLogout() {
    var logoutLink = document.querySelector('.account-nav-link[href="login.html"]');
    if (logoutLink) {
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        App.logout();
        App.showToast('با موفقیت خارج شدید.', 'info');
        setTimeout(function() { window.location.href = 'login.html'; }, 500);
      });
    }
  }

  /* ── Dashboard ─────────────────────────────────────────── */
  function renderDashboard(el) {
    var user = App.getCurrentUser();
    var orders = App.getUserData('orders', []);
    var wishCount = App.getWishlist().length;
    var pending = orders.filter(function(o) { return o.status === 'pending'; }).length;
    var processing = orders.filter(function(o) { return o.status === 'processing' || o.status === 'shipping'; }).length;
    var delivered = orders.filter(function(o) { return o.status === 'delivered'; }).length;

    el.innerHTML = '\
    <h2 class="account-content__title">داشبورد</h2>\
    <div style="background:var(--color-primary-50);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-6)">\
      <p style="font-size:var(--font-size-md);font-weight:var(--font-weight-semibold)">سلام ' + user.firstName + ' ' + user.lastName + ' 👋</p>\
      <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-top:var(--space-1)">از پنل کاربری خود مدیریت سفارش‌ها و اطلاعات حساب را انجام دهید.</p>\
    </div>\
    <div class="dashboard-stats">\
      <div class="stat-card"><div class="stat-card__value">' + Format.toPersianNumber(orders.length) + '</div><div class="stat-card__label">کل سفارش‌ها</div></div>\
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-warning)">' + Format.toPersianNumber(pending) + '</div><div class="stat-card__label">در انتظار پرداخت</div></div>\
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-info)">' + Format.toPersianNumber(processing) + '</div><div class="stat-card__label">در حال پردازش</div></div>\
      <div class="stat-card"><div class="stat-card__value" style="color:var(--color-success)">' + Format.toPersianNumber(delivered) + '</div><div class="stat-card__label">تحویل شده</div></div>\
    </div>';

    if (orders.length === 0) {
      el.innerHTML += '\
      <div style="margin-top:var(--space-6)">\
        <div class="empty-state">\
          <span class="empty-state__icon">' + Icons.package + '</span>\
          <h3 class="empty-state__title">هنوز سفارشی ثبت نکرده‌اید</h3>\
          <p class="empty-state__text">محصولات مورد نظر خود را از فروشگاه انتخاب کرده و سفارش دهید.</p>\
          <a href="shop.html" class="btn btn-primary">مشاهده فروشگاه</a>\
        </div>\
      </div>';
    } else {
      el.innerHTML += '\
      <div style="margin-top:var(--space-6)">\
        <h3 style="font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">آخرین سفارش‌ها</h3>\
        <div style="overflow-x:auto">' + renderOrdersTable(orders.slice(0, 3)) + '</div>\
      </div>';
    }
  }

  /* ── Orders ────────────────────────────────────────────── */
  function renderOrders(el) {
    var orders = App.getUserData('orders', []);
    el.innerHTML = '<h2 class="account-content__title">سفارش‌های من</h2>';

    if (orders.length === 0) {
      el.innerHTML += '\
      <div class="empty-state" style="padding:var(--space-12) 0">\
        <span class="empty-state__icon" style="width:80px;height:80px">' + Icons.package + '</span>\
        <h3 class="empty-state__title">هنوز سفارشی ثبت نکرده‌اید</h3>\
        <p class="empty-state__text">پس از ثبت سفارش، لیست سفارش‌های شما اینجا نمایش داده خواهد شد.</p>\
        <a href="shop.html" class="btn btn-primary">مشاهده فروشگاه</a>\
      </div>';
    } else {
      el.innerHTML += '<div style="overflow-x:auto">' + renderOrdersTable(orders) + '</div>';
    }
  }

  function renderOrdersTable(orders) {
    if (orders.length === 0) return '';
    return '<table class="orders-table"><thead><tr><th>شماره سفارش</th><th>تاریخ</th><th>وضعیت</th><th>تعداد اقلام</th><th>مبلغ</th><th>عملیات</th></tr></thead><tbody>' + orders.map(function(o) {
      return '<tr><td style="font-weight:var(--font-weight-semibold)">' + o.id + '</td><td>' + o.date + '</td><td><span class="order-status order-status--' + o.status + '">' + o.statusText + '</span></td><td>' + Format.toPersianNumber(o.itemsCount) + ' عدد</td><td style="font-weight:var(--font-weight-semibold)">' + Format.priceWithCurrency(o.total) + '</td><td><a href="account/orders/' + o.id + '.html" class="btn btn-sm btn-secondary">مشاهده</a></td></tr>';
    }).join('') + '</tbody></table>';
  }

  /* ── Order Detail ──────────────────────────────────────── */
  function renderOrderDetail(el) {
    var path = window.location.pathname;
    var orderId = path.split('/').pop().replace('.html', '');
    var orders = App.getUserData('orders', []);
    var order = orders.find(function(o) { return o.id === orderId; });

    if (!order) {
      el.innerHTML = '\
      <div class="empty-state" style="padding:var(--space-12) 0">\
        <span class="empty-state__icon" style="width:80px;height:80px">' + Icons.package + '</span>\
        <h3 class="empty-state__title">سفارش یافت نشد</h3>\
        <p class="empty-state__text">این سفارش متعلق به حساب کاربری شما نیست یا وجود ندارد.</p>\
        <a href="account/orders.html" class="btn btn-primary">بازگشت به سفارش‌ها</a>\
      </div>';
      return;
    }

    document.title = 'سفارش ' + order.id + ' | ابزار شکری';

    el.innerHTML = '\
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6);flex-wrap:wrap;gap:var(--space-3)">\
      <div><h2 class="account-content__title" style="margin-bottom:var(--space-1)">سفارش ' + order.id + '</h2><p style="font-size:var(--font-size-sm);color:var(--text-muted)">' + order.date + '</p></div>\
      <span class="order-status order-status--' + order.status + '" style="font-size:var(--font-size-sm);padding:6px 16px">' + order.statusText + '</span>\
    </div>\
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">\
      <div>\
        <h3 style="font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">جدول زمانی سفارش</h3>\
        <div class="order-timeline">' + order.timeline.map(function(t) {
          return '<div class="order-timeline__step ' + (t.done ? 'is-done' : '') + '"><div class="order-timeline__dot"></div><div class="order-timeline__content"><div class="order-timeline__step-name">' + t.step + '</div><div class="order-timeline__step-date">' + t.date + '</div></div></div>';
        }).join('') + '</div>\
        <h3 style="font-weight:var(--font-weight-bold);margin:var(--space-6) 0 var(--space-3)">آدرس ارسال</h3>\
        <p style="font-size:var(--font-size-sm);color:var(--text-secondary)">' + order.address + '</p>\
        <h3 style="font-weight:var(--font-weight-bold);margin:var(--space-6) 0 var(--space-3)">روش پرداخت</h3>\
        <p style="font-size:var(--font-size-sm);color:var(--text-secondary)">' + order.paymentMethod + '</p>\
      </div>\
      <div>\
        <h3 style="font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">اقلام سفارش</h3>\
        <div style="background:var(--color-gray-50);border-radius:var(--radius-lg);padding:var(--space-4)">' + order.items.map(function(item) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0;border-bottom:1px solid var(--border-color-light)"><div><div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm)">' + item.name + '</div><div style="font-size:var(--font-size-xs);color:var(--text-muted)">' + Format.toPersianNumber(item.quantity) + ' عدد × ' + Format.priceWithCurrency(item.price) + '</div></div><div style="font-weight:var(--font-weight-semibold)">' + Format.priceWithCurrency(item.price * item.quantity) + '</div></div>';
        }).join('') + '\
        <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:2px solid var(--border-color)">\
          <div style="display:flex;justify-content:space-between;font-size:var(--font-size-sm);padding:var(--space-1) 0"><span>هزینه ارسال</span><span>' + (order.shipping === 0 ? 'رایگان' : Format.priceWithCurrency(order.shipping)) + '</span></div>\
          <div style="display:flex;justify-content:space-between;font-weight:var(--font-weight-bold);font-size:var(--font-size-lg);color:var(--color-primary);padding-top:var(--space-2)"><span>جمع کل</span><span>' + Format.priceWithCurrency(order.total) + '</span></div>\
        </div></div>\
      </div>\
    </div>';
  }

  /* ── Profile ───────────────────────────────────────────── */
  function renderProfile(el) {
    var user = App.getCurrentUser();
    var profile = App.getUserData('profile', {
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      email: user.email
    });

    el.innerHTML = '\
    <h2 class="account-content__title">جزئیات حساب</h2>\
    <form id="profile-form" style="max-width:600px">\
      <div class="form-row"><div class="form-group"><label class="input-label">نام</label><input class="input" value="' + profile.firstName + '" id="profile-firstname" required></div><div class="form-group"><label class="input-label">نام خانوادگی</label><input class="input" value="' + profile.lastName + '" id="profile-lastname" required></div></div>\
      <div class="form-row" style="margin-top:var(--space-4)"><div class="form-group"><label class="input-label">موبایل</label><input class="input" value="' + profile.mobile + '" dir="ltr" id="profile-mobile" required></div><div class="form-group"><label class="input-label">ایمیل</label><input class="input" value="' + profile.email + '" dir="ltr" id="profile-email"></div></div>\
      <button type="submit" class="btn btn-primary" style="margin-top:var(--space-6)">ذخیره تغییرات</button>\
    </form>\
    <hr style="margin:var(--space-8) 0;border:none;border-top:1px solid var(--border-color-light)">\
    <h3 style="font-weight:var(--font-weight-bold);margin-bottom:var(--space-4)">تغییر رمز عبور</h3>\
    <form id="password-form" style="max-width:600px">\
      <div class="form-group" style="margin-bottom:var(--space-4)"><label class="input-label">رمز عبور فعلی</label><input class="input" type="password" required></div>\
      <div class="form-group" style="margin-bottom:var(--space-4)"><label class="input-label">رمز عبور جدید</label><input class="input" type="password" required></div>\
      <div class="form-group" style="margin-bottom:var(--space-4)"><label class="input-label">تکرار رمز عبور جدید</label><input class="input" type="password" required></div>\
      <button type="submit" class="btn btn-primary">تغییر رمز عبور</button>\
    </form>';

    var pf = $('#profile-form');
    if (pf) pf.addEventListener('submit', function(e) {
      e.preventDefault();
      var fn = $('#profile-firstname');
      var ln = $('#profile-lastname');
      var mb = $('#profile-mobile');
      var em = $('#profile-email');
      if (fn && ln && mb) {
        var profileData = {
          firstName: fn.value.trim(),
          lastName: ln.value.trim(),
          mobile: mb.value.trim(),
          email: em ? em.value.trim() : ''
        };
        App.setUserData('profile', profileData);
        /* Also update the user record in as_users */
        var user = App.getCurrentUser();
        if (user) {
          var users = JSON.parse(localStorage.getItem('as_users') || '[]');
          var idx = users.findIndex(function(u) { return u.id === user.id; });
          if (idx !== -1) {
            users[idx].firstName = profileData.firstName;
            users[idx].lastName = profileData.lastName;
            users[idx].mobile = profileData.mobile;
            users[idx].email = profileData.email;
            localStorage.setItem('as_users', JSON.stringify(users));
          }
        }
        updateSidebar();
        App.showToast('اطلاعات با موفقیت ذخیره شد!', 'success');
      }
    });
    var pwf = $('#password-form');
    if (pwf) pwf.addEventListener('submit', function(e) { e.preventDefault(); App.showToast('رمز عبور تغییر کرد! (شبیه‌سازی)', 'success'); });
  }

  /* ── Addresses ─────────────────────────────────────────── */
  function renderAddresses(el) {
    var addresses = App.getUserData('addresses', []);

    el.innerHTML = '\
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6)"><h2 class="account-content__title" style="margin:0">آدرس‌ها</h2><button class="btn btn-primary btn-sm" onclick="AccountPage.showAddAddress()">افزودن آدرس جدید</button></div>';

    if (addresses.length === 0) {
      el.innerHTML += '\
      <div class="empty-state" style="padding:var(--space-12) 0">\
        <span class="empty-state__icon" style="width:80px;height:80px">' + Icons.mapPin + '</span>\
        <h3 class="empty-state__title">هنوز آدرسی ثبت نکرده‌اید</h3>\
        <p class="empty-state__text">آدرس‌های خود را برای تسریع در فرآیند خرید ثبت کنید.</p>\
        <button class="btn btn-primary" onclick="AccountPage.showAddAddress()">افزودن آدرس جدید</button>\
      </div>';
    } else {
      el.innerHTML += '<div id="addresses-list">' + addresses.map(function(a) {
        return '<div class="address-card ' + (a.isDefault ? 'is-default' : '') + '">\
          <div><div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2)"><span class="address-card__title">' + a.title + '</span>' + (a.isDefault ? '<span class="address-card__badge">پیش‌فرض</span>' : '') + '</div>\
          <div class="address-card__text">' + a.name + ' - ' + a.mobile + '<br>' + a.province + '، ' + a.city + '، ' + a.address + '<br>کدپستی: ' + a.postalCode + '</div></div>\
          <div class="address-card__actions"><button class="btn btn-ghost btn-sm" onclick="AccountPage.editAddress(' + a.id + ')">ویرایش</button><button class="btn btn-ghost btn-sm" style="color:var(--color-danger)" onclick="AccountPage.deleteAddress(' + a.id + ')">حذف</button></div>\
        </div>';
      }).join('') + '</div>';
    }
  }

  /* ── Wishlist ──────────────────────────────────────────── */
  function renderWishlist(el) {
    var wishIds = App.getWishlist();
    var products = AppData.products.filter(function(p) { return wishIds.includes(p.id); });

    el.innerHTML = '<h2 class="account-content__title">علاقه‌مندی‌ها' + (products.length > 0 ? ' (' + Format.toPersianNumber(products.length) + ')' : '') + '</h2>';

    if (products.length === 0) {
      el.innerHTML += '\
      <div class="empty-state" style="padding:var(--space-12) 0">\
        <span class="empty-state__icon" style="width:80px;height:80px">' + Icons.heart + '</span>\
        <h3 class="empty-state__title">لیست علاقه‌مندی‌ها خالی است</h3>\
        <p class="empty-state__text">محصولات مورد علاقه خود را اضافه کنید.</p>\
        <a href="shop.html" class="btn btn-primary">مشاهده فروشگاه</a>\
      </div>';
      return;
    }

    el.innerHTML += '<div class="product-listing-grid" id="wishlist-grid">' + products.map(function(p) {
      var r = Format.rating(p.rating); var s = ''; for(var i=0;i<r.full;i++) s += Icons.star; for(var i=0;i<r.empty;i++) s += Icons.starEmpty;
      return '<div class="product-card"><div class="product-card__image"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><span style="width:48px;height:48px">' + Icons.package + '</span></div></div><div class="product-card__body"><span class="product-card__brand">' + p.brandName + '</span><a href="product.html?slug=' + p.slug + '" class="product-card__title" style="color:inherit;text-decoration:none">' + p.name + '</a><div class="product-card__rating"><span class="product-card__stars">' + s + '</span><span>(' + p.reviewCount + ')</span></div><div class="product-card__price"><span class="product-card__price-current">' + Format.price(p.price) + ' <span class="product-card__price-currency">تومان</span></span></div><div style="display:flex;gap:var(--space-2)"><button class="btn btn-primary btn-sm" onclick="App.addToCart(' + p.id + ')" style="flex:1">افزودن به سبد</button><button class="btn btn-ghost btn-icon btn-sm" onclick="App.toggleWishlist(' + p.id + ');AccountPage.refresh()" style="color:var(--color-danger)">' + Icons.trash + '</button></div></div></div>';
    }).join('') + '</div>';
  }

  /* ── Navigation Highlight ──────────────────────────────── */
  function highlightNav() {
    var page = getPage();
    $$('.account-nav-link').forEach(function(link) {
      var href = link.getAttribute('href') || '';
      if (href.includes(page) || (page === 'dashboard' && href.includes('account.html'))) {
        link.classList.add('is-active');
      }
    });
  }

  /* ── Public API ────────────────────────────────────────── */
  window.AccountPage = {
    refresh: function() { render(); },
    showAddAddress: function() {
      /* Simulate adding an address */
      var addresses = App.getUserData('addresses', []);
      var newAddr = {
        id: Date.now(),
        title: 'آدرس جدید',
        name: App.getCurrentUser().firstName + ' ' + App.getCurrentUser().lastName,
        mobile: App.getCurrentUser().mobile,
        province: 'تهران',
        city: 'تهران',
        address: 'آدرس جدید خود را وارد کنید',
        postalCode: '۰۰۰۰۰۰۰۰۰۰',
        isDefault: addresses.length === 0
      };
      addresses.push(newAddr);
      App.setUserData('addresses', addresses);
      App.showToast('آدرس جدید اضافه شد!', 'success');
      render();
    },
    editAddress: function(id) {
      App.showToast('ویرایش آدرس (شبیه‌سازی)', 'info');
    },
    deleteAddress: function(id) {
      var addresses = App.getUserData('addresses', []);
      addresses = addresses.filter(function(a) { return a.id !== id; });
      App.setUserData('addresses', addresses);
      App.showToast('آدرس حذف شد.', 'info');
      render();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
