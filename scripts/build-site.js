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

function isWebsiteRootFile(name) {
  return name.endsWith(".html") ||
    name === "CNAME" ||
    name === "logo.png" ||
    name === "demo.mp4";
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

  const htmlFiles = walkHtmlFiles(outputRoot);
  let instrumentedHtmlFiles = 0;
  for (const htmlPath of htmlFiles) {
    const relativePath = path.relative(outputRoot, htmlPath);
    const html = fs.readFileSync(htmlPath, "utf8");
    if (!html.trim()) continue;
    fs.writeFileSync(
      htmlPath,
      injectAnalyticsTags(html, relativePath),
      "utf8"
    );
    instrumentedHtmlFiles += 1;
  }
  writeRuntimeConfig(outputRoot, normalizedId, environment);

  return {
    outputRoot,
    measurementIdConfigured: Boolean(normalizedId),
    htmlFiles: htmlFiles.length,
    instrumentedHtmlFiles
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
  ANALYTICS_MARKER,
  buildSite,
  injectAnalyticsTags,
  validateMeasurementId
};
