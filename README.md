# ULMOX Website

Static, dependency-free HTML/CSS/JavaScript website for `ulmoxapp.com`. The
repository contains the main marketing page, 19 localized versions, legal and
support pages, and the smart `/download/` landing page.

## Development and verification

No framework or local environment file is required. The website continues to
work when analytics is not configured.

```sh
npm run lint
npm test
npm run build
```

`npm run build` creates the deployable website in `dist/`. Do not deploy the
repository source directly after enabling GA4; deploy `dist/` so the build-time
analytics configuration and tags are included on every HTML page.

## Legal and policy pages are generated, never hand-edited

The five policy pages — Privacy, Terms, Child Safety, Support and Account
Deletion — exist in 20 renditions each: the canonical English routes at the site
root, and one per locale. All of them are generated. Editing
`tr/privacy.html` by hand is a change the next `npm run generate` throws away.

| Source | What it holds |
| --- | --- |
| `scripts/generate-legal-pages.js` | The canonical English policy text, and the only place it lives |
| `scripts/policy-schema.js` | Section order and block shape of the canonical pages, with stable section IDs |
| `scripts/policy-locales/<code>.js` | One translated string per slot, for each of the 18 translated locales |
| `scripts/generate-localized-policies.js` | Renders the 95 localized routes; `/en/*` mirrors the canonical pages rather than a second English copy |

```sh
npm run generate      # regenerate every generated route; idempotent
npm run parity        # 5-page x 19-locale section-coverage matrix
npm run scan:claims   # stale claims, repeated content, revision drift
npm run audit         # accessibility and local references, over dist/
```

To change a policy: edit the canonical English text in
`scripts/generate-legal-pages.js`, update `scripts/policy-schema.js` if the
block structure changed, add the corresponding string to all 18 locale files,
and run `npm run generate`. A locale that is missing a slot cannot be rendered —
the generator throws, and `npm test` fails — so a policy change cannot ship in
one language only.

## The landing pages are generated too

The 20 landing routes — `/` and `/<locale>/` — are generated, not hand-edited,
for the same reason the policy pages are: 20 near-identical files diverged into
20 slightly different defects once already.

| Source | What it holds |
| --- | --- |
| `scripts/landing-content.js` | Every localized string on the page, one block per locale |
| `scripts/generate-landing-pages.js` | The page template, the stylesheet and the search/social metadata |

The page has eight sections: Hero, How ULMOX works, World Live, Connections,
Global, Why ULMOX is different, Safety and control, and the download call to
action. Three rules govern what may be written into `landing-content.js`:

1. **No page may say Connections is on for everyone.** The availability
   sentence is not written there — the Connections section renders each
   locale's `webGradualRollout` from `scripts/translation-content.js`, which is
   the same sentence the six legal pages carry.
2. **No page may promise that sharing a Moment produces a Connection.** The
   copy says a genuine encounter *can* make one possible, which is what
   `/terms.html` §3 says.
3. **No statistic, testimonial, user count, rating or review**, in any locale.
   `tests/landing-pages.test.js` fails on a two-digit number in any slot but the
   copyright line.

`World Live`, `Global` and `Connections` stay in English in every locale — the
convention the localized legal pages already use. Everything else is
translated.

### Imagery

This repository owns three pieces of ULMOX artwork: `logo.png` and the two
store badges. There are no product screenshots here, so the pages show none and
invent none; every other illustration is an `aria-hidden` drawing in CSS or
inline SVG. `assets/brand/*.png` are resized renditions of `logo.png` itself,
so a page no longer loads 1.4 MB to draw a 64px mark. `logo.png` stays at its
own URL.

```sh
npm run generate      # regenerates the landing routes with everything else
node --test tests/landing-pages.test.js
```

## Previewing the site locally

`npm run build` writes the deployable site to `dist/`. Serve that directory —
the pages use root-relative paths, so opening an HTML file directly will not
load the stylesheets, the badges or the language switcher:

```sh
npm run build
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080/en/` (or any other locale). `/` redirects to a
locale using the browser's language.

Use a server that does not rewrite URLs. `npx serve` strips `.html` by default
— `/en/privacy.html` becomes a 301 to `/en/privacy` — so the footer links
behave differently in preview from how they behave on GitHub Pages, which
serves those paths directly. The one-line Python server above does not rewrite
anything.

## Google Analytics 4 setup

1. Open Google Analytics and create or select the ULMOX GA4 property.
2. Create a Web Data Stream for the production ULMOX domain.
3. Copy its Measurement ID in the format `G-XXXXXXXXXX`.
4. Configure `GA_MEASUREMENT_ID` in the production build environment. For
   GitHub Actions, use a repository variable named `GA_MEASUREMENT_ID` rather
   than committing an `.env` file.
5. Build the site:

   ```sh
   GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build
   ```

6. Deploy the generated `dist/` directory with the GitHub Pages workflow.
7. Open the deployed site and verify page views and store events with GA4
   Realtime and DebugView.

The Measurement ID is intentionally not hardcoded. `.env.example` documents
the variable name, and local `.env` files are ignored. An absent ID disables
analytics without producing browser errors.

### Events

GA4 automatically records the initial page view and standard campaign
attribution, including `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, and `utm_term`.

Custom events:

- `app_store_click`
- `google_play_click`
- `download_click`

Store events include `platform`, `destination`, `store`, `page_path`,
`button_location`, and `link_url`. The smart download page also records its
automatic iOS/Android redirect with `button_location=automatic_device_redirect`.
Tracking never calls `preventDefault`, so existing links and redirects continue
normally.

Recommended campaign URLs:

```text
https://ulmoxapp.com/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=ulmox_global_test
https://ulmoxapp.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=ulmox_global_test
```

Add `utm_content` for creative/ad variants and `utm_term` when a campaign uses
keyword targeting. Do not replace these standard parameters with custom
attribution parameters.

## Privacy and consent

The inspected website had no analytics, cookie banner, consent-management
platform, or tracking-cookie implementation before this integration. This
change does not add a speculative cookie banner and does not enable Google Ads,
remarketing, Google Signals, or advertising personalization.

The centralized helper is compatible with a future consent manager. A CMP can
set this before analytics initializes:

```html
<script>window.ULMOX_ANALYTICS_CONSENT = "denied";</script>
```

It can later update Consent Mode without reinitializing GA4:

```js
document.dispatchEvent(new CustomEvent("ulmox:analytics-consent", {
  detail: { analyticsGranted: true }
}));
```

Advertising consent remains denied in both cases. Any future consent rollout
must be reviewed against the jurisdictions where ULMOX operates before the
production behavior is changed.

## Production deployment

`.github/workflows/deploy-pages.yml` deploys pushes to `main` and can also be
started manually. It installs from `package-lock.json`, runs syntax checks and
tests, builds with `NODE_ENV=production`, verifies the contents of `dist/`, and
publishes only that directory through the official GitHub Pages artifact and
deployment actions.

Before the first workflow deployment:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Add a repository variable named `GA_MEASUREMENT_ID` with the real production
   GA4 Measurement ID.
3. Open **Settings → Pages → Build and deployment** and select **GitHub Actions**
   as the source.

The workflow stops before build and deployment when the variable is absent,
malformed, or still a placeholder. The production verification also requires
`dist/CNAME` to contain `ulmoxapp.com`, so a build cannot silently drop the
custom domain.
