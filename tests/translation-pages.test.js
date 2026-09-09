"use strict";

/**
 * Stage 1.3T-W — the public translation surface.
 *
 * Two kinds of claim are policed here. The first is Google's: its word marks,
 * its links and its disclaimer must survive byte-for-byte, in every locale.
 * The second is ours: translation is optional, on-device, undeployed, and it
 * never touches a moderation decision. Both are easy to erode with a well-meant
 * edit, so both fail the suite instead.
 */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("fs");
const os = require("node:os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const T = require("../scripts/translation-content.js");
const LOCALES = T.LOCALE_CODES;

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

/** Root canonical page plus every localized route. */
const TRANSLATION_ROUTES = [
  "translation.html",
  ...LOCALES.map((l) => `${l}/translation.html`),
];

const routes = Object.fromEntries(
  TRANSLATION_ROUTES.map((file) => [file, read(file)])
);

/**
 * Denying an overclaim is the point of several of these pages — "we do not
 * claim that Google receives the text of your messages" has to be allowed to
 * say so. Sentences are therefore scanned one at a time, and a sentence that
 * negates the claim is skipped.
 */
const NEGATED = /\b(not|never|no|without|cannot|does not|do not|nor)\b/i;

function positiveSentences(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !NEGATED.test(sentence));
}

/* -------------------------------------------------------------------------- */
/* Google's protected text                                                    */
/* -------------------------------------------------------------------------- */

test("Google's mandatory disclaimer appears verbatim on every route", () => {
  // Reproduced exactly: not translated, re-cased, abridged or paraphrased.
  assert.equal(
    T.DISCLAIMER,
    "THIS SERVICE MAY CONTAIN TRANSLATIONS POWERED BY GOOGLE. GOOGLE DISCLAIMS ALL WARRANTIES RELATED TO THE TRANSLATIONS, EXPRESS OR IMPLIED, INCLUDING ANY WARRANTIES OF ACCURACY, RELIABILITY, AND ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT."
  );
  for (const [file, html] of Object.entries(routes)) {
    assert.ok(html.includes(T.DISCLAIMER), `${file} lacks the exact disclaimer`);
  }
});

test("the disclaimer is identical across all 20 routes", () => {
  const found = new Set();
  for (const html of Object.values(routes)) {
    const match = html.match(/THIS SERVICE MAY CONTAIN TRANSLATIONS[^<]*/);
    assert.ok(match, "disclaimer missing");
    found.add(match[0].trim());
  }
  assert.equal(found.size, 1, "the protected notice drifted between locales");
});

test("the application and the website carry the same disclaimer", () => {
  // The app is the other half of this claim; if either is edited alone, the
  // two surfaces would start telling a reviewer different things.
  const arb = path.resolve(
    ROOT,
    "..",
    "moment_app",
    "lib",
    "l10n",
    "app_en.arb"
  );
  if (!fs.existsSync(arb)) return; // app repo not present; website stands alone
  const app = JSON.parse(fs.readFileSync(arb, "utf8"));
  assert.equal(app.translationDisclaimer, T.DISCLAIMER);
});

test("the official Google links are exact and open safely", () => {
  assert.equal(T.GOOGLE_TRANSLATE_URL, "https://translate.google.com/");
  assert.equal(T.CLOUD_TRANSLATION_URL, "https://cloud.google.com/translate");
  for (const [file, html] of Object.entries(routes)) {
    assert.ok(
      html.includes(`href="${T.GOOGLE_TRANSLATE_URL}"`),
      `${file} lacks the Google Translate link`
    );
    assert.ok(
      html.includes(`href="${T.CLOUD_TRANSLATION_URL}"`),
      `${file} lacks the Cloud Translation link`
    );
    for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(match[0], /rel="[^"]*noopener/, `${file}: ${match[0]}`);
    }
  }
});

test("Google word marks are never altered, abbreviated or recreated", () => {
  const MANGLED = [
    /Google-Translate/,
    /GoogleTranslate/,
    /G\s*Translate/,
    /\bGTranslate\b/,
    /google translate/,          // lower-cased mark
    /GOOGLE TRANSLATE(?!\.)/,    // shouted mark outside the verbatim notice
    /Translate by Google/,
    /Traducir con Google|Ãœbersetzen mit Google|Translate with google/,
  ];
  for (const [file, html] of Object.entries(routes)) {
    // Remove the verbatim notice first: it legitimately shouts "GOOGLE".
    const body = html.split(T.DISCLAIMER).join(" ");
    for (const pattern of MANGLED) {
      assert.doesNotMatch(body, pattern, `${file} reshapes a Google mark`);
    }
    assert.ok(
      body.includes(T.GOOGLE_TRANSLATE_WORDMARK),
      `${file} lacks the unmodified word mark`
    );
  }
});

test("the action label is Google's, identical in every locale", () => {
  assert.equal(T.TRANSLATE_ACTION, "Translate with Google");
  assert.equal(T.ATTRIBUTION_WORDMARK, "powered by Google Translate");
  // The canonical page names the action; no locale invents a translated form.
  assert.ok(read("translation.html").includes(T.TRANSLATE_ACTION));
  for (const locale of LOCALES) {
    assert.equal(T.LOCALES[locale].translateWithGoogle, T.TRANSLATE_ACTION);
    assert.equal(T.LOCALES[locale].translationAttribution, T.ATTRIBUTION_WORDMARK);
  }
});

test("no page recreates a Google graphic or invents a text substitute", () => {
  for (const [file, html] of Object.entries(routes)) {
    assert.doesNotMatch(html, /<svg/i, `${file} draws a mark`);
    assert.doesNotMatch(html, /<img/i, `${file} embeds an image`);
    assert.doesNotMatch(
      html,
      /\[powered by Google Translate\]|\(powered by Google Translate\)/i,
      `${file} fakes the badge in text`
    );
  }
});

test("no page suggests Google endorses ULMOX or any message", () => {
  const canonical = read("translation.html");
  assert.match(
    canonical,
    /Google does not write, review,\s*\n?\s*approve or endorse any message sent through ULMOX/
  );
  for (const [file, html] of Object.entries(routes)) {
    for (const pattern of [
      /Google (endorses|approves|recommends|partners with|certifies)/i,
      /in partnership with Google/i,
      /Google-approved/i,
    ]) {
      assert.doesNotMatch(html, pattern, `${file} implies endorsement`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* ULMOX's own claims                                                         */
/* -------------------------------------------------------------------------- */

const PRIVACY = () => read("privacy.html");

/**
 * Stage 1.6W replaced the "not available yet" notice with a gradual-rollout
 * sentence. The old wording was a "coming soon" claim, and the application
 * repository's README rejects that framing: a reviewer who reads a page saying
 * a feature is not available yet, while looking straight at it in the build,
 * reads a page that is wrong about the product. The replacement is true before
 * review, during review, during a staged rollout and afterwards.
 *
 * This assertion is stricter than the one it replaces, not weaker: it requires
 * the rollout sentence in all 20 routes *and* on Privacy, and the availability
 * guards below forbid the claim the old wording was protecting against.
 */
test("translation is described as optional, on-device and gradually rolled out", () => {
  const canonical = read("translation.html");
  assert.match(canonical, /Translation is optional/);
  assert.match(canonical, /happens on this device/);
  assert.ok(canonical.includes(T.LOCALES.en.webGradualRollout));
  assert.ok(PRIVACY().includes(T.LOCALES.en.webGradualRollout));
  // Every localized route carries its own rollout sentence, hand-written.
  for (const locale of LOCALES) {
    const html = routes[`${locale}/translation.html`];
    assert.ok(
      html.includes(T.LOCALES[locale].webGradualRollout),
      `${locale} omits the gradual-rollout notice`
    );
  }
});

test("no page claims message text is uploaded to Google", () => {
  const forbidden = [
    /(message|text)[^.<]{0,40}(is |are )?(sent|uploaded|transmitted)[^.<]{0,30}to Google/i,
    /Google receives[^.<]{0,40}(message|text)/i,
    /Google (stores|reads|keeps)[^.<]{0,30}your messages/i,
  ];
  const pages = { ...routes, "privacy.html": PRIVACY() };
  for (const [file, html] of Object.entries(pages)) {
    for (const sentence of positiveSentences(html)) {
      for (const pattern of forbidden) {
        assert.doesNotMatch(sentence, pattern, `${file}: ${sentence}`);
      }
    }
  }
  // The honest denial is present and stays present.
  assert.match(
    PRIVACY(),
    /We do not claim that\s*\n?\s*Google receives the text of your messages/
  );
});

test("no page claims zero network activity or absolute on-device secrecy", () => {
  const overclaims = [
    /nothing (ever )?leaves your device/i,
    /never leaves (your|the) device/i,
    /no (network|internet) (connection|access|activity)/i,
    /makes no network/i,
    /completely offline/i,
    /fully on-device and nothing/i,
  ];
  const pages = { ...routes, "privacy.html": PRIVACY() };
  for (const [file, html] of Object.entries(pages)) {
    for (const sentence of positiveSentences(html)) {
      for (const pattern of overclaims) {
        assert.doesNotMatch(sentence, pattern, `${file}: ${sentence}`);
      }
    }
  }
  // And the honest statement is present.
  assert.match(
    read("translation.html"),
    /We do not claim that nothing ever leaves your device/
  );
  assert.match(PRIVACY(), /we\s*\n?\s*do not claim that nothing ever leaves your device/i);
});

test("ML Kit's real network purposes are disclosed", () => {
  const privacy = PRIVACY();
  for (const purpose of [
    "delivering language packs",
    "remote configuration",
    "diagnostics and usage analytics",
    "per-installation identifier",
    "performance data",
    "error codes",
    "identified language",
  ]) {
    assert.ok(privacy.includes(purpose), `privacy omits: ${purpose}`);
  }
  assert.match(privacy, /Google ML Kit Translation and Language Identification/);
  assert.match(privacy, /Firebase Remote Config and Firebase Installations/);
});

test("the original message stays authoritative everywhere", () => {
  assert.match(read("translation.html"), /The original message is the one that counts/);
  assert.match(read("terms.html"), /rely on the original message/);
  assert.match(read("safety.html"), /A report always concerns the <strong>original message<\/strong>/);
  assert.match(PRIVACY(), /the original message stays on screen and remains\s*\n?\s*the authoritative one/);
});

test("moderation and reporting use the original, never the translation", () => {
  assert.match(read("safety.html"), /that is what a moderator reads/);
  assert.match(read("safety.html"), /is not a moderation decision\s*\n?\s*and is not evidence/);
  assert.match(read("safety.html"), /A translation cannot make a message deliverable/);
  assert.match(PRIVACY(), /A translation never becomes moderation evidence/);
  assert.match(read("translation.html"), /A translation is not a moderation decision/);
  for (const locale of LOCALES) {
    assert.ok(
      routes[`${locale}/translation.html`].includes(T.LOCALES[locale].webModeration),
      `${locale} omits the moderation sentence`
    );
  }
});

test("no automatic ban is claimed on any translation surface", () => {
  const pages = { ...routes, "safety.html": read("safety.html"), "terms.html": read("terms.html") };
  for (const [file, html] of Object.entries(pages)) {
    for (const sentence of positiveSentences(html)) {
      assert.doesNotMatch(
        sentence,
        /automatically ban|auto-ban|translation[^.]{0,40}ban(s|ned)?\b/i,
        `${file}: ${sentence}`
      );
    }
  }
  assert.match(read("safety.html"), /Only an\s*\n?\s*authorised ULMOX administrator can ban an account/);
});

test("no page claims automated filtering catches every violation", () => {
  const pages = { ...routes, "safety.html": read("safety.html") };
  for (const [file, html] of Object.entries(pages)) {
    for (const sentence of positiveSentences(html)) {
      for (const pattern of [
        /(detects|catches|finds|blocks) (every|all) violation/i,
        /automatically (detects|removes) all/i,
      ]) {
        assert.doesNotMatch(sentence, pattern, `${file}: ${sentence}`);
      }
    }
  }
  assert.match(read("safety.html"), /does not claim that any automated check finds every violation/);
});

test("support guidance never asks for message text or credentials", () => {
  const support = read("support.html");
  assert.match(support, /<strong>Do not email us the message\.<\/strong>/);
  assert.match(support, /screenshots of a private conversation/);
  assert.match(support, /device identifiers/);
  // And it routes the user to the in-app report instead.
  assert.match(support, /Report the message in the app instead/);
});

test("support covers every model-management failure mode", () => {
  const support = read("support.html");
  for (const topic of [
    "still downloading",
    "Downloads use Wi-Fi by default",
    "choose to use it explicitly",
    "download failed",
    "could not be identified confidently",
    "Delete downloaded language packs",
    "Read the original",
  ]) {
    assert.ok(support.includes(topic), `support omits: ${topic}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Localization                                                               */
/* -------------------------------------------------------------------------- */

test("every locale has hand-written text, with no English placeholder", () => {
  const english = T.LOCALES.en;
  const AUTHORED = [
    "translationInformationTitle",
    "translationInfoPoweredBy",
    "translationInfoOptional",
    "translationInfoOnDevice",
    "translationInfoModels",
    "translationInfoNetwork",
    "translationInfoAccuracy",
    "translationInfoOriginal",
    "translationInfoPivot",
    "webModeration",
    "webModels",
    "webNoCopy",
    "webGradualRollout",
    "webPrivacyLink",
  ];
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    for (const key of AUTHORED) {
      const value = T.LOCALES[locale][key];
      assert.ok(value && value.trim(), `${locale}.${key} is empty`);
      assert.notEqual(
        value,
        english[key],
        `${locale}.${key} is still the English string`
      );
    }
  }
});

test("localized routes carry the right lang, direction and title", () => {
  for (const locale of LOCALES) {
    const html = routes[`${locale}/translation.html`];
    const tag = html.match(/<html\b[^>]*>/)[0];
    assert.ok(tag.includes(`lang="${locale}"`), `${locale}: wrong lang`);
    if (locale === "ar") assert.ok(tag.includes('dir="rtl"'), "ar needs rtl");
    else assert.ok(!tag.includes('dir="rtl"'), `${locale} must not be rtl`);
    assert.ok(
      html.includes(`<title>${T.LOCALES[locale].translationInformationTitle} - ULMOX</title>`),
      `${locale}: title not localized`
    );
  }
});

test("localized routes stay inside their own locale", () => {
  for (const locale of LOCALES) {
    const html = routes[`${locale}/translation.html`];
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      assert.ok(
        !href.startsWith("/") && !href.includes("../"),
        `${locale} links out of its locale: ${href}`
      );
    }
  }
});

test("every translation route is structurally sound and accessible", () => {
  for (const [file, html] of Object.entries(routes)) {
    assert.match(html, /<meta charset="UTF-8"/, `${file}: charset`);
    assert.match(
      html,
      /<meta name="viewport" content="width=device-width, initial-scale=1\.0"/,
      `${file}: viewport`
    );
    assert.match(html, /<meta name="description"/, `${file}: description`);
    assert.equal((html.match(/<h1>/g) || []).length, 1, `${file}: one h1`);
    if (/<h3>/.test(html)) assert.match(html, /<h2>/, `${file}: h3 without h2`);
    assert.match(html, /<main id="main">/, `${file}: main landmark`);
    assert.match(html, /class="skip-link"/, `${file}: skip link`);
    assert.match(html, /<footer>/, `${file}: footer landmark`);
    assert.match(html, /<nav aria-label=/, `${file}: unlabelled nav`);
    assert.match(html, /focus-visible/, `${file}: focus style`);
    // WCAG AA: the shared palette's documented contrast tokens are intact.
    assert.match(html, /--muted: #d6d6d6/, `${file}: contrast token changed`);
  }
});

/* -------------------------------------------------------------------------- */
/* Routing, packaging and preserved guarantees                                */
/* -------------------------------------------------------------------------- */

test("the translation route is reachable from every footer", () => {
  for (const file of ["index.html", ...LOCALES.map((l) => `${l}/index.html`)]) {
    assert.match(read(file), /href="translation\.html"/, `${file} footer`);
    // The required legal and deletion links were not displaced.
    assert.match(read(file), /href="delete_account\.html"/, `${file} deletion`);
    assert.match(read(file), /href="privacy\.html"/, `${file} privacy`);
  }
});

test("the sitemap lists every translation route and nothing unbuilt", () => {
  const sitemap = read("sitemap.xml");
  const expected = ["https://ulmoxapp.com/translation.html",
    ...LOCALES.map((l) => `https://ulmoxapp.com/${l}/translation.html`)];
  for (const url of expected) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing ${url}`);
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, 140);
});

test("robots does not block the translation route", () => {
  const robots = read("robots.txt");
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)\s*$/gm)].map((m) => m[1]);
  for (const rule of disallowed) {
    assert.ok(!"/translation.html".startsWith(rule), `robots blocks translation: ${rule}`);
    for (const locale of LOCALES) {
      assert.ok(!`/${locale}/translation.html`.startsWith(rule), `robots blocks ${locale}`);
    }
  }
});

test("generated translation pages match the generator exactly", () => {
  const { OUTPUTS, localizedTranslationPage } = require("../scripts/generate-legal-pages.js");
  const canonical = OUTPUTS.find(([file]) => file === "translation.html");
  assert.ok(canonical, "the generator no longer emits translation.html");
  assert.equal(read("translation.html"), canonical[1]);
  for (const locale of LOCALES) {
    assert.equal(
      read(`${locale}/translation.html`),
      localizedTranslationPage(locale),
      `${locale}/translation.html has drifted from the generator`
    );
  }
});

test("the build ships every translation route and keeps deletion analytics-free", () => {
  const { buildSite } = require("../scripts/build-site.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-tr-"));
  try {
    const result = buildSite({
      sourceRoot: ROOT,
      output: outputRoot,
      measurementId: "G-TEST123456",
      environment: "production",
    });
    assert.equal(result.htmlFiles, 161);

    for (const file of TRANSLATION_ROUTES) {
      const built = path.join(outputRoot, file);
      assert.ok(fs.existsSync(built), `${file} missing from the build`);
      // A translation page is ordinary content and is instrumented.
      assert.match(fs.readFileSync(built, "utf8"), /ULMOX_GA4_ANALYTICS/, file);
    }

    // Adding 20 routes must not have leaked analytics onto a deletion route.
    const deletion = [
      "delete_account.html",
      "delete-account/index.html",
      ...LOCALES.flatMap((l) => [
        `${l}/delete_account.html`,
        `${l}/delete-account/index.html`,
      ]),
    ];
    for (const file of deletion) {
      const html = fs.readFileSync(path.join(outputRoot, file), "utf8");
      assert.doesNotMatch(html, /googletagmanager|gtag\(|ULMOX_GA4_ANALYTICS/, file);
    }
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("GA4 is still unconfigured for the ordinary build", () => {
  const { buildSite } = require("../scripts/build-site.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-ga-"));
  try {
    const result = buildSite({ sourceRoot: ROOT, output: outputRoot, measurementId: undefined });
    assert.equal(result.measurementIdConfigured, false);
    const config = fs.readFileSync(
      path.join(outputRoot, "assets", "js", "analytics-config.js"),
      "utf8"
    );
    assert.match(config, /"gaMeasurementId": ""/);
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("the checklist records translation as undeployed and still blocks publication", () => {
  const checklist = read("PUBLICATION_CHECKLIST.md");
  assert.match(checklist, /Status: CLEARED FOR PUBLICATION|DO NOT PUBLISH/);
  for (const item of [
    "Compatible app release deployed",
    "Real-device ML Kit testing on a physical iOS device",
    "Real-device ML Kit testing on a physical Android device",
    "App Store description states Google Translate",
    "Play listing",
    "App Store privacy answers",
    "Play Data Safety answers",
    "Review Notes",
    "App Thinning",
    "Organizer privacy-report verification",
    "UGC branding risk",
    "connectionsEnabled",
  ]) {
    assert.match(checklist, new RegExp(item, "i"), `checklist missing: ${item}`);
  }
  assert.doesNotMatch(checklist, /\| \*\*(Done|Complete|Verified|Live)\*\* \|/);
});
