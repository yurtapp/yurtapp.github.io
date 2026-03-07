import '../css/pricing.scss';

const PRICES = {
  monthly: {
    amount: 9,
    cents: '99',
    formatted: '9',
    period: '/ mo',
    perProp: 'per property, per month',
  },
  yearly: {
    amount: 79,
    cents: '99',
    formatted: '79',
    period: '/ yr',
    perProp: 'per property, per year · save $40',
  },
};

document.addEventListener('DOMContentLoaded', () => {
  // ─── Nav scroll shadow ──────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
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

  // ─── Pricing toggle ─────────────────────────────────────────────────────────
  const toggleInput = document.getElementById('billing-toggle');
  const monthlyLabel = document.getElementById('label-monthly');
  const yearlyLabel = document.getElementById('label-yearly');
  const priceAmount = document.getElementById('price-amount');
  const pricePeriod = document.getElementById('price-period');
  const pricePerProp = document.getElementById('price-per-prop');

  if (!toggleInput) return;

  const update = () => {
    const interval = toggleInput.checked ? 'yearly' : 'monthly';
    const price = PRICES[interval];

    priceAmount.textContent = price.formatted;
    pricePeriod.textContent = price.period;
    pricePerProp.textContent = price.perProp;

    monthlyLabel.classList.toggle('is-active', !toggleInput.checked);
    yearlyLabel.classList.toggle('is-active', toggleInput.checked);
  };

  toggleInput.addEventListener('change', update);

  // Default to yearly
  toggleInput.checked = true;
  update();

  // ─── FAQ accordion ──────────────────────────────────────────────────────────
  document.querySelectorAll('.faq-item__question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');

      // Close all
      document
        .querySelectorAll('.faq-item.is-open')
        .forEach((el) => el.classList.remove('is-open'));

      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });
});
