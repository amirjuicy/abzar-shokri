/* Abzar Shokri — Service Worker (basic offline / app-shell)
 *
 * Installability contract (checked in Chrome DevTools → Application):
 * - This file MUST live next to index.html (the site root OR the
 *   deployed subfolder — all URLs below are relative so both work).
 * - It MUST be registered with scope "./" (resolved against the page,
 *   i.e. the folder this file lives in) so it controls every route
 *   (manifest start_url "./index.html" is inside that scope, same origin).
 * - It MUST expose a `fetch` handler (required for the install prompt).
 * - Relative URLs keep the PWA installable when the site is hosted in
 *   a subfolder; absolute "/..." paths would 404 there and break
 *   installability (browser falls back to a plain shortcut).
 */
'use strict';

// v12: assets/js/checkout.js now shares the Add-Address province/city source
// (window.IranCities). Static assets are cache-first, so the version bump is
// required for browsers holding the old checkout.js to pick up the fix.
// v13: Checkout Province/City selectors now reuse the exact Add Address
// custom-dropdown implementation (checkout.html/js + pages.css).
// v14: API responses (/api/*) are network-only — serving them cache-first
// returned stale data (e.g. an old empty GET /api/cart) and broke checkout.
// v15: account dashboard notifications (App.listNotifications + #ac-notifs
// in account.js) were stuck behind the cache-first app-shell: browsers that
// had visited before kept the old account.js/common.js forever and never
// displayed admin-created notifications. Version bump forces re-fetch.
// v16: storefront notification center (header bell + panel + new-item popup
// in common.js, header.css, components.css). Bump so cached shells pick it up.
// v17: dead Bearer token (expired/wiped) auto-recovers to a clean logged-out
// state with a re-login link instead of a stuck "Not authenticated" error;
// plus a stale-repaint guard in the account dashboard.
// v18: dedicated notifications page (account-notifications.html) + «اعلان‌ها»
// sidebar item + «مشاهده بیشتر/همه» links route to it.
// v23: admin accounts stay signed in on the storefront (isAdminSession) and get
// the admin-only «ورود به پنل مدیریت» account link. Bump so cached shells pick it up.
// v24: admin Hero Slider loader hardened (null-safe init, no-store initial
// fetch with retry + explicit error instead of an endless loading
// placeholder). Bump so persistent clients drop stale caches (including any
// stale admin-hero-slides.js) and pick up the fixed loader.
var CACHE_NAME = 'abzar-shokri-v26';
var OFFLINE_URL = 'offline.html';

var APP_SHELL = [
  './',
  'index.html',
  'offline.html',
  'manifest.webmanifest',
  'assets/css/design-system.css',
  'assets/css/base.css',
  'assets/css/components.css',
  'assets/css/header.css',
  'assets/css/footer.css',
  'assets/css/homepage.css',
  'assets/css/desktop.css',
  'assets/css/pages.css',
  'assets/css/pwa.css',
  'assets/js/data.js',
  'assets/js/icons.js',
  'assets/js/common.js',
  'assets/js/account.js',
  'assets/css/account.css',
  'assets/js/pwa.js',
  'assets/data/iran-cities.json',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-192.png',
  'assets/icons/maskable-512.png',
  'assets/icons/icon.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    }).catch(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_NAME) return caches.delete(key);
        return Promise.resolve(false);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept') &&
      request.headers.get('accept').indexOf('text/html') !== -1);
}

// HTML documents must always be network-first — even when fetched as a
// subresource (fetch/XHR with Accept: */*). Otherwise a page saved through
// the Visual Builder (PUT /api/admin/static-pages/...) stays stale in the
// cache-first static branch and the edit looks lost after reload.
function isHtmlDocument(request, url) {
  if (isNavigationRequest(request)) return true;
  if (request.method !== 'GET') return false;
  var p;
  try { p = url.pathname.toLowerCase(); } catch (e) { return false; }
  return p === '/' || p.charAt(p.length - 1) === '/' || p.slice(-5) === '.html';
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  // API responses must always come from the network. Serving them cache-first
  // returned stale data (e.g. an old empty GET /api/cart), which wiped the
  // buyer's valid local cart during checkout sync.
  if (url.pathname.indexOf('/api/') === 0) return;

  // Navigations and HTML documents: network-first, then cache, then offline page.
  if (isHtmlDocument(request, url)) {
    event.respondWith(
      fetch(request).then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
        return response;
      }).catch(function () {
        return caches.match(request, { ignoreSearch: true }).then(function (cached) {
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // Static assets: cache-first, update cache in background.
  event.respondWith(
    caches.match(request, { ignoreSearch: false }).then(function (cached) {
      var network = fetch(request).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
