"use strict";

/**
 * Stage 1.6W.1 — generates the 20 ULMOX landing routes.
 *
 * Why they are generated now
 * --------------------------
 * All 20 carried `<source src="demo.mp4">` inside an autoplaying `<video>`,
 * behind a decorative "▶" that looked like a play button. `demo.mp4` has never
 * existed in this repository — it is not untracked, it is not in any commit,
 * and no rights-cleared demo video exists anywhere here. Every landing page,
 * including the first page a store reviewer opens, returned 404 for it and
 * showed a fake play control over a permanently empty frame.
 *
 * Nothing was fabricated to fill the gap: no placeholder file, no AI-generated
 * clip, no third-party embed. The video element is gone and the space it held
 * is now a static product introduction built from the ULMOX logo — an asset
 * this repository owns — and the localized line that page already displayed
 * under the play button.
 *
 * The pages are generated rather than hand-edited so the accessible structure
 * cannot drift back apart: 20 near-identical files diverged into 20 slightly
 * different accessibility failures once already.
 *
 * Every localized string comes from scripts/landing-content.js, harvested
 * verbatim from the pages that already carried it. This stage translated
 * nothing and added no product claim.
 *
 * Run with: node scripts/generate-landing-pages.js
 */

const fs = require("fs");
const path = require("path");

const { LANDING } = require("./landing-content");
const {
  CHROME,
  LOCALES,
  SHELL_STYLE,
  isRtl,
  siteFooter,
  skipLink,
  attributeSafe,
} = require("./page-shell");

const ROOT = path.resolve(__dirname, "..");

const APP_STORE_URL = "https://apps.apple.com/se/app/ulmox/id6765990174";
const APP_STORE_URL_ROOT = `${APP_STORE_URL}?l=en-GB`;
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.ulmox.app";

/** Locales that do not separate words with a space. */
const UNSPACED = new Set(["ja", "zh", "th"]);

const STYLE = `
    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: radial-gradient(circle at top, #24113f 0%, #05030a 42%, #000 100%);
      background-color: #05030a;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      text-align: center;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 70px 24px 0;
    }

    .logo-wrap { margin-bottom: 55px; }

    .logo-img {
      width: 110px;
      padding: 18px;
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 18px 50px rgba(120, 80, 255, 0.45);
    }

    .logo-text {
      margin-top: 18px;
      font-size: 22px;
      letter-spacing: 5px;
      font-weight: 900;
    }

    h1 {
      font-size: 58px;
      line-height: 1.05;
      margin: 0;
      font-weight: 900;
    }

    /*
     * The gradient is decoration on top of a real colour. Browsers that do not
     * clip a background to text still render #ffffff, so the headline never
     * depends on the gradient to be readable.
     */
    .gradient-text {
      color: #ffffff;
      background: linear-gradient(90deg, #ffffff, #b794ff, #66e7ff);
      background-clip: text;
      -webkit-background-clip: text;
    }

    @supports (background-clip: text) or (-webkit-background-clip: text) {
      .gradient-text { -webkit-text-fill-color: transparent; }
    }

    .subtitle {
      margin: 24px auto 0;
      max-width: 620px;
      color: #d6d6d6;
      font-size: 20px;
      line-height: 1.5;
    }

    .store-cta { margin-top: 56px; }

    .store-cta h2 {
      font-size: 28px;
      margin: 0;
      line-height: 1.25;
    }

    .store-cta p {
      color: #d6d6d6;
      max-width: 600px;
      margin: 12px auto 0;
      font-size: 17px;
      line-height: 1.55;
    }

    .store-badges {
      margin-top: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .store-badge-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 198px;
      height: 66px;
      line-height: 0;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      transition: transform 0.22s ease, filter 0.22s ease;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      cursor: pointer;
    }

    .store-badge-link:hover {
      filter: drop-shadow(0 10px 22px rgba(120, 80, 255, 0.24));
      transform: scale(1.03);
    }

    @media (prefers-reduced-motion: reduce) {
      .store-badge-link { transition: none; }
      .store-badge-link:hover { transform: none; }
    }

    .store-badge {
      display: block;
      width: auto;
      object-fit: contain;
      pointer-events: none;
      user-select: none;
    }

    .store-badge-app-store { height: 56px; max-width: 176px; }
    .store-badge-link-google-play { width: 198px; height: 66px; overflow: visible; }
    .store-badge-google-play { height: 74px; max-width: 198px; }

    .browser-help {
      display: none;
      margin: 18px auto 0;
      max-width: 560px;
      padding: 16px 18px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      color: #e5e5ea;
      font-size: 15px;
      line-height: 1.45;
      text-align: start;
    }

    .browser-help.visible { display: block; }

    .copy-link {
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 11px 14px;
      margin-top: 12px;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    /*
     * The product introduction. This is the region that used to hold an
     * autoplaying <video> pointing at a file that does not exist. It is now a
     * static, decorative device frame around the ULMOX mark: no media request,
     * no playback control, nothing that suggests something is about to play.
     */
    .intro { margin-top: 64px; }

    .device {
      margin: 0 auto;
      width: 260px;
      max-width: 78vw;
      aspect-ratio: 1 / 2;
      border-radius: 46px;
      background: linear-gradient(180deg, #171722, #07070b);
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 30px 90px rgba(120, 80, 255, 0.35);
      padding: 18px;
    }

    .device-screen {
      height: 100%;
      border-radius: 34px;
      background: radial-gradient(circle at top, #6d28d9 0%, #111827 40%, #020617 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px 18px;
    }

    .device-mark {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.92);
      padding: 12px;
    }

    .device-wordmark {
      font-size: 15px;
      letter-spacing: 4px;
      font-weight: 900;
      color: #ffffff;
    }

    /*
     * The caption *is* the section heading. Repeating the same sentence above
     * the frame and inside it would make a screen reader read the region
     * twice for a difference only a sighted reader can see.
     */
    .device-caption {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.35;
    }

    .features {
      margin-top: 70px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      text-align: start;
    }

    .feature {
      padding: 24px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .feature h2 { margin: 0 0 8px; font-size: 18px; }

    .feature p {
      margin: 0;
      color: #d6d6d6;
      font-size: 15px;
      line-height: 1.5;
    }

    @media (max-width: 600px) {
      .container { padding: 56px 20px 0; }
      h1 { font-size: 42px; }
      .subtitle { font-size: 17px; }
      .store-cta h2 { font-size: 24px; }
      .logo-img { width: 95px; }

      .store-badges { flex-direction: column; gap: 10px; }
      .store-badge-link { width: min(198px, 78vw); height: 66px; }
      .store-badge-app-store { height: 54px; max-width: 172px; }
      .store-badge-link-google-play { width: min(198px, 78vw); height: 66px; }
      .store-badge-google-play { height: 72px; max-width: 194px; }
    }
`;

/** The two store badges, identical on every locale but the App Store URL. */
function storeBadges(appStoreUrl, { id = false } = {}) {
  return `        <div class="store-badges">
          <a
            class="store-badge-link"${id ? '\n            id="appStoreLink"' : ""}
            href="${appStoreUrl}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download ULMOX on the App Store"
          >
            <img
              class="store-badge store-badge-app-store"
              src="/assets/badges/app-store.svg"
              width="162"
              height="54"
              alt="Download on the App Store"
            >
          </a>

          <a
            class="store-badge-link store-badge-link-google-play"${id ? '\n            id="playStoreLink"' : ""}
            href="${PLAY_STORE_URL}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get ULMOX on Google Play"
          >
            <img
              class="store-badge store-badge-google-play"
              src="/assets/badges/google-play.png"
              width="140"
              height="54"
              alt="Get it on Google Play"
            >
          </a>
        </div>`;
}

/** The Instagram in-app-browser help, which only the root entry page carries. */
const BROWSER_HELP = `
        <div id="browserHelp" class="browser-help" role="status" aria-live="polite">
          Instagram may block opening the App Store inside its browser.
          Tap the <strong>&bull;&bull;&bull;</strong> menu and choose
          <strong>Open in external browser</strong> or <strong>Open in Safari</strong>.
          <br>
          <button id="copyStoreLink" class="copy-link" type="button">
            Copy App Store link
          </button>
        </div>`;

const ROOT_SCRIPT = `  <script>
    (function () {
      "use strict";

      const APP_STORE_WEB_URL =
        "${APP_STORE_URL_ROOT}";
      const APP_STORE_SCHEME_URL =
        "itms-apps://apps.apple.com/se/app/ulmox/id6765990174";
      const PLAY_STORE_URL =
        "${PLAY_STORE_URL}";

      function isInstagramBrowser() {
        return /Instagram/i.test(navigator.userAgent || "");
      }

      function isIOS() {
        const ua = navigator.userAgent || "";
        return (
          /iPhone|iPad|iPod/i.test(ua) ||
          (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
        );
      }

      function initializeStoreLinks() {
        const appStoreLink = document.getElementById("appStoreLink");
        const playStoreLink = document.getElementById("playStoreLink");
        const browserHelp = document.getElementById("browserHelp");
        const copyStoreLink = document.getElementById("copyStoreLink");

        if (playStoreLink) {
          playStoreLink.href = PLAY_STORE_URL;
        }

        if (appStoreLink) {
          appStoreLink.href = APP_STORE_WEB_URL;

          appStoreLink.addEventListener("click", function (event) {
            if (!isIOS()) return;

            event.preventDefault();

            /*
             * Must run directly inside the user's tap.
             * Instagram may still block this custom scheme.
             */
            window.location.href = APP_STORE_SCHEME_URL;

            /*
             * Fall back to Apple's HTTPS product page.
             * If Instagram blocks both handoffs, show clear external-browser help.
             */
            window.setTimeout(function () {
              window.location.href = APP_STORE_WEB_URL;
            }, 700);

            window.setTimeout(function () {
              if (browserHelp && isInstagramBrowser()) {
                browserHelp.classList.add("visible");
              }
            }, 1300);
          });
        }

        if (copyStoreLink) {
          copyStoreLink.addEventListener("click", async function () {
            try {
              await navigator.clipboard.writeText(APP_STORE_WEB_URL);
              copyStoreLink.textContent = "App Store link copied";
            } catch (_) {
              const temporaryInput = document.createElement("textarea");
              temporaryInput.value = APP_STORE_WEB_URL;
              temporaryInput.setAttribute("readonly", "");
              temporaryInput.style.position = "fixed";
              temporaryInput.style.opacity = "0";
              document.body.appendChild(temporaryInput);
              temporaryInput.select();
              document.execCommand("copy");
              temporaryInput.remove();
              copyStoreLink.textContent = "App Store link copied";
            }
          });
        }

        if (browserHelp && isInstagramBrowser() && isIOS()) {
          browserHelp.classList.add("visible");
        }
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeStoreLinks);
      } else {
        initializeStoreLinks();
      }
    })();
  </script>`;

/** "ULMOX — <the page's own headline>", so every tab and result is identifiable. */
function landingTitle(key, content) {
  const join = UNSPACED.has(key) ? "" : " ";
  return `ULMOX — ${content.lead}${join}${content.accent}`.replace(/\s+/g, " ").trim();
}

function landingPage(key) {
  const isRoot = key === "root";
  const locale = isRoot ? "en" : key;
  const route = isRoot ? "index.html" : `${locale}/index.html`;
  const content = LANDING[key];
  const chrome = CHROME[locale];

  const dir = isRtl(locale) ? ' dir="rtl"' : "";
  const appStoreUrl = isRoot ? APP_STORE_URL_ROOT : APP_STORE_URL;

  const scripts = isRoot
    ? `  <script src="/assets/js/i18n-config.js"></script>
  <script src="/assets/js/language-redirect.js"></script>

${ROOT_SCRIPT}`
    : `  <script src="/assets/js/i18n-config.js"></script>
  <script src="/assets/js/language-switcher.js" defer></script>`;

  const features = content.features
    .map(
      (feature) => `          <div class="feature">
            <h2>${feature.heading}</h2>
            <p>${feature.body}</p>
          </div>`
    )
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="${locale}"${dir}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#05030a" />
  <title>${attributeSafe(landingTitle(key, content))}</title>
  <meta name="description" content="${attributeSafe(content.subtitle)}" />
  <style>${STYLE}${SHELL_STYLE}  </style>
  <link rel="stylesheet" href="/assets/css/language-switcher.css">
</head>

<body>
${skipLink(route)}

  <div class="container">
    <main id="main">
      <div class="logo-wrap">
        <img src="/logo.png" class="logo-img" alt="ULMOX logo">
        <div class="logo-text">ULMOX</div>
      </div>

      <h1>
        ${content.lead}<br>
        <span class="gradient-text">${content.accent}</span>
      </h1>

      <p class="subtitle">
        ${content.subtitle}
      </p>

      <section class="store-cta" aria-labelledby="store-cta-heading">
        <h2 id="store-cta-heading">${content.ctaHeading}</h2>
        <p>${content.ctaBody}</p>

${storeBadges(appStoreUrl, { id: isRoot })}
${isRoot ? BROWSER_HELP : ""}      </section>

      <section class="intro" aria-labelledby="intro-heading">
        <div class="device">
          <div class="device-screen">
            <img class="device-mark" src="/logo.png" alt="" width="72" height="72">
            <span class="device-wordmark">ULMOX</span>
            <h2 class="device-caption" id="intro-heading">${content.cardText}</h2>
          </div>
        </div>
      </section>

      <section class="features">
${features}
      </section>
    </main>
  </div>

${siteFooter(route, { copyright: content.copyright })}

${scripts}
</body>
</html>
`;
}

const PAGES = Object.freeze([
  ["index.html", "root"],
  ...LOCALES.map((locale) => [`${locale}/index.html`, locale]),
]);

function generate(targetRoot = ROOT) {
  const written = [];
  for (const [file, key] of PAGES) {
    const destination = path.join(targetRoot, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, landingPage(key), "utf8");
    written.push(file);
  }
  return written;
}

if (require.main === module) {
  const written = generate();
  console.log(`Generated ${written.length} landing pages: ${written.join(", ")}`);
}

module.exports = {
  APP_STORE_URL,
  APP_STORE_URL_ROOT,
  PLAY_STORE_URL,
  PAGES,
  landingPage,
  landingTitle,
  generate,
};
