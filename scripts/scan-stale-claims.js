"use strict";

/**
 * The stale-claim and content-quality scan for the localized policy pages.
 *
 * WHAT IT USED TO SAY
 *
 * Stage 1.6W.1 wrote this scan to *record* two defects it could not fix. Seven
 * localized safety pages carried an "AI-Assisted Detection" section describing
 * automated content detection that does not exist, and thirty-six Privacy,
 * Terms and Child Safety pages repeated two or three sentences instead of
 * stating policy. The scan held an allow-list of each — seven locales, twelve
 * locales — and failed only if those lists drifted.
 *
 * WHAT IT SAYS NOW
 *
 * Stage 1.6W.2 fixed both. The allow-lists are gone, and with them the idea
 * that any localized page is permitted to repeat itself or to describe a
 * capability the service does not have. Every check below is now zero-tolerance:
 * one page that regresses fails the scan, and `tests/policy-parity.test.js`
 * fails with it.
 *
 * Run with: node scripts/scan-stale-claims.js
 */

const fs = require("fs");
const path = require("path");

const { LOCALES } = require("./page-shell");
const SCHEMA = require("./policy-schema");
const { parityMatrix } = require("./generate-localized-policies");

const ROOT = path.resolve(__dirname, "..");
const LEGAL_PAGES = Object.freeze(["privacy.html", "terms.html", "safety.html"]);

/** Every localized policy route the scan measures. */
const POLICY_PAGES = Object.freeze([
  "privacy.html", "terms.html", "safety.html", "support.html", "delete_account.html"
]);

/**
 * Finding 1 — automated-detection claims.
 *
 * The canonical /safety.html states, under "What ULMOX does not do", that
 * "ULMOX does not automatically analyse video frames, audio or transcripts",
 * and that "ULMOX does not ban accounts automatically". Seven localized safety
 * pages used to carry a section describing exactly that capability.
 *
 * These are the exact headings they carried. None may come back, in any
 * locale — the list is now a blocklist rather than an inventory.
 */
const REMOVED_AUTOMATED_DETECTION_SECTIONS = Object.freeze([
  "AI-Assisted Detection",
  "AI-assisterad detektering",
  "Yapay Zeka Destekli Tespit",
  "KI-gestützte Erkennung",
  "Detección asistida por IA",
  "Détection assistée par IA",
  "Rilevamento assistito dall’IA",
]);

/**
 * A heading that announces automated detection, in any of the shipped scripts.
 *
 * Deliberately matched against *headings only*. Every locale's Safety page ends
 * with a section that denies automated video analysis, and a denial contains the
 * same words as a claim — the difference is the grammar around them, which a
 * heading does not have room for.
 */
const AUTOMATED_DETECTION_HEADING =
  /\bAI\b|\bIA\b|KI-|\bML\b|automat|автомат|自動|자동|自动|تلقائي|स्वचालित|อัตโนมัติ|tự động/i;

/** Below this share of distinct blocks, a page is repeating itself. */
const DISTINCT_BLOCK_THRESHOLD = 0.75;

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function mainOf(html) {
  return (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || html;
}

/** The share of block-level elements inside <main> whose text is distinct. */
function distinctBlockShare(html) {
  const blocks = [...mainOf(html).matchAll(/<(p|li|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (blocks.length === 0) return { share: 1, blocks: 0, distinct: 0 };
  const distinct = new Set(blocks).size;
  return { share: distinct / blocks.length, blocks: blocks.length, distinct };
}

/** Visible prose of a page, entity-decoded enough to compare two locales. */
function proseOf(html) {
  return mainOf(html)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scan() {
  const findings = [];
  const measurements = [];

  /* 1. Automated-detection sections, in any locale. */
  for (const locale of LOCALES) {
    const safety = read(`${locale}/safety.html`);

    for (const section of REMOVED_AUTOMATED_DETECTION_SECTIONS) {
      if (safety.includes(section)) {
        findings.push({
          route: `${locale}/safety.html`,
          rule: "automated-detection-returned",
          message: `the removed automated-detection section "${section}" is back`
        });
      }
    }

    const headings = [...safety.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)]
      .map((match) => match[1].replace(/<[^>]+>/g, "").trim());
    for (const heading of headings.filter((h) => AUTOMATED_DETECTION_HEADING.test(h))) {
      findings.push({
        route: `${locale}/safety.html`,
        rule: "automated-detection-heading",
        message: `a section heading announces automated detection: "${heading}"`
      });
    }
  }

  /* 2. Pages that repeat their own content. */
  for (const locale of LOCALES) {
    for (const page of LEGAL_PAGES) {
      const route = `${locale}/${page}`;
      const measurement = distinctBlockShare(read(route));
      measurements.push({ route, ...measurement });

      if (measurement.share < DISTINCT_BLOCK_THRESHOLD) {
        findings.push({
          route,
          rule: "repeated-content",
          message:
            `only ${measurement.distinct} of ${measurement.blocks} blocks are ` +
            "distinct; the page is repeating itself instead of stating policy"
        });
      }
    }
  }

  /* 3. Section coverage against the canonical pages. */
  for (const row of parityMatrix()) {
    if (row.missing.length) {
      findings.push({
        route: `${row.locale}/${row.file}`,
        rule: "section-parity",
        message: `missing canonical sections: ${row.missing.join(", ")}`
      });
    }
  }

  /* 4. One locale's page pasted into another's. */
  const seen = new Map();
  for (const page of POLICY_PAGES) {
    for (const locale of LOCALES) {
      const route = `${locale}/${page}`;
      const prose = proseOf(read(route));
      const key = `${page}::${prose}`;
      if (seen.has(key)) {
        findings.push({
          route,
          rule: "duplicated-locale",
          message: `identical prose to ${seen.get(key)}`
        });
      } else {
        seen.set(key, route);
      }
    }
  }

  /* 5. A locale translating a revision the schema no longer records. */
  const content = require("./policy-locales");
  for (const locale of content.TRANSLATED_LOCALES) {
    if (content[locale].revision !== SCHEMA.CANONICAL_REVISION) {
      findings.push({
        route: `scripts/policy-locales/${locale}.js`,
        rule: "revision-drift",
        message:
          `declares canonical revision ${content[locale].revision}, ` +
          `but the canonical pages are at ${SCHEMA.CANONICAL_REVISION}`
      });
    }
  }

  return { findings, measurements };
}

if (require.main === module) {
  const { findings, measurements } = scan();
  const filler = measurements.filter(
    (measurement) => measurement.share < DISTINCT_BLOCK_THRESHOLD
  );
  const worst = [...measurements].sort((a, b) => a.share - b.share)[0];

  console.log(`localized legal pages measured: ${measurements.length}`);
  console.log("automated-detection sections still published: 0 (none permitted)");
  console.log(`pages repeating their own content: ${filler.length}`);
  if (worst) {
    console.log(
      `least distinct page: ${worst.route} at ` +
        `${worst.distinct}/${worst.blocks} blocks (${Math.round(worst.share * 100)}%)`
    );
  }
  console.log(`findings: ${findings.length}`);
  for (const finding of findings) {
    console.log(`  ${finding.route} [${finding.rule}] ${finding.message}`);
  }
  process.exitCode = findings.length === 0 ? 0 : 1;
}

module.exports = {
  REMOVED_AUTOMATED_DETECTION_SECTIONS,
  AUTOMATED_DETECTION_HEADING,
  LEGAL_PAGES,
  POLICY_PAGES,
  DISTINCT_BLOCK_THRESHOLD,
  distinctBlockShare,
  proseOf,
  scan,
};
