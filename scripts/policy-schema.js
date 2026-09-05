"use strict";

/**
 * Stage 1.6W.2 — the shape of the five ULMOX policy pages.
 *
 * WHY THIS FILE EXISTS
 *
 * Until this stage the 95 localized Privacy, Terms, Child Safety, Support and
 * Account Deletion pages were hand-written HTML with no relationship to the
 * canonical English pages at all. Seven of them described automated content
 * detection that does not exist. Thirty-six of them repeated two sentences
 * under headings that repeated the page title. Nothing compared them to
 * anything, so nothing noticed.
 *
 * This module is the comparison. It records, once, the section order and the
 * block shape of each canonical page — how many list items, how many table
 * rows, which paragraph is a callout. `scripts/policy-locales/<code>.js` then
 * supplies one translated string per slot, and
 * `scripts/generate-localized-policies.js` renders the HTML. A locale that is
 * missing a section, or a bullet inside one, cannot be rendered at all: the
 * generator throws, and `npm test` fails.
 *
 * The section IDs are stable. They are the unit the parity inventory is
 * reported in (`node scripts/generate-localized-policies.js --matrix`) and the
 * unit `tests/policy-parity.test.js` compares locales in.
 *
 * WHAT THIS FILE IS NOT
 *
 * It holds no policy text. The approved canonical policy text lives where it
 * always has, in `scripts/generate-legal-pages.js`, and the English routes —
 * `/privacy.html` and `/en/privacy.html` alike — are rendered from that one
 * source, never from a second English copy kept here. This file records only
 * the skeleton those pages have, so that a translation can be checked against
 * it.
 *
 * KEEPING IT HONEST
 *
 * `tests/policy-parity.test.js` parses the canonical English pages and asserts
 * that their real block structure equals the structure declared below. Editing
 * a canonical page without updating this file fails the suite; updating this
 * file without giving all 18 locales the new slot fails it too. That is the
 * whole point: divergence becomes a test failure instead of a discovery.
 */

/** The canonical content revision every locale in this repository implements. */
const CANONICAL_REVISION = "2026-09-04";

/** Blocks that carry no translatable slot of their own. */
const ZERO_SLOT_BLOCKS = Object.freeze(new Set(["rollout", "links"]));

/**
 * How many translated strings a block consumes, in document order.
 *
 * `rollout` renders the locale's own gradual-availability sentence from
 * scripts/translation-content.js, so it takes none. `links` renders the
 * related-pages row from the locale's own navigation labels in
 * scripts/page-shell.js, so it takes none either — a related-pages link is the
 * same words as the footer link to the same page, and writing them twice is
 * how they come to disagree.
 */
function slotsOf(block) {
  switch (block.t) {
    case "h2":
    case "h3":
    case "p":
      return 1;
    case "ul":
    case "ol":
    case "callout":
      return block.n;
    case "table":
      return (block.caption ? 1 : 0) + block.cols + block.cols * block.rows;
    case "rollout":
    case "links":
      return 0;
    default:
      throw new Error(`policy-schema: unknown block type "${block.t}"`);
  }
}

function slotsOfSection(section) {
  return section.blocks.reduce((total, block) => total + slotsOf(block), 0);
}

function slotsOfPage(page) {
  return PAGES[page].sections.reduce(
    (total, section) => total + slotsOfSection(section),
    0
  );
}

/* -------------------------------------------------------------------------- */

const PAGES = Object.freeze({
  privacy: {
    file: "privacy.html",
    navKey: "privacy",
    sections: [
      { id: "intro", blocks: [{ t: "p" }, { t: "p" }] },
      { id: "eligibility", blocks: [{ t: "h2" }, { t: "p" }] },
      { id: "collection", blocks: [{ t: "h2" }] },
      { id: "collect-account", blocks: [{ t: "h3" }, { t: "ul", n: 3 }] },
      { id: "collect-content", blocks: [{ t: "h3" }, { t: "ul", n: 4 }] },
      {
        id: "collect-media",
        blocks: [
          { t: "h3" },
          { t: "ul", n: 3 },
          { t: "callout", n: 1 },
          { t: "p" },
          { t: "ul", n: 2 },
          { t: "p" },
          { t: "p" },
        ],
      },
      {
        id: "collect-location",
        blocks: [{ t: "h3" }, { t: "p" }, { t: "p" }, { t: "p" }],
      },
      {
        id: "collect-translation",
        blocks: [
          { t: "h3" },
          { t: "p" },
          { t: "table", caption: true, cols: 2, rows: 5 },
          { t: "callout", n: 1 },
          { t: "p" },
        ],
      },
      { id: "collect-device", blocks: [{ t: "h3" }, { t: "ul", n: 3 }] },
      { id: "collect-usage", blocks: [{ t: "h3" }, { t: "ul", n: 4 }] },
      {
        id: "collect-age",
        blocks: [{ t: "h3" }, { t: "p" }, { t: "callout", n: 1 }, { t: "p" }],
      },
      {
        id: "collect-reporting",
        blocks: [{ t: "h3" }, { t: "ul", n: 3 }, { t: "p" }, { t: "p" }],
      },
      { id: "lifecycle", blocks: [{ t: "h2" }] },
      { id: "deactivation", blocks: [{ t: "h3" }, { t: "p" }, { t: "p" }] },
      {
        id: "deletion",
        blocks: [{ t: "h3" }, { t: "p" }, { t: "p" }, { t: "p" }, { t: "p" }],
      },
      {
        id: "retention",
        blocks: [{ t: "h2" }, { t: "table", caption: true, cols: 2, rows: 12 }],
      },
      {
        id: "processors",
        blocks: [{ t: "h2" }, { t: "p" }, { t: "ul", n: 7 }, { t: "p" }],
      },
      { id: "international", blocks: [{ t: "h2" }, { t: "p" }] },
      { id: "rights", blocks: [{ t: "h2" }, { t: "p" }, { t: "p" }] },
      { id: "security", blocks: [{ t: "h2" }, { t: "p" }] },
      { id: "changes", blocks: [{ t: "h2" }, { t: "p" }] },
      {
        id: "related",
        blocks: [
          { t: "h2" },
          { t: "links", targets: ["deleteAccount", "terms", "safety", "support"] },
        ],
      },
    ],
  },

  terms: {
    file: "terms.html",
    navKey: "terms",
    sections: [
      { id: "intro", blocks: [{ t: "p" }] },
      { id: "eligibility", blocks: [{ t: "h2" }, { t: "ul", n: 4 }] },
      { id: "your-content", blocks: [{ t: "h2" }, { t: "p" }] },
      { id: "ownership", blocks: [{ t: "h3" }, { t: "p" }, { t: "p" }] },
      {
        id: "connections",
        blocks: [{ t: "h2" }, { t: "rollout" }, { t: "p" }, { t: "ul", n: 10 }],
      },
      { id: "prohibited", blocks: [{ t: "h2" }, { t: "p" }, { t: "ul", n: 9 }] },
      {
        id: "moderation",
        blocks: [
          { t: "h2" },
          { t: "ul", n: 9 },
          { t: "callout", n: 1 },
          { t: "p" },
        ],
      },
      { id: "lifecycle", blocks: [{ t: "h2" }, { t: "ul", n: 2 }] },
      { id: "enforcement", blocks: [{ t: "h2" }, { t: "p" }] },
      {
        id: "machine-translation",
        blocks: [{ t: "h2" }, { t: "ul", n: 5 }, { t: "p" }],
      },
      { id: "music", anchor: "ulmox-music", blocks: [{ t: "h2" }, { t: "p" }] },
      { id: "changes", blocks: [{ t: "h2" }, { t: "p" }] },
      {
        id: "related",
        blocks: [
          { t: "h2" },
          { t: "links", targets: ["privacy", "safety", "support", "deleteAccount"] },
        ],
      },
    ],
  },

  safety: {
    file: "safety.html",
    navKey: "safety",
    sections: [
      { id: "intro", blocks: [{ t: "p" }, { t: "callout", n: 1 }] },
      { id: "zero-tolerance", blocks: [{ t: "h2" }, { t: "p" }] },
      { id: "prohibited", blocks: [{ t: "h2" }, { t: "p" }, { t: "ul", n: 5 }] },
      {
        id: "how-to-report",
        blocks: [{ t: "h2" }, { t: "p" }, { t: "p" }, { t: "p" }],
      },
      {
        id: "what-happens",
        blocks: [
          { t: "h2" },
          { t: "ul", n: 7 },
          { t: "callout", n: 1 },
          { t: "p" },
        ],
      },
      {
        id: "connections-safety",
        blocks: [{ t: "h2" }, { t: "rollout" }, { t: "p" }, { t: "ul", n: 8 }],
      },
      {
        id: "translated-messages",
        blocks: [{ t: "h2" }, { t: "ul", n: 4 }, { t: "p" }],
      },
      { id: "not-done", blocks: [{ t: "h2" }, { t: "ul", n: 4 }] },
      { id: "appeals", blocks: [{ t: "h2" }, { t: "p" }] },
      {
        id: "related",
        blocks: [
          { t: "h2" },
          { t: "links", targets: ["terms", "privacy", "support", "deleteAccount"] },
        ],
      },
    ],
  },

  support: {
    file: "support.html",
    navKey: "support",
    sections: [
      {
        id: "intro",
        blocks: [{ t: "p" }, { t: "table", caption: false, cols: 3, rows: 6 }],
      },
      {
        id: "response-times",
        blocks: [{ t: "h2" }, { t: "ul", n: 2 }, { t: "callout", n: 1 }],
      },
      {
        id: "connections-translation",
        blocks: [
          { t: "h2" },
          { t: "rollout" },
          { t: "p" },
          { t: "p" },
          { t: "table", caption: false, cols: 2, rows: 7 },
          { t: "callout", n: 1 },
        ],
      },
      {
        id: "appeals",
        blocks: [{ t: "h2" }, { t: "p" }, { t: "ul", n: 4 }, { t: "p" }],
      },
      {
        id: "related",
        blocks: [
          { t: "h2" },
          { t: "links", targets: ["privacy", "terms", "safety", "deleteAccount"] },
        ],
      },
    ],
  },

  deleteAccount: {
    file: "delete_account.html",
    navKey: "deleteAccount",
    sections: [
      { id: "intro", blocks: [{ t: "p" }, { t: "callout", n: 1 }] },
      { id: "option-app", blocks: [{ t: "h2" }, { t: "p" }, { t: "ol", n: 3 }] },
      {
        id: "option-email",
        blocks: [
          { t: "h2" },
          { t: "p" },
          { t: "p" },
          { t: "p" },
          { t: "ul", n: 2 },
          { t: "p" },
          { t: "callout", n: 1 },
          { t: "p" },
        ],
      },
      {
        id: "what-happens",
        blocks: [{ t: "h2" }, { t: "ul", n: 7 }, { t: "callout", n: 1 }],
      },
      {
        id: "apple-linked",
        anchor: "apple-linked",
        blocks: [
          { t: "h2" },
          { t: "p" },
          { t: "ol", n: 3 },
          { t: "callout", n: 1 },
          { t: "p" },
          { t: "ul", n: 3 },
        ],
      },
      { id: "apple-android", blocks: [{ t: "h3" }, { t: "p" }, { t: "p" }] },
      { id: "break", blocks: [{ t: "h2" }, { t: "p" }, { t: "p" }] },
      { id: "questions", blocks: [{ t: "h2" }, { t: "p" }] },
    ],
  },
});

/** Page keys in the order the parity matrix reports them. */
const PAGE_KEYS = Object.freeze(Object.keys(PAGES));

/** Every section ID of every page, as `page/section`. */
function sectionIds() {
  return PAGE_KEYS.flatMap((page) =>
    PAGES[page].sections.map((section) => `${page}/${section.id}`)
  );
}

/** The slot budget of one page, per section, for the parity report. */
function sectionBudget(page) {
  return PAGES[page].sections.map((section) => ({
    id: section.id,
    slots: slotsOfSection(section),
  }));
}

module.exports = {
  CANONICAL_REVISION,
  PAGES,
  PAGE_KEYS,
  ZERO_SLOT_BLOCKS,
  slotsOf,
  slotsOfSection,
  slotsOfPage,
  sectionIds,
  sectionBudget,
};
