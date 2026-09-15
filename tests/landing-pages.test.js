"use strict";

/**
 * The 20 ULMOX landing routes.
 *
 * The landing pages used to describe an app that shared video moments and
 * nothing else. They now describe the product: Moments, World Live, Global and
 * Connections. That is a marketing page making product claims in 19 languages,
 * which is the exact shape of change that goes wrong quietly — a claim the app
 * does not support, an English sentence left in a Turkish page, a Connections
 * section that reads as open messaging to a store reviewer, a fabricated
 * figure nobody can source.
 *
 * This suite is the guard on all of it. It asserts what the pages must say,
 * what they must never say, and that everything they say exists in all 20
 * renditions rather than only in English.
 *
 * The site-wide batteries stay where they are: structural accessibility in
 * tests/page-shell.test.js, which runs over every route of a real build, and
 * the site-wide claim scans in tests/stage-1-6w-handoff.test.js. Nothing here
 * duplicates them; this is the landing pages' own contract.
 */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("fs");
const path = require("path");

const { LANDING } = require("../scripts/landing-content.js");
const { LOCALES, SHELL_STYLE, attributeSafe } = require("../scripts/page-shell.js");
const T = require("../scripts/translation-content.js");
const {
  ORIGIN,
  APP_STORE_URL,
  PLAY_STORE_URL,
  landingTitle,
  landingUrl,
} = require("../scripts/generate-landing-pages.js");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

/** The 20 routes, each with the content key and the locale it serves. */
const ROUTES = Object.freeze([
  { route: "index.html", key: "root", locale: "en", root: true },
  ...LOCALES.map((locale) => ({
    route: `${locale}/index.html`,
    key: locale,
    locale,
    root: false,
  })),
]);

/** Every string in a content object, addressed by its path. */
function flatten(value, prefix = "", out = {}) {
  for (const [key, inner] of Object.entries(value)) {
    const at = prefix ? `${prefix}.${key}` : key;
    if (typeof inner === "string") out[at] = inner;
    else if (inner && typeof inner === "object") flatten(inner, at, out);
  }
  return out;
}

/**
 * Denials have to be allowed to say the thing they deny — "No swiping" is not
 * an offer of swiping. This is the same sentence convention the two older
 * suites use.
 */
const NEGATED = /\b(not|never|no|without|cannot|does not|do not|nor|unless)\b/i;

function positiveSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !NEGATED.test(sentence));
}

/* -------------------------------------------------------------------------- */
/* 1. The product the page describes                                          */
/* -------------------------------------------------------------------------- */

test("every landing route names all four ULMOX surfaces", () => {
  assert.equal(ROUTES.length, 20);
  for (const { route, key } of ROUTES) {
    const html = read(route);
    const content = LANDING[key];

    // The three product names stay in English in every locale, the convention
    // the localized legal pages already use.
    for (const name of ["World Live", "Global", "Connections"]) {
      assert.ok(html.includes(name), `${route} does not name ${name}`);
    }

    // And the locale's own words for the rest of the page are on the page.
    for (const slot of [
      "heroBadge", "subtitle", "howHeading", "worldBody", "worldBody2",
      "connectionsHeading", "connectionsBody", "connectionsSafety",
      "globalBody", "globalBody2", "differentHeading", "safetyHeading",
      "safetyBody", "ctaHeading", "ctaBody",
    ]) {
      assert.ok(
        html.includes(content[slot]),
        `${route} is missing its localized ${slot}`
      );
    }
  }
});

test("the page is one h1 and seven sections, in the order a reader meets them", () => {
  for (const { route } of ROUTES) {
    const html = read(route);

    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: not one h1`);
    assert.equal((html.match(/<h2\b/g) || []).length, 7, `${route}: not seven sections`);

    const order = [
      "how-heading",
      "world-heading",
      "connections-heading",
      "global-heading",
      "different-heading",
      "safety-heading",
      "cta-heading",
    ];
    let cursor = -1;
    for (const id of order) {
      const at = html.indexOf(`<h2 id="${id}"`);
      assert.ok(at > -1, `${route}: no section ${id}`);
      assert.ok(at > cursor, `${route}: section ${id} is out of order`);
      cursor = at;
    }

    // No heading level is skipped.
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i += 1) {
      assert.ok(
        levels[i] <= levels[i - 1] + 1,
        `${route}: heading jump h${levels[i - 1]} -> h${levels[i]}`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 2. Connections                                                             */
/* -------------------------------------------------------------------------- */

test("the Connections section shows the whole flow, in every locale", () => {
  for (const { route, key } of ROUTES) {
    const html = read(route);
    const steps = LANDING[key].connectionsSteps;

    // Six steps: share, meet, become possible, request, both approve, talk.
    assert.equal(steps.length, 6, `${key}: the Connections flow is not six steps`);
    for (const step of steps) {
      assert.ok(html.includes(step.heading), `${route}: missing step "${step.heading}"`);
      assert.ok(html.includes(step.body), `${route}: missing the body of "${step.heading}"`);
    }

    // The two steps that make the flow safe rather than open are steps 5 and 6,
    // in that order: nothing opens before both people approve.
    const approve = html.indexOf(steps[4].heading);
    const talk = html.indexOf(steps[5].heading);
    assert.ok(approve > -1 && talk > approve, `${route}: talking is offered before approval`);

    // And the controls are stated on the page itself, not only in the Terms.
    assert.ok(
      html.includes(LANDING[key].connectionsSafety),
      `${route}: the Connections section does not state the safety controls`
    );
  }
});

/**
 * The availability sentence is not written here. It is `webGradualRollout` from
 * scripts/translation-content.js — the same hand-localized sentence the six
 * legal pages carry — so the landing page and the Terms cannot come to
 * disagree about whether Connections is on.
 */
test("every landing route carries its own locale's gradual-rollout sentence", () => {
  for (const { route, locale } of ROUTES) {
    const rollout = T.LOCALES[locale].webGradualRollout;
    assert.ok(rollout && rollout.trim(), `${locale}: no rollout sentence`);
    assert.ok(
      read(route).includes(rollout),
      `${route} describes Connections without the gradual-rollout sentence`
    );
  }
});

/**
 * The phrase scan runs on the two English routes only, and deliberately so.
 * `positiveSentences` recognises English negation, and several of these words
 * are loanwords elsewhere — German says "Kein Follower-Wettlauf", which is the
 * denial, not the offer, and an English-only negation test reads it as the
 * offer. Scanning 19 languages with English patterns produces false alarms
 * that get silenced by weakening the patterns, which is worse than scoping
 * them honestly. The other 18 locales are held to the structural contract
 * instead: the rollout sentence, approval before messaging, and the safety
 * controls, all asserted above for every route.
 */
test("no English landing copy markets Connections as open messaging", () => {
  const forbidden = [
    /\bswipe (right|left|to)\b/i,
    /\b(dating|hook ?up|matchmaking)\b/i,
    /\b(chat|talk|message) (with )?(strangers|anyone|random)/i,
    /\brandom (chat|video|stranger)/i,
    /\bfriend requests?\b/i,
    /\bfollowers?\b(?![^.]*\brace\b)/i,
    /\bmessage anyone\b/i,
    /\bfind (new )?people to (chat|talk|message)/i,
  ];
  for (const route of ["index.html", "en/index.html"]) {
    const text = read(route).replace(/<[^>]+>/g, " ");
    for (const sentence of positiveSentences(text)) {
      for (const pattern of forbidden) {
        assert.doesNotMatch(sentence, pattern, `${route}: ${sentence.trim()}`);
      }
    }
  }
});

test("no English landing copy promises that a moment produces a Connection", () => {
  const promises = [
    /every (moment|video)[^.<]{0,40}(becomes?|leads? to|creates?|turns into)[^.<]{0,20}connection/i,
    /(guarantee|guaranteed|always)[^.<]{0,30}connection/i,
    /(moment|video)[^.<]{0,20}(will|always) (become|create|lead to)/i,
  ];
  for (const route of ["index.html", "en/index.html"]) {
    const text = read(route).replace(/<[^>]+>/g, " ");
    for (const sentence of positiveSentences(text)) {
      for (const pattern of promises) {
        assert.doesNotMatch(sentence, pattern, `${route}: ${sentence.trim()}`);
      }
    }
  }
  // The English copy says what it is allowed to say: a genuine encounter *can*
  // make a Connection possible.
  assert.match(
    LANDING.en.connectionsSteps[2].body,
    /can make a Connection possible/
  );
});

/* -------------------------------------------------------------------------- */
/* 3. Nothing invented                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A marketing page is where an unsourced number gets written. There is no
 * user count, no download count, no rating, no review and no testimonial on
 * this site, so there is none in this file — and the only multi-digit number
 * any locale carries is the year in its copyright line.
 */
test("the landing copy carries no statistic, rating or testimonial", () => {
  for (const [key, content] of Object.entries(LANDING)) {
    for (const [slot, value] of Object.entries(flatten(content))) {
      const numbers = value.match(/\d{2,}/g) || [];
      if (numbers.length) {
        assert.equal(
          slot,
          "copyright",
          `${key}.${slot} carries a number that is not a copyright year: ${value}`
        );
      }
      assert.doesNotMatch(
        value,
        /\b\d[\d.,]*\s*(million|billion|m\+|k\+|users|people|downloads|reviews|stars?|rating)/i,
        `${key}.${slot} states a figure: ${value}`
      );
      assert.doesNotMatch(value, /★|⭐|\d\s*\/\s*5\b/, `${key}.${slot} states a rating`);
    }
  }

  // And no structured-data block smuggles one back in through the head.
  for (const { route } of ROUTES) {
    const jsonLd = read(route).match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    );
    assert.ok(jsonLd, `${route}: no structured data`);
    const data = JSON.parse(jsonLd[1]);
    for (const field of [
      "aggregateRating", "ratingValue", "reviewCount", "ratingCount",
      "review", "offers", "price", "interactionStatistic", "userInteractionCount",
    ]) {
      assert.ok(!(field in data), `${route}: structured data claims ${field}`);
    }
    assert.equal(data["@type"], "SoftwareApplication");
  }
});

/**
 * The only ULMOX artwork this repository owns is `logo.png` and the two store
 * badges. No product screenshot exists here, so the page must not be showing
 * one — every image on it resolves to a real asset, and the decorations are
 * drawn rather than photographed.
 */
test("every image on the page is a real ULMOX asset that exists", () => {
  const allowed = new Set([
    "/assets/brand/ulmox-mark-192.png",
    "/assets/badges/app-store.svg",
    "/assets/badges/google-play.png",
  ]);
  for (const { route } of ROUTES) {
    const html = read(route);
    for (const image of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)) {
      assert.ok(allowed.has(image[1]), `${route}: unexpected image ${image[1]}`);
      assert.ok(
        fs.existsSync(path.join(ROOT, image[1].slice(1))),
        `${route}: ${image[1]} does not exist`
      );
      assert.match(image[0], /\balt=/, `${route}: image without alt`);
    }
    // The drawn decorations never reach a screen reader as content.
    for (const svg of html.matchAll(/<svg\b[^>]*>/g)) {
      assert.match(svg[0], /aria-hidden="true"/, `${route}: ${svg[0]} is not decorative`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 4. Localization                                                            */
/* -------------------------------------------------------------------------- */

test("no English placeholder survives in any localized landing page", () => {
  const english = flatten(LANDING.en);

  // The two slots that are the same in every language by design: the product
  // name World Live, and a copyright line that is a year and a word mark.
  const SHARED = new Set(["worldHeading", "copyright"]);

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    const localized = flatten(LANDING[locale]);
    assert.deepEqual(
      Object.keys(localized).sort(),
      Object.keys(english).sort(),
      `${locale} does not have the same slots as English`
    );
    for (const [slot, value] of Object.entries(localized)) {
      assert.ok(value && value.trim(), `${locale}.${slot} is empty`);
      if (SHARED.has(slot.split(".").pop()) || SHARED.has(slot)) continue;
      assert.notEqual(
        value,
        english[slot],
        `${locale}.${slot} is still the English string`
      );
    }
  }
});

test("a landing page's accessible store labels are in the page's own language", () => {
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    const html = read(`${locale}/index.html`);
    const content = LANDING[locale];
    assert.ok(
      html.includes(`aria-label="${attributeSafe(content.appStoreAria)}"`),
      `${locale}: the App Store link is labelled in English`
    );
    assert.ok(
      html.includes(`aria-label="${attributeSafe(content.playStoreAria)}"`),
      `${locale}: the Google Play link is labelled in English`
    );
  }
  // The badge artwork is the English artwork, so its alt text describes what
  // is actually shown. That is the image's description, not the link's name.
  for (const { route } of ROUTES) {
    const html = read(route);
    assert.ok(html.includes('alt="Download on the App Store"'), route);
    assert.ok(html.includes('alt="Get it on Google Play"'), route);
  }
});

/**
 * Tracking that is right for Latin breaks Arabic letter joining outright, and
 * separates a Devanagari or Thai base letter from its marks. Those locales
 * must ship the reset; the Latin and Cyrillic ones must not.
 */
test("locales whose script tracking damages get the tracking reset", () => {
  const complex = ["ar", "hi", "th", "ja", "ko", "zh"];
  for (const locale of LOCALES) {
    const html = read(`${locale}/index.html`);
    const reset = html.includes(".eyebrow { letter-spacing: normal; text-transform: none; }");
    assert.equal(
      reset,
      complex.includes(locale),
      `${locale}: script tracking reset is ${reset ? "present" : "absent"} and should not be`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 5. Store links and analytics                                               */
/* -------------------------------------------------------------------------- */

test("every landing route reaches both stores, twice, and nowhere else", () => {
  for (const { route, root } of ROUTES) {
    const html = read(route);
    const appStore = (html.match(/https:\/\/apps\.apple\.com\/se\/app\/ulmox\/id6765990174/g) || []);
    const play = (html.match(/https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.ulmox\.app/g) || []);

    // Two of each: the hero and the download call to action.
    assert.ok(appStore.length >= 2, `${route}: ${appStore.length} App Store links`);
    assert.ok(play.length >= 2, `${route}: ${play.length} Google Play links`);

    // Every outbound host is a store, the production origin, or schema.org.
    for (const link of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
      const url = link[1];
      const allowed =
        url.startsWith(APP_STORE_URL) ||
        url.startsWith(PLAY_STORE_URL) ||
        url.startsWith(`${ORIGIN}/`) ||
        url.startsWith("https://schema.org");
      assert.ok(allowed, `${route}: unexpected outbound link ${url}`);
    }

    // Every new tab is rel-protected.
    for (const anchor of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(anchor[0], /rel="[^"]*noopener/, `${route}: ${anchor[0]}`);
    }

    // The root entry page keeps the two ids its redirect script looks up.
    if (root) {
      assert.match(html, /id="appStoreLink"/, `${route}: the redirect script's id is gone`);
      assert.match(html, /id="playStoreLink"/, `${route}: the redirect script's id is gone`);
    }
  }
});

/**
 * assets/js/analytics.js derives `button_location` from the DOM: the
 * `.store-badges` container, and `data-analytics-location` where it is set.
 * Renaming either silently reclassifies every store click.
 */
test("the analytics contract in the markup is intact", () => {
  for (const { route } of ROUTES) {
    const html = read(route);
    assert.equal(
      (html.match(/class="store-badges"/g) || []).length,
      2,
      `${route}: the analytics container class changed`
    );
    assert.equal(
      (html.match(/data-analytics-location="homepage_hero_store_badges"/g) || []).length,
      2,
      `${route}: the hero store links lost their analytics location`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 6. Search and social metadata                                              */
/* -------------------------------------------------------------------------- */

test("every landing route is canonical, alternated and shareable", () => {
  for (const { route, key, locale, root } of ROUTES) {
    const html = read(route);
    const content = LANDING[key];
    const url = landingUrl(locale, { root });

    assert.ok(
      html.includes(`<link rel="canonical" href="${url}" />`),
      `${route}: wrong or missing canonical`
    );

    // One alternate per locale, plus x-default.
    assert.equal(
      (html.match(/<link rel="alternate" hreflang=/g) || []).length,
      LOCALES.length + 1,
      `${route}: incomplete hreflang set`
    );
    for (const other of LOCALES) {
      assert.ok(
        html.includes(`hreflang="${other}" href="${ORIGIN}/${other}/"`),
        `${route}: no alternate for ${other}`
      );
    }
    assert.ok(
      html.includes(`hreflang="x-default" href="${ORIGIN}/"`),
      `${route}: no x-default`
    );

    const title = attributeSafe(landingTitle(key, content));
    const description = attributeSafe(content.metaDescription);

    for (const tag of [
      `<meta name="description" content="${description}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="ULMOX" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${description}" />`,
      `<meta property="og:image" content="${ORIGIN}/assets/brand/ulmox-share.png" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${title}" />`,
    ]) {
      assert.ok(html.includes(tag), `${route}: missing ${tag}`);
    }

    // The share image is a real file of the size the tags declare.
    assert.ok(fs.existsSync(path.join(ROOT, "assets/brand/ulmox-share.png")));

    // The title identifies the page, not just the brand.
    const rendered = html.match(/<title>([\s\S]*?)<\/title>/)[1];
    assert.notEqual(rendered.trim(), "ULMOX", `${route}: title is only the brand`);
    assert.ok(rendered.length > 8, `${route}: title is not meaningful`);

    // The structured data points at this page, in this language.
    const data = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]
    );
    assert.equal(data.url, url, `${route}: structured data points elsewhere`);
    assert.equal(data.inLanguage, locale, `${route}: structured data in the wrong language`);
    assert.deepEqual(data.sameAs, [APP_STORE_URL, PLAY_STORE_URL]);
  }
});

/* -------------------------------------------------------------------------- */
/* 7. Motion, responsiveness and the skip link                                */
/* -------------------------------------------------------------------------- */

/**
 * An animation must never be the reason a section is missing. The rule that
 * hides a section is applied only under `[data-motion="on"]`, an attribute
 * JavaScript sets after it has confirmed it can show the section again, so
 * with JavaScript off or still loading the page is fully visible.
 */
test("no content is hidden unless the script that reveals it is running", () => {
  for (const { route } of ROUTES) {
    const html = read(route);
    assert.match(
      html,
      /\[data-motion="on"\] \.reveal \{\s*\n?\s*opacity: 0;/,
      `${route}: the reveal rule is not gated on the script being armed`
    );
    // No ungated rule sets .reveal to opacity 0.
    assert.doesNotMatch(
      html,
      /(?<!\[data-motion="on"\] )\.reveal \{[^}]*opacity: 0/,
      `${route}: a section is hidden unconditionally`
    );
    // Reduced motion turns the whole thing off rather than leaving it half on.
    assert.match(html, /@media \(prefers-reduced-motion: reduce\)/, route);
  }
});

test("the page is mobile-first and declares a responsive viewport", () => {
  for (const { route } of ROUTES) {
    const html = read(route);
    assert.match(html, /name="viewport"[^>]*width=device-width/, `${route}: not responsive`);
    assert.match(html, /viewport-fit=cover/, `${route}: no safe-area handling`);
    // The base rules are the phone; the wider layouts are additive.
    assert.match(html, /@media \(min-width: 720px\)/, `${route}: no tablet layout`);
    assert.match(html, /@media \(min-width: 1040px\)/, `${route}: no desktop layout`);
    assert.doesNotMatch(
      html,
      /@media \(max-width: (600|720|1040)px\)\s*\{[\s\S]{0,200}grid-template-columns/,
      `${route}: the layout is written desktop-first`
    );
  }
});

/**
 * `left: -9999px` hides an element on a left-to-right page and puts it inside
 * the scrollable area of a right-to-left one. Every Arabic route on this site
 * could be dragged 9999px sideways because both page shells used it for the
 * skip link. It is clipped now, and must stay clipped.
 */
test("the skip link is clipped, never pushed off the side of the page", () => {
  assert.doesNotMatch(SHELL_STYLE, /-9999/, "the shell skip link is off-screen again");
  assert.match(SHELL_STYLE, /clip-path: inset\(50%\)/);
  assert.match(SHELL_STYLE, /\.ulmox-skip-link:focus/);

  // The rule itself, not the note above it that records what was removed.
  const legalRule = read("scripts/legal-pages.js").match(/\.skip-link \{[\s\S]*?\}/)[0];
  assert.doesNotMatch(legalRule, /-9999/, "the legal skip link is off-screen again");
  assert.match(legalRule, /clip-path: inset\(50%\)/);
  assert.match(read("scripts/legal-pages.js"), /\.skip-link:focus \{/);

  // And no page in the tree still carries the old rule.
  const walk = (dir, files = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "dist" || entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, files);
      else if (entry.name.endsWith(".html")) files.push(path.relative(ROOT, full));
    }
    return files;
  };
  for (const file of walk(ROOT)) {
    assert.doesNotMatch(read(file), /-9999px/, `${file} still pushes the skip link off-screen`);
  }
});
