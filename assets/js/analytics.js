(function (root, factory) {
  "use strict";

  if (typeof module === "object" && module.exports) {
    module.exports = { createAnalytics: factory };
  }

  if (root && root.document) {
    root.ULMOXAnalytics = factory(root);
    root.ULMOXAnalytics.initialize();
  }
})(typeof window !== "undefined" ? window : null, function createAnalytics(root) {
  "use strict";

  var STATE_KEY = "__ULMOX_GA4_STATE__";
  var MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;
  var state = root[STATE_KEY] || {
    initializedId: "",
    outboundTrackingBound: false,
    consentTrackingBound: false
  };
  root[STATE_KEY] = state;

  function config() {
    return root.ULMOX_WEB_CONFIG || {};
  }

  function measurementId() {
    return String(config().gaMeasurementId || "").trim().toUpperCase();
  }

  function isAutomatedOrLocalEnvironment() {
    var environment = String(config().environment || "").toLowerCase();
    var hostname = root.location && root.location.hostname
      ? String(root.location.hostname).toLowerCase()
      : "";
    var isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    return environment === "test" ||
      Boolean(root.navigator && root.navigator.webdriver) ||
      (isLocalhost && config().allowLocalAnalytics !== true);
  }

  function ensureGtag() {
    root.dataLayer = root.dataLayer || [];
    if (typeof root.gtag !== "function") {
      root.gtag = function gtag() {
        root.dataLayer.push(arguments);
      };
    }
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
      script.onerror = function () {
        state.scriptLoadFailed = true;
      };
      root.document.head.appendChild(script);
    } catch (_) {
      state.scriptLoadFailed = true;
    }
  }

  function currentPagePath() {
    return root.location && root.location.pathname
      ? String(root.location.pathname)
      : "/";
  }

  function bindConsentUpdates() {
    if (state.consentTrackingBound || !root.document.addEventListener) return;
    state.consentTrackingBound = true;
    root.document.addEventListener("ulmox:analytics-consent", function (event) {
      var detail = event && event.detail ? event.detail : {};
      updateConsent(detail.analyticsGranted === true);
    });
  }

  function applyConsentDefaults(gtag) {
    var defaultConsent = String(root.ULMOX_ANALYTICS_CONSENT || "").toLowerCase();
    var consent = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    };
    if (defaultConsent === "granted" || defaultConsent === "denied") {
      consent.analytics_storage = defaultConsent;
    }
    gtag("consent", "default", consent);
  }

  function initialize() {
    try {
      var id = measurementId();
      if (!MEASUREMENT_ID_PATTERN.test(id) || isAutomatedOrLocalEnvironment()) {
        return false;
      }
      if (state.initializedId === id) return true;
      if (state.initializedId) return false;

      var gtag = ensureGtag();
      applyConsentDefaults(gtag);
      gtag("js", new Date());
      gtag("config", id, {
        send_page_view: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        transport_type: "beacon"
      });
      state.initializedId = id;
      injectGtagScript(id);
      bindOutboundTracking();
      bindConsentUpdates();
      return true;
    } catch (_) {
      return false;
    }
  }

  function trackEvent(name, parameters) {
    try {
      if (!/^[a-z][a-z0-9_]{0,39}$/.test(String(name || ""))) return false;
      if (!state.initializedId && !initialize()) return false;
      ensureGtag()("event", name, parameters || {});
      return true;
    } catch (_) {
      return false;
    }
  }

  function trackPageView(path, title) {
    return trackEvent("page_view", {
      page_path: path || currentPagePath(),
      page_title: title || (root.document && root.document.title) || ""
    });
  }

  function trackStoreClick(options) {
    var input = options || {};
    var platform = input.platform === "ios" ? "ios" : "android";
    var store = platform === "ios" ? "app_store" : "google_play";
    var parameters = {
      platform: platform,
      destination: store,
      store: store,
      page_path: input.pagePath || currentPagePath(),
      button_location: input.buttonLocation || "store_link"
    };
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
    } catch (_) {
      return "";
    }
    return "";
  }

  function inferButtonLocation(link) {
    if (link.dataset && link.dataset.analyticsLocation) {
      return link.dataset.analyticsLocation;
    }
    if (link.id === "appStoreLink" || link.id === "playStoreLink") {
      return "smart_download_store_buttons";
    }
    if (link.id === "fallbackButton") return "smart_download_fallback";
    if (link.closest && link.closest(".store-badges")) return "homepage_store_badges";
    if (link.closest && link.closest(".store-actions")) return "download_store_buttons";
    return "outbound_store_link";
  }

  function handleOutboundClick(event) {
    var target = event && event.target;
    var link = target && target.closest ? target.closest("a[href]") : null;
    if (!link) return false;

    var href = link.href || (link.getAttribute && link.getAttribute("href")) || "";
    var platform = classifyStoreUrl(href);
    if (!platform) return false;
    trackStoreClick({
      platform: platform,
      linkUrl: href,
      buttonLocation: inferButtonLocation(link)
    });
    return true;
  }

  function bindOutboundTracking() {
    if (state.outboundTrackingBound || !root.document.addEventListener) return;
    state.outboundTrackingBound = true;
    root.document.addEventListener("click", handleOutboundClick, false);
  }

  function updateConsent(analyticsGranted) {
    try {
      if (!state.initializedId && !initialize()) return false;
      ensureGtag()("consent", "update", {
        analytics_storage: analyticsGranted ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  return {
    initialize: initialize,
    trackEvent: trackEvent,
    trackPageView: trackPageView,
    trackStoreClick: trackStoreClick,
    updateConsent: updateConsent,
    classifyStoreUrl: classifyStoreUrl,
    handleOutboundClick: handleOutboundClick
  };
});
