"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {
  ANALYTICS_MARKER,
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
    utmHandlingVerified: true
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
  validateProductionMeasurementId,
  verifyProductionBuild
};
