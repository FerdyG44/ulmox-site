"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOCALES = "en sv tr de es fr it pt nl pl fi ru ja ko zh ar hi th vi".split(
  " "
);
const LEGAL_PAGES = [
  "delete_account.html",
  "privacy.html",
  "terms.html",
  "safety.html",
  "support.html",
  "translation.html",
];

const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8");

const pages = Object.fromEntries(
  LEGAL_PAGES.map((file) => [file, read(file)])
);

/* -------------------------------------------------------------------------- */
/* Account deletion route                                                     */
/* -------------------------------------------------------------------------- */

test("the account deletion page exists and identifies ULMOX", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /ULMOX/);
  assert.match(html, /<title>Delete Your ULMOX Account<\/title>/);
});

test("the deletion page offers both an in-app and a web request path", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /Account Management/);
  assert.match(html, /Delete Account/);
  assert.match(
    html,
    /mailto:ulmoxapp@outlook\.com\?subject=ULMOX%20Account%20Deletion%20Request/
  );
});

test("the deletion page distinguishes deactivation from deletion", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /Deactivating is not deleting/);
  assert.match(html, /permanent and cannot be undone/);
  // It must never suggest deactivation satisfies a deletion request.
  assert.match(html, /Deactivation\s+does not satisfy a deletion request/);
});

test("the deletion page never asks for a credential or a document", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /never ask you for a password/);
  assert.match(html, /photograph of an identity\s+document/);
  // It asks only for the minimum identifying information.
  assert.match(html, /email address associated with your ULMOX account/);
});

test("the deletion page states verification precedes manual deletion", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /verify that you own the account/);
  assert.match(html, /does not delete an account by\s+itself/);
});

test("the deletion page describes the implemented deletion lifecycle", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /targeted for completion within 30 days/);
  assert.match(html, /held for 90 days after deletion/);
  // Someone else's content is not deleted just because the user shared it.
  assert.match(html, /Content owned by someone else is <em>not<\/em> deleted/);
});

test("the /delete-account/ route is a real redirect, not an empty file", () => {
  for (const dir of ["delete-account", ...LOCALES.map((l) => `${l}/delete-account`)]) {
    const html = read(`${dir}/index.html`);
    assert.ok(html.length > 200, `${dir} is still a stub`);
    assert.match(html, /delete_account\.html/);
    assert.match(html, /<html lang="[a-z]{2}"( dir="rtl")?>/);
  }
});

/* -------------------------------------------------------------------------- */
/* Navigation and cross-linking                                               */
/* -------------------------------------------------------------------------- */

test("every footer links to the deletion page", () => {
  for (const file of ["index.html", ...LOCALES.map((l) => `${l}/index.html`)]) {
    assert.match(read(file), /href="delete_account\.html"/, `${file} footer`);
  }
});

test("the legal pages cross-link to each other", () => {
  for (const [file, html] of Object.entries(pages)) {
    for (const target of LEGAL_PAGES) {
      if (target === file) continue;
      assert.match(html, new RegExp(`href="${target}"`), `${file} -> ${target}`);
    }
  }
});

test("the privacy page links to deletion", () => {
  assert.match(pages["privacy.html"], /href="delete_account\.html"/);
});

test("the sitemap includes the deletion page for every locale", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /https:\/\/ulmoxapp\.com\/delete_account\.html/);
  for (const locale of LOCALES) {
    assert.match(
      sitemap,
      new RegExp(`https://ulmoxapp\\.com/${locale}/delete_account\\.html`),
      `sitemap missing ${locale}`
    );
  }
});

test("no internal link is broken", () => {
  const htmlFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "dist" || entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) htmlFiles.push(full);
    }
  };
  walk(ROOT);

  const broken = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(/href="([^"#]+)"/g)) {
      // Strip a cache-busting query string before resolving the file.
      const href = match[1].split("?")[0];
      if (!href || /^(https?:|mailto:|tel:)/.test(href)) continue;

      const target = href.startsWith("/")
        ? path.join(ROOT, href.slice(1))
        : path.resolve(path.dirname(file), href);
      const resolved = href.endsWith("/") ? path.join(target, "index.html") : target;

      if (!fs.existsSync(resolved)) {
        broken.push(`${path.relative(ROOT, file)} -> ${href}`);
      }
    }
  }
  assert.deepEqual(broken, []);
});

/* -------------------------------------------------------------------------- */
/* Child safety standards                                                     */
/* -------------------------------------------------------------------------- */

test("the safety page publishes the approved role-based contact", () => {
  const html = pages["safety.html"];
  assert.match(html, /ULMOX Child Safety Contact/);
  assert.match(html, /ulmoxapp@outlook\.com/);
  // The individual's name belongs in the Play Console, not the public page.
  assert.doesNotMatch(html, /Ferdi/);
});

test("the safety page states the 18+ standard and zero tolerance", () => {
  const html = pages["safety.html"];
  assert.match(html, /18 or older/);
  assert.match(html, /zero tolerance/i);
  assert.match(html, /CSAE/);
  assert.match(html, /CSAM/);
});

test("the safety page describes reporting, blocking and human review", () => {
  const html = pages["safety.html"];
  assert.match(html, /Report Content/);
  assert.match(html, /Report User/);
  assert.match(html, /Child Safety<\/strong> category/);
  assert.match(html, /block a user/);
  assert.match(html, /highest priority/i);
  assert.match(html, /authorised ULMOX administrator/);
});

test("the 24-hour wording is a review target, not guaranteed resolution", () => {
  for (const file of ["safety.html", "support.html"]) {
    const html = pages[file];
    assert.match(html, /within 24\s*\n?\s*hours/);
    assert.match(html, /not a\s*\n?\s*guarantee|not a guarantee/);
    assert.doesNotMatch(html, /resolved within 24 hours\./);
  }
});

test("the safety page advises contacting emergency services", () => {
  assert.match(pages["safety.html"], /local emergency\s*\n?\s*services/);
});

/* -------------------------------------------------------------------------- */
/* Accuracy guard — claims that must never appear                             */
/* -------------------------------------------------------------------------- */

const FORBIDDEN = [
  [/automatically scan|automated (video )?scanning|scans? (your )?videos? automatically/i,
    "claims automated video scanning"],
  [/automatically ban|automatic(ally)? banned|auto-ban/i, "claims automatic banning"],
  [/NCMEC|National Center for Missing|Interpol|report(ed)? to the police/i,
    "names an external reporting organisation"],
  [/\bPremium\b/, "advertises Premium"],
  // Stage 1.6W: describing Connections is now required, not forbidden — a store
  // reviewer will reject a build whose compliance pages do not describe what the
  // build does. What stays forbidden is the *availability* claim, which is the
  // thing that would actually be false. The pages describe the feature and say,
  // in every locale, that it is being introduced gradually.
  [/Connections is (now )?(live|enabled|available|on)\b/i,
    "claims Connections is enabled"],
  [/Connections is available to (all|every|everyone)/i,
    "claims Connections reaches every account"],
  [/(translation|Connections)[^.<]{0,40}(is|are) (now )?(live|enabled|switched on|turned on)/i,
    "claims the feature is switched on"],
  [/(every|all) (account|users?|installs?)[^.<]{0,30}(has|have|can use) Connections/i,
    "claims universal Connections availability"],
  [/guarantee(s|d)? (your )?(security|privacy)|completely secure|fully encrypted/i,
    "makes an absolute security guarantee"],
];

/**
 * Denials are the point of several of these pages — "ULMOX does not ban
 * accounts automatically" must be allowed to say so. Sentences are therefore
 * scanned individually, and one that negates the claim is skipped.
 */
const NEGATED = /\b(not|never|no|without|cannot|does not|do not)\b/i;

function positiveSentences(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !NEGATED.test(sentence));
}

for (const file of LEGAL_PAGES) {
  test(`${file} makes no unsupported claim`, () => {
    for (const sentence of positiveSentences(pages[file])) {
      for (const [pattern, description] of FORBIDDEN) {
        assert.doesNotMatch(sentence, pattern, `${file} ${description}: ${sentence}`);
      }
    }
  });
}

test("no page claims deletion faster than the worker supports", () => {
  for (const [file, html] of Object.entries(pages)) {
    assert.doesNotMatch(
      html,
      /deleted within 7 days|within 7 days/,
      `${file} promises 7-day deletion`
    );
  }
});

test("no locale deletion page still promises 7-day deletion", () => {
  const claim =
    /7\s*(days?|dagar|gün|Tagen|días|jours|giorni|dias|dagen|dni|päivän|дней|天|أيام|दिन|วัน|ngày)/i;
  for (const locale of LOCALES) {
    assert.doesNotMatch(
      read(`${locale}/delete_account.html`),
      claim,
      `${locale} still promises 7-day deletion`
    );
  }
});

test("privacy covers the real data categories and processors", () => {
  const html = pages["privacy.html"];
  for (const category of [
    "Email address",
    "Videos you record",
    "profile photo",
    "location",
    "Push notification tokens",
    "Crashlytics",
    "Performance Monitoring",
    "Firebase Analytics",
    "App Check",
    "Cloud Messaging",
    "Google Sign-In",
    "Sign in with Apple",
  ]) {
    assert.match(html, new RegExp(category, "i"), `privacy missing ${category}`);
  }
});

test("privacy does not claim message content is collected", () => {
  const html = pages["privacy.html"];
  assert.doesNotMatch(html, /messages you send|message content|chat history/i);
});

test("privacy states the raw date of birth is not stored", () => {
  const html = pages["privacy.html"];
  assert.match(html, /date of birth is not stored/i);
  assert.match(html, /never used for advertising/i);
});

test("terms state the admin-only ban and creator ownership rules", () => {
  const html = pages["terms.html"];
  assert.match(html, /Reports do not ban accounts/);
  assert.match(html, /Only an authorised ULMOX administrator/);
  assert.match(html, /You keep ownership of your content/);
  assert.match(html, /do\s*\n?\s*<strong>not<\/strong> become its owner/);
  assert.match(html, /18 years of age or older/);
});

/* -------------------------------------------------------------------------- */
/* Structure and accessibility                                                */
/* -------------------------------------------------------------------------- */

for (const file of LEGAL_PAGES) {
  test(`${file} is structurally sound and accessible`, () => {
    const html = pages[file];
    assert.match(html, /<html lang="en">/, "missing lang");
    assert.match(html, /<meta charset="UTF-8"/, "missing charset");
    assert.match(
      html,
      /<meta name="viewport" content="width=device-width, initial-scale=1\.0"/,
      "missing viewport"
    );
    assert.match(html, /<title>[^<]+<\/title>/, "missing title");
    assert.match(html, /<meta name="description"/, "missing description");

    // Exactly one h1, and no heading level is skipped.
    assert.equal((html.match(/<h1>/g) || []).length, 1, "needs exactly one h1");
    if (/<h3>/.test(html)) assert.match(html, /<h2>/, "h3 without h2");

    // Landmarks, skip link and a visible focus style.
    assert.match(html, /<main id="main">/, "missing main landmark");
    assert.match(html, /class="skip-link"/, "missing skip link");
    assert.match(html, /<footer>/, "missing footer landmark");
    assert.match(html, /focus-visible/, "no visible focus style");
    assert.match(html, /<nav aria-label=/, "footer nav is unlabelled");
  });
}

test("link text is meaningful, never bare 'click here'", () => {
  for (const [file, html] of Object.entries(pages)) {
    assert.doesNotMatch(html, />\s*(click here|here|read more)\s*</i, file);
  }
});

test("any new tab link carries rel protection", () => {
  for (const [file, html] of Object.entries(pages)) {
    for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(match[0], /rel="[^"]*noopener/, `${file}: ${match[0]}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Secrets and analytics safety                                               */
/* -------------------------------------------------------------------------- */

test("no page contains a secret, credential or console value", () => {
  for (const [file, html] of Object.entries(pages)) {
    for (const pattern of [
      /AIza[0-9A-Za-z_-]{20,}/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      /G-[A-Z0-9]{8,}/,
      /firebaseio\.com/,
      /serviceAccount/,
    ]) {
      assert.doesNotMatch(html, pattern, `${file} contains a secret-like value`);
    }
  }
});

test("deletion request details are never sent to analytics", () => {
  const html = pages["delete_account.html"];
  // The page has no form and no script, so nothing can capture what a user
  // types or the address they write from.
  assert.doesNotMatch(html, /<form/i);
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /gtag\(|dataLayer|trackEvent/);
});

/* -------------------------------------------------------------------------- */
/* Publication guard                                                          */
/* -------------------------------------------------------------------------- */

test("the publication guard exists and blocks premature deployment", () => {
  const checklist = read("PUBLICATION_CHECKLIST.md");
  assert.match(checklist, /Status: CLEARED FOR PUBLICATION|DO NOT PUBLISH/);
  // Stage 0.14A.1 replaced the hypothetical REST implementation with Firebase's
  // official API. The guard must record it as code-complete, never as released.
  assert.match(checklist, /Local code complete, not deployed, not\n   device-verified/);
  assert.match(checklist, /revokeTokenWithAuthorizationCode/);
  assert.doesNotMatch(checklist, /no private key, Team ID, Key ID or client-secret JWT anywhere.*deployed/is);
  assert.match(checklist, /Ferdi Gülseren/);
  // The named individual stays out of the public pages.
  for (const html of Object.values(pages)) {
    assert.doesNotMatch(html, /Ferdi Gülseren/);
  }
});

test("the checklist records every undeployed dependency", () => {
  const checklist = read("PUBLICATION_CHECKLIST.md");
  for (const dependency of [
    "deleteUserAccount",
    "erasure worker",
    "Deactivation is reversible",
    "Blocking is server-owned",
    "Report Content and Report User",
    "Only an admin can ban",
  ]) {
    assert.match(checklist, new RegExp(dependency, "i"), `missing ${dependency}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Analytics exclusion for the deletion route                                 */
/* -------------------------------------------------------------------------- */

test("the account deletion route carries no analytics in the build", () => {
  const os = require("node:os");
  const { buildSite } = require("../scripts/build-site.js");

  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-del-"));
  try {
    buildSite({
      sourceRoot: ROOT,
      output: outputRoot,
      measurementId: "G-TEST123456",
      environment: "production",
    });

    const deletionPages = [
      "delete_account.html",
      "delete-account/index.html",
      ...LOCALES.flatMap((l) => [
        `${l}/delete_account.html`,
        `${l}/delete-account/index.html`,
      ]),
    ];

    for (const relative of deletionPages) {
      const html = fs.readFileSync(path.join(outputRoot, relative), "utf8");
      assert.doesNotMatch(html, /googletagmanager|gtag\(|ULMOX_GA4_ANALYTICS/, relative);
    }

    // An ordinary page still is instrumented, so the exclusion is targeted.
    const privacyBuilt = fs.readFileSync(
      path.join(outputRoot, "privacy.html"),
      "utf8"
    );
    assert.match(privacyBuilt, /ULMOX_GA4_ANALYTICS/);
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

/* -------------------------------------------------------------------------- */
/* Stage 0.14B — native permission and Apple revocation synchronisation       */
/* -------------------------------------------------------------------------- */

/**
 * Stage 0.14A.1 implemented genuine Apple authorization revocation through
 * Firebase's official revokeTokenWithAuthorizationCode. The website may now
 * describe it, but only as something that applies to an account *linked with*
 * Sign in with Apple, and never as an advertised sign-up option — Apple sign-in
 * is not reachable from the current application UI.
 */
test("Apple revocation wording is conditional on an Apple-linked account", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /If your account is linked with Sign in with Apple/);
  assert.match(html, /Some ULMOX accounts are linked with Sign in with Apple/);
  assert.match(html, /revoke its own Sign in with Apple\s*\n?\s*authorisation/);
  // Revocation is always described as preceding deletion, never replacing it.
  assert.match(html, /Only then does the permanent deletion described above begin/);
  assert.match(html, /<strong>ULMOX does not receive your Apple password<\/strong>/);
});

test("Apple sign-in is never advertised as a currently available option", () => {
  const advertises = [
    /sign (up|in) with Apple to (create|get started)/i,
    /You sign in with Apple or\s*\n?\s*Google/,
    /Sign in with Apple or Google is used to create/,
    /choose (Sign in with )?Apple/i,
  ];
  for (const [file, html] of Object.entries(pages)) {
    for (const pattern of advertises) {
      assert.doesNotMatch(html, pattern, `${file} advertises Apple sign-in`);
    }
  }
});

test("no page claims real-device Apple revocation verification", () => {
  for (const [file, html] of Object.entries(pages)) {
    assert.doesNotMatch(
      html,
      /(verified|tested|confirmed) on (a |an )?(real |physical |signed )?(Apple )?device/i,
      `${file} claims device verification`
    );
  }
});

test("Apple-linked deletion from Android names the Apple device, and no Support route", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /Deleting an Apple-linked account from an Android device/);
  assert.match(html, /Finish the deletion on an Apple\s*\n?\s*device/);

  // The page used to offer "contact Support and we will handle it for you".
  // No support-assisted deletion procedure exists, so the offer is gone and
  // must not come back: promising a route nobody can walk is the same defect
  // as promising a feature that is not deployed.
  assert.doesNotMatch(html, /contact Support/i);
  assert.doesNotMatch(html, /we will handle it/i);

  // It must say plainly that nothing was removed, never imply success.
  assert.match(html, /<strong>nothing has been deleted<\/strong>/);
  assert.match(html, /ULMOX stops before anything is removed/);
});

test("a failed Apple step is never described as a completed deletion", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /If that step does not finish, nothing is deleted/);
  for (const sentence of positiveSentences(html)) {
    assert.doesNotMatch(
      sentence,
      /(account (is|was) deleted|deletion (is|was) complete)[^.]{0,60}(revok|authoris)/i,
      sentence
    );
  }
});

test("no implementation detail of the Apple step is exposed", () => {
  for (const [file, html] of Object.entries(pages)) {
    for (const pattern of [
      /authorization code|authorisation code exchange|client[- ]secret|clientSecret/i,
      /\bnonce\b/i,
      /\bJWT\b|Team ID|Key ID|private key/i,
      /FirebaseAuth\b|revokeToken|reauthenticateWithProvider|providerData/i,
    ]) {
      // The anti-phishing callout may name an "authorisation code" as
      // something we never ask for; that is the only permitted mention.
      const offending = [...html.matchAll(new RegExp(pattern, "gi"))].filter(
        (m) => !/never ask/i.test(html.slice(Math.max(0, m.index - 220), m.index))
      );
      assert.deepEqual(offending.map((m) => m[0]), [], `${file} leaks ${pattern}`);
    }
  }
});

test("no page claims ULMOX deletes an Apple ID or Google Account", () => {
  for (const [file, html] of Object.entries(pages)) {
    for (const sentence of positiveSentences(html)) {
      assert.doesNotMatch(
        sentence,
        /(delete|remove|erase)[^.]{0,60}(apple id|google account)/i,
        `${file}: ${sentence}`
      );
    }
  }
});

test("the deletion page separates authorisation, account and Apple ID", () => {
  const html = pages["delete_account.html"];
  assert.match(html, /Revoking ULMOX&rsquo;s Sign in with Apple authorisation/);
  assert.match(html, /Deleting your ULMOX account<\/strong> is the action that removes/);
  assert.match(html, /Deleting your Apple ID<\/strong> is something only Apple can do/);
  assert.match(html, /ULMOX never does it and cannot do it/);
  // Revoking must never be presented as completing deletion.
  assert.match(html, /it does not delete your ULMOX account and it does not erase the data/);
  assert.match(html, /no change to a sign-in authorisation completes it/);
});

test("privacy repeats that deletion does not touch the Apple or Google account", () => {
  const html = pages["privacy.html"];
  assert.match(
    html,
    /does not delete your Apple ID or your Google\s*\n?\s*Account/
  );
});

test("no page asks for a credential, authorisation code or token by email", () => {
  for (const file of ["delete_account.html", "support.html"]) {
    const html = pages[file];
    assert.match(html, /never ask you for a password/, file);
    assert.match(html, /authorisation code/, `${file} omits authorisation codes`);
    assert.match(html, /sign-in token/, `${file} omits tokens`);
  }
  // And no page ever invites one to be sent.
  for (const [file, html] of Object.entries(pages)) {
    for (const sentence of positiveSentences(html)) {
      assert.doesNotMatch(
        sentence,
        /(send|email|reply with)[^.]{0,40}(your password|authentication code|authorisation code|access token)/i,
        `${file}: ${sentence}`
      );
    }
  }
});

test("location is described as foreground-only, never background tracking", () => {
  const html = pages["privacy.html"];
  assert.match(html, /only while you are using the app/);
  // The single reading is now tied to the Moment creation flow rather than to
  // "the moment you record": the reading is taken while a Moment is being
  // created, which is the same guarantee stated in the app's own terms.
  assert.match(html, /single reading during the Moment creation flow/);
  assert.match(
    html,
    /does not follow your\s*\n?\s*location in the background/
  );
  // Launch is the one foreground moment a reader would not think to ask about,
  // and it is the one Apple asked about, so it is stated and asserted.
  assert.match(html, /does not access\s*\n?\s*location at launch/);
  // What the public surface shows is a property of the Moment, not of a person:
  // a city or country, never device coordinates, and a marker that does not
  // move when its creator moves.
  assert.match(html, /does not publish your device coordinates to World Live/);
  assert.match(html, /not a\s*\n?\s*user's current or live location/);
  assert.match(html, /do not move when the creator moves/);
  for (const [file, page_] of Object.entries(pages)) {
    for (const sentence of positiveSentences(page_)) {
      assert.doesNotMatch(
        sentence,
        /background location|track(s|ing)? your location|continuous(ly)? location/i,
        `${file}: ${sentence}`
      );
    }
  }
});

/**
 * Stage 0.14A.1 removed NSLocationAlwaysAndWhenInUseUsageDescription. The
 * Stage 0.13/0.14B disclosure that it "remains" and its removal is "planned"
 * is now false, so it must be gone from every page rather than left to rot.
 */
test("no stale Always-location or planned-removal wording remains", () => {
  for (const [file, html] of Object.entries(pages)) {
    assert.doesNotMatch(html, /&ldquo;Always&rdquo;/, `${file} still names the Always key`);
    assert.doesNotMatch(html, /Always.{0,60}location permission/is, file);
    assert.doesNotMatch(
      html,
      /planned work and this page will be updated/,
      `${file} still promises a future permission change`
    );
    assert.doesNotMatch(
      html,
      /currently declares (an|broader)/,
      `${file} still describes a permission as merely declared`
    );
  }
});

test("the app is described as declaring no background-location capability", () => {
  const html = pages["privacy.html"];
  assert.match(html, /ULMOX requests only while-in-use location/);
  assert.match(
    html,
    /does not use background\s*\n?\s*location, continuous monitoring, significant-change monitoring or\s*\n?\s*geofencing/
  );
  assert.match(
    html,
    /declares no permission that would allow those\s*\n?\s*activities/
  );
});

test("media access wording is platform-specific and not falsely absolute", () => {
  const html = pages["privacy.html"];
  assert.match(html, /Camera, microphone and photos/);
  assert.match(html, /record a video moment with sound/);

  // Android: the system picker replaces the Android 13+ broad media permissions.
  assert.match(html, /that is the system photo picker/);
  assert.match(html, /asks for no\s*\n?\s*permission to your wider photo library/);
  assert.match(
    html,
    /no longer declares the broad photo and video access\s*\n?\s*permissions/
  );
  // Legacy Android storage permission is described as capped, not as active.
  assert.match(html, /compatibility with Android 12 and earlier only/);

  // iOS: photo access is acknowledged, never universally denied.
  assert.match(html, /On iOS, ULMOX asks for photo\s*\n?\s*access for the flows that genuinely need it/);
  assert.match(html, /grant\s*\n?\s*access to selected photos/);
});

/**
 * Stage 0.14B said "ULMOX does not ask for permission to browse or read your
 * photo library" as a universal claim. Stage 0.14A.1 kept both iOS photo-library
 * usage descriptions because supported flows genuinely use them, so a universal
 * denial would now be a false privacy statement.
 */
test("no page universally denies photo-library access", () => {
  for (const [file, html] of Object.entries(pages)) {
    assert.doesNotMatch(
      html,
      /ULMOX does not ask for permission to browse or read your\s*\n?\s*photo library/,
      `${file} makes a universal photo-library denial`
    );
    assert.doesNotMatch(
      html,
      /never (asks for|requests) (any )?photo[- ]library access/i,
      file
    );
  }
});

test("removed Android media permissions are never described as present", () => {
  for (const [file, html] of Object.entries(pages)) {
    assert.doesNotMatch(html, /READ_MEDIA/i, `${file} names a removed permission`);
    assert.doesNotMatch(
      html,
      /(declares|requests|uses) broader media-read permissions/i,
      `${file} still claims broad Android media access`
    );
  }
});

test("advertising identifier permissions are described as absent", () => {
  const html = pages["privacy.html"];
  assert.match(html, /ULMOX requests no advertising identifier/);
  assert.match(html, /absent from the Android app we build/);
});

test("no page says created media stays only on the device", () => {
  for (const [file, html] of Object.entries(pages)) {
    for (const sentence of positiveSentences(html)) {
      assert.doesNotMatch(
        sentence,
        /(stays|remains|kept|stored)[^.]{0,40}only on (your|the) (device|phone)|never leaves your (device|phone)/i,
        `${file}: ${sentence}`
      );
    }
  }
  // And the upload is stated positively.
  assert.match(
    pages["privacy.html"],
    /uploaded to and stored in Firebase Cloud Storage/
  );
});

test("30 days stays a target and deletion is never guaranteed complete", () => {
  for (const file of ["delete_account.html", "privacy.html"]) {
    const html = pages[file];
    assert.match(html, /targeted for completion within 30 days/, file);
    assert.doesNotMatch(html, /guaranteed within 30 days|within 30 days guaranteed/i, file);
  }
  for (const [file, html] of Object.entries(pages)) {
    assert.doesNotMatch(
      html,
      /(guarantee|promise)[^.<]{0,40}(deletion|erasure) (is|will be) complete/i,
      file
    );
  }
});

/**
 * The generator is the single source of truth. If someone hand-edits a root
 * page, this fails rather than letting the file drift away from the template
 * that every other guarantee in this suite is written against.
 */
test("every generated page matches its canonical source exactly", () => {
  const { OUTPUTS } = require("../scripts/generate-legal-pages.js");
  assert.equal(OUTPUTS.length, LEGAL_PAGES.length);
  for (const [file, html] of OUTPUTS) {
    assert.equal(read(file), html, `${file} has drifted from the generator`);
  }
});

/**
 * Stage 1.6W.2 widened this from a phrase blocklist to a prose test.
 *
 * The old list held six English strings. Five of them are English *prose* —
 * "Camera, microphone and photos" is a heading, not a name — and they stay
 * forbidden. The sixth, "Apple ID", is a brand identifier that Apple itself
 * ships untranslated in Polish, Finnish, Russian, Japanese, Korean, Chinese,
 * Hindi and Thai, exactly as it ships "Firebase", "Google Play" and
 * "ULMOX Music" untranslated everywhere. Forbidding it did not detect an
 * untranslated page; it only pushed a translator into inventing a product name
 * Apple does not use.
 *
 * What replaces it is stronger than the entry it drops: no localized policy
 * page may contain any eight-word run of the canonical English page it
 * translates. A pasted English paragraph is caught wherever it lands, not only
 * where somebody thought to list it.
 */
test("no English placeholder or English prose survives in a localized page", () => {
  const introduced = [
    "Camera, microphone and photos",
    "Sign in with Apple and Google Sign-In",
    "photo picker",
    "authorisation code",
    "sign-in token",
  ];
  const POLICY_PAGES = [
    "privacy.html", "delete_account.html", "terms.html", "safety.html", "support.html"
  ];

  /** Visible words of a page, entity-decoded and markup-free. */
  const words = (html) =>
    (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [, html])[1]
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;|&#\d+;/gi, " ")
      .toLowerCase()
      .split(/[^a-z0-9'\u2019]+/)
      .filter(Boolean);

  // A run of eight words is English *prose* only if it is held together by
  // English grammar. A list of product names — "Firebase Authentication, Cloud
  // Firestore, Cloud Storage, Cloud Functions" — is identical in every locale
  // because none of it is ours to translate, and flagging it would be noise.
  const FUNCTION_WORDS = new Set(
    ("the of is a to and that it not for with you we are be in on as or this an" +
      " your our by from at do does can may only when if there them they he she" +
      " but so what which who how than about into over after before").split(" ")
  );
  const isProse = (run) =>
    run.split(" ").filter((word) => FUNCTION_WORDS.has(word)).length >= 3;

  // Every eight-word run of English canonical prose, as one lookup set.
  const englishRuns = new Set();
  for (const file of POLICY_PAGES) {
    const source = words(read(file));
    for (let i = 0; i + 8 <= source.length; i += 1) {
      const run = source.slice(i, i + 8).join(" ");
      if (isProse(run)) englishRuns.add(run);
    }
  }
  assert.ok(englishRuns.size > 2000, `only ${englishRuns.size} English runs indexed`);

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    for (const file of POLICY_PAGES) {
      const html = read(`${locale}/${file}`);
      for (const phrase of introduced) {
        assert.ok(
          !html.includes(phrase),
          `${locale}/${file} leaked English: ${phrase}`
        );
      }

      const localized = words(html);
      for (let i = 0; i + 8 <= localized.length; i += 1) {
        const run = localized.slice(i, i + 8).join(" ");
        assert.ok(
          !englishRuns.has(run),
          `${locale}/${file} carries untranslated English: "${run}"`
        );
      }
    }
  }
});

test("the checklist records the Stage 0.14B console handoff without claiming it done", () => {
  const checklist = read("PUBLICATION_CHECKLIST.md");
  for (const item of [
    "App Store age rating set to 18\\+",
    "Privacy nutrition label",
    "Declared Age Range",
    "Target Audience excluding children",
    "Content rating questionnaire",
    "Data Safety declarations",
    "Child Safety Standards certification",
    "Age Signals",
    "App Check adoption",
    "needs_attention",
    "requiredTermsVersion",
    "NSLocationAlwaysAndWhenInUseUsageDescription",
    "READ_MEDIA_IMAGES",
    "must be \\*\\*live\\*\\*",
  ]) {
    assert.match(checklist, new RegExp(item, "i"), `checklist missing ${item}`);
  }
  // Apple revocation must be recorded as code-complete, never as delivered.
  assert.match(checklist, /Local code complete &mdash;|Local code complete —/);
  assert.match(checklist, /Revocation verified on a signed physical Apple device \| \*\*Open\*\*/);
  assert.match(checklist, /Status: CLEARED FOR PUBLICATION|DO NOT PUBLISH/);
  // Nothing in the handoff tables may read as done.
  assert.doesNotMatch(checklist, /\| \*\*(Done|Complete|Verified)\*\* \|/);
});

/* -------------------------------------------------------------------------- */
/* Stage 0.14B-R — robots and sitemap production packaging                    */
/* -------------------------------------------------------------------------- */

const os = require("node:os");

/** Builds into a throwaway directory with the safe test Measurement ID. */
function withBuild(run) {
  const { buildSite } = require("../scripts/build-site.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-pkg-"));
  try {
    const result = buildSite({
      sourceRoot: ROOT,
      output: outputRoot,
      measurementId: "G-TEST123456",
      environment: "production",
    });
    return run(outputRoot, result);
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
}

test("the build emits robots.txt and sitemap.xml at the output root", () => {
  withBuild((outputRoot) => {
    for (const name of ["robots.txt", "sitemap.xml", "CNAME"]) {
      assert.ok(
        fs.existsSync(path.join(outputRoot, name)),
        `${name} is missing from the build output`
      );
    }
  });
});

test("built robots and sitemap are byte-identical to their sources", () => {
  withBuild((outputRoot) => {
    for (const name of ["robots.txt", "sitemap.xml"]) {
      assert.equal(
        fs.readFileSync(path.join(outputRoot, name), "utf8"),
        read(name),
        `${name} drifted between source and build output`
      );
    }
  });
});

test("the build is idempotent for the root files", () => {
  const first = withBuild((outputRoot) =>
    ["robots.txt", "sitemap.xml"].map((n) =>
      fs.readFileSync(path.join(outputRoot, n), "utf8")
    )
  );
  const second = withBuild((outputRoot) =>
    ["robots.txt", "sitemap.xml"].map((n) =>
      fs.readFileSync(path.join(outputRoot, n), "utf8")
    )
  );
  assert.deepEqual(first, second);
});

test("robots.txt points at the production sitemap and hides no legal page", () => {
  const robots = read("robots.txt");
  assert.match(robots, /^Sitemap:\s*https:\/\/ulmoxapp\.com\/sitemap\.xml\s*$/m);
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)\s*$/gm)].map((m) => m[1]);
  for (const route of [
    "/privacy.html",
    "/terms.html",
    "/safety.html",
    "/support.html",
    "/delete_account.html",
  ]) {
    for (const rule of disallowed) {
      assert.ok(!route.startsWith(rule), `robots.txt blocks ${route} via ${rule}`);
    }
  }
});

test("every sitemap URL uses the production origin and maps to a built route", () => {
  const { routeToOutputPath, PRODUCTION_ORIGIN } = require("../scripts/verify-production-build.js");
  withBuild((outputRoot) => {
    const sitemap = read("sitemap.xml");
    const locations = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].trim());
    assert.ok(locations.length >= 120, "sitemap shrank unexpectedly");

    const seen = new Set();
    for (const location of locations) {
      assert.ok(location, "sitemap contains an empty <loc>");
      assert.ok(
        location.startsWith(`${PRODUCTION_ORIGIN}/`),
        `wrong origin: ${location}`
      );
      assert.ok(!seen.has(location), `duplicate sitemap URL: ${location}`);
      seen.add(location);
      assert.ok(
        fs.existsSync(routeToOutputPath(outputRoot, location)),
        `sitemap URL has no built route: ${location}`
      );
    }

    // The canonical deletion route is listed; the hyphenated redirect is not.
    assert.ok(seen.has(`${PRODUCTION_ORIGIN}/delete_account.html`));
    assert.ok(!seen.has(`${PRODUCTION_ORIGIN}/delete-account/`));
    for (const locale of LOCALES) {
      assert.ok(
        seen.has(`${PRODUCTION_ORIGIN}/${locale}/delete_account.html`),
        `sitemap missing ${locale} deletion route`
      );
    }
  });
});

test("the production verifier rejects a build missing robots or sitemap", () => {
  const { verifyRobotsAndSitemap } = require("../scripts/verify-production-build.js");
  withBuild((outputRoot) => {
    // Green first, so the failure below is attributable to the removal.
    assert.equal(verifyRobotsAndSitemap(outputRoot).robotsVerified, true);

    fs.rmSync(path.join(outputRoot, "robots.txt"));
    assert.throws(() => verifyRobotsAndSitemap(outputRoot), /Missing production file/);
  });
});

test("the production verifier rejects a sitemap with the wrong origin", () => {
  const { verifyRobotsAndSitemap } = require("../scripts/verify-production-build.js");
  withBuild((outputRoot) => {
    const sitemapPath = path.join(outputRoot, "sitemap.xml");
    fs.writeFileSync(
      sitemapPath,
      read("sitemap.xml").replace("https://ulmoxapp.com/privacy.html", "http://example.com/privacy.html"),
      "utf8"
    );
    assert.throws(() => verifyRobotsAndSitemap(outputRoot), /wrong origin/);
  });
});

test("the production verifier rejects a sitemap URL with no built route", () => {
  const { verifyRobotsAndSitemap } = require("../scripts/verify-production-build.js");
  withBuild((outputRoot) => {
    const sitemapPath = path.join(outputRoot, "sitemap.xml");
    fs.writeFileSync(
      sitemapPath,
      read("sitemap.xml").replace(
        "</urlset>",
        "  <url><loc>https://ulmoxapp.com/does-not-exist.html</loc></url>\n</urlset>"
      ),
      "utf8"
    );
    assert.throws(() => verifyRobotsAndSitemap(outputRoot), /no built route|did not produce/);
  });
});

/* -------------------------------------------------------------------------- */
/* Stage 0.14B-R — preserved commitments                                      */
/* -------------------------------------------------------------------------- */

test("24 hours remains a review target, never a resolution guarantee", () => {
  for (const file of ["safety.html", "support.html"]) {
    const html = pages[file];
    assert.match(html, /within 24\s*\n?\s*hours/);
    assert.match(html, /target/i);
    assert.doesNotMatch(html, /guaranteed within 24 hours|resolved within 24 hours\./i, file);
  }
});

test("the checklist reconciles Stage 0.14A.1 as code-complete but undeployed", () => {
  const checklist = read("PUBLICATION_CHECKLIST.md");
  for (const item of [
    "Local code complete",
    "revokeTokenWithAuthorizationCode",
    "PrivacyInfo.xcprivacy",
    "signed physical Apple device",
    "Apps Using Apple ID",
    "Apple provider configuration",
    "support-assisted deletion",
    "Declared Age Range",
    "Age Signals",
    "BILLING",
    "USE_BIOMETRIC",
    "requiredTermsVersion",
  ]) {
    assert.match(checklist, new RegExp(item, "i"), `checklist missing ${item}`);
  }
  assert.match(checklist, /Status: CLEARED FOR PUBLICATION|DO NOT PUBLISH/);
  // Nothing console-, device- or deployment-side may be recorded as done.
  assert.doesNotMatch(checklist, /verified on a signed (physical )?device.*\bdone\b/i);
});
