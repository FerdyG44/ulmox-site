"use strict";

/**
 * Stage 0.13 — shared chrome for the ULMOX legal and safety pages.
 *
 * These pages carry claims a store reviewer and a regulator will read, so the
 * markup is generated from one place: a heading level, a missing `lang`
 * attribute or a stale footer link cannot then drift between five pages.
 *
 * Accessibility is built into the template rather than retrofitted — visible
 * focus, a skip link, semantic landmarks, and contrast that meets WCAG AA on
 * the dark background the app already uses.
 */

const EFFECTIVE_DATE = "2026-09-04";
const CONTACT_EMAIL = "ulmoxapp@outlook.com";
const CHILD_SAFETY_LABEL = "ULMOX Child Safety Contact";

/** Every public page, in footer order. */
const PAGES = Object.freeze([
  { file: "index.html", label: "Home" },
  { file: "privacy.html", label: "Privacy Policy" },
  { file: "terms.html", label: "Terms of Service" },
  { file: "safety.html", label: "Child Safety Standards" },
  { file: "support.html", label: "Support" },
  { file: "delete_account.html", label: "Delete Account" },
  { file: "translation.html", label: "Translation Information" },
]);

const STYLE = `
    :root {
      --bg: #0d0d0f;
      --panel: #16161a;
      --text: #ffffff;
      /* #d6d6d6 on #0d0d0f is ~12.4:1, comfortably above WCAG AA. */
      --muted: #d6d6d6;
      --accent: #ffd24d;
      --border: rgba(255, 255, 255, 0.14);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      line-height: 1.7;
      -webkit-text-size-adjust: 100%;
    }

    .skip-link {
      position: absolute;
      left: -9999px;
      top: 0;
      background: var(--accent);
      color: #000;
      padding: 12px 18px;
      z-index: 10;
    }

    .skip-link:focus { left: 0; }

    .container {
      max-width: 860px;
      margin: 0 auto;
      padding: 48px 20px 72px;
    }

    h1 { font-size: clamp(28px, 6vw, 40px); margin: 0 0 8px; line-height: 1.25; }
    h2 { font-size: clamp(20px, 4vw, 25px); margin: 40px 0 12px; }
    h3 { font-size: clamp(17px, 3.4vw, 19px); margin: 26px 0 8px; }

    p, li { color: var(--muted); font-size: 17px; }
    li { margin-bottom: 8px; }

    a { color: var(--accent); }
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--accent);
      outline-offset: 3px;
    }

    .effective {
      color: var(--muted);
      font-size: 15px;
      margin: 0 0 28px;
    }

    .callout {
      background: var(--panel);
      border: 1px solid var(--border);
      border-inline-start: 4px solid var(--accent);
      border-radius: 10px;
      padding: 16px 18px;
      margin: 22px 0;
    }

    .callout p:last-child { margin-bottom: 0; }
    .callout p:first-child { margin-top: 0; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      display: block;
      overflow-x: auto;
    }

    th, td {
      border: 1px solid var(--border);
      padding: 10px 12px;
      text-align: start;
      font-size: 15px;
      color: var(--muted);
      vertical-align: top;
    }

    th { color: var(--text); background: var(--panel); }

    footer {
      border-top: 1px solid var(--border);
      margin-top: 56px;
      padding-top: 24px;
    }

    footer nav ul {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 22px;
    }

    footer li { margin-bottom: 0; }
    footer p { font-size: 15px; }

    @media (max-width: 520px) {
      .container { padding: 32px 16px 56px; }
      p, li { font-size: 16px; }
    }
`;

/** Footer navigation, generated so a link can never go stale on one page. */
function footer(currentFile) {
  const links = PAGES.map((page) => {
    if (page.file === currentFile) {
      return `        <li><span aria-current="page">${page.label}</span></li>`;
    }
    return `        <li><a href="${page.file}">${page.label}</a></li>`;
  }).join("\n");

  return `  <footer>
    <nav aria-label="Legal and support">
      <ul>
${links}
      </ul>
    </nav>
    <p>ULMOX is an 18+ service. Contact: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
  </footer>`;
}

/** Wraps page content in the shared, accessible document shell. */
function page({
  file,
  title,
  description,
  heading,
  effective = true,
  body,
  lang = "en",
  skipLabel = "Skip to content",
  footerHtml
}) {
  const dir = lang === "ar" ? ' dir="rtl"' : "";
  return `<!DOCTYPE html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <style>${STYLE}  </style>
</head>
<body>
  <a class="skip-link" href="#main">${skipLabel}</a>
  <div class="container">
  <main id="main">
    <h1>${heading}</h1>
${effective ? `    <p class="effective">Effective ${EFFECTIVE_DATE}. Last updated ${EFFECTIVE_DATE}.</p>\n` : ""}${body}
  </main>
${footerHtml === undefined ? footer(file) : footerHtml}
  </div>
</body>
</html>
`;
}

module.exports = {
  EFFECTIVE_DATE,
  CONTACT_EMAIL,
  CHILD_SAFETY_LABEL,
  PAGES,
  STYLE,
  footer,
  page,
};
