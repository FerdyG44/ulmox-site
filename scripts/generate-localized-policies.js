"use strict";

/**
 * Stage 1.6W.2 — generates the 95 localized policy pages.
 *
 * WHAT CHANGED
 *
 * These five pages × 19 locales were hand-written HTML. Nothing generated them,
 * nothing compared them to the canonical English policies, and two defects had
 * been sitting in them since before the canonical pages existed:
 *
 *   1. Seven safety pages carried an "AI-Assisted Detection" section stating
 *      that ULMOX "may use automated systems to detect potentially unsafe or
 *      inappropriate content". ULMOX does not analyse video frames, audio or
 *      transcripts, so the section described a capability that does not exist.
 *   2. Thirty-six Privacy, Terms and Child Safety pages repeated two or three
 *      sentences under headings that repeated the page title.
 *
 * Both are gone, and neither can come back quietly: the prose now comes from
 * `scripts/policy-locales/<code>.js`, the structure from
 * `scripts/policy-schema.js`, and a locale that is missing a section — or one
 * bullet inside one — cannot be rendered at all.
 *
 * THE ENGLISH ROUTES ARE NOT A SECOND COPY
 *
 * `/en/privacy.html` is the canonical `/privacy.html`, re-shelled for its
 * route. There is no English entry in `scripts/policy-locales/`, because a
 * second hand-maintained English policy is exactly the thing that produced the
 * defects above. The 18 translation files are checked against the canonical
 * structure, not against a copy of it.
 *
 * WHAT THIS IS NOT
 *
 * It is not a claim of certified translation. The translations here were
 * authored in this repository against the canonical revision recorded in
 * `scripts/policy-schema.js` and reviewed by the same process that wrote them.
 * No independent legal or professional translator has approved them, and
 * PUBLICATION_CHECKLIST.md says so.
 *
 * Run with: node scripts/generate-localized-policies.js
 *          node scripts/generate-localized-policies.js --matrix
 */

const fs = require("fs");
const path = require("path");

const { CONTACT_EMAIL, page } = require("./legal-pages");
const { CHROME, LOCALES, applyShell, siteFooter } = require("./page-shell");
const T = require("./translation-content");
const SCHEMA = require("./policy-schema");
const LOCALE_CONTENT = require("./policy-locales");

const ROOT = path.resolve(__dirname, "..");

/** The route file each nav key points at, for `{{link:...}}`. */
const LINK_FILES = Object.freeze({
  home: "index.html",
  privacy: "privacy.html",
  terms: "terms.html",
  safety: "safety.html",
  support: "support.html",
  deleteAccount: "delete_account.html",
  translation: "translation.html",
});

/**
 * Text that is identical in every locale because it is not ours to translate.
 *
 * The two Google word marks are reproduced unchanged under Google's naming
 * rules, and the account-deletion subject line is a routing token: a mailbox
 * rule matches it literally, so translating it would send the mail nowhere.
 */
const FIXED = Object.freeze({
  googleTranslate: T.GOOGLE_TRANSLATE_WORDMARK,
  translateAction: T.TRANSLATE_ACTION,
  deletionSubject: "ULMOX Account Deletion Request",
});

function escapeAttribute(value) {
  return String(value).replace(/&(?!#?\w+;)/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Expands the tokens a translated string may contain.
 *
 * Translators write prose and inline emphasis. Everything that must stay
 * consistent across 19 locales — an address, a route, a word mark, the
 * gradual-availability sentence — is a token, so it cannot be mistyped in one
 * language and correct in the other eighteen.
 */
function expand(text, locale) {
  const chrome = CHROME[locale];
  if (typeof text !== "string") {
    throw new Error(`${locale}: expected a string, got ${typeof text}`);
  }

  return text
    .replace(/\{\{email\}\}/g, `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`)
    .replace(/\{\{emailPlain\}\}/g, CONTACT_EMAIL)
    .replace(
      /\{\{deletionMail:([^}]*)\}\}/g,
      (whole, label) =>
        `<a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(FIXED.deletionSubject).replace(/%20/g, "%20")}">${label}</a>`
    )
    .replace(/\{\{rollout\}\}/g, T.LOCALES[locale].webGradualRollout)
    .replace(/\{\{googleTranslate\}\}/g, FIXED.googleTranslate)
    .replace(/\{\{translateAction\}\}/g, FIXED.translateAction)
    .replace(/\{\{deletionSubject\}\}/g, FIXED.deletionSubject)
    .replace(/\{\{link:([a-zA-Z]+)\}\}/g, (whole, key) => {
      const file = LINK_FILES[key];
      if (!file) throw new Error(`${locale}: unknown link target "${key}"`);
      return `<a href="${file}">${chrome[key]}</a>`;
    })
    .replace(
      /\{\{a:([^|}]+)\|([^}]*)\}\}/g,
      (whole, href, label) => `<a href="${href}">${label}</a>`
    );
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

function renderBlock(block, take, locale, section) {
  const indent = "    ";

  switch (block.t) {
    case "h2": {
      const id = section.anchor ? ` id="${section.anchor}"` : "";
      return `${indent}<h2${id}>${take()}</h2>`;
    }
    case "h3":
      return `${indent}<h3>${take()}</h3>`;
    case "p":
      return `${indent}<p>${take()}</p>`;
    case "ul":
    case "ol": {
      const items = Array.from({ length: block.n }, () => `${indent}  <li>${take()}</li>`);
      return `${indent}<${block.t}>\n${items.join("\n")}\n${indent}</${block.t}>`;
    }
    case "callout": {
      const paragraphs = Array.from(
        { length: block.n },
        () => `${indent}  <p>${take()}</p>`
      );
      return `${indent}<div class="callout">\n${paragraphs.join("\n")}\n${indent}</div>`;
    }
    case "rollout":
      return (
        `${indent}<div class="callout">\n` +
        `${indent}  <p><strong>${T.LOCALES[locale].webGradualRollout}</strong></p>\n` +
        `${indent}</div>`
      );
    case "table": {
      const lines = [`${indent}<table>`];
      if (block.caption) {
        lines.push(`${indent}  <caption class="effective">${take()}</caption>`);
      }
      const heads = Array.from(
        { length: block.cols },
        () => `<th scope="col">${take()}</th>`
      );
      lines.push(`${indent}  <tr>${heads.join("")}</tr>`);
      for (let row = 0; row < block.rows; row += 1) {
        const cells = Array.from({ length: block.cols }, () => `<td>${take()}</td>`);
        lines.push(`${indent}  <tr>${cells.join("")}</tr>`);
      }
      lines.push(`${indent}</table>`);
      return lines.join("\n");
    }
    case "links": {
      const chrome = CHROME[locale];
      const anchors = block.targets.map(
        (key) => `<a href="${LINK_FILES[key]}">${chrome[key]}</a>`
      );
      return `${indent}<p>\n${indent}  ${anchors.join("\n" + indent + "  &middot;\n" + indent + "  ")}\n${indent}</p>`;
    }
    default:
      throw new Error(`policy renderer: unknown block "${block.t}"`);
  }
}

/** The `<main>` body of one localized policy page. */
function renderBody(locale, pageKey) {
  const definition = SCHEMA.PAGES[pageKey];
  const content = LOCALE_CONTENT[locale] && LOCALE_CONTENT[locale][pageKey];
  if (!content) {
    throw new Error(`${locale}: no "${pageKey}" content`);
  }

  const parts = [`    <p class="effective">${expand(LOCALE_CONTENT[locale].effective, locale)}</p>`];

  for (const section of definition.sections) {
    const strings = content.sections[section.id];
    const expected = SCHEMA.slotsOfSection(section);
    if (!Array.isArray(strings)) {
      throw new Error(`${locale}/${pageKey}: section "${section.id}" is missing`);
    }
    if (strings.length !== expected) {
      throw new Error(
        `${locale}/${pageKey}#${section.id}: ${strings.length} strings, ` +
          `the canonical section has ${expected}`
      );
    }

    let cursor = 0;
    const take = () => {
      const value = strings[cursor];
      cursor += 1;
      if (value === undefined || String(value).trim() === "") {
        throw new Error(
          `${locale}/${pageKey}#${section.id}: slot ${cursor - 1} is empty`
        );
      }
      return expand(String(value), locale);
    };

    for (const block of section.blocks) {
      parts.push(renderBlock(block, take, locale, section));
    }
  }

  const unknown = Object.keys(content.sections).filter(
    (id) => !definition.sections.some((section) => section.id === id)
  );
  if (unknown.length) {
    throw new Error(
      `${locale}/${pageKey}: sections that are not in the canonical page: ${unknown.join(", ")}`
    );
  }

  return `${parts.join("\n\n")}`;
}

/**
 * One localized policy page, shelled for its route.
 *
 * English is not rendered from a translation file. `/en/privacy.html` is the
 * canonical `/privacy.html` — the same bytes of policy — given the localized
 * navigation every other route has.
 */
function localizedPolicyPage(locale, pageKey, { canonicalHtml } = {}) {
  const definition = SCHEMA.PAGES[pageKey];
  const route = `${locale}/${definition.file}`;

  if (locale === "en") {
    if (!canonicalHtml) {
      throw new Error("the English routes need the canonical page they mirror");
    }
    return applyShell(withRevisionMeta(canonicalHtml), { route });
  }

  const content = LOCALE_CONTENT[locale][pageKey];
  const html = page({
    file: definition.file,
    lang: locale,
    title: content.title,
    description: escapeAttribute(content.description),
    heading: content.heading,
    skipLabel: CHROME[locale].skip,
    effective: false,
    body: renderBody(locale, pageKey),
    footerHtml: siteFooter(route),
  });

  // scripts/legal-pages.js emits its own `.skip-link`; scripts/page-shell.js
  // emits the canonical `.ulmox-skip-link`. Two anchors pointing at #main is
  // two tab stops that say the same thing, so the page-template one is dropped
  // and the shell's — the one every other route on the site uses — is kept.
  const single = html.replace(/[ \t]*<a class="skip-link"[\s\S]*?<\/a>\n/, "");

  return applyShell(withRevisionMeta(single), { route });
}

/**
 * Records which revision of the canonical policies a page implements.
 *
 * A reader cannot see it and it changes nothing on the page. It exists so that
 * "which English text is this a translation of" has an answer that does not
 * depend on anyone remembering.
 */
function withRevisionMeta(html) {
  const meta = `  <meta name="ulmox-policy-revision" content="${SCHEMA.CANONICAL_REVISION}" />`;
  if (html.includes('name="ulmox-policy-revision"')) return html;
  return html.replace(/<\/head>/i, `${meta}\n</head>`);
}

/* -------------------------------------------------------------------------- */
/* Parity inventory                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Section-level coverage for all 19 locales of all five pages.
 *
 * A locale "covers" a section when it supplies a non-empty string for every
 * slot the canonical section has, and none of them repeats another slot in the
 * same page. English covers everything by construction: it is the canonical
 * page.
 */
function parityMatrix() {
  const rows = [];

  for (const locale of LOCALES) {
    for (const pageKey of SCHEMA.PAGE_KEYS) {
      const definition = SCHEMA.PAGES[pageKey];
      const covered = [];
      const missing = [];

      if (locale === "en") {
        covered.push(...definition.sections.map((section) => section.id));
      } else {
        const content = LOCALE_CONTENT[locale] && LOCALE_CONTENT[locale][pageKey];
        for (const section of definition.sections) {
          const strings = content && content.sections[section.id];
          const expected = SCHEMA.slotsOfSection(section);
          const complete =
            Array.isArray(strings) &&
            strings.length === expected &&
            strings.every((value) => typeof value === "string" && value.trim());
          (complete ? covered : missing).push(section.id);
        }
      }

      rows.push({
        locale,
        page: pageKey,
        file: definition.file,
        sections: definition.sections.length,
        covered: covered.length,
        missing,
      });
    }
  }

  return rows;
}

function printMatrix() {
  const rows = parityMatrix();
  const pages = SCHEMA.PAGE_KEYS;
  const header = ["locale", ...pages.map((key) => SCHEMA.PAGES[key].file.replace(".html", ""))];
  console.log(header.join("\t"));

  for (const locale of LOCALES) {
    const cells = pages.map((pageKey) => {
      const row = rows.find((entry) => entry.locale === locale && entry.page === pageKey);
      return `${row.covered}/${row.sections}`;
    });
    console.log([locale, ...cells].join("\t"));
  }

  const gaps = rows.filter((row) => row.missing.length);
  console.log(`\nsections short of the canonical page: ${gaps.length}`);
  for (const gap of gaps) {
    console.log(`  ${gap.locale}/${gap.file}: ${gap.missing.join(", ")}`);
  }
  return gaps.length;
}

/* -------------------------------------------------------------------------- */

function generate(targetRoot = ROOT) {
  const written = [];
  const canonical = {};
  for (const pageKey of SCHEMA.PAGE_KEYS) {
    canonical[pageKey] = fs.readFileSync(
      path.join(targetRoot, SCHEMA.PAGES[pageKey].file),
      "utf8"
    );
  }

  for (const locale of LOCALES) {
    for (const pageKey of SCHEMA.PAGE_KEYS) {
      const route = `${locale}/${SCHEMA.PAGES[pageKey].file}`;
      const html = localizedPolicyPage(locale, pageKey, {
        canonicalHtml: canonical[pageKey],
      });
      const file = path.join(targetRoot, route);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, html, "utf8");
      written.push(route);
    }
  }

  return written;
}

if (require.main === module) {
  if (process.argv.includes("--matrix")) {
    process.exitCode = printMatrix() === 0 ? 0 : 1;
  } else {
    const written = generate();
    console.log(`Generated ${written.length} localized policy pages.`);
  }
}

module.exports = {
  LINK_FILES,
  FIXED,
  expand,
  renderBody,
  localizedPolicyPage,
  parityMatrix,
  printMatrix,
  generate,
};
