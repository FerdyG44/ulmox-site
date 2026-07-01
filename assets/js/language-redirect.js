(function () {
  var config = window.ULMOX_I18N;
  if (!config) return;

  var pathParts = window.location.pathname.split('/').filter(Boolean);
  var isLanguagePath = pathParts.length > 0 && config.languages.some(function (item) {
    return item.code === pathParts[0];
  });

  if (isLanguagePath) return;

  var storedLanguage = localStorage.getItem(config.storageKey);
  var browserLanguage = navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
  var nextLanguage = config.getSupportedLanguage(storedLanguage || browserLanguage);

  if (!storedLanguage) {
    localStorage.setItem(config.storageKey, nextLanguage);
  }

  window.location.replace('/' + nextLanguage + '/' + window.location.search + window.location.hash);
})();
