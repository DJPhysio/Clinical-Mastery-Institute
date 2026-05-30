// =============================================
// THE PHYSIO INSTITUTE — JAVASCRIPT
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
  navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
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

// --- Enquiry form submission (Formspree) ---
const form = document.getElementById('enquiry-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Mirror email into _replyto so Formspree threads replies correctly
  document.getElementById('_replyto').value = document.getElementById('email').value;

  const btn      = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/mdajbrea', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });

    if (res.ok) {
      btn.textContent = 'Message sent!';
      form.reset();
    } else {
      throw new Error('non-ok response');
    }
  } catch {
    btn.textContent = 'Something went wrong — please try again';
    btn.disabled = false;
  }

  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 4000);
});
