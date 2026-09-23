"use strict";

/**
 * Stage 1.6W.2 — the localized policy pages against the canonical English ones.
 *
 * Before this stage there was no comparison at all: 95 hand-written pages, five
 * canonical ones, and nothing that noticed when they disagreed. Two of them
 * disagreed badly enough to be release blockers.
 *
 * This file is the comparison, in four layers:
 *
 *   1. The schema in scripts/policy-schema.js still matches the real block
 *      structure of the canonical pages — so editing a canonical page without
 *      updating the schema fails here rather than silently un-syncing 18
 *      translations.
 *   2. Every locale covers every canonical section, with no empty slot.
 *   3. The numbers agree. A retention period, an Android API cap or an age
 *      limit that drifted in one language is a factual defect that no amount
 *      of reading the prose in the other eighteen would find.
 *   4. The claims that must not be made are not made, and the claims that must
 *      be made are.
 */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

const SCHEMA = require("../scripts/policy-schema.js");
const LOCALE_CONTENT = require("../scripts/policy-locales");
const { LOCALES } = require("../scripts/page-shell.js");
const T = require("../scripts/translation-content.js");
const {
  parityMatrix,
  generate: generateLocalized,
} = require("../scripts/generate-localized-policies.js");

/** Element names that never close, so they never change nesting depth. */
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr"
]);

/** The top-level blocks of a page's `<main>`, with their inner counts. */
function topBlocks(html) {
  let body = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || "";
  body = body
    .replace(/<h1[\s\S]*?<\/h1>/, "")
    .replace(/<p class="effective">[\s\S]*?<\/p>/, "");

  const blocks = [];
  let depth = 0;
  let current = null;
  const tag = /<(\/?)([a-z0-9]+)\b([^>]*?)(\/?)>/g;
  let match;

  while ((match = tag.exec(body))) {
    const closing = match[1] === "/";
    const name = match[2];
    const selfClosing = match[4] === "/" || VOID_ELEMENTS.has(name);

    if (!closing) {
      if (depth === 0 && !selfClosing) {
        current = { tag: name, attrs: match[3], li: 0, p: 0, td: 0, th: 0, caption: 0 };
      }
      if (current) {
        if (name === "li") current.li += 1;
        else if (name === "p") current.p += 1;
        else if (name === "td") current.td += 1;
        else if (name === "th") current.th += 1;
        else if (name === "caption") current.caption += 1;
      }
      if (!selfClosing) depth += 1;
    } else {
      depth -= 1;
      if (depth === 0 && current) {
        blocks.push(current);
        current = null;
      }
    }
  }
  return blocks;
}

/** How the schema says a block should look, in the same shape topBlocks reports. */
function describeSchemaBlock(block) {
  switch (block.t) {
    case "h2":
    case "h3":
    case "p":
      return block.t;
    case "ul":
    case "ol":
      return `${block.t}:${block.n}`;
    case "callout":
      return `callout:${block.n}`;
    case "rollout":
      return "callout:1";
    case "links":
      return "p";
    case "table":
      return `table:${block.caption ? 1 : 0}:${block.cols}:${block.rows}`;
    default:
      throw new Error(`unknown block ${block.t}`);
  }
}

function describeActualBlock(block) {
  if (block.tag === "div") return `callout:${block.p}`;
  if (block.tag === "ul" || block.tag === "ol") return `${block.tag}:${block.li}`;
  if (block.tag === "table") {
    const cols = block.th;
    return `table:${block.caption}:${cols}:${block.td / (cols || 1)}`;
  }
  return block.tag;
}

/* -------------------------------------------------------------------------- */
/* 1. The schema still describes the canonical pages                          */
/* -------------------------------------------------------------------------- */

test("the schema mirrors the canonical English pages block for block", () => {
  for (const key of SCHEMA.PAGE_KEYS) {
    const definition = SCHEMA.PAGES[key];
    const actual = topBlocks(read(definition.file)).map(describeActualBlock);
    const expected = [];
    for (const section of definition.sections) {
      for (const block of section.blocks) {
        expected.push({ section: section.id, shape: describeSchemaBlock(block) });
      }
    }

    assert.equal(
      actual.length,
      expected.length,
      `${definition.file}: ${actual.length} blocks, schema declares ${expected.length}`
    );
    expected.forEach((entry, index) => {
      assert.equal(
        actual[index],
        entry.shape,
        `${definition.file} block ${index} (${entry.section}): ` +
          `page has ${actual[index]}, schema declares ${entry.shape}`
      );
    });
  }
});

test("the canonical anchors the schema records are the ones the pages carry", () => {
  assert.match(read("terms.html"), /<h2 id="ulmox-music">/);
  assert.match(read("delete_account.html"), /<h2 id="apple-linked">/);
  for (const locale of LOCALES) {
    assert.match(
      read(`${locale}/terms.html`),
      /<h2 id="ulmox-music">/,
      `${locale}/terms.html lost the ULMOX Music anchor`
    );
    assert.match(
      read(`${locale}/delete_account.html`),
      /<h2 id="apple-linked">/,
      `${locale}/delete_account.html lost the Apple-linked anchor`
    );
    assert.match(
      read(`${locale}/delete_account.html`),
      /href="#apple-linked"/,
      `${locale}/delete_account.html lost the link to its Apple-linked section`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 2. Every locale covers every section                                       */
/* -------------------------------------------------------------------------- */

test("all 19 locales cover all five pages, section for section", () => {
  const rows = parityMatrix();
  assert.equal(rows.length, LOCALES.length * SCHEMA.PAGE_KEYS.length, "95 rows expected");

  const gaps = rows
    .filter((row) => row.missing.length)
    .map((row) => `${row.locale}/${row.file}: ${row.missing.join(", ")}`);
  assert.deepEqual(gaps, [], "locales are short of the canonical sections");

  for (const row of rows) {
    assert.equal(row.covered, row.sections, `${row.locale}/${row.file}`);
  }
});

test("every translated locale declares the canonical revision it implements", () => {
  assert.equal(LOCALE_CONTENT.TRANSLATED_LOCALES.length, 18, "en is not a translation");
  assert.ok(!LOCALE_CONTENT.TRANSLATED_LOCALES.includes("en"));

  for (const locale of LOCALE_CONTENT.TRANSLATED_LOCALES) {
    assert.equal(
      LOCALE_CONTENT[locale].revision,
      SCHEMA.CANONICAL_REVISION,
      `${locale} declares a revision the schema does not record`
    );
  }
  // And the revision reaches the page, so the answer does not depend on memory.
  for (const locale of LOCALES) {
    for (const key of SCHEMA.PAGE_KEYS) {
      assert.match(
        read(`${locale}/${SCHEMA.PAGES[key].file}`),
        new RegExp(
          `<meta name="ulmox-policy-revision" content="${SCHEMA.CANONICAL_REVISION}"`
        ),
        `${locale}/${SCHEMA.PAGES[key].file} does not record its canonical revision`
      );
    }
  }
});

/**
 * The Privacy Policy was revised on its own, and only it says so.
 *
 * Every page used to share one date line, so re-dating one document would have
 * re-dated five. Only the Privacy Policy's Location section changed on
 * 2026-09-23; printing that date on the Terms, Safety, Support or Delete
 * Account page would be a false statement about a document nobody edited —
 * and dropping the 2026-09-04 effective date from any page would be the
 * opposite failure. Both are asserted here, in all 19 languages.
 */
test("only the Privacy Policy carries the 2026-09-23 revision date", () => {
  const REVISED = "2026-09-23";
  const EFFECTIVE = "2026-09-04";

  const dateLine = (relative) => {
    const match = read(relative).match(/<p class="effective">([\s\S]*?)<\/p>/i);
    assert.ok(match, `${relative} has no date line at all`);
    return match[1].replace(/<[^>]+>/g, " ");
  };

  const assertPage = (relative, key) => {
    const line = dateLine(relative);
    assert.ok(line.includes(EFFECTIVE), `${relative} lost its ${EFFECTIVE} effective date`);
    assert.equal(
      line.includes(REVISED),
      key === "privacy",
      key === "privacy"
        ? `${relative} does not show the ${REVISED} revision`
        : `${relative} claims a ${REVISED} revision it did not have`
    );
  };

  for (const key of SCHEMA.PAGE_KEYS) {
    // The canonical English pages, served from the site root.
    assertPage(SCHEMA.PAGES[key].file, key);
    for (const locale of LOCALES) {
      assertPage(`${locale}/${SCHEMA.PAGES[key].file}`, key);
    }
  }

  // And the source of those lines: every translation states the privacy date
  // in its own words, and none of them quietly re-dates the shared line the
  // other four documents still use.
  for (const locale of LOCALE_CONTENT.TRANSLATED_LOCALES) {
    const { effective, privacyEffective } = LOCALE_CONTENT[locale];
    assert.ok(privacyEffective, `${locale} has no privacyEffective line`);
    assert.ok(
      privacyEffective.includes(REVISED),
      `${locale} privacyEffective does not carry ${REVISED}`
    );
    assert.ok(
      effective.includes(EFFECTIVE) && !effective.includes(REVISED),
      `${locale} re-dated the line shared by the four unchanged documents`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 3. The numbers agree                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Every integer in the visible text of a page.
 *
 * A retention window, an Android API cap or an age limit is the part of a
 * policy that a translation is most likely to get wrong and least likely to be
 * caught getting wrong, because a reader who does not have the English page in
 * front of them cannot tell 15 from 45.
 */
function significantNumbers(html) {
  const text = ((html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<p class="effective">[\s\S]*?<\/p>/i, " ")
    .replace(/<[^>]+>/g, " ");

  // Below five, a numeral is a counting word — Japanese writes "2 つ" where
  // English writes "two", and Chinese writes "1 次" where English writes
  // "a single". At five and above every numeral on these pages is a policy
  // figure: a retention window, an age limit or an Android version.
  return new Set(
    [...text.matchAll(/\d+/g)]
      .map((match) => Number(match[0]))
      .filter((value) => value >= 5)
  );
}

/**
 * Figures the canonical page spells out in words rather than digits.
 *
 * English writes "about seven days"; Japanese and Chinese write the numeral.
 * Both are the same policy, so a spelled-out canonical figure is permitted to
 * appear as a numeral in a translation — but a figure the canonical page never
 * states, in either form, is a fabricated period and fails.
 */
const SPELLED_OUT = Object.freeze({
  five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12,
  thirteen: 13, fifteen: 15, eighteen: 18, thirty: 30, ninety: 90,
  "twenty-four": 24,
});

function spelledOutFigures(html) {
  const text = ((html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || "")
    .replace(/<[^>]+>/g, " ")
    .toLowerCase();
  const found = new Set();
  for (const [word, value] of Object.entries(SPELLED_OUT)) {
    if (new RegExp(`\\b${word}\\b`).test(text)) found.add(value);
  }
  return found;
}

test("every localized page uses the same policy figures as the canonical page", () => {
  for (const key of SCHEMA.PAGE_KEYS) {
    const file = SCHEMA.PAGES[key].file;
    const canonicalDigits = significantNumbers(read(file));
    const canonicalStated = new Set([
      ...canonicalDigits,
      ...spelledOutFigures(read(file)),
    ]);
    assert.ok(canonicalDigits.size >= 1, `${file}: no policy figures found to compare`);

    for (const locale of LOCALES) {
      const localized = significantNumbers(read(`${locale}/${file}`));

      // A figure the canonical page writes as a numeral must survive as one.
      const missing = [...canonicalDigits].filter((value) => !localized.has(value));
      // A figure the canonical page never states, in digits or in words, is
      // invented — a retention window or version cap that exists in one
      // language only.
      const invented = [...localized].filter((value) => !canonicalStated.has(value));

      assert.deepEqual(
        missing,
        [],
        `${locale}/${file}: policy figures the canonical page states are absent`
      );
      assert.deepEqual(
        invented,
        [],
        `${locale}/${file}: policy figures the canonical page does not state`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 4. The claims that must not be made, and the ones that must                */
/* -------------------------------------------------------------------------- */

test("no localized page denies that the original message is stored", () => {
  // The messaging service stores the original message and may retain it as
  // report evidence; only a locally generated translation is excluded from
  // server persistence and from moderation evidence. Every locale's Privacy
  // page has to carry the row that says so.
  for (const locale of LOCALES) {
    const privacy = read(`${locale}/privacy.html`);
    assert.match(
      privacy,
      /Firebase Cloud Storage/,
      `${locale}/privacy.html: the upload disclosure is gone`
    );
    assert.match(
      privacy,
      /Google ML Kit/,
      `${locale}/privacy.html: the on-device translation disclosure is gone`
    );
    // The translation table has five rows, the last of which is the server one.
    const rows = (privacy.match(/<tr>/g) || []).length;
    assert.ok(rows >= 19, `${locale}/privacy.html: only ${rows} table rows`);
  }
});

test("the gradual-availability sentence is on every localized page that needs it", () => {
  const needsIt = ["privacy.html", "terms.html", "safety.html", "support.html",
    "delete_account.html"];
  for (const locale of LOCALES) {
    const sentence = T.LOCALES[locale].webGradualRollout;
    for (const file of needsIt) {
      assert.ok(
        read(`${locale}/${file}`).includes(sentence),
        `${locale}/${file}: the gradual-availability sentence is missing`
      );
    }
  }
});

test("Google's protected text is reproduced unchanged in every locale", () => {
  for (const locale of LOCALES) {
    assert.ok(
      read(`${locale}/privacy.html`).includes(T.TRANSLATE_ACTION),
      `${locale}/privacy.html: the Google word mark was translated`
    );
    assert.ok(
      read(`${locale}/translation.html`).includes(T.DISCLAIMER),
      `${locale}/translation.html: Google's disclaimer changed`
    );
  }
});

test("no localized page promises availability, resolution or perfect safety", () => {
  // The canonical pages state a 24-hour target for *beginning* child-safety
  // review and nothing else. A locale that turned that into a response promise,
  // or that promised uninterrupted service, would read as a guarantee.
  // Written so a *denial* can never trip them. The canonical Safety page says
  // "It is not a guarantee that every case is finally resolved within 24
  // hours"; a pattern that matched the word "guarantee" would flag the very
  // sentence that keeps the page honest.
  const overclaims = [
    /100\s*%/,
    /\bwe respond within\b/i,
    /\bguaranteed\b/i,
    /\balways available\b/i,
    /\bnever fails\b/i,
  ];
  for (const locale of LOCALES) {
    for (const key of SCHEMA.PAGE_KEYS) {
      const route = `${locale}/${SCHEMA.PAGES[key].file}`;
      // Prose only: the shared stylesheet legitimately contains "100%".
      const prose = ((read(route).match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || "")
        .replace(/<[^>]+>/g, " ");
      for (const pattern of overclaims) {
        assert.doesNotMatch(prose, pattern, `${route}: unsupported guarantee`);
      }
    }
  }
  // The old Chinese Support page promised "we usually reply within 24 hours".
  assert.ok(!read("zh/support.html").includes("我们通常会在 24 小时内回复"));

  // And the qualification that keeps the 24-hour figure honest reaches every
  // locale: it is a target for *starting* human review, on both pages that
  // state it.
  for (const locale of LOCALES) {
    for (const file of ["safety.html", "support.html"]) {
      assert.match(
        read(`${locale}/${file}`),
        /24/,
        `${locale}/${file}: the child-safety review target is gone`
      );
    }
  }
});

test("every locale's Connections wording allows requalifying after a full unblock", () => {
  // Blocking ends the current Connection. After a full unblock, two fresh
  // encounters and fresh mutual approval can requalify the pair. Voluntary End
  // stays terminal. Each locale states the requalification path in the three
  // places the canonical pages state it.
  const routes = [
    ["terms.html", "connections"],
    ["safety.html", "connections-safety"],
    ["privacy.html", "deactivation"],
    ["delete_account.html", "break"],
  ];
  // The rule is worded differently in each language, so the test cannot look
  // for a phrase. What it can prove is that each locale states the *same*
  // rule in all four places: the longest run of text the Privacy passage and
  // the Account Deletion passage share has to be a whole clause, not a
  // coincidence. Below the thresholds here, one of the four pages has drifted.
  const longestShared = (a, b) => {
    let best = 0;
    let previous = new Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i += 1) {
      const current = new Array(b.length + 1).fill(0);
      for (let j = 1; j <= b.length; j += 1) {
        if (a[i - 1] === b[j - 1]) {
          current[j] = previous[j - 1] + 1;
          if (current[j] > best) best = current[j];
        }
      }
      previous = current;
    }
    return best;
  };

  for (const locale of LOCALE_CONTENT.TRANSLATED_LOCALES) {
    for (const [file, section] of routes) {
      const key = SCHEMA.PAGE_KEYS.find((k) => SCHEMA.PAGES[k].file === file);
      const strings = LOCALE_CONTENT[locale][key].sections[section];
      assert.ok(
        strings.join(" ").length > 200,
        `${locale}/${file}#${section}: too short to carry the requalification rule`
      );
    }

    // Privacy §3 and the Account Deletion "break" section state it in full.
    const privacy = LOCALE_CONTENT[locale].privacy.sections.deactivation[2];
    const deletion = LOCALE_CONTENT[locale].deleteAccount.sections.break[2];
    assert.ok(
      longestShared(privacy, deletion) >= 150,
      `${locale}: Privacy and Account Deletion state the block rule differently`
    );

    // Terms §3 and the Safety page's Block control state it in a bullet.
    const terms = LOCALE_CONTENT[locale].terms.sections.connections[9];
    const safety = LOCALE_CONTENT[locale].safety.sections["connections-safety"][5];
    assert.ok(
      longestShared(terms, safety) >= 35,
      `${locale}: Terms and Safety state the block rule differently`
    );
  }
  // And the canonical pages themselves still say it.
  for (const file of ["terms.html", "safety.html", "privacy.html", "delete_account.html"]) {
    assert.match(
      read(file),
      /qualify again from the/,
      `${file}: the requalification path is gone`
    );
  }
  assert.doesNotMatch(read("privacy.html"), /blocking someone are\s*\n?\s*both final/);
  assert.doesNotMatch(read("terms.html"), /and so is a block/);
});

test("no page in any locale claims automated video, audio or transcript analysis", () => {
  const { scan } = require("../scripts/scan-stale-claims.js");
  const automated = scan().findings.filter((finding) =>
    finding.rule.startsWith("automated-detection")
  );
  assert.deepEqual(automated, [], "an automated-detection claim is published");
});

/* -------------------------------------------------------------------------- */
/* 5. Generation is the only way these pages exist                            */
/* -------------------------------------------------------------------------- */

test("regenerating the localized policy pages changes nothing", () => {
  const routes = [];
  for (const locale of LOCALES) {
    for (const key of SCHEMA.PAGE_KEYS) {
      routes.push(`${locale}/${SCHEMA.PAGES[key].file}`);
    }
  }
  const canonicalFiles = SCHEMA.PAGE_KEYS.map((key) => SCHEMA.PAGES[key].file);

  const before = new Map(
    [...routes, ...canonicalFiles].map((file) => [file, read(file)])
  );

  const target = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-policy-"));
  try {
    for (const [file, html] of before) {
      const destination = path.join(target, file);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, html, "utf8");
    }
    generateLocalized(target);
    generateLocalized(target); // twice: the second run must be a no-op too.

    const changed = routes.filter(
      (file) => fs.readFileSync(path.join(target, file), "utf8") !== before.get(file)
    );
    assert.deepEqual(changed, [], `out of date with the generator: ${changed.join(", ")}`);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("a locale that loses a section cannot be rendered at all", () => {
  const { renderBody } = require("../scripts/generate-localized-policies.js");
  const original = LOCALE_CONTENT.tr.privacy.sections.security;
  try {
    LOCALE_CONTENT.tr.privacy.sections.security = [original[0]];
    assert.throws(
      () => renderBody("tr", "privacy"),
      /security.*1 strings.*2/s,
      "a short section rendered anyway"
    );
  } finally {
    LOCALE_CONTENT.tr.privacy.sections.security = original;
  }
});
