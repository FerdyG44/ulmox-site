"use strict";

const fs = require("fs");
const path = require("path");

const LANGUAGES = [
  "en", "sv", "tr", "de", "es", "fr", "it", "pt", "nl", "pl",
  "fi", "ru", "ja", "ko", "zh", "ar", "hi", "th", "vi"
];
const SITE_DIRECTORIES = new Set([
  "assets", "download", "delete-account", ...LANGUAGES
]);
const ANALYTICS_MARKER = "ULMOX_GA4_ANALYTICS";
const ANALYTICS_TAGS = [
  `  <!-- ${ANALYTICS_MARKER} -->`,
  '  <script src="/assets/js/analytics-config.js"></script>',
  '  <script src="/assets/js/analytics.js" defer></script>'
].join("\n");

function validateMeasurementId(value) {
  const id = String(value || "").trim().toUpperCase();
  if (!id) return "";
  if (!/^G-[A-Z0-9]{4,20}$/.test(id)) {
    throw new Error("GA_MEASUREMENT_ID must use the format G-XXXXXXXXXX.");
  }
  return id;
}

/**
 * Root files that must reach the deployed site.
 *
 * Stage 0.14B-R: robots.txt and sitemap.xml were added to the source tree at
 * Stage 0.13 but never appeared in dist/, so a deployed build served neither.
 * They are named here rather than matched by extension, so adding a stray
 * .txt or .xml to the repository root cannot silently publish it.
 *
 * Stage 1.6W.1 removed "demo.mp4" from this list. The name was here, and every
 * landing page linked to it, but the file has never existed in this repository
 * — not tracked, not untracked, not in any commit. Listing a file that is not
 * there copies nothing and reports nothing, which is exactly how 20 landing
 * pages shipped a 404 for months. verifyReferences() below now fails the build
 * on any local reference that does not resolve in the output.
 */
const ROOT_FILES = Object.freeze(new Set([
  "CNAME",
  "logo.png",
  "robots.txt",
  "sitemap.xml"
]));

/** Root files that must exist, or the deployed site is missing a route. */
const REQUIRED_ROOT_FILES = Object.freeze(["robots.txt", "sitemap.xml", "CNAME"]);

function isWebsiteRootFile(name) {
  return name.endsWith(".html") || ROOT_FILES.has(name);
}

/**
 * Paths that must never carry an analytics tag.
 *
 * The deletion pages exist so a person can leave. Instrumenting them would
 * record the one action we have least business measuring, so they are excluded
 * at build time rather than relying on the page author to remember.
 */
const ANALYTICS_EXCLUDED = /(^|[\\/])delete[_-]account([\\/]|\.html$)/;

function isAnalyticsExcluded(relativePath) {
  return ANALYTICS_EXCLUDED.test(relativePath);
}

function copyWebsite(sourceRoot, outputRoot) {
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    const source = path.join(sourceRoot, entry.name);
    const destination = path.join(outputRoot, entry.name);
    if (entry.isDirectory() && SITE_DIRECTORIES.has(entry.name)) {
      fs.cpSync(source, destination, { recursive: true });
    } else if (entry.isFile() && isWebsiteRootFile(entry.name)) {
      fs.copyFileSync(source, destination);
    }
  }
}

function walkHtmlFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(fullPath, files);
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function injectAnalyticsTags(html, relativePath) {
  if (html.includes(ANALYTICS_MARKER)) return html;
  if (!/<\/head>/i.test(html)) {
    throw new Error(`${relativePath}: missing </head> for analytics injection.`);
  }
  return html.replace(/<\/head>/i, `${ANALYTICS_TAGS}\n</head>`);
}

function writeRuntimeConfig(outputRoot, measurementId, environment) {
  const configPath = path.join(outputRoot, "assets", "js", "analytics-config.js");
  const config = {
    gaMeasurementId: measurementId,
    environment: environment || "production"
  };
  fs.writeFileSync(
    configPath,
    `window.ULMOX_WEB_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`,
    "utf8"
  );
}

/**
 * Every local `href`, `src` and `poster` in the build must resolve to a file
 * the build produced, and a media file must not be a zero-byte stand-in.
 *
 * This is a build failure rather than a warning on purpose. A broken media
 * reference is invisible in the source tree — the page looks fine, the element
 * is well formed, and only a browser or a store reviewer finds out.
 */
function verifyReferences(outputRoot) {
  const { auditReferences } = require("./audit-site");
  const { findings, checked, mediaChecked } = auditReferences(outputRoot);
  if (findings.length) {
    const detail = findings
      .slice(0, 10)
      .map((finding) => `${finding.route}: ${finding.message}`)
      .join("; ");
    throw new Error(
      `${findings.length} broken local reference(s) in the build output: ${detail}` +
        (findings.length > 10 ? " …" : "")
    );
  }
  return { checked, mediaChecked };
}

function resolveOutputRoot(sourceRoot, requestedOutput) {
  const outputRoot = path.resolve(sourceRoot, requestedOutput || "dist");
  if (outputRoot === sourceRoot || sourceRoot.startsWith(`${outputRoot}${path.sep}`)) {
    throw new Error("Build output must be a dedicated directory below the repository root.");
  }
  return outputRoot;
}

function buildSite({
  sourceRoot = path.resolve(__dirname, ".."),
  output = "dist",
  measurementId = process.env.GA_MEASUREMENT_ID,
  environment = process.env.NODE_ENV || "production"
} = {}) {
  const normalizedId = validateMeasurementId(measurementId);
  const outputRoot = resolveOutputRoot(sourceRoot, output);

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });
  copyWebsite(sourceRoot, outputRoot);

  for (const name of REQUIRED_ROOT_FILES) {
    if (!fs.existsSync(path.join(outputRoot, name))) {
      throw new Error(`${name} is missing from the build output.`);
    }
  }

  const htmlFiles = walkHtmlFiles(outputRoot);
  let instrumentedHtmlFiles = 0;
  for (const htmlPath of htmlFiles) {
    const relativePath = path.relative(outputRoot, htmlPath);
    const html = fs.readFileSync(htmlPath, "utf8");
    if (!html.trim()) continue;
    // Stage 0.13: the account-deletion route is deliberately analytics-free.
    // Someone deleting their account should not be measured while doing it,
    // and nothing on that route needs a page view to work.
    if (isAnalyticsExcluded(relativePath)) continue;
    fs.writeFileSync(
      htmlPath,
      injectAnalyticsTags(html, relativePath),
      "utf8"
    );
    instrumentedHtmlFiles += 1;
  }
  writeRuntimeConfig(outputRoot, normalizedId, environment);

  // Stage 1.6W.1: nothing may leave this build pointing at a file that is not
  // in it. A missing stylesheet, a missing badge or a missing video is the
  // same failure to the person who opens the page.
  const references = verifyReferences(outputRoot);

  return {
    outputRoot,
    measurementIdConfigured: Boolean(normalizedId),
    htmlFiles: htmlFiles.length,
    instrumentedHtmlFiles,
    rootFiles: REQUIRED_ROOT_FILES.length,
    referencesChecked: references.checked,
    mediaReferencesChecked: references.mediaChecked
  };
}

if (require.main === module) {
  try {
    const outputArgument = process.argv.find((argument) => argument.startsWith("--out="));
    const result = buildSite({
      output: outputArgument ? outputArgument.slice("--out=".length) : "dist"
    });
    console.log("ULMOX_SITE_BUILD_COMPLETE", result);
  } catch (error) {
    console.error("ULMOX_SITE_BUILD_FAILED", error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  ROOT_FILES,
  REQUIRED_ROOT_FILES,
  isWebsiteRootFile,
  isAnalyticsExcluded,
  ANALYTICS_MARKER,
  buildSite,
  injectAnalyticsTags,
  validateMeasurementId,
  verifyReferences
};
