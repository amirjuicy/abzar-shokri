/* ================================================================
   Abzar Shokri — Product Detail Page
   Data-driven gallery with category-based illustrations,
   interactive thumbnails, proper layout constraints.
   ================================================================ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [...(c || document).querySelectorAll(s)]; };
  var product = null;
  var activeGalleryIndex = 0;

  /* ── Category-based SVG illustrations ────────────────────── */
  var categoryIllustrations = {
    'power-tools': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="60" width="100" height="80" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="120" y="75" width="60" height="50" rx="4" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><rect x="140" y="90" width="20" height="20" rx="10" fill="#999"/><circle cx="150" cy="100" r="8" fill="#777"/><rect x="70" y="40" width="8" height="25" rx="2" fill="#aaa"/><rect x="35" y="140" width="70" height="12" rx="3" fill="#bbb" stroke="#aaa" stroke-width="1"/><rect x="50" y="155" width="40" height="8" rx="2" fill="#ccc"/></svg>' },
      { label: 'نمای جانبی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="70" width="140" height="60" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><circle cx="50" cy="100" r="20" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="50" cy="100" r="8" fill="#999"/><rect x="150" y="85" width="30" height="30" rx="3" fill="#bbb"/></svg>' },
      { label: 'نمای نزدیک', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="50" width="120" height="100" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="60" y="70" width="80" height="30" rx="4" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><text x="100" y="90" text-anchor="middle" font-size="10" fill="#999">POWER</text><rect x="60" y="110" width="80" height="20" rx="3" fill="#bbb"/><circle cx="100" cy="150" r="12" fill="#aaa"/></svg>' },
      { label: 'جعبه', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="40" width="140" height="120" rx="6" fill="#e0e0e0" stroke="#ccc" stroke-width="1.5"/><rect x="30" y="40" width="140" height="30" rx="6" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><line x1="30" y1="70" x2="170" y2="70" stroke="#bbb" stroke-width="1"/><rect x="80" y="48" width="40" height="14" rx="3" fill="#bbb"/><rect x="50" y="80" width="100" height="70" rx="4" fill="#ccc"/></svg>' }
    ],
    'cordless-tools': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="55" width="90" height="70" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="130" y="65" width="45" height="50" rx="4" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="152" cy="90" r="10" fill="#999"/><rect x="70" y="35" width="6" height="25" rx="2" fill="#aaa"/><rect x="55" y="125" width="60" height="45" rx="4" fill="#bbb" stroke="#aaa" stroke-width="1"/><rect x="65" y="135" width="40" height="8" rx="2" fill="#999"/></svg>' },
      { label: 'باتری', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="50" width="100" height="100" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="70" y="40" width="20" height="15" rx="3" fill="#bbb"/><rect x="110" y="40" width="20" height="15" rx="3" fill="#bbb"/><rect x="65" y="70" width="70" height="15" rx="3" fill="#d0d0d0"/><rect x="65" y="90" width="70" height="15" rx="3" fill="#d0d0d0"/><rect x="65" y="110" width="70" height="15" rx="3" fill="#d0d0d0"/><text x="100" y="140" text-anchor="middle" font-size="9" fill="#999">18V</text></svg>' },
      { label: 'نمای جانبی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="70" width="140" height="60" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><circle cx="50" cy="100" r="20" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="50" cy="100" r="8" fill="#999"/><rect x="150" y="85" width="25" height="30" rx="3" fill="#bbb"/></svg>' },
      { label: 'جعبه', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="40" width="140" height="120" rx="6" fill="#e0e0e0" stroke="#ccc" stroke-width="1.5"/><rect x="30" y="40" width="140" height="30" rx="6" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><rect x="80" y="48" width="40" height="14" rx="3" fill="#bbb"/><rect x="50" y="80" width="100" height="70" rx="4" fill="#ccc"/></svg>' }
    ],
    'hand-tools': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="85" width="140" height="30" rx="4" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="25" y="75" width="30" height="50" rx="3" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="40" cy="100" r="15" fill="#bbb" stroke="#aaa" stroke-width="1"/><circle cx="40" cy="100" r="8" fill="#999"/><rect x="160" y="80" width="25" height="40" rx="3" fill="#bbb" stroke="#aaa" stroke-width="1"/></svg>' },
      { label: 'نمای نزدیک', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="60" width="120" height="80" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="55" y="75" width="90" height="20" rx="3" fill="#d0d0d0"/><rect x="55" y="100" width="90" height="20" rx="3" fill="#d0d0d0"/><circle cx="70" cy="85" r="5" fill="#bbb"/><circle cx="130" cy="85" r="5" fill="#bbb"/></svg>' },
      { label: 'ست کامل', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="50" width="160" height="100" rx="6" fill="#e0e0e0" stroke="#ccc" stroke-width="1.5"/><rect x="30" y="60" width="30" height="80" rx="3" fill="#d0d0d0"/><rect x="65" y="60" width="30" height="80" rx="3" fill="#d0d0d0"/><rect x="100" y="60" width="30" height="80" rx="3" fill="#d0d0d0"/><rect x="135" y="60" width="30" height="80" rx="3" fill="#d0d0d0"/></svg>' }
    ],
    'cutting-tools': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="60" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><circle cx="100" cy="100" r="40" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="100" cy="100" r="15" fill="#bbb" stroke="#aaa" stroke-width="1"/><circle cx="100" cy="100" r="5" fill="#999"/><line x1="100" y1="40" x2="100" y2="60" stroke="#aaa" stroke-width="2"/><line x1="100" y1="140" x2="100" y2="160" stroke="#aaa" stroke-width="2"/><line x1="40" y1="100" x2="60" y2="100" stroke="#aaa" stroke-width="2"/><line x1="140" y1="100" x2="160" y2="100" stroke="#aaa" stroke-width="2"/></svg>' },
      { label: 'تیغه', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="70" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><circle cx="100" cy="100" r="50" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="100" cy="100" r="20" fill="#bbb"/><circle cx="100" cy="100" r="8" fill="#999"/><path d="M100 30 L110 50 L90 50 Z" fill="#aaa"/><path d="M170 100 L150 110 L150 90 Z" fill="#aaa"/><path d="M100 170 L90 150 L110 150 Z" fill="#aaa"/><path d="M30 100 L50 90 L50 110 Z" fill="#aaa"/></svg>' },
      { label: 'نمای جانبی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="70" width="140" height="60" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><circle cx="50" cy="100" r="25" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="50" cy="100" r="10" fill="#999"/><rect x="150" y="85" width="20" height="30" rx="3" fill="#bbb"/></svg>' }
    ],
    'measuring-tools': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="70" width="140" height="60" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="40" y="80" width="120" height="10" rx="2" fill="#d0d0d0"/><line x1="50" y1="80" x2="50" y2="90" stroke="#aaa" stroke-width="1"/><line x1="70" y1="80" x2="70" y2="90" stroke="#aaa" stroke-width="1"/><line x1="90" y1="80" x2="90" y2="90" stroke="#aaa" stroke-width="1"/><line x1="110" y1="80" x2="110" y2="90" stroke="#aaa" stroke-width="1"/><line x1="130" y1="80" x2="130" y2="90" stroke="#aaa" stroke-width="1"/><line x1="150" y1="80" x2="150" y2="90" stroke="#aaa" stroke-width="1"/><rect x="40" y="95" width="60" height="25" rx="3" fill="#bbb"/><rect x="110" y="95" width="50" height="25" rx="3" fill="#d0d0d0"/></svg>' },
      { label: 'صفحه نمایش', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="40" width="120" height="120" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="55" y="55" width="90" height="50" rx="4" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><text x="100" y="85" text-anchor="middle" font-size="14" fill="#999">40.00</text><rect x="55" y="115" width="90" height="30" rx="4" fill="#bbb"/><rect x="65" y="120" width="25" height="20" rx="3" fill="#999"/><rect x="95" y="120" width="25" height="20" rx="3" fill="#999"/><rect x="125" y="120" width="10" height="20" rx="3" fill="#999"/></svg>' }
    ],
    'safety': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="110" rx="60" ry="50" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><path d="M40 110 Q40 60 100 50 Q160 60 160 110" fill="#d0d0d0" stroke="#bbb" stroke-width="1.5"/><rect x="85" y="130" width="30" height="20" rx="3" fill="#bbb" stroke="#aaa" stroke-width="1"/><line x1="60" y1="100" x2="140" y2="100" stroke="#aaa" stroke-width="1.5"/></svg>' },
      { label: 'نمای جانبی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M60 120 Q60 50 100 40 Q140 50 140 120" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><path d="M50 120 Q50 130 60 130" fill="none" stroke="#bbb" stroke-width="2"/><path d="M140 120 Q140 130 150 130" fill="none" stroke="#bbb" stroke-width="2"/><rect x="80" y="130" width="40" height="25" rx="3" fill="#bbb"/></svg>' }
    ],
    'accessories': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="40" width="140" height="120" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="30" y="40" width="140" height="30" rx="8" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><rect x="80" y="48" width="40" height="14" rx="3" fill="#bbb"/><rect x="45" y="80" width="50" height="70" rx="4" fill="#ccc"/><rect x="105" y="80" width="50" height="70" rx="4" fill="#ccc"/></svg>' },
      { label: 'محتوا', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="30" width="140" height="140" rx="6" fill="#e0e0e0" stroke="#ccc" stroke-width="1.5"/><rect x="40" y="40" width="40" height="60" rx="3" fill="#d0d0d0"/><rect x="85" y="40" width="40" height="60" rx="3" fill="#d0d0d0"/><rect x="130" y="40" width="30" height="60" rx="3" fill="#d0d0d0"/><rect x="40" y="110" width="40" height="50" rx="3" fill="#d0d0d0"/><rect x="85" y="110" width="40" height="50" rx="3" fill="#d0d0d0"/><rect x="130" y="110" width="30" height="50" rx="3" fill="#d0d0d0"/></svg>' }
    ],
    'woodworking': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="60" width="160" height="80" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="30" y="70" width="60" height="60" rx="4" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><rect x="100" y="70" width="70" height="60" rx="4" fill="#bbb" stroke="#aaa" stroke-width="1"/><circle cx="135" cy="100" r="15" fill="#999"/><rect x="60" y="40" width="80" height="25" rx="3" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/></svg>' },
      { label: 'تیغه', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="60" width="120" height="80" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="50" y="70" width="100" height="15" rx="2" fill="#d0d0d0"/><line x1="50" y1="77" x2="150" y2="77" stroke="#aaa" stroke-width="1"/><rect x="50" y="90" width="100" height="10" rx="2" fill="#bbb"/><rect x="50" y="105" width="100" height="10" rx="2" fill="#bbb"/><rect x="50" y="120" width="100" height="10" rx="2" fill="#bbb"/></svg>' }
    ],
    'workshop': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="50" width="160" height="100" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="30" y="60" width="80" height="80" rx="4" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="70" cy="100" r="25" fill="#bbb" stroke="#aaa" stroke-width="1"/><circle cx="70" cy="100" r="10" fill="#999"/><rect x="120" y="60" width="50" height="80" rx="4" fill="#bbb" stroke="#aaa" stroke-width="1"/><rect x="130" y="70" width="30" height="20" rx="3" fill="#999"/></svg>' },
      { label: 'مخزن', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="40" width="140" height="120" rx="8" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="40" y="50" width="120" height="80" rx="4" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="100" cy="90" r="20" fill="#bbb"/><circle cx="100" cy="90" r="8" fill="#999"/><rect x="40" y="140" width="120" height="15" rx="3" fill="#bbb"/></svg>' }
    ],
    'metalworking': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="70" width="140" height="60" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="40" y="80" width="50" height="40" rx="3" fill="#d0d0d0"/><rect x="100" y="80" width="60" height="40" rx="3" fill="#bbb"/><circle cx="130" cy="100" r="12" fill="#999"/><rect x="30" y="130" width="140" height="20" rx="3" fill="#ddd" stroke="#ccc" stroke-width="1"/></svg>' }
    ],
    'plumbing': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="60" width="120" height="80" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="50" y="70" width="100" height="25" rx="3" fill="#d0d0d0"/><circle cx="70" cy="82" r="8" fill="#bbb"/><circle cx="130" cy="82" r="8" fill="#bbb"/><rect x="50" y="100" width="100" height="15" rx="3" fill="#bbb"/><rect x="50" y="120" width="100" height="10" rx="3" fill="#ccc"/></svg>' }
    ],
    'gardening': [
      { label: 'نمای اصلی', svg: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="50" width="120" height="100" rx="6" fill="#e8e8e8" stroke="#ccc" stroke-width="1.5"/><rect x="50" y="60" width="40" height="80" rx="3" fill="#d0d0d0"/><rect x="100" y="60" width="50" height="80" rx="3" fill="#bbb"/><circle cx="125" cy="100" r="15" fill="#999"/><rect x="95" y="40" width="60" height="20" rx="3" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/></svg>' }
    ]
  };

  /* Fallback illustration */
  var fallbackIllustration = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="30" width="140" height="140" rx="8" fill="#f0f0f0" stroke="#ddd" stroke-width="1.5"/><rect x="50" y="50" width="100" height="100" rx="4" fill="#e0e0e0" stroke="#ccc" stroke-width="1"/><circle cx="100" cy="100" r="25" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/><circle cx="100" cy="100" r="10" fill="#bbb"/><rect x="85" y="60" width="30" height="8" rx="2" fill="#ccc"/></svg>';

  function getIllustrations(categorySlug) {
    return categoryIllustrations[categorySlug] || categoryIllustrations['power-tools'] || [
      { label: 'نمای اصلی', svg: fallbackIllustration }
    ];
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    var id = params.get('id');
    if (slug) product = AppData.products.find(function (p) { return p.slug === slug; });
    if (!product && id) product = AppData.products.find(function (p) { return p.id === parseInt(id); });
    if (!product) product = AppData.products[0];
    document.title = product.name + ' | ابزار شکری';
    activeGalleryIndex = 0;
    render();
    bindTabs();
    bindGallery();
  }

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
    var illustrations = getIllustrations(p.categorySlug);
    var mainIllustration = illustrations[activeGalleryIndex] || illustrations[0];

    el.innerHTML = '\
    <div class="breadcrumb"><div class="container"><div class="breadcrumb-list">\
      <span class="breadcrumb-item"><a href="index.html">خانه</a></span>\
      <span class="breadcrumb-sep">‹</span>\
      <span class="breadcrumb-item"><a href="shop.html">فروشگاه</a></span>\
      <span class="breadcrumb-sep">‹</span>\
      <span class="breadcrumb-item"><a href="shop.html?category=' + p.categorySlug + '">' + p.category + '</a></span>\
      <span class="breadcrumb-sep">‹</span>\
      <span class="breadcrumb-item breadcrumb-item--active">' + p.name + '</span>\
    </div></div></div>\
    <div class="container"><div class="product-detail"><div class="product-detail__main">\
      <div class="product-gallery">\
        <div class="product-gallery__main" id="gallery-main">' + mainIllustration.svg + '</div>\
        <div class="product-gallery__thumbs" id="gallery-thumbs">' +
      illustrations.map(function (ill, idx) {
        return '<div class="product-gallery__thumb' + (idx === activeGalleryIndex ? ' is-active' : '') + '" data-index="' + idx + '" title="' + ill.label + '">' + ill.svg + '</div>';
      }).join('') +
      '</div>\
      </div>\
      <div class="product-info">\
        <span class="product-info__brand"><a href="brand-detail.html?brand=' + p.brand + '" style="color:inherit">' + p.brandName + '</a></span>\
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
        <button class="product-tabs__tab is-active" data-tab="desc">توضیحات</button>\
        <button class="product-tabs__tab" data-tab="specs">مشخصات فنی</button>\
        <button class="product-tabs__tab" data-tab="reviews">نظرات کاربران' + (actualReviewCount > 0 ? ' (' + Format.toPersianNumber(actualReviewCount) + ')' : '') + '</button>\
        <button class="product-tabs__tab" data-tab="qa">پرسش و پاسخ</button>\
      </div>\
      <div class="product-tabs__panel is-active" id="tab-desc"><div class="static-page__content"><p>' + p.description + '</p></div></div>\
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

  function renderReviews() {
    var reviews = AppData.reviews.filter(function (r) { return r.productId === product.id; });
    if (reviews.length === 0) return '<p style="color:var(--text-muted);padding:var(--space-4) 0">هنوز نظری ثبت نشده است.</p>';
    return reviews.map(function (rv) {
      var s = '';
      for (var i = 0; i < rv.rating; i++) s += Icons.star;
      return '<div class="review-item"><div class="review-item__header"><span class="review-item__author">' + rv.author + '</span><span class="review-item__date">' + rv.date + '</span></div><div class="review-item__stars">' + s + '</div><div class="review-item__title">' + rv.title + '</div><div class="review-item__text">' + rv.text + '</div></div>';
    }).join('');
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
      var ill = getIllustrations(p.categorySlug)[0];
      return '<div class="product-card"><div class="product-card__image">' + ill.svg + (p.discount > 0 ? '<div class="product-card__badges"><span class="badge badge-discount">٪' + p.discount + '</span></div>' : '') + '</div><div class="product-card__body"><span class="product-card__brand">' + p.brandName + '</span><a href="product.html?slug=' + p.slug + '" class="product-card__title" style="color:inherit;text-decoration:none">' + p.name + '</a><div class="product-card__rating"><span class="product-card__stars">' + s + '</span><span>(' + getReviewCount(p.id) + ')</span></div><div class="product-card__price"><span class="product-card__price-current">' + Format.price(p.price) + ' <span class="product-card__price-currency">تومان</span></span>' + (p.oldPrice ? '<span class="product-card__price-old">' + Format.price(p.oldPrice) + '</span>' : '') + '</div></div></div>';
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
      var illustrations = getIllustrations(product.categorySlug);
      var ill = illustrations[idx] || illustrations[0];
      var mainEl = $('#gallery-main');
      if (mainEl) mainEl.innerHTML = ill.svg;
      $$('.product-gallery__thumb').forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
