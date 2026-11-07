"use strict";

/**
 * Generates the 24 ULMOX landing routes.
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
 * Every screen on the page is a genuine ULMOX screen, cut from the localized
 * App Store artwork (moment_app/store/screenshots/final_medium/<locale>) —
 * nothing is mocked up. `assets/screens/<locale>/*.webp` are the phones cut
 * out of that artwork, and `assets/tour/<locale>.mp4` is a short looping
 * film of all eight store screens, with a JPEG poster beside it. Both are
 * rendered by `tools/media/` in this repository; see the README.
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
 * pairings for the 23 languages this site ships; they affect nothing but how a
 * social card is labelled.
 */
const OG_LOCALE = Object.freeze({
  en: "en_US", sv: "sv_SE", tr: "tr_TR", de: "de_DE", es: "es_ES",
  fr: "fr_FR", it: "it_IT", pt: "pt_PT", nl: "nl_NL", pl: "pl_PL",
  fi: "fi_FI", ru: "ru_RU", ja: "ja_JP", ko: "ko_KR", zh: "zh_CN",
  ar: "ar_AR", hi: "hi_IN", th: "th_TH", vi: "vi_VN",
  el: "el_GR", id: "id_ID", ms: "ms_MY", sr: "sr_RS",
});

/* -------------------------------------------------------------------------- */
/* Style                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The landing-page style.
 *
 * Direction. A warm, quiet, editorial page: one deep warm-black ground, a
 * champagne-gold accent taken from the store artwork's cream-and-gold frame,
 * a soft sage for World Live and a warm rose for Connections. No purple —
 * the earlier violet washes read as generic "AI product" styling, which is
 * the look ULMOX's own interface deliberately avoids.
 *
 * Palette and contrast. The page ground is a single colour, `#0b0a08`, with
 * very low-opacity colour washes painted over it; the washes are `rgba()` so
 * the ground the auditor measures against is the real one. Every text colour
 * below is measured against `#0b0a08`:
 *
 *   #fbf7ef  on #0b0a08 = 19.0:1   (headings)
 *   #ddd6c9  on #0b0a08 = 14.0:1   (body copy)
 *   #aea592  on #0b0a08 =  8.0:1   (captions, step numbers)
 *   #e8c88a  on #0b0a08 = 12.4:1   (links, gold accent)
 *   #a9d8cc  on #0b0a08 = 12.1:1   (World Live accent)
 *   #f2bba4  on #0b0a08 = 11.5:1   (Connections accent)
 *   #0b0a08  on #e8c88a = 12.4:1   (the one dark-on-gold inversion)
 *
 * All are far above the WCAG AA 4.5:1 minimum, and `scripts/audit-site.js`
 * re-measures every one of them on every build.
 *
 * Layout is mobile-first: the base rules are the phone layout, and the two
 * `min-width` blocks add columns. Spacing, padding and borders use logical
 * properties throughout, so the Arabic page mirrors correctly under dir="rtl".
 */
const STYLE = `
    :root {
      --ink: #0b0a08;
      --text: #fbf7ef;
      --body: #ddd6c9;
      --soft: #aea592;
      --gold: #e8c88a;
      --gold-deep: #b8925a;
      --sage: #a9d8cc;
      --rose: #f2bba4;
      --surface: rgba(255, 244, 222, 0.035);
      --surface-strong: rgba(255, 244, 222, 0.06);
      --line: rgba(255, 236, 200, 0.10);
      --line-strong: rgba(255, 236, 200, 0.18);
      --radius: 24px;
      --measure: 60ch;
      --sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      --serif: "New York", ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
      --ease: cubic-bezier(0.22, 1, 0.36, 1);
    }

    * { box-sizing: border-box; }

    html { -webkit-text-size-adjust: 100%; }

    body {
      margin: 0;
      background-color: #0b0a08;
      color: #fbf7ef;
      font-family: var(--sans);
      font-size: 17px;
      line-height: 1.65;
      text-align: start;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /*
     * The colour wash sits on a fixed pseudo-element rather than on the body's
     * own background with background-attachment: fixed, which iOS Safari does
     * not honour. Every stop is rgba() over the one real ground colour above.
     */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background-image:
        radial-gradient(1100px 680px at 72% -12%, rgba(232, 200, 138, 0.13), rgba(11, 10, 8, 0) 62%),
        radial-gradient(760px 540px at 0% 26%, rgba(169, 216, 204, 0.06), rgba(11, 10, 8, 0) 60%),
        radial-gradient(900px 600px at 100% 78%, rgba(242, 187, 164, 0.05), rgba(11, 10, 8, 0) 60%);
    }

    /* A whisper of film grain, so the dark ground reads as a surface. */
    body::after {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      opacity: 0.05;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .page {
      max-width: 1180px;
      margin-inline: auto;
      padding-inline: 20px;
    }

    /* ---------------------------------------------------------------- type */

    h1, h2, h3 {
      color: #fbf7ef;
      margin: 0;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }

    h1 { font-size: clamp(40px, 8.6vw, 76px); line-height: 1.02; font-weight: 700; }
    h2 { font-size: clamp(30px, 5.4vw, 48px); line-height: 1.08; font-weight: 700; }
    h3 { font-size: clamp(17px, 2.6vw, 19px); line-height: 1.3; font-weight: 650; letter-spacing: -0.01em; }

    p { margin: 0; color: #ddd6c9; }

    .lede { font-size: clamp(17px, 2.5vw, 20px); color: #ddd6c9; max-width: var(--measure); }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 18px;
      color: #e8c88a;
      font-size: 12.5px;
      font-weight: 650;
      letter-spacing: 0.22em;
      text-transform: uppercase;
    }

    .eyebrow::before {
      content: "";
      width: 28px;
      height: 1px;
      background: linear-gradient(90deg, rgba(232, 200, 138, 0), #e8c88a);
    }

    /*
     * The accent line is set in a serif italic for an editorial voice. The
     * gradient is decoration on top of a real colour: a browser that does not
     * clip a background to text still renders #e8c88a.
     */
    .accent {
      display: block;
      color: #e8c88a;
      font-family: var(--serif);
      font-style: italic;
      font-weight: 500;
      letter-spacing: -0.015em;
      padding-block-end: 0.06em;
      background-image: linear-gradient(100deg, #f6e3bc 0%, #e8c88a 45%, #c9a46a 100%);
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
      margin-bottom: 40px;
    }

    .brand-mark {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: block;
      box-shadow: 0 0 0 1px rgba(255, 236, 200, 0.16), 0 14px 36px rgba(0, 0, 0, 0.5);
    }

    .brand-word {
      color: #fbf7ef;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.42em;
    }

    /* --------------------------------------------------------------- hero */

    .hero { padding-block: 56px 32px; }

    .hero-title { margin-bottom: 24px; }
    .hero-title .lead { display: block; }

    .hero-sub { font-size: clamp(17px, 2.6vw, 21px); color: #ddd6c9; max-width: 34ch; }

    .hero-actions { margin-top: 36px; }

    /*
     * Three real ULMOX screens, cut from the App Store artwork: today's
     * moment in front, a moment being shared and its video reactions behind.
     * overflow is clipped so the tilted back phones can never push a narrow
     * phone into sideways scrolling.
     */
    .hero-art {
      position: relative;
      margin: 56px auto 0;
      width: min(420px, 92vw);
      aspect-ratio: 1 / 1.08;
      overflow: hidden;
      padding-block: 4%;
    }

    .hero-halo {
      position: absolute;
      inset: 6% 4% 0;
      border-radius: 50%;
      background: radial-gradient(closest-side, rgba(232, 200, 138, 0.30), rgba(232, 200, 138, 0.06) 60%, rgba(11, 10, 8, 0) 100%);
      filter: blur(8px);
    }

    .hero-ring {
      position: absolute;
      inset: 10% 8% 4%;
      border-radius: 50%;
      border: 1px solid rgba(232, 200, 138, 0.16);
    }

    .phone {
      display: block;
      height: auto;
      border-radius: 13% / 6.2%;
      box-shadow:
        0 0 0 1px rgba(255, 236, 200, 0.12),
        0 30px 60px -12px rgba(0, 0, 0, 0.75),
        0 18px 36px -18px rgba(0, 0, 0, 0.8);
    }

    .hero-art .phone { position: absolute; inset-block-start: 6%; }
    .hero-art .phone-front { width: 46%; inset-inline-start: 27%; z-index: 2; animation: ulmox-float 9s ease-in-out infinite; }
    .hero-art .phone-back { width: 37%; inset-block-start: 15%; filter: brightness(0.62) saturate(0.9); }
    .hero-art .phone-left { inset-inline-start: 2%; transform: rotate(-7deg); }
    .hero-art .phone-right { inset-inline-end: 2%; transform: rotate(7deg); }

    @keyframes ulmox-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* ------------------------------------------------------------ sections */

    .section { padding-block: 64px; border-top: 1px solid var(--line); }
    .section > .lede { margin-top: 16px; }
    .section-head { max-width: var(--measure); }
    .section-head .lede { margin-top: 16px; }

    .split { display: grid; gap: 40px; }
    .split-copy > * + * { margin-top: 16px; }

    /* ---------------------------------------------------------------- tour */

    /*
     * The tour: a short looping film of the eight App Store screens. The
     * frame is the cinema; the film itself carries no sound, and the toggle
     * is the one control it needs — anything that moves for more than five
     * seconds must be pausable. On a phone the frame is portrait and crops to
     * the centre of the film, so the screen in focus stays legible.
     */
    .tour { margin: 40px 0 0; }

    .tour-frame {
      position: relative;
      border-radius: 28px;
      overflow: hidden;
      background: #0b0a08;
      box-shadow:
        0 0 0 1px rgba(255, 236, 200, 0.14),
        0 40px 90px -30px rgba(0, 0, 0, 0.9),
        0 0 120px -40px rgba(232, 200, 138, 0.35);
    }

    .tour-frame::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      box-shadow: inset 0 1px 0 rgba(255, 244, 222, 0.10);
    }

    .tour-video {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      background: #0b0a08;
    }

    .tour-toggle {
      position: absolute;
      inset-block-end: 14px;
      inset-inline-end: 14px;
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      padding: 0;
      border-radius: 50%;
      border: 1px solid rgba(255, 236, 200, 0.24);
      background: rgba(11, 10, 8, 0.62);
      color: #fbf7ef;
      cursor: pointer;
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .tour-toggle:hover { background: rgba(11, 10, 8, 0.82); border-color: rgba(232, 200, 138, 0.6); }
    .tour-toggle:focus-visible { outline: 3px solid #e8c88a; outline-offset: 3px; }

    .tour-toggle svg { width: 16px; height: 16px; display: block; }
    .tour-toggle .icon-play { display: none; }
    .tour-toggle[data-state="paused"] .icon-play { display: block; }
    .tour-toggle[data-state="paused"] .icon-pause { display: none; }
    .tour-toggle[hidden] { display: none; }

    .tour-caption {
      margin-top: 14px;
      color: #aea592;
      font-size: 14px;
      text-align: center;
    }

    /* ---------------------------------------------------------------- grids */

    .grid {
      list-style: none;
      margin: 36px 0 0;
      padding: 0;
      display: grid;
      gap: 14px;
      counter-reset: ulmox-step;
    }

    .grid li {
      position: relative;
      padding: 26px;
      border-radius: var(--radius);
      border: 1px solid var(--line);
      background:
        linear-gradient(180deg, rgba(255, 244, 222, 0.05), rgba(255, 244, 222, 0.012));
      transition: border-color 0.4s var(--ease), transform 0.4s var(--ease);
    }

    .grid li:hover { border-color: rgba(232, 200, 138, 0.32); transform: translateY(-2px); }

    .grid p { margin-top: 8px; font-size: 16px; color: #ddd6c9; }

    .numbered li { padding-block-start: 28px; }

    .numbered li::before {
      counter-increment: ulmox-step;
      content: counter(ulmox-step, decimal-leading-zero);
      display: block;
      margin-bottom: 16px;
      color: #e8c88a;
      font-family: var(--serif);
      font-style: italic;
      font-size: 22px;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    /* ----------------------------------------------------------- showcases */

    /*
     * A real screen from the app, standing on a soft pool of the section's
     * own accent colour.
     */
    .showcase {
      position: relative;
      display: grid;
      place-items: center;
      margin: 0;
      padding-block: 12px 24px;
    }

    .showcase::before {
      content: "";
      position: absolute;
      inset: 4% 8% 0;
      border-radius: 50%;
      background: radial-gradient(closest-side, rgba(232, 200, 138, 0.22), rgba(11, 10, 8, 0) 100%);
      filter: blur(10px);
    }

    .showcase-sage::before { background: radial-gradient(closest-side, rgba(169, 216, 204, 0.22), rgba(11, 10, 8, 0) 100%); }
    .showcase-rose::before { background: radial-gradient(closest-side, rgba(242, 187, 164, 0.22), rgba(11, 10, 8, 0) 100%); }

    .showcase .phone { position: relative; width: min(270px, 66vw); }

    /* ---------------------------------------------------------- world live */

    .world .eyebrow { color: #a9d8cc; }
    .world .eyebrow::before { background: linear-gradient(90deg, rgba(169, 216, 204, 0), #a9d8cc); }

    /* --------------------------------------------------------- connections */

    .connections {
      border-radius: 34px;
      border: 1px solid var(--line-strong);
      background:
        radial-gradient(760px 420px at 10% 0%, rgba(242, 187, 164, 0.09), transparent 62%),
        radial-gradient(680px 420px at 96% 14%, rgba(232, 200, 138, 0.07), transparent 60%),
        rgba(255, 244, 222, 0.02);
      padding: 44px 22px;
      margin-block: 12px;
    }

    .connections .eyebrow { color: #f2bba4; }
    .connections .eyebrow::before { background: linear-gradient(90deg, rgba(242, 187, 164, 0), #f2bba4); }

    .note {
      margin-top: 22px;
      padding: 16px 18px;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: var(--surface-strong);
      color: #ddd6c9;
      font-size: 15.5px;
      max-width: var(--measure);
    }

    .note-safe { border-inline-start: 2px solid #e8c88a; }
    .note-rollout { color: #aea592; font-size: 14.5px; }

    /* -------------------------------------------------------------- safety */

    .text-link {
      color: #e8c88a;
      font-weight: 650;
      text-decoration-thickness: 1px;
      text-underline-offset: 4px;
    }

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
      border: 1px solid rgba(255, 236, 200, 0.16);
      border-radius: 16px;
      background: rgba(255, 244, 222, 0.04);
      transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      cursor: pointer;
    }

    .store-badge-link:hover {
      box-shadow: 0 14px 34px -10px rgba(232, 200, 138, 0.35);
      border-color: rgba(232, 200, 138, 0.45);
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
      background: rgba(255, 244, 222, 0.08);
      color: #ddd6c9;
      font-size: 15px;
      line-height: 1.5;
      text-align: start;
    }

    .browser-help.visible { display: block; }

    .copy-link {
      appearance: none;
      border: 1px solid rgba(255, 236, 200, 0.2);
      border-radius: 12px;
      padding: 11px 14px;
      margin-top: 12px;
      background: rgba(255, 244, 222, 0.1);
      color: #fbf7ef;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    /* ------------------------------------------------------------ download */

    .cta {
      position: relative;
      text-align: center;
      border-top: 1px solid var(--line);
      padding-block: 76px 20px;
    }

    .cta::before {
      content: "";
      position: absolute;
      inset-inline: 10%;
      inset-block-start: 20px;
      height: 260px;
      z-index: -1;
      border-radius: 50%;
      background: radial-gradient(closest-side, rgba(232, 200, 138, 0.14), rgba(11, 10, 8, 0));
    }

    .cta .lede { margin-inline: auto; margin-top: 16px; }
    .cta .store-badges { justify-content: center; margin-top: 32px; }

    /* -------------------------------------------------------------- motion */

    /*
     * Reveal-on-scroll is opt-in from JavaScript: the class that hides an
     * element is only applied once the observer that will show it again is
     * running. With JavaScript off, or before it runs, every section is
     * visible — an animation must never be the reason content is missing.
     */
    [data-motion="on"] .reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.9s var(--ease), transform 0.9s var(--ease);
    }

    [data-motion="on"] .reveal.is-visible { opacity: 1; transform: none; }

    @media (prefers-reduced-motion: reduce) {
      .hero-art .phone-front { animation: none; }
      .store-badge-link, .grid li { transition: none; }
      .store-badge-link:hover, .grid li:hover { transform: none; }
      [data-motion="on"] .reveal { opacity: 1; transform: none; transition: none; }
    }

    /* ---------------------------------------------------------- responsive */

    @media (min-width: 720px) {
      .page { padding-inline: 32px; }
      .hero { padding-block: 84px 48px; }
      .section { padding-block: 92px; }
      .connections { padding: 64px 48px; }
      .grid { gap: 16px; grid-template-columns: repeat(2, 1fr); }
      .grid li { padding: 30px; }
      .split { grid-template-columns: 1fr 1fr; align-items: center; gap: 56px; }
      .hero-art { width: min(500px, 70vw); }
      .tour { margin-top: 52px; }
      .tour-video { aspect-ratio: 16 / 9; }
      .tour-toggle { inset-block-end: 20px; inset-inline-end: 20px; }
    }

    @media (min-width: 1040px) {
      .hero {
        display: grid;
        grid-template-columns: 1.02fr 0.98fr;
        align-items: center;
        gap: 48px;
        padding-block: 112px 72px;
      }
      .hero-art { margin-top: 0; width: 100%; max-width: 540px; }
      .grid { grid-template-columns: repeat(3, 1fr); }
      .steps-3 { grid-template-columns: repeat(3, 1fr); }
      .connections { padding: 80px 72px; }
      .split-connections { grid-template-columns: 1.25fr 0.75fr; }
      .split-reverse .split-art { order: -1; }
      .brand-mark { width: 52px; height: 52px; }
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
    /* An italic serif is a Latin voice; these scripts keep their own face. */
    .accent { font-family: var(--sans); font-style: normal; font-weight: 700; letter-spacing: normal; }
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
 * Locales the App Store artwork exists for. Every published locale has its
 * own localized screens and tour; Serbian, which is prepared but not
 * published, borrows the English set.
 */
const MEDIA_LOCALES = new Set([
  "en", "sv", "tr", "de", "es", "fr", "it", "pt", "nl", "pl", "fi", "ru",
  "ja", "ko", "zh", "ar", "hi", "th", "vi", "el", "id", "ms",
]);

function mediaLocale(locale) {
  return MEDIA_LOCALES.has(locale) ? locale : "en";
}

/** A real screen from the app, cut from that locale's App Store artwork. */
function screen(locale, id) {
  return `/assets/screens/${mediaLocale(locale)}/${id}.webp`;
}

/**
 * One phone. The screens are illustrations of the copy next to them — the
 * heading already says what the phone shows — so they carry an empty alt
 * and stay out of the screen-reader's way.
 */
function phone(locale, id, cls, { eager = false } = {}) {
  const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<img class="phone${cls ? ` ${cls}` : ""}" src="${screen(locale, id)}" alt="" width="440" height="929" ${loading} decoding="async">`;
}

/**
 * The hero: today's moment in front, a moment being shared and its video
 * reactions tilted behind it. All three are genuine ULMOX screens from the
 * App Store artwork, in the page's own language.
 */
function heroArt(locale) {
  return `        <div class="hero-art" aria-hidden="true">
          <span class="hero-halo"></span>
          <span class="hero-ring"></span>
          ${phone(locale, "04-video-reactions", "phone-back phone-left")}
          ${phone(locale, "03-share-moment", "phone-back phone-right")}
          ${phone(locale, "01-daily-moments", "phone-front", { eager: true })}
        </div>`;
}

/** A single screen on a soft pool of the section's accent colour. */
function showcase(locale, id, tone) {
  return `          <figure class="showcase showcase-${tone}" aria-hidden="true">
            ${phone(locale, id, "")}
          </figure>`;
}

/**
 * The tour: a looping, silent film of the eight App Store screens.
 *
 * Without JavaScript it is an ordinary video with the browser's own
 * controls, so nobody is left with a poster they cannot play. The script
 * replaces those controls with one play/pause toggle, plays the film only
 * while it is on screen, and never starts it for a reader who has asked for
 * reduced motion.
 */
function tour(locale, content) {
  const m = mediaLocale(locale);
  return `        <figure class="tour">
          <div class="tour-frame">
            <video
              class="tour-video"
              controls
              muted
              loop
              playsinline
              preload="metadata"
              width="1280"
              height="720"
              poster="/assets/tour/${m}.jpg"
              aria-describedby="tour-caption"
            >
              <source src="/assets/tour/${m}.mp4" type="video/mp4">
            </video>
            <button
              class="tour-toggle"
              type="button"
              hidden
              data-state="paused"
              data-label-play="${attributeSafe(content.tourPlay)}"
              data-label-pause="${attributeSafe(content.tourPause)}"
              aria-label="${attributeSafe(content.tourPlay)}"
            >
              <svg class="icon-pause" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/></svg>
              <svg class="icon-play" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 2.6v10.8a.8.8 0 0 0 1.2.7l8.6-5.4a.8.8 0 0 0 0-1.4L5.2 1.9A.8.8 0 0 0 4 2.6z" fill="currentColor"/></svg>
            </button>
          </div>
          <figcaption id="tour-caption" class="tour-caption">${content.tourLabel}</figcaption>
        </figure>`;
}

/**
 * The tour's player: one toggle, play-while-visible, and a reader's pause
 * is never overridden by scrolling.
 */
const TOUR_SCRIPT = `  <script>
    (function () {
      "use strict";

      var video = document.querySelector(".tour-video");
      var toggle = document.querySelector(".tour-toggle");
      if (!video || !toggle) return;

      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var heldByReader = reduced;
      var visible = false;

      video.removeAttribute("controls");
      toggle.hidden = false;

      function render() {
        var playing = !video.paused;
        toggle.setAttribute("data-state", playing ? "playing" : "paused");
        toggle.setAttribute(
          "aria-label",
          toggle.getAttribute(playing ? "data-label-pause" : "data-label-play")
        );
      }

      function play() {
        var attempt = video.play();
        if (attempt && attempt.catch) attempt.catch(render);
      }

      function sync() {
        if (visible && !heldByReader) play();
        else video.pause();
      }

      toggle.addEventListener("click", function () {
        heldByReader = !video.paused;
        if (heldByReader) video.pause();
        else play();
      });

      video.addEventListener("play", render);
      video.addEventListener("pause", render);

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          sync();
        }, { threshold: 0.35 }).observe(video);
      } else {
        visible = true;
        sync();
      }
      render();
    })();
  </script>`;

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

${MOTION_SCRIPT}

${TOUR_SCRIPT}`
    : `  <script src="/assets/js/i18n-config.js"></script>
  <script src="/assets/js/language-switcher.js" defer></script>

${MOTION_SCRIPT}

${TOUR_SCRIPT}`;

  return `<!DOCTYPE html>
<html lang="${locale}"${dir}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0b0a08" />
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

${heroArt(locale)}
      </section>

      <section class="section reveal" aria-labelledby="how-heading">
        <div class="section-head">
          <h2 id="how-heading">${content.howHeading}</h2>
          <p class="lede">${content.howBody}</p>
        </div>
${tour(locale, content)}
        <ol class="grid numbered steps-3">
${cards(content.howSteps)}
        </ol>
      </section>

      <section class="section world reveal" aria-labelledby="world-heading">
        <div class="split">
          <div class="split-copy">
            <h2 id="world-heading">${content.worldHeading}</h2>
            <p class="lede">${content.worldBody}</p>
            <p>${content.worldBody2}</p>
          </div>
          <div class="split-art">
${showcase(locale, "02-world-live", "sage")}
          </div>
        </div>
      </section>

      <section class="section connections reveal" aria-labelledby="connections-heading">
        <div class="split split-connections">
          <div class="section-head">
            <p class="eyebrow">Connections</p>
            <h2 id="connections-heading">${content.connectionsHeading}</h2>
            <p class="lede">${content.connectionsBody}</p>
          </div>
          <div class="split-art">
${showcase(locale, "05-connections", "rose")}
          </div>
        </div>

        <ol class="grid numbered">
${cards(content.connectionsSteps)}
        </ol>

        <p class="note note-safe">${content.connectionsSafety}</p>
        <p class="note note-rollout">${rollout}</p>
      </section>

      <section class="section reveal" aria-labelledby="global-heading">
        <div class="split split-reverse">
          <div class="split-copy">
            <h2 id="global-heading">Global</h2>
            <p class="lede">${content.globalBody}</p>
            <p>${content.globalBody2}</p>
          </div>
          <div class="split-art">
${showcase(locale, "08-global-discovery", "gold")}
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
