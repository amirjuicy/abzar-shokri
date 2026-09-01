/* ================================================================
   Abzar Shokri — Homepage Controller
   Homepage-specific rendering only. All state, cart, wishlist,
   auth, toast, search, mobile menu, cart drawer, and header/footer
   rendering are handled by common.js (window.App).

   This file must be loaded AFTER common.js.
   ================================================================ */

(function () {
  'use strict';

  /* ── Render Functions ─────────────────────────────────────── */
  function renderCategories() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;
    grid.innerHTML = AppData.categories.slice(0, 6).map(function(cat) {
      var realCount = AppData.products.filter(function(p) { return p.categorySlug === cat.slug; }).length;
      return '<a href="shop.html?category=' + cat.slug + '" class="category-card" style="color:inherit;text-decoration:none"><div class="category-card__icon">' + getCategoryIcon(cat.icon) + '</div><span class="category-card__name">' + cat.name + '</span><span class="category-card__count">' + realCount + ' محصول</span></a>';
    }).join('');
  }

  function renderProductCard(product) {
    var r = Format.rating(product.rating);
    var stars = '';
    for (var i = 0; i < r.full; i++) stars += Icons.star;
    for (var i = 0; i < r.empty; i++) stars += Icons.starEmpty;
    var badges = [];
    if (product.discount > 0) badges.push('<span class="badge badge-discount">٪' + product.discount + '</span>');
    if (product.isNew) badges.push('<span class="badge badge-new">جدید</span>');

    var fallbackImg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">' + product.brandName + '</text></svg>');
    return '<div class="product-card">' +
      '<div class="product-card__image">' +
        '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + fallbackImg + '\'">' +
        (badges.length ? '<div class="product-card__badges">' + badges.join('') + '</div>' : '') +
        '<div class="product-card__actions">' +
          '<button class="product-card__action-btn" data-wishlist="' + product.id + '" onclick="App.toggleWishlist(' + product.id + ')" aria-label="افزودن به علاقه‌مندی‌ها">' +
            (App.getWishlist().indexOf(product.id) !== -1 ? Icons.heartFill : Icons.heart) +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="product-card__body">' +
        '<span class="product-card__brand">' + product.brandName + '</span>' +
        '<a href="product.html?slug=' + product.slug + '" class="product-card__title" style="color:inherit;text-decoration:none">' + product.name + '</a>' +
        '<div class="product-card__rating"><span class="product-card__stars">' + stars + '</span><span>(' + getReviewCount(product.id) + ')</span></div>' +
        '<div class="product-card__price">' +
          '<span class="product-card__price-current">' + Format.price(product.price) + ' <span class="product-card__price-currency">تومان</span></span>' +
          (product.oldPrice ? '<span class="product-card__price-old">' + Format.price(product.oldPrice) + '</span>' : '') +
        '</div>' +
        '<button class="btn btn-primary btn-block btn-sm product-card__add-to-cart" onclick="App.addToCart(' + product.id + ')">افزودن به سبد خرید</button>' +
      '</div>' +
    '</div>';
  }

  function renderBestSellers() {
    var grid = document.getElementById('bestsellers-grid');
    if (!grid) return;
    var products = AppData.products.filter(function(p) { return p.isBestSeller; }).slice(0, 5);
    grid.innerHTML = products.map(renderProductCard).join('');
  }

  function renderNewProducts() {
    var grid = document.getElementById('new-products-grid');
    if (!grid) return;
    var products = AppData.products.filter(function(p) { return p.isNew; }).slice(0, 5);
    var remaining = AppData.products.filter(function(p) { return !p.isNew; }).slice(0, 5 - products.length);
    grid.innerHTML = products.concat(remaining).slice(0, 5).map(renderProductCard).join('');
  }

  function renderSpecialOffers() {
    var grid = document.getElementById('special-offers-grid');
    if (!grid) return;
    var products = AppData.products.filter(function(p) { return p.discount > 0; }).slice(0, 4);
    grid.innerHTML = products.map(renderProductCard).join('');
  }

  function renderBrands() {
    var grid = document.getElementById('brands-grid');
    if (!grid) return;
    grid.innerHTML = AppData.brands.slice(0, 6).map(function(brand) {
      var realCount = AppData.products.filter(function(p) { return p.brand === brand.name; }).length;
      return '<a href="brand-detail.html?brand=' + brand.name + '" class="brand-card" style="color:inherit;text-decoration:none"><span class="brand-card__name">' + brand.displayName + '</span><span class="brand-card__count" style="font-size:var(--font-size-xs);color:var(--text-muted)">' + realCount + ' محصول</span></a>';
    }).join('');
  }

  function renderArticles() {
    var grid = document.getElementById('articles-grid');
    if (!grid) return;
    grid.innerHTML = AppData.articles.slice(0, 3).map(function(article) {
      return '<div class="article-card">' +
        '<div class="article-card__image">' +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><span style="width:48px;height:48px">' + Icons.image + '</span></div>' +
          '<span class="article-card__category">' + article.category + '</span>' +
        '</div>' +
        '<div class="article-card__body">' +
          '<h3 class="article-card__title">' + article.title + '</h3>' +
          '<p class="article-card__excerpt">' + article.excerpt + '</p>' +
          '<div class="article-card__meta">' +
            '<span class="article-card__meta-item">' + Icons.calendar + ' ' + article.date + '</span>' +
            '<span class="article-card__meta-item">' + Icons.clock + ' ' + article.readTime + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── Countdown Timer ──────────────────────────────────────── */
  function startCountdown() {
    var now = new Date();
    var end = new Date(now);
    end.setHours(23, 59, 59, 999);

    function update() {
      var diff = end - new Date();
      if (diff <= 0) return;
      var hours = Math.floor(diff / 3600000);
      var minutes = Math.floor((diff % 3600000) / 60000);
      var seconds = Math.floor((diff % 60000) / 1000);
      var hEl = document.getElementById('countdown-hours');
      var mEl = document.getElementById('countdown-minutes');
      var sEl = document.getElementById('countdown-seconds');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function renderCategoriesDropdown() {
    var dd = document.getElementById('categories-dropdown');
    if (!dd) return;
    dd.innerHTML = AppData.categories.map(function(cat) {
      var realCount = AppData.products.filter(function(p) { return p.categorySlug === cat.slug; }).length;
      return '<a href="shop.html?category=' + cat.slug + '" class="categories-dropdown__link">' + getCategoryIcon(cat.icon) + '<span>' + cat.name + '</span><span class="categories-dropdown__count">' + realCount + '</span></a>';
    }).join('');
  }

  function init() {
    renderCategories();
    renderCategoriesDropdown();
    renderBestSellers();
    renderNewProducts();
    renderSpecialOffers();
    renderBrands();
    renderArticles();
    startCountdown();
  }

  /* ── Boot ─────────────────────────────────────────────────── */
  /* No window.App definition — all shared APIs come from common.js */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
