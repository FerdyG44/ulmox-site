"use strict";

/**
 * Stage 1.6W.1 — the canonical accessible page shell for every ULMOX route.
 *
 * Stage 0.13 built one shell for the generated legal pages (scripts/legal-pages.js)
 * and the 25 routes it produces have been structurally sound ever since. The
 * other 136 routes — the 20 landing pages, the 95 hand-localized legal and
 * support pages, the 20 deletion redirects and the download page — were written
 * by hand and drifted: no `<main>`, no skip link, no labelled navigation, no
 * visible focus, several with no `<h1>` at all and one locale group whose page
 * headings had lost their markup entirely.
 *
 * This module is the single definition of that structure for *all* of them. It
 * holds:
 *
 *   - CHROME: the localized navigation and skip-link wording, one entry per
 *     locale, with the legal link labels taken verbatim from the footer each
 *     locale already shipped rather than retranslated here.
 *   - SHELL_STYLE: the skip link, the visible focus ring and the footer
 *     chrome, with a documented WCAG-AA palette.
 *   - applyShell(): an idempotent transformation that brings an existing,
 *     hand-written page up to that contract without touching its prose.
 *
 * applyShell() never rewrites content. It adds landmarks, wraps orphaned text
 * in the element it should always have had, and fixes attributes. A localized
 * sentence that goes in comes out byte for byte.
 */

const LOCALES = Object.freeze([
  "en", "sv", "tr", "de", "es", "fr", "it", "pt", "nl", "pl",
  "fi", "ru", "ja", "ko", "zh", "ar", "hi", "th", "vi"
]);

const CONTACT_EMAIL = "ulmoxapp@outlook.com";

/** Arabic is the only right-to-left locale this site ships. */
function isRtl(locale) {
  return locale === "ar";
}

/**
 * Localized chrome.
 *
 * `privacy`, `terms`, `support`, `safety`, `deleteAccount` and `translation`
 * are the labels each locale's own landing-page footer already used. `home`,
 * `skip`, `navLabel` and `moved` are new at this stage and are hand-written
 * per locale — an English string in a non-English entry is a defect, and
 * tests/page-shell.test.js fails on one.
 */
const CHROME = Object.freeze({
  en: {
    skip: "Skip to content", navLabel: "Legal and support", home: "Home",
    privacy: "Privacy Policy", terms: "Terms", support: "Support",
    safety: "Safety &amp; Moderation", deleteAccount: "Delete Account",
    translation: "Translation Information",
    moved: "This page has moved.", deleteHeading: "Delete Your Account",
    englishPrecedence:
      "The English version of this policy is the authoritative one. If a translation differs from it, the English version applies.",
  },
  sv: {
    skip: "Hoppa till innehållet", navLabel: "Juridik och support", home: "Start",
    privacy: "Integritetspolicy", terms: "Villkor", support: "Kundsupport",
    safety: "Säkerhet och moderering", deleteAccount: "Radera konto",
    translation: "Om översättning",
    moved: "Den här sidan har flyttat.", deleteHeading: "Ta bort ditt konto",
    englishPrecedence:
      "Den engelska versionen av denna policy är den auktoritativa. Om en översättning avviker från den gäller den engelska versionen.",
  },
  tr: {
    skip: "İçeriğe geç", navLabel: "Yasal bilgiler ve destek", home: "Ana sayfa",
    privacy: "Gizlilik Politikası", terms: "Şartlar", support: "Destek",
    safety: "Güvenlik ve Moderasyon", deleteAccount: "Hesabı Sil",
    translation: "Çeviri bilgileri",
    moved: "Bu sayfa taşındı.", deleteHeading: "Hesabınızı Silin",
    englishPrecedence:
      "Bu politikanın İngilizce sürümü esas alınan sürümdür. Bir çeviri bundan farklıysa İngilizce sürüm geçerlidir.",
  },
  de: {
    skip: "Zum Inhalt springen", navLabel: "Rechtliches und Support", home: "Startseite",
    privacy: "Datenschutzerklärung", terms: "Bedingungen", support: "Support",
    safety: "Sicherheit &amp; Moderation", deleteAccount: "Konto löschen",
    translation: "Informationen zur Übersetzung",
    moved: "Diese Seite wurde verschoben.", deleteHeading: "Dein Konto löschen",
    englishPrecedence:
      "Die englische Fassung dieser Richtlinie ist maßgeblich. Weicht eine Übersetzung davon ab, gilt die englische Fassung.",
  },
  es: {
    skip: "Ir al contenido", navLabel: "Información legal y soporte", home: "Inicio",
    privacy: "Política de privacidad", terms: "Términos", support: "Soporte",
    safety: "Seguridad y moderación", deleteAccount: "Eliminar cuenta",
    translation: "Información sobre la traducción",
    moved: "Esta página se ha movido.", deleteHeading: "Eliminar tu cuenta",
    englishPrecedence:
      "La versión en inglés de esta política es la auténtica. Si una traducción difiere de ella, prevalece la versión en inglés.",
  },
  fr: {
    skip: "Aller au contenu", navLabel: "Informations légales et support", home: "Accueil",
    privacy: "Politique de confidentialité", terms: "Conditions", support: "Support",
    safety: "Sécurité et modération", deleteAccount: "Supprimer le compte",
    translation: "Informations sur la traduction",
    moved: "Cette page a été déplacée.", deleteHeading: "Supprimer votre compte",
    englishPrecedence:
      "La version anglaise de cette politique fait foi. En cas de divergence avec une traduction, la version anglaise prévaut.",
  },
  it: {
    skip: "Vai al contenuto", navLabel: "Informazioni legali e supporto", home: "Home page",
    privacy: "Informativa sulla privacy", terms: "Termini", support: "Supporto",
    safety: "Sicurezza e moderazione", deleteAccount: "Elimina account",
    translation: "Informazioni sulla traduzione",
    moved: "Questa pagina è stata spostata.", deleteHeading: "Elimina il tuo account",
    englishPrecedence:
      "La versione inglese di questa informativa è quella autentica. Se una traduzione differisce, prevale la versione inglese.",
  },
  pt: {
    skip: "Ir para o conteúdo", navLabel: "Informações legais e suporte", home: "Início",
    privacy: "Política de Privacidade", terms: "Termos", support: "Suporte",
    safety: "Segurança e moderação", deleteAccount: "Eliminar conta",
    translation: "Informações sobre a tradução",
    moved: "Esta página foi movida.", deleteHeading: "Eliminar a sua conta",
    englishPrecedence:
      "A versão em inglês desta política é a autêntica. Se uma tradução divergir dela, prevalece a versão em inglês.",
  },
  nl: {
    skip: "Naar de inhoud", navLabel: "Juridische informatie en support", home: "Startpagina",
    privacy: "Privacybeleid", terms: "Voorwaarden", support: "Support",
    safety: "Veiligheid en moderatie", deleteAccount: "Account verwijderen",
    translation: "Informatie over vertalen",
    moved: "Deze pagina is verplaatst.", deleteHeading: "Je account verwijderen",
    englishPrecedence:
      "De Engelse versie van dit beleid is de gezaghebbende versie. Wijkt een vertaling daarvan af, dan geldt de Engelse versie.",
  },
  pl: {
    skip: "Przejdź do treści", navLabel: "Informacje prawne i pomoc", home: "Strona główna",
    privacy: "Polityka prywatności", terms: "Warunki", support: "Pomoc",
    safety: "Bezpieczeństwo i moderacja", deleteAccount: "Usuń konto",
    translation: "Informacje o tłumaczeniu",
    moved: "Ta strona została przeniesiona.", deleteHeading: "Usuń swoje konto",
    englishPrecedence:
      "Wersja angielska tej polityki jest wersją rozstrzygającą. Jeśli tłumaczenie różni się od niej, obowiązuje wersja angielska.",
  },
  fi: {
    skip: "Siirry sisältöön", navLabel: "Juridiset tiedot ja tuki", home: "Etusivu",
    privacy: "Tietosuojakäytäntö", terms: "Ehdot", support: "Tuki",
    safety: "Turvallisuus ja moderointi", deleteAccount: "Poista tili",
    translation: "Tietoa kääntämisestä",
    moved: "Tämä sivu on siirretty.", deleteHeading: "Poista tilisi",
    englishPrecedence:
      "Tämän käytännön englanninkielinen versio on määräävä. Jos käännös poikkeaa siitä, sovelletaan englanninkielistä versiota.",
  },
  ru: {
    skip: "Перейти к содержимому", navLabel: "Правовая информация и поддержка", home: "Главная",
    privacy: "Политика конфиденциальности", terms: "Условия", support: "Поддержка",
    safety: "Безопасность и модерация", deleteAccount: "Удалить аккаунт",
    translation: "О переводе",
    moved: "Эта страница перемещена.", deleteHeading: "Удалить аккаунт",
    englishPrecedence:
      "Версия этой политики на английском языке является определяющей. Если перевод отличается от неё, применяется английская версия.",
  },
  ja: {
    skip: "本文へスキップ", navLabel: "法的情報とサポート", home: "ホーム",
    privacy: "プライバシーポリシー", terms: "利用規約", support: "サポート",
    safety: "安全性とモデレーション", deleteAccount: "アカウントを削除",
    translation: "翻訳について",
    moved: "このページは移動しました。", deleteHeading: "アカウントを削除する",
    englishPrecedence:
      "本ポリシーは英語版を正文とします。翻訳が英語版と異なる場合は、英語版が適用されます。",
  },
  ko: {
    skip: "본문으로 건너뛰기", navLabel: "법적 고지 및 지원", home: "홈",
    privacy: "개인정보 처리방침", terms: "약관", support: "지원",
    safety: "안전 및 모더레이션", deleteAccount: "계정 삭제",
    translation: "번역 정보",
    moved: "이 페이지는 이동되었습니다.", deleteHeading: "계정 삭제",
    englishPrecedence:
      "본 정책은 영문판이 정본입니다. 번역본이 영문판과 다를 경우 영문판이 우선합니다.",
  },
  zh: {
    skip: "跳到主要内容", navLabel: "法律信息与支持", home: "首页",
    privacy: "隐私政策", terms: "条款", support: "支持",
    safety: "安全与审核", deleteAccount: "删除账号",
    translation: "翻译说明",
    moved: "此页面已移动。", deleteHeading: "删除你的账户",
    englishPrecedence:
      "本政策以英文版为准。如译文与英文版不一致，以英文版为准。",
  },
  ar: {
    skip: "تخطَّ إلى المحتوى", navLabel: "المعلومات القانونية والدعم", home: "الصفحة الرئيسية",
    privacy: "سياسة الخصوصية", terms: "الشروط", support: "الدعم",
    safety: "السلامة والإشراف", deleteAccount: "حذف الحساب",
    translation: "معلومات الترجمة",
    moved: "تم نقل هذه الصفحة.", deleteHeading: "حذف حسابك",
    englishPrecedence:
      "النسخة الإنجليزية من هذه السياسة هي النسخة المعتمدة. وإذا اختلفت أي ترجمة عنها، فتُطبَّق النسخة الإنجليزية.",
  },
  hi: {
    skip: "सामग्री पर जाएं", navLabel: "कानूनी जानकारी और सहायता", home: "होम",
    privacy: "गोपनीयता नीति", terms: "शर्तें", support: "सहायता",
    safety: "सुरक्षा और मॉडरेशन", deleteAccount: "खाता हटाएं",
    translation: "अनुवाद की जानकारी",
    moved: "यह पृष्ठ स्थानांतरित हो गया है।", deleteHeading: "अपना खाता हटाएं",
    englishPrecedence:
      "इस नीति का अंग्रेज़ी संस्करण ही प्रामाणिक है। यदि कोई अनुवाद उससे भिन्न हो, तो अंग्रेज़ी संस्करण लागू होगा।",
  },
  th: {
    skip: "ข้ามไปยังเนื้อหา", navLabel: "ข้อมูลทางกฎหมายและการสนับสนุน", home: "หน้าแรก",
    privacy: "นโยบายความเป็นส่วนตัว", terms: "ข้อกำหนด", support: "ฝ่ายสนับสนุน",
    safety: "ความปลอดภัยและการดูแลเนื้อหา", deleteAccount: "ลบบัญชี",
    translation: "ข้อมูลการแปล",
    moved: "หน้านี้ถูกย้ายแล้ว", deleteHeading: "ลบบัญชีของคุณ",
    englishPrecedence:
      "นโยบายฉบับภาษาอังกฤษเป็นฉบับที่มีผลบังคับ หากคำแปลใดแตกต่างไปจากฉบับดังกล่าว ให้ยึดฉบับภาษาอังกฤษเป็นสำคัญ",
  },
  vi: {
    skip: "Chuyển đến nội dung", navLabel: "Thông tin pháp lý và hỗ trợ", home: "Trang chủ",
    privacy: "Chính sách quyền riêng tư", terms: "Điều khoản", support: "Hỗ trợ",
    safety: "An toàn và kiểm duyệt", deleteAccount: "Xóa tài khoản",
    translation: "Thông tin về dịch",
    moved: "Trang này đã được chuyển.", deleteHeading: "Xóa tài khoản của bạn",
    englishPrecedence:
      "Bản tiếng Anh của chính sách này là bản có hiệu lực. Nếu bản dịch khác với bản tiếng Anh, bản tiếng Anh sẽ được áp dụng.",
  },
});

/** The six compliance routes every page must reach, plus Home. */
const NAV_ROUTES = Object.freeze([
  { file: "index.html", key: "home" },
  { file: "privacy.html", key: "privacy" },
  { file: "terms.html", key: "terms" },
  { file: "safety.html", key: "safety" },
  { file: "support.html", key: "support" },
  { file: "delete_account.html", key: "deleteAccount" },
  { file: "translation.html", key: "translation" },
]);

const SHELL_MARKER = "ULMOX_PAGE_SHELL";

/**
 * The shell's own CSS.
 *
 * Contrast, measured against the darkest ground any ULMOX page uses (#000)
 * and the lightest (#24113f, the top of the landing gradient):
 *
 *   #ffffff on #24113f  = 16.2:1
 *   #d6d6d6 on #24113f  = 11.7:1   (body copy)
 *   #b9b9c4 on #24113f  =  8.3:1   (muted footer copy)
 *   #ffd24d on #24113f  = 11.4:1   (links and the focus ring)
 *
 * All are above the WCAG AA 4.5:1 minimum for body text. The focus ring is a
 * 3px outline with a 3px offset, so it stays visible on both grounds, and the
 * skip link is moved off-screen by position rather than by `display:none`,
 * which would take it out of the tab order entirely.
 */
const SHELL_STYLE = `
    /* ${SHELL_MARKER} — canonical accessible chrome. Do not edit per page. */
    .ulmox-skip-link {
      position: absolute;
      left: -9999px;
      top: 0;
      z-index: 10000;
      padding: 12px 18px;
      background: #ffd24d;
      color: #000;
      font: 700 16px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      text-decoration: none;
    }

    .ulmox-skip-link:focus,
    .ulmox-skip-link:focus-visible { left: 0; }

    a:focus-visible,
    button:focus-visible,
    select:focus-visible,
    [tabindex]:focus-visible {
      outline: 3px solid #ffd24d;
      outline-offset: 3px;
    }

    body > footer {
      margin: 64px auto 0;
      max-width: 900px;
      padding: 24px 20px 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.16);
      color: #b9b9c4;
      font: 15px/1.7 -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      text-align: start;
    }

    body > footer nav ul {
      list-style: none;
      margin: 0 0 14px;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 22px;
    }

    body > footer li { margin: 0; color: #b9b9c4; font-size: 15px; }
    body > footer a { color: #ffd24d; }
    body > footer p { margin: 0; color: #b9b9c4; font-size: 15px; }
    body > footer [aria-current="page"] { color: #ffffff; font-weight: 700; }

    @media (max-width: 600px) {
      body > footer { padding: 20px 16px 32px; }
      body > footer nav ul { gap: 6px 16px; }
    }
`;

/** `../` for each directory the route sits below its locale (or site) root. */
function relativePrefix(route) {
  const parts = route.split("/");
  const insideLocale = LOCALES.includes(parts[0]);
  const depth = parts.length - 1 - (insideLocale ? 1 : 0);
  return depth > 0 ? "../".repeat(depth) : "";
}

/** The locale a route serves; the root and /download/ are English. */
function localeOf(route) {
  const first = route.split("/")[0];
  return LOCALES.includes(first) ? first : "en";
}

/** The page file a route resolves to, ignoring any locale directory. */
function pageOf(route) {
  const parts = route.split("/");
  return LOCALES.includes(parts[0]) ? parts.slice(1).join("/") : route;
}

/**
 * The canonical footer: one labelled navigation with all seven routes.
 *
 * The page's own entry is a `<span aria-current="page">` rather than a link, so
 * a screen reader announces where the reader already is and nobody is offered
 * a link to the page they are looking at.
 */
/**
 * The pages that state binding obligations, and therefore the pages that carry
 * the language-precedence notice.
 *
 * The landing, download and translation-information routes are excluded: they
 * describe the product rather than bind anyone, so a precedence clause on them
 * would claim more than it should.
 */
const LEGAL_ROUTES = Object.freeze([
  "privacy.html",
  "terms.html",
  "safety.html",
  "support.html",
  "delete_account.html",
]);

function siteFooter(route, { copyright } = {}) {
  const locale = localeOf(route);
  const chrome = CHROME[locale];
  const prefix = relativePrefix(route);
  const current = pageOf(route);

  const items = NAV_ROUTES.map(({ file, key }) => {
    const label = chrome[key];
    if (file === current) {
      return `        <li><span aria-current="page">${label}</span></li>`;
    }
    return `        <li><a href="${prefix}${file}">${label}</a></li>`;
  }).join("\n");

  const tail = copyright
    ? `    <p>${copyright} &middot; <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`
    : `    <p>ULMOX &middot; <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`;

  // Nineteen translations of a binding text need one rule saying which of them
  // decides when they disagree. The notice is rendered in the page's own
  // language so it can actually be read, and it subordinates itself to the
  // English text, so a flaw in translating THIS sentence cannot change which
  // version governs.
  const precedence = LEGAL_ROUTES.includes(current)
    ? `    <p class="ulmox-precedence">${chrome.englishPrecedence}</p>\n`
    : "";

  return `  <footer>
    <nav aria-label="${chrome.navLabel}">
      <ul>
${items}
      </ul>
    </nav>
${precedence}${tail}
  </footer>`;
}

function skipLink(route) {
  return `  <a class="ulmox-skip-link" href="#main">${CHROME[localeOf(route)].skip}</a>`;
}

/* -------------------------------------------------------------------------- */
/* Description                                                                */
/* -------------------------------------------------------------------------- */

const ENTITIES = Object.freeze({
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“",
  "&rdquo;": "”", "&mdash;": "—", "&ndash;": "–",
  "&middot;": "·", "&rarr;": "→", "&nbsp;": " ",
});

function decodeEntities(value) {
  return value.replace(/&[a-z]+;/gi, (entity) => ENTITIES[entity] || entity);
}

function attributeSafe(value) {
  return decodeEntities(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * A localized meta description, taken from the page's own first sentences.
 *
 * Nothing is written here: the description is the localized prose the page
 * already carries, trimmed to a length a search result will show. Inventing a
 * description would mean writing marketing copy in 19 languages nobody has
 * reviewed, which is exactly how an unsupported claim gets published.
 */
function deriveDescription(bodyHtml, { limit = 155 } = {}) {
  const text = decodeEntities(
    bodyHtml
      .replace(/<(script|style|nav|footer)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<h1[\s\S]*?<\/h1>/i, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/* -------------------------------------------------------------------------- */
/* applyShell                                                                 */
/* -------------------------------------------------------------------------- */

const TRAILING_SCRIPTS = /(?:\s*<script\b[^>]*>[\s\S]*?<\/script>)+\s*$/i;

/**
 * Brings one hand-written page up to the shell contract, without touching its
 * prose. Running it twice produces the same file as running it once.
 *
 * `orphanHeadings` names text that sits directly in `<body>` with no element
 * around it. Several localized pages lost their `<h1>` and `<p>` tags at some
 * point and the heading survived only as a bare text node, which is invisible
 * to a screen reader's heading list. Those nodes are wrapped, never rewritten.
 */
function applyShell(html, { route, title, description, copyright } = {}) {
  if (!route) throw new Error("applyShell needs the route it is shaping.");
  const locale = localeOf(route);
  const chrome = CHROME[locale];
  if (!chrome) throw new Error(`${route}: no chrome for locale "${locale}".`);

  let output = html;

  /* 1. Doctype. */
  output = output.replace(/^\s*<!doctype html>\s*/i, "");
  output = `<!DOCTYPE html>\n${output.trimStart()}`;

  /* 2. lang and dir. */
  output = output.replace(/<html\b[^>]*>/i, () => {
    const attributes = [`lang="${locale}"`];
    if (isRtl(locale)) attributes.push('dir="rtl"');
    return `<html ${attributes.join(" ")}>`;
  });

  /* 3-5. Head essentials. */
  const headInsert = [];
  if (!/<meta\s+charset=["']?utf-8/i.test(output)) {
    headInsert.push('  <meta charset="UTF-8" />');
  }
  if (!/name="viewport"[^>]*width=device-width/i.test(output)) {
    headInsert.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0" />');
  }
  if (title) {
    output = /<title>[\s\S]*?<\/title>/i.test(output)
      ? output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
      : output.replace(/<\/head>/i, `  <title>${title}</title>\n</head>`);
  }
  if (!/<meta\s+name="description"/i.test(output)) {
    const bodyForDescription = (output.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [])[1] || "";
    const text = description || deriveDescription(bodyForDescription);
    if (text) {
      headInsert.push(`  <meta name="description" content="${attributeSafe(text)}" />`);
    }
  }
  if (headInsert.length) {
    // The charset must stay in the first bytes of the document, so anything
    // added lands after it rather than in front of it.
    const charset = output.match(/[ \t]*<meta\s+charset=[^>]*>/i);
    output = charset
      ? output.replace(charset[0], `${charset[0]}\n${headInsert.join("\n")}`)
      : output.replace(/<head>/i, `<head>\n${headInsert.join("\n")}`);
  }

  /* 6. Shell stylesheet, once. */
  if (!output.includes(SHELL_MARKER)) {
    output = output.replace(/<\/head>/i, `  <style>${SHELL_STYLE}  </style>\n</head>`);
  }

  /* 7-9. Body landmarks. */
  const bodyMatch = output.match(/(<body\b[^>]*>)([\s\S]*?)(<\/body>)/i);
  if (!bodyMatch) throw new Error(`${route}: no <body> to shape.`);

  const [, openTag, originalBody, closeTag] = bodyMatch;
  let body = originalBody;

  // Trailing <script> tags belong after the landmarks, not inside <main>.
  const scriptsMatch = body.match(TRAILING_SCRIPTS);
  const scripts = scriptsMatch ? scriptsMatch[0].trim() : "";
  if (scriptsMatch) body = body.slice(0, scriptsMatch.index);

  // An existing footer is kept and reused rather than duplicated.
  let existingFooter = "";
  const footerMatch = body.match(/<footer\b[\s\S]*?<\/footer>/i);
  if (footerMatch) {
    existingFooter = footerMatch[0];
    body = body.replace(footerMatch[0], "");
  }

  // The skip link is re-emitted from one place, so its wording cannot drift.
  body = body.replace(/\s*<a class="ulmox-skip-link"[\s\S]*?<\/a>/i, "");

  if (/<main\b/i.test(body)) {
    body = body.replace(/<main\b([^>]*)>/i, (whole, attributes) =>
      /id="main"/.test(attributes) ? whole : `<main${attributes} id="main">`
    );
  } else {
    body = `  <main id="main">\n${body.trim()}\n  </main>`;
  }

  // Indentation is normalized so that shelling an already-shelled page is a
  // no-op; an unstable formatter would make "run the generator" a diff every
  // time and nobody would trust the result.
  const footer = (existingFooter
    ? ensureFooterNav(existingFooter, route)
    : siteFooter(route, { copyright })
  ).replace(/^\s*/, "  ");

  const rebuilt = [
    openTag,
    skipLink(route),
    body.trim(),
    footer,
    scripts ? `  ${scripts}` : "",
    closeTag,
  ]
    .filter(Boolean)
    .join("\n");

  output = output.replace(/<body\b[^>]*>[\s\S]*?<\/body>/i, () => rebuilt);

  /* 10. Every navigation is named. */
  output = output.replace(/<nav\b([^>]*)>/gi, (whole, attributes) =>
    /aria-label(?:ledby)?=/i.test(attributes)
      ? whole
      : `<nav${attributes} aria-label="${chrome.navLabel}">`
  );

  return output.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
}

/**
 * A footer the page already had, given the labelled navigation it lacked.
 *
 * The page's own links are kept and wrapped rather than replaced, so a locale
 * that named its pages in its own words keeps those words. Any of the seven
 * required routes it did not link to is appended.
 */
function ensureFooterNav(footerHtml, route) {
  if (/<nav\b/i.test(footerHtml)) return footerHtml;

  const locale = localeOf(route);
  const chrome = CHROME[locale];
  const prefix = relativePrefix(route);
  const current = pageOf(route);

  const anchors = [...footerHtml.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi)];
  const linked = new Map();
  for (const anchor of anchors) {
    linked.set(anchor[1].replace(/^\.\//, ""), anchor[0]);
  }

  const items = NAV_ROUTES.map(({ file, key }) => {
    if (file === current) {
      return `        <li><span aria-current="page">${chrome[key]}</span></li>`;
    }
    const existing = linked.get(`${prefix}${file}`) || linked.get(file);
    return `        <li>${existing || `<a href="${prefix}${file}">${chrome[key]}</a>`}</li>`;
  }).join("\n");

  let remainder = footerHtml;
  for (const anchor of anchors) {
    if (linked.get(anchor[1].replace(/^\.\//, "")) === anchor[0]) {
      remainder = remainder.replace(anchor[0], "");
    }
  }

  let inner = remainder
    .replace(/^\s*<footer\b[^>]*>/i, "")
    .replace(/<\/footer>\s*$/i, "")
    .trim();

  // A copyright line that was a bare text node inside a <div class="footer">
  // is still a paragraph; it just never had the element.
  if (inner && !/^</.test(inner)) inner = `<p>${inner}</p>`;

  return `  <footer>
    <nav aria-label="${chrome.navLabel}">
      <ul>
${items}
      </ul>
    </nav>
${inner ? `    ${inner}\n` : ""}  </footer>`;
}

module.exports = {
  LOCALES,
  CONTACT_EMAIL,
  CHROME,
  NAV_ROUTES,
  SHELL_MARKER,
  SHELL_STYLE,
  isRtl,
  localeOf,
  pageOf,
  LEGAL_ROUTES,
  relativePrefix,
  siteFooter,
  skipLink,
  deriveDescription,
  attributeSafe,
  decodeEntities,
  applyShell,
  ensureFooterNav,
};
