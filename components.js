(function () {
  'use strict';

  // ============================================================
  // CONFIGURATION — update GA_MEASUREMENT_ID before launch
  // ============================================================
  var GA_MEASUREMENT_ID = 'G-JJELL0KQ13';

  // ============================================================
  // GOOGLE ANALYTICS 4
  // ============================================================
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

  (function () {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
  })();

  // ============================================================
  // META PIXEL — uncomment and set PIXEL_ID to enable
  // ============================================================
  /*
  var PIXEL_ID = 'YOUR_PIXEL_ID';
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  */

  // ============================================================
  // COMPONENT LOADING
  // ============================================================
  function loadHTML(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
      return res.text();
    });
  }

  function init() {
    var main = document.querySelector('main');
    if (!main) return;

    Promise.all([
      loadHTML('/components/nav.html'),
      loadHTML('/components/footer.html'),
    ]).then(function (results) {
      main.insertAdjacentHTML('beforebegin', results[0]);
      main.insertAdjacentHTML('afterend',   results[1]);
      initNav();
    }).catch(function (err) {
      console.warn('CMI: component load failed —', err.message);
    });
  }

  // ============================================================
  // NAV BEHAVIOUR
  // ============================================================
  function initNav() {
    var navbar    = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var navLinks  = document.getElementById('nav-links');

    if (!navbar) return;

    // Scroll effect
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // Hamburger toggle
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        var open = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open);
      });
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          navLinks.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Active link highlighting based on current URL path
    setActiveLink();
  }

  function setActiveLink() {
    var path = window.location.pathname;
    document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '/') return;
      // Trim trailing slash for comparison
      var hrefClean = href.replace(/\/$/, '');
      var pathClean = path.replace(/\/$/, '');
      var active = pathClean === hrefClean ||
                   (hrefClean.length > 0 && pathClean.startsWith(hrefClean + '/'));
      a.classList.toggle('active', active);
    });
  }

  init();
})();
