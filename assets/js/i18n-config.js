window.ULMOX_I18N = {
  storageKey: 'ulmox.language',
  defaultLanguage: 'en',
  languages: [
  {
    "code": "en",
    "nativeName": "English",
    "englishName": "English"
  },
  {
    "code": "sv",
    "nativeName": "Svenska",
    "englishName": "Swedish"
  },
  {
    "code": "tr",
    "nativeName": "Türkçe",
    "englishName": "Turkish"
  },
  {
    "code": "de",
    "nativeName": "Deutsch",
    "englishName": "German"
  },
  {
    "code": "es",
    "nativeName": "Español",
    "englishName": "Spanish"
  },
  {
    "code": "fr",
    "nativeName": "Français",
    "englishName": "French"
  },
  {
    "code": "it",
    "nativeName": "Italiano",
    "englishName": "Italian"
  },
  {
    "code": "pt",
    "nativeName": "Português",
    "englishName": "Portuguese"
  },
  {
    "code": "nl",
    "nativeName": "Nederlands",
    "englishName": "Dutch"
  },
  {
    "code": "pl",
    "nativeName": "Polski",
    "englishName": "Polish"
  },
  {
    "code": "fi",
    "nativeName": "Suomi",
    "englishName": "Finnish"
  },
  {
    "code": "ru",
    "nativeName": "Русский",
    "englishName": "Russian"
  },
  {
    "code": "ja",
    "nativeName": "日本語",
    "englishName": "Japanese"
  },
  {
    "code": "ko",
    "nativeName": "한국어",
    "englishName": "Korean"
  },
  {
    "code": "zh",
    "nativeName": "中文",
    "englishName": "Chinese"
  },
  {
    "code": "ar",
    "nativeName": "العربية",
    "englishName": "Arabic"
  },
  {
    "code": "hi",
    "nativeName": "हिन्दी",
    "englishName": "Hindi"
  },
  {
    "code": "th",
    "nativeName": "ไทย",
    "englishName": "Thai"
  },
  {
    "code": "vi",
    "nativeName": "Tiếng Việt",
    "englishName": "Vietnamese"
  }
]
};

window.ULMOX_I18N.getSupportedLanguage = function getSupportedLanguage(language) {
  if (!language) return window.ULMOX_I18N.defaultLanguage;
  var normalized = String(language).toLowerCase();
  var base = normalized.split('-')[0];
  var supported = window.ULMOX_I18N.languages.some(function (item) {
    return item.code === base;
  });
  return supported ? base : window.ULMOX_I18N.defaultLanguage;
};

window.ULMOX_I18N.getCurrentLanguage = function getCurrentLanguage() {
  var segment = window.location.pathname.split('/').filter(Boolean)[0];
  return window.ULMOX_I18N.getSupportedLanguage(segment);
};

window.ULMOX_I18N.getLocalizedPath = function getLocalizedPath(language) {
  var targetLanguage = window.ULMOX_I18N.getSupportedLanguage(language);
  var parts = window.location.pathname.split('/').filter(Boolean);
  var codes = window.ULMOX_I18N.languages.map(function (item) {
    return item.code;
  });

  if (parts.length > 0 && codes.indexOf(parts[0]) !== -1) {
    parts[0] = targetLanguage;
  } else {
    parts.unshift(targetLanguage);
  }

  var nextPath = '/' + parts.join('/');
  if (window.location.pathname.endsWith('/') && !nextPath.endsWith('/')) {
    nextPath += '/';
  }
  return nextPath + window.location.search + window.location.hash;
};
