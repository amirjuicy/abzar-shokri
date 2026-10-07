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
      content.innerHTML = '\
      <div class="breadcrumb"><div class="container"><div class="breadcrumb-list">\
        <span class="breadcrumb-item"><a href="/">خانه</a></span>\
        <span class="breadcrumb-sep">\u2039</span>\
        <span class="breadcrumb-item breadcrumb-item--active">سبد خرید</span>\
      </div></div></div>\
      <div class="container"><div class="cart-page"><div class="cart-layout">\
        <section class="cart-layout__main">\
          <div class="cart-card cart-card--header">\
            <div class="cart-card__header-inner">\
              <div class="cart-card__title-row">\
                <h1 class="cart-card__title">سبد خرید</h1>\
                <span class="cart-badge">\u06F0</span>\
              </div>\
            </div>\
          </div>\
          <div class="cart-empty-state">\
            <div class="cart-empty-state__icon">' + Icons.shoppingBag + '</div>\
            <h3 class="cart-empty-state__title">سبد دیجی\u200Cکالایی شما خالی است!</h3>\
            <p class="cart-empty-state__text">اگر به صفحه\u200Cهای زیر سر بزنید، دست\u200C\u200Cپُر برمی\u200Cگردید.</p>\
            <a href="/shop" class="btn btn-outline-primary cart-empty-state__btn">' + Icons.shoppingBag + ' لیست های شما</a>\
          </div>\
        </section>\
        <aside class="cart-layout__sidebar">\
          <div class="cart-sidebar-sticky">\
            <div class="cart-charity-banner">\
              <div class="cart-charity-banner__row">\
                <div class="cart-charity-banner__info">\
                  <span class="cart-charity-banner__icon">' + Icons.shield + '</span>\
                </div>\
                <div class="cart-charity-banner__action">\
                  <span class="cart-charity-banner__label">افزودن</span>\
                  <span class="cart-charity-banner__chevron">' + Icons.chevronLeft + '</span>\
                </div>\
              </div>\
              <span class="cart-charity-banner__desc">در مهارت\u200Cآموزی کودکان کم\u200Cبرخوردار همراه شویم</span>\
            </div>\
          </div>\
        </aside>\
      </div></div></div>';
      return;
    }

    var total = App.getCartTotal();
    var shipping = total >= 500000 ? 0 : 35000;
    var count = App.getCartCount();

    content.innerHTML = '\
    <div class="breadcrumb"><div class="container"><div class="breadcrumb-list">\
      <span class="breadcrumb-item"><a href="/">خانه</a></span>\
      <span class="breadcrumb-sep">\u2039</span>\
      <span class="breadcrumb-item breadcrumb-item--active">سبد خرید</span>\
    </div></div></div>\
    <div class="container"><div class="cart-page"><div class="cart-layout">\
      <section class="cart-layout__main">\
        <div class="cart-card cart-card--header">\
          <div class="cart-card__header-inner">\
            <div class="cart-card__title-row">\
              <h1 class="cart-card__title">سبد خرید</h1>\
              <span class="cart-badge">' + Format.toPersianNumber(count) + '</span>\
            </div>\
          </div>\
        </div>\
        <div class="cart-items" id="cart-items"></div>\
      </section>\
      <aside class="cart-layout__sidebar">\
        <div class="cart-sidebar-sticky">\
          <div class="cart-summary-box">\
            <h3 class="cart-summary-box__title">خلاصه سفارش</h3>\
            <div class="cart-summary-box__row"><span>جمع سبد خرید</span><span>' + Format.priceWithCurrency(total) + '</span></div>\
            <div class="cart-summary-box__row"><span>هزینه ارسال</span><span>' + (shipping === 0 ? '<span class="text-success">رایگان</span>' : Format.priceWithCurrency(shipping)) + '</span></div>\
            <div class="cart-summary-box__row cart-summary-box__row--total"><span>مبلغ قابل پرداخت</span><span>' + Format.priceWithCurrency(total + shipping) + '</span></div>\
            <div class="cart-summary-box__actions">\
              <a href="/checkout/step1" class="btn btn-primary btn-lg btn-block">تکمیل خرید</a>\
              <a href="/shop" class="btn btn-secondary btn-block">ادامه خرید</a>\
            </div>\
          </div>\
          <div class="cart-charity-banner">\
            <div class="cart-charity-banner__row">\
              <div class="cart-charity-banner__info">\
                <span class="cart-charity-banner__icon">' + Icons.shield + '</span>\
              </div>\
              <div class="cart-charity-banner__action">\
                <span class="cart-charity-banner__label">افزودن</span>\
                <span class="cart-charity-banner__chevron">' + Icons.chevronLeft + '</span>\
              </div>\
            </div>\
            <span class="cart-charity-banner__desc">در مهارت\u200Cآموزی کودکان کم\u200Cبرخوردار همراه شویم</span>\
          </div>\
        </div>\
      </aside>\
    </div></div></div>';
    renderItems();
  }

  function renderItems() {
    var cart = App.getCart();
    var container = $('#cart-items');
    if (!container) return;
    container.innerHTML = cart.map(function(item) {
      var modeLabel = item.pricingMode === 'wholesale' ? '<span class="cart-item-row__mode">عمده</span>' : '';
      return '<div class="cart-item-row">\
        <div class="cart-item-row__image"><img src="' + item.image + '" alt="' + item.name + '" loading="lazy" class="cart-item__img"></div>\
        <div class="cart-item-row__info">\
          <div class="cart-item-row__details">\
            <span class="cart-item-row__brand">' + item.brandName + '</span>\
            <a href="/product/' + item.slug + '" class="cart-item-row__title">' + item.name + '</a>' + modeLabel + '\
          </div>\
          <div class="cart-item-row__bottom">\
            <span class="cart-item-row__price">' + Format.priceWithCurrency(item.price) + '</span>\
            <div class="cart-item-row__actions">\
              <div class="qty-selector">\
                <button class="qty-selector__btn" onclick="CartPage.changeQty(\'' + item.key + '\',-1)" aria-label="کاهش تعداد">' + Icons.minus + '</button>\
                <div class="qty-selector__value">' + Format.toPersianNumber(item.quantity) + '</div>\
                <button class="qty-selector__btn" onclick="CartPage.changeQty(\'' + item.key + '\',1)" aria-label="افزایش تعداد">' + Icons.plus + '</button>\
              </div>\
              <button class="cart-item-row__remove" onclick="CartPage.removeItem(\'' + item.key + '\')" aria-label="حذف محصول">' + Icons.trash + '</button>\
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
