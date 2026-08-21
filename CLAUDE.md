# Yurt Marketing Site

Static marketing site for [Yurt](https://yurthome.co), a home management app.
Plain HTML + SCSS + vanilla JS, bundled by webpack, served by GitHub Pages.

The product application lives at `app.yurthome.co` in a **separate Rails repo**
that is not part of this build.

## Layout

| Path | Role |
|---|---|
| `src/*.html` | Page templates (html-webpack-plugin, EJS interpolation) |
| `src/css/` | SCSS — `main.scss` and `pricing.scss` are the two roots, partials are `_*.scss` |
| `src/js/` | `main.js` and `pricing.js` entry points, plus `attribution.js` / `cta-events.js` |
| `src/images/`, `robots.txt`, `sitemap.xml` | Copied to the output verbatim |
| `docs/` | **Build output — never edit.** `yarn build` deletes everything here except `CNAME`. |

Two webpack entries: `pricing.html` gets its own `pricing` chunk; every other
page (`index`, `404`, and the three feature pages) uses `main`. Anything that
must run on all pages has to be wired into **both** entry points.

Feature pages are emitted into directories for clean URLs — `src/expense-tracking.html`
builds to `docs/expense-tracking/index.html`.

## Commands

```bash
yarn install
yarn dev          # dev server at http://localhost:3035, hot reload
yarn build        # production build into docs/
yarn lint:js      # eslint --fix over src/js
yarn lint:css     # stylelint --fix over src/css
yarn format       # prettier over src/**/*.{js,scss,html}
```

Node 22 (`.nvmrc`). Yarn 1.x — use `yarn`, not `npm`. There is no test suite.

Deployment is GitHub Pages serving `docs/` off the default branch, so a build
must be committed for a change to go live. Commit `docs/` and `src/` together.

The Plausible snippet is only rendered when `isProd` is true, so
`window.plausible` is undefined under `yarn dev` — analytics code must no-op
rather than throw when it is missing.

The snippet loads Plausible through the Rails app's **first-party proxy**, not
`plausible.io`: `https://app.yurthome.co/pa.js`, with
`plausible.init({ endpoint: 'https://app.yurthome.co/pa/e' })`. Absolute URLs,
because this site is a different host from the proxy. Ad blockers match on the
`plausible.io` domain, so hitting it directly loses the tracker and every event.
The snippet is duplicated across all six `src/*.html` files — change them
together.

## Attribution

Full detail lives in `ATTRIBUTION.md` — read it only when changing attribution
behavior. Summary:

**Goal.** Know which upstream channel drove each signup, across the boundary
between this static site and the Rails app.

**Two independent systems, which will disagree, and neither is wrong:**

- **Plausible** — aggregate, session-scoped, *last touch*. Answers "which
  channel is working this month."
- **Rails database** — per-user, permanent, *first touch* (last touch also
  stored). Answers "where did this specific user come from." Not yet built.

Do not try to reconcile their numbers.

**How it works on this site** (`src/js/attribution.js`, initialised from both
entry points):

- On page load, campaign params (`utm_*`, `gclid`, `msclkid`, `ref`, `source`)
  and the referrer are captured, lowercased, and written as JSON into two
  cookies scoped to `.yurthome.co`, 90-day TTL: `yh_attr_first` (written only
  if absent — never overwritten) and `yh_attr_last` (rewritten on any visit
  carrying real signal).
- The `.yurthome.co` scope is the entire cross-host mechanism: `app.yurthome.co`
  is a subdomain, so Rails can read the same cookie. No ID syncing, no redirects.
- "Real signal" = a campaign param or an *external* referrer. Direct visits
  never overwrite last touch. Referrers from `yurthome.co` or its subdomains
  are internal hops and are discarded.
- Every `<a>` into `app.yurthome.co/signup` has campaign params appended to its
  `href` as a redundant fallback for blocked cookies. Existing params (e.g.
  `?plan=plus`) are never clobbered.
- The cookie is skipped on localhost, where a `.yurthome.co` cookie would be
  rejected.

**Analytics transport.** Both this site and the Rails app load the tracker
through the proxy the Rails app serves (`GET /pa.js`, `POST /pa/e`). One
consequence matters here: this site no longer hardcodes the Plausible site key,
so `PLAUSIBLE_ANALYTICS_KEY` in the Rails environment is the single definition
of which Plausible site both hosts report to. If it drifts, the two hosts stop
sharing sessions and every signup is attributed to `yurthome.co` as a referral.

**CTA events** (`src/js/cta-events.js`): one delegated click listener fires
`Signup CTA: <Location>` to Plausible. The location comes from a `data-cta`
attribute on the link or nearest ancestor — `nav`, `hero`, `banner`, `footer`,
`pricing-basic`, `pricing-plus` — falling back to `Signup CTA: Other` as a
tripwire for an unmarked CTA.

**Invariants — breaking these corrupts the data:**

1. **Signup links only.** Login links get neither decoration nor events.
   Decorating a login link makes a returning user look like fresh campaign
   traffic and inflates the exact numbers this system measures.
2. **First touch is immutable.** `yh_attr_first` is written once, ever.
3. **Self-referrals are never recorded** — on this site *and* on the Rails side,
   where `request.referer` will legitimately be `https://yurthome.co/...`.
4. **Adding a CTA** means adding `data-cta`, adding the value to
   `CTA_LOCATIONS`, and creating the matching goal in Plausible *before*
   deploying. Plausible does not backfill goals, and goal names must match
   event names character for character.
5. **Both entry points.** New analytics wiring goes in `main.js` *and*
   `pricing.js`.

**Status.** Everything on this site is implemented, including the proxy
snippet. On the Rails side only the analytics proxy exists. The rest of the
Rails half — reading the cookie, persisting `signup_attributions`, firing
`Signup` / `Signup Started` — is specified in `ATTRIBUTION.md` but not built.
