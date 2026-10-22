(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = { createAnalytics: factory };
  if (root && root.document) {
    root.ULMOXAnalytics = factory(root);
    root.ULMOXAnalytics.initialize();
  }
})(typeof window !== "undefined" ? window : null, function createAnalytics(root) {
  "use strict";

  var STATE_KEY = "__ULMOX_GA4_STATE__";
  var CONSENT_KEY = "ulmox.analytics.consent.v1";
  var REVOCATION_KEY = "ulmox.analytics.revoked.v1";
  var REVOCATION_COOKIE = "ulmox_analytics_revoked_v1";
  var REVOCATION_WINDOW_NAME = "ulmox-analytics-revoked-v1";
  var MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;
  var COOKIE_PATTERN = /^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_gac_|_gcl_)/;
  var state = root[STATE_KEY] || { initializedId: "", outboundTrackingBound: false, consent: "", storageAvailable: true };
  root[STATE_KEY] = state;

  function config() { return root.ULMOX_WEB_CONFIG || {}; }
  function measurementId() { return String(config().gaMeasurementId || "").trim().toUpperCase(); }
  function currentPagePath() { return root.location && root.location.pathname ? String(root.location.pathname) : "/"; }

  function hasRevocationMarker() {
    try {
      if (root.sessionStorage && root.sessionStorage.getItem(REVOCATION_KEY) === "denied") return true;
    } catch (_) { /* Continue with the other fail-closed markers. */ }
    try {
      if (root.document && ("; " + root.document.cookie).indexOf("; " + REVOCATION_COOKIE + "=denied") !== -1) return true;
    } catch (_) { /* Continue with the other fail-closed markers. */ }
    try { return String(root.name || "").split(" ").indexOf(REVOCATION_WINDOW_NAME) !== -1; } catch (_) { return false; }
  }

  function markRevoked() {
    var marked = false;
    try {
      if (root.sessionStorage) {
        root.sessionStorage.setItem(REVOCATION_KEY, "denied");
        marked = root.sessionStorage.getItem(REVOCATION_KEY) === "denied" || marked;
      }
    } catch (_) { /* Continue with the other fail-closed markers. */ }
    try {
      if (root.document) {
        root.document.cookie = REVOCATION_COOKIE + "=denied; Max-Age=31536000; Path=/; SameSite=Lax";
        marked = hasRevocationMarker() || marked;
      }
    } catch (_) { /* Continue with the window marker. */ }
    try {
      var parts = String(root.name || "").split(" ").filter(Boolean);
      if (parts.indexOf(REVOCATION_WINDOW_NAME) === -1) parts.push(REVOCATION_WINDOW_NAME);
      root.name = parts.join(" ");
      marked = String(root.name).split(" ").indexOf(REVOCATION_WINDOW_NAME) !== -1 || marked;
    } catch (_) { /* The caller will avoid an unsafe reload. */ }
    return marked;
  }

  function clearRevocationMarker() {
    try { if (root.sessionStorage) root.sessionStorage.removeItem(REVOCATION_KEY); } catch (_) { /* Best effort. */ }
    try { if (root.document) root.document.cookie = REVOCATION_COOKIE + "=; Max-Age=0; Path=/; SameSite=Lax"; } catch (_) { /* Best effort. */ }
    try {
      root.name = String(root.name || "").split(" ").filter(function (part) { return part && part !== REVOCATION_WINDOW_NAME; }).join(" ");
    } catch (_) { /* Best effort. */ }
  }

  function readConsent() {
    if (hasRevocationMarker()) return "denied";
    try {
      var value = root.localStorage && root.localStorage.getItem(CONSENT_KEY);
      state.storageAvailable = Boolean(root.localStorage);
      return value === "granted" || value === "denied" ? value : "";
    } catch (_) { state.storageAvailable = false; return ""; }
  }

  function saveConsent(value) {
    try {
      if (!root.localStorage) { state.storageAvailable = false; return false; }
      root.localStorage.setItem(CONSENT_KEY, value);
      state.storageAvailable = true;
      return true;
    } catch (_) { state.storageAvailable = false; return false; }
  }

  function removeSavedConsent() {
    try {
      if (!root.localStorage) return false;
      root.localStorage.removeItem(CONSENT_KEY);
      return root.localStorage.getItem(CONSENT_KEY) === null;
    } catch (_) { return false; }
  }

  function isAutomatedOrLocalEnvironment() {
    var environment = String(config().environment || "").toLowerCase();
    var hostname = root.location && root.location.hostname ? String(root.location.hostname).toLowerCase() : "";
    var isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    return environment === "test" || Boolean(root.navigator && root.navigator.webdriver) ||
      (isLocalhost && config().allowLocalAnalytics !== true);
  }

  function ensureGtag() {
    root.dataLayer = root.dataLayer || [];
    if (typeof root.gtag !== "function") root.gtag = function gtag() { root.dataLayer.push(arguments); };
    return root.gtag;
  }

  function injectGtagScript(id) {
    try {
      var selector = 'script[data-ulmox-ga4="' + id + '"]';
      if (root.document.querySelector(selector)) return;
      var script = root.document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      script.setAttribute("data-ulmox-ga4", id);
      script.onerror = function () { state.scriptLoadFailed = true; };
      root.document.head.appendChild(script);
    } catch (_) { state.scriptLoadFailed = true; }
  }

  function copyForPage() {
    var copy = root.ULMOX_ANALYTICS_COPY || {};
    var language = String(root.document && root.document.documentElement && root.document.documentElement.lang || "en").toLowerCase().split("-")[0];
    return copy[language] || copy.en || ["Analytics preferences", "ULMOX uses Google Analytics 4 only if you accept optional analytics.", "Accept analytics", "Reject optional analytics", "Privacy choices", "Privacy Policy"];
  }

  function privacyHref() {
    var copy = root.ULMOX_ANALYTICS_COPY || {};
    var first = currentPagePath().split("/").filter(Boolean)[0] || "";
    return copy[first] ? "/" + first + "/privacy.html" : "/privacy.html";
  }

  function renderPreferences() {
    var doc = root.document;
    if (!doc || !doc.body || !doc.createElement) return false;
    var copy = copyForPage();
    var panel = doc.getElementById && doc.getElementById("ulmox-analytics-consent");
    var control = doc.getElementById && doc.getElementById("ulmox-privacy-control");

    if (!control) {
      control = doc.createElement("button");
      control.id = "ulmox-privacy-control";
      control.type = "button";
      control.textContent = copy[4];
      control.setAttribute("aria-haspopup", "dialog");
      doc.body.appendChild(control);
    }
    if (!panel) {
      panel = doc.createElement("section");
      panel.id = "ulmox-analytics-consent";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "false");
      panel.setAttribute("aria-labelledby", "ulmox-consent-title");
      panel.setAttribute("aria-describedby", "ulmox-consent-description");
      var inner = doc.createElement("div"); inner.className = "ulmox-consent-inner";
      var heading = doc.createElement("h2"); heading.id = "ulmox-consent-title"; heading.textContent = copy[0];
      var description = doc.createElement("p"); description.id = "ulmox-consent-description"; description.textContent = copy[1] + " ";
      var privacy = doc.createElement("a"); privacy.href = privacyHref(); privacy.textContent = copy[5]; description.appendChild(privacy);
      var actions = doc.createElement("div"); actions.className = "ulmox-consent-actions";
      var accept = doc.createElement("button"); accept.type = "button"; accept.className = "ulmox-consent-choice"; accept.setAttribute("data-consent", "granted"); accept.textContent = copy[2];
      var reject = doc.createElement("button"); reject.type = "button"; reject.className = "ulmox-consent-choice"; reject.setAttribute("data-consent", "denied"); reject.textContent = copy[3];
      actions.appendChild(accept); actions.appendChild(reject); inner.appendChild(heading); inner.appendChild(description); inner.appendChild(actions); panel.appendChild(inner); doc.body.appendChild(panel);
      accept.addEventListener("click", function () { setConsent("granted"); panel.hidden = true; control.focus(); });
      reject.addEventListener("click", function () { setConsent("denied"); panel.hidden = true; control.focus(); });
    }
    control.addEventListener("click", function () {
      panel.hidden = false;
      var firstChoice = panel.querySelector && panel.querySelector("button[data-consent]");
      if (firstChoice && firstChoice.focus) firstChoice.focus();
    });
    panel.hidden = state.consent !== "";
    return true;
  }

  function bindOutboundTracking() {
    if (state.outboundTrackingBound || !root.document.addEventListener) return;
    state.outboundTrackingBound = true;
    root.document.addEventListener("click", handleOutboundClick, false);
  }

  function loadAnalytics() {
    var id = measurementId();
    if (state.consent !== "granted" || !MEASUREMENT_ID_PATTERN.test(id) || isAutomatedOrLocalEnvironment()) return false;
    root["ga-disable-" + id] = false;
    if (state.initializedId === id) return true;
    if (state.initializedId) return false;
    var gtag = ensureGtag();
    gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("js", new Date());
    gtag("config", id, { send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false, transport_type: "beacon" });
    state.initializedId = id;
    injectGtagScript(id);
    bindOutboundTracking();
    return true;
  }

  function clearAnalyticsCookies() {
    var doc = root.document;
    if (!doc || typeof doc.cookie !== "string") return;
    var hostname = root.location && root.location.hostname ? String(root.location.hostname) : "";
    var domains = ["", hostname, hostname ? "." + hostname : ""];
    doc.cookie.split(";").forEach(function (part) {
      var name = part.split("=")[0].trim();
      if (!COOKIE_PATTERN.test(name)) return;
      domains.forEach(function (domain) {
        doc.cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax" + (domain ? "; Domain=" + domain : "");
      });
    });
  }

  function disableLoadedAnalytics() {
    var id = state.initializedId || measurementId();
    if (MEASUREMENT_ID_PATTERN.test(id)) root["ga-disable-" + id] = true;
    clearAnalyticsCookies();
    try {
      var script = root.document.querySelector('script[data-ulmox-ga4]');
      if (script && script.parentNode) script.parentNode.removeChild(script);
    } catch (_) { /* The disable flag remains the primary stop. */ }
    state.initializedId = "";
    try { delete root.gtag; } catch (_) { root.gtag = undefined; }
    if (root.dataLayer && root.dataLayer.length) root.dataLayer.length = 0;
  }

  function setConsent(value) {
    if (value !== "granted" && value !== "denied") return false;
    var wasLoaded = Boolean(state.initializedId);
    state.consent = value;
    if (value === "granted") {
      if (saveConsent(value)) clearRevocationMarker();
      return loadAnalytics();
    }
    var revocationMarked = markRevoked();
    var denialSaved = saveConsent(value);
    var staleConsentRemoved = denialSaved ? true : removeSavedConsent();
    disableLoadedAnalytics();
    if (wasLoaded && (denialSaved || staleConsentRemoved || revocationMarked) && root.location && typeof root.location.reload === "function") root.location.reload();
    return true;
  }

  function initialize() {
    try {
      if (!state.consent) state.consent = readConsent();
      renderPreferences();
      return state.consent === "granted" ? loadAnalytics() : false;
    } catch (_) { return false; }
  }

  function trackEvent(name, parameters) {
    if (state.consent !== "granted" || !state.initializedId) return false;
    try {
      if (!/^[a-z][a-z0-9_]{0,39}$/.test(String(name || ""))) return false;
      ensureGtag()("event", name, parameters || {});
      return true;
    } catch (_) { return false; }
  }

  function trackPageView(path, title) {
    return trackEvent("page_view", { page_path: path || currentPagePath(), page_title: title || (root.document && root.document.title) || "" });
  }

  function trackStoreClick(options) {
    var input = options || {};
    var platform = input.platform === "ios" ? "ios" : "android";
    var store = platform === "ios" ? "app_store" : "google_play";
    var parameters = { platform: platform, destination: store, store: store, page_path: input.pagePath || currentPagePath(), button_location: input.buttonLocation || "store_link" };
    if (input.linkUrl) parameters.link_url = String(input.linkUrl).slice(0, 500);
    trackEvent(platform === "ios" ? "app_store_click" : "google_play_click", parameters);
    trackEvent("download_click", parameters);
  }

  function classifyStoreUrl(href) {
    try {
      var url = new URL(href, root.location && root.location.href ? root.location.href : undefined);
      var hostname = url.hostname.toLowerCase();
      if (hostname === "apps.apple.com") return "ios";
      if (hostname === "play.google.com") return "android";
    } catch (_) { return ""; }
    return "";
  }

  function inferButtonLocation(link) {
    if (link.dataset && link.dataset.analyticsLocation) return link.dataset.analyticsLocation;
    if (link.id === "appStoreLink" || link.id === "playStoreLink") return "smart_download_store_buttons";
    if (link.id === "fallbackButton") return "smart_download_fallback";
    if (link.closest && link.closest(".store-badges")) return "homepage_store_badges";
    if (link.closest && link.closest(".store-actions")) return "download_store_buttons";
    return "outbound_store_link";
  }

  function handleOutboundClick(event) {
    if (state.consent !== "granted") return false;
    var target = event && event.target;
    var link = target && target.closest ? target.closest("a[href]") : null;
    if (!link) return false;
    var href = link.href || (link.getAttribute && link.getAttribute("href")) || "";
    var platform = classifyStoreUrl(href);
    if (!platform) return false;
    trackStoreClick({ platform: platform, linkUrl: href, buttonLocation: inferButtonLocation(link) });
    return true;
  }

  return { initialize: initialize, setConsent: setConsent, trackEvent: trackEvent, trackPageView: trackPageView, trackStoreClick: trackStoreClick, classifyStoreUrl: classifyStoreUrl, handleOutboundClick: handleOutboundClick, clearAnalyticsCookies: clearAnalyticsCookies };
});
