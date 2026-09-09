"use strict";

/**
 * Stage 1.6W.2 — the translated policy sources, one file per locale.
 *
 * English is deliberately absent. `/en/privacy.html` is the canonical
 * `/privacy.html` re-shelled for its route, so there is no second English
 * policy text to drift from the first. See
 * scripts/generate-localized-policies.js.
 *
 * Every file here declares the canonical revision it was translated from.
 * `tests/policy-parity.test.js` fails if a locale claims a revision the
 * schema no longer records.
 */

const TRANSLATED_LOCALES = Object.freeze([
  "sv", "tr", "de", "es", "fr", "it", "pt", "nl", "pl",
  "fi", "ru", "ja", "ko", "zh", "ar", "hi", "th", "vi",
]);

const content = {};
for (const locale of TRANSLATED_LOCALES) {
  // eslint-disable-next-line global-require
  content[locale] = require(`./${locale}.js`);
}

module.exports = Object.freeze(
  Object.assign(content, { TRANSLATED_LOCALES })
);
