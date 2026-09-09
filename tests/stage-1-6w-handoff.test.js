"use strict";

/**
 * Stage 1.6W — website release sequencing and the Stage 1.5 handoff.
 *
 * The application repository's README carries a six-item handoff to
 * `ulmox-site`, under "Handoff to `ulmox-site` (a separate repository, not
 * edited here)". Five of the six are wording corrections in this repository;
 * the sixth is a console action nobody here can perform. This suite proves the
 * five are implemented and cannot silently regress, and that the sixth is
 * recorded as open rather than quietly dropped.
 *
 * It also polices the boundary Stage 1.6W drew. Describing Connections became
 * *required* — a store reviewer will not approve a binary whose compliance URLs
 * do not describe what the build does — so the risk moved. It is no longer
 * "the page mentions a feature that is off"; it is "the page claims the feature
 * is on", and it is "the page leaks how review access is arranged". Both are
 * tested below.
 *
 * Read-only authorities used while writing these assertions, none of them
 * modified and none of them reachable from this repository at run time:
 *
 *   - moment_app README, "Website and store sequencing" and the six-item
 *     handoff beneath it — the sequencing correction and items 1-6.
 *   - moment_app final merged **release** manifest
 *     (build/app/intermediates/merged_manifest/release/...), which is where
 *     WRITE_EXTERNAL_STORAGE maxSdkVersion="28" actually appears — not the
 *     hand-written android/app/src/main/AndroidManifest.xml, which omits it.
 *   - moment_app README, Stage 1.6A "App Check coverage" — enforcement off.
 *   - moment_app README, Stage 1.4 "Admin-only ban" and "Evidence lifecycle".
 *   - moment_app README, Stage 1.1 / 1.1.1 — Connections behaviour, and the
 *     store-review pair that must never be described publicly.
 *   - moment_app README, Stage 1.3T / 1.3T.1 — translation wording.
 *
 * Nothing here reads the application repository at run time. The facts are
 * transcribed into assertions so this suite runs standalone.
 */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("fs");
const os = require("node:os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const T = require("../scripts/translation-content.js");
const LOCALES = T.LOCALE_CODES;

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

/** The six canonical English pages, all generated. */
const CANONICAL_PAGES = [
  "delete_account.html",
  "privacy.html",
  "terms.html",
  "safety.html",
  "support.html",
  "translation.html",
];

/** Every localized Translation Information route. */
const LOCALIZED_TRANSLATION = LOCALES.map((l) => `${l}/translation.html`);

/** Every HTML route in the source tree, root and localized. */
function allSiteHtml() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "dist" || entry.name === "node_modules") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) files.push(path.relative(ROOT, full));
    }
  };
  walk(ROOT);
  return files.sort();
}

const SITE_HTML = allSiteHtml();

/**
 * Denials have to be allowed to say the thing they deny. Sentences are scanned
 * one at a time and a negated one is skipped, the same convention the two older
 * suites use.
 */
const NEGATED = /\b(not|never|no|without|cannot|does not|do not|nor|unless)\b/i;

function positiveSentences(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !NEGATED.test(sentence));
}

const CHECKLIST = () => read("PUBLICATION_CHECKLIST.md");

/* -------------------------------------------------------------------------- */
/* 1. The six handoff items                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Item 1 — "The gradual-rollout sentence must be added to every page that
 * describes Connections, before submission."
 *
 * Every page that names Connections outside a link label has to carry it. The
 * test derives the page list from the pages themselves rather than a hard-coded
 * one, so a new page that starts describing Connections is caught rather than
 * quietly exempt.
 */
test("handoff 1: every page describing Connections carries the rollout sentence", () => {
  const rollout = T.LOCALES.en.webGradualRollout;
  const describing = CANONICAL_PAGES.filter((file) =>
    /\bConnection(s)?\b/.test(read(file))
  );

  // Privacy, Terms, Safety, Support, Translation and the deletion page all
  // describe Connections now. If that set ever shrinks, the handoff regressed.
  assert.ok(
    describing.length >= 5,
    `only ${describing.length} canonical pages describe Connections`
  );

  for (const file of describing) {
    assert.ok(
      read(file).includes(rollout),
      `${file} describes Connections without the gradual-rollout sentence`
    );
  }
});

test("handoff 1: the rollout sentence is hand-localized for all 19 locales", () => {
  for (const locale of LOCALES) {
    const value = T.LOCALES[locale].webGradualRollout;
    assert.ok(value && value.trim(), `${locale} has no rollout sentence`);
    if (locale !== "en") {
      assert.notEqual(
        value,
        T.LOCALES.en.webGradualRollout,
        `${locale} rollout sentence is still the English string`
      );
    }
    assert.ok(
      read(`${locale}/translation.html`).includes(value),
      `${locale}/translation.html omits its rollout sentence`
    );
  }
});

/**
 * Item 2 — "The Translation Information page must carry the Stage 1.3T/1.3T.1
 * wording in this README verbatim — in particular that message text is not sent
 * to Google to be translated, and equally that it must not claim ML Kit never
 * contacts Google or that no data leaves the device."
 *
 * Both halves. Either one alone is a false page.
 */
test("handoff 2: translation wording states the on-device fact and refuses the overclaim", () => {
  const translation = read("translation.html");
  const privacy = read("privacy.html");

  // The fact: the message is not sent away to be translated.
  assert.match(translation, /not sent anywhere to be translated/);
  assert.match(privacy, /does not send either\s*\n?\s*of them anywhere to be translated/);

  // The refusal: no claim that nothing leaves the device, or that Google is
  // never contacted.
  assert.match(translation, /We do not claim that nothing ever leaves your device/);
  assert.match(privacy, /we do not claim that nothing ever leaves your device/i);

  // And the third refusal Stage 1.3T.1 requires: ML Kit's own declaration is
  // neither presented as proof of upload nor described as ruled out.
  assert.match(privacy, /we do not claim to have ruled the question out/i);
  assert.match(privacy, /not open source/);
});

/**
 * Item 3 — "The Account Deletion page must not imply every account can complete
 * deletion in-app on Android; an Apple-linked account on a non-Apple platform is
 * directed to support."
 *
 * The caveat has to be attached to the in-app route itself. Burying it several
 * screens further down is exactly the implication the handoff objects to.
 */
test("handoff 3: the in-app deletion route states its own Android exception", () => {
  const html = read("delete_account.html");
  const optionOne = html.slice(
    html.indexOf("Option 1"),
    html.indexOf("Option 2")
  );
  assert.ok(optionOne.length > 0, "Option 1 section not found");
  assert.match(optionOne, /not available\s*\n?\s*to every account/i);
  assert.match(optionOne, /Sign in with\s*\n?\s*Apple/);
  assert.match(optionOne, /Android/);
  // It states the real requirement rather than pointing at a support route
  // that does not exist.
  assert.match(optionOne, /must complete it\s*\n?\s*on an Apple device/);
  assert.doesNotMatch(optionOne, /directed to\s*\n?\s*<a href="support\.html">/);

  // And the full explanation still exists further down, with a real anchor.
  assert.match(html, /id="apple-linked"/);
  assert.match(html, /can only be completed on an Apple device/);
});

/**
 * Item 4 — "Sign in with Apple must not be described as an available sign-up
 * option: the code path exists but no screen calls it."
 *
 * Every mention has to be conditional on an account already being linked.
 */
test("handoff 4: Sign in with Apple is never offered as a way to sign up", () => {
  // Only an *offer* counts. "stops ULMOX from being able to use Sign in with
  // Apple for you" is a sentence about revocation, not a sign-up option, so the
  // patterns require an offering context rather than the bare verb.
  const offers = [
    /sign (up|in) with Apple to (create|make|get|start)/i,
    /(choose|select|tap|press) ["“]?Sign in with Apple["”]?/i,
    /Sign in with Apple is (available|supported|offered|one of)/i,
    /(create|make|register) (an )?account (with|using) (Sign in with )?Apple/i,
    /sign in (with|using) Apple to (use|access|join)/i,
    /you can (use|choose) Sign in with Apple/i,
  ];
  for (const file of SITE_HTML) {
    const html = read(file);
    for (const sentence of positiveSentences(html)) {
      for (const pattern of offers) {
        assert.doesNotMatch(
          sentence,
          pattern,
          `${file} offers Apple sign-in: ${sentence}`
        );
      }
    }
  }
  // The conditional framing is present where it matters.
  assert.match(read("delete_account.html"), /is linked with Sign in with Apple/);
});

/**
 * Item 5 — "The Safety page must describe reporting, blocking, End Connection,
 * the seven-day message retention and the fact that reporting hides a message
 * for the reporter only."
 *
 * All five, on the Safety page specifically.
 */
test("handoff 5: the safety page covers all five required Connections facts", () => {
  const safety = read("safety.html");
  assert.match(safety, /Safety in Connections/);

  // Reporting, both kinds.
  assert.match(safety, /Report Message/);
  assert.match(safety, /Report User/);
  // Blocking.
  assert.match(safety, /Blocking stops interaction in both directions/);
  // End Connection, and that it is terminal.
  assert.match(safety, /End Connection/);
  assert.match(safety, /cannot be restored/);
  // Seven-day message retention.
  assert.match(safety, /expiring about seven days/);
  // Reporting hides the message for the reporter only.
  assert.match(safety, /hides the message for you, and only for you/i);
  assert.match(safety, /sender is not\s*\n?\s*told/);
});

/**
 * Item 6 — "A named private child-safety contact must be published before the
 * child safety certification is submitted."
 *
 * This one is a Play Console action. The repository cannot perform it, so what
 * is tested is that it is recorded as open, that the individual stays private,
 * and that the public role label is what appears on the page.
 */
test("handoff 6: the child-safety contact is a public role and a private, open task", () => {
  const safety = read("safety.html");
  assert.match(safety, /ULMOX Child Safety Contact/);

  // The individual is never presented as the child-safety contact. The Safety
  // pages carry the role label and no personal name at all, in any locale and
  // in any encoding; the Privacy pages do name the operator, because "who
  // operates this service" is a disclosure a regulator needs and the canonical
  // page makes it. Those are different claims and the test keeps them apart.
  const decoded = (html) => html.replace(/&uuml;/g, "ü").replace(/&Uuml;/g, "Ü");
  for (const locale of LOCALES) {
    assert.doesNotMatch(
      decoded(read(`${locale}/safety.html`)),
      /Ferdi|Gülseren/,
      `${locale}/safety.html names the individual as the child-safety contact`
    );
  }
  assert.doesNotMatch(decoded(read("safety.html")), /Ferdi|Gülseren/);
  // Nowhere on the site is the name rendered next to the child-safety address.
  for (const file of SITE_HTML) {
    assert.doesNotMatch(
      decoded(read(file)),
      /Gülseren[\s\S]{0,200}Child%20Safety/,
      `${file} pairs the individual with the child-safety contact`
    );
  }
  const checklist = CHECKLIST();
  assert.match(checklist, /Ferdi Gülseren/);
  assert.match(checklist, /has not been entered in Play\s*\n?\s*Console/);
  assert.match(
    checklist,
    /Named private child-safety contact \| \*\*Open\*\*/,
    "the Play Console child-safety contact row is not open"
  );
});

test("all six handoff items are enumerated in the checklist and none is closed early", () => {
  const checklist = CHECKLIST();
  assert.match(checklist, /Stage 1\.6W — the six-item Stage 1\.5 handoff, consumed/);
  for (const fragment of [
    "gradual-rollout sentence must be added",
    "must \\*\\*not\\*\\* claim ML Kit never contacts Google",
    "must not imply every account can complete deletion in-app on\\s*\\n?\\s*Android",
    "must not be described as an available sign-up option",
    "hides a message \\*\\*for the reporter only\\*\\*",
    "named private child-safety contact",
  ]) {
    assert.match(
      checklist,
      new RegExp(fragment, "i"),
      `checklist omits handoff item: ${fragment}`
    );
  }
  // The five wording items say "not published"; the console item says OPEN.
  assert.equal(
    (checklist.match(/\*\*Applied — not published\*\*/g) || []).length,
    5,
    "expected exactly five applied-but-unpublished handoff items"
  );
  assert.match(checklist, /\*\*OPEN — console action, not performed\*\*/);
});

/* -------------------------------------------------------------------------- */
/* 2-5. Availability claims and the publication sequence                      */
/* -------------------------------------------------------------------------- */

test("no page claims Connections is enabled or available to everyone", () => {
  const claims = [
    /Connections is (now )?(live|enabled|available|active|on)\b/i,
    /Connections (is|are) available to (all|every|everyone|all users)/i,
    /(every|all) (accounts?|users?)[^.<]{0,30}(has|have|can use|gets?) Connections/i,
    /Connections has launched/i,
    /Connections is out now/i,
    /you (can|may) now (use|start) Connections/i,
  ];
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      for (const pattern of claims) {
        assert.doesNotMatch(sentence, pattern, `${file}: ${sentence}`);
      }
    }
  }
});

test("no page claims translation is currently live", () => {
  const claims = [
    /translation is (now )?(live|enabled|active|switched on|turned on)/i,
    /translation (is|has been) (released|launched|rolled out to everyone)/i,
    /(everyone|all users|every account) can (now )?translate/i,
  ];
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      for (const pattern of claims) {
        assert.doesNotMatch(sentence, pattern, `${file}: ${sentence}`);
      }
    }
  }
});

test("no page names a specific live application version", () => {
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      assert.doesNotMatch(
        sentence,
        /(version|build|release) \d+\.\d+(\.\d+)?\b/i,
        `${file} names an app version: ${sentence}`
      );
    }
  }
});

/**
 * The sequencing correction itself. The old order deadlocked: publish only
 * after the release is live, but the release cannot be approved until the pages
 * are live. The new order has to permit publication before submission, and has
 * to keep the feature flag and Terms enforcement behind their own gates.
 */
test("the checklist permits publishing compliance pages before store review", () => {
  const checklist = CHECKLIST();
  const orderStart = checklist.indexOf("### The order");
  const orderEnd = checklist.indexOf("### What still waits for its own prerequisite");
  assert.ok(orderStart > -1 && orderEnd > orderStart, "the order section is missing");
  const order = checklist.slice(orderStart, orderEnd);

  const stepIndex = (fragment) => {
    const at = order.indexOf(fragment);
    assert.ok(at > -1, `order step missing: ${fragment}`);
    return at;
  };

  const verify = stepIndex("**Final website verification.**");
  const support = stepIndex("**Operational support and contact readiness.**");
  const publish = stepIndex("**Publish the compliance and help pages.**");
  const urls = stepIndex("**Verify every public URL.**");
  const submit = stepIndex("**Submit the compatible binary**");
  const keepOff = stepIndex("**Keep Connections disabled for ordinary users**");
  const reviewer = stepIndex("**Enable reviewer access through the server-owned review pair**");
  const rollout = stepIndex("**Complete review, then roll out under control.**");
  const removeWording = stepIndex("**Later, remove the gradual-rollout wording**");

  // The nine steps, in the required order.
  const sequence = [
    verify, support, publish, urls, submit, keepOff, reviewer, rollout, removeWording,
  ];
  for (let i = 1; i < sequence.length; i += 1) {
    assert.ok(
      sequence[i] > sequence[i - 1],
      `publication sequence is out of order at step ${i + 1}`
    );
  }

  // The specific inversion this stage exists to fix: publish before submit.
  assert.ok(publish < submit, "pages must be publishable before store submission");

  // And the deadlock wording is gone.
  assert.doesNotMatch(
    checklist,
    /\*\*Only then\*\* publish these website pages/,
    "the old publish-last deadlock is still in the checklist"
  );
});

test("Terms enforcement and the feature flags keep their own prerequisites", () => {
  const checklist = CHECKLIST();
  assert.match(checklist, /Terms enforcement \(`requiredTermsVersion`\)/);
  assert.match(checklist, /connectionsEnabled` \| the deployment order/);
  assert.match(checklist, /App Check enforcement \| the compatible release being live/);

  // Connections was required to stay off through submission and reviewer setup.
  // That step is now satisfied rather than pending: the flag is `true` in
  // production and the reviewer isolation it was waiting for exists. The rule
  // that still matters is that turning it on required no website edit, which is
  // what the gradual-rollout sentence buys.
  assert.match(checklist, /`app_config\/connections\.connectionsEnabled` is\s*\n?\s*\*\*`true`\*\*/);
  assert.match(checklist, /store_review_pair/);
  assert.doesNotMatch(checklist, /connectionsEnabled` stays `false`/);
});

test("removing the rollout wording is deferred, never marked done", () => {
  const checklist = CHECKLIST();
  assert.match(checklist, /only once it has become\s*\n?\s*genuinely obsolete/);
  assert.match(checklist, /Removing it earlier\s*\n?\s*reintroduces the false claim/);
});

/* -------------------------------------------------------------------------- */
/* 6-8. Android and iOS permission truth                                      */
/* -------------------------------------------------------------------------- */

/**
 * The modern Android 13+ media permissions are absent from the merged release
 * manifest. No page may name them or imply the app holds them — a Play
 * reviewer reading a claimed permission the app does not declare has found a
 * discrepancy either way round.
 */
test("modern Android READ_MEDIA_* permissions are never claimed", () => {
  for (const file of SITE_HTML) {
    const html = read(file);
    assert.doesNotMatch(html, /READ_MEDIA/i, `${file} names a modern media permission`);
    assert.doesNotMatch(
      html,
      /VISUAL_USER_SELECTED/i,
      `${file} names a modern media permission`
    );
    for (const sentence of positiveSentences(html)) {
      assert.doesNotMatch(
        sentence,
        /(declares|requests|holds|uses)[^.<]{0,40}(Android 13\+?|modern)[^.<]{0,30}(media|photo|video) permission/i,
        `${file} claims a modern media permission: ${sentence}`
      );
    }
  }
  // And the positive statement stays: they were removed because of the picker.
  assert.match(
    read("privacy.html"),
    /no longer declares the broad photo and video access\s*\n?\s*permissions that Android 13 and later use/
  );
});

/**
 * Stage 1.5's handoff omitted WRITE_EXTERNAL_STORAGE entirely. The merged
 * release manifest declares it with maxSdkVersion="28" — Android 9 and earlier.
 * It has to be disclosed, scoped, and explicitly not presented as a modern
 * photo-library permission.
 */
test("the legacy write storage permission is disclosed and scoped to SDK 28", () => {
  const privacy = read("privacy.html");

  // Both legacy declarations are disclosed, not just the read one.
  assert.match(privacy, /Two older storage permissions are still declared/);
  assert.match(privacy, /legacy <strong>read<\/strong> storage permission/);
  assert.match(privacy, /legacy <strong>write<\/strong> storage permission/);

  // Each carries its own cap. SDK 28 is Android 9.
  assert.match(privacy, /compatibility with Android 12 and earlier only/);
  assert.match(privacy, /compatibility with <strong>Android 9 and earlier<\/strong> only/);

  // It is explicitly not a modern media permission.
  assert.match(
    privacy,
    /not a modern photo or video library permission/
  );

  // The cap is described as preventing the grant on modern versions, rather
  // than the permission being described as present there.
  assert.match(privacy, /the permission is not granted, is not requested and has no effect/);

  // No raw manifest dump: the constants themselves stay out of the HTML.
  for (const file of SITE_HTML) {
    const html = read(file);
    assert.doesNotMatch(html, /WRITE_EXTERNAL_STORAGE/, `${file} dumps a manifest constant`);
    assert.doesNotMatch(html, /READ_EXTERNAL_STORAGE/, `${file} dumps a manifest constant`);
    assert.doesNotMatch(html, /maxSdkVersion/i, `${file} dumps a manifest attribute`);
    assert.doesNotMatch(html, /uses-permission/i, `${file} dumps manifest XML`);
  }

  // And the checklist records the omission and the correction.
  const checklist = CHECKLIST();
  assert.match(checklist, /`WRITE_EXTERNAL_STORAGE`/);
  assert.match(checklist, /maxSdkVersion="28"/);
  assert.match(checklist, /this is the one that was missing/i);
});

test("Android and iOS photo behaviour stay described separately", () => {
  const privacy = read("privacy.html");

  // Android: the system picker, needing no permission.
  assert.match(privacy, /that is the system photo picker/);
  assert.match(privacy, /needs no storage\s*\n?\s*permission at all/);

  // iOS: photo access and add-access both acknowledged.
  assert.match(privacy, /On iOS, ULMOX asks for photo\s*\n?\s*access/);
  assert.match(privacy, /asks for permission to add it to your photo library/);

  // Neither platform's behaviour is stated as if it were universal.
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      assert.doesNotMatch(
        sentence,
        /on (every|all) (platforms?|devices?)[^.<]{0,40}photo/i,
        `${file} makes a cross-platform photo claim: ${sentence}`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 9-11. App Check and reviewer-routing disclosure boundaries                  */
/* -------------------------------------------------------------------------- */

test("App Check is never described as enforced", () => {
  const claims = [
    /App Check (is|has been) (enforced|enabled|active|on|required)/i,
    /App Check enforcement is (on|active|enabled|live)/i,
    /(enforces?|enforcing) App Check/i,
    /every request is verified by App Check/i,
  ];
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      for (const pattern of claims) {
        assert.doesNotMatch(sentence, pattern, `${file}: ${sentence}`);
      }
    }
  }

  // What the page is allowed to say, and does.
  assert.match(
    read("privacy.html"),
    /Firebase App Check, a device-integrity check used, where the platform\s*\n?\s*supports it, to reduce automated abuse/
  );

  // The checklist keeps the real state, privately.
  const checklist = CHECKLIST();
  assert.match(checklist, /App Check enforcement \| \*\*OFF\.\*\*/);
  assert.match(checklist, /Stage 1\.6A confirms it remains disabled/);
});

test("internal App Check variable names and inventories are absent from public HTML", () => {
  const internals = [
    /ULMOX_ENFORCE_APP_CHECK/,
    /ULMOX_APP_CHECK_ONLY/,
    /ULMOX_APP_CHECK_EXEMPT/,
    /ULMOX_TEST_RECIPIENT_OVERRIDE/,
    /callable_app_check_registry/,
    /enforceAppCheckFor/,
    /\bPROTECTED\b\s*\|/,
    /NOT_APPLICABLE/,
    /Play Integrity/i,
    /DeviceCheck/i,
    /App Attest/i,
  ];
  for (const file of SITE_HTML) {
    const html = read(file);
    for (const pattern of internals) {
      assert.doesNotMatch(html, pattern, `${file} leaks an App Check internal`);
    }
  }
  // No callable inventory, exemption list or enforcement threshold, either.
  for (const file of SITE_HTML) {
    const html = read(file);
    assert.doesNotMatch(html, /exempt(ion)? list/i, `${file} mentions an exemption list`);
    assert.doesNotMatch(html, /\bcallables?\b/i, `${file} names callables`);
  }
});

test("reviewer routing internals never reach a public page", () => {
  const internals = [
    /store_review_pair/i,
    /review pair/i,
    /reviewer (account|uid|pair|credentials)/i,
    /test.?recipient/i,
    /non_production_match/i,
    /isolated (store )?review routing/i,
    /aUid|bUid/,
    /validate_store_review_pair/i,
    /app_config\//,
    /connectionsEnabled/,
    /schemaVersion/i,
  ];
  for (const file of SITE_HTML) {
    const html = read(file);
    for (const pattern of internals) {
      assert.doesNotMatch(html, pattern, `${file} leaks reviewer routing internals`);
    }
  }

  // Nothing that reads as a credential or an account identifier, either.
  for (const file of SITE_HTML) {
    const html = read(file);
    assert.doesNotMatch(html, /[A-Za-z0-9_-]{24,}\s*(uid|UID)/, `${file} looks like a uid`);
    assert.doesNotMatch(html, /\buid[:=]\s*["'][^"']+["']/i, `${file} contains a uid`);
  }

  // The credential-free procedure lives in the private checklist, and says so.
  const checklist = CHECKLIST();
  assert.match(checklist, /Reviewer access — credential-free, private, never a public page/);
  assert.match(
    checklist,
    /No email address, password, uid or token appears in this repository/
  );
  assert.match(checklist, /review mechanism, not a consumer feature/);
});

test("public Connections wording describes only real product behaviour", () => {
  const terms = read("terms.html");
  const safety = read("safety.html");

  // Every fact the public pages are permitted to state, and do.
  assert.match(terms, /Accounts are persistent and non-anonymous/);
  assert.match(terms, /two separate qualifying video exchanges/);
  assert.match(terms, /Each person approves\s*\n?\s*independently/);
  assert.match(terms, /no user\s*\n?\s*search/);
  assert.match(terms, /Text only, and nothing attached/);
  assert.match(terms, /no photos, no videos,\s*\n?\s*no files, no voice notes/);
  assert.match(terms, /Report User<\/strong> and\s*\n?\s*<strong>Report Message/);
  assert.match(terms, /Block<\/strong>, and you can <strong>End Connection/);
  assert.match(terms, /People review reports, not machines/);
  assert.match(terms, /Translation is optional/);
  assert.match(terms, /18\+ service/);

  // The safety page repeats the ones that are safety-relevant.
  assert.match(safety, /no\s*\n?\s*user search/);
  assert.match(safety, /Leaving always works/);
});

test("internal operational event names never appear publicly", () => {
  for (const file of SITE_HTML) {
    const html = read(file);
    assert.doesNotMatch(html, /CHILD_SAFETY_REPORT_RECEIVED/, `${file} names an internal event`);
    assert.doesNotMatch(html, /needs_attention/, `${file} names an internal job state`);
    assert.doesNotMatch(html, /moderationQueue/i, `${file} names an internal collection`);
    assert.doesNotMatch(
      html,
      /retained_(pending|after)_review|ephemeral/,
      `${file} names an internal evidence class`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 12-15. Moderation, evidence, deletion and deactivation                     */
/* -------------------------------------------------------------------------- */

test("no automatic-ban claim exists, from any source", () => {
  const claims = [
    /automatically ban/i,
    /auto-?ban/i,
    /(reports?|filter|quarantine|translation)[^.<]{0,40}(results? in|triggers?|causes?)[^.<]{0,20}ban/i,
    /banned after \d+ reports?/i,
  ];
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      for (const pattern of claims) {
        assert.doesNotMatch(sentence, pattern, `${file}: ${sentence}`);
      }
    }
  }

  // The denial is explicit, and names every source Stage 1.4 rules out.
  for (const file of ["terms.html", "safety.html"]) {
    const html = read(file);
    assert.match(html, /only an authorised ULMOX administrator/i, file);
  }
  const terms = read("terms.html");
  assert.match(terms, /not an automated\s*\n?\s*filter holding a message back, not a quarantine, not a translation/);
  const safety = read("safety.html");
  assert.match(safety, /Neither\s*\n?\s*does the number of reports, an automated filter holding a message back,/);
});

test("moderation is human, and a held or quarantined item is not an account decision", () => {
  const terms = read("terms.html");
  assert.match(terms, /Reported\s*\n?\s*videos and reported messages are both reviewed by a person/);
  assert.match(terms, /is\s*\n?\s*<strong>not<\/strong> a decision about your account/);
  assert.match(terms, /restricts that item and nothing else/);

  // Approved content returns to Global only if it independently still qualifies.
  assert.match(terms, /returns to the Global feed only if\s*\n?\s*it independently still qualifies/);
  assert.match(read("safety.html"), /only if it independently still qualifies/);

  // Resolving preserves evidence and the audit record.
  assert.match(terms, /When a report is resolved it leaves the active review list/);
  assert.match(terms, /It is not\s*\n?\s*erased/);
  assert.match(read("safety.html"), /Resolving a report takes it off the active review list/);

  // No page claims every violation is caught.
  assert.match(read("safety.html"), /does not claim that any automated check finds every violation/);
});

test("a translation never becomes moderation evidence", () => {
  for (const file of ["terms.html", "safety.html", "privacy.html", "translation.html"]) {
    const html = read(file);
    assert.match(
      html,
      /(never becomes moderation evidence|never the thing that is reviewed and is never evidence|is not evidence|never the translation|use the original message|original message<\/strong>)/,
      `${file} does not tie moderation to the original`
    );
  }
  assert.match(read("terms.html"), /never the thing that is reviewed and is never evidence/);
  assert.match(read("privacy.html"), /A translation never becomes moderation evidence/);
  assert.match(read("translation.html"), /never the translation/);
  assert.match(read("translation.html"), /A translation is not a moderation decision/);
});

test("message retention and evidence retention are distinguished", () => {
  const privacy = read("privacy.html");

  // Ordinary messages: a seven-day logical rule, not a claimed active timer.
  assert.match(privacy, /expiring about seven days after it is sent/);
  assert.match(
    privacy,
    /automatic expiry of the stored record is not currently switched on/,
    "the page claims a physical TTL that is not enabled"
  );

  // Evidence: explicitly not ordinary message history.
  assert.match(privacy, /Safety evidence is not ordinary message history/);
  assert.match(privacy, /seven-day expiry no longer governs it/);
  assert.match(read("delete_account.html"), /Safety evidence is not ordinary message history/);
  assert.match(read("safety.html"), /seven-day\s*\n?\s*expiry no longer governs it/);

  // No page claims a physical TTL is running.
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      assert.doesNotMatch(
        sentence,
        /(automatically|permanently) (deleted|erased|purged) after (seven|7) days/i,
        `${file} claims an active deletion timer: ${sentence}`
      );
    }
  }

  // And no new fixed evidence-retention period was invented.
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      assert.doesNotMatch(
        sentence,
        /evidence[^.<]{0,50}(kept|retained|held) for \d+ (days?|months?|years?)/i,
        `${file} invents an evidence-retention period: ${sentence}`
      );
    }
  }
});

test("deletion and deactivation wording stays accurate and distinct", () => {
  const privacy = read("privacy.html");
  const deletion = read("delete_account.html");

  // They are different things, said plainly.
  assert.match(deletion, /Deactivating is not deleting/);
  assert.match(deletion, /Deactivation\s*\n?\s*does not satisfy a deletion request/);

  // Deactivation erases no evidence; reactivation restores nothing moderated.
  assert.match(privacy, /Deactivation is not an erasure and it does not clear safety records/);
  assert.match(privacy, /does not reopen a\s*\n?\s*Connection that was ended/);
  assert.match(deletion, /reactivating does not undo\s*\n?\s*anything/);

  // Deleting one account does not delete the other participant's data.
  assert.match(deletion, /Deleting your account does not delete anyone else&rsquo;s/);
  assert.match(privacy, /Deleting your account removes your data\. It does not remove another/);

  // Justified evidence may survive deletion, with identity links scrubbed.
  assert.match(deletion, /links tying it to your identity are\s*\n?\s*scrubbed/);
  assert.match(privacy, /scrubbed as part of the erasure/);

  // Apple revocation stays conditional, never claimed as verified or deployed.
  assert.match(privacy, /If your account is linked with Sign in with Apple/);
  for (const file of SITE_HTML) {
    for (const sentence of positiveSentences(read(file))) {
      assert.doesNotMatch(
        sentence,
        /revocation (has been|is) (verified|tested|confirmed) on a (real|physical|signed)/i,
        `${file} claims device verification: ${sentence}`
      );
    }
  }

  // The Android Apple-linked support route stays an open publication blocker.
  assert.match(
    CHECKLIST(),
    /support-assisted deletion procedure for Apple-linked Android users \| \*\*Open\*\*/
  );
});

/* -------------------------------------------------------------------------- */
/* 16-20. Generation, locales, links, sitemap and robots                      */
/* -------------------------------------------------------------------------- */

test("every generated page still matches its canonical source", () => {
  const { OUTPUTS, localizedTranslationPage } = require("../scripts/generate-legal-pages.js");
  for (const [file, html] of OUTPUTS) {
    assert.equal(read(file), html, `${file} drifted from the generator`);
  }
  for (const locale of LOCALES) {
    assert.equal(
      read(`${locale}/translation.html`),
      localizedTranslationPage(locale),
      `${locale}/translation.html drifted from the generator`
    );
  }
});

test("all locale routes build, root and localized", () => {
  const required = [
    "index.html",
    "privacy.html",
    "terms.html",
    "safety.html",
    "support.html",
    "delete_account.html",
    "delete-account/index.html",
    "translation.html",
  ];
  for (const file of required) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `missing root route: ${file}`);
  }
  for (const locale of LOCALES) {
    for (const file of required) {
      const relative = `${locale}/${file}`;
      assert.ok(fs.existsSync(path.join(ROOT, relative)), `missing route: ${relative}`);
      assert.ok(read(relative).trim().length > 0, `empty route: ${relative}`);
    }
  }
});

/**
 * Accessibility, for the routes this stage owns.
 *
 * Scope is deliberate and stated rather than assumed. The 25 routes below —
 * the six canonical English pages and all 19 localized Translation Information
 * routes — come out of the shared generator chrome, so the checks are
 * meaningful and enforceable on every one of them.
 *
 * The hand-maintained localized legal pages (`<locale>/privacy.html`,
 * `terms.html`, `safety.html`, `support.html`, `delete_account.html`) and the
 * 20 `index.html` landing pages are NOT generated and carry none of that
 * chrome. That is a pre-existing gap — it is equally absent at git HEAD, and
 * Stage 1.6W did not touch those files. It is recorded as an open publication
 * blocker in PUBLICATION_CHECKLIST.md rather than quietly excluded here.
 */
const ACCESSIBLE_ROUTES = [...CANONICAL_PAGES, ...LOCALIZED_TRANSLATION];

test("every route this stage generates is structurally sound and accessible", () => {
  assert.equal(ACCESSIBLE_ROUTES.length, 25);
  for (const route of ACCESSIBLE_ROUTES) {
    const html = read(route);
    const locale = route.includes("/") ? route.split("/")[0] : "en";
    const tag = html.match(/<html\b[^>]*>/)[0];

    assert.match(tag, new RegExp(`lang="${locale}"`), `${route}: wrong lang`);
    if (locale === "ar") {
      assert.match(tag, /dir="rtl"/, `${route}: Arabic without RTL`);
    } else {
      assert.doesNotMatch(tag, /dir="rtl"/, `${route}: non-Arabic with RTL`);
    }

    assert.match(html, /<meta charset="UTF-8"/, `${route}: no charset`);
    assert.match(html, /width=device-width/, `${route}: not responsive`);
    assert.match(html, /<title>[^<]+<\/title>/, `${route}: no title`);
    assert.match(html, /<meta name="description"/, `${route}: no description`);

    // Exactly one h1, and no heading level skipped.
    assert.equal((html.match(/<h1>/g) || []).length, 1, `${route}: not one h1`);
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i += 1) {
      assert.ok(
        levels[i] <= levels[i - 1] + 1,
        `${route}: heading jump h${levels[i - 1]} -> h${levels[i]}`
      );
    }

    // Landmarks, skip link, visible focus.
    assert.match(html, /<main id="main">/, `${route}: no main landmark`);
    assert.match(html, /<footer>/, `${route}: no footer landmark`);
    assert.match(html, /<nav aria-label=/, `${route}: unlabelled nav`);
    assert.match(html, /class="skip-link"/, `${route}: no skip link`);
    assert.match(html, /focus-visible/, `${route}: no focus-visible style`);

    // WCAG-AA palette tokens survive, and every new tab is rel-protected.
    assert.match(html, /--muted: #d6d6d6/, `${route}: contrast token changed`);
    for (const anchorTag of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(anchorTag[0], /rel="[^"]*noopener/, `${route}: ${anchorTag[0]}`);
    }
  }
});

/**
 * Stage 1.6W recorded the un-generated pages' missing accessible chrome as an
 * open blocker. Stage 1.6W.1 closed it, so this test now checks the closure
 * rather than the record: every route in the tree, generated or hand-written,
 * carries the same structure the 25 generated ones always had.
 */
test("the accessibility gap is closed on every route, not just the generated ones", () => {
  assert.match(
    CHECKLIST(),
    /The site-wide accessible page shell[\s\S]{0,900}\*\*Resolved at Stage 1\.6W\.1\.\*\*/,
    "the closure of the accessibility gap is not recorded"
  );

  for (const route of SITE_HTML) {
    const html = read(route);
    if (!html.trim()) continue;
    const locale = LOCALES.includes(route.split("/")[0]) ? route.split("/")[0] : "en";
    const tag = html.match(/<html\b[^>]*>/)[0];

    assert.match(tag, new RegExp(`lang="${locale}"`), `${route}: wrong lang`);
    assert.match(html, /<main[^>]*id="main"/, `${route}: no main landmark`);
    assert.match(html, /<footer\b/, `${route}: no footer landmark`);
    assert.match(html, /<nav[^>]*aria-label=/, `${route}: unlabelled nav`);
    assert.match(html, /href="#main"/, `${route}: no skip link`);
    assert.match(html, /focus-visible/, `${route}: no focus-visible style`);
  }
});

test("no English placeholder survives in localized ULMOX text", () => {
  const english = T.LOCALES.en;
  const AUTHORED = Object.keys(english).filter(
    (key) => key !== "translationDisclaimer" && key !== "translateWithGoogle"
      && key !== "translationAttribution"
  );
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    for (const key of AUTHORED) {
      const value = T.LOCALES[locale][key];
      assert.ok(value && value.trim(), `${locale}.${key} is empty`);
      assert.notEqual(
        value,
        english[key],
        `${locale}.${key} is still the English string`
      );
    }
  }
  // The rollout sentence specifically, since it is new at this stage.
  const seen = new Set(LOCALES.map((l) => T.LOCALES[l].webGradualRollout));
  assert.equal(seen.size, LOCALES.length, "two locales share a rollout sentence");
});

/**
 * Every internal reference, `href` and `src` alike — a missing stylesheet or a
 * missing video is as broken to a store reviewer as a missing page.
 *
 * Stage 1.6W recorded one allowed exception here: `demo.mp4`, referenced by all
 * 20 landing pages and never present in this repository. Stage 1.6W.1 removed
 * the references, so the exception is gone with them and this check now has no
 * allowance at all — every local reference in the source tree must resolve.
 * `tests/page-shell.test.js` proves the same thing for the built output, and
 * `scripts/build-site.js` fails the build on a miss.
 */
const KNOWN_MISSING_ASSETS = new Set();

test("zero broken internal links across the whole site", () => {
  const broken = [];
  let checked = 0;
  for (const file of SITE_HTML) {
    const dir = path.dirname(path.join(ROOT, file));
    for (const match of read(file).matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) continue;
      const [target] = href.split("#")[0].split("?");
      if (!target) continue;
      if (KNOWN_MISSING_ASSETS.has(path.basename(target))) continue;
      checked += 1;
      const resolved = target.startsWith("/")
        ? path.join(ROOT, target.slice(1))
        : path.join(dir, target);
      const candidate = resolved.endsWith("/")
        ? path.join(resolved, "index.html")
        : resolved;
      if (!fs.existsSync(candidate)) broken.push(`${file} -> ${href}`);
    }
  }
  assert.ok(checked > 500, `only ${checked} internal references were checked`);
  assert.deepEqual(broken, [], `broken internal links: ${broken.join(", ")}`);
});

test("the missing landing-page video is gone, and no stand-in replaced it", () => {
  assert.equal(KNOWN_MISSING_ASSETS.size, 0, "a missing-asset exemption was reintroduced");

  const referencing = SITE_HTML.filter((file) => read(file).includes("demo.mp4"));
  assert.deepEqual(referencing, [], `demo.mp4 is still referenced by ${referencing.join(", ")}`);

  // Neither the file nor a zero-byte placeholder standing in for it.
  assert.ok(
    !fs.existsSync(path.join(ROOT, "demo.mp4")),
    "demo.mp4 was created rather than removed from the pages"
  );

  assert.match(
    CHECKLIST(),
    /The missing landing-page video[\s\S]{0,900}\*\*Resolved at Stage 1\.6W\.1\*\*/,
    "the resolution of the missing landing-page video is not recorded"
  );
});

test("internal links stay inside their own locale", () => {
  const localePrefix = new RegExp(`^(${LOCALES.join("|")})/`);
  for (const file of SITE_HTML) {
    const locale = file.split("/")[0];
    if (!LOCALES.includes(locale)) continue;
    for (const match of read(file).matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|tel:|#|\/)/.test(href)) continue;
      if (localePrefix.test(href)) {
        assert.ok(
          href.startsWith(`${locale}/`),
          `${file} links out of its locale: ${href}`
        );
      }
    }
  }
});

test("the sitemap stays valid and lists only built routes", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(sitemap, /<\/urlset>\s*$/);

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 0, "sitemap lists nothing");
  assert.equal(new Set(locs).size, locs.length, "sitemap has a duplicate URL");

  for (const loc of locs) {
    assert.ok(
      loc.startsWith("https://ulmoxapp.com/"),
      `sitemap URL is not on the production origin: ${loc}`
    );
    const route = loc.slice("https://ulmoxapp.com/".length);
    const file = route === "" || route.endsWith("/")
      ? path.join(ROOT, route, "index.html")
      : path.join(ROOT, route);
    assert.ok(fs.existsSync(file), `sitemap lists an unbuilt route: ${loc}`);
  }

  // Every Translation Information route is listed, root and localized.
  for (const route of ["translation.html", ...LOCALIZED_TRANSLATION]) {
    assert.ok(
      locs.includes(`https://ulmoxapp.com/${route}`),
      `sitemap omits ${route}`
    );
  }
});

test("robots stays valid and blocks nothing that must be indexed", () => {
  const robots = read("robots.txt");
  assert.match(robots, /^User-agent: \*/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/ulmoxapp\.com\/sitemap\.xml$/m);

  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)\s*$/gm)].map((m) => m[1]);
  // Only the redirect route is disallowed, and only that one.
  assert.deepEqual(disallowed, ["/delete-account/"]);

  // Nothing a reviewer needs is blocked.
  for (const page of CANONICAL_PAGES) {
    for (const rule of disallowed) {
      assert.ok(
        !`/${page}`.startsWith(rule),
        `robots blocks a compliance page: ${page}`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 21-23. Analytics, GA4 and the publication guard                            */
/* -------------------------------------------------------------------------- */

test("every deletion route is analytics-free in a real build", () => {
  const { buildSite } = require("../scripts/build-site.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-1-6w-"));
  try {
    buildSite({
      sourceRoot: ROOT,
      output: outputRoot,
      measurementId: "G-TEST123456",
      environment: "production",
    });

    const deletionRoutes = [
      "delete_account.html",
      "delete-account/index.html",
      ...LOCALES.flatMap((l) => [
        `${l}/delete_account.html`,
        `${l}/delete-account/index.html`,
      ]),
    ];
    assert.equal(deletionRoutes.length, 2 + LOCALES.length * 2);

    for (const relative of deletionRoutes) {
      const built = path.join(outputRoot, relative);
      assert.ok(fs.existsSync(built), `deletion route missing from build: ${relative}`);
      const html = fs.readFileSync(built, "utf8");
      assert.doesNotMatch(
        html,
        /googletagmanager|gtag\(|dataLayer|ULMOX_GA4_ANALYTICS|analytics\.js/,
        `${relative} carries analytics`
      );
    }

    // Every translation route is shipped, and is instrumented like any other
    // ordinary page — so the exclusion above is targeted, not global.
    for (const route of ["translation.html", ...LOCALIZED_TRANSLATION]) {
      const built = path.join(outputRoot, route);
      assert.ok(fs.existsSync(built), `translation route missing: ${route}`);
      assert.match(
        fs.readFileSync(built, "utf8"),
        /ULMOX_GA4_ANALYTICS/,
        `${route} was not instrumented`
      );
    }
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("GA4 remains unconfigured and the production verifier still demands a real ID", () => {
  const { buildSite } = require("../scripts/build-site.js");
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ulmox-ga-1-6w-"));
  try {
    const result = buildSite({
      sourceRoot: ROOT,
      output: outputRoot,
      measurementId: undefined,
    });
    assert.equal(result.measurementIdConfigured, false);
    assert.match(
      fs.readFileSync(path.join(outputRoot, "assets", "js", "analytics-config.js"), "utf8"),
      /"gaMeasurementId": ""/
    );

    // The verifier must still refuse this build. Weakening that check is how a
    // half-configured production deploy gets out.
    const { verifyProductionBuild } = require("../scripts/verify-production-build.js");
    assert.throws(
      () => verifyProductionBuild({ outputRoot }),
      /measurement/i,
      "the production verifier no longer requires a real Measurement ID"
    );
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

/**
 * Stage 1.6W.2 narrowed this from "entirely open" to "open where it matters".
 *
 * A checklist that cannot record finished work is not a checklist; it is a
 * wall, and a reader cannot tell from it what is left. What must stay open is
 * the work this repository cannot do: publication, deployment, store-console
 * actions and physical-device verification. Repository work that is genuinely
 * finished — the missing landing video, the accessible shell, the two
 * localized-content defects — is recorded as resolved, with the evidence, and
 * that is what makes the remaining list readable.
 */
test("the checklist keeps publication, console and device tasks open", () => {
  const checklist = CHECKLIST();

  assert.match(checklist, /\*\*Status: CLEARED FOR PUBLICATION\.\*\*/);

  // A console, device or deployment row may never be marked finished, in any
  // of the shapes a table row can take.
  for (const marker of [
    /\| \*\*Done\*\* \|/,
    /\| \*\*Complete\*\* \|/,
    /\| \*\*Completed\*\* \|/,
    /\| \*\*Verified\*\* \|/,
    /\| \*\*Published\*\* \|/,
    /\| \*\*Live\*\* \|/,
    /\| \*\*Closed\*\* \|/,
    /\| Done \|/,
    /\| Complete \|/,
    /\| Verified \|/,
    /\| Published \|/,
    /- \[x\]/i,
  ]) {
    assert.doesNotMatch(checklist, marker, `checklist marks an item finished: ${marker}`);
  }

  // And the list distinguishes finished repository work from remaining work,
  // rather than reading as one undifferentiated wall.
  const resolved = [...checklist.matchAll(/\*\*Resolved at Stage [0-9.A-Z]+\.?\*\*/g)];
  assert.ok(resolved.length >= 3, `only ${resolved.length} items are recorded as resolved`);
  const stillOpen = [...checklist.matchAll(/\*\*Open\.?\*\*/g)];
  assert.ok(stillOpen.length >= 5, `only ${stillOpen.length} items are recorded as open`);

  // Nothing claims the WEBSITE has been published. Deployment of the
  // application dependencies is a separate question, and eight of the nine
  // rows are now genuinely deployed -- so this no longer asserts that nothing
  // anywhere has shipped, which would be false.
  assert.doesNotMatch(checklist, /has been published to production/i);
  assert.doesNotMatch(checklist, /we have deployed/i);
  assert.match(checklist, /## Remaining blockers/);

  // Every console and device handoff table still reads Open.
  const handoffStart = checklist.indexOf("## Store-console, device and deployment handoff — all OPEN");
  assert.ok(handoffStart > -1, "the store-console handoff section is missing");
  const handoff = checklist.slice(
    handoffStart,
    checklist.indexOf("### Release gate — corrected at Stage 1.6W")
  );
  const rows = [...handoff.matchAll(/^\| (?!Item\b)(?!-)([^|]+)\| ([^|]+)\|$/gm)];
  assert.ok(rows.length >= 15, `expected the full handoff table, found ${rows.length} rows`);
  for (const [, item, state] of rows) {
    assert.match(
      state,
      /\*\*Open\*\*/,
      `handoff item is no longer open: ${item.trim()} -> ${state.trim()}`
    );
  }
});
