// =============================================
// CLINICAL MASTERY INSTITUTE — JAVASCRIPT
// =============================================

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// --- Hamburger menu ---
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// --- Active nav link on scroll ---
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });
  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
  });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });

// --- Fade-up scroll animations ---
const fadeEls = document.querySelectorAll(
  '.service-card, .contact-item, .about-stats .stat'
);
fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.children];
      entry.target.style.transitionDelay = `${siblings.indexOf(entry.target) * 80}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// --- GA4 event helper (safe no-op if gtag not yet loaded) ---
function trackEvent(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params);
}

// --- Book-call click tracking ---
// Fires 'book_call_click' with button_location for each CTA that has data-track-book
document.querySelectorAll('[data-track-book]').forEach(el => {
  el.addEventListener('click', () => {
    trackEvent('book_call_click', { button_location: el.dataset.trackBook });
  });
});

// --- Calendly: booking completion event + iframe accessibility title ---
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://calendly.com') return;
  if (e.data?.event === 'calendly.event_scheduled') {
    trackEvent('calendly_booking_complete', {});
  }
});

// Add an accessible title to the Calendly iframe once Calendly injects it into the DOM
const calendlyWidgetObserver = new MutationObserver(() => {
  const frame = document.querySelector('.calendly-inline-widget iframe');
  if (frame && !frame.hasAttribute('title')) {
    frame.setAttribute('title', 'Book a Free Discovery Call — Calendly');
    calendlyWidgetObserver.disconnect();
  }
});
calendlyWidgetObserver.observe(document.body, { childList: true, subtree: true });

// --- Enquiry form: inline field validation ---
function validateField(input) {
  const group   = input.closest('.form-group');
  const errorEl = group?.querySelector('.field-error');
  if (!errorEl) return true;

  let msg = '';
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
const form         = document.getElementById('enquiry-form');
const successPanel = document.getElementById('form-success');
const globalError  = document.getElementById('form-error-global');
const resetBtn     = document.getElementById('form-reset-btn');

// Validate on blur, and re-validate on input while in error state
form.querySelectorAll('input[required], select[required]').forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.closest('.form-group')?.classList.contains('has-error')) {
      validateField(input);
    }
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const requiredFields = [...form.querySelectorAll('input[required], select[required]')];
  const allValid = requiredFields.map(f => validateField(f)).every(Boolean);
  if (!allValid) {
    requiredFields.find(f => !f.validity.valid)?.focus();
    return;
  }

  // Mirror email into _replyto so Formspree threads replies correctly
  document.getElementById('_replyto').value = document.getElementById('email').value;

  const btn      = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled    = true;
  globalError.hidden = true;

  try {
    const res = await fetch('https://formspree.io/f/mdajbrea', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });

    if (res.ok) {
      form.hidden = true;
      successPanel.hidden = false;
      trackEvent('generate_lead', { method: 'enquiry_form' });
    } else {
      throw new Error('non-ok');
    }
  } catch {
    globalError.hidden = false;
    btn.textContent = original;
    btn.disabled    = false;
  }
});

// Reset back to form view when user clicks "Send another message"
resetBtn.addEventListener('click', () => {
  form.reset();
  form.hidden       = false;
  successPanel.hidden = true;
  form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
  form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
  globalError.hidden = true;
});
