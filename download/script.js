(function () {
  "use strict";

  const APP_STORE_URL = "https://apps.apple.com/app/id6765990174";
  const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.ulmox.app";

  const TRACKING_KEYS = [
    "source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "campaign",
  ];

  const REDIRECT_STORAGE_KEY = "ulmoxDownloadRedirect";
  const ATTRIBUTION_STORAGE_KEY = "ulmoxDownloadAttribution";

  function initializeDownloadPage() {
    const loadingState = document.getElementById("loadingState");
    const downloadState = document.getElementById("downloadState");
    const loadingMessage = document.getElementById("loadingMessage");
    const fallbackButton = document.getElementById("fallbackButton");
    const appStoreLink = document.getElementById("appStoreLink");
    const playStoreLink = document.getElementById("playStoreLink");

    /*
     * Direct href values are essential.
     * Instagram, Facebook and TikTok in-app browsers may block
     * JavaScript redirects, but a genuine anchor tap can still work.
     */
    if (appStoreLink) {
      appStoreLink.setAttribute("href", APP_STORE_URL);
      appStoreLink.setAttribute("target", "_self");
      appStoreLink.setAttribute("rel", "noopener noreferrer");
    }

    if (playStoreLink) {
      playStoreLink.setAttribute("href", PLAY_STORE_URL);
      playStoreLink.setAttribute("target", "_self");
      playStoreLink.setAttribute("rel", "noopener noreferrer");
    }

    if (fallbackButton) {
      fallbackButton.setAttribute("target", "_self");
      fallbackButton.setAttribute("rel", "noopener noreferrer");
    }

    function saveAttribution() {
      try {
        const params = new URLSearchParams(window.location.search);
        const attribution = {};

        TRACKING_KEYS.forEach(function (key) {
          const value = params.get(key);
          if (value) {
            attribution[key] = value.slice(0, 160);
          }
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
        // Storage may be unavailable in embedded or private browsers.
      }
    }

    function isProbablyBot() {
      const userAgent = navigator.userAgent || "";

      return /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|slackbot|discordbot|linkedinbot|whatsapp/i.test(
        userAgent,
      );
    }

    function detectPlatform() {
      const userAgent = navigator.userAgent || "";
      const platformName = navigator.platform || "";
      const maxTouchPoints = navigator.maxTouchPoints || 0;

      const isAndroid = /Android/i.test(userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

      const isModernIPadOS =
        /Macintosh/i.test(userAgent) &&
        /Mac/i.test(platformName) &&
        maxTouchPoints > 1;

      if (isProbablyBot()) return "desktop";
      if (isIOS || isModernIPadOS) return "ios";
      if (isAndroid) return "android";

      return "desktop";
    }

    function recentlyRedirected(platformName) {
      try {
        const rawValue = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
        if (!rawValue) return false;

        const savedValue = JSON.parse(rawValue);

        return (
          savedValue.platform === platformName &&
          Date.now() - savedValue.at < 3000
        );
      } catch (_) {
        return false;
      }
    }

    function markRedirect(platformName) {
      try {
        sessionStorage.setItem(
          REDIRECT_STORAGE_KEY,
          JSON.stringify({
            platform: platformName,
            at: Date.now(),
          }),
        );
      } catch (_) {
        // Redirect must continue even if sessionStorage is unavailable.
      }
    }

    function showDownloadOptions() {
      document.body.classList.remove("is-loading");

      if (loadingState) {
        loadingState.classList.add("hidden");
      }

      if (downloadState) {
        downloadState.classList.remove("hidden");
      }
    }

    function configureFallbackButton(url, label) {
      if (!fallbackButton) return;

      fallbackButton.textContent = label;
      fallbackButton.setAttribute("href", url);
      fallbackButton.classList.remove("hidden");

      /*
       * Do not use preventDefault here.
       * The browser must be allowed to follow the real anchor URL.
       */
      fallbackButton.onclick = null;
    }

    function attemptRedirect(platformName, url, openingLabel, buttonLabel) {
      if (loadingMessage) {
        loadingMessage.textContent = openingLabel;
      }

      configureFallbackButton(url, buttonLabel);

      if (recentlyRedirected(platformName)) {
        showDownloadOptions();
        return;
      }

      markRedirect(platformName);

      /*
       * location.assign is generally less problematic than window.open.
       * Some embedded browsers may still block the automatic redirect,
       * so the visible direct link remains available.
       */
      window.setTimeout(function () {
        try {
          window.location.assign(url);
        } catch (_) {
          showDownloadOptions();
        }
      }, 250);

      /*
       * If the embedded browser refuses the automatic redirect,
       * reveal the direct store buttons instead of leaving a spinner.
       */
      window.setTimeout(function () {
        showDownloadOptions();
      }, 1600);
    }

    saveAttribution();

    const detectedPlatform = detectPlatform();

    if (detectedPlatform === "ios") {
      attemptRedirect(
        "ios",
        APP_STORE_URL,
        "Opening App Store...",
        "Open App Store",
      );
      return;
    }

    if (detectedPlatform === "android") {
      attemptRedirect(
        "android",
        PLAY_STORE_URL,
        "Opening Google Play...",
        "Open Google Play",
      );
      return;
    }

    showDownloadOptions();
  }

  /*
   * Prevent null-element errors when this script is loaded in <head>
   * without the defer attribute.
   */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDownloadPage);
  } else {
    initializeDownloadPage();
  }
})();
