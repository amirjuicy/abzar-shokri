/* ================================================================
   Abzar Shokri — Admin Category Management
   Live backend (/api/categories) backed by SQLite. No mocks:
   list, counts, subcategories, search/filter, create, edit, delete
   all persist via the existing category APIs. Reuses the existing
   .adm-cat card markup; static HTML is replaced on load.
   ================================================================ */
(function () {
  'use strict';

  var API_BASE = '/api';
  var useApi = window.location.protocol === 'http:' || window.location.protocol === 'https:';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function toast(msg, type) {
    if (window.AbzarAdmin && window.AbzarAdmin.showToast) window.AbzarAdmin.showToast(msg, type);
  }
  function fa(n) { try { return Number(n || 0).toLocaleString('fa-IR'); } catch (e) { return String(n); } }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  var grid = $('#adm-cat-grid');
  var emptyEl = $('#adm-cat-empty');
  var searchInput = $('#adm-categories-search');
  var countMeta = $('#adm-categories-count');
  if (!grid) return;

  var categories = [];
  var deleteId = null;
  var busy = false;

  var EDIT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>';
  var DEL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  var FOLDER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  /* Category illustration assigned via the media gallery (image URL/path
     stored in c.icon); plain icon names keep the default folder glyph. */
  function catThumb(c) {
    var ic = c && c.icon;
    if (typeof ic === 'string' && /^(https?:|\/)/.test(ic)) {
      return '<img src="' + esc(ic) + '" alt="" loading="lazy" style="width:24px;height:24px;object-fit:contain">';
    }
    return FOLDER_SVG;
  }
  function syncIconPreview() {
    var inp = $('#adm-cm-icon'), prev = $('#adm-cm-icon-preview');
    if (!inp || !prev) return;
    var v = inp.value.trim();
    if (v) { prev.src = v; prev.style.visibility = 'visible'; }
    else { prev.removeAttribute('src'); prev.style.visibility = 'hidden'; }
  }

  function subNames(c) {
    if (Array.isArray(c.subcategories)) return c.subcategories.filter(Boolean).map(String);
    return [];
  }

  function filtered() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (!q) return categories;
    return categories.filter(function (c) {
      var hay = (c.name + ' ' + (c.slug || '') + ' ' + (c.description || '') + ' ' + subNames(c).join(' ')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function render() {
    var list = filtered();
    var max = categories.reduce(function (m, c) { return Math.max(m, Number(c.count) || 0); }, 0) || 1;
    if (!list.length) {
      grid.innerHTML = '';
      if (emptyEl) emptyEl.style.display = '';
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      grid.innerHTML = list.map(function (c) {
        var pct = Math.max(4, Math.round(((Number(c.count) || 0) / max) * 100));
        var subs = subNames(c).slice(0, 3).join('، ');
        return '<div class="adm-cat" data-id="' + c.id + '">' +
          '<span class="adm-cat__icon">' + catThumb(c) + '</span>' +
          '<div class="adm-cat__meta">' +
          '<span class="adm-cat__name">' + esc(c.name) + '</span>' +
          '<span class="adm-cat__count">' + fa(c.count || 0) + ' محصول' +
          (subs ? ' <span style="opacity:.75">• ' + esc(subs) + '</span>' : '') + '</span>' +
          '<span class="adm-cat__bar"><span style="width:' + pct + '%"></span></span>' +
          '</div>' +
          '<div class="adm-cat__actions">' +
          '<button type="button" class="adm-btn-icon" data-catedit="' + c.id + '" title="ویرایش">' + EDIT_SVG + '</button>' +
          '<button type="button" class="adm-btn-icon adm-btn-icon--danger" data-catdel="' + c.id + '" title="حذف">' + DEL_SVG + '</button>' +
          '</div></div>';
      }).join('');
    }
    if (countMeta) countMeta.textContent = 'نمایش ' + fa(list.length) + ' از ' + fa(categories.length) + ' دسته';
  }

  async function load() {
    if (!useApi) { render(); return; }
    try {
      var rows = await api('/categories');
      categories = Array.isArray(rows) ? rows : [];
    } catch (e) {
      useApi = false;
      toast('اتصال به سرور برقرار نشد؛ حالت فقط‌خواندن', 'danger');
    }
    render();
  }

  var modal = $('#adm-category-modal');
  var delModal = $('#adm-category-delete-modal');
  function openModal(m) { if (m) { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); } }
  function closeModal(m) { if (m) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); } }

  function openAdd() {
    $('#adm-category-form').reset();
    $('#adm-cm-id').value = '';
    $('#adm-cm-title').textContent = 'افزودن دسته';
    $('#adm-cm-submit').textContent = 'ذخیره دسته';
    syncIconPreview();
    openModal(modal);
  }
  function openEdit(id) {
    var c = categories.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!c) return;
    $('#adm-cm-id').value = c.id;
    $('#adm-cm-name').value = c.name || '';
    $('#adm-cm-slug').value = c.slug || '';
    $('#adm-cm-icon').value = c.icon || '';
    syncIconPreview();
    $('#adm-cm-desc').value = c.description || '';
    $('#adm-cm-subs').value = subNames(c).join('\n');
    $('#adm-cm-title').textContent = 'ویرایش دسته';
    $('#adm-cm-submit').textContent = 'به‌روزرسانی دسته';
    openModal(modal);
  }

  if (searchInput) searchInput.addEventListener('input', render);
  var iconInput = $('#adm-cm-icon');
  if (iconInput) iconInput.addEventListener('input', syncIconPreview);
  var addBtn = $('#adm-add-category-btn');
  if (addBtn) addBtn.addEventListener('click', function (e) { e.preventDefault(); openAdd(); });

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var eb = e.target.closest('[data-catedit]');
    if (eb) { e.preventDefault(); openEdit(eb.getAttribute('data-catedit')); return; }
    var db = e.target.closest('[data-catdel]');
    if (db) {
      e.preventDefault();
      deleteId = db.getAttribute('data-catdel');
      var c = categories.filter(function (x) { return String(x.id) === String(deleteId); })[0];
      $('#adm-cdel-text').textContent = c
        ? '«' + c.name + '» (' + fa(c.count || 0) + ' محصول) حذف شود؟' +
          ((Number(c.count) || 0) > 0 ? ' محصولات آن بدون دسته می‌شوند.' : ' این عمل قابل بازگشت نیست.')
        : 'آیا از حذف این دسته مطمئن هستید؟';
      openModal(delModal);
      return;
    }
    if (e.target.closest('[data-cm-close]')) closeModal(modal);
    if (e.target.closest('[data-cdel-close]')) { closeModal(delModal); deleteId = null; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(modal); closeModal(delModal); deleteId = null; }
  });

  var delConfirm = $('#adm-cdel-confirm');
  if (delConfirm) delConfirm.addEventListener('click', async function () {
    if (deleteId == null || busy) return;
    if (!useApi) { toast('حالت فقط‌خواندن فعال است', 'danger'); return; }
    busy = true;
    try {
      await api('/categories/' + encodeURIComponent(deleteId) + '?force=1', { method: 'DELETE' });
      categories = categories.filter(function (x) { return String(x.id) !== String(deleteId); });
      closeModal(delModal);
      deleteId = null;
      render();
      toast('دسته حذف شد', 'danger');
    } catch (err) {
      toast(err.message || 'حذف دسته ناموفق بود', 'danger');
    } finally { busy = false; }
  });

  var form = $('#adm-category-form');
  if (form) form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (busy) return;
    var id = $('#adm-cm-id').value;
    var name = $('#adm-cm-name').value.trim();
    var slug = $('#adm-cm-slug').value.trim();
    var icon = $('#adm-cm-icon').value.trim();
    var desc = $('#adm-cm-desc').value.trim();
    var subs = $('#adm-cm-subs').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!name) { toast('نام دسته الزامی است', 'danger'); $('#adm-cm-name').focus(); return; }
    var dup = categories.filter(function (x) {
      return (x.slug || '').toLowerCase() === slug.toLowerCase() && String(x.id) !== String(id);
    })[0];
    if (slug && dup) { toast('این نامک قبلاً ثبت شده است', 'danger'); $('#adm-cm-slug').focus(); return; }
    if (!useApi) { toast('حالت فقط‌خواندن فعال است', 'danger'); return; }
    var payload = { name: name, description: desc, subcategories: subs, icon: icon };
    if (slug) payload.slug = slug;
    busy = true;
    try {
      if (id) {
        var updated = await api('/categories/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(payload) });
        categories = categories.map(function (x) { return String(x.id) === String(id) ? updated : x; });
        toast('دسته به‌روزرسانی شد', 'success');
      } else {
        var created = await api('/categories', { method: 'POST', body: JSON.stringify(payload) });
        categories.push(created);
        toast('دسته جدید اضافه شد', 'success');
      }
      closeModal(modal);
      render();
    } catch (err) {
      toast(err.message || 'ذخیره دسته ناموفق بود', 'danger');
    } finally { busy = false; }
  });

  load();
  window.AbzarAdminCategories = { render: render, reload: load };
})();
