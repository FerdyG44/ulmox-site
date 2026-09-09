"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {
  ANALYTICS_MARKER,
  REQUIRED_ROOT_FILES,
  isAnalyticsExcluded,
  validateMeasurementId
} = require("./build-site");

const APP_STORE_URL =
  "https://apps.apple.com/se/app/ulmox/id6765990174";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ulmox.app";
const EXPECTED_DOMAIN = "ulmoxapp.com";
const TEXT_FILE_EXTENSIONS = new Set([
  ".css", ".html", ".js", ".json", ".svg", ".txt", ".xml"
]);

function collectFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath, files);
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function readRequiredFile(filePath) {
  assert.ok(fs.existsSync(filePath), `Missing production file: ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

function validateProductionMeasurementId(value) {
  const measurementId = validateMeasurementId(value);
  assert.ok(
    measurementId,
    "GA_MEASUREMENT_ID is required for a production deployment."
  );
  assert.doesNotMatch(
    measurementId,
    /^G-X+$/,
    "GA_MEASUREMENT_ID must be the real production Measurement ID, not a placeholder."
  );
  return measurementId;
}

const PRODUCTION_ORIGIN = "https://ulmoxapp.com";

/**
 * Routes that must stay indexable.
 *
 * robots.txt may exclude the hyphenated redirect, which only forwards to the
 * canonical page, but it must never hide the legal, safety, support, privacy
 * or account-deletion material a store reviewer and a regulator have to find.
 */
const MUST_INDEX = Object.freeze([
  "/privacy.html",
  "/terms.html",
  "/safety.html",
  "/support.html",
  "/delete_account.html"
]);

/** Maps a sitemap <loc> to the file the deployed site would serve for it. */
function routeToOutputPath(outputRoot, locationUrl) {
  const routePath = locationUrl.slice(PRODUCTION_ORIGIN.length) || "/";
  const relative = routePath.endsWith("/")
    ? path.join(routePath.slice(1), "index.html")
    : routePath.slice(1);
  return path.join(outputRoot, relative);
}

/**
 * Stage 0.14B-R: robots.txt and sitemap.xml never reached dist/, so a deployed
 * site served neither. The build now copies both; this fails the deployment if
 * either is missing, malformed, points at the wrong origin, lists a route the
 * build did not produce, or hides a page that must stay indexable.
 */
function verifyRobotsAndSitemap(outputRoot) {
  const robots = readRequiredFile(path.join(outputRoot, "robots.txt"));
  const sitemap = readRequiredFile(path.join(outputRoot, "sitemap.xml"));

  assert.match(
    robots,
    new RegExp(`^Sitemap:\\s*${PRODUCTION_ORIGIN}/sitemap\\.xml\\s*$`, "m"),
    "robots.txt does not reference the production sitemap."
  );

  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)\s*$/gm)]
    .map((match) => match[1])
    .filter((value) => value !== "");
  for (const route of MUST_INDEX) {
    for (const rule of disallowed) {
      assert.ok(
        !route.startsWith(rule),
        `robots.txt blocks a page that must stay indexable: ${route} (Disallow: ${rule})`
      );
    }
  }

  assert.match(sitemap.trimStart(), /^<\?xml /, "sitemap.xml is not well formed.");
  assert.match(sitemap, /<urlset\b/, "sitemap.xml has no <urlset>.");
  assert.match(sitemap, /<\/urlset>\s*$/, "sitemap.xml is truncated.");

  const locations = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].trim());
  assert.ok(locations.length > 0, "sitemap.xml lists no URLs.");

  const seen = new Set();
  for (const location of locations) {
    assert.ok(location, "sitemap.xml contains an empty <loc>.");
    assert.ok(
      location.startsWith(`${PRODUCTION_ORIGIN}/`),
      `sitemap.xml uses the wrong origin: ${location}`
    );
    assert.ok(!seen.has(location), `sitemap.xml lists a duplicate URL: ${location}`);
    seen.add(location);

    const target = routeToOutputPath(outputRoot, location);
    assert.ok(
      fs.existsSync(target),
      `sitemap.xml lists a route the build did not produce: ${location}`
    );
  }

  assert.ok(
    seen.has(`${PRODUCTION_ORIGIN}/delete_account.html`),
    "sitemap.xml omits the canonical account-deletion route."
  );

  return { robotsVerified: true, sitemapUrls: seen.size };
}

function verifyProductionBuild({
  outputRoot = path.resolve(__dirname, "..", "dist"),
  measurementId = process.env.GA_MEASUREMENT_ID
} = {}) {
  const normalizedId = validateProductionMeasurementId(measurementId);
  assert.ok(
    fs.existsSync(outputRoot) && fs.statSync(outputRoot).isDirectory(),
    `Production output directory does not exist: ${outputRoot}`
  );

  const files = collectFiles(outputRoot);
  const htmlFiles = files.filter((filePath) => filePath.endsWith(".html"));
  let instrumentedHtmlFiles = 0;

  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, "utf8");
    if (!html.trim()) continue;

    // Stage 0.13: the account-deletion route is intentionally analytics-free.
    // Verify the absence positively, so a future build cannot quietly start
    // measuring people while they delete their account.
    if (isAnalyticsExcluded(path.relative(outputRoot, htmlPath))) {
      assert.equal(
        html.split(ANALYTICS_MARKER).length - 1,
        0,
        `${htmlPath}: the deletion route must carry no GA4 marker.`
      );
      assert.equal(
        html.split('/assets/js/analytics.js').length - 1,
        0,
        `${htmlPath}: the deletion route must carry no analytics script.`
      );
      continue;
    }

    assert.equal(
      html.split(ANALYTICS_MARKER).length - 1,
      1,
      `${htmlPath}: expected exactly one GA4 marker.`
    );
    assert.equal(
      html.split('/assets/js/analytics-config.js').length - 1,
      1,
      `${htmlPath}: expected exactly one analytics config tag.`
    );
    assert.equal(
      html.split('/assets/js/analytics.js').length - 1,
      1,
      `${htmlPath}: expected exactly one analytics script tag.`
    );
    instrumentedHtmlFiles += 1;
  }
  assert.ok(instrumentedHtmlFiles > 0, "No instrumented HTML pages were found.");

  const runtimeConfig = readRequiredFile(
    path.join(outputRoot, "assets", "js", "analytics-config.js")
  );
  assert.match(
    runtimeConfig,
    new RegExp(`"gaMeasurementId": ${JSON.stringify(normalizedId)}`),
    "The generated analytics config does not contain the configured Measurement ID."
  );
  assert.match(runtimeConfig, /"environment": "production"/);

  const cname = readRequiredFile(path.join(outputRoot, "CNAME")).trim();
  assert.equal(cname, EXPECTED_DOMAIN, "The production CNAME is not ulmoxapp.com.");

  for (const name of REQUIRED_ROOT_FILES) {
    assert.ok(
      fs.existsSync(path.join(outputRoot, name)),
      `Missing production root file: ${name}`
    );
  }
  const { robotsVerified, sitemapUrls } = verifyRobotsAndSitemap(outputRoot);

  /*
   * Stage 1.6W.1: a production artifact must also be *usable*.
   *
   * The build already refuses a broken local reference. This repeats that check
   * on the artifact being deployed, and adds the accessibility contract every
   * page is now generated against, so a hand edit that reaches dist/ without
   * going through the generators cannot be deployed.
   */
  const {
    auditAccessibility,
    auditReferences,
    auditRequiredNavigation
  } = require("./audit-site");

  const references = auditReferences(outputRoot);
  assert.deepEqual(
    references.findings.map((finding) => `${finding.route}: ${finding.message}`),
    [],
    "The production artifact contains broken local references."
  );

  const accessibility = auditAccessibility(outputRoot);
  const navigation = auditRequiredNavigation(outputRoot);
  const structural = [...accessibility.findings, ...navigation.findings];
  assert.deepEqual(
    structural
      .slice(0, 20)
      .map((finding) => `${finding.route} [${finding.rule}] ${finding.message}`),
    [],
    `The production artifact fails ${structural.length} accessibility check(s).`
  );

  const homeHtml = readRequiredFile(path.join(outputRoot, "index.html"));
  const downloadHtml = readRequiredFile(
    path.join(outputRoot, "download", "index.html")
  );
  const downloadScript = readRequiredFile(
    path.join(outputRoot, "download", "script.js")
  );
  for (const [name, content] of [
    ["home page", homeHtml],
    ["download page", downloadHtml],
    ["download script", downloadScript]
  ]) {
    assert.match(content, new RegExp(APP_STORE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${name}: App Store link changed unexpectedly.`);
    assert.match(content, new RegExp(PLAY_STORE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${name}: Google Play link changed unexpectedly.`);
  }

  assert.match(downloadScript, /window\.location\.search/);
  for (const key of [
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"
  ]) {
    assert.match(downloadScript, new RegExp(`"${key}"`));
  }
  assert.doesNotMatch(downloadScript, /history\.(?:pushState|replaceState)\s*\(/);
  assert.doesNotMatch(downloadScript, /window\.location\.search\s*=/);

  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    if (!TEXT_FILE_EXTENSIONS.has(extension) && path.basename(filePath) !== "CNAME") {
      continue;
    }
    const content = fs.readFileSync(filePath, "utf8");
    assert.doesNotMatch(
      content,
      /G-XXXXXXXXXX/,
      `${filePath}: GA4 placeholder leaked into the production artifact.`
    );
    assert.doesNotMatch(
      content,
      /^(?:<{7}|\|{7}|={7}|>{7})(?: |$)/m,
      `${filePath}: unresolved conflict marker found.`
    );
  }

  return {
    files: files.length,
    htmlFiles: htmlFiles.length,
    instrumentedHtmlFiles,
    customDomain: cname,
    analyticsConfigured: true,
    storeLinksVerified: true,
    utmHandlingVerified: true,
    robotsVerified,
    sitemapUrls,
    referencesChecked: references.checked,
    mediaReferencesChecked: references.mediaChecked,
    accessiblePages: accessibility.pages
  };
}

if (require.main === module) {
  try {
    const result = verifyProductionBuild();
    console.log("ULMOX_PRODUCTION_BUILD_VERIFIED", result);
  } catch (error) {
    console.error("ULMOX_PRODUCTION_BUILD_VERIFICATION_FAILED", error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  PRODUCTION_ORIGIN,
  MUST_INDEX,
  routeToOutputPath,
  verifyRobotsAndSitemap,
  validateProductionMeasurementId,
  verifyProductionBuild
};
