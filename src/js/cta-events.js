// ─── CTA click tracking ───────────────────────────────────────────────────────
//
// Fires a named Plausible event for every click on a link into app.yurthome.co,
// so we can see which CTA on which page actually drives signups.
//
// The event name is derived from a `data-cta` attribute on the link or its
// nearest ancestor — deliberately explicit rather than inferred from CSS class
// names, since event names are a contract with the Plausible dashboard and a
// redesign shouldn't silently rename a goal and split its history.
//
// Every name below needs to be registered as a goal in Plausible before it will
// show up in the Goal Conversions report.
//
// Signup links only. Login clicks are existing users, whose acquisition source
// we already recorded when they first signed up — and custom events count
// toward the Plausible billing quota, so there's no reason to pay to ingest
// them.

const SIGNUP_PATH = '/signup';

// data-cta value → human-readable location used in the event name.
const CTA_LOCATIONS = {
  nav: 'Nav',
  hero: 'Hero',
  banner: 'Banner',
  footer: 'Footer',
  'pricing-basic': 'Pricing Basic',
  'pricing-plus': 'Pricing Plus',
};

const eventNameFor = (link) => {
  if (!new URL(link.href).pathname.startsWith(SIGNUP_PATH)) return null;

  const container = link.closest('[data-cta]');
  // 'Other' is a tripwire: a new signup CTA added without a data-cta marker
  // still gets counted, rather than disappearing silently.
  const ctaLocation = (container && CTA_LOCATIONS[container.dataset.cta]) || 'Other';

  return `Signup CTA: ${ctaLocation}`;
};

const track = (event) => {
  const link = event.target.closest('a[href*="app.yurthome.co"]');
  if (!link) return;

  const name = eventNameFor(link);
  if (!name) return;

  // Undefined in development, where the Plausible snippet isn't rendered.
  if (typeof window.plausible !== 'function') return;

  // Props are a Business plan feature; they're ignored on lower plans, which is
  // why the CTA location is baked into the event name as well.
  window.plausible(name, { props: { page: window.location.pathname } });
};

export const initCtaEvents = () => {
  document.addEventListener('click', track);
};
