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
      return '<a href="/shop?category=' + cat.slug + '" class="category-card" style="color:inherit;text-decoration:none"><div class="category-card__icon">' + getCategoryIcon(cat.icon) + '</div><span class="category-card__name">' + cat.name + '</span><span class="category-card__count">' + realCount + ' محصول</span></a>';
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
        '<a href="/product/' + product.slug + '" class="product-card__title" style="color:inherit;text-decoration:none">' + product.name + '</a>' +
        '<div class="product-card__rating"><span class="product-card__stars">' + stars + '</span><span>(' + getReviewCount(product.id) + ')</span></div>' +
        '<div class="product-card__price">' +
          '<span class="product-card__price-current">' + Format.price(product.price) + ' <span class="product-card__price-currency">تومان</span></span>' +
          (product.oldPrice ? '<span class="product-card__price-old">' + Format.price(product.oldPrice) + '</span>' : '') +
        '</div>' +
        '<button class="btn btn-primary btn-block product-card__add-to-cart" onclick="App.addToCart(' + product.id + ')">افزودن به سبد خرید</button>' +
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
      return '<a href="/brand/' + brand.name + '" class="brand-card" style="color:inherit;text-decoration:none"><span class="brand-card__name">' + brand.displayName + '</span><span class="brand-card__count" style="font-size:var(--font-size-xs);color:var(--text-muted)">' + realCount + ' محصول</span></a>';
    }).join('');
  }

  function faDate(ts){ try{ if(!ts) return ''; var d=new Date(String(ts).trim().replace(' ','T')); if(isNaN(d.getTime())) return ''; return d.toLocaleDateString('fa-IR'); }catch(e){ return ''; } }
  function articleDate(a){ return faDate(a.createdAt||a.created_at)||a.date||''; }
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
            '<span class="article-card__meta-item">' + Icons.calendar + ' ' + articleDate(article) + '</span>' +
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
      return '<a href="/shop?category=' + cat.slug + '" class="categories-dropdown__link">' + getCategoryIcon(cat.icon) + '<span>' + cat.name + '</span><span class="categories-dropdown__count">' + realCount + '</span></a>';
    }).join('');
  }

  /* ── Mobile shortcuts: smooth-scroll to homepage sections ── */
  function bindMobileShortcuts() {
    var items = document.querySelectorAll('.mobile-shortcuts__item');
    if (!items.length) return;
    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        var id = item.getAttribute('href');
        if (!id || id.charAt(0) !== '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        items.forEach(function (i) { i.classList.remove('is-active'); });
        item.classList.add('is-active');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
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
    bindMobileShortcuts();
  }

  /* ── Boot ─────────────────────────────────────────────────── */
  /* No window.App definition — all shared APIs come from common.js */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


/* ── Hero Slideshow ──────────────────────────────────────────── */
  function initHeroSlideshow() {
    var section = document.getElementById('hero-slideshow');
    if (!section) return;
    /* Singleton state: re-init reuses one controller so duplicate timers /
       listeners can never race each other. */
    var st = section._hero || (section._hero = { bound: false, gen: 0, timer: null, current: 0, paused: false });
    st.gen += 1;
    var myGen = st.gen;
    if (st.timer) { try { clearInterval(st.timer); } catch (e) {} st.timer = null; }
    /* Never start autoplay on the loading placeholder — wait for the real
       slide DOM delivered via hero:updated. */
    var box = section.querySelector('.hero__slides');
    if (!box || box.querySelector('.hero__loading') || box.getAttribute('data-hero-loading') === '1') return;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var interval = 5000;
    function liveSlides() { return section.querySelectorAll('.hero__slide'); }
    function liveDots() { return section.querySelectorAll('.hero__dot'); }
    function alive() { return section._hero && section._hero.gen === myGen; }

    /* Enforce exactly one active slide/dot — markup may carry stale state
       (e.g. persisted mid-transition), which would otherwise stack slides. */
    (function normalize() {
      var slides = liveSlides(), dots = liveDots(), i, found = -1;
      if (slides.length < 2) return;
      for (i = 0; i < slides.length; i++) {
        if (slides[i].classList.contains('is-active')) { if (found < 0) found = i; }
      }
      /* Preserve index across re-renders when valid, else start at 0. */
      var want = (st.current >= 0 && st.current < slides.length) ? st.current : 0;
      st.current = found >= 0 ? found : want;
      for (i = 0; i < slides.length; i++) slides[i].classList.toggle('is-active', i === st.current);
      dots.forEach(function (d, i) {
        var on = i === st.current;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    })();

    function goTo(index) {
      if (!alive()) return;
      var slides = liveSlides(), dots = liveDots();
      var total = slides.length;
      if (!total) return;
      var nextIdx = ((typeof index === 'number' ? index : st.current) + total) % total;
      if (nextIdx === st.current) {
        /* Still enforce singularity (a stray class could have been added). */
        for (var k = 0; k < slides.length; k++) slides[k].classList.toggle('is-active', k === st.current);
        return;
      }
      st.current = nextIdx;
      /* Atomic switch: clear ALL first, then activate exactly one. */
      var i;
      for (i = 0; i < slides.length; i++) slides[i].classList.remove('is-active');
      for (i = 0; i < dots.length; i++) { dots[i].classList.remove('is-active'); dots[i].setAttribute('aria-selected', 'false'); }
      slides[st.current].classList.add('is-active');
      if (dots[st.current]) { dots[st.current].classList.add('is-active'); dots[st.current].setAttribute('aria-selected', 'true'); }
      resetTimer();
    }

    function next() { goTo(st.current + 1); }
    function prev() { goTo(st.current - 1); }

    function startTimer() {
      stopTimer();
      if (!alive()) return;
      if (reducedMotion || st.paused) return;
      if (liveSlides().length < 2) return;
      st.timer = setInterval(function () { if (alive()) next(); }, interval);
    }

    function stopTimer() {
      if (st.timer) { try { clearInterval(st.timer); } catch (e) {} st.timer = null; }
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    /* Bind static listeners exactly once — re-init must not duplicate them. */
    if (!st.bound) {
      st.bound = true;
      /* Navigation (delegated so re-rendered buttons keep working) */
      section.addEventListener('click', function (e) {
        var t = e.target && e.target.closest ? e.target.closest('.hero__nav--prev,.hero__nav--next,.hero__dot') : null;
        if (!t || !section.contains(t)) return;
        if (t.classList.contains('hero__nav--prev')) { e.stopPropagation(); prev(); }
        else if (t.classList.contains('hero__nav--next')) { e.stopPropagation(); next(); }
        else if (t.classList.contains('hero__dot')) {
          var idx = parseInt(t.getAttribute('data-dot'), 10);
          if (!isNaN(idx)) goTo(idx);
        }
      });

    /* Pause on hover / focus */
    section.addEventListener('mouseenter', function() { st.paused = true; stopTimer(); });
    section.addEventListener('mouseleave', function() { st.paused = false; startTimer(); });
    section.addEventListener('focusin', function() { st.paused = true; stopTimer(); });
    section.addEventListener('focusout', function(e) {
      if (!section.contains(e.relatedTarget)) { st.paused = false; startTimer(); }
    });

    /* Touch swipe support */
    var touchStartX = 0;
    var touchEndX = 0;
    section.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    section.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next(); else prev();
      }
    }, { passive: true });

    /* Keyboard support */
    section.setAttribute('tabindex', '0');
    section.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') { next(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { prev(); e.preventDefault(); }
    });
    } /* end bind-once */

    /* Start (single timer; stale generations are dead) */
    startTimer();
    section._heroCleanup = function(){ stopTimer(); };
  }
  if (!window.__heroUpdatedBound) { window.__heroUpdatedBound = true; document.addEventListener('hero:updated', function(){ initHeroSlideshow(); }); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ initHeroSlideshow(); });
  } else {
    initHeroSlideshow();
  }
})();
