/* Site Content — applies CMS values from /api/content + /api/settings to DOM.
   Hero slides are rendered dynamically from /api/hero-slides.
   Fails silently (keeps hardcoded fallback) when API is unreachable. */
(function(){
  'use strict';
  if(location.protocol==='file:') return;
  var __heroBox=document.querySelector('.hero__slides');
  if(__heroBox){ __heroBox.setAttribute('data-hero-loading','1'); __heroBox.innerHTML='<div class="hero__loading" style="padding:48px;text-align:center">'+'در حال بارگذاری…'+'</div>'; }
  var __heroRenderGen=0;
  var __heroDots=document.querySelector('.hero__dots');
  if(__heroDots){ __heroDots.innerHTML=''; }
  function isMobileViewport(){ return window.innerWidth <= 767; }
  function renderHeroSlides(slides){
    var myGen=++__heroRenderGen;
    var container=document.querySelector('.hero__slides');
    if(!container) return;
    if(!slides || !slides.length){ var __c=document.querySelector('.hero__slides'); if(__c){ __c.innerHTML=''; __c.removeAttribute('data-hero-loading'); } var __d=document.querySelector('.hero__dots'); if(__d){ __d.innerHTML=''; } return; }
    /* Preserve the currently visible index across re-renders (e.g. resize)
       so a mid-cycle re-render never flashes slide 1 over another slide. */
    var keepIdx=0;
    try{
      var __cur=container.querySelector('.hero__slide.is-active');
      if(__cur){ var __k=parseInt(__cur.getAttribute('data-slide'),10); if(!isNaN(__k)&&__k>=0) keepIdx=__k; }
    }catch(e){}
    var isMobile=isMobileViewport();
    var gradients=[
      'linear-gradient(135deg,#1a1a1a 0%,#222 50%,#2a2a2a 100%)',
      'linear-gradient(135deg,#1c2340 0%,#2a3058 50%,#1a2040 100%)',
      'linear-gradient(135deg,#2c1a1a 0%,#3a2222 50%,#2a1a1a 100%)',
      'linear-gradient(135deg,#1a2a1a 0%,#223822 50%,#1a2a1a 100%)'
    ];
    var badgeIcons=[
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    ];
    var badgeIconByKey={
      bolt:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      info:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    };
    function heroBg(s, fallback){
      try{
        var c1=String(s.background_color||'').trim();
        if(!c1) return fallback;
        var c2=String(s.background_gradient_second||'').trim();
        if(!c2) return c1;
        var ang=String(s.background_gradient_angle||'135deg').trim()||'135deg';
        return 'linear-gradient('+ang+','+c1+' 0%,'+c1+' 50%,'+c2+' 100%)';
      }catch(e){ return fallback; }
    }
    var imageSizes={small:180,medium:280,large:420};
    var arrowIcon='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    var html='';
    var visible=[];
    for(var i=0;i<slides.length;i++){
      var s=slides[i];
      if(isMobile && (s.show_mobile===false||s.show_mobile===0)) continue;
      var st0=(s.slide_type==='full')?'full':'content';
      if(st0==='full'){ if(!String(s.image_desktop||s.image||'').trim()&&!String(s.link_url||'').trim()) continue; visible.push(s); continue; }
      if(!String(s.image_desktop||s.image||'').trim()&&!String(s.badge||'').trim()&&!String(s.title||'').trim()&&!String(s.text||'').trim()&&!String(s.btn1_text||'').trim()&&!String(s.btn1_url||'').trim()&&!String(s.btn2_text||'').trim()&&!String(s.btn2_url||'').trim()) continue;
      visible.push(s);
    }
    slides=visible;
    if(!slides.length) return;
    if(myGen!==__heroRenderGen) return; /* a newer render superseded this one */
    if(keepIdx>=slides.length) keepIdx=0;
    for(var i=0;i<slides.length;i++){
      var s=slides[i];
      var bg=heroBg(s, gradients[i%gradients.length]);
      var pos=s.image_position||'center';
      var leftPos=pos==='left'?'25%':pos==='right'?'75%':'50%';
      var imgDesktop=s.image_desktop||s.image||'';
      var imgMobile=s.image_mobile||'';
      var imgSrcDesktop=(imgDesktop.startsWith('/')||imgDesktop.startsWith('http'))?imgDesktop:imgDesktop;
      var imgSrcMobile=(imgMobile.startsWith('/')||imgMobile.startsWith('http'))?imgMobile:imgMobile;
      var st=(s.slide_type==='full')?'full':'content';
      var linkUrl=String(s.link_url||'').trim();
      var showImage=s.show_image!==false&&s.show_image!==0;
      var showBadge=s.show_badge!==false&&s.show_badge!==0;
      var showTitle=s.show_title!==false&&s.show_title!==0;
      var showText=s.show_text!==false&&s.show_text!==0;
      var showBtn1=s.show_btn1!==false&&s.show_btn1!==0;
      var showBtn2=s.show_btn2!==false&&s.show_btn2!==0;
      var cp=s.content_position||'right';
      var isz=s.image_size||'medium';
      var bi=s.badge_icon||'';
      var iconHtml='';
      if(bi==='none'){ iconHtml=''; }
      else if(badgeIconByKey[bi]){ iconHtml=badgeIconByKey[bi]; }
      else{ iconHtml=badgeIcons[i%badgeIcons.length]; }
      var imgSize=imageSizes[isz]||280;
      function escA(v){ return String(v==null?'':v).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"'); }
      function buildPictureSrcSet(desktopSrc, mobileSrc, alt, eager){
        var desktopEsc=escA(desktopSrc);
        var mobileEsc=escA(mobileSrc);
        var altEsc=escA(alt);
        var loading=eager?'eager':'lazy';
        if(mobileEsc){
          return '<picture>'
            +'<source media="(max-width: 767px)" srcset="'+mobileEsc+'">'
            +'<img src="'+desktopEsc+'" alt="'+altEsc+'" loading="'+loading+'">'
            +'</picture>';
        }
        return '<img src="'+desktopEsc+'" alt="'+altEsc+'" loading="'+loading+'">';
      }
      if(st==='full'){
        var alt=escA(s.title||'بنر');
        var href=escA(linkUrl||'#');
        var pictureHtml=buildPictureSrcSet(imgSrcDesktop, imgSrcMobile, s.title||'بنر', i===keepIdx);
        html+='<div class="hero__slide hero__slide--full'+(i===keepIdx?' is-active':'')+'" data-slide="'+i+'">'
        +'<div class="hero__slide-bg" style="background:'+bg+'"></div>'
        +'<a class="hero__full-link" href="'+href+'" aria-label="'+alt+'">'
        +pictureHtml
        +'</a></div>';
        continue;
      }
      html+='<div class="hero__slide hero__slide--pos-'+cp+'"'+(i===keepIdx?' is-active':'')+' data-slide="'+i+'">'
        +'<div class="hero__slide-bg" style="background:'+bg+'"></div>';
      if(showImage&&imgDesktop){
        var pictureHtml=buildPictureSrcSet(imgSrcDesktop, imgSrcMobile, s.title||'', i===keepIdx);
        html+='<div class="hero__slide-image" style="left:'+leftPos+';right:auto;transform:translate(-50%,-50%);width:'+imgSize+'px;height:'+imgSize+'px">'
        +pictureHtml+'</div>';
      }
      html+='<div class="container"><div class="hero__slide-content">';
      if(showBadge&&String(s.badge||'').trim()) html+='<span class="hero__badge">'+iconHtml+' '+s.badge+'</span>';
      if(showTitle&&String(s.title||'').trim()) html+='<h1 class="hero__title">'+s.title+'</h1>';
      if(showText&&String(s.text||'').trim()) html+='<p class="hero__text">'+s.text+'</p>';
      if((showBtn1&&(s.btn1_text||s.btn1_url))||(showBtn2&&(s.btn2_text||s.btn2_url))){
        html+='<div class="hero__actions">';
        if(showBtn1&&(s.btn1_text||s.btn1_url)){
          html+='<a href="'+escA(s.btn1_url||'#')+'" class="btn btn-accent btn-lg">'+s.btn1_text+' '+arrowIcon+'</a>';
        }
        if(showBtn2&&(s.btn2_text||s.btn2_url)){
          html+='<a href="'+escA(s.btn2_url||'#')+'" class="btn btn-secondary btn-lg" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);color:white">'+s.btn2_text+'</a>';
        }
        html+='</div>';
      }
      html+='</div></div></div>';
    }
    container.innerHTML=html;
    // Rebuild dots
    var dotsContainer=document.querySelector('.hero__dots');
    if(dotsContainer){
      var dotsHtml='';
      for(var d=0;d<slides.length;d++){
        dotsHtml+='<button class="hero__dot'+(d===keepIdx?' is-active':'')+'" role="tab" aria-selected="'+(d===keepIdx?'true':'false')+'" aria-label="اسلاید '+(d+1)+'" type="button" data-dot="'+d+'"></button>';
      }
      dotsContainer.innerHTML=dotsHtml;
    container.removeAttribute('data-hero-loading');
    try{ document.dispatchEvent(new CustomEvent('hero:updated')); }catch(e){ try{ document.dispatchEvent(document.createEvent('Event')); }catch(_){} }
    }
    // Re-render on viewport change (debounced)
    if(!window.__heroResizeHandler){
      var debounceTimer;
      window.__heroResizeHandler=function(){
        clearTimeout(debounceTimer);
        debounceTimer=setTimeout(function(){
          var wasMobile=container.dataset.mobile==='true';
          var nowMobile=isMobileViewport();
          if(wasMobile!==nowMobile){
            container.dataset.mobile=nowMobile?'true':'false';
            // Re-fetch and re-render
            fetch('/api/hero-slides?v='+Date.now(), {cache:'no-store'}).then(function(r){ return r.ok? r.json(): null; }).catch(function(){ return null; }).then(function(slides){
              if(slides) renderHeroSlides(slides);
            });
          }
        }, 200);
      };
      window.addEventListener('resize', window.__heroResizeHandler);
    }
    container.dataset.mobile=isMobile?'true':'false';
  }
  function applyContent(c){
    if(!c) return;
    // Promo top bar — three rotating msgs
    var promos=document.querySelectorAll('.promo-topbar__msg');
    for(var j=0;j<3;j++){
      if(promos[j] && c['promo.topbar.'+(j+1)]!=null) promos[j].textContent=c['promo.topbar.'+(j+1)];
    }
    // Footer brand desc
    if(c['footer.brand.desc']!=null){
      var fd=document.querySelector('.footer-brand__desc');
      if(fd) fd.textContent=c['footer.brand.desc'];
    }
    if(c['footer.address']!=null){
      var addrLinks=document.querySelectorAll('.footer-link');
      for(var k=0;k<addrLinks.length;k++){
        if(addrLinks[k].textContent.indexOf('ولیعصر')!==-1 || addrLinks[k].textContent.indexOf('تهران')!==-1){
          var icon=addrLinks[k].querySelector('svg');
          if(icon) addrLinks[k].innerHTML=icon.outerHTML+' '+c['footer.address'];
          break;
        }
      }
    }
  }
  /* Normalize Persian/Arabic-Indic digits so tel: links are valid dial strings. */
  function __telHref(phone){
    var raw = String(phone == null ? '' : phone);
    var fa = '۰۱۲۳۴۵۶۷۸۹', ar = '٠١٢٣٤٥٦٧٨٩', out = '';
    for (var i = 0; i < raw.length; i++) {
      var ch = raw[i], fp = fa.indexOf(ch), ap = ar.indexOf(ch);
      if (fp > -1) out += String(fp);
      else if (ap > -1) out += String(ap);
      else if (ch === '+' || /[0-9]/.test(ch)) out += ch;
    }
    return 'tel:' + out;
  }
  /* Contact map card → store.map_url (Admin → اطلاعات فروشگاه). Google share/
     search links become iframable via output=embed; anything else keeps the
     clean pin + address fallback. */
  function __mapEmbedUrl(u){
    var s = String(u == null ? '' : u).trim();
    if(!s || s.length > 2048) return '';
    if(!/^https?:\/\//i.test(s)) return '';
    if(/^(javascript|data|file|ftp):/i.test(s)) return '';
    try{
      if(/output=embed/i.test(s) || /\/maps\/embed/i.test(s)) return s;
      if(/google\.[^/]+\/maps|maps\.google|goo\.gl\/maps/i.test(s)){
        return s + (s.indexOf('?') === -1 ? '?output=embed' : '&output=embed');
      }
    }catch(e){}
    return '';
  }
  function __renderContactMap(mapUrl){
    var card = document.getElementById('contact-map');
    var body = document.querySelector('[data-contact-map]') || (card ? card.querySelector('.contact-map-card__body') : null);
    if(!card || !body) return;
    var action = card.querySelector('.contact-map-card__action');
    var raw = String(mapUrl == null ? '' : mapUrl).trim();
    var embed = __mapEmbedUrl(raw);
    if(action){
      if(raw && /^https?:\/\//i.test(raw)){ action.setAttribute('href', raw); action.style.display = ''; }
      else{ action.setAttribute('href', '#'); action.style.display = 'none'; }
    }
    if(!embed){
      var old = body.querySelector('iframe');
      if(old) old.remove();
      body.classList.remove('contact-map-card__body--has-map');
      return;
    }
    var frame = body.querySelector('iframe');
    if(!frame){
      frame = document.createElement('iframe');
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('title', 'موقعیت فروشگاه روی نقشه');
      body.appendChild(frame);
    }
    body.classList.add('contact-map-card__body--has-map');
    if(frame.getAttribute('src') !== embed) frame.setAttribute('src', embed);
  }
  function applySettings(s){
    if(!s) return;
    try {
      // Centralized identity mirror (same source as common.js: Admin → اطلاعات فروشگاه).
      try { window.__storeName = s['store.name'] || window.__storeName; window.__storeSettings = s; } catch (e) {}
      var __name = s['store.name'] || '', __phone = s['store.phone'] || '', __phone2 = s['store.phone2'] || '',
        __email = s['store.email'] || '', __addr = s['store.address'] || '', __desc = s['store.desc'] || '',
        __mapUrl = s['store.map_url'] || '', __hours = s['store.hours'] || '',
        __hoursDetail = s['store.hours_detail'] || '', __website = s['store.website'] || '';
      function __setText(sel, val) {
        if (!val) return;
        document.querySelectorAll(sel).forEach(function (el) { el.textContent = val; });
      }
      if (__name) {
        __setText('.header-logo__title', __name);
        __setText('.footer-brand__name, .footer-store-name', __name);
        __setText('.co-brand', __name);
        document.querySelectorAll('[data-store="name"]').forEach(function (el) { el.textContent = __name; });
        var cpr = document.querySelector('.footer-copyright');
        if (cpr) {
          var __span = cpr.querySelector('.footer-store-name');
          if (__span) __span.textContent = __name;
          else cpr.textContent = 'تمامی حقوق این وب‌سایت متعلق به فروشگاه ' + __name + ' می‌باشد.';
        }
        try {
          if (document.title && document.title.indexOf('|') !== -1) {
            var __parts = document.title.split('|');
            __parts[__parts.length - 1] = ' ' + __name;
            document.title = __parts.join('|');
          }
          var __mt = document.querySelector('meta[name="apple-mobile-web-app-title"]');
          if (__mt) __mt.setAttribute('content', __name);
        } catch (e) {}
      }
      if (__desc) { var fd = document.querySelector('.footer-brand__desc'); if (fd) fd.textContent = __desc; }
      if (__addr || __phone || __email || __website) {
        document.querySelectorAll('[data-store-field="address"]').forEach(function (el) { if (__addr) { var __svg = el.querySelector('svg'); if (__svg) el.innerHTML = __svg.outerHTML + ' ' + __addr; else el.textContent = __addr; } });
        document.querySelectorAll('[data-store-field="phone"]').forEach(function (el) { if (__phone) { var __svg2 = el.querySelector('svg'); if (__svg2) el.innerHTML = __svg2.outerHTML + ' ' + __phone; else el.textContent = __phone; } });
        document.querySelectorAll('[data-store-field="email"]').forEach(function (el) { if (__email) { var __svg3 = el.querySelector('svg'); if (__svg3) el.innerHTML = __svg3.outerHTML + ' ' + __email; else el.textContent = __email; } });
        document.querySelectorAll('[data-store-field="website"]').forEach(function (el) { if (__website) { var __svg4 = el.querySelector('svg'); if (__svg4) el.innerHTML = __svg4.outerHTML + ' ' + __website; else el.textContent = __website; } });
        document.querySelectorAll('.footer-link').forEach(function (link) {
          if (link.hasAttribute('data-store-field')) return;
          var svg = link.querySelector('svg'); var txt = link.textContent || '';
          if (__addr && (txt.indexOf('تهران') !== -1 || txt.indexOf('ولیعصر') !== -1 || txt.indexOf('پلاک') !== -1)) {
            try { link.setAttribute('data-store-field', 'address'); } catch (e) {}
            if (svg) link.innerHTML = svg.outerHTML + ' ' + __addr; else link.textContent = __addr;
          } else if (__phone && /[0-9۰-۹]/.test(txt) && txt.indexOf('@') === -1 && txt.indexOf('www') === -1 && txt.indexOf('http') === -1) {
            try { link.setAttribute('data-store-field', 'phone'); } catch (e) {}
            if (svg) link.innerHTML = svg.outerHTML + ' ' + __phone; else link.textContent = __phone;
          } else if (__email && txt.indexOf('@') !== -1) {
            try { link.setAttribute('data-store-field', 'email'); } catch (e) {}
            if (svg) link.innerHTML = svg.outerHTML + ' ' + __email; else link.textContent = __email;
          } else if (__website && (txt.indexOf('www') !== -1 || txt.indexOf('http') !== -1)) {
            try { link.setAttribute('data-store-field', 'website'); } catch (e) {}
            if (svg) link.innerHTML = svg.outerHTML + ' ' + __website; else link.textContent = __website;
          }
        });
      }
      // Explicit data-setting hooks (contact page, about, authenticity…).
      try {
        var __map = {
          'store.name': __name, 'store.phone': __phone, 'store.phone2': __phone2,
          'store.email': __email, 'store.address': __addr, 'store.desc': __desc,
          'store.map_url': __mapUrl, 'store.hours': __hours,
          'store.hours_detail': __hoursDetail, 'store.website': __website
        };
        Object.keys(__map).forEach(function (k) {
          document.querySelectorAll('[data-setting="' + k + '"]').forEach(function (el) {
            if (k === 'store.map_url') { if (__map[k] && el.tagName === 'A') el.setAttribute('href', __map[k]); return; }
            if (!__map[k]) {
              if (k === 'store.phone2') { var __hc = el.closest ? (el.closest('.contact-method-card') || el.closest('.contact-info-item')) : null; if (__hc) { __hc.style.display = 'none'; if (__hc.tagName === 'A') __hc.removeAttribute('href'); } }
              return;
            }
            if (k === 'store.phone2') { var __sc = el.closest ? (el.closest('.contact-method-card') || el.closest('.contact-info-item')) : null; if (__sc) __sc.style.display = ''; }
            el.textContent = __map[k];
          });
        });
        if (__phone) document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
          if (a.hasAttribute('data-tel-keep')) return;
          a.setAttribute('href', __telHref(__phone));
        });
        if (__phone2) document.querySelectorAll('[data-phone2-card]').forEach(function (a) {
          a.setAttribute('href', __telHref(__phone2));
        });
        if (__email) document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) { a.setAttribute('href', 'mailto:' + __email); });
        try { __renderContactMap(__mapUrl); } catch (e) {}
      } catch (e) {}
      // Shipping info line on cart/checkout pages reflects threshold + cost.
      var cost = Math.round(Number(String(s['ship.cost']).replace(/[^0-9.-]/g, '')));
      var freeFrom = Math.round(Number(String(s['ship.free_from']).replace(/[^0-9.-]/g, '')));
      if (Number.isFinite(cost) && Number.isFinite(freeFrom)) {
        document.querySelectorAll('[data-setting="ship.hint"]').forEach(function (el) {
          try {
            el.textContent = freeFrom > 0
              ? ('ارسال رایگان برای سفارش‌های بالای ' + freeFrom.toLocaleString('en-US') + ' تومان')
              : ('هزینه ارسال: ' + cost.toLocaleString('en-US') + ' تومان');
          } catch (e) {}
        });
      }
    } catch (e) {}
  }
  Promise.all([
    fetch('/api/hero-slides?v='+Date.now(), {cache:'no-store'}).then(function(r){ return r.ok? r.json(): null; }).catch(function(){ return null; }),
    fetch('/api/content?v='+Date.now(), {cache:'no-store'}).then(function(r){ return r.ok? r.json(): null; }).catch(function(){ return null; }),
    fetch('/api/settings?v='+Date.now(), {cache:'no-store'}).then(function(r){ return r.ok? r.json(): null; }).catch(function(){ return null; })
  ]).then(function(results){
    var slides=results[0], c=results[1], s=results[2];
    renderHeroSlides(slides);
    if(c) applyContent(c);
    if(s) applySettings(s);
  });
})();