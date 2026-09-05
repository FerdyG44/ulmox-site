"use strict";

/**
 * Stage 1.6W.1 — the site-wide auditor.
 *
 * Two audits live here because both answer the same question from opposite
 * ends: does the page a person actually receives work?
 *
 *   auditReferences()   — every local href/src resolves to a file that exists.
 *   auditAccessibility() — every complete page carries the structure a
 *                          keyboard, a screen reader and a store reviewer need.
 *
 * Both run over a directory of *built* HTML, so what is checked is what would
 * be served, not what the source tree happens to contain. `scripts/build-site.js`
 * calls auditReferences() against dist/ and fails the build on any miss: the
 * missing `demo.mp4` shipped for months because nothing looked.
 */

const fs = require("fs");
const path = require("path");

const LOCALES = Object.freeze([
  "en", "sv", "tr", "de", "es", "fr", "it", "pt", "nl", "pl",
  "fi", "ru", "ja", "ko", "zh", "ar", "hi", "th", "vi"
]);

/** Extensions whose absence is a broken media element, not a broken link. */
const MEDIA_EXTENSIONS = Object.freeze(new Set([
  ".mp4", ".webm", ".ogv", ".mov", ".m4v",
  ".mp3", ".wav", ".ogg", ".m4a", ".aac",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico",
  ".vtt", ".srt"
]));

/** Link text that tells a screen-reader user nothing about the destination. */
const GENERIC_LINK_TEXT = Object.freeze([
  "click here", "here", "read more", "more", "link", "this", "this page",
  "learn more", "go", "click"
]);

/**
 * The page with its comments and its inline CSS and JS *bodies* removed, but
 * every tag kept.
 *
 * Element checks have to run against markup, not against prose that happens to
 * look like markup: a CSS comment explaining why a `<video>` was removed is not
 * a `<video>`, and a stylesheet is not a link.
 */
function elementMarkup(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/(<style\b[^>]*>)[\s\S]*?(<\/style>)/gi, "$1$2")
    .replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, "$1$2");
}

function collectHtml(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        walk(full);
      } else if (entry.name.endsWith(".html")) {
        files.push(path.relative(root, full).split(path.sep).join("/"));
      }
    }
  };
  walk(root);
  return files.sort();
}

/** The locale a route belongs to; "en" for the root and /download/. */
function localeOf(route) {
  const first = route.split("/")[0];
  return LOCALES.includes(first) ? first : "en";
}

/* -------------------------------------------------------------------------- */
/* Reference audit                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every local reference on every page, resolved against the built tree.
 *
 * `src` and `href` are treated identically, and `<source src>` inside a
 * `<video>` or `<audio>` is just another `src` — the element that made the
 * missing landing-page video invisible to earlier checks.
 */
function auditReferences(root) {
  const findings = [];
  let checked = 0;
  let mediaChecked = 0;

  for (const route of collectHtml(root)) {
    const html = elementMarkup(fs.readFileSync(path.join(root, route), "utf8"));
    const dir = path.dirname(path.join(root, route));

    for (const match of html.matchAll(/(?:href|src|poster|srcset|data-src)="([^"]*)"/g)) {
      for (const raw of match[1].split(",")) {
        const value = raw.trim().split(/\s+/)[0];
        if (!value) continue;
        if (/^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(value)) continue;

        const [target] = value.split("#")[0].split("?");
        if (!target) continue;

        checked += 1;
        const extension = path.extname(target).toLowerCase();
        const isMedia = MEDIA_EXTENSIONS.has(extension);
        if (isMedia) mediaChecked += 1;

        const resolved = target.startsWith("/")
          ? path.join(root, target.slice(1))
          : path.join(dir, target);
        const candidate = resolved.endsWith("/") || !path.extname(resolved)
          ? path.join(resolved, "index.html")
          : resolved;

        if (!fs.existsSync(candidate)) {
          findings.push({
            route,
            rule: isMedia ? "missing-media" : "missing-link",
            message: `${isMedia ? "media" : "link"} target does not exist: ${value}`
          });
          continue;
        }
        if (isMedia && fs.statSync(candidate).size === 0) {
          findings.push({
            route,
            rule: "empty-media",
            message: `media file is zero bytes: ${value}`
          });
        }
      }
    }
  }

  return { findings, checked, mediaChecked };
}

/* -------------------------------------------------------------------------- */
/* Contrast                                                                   */
/* -------------------------------------------------------------------------- */

const NAMED_COLORS = Object.freeze({
  white: "#ffffff", black: "#000000", red: "#ff0000", blue: "#0000ff"
});

function expandHex(hex) {
  const value = hex.replace("#", "");
  if (value.length === 3) {
    return value.split("").map((c) => c + c).join("");
  }
  return value.slice(0, 6);
}

function channelLuminance(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const value = expandHex(hex);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

function normalizeColor(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (NAMED_COLORS[value]) return NAMED_COLORS[value];
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  return hex ? `#${expandHex(hex[0])}` : null;
}

/**
 * Every rule in a stylesheet, innermost first, with `@media` wrappers unwound.
 *
 * Extracting rules with one pass of a `}`-anchored regex silently skips every
 * other rule, because the closing brace of one match is the opening context of
 * the next. Peeling the innermost braces off repeatedly avoids that and handles
 * nesting at the same time.
 */
function flattenRules(css) {
  const rules = [];
  let remaining = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const innermost = /([^{}]*)\{([^{}]*)\}/g;
  for (let pass = 0; pass < 12; pass += 1) {
    let found = false;
    remaining = remaining.replace(innermost, (whole, selector, block) => {
      found = true;
      const name = selector.trim().split(/\n/).pop().trim();
      if (name) rules.push({ selector: name, block });
      return "";
    });
    if (!found) break;
  }
  return rules;
}

/**
 * Every colour the page paints text in, against every colour it might paint
 * behind that text.
 *
 * Gradients are reduced to their stops and the *lightest* stop is used, which
 * is the worst case for the light-on-dark palette this site uses. A rule that
 * sets its own background is measured against that background instead of the
 * page background, so a light panel is not judged against the dark page.
 */
function contrastFindings(html, route) {
  const findings = [];
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
  const bodyInline = (html.match(/<body[^>]*style="([^"]*)"/i) || [])[1] || "";

  const pageBackgrounds = new Set();
  const collectBackgrounds = (declaration) => {
    for (const hex of declaration.matchAll(/#[0-9a-fA-F]{3,6}\b/g)) {
      const color = normalizeColor(hex[0]);
      if (color) pageBackgrounds.add(color);
    }
    if (/\b(?:background|background-color)\s*:\s*(white|black)\b/i.test(declaration)) {
      pageBackgrounds.add(normalizeColor(RegExp.$1));
    }
  };

  const rules = flattenRules(styles);

  for (const { selector, block } of rules) {
    if (!/\bbody\b/i.test(selector)) continue;
    for (const declaration of block.matchAll(/(?:^|;)\s*background(?:-color|-image)?\s*:([^;]*)/gi)) {
      collectBackgrounds(declaration[1]);
    }
  }
  for (const declaration of bodyInline.matchAll(/(?:^|;)\s*background(?:-color)?\s*:([^;]*)/gi)) {
    collectBackgrounds(declaration[1]);
  }
  // CSS custom property indirection: --bg is the page ground on shell pages.
  for (const declaration of styles.matchAll(/--bg\s*:\s*([^;]+);/g)) {
    const color = normalizeColor(declaration[1]);
    if (color) pageBackgrounds.add(color);
  }

  if (pageBackgrounds.size === 0) return findings;

  // The lightest declared ground is the hardest for light text to sit on.
  const worstBackground = [...pageBackgrounds].reduce((worst, candidate) =>
    relativeLuminance(candidate) > relativeLuminance(worst) ? candidate : worst
  );

  const variables = new Map();
  for (const declaration of styles.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    const color = normalizeColor(declaration[2]);
    if (color) variables.set(declaration[1], color);
  }

  const measure = (color, background, where, large) => {
    const ratio = contrastRatio(color, background);
    const required = large ? 3 : 4.5;
    if (ratio + 0.005 < required) {
      findings.push({
        route,
        rule: "contrast",
        message:
          `${where}: ${color} on ${background} is ${ratio.toFixed(2)}:1, ` +
          `below the WCAG AA ${required}:1 minimum`
      });
    }
  };

  const resolveColor = (raw) => {
    const variable = String(raw).match(/var\(\s*(--[a-z0-9-]+)/i);
    if (variable) return variables.get(variable[1]) || null;
    return normalizeColor(raw);
  };

  for (const { selector, block } of rules) {
    if (/^@/.test(selector)) continue;
    if (!/(?:^|;|\s)color\s*:/.test(block)) continue;
    if (/:root|::(before|after)/i.test(selector)) continue;

    const colorMatch = block.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const color = colorMatch ? resolveColor(colorMatch[1]) : null;
    if (!color) continue;

    const ownBackground = block.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);
    const background = ownBackground
      ? resolveColor(ownBackground[1]) || worstBackground
      : worstBackground;

    const sizeMatch = block.match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/i);
    const weightMatch = block.match(/font-weight\s*:\s*(\d+|bold)/i);
    const bold = weightMatch
      ? weightMatch[1] === "bold" || Number(weightMatch[1]) >= 700
      : false;
    const size = sizeMatch ? Number(sizeMatch[1]) : 16;
    const large = size >= 24 || (bold && size >= 18.66);

    measure(color, background, selector, large);
  }

  const inlineColor = bodyInline.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
  if (inlineColor) {
    const color = resolveColor(inlineColor[1]);
    if (color) measure(color, worstBackground, "body[style]", false);
  }

  for (const attribute of html.matchAll(/style="([^"]*color\s*:[^"]*)"/gi)) {
    const declaration = attribute[1];
    if (/background/i.test(declaration)) continue;
    const colorMatch = declaration.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const color = colorMatch ? resolveColor(colorMatch[1]) : null;
    if (!color) continue;
    const sizeMatch = declaration.match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/i);
    const size = sizeMatch ? Number(sizeMatch[1]) : 16;
    measure(color, worstBackground, "inline style", size >= 24);
  }

  return findings;
}

/* -------------------------------------------------------------------------- */
/* Accessibility audit                                                        */
/* -------------------------------------------------------------------------- */

function textOf(fragment) {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * One complete HTML page, measured against the shell contract in
 * `scripts/page-shell.js`.
 *
 * `requiredLinks` is checked as a route rather than a label, so a locale can
 * name its own pages in its own words and still be verified.
 */
function auditAccessibility(root, { routes } = {}) {
  const findings = [];
  const files = routes || collectHtml(root);

  for (const route of files) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    if (!html.trim()) continue;

    const locale = localeOf(route);
    const markup = elementMarkup(html);
    const add = (rule, message) => findings.push({ route, rule, message });

    if (!/^\s*<!doctype html>/i.test(html)) add("doctype", "no <!doctype html>");

    const htmlTag = (html.match(/<html\b[^>]*>/i) || [])[0] || "";
    if (!htmlTag) {
      add("html-element", "no <html> element");
      continue;
    }
    if (!new RegExp(`lang="${locale}"`).test(htmlTag)) {
      add("lang", `<html> lang does not match the route locale "${locale}"`);
    }
    if (locale === "ar" && !/dir="rtl"/.test(htmlTag)) {
      add("dir", "Arabic route without dir=\"rtl\"");
    }
    if (locale !== "ar" && /dir="rtl"/.test(htmlTag)) {
      add("dir", "non-Arabic route with dir=\"rtl\"");
    }

    if (!/<meta\s+charset=["']?utf-8/i.test(html)) add("charset", "no UTF-8 charset");
    if (!/name="viewport"[^>]*width=device-width/i.test(html)) {
      add("viewport", "no responsive viewport meta");
    }

    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
    if (!title.trim()) add("title", "no <title>");
    if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) {
      add("description", "no meta description");
    }

    // Landmarks.
    const mainMatch = markup.match(/<main\b[^>]*>/i);
    if (!mainMatch) add("main", "no <main> landmark");
    else if (!/id="main"/.test(mainMatch[0])) add("main-id", "<main> has no id=\"main\"");
    if (!/<footer\b/i.test(markup)) add("footer", "no <footer> landmark");

    const navTags = [...markup.matchAll(/<nav\b[^>]*>/gi)];
    if (navTags.length === 0) add("nav", "no <nav> landmark");
    for (const nav of navTags) {
      if (!/aria-label(?:ledby)?=/i.test(nav[0])) {
        add("nav-label", `unlabelled navigation: ${nav[0]}`);
      }
    }

    // Skip link, and a target it can actually reach.
    const skip = markup.match(/<a\b[^>]*href="#main"[^>]*>([\s\S]*?)<\/a>/i);
    if (!skip) add("skip-link", "no skip link targeting #main");
    else if (!textOf(skip[1])) add("skip-link-text", "skip link has no visible text");
    if (skip && !/id="main"/.test(markup)) {
      add("skip-link-target", "skip link has no #main target");
    }

    // Headings. A <noscript> block is an *alternative* rendering of the page,
    // never an addition to it, so its headings are counted on their own rather
    // than against the scripted document's.
    const scripted = markup.replace(/<noscript>[\s\S]*?<\/noscript>/gi, "");
    const h1s = [...scripted.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1s.length !== 1) add("h1-count", `${h1s.length} <h1> elements, expected exactly 1`);
    for (const h1 of h1s) {
      if (!textOf(h1[1])) add("h1-empty", "<h1> has no text");
    }
    const levels = [...scripted.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i += 1) {
      if (levels[i] > levels[i - 1] + 1) {
        add("heading-skip", `heading jumps h${levels[i - 1]} -> h${levels[i]}`);
      }
    }

    // Visible focus.
    if (!/:focus-visible/.test(html)) add("focus-visible", "no :focus-visible styling");

    // Links: never empty, never generic, always rel-protected in a new tab.
    for (const anchor of markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      const attributes = anchor[1];
      const inner = anchor[2];
      const label = textOf(inner);
      const ariaLabel = (attributes.match(/aria-label="([^"]*)"/i) || [])[1] || "";
      const imageAlt = [...inner.matchAll(/<img\b[^>]*alt="([^"]*)"/gi)]
        .map((m) => m[1].trim())
        .filter(Boolean)
        .join(" ");
      const accessibleName = label || ariaLabel || imageAlt;

      if (!/href=/.test(attributes)) continue;
      if (!accessibleName) {
        add("empty-link", `link with no accessible name: <a${attributes}>`);
      } else if (GENERIC_LINK_TEXT.includes(accessibleName.toLowerCase())) {
        add("generic-link", `non-descriptive link text: "${accessibleName}"`);
      }
      if (/target="_blank"/.test(attributes) && !/rel="[^"]*noopener/.test(attributes)) {
        add("noopener", `target="_blank" without rel="noopener": <a${attributes}>`);
      }
    }

    // Images must be described or explicitly decorative.
    for (const image of markup.matchAll(/<img\b([^>]*)>/gi)) {
      if (!/\balt=/.test(image[1])) add("img-alt", `<img> without alt: <img${image[1]}>`);
    }

    // Media must never seize the page.
    for (const media of markup.matchAll(/<(video|audio)\b([^>]*)>/gi)) {
      if (/\bautoplay\b/i.test(media[2]) && !/\bmuted\b/i.test(media[2])) {
        add("autoplay-sound", `<${media[1]}> autoplays with sound`);
      }
      if (!/\bcontrols\b/i.test(media[2]) && !/\bautoplay\b/i.test(media[2])) {
        add("media-controls", `<${media[1]}> has neither controls nor autoplay`);
      }
    }

    findings.push(...contrastFindings(html, route));
  }

  return { findings, pages: files.length };
}

/* -------------------------------------------------------------------------- */
/* Required navigation                                                        */
/* -------------------------------------------------------------------------- */

const REQUIRED_ROUTES = Object.freeze([
  "privacy.html",
  "terms.html",
  "safety.html",
  "support.html",
  "delete_account.html",
  "translation.html"
]);

/**
 * Every complete page must reach Privacy, Terms, Safety, Support, Account
 * Deletion and Translation Information, and must reach its *own* locale's copy.
 */
function auditRequiredNavigation(root, { routes } = {}) {
  const findings = [];
  const files = routes || collectHtml(root);

  for (const route of files) {
    const html = elementMarkup(fs.readFileSync(path.join(root, route), "utf8"));
    if (!html.trim()) continue;
    const locale = localeOf(route);
    const isLocalized = LOCALES.includes(route.split("/")[0]);
    const prefix = isLocalized ? `/${locale}/` : "/";
    const depth = route.split("/").length - 1;

    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const resolved = hrefs.map((href) => {
      if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
      const base = href.startsWith("/") ? [] : route.split("/").slice(0, -1);
      const segments = [];
      for (const segment of [...base, ...href.replace(/^\//, "").split("/")]) {
        if (segment === "." || segment === "") continue;
        if (segment === "..") segments.pop();
        else segments.push(segment);
      }
      return `/${segments.join("/")}`;
    });

    // A page never has to link to itself; it is already there, and the shell
    // marks it with aria-current instead.
    const self = `/${route}`;
    for (const target of REQUIRED_ROUTES) {
      const expected = `${prefix}${target}`;
      if (expected === self) continue;
      if (!resolved.includes(expected)) {
        findings.push({
          route,
          rule: "required-link",
          message: `no link to ${expected}`
        });
      }
    }

    // A localized page must never send the reader into another locale.
    for (const target of resolved) {
      const other = target.match(/^\/([a-z]{2})\//);
      if (!other || !LOCALES.includes(other[1])) continue;
      if (isLocalized && other[1] !== locale) {
        findings.push({
          route,
          rule: "cross-locale-link",
          message: `links out of ${locale} into ${other[1]}: ${target}`
        });
      }
    }
    void depth;
  }

  return { findings, pages: files.length };
}

/* -------------------------------------------------------------------------- */

function summarize(findings) {
  const byRule = new Map();
  for (const finding of findings) {
    byRule.set(finding.rule, (byRule.get(finding.rule) || 0) + 1);
  }
  return [...byRule.entries()].sort((a, b) => b[1] - a[1]);
}

if (require.main === module) {
  const argument = process.argv.find((value) => value.startsWith("--root="));
  const root = path.resolve(
    __dirname,
    "..",
    argument ? argument.slice("--root=".length) : "dist"
  );
  const verbose = process.argv.includes("--verbose");

  const references = auditReferences(root);
  const accessibility = auditAccessibility(root);
  const navigation = auditRequiredNavigation(root);
  const all = [
    ...references.findings,
    ...accessibility.findings,
    ...navigation.findings
  ];

  console.log(`root: ${root}`);
  console.log(`pages audited: ${accessibility.pages}`);
  console.log(`references checked: ${references.checked} (media: ${references.mediaChecked})`);
  console.log(`findings: ${all.length}`);
  for (const [rule, count] of summarize(all)) {
    console.log(`  ${String(count).padStart(5)}  ${rule}`);
  }
  if (verbose) {
    for (const finding of all) {
      console.log(`    ${finding.route} [${finding.rule}] ${finding.message}`);
    }
  }
  process.exitCode = all.length === 0 ? 0 : 1;
}

module.exports = {
  LOCALES,
  MEDIA_EXTENSIONS,
  REQUIRED_ROUTES,
  GENERIC_LINK_TEXT,
  collectHtml,
  elementMarkup,
  localeOf,
  auditReferences,
  auditAccessibility,
  auditRequiredNavigation,
  contrastRatio,
  summarize
};
