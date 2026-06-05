/**
 * Dr. Abhishek Dental & Oral Cancer Centre
 * js/main.js — All UI interactions & animations
 */

'use strict';

/* ── UTILITY ─────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── DOM READY ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAnnounceBar();
  initNavbar();
  initHamburger();
  initDropdowns();
  initHeroSlider();
  initRevealObserver();
  initServiceCards();
  initCounters();
  initTechTabs();
  initTestimonialsSlider();
  initContactForm();
  initBackToTop();
  initFooterYear();
  initSmoothScrollLinks();
  initActiveNavHighlight();

  const dateInput = qs('#appt-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});

/* ── ANNOUNCE BAR ────────────────────────────────────────── */
function initAnnounceBar() {
  const bar   = qs('#announceBar');
  const close = qs('#announceClose');
  if (!bar || !close) return;

  if (sessionStorage.getItem('announceClosed')) {
    bar.classList.add('hidden');
  }

  close.addEventListener('click', () => {
    bar.style.maxHeight = bar.scrollHeight + 'px';
    bar.style.overflow  = 'hidden';
    bar.style.transition = 'max-height 0.35s ease, opacity 0.35s ease, padding 0.35s ease';
    requestAnimationFrame(() => {
      bar.style.maxHeight  = '0';
      bar.style.opacity    = '0';
      bar.style.paddingTop = '0';
      bar.style.paddingBottom = '0';
    });
    bar.addEventListener('transitionend', () => bar.classList.add('hidden'), { once: true });
    sessionStorage.setItem('announceClosed', '1');
  });
}

/* ── NAVBAR SCROLL EFFECT ────────────────────────────────── */
function initNavbar() {
  const nav = qs('#navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── HAMBURGER MENU ──────────────────────────────────────── */
function initHamburger() {
  const btn   = qs('#hamburger');
  const links = qs('#navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on nav link click
  qsa('.nav-item', links).forEach(item => {
    if (!item.classList.contains('nav-dropdown-toggle')) {
      item.addEventListener('click', closeMenu);
    }
  });

  function closeMenu() {
    links.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/* ── DROPDOWN MENUS ──────────────────────────────────────── */
function initDropdowns() {
  qsa('.nav-dropdown').forEach(dropdown => {
    const toggle = qs('.nav-dropdown-toggle', dropdown);
    if (!toggle) return;

    // Mobile: click toggle
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
      }
    });

    // Desktop: keyboard accessibility
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
      }
      if (e.key === 'Escape') {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  });
}

/* ── HERO SLIDER ─────────────────────────────────────────── */
function initHeroSlider() {
  const slides    = qsa('.hero-slide');
  const dots      = qsa('.dot', qs('#sliderDots'));
  const prevBtn   = qs('#heroPrev');
  const nextBtn   = qs('#heroNext');
  if (!slides.length) return;

  let current  = 0;
  let timer    = null;
  const DELAY  = 5000;

  function goTo(idx) {
    if (idx === current) return;
    const prev = current;
    current = ((idx % slides.length) + slides.length) % slides.length;

    slides[prev].classList.remove('active');
    slides[current].classList.add('active');

    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function autoplay() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DELAY);
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); autoplay(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); autoplay(); });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); autoplay(); });
  });

  // Touch / swipe
  let touchStartX = 0;
  const slider = qs('#heroSlider');
  if (slider) {
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        goTo(dx < 0 ? current + 1 : current - 1);
        autoplay();
      }
    }, { passive: true });
  }

  // Pause on hover
  slider?.addEventListener('mouseenter', () => clearInterval(timer));
  slider?.addEventListener('mouseleave', () => {});
}

/* ── SCROLL REVEAL ───────────────────────────────────────── */
function initRevealObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  qsa('.reveal').forEach(el => obs.observe(el));
}

/* ── SERVICE CARDS (staggered reveal) ───────────────────── */
function initServiceCards() {
  const cards = qsa('.service-card');
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  cards.forEach(card => obs.observe(card));
}

/* ── COUNTER ANIMATION ───────────────────────────────────── */
function initCounters() {
  const counters = qsa('.stat-num');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target || '0', 10);
    const duration = 1800;
    const start    = performance.now();

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const val      = Math.round(easeOutCubic(progress) * target);
      el.textContent = val.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => obs.observe(counter));
}

/* ── TECHNOLOGY TABS ─────────────────────────────────────── */
function initTechTabs() {
  const tabs   = qsa('.tech-tab', qs('#techTabs'));
  const panels = qsa('.tech-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(p => p.classList.remove('active'));
      const panel = qs(`#panel-${id}`);
      if (panel) panel.classList.add('active');
    });

    // Keyboard: arrow navigation
    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') {
        tabs[(idx + 1) % tabs.length].focus();
        tabs[(idx + 1) % tabs.length].click();
      }
      if (e.key === 'ArrowLeft') {
        tabs[(idx - 1 + tabs.length) % tabs.length].focus();
        tabs[(idx - 1 + tabs.length) % tabs.length].click();
      }
    });
  });
}

/* ── TESTIMONIALS SLIDER ─────────────────────────────────── */
function initTestimonialsSlider() {
  const track   = qs('#testimonialsTrack');
  const prevBtn = qs('#testPrev');
  const nextBtn = qs('#testNext');
  if (!track) return;

  let current = 0;

  function getVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getCardWidth() {
    const cards = qsa('.testimonial-card', track);
    if (!cards.length) return 0;
    return cards[0].offsetWidth + 24; // 24 = gap
  }

  function getMaxIndex() {
    const cards   = qsa('.testimonial-card', track).length;
    const visible = getVisible();
    return Math.max(0, cards - visible);
  }

  function slideTo(idx) {
    const max = getMaxIndex();
    current = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
  }

  prevBtn?.addEventListener('click', () => slideTo(current - 1));
  nextBtn?.addEventListener('click', () => slideTo(current + 1));

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) slideTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  window.addEventListener('resize', () => slideTo(0));
}

/* ── CONTACT FORM ────────────────────────────────────────── */
function initContactForm() {
  const form = qs('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    const required = qsa('[required]', form);
    required.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'var(--clr-accent)';
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) { shakeForm(form); return; }

    const phone = qs('#phone');
    if (phone && phone.value.replace(/\D/g, '').length < 10) {
      phone.style.borderColor = 'var(--clr-accent)';
      shakeForm(form);
      return;
    }

    // Grab all values
    const fname     = qs('#fname')?.value.trim() || '';
    const lname     = qs('#lname')?.value.trim() || '';
    const userPhone = qs('#phone')?.value.trim() || '';
    const email     = qs('#email')?.value.trim() || '';
    const treatment = qs('#treatment')?.value || 'Not specified';
    const message   = qs('#message')?.value.trim() || '';
    const apptDate = qs('#appt-date')?.value || '';
    const apptTime = qs('#appt-time')?.value || 'Not selected';

    // Build WhatsApp message
const text =
`Hello Dr. Abhishek Dental Centre,

I would like to book an appointment.

*Name:* ${fname} ${lname}
*Phone:* ${userPhone}
*Email:* ${email || 'Not provided'}
*Treatment:* ${treatment}
*Date:* ${apptDate}
*Time:* ${apptTime}
*Message:* ${message || 'None'}

Please confirm my appointment. Thank you!`;

    // Replace with Dr. Abhishek's actual WhatsApp number (with country code, no + or spaces)
    const doctorNumber = '916391423669';

    const whatsappURL = `https://wa.me/${doctorNumber}?text=${encodeURIComponent(text)}`;

    window.open(whatsappURL, '_blank');
  });

  // Clear error on input
  qsa('input, select, textarea', form).forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
}

function shakeForm(form) {
  form.style.animation = 'none';
  requestAnimationFrame(() => {
    form.style.animation = 'formShake 0.5s ease';
  });
}

// Inject shake keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes formShake {
    0%, 100% { transform: translateX(0); }
    15%, 45%, 75% { transform: translateX(-6px); }
    30%, 60%      { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);

/* ── BACK TO TOP ─────────────────────────────────────────── */
function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── FOOTER YEAR ─────────────────────────────────────────── */
function initFooterYear() {
  const el = qs('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── SMOOTH SCROLL LINKS ─────────────────────────────────── */
function initSmoothScrollLinks() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = qs(`#${id}`);
      if (!target) return;
      e.preventDefault();

      const navbar  = qs('#navbar');
      const offset  = (navbar?.offsetHeight || 72) + 8;
      const top     = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── ACTIVE NAV HIGHLIGHT ON SCROLL ─────────────────────── */
function initActiveNavHighlight() {
  const sections = qsa('section[id]');
  const navItems = qsa('.nav-item[href^="#"]');
  if (!sections.length || !navItems.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ── LAZY LOAD IMAGES (future-proof) ────────────────────── */
if ('loading' in HTMLImageElement.prototype) {
  qsa('img[data-src]').forEach(img => {
    img.src = img.dataset.src;
  });
} else {
  // Fallback for older browsers
  const lazyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          lazyObs.unobserve(img);
        }
      }
    });
  });
  qsa('img[data-src]').forEach(img => lazyObs.observe(img));
}

/* ── CURSOR GLOW (subtle premium feel) ──────────────────── */
(function initCursorGlow() {
  // Only on desktop
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(2, 132, 199, 0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
    will-change: left, top;
  `;
  document.body.appendChild(glow);

  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

// Auto-rotate tech tabs
const tabs = document.querySelectorAll('.tech-tab');
let current = 0;
let autoPlay;

function switchTab(index) {
  const panels = document.querySelectorAll('.tech-panel');
  const currentPanel = panels[current];

  // Fade out current
  if (currentPanel) {
    currentPanel.classList.add('fading');
    currentPanel.classList.remove('active');
  }

  setTimeout(() => {
    if (currentPanel) currentPanel.classList.remove('fading');

    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => p.classList.remove('active'));

    tabs[index].classList.add('active');
    tabs[index].setAttribute('aria-selected', 'true');
    panels[index]?.classList.add('active');
    current = index;
  }, 400); // matches fade-out duration
}

function startAutoPlay() {
  autoPlay = setInterval(() => {
    const next = (current + 1) % tabs.length;
    switchTab(next);
  }, 6000); // 3 seconds per tab
}

function stopAutoPlay() {
  clearInterval(autoPlay);
}

// Pause on manual click, resume after 6s
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => {
    stopAutoPlay();
    switchTab(i);
    setTimeout(startAutoPlay, 6000);
  });
});

startAutoPlay();

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.nextElementSibling.classList.remove('open');
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});

 // Duplicate cards for seamless infinite loop
  const track = document.getElementById('carouselTrack');
  track.innerHTML += track.innerHTML;

