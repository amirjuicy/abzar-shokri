/* ================================================================
   Abzar Shokri — Product Detail Page (Digikala-style)
   Uses product.image and product.images from data.js
   ================================================================ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [...(c || document).querySelectorAll(s)]; };
  var product = null;
  var activeGalleryIndex = 0;

  /* ── Review persistence (localStorage) ─────────────────── */
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

  /* ── Image fallback ───────────────────────────────────────── */
  function fallbackSrc(brandName) {
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">' +
      '<rect width="400" height="400" fill="#f3f4f6"/>' +
      '<text x="200" y="210" text-anchor="middle" fill="#9ca3af" font-size="24" font-family="sans-serif">' +
      (brandName || 'ابزار شکری') + '</text></svg>'
    );
  }

  function imgTag(src, alt, extra) {
    return '<img src="' + src + '" alt="' + (alt || '') + '" loading="lazy" class="product-gallery__img"' + (extra || '') + ' onerror="this.onerror=null;this.src=\'' + fallbackSrc(product ? product.brandName : '') + '\'">';
  }

  function thumbImg(src, alt) {
    return '<img src="' + src + '" alt="' + (alt || '') + '" loading="lazy" class="product-gallery__thumb-img" onerror="this.onerror=null;this.src=\'' + fallbackSrc(product ? product.brandName : '') + '\'">';
  }

  /* ── Recently viewed (localStorage, persistent) ─────────── */
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

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    var params = new URLSearchParams(window.location.search);
    // Clean URL (/product/:ref) carries slug-or-id in the pathname.
    var pathRef = (function(){ try{ var s=(window.location.pathname||'').split('/').filter(function(x){ return !!x; }); if(s.length===2 && s[0]==='product' && s[1]) return decodeURIComponent(s[1]); }catch(e){} return ''; })();
    var slug = params.get('slug') || pathRef;
    var id = params.get('id') || (/^\d+$/.test(pathRef) ? pathRef : null);
    if (slug) product = AppData.products.find(function (p) { return p.slug === slug; });
    if (!product && id) product = AppData.products.find(function (p) { return p.id === parseInt(id); });
    if (!product) product = AppData.products[0];
    document.title = product.name + ' | ابزار شکری';
    activeGalleryIndex = 0;
    saveRecentlyViewed(product.id);
    loadPersistedReviews();
    render();
    document.body.classList.add('has-mobile-purchase-bar');
    bindTabs();
    bindGallery();
  }

  /* ── Render ───────────────────────────────────────────────── */
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
    /* ── Breadcrumb ── */
    '<div class="breadcrumb"><div class="container"><div class="breadcrumb-list">' +
      '<span class="breadcrumb-item"><a href="/">خانه</a></span>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<span class="breadcrumb-item"><a href="/shop?category=' + p.categorySlug + '">' + p.category + '</a></span>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<span class="breadcrumb-item breadcrumb-item--active">' + p.name + '</span>' +
    '</div></div></div>' +

    /* ── Two-column layout ── */
    '<div class="container"><div class="pdp-layout">' +

    /* ═══ RIGHT COLUMN: Gallery ═══ */
    '<div class="pdp-layout__gallery">' +

      /* Promo badge */
      '<div class="pdp-promo-badge">' +
        '<span class="pdp-promo-badge__text">پیشنهاد شگفت‌انگیز</span>' +
        '<div class="pdp-promo-badge__timer">' +
          '<span id="pdp-countdown">۵۸ : ۳۲ : ۰۹</span>' +
        '</div>' +
      '</div>' +

      /* Action icons + main image wrapper */
      '<div class="pdp-gallery-wrapper">' +

        /* Action icons (vertical sidebar) */
        '<div class="pdp-action-icons">' +
          '<button class="pdp-action-icon pdp-action-icon--wishlist" onclick="ProductDetail.toggleWishlist()" data-wishlist="' + p.id + '" aria-label="علاقه‌مندی">' +
            (App.getWishlist().indexOf(p.id) !== -1 ? Icons.heartFill : Icons.heart) +
            '<span class="pdp-action-icon__tooltip">اضافه به علاقه‌مندی</span>' +
          '</button>' +
          '<button class="pdp-action-icon" onclick="ProductDetail.share()" aria-label="اشتراک‌گذاری">' +
            Icons.share +
            '<span class="pdp-action-icon__tooltip">اشتراک‌گذاری</span>' +
          '</button>' +
          '<button class="pdp-action-icon pdp-action-icon--compare" onclick="ProductDetail.toggleCompare()" aria-label="مقایسه">' +
            Icons.scale +
            '<span class="pdp-action-icon__tooltip">مقایسه کالا</span>' +
          '</button>' +
          '<button class="pdp-action-icon" onclick="ProductDetail.toggleWishlist()" aria-label="افزودن به لیست">' +
            Icons.list +
            '<span class="pdp-action-icon__tooltip">افزودن به لیست</span>' +
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

    /* ═══ LEFT COLUMN: Info + Buy Box ═══ */
    '<div class="pdp-layout__info">' +

      /* ── Product Title ── */
      '<div class="pdp-title-section">' +
        '<nav class="pdp-breadcrumb">' +
          '<a href="/brand/' + p.brand + '" class="pdp-breadcrumb__brand">' + p.brandName + '</a>' +
          '<span class="pdp-breadcrumb__sep">/</span>' +
          '<a href="/shop?category=' + p.categorySlug + '" class="pdp-breadcrumb__cat">' + p.category + '</a>' +
        '</nav>' +
        '<h1 class="pdp-title">' + p.name + '</h1>' +
        '<div class="pdp-english-name">' + p.shortDescription.substring(0, 60) + '...</div>' +
      '</div>' +

      /* ── Rating + Reviews ── */
      '<div class="pdp-rating-row">' +
        '<div class="pdp-rating">' +
          '<span class="pdp-rating__stars">' + stars + '</span>' +
          '<span class="pdp-rating__value">' + p.rating + '</span>' +
          '<span class="pdp-rating__count">(' + Format.toPersianNumber(actualReviewCount) + ' خریدار)</span>' +
        '</div>' +
        '<div class="pdp-rating__badges">' +
          '<a class="pdp-badge-link" href="#tab-reviews" data-tab="reviews">' +
            '<span class="pdp-badge-link__icon">' + Icons.star + '</span>' +
            Format.toPersianNumber(actualReviewCount) + ' دیدگاه' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
          '</a>' +
          '<a class="pdp-badge-link" href="#tab-qa" data-tab="qa">' +
            Format.toPersianNumber(0) + ' پرسش' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>' +

      /* ── Specs Grid ── */
      (specKeys.length > 0 ?
      '<div class="pdp-specs">' +
        '<h3 class="pdp-specs__title">ویژگی‌ها</h3>' +
        '<div class="pdp-specs__grid">' +
          specKeys.slice(0, 6).map(function (k) {
            return '<div class="pdp-spec-item">' +
              '<div class="pdp-spec-item__label">' + k + '</div>' +
              '<div class="pdp-spec-item__value">' + p.specs[k] + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        (specKeys.length > 6 ?
        '<button class="pdp-specs__more" onclick="document.querySelector(\'[data-tab=specs]\').click()">مشاهده همه ویژگی‌ها ' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</button>' : '') +
      '</div>' : '') +

      /* ── Delivery Info ── */
      '<div class="pdp-delivery-info">' +
        '<div class="pdp-delivery-info__row">' +
          '<div class="pdp-delivery-info__badge">' +
            '<span class="pdp-delivery-info__badge-icon">' + Icons.truck + '</span>' +
            '<span>سریع امروز</span>' +
          '</div>' +
          '<div class="pdp-delivery-info__text">' +
            '<span>تحویل توسط فروشگاه</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Insurance ── */
      '<div class="pdp-insurance">' +
        '<h3 class="pdp-insurance__title">بیمه</h3>' +
        '<div class="pdp-insurance__card">' +
          '<label class="pdp-insurance__label">' +
            '<input type="checkbox" class="pdp-insurance__checkbox">' +
            '<span class="pdp-insurance__check"></span>' +
            '<div class="pdp-insurance__details">' +
              '<p class="pdp-insurance__name">بیمه تجهیزات دیجیتال</p>' +
              '<div class="pdp-insurance__price">' +
                '<span class="pdp-insurance__discount-badge">٪۵۰</span>' +
                '<span class="pdp-insurance__old-price">۲,۳۱۰,۰۰۰</span>' +
                '<span class="pdp-insurance__final-price">۱,۱۵۵,۰۰۰ تومان</span>' +
              '</div>' +
            '</div>' +
          '</label>' +
        '</div>' +
      '</div>' +

      /* ── Return Policy Notice ── */
      '<div class="pdp-return-notice">' +
        '<div class="pdp-return-notice__icon">' + Icons.infoCircle + '</div>' +
        '<p class="pdp-return-notice__text">امکان برگشت کالا در گروه ابزارآلات با دلیل "انصراف از خرید" تنها در صورتی مورد قبول است که پلمب کالا باز نشده باشد.</p>' +
      '</div>' +

      /* ── Buy Box (Digikala-style) ── */
      '<div class="dk-buybox-wrap">' +
      '<div class="dk-buybox" data-testid="buy-box">' +

        /* Seller Header */
        '<div class="dk-buybox__seller-header">' +
          '<h3 class="dk-buybox__seller-title">فروشنده</h3>' +
        '</div>' +

        /* Seller Store */
        '<div class="dk-buybox__store">' +
          '<div class="dk-buybox__store-inner">' +
            '<div class="dk-buybox__store-badge">' + Icons.store + '</div>' +
            '<div class="dk-buybox__store-info">' +
              '<div class="dk-buybox__store-name">ابزار شکری</div>' +
              '<div class="dk-buybox__store-stats">' +
                '<span class="dk-buybox__store-stat"><span style="color:var(--color-success)">۱۰۰٪</span> رضایت از کالا</span>' +
                '<span class="dk-buybox__store-divider"></span>' +
                '<span class="dk-buybox__store-stat">عملکرد <span style="color:var(--color-success)">عالی</span></span>' +
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
                '<span class="dk-buybox__discount-badge">٪' + p.discount + '</span>'
              : '') +
            '</div>' +
            '<div class="dk-buybox__final-price" id="product-detail-price">' +
              '<span class="dk-buybox__amount">' + Format.price(p.price) + '</span>' +
              '<svg style="width:14px;height:14px;fill:currentColor"><use xlink:href="#toman"></use></svg>' +
            '</div>' +
          '</div>' +
          (p.inStock ?
          '<div class="dk-buybox__cart">' +
            '<button class="dk-buybox__add-btn" id="product-add-to-cart" onclick="App.addToCart(' + p.id + ', ProductDetail.getPricingMode())">' +
              '<span>افزودن به سبد خرید</span>' +
            '</button>' +
          '</div>' :
          '<div class="dk-buybox__cart">' +
            '<button class="dk-buybox__add-btn dk-buybox__add-btn--disabled" disabled>ناموجود</button>' +
          '</div>') +
        '</div>' +

        /* Guarantee */
        '<div class="dk-buybox__guarantee">' +
          '<div class="dk-buybox__guarantee-icon">' + Icons.shieldCheck + '</div>' +
          '<span class="dk-buybox__guarantee-text">گارانتی اصالت کالا</span>' +
        '</div>' +

        /* Delivery Methods (current design: summary text, no per-method list) */
        '<div class="dk-buybox__delivery">' +
          '<div class="dk-buybox__delivery-header">' +
            '<div class="dk-buybox__delivery-icon">' + Icons.truck + '</div>' +
            '<span class="dk-buybox__delivery-title">روش‌ها و هزینه‌های تحویل</span>' +
            '<div class="dk-buybox__delivery-chevron">' + Icons.chevronLeft + '</div>' +
          '</div>' +
          '<div class="dk-buybox__delivery-info">' +
            '<p>هزینه ارسال بر اساس آدرس و مبلغ سفارش در مرحله تسویه‌حساب محاسبه می‌شود.</p>' +
            '<p>برای سفارش‌های بالاتر از حد مشخص، ارسال رایگان است.</p>' +
          '</div>' +
        '</div>' +

        /* Better Price */
        '<div class="dk-buybox__better-price">' +
          '<span class="dk-buybox__better-price-text">قیمت بهتری سراغ دارید؟</span>' +
          '<div class="dk-buybox__better-price-icon">' + Icons.infoCircle + '</div>' +
        '</div>' +

        /* Pricing Process Link */
        '<a class="dk-buybox__pricing-link" href="/pricing">' +
          '<div class="dk-buybox__pricing-info">' +
            '<div class="dk-buybox__pricing-icon">' + Icons.infoCircle + '</div>' +
            '<span class="dk-buybox__pricing-text">فرآیند قیمت‌گذاری و نظارت بر قیمت</span>' +
          '</div>' +
          '<div class="dk-buybox__pricing-chevron">' + Icons.chevronLeft + '</div>' +
        '</a>' +

      '</div>' +
      '</div>' +

      /* ── Mobile Purchase Bar (Digikala-style, mobile only via CSS) ── */
      '<div class="mobile-purchase-bar" id="mobile-purchase-bar">' + buyBarHTML(p, 'retail') + '</div>' +

      /* ── Features ── */
      '<div class="pdp-features">' +
        '<div class="pdp-feature">' +
          '<div class="pdp-feature__icon">' + Icons.truck + '</div>' +
          '<span>ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان</span>' +
        '</div>' +
        '<div class="pdp-feature">' +
          '<div class="pdp-feature__icon">' + Icons.shieldCheck + '</div>' +
          '<span>ضمانت اصالت کالا</span>' +
        '</div>' +
        '<div class="pdp-feature">' +
          '<div class="pdp-feature__icon">' + Icons.refreshCw + '</div>' +
          '<span>۷ روز ضمانت بازگشت</span>' +
        '</div>' +
      '</div>' +

    '</div>' +

    '</div></div>' +

    /* ── Tabs ── */
    '<div class="container"><div class="product-tabs">' +
      '<div class="product-tabs__nav">' +
        '<button class="product-tabs__tab is-active" data-tab="desc">معرفی</button>' +
        '<button class="product-tabs__tab" data-tab="expert">بررسی تخصصی</button>' +
        '<button class="product-tabs__tab" data-tab="specs">مشخصات</button>' +
        '<button class="product-tabs__tab" data-tab="reviews">دیدگاه‌ها' + (actualReviewCount > 0 ? ' (' + Format.toPersianNumber(actualReviewCount) + ')' : '') + '</button>' +
        '<button class="product-tabs__tab" data-tab="qa">پرسش‌ها</button>' +
      '</div>' +
      '<div class="product-tabs__panel is-active" id="tab-desc"><div class="static-page__content"><p>' + p.description + '</p></div></div>' +
      '<div class="product-tabs__panel" id="tab-expert">' + renderExpert() + '</div>' +
      '<div class="product-tabs__panel" id="tab-specs"><table class="specs-table">' + specKeys.map(function (k) { return '<tr><td>' + k + '</td><td>' + p.specs[k] + '</td>'; }).join('') + '</table></div>' +
      '<div class="product-tabs__panel" id="tab-reviews">' + renderReviews() + '</div>' +
      '<div class="product-tabs__panel" id="tab-qa">' + renderQA() + '</div>' +
    '</div></div>' +

    /* ── Related Products ── */
    '<div class="related-products"><div class="container"><div class="section-header"><h2 class="section-title">محصولات مرتبط</h2></div><div class="product-listing-grid" id="related-grid"></div></div></div>';

    renderRelated();
    bindReviewForm();
    startPdpCountdown();
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
    function syncMobileBar() {
      var addBtn = document.getElementById('mobile-add-to-cart');
      var qtyWrap = document.getElementById('mobile-qty-wrap');
      var mEl = document.getElementById('mobile-qty');
      if (!addBtn || !qtyWrap) return;
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
        var key = App.addToCart(id, m);
        if (key && qty > 1 && typeof App.updateCartQty === 'function') {
          App.updateCartQty(key, qty - 1);
        }
        if (key) mobileCartKey = key;
        qty = 1;
        syncMobileBar();
        return key;
      },
      updateMobileQty: function (d) {
        if (!mobileCartKey || typeof App.updateCartQty !== 'function') return;
        App.updateCartQty(mobileCartKey, d);
        setTimeout(syncMobileBar, 30);
      },
      syncMobileBar: syncMobileBar,
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
      },

      /* ── Wishlist toggle ──────────────────────────────── */
      toggleWishlist: function () {
        App.toggleWishlist(p.id);
        var icon = $('.pdp-action-icon--wishlist');
        if (icon) {
          var inList = App.getWishlist().indexOf(p.id) !== -1;
          /* Replace first child SVG with filled/outline heart */
          var svgContainer = icon.querySelector('svg') || icon.querySelector('div');
          if (svgContainer) {
            icon.innerHTML = (inList ? Icons.heartFill : Icons.heart) +
              '<span class="pdp-action-icon__tooltip">' + (inList ? 'حذف از علاقه‌مندی' : 'اضافه به علاقه‌مندی') + '</span>';
          }
          icon.classList.toggle('is-active', inList);
        }
      },

      /* ── Share product ────────────────────────────────── */
      share: function () {
        var url = window.location.href;
        var title = p.name;
        var text = 'مشاهده ' + p.name + ' در ابزار شکری';
        if (navigator.share) {
          navigator.share({ title: title, text: text, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            App.showToast('لینک محصول کپی شد!', 'success');
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
          App.showToast('لینک محصول کپی شد!', 'success');
        } catch (e) {
          App.showToast('امکان کپی لینک وجود ندارد.', 'danger');
        }
        document.body.removeChild(ta);
      },

      /* ── Compare toggle ────────────────────────────────── */
      toggleCompare: function () {
        var key = 'as_compare_list';
        var list = [];
        try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { list = []; }
        var idx = list.indexOf(p.id);
        if (idx === -1) {
          if (list.length >= 4) {
            App.showToast('حداکثر ۴ محصول قابل مقایسه هستند.', 'info');
            return;
          }
          list.push(p.id);
          App.showToast(p.name + ' به لیست مقایسه اضافه شد.', 'success');
        } else {
          list.splice(idx, 1);
          App.showToast(p.name + ' از لیست مقایسه حذف شد.', 'info');
        }
        localStorage.setItem(key, JSON.stringify(list));
        /* Update compare icon state */
        var icon = $('.pdp-action-icon--compare');
        if (icon) {
          var inList = list.indexOf(p.id) !== -1;
          icon.classList.toggle('is-active', inList);
          var tooltip = icon.querySelector('.pdp-action-icon__tooltip');
          if (tooltip) tooltip.textContent = inList ? 'حذف از مقایسه' : 'مقایسه کالا';
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
        if (tooltip) tooltip.textContent = 'حذف از مقایسه';
      }
    })();
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
      reviewsHtml = '<p style="color:var(--text-muted);padding:var(--space-4) 0;margin:0">هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهید!</p>';
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
      starsHtml += '<button type="button" class="review-form__star" data-rating="' + i + '" title="' + i + ' از ۵">' + Icons.starEmpty + '</button>';
    }
    if (isLoggedIn) {
      var user = App.getCurrentUser();
      var userName = user.firstName || user.name || 'کاربر';
      return '<div class="review-form" id="review-form"><div class="review-form__heading">نظر خود را بنویسید</div>' +
        '<div class="review-form__rating"><span class="review-form__rating-label">امتیاز:</span><div class="review-form__stars" id="review-stars">' + starsHtml + '</div></div>' +
        '<textarea class="review-form__textarea" id="review-text" placeholder="نظر خود درباره این محصول را بنویسید..."></textarea>' +
        '<div class="review-form__actions"><span class="review-form__login-hint">ارسال نظر توسط ' + userName + '</span><button class="btn btn-primary" id="review-submit" type="button" style="display:inline-flex;align-items:center;gap:6px">ارسال نظر</button></div>' +
        '<div id="review-form-message"></div></div>';
    }
    return '<div class="review-form" id="review-form"><div class="review-form__heading">نظر خود را بنویسید</div>' +
      '<div class="review-form__rating"><span class="review-form__rating-label">امتیاز:</span><div class="review-form__stars" id="review-stars">' + starsHtml + '</div></div>' +
      '<textarea class="review-form__textarea" id="review-text" placeholder="نظر خود درباره این محصول را بنویسید..."></textarea>' +
      '<div class="review-form__actions"><span class="review-form__login-hint">برای ارسال نظر ابتدا <a href="/login">وارد حساب کاربری</a> شوید.</span><button class="btn btn-primary" id="review-submit" type="button" disabled style="display:inline-flex;align-items:center;gap:6px">ارسال نظر</button></div></div>';
  }

  function renderQA() {
    return '<div class="qa-item"><div class="qa-item__question">آیا این محصول گارانتی دارد؟</div><div class="qa-item__answer">بله، تمامی محصولات با گارانتی اصالت کالا عرضه می‌شوند. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.</div></div>' +
    '<div class="qa-item"><div class="qa-item__question">زمان ارسال این محصول چقدر است؟</div><div class="qa-item__answer">ارسال عادی ۳ تا ۵ روز کاری و ارسال سریع ۱ تا ۲ روز کاری است.</div></div>';
  }

  function buyBarPriceHTML(p, mode) {
    var price = App.getProductPrice(p, mode);
    var oldPrice = p.oldPrice ? Format.price(p.oldPrice) : '';
    var discount = (p.discount !== undefined && p.discount !== null && Number(p.discount) > 0)
      ? '٪ ' + Format.toPersianNumber(p.discount) : '';
    var finalPrice = Format.price(price);
    var tomanIcon = (typeof Icons !== 'undefined' && Icons.toman)
      ? '<span class="mobile-purchase-bar__toman">' + Icons.toman + '</span>'
      : '<span class="mobile-purchase-bar__currency">تومان</span>';
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
        '<span class="mobile-purchase-bar__currency" style="display:none">تومان</span>' +
      '</div>' +
    '</div>';
  }

  function buyBarHTML(p, mode) {
    var pricingMode = mode || 'retail';
    var priceHtml = buyBarPriceHTML(p, pricingMode);
    var addBtnText = p.inStock ? 'افزودن به سبد خرید' : 'ناموجود';
    var addBtnClass = p.inStock ? '' : 'mobile-purchase-bar__add-btn--disabled';
    var addBtnDisabled = p.inStock ? '' : 'disabled';
    /* Digikala snippet layout: [button w-1/2 48px] + [price w-1/2] */
    return '<div class="mobile-purchase-bar__box">' +
      '<div class="mobile-purchase-bar__inner">' +
        '<div class="mobile-purchase-bar__cart-wrap">' +
          '<button id="mobile-add-to-cart" class="mobile-purchase-bar__add-btn ' + addBtnClass + '" ' + addBtnDisabled +
            ' data-cro-id="pdp-add-to-cart" data-testid="add-to-cart" onclick="ProductDetail.addToCartWithOptions(' + p.id + ', \'' + pricingMode + '\')">' +
            '<span class="mobile-purchase-bar__add-btn-text">' + addBtnText + '</span>' +
          '</button>' +
          '<div class="mobile-purchase-bar__qty" id="mobile-qty-wrap" hidden>' +
            '<button type="button" class="mobile-purchase-bar__qty-btn" data-act="inc" onclick="ProductDetail.updateMobileQty(1)" aria-label="افزایش">+</button>' +
            '<span class="mobile-purchase-bar__qty-value" id="mobile-qty">' + Format.toPersianNumber(1) + '</span>' +
            '<button type="button" class="mobile-purchase-bar__qty-btn" data-act="dec" onclick="ProductDetail.updateMobileQty(-1)" aria-label="کاهش">−</button>' +
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
        messageEl.innerHTML = '<div class="review-form__message review-form__message--error">لطفاً امتیاز خود را انتخاب کنید.</div>';
        return;
      }
      var text = (textArea.value || '').trim();
      if (!text) {
        messageEl.innerHTML = '<div class="review-form__message review-form__message--error">لطفاً متن نظر خود را بنویسید.</div>';
        return;
      }
      var user = App.getCurrentUser();
      var today = new Date();
      var dateStr = today.getFullYear() + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0');
      var newReview = {
        id: AppData.reviews.length + 1,
        productId: product.id,
        author: user.firstName || user.name || 'کاربر',
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
        countEl.textContent = '(' + Format.toPersianNumber(actualCount) + ' خریدار)';
      }
      var reviewsTabBtn = $('.product-tabs__tab[data-tab="reviews"]');
      if (reviewsTabBtn) {
        var cnt = AppData.reviews.filter(function (rv) { return rv.productId === product.id; }).length;
        reviewsTabBtn.textContent = 'دیدگاه‌ها' + (cnt > 0 ? ' (' + Format.toPersianNumber(cnt) + ')' : '');
      }
      messageEl = $('#review-form-message');
      if (messageEl) messageEl.innerHTML = '<div class="review-form__message review-form__message--success">نظر شما با موفقیت ثبت شد. با تشکر از شما!</div>';
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
