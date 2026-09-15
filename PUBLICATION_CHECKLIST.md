# ULMOX website — publication guard

**Status: CLEARED FOR PUBLICATION.**

*Cleared 2026-09-09.* This guard existed to stop the pages describing behaviour
that did not exist. All nine dependency rows below now read **Yes**, every one
of them against the production project rather than against source, and most by
observing real production data or a physical device. The last item that was not
a code question — operational readiness — has been confirmed by the ULMOX
operator, recorded below.

Cleared is not the same as published. Nothing here has been published, and the
publication itself is still a deliberate act taken through the release order.
This status means the pages may now be published, not that they have been.

**The guard does not retire.** If a page ever describes something again that is
not deployed, this file goes back to DO NOT PUBLISH. The store-console, device
and deployment handoff tables further down remain **Open** and are unaffected by
this clearance: by the Stage 1.6W order they come *after* these pages are live.

**What changed at Stage 1.6W.** This guard used to hold the pages back until the
matching app release was *live*. That rule could never be satisfied: store
reviewers require the compliance URLs to be working and accurate **before** they
will approve the binary that makes the release possible. The guard now blocks
the thing that was actually dangerous — **claiming a feature is available when it
is not** — rather than blocking publication itself. See
[Release order](#release-order--nothing-here-has-been-done). Publication remains
gated on the readiness steps in that order, every one of which is open.

---

## Why these pages are held back

Reconciled 2026-09-09 against the **production** project `ulmox-afbc3`, not
against this repository and not against the application source. "Deployed"
means the function is listed by `firebase functions:list` for that project, and
where possible that the behaviour has been observed in production data. Source
that exists but is not deployed reads **No**, and a passing test is not
evidence.

| Page claim | Depends on | Deployed? | Evidence |
|---|---|---|---|
| In-app Delete Account works | Stage 0 server-side `deleteUserAccount` | **Yes** | `deleteUserAccount` deployed. Exercised in production on six accounts, each through the ordinary in-app path with recent-auth required. |
| Erasure completes asynchronously, targeted within 30 days | Stage 0.2 resumable erasure worker | **Yes** | `processAccountErasureJobs` deployed (revision `processaccounterasurejobs-00005-qet`). Observed completing real jobs within minutes, far inside 30 days. Queue idle. |
| Username held 90 days after deletion | Stage 0.4 `DELETED_USERNAME_HOLD_DAYS` | **Yes** | Observed in production `usernames`: five reservations with `reservationStatus: deleted_account_hold`, `uid: null`, `reservedUntil` ≈ 89.8 days out. Applied by `releaseUsernameReservationsForUser` in the deployed deletion path. |
| Deactivation is reversible and hides Global content | Stage 0.7a–c | **Yes** | Deployed 2026-09-09: `deactivateUserAccount`, `reactivateUserAccount` and `processAccountDeactivationJobs` are all live and `Ready`, and `app_config/account_state.deactivationEnabled` is `true`. Verified on a physical iPhone against production: deactivate completed in 345 ms (`lifecycle: completed`), signing back in did **not** reactivate — the account stayed `deactivated` for two minutes until an explicit Reactivate tap — and reactivation restored `accountStatus: active` and `isDiscoverableForMatching: true`. Auth, age state and Terms acceptance survived; no erasure job was created. The recovery worker needed the `account_deactivation_jobs` composite index, which was missing and is now `READY`; the worker returned HTTP 200 on consecutive scheduler ticks after failing on three. |
| Blocking is server-owned and bidirectional | Stage 0.8 | **Yes** | `setBlockState` deployed; `isPairBlocked` consulted in both directions across delivery, Connections and Global paths. Production `user_blocks` documents observed carrying `aUid`, `bUid`, `bBlocksA`, `isBlocked`. |
| ULMOX is 18+ and asks for age | Stage 0.10 | **Yes** | `submitDeclaredBirthDate`, `submitPlatformAgeSignal` and `processAgeRestrictionJobs` deployed. `app_config/age_assurance.ageAssuranceEnabled` is **true**. The gate was exercised end to end on a physical iPhone and a physical Android device, each recording `declared_age` through the real callable. `adultEnforcementEnabled` remains **false**: the app *asks*, which is what this row claims, and does not yet *refuse*. |
| Report Content and Report User, child safety category | Stage 0.11 | **Yes** | `reportContent`, `reportUser` and `handleReportCreated` deployed. `REPORT_REASON.CHILD_SAFETY` is a first-class reason with its own handling. Production `reports` collection holds real reports. |
| Reversible quarantine of reported content | Stage 0.11 / 0.12 | **Yes** | `reviewModerationItem` deployed with `approve` / `hide` / `ban` / `nsfw`. Production `moderationQueue` shows the full cycle exercised: 16 `hidden`, 3 `auto_hidden`, **12 `approved`** — quarantine applied and reversed. |
| Only an admin can ban | Stage 0.12 | **Yes** | The only ban route is `reviewModerationItem`, gated by `canModerateUser(admin)` and additionally requiring `banConfirmed: true`. `account_ban_policy.js` refuses to ban an admin or a deleted account. `propagateBannedUserContent` deployed. No account has been banned in production (0), which is consistent with the claim: the row is about who *may* ban. |

Every row must read "Yes" before the corresponding sentence may be public.
**All nine now read Yes.** Publication remains blocked for a reason that is not
in this table — see [Remaining blockers](#remaining-blockers).

---

## Support-assisted deletion — claim removed

Removed 2026-09-09, in the canonical English and all eighteen translations.

The pages told a user whose Apple-linked account could not complete deletion on
an Android device to "contact Support **and we will handle it for you**", and a
second passage said such an account "is directed to Support instead". No
support-assisted deletion procedure has been established, so both stated a route
that does not exist.

The truthful behaviour is kept and unchanged: deletion stops before anything is
removed, the user is told nothing has been deleted, and the Apple confirmation
step must be completed on an Apple device. That part is verified in code —
`AppleRevocationOutcome` fails closed on cancellation, a missing authorization
code, a UID mismatch, a timeout and an unsupported platform.

Nothing was invented to replace the removed clause. If a real procedure is
established later, it can be described then.

---

## Language precedence

Added 2026-09-09. Every page that states binding obligations — Privacy, Terms,
Safety, Support and Delete Account, in all nineteen locales and at the canonical
root — carries a one-sentence notice in its own language saying the English
version is authoritative and applies if a translation differs.

It is rendered from `CHROME.<locale>.englishPrecedence` in
`scripts/page-shell.js` and gated by `LEGAL_ROUTES`, so it reaches every legal
route automatically and no other route at all. The English pages render the same
string through `footer()` in `scripts/legal-pages.js`, so there is one source of
truth for the sentence and for which pages carry it.

This is the one clause where translation risk is self-limiting: it subordinates
itself to the English text, so an imperfect rendering of it cannot change which
version governs. It does not conflict with anything already present — the
policies contain no governing-law, jurisdiction, consumer-law or
mandatory-language clause for it to contradict.

It does not upgrade the translations. They remain as described below:
authored in this repository, not approved by an independent legal or
professional translator.

---

## Claims these pages deliberately do **not** make

Checked by `tests/legal-pages.test.js`. Do not reintroduce any of them.

- ❌ automated video scanning, frame sampling, audio or transcript analysis
- ❌ automatic account bans, or bans triggered by a report count, by an
  automated filter, by a quarantine or by a translation
- ❌ Connections or message translation as **enabled**, **live**, **currently
  available**, or available **to every account** — Stage 1.6W. The pages now
  *describe* Connections, because a reviewer needs them to; every page that does
  carries the gradual-rollout sentence, and no page states the feature is on
- ❌ a specific live app version, or any claim that requires a website edit at
  the moment a server flag changes
- ❌ App Check enforcement as active — Stage 1.6A confirms it is off
- ❌ any reviewer account identifier, review-pair configuration, review routing
  behaviour, test-recipient override, App Check exemption list or internal
  environment variable name
- ❌ moderation thresholds, queue states, claim-lease behaviour or moderation
  tooling architecture
- ❌ internal operational event names
- ❌ Premium as available
- ❌ a named external reporting organisation (NCMEC, police, or any other)
- ❌ a guaranteed 24-hour case **resolution** (the 24 hours is a review target)
- ❌ a deletion timeframe the erasure worker cannot support
- ❌ a retention period that is only configured in a console we have not read
- ❌ a processor ULMOX does not actually use
- ❌ absolute security or encryption guarantees

---

## Remaining blockers

**None.** Both items previously listed here are closed, and the evidence for
each is recorded rather than asserted. Each is stated so it can be
closed by evidence rather than by assertion.

1. ~~**Deactivation is described but not deployed.**~~ **Closed 2026-09-09.**
   The three functions are deployed, the rollout flag is on, the missing index
   is `READY`, and the whole flow was verified against production on a physical
   device. The pages' wording was corrected at the same time: they said
   deactivation could be "reversed by signing back in", which the device test
   disproved — an explicit Reactivate tap is required, and every locale now says
   so.

2. ~~**Operational support readiness (release order, step 2).**~~
   **Closed 2026-09-09 by explicit commitment from the ULMOX operator.** No code
   can evidence this, and none is claimed to. What was committed:
   `ulmoxapp@outlook.com` will be actively monitored for child-safety reports
   and appeal requests; urgent child-safety matters will be prioritised; the
   stated **24-hour review target** will be operated; appeals will be read by an
   authorised human operator, who is authorised to take the moderation actions
   the production moderation system supports.

   Scope, stated precisely because the pages are precise: the commitment is to a
   target for *beginning* review, not to resolving a case within 24 hours. The
   pages already say exactly that, in all nineteen languages — every one pairs
   the 24-hour target with an explicit statement that it is not a guarantee of
   final resolution, and `tests/legal-pages.test.js` fails if that pairing is
   ever broken. No resolution-time guarantee is made here or anywhere else.

   The third element of the original blocker — a support-assisted deletion route
   for Apple-linked Android users — was **not** confirmed and is **not** claimed.
   The pages no longer offer it; see [Support-assisted deletion — claim
   removed](#support-assisted-deletion--claim-removed).

**Not a blocker — checked and clear.** `GA_MEASUREMENT_ID` is configured as a
repository variable on `FerdyG44/ulmox-site` (`G-YLHJFT9PY0`, set 2026-08-15),
so `deploy-pages.yml` will not stop on it. It fails locally only because the
variable is a CI value; with one supplied, `scripts/verify-production-build.js`
passes in full — 161 accessible pages, 140 sitemap URLs, 2062 references, robots
and sitemap verified.

The Apple and Google console items further down remain open. They are not
publication blockers: by the Stage 1.6W order they come *after* these pages are
live, and they gate *submission*, not publication.

---

## Release order — nothing here has been done

**Stage 1.6W replaced the previous order, which could not be executed.**

The old order said: deploy the app, verify everything against the deployed
build, and *only then* publish these pages — with a "release gate" repeating
that the compatible release must be **live** before any page describing this
behaviour goes up. That is a deadlock, not a safeguard:

- Apple and Google reviewers will not approve a submitted binary unless the
  Privacy, Terms, Safety, Support, Account Deletion and Translation Information
  URLs already work and already describe what the build does. The pages have to
  be public *before* submission.
- But the website must not claim Connections or message translation is already
  working for everybody, because it is not.

These only look like a conflict. **"Documented" and "available to everyone" are
two different claims**, and the pages now make only the first: each page that
describes Connections or translation carries the gradual-rollout sentence
(`webGradualRollout` in `scripts/translation-content.js`, hand-localized for all
19 locales), which is true before submission, true during review, true during a
staged rollout and true after a partial one. Nothing on the website has to be
edited at the moment a server flag flips — that coordination is precisely what
fails in practice.

Authority: the application repository README, section **"Website and store
sequencing"** and the six-item `ulmox-site` handoff beneath it.

### The order

1. **Final website verification.** Lint, tests, locale verification, build,
   internal links, sitemap, robots, the stale-claim scan, the analytics-free
   deletion-route scan.
2. **Operational support and contact readiness.** `ulmoxapp@outlook.com`
   monitored by a person who can act on a child-safety report, appeals handled,
   and the approved support-assisted deletion procedure for Apple-linked Android
   users actually in place — that route is promised on the deletion page and is
   a publication blocker until it exists.
3. **Publish the compliance and help pages.** Privacy, Terms, Safety, Support,
   Account Deletion and Translation Information, each carrying the
   gradual-rollout sentence. This happens **before** store submission, not
   after.
4. **Verify every public URL.** Each of the six, plus every locale route and
   both deletion routes, resolving over HTTPS on the production origin, with
   `robots.txt` and `sitemap.xml` served.
5. **Submit the compatible binary**, with reviewer instructions. Reviewers find
   every URL working and every feature described.
6. **Keep Connections disabled for ordinary users** until the backend
   prerequisites and the reviewer configuration are both ready.
   *Superseded 2026-09-09:* `app_config/connections.connectionsEnabled` is
   **`true`** in production, and the reviewer configuration this step was
   waiting for now exists — `app_config/store_review_pair` carries two isolated
   pairs, one per store. The step is therefore satisfied, not pending. Nothing
   on the website changed as a result, which is the property step 8 relies on:
   every page describing Connections carries the gradual-rollout sentence, so it
   is true whether the flag is on or off.
7. **Enable reviewer access through the server-owned review pair**, using the
   credential-free procedure below. Nothing about it appears on a public page.
8. **Complete review, then roll out under control.** Enable the flag gradually.
   **No website edit is required at this moment — that is the whole point.**
9. **Later, remove the gradual-rollout wording** — only once it has become
   genuinely obsolete, which means rollout is complete and the feature really is
   reaching every account on a supported version. Removing it earlier
   reintroduces the false claim this order exists to avoid.

### What still waits for its own prerequisite

Publishing the pages early does **not** advance anything else. These keep their
existing coordinated gates:

| Gate | Waits for |
|---|---|
| Terms enforcement (`requiredTermsVersion`) | the Terms URL being live **and** serving the version the app requires |
| `connectionsEnabled` | the deployment order in the app repository README, completed in full |
| Translation | reachable only through Connections, so it inherits that gate |
| App Check enforcement | the compatible release being live and adopted — see below |
| Firestore indexes, rules and functions | the deployment order, indexes first |

---

## Private store-console notes — not for publication

These belong in the Google Play Console, not in any public HTML page.

- **Child safety point of contact (Play Console):** Ferdi Gülseren.
- The public pages deliberately use the role label
  **"ULMOX Child Safety Contact"** with `ulmoxapp@outlook.com`, so an
  individual's name is not published unnecessarily. Play Console requires a
  named individual; the public web page does not.
- Play Console **Child Safety Standards certification** is a manual deployment
  task and has not been performed.
- The published CSAE standards URL to enter is
  `https://ulmoxapp.com/safety.html`.

---

## Stage 0.14B-R reconciliation — local code complete, still undeployed

These landed in the application repository and were verified read-only against
the source and the final merged manifests. **"Local code complete" is not
"deployed" and is not "verified on a device."** Nothing below may be treated as
released.

| Item | State | Evidence |
|---|---|---|
| Apple authorization revocation | **Local code complete — undeployed, unverified on device** | `lib/services/apple_revocation_service.dart` uses `revokeTokenWithAuthorizationCode`; deletion fails closed on cancel, missing code, UID mismatch, timeout or revocation failure. |
| iOS Always-location key removed | **Local code complete — undeployed** | `NSLocationAlwaysAndWhenInUseUsageDescription` absent from `ios/Runner/Info.plist`; `NSLocationWhenInUseUsageDescription` retained. |
| Android broad media permissions removed | **Local code complete — undeployed** | `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_VISUAL_USER_SELECTED` absent from the final merged release manifest. `READ_EXTERNAL_STORAGE` retained at `maxSdkVersion=32` only. |
| Advertising permissions removed | **Local code complete — undeployed** | `AD_ID`, `ACCESS_ADSERVICES_AD_ID` and `ACCESS_ADSERVICES_ATTRIBUTION` removed via `tools:node="remove"`; absent from the merged manifest. |
| Runner privacy manifest | **Local code complete — undeployed** | `ios/Runner/PrivacyInfo.xcprivacy` declares only `NSPrivacyAccessedAPICategoryFileTimestamp` / `C617.1`, tracking `false`, no tracking domains. Collected-data declarations remain an App Store Connect responsibility and are deliberately absent rather than falsely declared empty. |
| robots.txt / sitemap.xml packaging | **Fixed in this repository** | Both now copied to `dist/` by `scripts/build-site.js`; `scripts/verify-production-build.js` fails the build if either is missing, malformed, wrongly originated or lists an unbuilt route. Not published. |

---

## Store-console, device and deployment handoff — all OPEN

Manual actions in consoles, on devices and in production. This repository must
never touch them, and **none has been performed.** An item is not complete
because the supporting code exists locally.

### Apple — device, Firebase and App Store Connect

| Item | State |
|---|---|
| Revocation verified on a signed physical Apple device | **Open** |
| Confirmation the app disappears from Apple ID → "Apps Using Apple ID" after deletion | **Open** |
| Apple provider configuration in the Firebase Console | **Open** |
| Apple Declared Age Range capability and provisioning | **Open** — entitlement absent and unprovisioned |
| App Store age rating set to 18+ | **Open** |
| Apple privacy nutrition label / collected-data declarations | **Open** |

### Google — Play Console

| Item | State |
|---|---|
| Target Audience excluding children | **Open** |
| Content rating questionnaire | **Open** |
| Data Safety declarations | **Open** |
| Play Child Safety Standards certification | **Open** — CSAE URL to enter: `https://ulmoxapp.com/safety.html` |
| Named private child-safety contact | **Open** — Ferdi Gülseren, Play Console only |
| Play Age Signals terms and configuration | **Open** |

### Operations and process

| Item | State |
|---|---|
| Approved support-assisted deletion procedure for Apple-linked Android users | **Open** — the deletion page promises this route; it must exist before publication |
| Server-side cross-platform Apple revocation, if later required | **Open** — not implemented; FlutterFire exposes this API on Apple platforms only |
| App Check adoption, then enforcement | **Open** — adopt in monitoring mode first; enforce only after the compatible release is live, or existing installs break |
| Analytics, Crashlytics and Performance retention verification | **Open** — console-configured, unread |
| Production `needs_attention` alerting | **Open** |
| Coordinated `requiredTermsVersion` activation | **Open** |
| Compatible application deployment and adoption | **Open** |

### Disclosures still to reconcile with the stores

| Item | State |
|---|---|
| `com.android.vending.BILLING` merged from `in_app_purchase` | **Open** — Premium is invisible and inactive. No public page mentions Premium, and none may until it exists. The permission must still be explained in the Play declaration. |
| `USE_BIOMETRIC`, `USE_FINGERPRINT`, `VIBRATE` | **Open** — merged from dependencies, pending device verification |

### Release gate — corrected at Stage 1.6W

**Superseded:** "the compatible application release must be live before any page
describing this behaviour is published." That rule deadlocked against store
review, which requires the pages first. It is replaced by the order above.

**What still gates publication**, all open:

| Gate | State |
|---|---|
| Every step 1 and 2 item in the release order | **Open** |
| Approved support-assisted deletion procedure for Apple-linked Android users | **Open** — the deletion page promises this route; it must exist before publication |
| Apple revocation deployment and signed-device verification | **Open** — see below |
| Analytics, Crashlytics and Performance retention values | **Open** — the Privacy Policy says they are console-configured rather than inventing a number |

**Apple authorization revocation**, carried forward unchanged from the previous
order and still a publication blocker for the sentences that describe it:

1. Verify Sign in with Apple authorization revocation on a signed physical
   Apple device (Stage 0.14A.1). **Local code complete, not deployed, not
   device-verified.** The app uses Firebase Auth's official
   `revokeTokenWithAuthorizationCode`; there is no custom Apple REST call, no
   private key, Team ID, Key ID or client-secret JWT anywhere in the app. This
   is separate from Firebase refresh-token revocation
   (`getAuth().revokeRefreshTokens`), which only invalidates ULMOX sessions.
2. The website describes revocation only as behaviour that applies to an account
   **linked with** Sign in with Apple, never as verified or live. **Open.**

**What no longer gates publication:** the app release being live. The pages are
allowed to describe Connections and translation before rollout *because* they
carry the gradual-rollout sentence and make no availability claim. If that
sentence is ever removed from a page while the feature is still rolling out, the
page becomes false and this gate is back.

---

## Stage 1.3T-W — optional on-device message translation

Local code complete in the application repository, **undeployed and disabled**.
Connections and translation both resolve to off unless a server flag is exactly
`true`, and no flag has been set. Nothing below has been performed.

### What the website now says, and what it rests on

| Website claim | Rests on | Live? |
|---|---|---|
| Translation is optional and user-initiated | Stage 1.3T.1 — runs only on `Translate with Google` | **No** |
| Translation runs on the device | ML Kit Translate 17.0.3 / language-id 17.0.6 (Android); GoogleMLKit/Translate 8.0.0 / LanguageID 8.0.0 (iOS) | **No** |
| ULMOX stores no translation | In-memory cache only; never written to Firestore, preferences, a file, a log or analytics | **No** |
| Reports and moderators use the original | Report payload carries the server message | **No** |
| Language packs are managed in the app | Translation Models screen | **No** |

### Store, device and legal handoff — all OPEN

| Item | State |
|---|---|
| Compatible app release deployed | **Open** — Stage 1.6W corrected the sequence: the page may be published *before* this, because it carries the gradual-rollout sentence and claims no availability. It stays open as a release step |
| Real-device ML Kit testing on a physical iOS device | **Open** |
| Real-device ML Kit testing on a physical Android device | **Open** |
| App Store description states Google Translate powers translation | **Open** — Google's attribution rules require the application description to say so; this page is only the help-documentation half |
| Play listing / in-app help disclosure | **Open** |
| App Store privacy answers updated for ML Kit | **Open** |
| Play Data Safety answers updated for ML Kit | **Open** |
| App Review Notes describing the feature and its flags | **Open** |
| Signed iOS App Thinning size measurement | **Open** — ML Kit adds materially to the binary |
| Xcode Organizer privacy-report verification | **Open** |
| Legal/product acceptance of Google's UGC branding risk | **Open** — a Google mark shown beside user-generated content |
| Connections rollout flag (`app_config/connections.connectionsEnabled`) | **Set 2026-09-09** — `true` in production. Reviewer isolation is configured separately in `app_config/store_review_pair`. |
| Translation rollout | **Open** — reachable only through Connections |

### Google attribution — decision recorded

The application ships Google's own badge PNGs, byte-for-byte, because Google
requires the "powered by Google Translate" graphic "adjacent any translation
results" and the app renders translation results.

**The website does not ship that graphic.** This page renders no translation
result, so the badge is not required on it, and placing a Google mark on a page
that carries no translation would suggest an endorsement ULMOX does not have.
The page instead carries what Google's application requirement does ask for:
a statement that Google Translate powers translation, links to Google Translate
and Cloud Translation, and the disclaimer reproduced verbatim. No mark is
recreated, restyled, abbreviated or substituted with invented artwork. If legal
review decides the badge belongs here too, take it from Google's archive — never
from the application's copy and never redrawn.

---

## Stage 1.6W — the six-item Stage 1.5 handoff, consumed

The application repository README carries a six-item handoff to `ulmox-site`,
under **"Handoff to `ulmox-site` (a separate repository, not edited here)"**.
Every item is addressed below. `tests/stage-1-6w-handoff.test.js` fails if any
one of them silently regresses. **Consuming a handoff item is a wording change
in this repository — it deploys nothing and publishes nothing.**

| # | Handoff item | Where it now lives | State |
|---|---|---|---|
| 1 | The gradual-rollout sentence must be added to every page that describes Connections, before submission | `webGradualRollout`, hand-localized for 19 locales, rendered on Privacy, Terms, Safety, Support and all 20 Translation Information routes | **Applied — not published** |
| 2 | The Translation Information page must carry the Stage 1.3T/1.3T.1 wording: message text is **not** sent to Google to be translated, and it must **not** claim ML Kit never contacts Google or that no data leaves the device | `scripts/translation-content.js` and the Translation and Privacy pages, including the "three things we will not claim" callout | **Applied — not published** |
| 3 | The Account Deletion page must not imply every account can complete deletion in-app on Android; an Apple-linked account on a non-Apple platform is directed to support | Deletion page: the caveat is now in Option 1 itself, with an in-page link to the Apple-linked section, not only further down | **Applied — not published** |
| 4 | Sign in with Apple must not be described as an available sign-up option: the code path exists but no screen calls it | Every mention is conditional — "if your account **is linked with**" — and no page lists it as a way to sign up | **Applied — not published** |
| 5 | The Safety page must describe reporting, blocking, End Connection, the seven-day message retention, and that reporting hides a message **for the reporter only** | Safety page, new "Safety in Connections" section | **Applied — not published** |
| 6 | A named private child-safety contact must be published before the child safety certification is submitted | Play Console only. The public pages use the role label; the individual is named in the private notes above | **OPEN — console action, not performed** |

Item 6 is the only one this repository cannot close. Items 1–5 are wording; item
6 is a console entry, and it stays open.

### Android legacy storage disclosure — the omission Stage 1.5 found

Stage 1.5's handoff did not mention the remaining `WRITE_EXTERNAL_STORAGE`
declaration. It was verified read-only against the application's **final merged
release manifest** — not the hand-written `AndroidManifest.xml`, which does not
contain it, because a dependency contributes it.

| Declaration | Cap | Reaches | Disclosed as |
|---|---|---|---|
| `READ_EXTERNAL_STORAGE` | `maxSdkVersion="32"` | Android 12 and earlier | legacy read permission, capped |
| `WRITE_EXTERNAL_STORAGE` | `maxSdkVersion="28"` | Android 9 and earlier | legacy write permission, capped — **this is the one that was missing** |
| `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_VISUAL_USER_SELECTED` | — | — | **absent from the merged manifest**; never claimed present |

The Privacy Policy now discloses both legacy declarations, each with its own
cap, and states that neither is a modern photo- or video-library permission and
that a modern Android version cannot be granted either. It publishes no manifest
dump and names no permission constant. Android image selection is described as
going through the system photo picker; the iOS photo-access and add-access
behaviour stays separately described, because a single cross-platform sentence
in either direction would be false.

### App Check — the public/private boundary

**Public pages may say only** that ULMOX uses Firebase App Check / device
integrity protections, where the platform supports them, to reduce abuse. That
is all the Privacy Policy says.

**Nothing below may reach a public page.** It is operational.

| Fact | State |
|---|---|
| App Check enforcement | **OFF.** Stage 1.6A confirms it remains disabled pending adoption evidence. No page claims otherwise |
| Register providers in the Firebase Console in monitoring mode | **Open** — console action |
| Observe verified-versus-unverified traffic for a full release cycle | **Open** |
| Enforcement, gradually, only after the compatible release is live and adopted | **Open** — enforcing before adoption breaks every installed build |
| Callable inventory, categories, exemption list, ramp order | Application repository only. Not restated here and never public |
| Internal environment variable names controlling rollout and exemptions | Application repository only. **Never** in this repository, in any file, public or private |

App Check is not authorization. It is evidence that a request came from a
genuine build, and it substitutes for no other server-side check.

### Reviewer access — credential-free, private, never a public page

The store-review pair is a **review mechanism, not a consumer feature.** It must
never be described on a public page, and the public pages describe only real
product behaviour: persistent non-anonymous accounts, two prior qualifying video
encounters, mutual approval, no user search, text-only Connections, no
attachments, Report User and Report Message, Block and End Connection, human
moderation, optional on-device translation, and 18+ access.

**No email address, password, uid or token appears in this repository, and none
may be added to it.** The full procedure lives in the application repository
README under "Reviewer provisioning runbook". Its shape, for sequencing only:

1. Two ordinary accounts, created through the normal sign-up flow on two
   devices. Nothing about them is special except a server-owned configuration
   document that names them. **Open.**
2. Both profiles completed, adult status established through the same age flow
   every user takes, current Terms accepted on both. **Open.**
3. The configuration document written in the console, with a **bounded**
   validity window — an unbounded review pair is a permanent hole in production
   matching that nobody remembers to close. **Open — console action.**
4. Read-only validation, which reports codes and never identities and cannot
   write. **Open.**
5. The two-device walkthrough, in the documented order, ending with Block and
   End because both are terminal. **Open.**
6. After review: disable the configuration, or let the window expire. **Open.**

Nothing in that flow seeds eligibility, activates a Connection or grants a
bypass, and none of it is a shortcut around ordinary matching for anyone else.

### Moderation, evidence and deletion — reconciled with Stage 1.4

Public wording, verified read-only against the application repository:

- Video moderation and message moderation are **human-reviewed**.
- An automated filter holding a message back, and a quarantine, are decisions
  about an item — **never** about an account.
- **No user is automatically account-banned**, by report count, by an automated
  filter, by a translation or by a quarantine. Only an authorised administrator
  can ban, as a separate confirmed decision.
- An approved video returns to Global **only if it independently still
  qualifies** on every other eligibility and safety condition.
- Resolving a report removes it from the active review list and **preserves**
  justified evidence and the audit record of what was decided.
- A report always carries the original content. **A translation is never
  moderation evidence.**
- Ordinary Connection messages have a **logical** seven-day expiry. **Physical
  TTL is not enabled** and is not claimed as active anywhere; the pages describe
  seven days as a rule about the message, not as a guaranteed erasure timer.
- Safety evidence is **not** ordinary message history and is not governed by
  seven-day expiry.
- Justified evidence may survive account deletion with identity links scrubbed.
- Deleting one account does not delete the other participant's data.
- Deactivation erases no evidence. Reactivation restores access only — never a
  moderated decision, removed content, or an ended Connection.
- Account deletion and deactivation stay described as different things.
- **No new fixed evidence-retention period was introduced**, here or on any page.

Internal thresholds, queue states, claim-lease duration and moderation tooling
architecture are absent from every public page and are not restated here.

### Child safety — operational truth

| Item | State |
|---|---|
| Public role label **"ULMOX Child Safety Contact"** with the existing public contact route | In place on the Safety page. The individual is **not** named publicly |
| Named private individual entered in Play Console | **OPEN** — see the private notes above. Recorded here; **not** entered |
| Child-safety reports receive highest-priority human review | Stated publicly |
| The 24-hour statement is a **review target**, not guaranteed resolution | Stated publicly, and enforced by test |
| External authority / NCMEC reporting | **Not claimed.** No integration exists. The page states only that we report where applicable law requires it, naming no organisation |
| Console alert on the child-safety operational event | **OPEN** — console action, not performed. The event name is internal and appears on no public page |
| Emergency services for immediate danger | Stated publicly, first, before the reporting routes |

---

## Stage 1.6W.2 — localized policy content parity

### What this stage changed

The 95 localized Privacy, Terms, Child Safety, Support and Account Deletion
pages were hand-written HTML with no relationship to the canonical English
pages. Two release blockers lived in that gap: seven safety pages described
automated content detection that does not exist, and 36 pages repeated two or
three sentences instead of stating policy. Both are closed. All 95 routes are
now generated, and the generator is the only way they can exist.

### The content architecture

| Piece | What it holds |
| --- | --- |
| `scripts/policy-schema.js` | The section order and block shape of the five canonical pages, with stable section IDs. No policy text. |
| `scripts/policy-locales/<code>.js` | One file per translated locale — 18 of them — holding one string per slot the schema declares. |
| `scripts/generate-localized-policies.js` | Renders `<locale>/<page>.html` from the two above, through `scripts/legal-pages.js` and `scripts/page-shell.js`. |
| `scripts/generate-legal-pages.js` | Unchanged in role: the canonical English policy text, and the only place it lives. |

English is deliberately absent from `scripts/policy-locales/`. `/en/privacy.html`
and its siblings are the canonical `/privacy.html` and its siblings, re-shelled
for their routes, so there is no second hand-maintained English policy to drift
from the first.

A locale that is missing a section — or one bullet inside one — cannot be
rendered at all: the generator throws with the page, section and slot index.
`npm run parity` prints the 5-page × 19-locale section matrix.
`npm run generate` is idempotent; `tests/page-shell.test.js` and
`tests/policy-parity.test.js` both regenerate into a scratch tree and compare.

### Canonical revision each locale implements

All 18 translated locales declare **canonical revision 2026-09-04**, the
effective date of the canonical pages. The revision is recorded three ways: in
`revision` in each locale file, in `CANONICAL_REVISION` in
`scripts/policy-schema.js`, and in a `ulmox-policy-revision` meta tag on every
one of the 95 rendered routes. `scripts/scan-stale-claims.js` fails on drift
between them.

**These translations were authored in this repository and reviewed by the same
process that wrote them. They are not certified translations. No independent
legal reviewer and no professional or native-speaker translator has read them.**

### Canonical wording corrected before translating

One canonical statement contradicted a decision recorded elsewhere in this
repository, and was corrected in `scripts/generate-legal-pages.js` before it was
translated into 18 languages.

| Where | Was | Now |
| --- | --- | --- |
| `/privacy.html` §3, `/delete_account.html` "If you only want a break" | "Ending a Connection and blocking someone are both final." | Ending is final for that pair. A block ends the current Connection and stops contact both ways while it stands; removing it does not restore the old Connection, and the pair would have to qualify again from the beginning — two fresh qualifying video exchanges and a fresh approval from each person. |
| `/terms.html` §3 | "Ending a Connection is final, and so is a block: a pair that was ended or blocked does not resume, and would have to become eligible again from the beginning." | Same correction. The old sentence also contradicted itself: a pair cannot both never resume and become eligible again. |
| `/safety.html` "Safety in Connections" | Block described only as stopping interaction. | The same requalification path is now stated on the Safety page too, so all four pages agree. |

Nothing else in the canonical policies was changed. No retention period,
moderation promise, external reporting claim or eligibility rule was introduced.
The automated text filter for Connections messages stays described exactly as it
was — an item-level hold that is not a decision about an account — and no page
in any language now says ULMOX uses no automated filtering.

### What the checks cover

| Check | Command | Covers |
| --- | --- | --- |
| Section parity | `npm run parity` | 95 routes cover all canonical sections, no empty slot |
| Claims and repetition | `npm run scan:claims` | Automated-detection sections, repeated content, section gaps, one locale pasted into another, revision drift |
| Policy figures | `npm test` | Every retention window, age limit and Android version cap agrees with the canonical page, in all 19 locales |
| English prose leakage | `npm test` | No eight-word run of canonical English prose survives in a localized page |
| Accessibility and references | `npm run audit` | 161 built routes, 2062 local references |

## Open blockers

- Analytics, Crashlytics and Performance retention windows are **UNKNOWN**
  (console-configured, not read). The Privacy Policy states this truthfully
  rather than inventing a number; it must be replaced with the real value once
  verified.
- GA4 is **not configured**: `GA_MEASUREMENT_ID` is unset, so the built site
  currently loads no analytics. If it is ever configured, EU/EEA consent
  behaviour must be reviewed before that build is deployed — see
  "Website analytics" in the Stage 0.13 report.
- Apple authorization revocation is implemented locally but is **not deployed**
  and has **not** been verified on a signed physical Apple device. The website
  describes it only as behaviour applying to an account linked with Sign in with
  Apple, never as verified or live, and `tests/legal-pages.test.js` fails if a
  page starts to claim device verification.
- Sign in with Apple is implemented but **not reachable from the current
  application UI**, so no page advertises it as a sign-up option.
- Historical Apple-linked production accounts are **unknown**: production access
  was forbidden, so no statement is made about them.
- Connections is **deployed and the flag is on**: as of 2026-09-09
  `app_config/connections.connectionsEnabled` is `true` in production. Message
  translation remains reachable only through Connections. This changes nothing
  on the website, by design.
  The Translation Information page and the Connections and translation sections
  of the Privacy Policy, Terms, Child Safety Standards and Support pages carry
  the gradual-rollout sentence rather than an availability claim;
  `tests/translation-pages.test.js` and `tests/stage-1-6w-handoff.test.js` fail
  if that sentence disappears or if a page starts claiming the feature is on.
- **App Check enforcement is off** and remains off pending adoption evidence
  (Stage 1.6A). Provider registration in monitoring mode, observation of
  verified-versus-unverified traffic, and gradual enforcement are all **open
  console and deployment actions**. No public page claims enforcement is active.
- **The store-review pair has not been provisioned.** Two ordinary accounts, the
  server-owned configuration document with a bounded window, read-only
  validation and the two-device walkthrough are all open. No credential, uid,
  email address or token exists in this repository, and none may be added.
- **The console alert on the child-safety operational event has not been
  created.** The server already logs the structured, identity-free line; the
  alert is a console action and is open. The event name is internal and appears
  on no public page.
- **The named private child-safety contact has not been entered in Play
  Console.** The individual is recorded in the private notes above only. The
  public pages use the role label "ULMOX Child Safety Contact" and name nobody.
- **Physical TTL for Connection messages is not enabled.** The seven-day expiry
  is a logical rule about a message, and the pages describe it that way rather
  than as an active erasure timer.
- **The approved support-assisted deletion procedure for Apple-linked Android
  users does not exist yet.** The deletion page directs those users to Support,
  so that route must be operational before publication.
- **The missing landing-page video.** Every landing page referenced
  `demo.mp4`, which has never existed in this repository — not tracked, not
  untracked, not in any commit, and no rights-cleared demo video exists here.
  **Resolved at Stage 1.6W.1**, with no file invented to fill the gap. The
  `<video>` element and the decorative "▶" that read as a play control are gone
  from all 20 landing routes; the space is now a static product introduction
  built from the ULMOX logo, an asset this repository owns, and the localized
  line the page already displayed. `scripts/build-site.js` now fails the build
  on *any* local reference that does not resolve in the output, so a second
  missing asset cannot ship the way the first one did.
- **The site-wide accessible page shell.** The 20 landing pages, the 95
  hand-localized legal and support pages, the 20 deletion redirects and the
  download page carried no `<main>`, `<footer>` or `<nav>` landmark, no skip
  link and no `focus-visible` style; several had no `<h1>` at all, and 16
  locales' Support pages had lost their heading markup entirely, leaving the
  page title as a bare text node. **Resolved at Stage 1.6W.1.** All 136 are now
  emitted through `scripts/page-shell.js`, the same contract the 25 generated
  routes already met. `tests/page-shell.test.js` runs the full battery against
  every page of a real build — 161 routes — rather than a sample.
- **Seven localized safety pages that described automated content detection.**
  `en`, `sv`, `tr`, `de`, `es`, `fr` and `it` `safety.html` each carried a
  section — "AI-Assisted Detection" and its translations — stating that ULMOX
  "may use automated systems to detect potentially unsafe or inappropriate
  content". The canonical `/safety.html` states the opposite under "What ULMOX
  does not do": ULMOX does not automatically analyse video frames, audio or
  transcripts, and does not ban accounts automatically.
  **Resolved at Stage 1.6W.2.** All seven sections are gone, replaced by a
  translation of the canonical "What ULMOX does not do" — which denies
  automated video, audio and transcript analysis and denies automatic bans,
  while still describing the automated text filter that does exist for
  Connections messages, and still describing it as an item-level hold that is
  not a decision about an account. `scripts/scan-stale-claims.js` no longer
  holds an inventory of permitted sections: the seven headings are a blocklist
  checked against all 19 locales, alongside a script-aware heading pattern, and
  `tests/page-shell.test.js` fails if any of them reappears anywhere.
- **Twelve locales' localized Privacy, Terms and Child Safety pages repeated
  themselves instead of stating policy.** `pt`, `nl`, `pl`, `fi`, `ru`, `ja`,
  `ko`, `zh`, `ar`, `hi`, `th` and `vi` — 36 routes — reused the same two or
  three sentences under headings that repeated the page title. Measured as the
  share of block-level elements inside `<main>` whose text is distinct:
  Privacy 54%, Terms 41%, Child Safety 26% (Arabic 54/63/47).
  **Resolved at Stage 1.6W.2.** All 95 localized policy routes — the five pages
  across all 19 locales, not only the 36 — are now generated from
  `scripts/policy-locales/<code>.js` through `scripts/policy-schema.js`, and
  every one of them measures 100% distinct. The English routes are not a second
  copy: `/en/*.html` is the canonical `/privacy.html` and its siblings,
  re-shelled for their routes. Run `npm run scan:claims` for the figures and
  `npm run parity` for the 5-page × 19-locale section matrix.
  **These translations were authored in this repository against canonical
  revision 2026-09-04 and reviewed by the same process that wrote them. No
  independent legal or professional translator has approved them, and no native
  speaker has read them. That review is still open** — see the release-gate
  note below.
- **No independent linguistic review of the 18 translated locales.** The
  localized Privacy, Terms, Child Safety, Support and Account Deletion pages
  are complete and at section parity with the canonical English revision
  2026-09-04, and the structural, claim and prose checks all pass. What has not
  happened is a reading by a professional translator or a native speaker of
  each language, and no visual check on a real device in any locale. **Open.**
  This is a review task, not a code task; the repository cannot perform it and
  does not claim it was performed.
- No published human-moderation SLA beyond the 24-hour child-safety review
  target.
- **No fixed evidence-retention period has been introduced**, and none may be
  invented here. Evidence is retained where there is a justified safety, abuse
  prevention, legal or appeals reason, for as long as that reason applies.
- **The 20 landing pages described a product that no longer exists.** Every
  landing route sold "real video moments" and three feature cards — "Real
  videos", "Daily moments", "Global feed" — and named none of the surfaces a
  person actually opens. World Live appeared nowhere on the website, in any
  language; Connections appeared only in the legal pages, so the one page a
  store reviewer, a journalist or a prospective user reaches first described a
  different app from the one the Terms govern. **Resolved at Stage 1.6X.** All
  20 routes now carry Hero, How ULMOX works, World Live, Connections, Global,
  Why ULMOX is different, Safety and control, and the download call to action,
  from `scripts/landing-content.js` through
  `scripts/generate-landing-pages.js`. The Connections section states the flow
  the Terms state — genuine encounters can make a Connection *possible*, either
  person may then ask, both approve independently, and only then text messages
  and each other's profile — and renders each locale's own
  `webGradualRollout` sentence from `scripts/translation-content.js`, the same
  sentence the six legal pages carry, so the landing page and the Terms cannot
  come to disagree about whether the feature is on. No screenshot was invented:
  this repository owns `logo.png` and two store badges, and every other
  illustration on the page is an `aria-hidden` drawing. No statistic,
  testimonial, user count, rating or review appears in any locale, and
  `tests/landing-pages.test.js` fails on a two-digit number in any slot but the
  copyright line.
- **Every Arabic route on the site could be scrolled 9999px sideways.** Both
  page shells hid the skip link with `left: -9999px`. That offset is off-screen
  on a left-to-right page and *inside the scrollable overflow area* of a
  right-to-left one, so all 20 Arabic routes — landing, legal, support,
  deletion — had 9999px of empty page to the side of the content, on every
  device. Measured in a headless browser: `scrollLeft` ranged `-9999..0` on
  `/ar/` and `/ar/privacy.html`, and `0..0` on the English equivalents.
  **Resolved at Stage 1.6X.** Both shells clip the link to a 1px box instead,
  which hides it in either direction and keeps it in the tab order; the range
  is now `0..0` on every route at 320, 390, 768 and 1440px. A related hole was
  closed with it: `applyShell()` only added its stylesheet when the page had no
  shell marker, so a page could never receive a *corrected* shell — the
  download page kept the old rule through the fix. It replaces an existing
  block now, and generation is still idempotent.
- **No native speaker has read the new landing copy in the 18 translated
  locales.** The Connections, World Live, Global and differentiation sections
  are new marketing prose, authored in this repository in all 19 languages
  against the English master, and reviewed by the same process that wrote them.
  Every slot is filled, no slot is still the English string, and the product
  claims match the Terms. What has not happened is a reading by a native
  speaker of each language, or a visual check on a real device in any locale.
  **Open.** This is the same review task as the localized policy pages above,
  and it is a review task, not a code task.
