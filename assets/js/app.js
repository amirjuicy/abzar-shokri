/* ================================================================
   Abzar Shokri — App Controller
   ================================================================ */

(function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────────── */
  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function getGuestSession() {
    var g = localStorage.getItem('as_guest_session');
    if (!g) { g = 'guest_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8); localStorage.setItem('as_guest_session', g); }
    return g;
  }
  function getSession() { return readJSON('as_session', null); }
  function getCurrentUser() {
    var s = getSession(); if (!s || !s.userId) return null;
    return readJSON('as_users', []).find(function(u) { return u.id === s.userId; }) || null;
  }
  function getCartKey() { var u = getCurrentUser(); return u ? 'as_user_' + u.id + '_cart' : 'as_guest_cart_' + getGuestSession(); }
  function getWishlistKey() { var u = getCurrentUser(); return u ? 'as_user_' + u.id + '_wishlist' : 'as_guest_wishlist_' + getGuestSession(); }

  /* ── State ────────────────────────────────────────────────── */
  const state = {
    cart: readJSON(getCartKey(), []),
    wishlist: readJSON(getWishlistKey(), []),
    searchOpen: false,
    mobileMenuOpen: false,
    cartDrawerOpen: false
  };
  function saveCart() { writeJSON(getCartKey(), state.cart); }
  function saveWishlist() { writeJSON(getWishlistKey(), state.wishlist); }

  /* ── DOM Cache ────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Toast System ─────────────────────────────────────────── */
  function showToast(message, type = 'success') {
    const container = $('.toast-container');
    if (!container) return;

    const iconMap = {
      success: Icons.checkCircle,
      danger: Icons.xCircle,
      warning: Icons.alertCircle,
      info: Icons.infoCircle
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${iconMap[type] || iconMap.info}</span>
      <span class="toast__content">${message}</span>
      <button class="toast__close" aria-label="بستن">${Icons.close}</button>
    `;

    container.appendChild(toast);

    const closeBtn = $('.toast__close', toast);
    closeBtn.addEventListener('click', () => removeToast(toast));

    setTimeout(() => removeToast(toast), 4000);
  }

  function removeToast(toast) {
    if (!toast || toast.classList.contains('is-leaving')) return;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 300);
  }

  /* ── Cart ─────────────────────────────────────────────────── */
  function addToCart(productId) {
    const product = AppData.products.find(p => p.id === productId);
    if (!product) return;

    const existing = state.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`${product.name} به سبد خرید اضافه شد`, 'success');
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast('محصول از سبد خرید حذف شد', 'info');
  }

  function updateCartQuantity(productId, delta) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart();
    updateCartUI();
  }

  function getCartTotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getCartCount() {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateCartUI() {
    // Update badge
    const badges = $$('.header-action__badge');
    const count = getCartCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    // Update cart drawer
    renderCartDrawer();
  }

  function renderCartDrawer() {
    const body = $('.drawer__body');
    const footer = $('.drawer__footer');
    if (!body) return;

    if (state.cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty__icon">${Icons.shoppingBag}</span>
          <p class="cart-empty__text">سبد خرید شما خالی است</p>
          <button class="btn btn-primary" onclick="App.toggleCartDrawer()">
            مشاهده محصولات
          </button>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    body.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item__image">
          <span style="color:var(--text-muted);font-size:var(--font-size-xs)">${Icons.package}</span>
        </div>
        <div class="cart-item__details">
          <span class="cart-item__title">${item.name}</span>
          <span class="cart-item__price">${Format.priceWithCurrency(item.price)}</span>
          <div class="cart-item__quantity">
            <button class="cart-item__qty-btn" onclick="App.updateCartQuantity(${item.id}, -1)" aria-label="کاهش">
              ${Icons.minus}
            </button>
            <span class="cart-item__qty-value">${item.quantity}</span>
            <button class="cart-item__qty-btn" onclick="App.updateCartQuantity(${item.id}, 1)" aria-label="افزایش">
              ${Icons.plus}
            </button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="App.removeFromCart(${item.id})" aria-label="حذف">
          ${Icons.trash}
        </button>
      </div>
    `).join('');

    if (footer) {
      footer.style.display = 'block';
      const total = getCartTotal();
      footer.innerHTML = `
        <div class="cart-summary">
          <div class="cart-summary__row">
            <span>جمع سبد خرید</span>
            <span>${Format.priceWithCurrency(total)}</span>
          </div>
          <div class="cart-summary__row cart-summary__row--total">
            <span>مبلغ قابل پرداخت</span>
            <span>${Format.priceWithCurrency(total)}</span>
          </div>
          <button class="btn btn-primary btn-block btn-lg">
            تکمیل خرید
          </button>
          <button class="btn btn-secondary btn-block" onclick="App.toggleCartDrawer()">
            مشاهده سبد خرید
          </button>
        </div>
      `;
    }
  }

  /* ── Wishlist ─────────────────────────────────────────────── */
  function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);
    if (index === -1) {
      state.wishlist.push(productId);
      showToast('به لیست علاقه‌مندی‌ها اضافه شد', 'success');
    } else {
      state.wishlist.splice(index, 1);
      showToast('از لیست علاقه‌مندی‌ها حذف شد', 'info');
    }
    saveWishlist();
    updateWishlistUI();
  }

  function updateWishlistUI() {
    $$('.product-card__action-btn[data-wishlist]').forEach(btn => {
      const id = parseInt(btn.dataset.wishlist);
      const isActive = state.wishlist.includes(id);
      btn.classList.toggle('is-active', isActive);
      btn.innerHTML = isActive ? Icons.heartFill : Icons.heart;
    });
  }

  /* ── Search Modal ─────────────────────────────────────────── */
  function toggleSearch() {
    const overlay = $('.search-modal');
    if (!overlay) return;

    state.searchOpen = !state.searchOpen;
    overlay.classList.toggle('is-active', state.searchOpen);

    if (state.searchOpen) {
      const input = $('input[type="text"]', overlay);
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  function handleSearch(query) {
    const container = $('.search-suggestions');
    if (!container) return;

    if (!query.trim()) {
      container.innerHTML = AppData.searchSuggestions.map(s => `
        <div class="search-suggestion" onclick="App.setSearchValue('${s}')">
          <span class="search-suggestion__icon">${Icons.search}</span>
          <span class="search-suggestion__text">${s}</span>
        </div>
      `).join('');
      return;
    }

    const results = AppData.products.filter(p =>
      p.name.includes(query) || p.brandName.includes(query) || p.category.includes(query)
    );

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-suggestion">
          <span class="search-suggestion__text" style="color:var(--text-muted)">نتیجه‌ای یافت نشد</span>
        </div>
      `;
      return;
    }

    container.innerHTML = results.map(p => `
      <div class="search-suggestion" onclick="App.setSearchValue('${p.name}')">
        <span class="search-suggestion__icon">${Icons.search}</span>
        <span class="search-suggestion__text">${p.name}</span>
        <span class="search-suggestion__category">${p.category}</span>
      </div>
    `).join('');
  }

  function setSearchValue(value) {
    const input = $('.search-modal input[type="text"]');
    if (input) {
      input.value = value;
      handleSearch(value);
    }
  }

  /* ── Mobile Menu ──────────────────────────────────────────── */
  function toggleMobileMenu() {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    const menu = $('.mobile-menu');
    const overlay = $('.drawer-overlay');

    if (menu) menu.classList.toggle('is-active', state.mobileMenuOpen);
    if (overlay) overlay.classList.toggle('is-active', state.mobileMenuOpen);

    document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
  }

  /* ── Cart Drawer ──────────────────────────────────────────── */
  function toggleCartDrawer() {
    state.cartDrawerOpen = !state.cartDrawerOpen;
    const drawer = $('.drawer');
    const overlay = $('.drawer-overlay');

    if (drawer) drawer.classList.toggle('is-active', state.cartDrawerOpen);
    if (overlay) overlay.classList.toggle('is-active', state.cartDrawerOpen);

    document.body.style.overflow = state.cartDrawerOpen ? 'hidden' : '';
    renderCartDrawer();
  }

  /* ── Render Functions ─────────────────────────────────────── */
  function renderCategories() {
    const grid = $('#categories-grid');
    if (!grid) return;

    grid.innerHTML = AppData.categories.slice(0, 6).map(cat => `
      <div class="category-card">
        <div class="category-card__icon">
          ${getCategoryIcon(cat.icon)}
        </div>
        <span class="category-card__name">${cat.name}</span>
        <span class="category-card__count">${cat.count} محصول</span>
      </div>
    `).join('');
  }

  function renderProductCard(product) {
    const ratingInfo = Format.rating(product.rating);
    const stars = Array(ratingInfo.full).fill(Icons.star).join('') +
                  Array(ratingInfo.empty).fill(Icons.starEmpty).join('');

    const badges = [];
    if (product.discount > 0) badges.push(`<span class="badge badge-discount">٪${product.discount}</span>`);
    if (product.isNew) badges.push(`<span class="badge badge-new">جدید</span>`);

    return `
      <div class="product-card">
        <div class="product-card__image">
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
            <span style="width:48px;height:48px">${Icons.package}</span>
          </div>
          ${badges.length ? `<div class="product-card__badges">${badges.join('')}</div>` : ''}
          <div class="product-card__actions">
            <button class="product-card__action-btn" data-wishlist="${product.id}"
                    onclick="App.toggleWishlist(${product.id})" aria-label="افزودن به علاقه‌مندی‌ها">
              ${state.wishlist.includes(product.id) ? Icons.heartFill : Icons.heart}
            </button>
            <button class="product-card__action-btn" data-tooltip="مقایسه" aria-label="مقایسه">
              ${Icons.copy}
            </button>
          </div>
        </div>
        <div class="product-card__body">
          <span class="product-card__brand">${product.brandName}</span>
          <h3 class="product-card__title">${product.name}</h3>
          <div class="product-card__rating">
            <span class="product-card__stars">${stars}</span>
            <span>(${product.reviewCount})</span>
          </div>
          <div class="product-card__price">
            <span class="product-card__price-current">
              ${Format.price(product.price)}
              <span class="product-card__price-currency">تومان</span>
            </span>
            ${product.oldPrice ? `<span class="product-card__price-old">${Format.price(product.oldPrice)}</span>` : ''}
          </div>
          <button class="btn btn-primary btn-block btn-sm product-card__add-to-cart"
                  onclick="App.addToCart(${product.id})">
            افزودن به سبد خرید
          </button>
        </div>
      </div>
    `;
  }

  function renderBestSellers() {
    const grid = $('#bestsellers-grid');
    if (!grid) return;

    const products = AppData.products.filter(p => p.isBestSeller).slice(0, 5);
    grid.innerHTML = products.map(renderProductCard).join('');
  }

  function renderNewProducts() {
    const grid = $('#new-products-grid');
    if (!grid) return;

    const products = AppData.products.filter(p => p.isNew).slice(0, 5);
    // If not enough new products, pad with others
    const remaining = AppData.products.filter(p => !p.isNew).slice(0, 5 - products.length);
    grid.innerHTML = [...products, ...remaining].slice(0, 5).map(renderProductCard).join('');
  }

  function renderSpecialOffers() {
    const grid = $('#special-offers-grid');
    if (!grid) return;

    const products = AppData.products.filter(p => p.discount > 0).slice(0, 4);
    grid.innerHTML = products.map(renderProductCard).join('');
  }

  function renderBrands() {
    const grid = $('#brands-grid');
    if (!grid) return;

    grid.innerHTML = AppData.brands.slice(0, 6).map(brand => `
      <div class="brand-card">
        <span class="brand-card__name">${brand.displayName}</span>
      </div>
    `).join('');
  }

  function renderArticles() {
    const grid = $('#articles-grid');
    if (!grid) return;

    grid.innerHTML = AppData.articles.slice(0, 3).map(article => `
      <div class="article-card">
        <div class="article-card__image">
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
            <span style="width:48px;height:48px">${Icons.image}</span>
          </div>
          <span class="article-card__category">${article.category}</span>
        </div>
        <div class="article-card__body">
          <h3 class="article-card__title">${article.title}</h3>
          <p class="article-card__excerpt">${article.excerpt}</p>
          <div class="article-card__meta">
            <span class="article-card__meta-item">${Icons.calendar} ${article.date}</span>
            <span class="article-card__meta-item">${Icons.clock} ${article.readTime}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ── Countdown Timer ──────────────────────────────────────── */
  function startCountdown() {
    // Set to end of day
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    function update() {
      const diff = end - new Date();
      if (diff <= 0) return;

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const hEl = $('#countdown-hours');
      const mEl = $('#countdown-minutes');
      const sEl = $('#countdown-seconds');

      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ── Event Bindings ───────────────────────────────────────── */
  function bindEvents() {
    // Search buttons
    $$('.header-search, [data-action="search"]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          // Only open search modal on desktop header search click
        }
      });
    });

    // Header search input click (open modal)
    const headerSearch = $('.header-search input');
    if (headerSearch) {
      headerSearch.addEventListener('focus', (e) => {
        e.target.blur();
        toggleSearch();
      });
    }

    // Mobile search button
    const mobileSearchBtn = $('.mobile-header__search-btn');
    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener('click', toggleSearch);
    }

    // Search modal close
    const searchOverlay = $('.search-modal');
    if (searchOverlay) {
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) toggleSearch();
      });
    }

    // Search input
    const searchInput = $('.search-modal input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Search modal close button
    const searchClose = $('.search-modal .modal__close');
    if (searchClose) {
      searchClose.addEventListener('click', toggleSearch);
    }

    // Cart buttons
    $$('.header-action--cart, [data-action="cart"]').forEach(el => {
      el.addEventListener('click', toggleCartDrawer);
    });

    // Mobile menu
    const menuBtn = $('.mobile-header__menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Mobile menu close
    const mobileMenuClose = $('.mobile-menu .drawer__close');
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', toggleMobileMenu);
    }

    // Drawer overlay close
    const drawerOverlay = $('.drawer-overlay');
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', () => {
        if (state.mobileMenuOpen) toggleMobileMenu();
        if (state.cartDrawerOpen) toggleCartDrawer();
      });
    }

    // Cart drawer close
    const cartClose = $('.drawer .drawer__close');
    if (cartClose) {
      cartClose.addEventListener('click', toggleCartDrawer);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.searchOpen) toggleSearch();
        if (state.mobileMenuOpen) toggleMobileMenu();
        if (state.cartDrawerOpen) toggleCartDrawer();
      }

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    renderCategories();
    renderBestSellers();
    renderNewProducts();
    renderSpecialOffers();
    renderBrands();
    renderArticles();
    startCountdown();
    bindEvents();
    updateCartUI();
  }

  /* ── Public API ───────────────────────────────────────────── */
  window.App = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    toggleSearch,
    toggleMobileMenu,
    toggleCartDrawer,
    setSearchValue,
    showToast
  };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
