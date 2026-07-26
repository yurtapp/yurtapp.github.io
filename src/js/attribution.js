// ─── Visitor attribution ──────────────────────────────────────────────────────
//
// Captures where a visitor came from and makes it available to the Rails app at
// app.yurthome.co. Two mechanisms, deliberately redundant:
//
//   1. A cookie on `.yurthome.co`, readable from both this site and the app.
//      This is the primary channel — it survives visitors who wander around the
//      marketing site for a while before signing up.
//   2. Campaign params appended to outbound app.yurthome.co links, as a fallback
//      for when the cookie is blocked or cleared.
//
// We keep both first-touch (never overwritten) and last-touch (rewritten on any
// visit that carries new campaign signal).

const COOKIE_DOMAIN = 'yurthome.co';
const FIRST_TOUCH_COOKIE = 'yh_attr_first';
const LAST_TOUCH_COOKIE = 'yh_attr_last';
const TTL_DAYS = 90;

// Params worth capturing. utm_* and ref/source are what Plausible itself reads;
// gclid/msclkid are set automatically by Google Ads and Microsoft Ads.
const CAMPAIGN_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'msclkid',
  'ref',
  'source',
];

const MAX_PARAM_LENGTH = 255;
const MAX_REFERRER_LENGTH = 500;

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const isOwnHost = (hostname) =>
  hostname === COOKIE_DOMAIN || hostname.endsWith(`.${COOKIE_DOMAIN}`);

const writeCookie = (name, value) => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${TTL_DAYS * 24 * 60 * 60}`,
    'samesite=lax',
  ];

  // Scope to the parent domain so app.yurthome.co can read it. Skipped on
  // localhost, where a `.yurthome.co` cookie would simply be rejected.
  if (isOwnHost(location.hostname)) {
    parts.push(`domain=.${COOKIE_DOMAIN}`);
  }

  if (location.protocol === 'https:') {
    parts.push('secure');
  }

  document.cookie = parts.join('; ');
};

// A referrer from our own site is an internal hop, not an acquisition source.
const isInternalReferrer = (referrer) => {
  try {
    return isOwnHost(new URL(referrer).hostname);
  } catch (e) {
    return false;
  }
};

const parseCookie = (name) => {
  const raw = readCookie(name);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

// Snapshot of how the visitor arrived at the current page.
const capture = () => {
  const query = new URLSearchParams(location.search);
  const attribution = {};

  CAMPAIGN_PARAMS.forEach((param) => {
    const value = query.get(param);
    if (value) {
      attribution[param] = value.trim().toLowerCase().slice(0, MAX_PARAM_LENGTH);
    }
  });

  if (document.referrer && !isInternalReferrer(document.referrer)) {
    attribution.referrer = document.referrer.slice(0, MAX_REFERRER_LENGTH);
  }

  attribution.landing_page = location.pathname;
  attribution.ts = new Date().toISOString();

  return attribution;
};

// Direct traffic with no referrer tells us nothing new, so it shouldn't be
// allowed to overwrite an earlier last-touch record.
const hasSignal = (attribution) =>
  CAMPAIGN_PARAMS.some((param) => attribution[param]) || Boolean(attribution.referrer);

// Forward only the campaign params — the referrer and landing page would bloat
// the URL, and the cookie already carries them.
//
// Signup links only. Tagging a login link would make an existing user's return
// visit look like fresh campaign traffic to Plausible, which reads UTM params
// off the URL on app.yurthome.co too.
const decorateAppLinks = (attribution) => {
  document.querySelectorAll('a[href*="app.yurthome.co"]').forEach((link) => {
    let url = null;

    try {
      url = new URL(link.href);
    } catch (e) {
      return;
    }

    if (!url.pathname.startsWith('/signup')) return;

    CAMPAIGN_PARAMS.forEach((param) => {
      // Never clobber params already on the link, e.g. ?plan=plus
      if (attribution[param] && !url.searchParams.has(param)) {
        url.searchParams.set(param, attribution[param]);
      }
    });

    link.href = url.toString();
  });
};

export const initAttribution = () => {
  const current = capture();

  if (!parseCookie(FIRST_TOUCH_COOKIE)) {
    writeCookie(FIRST_TOUCH_COOKIE, JSON.stringify(current));
  }

  if (hasSignal(current)) {
    writeCookie(LAST_TOUCH_COOKIE, JSON.stringify(current));
  }

  const forwarded = parseCookie(LAST_TOUCH_COOKIE) || parseCookie(FIRST_TOUCH_COOKIE) || current;

  decorateAppLinks(forwarded);
};
