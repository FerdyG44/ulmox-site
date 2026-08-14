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

  assert.equal(result.htmlFiles, 141);
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
  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, "utf8");
    if (!html.trim()) continue;
    assert.equal(html.split(ANALYTICS_MARKER).length - 1, 1, htmlPath);
    assert.equal(html.split('/assets/js/analytics.js').length - 1, 1, htmlPath);
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
