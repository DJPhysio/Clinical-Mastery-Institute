// =============================================
// CLINICAL MASTERY INSTITUTE — SHARED PAGE JS
// Nav behaviour is handled by components.js
// =============================================

// --- Fade-up scroll animations ---
var fadeEls = document.querySelectorAll(
  '.service-card, .contact-item, .about-stats .stat, .feature-card, .blog-card'
);
fadeEls.forEach(function (el) { el.classList.add('fade-up'); });

var fadeObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      var siblings = Array.from(entry.target.parentElement.children);
      entry.target.style.transitionDelay = (siblings.indexOf(entry.target) * 80) + 'ms';
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(function (el) { fadeObserver.observe(el); });

// --- GA4 event helper (safe no-op until gtag is ready) ---
function trackEvent(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params);
}

// --- Book-call CTA click tracking ---
// Fires 'book_call_click' with button_location on any element with data-track-book
document.querySelectorAll('[data-track-book]').forEach(function (el) {
  el.addEventListener('click', function () {
    trackEvent('book_call_click', { button_location: el.dataset.trackBook });
  });
});

// --- Calendly: booking completion event + iframe accessibility ---
window.addEventListener('message', function (e) {
  if (e.origin !== 'https://calendly.com') return;
  if (e.data && e.data.event === 'calendly.event_scheduled') {
    trackEvent('calendly_booking_complete', {});
  }
});

// Add accessible title to the Calendly iframe once Calendly injects it
var calendlyIframeObserver = new MutationObserver(function () {
  var frame = document.querySelector('.calendly-inline-widget iframe');
  if (frame && !frame.hasAttribute('title')) {
    frame.setAttribute('title', 'Book a Free Discovery Call — Calendly');
    calendlyIframeObserver.disconnect();
  }
});
if (document.querySelector('.calendly-inline-widget')) {
  calendlyIframeObserver.observe(document.body, { childList: true, subtree: true });
}

// --- Enquiry form: inline field validation ---
function validateField(input) {
  var group   = input.closest('.form-group');
  var errorEl = group && group.querySelector('.field-error');
  if (!errorEl) return true;

  var msg = '';
  if (input.validity.valueMissing) {
    msg = 'This field is required.';
  } else if (input.validity.typeMismatch && input.type === 'email') {
    msg = 'Please enter a valid email address.';
  }

  group.classList.toggle('has-error', !!msg);
  errorEl.textContent = msg;
  return !msg;
}

// --- Enquiry form submission (Formspree) ---
var form         = document.getElementById('enquiry-form');
var successPanel = document.getElementById('form-success');
var globalError  = document.getElementById('form-error-global');
var resetBtn     = document.getElementById('form-reset-btn');

if (form) {
  // Validate required fields on blur + re-validate on input while in error state
  form.querySelectorAll('input[required], select[required]').forEach(function (input) {
    input.addEventListener('blur',  function () { validateField(input); });
    input.addEventListener('input', function () {
      if (input.closest('.form-group') && input.closest('.form-group').classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var required  = Array.from(form.querySelectorAll('input[required], select[required]'));
    var allValid  = required.map(function (f) { return validateField(f); }).every(Boolean);
    if (!allValid) {
      var firstInvalid = required.find(function (f) { return !f.validity.valid; });
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Mirror email into _replyto so Formspree threads replies correctly
    var replyTo = document.getElementById('_replyto');
    var emailEl = document.getElementById('email');
    if (replyTo && emailEl) replyTo.value = emailEl.value;

    var btn      = form.querySelector('button[type="submit"]');
    var original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled    = true;
    if (globalError) globalError.hidden = true;

    try {
      var res = await fetch('https://formspree.io/f/mdajbrea', {
        method:  'POST',
        headers: { Accept: 'application/json' },
        body:    new FormData(form),
      });

      if (res.ok) {
        form.hidden = true;
        if (successPanel) successPanel.hidden = false;
        trackEvent('generate_lead', { method: 'enquiry_form' });
      } else {
        throw new Error('non-ok');
      }
    } catch (err) {
      if (globalError) globalError.hidden = false;
      btn.textContent = original;
      btn.disabled    = false;
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', function () {
    if (form) {
      form.reset();
      form.hidden = false;
      form.querySelectorAll('.form-group').forEach(function (g) { g.classList.remove('has-error'); });
      form.querySelectorAll('.field-error').forEach(function (el) { el.textContent = ''; });
    }
    if (successPanel) successPanel.hidden = true;
    if (globalError)  globalError.hidden  = true;
  });
}
