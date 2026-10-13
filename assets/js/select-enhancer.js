/* Standalone native <select> -> province-style custom dropdown (no common.js dependency). */
(function () {
  'use strict';
  if (window.__selectEnhancerLoaded) return;
  window.__selectEnhancerLoaded = true;

  var __selectDropInstance = null;
  var __selectDropTrigger = null;

  function closeSelectDropdown() {
    if (__selectDropInstance) { try { __selectDropInstance.remove(); } catch (e) {} __selectDropInstance = null; }
    if (__selectDropTrigger) { try { __selectDropTrigger.setAttribute('aria-expanded', 'false'); } catch (e) {} __selectDropTrigger = null; }
  }

  function positionSelectDropdown(menu, trigger) {
    var rect = trigger.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    var gap = 6, minHeight = 100;
    var top = rect.bottom + gap;
    var below = window.innerHeight - top - gap;
    if (below < minHeight) {
      top = Math.min(top, Math.max(8, window.innerHeight - minHeight - gap));
      below = window.innerHeight - top - gap;
    }
    menu.style.position = 'fixed';
    menu.style.left = Math.max(8, rect.left) + 'px';
    menu.style.top = top + 'px';
    menu.style.width = Math.min(rect.width, window.innerWidth - 16) + 'px';
    menu.style.maxHeight = Math.max(0, below) + 'px';
    menu.style.overflowY = 'auto';
    menu.style.overscrollBehavior = 'contain';
    menu.style.touchAction = 'pan-y';
    menu.style.zIndex = '560';
  }

  function openSelectDropdown(sel, trigger) {
    closeSelectDropdown();
    var rect = trigger.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    var menu = document.createElement('ul');
    menu.className = 'addr-province-menu';
    var any = false, selected = null, i;
    for (i = 0; i < sel.options.length; i++) {
      var o = sel.options[i];
      if (o.disabled) continue;
      any = true;
      var li = document.createElement('li');
      li.className = 'addr-province-menu__item' + (o.selected ? ' is-selected' : '');
      li.textContent = o.text;
      li.setAttribute('data-value', o.value);
      li.setAttribute('tabindex', '-1');
      li.addEventListener('click', (function (value) {
        return function () {
          sel.value = value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          closeSelectDropdown();
        };
      })(o.value));
      if (o.selected) selected = li;
      menu.appendChild(li);
    }
    if (!any) return;
    document.body.appendChild(menu);
    __selectDropInstance = menu;
    __selectDropTrigger = trigger;
    positionSelectDropdown(menu, trigger);
    trigger.setAttribute('aria-expanded', 'true');
    menu.addEventListener('wheel', function (e) { e.stopPropagation(); }, { passive: false });
    menu.addEventListener('touchmove', function (e) { e.stopPropagation(); }, { passive: false });
    menu.addEventListener('keydown', function (e) {
      var items = Array.prototype.slice.call(menu.querySelectorAll('.addr-province-menu__item'));
      if (!items.length) return;
      var idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < 0) idx = selected ? items.indexOf(selected) : -1;
        idx = Math.min(items.length - 1, idx + 1);
        items[idx].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx < 0) idx = selected ? items.indexOf(selected) : items.length;
        idx = Math.max(0, idx - 1);
        items[idx].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (document.activeElement && items.indexOf(document.activeElement) >= 0) document.activeElement.click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSelectDropdown();
        if (trigger) trigger.focus();
      } else if (e.key === 'Tab') {
        closeSelectDropdown();
      }
    });
    try {
      if (selected) selected.focus();
      else if (menu.firstChild) menu.firstChild.focus();
    } catch (e) {}
    if (selected) menu.scrollTop = Math.max(0, selected.offsetTop - menu.clientHeight / 2);
  }

  function enhanceSelect(sel) {
    if (!sel || !sel.nodeName || sel.nodeName !== 'SELECT') return;
    if (sel.dataset && sel.dataset.enhancedSelect === '1') return;
    if (sel.closest && (sel.closest('.addr-province-dd') || sel.closest('.addr-city-dd'))) return;
    if (sel.dataset) sel.dataset.enhancedSelect = '1';
    var wrapper = document.createElement('span');
    wrapper.className = 'addr-province-dd';
    wrapper.style.display = 'inline-block';
    if (sel.parentNode) sel.parentNode.insertBefore(wrapper, sel);
    wrapper.appendChild(sel);
    if (!sel.classList.contains('input') && !sel.classList.contains('shop-sort')) {
      sel.classList.add('input');
    }
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'addr-province-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', sel.getAttribute('aria-label') || 'انتخاب گزینه');
    wrapper.appendChild(trigger);
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (__selectDropInstance && __selectDropTrigger === trigger) closeSelectDropdown();
      else openSelectDropdown(sel, trigger);
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (__selectDropInstance && __selectDropTrigger === trigger) closeSelectDropdown();
        else openSelectDropdown(sel, trigger);
      } else if (e.key === 'Escape') {
        closeSelectDropdown();
      }
    });
  }

  function enhanceAllSelects(root) {
    if (!root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll('select');
    for (var i = 0; i < nodes.length; i++) enhanceSelect(nodes[i]);
  }

  function run() { enhanceAllSelects(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  try {
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.addedNodes) {
          for (var i = 0; i < m.addedNodes.length; i++) {
            var n = m.addedNodes[i];
            if (n && n.nodeType === 1) {
              if (n.nodeName === 'SELECT') enhanceSelect(n);
              else enhanceAllSelects(n);
            }
          }
        }
      });
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  document.addEventListener('click', function (e) {
    if (__selectDropInstance) {
      var t = __selectDropTrigger;
      if (!(t && t.contains(e.target)) && !__selectDropInstance.contains(e.target)) closeSelectDropdown();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSelectDropdown();
  });
  window.addEventListener('resize', closeSelectDropdown);
  window.addEventListener('scroll', function (e) {
    var t = e && e.target;
    if (t && t.closest && t.closest('.addr-province-menu')) return;
    closeSelectDropdown();
  }, true);
})();