/* ================================================================
   Abzar Shokri — Admin Homepage (مدیریت صفحه اصلی)
   Edits homepage sections stored in the existing site_content
   table via GET/PUT /api/content (same keys the storefront
   common.js applies dynamically): hero slider, promo banners,
   featured categories/products, amazing discounts, section
   titles, order and per-section enable/disable.
   ================================================================ */
(function () {
  'use strict';
  var root = document.querySelector('section[data-view="home"]');
  if (!root) return;

  var SECTIONS = [
    { key: 'hero', name: 'اسلایدر اصلی', hasTitle: false },
    { key: 'categories', name: 'دسته‌های ویژه', hasTitle: true, titleKey: 'section.categories.title' },
    { key: 'bestsellers', name: 'محصولات ویژه', hasTitle: true, titleKey: 'section.bestsellers.title' },
    { key: 'amazing', name: 'تخفیف‌های شگفت‌انگیز', hasTitle: true, titleKey: 'section.offers.title' },
    { key: 'new', name: 'جدیدترین محصولات', hasTitle: true, titleKey: 'section.new.title' },
    { key: 'brands', name: 'برندهای محبوب', hasTitle: true, titleKey: 'section.brands.title' }
  ];

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function toast(m, t) { if (window.AbzarAdmin && window.AbzarAdmin.showToast) window.AbzarAdmin.showToast(m, t); }
  function token() {
    try { var s = JSON.parse(localStorage.getItem('as_admin_session') || 'null'); return (s && s.token) || ''; }
    catch (e) { return ''; }
  }
  function api(path, opts) {
    var h = { 'Content-Type': 'application/json' };
    var t = token();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return fetch('/api' + path, Object.assign({ headers: h }, opts || {})).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok) throw new Error((data && data.error) || ('Request failed ' + res.status));
        return data;
      });
    });
  }

  var content = {};
  var order = ['hero', 'categories', 'bestsellers', 'amazing', 'new', 'brands'];
  var categories = [];
  var products = [];

  function enabledOf(key) { return String(content['home.sections.' + key + '.enabled'] || '1') === '1'; }
  function titleOf(sec) { return content[sec.titleKey] != null ? content[sec.titleKey] : ''; }

  /* ── Sections (title / order / enable) ─────────────────── */
  function renderSections() {
    var list = $('#home-sections-list');
    if (!list) return;
    list.innerHTML = order.map(function (key, i) {
      var sec = SECTIONS.filter(function (s) { return s.key === key; })[0];
      if (!sec) return '';
      var on = enabledOf(key);
      return '<div class="adm-switch-row" data-home-sec="' + esc(key) + '">'
        + '<div class="adm-switch-row__meta">'
        + '<span class="adm-switch-row__title">' + esc(sec.name) + '</span>'
        + (sec.hasTitle
          ? '<input class="input" data-home-title="' + esc(key) + '" value="' + esc(titleOf(sec)) + '" placeholder="عنوان بخش" style="margin-top:6px;max-width:320px">'
          : '<span class="adm-switch-row__desc">اسلایدهای بنر اصلی</span>')
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px">'
        + '<button type="button" class="adm-btn-icon" data-home-move="' + esc(key) + '|-1" title="بالا" ' + (i === 0 ? 'disabled' : '') + '><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg></button>'
        + '<button type="button" class="adm-btn-icon" data-home-move="' + esc(key) + '|1" title="پایین" ' + (i === order.length - 1 ? 'disabled' : '') + '><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>'
        + '<label class="adm-switch"><input type="checkbox" data-home-enabled="' + esc(key) + '"' + (on ? ' checked' : '') + '><span class="adm-switch__track"></span></label>'
        + '</div></div>';
    }).join('');
  }

  function collectSections() {
    var payload = {};
    order.forEach(function (key) {
      var en = $('[data-home-enabled="' + key + '"]');
      payload['home.sections.' + key + '.enabled'] = en && en.checked ? '1' : '0';
      var sec = SECTIONS.filter(function (s) { return s.key === key; })[0];
      if (sec && sec.hasTitle) {
        var ti = $('[data-home-title="' + key + '"]');
        if (ti) payload[sec.titleKey] = ti.value.trim();
      }
    });
    payload['home.sections.order'] = order.join(',');
    return payload;
  }

  /* ── Hero / banners ────────────────────────────────────── */
  function fillHeroBanners() {
    for (var i = 1; i <= 4; i++) {
      ['badge', 'title', 'text', 'image'].forEach(function (f) {
        var el = document.getElementById('home-hero-' + i + '-' + f);
        if (el && content['hero.slide' + i + '.' + f] != null) el.value = content['hero.slide' + i + '.' + f];
      });
      var pv = document.getElementById('home-hero-' + i + '-preview');
      if (pv) pv.src = content['hero.slide' + i + '.image'] || '';
    }
    for (var j = 1; j <= 3; j++) {
      var p = document.getElementById('home-promo-' + j);
      if (p && content['promo.topbar.' + j] != null) p.value = content['promo.topbar.' + j];
    }
    var tb = document.getElementById('home-topbar-enabled');
    if (tb) tb.checked = String(content['home.topbar.enabled'] || '1') === '1';
  }
  function collectHero() {
    var out = {};
    for (var i = 1; i <= 4; i++) {
      ['badge', 'title', 'text', 'image'].forEach(function (f) {
        var el = document.getElementById('home-hero-' + i + '-' + f);
        if (el) out['hero.slide' + i + '.' + f] = el.value.trim();
      });
    }
    return out;
  }
  // live preview when image URL edited
  document.addEventListener('input', function(e){
    var id=e.target.id||''; var m=id.match(/^home-hero-(\d)-image$/); if(m){ var pv=document.getElementById('home-hero-'+m[1]+'-preview'); if(pv) pv.src=e.target.value.trim(); }
  });
  function collectBanners() {
    var out = {};
    for (var j = 1; j <= 3; j++) {
      var p = document.getElementById('home-promo-' + j);
      if (p) out['promo.topbar.' + j] = p.value.trim();
    }
    var tb = document.getElementById('home-topbar-enabled');
    out['home.topbar.enabled'] = tb && tb.checked ? '1' : '0';
    return out;
  }

  /* ── Featured selections ───────────────────────────────── */
  function slugList(key) {
    return String(content[key] || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function renderCats() {
    var box = $('#home-feat-cats');
    if (!box) return;
    var sel = slugList('home.featured.categories');
    if (!categories.length) { box.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">دسته‌ای یافت نشد.</p>'; return; }
    box.innerHTML = categories.map(function (c) {
      var on = !sel.length || sel.indexOf(c.slug) !== -1;
      return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 0;border-bottom:1px dashed var(--border-color-light)">'
        + '<input type="checkbox" data-home-cat="' + esc(c.slug) + '"' + (on ? ' checked' : '') + '> ' + esc(c.name) + '</label>';
    }).join('');
  }
  function productCheckRow(p, attr, sel) {
    var slug = p.slug || p.slug === 0 ? p.slug : '';
    var key = String(p.slug || p.id || '');
    var on = !sel.length || sel.indexOf(key) !== -1;
    var name = p.name || ('#' + p.id);
    return '<label data-home-prow style="display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 0;border-bottom:1px dashed var(--border-color-light)" data-search="' + esc((name + ' ' + key).toLowerCase()) + '">'
      + '<input type="checkbox" ' + attr + '="' + esc(key) + '"' + (on ? ' checked' : '') + '> ' + esc(name)
      + ' <span class="adm-table__sub" style="direction:ltr">' + esc(key) + '</span></label>';
  }
  function renderProducts() {
    var sel = slugList('home.featured.products');
    var box = $('#home-feat-prods');
    if (box) {
      box.innerHTML = products.length ? products.map(function (p) { return productCheckRow(p, 'data-home-prod', sel); }).join('')
        : '<p style="font-size:13px;color:var(--text-muted)">محصولی یافت نشد.</p>';
    }
    var asel = slugList('home.amazing.products');
    var abox = $('#home-amaz-prods');
    if (abox) {
      abox.innerHTML = products.length ? products.map(function (p) { return productCheckRow(p, 'data-home-amaz', asel); }).join('')
        : '<p style="font-size:13px;color:var(--text-muted)">محصولی یافت نشد.</p>';
    }
  }
  function collectChecked(attr) {
    return $$('[' + attr + ']').filter(function (cb) { return cb.checked; }).map(function (cb) { return cb.getAttribute(attr); });
  }
  function fillAmazing() {
    var ends = document.getElementById('home-amaz-ends');
    if (ends) {
      var v = String(content['home.amazing.ends_at'] || '').trim();
      try {
        if (v) {
          var d = new Date(v);
          if (isFinite(d.getTime())) {
            var p = function (n) { return String(n).padStart(2, '0'); };
            ends.value = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
          }
        }
      } catch (e) {}
    }
  }

  function save(payload, btn) {
    if (btn) btn.disabled = true;
    api('/content', { method: 'PUT', body: JSON.stringify(payload) }).then(function (c) {
      content = c || content;
      renderSections();
      toast('تنظیمات صفحه اصلی ذخیره شد', 'success');
    }).catch(function (err) {
      toast(err.message || 'خطا در ذخیره تنظیمات', 'danger');
    }).finally(function () { if (btn) btn.disabled = false; });
  }

  /* ── Events ────────────────────────────────────────────── */
  root.addEventListener('click', function (e) {
    var mv = e.target.closest ? e.target.closest('[data-home-move]') : null;
    if (mv) {
      var parts = mv.getAttribute('data-home-move').split('|');
      var idx = order.indexOf(parts[0]);
      var j = idx + parseInt(parts[1], 10);
      if (idx > -1 && j >= 0 && j < order.length) {
        // Persist current inputs before re-render.
        var draft = collectSections();
        Object.keys(draft).forEach(function (k) {
          if (k !== 'home.sections.order') content[k] = draft[k];
        });
        order.splice(j, 0, order.splice(idx, 1)[0]);
        renderSections();
      }
      return;
    }
    var sv = e.target.closest ? e.target.closest('[data-home-save]') : null;
    if (sv) {
      var which = sv.getAttribute('data-home-save');
      if (which === 'sections') save(collectSections(), sv);
      else if (which === 'hero') save(collectHero(), sv);
      else if (which === 'banners') save(collectBanners(), sv);
      else if (which === 'cats') save({ 'home.featured.categories': collectChecked('data-home-cat').join(',') }, sv);
      else if (which === 'featured') save({ 'home.featured.products': collectChecked('data-home-prod').join(',') }, sv);
      else if (which === 'amazing') {
        var ends = document.getElementById('home-amaz-ends');
        var out = { 'home.amazing.products': collectChecked('data-home-amaz').join(',') };
        out['home.amazing.ends_at'] = ends && ends.value ? new Date(ends.value).toISOString() : '';
        save(out, sv);
      }
    }
  });
  ['home-feat-search', 'home-amaz-search'].forEach(function (id) {
    var inp = document.getElementById(id);
    if (!inp) return;
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase();
      var box = document.getElementById(id === 'home-feat-search' ? 'home-feat-prods' : 'home-amaz-prods');
      if (!box) return;
      $$('[data-home-prow]', box).forEach(function (row) {
        row.style.display = !q || (row.getAttribute('data-search') || '').indexOf(q) !== -1 ? '' : 'none';
      });
    });
  });

  /* ── Init ──────────────────────────────────────────────── */
  Promise.all([
    api('/content').catch(function () { return null; }),
    api('/categories').catch(function () { return []; }),
    api('/products?limit=200').catch(function () { return []; })
  ]).then(function (r) {
    if (r[0]) {
      content = r[0];
      var o = String(content['home.sections.order'] || '').split(',').map(function (x) { return x.trim(); }).filter(function (k) {
        return SECTIONS.some(function (s) { return s.key === k; });
      });
      if (o.length) {
        SECTIONS.forEach(function (s) { if (o.indexOf(s.key) === -1) o.push(s.key); });
        order = o;
      }
    }
    if (Array.isArray(r[1])) categories = r[1].map(function (c) { return { slug: c.slug, name: c.name }; });
    if (Array.isArray(r[2])) products = r[2];
    renderSections();
    fillHeroBanners();
    renderCats();
    renderProducts();
    fillAmazing();
  });
})();
