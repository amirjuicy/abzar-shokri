/* ================================================================
   Abzar Shokri — Auth Pages (Login, Register, Forgot Password)
   ================================================================ */
(function() {
  'use strict';
  var $ = function(s,c) { return (c||document).querySelector(s); };

  function init() {
    // Login form
    var loginForm = $('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        App.showToast('ورود موفقیت‌آمیز بود! (شبیه‌سازی)', 'success');
        setTimeout(function() { window.location.href = 'account.html'; }, 1000);
      });
    }

    // Register form
    var registerForm = $('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var pw = $('#reg-password');
        var pwConfirm = $('#reg-password-confirm');
        if (pw && pwConfirm && pw.value !== pwConfirm.value) {
          App.showToast('رمز عبور و تکرار آن مطابقت ندارند', 'danger');
          return;
        }
        App.showToast('ثبت‌نام موفقیت‌آمیز بود! (شبیه‌سازی)', 'success');
        setTimeout(function() { window.location.href = 'account.html'; }, 1000);
      });
    }

    // Forgot password form
    var forgotForm = $('#forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var step1 = $('#forgot-step-1');
        var step2 = $('#forgot-step-2');
        if (step1 && step1.style.display !== 'none') {
          step1.style.display = 'none';
          step2.style.display = 'block';
          App.showToast('کد تأیید ارسال شد! (شبیه‌سازی)', 'info');
        } else {
          App.showToast('رمز عبور با موفقیت تغییر کرد! (شبیه‌سازی)', 'success');
          setTimeout(function() { window.location.href = 'login.html'; }, 1000);
        }
      });
    }

    // OTP toggle
    var otpToggle = $('#otp-toggle');
    if (otpToggle) {
      otpToggle.addEventListener('click', function() {
        var passForm = $('#login-password-form');
        var otpForm = $('#login-otp-form');
        if (passForm && otpForm) {
          var isPass = passForm.style.display !== 'none';
          passForm.style.display = isPass ? 'none' : 'block';
          otpForm.style.display = isPass ? 'block' : 'none';
          this.textContent = isPass ? 'ورود با رمز عبور' : 'ورود با کد یکبار مصرف';
        }
      });
    }

    var otpLoginBtn = $('#otp-login-btn');
    if (otpLoginBtn) {
      otpLoginBtn.addEventListener('click', function() {
        App.showToast('ورود موفقیت‌آمیز بود! (شبیه‌سازی)', 'success');
        setTimeout(function() { window.location.href = 'account.html'; }, 1000);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
