const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const languages = ['en', 'sv', 'tr', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'fi', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'th', 'vi'];
const pages = ['index.html', 'support.html', 'safety.html', 'privacy.html', 'terms.html', 'delete_account.html', 'delete-account/index.html'];
const appStore = 'https://apps.apple.com/se/app/ulmox/id6765990174';
const googlePlay = 'https://play.google.com/store/apps/details?id=com.ulmox.app';

const expectedTitles = {
  en: { privacy: 'Privacy Policy', terms: 'Terms of Service', safety: 'Safety' },
  sv: { privacy: 'Integritetspolicy', terms: 'Användarvillkor', safety: 'Säkerhet' },
  tr: { privacy: 'Gizlilik Politikası', terms: 'Kullanım Şartları', safety: 'Güvenlik' },
  de: { privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', safety: 'Sicherheit' },
  es: { privacy: 'Política de privacidad', terms: 'Términos de servicio', safety: 'Seguridad' },
  fr: { privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation', safety: 'Sécurité' },
  it: { privacy: 'Informativa sulla privacy', terms: 'Termini di servizio', safety: 'Sicurezza' },
  pt: { privacy: 'Política de Privacidade', terms: 'Termos de Serviço', safety: 'Segurança' },
  nl: { privacy: 'Privacybeleid', terms: 'Servicevoorwaarden', safety: 'veiligheid' },
  pl: { privacy: 'Polityka prywatności', terms: 'Warunki korzystania', safety: 'Bezpieczeństwo' },
  fi: { privacy: 'Tietosuojakäytäntö', terms: 'Käyttöehdot', safety: 'turvallisuus' },
  ru: { privacy: 'Политика конфиденциальности', terms: 'Условия использования', safety: 'Безопасность' },
  ja: { privacy: 'プライバシーポリシー', terms: '利用規約', safety: '安全性' },
  ko: { privacy: '개인정보 처리방침', terms: '서비스 약관', safety: '안전' },
  zh: { privacy: '隐私政策', terms: '服务条款', safety: '安全' },
  ar: { privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة', safety: 'السلامة' },
  hi: { privacy: 'गोपनीयता नीति', terms: 'सेवा की शर्तें', safety: 'सुरक्षा' },
  th: { privacy: 'นโยบายความเป็นส่วนตัว', terms: 'ข้อกำหนดการให้บริการ', safety: 'ความปลอดภัย' },
  vi: { privacy: 'Chính sách quyền riêng tư', terms: 'Điều khoản dịch vụ', safety: 'An toàn' }
};

const spanishLeakPhrases = [
  'Política de privacidad',
  'Estándares de seguridad infantil',
  'Términos de servicio',
  'Última actualización',
  'Bienvenido a ULMOX',
  'Seguridad y moderación',
  'Moderación de contenido',
  'Los usuarios',
  'junio de 2026'
];

const englishLeakPhrases = [
  'Privacy Policy',
  'Terms of Service',
  'Last Updated',
  'Welcome to ULMOX',
  'Acceptable Use',
  'Content Moderation',
  'Reporting System',
  'Safety & Moderation',
  'Delete Your Account',
  'Need help?',
  'Email us at:',
  'Download on App Store',
  'Download on Google Play'
];

const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function titleOf(html) {
  return (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
}

function htmlTagOf(html) {
  return (html.match(/<html\b[^>]*>/i) || [])[0] || '';
}

for (const language of languages) {
  assert(fs.existsSync(path.join(root, language)), `Missing language folder: ${language}`);

  for (const page of pages) {
    const relativePath = `${language}/${page}`;
    const fullPath = path.join(root, relativePath);
    assert(fs.existsSync(fullPath), `Missing page: ${relativePath}`);
    if (!fs.existsSync(fullPath)) continue;

    const html = read(relativePath);
    if (!html.trim()) continue;

    const htmlTag = htmlTagOf(html);
    assert(htmlTag.includes(`lang="${language}"`), `${relativePath}: html lang mismatch`);

    if (language === 'ar') {
      assert(htmlTag.includes('dir="rtl"'), `${relativePath}: Arabic page missing dir="rtl"`);
    } else {
      assert(!htmlTag.includes('dir="rtl"'), `${relativePath}: non-Arabic page has dir="rtl"`);
    }

    assert(/charset="?UTF-8/i.test(html), `${relativePath}: missing UTF-8 meta`);

    if (language !== 'es') {
      for (const phrase of spanishLeakPhrases) {
        assert(!html.includes(phrase), `${relativePath}: Spanish phrase leaked: ${phrase}`);
      }
    }

    if (language !== 'en') {
      for (const phrase of englishLeakPhrases) {
        assert(!html.includes(phrase), `${relativePath}: English placeholder leaked: ${phrase}`);
      }
    }

    if (page === 'privacy.html') {
      assert(titleOf(html).includes(expectedTitles[language].privacy), `${relativePath}: privacy title mismatch`);
    }
    if (page === 'terms.html') {
      assert(titleOf(html).includes(expectedTitles[language].terms), `${relativePath}: terms title mismatch`);
    }
    if (page === 'safety.html') {
      assert(titleOf(html).includes(expectedTitles[language].safety), `${relativePath}: safety title mismatch`);
    }

    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      if (href.startsWith('/')) continue;
      if (/^(en|sv|tr|de|es|fr|it|pt|nl|pl|fi|ru|ja|ko|zh|ar|hi|th|vi)\//.test(href)) {
        assert(href.startsWith(`${language}/`), `${relativePath}: href points to wrong locale: ${href}`);
      }
    }
  }

  const index = read(`${language}/index.html`);
  assert(index.includes(appStore), `${language}/index.html: missing App Store link`);
  assert(index.includes(googlePlay), `${language}/index.html: missing Google Play link`);
  assert(index.includes('href="support.html"'), `${language}/index.html: footer support link missing`);
}

const config = read('assets/js/i18n-config.js');
for (const language of languages) {
  assert(config.includes(`"code": "${language}"`), `i18n config missing language: ${language}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Locale verification passed for ${languages.length} languages.`);
