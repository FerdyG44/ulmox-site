"use strict";

/**
 * Browser-language detection in assets/js/i18n-config.js.
 *
 * The file is a browser script that assigns `window.ULMOX_I18N`, so it is run
 * here in a VM context with a stub `window`.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const { PUBLISHED_LANGUAGES } = require("../scripts/publication-policy");

function loadConfig() {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "assets", "js", "i18n-config.js"),
    "utf8"
  );
  const window = { location: { pathname: "/", search: "", hash: "" } };
  vm.runInNewContext(source, { window });
  return window.ULMOX_I18N;
}

test("i18n-config lists exactly the locales cleared for publication", () => {
  const config = loadConfig();
  assert.deepEqual(
    Array.from(config.languages, (item) => String(item.code)).sort(),
    [...PUBLISHED_LANGUAGES].sort()
  );
});

test("pending locale browser tags and saved preferences fall back to English", () => {
  const { getSupportedLanguage, getLocalizedPath } = loadConfig();
  const tags = [
    "el", "el-GR", "el-CY",
    "ms", "ms-MY", "ms-SG",
    "id", "id-ID",
    // Legacy Java/Android code for Indonesian.
    "in", "in-ID", "IN-id",
    // All Serbian script variants stay blocked pending legal review.
    "sr", "sr-RS", "sr-Cyrl-RS",
    "sr-Latn", "sr-Latn-RS", "sr-ME",
  ];
  for (const tag of tags) {
    assert.equal(getSupportedLanguage(tag), "en", tag);
    assert.equal(getLocalizedPath(tag), "/en/", tag);
  }
});

test("existing detection behaviour is unchanged", () => {
  const { getSupportedLanguage } = loadConfig();
  assert.equal(getSupportedLanguage("sv-SE"), "sv");
  assert.equal(getSupportedLanguage("zh-Hant-TW"), "zh");
  assert.equal(getSupportedLanguage("pt-BR"), "pt");
  assert.equal(getSupportedLanguage(""), "en");
  assert.equal(getSupportedLanguage(undefined), "en");
  // Unshipped languages still fall back to English; Indonesian is not Malay
  // and Croatian/Bosnian are not aliased to Serbian.
  assert.equal(getSupportedLanguage("hr-HR"), "en");
  assert.equal(getSupportedLanguage("bs"), "en");
  assert.equal(getSupportedLanguage("xx"), "en");
  assert.equal(getSupportedLanguage("ind"), "en");
});
