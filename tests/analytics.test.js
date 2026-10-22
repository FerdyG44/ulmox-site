"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const COPY = require("../assets/js/analytics-consent-copy");
const { createAnalytics } = require("../assets/js/analytics");

const CONSENT_KEY = "ulmox.analytics.consent.v1";

function fakeBrowser({
  measurementId = "G-TEST12345",
  environment = "production",
  consent,
  storage = {},
  session = {},
  getStorageError = false,
  setStorageError = false,
  removeStorageError = false,
  sessionStorageError = false,
  webdriver = false,
  pathname = "/tr/"
} = {}) {
  const scripts = [];
  const networkRequests = [];
  const listeners = new Map();
  const elements = new Map();
  const cookieWrites = [];
  const cookies = new Map([["_ga", "GA1.1.123"], ["_ga_TEST12345", "GS1.1.456"], ["unrelated", "keep"]]);
  let reloads = 0;
  if (consent !== undefined) storage[CONSENT_KEY] = consent;

  function register(node) {
    if (node.id) elements.set(node.id, node);
    node.children.forEach(register);
  }

  function element(tag) {
    const node = {
      tagName: tag.toUpperCase(), attributes: {}, children: [], hidden: false,
      dataset: {}, parentNode: null, textContent: "", className: "", id: "",
      setAttribute(name, value) {
        this.attributes[name] = String(value);
        if (name === "data-consent") this.dataset.consent = String(value);
      },
      appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        register(child);
        return child;
      },
      removeChild(child) {
        this.children = this.children.filter((item) => item !== child);
        if (child.tagName === "SCRIPT") scripts.splice(scripts.indexOf(child), 1);
      },
      addEventListener(name, callback) { this[`on${name}`] = callback; },
      click() { if (this.onclick) this.onclick({ target: this }); },
      focus() { this.focused = true; },
      closest() { return null; },
      querySelector(selector) {
        if (selector === "button[data-consent]") {
          return this.children.flatMap((child) => child.children || [])
            .flatMap((child) => child.children || [])
            .find((child) => child.tagName === "BUTTON" && child.dataset.consent) || null;
        }
        return null;
      }
    };
    return node;
  }

  const head = element("head");
  const body = element("body");
  const originalHeadAppend = head.appendChild;
  head.appendChild = function appendToHead(child) {
    originalHeadAppend.call(this, child);
    if (child.tagName === "SCRIPT") {
      scripts.push(child);
      if (/googletagmanager\.com/.test(child.src || "")) networkRequests.push(child.src);
    }
    return child;
  };

  const document = {
    title: "ULMOX",
    documentElement: { lang: pathname.split("/").filter(Boolean)[0] || "en" },
    head,
    body,
    createElement: element,
    getElementById(id) { return elements.get(id) || null; },
    querySelector(selector) {
      if (selector === "script[data-ulmox-ga4]") return scripts[0] || null;
      const match = selector.match(/data-ulmox-ga4="([^"]+)"/);
      return scripts.find((script) => match && script.attributes["data-ulmox-ga4"] === match[1]) || null;
    },
    addEventListener(name, callback) {
      const callbacks = listeners.get(name) || [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    }
  };
  Object.defineProperty(document, "cookie", {
    get() { return Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; "); },
    set(value) {
      cookieWrites.push(value);
      const pair = value.split(";", 1)[0];
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator);
      const cookieValue = pair.slice(separator + 1);
      if (/Max-Age=0/i.test(value)) cookies.delete(name);
      else cookies.set(name, cookieValue);
    }
  });

  const localStorage = {
    getItem(key) { if (getStorageError) throw new Error("getItem blocked"); return storage[key] ?? null; },
    setItem(key, value) { if (setStorageError) throw new Error("QuotaExceededError"); storage[key] = String(value); },
    removeItem(key) { if (removeStorageError) throw new Error("removeItem blocked"); delete storage[key]; }
  };
  const sessionStorage = {
    getItem(key) { if (sessionStorageError) throw new Error("session getItem blocked"); return session[key] ?? null; },
    setItem(key, value) { if (sessionStorageError) throw new Error("session setItem blocked"); session[key] = String(value); },
    removeItem(key) { if (sessionStorageError) throw new Error("session removeItem blocked"); delete session[key]; }
  };
  const root = {
    document,
    localStorage,
    sessionStorage,
    location: {
      href: `https://ulmoxapp.com${pathname}`,
      hostname: "ulmoxapp.com",
      pathname,
      reload() { reloads += 1; }
    },
    navigator: {
      webdriver,
      sendBeacon(url) { networkRequests.push(String(url)); return true; }
    },
    fetch(url) { networkRequests.push(String(url)); return Promise.resolve({ ok: true }); },
    ULMOX_ANALYTICS_COPY: COPY,
    ULMOX_WEB_CONFIG: { gaMeasurementId: measurementId, environment }
  };
  return { root, document, scripts, networkRequests, listeners, elements, storage, session, cookieWrites, reloads: () => reloads };
}

function commands(root) {
  return (root.dataLayer || []).map((entry) => Array.from(entry));
}

test("first visit presents equal choices without creating a GA queue or request", () => {
  const browser = fakeBrowser();
  const analytics = createAnalytics(browser.root);
  assert.equal(analytics.initialize(), false);
  assert.equal(browser.root.dataLayer, undefined);
  assert.deepEqual(browser.networkRequests, []);
  const panel = browser.elements.get("ulmox-analytics-consent");
  const actions = panel.children[0].children[2];
  assert.equal(panel.hidden, false);
  assert.equal(actions.children.length, 2);
  assert.equal(actions.children[0].className, actions.children[1].className);
  assert.ok(browser.elements.get("ulmox-privacy-control"));
});

test("explicit rejection persists and never opens a Google request path", () => {
  const browser = fakeBrowser();
  const analytics = createAnalytics(browser.root);
  analytics.initialize();
  assert.equal(analytics.setConsent("denied"), true);
  assert.equal(browser.storage[CONSENT_KEY], "denied");
  assert.equal(browser.root.dataLayer, undefined);
  assert.deepEqual(browser.networkRequests, []);
  const reloaded = fakeBrowser({ storage: browser.storage });
  assert.equal(createAnalytics(reloaded.root).initialize(), false);
  assert.equal(reloaded.elements.get("ulmox-analytics-consent").hidden, true);
  assert.deepEqual(reloaded.networkRequests, []);
});

test("explicit acceptance enters the real loader path with ads features denied", () => {
  const browser = fakeBrowser();
  const analytics = createAnalytics(browser.root);
  analytics.initialize();
  assert.equal(analytics.setConsent("granted"), true);
  assert.equal(browser.storage[CONSENT_KEY], "granted");
  assert.deepEqual(browser.networkRequests, ["https://www.googletagmanager.com/gtag/js?id=G-TEST12345"]);
  const queued = commands(browser.root);
  const defaults = queued.find((command) => command[0] === "consent" && command[1] === "default")[2];
  const update = queued.find((command) => command[0] === "consent" && command[1] === "update")[2];
  const config = queued.find((command) => command[0] === "config")[2];
  assert.deepEqual(defaults, { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  assert.equal(update.analytics_storage, "granted");
  assert.equal(update.ad_storage, "denied");
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(analytics.setConsent("granted"), true);
  assert.equal(browser.networkRequests.length, 1);
  assert.equal(browser.listeners.get("click").length, 1);
});

test("withdrawing consent disables loaded GA, clears cookies and reloads", () => {
  const browser = fakeBrowser({ consent: "granted" });
  const analytics = createAnalytics(browser.root);
  assert.equal(analytics.initialize(), true);
  assert.equal(analytics.trackEvent("before_revoke"), true);
  assert.equal(analytics.setConsent("denied"), true);
  assert.equal(browser.root["ga-disable-G-TEST12345"], true);
  assert.equal(browser.storage[CONSENT_KEY], "denied");
  assert.equal(browser.reloads(), 1);
  assert.equal(browser.scripts.length, 0);
  assert.equal(browser.root.dataLayer.length, 0);
  assert.equal(analytics.trackEvent("after_revoke"), false);
  assert.ok(browser.cookieWrites.some((value) => value.startsWith("_ga=")));
  assert.ok(browser.cookieWrites.some((value) => value.startsWith("_ga_TEST12345=")));
  assert.ok(!browser.cookieWrites.some((value) => value.startsWith("unrelated=")));
});

test("accept then reject then accept again loads GA from a fresh denied page", () => {
  const storage = {};
  const first = fakeBrowser({ storage });
  const firstAnalytics = createAnalytics(first.root);
  firstAnalytics.initialize();
  firstAnalytics.setConsent("granted");
  firstAnalytics.setConsent("denied");
  assert.equal(storage[CONSENT_KEY], "denied");

  const next = fakeBrowser({ storage });
  const nextAnalytics = createAnalytics(next.root);
  assert.equal(nextAnalytics.initialize(), false);
  assert.equal(nextAnalytics.setConsent("granted"), true);
  assert.deepEqual(next.networkRequests, ["https://www.googletagmanager.com/gtag/js?id=G-TEST12345"]);
  assert.equal(next.root["ga-disable-G-TEST12345"], false);
});

test("missing, malformed and unreadable preferences fail closed", () => {
  for (const browser of [
    fakeBrowser(),
    fakeBrowser({ consent: "maybe" }),
    fakeBrowser({ getStorageError: true })
  ]) {
    assert.equal(createAnalytics(browser.root).initialize(), false);
    assert.equal(browser.root.dataLayer, undefined);
    assert.deepEqual(browser.networkRequests, []);
  }
});

test("a choice still works for the current page when storage is unavailable", () => {
  const browser = fakeBrowser({ getStorageError: true, setStorageError: true, removeStorageError: true, sessionStorageError: true });
  const analytics = createAnalytics(browser.root);
  analytics.initialize();
  assert.equal(analytics.setConsent("granted"), true);
  assert.equal(browser.networkRequests.length, 1);
  assert.equal(analytics.trackEvent("storage_blocked_accept"), true);
  assert.equal(analytics.setConsent("denied"), true);
  assert.equal(analytics.trackEvent("storage_blocked_denied"), false);
});

test("a getItem failure ignores an old grant while a new explicit choice still works", () => {
  const storage = { [CONSENT_KEY]: "granted" };
  const browser = fakeBrowser({ storage, getStorageError: true });
  const analytics = createAnalytics(browser.root);
  assert.equal(analytics.initialize(), false);
  assert.deepEqual(browser.networkRequests, []);
  assert.equal(analytics.setConsent("granted"), true);
  assert.equal(browser.networkRequests.length, 1);
});

test("failed denial write cannot reactivate a stale grant after reload and reaccept", () => {
  const storage = { [CONSENT_KEY]: "granted" };
  const session = {};
  const first = fakeBrowser({ storage, session, setStorageError: true });
  const analytics = createAnalytics(first.root);
  assert.equal(analytics.initialize(), true);
  assert.equal(analytics.setConsent("denied"), true);
  assert.equal(first.reloads(), 1);
  assert.equal(storage[CONSENT_KEY], undefined);

  const reloaded = fakeBrowser({ storage, session });
  const reloadedAnalytics = createAnalytics(reloaded.root);
  assert.equal(reloadedAnalytics.initialize(), false);
  assert.deepEqual(reloaded.networkRequests, []);
  assert.equal(reloadedAnalytics.setConsent("granted"), true);
  assert.equal(storage[CONSENT_KEY], "granted");
  assert.equal(session["ulmox.analytics.revoked.v1"], undefined);
  assert.equal(reloaded.networkRequests.length, 1);
});

test("revocation marker fails closed when denial write and stale-grant removal both fail", () => {
  const storage = { [CONSENT_KEY]: "granted" };
  const session = {};
  const first = fakeBrowser({ storage, session, setStorageError: true, removeStorageError: true });
  const analytics = createAnalytics(first.root);
  assert.equal(analytics.initialize(), true);
  assert.equal(analytics.setConsent("denied"), true);
  assert.equal(storage[CONSENT_KEY], "granted");
  assert.equal(first.reloads(), 1);

  const reloaded = fakeBrowser({ storage, session });
  assert.equal(createAnalytics(reloaded.root).initialize(), false);
  assert.deepEqual(reloaded.networkRequests, []);
});

test("test, webdriver and localhost guards do not substitute for consent-path coverage", () => {
  for (const browser of [
    fakeBrowser({ consent: "granted", environment: "test" }),
    fakeBrowser({ consent: "granted", webdriver: true }),
    (() => { const value = fakeBrowser({ consent: "granted" }); value.root.location.hostname = "localhost"; return value; })()
  ]) {
    assert.equal(createAnalytics(browser.root).initialize(), false);
    assert.deepEqual(browser.networkRequests, []);
  }
});

test("saved acceptance survives navigation and store events keep their contract", () => {
  const storage = { [CONSENT_KEY]: "granted" };
  const browser = fakeBrowser({ storage, pathname: "/sv/" });
  const analytics = createAnalytics(browser.root);
  assert.equal(analytics.initialize(), true);
  analytics.trackStoreClick({ platform: "ios", linkUrl: "https://apps.apple.com/se/app/ulmox/id6765990174", buttonLocation: "homepage_store_badges" });
  const events = commands(browser.root).filter((command) => command[0] === "event");
  assert.deepEqual(events.map((event) => event[1]), ["app_store_click", "download_click"]);
  assert.equal(events[0][2].page_path, "/sv/");
  assert.equal(browser.elements.get("ulmox-analytics-consent").hidden, true);
});
