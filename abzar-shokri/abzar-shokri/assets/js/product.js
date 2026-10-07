/* ================================================================
   Abzar Shokri — Product Detail Page
   Uses product.image and product.images from data.js
   ================================================================ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [...(c || document).querySelectorAll(s)]; };
  var product = null;
  var activeGalleryIndex = 0;

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
    render();
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
    var badges = [];
    if (p.discount > 0) badges.push('<span class="badge badge-discount">٪' + p.discount + ' تخفیف</span>');
    if (p.isNew) badges.push('<span class="badge badge-new">جدید</span>');

    var el = $('#product-detail-content');
    if (!el) return;
    var actualReviewCount = AppData.reviews.filter(function (rv) { return rv.productId === p.id; }).length;

    var images = p.images && p.images.length ? p.images : [p.image];
    var mainImg = images[activeGalleryIndex] || images[0] || p.image;

    el.innerHTML = '\
    <div class="breadcrumb"><div class="container"><div class="breadcrumb-list">\
      <span class="breadcrumb-item"><a href="/">خانه</a></span>\
      <span class="breadcrumb-sep">‹</span>\
      <span class="breadcrumb-item"><a href="/shop">فروشگاه</a></span>\
      <span class="breadcrumb-sep">‹</span>\
      <span class="breadcrumb-item"><a href="/shop?category=' + p.categorySlug + '">' + p.category + '</a></span>\
      <span class="breadcrumb-sep">‹</span>\
      <span class="breadcrumb-item breadcrumb-item--active">' + p.name + '</span>\
    </div></div></div>\
    <div class="container"><div class="product-detail"><div class="product-detail__main">\
      <div class="product-gallery">\
        <div class="product-gallery__main" id="gallery-main">' + imgTag(mainImg, p.name) + '</div>\
        <div class="product-gallery__thumbs" id="gallery-thumbs">' +
      images.map(function (img, idx) {
        return '<div class="product-gallery__thumb' + (idx === activeGalleryIndex ? ' is-active' : '') + '" data-index="' + idx + '" title="تصویر ' + (idx + 1) + '">' + thumbImg(img, p.name + ' ' + (idx + 1)) + '</div>';
      }).join('') +
      '</div>\
      </div>\
      <div class="product-info">\
        <span class="product-info__brand"><a href="/brand/' + p.brand + '" style="color:inherit">' + p.brandName + '</a></span>\
        <h1 class="product-info__title">' + p.name + '</h1>\
        <div class="product-info__rating"><span class="product-info__stars">' + stars + '</span><span class="product-info__rating-text">' + p.rating + ' از ۵ (' + Format.toPersianNumber(actualReviewCount) + ' نظر)</span></div>\
        <span class="product-info__sku">کد محصول: ' + p.sku + '</span>\
        ' + (badges.length ? '<div style="display:flex;gap:var(--space-2)">' + badges.join('') + '</div>' : '') + '\
        <div class="product-info__price-box">\
          <div style="display:flex;align-items:center;gap:var(--space-3)">\
            <span class="product-info__price-current">' + Format.priceWithCurrency(p.price) + '</span>\
            ' + (p.oldPrice ? '<span class="product-info__price-old">' + Format.priceWithCurrency(p.oldPrice) + '</span><span class="product-info__price-discount">-' + Format.toPersianNumber(p.discount) + '٪</span>' : '') + '\
          </div>\
          <div class="product-info__stock ' + (p.inStock ? 'product-info__stock--in' : 'product-info__stock--out') + '">' + (p.inStock ? Icons.checkCircle.replace('width="20" height="20"', '') + ' موجود در انبار' : Icons.xCircle.replace('width="20" height="20"', '') + ' ناموجود') + '</div>\
        </div>\
        <div class="product-info__short-desc">' + p.shortDescription + '</div>\
        <div class="product-info__actions">\
          <div class="qty-selector">\
            <button class="qty-selector__btn" onclick="ProductDetail.changeQty(-1)">' + Icons.minus + '</button>\
            <div class="qty-selector__value" id="product-qty">۱</div>\
            <button class="qty-selector__btn" onclick="ProductDetail.changeQty(1)">' + Icons.plus + '</button>\
          </div>\
          ' + (p.inStock ? '<button class="btn btn-primary btn-lg" onclick="App.addToCart(' + p.id + ')" style="flex:1">' + Icons.shoppingBag + ' افزودن به سبد خرید</button>' : '<button class="btn btn-secondary btn-lg" disabled style="flex:1">ناموجود</button>') + '\
          <button class="btn btn-ghost btn-icon" onclick="App.toggleWishlist(' + p.id + ')" data-wishlist="' + p.id + '">' + Icons.heart + '</button>\
        </div>\
        <div class="product-info__features">\
          <div class="product-info__feature">' + Icons.truck + ' ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان</div>\
          <div class="product-info__feature">' + Icons.shieldCheck + ' ضمانت اصالت کالا</div>\
          <div class="product-info__feature">' + Icons.refreshCw + ' ۷ روز ضمانت بازگشت</div>\
        </div>\
      </div>\
    </div></div>\
    <div class="product-tabs">\
      <div class="product-tabs__nav">\
        <button class="product-tabs__tab is-active" data-tab="desc">معرفی</button>\
        <button class="product-tabs__tab" data-tab="expert">بررسی تخصصی</button>\
        <button class="product-tabs__tab" data-tab="specs">مشخصات</button>\
        <button class="product-tabs__tab" data-tab="reviews">دیدگاه‌ها' + (actualReviewCount > 0 ? ' (' + Format.toPersianNumber(actualReviewCount) + ')' : '') + '</button>\
        <button class="product-tabs__tab" data-tab="qa">پرسش‌ها</button>\
      </div>\
      <div class="product-tabs__panel is-active" id="tab-desc"><div class="static-page__content"><p>' + p.description + '</p></div></div>\
      <div class="product-tabs__panel" id="tab-expert">' + renderExpert() + '</div>\
      <div class="product-tabs__panel" id="tab-specs"><table class="specs-table">' + Object.keys(p.specs).map(function (k) { return '<tr><td>' + k + '</td><td>' + p.specs[k] + '</td></tr>'; }).join('') + '</table></div>\
      <div class="product-tabs__panel" id="tab-reviews">' + renderReviews() + '</div>\
      <div class="product-tabs__panel" id="tab-qa">' + renderQA() + '</div>\
    </div></div>\
    <div class="related-products"><div class="container"><div class="section-header"><h2 class="section-title">محصولات مرتبط</h2></div><div class="product-listing-grid" id="related-grid"></div></div></div>';

    renderRelated();
    var qty = 1;
    window.ProductDetail = {
      changeQty: function (d) {
        qty = Math.max(1, qty + d);
        var el = $('#product-qty');
        if (el) el.textContent = Format.toPersianNumber(qty);
      },
      getQty: function () { return qty; }
    };
  }

  function renderExpert() {
    return '<div class="static-page__content"><p>' + product.description + '</p></div>';
  }

  function renderReviews() {
    var reviews = AppData.reviews.filter(function (r) { return r.productId === product.id; });
    var actualReviewCount = reviews.length;
    var averageRating = getAvgRating(product.id);
    
    /* Calculate rating distribution */
    var ratingDistribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    reviews.forEach(function (rv) {
      if (rv.rating >= 1 && rv.rating <= 5) {
        ratingDistribution[rv.rating]++;
      }
    });
    
    /* Render review summary sidebar */
    var summaryHtml = '';
    if (actualReviewCount === 0) {
      summaryHtml = '<div class="review-summary"><p style="color:var(--text-muted);margin:0 0 var(--space-3) 0">هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهید!</p></div>';
    } else {
      /* Calculate percentage for each rating */
      var ratingPercentages = {};
      for (var i = 1; i <= 5; i++) {
        ratingPercentages[i] = Math.round((ratingDistribution[i] / actualReviewCount) * 100);
      }
      
      var starsHtml = '';
      for (var i = 0; i < 5; i++) {
        if (i < Math.floor(averageRating)) {
          starsHtml += Icons.star;
        } else if (i === Math.floor(averageRating) && averageRating % 1 >= 0.5) {
          starsHtml += Icons.starHalf;
        } else {
          starsHtml += Icons.starEmpty;
        }
      }
      
      summaryHtml = 
        '<div class="review-summary">' +
          '<div class="review-summary__top">' +
            '<div class="review-summary__average">' +
              '<div class="review-summary__value">' + averageRating.toFixed(1) + '</div>' +
              '<div class="review-summary__stars">' + starsHtml + '</div>' +
              '<div class="review-summary__count">از مجموع ' + actualReviewCount + ' خریدار</div>' +
            '</div>' +
            '<div class="review-summary__distribution">' +
              '<div class="review-summary__distribution-item">' +
                '<div class="review-summary__rating-bar" style="width:' + ratingPercentages[5] + '%"></div>' +
                '<span class="review-summary__rating-label">۵ ستاره</span>' +
                '<span class="review-summary__rating-count">(' + ratingDistribution[5] + ')</span>' +
              '</div>' +
              '<div class="review-summary__distribution-item">' +
                '<div class="review-summary__rating-bar" style="width:' + ratingPercentages[4] + '%"></div>' +
                '<span class="review-summary__rating-label">۴ ستاره</span>' +
                '<span class="review-summary__rating-count">(' + ratingDistribution[4] + ')</span>' +
              '</div>' +
              '<div class="review-summary__distribution-item">' +
                '<div class="review-summary__rating-bar" style="width:' + ratingPercentages[3] + '%"></div>' +
                '<span class="review-summary__rating-label">۳ ستاره</span>' +
                '<span class="review-summary__rating-count">(' + ratingDistribution[3] + ')</span>' +
              '</div>' +
              '<div class="review-summary__distribution-item">' +
                '<div class="review-summary__rating-bar" style="width:' + ratingPercentages[2] + '%"></div>' +
                '<span class="review-summary__rating-label">۲ ستاره</span>' +
                '<span class="review-summary__rating-count">(' + ratingDistribution[2] + ')</span>' +
              '</div>' +
              '<div class="review-summary__distribution-item">' +
                '<div class="review-summary__rating-bar" style="width:' + ratingPercentages[1] + '%"></div>' +
                '<span class="review-summary__rating-label">۱ ستاره</span>' +
                '<span class="review-summary__rating-count">(' + ratingDistribution[1] + ')</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
    
    var reviewsHtml = '';
    if (reviews.length === 0) {
      reviewsHtml = '<p style="color:var(--text-muted);padding:var(--space-4) 0;margin:0">هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهید!</p>';
    } else {
      reviewsHtml = reviews.map(function (rv) {
        var s = '';
        for (var i = 0; i < rv.rating; i++) s += Icons.star;
        var imagesHtml = '';
        if (rv.images && rv.images.length) {
          imagesHtml = '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">';
          for (var imgIdx = 0; imgIdx < rv.images.length; imgIdx++) {
            var imgSrc = rv.images[imgIdx];
            imagesHtml += '<img src="' + imgSrc + '" alt="تصویر نظر" style="width:64px;height:64px;object-fit:cover;border-radius:var(--radius-md);cursor:pointer;border:1px solid var(--border-color,#e5e7eb)" data-review-img="' + imgSrc + '" class="review-thumb-img" onerror="this.style.display=\'none\'">';
          }
          imagesHtml += '</div>';
        }
        return '<div class="review-item"><div class="review-item__header"><span class="review-item__author">' + rv.author + '</span><span class="review-item__date">' + rv.date + '</span></div><div class="review-item__stars">' + s + '</div><div class="review-item__title">' + rv.title + '</div><div class="review-item__text">' + rv.text + '</div>' + imagesHtml + '</div>';
      }).join('');
    }
    var formHtml = renderReviewForm();
    var lightboxHtml = '<div id="review-image-lightbox" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;justify-content:center;align-items:center;cursor:pointer" onclick="this.style.display=\'none\'"><img id="review-image-lightbox-img" src="" alt="تصویر نظر" style="max-width:90%;max-height:90%;object-fit:contain;border-radius:var(--radius-lg)"></div>';
    if (!window._reviewLightboxBound) {
      window._reviewLightboxBound = true;
      document.addEventListener('click', function (e) {
        var thumb = e.target.closest('.review-thumb-img');
        if (thumb) {
          var img = document.getElementById('review-image-lightbox-img');
          if (img) img.src = thumb.getAttribute('data-review-img');
          var lb = document.getElementById('review-image-lightbox');
          if (lb) lb.style.display = 'flex';
        }
      });
    }
    return summaryHtml + reviewsHtml + formHtml + lightboxHtml;
  }

  function renderQA() {
    return '<div class="qa-item"><div class="qa-item__question">آیا این محصول گارانتی دارد؟</div><div class="qa-item__answer">بله، تمامی محصولات با گارانتی اصالت کالا عرضه می‌شوند. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.</div></div>\
    <div class="qa-item"><div class="qa-item__question">زمان ارسال این محصول چقدر است؟</div><div class="qa-item__answer">ارسال عادی ۳ تا ۵ روز کاری و ارسال سریع ۱ تا ۲ روز کاری است.</div></div>';
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
      var r = Format.rating(p.rating);
      var s = '';
      for (var i = 0; i < r.full; i++) s += Icons.star;
      for (var i = 0; i < r.empty; i++) s += Icons.starEmpty;
      return '<div class="product-card"><div class="product-card__image"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy" class="product-card__img" onerror="this.onerror=null;this.src=\'' + fallbackSrc(p.brandName) + '\'">' + (p.discount > 0 ? '<div class="product-card__badges"><span class="badge badge-discount">٪' + p.discount + '</span></div>' : '') + '</div><div class="product-card__body"><span class="product-card__brand">' + p.brandName + '</span><a href="/product/' + p.slug + '" class="product-card__title" style="color:inherit;text-decoration:none">' + p.name + '</a><div class="product-card__rating"><span class="product-card__stars">' + s + '</span><span>(' + getReviewCount(p.id) + ')</span></div><div class="product-card__price"><span class="product-card__price-current">' + Format.price(p.price) + ' <span class="product-card__price-currency">تومان</span></span>' + (p.oldPrice ? '<span class="product-card__price-old">' + Format.price(p.oldPrice) + '</span>' : '') + '</div></div></div>';
    }).join('');
  }

  function bindTabs() {
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('.product-tabs__tab');
      if (!tab) return;
      $$('.product-tabs__tab').forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      $$('.product-tabs__panel').forEach(function (p) { p.classList.remove('is-active'); });
      var panel = $('#tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('is-active');
    });
  }

  function bindGallery() {
    document.addEventListener('click', function (e) {
      var thumb = e.target.closest('.product-gallery__thumb');
      if (!thumb) return;
      var idx = parseInt(thumb.dataset.index);
      if (isNaN(idx)) return;
      activeGalleryIndex = idx;
      var images = product.images && product.images.length ? product.images : [product.image];
      var imgSrc = images[idx] || images[0] || product.image;
      var mainEl = $('#gallery-main');
      if (mainEl) mainEl.innerHTML = imgTag(imgSrc, product.name);
      $$('.product-gallery__thumb').forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
