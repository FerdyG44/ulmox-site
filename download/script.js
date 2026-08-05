(function () {
  "use strict";

  const APP_STORE_URL =
    "https://apps.apple.com/se/app/ulmox/id6765990174?l=en-GB";

  const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.ulmox.app&pcampaignid=web_share";

  const TRACKING_KEYS = [
    "source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "campaign",
  ];

  const REDIRECT_STORAGE_KEY =
    "ulmoxDownloadRedirect";

  const ATTRIBUTION_STORAGE_KEY =
    "ulmoxDownloadAttribution";

  function initializeDownloadPage() {
    const loadingState =
      document.getElementById("loadingState");

    const downloadState =
      document.getElementById("downloadState");

    const loadingMessage =
      document.getElementById("loadingMessage");

    const fallbackButton =
      document.getElementById("fallbackButton");

    const appStoreLink =
      document.getElementById("appStoreLink");

    const playStoreLink =
      document.getElementById("playStoreLink");

    const instagramHelp =
      document.getElementById("instagramHelp");

    /*
     * Keep genuine HTTPS store links in the HTML and JavaScript.
     * Do not use window.open, preventDefault or custom URL schemes.
     */
    if (appStoreLink) {
      appStoreLink.setAttribute(
        "href",
        APP_STORE_URL,
      );

      appStoreLink.setAttribute(
        "rel",
        "noopener noreferrer",
      );
    }

    if (playStoreLink) {
      playStoreLink.setAttribute(
        "href",
        PLAY_STORE_URL,
      );

      playStoreLink.setAttribute(
        "rel",
        "noopener noreferrer",
      );
    }

    if (fallbackButton) {
      fallbackButton.setAttribute(
        "rel",
        "noopener noreferrer",
      );
    }

    function saveAttribution() {
      try {
        const params =
          new URLSearchParams(window.location.search);

        const attribution = {};

        TRACKING_KEYS.forEach(function (key) {
          const value = params.get(key);

          if (value) {
            attribution[key] =
              value.slice(0, 160);
          }
        });

        if (Object.keys(attribution).length > 0) {
          localStorage.setItem(
            ATTRIBUTION_STORAGE_KEY,
            JSON.stringify({
              ...attribution,
              capturedAt:
                new Date().toISOString(),
              path:
                window.location.pathname,
            }),
          );
        }
      } catch (_) {
        /*
         * Storage may be blocked in private
         * or embedded browsers.
         */
      }
    }

    function isProbablyBot() {
      const userAgent =
        navigator.userAgent || "";

      return /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|slackbot|discordbot|linkedinbot|whatsapp/i.test(
        userAgent,
      );
    }

    function isEmbeddedSocialBrowser() {
      const userAgent =
        navigator.userAgent || "";

      return /Instagram|FBAN|FBAV|Facebook|TikTok|Bytedance/i.test(
        userAgent,
      );
    }

    function detectPlatform() {
      const userAgent =
        navigator.userAgent || "";

      const platformName =
        navigator.platform || "";

      const maxTouchPoints =
        navigator.maxTouchPoints || 0;

      const isAndroid =
        /Android/i.test(userAgent);

      const isIOS =
        /iPhone|iPad|iPod/i.test(userAgent);

      const isModernIPadOS =
        /Macintosh/i.test(userAgent) &&
        /Mac/i.test(platformName) &&
        maxTouchPoints > 1;

      if (isProbablyBot()) {
        return "desktop";
      }

      if (isIOS || isModernIPadOS) {
        return "ios";
      }

      if (isAndroid) {
        return "android";
      }

      return "desktop";
    }

    function recentlyRedirected(platformName) {
      try {
        const rawValue =
          sessionStorage.getItem(
            REDIRECT_STORAGE_KEY,
          );

        if (!rawValue) {
          return false;
        }

        const savedValue =
          JSON.parse(rawValue);

        return (
          savedValue.platform ===
            platformName &&
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
        /*
         * Redirect should continue even when
         * sessionStorage is unavailable.
         */
      }
    }

    function showDownloadOptions() {
      document.body.classList.remove(
        "is-loading",
      );

      if (loadingState) {
        loadingState.classList.add(
          "hidden",
        );
      }

      if (downloadState) {
        downloadState.classList.remove(
          "hidden",
        );
      }
    }

    function showInstagramHelp() {
      if (instagramHelp) {
        instagramHelp.classList.remove(
          "hidden",
        );
      }
    }

    function configureFallbackButton(
      url,
      label,
    ) {
      if (!fallbackButton) {
        return;
      }

      fallbackButton.textContent =
        label;

      fallbackButton.setAttribute(
        "href",
        url,
      );

      fallbackButton.classList.remove(
        "hidden",
      );

      /*
       * Do not attach click handlers.
       * Allow the browser to follow the
       * genuine anchor URL.
       */
      fallbackButton.onclick = null;
    }

    function attemptAutomaticRedirect(
      platformName,
      url,
      openingLabel,
      buttonLabel,
    ) {
      if (loadingMessage) {
        loadingMessage.textContent =
          openingLabel;
      }

      configureFallbackButton(
        url,
        buttonLabel,
      );

      if (recentlyRedirected(platformName)) {
        showDownloadOptions();
        return;
      }

      markRedirect(platformName);

      window.setTimeout(function () {
        try {
          window.location.assign(url);
        } catch (_) {
          showDownloadOptions();
        }
      }, 250);

      /*
       * If automatic redirection is blocked,
       * show the direct store buttons.
       */
      window.setTimeout(function () {
        showDownloadOptions();
      }, 1600);
    }

    saveAttribution();

    const detectedPlatform =
      detectPlatform();

    const embeddedSocialBrowser =
      isEmbeddedSocialBrowser();

    /*
     * Instagram/Facebook/TikTok on iOS can
     * block the App Store handoff.
     *
     * Do not redirect users to a white page.
     * Show the download page and Safari
     * instructions immediately.
     */
    if (
      detectedPlatform === "ios" &&
      embeddedSocialBrowser
    ) {
      showDownloadOptions();
      showInstagramHelp();
      return;
    }

    /*
     * Safari and regular iOS browsers:
     * automatically open the App Store.
     */
    if (detectedPlatform === "ios") {
      attemptAutomaticRedirect(
        "ios",
        APP_STORE_URL,
        "Opening App Store...",
        "Open App Store",
      );

      return;
    }

    /*
     * Android browsers:
     * automatically open Google Play.
     */
    if (detectedPlatform === "android") {
      attemptAutomaticRedirect(
        "android",
        PLAY_STORE_URL,
        "Opening Google Play...",
        "Open Google Play",
      );

      return;
    }

    /*
     * Desktop and unsupported platforms:
     * display both store options.
     */
    showDownloadOptions();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeDownloadPage,
    );
  } else {
    initializeDownloadPage();
  }
})();
