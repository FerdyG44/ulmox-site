"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const { buildSite } = require("../scripts/build-site");
const {
  validateProductionMeasurementId,
  verifyProductionBuild
} = require("../scripts/verify-production-build");

const sourceRoot = path.resolve(__dirname, "..");
const musicTermsClause =
  "ULMOX may provide music for use in Moments. Subject to these Terms, you may synchronize that music with videos you create in ULMOX and share those completed videos through ULMOX. You may not extract, redistribute, sell, or make the music available as standalone audio.";

test("production artifact passes deployment safety checks", (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-prod-verify-"));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const outputRoot = path.join(temporaryRoot, "dist");
  const measurementId = "G-TEST123456";

  buildSite({
    sourceRoot,
    output: outputRoot,
    measurementId,
    environment: "production"
  });

  const result = verifyProductionBuild({ outputRoot, measurementId });
  assert.equal(result.instrumentedHtmlFiles, 121);
  assert.equal(result.customDomain, "ulmoxapp.com");
  assert.equal(result.analyticsConfigured, true);
  assert.equal(result.storeLinksVerified, true);
  assert.equal(result.utmHandlingVerified, true);
});

test("production verifier rejects missing and placeholder Measurement IDs", () => {
  assert.throws(
    () => validateProductionMeasurementId(""),
    /required for a production deployment/
  );
  assert.throws(
    () => validateProductionMeasurementId("G-XXXXXXXXXX"),
    /not a placeholder/
  );
});

test("production verifier rejects a missing CNAME", (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-prod-cname-"));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const outputRoot = path.join(temporaryRoot, "dist");
  const measurementId = "G-TEST123456";

  buildSite({
    sourceRoot,
    output: outputRoot,
    measurementId,
    environment: "production"
  });
  fs.rmSync(path.join(outputRoot, "CNAME"));

  assert.throws(
    () => verifyProductionBuild({ outputRoot, measurementId }),
    /Missing production file/
  );
});

test("production Terms include the ULMOX Music permission", () => {
  for (const relativePath of ["terms.html", "en/terms.html"]) {
    const terms = fs.readFileSync(path.join(sourceRoot, relativePath), "utf8");
    assert.ok(terms.includes('<h2 id="ulmox-music">ULMOX Music</h2>'));
    assert.equal(terms.split(musicTermsClause).length - 1, 1);
  }

  for (const locale of [
    "sv", "tr", "de", "es", "fr", "it", "pt", "nl", "pl", "fi",
    "ru", "ja", "ko", "zh", "ar", "hi", "th", "vi"
  ]) {
    const terms = fs.readFileSync(
      path.join(sourceRoot, locale, "terms.html"),
      "utf8"
    );
    assert.ok(
      terms.includes('<h2 id="ulmox-music">ULMOX Music</h2>'),
      locale
    );
  }
});
