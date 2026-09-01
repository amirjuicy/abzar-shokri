/* ================================================================
   Abzar Shokri — Auth Pages (Login, Register, Forgot Password)
   Actual user registration and login via localStorage.
   ================================================================ */
(function() {
  'use strict';
  var $ = function(s,c) { return (c||document).querySelector(s); };

  function init() {
    /* ── Login form ───────────────────────────────────────── */
    var loginForm = $('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var identifier = $('#login-identifier');
        var password = $('#login-password');
        if (!identifier || !identifier.value.trim()) {
          App.showToast('لطفاً موبایل یا ایمیل را وارد کنید.', 'danger');
          return;
        }
        var result = App.login(identifier.value.trim(), password ? password.value : '');
        if (result.success) {
          App.showToast('ورود موفقیت‌آمیز بود! خوش آمدید، ' + result.user.firstName, 'success');
          setTimeout(function() { window.location.href = 'account.html'; }, 800);
        } else {
          App.showToast(result.error, 'danger');
        }
      });
    }

    /* ── Register form ────────────────────────────────────── */
    var registerForm = $('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var firstName = $('#reg-firstname');
        var lastName = $('#reg-lastname');
        var mobile = $('#reg-mobile');
        var email = $('#reg-email');
        var pw = $('#reg-password');
        var pwConfirm = $('#reg-password-confirm');
        var terms = $('#reg-terms');

        if (!firstName || !firstName.value.trim()) { App.showToast('نام را وارد کنید.', 'danger'); return; }
        if (!lastName || !lastName.value.trim()) { App.showToast('نام خانوادگی را وارد کنید.', 'danger'); return; }
        if (!mobile || !mobile.value.trim()) { App.showToast('شماره موبایل را وارد کنید.', 'danger'); return; }
        if (!pw || !pw.value) { App.showToast('رمز عبور را وارد کنید.', 'danger'); return; }
        if (pw.value.length < 6) { App.showToast('رمز عبور باید حداقل ۶ کاراکتر باشد.', 'danger'); return; }
        if (pwConfirm && pw.value !== pwConfirm.value) {
          App.showToast('رمز عبور و تکرار آن مطابقت ندارند.', 'danger');
          return;
        }
        if (terms && !terms.checked) {
          App.showToast('پذیرش شرایط و قوانین الزامی است.', 'danger');
          return;
        }

        var result = App.register({
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          mobile: mobile.value.trim(),
          email: email ? email.value.trim() : '',
          password: pw.value
        });

        if (result.success) {
          App.showToast('ثبت‌نام موفقیت‌آمیز بود! خوش آمدید، ' + result.user.firstName, 'success');
          setTimeout(function() { window.location.href = 'account.html'; }, 800);
        } else {
          App.showToast(result.error, 'danger');
        }
      });
    }

    /* ── Forgot password form ─────────────────────────────── */
    var forgotForm = $('#forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var step1 = $('#forgot-step-1');
        var step2 = $('#forgot-step-2');
        if (step1 && step1.style.display !== 'none') {
          /* Verify the mobile/email exists */
          var identifier = $('#forgot-identifier');
          if (identifier && identifier.value.trim()) {
            var users = JSON.parse(localStorage.getItem('as_users') || '[]');
            var found = users.find(function(u) { return u.mobile === identifier.value.trim() || u.email === identifier.value.trim(); });
            if (!found) {
              App.showToast('کاربری با این مشخصات یافت نشد.', 'danger');
              return;
            }
          }
          step1.style.display = 'none';
          step2.style.display = 'block';
          App.showToast('کد تأیید ارسال شد! (شبیه‌سازی)', 'info');
        } else {
          App.showToast('رمز عبور با موفقیت تغییر کرد! (شبیه‌سازی)', 'success');
          setTimeout(function() { window.location.href = 'login.html'; }, 1000);
        }
      });
    }

    /* ── OTP toggle ───────────────────────────────────────── */
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
        var identifier = $('#otp-identifier');
        if (!identifier || !identifier.value.trim()) {
          App.showToast('لطفاً موبایل یا ایمیل را وارد کنید.', 'danger');
          return;
        }
        /* Simulate OTP login: auto-register if not exists, then login */
        var users = JSON.parse(localStorage.getItem('as_users') || '[]');
        var found = users.find(function(u) { return u.mobile === identifier.value.trim() || u.email === identifier.value.trim(); });
        if (found) {
          var result = App.login(identifier.value.trim(), '');
          if (result.success) {
            App.showToast('ورود موفقیت‌آمیز بود!', 'success');
            setTimeout(function() { window.location.href = 'account.html'; }, 800);
          }
        } else {
          App.showToast('کاربری با این مشخصات یافت نشد. ابتدا ثبت‌نام کنید.', 'danger');
        }
      });
    }

    /* ── Redirect if already logged in ────────────────────── */
    if (App.isLoggedIn()) {
      /* If on login/register page and already logged in, redirect to account */
      var path = window.location.pathname;
      if (path.includes('login.html') || path.includes('register.html')) {
        window.location.href = 'account.html';
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
