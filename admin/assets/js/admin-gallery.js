/* Abzar Shokri — Admin Gallery: list / upload / delete site images. */
(function () {
  'use strict';
  function $(s, c) { return (c || document).querySelector(s); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function token() { try { var s = JSON.parse(localStorage.getItem('as_admin_session') || 'null'); return (s && s.token) || ''; } catch (e) { return ''; } }
  function toast(m, t) { if (window.AbzarAdmin) window.AbzarAdmin.showToast(m, t); }
  function fmtSize(n) {
    n = Number(n) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }
  var items = [];
  function render(filter) {
    var tbody = $('#adm-gallery-table tbody');
    var count = $('#adm-gallery-count');
    if (!tbody) return;
    var q = String(filter || '').trim().toLowerCase();
    var list = items.filter(function (it) {
      return !q || it.filename.toLowerCase().indexOf(q) !== -1 || it.path.toLowerCase().indexOf(q) !== -1;
    });
    if (count) count.textContent = 'تعداد: ' + list.length.toLocaleString('fa-IR');
    if (!list.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted)">تصویری یافت نشد.</td></tr>'; return; }
    tbody.innerHTML = list.map(function (it) {
      return '<tr data-path="' + esc(it.path) + '">' +
        '<td><span class="adm-top-item__thumb"><img src="' + esc(it.url) + '" alt="' + esc(it.filename) + '" loading="lazy" style="width:56px;height:56px;object-fit:cover"></span></td>' +
        '<td style="direction:ltr;text-align:left;font-size:12px">' + esc(it.filename) + '</td>' +
        '<td style="direction:ltr;text-align:left;font-size:12px">' + esc(it.path) + '</td>' +
        '<td>' + esc(fmtSize(it.size)) + '</td>' +
        '<td><div class="adm-table__cell-actions">' +
        '<a class="adm-btn-icon" href="' + esc(it.url) + '" target="_blank" title="مشاهده"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></a>' +
        '<button type="button" class="adm-btn-icon adm-btn-icon--danger" data-gallery-del="' + esc(it.path) + '" title="حذف"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div></td></tr>';
    }).join('');
  }
  function load() {
    var tbody = $('#adm-gallery-table tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--text-muted)">در حال بارگذاری…</td></tr>';
    fetch('/api/admin/gallery', { headers: { Authorization: 'Bearer ' + token() } })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error((res.body && res.body.error) || 'failed');
        items = res.body.items || [];
        var s = $('#adm-gallery-search');
        render(s ? s.value : '');
      })
      .catch(function () { if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px;color:#c0392b">خطا در بارگذاری گالری</td></tr>'; });
  }
  document.addEventListener('click', function (e) {
    var del = e.target.closest('[data-gallery-del]');
    if (del) {
      var p = del.getAttribute('data-gallery-del');
      if (!window.confirm('تصویر حذف شود؟\n' + p)) return;
      fetch('/api/admin/gallery?path=' + encodeURIComponent(p), { method: 'DELETE', headers: { Authorization: 'Bearer ' + token() } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error((res.body && res.body.error) || 'delete failed');
          toast('تصویر حذف شد', 'success'); load();
        })
        .catch(function (err) { toast(err.message || 'خطا در حذف', 'danger'); });
      return;
    }
    if (e.target.closest('#adm-gallery-refresh')) load();
  });
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'adm-gallery-file') {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var fd = new FormData(); fd.append('image', f);
      toast('در حال آپلود…', 'info');
      fetch('/api/admin/gallery/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token() }, body: fd })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error((res.body && res.body.error) || 'upload failed');
          toast('تصویر آپلود شد: ' + res.body.path, 'success'); load();
        })
        .catch(function (err) { toast(err.message || 'خطا در آپلود', 'danger'); })
        .finally(function () { e.target.value = ''; });
    }
  });
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'adm-gallery-search') render(e.target.value);
  });
  // Load when gallery view opens.
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (window.AbzarAdmin || tries > 100) { clearInterval(iv); load(); }
  }, 100);
  if ((location.hash || '').replace(/^#\/?/, '') === 'gallery') load();
})();
