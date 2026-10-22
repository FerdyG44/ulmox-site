"use strict";

// Source translations can outnumber the locales cleared for public release.
// Keep this allowlist explicit so a new translation cannot ship by default.
const PUBLISHED_LANGUAGES = Object.freeze([
  "en", "sv", "tr", "de", "es", "fr", "it", "pt", "nl", "pl",
  "fi", "ru", "ja", "ko", "zh", "ar", "hi", "th", "vi"
]);

const UNPUBLISHED_LANGUAGES = Object.freeze(["el", "sr", "ms", "id"]);

module.exports = { PUBLISHED_LANGUAGES, UNPUBLISHED_LANGUAGES };
