"use strict";

/**
 * Stage 1.6W.1 — the missing landing media and the site-wide accessible shell.
 *
 * Stage 1.6W left two genuine, pre-existing website blockers open:
 *
 *   1. All 20 landing pages referenced `demo.mp4`, a file that has never
 *      existed in this repository, behind a decorative "▶" that read as a play
 *      control. Every landing route 404'd on it.
 *   2. The 20 landing pages, the 95 hand-localized legal and support pages, the
 *      20 deletion redirects and the download page carried no `<main>`, no
 *      `<footer>`, no labelled navigation, no skip link and no visible focus,
 *      and several had no `<h1>` at all.
 *
 * This suite proves both are closed and cannot come back, and it runs the
 * accessibility battery against **every page of a real build** — 161 routes —
 * rather than a sample. The audit itself lives in scripts/audit-site.js so the
 * build can run the reference half of it as a gate.
 *
 * Nothing here reads the application repository, and nothing here talks to a
 * network, a console or a store.
 */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("fs");
const os = require("node:os");
const path = require("path");

const {
  auditAccessibility,
  auditReferences,
  auditRequiredNavigation,
  collectHtml,
  elementMarkup,
  localeOf,
  MEDIA_EXTENSIONS,
} = require("../scripts/audit-site.js");
const { CHROME, LOCALES, NAV_ROUTES, SHELL_MARKER } = require("../scripts/page-shell.js");
const T = require("../scripts/translation-content.js");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

/** Every source route, so "every page" means every page. */
function allSiteHtml() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "dist" || entry.name === "node_modules") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) files.push(path.relative(ROOT, full));
    }
  };
  walk(ROOT);
  return files.sort();
}

const SITE_HTML = allSiteHtml();

/**
 * One real build, shared by every test below.
 *
 * The battery has to run against what would be deployed: the analytics
 * injection, the file copying and the route layout are all part of what a
 * person receives, and a source-tree-only check would miss a page the build
 * changes.
 */
let cachedBuild = null;
function build() {
  if (cachedBuild) return cachedBuild;
  const { buildSite } = require("../scripts/build-site.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-shell-"));
  const result = buildSite({
    sourceRoot: ROOT,
    output: outputRoot,
    measurementId: "G-TEST123456",
    environment: "production",
  });
  cachedBuild = { outputRoot, result, routes: collectHtml(outputRoot) };
  process.on("exit", () => {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  });
  return cachedBuild;
}

const CHECKLIST = () => read("PUBLICATION_CHECKLIST.md");

/* -------------------------------------------------------------------------- */
/* 1-4. The missing landing media                                             */
/* -------------------------------------------------------------------------- */

test("1: no page anywhere still references demo.mp4", () => {
  const referencing = SITE_HTML.filter((file) => read(file).includes("demo.mp4"));
  assert.deepEqual(
    referencing,
    [],
    `demo.mp4 is still referenced by: ${referencing.join(", ")}`
  );

  // And nothing in the build either, which is what would actually be served.
  const { outputRoot, routes } = build();
  for (const route of routes) {
    assert.doesNotMatch(
      fs.readFileSync(path.join(outputRoot, route), "utf8"),
      /demo\.mp4/,
      `${route} still references demo.mp4 in the build output`
    );
  }

  // The 20 landing pages specifically: no <video>, no <source>, no play control.
  for (const route of ["index.html", ...LOCALES.map((l) => `${l}/index.html`)]) {
    const markup = elementMarkup(read(route));
    assert.doesNotMatch(markup, /<video\b/i, `${route} still has a <video>`);
    assert.doesNotMatch(markup, /<source\b/i, `${route} still has a <source>`);
    assert.doesNotMatch(markup, /play-circle|▶/, `${route} still shows a play control`);
  }
});

test("2: zero broken local references across every built page", () => {
  const { outputRoot } = build();
  const { findings, checked, mediaChecked } = auditReferences(outputRoot);
  assert.ok(checked > 1500, `only ${checked} references were checked`);
  assert.ok(mediaChecked > 50, `only ${mediaChecked} media references were checked`);
  assert.deepEqual(
    findings.map((finding) => `${finding.route}: ${finding.message}`),
    [],
    "the build contains broken local references"
  );
});

test("3: the build refuses a page that references a media file it does not ship", () => {
  const { buildSite } = require("../scripts/build-site.js");
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-src-"));
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-out-"));
  try {
    // A minimal site that is valid in every way except the missing video.
    fs.writeFileSync(path.join(sourceRoot, "CNAME"), "ulmoxapp.com\n");
    fs.writeFileSync(
      path.join(sourceRoot, "robots.txt"),
      "User-agent: *\nAllow: /\n\nSitemap: https://ulmoxapp.com/sitemap.xml\n"
    );
    fs.writeFileSync(
      path.join(sourceRoot, "sitemap.xml"),
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n'
    );
    fs.mkdirSync(path.join(sourceRoot, "assets", "js"), { recursive: true });
    fs.writeFileSync(path.join(sourceRoot, "assets", "js", "analytics-config.js"), "");
    fs.writeFileSync(
      path.join(sourceRoot, "index.html"),
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>t</title></head>' +
        '<body><video controls><source src="/tour.mp4" type="video/mp4"></video></body></html>'
    );

    assert.throws(
      () => buildSite({ sourceRoot, output: outputRoot, measurementId: "G-TEST123456" }),
      /broken local reference/i,
      "the build accepted a page pointing at a media file that does not exist"
    );
  } finally {
    fs.rmSync(sourceRoot, { recursive: true, force: true });
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("4: no zero-byte media file was left behind as a stand-in", () => {
  const { outputRoot } = build();
  const empty = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        if (fs.statSync(full).size === 0) empty.push(path.relative(outputRoot, full));
      }
    }
  };
  walk(outputRoot);
  assert.deepEqual(empty, [], `zero-byte media in the build: ${empty.join(", ")}`);

  // And the file the pages used to point at was not conjured into existence.
  assert.ok(
    !fs.existsSync(path.join(ROOT, "demo.mp4")),
    "demo.mp4 was created rather than removed from the pages"
  );
});

/* -------------------------------------------------------------------------- */
/* 5-14. The accessibility battery, on every built page                       */
/* -------------------------------------------------------------------------- */

/**
 * The audit is run once and its findings are sliced per rule, so each numbered
 * requirement below fails on its own evidence rather than on a single opaque
 * "the audit found something".
 */
let cachedAudit = null;
function audit() {
  if (!cachedAudit) {
    const { outputRoot, routes } = build();
    const accessibility = auditAccessibility(outputRoot);
    const navigation = auditRequiredNavigation(outputRoot);
    cachedAudit = {
      routes,
      findings: [...accessibility.findings, ...navigation.findings],
      pages: accessibility.pages,
    };
  }
  return cachedAudit;
}

function findingsFor(...rules) {
  return audit()
    .findings.filter((finding) => rules.includes(finding.rule))
    .map((finding) => `${finding.route} [${finding.rule}] ${finding.message}`);
}

test("the battery covers every page of the build, not a sample", () => {
  const { pages, routes } = audit();
  assert.equal(pages, routes.length);
  assert.equal(pages, SITE_HTML.length);
  assert.ok(pages >= 161, `only ${pages} pages were audited`);
});

test("5: every complete page declares the lang its route serves", () => {
  assert.deepEqual(findingsFor("lang", "html-element", "doctype"), []);
});

test("6: Arabic is the only locale that uses RTL", () => {
  assert.deepEqual(findingsFor("dir"), []);

  const { outputRoot, routes } = build();
  for (const route of routes) {
    const tag = fs.readFileSync(path.join(outputRoot, route), "utf8").match(/<html\b[^>]*>/i)[0];
    const rtl = /dir="rtl"/.test(tag);
    assert.equal(rtl, localeOf(route) === "ar", `${route}: unexpected direction`);
  }
});

test("7: every complete page has exactly one non-empty h1", () => {
  assert.deepEqual(findingsFor("h1-count", "h1-empty"), []);
});

test("8: no page skips a heading level", () => {
  assert.deepEqual(findingsFor("heading-skip"), []);
});

test("9: every complete page has a <main id=\"main\">", () => {
  assert.deepEqual(findingsFor("main", "main-id"), []);
});

test("10: every complete page has a skip link that reaches its main", () => {
  assert.deepEqual(findingsFor("skip-link", "skip-link-text", "skip-link-target"), []);

  // The skip link is visible when focused rather than hidden from the keyboard.
  const { outputRoot, routes } = build();
  for (const route of routes) {
    const html = fs.readFileSync(path.join(outputRoot, route), "utf8");
    assert.match(
      html,
      /\.(?:ulmox-)?skip-link:focus/,
      `${route}: the skip link never becomes visible`
    );
  }
});

test("11: every complete page has a footer and a labelled navigation", () => {
  assert.deepEqual(findingsFor("footer", "nav", "nav-label"), []);
});

test("12: every complete page styles :focus-visible", () => {
  assert.deepEqual(findingsFor("focus-visible"), []);
});

test("13: no link relies on non-descriptive text", () => {
  assert.deepEqual(findingsFor("generic-link"), []);
});

test("14: no link and no image is left without an accessible name", () => {
  assert.deepEqual(findingsFor("empty-link", "img-alt"), []);
});

test("text meets WCAG AA contrast on every page", () => {
  assert.deepEqual(findingsFor("contrast"), []);
});

test("every new tab is rel-protected and no media seizes the page", () => {
  assert.deepEqual(
    findingsFor("noopener", "autoplay-sound", "media-controls"),
    []
  );
});

test("every page carries a localized title and meta description", () => {
  assert.deepEqual(findingsFor("title", "description", "charset", "viewport"), []);

  // A landing page's title has to say more than the brand name; "ULMOX" alone
  // is what all 20 shipped before, and it identifies nothing in a tab strip.
  for (const route of ["index.html", ...LOCALES.map((l) => `${l}/index.html`)]) {
    const title = read(route).match(/<title>([\s\S]*?)<\/title>/i)[1];
    assert.notEqual(title.trim(), "ULMOX", `${route}: title is only the brand name`);
    assert.ok(title.length > 8, `${route}: title is not meaningful`);
  }
});

/* -------------------------------------------------------------------------- */
/* 15-16. Localization                                                        */
/* -------------------------------------------------------------------------- */

test("15: every page links to its own locale's legal and help pages", () => {
  assert.deepEqual(findingsFor("required-link", "cross-locale-link"), []);
});

test("15: all six compliance routes are reachable from every page", () => {
  const { outputRoot, routes } = build();
  const required = NAV_ROUTES.filter((entry) => entry.file !== "index.html");
  for (const route of routes) {
    const html = elementMarkup(fs.readFileSync(path.join(outputRoot, route), "utf8"));
    for (const { file } of required) {
      const own = route.endsWith(file);
      assert.ok(
        own || html.includes(file),
        `${route}: no route to ${file}`
      );
    }
  }
});

test("16: no English placeholder survives in localized chrome or content", () => {
  const english = CHROME.en;
  const authored = ["skip", "navLabel", "home", "moved"];
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    for (const key of authored) {
      const value = CHROME[locale][key];
      assert.ok(value && value.trim(), `CHROME.${locale}.${key} is empty`);
      assert.notEqual(
        value,
        english[key],
        `CHROME.${locale}.${key} is still the English string`
      );
    }
  }

  // The deletion redirects shipped their entire visible text in English on all
  // 19 localized routes. Every one of them is now in its own language.
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    const html = read(`${locale}/delete-account/index.html`);
    assert.doesNotMatch(html, /This page has moved/i, `${locale}: English redirect body`);
    assert.doesNotMatch(html, /Delete your ULMOX account/i, `${locale}: English redirect link`);
    assert.ok(html.includes(CHROME[locale].moved), `${locale}: localized redirect text missing`);
    assert.ok(
      html.includes(CHROME[locale].deleteHeading),
      `${locale}: localized redirect heading missing`
    );
  }

  // The Translation Information strings this repository authors stay localized.
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    assert.notEqual(
      T.LOCALES[locale].webGradualRollout,
      T.LOCALES.en.webGradualRollout,
      `${locale}: the rollout sentence is still English`
    );
  }
});

/**
 * Stage 1.6W.1 pinned the *old* localized prose in place, because that stage
 * restructured these pages without touching their words. Stage 1.6W.2 replaced
 * those words with translations of the canonical policies, so what this test
 * pins is the new text: the clauses each locale already had and kept, and the
 * canonical sentences it did not have before.
 */
test("localized legal prose is the canonical policy, in each locale's own words", () => {
  // Clauses that existed before this stage and were carried over verbatim.
  const carriedOver = [
    ["tr/terms.html", "ULMOX, Anlarda kullanılmak üzere müzik sunabilir."],
    ["de/terms.html", "ULMOX kann Musik zur Verwendung in Moments bereitstellen."],
    ["ja/terms.html", "ULMOXは、Momentsで使用するための音楽を提供することがあります。"],
  ];
  for (const [route, sentence] of carriedOver) {
    assert.ok(read(route).includes(sentence), `${route}: existing clause was lost`);
  }

  // Canonical statements these pages did not carry before this stage. Each is
  // a claim a reviewer or a regulator reads, in a language that had none of it.
  const translated = [
    // "ULMOX does not automatically analyse video frames, audio or transcripts."
    ["pt/safety.html", "não analisa automaticamente fotogramas de vídeo"],
    ["pl/privacy.html", "nie analizuje automatycznie klatek wideo"],
    ["zh/terms.html", "不会自动分析视频画面"],
    // Deactivation is not deletion.
    ["ja/delete_account.html", "利用停止は削除ではありません"],
    // The 24-hour child-safety figure is a review target, not a response SLA.
    ["zh/support.html", "24 小时内</strong>进入人工审核为目标"],
    // Blocking ends the current Connection; it does not forbid requalifying.
    ["fr/safety.html", "deux nouveaux échanges vidéo qualifiants"],
    ["ru/terms.html", "два новых засчитанных обмена видео"],
    ["th/privacy.html", "การแลกเปลี่ยนวิดีโอที่เข้าเกณฑ์ใหม่สองครั้ง"],
  ];
  for (const [route, sentence] of translated) {
    assert.ok(
      read(route).includes(sentence),
      `${route}: the canonical statement is missing`
    );
  }

  // Every locale keeps its own ULMOX Music clause and its own deletion caveat.
  for (const locale of LOCALES) {
    assert.match(
      read(`${locale}/terms.html`),
      /<h2 id="ulmox-music">/,
      `${locale}/terms.html: the ULMOX Music section is gone`
    );
    assert.match(
      read(`${locale}/delete_account.html`),
      /30/,
      `${locale}/delete_account.html: the erasure-window caveat is gone`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 17-19. Deletion, rollout and translation content                           */
/* -------------------------------------------------------------------------- */

test("17: every deletion route in the build is analytics-free", () => {
  const { outputRoot } = build();
  const routes = [
    "delete_account.html",
    "delete-account/index.html",
    ...LOCALES.flatMap((l) => [
      `${l}/delete_account.html`,
      `${l}/delete-account/index.html`,
    ]),
  ];
  assert.equal(routes.length, 2 + LOCALES.length * 2);

  for (const route of routes) {
    const file = path.join(outputRoot, route);
    assert.ok(fs.existsSync(file), `deletion route missing from the build: ${route}`);
    assert.doesNotMatch(
      fs.readFileSync(file, "utf8"),
      /googletagmanager|gtag\(|dataLayer|ULMOX_GA4_ANALYTICS|analytics\.js/,
      `${route} carries analytics`
    );
  }

  // The canonical route and the hyphenated redirect both still resolve.
  assert.ok(fs.existsSync(path.join(outputRoot, "delete_account.html")));
  for (const locale of LOCALES) {
    const redirect = fs.readFileSync(
      path.join(outputRoot, locale, "delete-account", "index.html"),
      "utf8"
    );
    assert.match(redirect, new RegExp(`url=/${locale}/delete_account\\.html`));
    assert.match(redirect, /<meta name="robots" content="noindex"/);
  }
});

test("18: the gradual-rollout wording is still on every page that needs it", () => {
  for (const locale of LOCALES) {
    assert.ok(
      read(`${locale}/translation.html`).includes(T.LOCALES[locale].webGradualRollout),
      `${locale}/translation.html: the rollout sentence is gone`
    );
  }
  for (const file of ["privacy.html", "terms.html", "safety.html", "support.html",
    "translation.html", "delete_account.html"]) {
    assert.ok(
      read(file).includes(T.LOCALES.en.webGradualRollout),
      `${file}: the rollout sentence is gone`
    );
  }
});

test("19: Translation Information content survived the footer change", () => {
  for (const locale of LOCALES) {
    const html = read(`${locale}/translation.html`);
    const t = T.LOCALES[locale];
    // Google's word marks and disclaimer are reproduced exactly, untranslated.
    assert.ok(html.includes(T.DISCLAIMER), `${locale}: Google's disclaimer changed`);
    assert.ok(html.includes(T.GOOGLE_TRANSLATE_WORDMARK), `${locale}: wordmark missing`);
    assert.ok(html.includes(T.CLOUD_TRANSLATION_NAME), `${locale}: service name missing`);
    // And this locale's own hand-written sentences are all still there.
    for (const key of ["translationInfoOnDevice", "translationInfoAccuracy",
      "translationInfoOriginal", "webModeration", "webNoCopy", "webModels"]) {
      assert.ok(html.includes(t[key]), `${locale}/translation.html: ${key} is gone`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 20-24. Routing, robots, GA4 and the publication gate                       */
/* -------------------------------------------------------------------------- */

test("20: every sitemap route resolves in the build", () => {
  const { outputRoot } = build();
  const locations = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locations.length >= 140, `sitemap lists only ${locations.length} routes`);
  assert.equal(new Set(locations).size, locations.length, "the sitemap has a duplicate");

  for (const location of locations) {
    const route = location.slice("https://ulmoxapp.com/".length);
    const file = route === "" || route.endsWith("/")
      ? path.join(outputRoot, route, "index.html")
      : path.join(outputRoot, route);
    assert.ok(fs.existsSync(file), `sitemap lists a route the build did not produce: ${location}`);
  }

  // Every Translation Information route and the canonical deletion route.
  for (const route of ["translation.html", ...LOCALES.map((l) => `${l}/translation.html`),
    "delete_account.html"]) {
    assert.ok(
      locations.includes(`https://ulmoxapp.com/${route}`),
      `sitemap omits ${route}`
    );
  }
});

test("21: robots blocks nothing a reviewer or a regulator has to read", () => {
  const robots = read("robots.txt");
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)\s*$/gm)].map((m) => m[1]);
  assert.deepEqual(disallowed, ["/delete-account/"]);
  assert.match(robots, /^Sitemap: https:\/\/ulmoxapp\.com\/sitemap\.xml$/m);

  const compliance = ["/privacy.html", "/terms.html", "/safety.html", "/support.html",
    "/delete_account.html", "/translation.html"];
  for (const route of compliance) {
    for (const rule of disallowed) {
      assert.ok(!route.startsWith(rule), `robots blocks ${route}`);
    }
    for (const locale of LOCALES) {
      const localized = `/${locale}${route}`;
      for (const rule of disallowed) {
        assert.ok(!localized.startsWith(rule), `robots blocks ${localized}`);
      }
    }
  }
});

test("22: GA4 is still unconfigured for an ordinary build", () => {
  const { buildSite } = require("../scripts/build-site.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-ga-shell-"));
  try {
    const result = buildSite({ sourceRoot: ROOT, output: outputRoot, measurementId: undefined });
    assert.equal(result.measurementIdConfigured, false);
    assert.match(
      fs.readFileSync(path.join(outputRoot, "assets", "js", "analytics-config.js"), "utf8"),
      /"gaMeasurementId": ""/
    );
    assert.ok(!fs.existsSync(path.join(ROOT, ".env")), "a .env was added to this repository");
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("23: the production verifier still refuses a build with no Measurement ID", () => {
  const { buildSite } = require("../scripts/build-site.js");
  const { verifyProductionBuild } = require("../scripts/verify-production-build.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-verify-shell-"));
  try {
    buildSite({ sourceRoot: ROOT, output: outputRoot, measurementId: undefined });
    assert.throws(
      () => verifyProductionBuild({ outputRoot }),
      /measurement/i,
      "the production verifier no longer requires a real Measurement ID"
    );
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("24: the publication status is explicit, and publication is not claimed", () => {
  const checklist = CHECKLIST();
  // Cleared 2026-09-09: every dependency row is Yes and the operational
  // commitment is recorded. The guard now holds the file to stating a status
  // explicitly, and to never claiming the site has actually been published.
  assert.match(checklist, /\*\*Status: CLEARED FOR PUBLICATION\.\*\*/);
  assert.match(checklist, /Cleared is not the same as published/);
  assert.match(checklist, /goes back to DO NOT PUBLISH/);

  // The guard used to assert that nothing at all had been deployed. That
  // sentence was true when written and is not any more -- most of the
  // dependencies shipped -- so asserting it would now lock a falsehood in
  // place. What must stay true is narrower and more useful: the WEBSITE is
  // still unpublished, and the reasons it is held back are stated rather than
  // implied.
  assert.doesNotMatch(checklist, /has been published to production/i);
  assert.match(checklist, /## Remaining blockers/);
  assert.match(checklist, /Deactivation is described but not deployed/i);
});

/* -------------------------------------------------------------------------- */
/* The shell itself                                                           */
/* -------------------------------------------------------------------------- */

test("the shell is canonical: regenerating every page changes nothing", () => {
  const generators = [
    "../scripts/generate-legal-pages.js",
    "../scripts/generate-localized-policies.js",
    "../scripts/generate-landing-pages.js",
    "../scripts/apply-page-shell.js",
  ];
  const before = new Map(SITE_HTML.map((file) => [file, read(file)]));

  const target = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-regen-"));
  try {
    // Copy the source tree, regenerate inside the copy, and compare. Nothing in
    // the working tree is touched by this test.
    for (const file of SITE_HTML) {
      const destination = path.join(target, file);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, before.get(file), "utf8");
    }
    for (const generator of generators) {
      require(generator).generate(target);
    }
    const changed = SITE_HTML.filter(
      (file) => fs.readFileSync(path.join(target, file), "utf8") !== before.get(file)
    );
    assert.deepEqual(
      changed,
      [],
      `these pages are out of date with their generator: ${changed.join(", ")}`
    );
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("every shelled page carries the one shared chrome definition", () => {
  const shelled = SITE_HTML.filter((file) => read(file).includes(SHELL_MARKER));
  // The 20 landing pages, the 95 localized legal pages, 20 redirects, download.
  assert.equal(shelled.length, 136, `${shelled.length} pages carry the shell`);

  // The 25 generated legal and Translation Information routes carry the Stage
  // 0.13 shell instead, which satisfies the same contract — proven above by the
  // battery running over all 161 routes.
  assert.equal(SITE_HTML.length - shelled.length, 25);
});

test("the localized chrome names every route in the locale's own words", () => {
  for (const locale of LOCALES) {
    const chrome = CHROME[locale];
    for (const { key } of NAV_ROUTES) {
      assert.ok(chrome[key] && chrome[key].trim(), `CHROME.${locale}.${key} is missing`);
    }
    const labels = NAV_ROUTES.map(({ key }) => chrome[key]);
    assert.equal(new Set(labels).size, labels.length, `${locale}: duplicate nav labels`);
  }
});

/* -------------------------------------------------------------------------- */
/* What is still open                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Stage 1.6W.1 found two localized-content defects and could not fix them, so
 * this test used to assert that both were still open and still measured.
 *
 * Stage 1.6W.2 fixed them. What the test asserts now is the fix, in the same
 * terms the defect was recorded in: the seven automated-detection sections are
 * gone from every locale, no localized policy page repeats itself, the scan has
 * no allow-list left to hide behind, and the checklist records both as resolved
 * with the evidence rather than as open.
 */
test("the two localized-content defects are resolved, and cannot return quietly", () => {
  const {
    scan,
    REMOVED_AUTOMATED_DETECTION_SECTIONS,
    DISTINCT_BLOCK_THRESHOLD,
    distinctBlockShare,
  } = require("../scripts/scan-stale-claims.js");

  const { findings, measurements } = scan();
  assert.deepEqual(
    findings.map((finding) => `${finding.route}: ${finding.message}`),
    [],
    "the claims scan reports a localized-content defect"
  );

  // Defect 1: the seven sections are gone, from all 19 locales, not just seven.
  assert.equal(REMOVED_AUTOMATED_DETECTION_SECTIONS.length, 7);
  for (const locale of LOCALES) {
    const safety = read(`${locale}/safety.html`);
    for (const section of REMOVED_AUTOMATED_DETECTION_SECTIONS) {
      assert.ok(
        !safety.includes(section),
        `${locale}/safety.html still carries "${section}"`
      );
    }
  }

  // Defect 2: every localized policy page states policy instead of repeating
  // itself. The 36 that were at 26–54% distinct are measured here with the
  // rest, against the same threshold and with no locale exempted.
  assert.equal(measurements.length, 19 * 3);
  for (const measurement of measurements) {
    assert.ok(
      measurement.share >= DISTINCT_BLOCK_THRESHOLD,
      `${measurement.route}: only ${measurement.distinct}/${measurement.blocks} blocks distinct`
    );
  }
  // The two pages the scan does not measure are held to the same bar.
  for (const locale of LOCALES) {
    for (const page of ["support.html", "delete_account.html"]) {
      const measurement = distinctBlockShare(read(`${locale}/${page}`));
      assert.ok(
        measurement.share >= DISTINCT_BLOCK_THRESHOLD,
        `${locale}/${page}: only ${measurement.distinct}/${measurement.blocks} blocks distinct`
      );
    }
  }

  const checklist = CHECKLIST();
  assert.match(
    checklist,
    /localized safety pages (?:that )?described automated[\s\S]{0,900}\*\*Resolved at Stage 1\.6W\.2\.?\*\*/,
    "the automated-detection conflict is not recorded as resolved"
  );
  assert.match(
    checklist,
    /localized Privacy, Terms and Child Safety pages repeated[\s\S]{0,900}\*\*Resolved at Stage 1\.6W\.2\.?\*\*/,
    "the repeated-content defect is not recorded as resolved"
  );
  // Resolving content defects does not resolve the release.
  assert.match(checklist, /\*\*Status: CLEARED FOR PUBLICATION\.\*\*/);
});
