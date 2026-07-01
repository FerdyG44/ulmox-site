(function () {
  var config = window.ULMOX_I18N;
  if (!config || document.querySelector('.ulmox-language-switcher')) return;

  var currentLanguage = config.getCurrentLanguage();
  localStorage.setItem(config.storageKey, currentLanguage);

  var wrapper = document.createElement('div');
  wrapper.className = 'ulmox-language-switcher';

  var label = document.createElement('label');
  label.setAttribute('for', 'ulmox-language-select');
  label.style.position = 'absolute';
  label.style.width = '1px';
  label.style.height = '1px';
  label.style.padding = '0';
  label.style.margin = '-1px';
  label.style.overflow = 'hidden';
  label.style.clip = 'rect(0, 0, 0, 0)';
  label.style.whiteSpace = 'nowrap';
  label.style.border = '0';
  var labels = { en: 'Language', sv: 'Språk', tr: 'Dil', de: 'Sprache', es: 'Idioma', fr: 'Langue', it: 'Lingua', pt: 'Idioma', nl: 'Taal', pl: 'Język', fi: 'Kieli', ru: 'Язык', ja: '言語', ko: '언어', zh: '语言', ar: 'اللغة', hi: 'भाषा', th: 'ภาษา', vi: 'Ngôn ngữ' };
  label.textContent = labels[currentLanguage] || 'Language';

  var select = document.createElement('select');
  select.id = 'ulmox-language-select';
  select.setAttribute('aria-label', labels[currentLanguage] || 'Language');

  config.languages.forEach(function (language) {
    var option = document.createElement('option');
    option.value = language.code;
    option.textContent = language.nativeName;
    option.selected = language.code === currentLanguage;
    select.appendChild(option);
  });

  select.addEventListener('change', function () {
    localStorage.setItem(config.storageKey, select.value);
    window.location.href = config.getLocalizedPath(select.value);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  document.body.appendChild(wrapper);
})();
