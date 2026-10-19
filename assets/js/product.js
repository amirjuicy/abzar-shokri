/* ================================================================
   Abzar Shokri â€” Product Detail Page (Digikala-style)
   Uses product.image and product.images from data.js
   ================================================================ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [...(c || document).querySelectorAll(s)]; };
  var product = null;
  var activeGalleryIndex = 0;

  /* â”€â”€ Review persistence (localStorage) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var SEED_REVIEW_COUNT = 8; /* number of hardcoded reviews in data.js */

  function getReviewStorageKey() {
    var user = App.isLoggedIn() ? App.getCurrentUser() : null;
    if (user) return 'as_user_' + user.id + '_reviews';
    return 'as_guest_reviews_' + localStorage.getItem('as_guest_session');
  }

  function loadPersistedReviews() {
    try {
      var stored = JSON.parse(localStorage.getItem(getReviewStorageKey()));
      if (stored && stored.length) {
        /* Merge: keep seed data + append user reviews (avoid duplicates by id) */
        var seedIds = AppData.reviews.slice(0, SEED_REVIEW_COUNT).map(function(r) { return r.id; });
        stored.forEach(function(r) {
          if (seedIds.indexOf(r.id) === -1) {
            AppData.reviews.push(r);
          }
        });
      }
    } catch (e) {}
  }

  function saveUserReview(review) {
    AppData.reviews.push(review);
    try {
      var key = getReviewStorageKey();
      var stored = JSON.parse(localStorage.getItem(key)) || [];
      stored.push(review);
      localStorage.setItem(key, JSON.stringify(stored));
    } catch (e) {}
  }

  /* â”€â”€ Image fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function fallbackSrc(brandName) {
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">' +
      '<rect width="400" height="400" fill="#f3f4f6"/>' +
      '<text x="200" y="210" text-anchor="middle" fill="#9ca3af" font-size="24" font-family="sans-serif">' +
      (brandName || 'Ø§Ø¨Ø²Ø§Ø± Ø´Ú©Ø±ÛŒ') + '</text></svg>'
    );
  }

  function imgTag(src, alt, extra) {
    return '<img src="' + src + '" alt="' + (alt || '') + '" loading="lazy" class="product-gallery__img"' + (extra || '') + ' onerror="this.onerror=null;this.src=\'' + fallbackSrc(product ? product.brandName : '') + '\'">';
  }

  function thumbImg(src, alt) {
    return '<img src="' + src + '" alt="' + (alt || '') + '" loading="lazy" class="product-gallery__thumb-img" onerror="this.onerror=null;this.src=\'' + fallbackSrc(product ? product.brandName : '') + '\'">';
  }

  /* â”€â”€ Recently viewed (localStorage, persistent) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var RECENT_KEY = 'as_recently_viewed';
  var RECENT_MAX = 8;

  function saveRecentlyViewed(productId) {
    if (!productId) return;
    try {
      var list = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
      if (!Array.isArray(list)) list = [];
      /* Avoid duplicates: remove existing occurrence */
      list = list.filter(function (id) { return id !== productId; });
      /* Most recently viewed first */
      list.unshift(productId);
      /* Limit to a reasonable number */
      list = list.slice(0, RECENT_MAX);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  /* â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function init() {
    var params = new URLSearchParams(window.location.search);
    // Clean URL (/product/:ref) carries slug-or-id in the pathname.
    var pathRef = (function(){ try{ var s=(window.location.pathname||'').split('/').filter(function(x){ return !!x; }); if(s.length===2 && s[0]==='product' && s[1]) return decodeURIComponent(s[1]); }catch(e){} return ''; })();
    var slug = params.get('slug') || pathRef;
    var id = params.get('id') || (/^\d+$/.test(pathRef) ? pathRef : null);
    if (slug) product = AppData.products.find(function (p) { return p.slug === slug; });
    if (!product && id) product = AppData.products.find(function (p) { return p.id === parseInt(id); });
    if (!product) product = AppData.products[0];
    document.title = product.name + ' | Ø§Ø¨Ø²Ø§Ø± Ø´Ú©Ø±ÛŒ';
    activeGalleryIndex = 0;
    saveRecentlyViewed(product.id);
    loadPersistedReviews();
    render();
    bindTabs();
    bindGallery();
  }

  /* â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function render() {
    var p = product;
    var r = Format.rating(p.rating);
    var stars = '';
    for (var i = 0; i < r.full; i++) stars += Icons.star;
    for (var i = 0; i < r.empty; i++) stars += Icons.starEmpty;

    var el = $('#product-detail-content');
    if (!el) return;
    var actualReviewCount = AppData.reviews.filter(function (rv) { return rv.productId === p.id; }).length;

    var images = p.images && p.images.length ? p.images : [p.image];
    var mainImg = images[activeGalleryIndex] || images[0] || p.image;

    /* Specs keys */
    var specKeys = Object.keys(p.specs);

    el.innerHTML =
    /* â”€â”€ Breadcrumb â”€â”€ */
    '<div class="breadcrumb"><div class="container"><div class="breadcrumb-list">' +
      '<span class="breadcrumb-item"><a href="/">Ø®Ø§Ù†Ù‡</a></span>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<span class="breadcrumb-item"><a href="/shop?category=' + p.categorySlug + '">' + p.category + '</a></span>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<span class="breadcrumb-item breadcrumb-item--active">' + p.name + '</span>' +
    '</div></div></div>' +

    /* â”€â”€ Two-column layout â”€â”€ */
    '<div class="container"><div class="pdp-layout">' +

    /* â•â•â• RIGHT COLUMN: Gallery â•â•â• */
    '<div class="pdp-layout__gallery">' +

      /* Promo badge */
      '<div class="pdp-promo-badge">' +
        '<span class="pdp-promo-badge__text">Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ø´Ú¯ÙØªâ€ŒØ§Ù†Ú¯ÛŒØ²</span>' +
        '<div class="pdp-promo-badge__timer">' +
          '<span id="pdp-countdown">ÛµÛ¸ : Û³Û² : Û°Û¹</span>' +
        '</div>' +
      '</div>' +

      /* Action icons + main image wrapper */
      '<div class="pdp-gallery-wrapper">' +

        /* Action icons (vertical sidebar) */
        '<div class="pdp-action-icons">' +
          '<button class="pdp-action-icon pdp-action-icon--wishlist" onclick="ProductDetail.toggleWishlist()" data-wishlist="' + p.id + '" aria-label="Ø¹Ù„Ø§Ù‚Ù‡â€ŒÙ…Ù†Ø¯ÛŒ">' +
            (App.getWishlist().indexOf(p.id) !== -1 ? Icons.heartFill : Icons.heart) +
            '<span class="pdp-action-icon__tooltip">Ø§Ø¶Ø§ÙÙ‡ Ø¨Ù‡ Ø¹Ù„Ø§Ù‚Ù‡â€ŒÙ…Ù†Ø¯ÛŒ</span>' +
          '</button>' +
          '<button class="pdp-action-icon" onclick="ProductDetail.share()" aria-label="Ø§Ø´ØªØ±Ø§Ú©â€ŒÚ¯Ø°Ø§Ø±ÛŒ">' +
            Icons.share +
            '<span class="pdp-action-icon__tooltip">Ø§Ø´ØªØ±Ø§Ú©â€ŒÚ¯Ø°Ø§Ø±ÛŒ</span>' +
          '</button>' +
          '<button class="pdp-action-icon pdp-action-icon--compare" onclick="ProductDetail.toggleCompare()" aria-label="Ù…Ù‚Ø§ÛŒØ³Ù‡">' +
            Icons.scale +
            '<span class="pdp-action-icon__tooltip">Ù…Ù‚Ø§ÛŒØ³Ù‡ Ú©Ø§Ù„Ø§</span>' +
          '</button>' +
          '<button class="pdp-action-icon" onclick="ProductDetail.toggleWishlist()" aria-label="Ø§ÙØ²ÙˆØ¯Ù† Ø¨Ù‡ Ù„ÛŒØ³Øª">' +
            Icons.list +
            '<span class="pdp-action-icon__tooltip">Ø§ÙØ²ÙˆØ¯Ù† Ø¨Ù‡ Ù„ÛŒØ³Øª</span>' +
          '</button>' +
        '</div>' +

        /* Main image */
        '<div class="pdp-main-image" id="gallery-main">' +
          imgTag(mainImg, p.name) +
        '</div>' +

      '</div>' +

      /* Thumbnails */
      '<div class="pdp-thumbnails" id="gallery-thumbs">' +
        images.map(function (img, idx) {
          return '<div class="pdp-thumb' + (idx === activeGalleryIndex ? ' is-active' : '') + '" data-index="' + idx + '">' +
            thumbImg(img, p.name + ' ' + (idx + 1)) +
          '</div>';
        }).join('') +
      '</div>' +

      /* Product ID */
      '<div class="pdp-product-id">DKP-' + (10000000 + p.id) + '</div>' +

    '</div>' +

    /* â•â•â• LEFT COLUMN: Info + Buy Box â•â•â• */
    '<div class="pdp-layout__info">' +

      /* â”€â”€ Product Title â”€â”€ */
      '<div class="pdp-title-section">' +
        '<nav class="pdp-breadcrumb">' +
          '<a href="/brand/' + p.brand + '" class="pdp-breadcrumb__brand">' + p.brandName + '</a>' +
          '<span class="pdp-breadcrumb__sep">/</span>' +
          '<a href="/shop?category=' + p.categorySlug + '" class="pdp-breadcrumb__cat">' + p.category + '</a>' +
        '</nav>' +
        '<h1 class="pdp-title">' + p.name + '</h1>' +
        '<div class="pdp-english-name">' + p.shortDescription.substring(0, 60) + '...</div>' +
      '</div>' +

      /* â”€â”€ Rating + Reviews â”€â”€ */
      '<div class="pdp-rating-row">' +
        '<div class="pdp-rating">' +
          '<span class="pdp-rating__stars">' + stars + '</span>' +
          '<span class="pdp-rating__value">' + p.rating + '</span>' +
          '<span class="pdp-rating__count">(' + Format.toPersianNumber(actualReviewCount) + ' Ø®Ø±ÛŒØ¯Ø§Ø±)</span>' +
        '</div>' +
        '<div class="pdp-rating__badges">' +
          '<a class="pdp-badge-link" href="#tab-reviews" data-tab="reviews">' +
            '<span class="pdp-badge-link__icon">' + Icons.star + '</span>' +
            Format.toPersianNumber(actualReviewCount) + ' Ø¯ÛŒØ¯Ú¯Ø§Ù‡' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
          '</a>' +
          '<a class="pdp-badge-link" href="#tab-qa" data-tab="qa">' +
            Format.toPersianNumber(0) + ' Ù¾Ø±Ø³Ø´' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>' +

      /* â”€â”€ Specs Grid â”€â”€ */
      (specKeys.length > 0 ?
      '<div class="pdp-specs">' +
        '<h3 class="pdp-specs__title">ÙˆÛŒÚ˜Ú¯ÛŒâ€ŒÙ‡Ø§</h3>' +
        '<div class="pdp-specs__grid">' +
          specKeys.slice(0, 6).map(function (k) {
            return '<div class="pdp-spec-item">' +
              '<div class="pdp-spec-item__label">' + k + '</div>' +
              '<div class="pdp-spec-item__value">' + p.specs[k] + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        (specKeys.length > 6 ?
        '<button class="pdp-specs__more" onclick="var _t=document.querySelector(\'[data-tab=specs]\'); if(_t)_t.click()">Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‡Ù…Ù‡ ÙˆÛŒÚ˜Ú¯ÛŒâ€ŒÙ‡Ø§ ' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</button>' : '') +
      '</div>' : '') +

      /* â”€â”€ Delivery Info â”€â”€ */
      '<div class="pdp-delivery-info">' +
        '<div class="pdp-delivery-info__row">' +
          '<div class="pdp-delivery-info__badge">' +
            '<span class="pdp-delivery-info__badge-icon">' + Icons.truck + '</span>' +
            '<span>Ø³Ø±ÛŒØ¹ Ø§Ù…Ø±ÙˆØ²</span>' +
          '</div>' +
          '<div class="pdp-delivery-info__text">' +
            '<span>ØªØ­ÙˆÛŒÙ„ ØªÙˆØ³Ø· ÙØ±ÙˆØ´Ú¯Ø§Ù‡</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* â”€â”€ Insurance â”€â”€ */
      '<div class="pdp-insurance">' +
        '<h3 class="pdp-insurance__title">Ø¨ÛŒÙ…Ù‡</h3>' +
        '<div class="pdp-insurance__card">' +
          '<label class="pdp-insurance__label">' +
            '<input type="checkbox" class="pdp-insurance__checkbox">' +
            '<span class="pdp-insurance__check"></span>' +
            '<div class="pdp-insurance__details">' +
              '<p class="pdp-insurance__name">Ø¨ÛŒÙ…Ù‡ ØªØ¬Ù‡ÛŒØ²Ø§Øª Ø¯ÛŒØ¬ÛŒØªØ§Ù„</p>' +
              '<div class="pdp-insurance__price">' +
                '<span class="pdp-insurance__discount-badge">ÙªÛµÛ°</span>' +
                '<span class="pdp-insurance__old-price">Û²,Û³Û±Û°,Û°Û°Û°</span>' +
                '<span class="pdp-insurance__final-price">Û±,Û±ÛµÛµ,Û°Û°Û° ØªÙˆÙ…Ø§Ù†</span>' +
              '</div>' +
            '</div>' +
          '</label>' +
        '</div>' +
      '</div>' +

      /* â”€â”€ Return Policy Notice â”€â”€ */
      '<div class="pdp-return-notice">' +
        '<div class="pdp-return-notice__icon">' + Icons.infoCircle + '</div>' +
        '<p class="pdp-return-notice__text">Ø§Ù…Ú©Ø§Ù† Ø¨Ø±Ú¯Ø´Øª Ú©Ø§Ù„Ø§ Ø¯Ø± Ú¯Ø±ÙˆÙ‡ Ø§Ø¨Ø²Ø§Ø±Ø¢Ù„Ø§Øª Ø¨Ø§ Ø¯Ù„ÛŒÙ„ "Ø§Ù†ØµØ±Ø§Ù Ø§Ø² Ø®Ø±ÛŒØ¯" ØªÙ†Ù‡Ø§ Ø¯Ø± ØµÙˆØ±ØªÛŒ Ù…ÙˆØ±Ø¯ Ù‚Ø¨ÙˆÙ„ Ø§Ø³Øª Ú©Ù‡ Ù¾Ù„Ù…Ø¨ Ú©Ø§Ù„Ø§ Ø¨Ø§Ø² Ù†Ø´Ø¯Ù‡ Ø¨Ø§Ø´Ø¯.</p>' +
      '</div>' +

      /* â”€â”€ Buy Box (Digikala-style) â”€â”€ */
      '<div class="dk-buybox-wrap">' +
      '<div class="dk-buybox" data-testid="buy-box">' +

        /* Seller Header */
        '<div class="dk-buybox__seller-header">' +
          '<h3 class="dk-buybox__seller-title">ÙØ±ÙˆØ´Ù†Ø¯Ù‡</h3>' +
        '</div>' +

        /* Seller Store */
        '<div class="dk-buybox__store">' +
          '<div class="dk-buybox__store-inner">' +
            '<div class="dk-buybox__store-badge">' + Icons.store + '</div>' +
            '<div class="dk-buybox__store-info">' +
              '<div class="dk-buybox__store-name">Ø§Ø¨Ø²Ø§Ø± Ø´Ú©Ø±ÛŒ</div>' +
              '<div class="dk-buybox__store-stats">' +
                '<span class="dk-buybox__store-stat"><span style="color:var(--color-success)">Û±Û°Û°Ùª</span> Ø±Ø¶Ø§ÛŒØª Ø§Ø² Ú©Ø§Ù„Ø§</span>' +
                '<span class="dk-buybox__store-divider"></span>' +
                '<span class="dk-buybox__store-stat">Ø¹Ù…Ù„Ú©Ø±Ø¯ <span style="color:var(--color-success)">Ø¹Ø§Ù„ÛŒ</span></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Price + Cart */
        '<div class="dk-buybox__price-cart">' +
          '<div class="dk-buybox__price">' +
            '<div class="dk-buybox__price-top">' +
              (p.oldPrice ?
                '<span class="dk-buybox__old-price">' + Format.priceWithCurrency(p.oldPrice) + '</span>' +
                '<span class="dk-buybox__discount-badge">Ùª' + p.discount + '</span>'
              : '') +
            '</div>' +
            '<div class="dk-buybox__final-price" id="product-detail-price">' +
              '<span class="dk-buybox__amount">' + Format.price(p.price) + '</span>' +
              '<svg style="width:14px;height:14px;fill:currentColor"><use xlink:href="#toman"></use></svg>' +
            '</div>' +
          '</div>' +
          (p.inStock ?
          '<div class="dk-buybox__cart" id="product-cart-control">' +
            '<button class="dk-buybox__add-btn" id="product-add-to-cart" onclick="ProductDetail.addDesktopToCart()">' +
              '<span>Ø§ÙØ²ÙˆØ¯Ù† Ø¨Ù‡ Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯</span>' +
            '</button>' +
          '</div>' :
          '<div class="dk-buybox__cart" id="product-cart-control">' +
            '<button class="dk-buybox__add-btn dk-buybox__add-btn--disabled" disabled>Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯</button>' +
          '</div>') +
        '</div>' +

        /* Guarantee */
        '<div class="dk-buybox__guarantee">' +
          '<div class="dk-buybox__guarantee-icon">' + Icons.shieldCheck + '</div>' +
          '<span class="dk-buybox__guarantee-text">Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ø§ØµØ§Ù„Øª Ú©Ø§Ù„Ø§</span>' +
        '</div>' +

        /* Delivery Methods (current design: summary text, no per-method list) */
        '<div class="dk-buybox__delivery">' +
          '<div class="dk-buybox__delivery-header">' +
            '<div class="dk-buybox__delivery-icon">' + Icons.truck + '</div>' +
            '<span class="dk-buybox__delivery-title">Ø±ÙˆØ´â€ŒÙ‡Ø§ Ùˆ Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ÛŒ ØªØ­ÙˆÛŒÙ„</span>' +
            '<div class="dk-buybox__delivery-chevron">' + Icons.chevronLeft + '</div>' +
          '</div>' +
          '<div class="dk-buybox__delivery-info">' +
            '<p>Ù‡Ø²ÛŒÙ†Ù‡ Ø§Ø±Ø³Ø§Ù„ Ø¨Ø± Ø§Ø³Ø§Ø³ Ø¢Ø¯Ø±Ø³ Ùˆ Ù…Ø¨Ù„Øº Ø³ÙØ§Ø±Ø´ Ø¯Ø± Ù…Ø±Ø­Ù„Ù‡ ØªØ³ÙˆÛŒÙ‡â€ŒØ­Ø³Ø§Ø¨ Ù…Ø­Ø§Ø³Ø¨Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>' +
            '<p>Ø¨Ø±Ø§ÛŒ Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ù„Ø§ØªØ± Ø§Ø² Ø­Ø¯ Ù…Ø´Ø®ØµØŒ Ø§Ø±Ø³Ø§Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù† Ø§Ø³Øª.</p>' +
          '</div>' +
        '</div>' +

        /* Better Price */
        '<div class="dk-buybox__better-price">' +
          '<span class="dk-buybox__better-price-text">Ù‚ÛŒÙ…Øª Ø¨Ù‡ØªØ±ÛŒ Ø³Ø±Ø§Øº Ø¯Ø§Ø±ÛŒØ¯ØŸ</span>' +
          '<div class="dk-buybox__better-price-icon">' + Icons.infoCircle + '</div>' +
        '</div>' +

        /* Pricing Process Link */
        '<a class="dk-buybox__pricing-link" href="/pricing">' +
          '<div class="dk-buybox__pricing-info">' +
            '<div class="dk-buybox__pricing-icon">' + Icons.infoCircle + '</div>' +
            '<span class="dk-buybox__pricing-text">ÙØ±Ø¢ÛŒÙ†Ø¯ Ù‚ÛŒÙ…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ùˆ Ù†Ø¸Ø§Ø±Øª Ø¨Ø± Ù‚ÛŒÙ…Øª</span>' +
          '</div>' +
          '<div class="dk-buybox__pricing-chevron">' + Icons.chevronLeft + '</div>' +
        '</a>' +

      '</div>' +
      '</div>' +

      /* â”€â”€ Features â”€â”€ */
      '<div class="pdp-features">' +
        '<div class="pdp-feature">' +
          '<div class="pdp-feature__icon">' + Icons.truck + '</div>' +
          '<span>Ø§Ø±Ø³Ø§Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù† Ø¨Ø±Ø§ÛŒ Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ù„Ø§ÛŒ ÛµÛ°Û° Ù‡Ø²Ø§Ø± ØªÙˆÙ…Ø§Ù†</span>' +
        '</div>' +
        '<div class="pdp-feature">' +
          '<div class="pdp-feature__icon">' + Icons.shieldCheck + '</div>' +
          '<span>Ø¶Ù…Ø§Ù†Øª Ø§ØµØ§Ù„Øª Ú©Ø§Ù„Ø§</span>' +
        '</div>' +
        '<div class="pdp-feature">' +
          '<div class="pdp-feature__icon">' + Icons.refreshCw + '</div>' +
          '<span>Û· Ø±ÙˆØ² Ø¶Ù…Ø§Ù†Øª Ø¨Ø§Ø²Ú¯Ø´Øª</span>' +
        '</div>' +
      '</div>' +

    '</div>' +

    '</div></div>' +

    /* â”€â”€ Tabs â”€â”€ */
    '<div class="container"><div class="product-tabs">' +
      '<div class="product-tabs__nav">' +
        '<button class="product-tabs__tab is-active" data-tab="desc">Ù…Ø¹Ø±ÙÛŒ</button>' +
        '<button class="product-tabs__tab" data-tab="expert">Ø¨Ø±Ø±Ø³ÛŒ ØªØ®ØµØµÛŒ</button>' +
        '<button class="product-tabs__tab" data-tab="specs">Ù…Ø´Ø®ØµØ§Øª</button>' +
        '<button class="product-tabs__tab" data-tab="reviews">Ø¯ÛŒØ¯Ú¯Ø§Ù‡â€ŒÙ‡Ø§' + (actualReviewCount > 0 ? ' (' + Format.toPersianNumber(actualReviewCount) + ')' : '') + '</button>' +
        '<button class="product-tabs__tab" data-tab="qa">Ù¾Ø±Ø³Ø´â€ŒÙ‡Ø§</button>' +
      '</div>' +
      '<div class="product-tabs__panel is-active" id="tab-desc"><div class="static-page__content"><p>' + p.description + '</p></div></div>' +
      '<div class="product-tabs__panel" id="tab-expert">' + renderExpert() + '</div>' +
      '<div class="product-tabs__panel" id="tab-specs"><table class="specs-table">' + specKeys.map(function (k) { return '<tr><td>' + k + '</td><td>' + p.specs[k] + '</td>'; }).join('') + '</table></div>' +
      '<div class="product-tabs__panel" id="tab-reviews">' + renderReviews() + '</div>' +
      '<div class="product-tabs__panel" id="tab-qa">' + renderQA() + '</div>' +
    '</div></div>' +

    /* â”€â”€ Related Products â”€â”€ */
    '<div class="related-products"><div class="container"><div class="section-header"><h2 class="section-title">Ù…Ø­ØµÙˆÙ„Ø§Øª Ù…Ø±ØªØ¨Ø·</h2></div><div class="product-listing-grid" id="related-grid"></div></div></div>';

    renderRelated();
    bindReviewForm();
    startPdpCountdown();
    /* Sync desktop buybox with cart (if already in cart) */
    setTimeout(function () { syncDesktopControl(); }, 0);
    /* Mouse drag-to-scroll for horizontal strips (shared helper in common.js).
       Touch behavior untouched; arrow buttons unchanged. */
    try {
      var dragTargets = [$('#gallery-thumbs'), $('.product-tabs__nav')];
      for (var di = 0; di < dragTargets.length; di++) {
        if (dragTargets[di] && window.App && typeof App.enableDragToScroll === 'function') {
          App.enableDragToScroll(dragTargets[di]);
        } else if (dragTargets[di] && typeof enableDragToScroll === 'function') {
          enableDragToScroll(dragTargets[di]);
        }
      }
      if (window.App && typeof App.initDragCarousels === 'function') App.initDragCarousels(document);
    } catch (e) {}

    var qty = 1;
    var selectedPricingMode = 'retail';
    var mobileCartKey = null;
    var desktopCartKey = null;

    function desktopInCartHTML(qtyCount) {
      qtyCount = qtyCount || 1;
      return '<div class="flex items-center w-full justify-center">' +
        '<div class="qty-selector qty-selector--buybox" style="width:240px;max-width:240px;height:54px;"  role="group" aria-label="ØªØ¹Ø¯Ø§Ø¯ Ù…Ø­ØµÙˆÙ„ Ø¯Ø± Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯">' +
          '<button type="button" class="qty-selector__btn qty-selector__btn--minus" onclick="ProductDetail.updateCartQty(-1)" aria-label="Ú©Ø§Ù‡Ø´ ØªØ¹Ø¯Ø§Ø¯">' + Icons.minus + '</button>' +
          '<span class="qty-selector__value" id="product-qty">' + Format.toPersianNumber(qtyCount) + '</span>' +
          '<button type="button" class="qty-selector__btn qty-selector__btn--plus" onclick="ProductDetail.updateCartQty(1)" aria-label="Ø§ÙØ²Ø§ÛŒØ´ ØªØ¹Ø¯Ø§Ø¯">' + Icons.plus + '</button>' +
        '</div>' +
      '</div>';
    }

    /* Find this product's cart line for the current pricing mode (the base
       line first, then any option-variant line). Used when the in-memory key
       is gone — e.g. right after mount on a reloaded page whose cart
       persisted in storage. */
    function resolveMobileKey() {
      try {
        var mode = selectedPricingMode || 'retail';
        var items = App.getCart ? App.getCart() : [];
        var base = p.id + '_' + mode;
        var i;
        for (i = 0; i < items.length; i++) { if (items[i].key === base) return items[i].key; }
        for (i = 0; i < items.length; i++) {
          if (items[i].id === p.id && items[i].pricingMode === mode) return items[i].key;
        }
      } catch (e) {}
      return null;
    }

    function syncMobileBar() {
      var addBtn = document.getElementById('mobile-add-to-cart');
      var qtyWrap = document.getElementById('mobile-qty-wrap');
      var mEl = document.getElementById('mobile-qty');
      if (!addBtn || !qtyWrap) return;
      if (!mobileCartKey) mobileCartKey = resolveMobileKey();
      var lineQty = 0;
      try {
        if (mobileCartKey && App.getCart) {
          var cart = App.getCart();
          for (var i = 0; i < cart.length; i++) {
            if (cart[i].key === mobileCartKey) { lineQty = cart[i].quantity; break; }
          }
          if (!lineQty) mobileCartKey = null;
        }
      } catch (e) {}
      if (lineQty > 0) {
        addBtn.hidden = true;
        qtyWrap.hidden = false;
        if (mEl) mEl.textContent = Format.toPersianNumber(lineQty);
      } else {
        addBtn.hidden = false;
        qtyWrap.hidden = true;
        if (mEl) mEl.textContent = Format.toPersianNumber(1);
      }
    }

    /* Mount the fixed mobile purchase bar (once per page load).
       buyBarHTML() only builds the inner markup, so the outer
       .mobile-purchase-bar wrapper (the fixed, mobile-only shell from
       components.css) is created here and reused on re-entry — never
       duplicated. No delegated listeners are added (all actions use the
       existing inline onclick handlers), so no duplicate handlers either. */
    function mountMobileBar() {
      try {
        var mode = selectedPricingMode || 'retail';
        var bar = document.getElementById('mobile-purchase-bar');
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'mobile-purchase-bar';
          bar.id = 'mobile-purchase-bar';
          bar.setAttribute('role', 'region');
          bar.setAttribute('aria-label', 'افزودن محصول به سبد خرید');
          document.body.appendChild(bar);
        }
        bar.innerHTML = buyBarHTML(p, mode);
        if (document.body) document.body.classList.add('has-mobile-purchase-bar');
      } catch (e) {}
    }

    /* Checked add-on options on the page (if any). The seed catalog ships
       without options UI, so this is a no-op there; it simply wires the
       existing .pdp-option__checkbox markup through to App.addToCart()
       whenever such checkboxes exist. */
    function getSelectedOptions() {
      var opts = [];
      try {
        var boxes = document.querySelectorAll('.pdp-option__checkbox:checked');
        for (var i = 0; i < boxes.length; i++) {
          var box = boxes[i];
          var id = parseInt(box.value, 10);
          if (!isFinite(id) || id <= 0) continue;
          var label = box.closest ? box.closest('.pdp-option') : null;
          var title = '';
          var price = 0;
          if (label) {
            var nameEl = label.querySelector('.pdp-option__name');
            if (nameEl) title = (nameEl.textContent || '').trim();
            var priceVal = label.getAttribute('data-opt-price');
            if (priceVal != null && priceVal !== '') price = Number(priceVal) || 0;
          }
          if (!title) title = 'گزینه ' + id;
          opts.push({ id: id, title: title, price: price });
        }
      } catch (e) {}
      return opts;
    }

    function findCartLine(key) {
      try {
        var items = App.getCart ? App.getCart() : [];
        for (var i = 0; i < items.length; i++) {
          if (items[i].key === key) return items[i];
        }
      } catch (e) {}
      return null;
    }

    function refreshDesktopControl(key) {
      try {
        var control = document.getElementById('product-cart-control');
        if (!control || !key) return;
        var item = findCartLine(key);
        if (item) {
          desktopCartKey = key;
          control.innerHTML = desktopInCartHTML(item.quantity);
        }
      } catch (e) {}
    }

    /* Re-render the desktop buybox control from the current pricing mode's
       cart line (shows the stepper when the line is already in the cart). */
    function syncDesktopControl() {
      try {
        var mode = selectedPricingMode || 'retail';
        refreshDesktopControl(p.id + '_' + mode);
      } catch (e) {}
    }
    window.ProductDetail = {
      changeQty: function (d) {
        qty = Math.max(1, qty + d);
        var el = $('#product-qty');
        if (el) el.textContent = Format.toPersianNumber(qty);
        var mEl = document.getElementById('mobile-qty');
        if (mEl) mEl.textContent = Format.toPersianNumber(qty);
      },
      getQty: function () { return qty; },
      getPricingMode: function () { return selectedPricingMode; },
      /* Mobile purchase bar (Digikala-style): add → swap button to stepper */
      addToCartWithOptions: function (id, mode) {
        var m = mode || selectedPricingMode;
        var pid = id || p.id;
        var key = App.addToCart(pid, m, getSelectedOptions());
        if (key && qty > 1 && typeof App.updateCartQty === 'function') {
          App.updateCartQty(key, qty - 1);
        }
        if (key) {
          mobileCartKey = key;
          desktopCartKey = key;
        }
        qty = 1;
        syncMobileBar();
        if (key) refreshDesktopControl(key);
        return key;
      },
      updateMobileQty: function (d) {
        if (!mobileCartKey || typeof App.updateCartQty !== 'function') return;
        App.updateCartQty(mobileCartKey, d);
        setTimeout(function () { syncMobileBar(); syncDesktopControl(); }, 30);
      },
      /* Desktop stepper (rendered by desktopInCartHTML) shares the same cart
         line as the mobile bar, so both controls stay in sync. */
      updateCartQty: function (d) {
        var mode = selectedPricingMode || 'retail';
        var key = desktopCartKey || mobileCartKey || (p.id + '_' + mode);
        if (typeof App.updateCartQty === 'function') App.updateCartQty(key, d);
        setTimeout(function () { syncMobileBar(); syncDesktopControl(); }, 30);
      },
      syncMobileBar: syncMobileBar,
      addDesktopToCart: function () {
        var mode = selectedPricingMode || 'retail';
        var key = App.addToCart(p.id, mode, getSelectedOptions());
        if (key) {
          desktopCartKey = key;
          mobileCartKey = key;
          refreshDesktopControl(key);
        }
        syncMobileBar();
        return key;
      },
      desktopRemoveFromCart: function () {
        if (desktopCartKey) {
          try { App.removeFromCart(desktopCartKey); } catch (e) {}
        }
        desktopCartKey = null;
        var control = document.getElementById('product-cart-control');
        if (control) {
          control.innerHTML = '<button class="dk-buybox__add-btn" id="product-add-to-cart" onclick="ProductDetail.addDesktopToCart()"><span>Ø§ÙØ²ÙˆØ¯Ù† Ø¨Ù‡ Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯</span></button>';
        }
        return true;
      },
      selectPricing: function (mode) {
        selectedPricingMode = mode;
        var changer = document.getElementById('product-detail-pricing');
        if (changer) {
          changer.querySelectorAll('span').forEach(function (s) {
            s.classList.toggle('active', s.getAttribute('data-mode') === mode);
          });
        }
        var newPrice = App.getProductPrice(p, mode);
        var priceEl = document.getElementById('product-detail-price');
        if (priceEl) {
          priceEl.innerHTML = '<span class="dk-buybox__amount">' + Format.price(newPrice) + '</span>' +
            '<svg style="width:14px;height:14px;fill:currentColor"><use xlink:href="#toman"></use></svg>';
        }
        var mPriceWrap = document.getElementById('mobile-price-row');
        if (mPriceWrap) mPriceWrap.innerHTML = buyBarPriceHTML(p, mode);
        var mAddBtn = document.getElementById('mobile-add-to-cart');
        if (mAddBtn) mAddBtn.setAttribute('onclick', 'ProductDetail.addToCartWithOptions(' + p.id + ', \'' + mode + '\')');
        /* A pricing mode addresses its own cart line: drop the cached keys so
           both controls re-resolve to the new mode's line and re-sync. */
        mobileCartKey = null;
        desktopCartKey = null;
        syncMobileBar();
        syncDesktopControl();
      },

      /* â”€â”€ Wishlist toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      toggleWishlist: function () {
        App.toggleWishlist(p.id);
        var icon = $('.pdp-action-icon--wishlist');
        if (icon) {
          var inList = App.getWishlist().indexOf(p.id) !== -1;
          /* Replace first child SVG with filled/outline heart */
          var svgContainer = icon.querySelector('svg') || icon.querySelector('div');
          if (svgContainer) {
            icon.innerHTML = (inList ? Icons.heartFill : Icons.heart) +
              '<span class="pdp-action-icon__tooltip">' + (inList ? 'Ø­Ø°Ù Ø§Ø² Ø¹Ù„Ø§Ù‚Ù‡â€ŒÙ…Ù†Ø¯ÛŒ' : 'Ø§Ø¶Ø§ÙÙ‡ Ø¨Ù‡ Ø¹Ù„Ø§Ù‚Ù‡â€ŒÙ…Ù†Ø¯ÛŒ') + '</span>';
          }
          icon.classList.toggle('is-active', inList);
        }
      },

      /* â”€â”€ Share product â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      share: function () {
        var url = window.location.href;
        var title = p.name;
        var text = 'Ù…Ø´Ø§Ù‡Ø¯Ù‡ ' + p.name + ' Ø¯Ø± Ø§Ø¨Ø²Ø§Ø± Ø´Ú©Ø±ÛŒ';
        if (navigator.share) {
          navigator.share({ title: title, text: text, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            App.showToast('Ù„ÛŒÙ†Ú© Ù…Ø­ØµÙˆÙ„ Ú©Ù¾ÛŒ Ø´Ø¯!', 'success');
          }).catch(function () {
            ProductDetail._fallbackCopy(url);
          });
        } else {
          ProductDetail._fallbackCopy(url);
        }
      },
      _fallbackCopy: function (text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          App.showToast('Ù„ÛŒÙ†Ú© Ù…Ø­ØµÙˆÙ„ Ú©Ù¾ÛŒ Ø´Ø¯!', 'success');
        } catch (e) {
          App.showToast('Ø§Ù…Ú©Ø§Ù† Ú©Ù¾ÛŒ Ù„ÛŒÙ†Ú© ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.', 'danger');
        }
        document.body.removeChild(ta);
      },

      /* â”€â”€ Compare toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      toggleCompare: function () {
        var key = 'as_compare_list';
        var list = [];
        try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { list = []; }
        var idx = list.indexOf(p.id);
        if (idx === -1) {
          if (list.length >= 4) {
            App.showToast('Ø­Ø¯Ø§Ú©Ø«Ø± Û´ Ù…Ø­ØµÙˆÙ„ Ù‚Ø§Ø¨Ù„ Ù…Ù‚Ø§ÛŒØ³Ù‡ Ù‡Ø³ØªÙ†Ø¯.', 'info');
            return;
          }
          list.push(p.id);
          App.showToast(p.name + ' Ø¨Ù‡ Ù„ÛŒØ³Øª Ù…Ù‚Ø§ÛŒØ³Ù‡ Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯.', 'success');
        } else {
          list.splice(idx, 1);
          App.showToast(p.name + ' Ø§Ø² Ù„ÛŒØ³Øª Ù…Ù‚Ø§ÛŒØ³Ù‡ Ø­Ø°Ù Ø´Ø¯.', 'info');
        }
        localStorage.setItem(key, JSON.stringify(list));
        /* Update compare icon state */
        var icon = $('.pdp-action-icon--compare');
        if (icon) {
          var inList = list.indexOf(p.id) !== -1;
          icon.classList.toggle('is-active', inList);
          var tooltip = icon.querySelector('.pdp-action-icon__tooltip');
          if (tooltip) tooltip.textContent = inList ? 'Ø­Ø°Ù Ø§Ø² Ù…Ù‚Ø§ÛŒØ³Ù‡' : 'Ù…Ù‚Ø§ÛŒØ³Ù‡ Ú©Ø§Ù„Ø§';
        }
      }
    };

    /* Set initial compare icon state */
    (function () {
      var key = 'as_compare_list';
      var list = [];
      try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { list = []; }
      var icon = $('.pdp-action-icon--compare');
      if (icon && list.indexOf(p.id) !== -1) {
        icon.classList.add('is-active');
        var tooltip = icon.querySelector('.pdp-action-icon__tooltip');
        if (tooltip) tooltip.textContent = 'Ø­Ø°Ù Ø§Ø² Ù…Ù‚Ø§ÛŒØ³Ù‡';
      }
    })();

    /* Mount the fixed mobile purchase bar now that the page markup exists,
       then reflect any cart line already stored for this product. */
    mountMobileBar();
    syncMobileBar();
    syncDesktopControl();
  }

  function startPdpCountdown() {
    var now = new Date();
    var end = new Date(now);
    end.setHours(23, 59, 59, 999);
    function update() {
      var diff = end - new Date();
      if (diff <= 0) return;
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      var el = document.getElementById('pdp-countdown');
      if (el) el.textContent = Format.toPersianNumber(h) + ' : ' + Format.toPersianNumber(m) + ' : ' + Format.toPersianNumber(s);
    }
    update();
    setInterval(update, 1000);
  }

  function renderExpert() {
    return '<div class="static-page__content"><p>' + product.description + '</p></div>';
  }

  function renderReviews() {
    var reviews = AppData.reviews.filter(function (r) { return r.productId === product.id; });
    var reviewsHtml = '';
    if (reviews.length === 0) {
      reviewsHtml = '<p style="color:var(--text-muted);padding:var(--space-4) 0;margin:0">Ù‡Ù†ÙˆØ² Ù†Ø¸Ø±ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª. Ø§ÙˆÙ„ÛŒÙ† Ù†ÙØ±ÛŒ Ø¨Ø§Ø´ÛŒØ¯ Ú©Ù‡ Ù†Ø¸Ø± Ù…ÛŒâ€ŒØ¯Ù‡ÛŒØ¯!</p>';
    } else {
      reviewsHtml = reviews.map(function (rv) {
        var s = '';
        for (var i = 0; i < rv.rating; i++) s += Icons.star;
        return '<div class="review-item"><div class="review-item__header"><span class="review-item__author">' + rv.author + '</span><span class="review-item__date">' + rv.date + '</span></div><div class="review-item__stars">' + s + '</div><div class="review-item__title">' + rv.title + '</div><div class="review-item__text">' + rv.text + '</div></div>';
      }).join('');
    }
    var formHtml = renderReviewForm();
    return reviewsHtml + formHtml;
  }

  function renderReviewForm() {
    var isLoggedIn = App.isLoggedIn();
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      starsHtml += '<button type="button" class="review-form__star" data-rating="' + i + '" title="' + i + ' Ø§Ø² Ûµ">' + Icons.starEmpty + '</button>';
    }
    if (isLoggedIn) {
      var user = App.getCurrentUser();
      var userName = user.firstName || user.name || 'Ú©Ø§Ø±Ø¨Ø±';
      return '<div class="review-form" id="review-form"><div class="review-form__heading">Ù†Ø¸Ø± Ø®ÙˆØ¯ Ø±Ø§ Ø¨Ù†ÙˆÛŒØ³ÛŒØ¯</div>' +
        '<div class="review-form__rating"><span class="review-form__rating-label">Ø§Ù…ØªÛŒØ§Ø²:</span><div class="review-form__stars" id="review-stars">' + starsHtml + '</div></div>' +
        '<textarea class="review-form__textarea" id="review-text" placeholder="Ù†Ø¸Ø± Ø®ÙˆØ¯ Ø¯Ø±Ø¨Ø§Ø±Ù‡ Ø§ÛŒÙ† Ù…Ø­ØµÙˆÙ„ Ø±Ø§ Ø¨Ù†ÙˆÛŒØ³ÛŒØ¯..."></textarea>' +
        '<div class="review-form__actions"><span class="review-form__login-hint">Ø§Ø±Ø³Ø§Ù„ Ù†Ø¸Ø± ØªÙˆØ³Ø· ' + userName + '</span><button class="btn btn-primary" id="review-submit" type="button" style="display:inline-flex;align-items:center;gap:6px">Ø§Ø±Ø³Ø§Ù„ Ù†Ø¸Ø±</button></div>' +
        '<div id="review-form-message"></div></div>';
    }
    return '<div class="review-form" id="review-form"><div class="review-form__heading">Ù†Ø¸Ø± Ø®ÙˆØ¯ Ø±Ø§ Ø¨Ù†ÙˆÛŒØ³ÛŒØ¯</div>' +
      '<div class="review-form__rating"><span class="review-form__rating-label">Ø§Ù…ØªÛŒØ§Ø²:</span><div class="review-form__stars" id="review-stars">' + starsHtml + '</div></div>' +
      '<textarea class="review-form__textarea" id="review-text" placeholder="Ù†Ø¸Ø± Ø®ÙˆØ¯ Ø¯Ø±Ø¨Ø§Ø±Ù‡ Ø§ÛŒÙ† Ù…Ø­ØµÙˆÙ„ Ø±Ø§ Ø¨Ù†ÙˆÛŒØ³ÛŒØ¯..."></textarea>' +
      '<div class="review-form__actions"><span class="review-form__login-hint">Ø¨Ø±Ø§ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù†Ø¸Ø± Ø§Ø¨ØªØ¯Ø§ <a href="/login">ÙˆØ§Ø±Ø¯ Ø­Ø³Ø§Ø¨ Ú©Ø§Ø±Ø¨Ø±ÛŒ</a> Ø´ÙˆÛŒØ¯.</span><button class="btn btn-primary" id="review-submit" type="button" disabled style="display:inline-flex;align-items:center;gap:6px">Ø§Ø±Ø³Ø§Ù„ Ù†Ø¸Ø±</button></div></div>';
  }

  function renderQA() {
    return '<div class="qa-item"><div class="qa-item__question">Ø¢ÛŒØ§ Ø§ÛŒÙ† Ù…Ø­ØµÙˆÙ„ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ø¯Ø§Ø±Ø¯ØŸ</div><div class="qa-item__answer">Ø¨Ù„Ù‡ØŒ ØªÙ…Ø§Ù…ÛŒ Ù…Ø­ØµÙˆÙ„Ø§Øª Ø¨Ø§ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ø§ØµØ§Ù„Øª Ú©Ø§Ù„Ø§ Ø¹Ø±Ø¶Ù‡ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯. Ø¨Ø±Ø§ÛŒ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¨ÛŒØ´ØªØ± Ø¨Ø§ Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ ØªÙ…Ø§Ø³ Ø¨Ú¯ÛŒØ±ÛŒØ¯.</div></div>' +
    '<div class="qa-item"><div class="qa-item__question">Ø²Ù…Ø§Ù† Ø§Ø±Ø³Ø§Ù„ Ø§ÛŒÙ† Ù…Ø­ØµÙˆÙ„ Ú†Ù‚Ø¯Ø± Ø§Ø³ØªØŸ</div><div class="qa-item__answer">Ø§Ø±Ø³Ø§Ù„ Ø¹Ø§Ø¯ÛŒ Û³ ØªØ§ Ûµ Ø±ÙˆØ² Ú©Ø§Ø±ÛŒ Ùˆ Ø§Ø±Ø³Ø§Ù„ Ø³Ø±ÛŒØ¹ Û± ØªØ§ Û² Ø±ÙˆØ² Ú©Ø§Ø±ÛŒ Ø§Ø³Øª.</div></div>';
  }

  function buyBarPriceHTML(p, mode) {
    var price = App.getProductPrice(p, mode);
    var oldPrice = p.oldPrice ? Format.price(p.oldPrice) : '';
    var discount = (p.discount !== undefined && p.discount !== null && Number(p.discount) > 0)
      ? 'Ùª ' + Format.toPersianNumber(p.discount) : '';
    var finalPrice = Format.price(price);
    var tomanIcon = (typeof Icons !== 'undefined' && Icons.toman)
      ? '<span class="mobile-purchase-bar__toman">' + Icons.toman + '</span>'
      : '<span class="mobile-purchase-bar__currency">ØªÙˆÙ…Ø§Ù†</span>';
    /* Digikala-style: top row (discount + old price) / bottom row (final + toman) */
    return '<div class="mobile-purchase-bar__price-col">' +
      '<div class="mobile-purchase-bar__top-row">' +
        (discount ? '<span class="mobile-purchase-bar__discount-badge">' + discount + '</span>' : '') +
        (oldPrice ? '<span class="mobile-purchase-bar__old-price">' + oldPrice + '</span>' : '') +
      '</div>' +
      '<div class="mobile-purchase-bar__final-row">' +
        '<span class="mobile-purchase-bar__amount">' + finalPrice + '</span>' +
        tomanIcon +
        /* keep legacy currency node hidden for tests/back-compat */
        '<span class="mobile-purchase-bar__currency" style="display:none">ØªÙˆÙ…Ø§Ù†</span>' +
      '</div>' +
    '</div>';
  }

  function buyBarHTML(p, mode) {
    var pricingMode = mode || 'retail';
    var priceHtml = buyBarPriceHTML(p, pricingMode);
    var addBtnText = p.inStock ? 'Ø§ÙØ²ÙˆØ¯Ù† Ø¨Ù‡ Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯' : 'Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯';
    var addBtnClass = p.inStock ? '' : 'mobile-purchase-bar__add-btn--disabled';
    var addBtnDisabled = p.inStock ? '' : 'disabled';
    /* Digikala snippet layout: [button w-1/2 48px] + [price w-1/2] */
    return '<div class="mobile-purchase-bar__box">' +
      '<div class="mobile-purchase-bar__inner">' +
        '<div class="mobile-purchase-bar__cart-wrap">' +
          '<button id="mobile-add-to-cart" class="mobile-purchase-bar__add-btn ' + addBtnClass + '" ' + addBtnDisabled +
            ' data-cro-id="pdp-add-to-cart" data-testid="add-to-cart" onclick="this.classList.toggle(\'added\'); ProductDetail.addToCartWithOptions(' + p.id + ', \'' + pricingMode + '\')">' +
            '<span class="mobile-purchase-bar__add-btn-text">' + addBtnText + '</span>' +
          '</button>' +
          '<div class="mobile-purchase-bar__qty" id="mobile-qty-wrap" hidden>' +
            '<button type="button" class="mobile-purchase-bar__qty-btn" data-act="inc" onclick="ProductDetail.updateMobileQty(1)" aria-label="Ø§ÙØ²Ø§ÛŒØ´">+</button>' +
            '<span class="mobile-purchase-bar__qty-value" id="mobile-qty">' + Format.toPersianNumber(1) + '</span>' +
            '<button type="button" class="mobile-purchase-bar__qty-btn" data-act="dec" onclick="ProductDetail.updateMobileQty(-1)" aria-label="Ú©Ø§Ù‡Ø´">âˆ’</button>' +
          '</div>' +
        '</div>' +
        '<div class="mobile-purchase-bar__price-wrap" id="mobile-price-row">' + priceHtml + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderRelated() {
    var grid = $('#related-grid');
    if (!grid) return;
    var related = AppData.products.filter(function (p) { return p.category === product.category && p.id !== product.id; }).slice(0, 4);
    if (related.length < 4) {
      var extra = AppData.products.filter(function (p) { return p.id !== product.id && p.brand === product.brand; }).slice(0, 4 - related.length);
      related = related.concat(extra);
    }
    grid.innerHTML = related.map(function (p) {
      return App.renderProductCard(p);
    }).join('');
  }

  function bindReviewForm() {
    var starsContainer = $('#review-stars');
    var submitBtn = $('#review-submit');
    var textArea = $('#review-text');
    var messageEl = $('#review-form-message');
    if (!starsContainer || !submitBtn) return;
    var selectedRating = 0;

    starsContainer.addEventListener('click', function (e) {
      var star = e.target.closest('.review-form__star');
      if (!star) return;
      selectedRating = parseInt(star.dataset.rating);
      $$('.review-form__star', starsContainer).forEach(function (s, idx) {
        if (idx < selectedRating) {
          s.classList.add('is-active');
          s.innerHTML = Icons.star;
        } else {
          s.classList.remove('is-active');
          s.innerHTML = Icons.starEmpty;
        }
      });
    });

    submitBtn.addEventListener('click', function () {
      if (!App.isLoggedIn()) {
        if (App.redirectToLogin) App.redirectToLogin(); else window.location.href = '/login';
        return;
      }
      if (selectedRating === 0) {
        messageEl.innerHTML = '<div class="review-form__message review-form__message--error">Ù„Ø·ÙØ§Ù‹ Ø§Ù…ØªÛŒØ§Ø² Ø®ÙˆØ¯ Ø±Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ú©Ù†ÛŒØ¯.</div>';
        return;
      }
      var text = (textArea.value || '').trim();
      if (!text) {
        messageEl.innerHTML = '<div class="review-form__message review-form__message--error">Ù„Ø·ÙØ§Ù‹ Ù…ØªÙ† Ù†Ø¸Ø± Ø®ÙˆØ¯ Ø±Ø§ Ø¨Ù†ÙˆÛŒØ³ÛŒØ¯.</div>';
        return;
      }
      var user = App.getCurrentUser();
      var today = new Date();
      var dateStr = today.getFullYear() + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0');
      var newReview = {
        id: AppData.reviews.length + 1,
        productId: product.id,
        author: user.firstName || user.name || 'Ú©Ø§Ø±Ø¨Ø±',
        rating: selectedRating,
        title: '',
        text: text,
        date: dateStr
      };
      saveUserReview(newReview);
      textArea.value = '';
      selectedRating = 0;
      $$('.review-form__star', starsContainer).forEach(function (s) {
        s.classList.remove('is-active');
        s.innerHTML = Icons.starEmpty;
      });
      var reviewsPanel = $('#tab-reviews');
      if (reviewsPanel) reviewsPanel.innerHTML = renderReviews();
      var countEl = $('.pdp-rating__count');
      if (countEl) {
        var actualCount = AppData.reviews.filter(function (rv) { return rv.productId === product.id; }).length;
        countEl.textContent = '(' + Format.toPersianNumber(actualCount) + ' Ø®Ø±ÛŒØ¯Ø§Ø±)';
      }
      var reviewsTabBtn = $('.product-tabs__tab[data-tab="reviews"]');
      if (reviewsTabBtn) {
        var cnt = AppData.reviews.filter(function (rv) { return rv.productId === product.id; }).length;
        reviewsTabBtn.textContent = 'Ø¯ÛŒØ¯Ú¯Ø§Ù‡â€ŒÙ‡Ø§' + (cnt > 0 ? ' (' + Format.toPersianNumber(cnt) + ')' : '');
      }
      messageEl = $('#review-form-message');
      if (messageEl) messageEl.innerHTML = '<div class="review-form__message review-form__message--success">Ù†Ø¸Ø± Ø´Ù…Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø«Ø¨Øª Ø´Ø¯. Ø¨Ø§ ØªØ´Ú©Ø± Ø§Ø² Ø´Ù…Ø§!</div>';
      setTimeout(function () {
        var reviewsPanel2 = $('#tab-reviews');
        if (reviewsPanel2) reviewsPanel2.innerHTML = renderReviews();
        var rt = $('.product-tabs__tab[data-tab="reviews"]');
        if (rt) rt.click();
      }, 1500);
    });
  }

  function bindTabs() {
    document.addEventListener('click', function (e) {
      /* Handle badge-link clicks first (prevent href navigation) */
      var badgeLink = e.target.closest('.pdp-badge-link');
      if (badgeLink) {
        e.preventDefault();
        var targetTab = badgeLink.dataset.tab;
        if (targetTab) {
          $$('.product-tabs__tab').forEach(function (t) {
            t.classList.toggle('is-active', t.dataset.tab === targetTab);
          });
          $$('.product-tabs__panel').forEach(function (p) { p.classList.remove('is-active'); });
          var panel = $('#tab-' + targetTab);
          if (panel) panel.classList.add('is-active');
          /* Scroll to tabs section */
          var tabsEl = document.querySelector('.product-tabs');
          if (tabsEl) tabsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      var tab = e.target.closest('.product-tabs__tab');
      if (!tab) return;
      $$('.product-tabs__tab').forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      $$('.product-tabs__panel').forEach(function (p) { p.classList.remove('is-active'); });
      var panel2 = $('#tab-' + tab.dataset.tab);
      if (panel2) panel2.classList.add('is-active');
    });
  }

  function bindGallery() {
    document.addEventListener('click', function (e) {
      var thumb = e.target.closest('.pdp-thumb');
      if (!thumb) return;
      var idx = parseInt(thumb.dataset.index);
      if (isNaN(idx)) return;
      activeGalleryIndex = idx;
      var images = product.images && product.images.length ? product.images : [product.image];
      var imgSrc = images[idx] || images[0] || product.image;
      var mainEl = $('#gallery-main');
      if (mainEl) mainEl.innerHTML = imgTag(imgSrc, product.name);
      $$('.pdp-thumb').forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
