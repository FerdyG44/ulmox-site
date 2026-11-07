"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const {
  ANALYTICS_MARKER,
  buildSite,
  validateMeasurementId
} = require("../scripts/build-site");

const { PUBLISHED_LANGUAGES, UNPUBLISHED_LANGUAGES } = require("../scripts/publication-policy");
const sourceRoot = path.resolve(__dirname, "..");

test("production build injects GA4 once into every HTML page", (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-site-build-"));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const outputRoot = path.join(temporaryRoot, "site");

  const result = buildSite({
    sourceRoot,
    output: outputRoot,
    measurementId: "G-TEST12345",
    environment: "production"
  });

  // Stage 0.13: the 40 account-deletion pages are deliberately excluded from
  // analytics, so 121 of the 161 production pages are instrumented (19
  // published locales x 8 HTML files + 9 root pages; 19 x 6 + 7 instrumented).
  assert.equal(result.htmlFiles, 161);
  assert.equal(result.instrumentedHtmlFiles, 121);
  const htmlFiles = [];
  function collect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(fullPath);
      if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(fullPath);
    }
  }
  collect(outputRoot);
  const { isAnalyticsExcluded } = require("../scripts/build-site.js");
  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, "utf8");
    if (!html.trim()) continue;

    const relativePath = path.relative(outputRoot, htmlPath);
    if (isAnalyticsExcluded(relativePath)) {
      // The deletion route must carry no tag at all.
      assert.equal(html.split(ANALYTICS_MARKER).length - 1, 0, htmlPath);
      assert.equal(html.split('/assets/js/analytics.js').length - 1, 0, htmlPath);
      continue;
    }

    assert.equal(html.split(ANALYTICS_MARKER).length - 1, 1, htmlPath);
    assert.equal(html.split('/assets/js/analytics.js').length - 1, 1, htmlPath);
  }

  for (const language of PUBLISHED_LANGUAGES) {
    assert.ok(fs.existsSync(path.join(outputRoot, language)), `published locale missing from dist: ${language}`);
    const privacy = fs.readFileSync(path.join(outputRoot, language, "privacy.html"), "utf8");
    assert.match(privacy, /class="callout ulmox-analytics-disclosure"/, `${language}: static analytics disclosure missing`);
  }
  for (const language of UNPUBLISHED_LANGUAGES) {
    assert.ok(fs.existsSync(path.join(sourceRoot, language)), `prepared source translation was removed: ${language}`);
    assert.ok(!fs.existsSync(path.join(outputRoot, language)), `unpublished locale copied to dist: ${language}`);
  }

  const sitemap = fs.readFileSync(path.join(outputRoot, "sitemap.xml"), "utf8");
  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(sitemapLocations.length, 140);
  for (const language of PUBLISHED_LANGUAGES) {
    assert.ok(sitemapLocations.includes(`https://ulmoxapp.com/${language}/`), `sitemap omits published locale: ${language}`);
  }
  for (const language of UNPUBLISHED_LANGUAGES) {
    assert.ok(!sitemap.includes(`https://ulmoxapp.com/${language}/`), `sitemap exposes unpublished locale: ${language}`);
  }

  const publicLocaleConfig = fs.readFileSync(path.join(outputRoot, "assets/js/i18n-config.js"), "utf8");
  const rootPrivacy = fs.readFileSync(path.join(outputRoot, "privacy.html"), "utf8");
  assert.match(rootPrivacy, /class="callout ulmox-analytics-disclosure"/);
  assert.equal((publicLocaleConfig.match(/"code":/g) || []).length, PUBLISHED_LANGUAGES.length);
  for (const language of UNPUBLISHED_LANGUAGES) {
    assert.ok(!publicLocaleConfig.includes(`"code": "${language}"`), `language selector exposes unpublished locale: ${language}`);
  }

  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, "utf8");
    for (const language of UNPUBLISHED_LANGUAGES) {
      assert.ok(!new RegExp(`hreflang=["']${language}["']`).test(html), `${htmlPath} exposes unpublished hreflang: ${language}`);
    }
  }

  const config = fs.readFileSync(
    path.join(outputRoot, "assets/js/analytics-config.js"),
    "utf8"
  );
  assert.match(config, /G-TEST12345/);

  const home = fs.readFileSync(path.join(outputRoot, "index.html"), "utf8");
  assert.match(home, /https:\/\/apps\.apple\.com\/se\/app\/ulmox\/id6765990174/);
  assert.match(home, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.ulmox\.app/);
});

test("build without GA_MEASUREMENT_ID remains valid and disables requests", (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-site-no-ga-"));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const result = buildSite({
    sourceRoot,
    output: path.join(temporaryRoot, "site"),
    measurementId: "",
    environment: "production"
  });

  assert.equal(result.measurementIdConfigured, false);
  const config = fs.readFileSync(
    path.join(result.outputRoot, "assets/js/analytics-config.js"),
    "utf8"
  );
  assert.match(config, /"gaMeasurementId": ""/);
});

test("invalid GA4 identifiers fail the production build", () => {
  assert.throws(
    () => validateMeasurementId("UA-12345"),
    /G-XXXXXXXXXX/
  );
});

test("pending translations cannot ship when their sitemap entries and alternates reappear", (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-publication-"));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  fs.mkdirSync(path.join(temporaryRoot, "assets/js"), { recursive: true });
  fs.mkdirSync(path.join(temporaryRoot, "assets/css"), { recursive: true });
  fs.writeFileSync(path.join(temporaryRoot, "assets/js/analytics.js"), "// fixture\n");
  fs.writeFileSync(path.join(temporaryRoot, "assets/js/analytics-consent-copy.js"), "// fixture\n");
  fs.writeFileSync(path.join(temporaryRoot, "assets/css/analytics-consent.css"), "/* fixture */\n");
  fs.writeFileSync(path.join(temporaryRoot, "CNAME"), "ulmoxapp.com\n");
  fs.writeFileSync(path.join(temporaryRoot, "robots.txt"), "User-agent: *\nAllow: /\n");
  const languages = ["en", ...UNPUBLISHED_LANGUAGES];
  const alternates = languages.map((locale) =>
    `<link href="https://ulmoxapp.com/${locale}/" hreflang="${locale}" rel="alternate">`
  ).join("\n");
  const html = `<!doctype html><html lang="en"><head><title>Fixture</title>${alternates}</head><body>Fixture</body></html>`;
  fs.writeFileSync(path.join(temporaryRoot, "index.html"), html);
  for (const locale of languages) {
    fs.mkdirSync(path.join(temporaryRoot, locale));
    fs.writeFileSync(path.join(temporaryRoot, locale, "index.html"), html);
  }
  fs.writeFileSync(path.join(temporaryRoot, "sitemap.xml"),
    `<urlset>${languages.map((locale) =>
      `<url><loc>https://ulmoxapp.com/${locale}/</loc></url>`).join("")}</urlset>`);

  const { outputRoot } = buildSite({ sourceRoot: temporaryRoot, measurementId: "" });
  const sitemap = fs.readFileSync(path.join(outputRoot, "sitemap.xml"), "utf8");
  const builtHtml = fs.readFileSync(path.join(outputRoot, "index.html"), "utf8");
  assert.ok(fs.existsSync(path.join(outputRoot, "en/index.html")));
  assert.ok(sitemap.includes("https://ulmoxapp.com/en/"));
  assert.ok(builtHtml.includes('hreflang="en"'));
  for (const locale of UNPUBLISHED_LANGUAGES) {
    assert.ok(!fs.existsSync(path.join(outputRoot, locale)));
    assert.ok(!sitemap.includes(`/${locale}/`));
    assert.ok(!builtHtml.includes(`hreflang="${locale}"`));
    assert.equal(fs.readFileSync(path.join(temporaryRoot, locale, "index.html"), "utf8"), html);
  }
});
