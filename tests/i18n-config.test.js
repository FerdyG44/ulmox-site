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

const { LOCALES } = require("../scripts/page-shell");

function loadConfig() {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "assets", "js", "i18n-config.js"),
    "utf8"
  );
  const window = { location: { pathname: "/", search: "", hash: "" } };
  vm.runInNewContext(source, { window });
  return window.ULMOX_I18N;
}

test("i18n-config lists exactly the locales the site generates", () => {
  const config = loadConfig();
  assert.deepEqual(
    Array.from(config.languages, (item) => String(item.code)).sort(),
    [...LOCALES].sort()
  );
});

test("browser tags for the new locales resolve to their pages", () => {
  const { getSupportedLanguage } = loadConfig();
  const cases = {
    "el": "el", "el-GR": "el", "el-CY": "el",
    "ms": "ms", "ms-MY": "ms", "ms-SG": "ms",
    "id": "id", "id-ID": "id",
    // Legacy Java/Android code for Indonesian.
    "in": "id", "in-ID": "id", "IN-id": "id",
    // Serbian ships in Cyrillic only; every sr-* tag lands on /sr/.
    "sr": "sr", "sr-RS": "sr", "sr-Cyrl-RS": "sr",
    "sr-Latn": "sr", "sr-Latn-RS": "sr", "sr-ME": "sr",
  };
  for (const [tag, expected] of Object.entries(cases)) {
    assert.equal(getSupportedLanguage(tag), expected, tag);
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
