(function () {
  "use strict";

  const APP_STORE_URL = "https://apps.apple.com/se/app/ulmox/id6765990174?l=en-GB";
  const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.ulmox.app&pcampaignid=web_share";

  const TRACKING_KEYS = ["source", "utm_source", "utm_medium", "utm_campaign", "campaign"];
  const REDIRECT_STORAGE_KEY = "ulmoxDownloadRedirect";
  const ATTRIBUTION_STORAGE_KEY = "ulmoxDownloadAttribution";

  const loadingState = document.getElementById("loadingState");
  const downloadState = document.getElementById("downloadState");
  const loadingMessage = document.getElementById("loadingMessage");
  const fallbackButton = document.getElementById("fallbackButton");
  const appStoreLink = document.getElementById("appStoreLink");
  const playStoreLink = document.getElementById("playStoreLink");

  appStoreLink.href = APP_STORE_URL;
  playStoreLink.href = PLAY_STORE_URL;

  function saveAttribution() {
    try {
      const params = new URLSearchParams(window.location.search);
      const attribution = {};
      TRACKING_KEYS.forEach(function (key) {
        const value = params.get(key);
        if (value) attribution[key] = value.slice(0, 160);
      });
      if (Object.keys(attribution).length > 0) {
        localStorage.setItem(
          ATTRIBUTION_STORAGE_KEY,
          JSON.stringify({
            ...attribution,
            capturedAt: new Date().toISOString(),
            path: window.location.pathname,
          }),
        );
      }
    } catch (_) {
      /* localStorage may be blocked in private or embedded browsers. */
    }
  }

  function isProbablyBot() {
    const ua = navigator.userAgent || "";
    return /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|slackbot|discordbot|linkedinbot|whatsapp/i.test(
      ua,
    );
  }

  function detectPlatform() {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isModernIPadOS =
      /Macintosh/i.test(ua) && /Mac/i.test(platform) && maxTouchPoints > 1;

    if (isProbablyBot()) return "desktop";
    if (isIOS || isModernIPadOS) return "ios";
    if (isAndroid) return "android";
    return "desktop";
  }

  function recentlyRedirected(platform) {
    try {
      const raw = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      return saved.platform === platform && Date.now() - saved.at < 2500;
    } catch (_) {
      return false;
    }
  }

  function markRedirect(platform) {
    try {
      sessionStorage.setItem(
        REDIRECT_STORAGE_KEY,
        JSON.stringify({ platform: platform, at: Date.now() }),
      );
    } catch (_) {
      /* sessionStorage may be blocked. Redirect should still proceed. */
    }
  }

  function showDesktop() {
    document.body.classList.remove("is-loading");
    loadingState.classList.add("hidden");
    downloadState.classList.remove("hidden");
  }

  function redirectToStore(platform, url, label) {
    loadingMessage.textContent = label;
    fallbackButton.textContent = label.replace("Opening", "Open");
    fallbackButton.href = url;
    fallbackButton.classList.remove("hidden");

    if (recentlyRedirected(platform)) return;
    markRedirect(platform);

    window.setTimeout(function () {
      window.location.replace(url);
    }, 120);
  }

  saveAttribution();

  const platform = detectPlatform();
  if (platform === "ios") {
    redirectToStore("ios", APP_STORE_URL, "Opening App Store...");
  } else if (platform === "android") {
    redirectToStore("android", PLAY_STORE_URL, "Opening Google Play...");
  } else {
    showDesktop();
  }
})();
