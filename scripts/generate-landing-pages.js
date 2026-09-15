"use strict";

/**
 * Generates the 20 ULMOX landing routes.
 *
 * Why they are generated
 * ----------------------
 * Stage 1.6W.1 brought all 20 under one generator because 20 near-identical
 * hand-written files had already diverged into 20 slightly different
 * accessibility failures, and because every one of them carried
 * `<source src="demo.mp4">` behind a decorative "▶" — a file that has never
 * existed in this repository. Both problems are structural, and a generator is
 * the only place a structural fix stays fixed.
 *
 * What this stage changed
 * -----------------------
 * The pages described an app that shared video moments and nothing else. The
 * product has four named surfaces — Moments, World Live, Global and
 * Connections — so the page now has a section for each, in the order a person
 * meets them: share a moment, explore the world, let an encounter become a
 * Connection, discover Global, and see the controls that stay in your hands.
 *
 * Imagery
 * -------
 * This repository owns exactly three pieces of ULMOX artwork: `logo.png` and
 * the two store badges. There are no product screenshots here, so none are
 * shown and none were invented. Every illustration on the page is either the
 * real ULMOX mark or an abstract, `aria-hidden` decoration drawn in CSS and
 * inline SVG — a ring, a wireframe globe, a mosaic of empty tiles. Nothing on
 * the page is dressed up to look like a screen from the app.
 *
 * `assets/brand/*.png` are resized renditions of `logo.png` itself, so the
 * page no longer loads a 1.4 MB image to draw a 64 px mark, and social cards
 * have a real image to use.
 *
 * Claims
 * ------
 * Every localized string comes from scripts/landing-content.js. The
 * availability of Connections is stated with `webGradualRollout` from
 * scripts/translation-content.js — the same hand-localized sentence the six
 * legal pages carry — so the landing page cannot drift into claiming the
 * feature is on for everyone while the Terms say it is rolling out.
 *
 * Run with: node scripts/generate-landing-pages.js
 */

const fs = require("fs");
const path = require("path");

const { LANDING } = require("./landing-content");
const T = require("./translation-content");
const {
  CHROME,
  LOCALES,
  SHELL_STYLE,
  isRtl,
  siteFooter,
  skipLink,
  attributeSafe,
} = require("./page-shell");

const ROOT = path.resolve(__dirname, "..");

const ORIGIN = "https://ulmoxapp.com";
const APP_STORE_URL = "https://apps.apple.com/se/app/ulmox/id6765990174";
const APP_STORE_URL_ROOT = `${APP_STORE_URL}?l=en-GB`;
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.ulmox.app";

const SHARE_IMAGE = "/assets/brand/ulmox-share.png";
const MARK_192 = "/assets/brand/ulmox-mark-192.png";
const MARK_512 = "/assets/brand/ulmox-mark-512.png";

/** Locales that do not separate words with a space. */
const UNSPACED = new Set(["ja", "zh", "th"]);

/**
 * `og:locale` wants a language and a territory. These are the conventional
 * pairings for the 19 languages this site ships; they affect nothing but how a
 * social card is labelled.
 */
const OG_LOCALE = Object.freeze({
  en: "en_US", sv: "sv_SE", tr: "tr_TR", de: "de_DE", es: "es_ES",
  fr: "fr_FR", it: "it_IT", pt: "pt_PT", nl: "nl_NL", pl: "pl_PL",
  fi: "fi_FI", ru: "ru_RU", ja: "ja_JP", ko: "ko_KR", zh: "zh_CN",
  ar: "ar_AR", hi: "hi_IN", th: "th_TH", vi: "vi_VN",
});

/* -------------------------------------------------------------------------- */
/* Style                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The landing-page style.
 *
 * Palette and contrast. The page ground is a single dark colour, `#07070b`,
 * with three very low-opacity colour washes painted over it; the washes are
 * `rgba()` so the ground the auditor measures against is the real one. Every
 * text colour below is measured against `#07070b`:
 *
 *   #ffffff  on #07070b = 19.9:1
 *   #d3d8e4  on #07070b = 14.2:1   (body copy)
 *   #a8b0c2  on #07070b =  8.7:1   (captions, step numbers)
 *   #ffd24d  on #07070b = 14.0:1   (links, the shell's accent)
 *   #7fe3ff  on #07070b = 13.9:1   (World Live accent)
 *   #f0a6ff  on #07070b = 10.0:1   (Connections accent)
 *   #07070b  on #ffd24d = 14.0:1   (the one light-on-dark inversion)
 *
 * All are far above the WCAG AA 4.5:1 minimum, and `scripts/audit-site.js`
 * re-measures every one of them on every build.
 *
 * The accent colours are taken from the ULMOX mark itself — the luminous
 * magenta-to-blue ring around the U — rather than from the flat purple wash
 * the old page painted over the whole viewport.
 *
 * Layout is mobile-first: the base rules are the phone layout, and the two
 * `min-width` blocks add columns. Spacing, padding and borders use logical
 * properties throughout, so the Arabic page mirrors correctly under dir="rtl"
 * instead of keeping a left-hand rail on a right-to-left page.
 */
const STYLE = `
    :root {
      --ink: #07070b;
      --text: #ffffff;
      --body: #d3d8e4;
      --soft: #a8b0c2;
      --amber: #ffd24d;
      --cyan: #7fe3ff;
      --magenta: #f0a6ff;
      --surface: rgba(255, 255, 255, 0.045);
      --surface-strong: rgba(255, 255, 255, 0.07);
      --line: rgba(255, 255, 255, 0.11);
      --line-strong: rgba(255, 255, 255, 0.18);
      --radius: 22px;
      --measure: 62ch;
      --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    }

    * { box-sizing: border-box; }

    html { -webkit-text-size-adjust: 100%; }

    body {
      margin: 0;
      background-color: #07070b;
      color: #ffffff;
      font-family: var(--sans);
      font-size: 17px;
      line-height: 1.6;
      text-align: start;
      -webkit-font-smoothing: antialiased;
    }

    /*
     * The colour wash sits on a fixed pseudo-element rather than on the body's
     * own background with background-attachment: fixed, which iOS Safari does
     * not honour — there the gradient would be sized to the whole scroll
     * height and wash out. Every stop is rgba() over the one real ground
     * colour above, so the ground stays exactly #07070b.
     */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background-image:
        radial-gradient(1200px 700px at 50% -15%, rgba(168, 85, 247, 0.17), rgba(7, 7, 11, 0) 62%),
        radial-gradient(820px 560px at 92% 6%, rgba(56, 189, 248, 0.12), rgba(7, 7, 11, 0) 60%),
        radial-gradient(900px 620px at 4% 34%, rgba(255, 138, 76, 0.07), rgba(7, 7, 11, 0) 60%);
    }

    .page {
      max-width: 1120px;
      margin-inline: auto;
      padding-inline: 20px;
    }

    /* ---------------------------------------------------------------- type */

    h1, h2, h3 {
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.02em;
      text-wrap: balance;
    }

    h1 { font-size: clamp(38px, 8.4vw, 68px); line-height: 1.04; font-weight: 800; }
    h2 { font-size: clamp(27px, 5.4vw, 42px); line-height: 1.1; font-weight: 800; }
    h3 { font-size: clamp(17px, 2.6vw, 19px); line-height: 1.3; font-weight: 700; }

    p { margin: 0; color: #d3d8e4; }

    .lede { font-size: clamp(17px, 2.6vw, 20px); color: #d3d8e4; max-width: var(--measure); }

    .eyebrow {
      margin: 0 0 14px;
      color: #a8b0c2;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    /*
     * The gradient is decoration on top of a real colour. A browser that does
     * not clip a background to text still renders #ffffff, so the headline is
     * never invisible because an effect failed.
     */
    .accent {
      display: block;
      color: #ffffff;
      background-image: linear-gradient(96deg, #ffffff 4%, #f0a6ff 46%, #7fe3ff 96%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    @supports (background-clip: text) or (-webkit-background-clip: text) {
      .accent { -webkit-text-fill-color: transparent; }
    }

    /* -------------------------------------------------------------- brand */

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 30px;
    }

    .brand-mark {
      width: 52px;
      height: 52px;
      border-radius: 15px;
      display: block;
      box-shadow: 0 10px 34px rgba(168, 85, 247, 0.34);
    }

    .brand-word {
      color: #ffffff;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.34em;
    }

    /* --------------------------------------------------------------- hero */

    .hero { padding-block: 64px 24px; }

    .hero-title { margin-bottom: 20px; }
    .hero-title .lead { display: block; }

    .hero-sub { font-size: clamp(17px, 2.8vw, 21px); color: #d3d8e4; max-width: 30ch; }

    .hero-actions { margin-top: 34px; }

    /*
     * The hero decoration: the real ULMOX mark inside the luminous ring the
     * mark itself carries. It is not a screen, not a frame around a screen and
     * not a stand-in for one — there is no product screenshot in this
     * repository, so the page shows the one piece of artwork it does own.
     */
    /*
     * overflow:hidden is load-bearing. The ring and the orbit are square
     * boxes that rotate, and a rotated square's scroll box is up to 1.41x its
     * own width — enough to push a 390px phone into horizontal scrolling. The
     * artwork is a circle inscribed in that square, so clipping the square
     * removes the overflow without clipping anything a reader can see.
     */
    .hero-art {
      position: relative;
      display: grid;
      place-items: center;
      overflow: hidden;
      margin-top: 52px;
      aspect-ratio: 1 / 1;
      width: min(340px, 82vw);
      margin-inline: auto;
    }

    .hero-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(from 210deg, rgba(168, 85, 247, 0) 0deg, #a855f7 90deg, #38bdf8 210deg, rgba(56, 189, 248, 0) 330deg);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
      animation: ulmox-spin 26s linear infinite;
    }

    .hero-ring-2 {
      position: absolute;
      inset: 13%;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.13);
    }

    .hero-glow {
      position: absolute;
      inset: 16%;
      border-radius: 50%;
      background: radial-gradient(circle at 50% 42%, rgba(168, 85, 247, 0.34), rgba(7, 7, 11, 0) 68%);
      filter: blur(6px);
    }

    .hero-mark {
      position: relative;
      width: 42%;
      height: auto;
      border-radius: 26%;
      display: block;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
    }

    .orbit {
      position: absolute;
      inset: 0;
      animation: ulmox-spin 38s linear infinite reverse;
    }

    .orbit span {
      position: absolute;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #7fe3ff;
      box-shadow: 0 0 16px rgba(127, 227, 255, 0.85);
    }

    .orbit span:nth-child(1) { inset-block-start: 4%; inset-inline-start: 50%; }
    .orbit span:nth-child(2) { inset-block-start: 63%; inset-inline-start: 6%; background: #f0a6ff; box-shadow: 0 0 16px rgba(240, 166, 255, 0.85); }
    .orbit span:nth-child(3) { inset-block-start: 74%; inset-inline-start: 84%; background: #ffd24d; box-shadow: 0 0 16px rgba(255, 210, 77, 0.8); }

    @keyframes ulmox-spin { to { transform: rotate(360deg); } }

    /* ------------------------------------------------------------ sections */

    .section { padding-block: 56px; border-top: 1px solid var(--line); }
    .section > .lede { margin-top: 16px; }
    .section-head { max-width: var(--measure); }

    .split { display: grid; gap: 34px; }
    .split-copy > * + * { margin-top: 16px; }

    /* ---------------------------------------------------------------- grids */

    .grid {
      list-style: none;
      margin: 34px 0 0;
      padding: 0;
      display: grid;
      gap: 14px;
      counter-reset: ulmox-step;
    }

    .grid li {
      position: relative;
      padding: 24px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
    }

    .grid p { margin-top: 8px; font-size: 16px; color: #d3d8e4; }

    .numbered li { padding-block-start: 26px; }

    .numbered li::before {
      counter-increment: ulmox-step;
      content: counter(ulmox-step);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      margin-bottom: 14px;
      border-radius: 50%;
      border: 1px solid var(--line-strong);
      color: #a8b0c2;
      font-size: 14px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    /* ---------------------------------------------------------- world live */

    .globe { display: block; width: min(420px, 100%); margin-inline: auto; height: auto; }
    .globe-dot { animation: ulmox-pulse 3.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .globe-dot:nth-of-type(2) { animation-delay: 0.9s; }
    .globe-dot:nth-of-type(3) { animation-delay: 1.8s; }
    .globe-dot:nth-of-type(4) { animation-delay: 2.7s; }

    @keyframes ulmox-pulse {
      0%, 100% { opacity: 0.35; transform: scale(0.82); }
      50% { opacity: 1; transform: scale(1.18); }
    }

    /* --------------------------------------------------------- connections */

    .connections {
      border-radius: 30px;
      border: 1px solid var(--line-strong);
      background:
        radial-gradient(760px 420px at 12% 0%, rgba(240, 166, 255, 0.11), transparent 62%),
        radial-gradient(680px 420px at 96% 12%, rgba(127, 227, 255, 0.09), transparent 60%),
        rgba(255, 255, 255, 0.025);
      padding: 40px 22px;
      margin-block: 8px;
    }

    .connections .eyebrow { color: #f0a6ff; }

    .link-art { display: block; width: min(264px, 74%); margin: 0 0 28px; height: auto; }

    .note {
      margin-top: 22px;
      padding: 16px 18px;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: var(--surface-strong);
      color: #d3d8e4;
      font-size: 15.5px;
      max-width: var(--measure);
    }

    .note-safe { border-inline-start: 3px solid #ffd24d; }
    .note-rollout { color: #a8b0c2; font-size: 14.5px; }

    /* -------------------------------------------------------------- global */

    /*
     * A decorative wall, and only that. The tiles are faded out towards the
     * bottom and carry no frame, caption or aspect ratio borrowed from the
     * app, so they read as an abstract suggestion of a feed rather than as six
     * product images that failed to load — which is how a solid, fully opaque
     * grid of empty rectangles reads.
     */
    .mosaic {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      width: min(380px, 100%);
      margin-inline: auto;
      opacity: 0.85;
      -webkit-mask-image: linear-gradient(180deg, #000 52%, rgba(0, 0, 0, 0) 100%);
      mask-image: linear-gradient(180deg, #000 52%, rgba(0, 0, 0, 0) 100%);
    }

    .mosaic span {
      display: block;
      aspect-ratio: 3 / 4;
      border-radius: 14px;
      background: linear-gradient(150deg, rgba(168, 85, 247, 0.2), rgba(56, 189, 248, 0.08));
    }

    .mosaic span:nth-child(2) { background: linear-gradient(150deg, rgba(255, 138, 76, 0.17), rgba(255, 210, 77, 0.07)); }
    .mosaic span:nth-child(3) { background: linear-gradient(150deg, rgba(56, 189, 248, 0.18), rgba(16, 185, 129, 0.08)); }
    .mosaic span:nth-child(4) { background: linear-gradient(150deg, rgba(16, 185, 129, 0.15), rgba(127, 227, 255, 0.07)); }
    .mosaic span:nth-child(5) { background: linear-gradient(150deg, rgba(240, 166, 255, 0.16), rgba(168, 85, 247, 0.07)); }
    .mosaic span:nth-child(6) { background: linear-gradient(150deg, rgba(255, 210, 77, 0.15), rgba(255, 138, 76, 0.07)); }

    /* -------------------------------------------------------------- safety */

    .text-link { color: #ffd24d; font-weight: 700; }

    .safety-more { margin-top: 26px; }

    /* --------------------------------------------------------------- store */

    .store-badges {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .store-badge-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 198px;
      height: 66px;
      line-height: 0;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      transition: transform 0.22s ease, filter 0.22s ease, border-color 0.22s ease;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      cursor: pointer;
    }

    .store-badge-link:hover {
      filter: drop-shadow(0 12px 26px rgba(168, 85, 247, 0.26));
      border-color: rgba(255, 255, 255, 0.28);
      transform: translateY(-2px);
    }

    .store-badge {
      display: block;
      width: auto;
      object-fit: contain;
      pointer-events: none;
      user-select: none;
    }

    .store-badge-app-store { height: 56px; max-width: 176px; }
    .store-badge-link-google-play { width: 198px; height: 66px; overflow: visible; }
    .store-badge-google-play { height: 74px; max-width: 198px; }

    .browser-help {
      display: none;
      margin-top: 18px;
      max-width: 560px;
      padding: 16px 18px;
      border: 1px solid var(--line-strong);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      color: #d3d8e4;
      font-size: 15px;
      line-height: 1.5;
      text-align: start;
    }

    .browser-help.visible { display: block; }

    .copy-link {
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 11px 14px;
      margin-top: 12px;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    /* ------------------------------------------------------------ download */

    .cta {
      text-align: center;
      border-top: 1px solid var(--line);
      padding-block: 60px 12px;
    }

    .cta .lede { margin-inline: auto; margin-top: 16px; }
    .cta .store-badges { justify-content: center; margin-top: 30px; }

    /* -------------------------------------------------------------- motion */

    /*
     * Reveal-on-scroll is opt-in from JavaScript: the class that hides an
     * element is only applied once the observer that will show it again is
     * running. With JavaScript off, or before it runs, every section is
     * visible — an animation must never be the reason content is missing.
     */
    [data-motion="on"] .reveal {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }

    [data-motion="on"] .reveal.is-visible { opacity: 1; transform: none; }

    @media (prefers-reduced-motion: reduce) {
      .hero-ring, .orbit, .globe-dot { animation: none; }
      .store-badge-link { transition: none; }
      .store-badge-link:hover { transform: none; }
      [data-motion="on"] .reveal { opacity: 1; transform: none; transition: none; }
    }

    /* ---------------------------------------------------------- responsive */

    @media (min-width: 720px) {
      .page { padding-inline: 32px; }
      .hero { padding-block: 84px 40px; }
      .section { padding-block: 76px; }
      .connections { padding: 60px 44px; }
      .grid { gap: 16px; grid-template-columns: repeat(2, 1fr); }
      .grid li { padding: 28px; }
      .split { grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; }
      .hero-art { width: min(400px, 60vw); }
    }

    @media (min-width: 1040px) {
      .hero {
        display: grid;
        grid-template-columns: 1.06fr 0.94fr;
        align-items: center;
        gap: 56px;
        padding-block: 108px 56px;
      }
      .hero-art { margin-top: 0; width: 100%; max-width: 460px; }
      .grid { grid-template-columns: repeat(3, 1fr); }
      .steps-3 { grid-template-columns: repeat(3, 1fr); }
      .connections { padding: 72px 64px; }
      .brand-mark { width: 58px; height: 58px; }
    }
`;

/**
 * Scripts that tracking damages.
 *
 * The headline tracking (-0.02em) and the uppercase, widely tracked eyebrow
 * are Latin typography. Applied to Arabic they pull cursive letters apart and
 * break the joins — the Arabic hero line rendered as disconnected glyphs — and
 * in Devanagari and Thai they separate a base letter from the marks that
 * belong to it. In CJK, letterspacing an "uppercase" label is meaningless at
 * best. Those six locales get their tracking reset; the Latin and Cyrillic
 * ones keep it.
 */
const COMPLEX_SCRIPTS = new Set(["ar", "hi", "th", "ja", "ko", "zh"]);

const SCRIPT_STYLE = `
    /* Tracking that is correct for Latin is wrong for this script. */
    h1, h2, h3 { letter-spacing: normal; }
    .eyebrow { letter-spacing: normal; text-transform: none; }
`;

/* -------------------------------------------------------------------------- */
/* Fragments                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The two store badges.
 *
 * `class="store-badges"` and the two ids are load-bearing: the analytics
 * helper in assets/js/analytics.js derives `button_location` from them, and
 * the root page's redirect script looks the ids up by name. The `alt` text
 * stays in English because it describes the English badge artwork the page
 * actually shows; the link's own accessible name is the localized
 * `aria-label`, which is what a screen reader announces.
 */
function storeBadges(content, { appStoreUrl, id = false, location = "" } = {}) {
  const analytics = location ? `\n            data-analytics-location="${location}"` : "";
  return `          <div class="store-badges">
            <a
              class="store-badge-link"${id ? '\n              id="appStoreLink"' : ""}${analytics}
              href="${appStoreUrl}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${attributeSafe(content.appStoreAria)}"
            >
              <img
                class="store-badge store-badge-app-store"
                src="/assets/badges/app-store.svg"
                width="162"
                height="54"
                alt="Download on the App Store"
              >
            </a>

            <a
              class="store-badge-link store-badge-link-google-play"${id ? '\n              id="playStoreLink"' : ""}${analytics}
              href="${PLAY_STORE_URL}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${attributeSafe(content.playStoreAria)}"
            >
              <img
                class="store-badge store-badge-google-play"
                src="/assets/badges/google-play.png"
                width="140"
                height="54"
                alt="Get it on Google Play"
              >
            </a>
          </div>`;
}

/** The Instagram in-app-browser help, which only the root entry page carries. */
const BROWSER_HELP = `
        <div id="browserHelp" class="browser-help" role="status" aria-live="polite">
          Instagram may block opening the App Store inside its browser.
          Tap the <strong>&bull;&bull;&bull;</strong> menu and choose
          <strong>Open in external browser</strong> or <strong>Open in Safari</strong>.
          <br>
          <button id="copyStoreLink" class="copy-link" type="button">
            Copy App Store link
          </button>
        </div>`;

/**
 * The hero decoration: the real ULMOX mark inside the ring the mark carries.
 *
 * Entirely decorative, so it is hidden from assistive technology — the mark is
 * already named by the brand lockup above it, and announcing it twice tells a
 * screen-reader user nothing new.
 */
const HERO_ART = `        <div class="hero-art" aria-hidden="true">
          <span class="hero-ring"></span>
          <span class="hero-glow"></span>
          <span class="hero-ring-2"></span>
          <span class="orbit"><span></span><span></span><span></span></span>
          <img class="hero-mark" src="${MARK_192}" alt="" width="192" height="192" loading="lazy" decoding="async">
        </div>`;

/**
 * A wireframe globe with four pulsing points.
 *
 * A drawing of the idea, not a picture of the app. It carries no place names,
 * no coastlines and no interface, so it cannot be mistaken for a capture of
 * World Live, and nothing here claims to be one.
 */
const GLOBE = `          <svg class="globe" viewBox="0 0 240 240" role="img" aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="ulmox-globe" cx="38%" cy="30%" r="78%">
                <stop offset="0%" stop-color="#a855f7" stop-opacity="0.34" />
                <stop offset="62%" stop-color="#38bdf8" stop-opacity="0.12" />
                <stop offset="100%" stop-color="#07070b" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="96" fill="url(#ulmox-globe)" />
            <circle cx="120" cy="120" r="96" fill="none" stroke="rgba(255,255,255,0.22)" />
            <ellipse cx="120" cy="120" rx="96" ry="34" fill="none" stroke="rgba(255,255,255,0.13)" />
            <ellipse cx="120" cy="120" rx="96" ry="68" fill="none" stroke="rgba(255,255,255,0.09)" />
            <ellipse cx="120" cy="120" rx="34" ry="96" fill="none" stroke="rgba(255,255,255,0.13)" />
            <ellipse cx="120" cy="120" rx="68" ry="96" fill="none" stroke="rgba(255,255,255,0.09)" />
            <line x1="120" y1="24" x2="120" y2="216" stroke="rgba(255,255,255,0.09)" />
            <line x1="24" y1="120" x2="216" y2="120" stroke="rgba(255,255,255,0.09)" />
            <circle class="globe-dot" cx="86" cy="76" r="6" fill="#f0a6ff" />
            <circle class="globe-dot" cx="163" cy="104" r="6" fill="#7fe3ff" />
            <circle class="globe-dot" cx="99" cy="158" r="6" fill="#ffd24d" />
            <circle class="globe-dot" cx="151" cy="171" r="5" fill="#7fe3ff" />
          </svg>`;

/**
 * Two people, one link, formed only where both sides meet.
 *
 * Abstract on purpose: no avatars, no names, no message bubbles, nothing that
 * could read as a capture of a real conversation.
 */
const LINK_ART = `          <svg class="link-art" viewBox="0 0 300 120" role="img" aria-hidden="true" focusable="false">
            <circle cx="72" cy="60" r="38" fill="none" stroke="rgba(240,166,255,0.55)" stroke-width="1.5" />
            <circle cx="228" cy="60" r="38" fill="none" stroke="rgba(127,227,255,0.55)" stroke-width="1.5" />
            <circle cx="72" cy="60" r="16" fill="rgba(240,166,255,0.22)" />
            <circle cx="228" cy="60" r="16" fill="rgba(127,227,255,0.22)" />
            <path d="M110 60 H190" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="5 7" />
            <circle cx="150" cy="60" r="15" fill="rgba(7,7,11,0.9)" stroke="rgba(255,210,77,0.8)" stroke-width="1.5" />
            <path d="M143 60 l5 5 l9 -10" fill="none" stroke="#ffd24d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>`;

/** Six empty tiles standing in for a feed, with nothing pretending to be in them. */
const MOSAIC = `          <div class="mosaic" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>`;

/**
 * Reveal-on-scroll, and nothing else.
 *
 * It arms itself only after confirming the reader has not asked for reduced
 * motion, and it never hides anything it is not already able to show again.
 *
 * The sweep is a plain scroll handler rather than an IntersectionObserver on
 * purpose. An observer only fires for what is intersecting *now*, so a reader
 * who presses End, follows a fragment link or restores a scrolled position
 * skips straight past several sections and they stay at opacity 0 — content
 * that is simply gone. Testing this page with a jump to the bottom produced
 * exactly that: four blank sections. Sweeping by position instead reveals
 * everything at or above the fold, including everything already scrolled
 * past, so no scroll gesture can leave a section invisible.
 */
const MOTION_SCRIPT = `  <script>
    (function () {
      "use strict";

      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      var pending = [].slice.call(document.querySelectorAll(".reveal"));
      if (!pending.length) return;

      document.documentElement.setAttribute("data-motion", "on");

      var ticking = false;

      function sweep() {
        ticking = false;
        var limit = window.innerHeight * 0.92;
        var remaining = [];
        for (var i = 0; i < pending.length; i += 1) {
          if (pending[i].getBoundingClientRect().top < limit) {
            pending[i].classList.add("is-visible");
          } else {
            remaining.push(pending[i]);
          }
        }
        pending = remaining;
        if (!pending.length) {
          window.removeEventListener("scroll", schedule);
          window.removeEventListener("resize", schedule);
        }
      }

      function schedule() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(sweep);
      }

      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      window.addEventListener("load", schedule);
      sweep();
    })();
  </script>`;

const ROOT_SCRIPT = `  <script>
    (function () {
      "use strict";

      const APP_STORE_WEB_URL =
        "${APP_STORE_URL_ROOT}";
      const APP_STORE_SCHEME_URL =
        "itms-apps://apps.apple.com/se/app/ulmox/id6765990174";
      const PLAY_STORE_URL =
        "${PLAY_STORE_URL}";

      function isInstagramBrowser() {
        return /Instagram/i.test(navigator.userAgent || "");
      }

      function isIOS() {
        const ua = navigator.userAgent || "";
        return (
          /iPhone|iPad|iPod/i.test(ua) ||
          (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
        );
      }

      function initializeStoreLinks() {
        const appStoreLink = document.getElementById("appStoreLink");
        const playStoreLink = document.getElementById("playStoreLink");
        const browserHelp = document.getElementById("browserHelp");
        const copyStoreLink = document.getElementById("copyStoreLink");

        if (playStoreLink) {
          playStoreLink.href = PLAY_STORE_URL;
        }

        if (appStoreLink) {
          appStoreLink.href = APP_STORE_WEB_URL;

          appStoreLink.addEventListener("click", function (event) {
            if (!isIOS()) return;

            event.preventDefault();

            /*
             * Must run directly inside the user's tap.
             * Instagram may still block this custom scheme.
             */
            window.location.href = APP_STORE_SCHEME_URL;

            /*
             * Fall back to Apple's HTTPS product page.
             * If Instagram blocks both handoffs, show clear external-browser help.
             */
            window.setTimeout(function () {
              window.location.href = APP_STORE_WEB_URL;
            }, 700);

            window.setTimeout(function () {
              if (browserHelp && isInstagramBrowser()) {
                browserHelp.classList.add("visible");
              }
            }, 1300);
          });
        }

        if (copyStoreLink) {
          copyStoreLink.addEventListener("click", async function () {
            try {
              await navigator.clipboard.writeText(APP_STORE_WEB_URL);
              copyStoreLink.textContent = "App Store link copied";
            } catch (_) {
              const temporaryInput = document.createElement("textarea");
              temporaryInput.value = APP_STORE_WEB_URL;
              temporaryInput.setAttribute("readonly", "");
              temporaryInput.style.position = "fixed";
              temporaryInput.style.opacity = "0";
              document.body.appendChild(temporaryInput);
              temporaryInput.select();
              document.execCommand("copy");
              temporaryInput.remove();
              copyStoreLink.textContent = "App Store link copied";
            }
          });
        }

        if (browserHelp && isInstagramBrowser() && isIOS()) {
          browserHelp.classList.add("visible");
        }
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeStoreLinks);
      } else {
        initializeStoreLinks();
      }
    })();
  </script>`;

/* -------------------------------------------------------------------------- */
/* Head                                                                       */
/* -------------------------------------------------------------------------- */

/** "ULMOX — <the page's own headline>", so every tab and result is identifiable. */
function landingTitle(key, content) {
  const join = UNSPACED.has(key) ? "" : " ";
  return `ULMOX — ${content.lead}${join}${content.accent}`.replace(/\s+/g, " ").trim();
}

/** The canonical URL of a locale's landing route. */
function landingUrl(locale, { root = false } = {}) {
  return root ? `${ORIGIN}/` : `${ORIGIN}/${locale}/`;
}

/**
 * One `hreflang` alternate per locale, plus `x-default` for the entry page
 * that decides a language for a reader who has not chosen one.
 *
 * The alternates are absolute URLs on purpose: a relative one would point out
 * of the page's own locale directory, which is exactly what
 * `scripts/audit-site.js` fails a build for.
 */
function alternateLinks() {
  const rows = LOCALES.map(
    (locale) =>
      `  <link rel="alternate" hreflang="${locale}" href="${landingUrl(locale)}" />`
  );
  rows.push(`  <link rel="alternate" hreflang="x-default" href="${landingUrl("en", { root: true })}" />`);
  return rows.join("\n");
}

/**
 * The social and search metadata.
 *
 * Deliberately plain `<meta>` and `<link>` tags and one hand-written JSON-LD
 * object: no SEO library, no generator, nothing to keep up to date. The JSON-LD
 * states what ULMOX is and where to get it. It carries no rating, no review
 * count, no download count and no price — the site has no such figures, and a
 * structured-data block is exactly where an invented one would do the most
 * damage.
 */
function metadata(locale, content, { root = false }) {
  const url = landingUrl(locale, { root });
  const title = attributeSafe(landingTitle(root ? "root" : locale, content));
  const description = attributeSafe(content.metaDescription);
  const shareUrl = `${ORIGIN}${SHARE_IMAGE}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ULMOX",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "iOS, Android",
    url,
    inLanguage: locale,
    description: content.metaDescription,
    image: shareUrl,
    sameAs: [APP_STORE_URL, PLAY_STORE_URL],
  };

  return `  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
${alternateLinks()}

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ULMOX" />
  <meta property="og:locale" content="${OG_LOCALE[locale]}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${shareUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="ULMOX" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${shareUrl}" />
  <meta name="twitter:image:alt" content="ULMOX" />

  <link rel="icon" type="image/png" sizes="192x192" href="${MARK_192}" />
  <link rel="apple-touch-icon" href="${MARK_512}" />

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2).replace(/^/gm, "    ")}
  </script>`;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

/** `<li>` items for a grid of heading-and-body cards. */
function cards(items) {
  return items
    .map(
      (item) => `            <li>
              <h3>${item.heading}</h3>
              <p>${item.body}</p>
            </li>`
    )
    .join("\n");
}

function landingPage(key) {
  const isRoot = key === "root";
  const locale = isRoot ? "en" : key;
  const route = isRoot ? "index.html" : `${locale}/index.html`;
  const content = LANDING[key];
  const chrome = CHROME[locale];
  const rollout = T.LOCALES[locale].webGradualRollout;

  const dir = isRtl(locale) ? ' dir="rtl"' : "";
  const appStoreUrl = isRoot ? APP_STORE_URL_ROOT : APP_STORE_URL;

  const scripts = isRoot
    ? `  <script src="/assets/js/i18n-config.js"></script>
  <script src="/assets/js/language-redirect.js"></script>

${ROOT_SCRIPT}

${MOTION_SCRIPT}`
    : `  <script src="/assets/js/i18n-config.js"></script>
  <script src="/assets/js/language-switcher.js" defer></script>

${MOTION_SCRIPT}`;

  return `<!DOCTYPE html>
<html lang="${locale}"${dir}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#07070b" />
  <title>${attributeSafe(landingTitle(key, content))}</title>
  <meta name="description" content="${attributeSafe(content.metaDescription)}" />

${metadata(locale, content, { root: isRoot })}

  <style>${STYLE}${COMPLEX_SCRIPTS.has(locale) ? SCRIPT_STYLE : ""}${SHELL_STYLE}  </style>
  <link rel="stylesheet" href="/assets/css/language-switcher.css">
</head>

<body>
${skipLink(route)}

  <div class="page">
    <main id="main">

      <section class="hero">
        <div class="hero-copy">
          <div class="brand">
            <img class="brand-mark" src="${MARK_192}" alt="ULMOX" width="192" height="192">
            <span class="brand-word">ULMOX</span>
          </div>

          <p class="eyebrow">${content.heroBadge}</p>

          <h1 class="hero-title">
            <span class="lead">${content.lead}</span>
            <span class="accent">${content.accent}</span>
          </h1>

          <p class="hero-sub">${content.subtitle}</p>

          <div class="hero-actions">
${storeBadges(content, {
  appStoreUrl,
  id: isRoot,
  location: "homepage_hero_store_badges",
})}
${isRoot ? BROWSER_HELP : ""}          </div>
        </div>

${HERO_ART}
      </section>

      <section class="section reveal" aria-labelledby="how-heading">
        <div class="section-head">
          <h2 id="how-heading">${content.howHeading}</h2>
          <p class="lede">${content.howBody}</p>
        </div>
        <ol class="grid numbered steps-3">
${cards(content.howSteps)}
        </ol>
      </section>

      <section class="section reveal" aria-labelledby="world-heading">
        <div class="split">
          <div class="split-copy">
            <h2 id="world-heading">${content.worldHeading}</h2>
            <p class="lede">${content.worldBody}</p>
            <p>${content.worldBody2}</p>
          </div>
          <div class="split-art">
${GLOBE}
          </div>
        </div>
      </section>

      <section class="section connections reveal" aria-labelledby="connections-heading">
${LINK_ART}
        <div class="section-head">
          <p class="eyebrow">Connections</p>
          <h2 id="connections-heading">${content.connectionsHeading}</h2>
          <p class="lede">${content.connectionsBody}</p>
        </div>

        <ol class="grid numbered">
${cards(content.connectionsSteps)}
        </ol>

        <p class="note note-safe">${content.connectionsSafety}</p>
        <p class="note note-rollout">${rollout}</p>
      </section>

      <section class="section reveal" aria-labelledby="global-heading">
        <div class="split">
          <div class="split-copy">
            <h2 id="global-heading">Global</h2>
            <p class="lede">${content.globalBody}</p>
            <p>${content.globalBody2}</p>
          </div>
          <div class="split-art">
${MOSAIC}
          </div>
        </div>
      </section>

      <section class="section reveal" aria-labelledby="different-heading">
        <div class="section-head">
          <h2 id="different-heading">${content.differentHeading}</h2>
        </div>
        <ul class="grid">
${cards(content.differences)}
        </ul>
      </section>

      <section class="section reveal" aria-labelledby="safety-heading">
        <div class="section-head">
          <h2 id="safety-heading">${content.safetyHeading}</h2>
          <p class="lede">${content.safetyBody}</p>
        </div>
        <ul class="grid">
${cards(content.safetyControls)}
        </ul>
        <p class="safety-more">
          <a class="text-link" href="safety.html">${chrome.safety}</a>
        </p>
      </section>

      <section class="section cta reveal" aria-labelledby="cta-heading">
        <h2 id="cta-heading">${content.ctaHeading}</h2>
        <p class="lede">${content.ctaBody}</p>
${storeBadges(content, { appStoreUrl })}
      </section>

    </main>
  </div>

${siteFooter(route, { copyright: content.copyright })}

${scripts}
</body>
</html>
`;
}

const PAGES = Object.freeze([
  ["index.html", "root"],
  ...LOCALES.map((locale) => [`${locale}/index.html`, locale]),
]);

function generate(targetRoot = ROOT) {
  const written = [];
  for (const [file, key] of PAGES) {
    const destination = path.join(targetRoot, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, landingPage(key), "utf8");
    written.push(file);
  }
  return written;
}

if (require.main === module) {
  const written = generate();
  console.log(`Generated ${written.length} landing pages: ${written.join(", ")}`);
}

module.exports = {
  ORIGIN,
  APP_STORE_URL,
  APP_STORE_URL_ROOT,
  PLAY_STORE_URL,
  PAGES,
  OG_LOCALE,
  landingPage,
  landingTitle,
  landingUrl,
  generate,
};
