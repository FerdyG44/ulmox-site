"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { createAnalytics } = require("../assets/js/analytics");

function fakeBrowser({ measurementId = "", environment = "production" } = {}) {
  const scripts = [];
  const listeners = new Map();
  const document = {
    title: "ULMOX",
    head: {
      appendChild(script) {
        scripts.push(script);
      }
    },
    createElement() {
      return {
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        }
      };
    },
    querySelector(selector) {
      const match = selector.match(/data-ulmox-ga4="([^"]+)"/);
      return scripts.find((script) =>
        match && script.attributes["data-ulmox-ga4"] === match[1]
      ) || null;
    },
    addEventListener(name, callback) {
      const callbacks = listeners.get(name) || [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    }
  };
  const root = {
    document,
    location: {
      href: "https://ulmoxapp.com/tr/?utm_source=tiktok",
      hostname: "ulmoxapp.com",
      pathname: "/tr/"
    },
    navigator: { webdriver: false },
    ULMOX_WEB_CONFIG: { gaMeasurementId: measurementId, environment }
  };
  return { root, scripts, listeners };
}

function commands(root) {
  return (root.dataLayer || []).map((entry) => Array.from(entry));
}

test("website remains operational without a Measurement ID", () => {
  const browser = fakeBrowser();
  const analytics = createAnalytics(browser.root);

  assert.equal(analytics.initialize(), false);
  assert.equal(browser.scripts.length, 0);
  assert.equal(browser.root.dataLayer, undefined);
});

test("GA4 initialization and global click binding are not duplicated", () => {
  const browser = fakeBrowser({ measurementId: "G-TEST12345" });
  const analytics = createAnalytics(browser.root);

  assert.equal(analytics.initialize(), true);
  assert.equal(analytics.initialize(), true);
  assert.equal(browser.scripts.length, 1);
  assert.equal(browser.listeners.get("click").length, 1);
  assert.equal(
    commands(browser.root).filter((command) => command[0] === "config").length,
    1
  );
});

test("automated test environments never load Google Analytics", () => {
  const browser = fakeBrowser({
    measurementId: "G-TEST12345",
    environment: "test"
  });
  const analytics = createAnalytics(browser.root);

  assert.equal(analytics.initialize(), false);
  assert.equal(browser.scripts.length, 0);
});

test("App Store tracking sends platform and common download events", () => {
  const browser = fakeBrowser({ measurementId: "G-TEST12345" });
  const analytics = createAnalytics(browser.root);
  analytics.initialize();
  analytics.trackStoreClick({
    platform: "ios",
    linkUrl: "https://apps.apple.com/se/app/ulmox/id6765990174",
    buttonLocation: "homepage_store_badges"
  });

  const events = commands(browser.root).filter((command) => command[0] === "event");
  assert.deepEqual(events.map((event) => event[1]), ["app_store_click", "download_click"]);
  assert.equal(events[0][2].platform, "ios");
  assert.equal(events[0][2].destination, "app_store");
  assert.equal(events[0][2].page_path, "/tr/");
});

test("Google Play tracking sends platform and common download events", () => {
  const browser = fakeBrowser({ measurementId: "G-TEST12345" });
  const analytics = createAnalytics(browser.root);
  analytics.initialize();
  analytics.trackStoreClick({
    platform: "android",
    linkUrl: "https://play.google.com/store/apps/details?id=com.ulmox.app",
    buttonLocation: "homepage_store_badges"
  });

  const events = commands(browser.root).filter((command) => command[0] === "event");
  assert.deepEqual(events.map((event) => event[1]), ["google_play_click", "download_click"]);
  assert.equal(events[0][2].platform, "android");
  assert.equal(events[0][2].destination, "google_play");
});

test("outbound click tracking never prevents existing store navigation", () => {
  const browser = fakeBrowser({ measurementId: "G-TEST12345" });
  const analytics = createAnalytics(browser.root);
  analytics.initialize();
  const link = {
    id: "",
    href: "https://apps.apple.com/se/app/ulmox/id6765990174",
    dataset: {},
    closest(selector) {
      return selector === ".store-badges" ? {} : null;
    }
  };
  let prevented = false;
  const tracked = analytics.handleOutboundClick({
    target: {
      closest(selector) {
        return selector === "a[href]" ? link : null;
      }
    },
    preventDefault() {
      prevented = true;
    }
  });

  assert.equal(tracked, true);
  assert.equal(prevented, false);
  assert.equal(link.href, "https://apps.apple.com/se/app/ulmox/id6765990174");
});
