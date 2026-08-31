/* ================================================================
   Abzar Shokri — Common Layout & Shared Components
   Renders header, footer, overlays on all internal pages.
   Manages user auth session, per-user data isolation.
   ================================================================ */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     USER MANAGEMENT
     ============================================================
     localStorage keys:
       as_users          — [{id, firstName, lastName, mobile, email, password, joinDate}]
       as_session        — {userId: "u_xxxxx"} | null
       as_user_{id}_profile   — {firstName, lastName, mobile, email}
       as_user_{id}_orders    — [order objects]
       as_user_{id}_addresses — [address objects]
     Public / non-user-scoped (guest-friendly):
       as_cart           — [{id, name, price, quantity, brandName}]
       as_wishlist       — [productIds]
     ============================================================ */

  /* ── Helpers ──────────────────────────────────────────────── */
  function generateId() {
    return 'u_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function generateOrderId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase().substr(-8);
  }

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* ── Session / Auth ──────────────────────────────────────── */
  function getSession() {
    return readJSON('as_session', null);
  }

  function setSession(userId) {
    if (userId) {
      writeJSON('as_session', { userId: userId });
    } else {
      localStorage.removeItem('as_session');
    }
  }

  function getCurrentUser() {
    var session = getSession();
    if (!session || !session.userId) return null;
    var users = readJSON('as_users', []);
    return users.find(function (u) { return u.id === session.userId; }) || null;
  }

  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  function userPrefix() {
    var user = getCurrentUser();
    return user ? 'as_user_' + user.id + '_' : null;
  }

  /* ── Per-User Data ───────────────────────────────────────── */
  function getUserData(key, fallback) {
    var prefix = userPrefix();
    if (!prefix) return fallback;
    return readJSON(prefix + key, fallback);
  }

  function setUserData(key, value) {
    var prefix = userPrefix();
    if (!prefix) return;
    writeJSON(prefix + key, value);
  }

  /* ── Registration ────────────────────────────────────────── */
  function register(data) {
    var users = readJSON('as_users', []);
    // Check duplicate mobile
    var exists = users.find(function (u) { return u.mobile === data.mobile; });
    if (exists) return { success: false, error: 'این شماره موبایل قبلاً ثبت‌نام شده است.' };
    // Check duplicate email
    if (data.email) {
      var emailExists = users.find(function (u) { return u.email === data.email; });
      if (emailExists) return { success: false, error: 'این ایمیل قبلاً ثبت‌نام شده است.' };
    }

    var user = {
      id: generateId(),
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      email: data.email || '',
      joinDate: new Date().toLocaleDateString('fa-IR')
    };

    users.push(user);
    writeJSON('as_users', users);

    // Initialize empty per-user data
    writeJSON('as_user_' + user.id + '_profile', {
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      email: user.email
    });
    writeJSON('as_user_' + user.id + '_orders', []);
    writeJSON('as_user_' + user.id + '_addresses', []);

    // Auto-login after registration
    setSession(user.id);
    return { success: true, user: user };
  }

  /* ── Login ───────────────────────────────────────────────── */
  function login(identifier, password) {
    var users = readJSON('as_users', []);
    var user = users.find(function (u) {
      return u.mobile === identifier || u.email === identifier;
    });
    if (!user) return { success: false, error: 'کاربری با این مشخصات یافت نشد.' };
    // In production, compare hashed passwords. For prototype, we skip password check.
    setSession(user.id);
    return { success: true, user: user };
  }

  /* ── Logout ──────────────────────────────────────────────── */
  function logout() {
    setSession(null);
  }

  /* ── State ───────────────────────────────────────────────── */
  const state = {
    cart: JSON.parse(localStorage.getItem('as_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('as_wishlist') || '[]'),
    searchOpen: false,
    mobileMenuOpen: false,
    cartDrawerOpen: false,
    activePage: ''
  };

  function saveCart() { localStorage.setItem('as_cart', JSON.stringify(state.cart)); }
  function saveWishlist() { localStorage.setItem('as_wishlist', JSON.stringify(state.wishlist)); }

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  /* ── Toast ────────────────────────────────────────────────── */
  function showToast(msg, type) {
    type = type || 'success';
    const c = $('.toast-container');
    if (!c) return;
    const iconMap = { success: Icons.checkCircle, danger: Icons.xCircle, warning: Icons.alertCircle, info: Icons.infoCircle };
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = '<span class="toast__icon">' + (iconMap[type] || iconMap.info) + '</span><span class="toast__content">' + msg + '</span><button class="toast__close" aria-label="بستن">' + Icons.close + '</button>';
    c.appendChild(t);
    t.querySelector('.toast__close').onclick = function () { removeToast(t); };
    setTimeout(function () { removeToast(t); }, 4000);
  }

  function removeToast(t) {
    if (!t || t.classList.contains('is-leaving')) return;
    t.classList.add('is-leaving');
    setTimeout(function () { t.remove(); }, 300);
  }

  /* ── Cart ─────────────────────────────────────────────────── */
  function addToCart(id) {
    var p = AppData.products.find(function (x) { return x.id === id; });
    if (!p) return;
    var ex = state.cart.find(function (x) { return x.id === id; });
    if (ex) { ex.quantity += 1; } else { state.cart.push({ id: p.id, name: p.name, price: p.price, quantity: 1, brandName: p.brandName }); }
    saveCart(); updateCartUI(); showToast(p.name + ' به سبد خرید اضافه شد');
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(function (x) { return x.id !== id; });
    saveCart(); updateCartUI(); showToast('محصول از سبد خرید حذف شد', 'info');
  }

  function updateCartQty(id, delta) {
    var item = state.cart.find(function (x) { return x.id === id; });
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) { removeFromCart(id); return; }
    saveCart(); updateCartUI();
  }

  function getCartTotal() { return state.cart.reduce(function (s, i) { return s + i.price * i.quantity; }, 0); }
  function getCartCount() { return state.cart.reduce(function (s, i) { return s + i.quantity; }, 0); }

  function updateCartUI() {
    var badges = $$('.header-action__badge');
    var count = getCartCount();
    badges.forEach(function (b) { b.textContent = count; b.style.display = count > 0 ? 'flex' : 'none'; });
    renderCartDrawer();
  }

  function renderCartDrawer() {
    var body = $('.drawer__body');
    var footer = $('.drawer__footer');
    if (!body) return;
    if (state.cart.length === 0) {
      body.innerHTML = '<div class="cart-empty"><span class="cart-empty__icon">' + Icons.shoppingBag + '</span><p class="cart-empty__text">سبد خرید شما خالی است</p><button class="btn btn-primary" onclick="App.toggleCartDrawer()">مشاهده محصولات</button></div>';
      if (footer) footer.style.display = 'none';
      return;
    }
    body.innerHTML = state.cart.map(function (item) {
      return '<div class="cart-item"><div class="cart-item__image"><span style="color:var(--text-muted);font-size:var(--font-size-xs)">' + Icons.package + '</span></div><div class="cart-item__details"><span class="cart-item__title">' + item.name + '</span><span class="cart-item__price">' + Format.priceWithCurrency(item.price) + '</span><div class="cart-item__quantity"><button class="cart-item__qty-btn" onclick="App.updateCartQty(' + item.id + ',-1)">' + Icons.minus + '</button><span class="cart-item__qty-value">' + item.quantity + '</span><button class="cart-item__qty-btn" onclick="App.updateCartQty(' + item.id + ',1)">' + Icons.plus + '</button></div></div><button class="cart-item__remove" onclick="App.removeFromCart(' + item.id + ')">' + Icons.trash + '</button></div>';
    }).join('');
    if (footer) {
      footer.style.display = 'block';
      var total = getCartTotal();
      footer.innerHTML = '<div class="cart-summary"><div class="cart-summary__row"><span>جمع سبد خرید</span><span>' + Format.priceWithCurrency(total) + '</span></div><div class="cart-summary__row cart-summary__row--total"><span>مبلغ قابل پرداخت</span><span>' + Format.priceWithCurrency(total) + '</span></div><a href="checkout.html" class="btn btn-primary btn-block btn-lg">تکمیل خرید</a><a href="cart.html" class="btn btn-secondary btn-block" onclick="App.toggleCartDrawer()">مشاهده سبد خرید</a></div>';
    }
  }

  /* ── Wishlist ─────────────────────────────────────────────── */
  function toggleWishlist(id) {
    var idx = state.wishlist.indexOf(id);
    if (idx === -1) { state.wishlist.push(id); showToast('به علاقه‌مندی‌ها اضافه شد'); } else { state.wishlist.splice(idx, 1); showToast('از علاقه‌مندی‌ها حذف شد', 'info'); }
    saveWishlist(); updateWishlistUI();
  }

  function updateWishlistUI() {
    $$('.product-card__action-btn[data-wishlist]').forEach(function (btn) {
      var id = parseInt(btn.dataset.wishlist);
      var active = state.wishlist.includes(id);
      btn.classList.toggle('is-active', active);
      btn.innerHTML = active ? Icons.heartFill : Icons.heart;
    });
  }

  /* ── Search ───────────────────────────────────────────────── */
  function toggleSearch() {
    var o = $('.search-modal'); if (!o) return;
    state.searchOpen = !state.searchOpen;
    o.classList.toggle('is-active', state.searchOpen);
    if (state.searchOpen) { var inp = $('input[type="text"]', o); if (inp) setTimeout(function () { inp.focus(); }, 100); }
  }

  function handleSearch(q) {
    var c = $('.search-suggestions'); if (!c) return;
    if (!q.trim()) { c.innerHTML = AppData.searchSuggestions.map(function (s) { return '<div class="search-suggestion" onclick="App.setSearchValue(\'' + s + '\')"><span class="search-suggestion__icon">' + Icons.search + '</span><span class="search-suggestion__text">' + s + '</span></div>'; }).join(''); return; }
    var results = AppData.products.filter(function (p) { return p.name.includes(q) || p.brandName.includes(q) || p.category.includes(q); });
    if (results.length === 0) { c.innerHTML = '<div class="search-suggestion"><span class="search-suggestion__text" style="color:var(--text-muted)">نتیجه‌ای یافت نشد</span></div>'; return; }
    c.innerHTML = results.map(function (p) { return '<div class="search-suggestion" onclick="window.location.href=\'product.html?slug=' + p.slug + '\'"><span class="search-suggestion__icon">' + Icons.search + '</span><span class="search-suggestion__text">' + p.name + '</span><span class="search-suggestion__category">' + p.category + '</span></div>'; }).join('');
  }

  function setSearchValue(v) { var inp = $('.search-modal input[type="text"]'); if (inp) { inp.value = v; handleSearch(v); } }

  /* ── Mobile Menu ──────────────────────────────────────────── */
  function toggleMobileMenu() {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    var menu = $('.mobile-menu');
    var overlay = $('.drawer-overlay');
    if (menu) menu.classList.toggle('is-active', state.mobileMenuOpen);
    if (overlay) overlay.classList.toggle('is-active', state.mobileMenuOpen);
    document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
  }

  /* ── Cart Drawer ──────────────────────────────────────────── */
  function toggleCartDrawer() {
    state.cartDrawerOpen = !state.cartDrawerOpen;
    var drawer = $('.drawer');
    var overlay = $('.drawer-overlay');
    if (drawer) drawer.classList.toggle('is-active', state.cartDrawerOpen);
    if (overlay) overlay.classList.toggle('is-active', state.cartDrawerOpen);
    document.body.style.overflow = state.cartDrawerOpen ? 'hidden' : '';
    renderCartDrawer();
  }

  /* ── Render Header ────────────────────────────────────────── */
  function renderHeader(el) {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    function isActive(page) { return currentPage === page ? 'is-active' : ''; }

    var user = getCurrentUser();
    var authHtml = user
      ? '<a href="account.html" class="header-action" data-tooltip="حساب کاربری">' + Icons.user.replace('width="22" height="22"', '') + '<span class="header-action__badge" style="display:none;font-size:8px;min-width:14px;height:14px;right:-4px;top:-4px">●</span></a>'
      : '<a href="login.html" class="header-action" data-tooltip="حساب کاربری">' + Icons.user.replace('width="22" height="22"', '') + '</a>';

    el.innerHTML = '\
    <div class="top-bar"><div class="container"><div class="top-bar__contact"><span class="top-bar__contact-item">' + Icons.phone.replace('width="14" height="14"', '') + ' ۰۲۱-XXXX-XXXX</span><span class="top-bar__contact-item">' + Icons.mail.replace('width="14" height="14"', '') + ' info@abzarshokri.com</span></div><div class="top-bar__links"><a href="shipping.html" class="top-bar__link">' + Icons.truck.replace('width="14" height="14"', '') + ' ارسال رایگان</a><a href="returns.html" class="top-bar__link">' + Icons.refreshCw.replace('width="14" height="14"', '') + ' ۷ روز ضمانت بازگشت</a></div></div></div>\
    <header class="site-header"><div class="header-main"><div class="container">\
    <a href="index.html" class="header-logo"><span class="header-logo__icon">' + Icons.flash.replace('width="24" height="24"', '') + '</span><span class="header-logo__text"><span class="header-logo__title">ابزار شکری</span><span class="header-logo__subtitle">فروشگاه تخصصی ابزارآلات</span></span></a>\
    <div class="header-search"><div class="search-input-wrapper"><input type="text" class="search-input" placeholder="جستجوی محصولات، برندها و دسته‌بندی‌ها..." readonly><span class="search-icon">' + Icons.search.replace('width="20" height="20"', '') + '</span></div></div>\
    <div class="header-actions">\
    ' + authHtml + '\
    <a href="account/wishlist.html" class="header-action" data-tooltip="علاقه‌مندی‌ها">' + Icons.heart.replace('width="22" height="22"', '') + '</a>\
    <button class="header-action header-action--cart" data-action="cart" data-tooltip="سبد خرید">' + Icons.cart.replace('width="22" height="22"', '') + '<span class="header-action__badge" style="display:none">0</span></button>\
    </div></div></div></header>\
    <nav class="site-nav"><div class="container">\
    <button class="nav-categories-btn">' + Icons.menu.replace('width="18" height="18"', '') + ' دسته‌بندی محصولات</button>\
    <div class="nav-right">\
    <a href="index.html" class="nav-link ' + isActive('index.html') + '">صفحه اصلی</a>\
    <a href="shop.html" class="nav-link ' + isActive('shop.html') + '">فروشگاه</a>\
    <a href="brands.html" class="nav-link ' + isActive('brands.html') + '">برندها</a>\
    <a href="articles.html" class="nav-link ' + isActive('articles.html') + '">مقالات</a>\
    <a href="contact.html" class="nav-link ' + isActive('contact.html') + '">تماس با ما</a>\
    <a href="about.html" class="nav-link ' + isActive('about.html') + '">درباره ما</a>\
    </div></div></nav>';
  }

  /* ── Render Mobile Header ─────────────────────────────────── */
  function renderMobileHeader(el) {
    var user = getCurrentUser();
    var authHtml = user
      ? '<a href="account.html" class="header-action" style="width:36px;height:36px">' + Icons.user + '</a>'
      : '<a href="login.html" class="header-action" style="width:36px;height:36px">' + Icons.user + '</a>';

    el.innerHTML = '\
    <div class="container">\
    <button class="mobile-header__menu-btn" aria-label="منو">' + Icons.menu + '</button>\
    <button class="mobile-header__search-btn">' + Icons.search + ' جستجوی محصولات...</button>\
    ' + authHtml + '\
    <button class="header-action header-action--cart" data-action="cart" style="width:36px;height:36px">' + Icons.cart + '<span class="header-action__badge" style="display:none;top:2px;left:2px;min-width:16px;height:16px;font-size:9px">0</span></button>\
    </div>';
  }

  /* ── Render Footer ────────────────────────────────────────── */
  function renderFooter(el) {
    el.innerHTML = '\
    <footer class="site-footer"><div class="container">\
    <div class="footer-main">\
    <div class="footer-brand"><div class="footer-brand__logo"><span class="footer-brand__icon">' + Icons.flash.replace('width="24" height="24"', '') + '</span><span class="footer-brand__name">ابزار شکری</span></div><p class="footer-brand__desc">فروشگاه تخصصی ابزارآلات صنعتی و ساختمانی با بیش از ۱۰ سال تجربه.</p><div class="footer-brand__socials"><a href="#" class="footer-social" aria-label="تلگرام">' + Icons.telegram + '</a><a href="#" class="footer-social" aria-label="اینستاگرام">' + Icons.instagram + '</a><a href="#" class="footer-social" aria-label="توییتر">' + Icons.twitter + '</a><a href="#" class="footer-social" aria-label="یوتیوب">' + Icons.youtube + '</a></div></div>\
    <div class="footer-column"><h4 class="footer-column__title">دسترسی سریع</h4><div class="footer-links"><a href="index.html" class="footer-link">' + Icons.chevronLeft + ' صفحه اصلی</a><a href="shop.html" class="footer-link">' + Icons.chevronLeft + ' فروشگاه</a><a href="brands.html" class="footer-link">' + Icons.chevronLeft + ' برندها</a><a href="articles.html" class="footer-link">' + Icons.chevronLeft + ' مقالات</a></div></div>\
    <div class="footer-column"><h4 class="footer-column__title">خدمات مشتریان</h4><div class="footer-links"><a href="faq.html" class="footer-link">' + Icons.chevronLeft + ' سوالات متداول</a><a href="returns.html" class="footer-link">' + Icons.chevronLeft + ' شرایط بازگشت</a><a href="shipping.html" class="footer-link">' + Icons.chevronLeft + ' راهنمای ارسال</a><a href="contact.html" class="footer-link">' + Icons.chevronLeft + ' تماس با ما</a></div></div>\
    <div class="footer-column"><h4 class="footer-column__title">ارتباط با ما</h4><div class="footer-links"><span class="footer-link">' + Icons.mapPin + ' تهران، خیابان ولیعصر، پلاک XXX</span><span class="footer-link">' + Icons.phone + ' ۰۲۱-XXXX-XXXX</span><span class="footer-link">' + Icons.mail + ' info@abzarshokri.com</span><span class="footer-link" style="direction:ltr;text-align:right">' + Icons.globe + ' www.abzarshokri.com</span></div></div>\
    </div>\
    <div class="footer-bottom"><div class="container" style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-4)"><p class="footer-copyright">تمامی حقوق این وب‌سایت متعلق به فروشگاه ابزار شکری می‌باشد.</p><div class="footer-payment"><span class="footer-payment__title">نمادهای الکترونیکی:</span><div class="footer-payment__icons"><span class="footer-payment__icon">اینماد</span><span class="footer-payment__icon">سامان</span></div></div></div></div>\
    </div></footer>';
  }

  /* ── Render Overlays ──────────────────────────────────────── */
  function renderOverlays(el) {
    el.innerHTML = '\
    <div class="mobile-menu">\
    <div class="mobile-menu__header"><span style="font-weight:700;font-size:var(--font-size-lg)">منو</span><button class="drawer__close" aria-label="بستن منو">' + Icons.close + '</button></div>\
    <nav class="mobile-menu__nav">\
    <a href="index.html" class="mobile-menu__link">' + Icons.home + ' صفحه اصلی</a>\
    <a href="shop.html" class="mobile-menu__link">' + Icons.package + ' فروشگاه</a>\
    <a href="brands.html" class="mobile-menu__link">' + Icons.star + ' برندها</a>\
    <a href="articles.html" class="mobile-menu__link">' + Icons.layers + ' مقالات</a>\
    <div class="mobile-menu__divider"></div>\
    <a href="login.html" class="mobile-menu__link">' + Icons.user + ' حساب کاربری</a>\
    <a href="account/wishlist.html" class="mobile-menu__link">' + Icons.heart + ' علاقه‌مندی‌ها</a>\
    <div class="mobile-menu__divider"></div>\
    <a href="contact.html" class="mobile-menu__link">' + Icons.mail + ' تماس با ما</a>\
    <a href="about.html" class="mobile-menu__link">' + Icons.infoCircle + ' درباره ما</a>\
    </nav></div>\
    <div class="drawer-overlay"></div>\
    <div class="drawer" style="direction:rtl"><div class="drawer__header"><h3 class="drawer__title">سبد خرید</h3><button class="drawer__close" aria-label="بستن سبد خرید">' + Icons.close + '</button></div><div class="drawer__body"></div><div class="drawer__footer" style="display:none"></div></div>\
    <div class="modal-overlay search-modal"><div class="modal"><div class="modal__header"><h3 class="modal__title">جستجوی محصولات</h3><button class="modal__close" aria-label="بستن">' + Icons.close + '</button></div><div class="modal__body"><div class="search-input-wrapper"><input type="text" class="search-input" placeholder="نام محصول، برند یا دسته‌بندی را تایپ کنید..."><span class="search-icon">' + Icons.search + '</span></div><div class="search-suggestions"></div></div></div></div>\
    <div class="toast-container"></div>';

    /* Add home icon for mobile menu */
    var homeLink = el.querySelector('.mobile-menu__link');
    if (homeLink) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
      homeLink.innerHTML = svg + ' صفحه اصلی';
    }
  }

  /* ── Bind Events ──────────────────────────────────────────── */
  function bindEvents() {
    var headerSearchInput = $('.header-search input');
    if (headerSearchInput) headerSearchInput.addEventListener('focus', function (e) { e.target.blur(); toggleSearch(); });

    var mobileSearchBtn = $('.mobile-header__search-btn');
    if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', toggleSearch);

    var searchOverlay = $('.search-modal');
    if (searchOverlay) searchOverlay.addEventListener('click', function (e) { if (e.target === searchOverlay) toggleSearch(); });

    var searchInput = $('.search-modal input');
    if (searchInput) searchInput.addEventListener('input', function (e) { handleSearch(e.target.value); });

    var searchClose = $('.search-modal .modal__close');
    if (searchClose) searchClose.addEventListener('click', toggleSearch);

    $$('.header-action--cart, [data-action="cart"]').forEach(function (el) { el.addEventListener('click', toggleCartDrawer); });

    var menuBtn = $('.mobile-header__menu-btn');
    if (menuBtn) menuBtn.addEventListener('click', toggleMobileMenu);

    var mobileMenuClose = $('.mobile-menu .drawer__close');
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', toggleMobileMenu);

    var drawerOverlay = $('.drawer-overlay');
    if (drawerOverlay) drawerOverlay.addEventListener('click', function () { if (state.mobileMenuOpen) toggleMobileMenu(); if (state.cartDrawerOpen) toggleCartDrawer(); });

    var cartClose = $('.drawer .drawer__close');
    if (cartClose) cartClose.addEventListener('click', toggleCartDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (state.searchOpen) toggleSearch(); if (state.mobileMenuOpen) toggleMobileMenu(); if (state.cartDrawerOpen) toggleCartDrawer(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    var headerEl = $('#site-header');
    var footerEl = $('#site-footer');
    var overlaysEl = $('#site-overlays');
    var mobileHeaderEl = $('#mobile-header');

    if (headerEl) renderHeader(headerEl);
    if (mobileHeaderEl) renderMobileHeader(mobileHeaderEl);
    if (footerEl) renderFooter(footerEl);
    if (overlaysEl) renderOverlays(overlaysEl);

    bindEvents();
    updateCartUI();
  }

  /* ── Public API ───────────────────────────────────────────── */
  window.App = {
    /* Auth */
    register: register,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getCurrentUser: getCurrentUser,
    getSession: getSession,
    getUserData: getUserData,
    setUserData: setUserData,
    generateOrderId: generateOrderId,
    /* Cart */
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateCartQty: updateCartQty,
    getCart: function () { return state.cart; },
    getCartTotal: getCartTotal,
    getCartCount: getCartCount,
    /* Wishlist */
    toggleWishlist: toggleWishlist,
    getWishlist: function () { return state.wishlist; },
    /* UI */
    toggleSearch: toggleSearch,
    toggleMobileMenu: toggleMobileMenu,
    toggleCartDrawer: toggleCartDrawer,
    setSearchValue: setSearchValue,
    showToast: showToast
  };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
