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
