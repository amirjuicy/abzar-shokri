/* ================================================================
   Abzar Shokri — Cart Page
   ================================================================ */
(function() {
  'use strict';
  var $ = function(s,c) { return (c||document).querySelector(s); };

  function render() {
    var cart = App.getCart();
    var content = $('#cart-content');
    if (!content) return;

    if (cart.length === 0) {
      content.innerHTML = '<div class="breadcrumb"><div class="container"><div class="breadcrumb-list"><span class="breadcrumb-item"><a href="index.html">خانه</a></span><span class="breadcrumb-sep">‹</span><span class="breadcrumb-item breadcrumb-item--active">سبد خرید</span></div></div></div><div class="container"><div class="empty-state" style="padding:var(--space-16) 0"><span class="empty-state__icon" style="width:80px;height:80px">'+Icons.shoppingBag+'</span><h3 class="empty-state__title">سبد خرید شما خالی است</h3><p class="empty-state__text">محصولات مورد نظر خود را به سبد خرید اضافه کنید.</p><a href="shop.html" class="btn btn-primary btn-lg">مشاهده فروشگاه</a></div></div>';
      return;
    }

    var total = App.getCartTotal();
    var shipping = total >= 500000 ? 0 : 35000;

    content.innerHTML = '\
    <div class="breadcrumb"><div class="container"><div class="breadcrumb-list">\
      <span class="breadcrumb-item"><a href="index.html">خانه</a></span>\
      <span class="breadcrumb-sep">‹</span>\
      <span class="breadcrumb-item breadcrumb-item--active">سبد خرید</span>\
    </div></div></div>\
    <div class="container"><div class="page-header"><h1 class="page-header__title">سبد خرید</h1><p class="page-header__count">'+Format.toPersianNumber(cart.length)+' محصول در سبد خرید</p></div>\
    <div class="cart-layout">\
      <div class="cart-items" id="cart-items"></div>\
      <div class="cart-summary-box">\
        <h3 class="cart-summary-box__title">خلاصه سفارش</h3>\
        <div class="cart-summary-box__row"><span>جمع سبد خرید</span><span>'+Format.priceWithCurrency(total)+'</span></div>\
        <div class="cart-summary-box__row"><span>هزینه ارسال</span><span>'+(shipping === 0 ? '<span style="color:var(--color-success)">رایگان</span>' : Format.priceWithCurrency(shipping))+'</span></div>\
        <div class="cart-summary-box__row cart-summary-box__row--total"><span>مبلغ قابل پرداخت</span><span>'+Format.priceWithCurrency(total + shipping)+'</span></div>\
        <div class="cart-summary-box__actions">\
          <a href="checkout.html" class="btn btn-primary btn-block btn-lg">تکمیل خرید</a>\
          <a href="shop.html" class="btn btn-secondary btn-block">ادامه خرید</a>\
        </div>\
      </div>\
    </div></div>';
    renderItems();
  }

  function renderItems() {
    var cart = App.getCart();
    var container = $('#cart-items');
    if (!container) return;
    container.innerHTML = cart.map(function(item) {
      return '<div class="cart-item-row">\
        <div class="cart-item-row__image"><img src="' + item.image + '" alt="' + item.name + '" loading="lazy" class="cart-item__img"></div>\
        <div class="cart-item-row__info">\
          <div class="cart-item-row__details">\
            <span class="cart-item-row__brand">'+item.brandName+'</span>\
            <a href="product.html?slug='+item.slug+'" class="cart-item-row__title">'+item.name+'</a>\
          </div>\
          <div class="cart-item-row__bottom">\
            <span class="cart-item-row__price">'+Format.priceWithCurrency(item.price)+'</span>\
            <div class="cart-item-row__actions">\
              <div class="qty-selector">\
                <button class="qty-selector__btn" onclick="CartPage.changeQty('+item.id+',-1)" aria-label="کاهش تعداد">'+Icons.minus+'</button>\
                <div class="qty-selector__value">'+Format.toPersianNumber(item.quantity)+'</div>\
                <button class="qty-selector__btn" onclick="CartPage.changeQty('+item.id+',1)" aria-label="افزایش تعداد">'+Icons.plus+'</button>\
              </div>\
              <button class="cart-item-row__remove" onclick="CartPage.removeItem('+item.id+')" aria-label="حذف محصول">'+Icons.trash+'</button>\
            </div>\
          </div>\
        </div>\
      </div>';
    }).join('');
  }

  window.CartPage = {
    changeQty: function(id, delta) { App.updateCartQty(id, delta); render(); },
    removeItem: function(id) { App.removeFromCart(id); render(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
