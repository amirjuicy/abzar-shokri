/* ================================================================
   Abzar Shokri — Checkout Page
   ================================================================ */
(function() {
  'use strict';
  var $ = function(s,c) { return (c||document).querySelector(s); };
  var $$ = function(s,c) { return [...(c||document).querySelectorAll(s)]; };
  var selectedShipping = 'normal';

  function render() {
    var cart = App.getCart();
    if (cart.length === 0) { window.location.href = 'cart.html'; return; }
    renderSummary();
    renderProvinces();
  }

  function renderSummary() {
    var cart = App.getCart();
    var total = App.getCartTotal();
    var shippingCost = selectedShipping === 'express' ? 35000 : 0;
    var finalTotal = total + shippingCost;

    var el = $('#checkout-summary-items');
    if (!el) return;
    el.innerHTML = cart.map(function(item) {
      return '<div style="display:flex;gap:var(--space-3);padding:var(--space-2) 0;font-size:var(--font-size-sm)"><div style="width:48px;height:48px;background:var(--color-gray-100);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-shrink:0">'+Icons.package+'</div><div style="flex:1"><div style="font-weight:var(--font-weight-medium)">'+item.name+'</div><div style="color:var(--text-muted)">'+Format.toPersianNumber(item.quantity)+' عدد</div></div><div style="font-weight:var(--font-weight-semibold)">'+Format.priceWithCurrency(item.price * item.quantity)+'</div></div>';
    }).join('');

    var sumEl = $('#checkout-summary-total');
    if (sumEl) {
      sumEl.innerHTML = '\
        <div class="cart-summary-box__row"><span>جمع سبد خرید</span><span>'+Format.priceWithCurrency(total)+'</span></div>\
        <div class="cart-summary-box__row"><span>هزینه ارسال</span><span>'+(shippingCost === 0 ? '<span style="color:var(--color-success)">رایگان</span>' : Format.priceWithCurrency(shippingCost))+'</span></div>\
        <div class="cart-summary-box__row cart-summary-box__row--total"><span>مبلغ قابل پرداخت</span><span>'+Format.priceWithCurrency(finalTotal)+'</span></div>';
    }
  }

  function renderProvinces() {
    var el = $('#province-select');
    if (!el) return;
    el.innerHTML = '<option value="">انتخاب استان</option>' + AppData.provinces.map(function(p) { return '<option value="'+p.name+'">'+p.name+'</option>'; }).join('');
    el.addEventListener('change', function() {
      var cityEl = $('#city-select');
      if (!cityEl) return;
      var province = AppData.provinces.find(function(p) { return p.name === el.value; });
      cityEl.innerHTML = '<option value="">انتخاب شهر</option>' + (province ? province.cities.map(function(c) { return '<option value="'+c+'">'+c+'</option>'; }).join('') : '');
    });
  }

  function init() {
    render();
    // Shipping options
    $$('.shipping-option input').forEach(function(input) {
      input.addEventListener('change', function() { selectedShipping = this.value; renderSummary(); });
    });
    // Payment options
    $$('.payment-option input').forEach(function(input) {
      input.addEventListener('change', function() { /* just UI */ });
    });

    var form = $('#checkout-form');
    if (form) form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'در حال پردازش...'; btn.disabled = true; }
      setTimeout(function() {
        /* Save order to user-scoped localStorage */
        var cart = App.getCart();
        var total = App.getCartTotal();
        var shippingCost = selectedShipping === 'express' ? 35000 : 0;
        var now = new Date();
        var persianDate = now.toLocaleDateString('fa-IR');
        var order = {
          id: App.generateOrderId(),
          date: persianDate,
          status: 'pending',
          statusText: 'در انتظار پرداخت',
          total: total + shippingCost,
          itemsCount: cart.reduce(function(s, i) { return s + i.quantity; }, 0),
          items: cart.map(function(item) {
            return { productId: item.id, name: item.name, price: item.price, quantity: item.quantity };
          }),
          shipping: shippingCost,
          discount: 0,
          timeline: [
            { step: 'ثبت سفارش', date: persianDate + ' - ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'), done: true },
            { step: 'تأیید پرداخت', date: '—', done: false },
            { step: 'در حال پردازش', date: '—', done: false },
            { step: 'تحویل به پست', date: '—', done: false },
            { step: 'تحویل شده', date: '—', done: false }
          ],
          address: 'آدرس ثبت‌شده در فرم',
          paymentMethod: 'پرداخت آنلاین'
        };
        var orders = App.getUserData('orders', []);
        orders.unshift(order);
        App.setUserData('orders', orders);

        /* Clear cart via user-scoped API */
        App.clearCart();

        App.showToast('سفارش شما با موفقیت ثبت شد! شماره سفارش: ' + order.id, 'success');
        if (btn) { btn.textContent = 'پرداخت و ثبت سفارش'; btn.disabled = false; }
        setTimeout(function() { window.location.href = 'account-order-detail.html?id=' + encodeURIComponent(order.id); }, 1500);
      }, 2000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
