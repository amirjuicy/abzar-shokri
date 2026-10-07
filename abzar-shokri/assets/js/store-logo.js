/* ================================================================
   Abzar Shokri — Store Logo (single source of truth, storefront)

   The ONLY editable logo value is the `store.logo` setting in the
   canonical settings table (Admin → اطلاعات فروشگاه). This module is
   the single place that turns that value into markup, so every shell
   (desktop header, mobile header, footer, page loader, auth pages,
   checkout steps, offline/PWA) renders the same logo without each
   page needing its own copy of the logic.

    Contract
    --------
    • Any element marked `data-store-logo` is filled with an <img> of
      the saved logo, or with the bundled bolt SVG when nothing is saved
      (the current logo stays the fallback).
    • The original logo is a yellow badge: the slot container carries the
      yellow background/gradient with the bolt SVG inside. While a custom
      logo is saved the slot is marked `store-logo--custom`, which strips
      that badge chrome completely (the old logo never shows through behind
      the image); removing the logo unmarks the slot and the original
      yellow/bolt rendering is restored exactly.
   • `data-store-logo="name"` / `="sub"` also keep the text brand parts
     untouched, so the existing lockups keep their wording.
   • The browser favicon and the PWA app icons are DERIVED from the same
     setting - no separate logo/icon setting exists.
   • Safe to call repeatedly and safe on pages that never load
     icons.js (checkout steps, offline page): the fallback SVG is
     inlined here rather than depended upon.
   ================================================================ */
(function (global) {
  'use strict';

  // Kept in sync with Icons.flash so the pre-upload appearance is unchanged
  // on pages that do not load assets/js/icons.js.
  var FALLBACK_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';

  // Derived icon paths. These files are produced from `store.logo` on save;
  // when they are absent we keep the bundled bolt icons so the favicon never
  // turns into a broken image.
  var ICON_BASE = 'assets/images/uploads/store/';
  var ICON_SIZES = [32, 180, 192, 512];

  var current = { logo: '', applied: false };

  function doc() { return document; }

  /* Slot styling is injected from here so every shell - including the ones that
     never load a shared stylesheet bundle - renders an uploaded logo the same
     way. The existing <svg> fallback is deliberately NOT restyled, so a site
     with no saved logo looks exactly as it did before. */
  function injectStyles() {
    var d = doc();
    if (!d.head || d.getElementById('store-logo-style')) return;
    var st = d.createElement('style');
    st.id = 'store-logo-style';
    st.textContent = [
      '[data-store-logo]{display:inline-flex;align-items:center;justify-content:center}',
      '[data-store-logo] > img.store-logo__img{width:100%;height:100%;object-fit:contain;display:block}',
      /* The original logo is a yellow badge: the slot container itself carries
         the yellow background/gradient (+ shadow on some shells) with the bolt
         SVG inside. A custom logo must replace that rendering completely, so
         the badge chrome is stripped (incl. inline styles, via !important)
         while the custom logo is active and restored with it when removed. */
      '[data-store-logo].store-logo--custom{background:none!important;box-shadow:none!important}',
      '.mobile-header__brand{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto;text-decoration:none;color:inherit}',
      '.mobile-header__logo{width:32px;height:32px;flex:0 0 32px;display:inline-flex;align-items:center;justify-content:center}',
      '.mobile-header__logo svg{width:20px;height:20px}',
      '.mobile-header__brand-name{font-weight:var(--font-weight-black,800);font-size:15px;white-space:nowrap;color:var(--text-primary,#111)}',
      '@media (max-width:400px){.mobile-header__brand-name{display:none}}',
    ].join('');
    d.head.appendChild(st);
  }

  function fallbackSvg() {
    return (global.Icons && global.Icons.flash) ? global.Icons.flash : FALLBACK_SVG;
  }

  /* Resolve a settings value into a usable URL. Settings may hold a root
     relative path ("/assets/images/...") or a page relative one
     ("assets/images/...") depending on how the file was picked; normalise
     both so every page resolves the same asset. */
  function resolveUrl(raw) {
    var v = String(raw == null ? '' : raw).trim();
    if (!v) return '';
    if (/^(https?:)?\/\//i.test(v) || v.charAt(0) === '/') return v;
    if (/^(data:|blob:)/i.test(v)) return v;
    return v;
  }

  function logoImgHtml(logo) {
    return '<img class="store-logo__img" src="' + escapeAttr(logo) + '" alt="" ' +
      'onerror="this.outerHTML=window.StoreLogo.fallbackSvg()">';
  }

  function escapeAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fillTargets(logo) {
    var nodes = doc().querySelectorAll('[data-store-logo]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      // The custom logo replaces the original yellow/bolt rendering itself:
      // mark the slot so the badge chrome is stripped, or unmark it so the
      // original badge + bolt come back exactly when the logo is removed.
      if (logo) el.classList.add('store-logo--custom');
      else el.classList.remove('store-logo--custom');
      var want = logo ? logoImgHtml(logo) : fallbackSvg();
      // Only rewrite when the resolved logo actually changed, so we do not
      // fight with re-renders that rebuild the same markup.
      var sig = logo ? 'img:' + logo : 'svg';
      if (el.getAttribute('data-store-logo-src') === sig) continue;
      el.setAttribute('data-store-logo-src', sig);
      el.innerHTML = want;
    }
  }

  /* Favicon + touch icon. Sizes that have a derived file use it, the rest
     keep pointing at the bundled bolt icons. */
  function fillIcons(logo) {
    var head = doc().head;
    if (!head) return;
    var hasDerived = !!logo;
    var setLinks = function () {
      var fav32 = head.querySelector('link[data-store-icon="32"]') ||
        head.querySelector('link[rel="icon"][sizes="32x32"]');
      var fav16 = head.querySelector('link[data-store-icon="16"]') ||
        head.querySelector('link[rel="icon"][sizes="16x16"]');
      var touch = head.querySelector('link[data-store-icon="180"]') ||
        head.querySelector('link[rel="apple-touch-icon"]');
      if (fav32) {
        if (hasDerived) { fav32.setAttribute('href', ICON_BASE + 'icon-32.png?v=' + stamp()); }
        else { fav32.setAttribute('href', 'assets/icons/favicon-32.png'); }
        mark(fav32, '32', hasDerived);
      }
      if (fav16) {
        if (hasDerived) { fav16.setAttribute('href', ICON_BASE + 'icon-32.png?v=' + stamp()); }
        else { fav16.setAttribute('href', 'assets/icons/favicon-16.png'); }
        mark(fav16, '16', hasDerived);
      }
      if (touch) {
        if (hasDerived) { touch.setAttribute('href', ICON_BASE + 'icon-180.png?v=' + stamp()); }
        else { touch.setAttribute('href', 'assets/icons/apple-touch-icon.png'); }
        mark(touch, '180', hasDerived);
      }
    };
    function mark(el, size, derived) {
      el.setAttribute('data-store-icon', size);
      if (derived) el.setAttribute('data-store-derived', '1');
      else el.removeAttribute('data-store-derived');
    }
    function stamp() { return String(Date.now()); }
    setLinks();
    // The manifest link is intentionally left as-is: /manifest.webmanifest is
    // generated server-side from the same store.logo + store.name, so the PWA
    // installer already sees the saved logo without a second source here.
  }

  function apply(settings) {
    if (!settings) return;
    try { injectStyles(); } catch (_) {}
    var logo = resolveUrl(settings['store.logo']);
    current.logo = logo;
    current.applied = true;
    try { global.__storeLogo = logo; } catch (_) {}
    try { fillTargets(logo); } catch (_) {}
    try { fillIcons(logo); } catch (_) {}
  }

  function get() { return current.logo; }

  /* Fetch + apply. Only used by shells that never fetch settings themselves;
     every shell that renders a logo slot already calls apply() with the
     settings it fetched, so this is not part of the normal page load path. */
  function load() {
    if (location.protocol === 'file:' || typeof fetch !== 'function') return Promise.resolve(null);
    return fetch('/api/settings', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) { if (s) apply(s); return s; })
      .catch(function () { return null; });
  }

  global.StoreLogo = {
    apply: apply,
    load: load,
    get: get,
    fallbackSvg: fallbackSvg,
    resolveUrl: resolveUrl,
    injectStyles: injectStyles,
    ICON_BASE: ICON_BASE,
    ICON_SIZES: ICON_SIZES,
  };

  if (doc().readyState === 'loading') {
    doc().addEventListener('DOMContentLoaded', function () { injectStyles(); });
  } else {
    injectStyles();
  }
})(window);
