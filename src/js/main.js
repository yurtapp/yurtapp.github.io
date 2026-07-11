import '../css/main.scss';

document.addEventListener('DOMContentLoaded', () => {
  // ─── Nav: add shadow on scroll ──────────────────────────────────────────────
  const nav = document.querySelector('.site-header');

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Features dropdown ──────────────────────────────────────────────────────
  const dropdown = document.querySelector('.nav__dropdown');
  if (dropdown) {
    const trigger = dropdown.querySelector('.nav__dropdown-trigger');

    trigger.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ─── Smooth scroll for in-page anchor links ─────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
