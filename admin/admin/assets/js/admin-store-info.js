/* ================================================================
   Abzar Shokri — Admin Store Info (centralized identity/contact)
   The ONLY place store identity/contact values are editable:
     store.name, store.phone, store.phone2, store.email,
     store.address, store.map_url, store.hours, store.hours_detail,
     store.website, store.desc,
     store.social_telegram, store.social_instagram, store.social_twitter,
     store.social_youtube (footer social links)
   Persists via PUT /api/settings (SQLite `settings` table).
   Mirrors values read-only into Settings (s-*) and Content
   (c-footer-*) so no other Admin section can override them.
   ================================================================ */
(function () {
  'use strict';

  var API_BASE = '/api';

  function $(sel) { return document.querySelector(sel); }
  function toast(msg, type) {
    if (window.AbzarAdmin && window.AbzarAdmin.showToast) window.AbzarAdmin.showToast(msg, type);
  }
  function adminToken() {
    try {
      var s = JSON.parse(localStorage.getItem('as_admin_session') || 'null');
      return (s && s.token) || '';
    } catch (e) { return ''; }
  }
  async function api(path, opts) {
    var headers = { 'Content-Type': 'application/json' };
    var t = adminToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    var res = await fetch(API_BASE + path, Object.assign({ headers: headers }, opts || {}));
    var data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    return data;
  }

  var F = {
    name: function () { return $('#si-name'); },
    phone: function () { return $('#si-phone'); },
    phone2: function () { return $('#si-phone2'); },
    email: function () { return $('#si-email'); },
    website: function () { return $('#si-website'); },
    address: function () { return $('#si-address'); },
    mapUrl: function () { return $('#si-map-url'); },
    hours: function () { return $('#si-hours'); },
    hoursDetail: function () { return $('#si-hours-detail'); },
    desc: function () { return $('#si-desc'); },
    socialTelegram: function () { return $('#si-social-telegram'); },
    socialInstagram: function () { return $('#si-social-instagram'); },
    socialTwitter: function () { return $('#si-social-twitter'); },
    socialYouTube: function () { return $('#si-social-youtube'); }
  };

  /* Read-only mirrors in other Admin sections (never editable there). */
  function mirrorReadOnly(s) {
    try {
      var set = function (id, v) { var el = document.getElementById(id); if (el && v !== undefined) el.value = v; };
      set('s-name', s['store.name'] || '');
      set('s-phone', s['store.phone'] || '');
      set('s-email', s['store.email'] || '');
      set('s-address', s['store.address'] || '');
      set('s-desc', s['store.desc'] || '');
      set('c-footer-brand-desc', s['store.desc'] || '');
      set('c-footer-address', s['store.address'] || '');
      // The Admin shell brand follows the same single source.
      if (s['store.name']) {
        document.querySelectorAll('.admin-sidebar__name').forEach(function (el) { el.textContent = s['store.name']; });
        try { if (window.AbzarAdmin && window.AbzarAdmin.reloadBrand) window.AbzarAdmin.reloadBrand(); } catch (e) {}
      }
    } catch (e) {}
  }

  function applySettings(s) {
    if (F.name()) F.name().value = s['store.name'] || '';
    if (F.phone()) F.phone().value = s['store.phone'] || '';
    if (F.phone2()) F.phone2().value = s['store.phone2'] || '';
    if (F.email()) F.email().value = s['store.email'] || '';
    if (F.website()) F.website().value = s['store.website'] || '';
    if (F.address()) F.address().value = s['store.address'] || '';
    if (F.mapUrl()) F.mapUrl().value = s['store.map_url'] || '';
    if (F.hours()) F.hours().value = s['store.hours'] || '';
    if (F.hoursDetail()) F.hoursDetail().value = s['store.hours_detail'] || '';
    if (F.desc()) F.desc().value = s['store.desc'] || '';
    if (F.socialTelegram()) F.socialTelegram().value = s['store.social_telegram'] || '';
    if (F.socialInstagram()) F.socialInstagram().value = s['store.social_instagram'] || '';
    if (F.socialTwitter()) F.socialTwitter().value = s['store.social_twitter'] || '';
    if (F.socialYouTube()) F.socialYouTube().value = s['store.social_youtube'] || '';
    mirrorReadOnly(s);
  }

  async function load() {
    try {
      applySettings(await api('/settings'));
    } catch (e) { /* keep empty; offline fallback */ }
  }

  function busy(btn, fn) {
    return async function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      btn.disabled = true;
      try { await fn(); }
      catch (err) { toast(err.message || 'ذخیره ناموفق بود', 'danger'); }
      finally { btn.disabled = false; }
    };
  }

  var form = $('#adm-store-info-form');
  if (form) form.addEventListener('submit', busy(
    form.querySelector('[type="submit"]') || form,
    async function () {
      var name = F.name() ? F.name().value.trim() : '';
      var phone = F.phone() ? F.phone().value.trim() : '';
      var email = F.email() ? F.email().value.trim() : '';
      var address = F.address() ? F.address().value.trim() : '';
      if (!name) { toast('نام فروشگاه الزامی است', 'danger'); F.name().focus(); return; }
      if (!phone) { toast('تلفن اصلی الزامی است', 'danger'); F.phone().focus(); return; }
      if (!address) { toast('آدرس الزامی است', 'danger'); F.address().focus(); return; }
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        toast('ایمیل معتبر نیست', 'danger'); F.email().focus(); return;
      }
      /* Footer social links: optional, but any value must be an http(s) URL. */
      var socialFields = [
        [F.socialTelegram(), 'store.social_telegram', 'تلگرام'],
        [F.socialInstagram(), 'store.social_instagram', 'اینستاگرام'],
        [F.socialTwitter(), 'store.social_twitter', 'X (توییتر)'],
        [F.socialYouTube(), 'store.social_youtube', 'یوتیوب']
      ];
      var socialPayload = {};
      for (var si = 0; si < socialFields.length; si++) {
        var socEl = socialFields[si][0];
        var socVal = socEl ? socEl.value.trim() : '';
        if (socVal && !/^https?:\/\//i.test(socVal)) {
          toast('لینک ' + socialFields[si][2] + ' معتبر نیست (باید با http:// یا https:// شروع شود)', 'danger');
          if (socEl) socEl.focus();
          return;
        }
        socialPayload[socialFields[si][1]] = socVal;
      }
      var saved = await api('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          'store.name': name,
          'store.phone': phone,
          'store.phone2': F.phone2() ? F.phone2().value.trim() : '',
          'store.email': email,
          'store.website': F.website() ? F.website().value.trim() : '',
          'store.address': address,
          'store.map_url': F.mapUrl() ? F.mapUrl().value.trim() : '',
          'store.hours': F.hours() ? F.hours().value.trim() : '',
          'store.hours_detail': F.hoursDetail() ? F.hoursDetail().value.trim() : '',
          'store.desc': F.desc() ? F.desc().value.trim() : '',
          'store.social_telegram': socialPayload['store.social_telegram'],
          'store.social_instagram': socialPayload['store.social_instagram'],
          'store.social_twitter': socialPayload['store.social_twitter'],
          'store.social_youtube': socialPayload['store.social_youtube']
        })
      });
      applySettings(saved);
      /* Keep legacy loaders in sync (admin.js Settings form). */
      try { if (window.AbzarAdminSettings && window.AbzarAdminSettings.reload) window.AbzarAdminSettings.reload(); } catch (_) {}
      toast('اطلاعات فروشگاه با موفقیت ذخیره شد', 'success');
    }
  ));

  /* Block any legacy write path for store.* outside this section:
     the Settings «اطلاعات فروشگاه» form is read-only (no submit button
     anymore — only a link here), but guard devtools-enabled submits too. */
  document.addEventListener('submit', function (e) {
    var t = e.target;
    if (t && t.hasAttribute && t.hasAttribute('data-settings-form')) {
      var idx = Array.prototype.indexOf.call(document.querySelectorAll('form[data-settings-form]'), t);
      if (idx === 0) {
        e.preventDefault();
        e.stopPropagation();
        toast('این مقادیر فقط از بخش اطلاعات فروشگاه قابل ویرایش است', 'warning');
        try {
          var link = document.querySelector('a[href="#/store-info"]');
          if (link) link.focus();
        } catch (_) {}
      }
    }
  }, true);

  /* Refresh mirrors when the Content/Settings views are shown. */
  try {
    var orig = window.AbzarAdmin && window.AbzarAdmin.showView;
    if (orig && !orig.__storeInfoHooked) {
      var wrapped = function (n) {
        orig(n);
        if (n === 'store-info' || n === 'settings' || n === 'content') load();
      };
      wrapped.__storeInfoHooked = true;
      window.AbzarAdmin.showView = wrapped;
    }
  } catch (_) {}
  window.addEventListener('hashchange', function () {
    try {
      var h = (location.hash || '').replace(/^#\/?/, '');
      if (h === 'store-info' || h === 'settings' || h === 'content') load();
    } catch (_) {}
  });

  load();
  window.AbzarAdminStoreInfo = { reload: load };
})();
