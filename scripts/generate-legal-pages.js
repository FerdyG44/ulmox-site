"use strict";

/**
 * Stage 0.13 — generates the ULMOX legal and safety pages.
 *
 * Every claim below is traceable to implemented behaviour in the app
 * repository. Nothing here describes automated video analysis, automatic
 * account bans, Premium, or a named external reporting organisation, because
 * none of those exist.
 *
 * Stage 1.6W changed one item on that list. Connections used to be undescribed,
 * on the reasoning that an undeployed feature should not be written about. The
 * application repository's README rejects that, and the reason is a store
 * reviewer: reviewers will not approve a binary whose Privacy, Terms, Safety,
 * Support, Account Deletion and Translation URLs do not work and do not
 * describe what the build does, and a page that says a feature is "coming soon"
 * when the reviewer is looking straight at it reads as a false page. So
 * Connections is now described in the present tense, as a feature of the app,
 * with an explicit availability statement (T.LOCALES.<locale>.webGradualRollout)
 * that stays true before submission, during review, during a staged rollout and
 * afterwards. "Documented" and "available to everyone" are different claims and
 * these pages make only the first.
 *
 * What is described is only real product behaviour. Store-review routing, the
 * reviewer pair, App Check enforcement state and exemptions, moderation
 * thresholds, queue mechanics and internal configuration are operational
 * matters and live in PUBLICATION_CHECKLIST.md, never here.
 *
 * Run with: node scripts/generate-legal-pages.js
 */

const fs = require("fs");
const path = require("path");

const { CONTACT_EMAIL, CHILD_SAFETY_LABEL, page, footer } = require("./legal-pages");
const { siteFooter } = require("./page-shell");
const T = require("./translation-content");

const ROOT = path.resolve(__dirname, "..");

const IN_APP_PATH =
  "Profile &rarr; Legal &amp; Safety &rarr; Account Management &rarr; Delete Account";

/* -------------------------------------------------------------------------- */
/* Delete Account                                                             */
/* -------------------------------------------------------------------------- */

const deleteAccount = page({
  file: "delete_account.html",
  title: "Delete Your ULMOX Account",
  description:
    "How to permanently delete your ULMOX account, in the app or by request.",
  heading: "Delete your ULMOX account",
  body: `    <p>
      This page explains how to permanently delete your ULMOX account and what
      happens to your data afterwards.
    </p>

    <div class="callout">
      <p>
        <strong>Deactivating is not deleting.</strong> Deactivation hides your
        profile and your content and can be undone. Deleting your account is
        permanent and cannot be undone.
      </p>
    </div>

    <h2>Option 1 — delete in the app (preferred)</h2>
    <p>
      This is the fastest route and needs no email exchange. It is not available
      to every account on every device: an account linked with Sign in with
      Apple cannot finish deletion from an Android phone, and must complete it
      on an Apple device. See
      <a href="#apple-linked">If your account is linked with Sign in with
      Apple</a> below.
    </p>
    <ol>
      <li>Open ULMOX and go to <strong>${IN_APP_PATH}</strong>.</li>
      <li>Read the confirmation, which explains that deletion is permanent.</li>
      <li>Confirm. You may be asked to sign in again first, which protects your
        account from someone else deleting it.</li>
    </ol>

    <h2>Option 2 — request deletion by email</h2>
    <p>
      If you cannot open the app, you can ask us to delete your account.
    </p>
    <p>
      <a href="mailto:${CONTACT_EMAIL}?subject=ULMOX%20Account%20Deletion%20Request">Email ${CONTACT_EMAIL} with the subject &ldquo;ULMOX Account Deletion Request&rdquo;</a>
    </p>
    <p>Please include only the minimum needed to find your account:</p>
    <ul>
      <li>the email address associated with your ULMOX account, and</li>
      <li>your ULMOX username, if you know it.</li>
    </ul>
    <p>
      Where possible, write from the email address associated with your account.
      If your account is linked with Sign in with Apple and you used
      <strong>Hide My Email</strong>, write
      from your Apple relay address, or give us enough non-secret account details
      to identify the account.
    </p>

    <div class="callout">
      <p>
        <strong>We will never ask you for a password, an Apple or Google
        password, a one-time authentication code, an authorisation code, a
        sign-in token, or a photograph of an identity
        document</strong>, and we will never ask you to send any of them to us by
        email. If you receive a message claiming to be from ULMOX and
        asking for any of these, it is not from us.
      </p>
    </div>

    <p>
      We verify that you own the account before deleting it. A request sent from
      a public web form or an unverified address does not delete an account by
      itself. We may ask you to confirm ownership through a safe process, such as
      replying from the account email address.
    </p>

    <h2>What happens when an account is deleted</h2>
    <ul>
      <li>Access and discoverability are removed as soon as deletion is
        successfully started. Your profile stops being visible to other people
        and your account stops being selected for new deliveries.</li>
      <li>Physical erasure of stored data continues in the background after
        that. It is targeted for completion within 30 days, unless a justified
        safety or legal obligation requires limited retention.</li>
      <li>Videos you recorded, their thumbnails, your profile information, your
        profile photo and Global content you own are removed.</li>
      <li>Content owned by someone else is <em>not</em> deleted just because you
        shared it. Your association with it is removed instead, and the video
        stays with the person who created it.</li>
      <li>Your username is held for 90 days after deletion before it can be
        reused, so it cannot immediately be taken by someone else.</li>
      <li>Limited safety, legal or transactional records may be kept where there
        is a justified reason, and only for as long as that reason applies.
        Where a safety record is kept, the links tying it to your identity are
        scrubbed as part of the erasure, so what remains is a record of what
        happened rather than a record of you.</li>
      <li>Deleting your account does not delete anyone else&rsquo;s. A
        Connection has two people in it, and the messages, videos and records
        belonging to the other participant stay with them.</li>
    </ul>
    <div class="callout">
      <p>
        <strong>Safety evidence is not ordinary message history.</strong>
        ${T.LOCALES.en.webGradualRollout} If you have a Connection: an
        ordinary message in it is treated as expiring about seven days
        after it is sent. A message that has been reported is no longer governed
        by that: it is evidence in a review, and it is kept while the review is
        open and afterwards where the outcome justifies keeping it &mdash;
        including after the account it came from is deleted. Deleting your
        account does not withdraw a report you made and does not erase a report
        made about you.
      </p>
    </div>

    <h2 id="apple-linked">If your account is linked with Sign in with Apple</h2>
    <p>
      Some ULMOX accounts are linked with Sign in with Apple. If yours is,
      permanent deletion has one extra step, because Apple requires an app to
      give up its Sign in with Apple authorisation when it deletes an account,
      rather than only deleting its own record.
    </p>
    <ol>
      <li>On an Apple device, ULMOX asks you to confirm once more directly with
        Apple. That confirmation happens between you and Apple on your own
        device. <strong>ULMOX does not receive your Apple password</strong>, and
        we never ask you for it.</li>
      <li>That confirmation is what lets ULMOX revoke its own Sign in with Apple
        authorisation for your account.</li>
      <li>Only then does the permanent deletion described above begin.</li>
    </ol>

    <div class="callout">
      <p>
        <strong>If that step does not finish, nothing is deleted.</strong> If you
        dismiss the Apple screen, if the confirmation returns a different Apple
        account than the one signed in, or if the step fails for any other
        reason, ULMOX stops before anything permanent happens and tells you that
        nothing has been deleted. You can try again.
      </p>
    </div>

    <p>Three separate things are easy to confuse:</p>
    <ul>
      <li><strong>Revoking ULMOX&rsquo;s Sign in with Apple authorisation</strong>
        stops ULMOX from being able to use Sign in with Apple for you. On its
        own it does not delete your ULMOX account and it does not erase the data
        in it.</li>
      <li><strong>Deleting your ULMOX account</strong> is the action that removes
        your ULMOX data. It is complete only when the erasure described on this
        page has run &mdash; no change to a sign-in authorisation completes it.</li>
      <li><strong>Deleting your Apple ID</strong> is something only Apple can do,
        at your own request &mdash; ULMOX never does it and cannot do it.</li>
    </ul>

    <h3>Deleting an Apple-linked account from an Android device</h3>
    <p>
      The Apple confirmation step can only be completed on an Apple device. If
      you try to delete an Apple-linked ULMOX account from an Android phone,
      ULMOX stops before anything is removed and tells you that
      <strong>nothing has been deleted</strong>. Finish the deletion on an Apple
      device.
    </p>
    <p>
      An account that uses only Google Sign-In, or only an email address, deletes
      normally on either kind of device. An account linked with both Apple and
      Google still needs the Apple step.
    </p>

    <h2>If you only want a break</h2>
    <p>
      Deactivation hides your profile and your Global content and can be
      reversed by signing back in and choosing <strong>Reactivate</strong>.
      Signing in on its own does not reactivate the account. Videos you already sent may remain with the
      people who received them for their normal retention period. Deactivation
      does not satisfy a deletion request &mdash; if you want your data removed,
      use Delete Account.
    </p>
    <p>
      Deactivating does not erase safety records, and reactivating does not undo
      anything. Coming back restores your access; it does not reverse a
      moderation decision, does not bring back content that moderation removed
      or hid, and does not reopen a Connection that was ended. Ending a
      Connection is final for that pair. Blocking works differently: a block
      ends the Connection you have now and stops contact in both directions
      while it stands. Removing a block does not restore the old Connection
      either &mdash; the two accounts would have to qualify again from the
      beginning, through two fresh qualifying video exchanges and a fresh
      approval from each person.
    </p>

    <h2>Questions</h2>
    <p>
      Contact <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. See also our
      <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms of Service</a>.
    </p>`,
});

/* -------------------------------------------------------------------------- */
/* Privacy Policy                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Stage 1.6W — Android storage permissions, reconciled against the application
 * repository read-only.
 *
 * Authoritative source: the application's **final merged release manifest**
 * (Gradle's processReleaseMainManifest output), not the hand-written
 * android/app/src/main/AndroidManifest.xml — a dependency can contribute a
 * declaration that never appears in the app's own file, and one does.
 *
 * What the merged release manifest actually holds:
 *
 *   - READ_EXTERNAL_STORAGE   android:maxSdkVersion="32"   (Android 12 and earlier)
 *   - WRITE_EXTERNAL_STORAGE  android:maxSdkVersion="28"   (Android 9 and earlier)
 *   - no READ_MEDIA_IMAGES, READ_MEDIA_VIDEO or
 *     READ_MEDIA_VISUAL_USER_SELECTED — the Android 13+ media permissions are
 *     absent, because image selection goes through the system photo picker.
 *
 * Stage 1.5's handoff omitted the WRITE_EXTERNAL_STORAGE declaration entirely,
 * so the page described one legacy permission where the shipped app declares
 * two. Both are now disclosed, each with its own cap, and neither is presented
 * as a modern photo- or video-library permission — the SDK 28 cap means a
 * device on Android 10 or later can never be granted it.
 *
 * The page deliberately does not reproduce a manifest dump: the permission
 * constants stay out of the public HTML (tests/legal-pages.test.js fails on
 * READ_MEDIA appearing at all), and the behaviour is described in the terms a
 * reader can act on. The iOS side stays separate on purpose — iOS genuinely
 * does ask for photo access and add-access, so a single cross-platform
 * sentence in either direction would be false.
 */
const privacy = page({
  file: "privacy.html",
  title: "Privacy Policy - ULMOX",
  description:
    "What data ULMOX collects, why, who processes it, how long it is kept and how to delete it.",
  heading: "Privacy Policy",
  body: `    <p>
      ULMOX is a video-sharing app. You record a short video and our server
      delivers it to one eligible recipient chosen at random. Only a recipient
      may choose to share a video they received to the public Global feed.
    </p>
    <p>
      ULMOX is operated by Ferdi G&uuml;lseren. For any privacy question, contact
      <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
    </p>

    <h2>1. Who can use ULMOX</h2>
    <p>
      ULMOX is an <strong>18+ service</strong>. It is not intended for children,
      and we do not knowingly collect data from anyone under 18.
    </p>

    <h2>2. What we collect</h2>

    <h3>Account and authentication</h3>
    <ul>
      <li>Email address and display name.</li>
      <li>Account and sign-in provider identifiers.</li>
      <li>A supported sign-in provider is used to create and access your
        account. Where an account is linked with Sign in with Apple and uses
        Apple&rsquo;s Hide My Email, we receive a relay address rather than your
        real one.</li>
    </ul>

    <h3>Content you create</h3>
    <ul>
      <li>Videos you record and their generated thumbnails.</li>
      <li>Your profile photo and profile details.</li>
      <li>Global content, when a recipient shares a video publicly.</li>
      <li>Reports you submit, and the optional free-text details you add to
        them.</li>
    </ul>

    <h3>Camera, microphone and photos</h3>
    <ul>
      <li><strong>Camera and microphone.</strong> ULMOX asks for these so you can
        record a video moment with sound, and take a profile photo. Recording
        starts only when you start it.</li>
      <li><strong>Choosing a photo.</strong> When you set a profile photo, ULMOX
        opens a photo picker and receives the image you pick. On a current
        Android version that is the system photo picker, so ULMOX asks for no
        permission to your wider photo library. On iOS, ULMOX asks for photo
        access for the flows that genuinely need it, and iOS lets you grant
        access to selected photos rather than to your whole library.</li>
      <li><strong>Saving to your device.</strong> If you choose to save a moment
        to your phone, ULMOX asks for permission to add it to your photo library.
        That permission adds a file rather than reading your library.</li>
    </ul>
    <div class="callout">
      <p>
        <strong>Media you create is uploaded; it does not stay only on your
        device.</strong> Videos, their generated thumbnails and your profile
        photo are uploaded to and stored in Firebase Cloud Storage so they can be
        delivered and displayed. Saving your own copy to your phone is a separate
        and optional step.
      </p>
    </div>
    <p>
      On Android, ULMOX no longer declares the broad photo and video access
      permissions that Android 13 and later use, because the system photo picker
      replaces them. Two older storage permissions are still declared, both
      inherited from components ULMOX builds on, and both capped so that a
      modern Android version cannot grant them:
    </p>
    <ul>
      <li>A legacy <strong>read</strong> storage permission, declared for
        compatibility with Android 12 and earlier only.</li>
      <li>A legacy <strong>write</strong> storage permission, declared for
        compatibility with <strong>Android 9 and earlier</strong> only. This is
        the older, pre-scoped-storage way of writing a file to shared storage.
        It is not a modern photo or video library permission, and it is not one
        of the Android 13+ media permissions described above.</li>
    </ul>
    <p>
      Each cap is part of the declaration itself, so on a newer Android version
      the permission is not granted, is not requested and has no effect. ULMOX
      never asks you for either of them. On a current Android version, choosing
      an image goes through the system photo picker, which needs no storage
      permission at all.
    </p>
    <p>
      ULMOX requests no advertising identifier. The advertising and ad
      attribution permissions are absent from the Android app we build, so there
      is nothing for an advertiser or an ad network to read.
    </p>

    <h3>Location</h3>
    <p>
      With your permission, ULMOX may take a single location reading while you
      are creating a Moment. This is used to determine the city and country
      associated with that Moment and to support private Moment features.
    </p>
    <p>
      ULMOX does not publish your device coordinates to World Live. World Live
      displays the city or country associated with a shared Moment, not a
      user's current or live location. Public map markers are placed at general
      city or country locations and do not move when the creator moves.
    </p>
    <p>
      If device location is unavailable or you decline permission, ULMOX
      continues to work normally. A Moment may instead use the city and country
      that you entered manually in your profile.
    </p>
    <p>
      Location is accessed only while you are using the app and only as a
      single reading during the Moment creation flow. ULMOX does not access
      location at launch, does not follow your location in the background, does
      not continuously track your location, and does not access it while the
      app is closed.
    </p>
    <p>
      ULMOX requests only while-in-use location. It does not use background
      location, continuous monitoring, significant-change monitoring or
      geofencing, and the app declares no permission that would allow those
      activities.
    </p>

    <h3>Message translation (Google ML Kit)</h3>
    <p>
      ULMOX offers optional translation of a Connections message you have
      received. It runs only when you choose <strong>${T.TRANSLATE_ACTION}</strong>
      on a single message, and the original message stays on screen and remains
      the authoritative one. ${T.LOCALES.en.webGradualRollout} See
      <a href="translation.html">Translation information</a>.
    </p>
    <table>
      <caption class="effective">What each part of translation does with data.</caption>
      <tr><th scope="col">Part</th><th scope="col">What happens</th></tr>
      <tr>
        <td>The message and its translation</td>
        <td>Handled on your device by Google ML Kit. ULMOX does not send either
          of them anywhere to be translated, and does not store the translation
          on our servers, in a report, in moderation evidence, in a notification,
          in analytics or in our logs.</td>
      </tr>
      <tr>
        <td>Language packs</td>
        <td>Downloaded to your device when a language is first translated. ULMOX
          asks first and downloads over Wi-Fi unless you explicitly choose mobile
          data. You can view and delete them in the app; removing ULMOX removes
          them in the ordinary way your operating system removes an app&rsquo;s
          files.</td>
      </tr>
      <tr>
        <td>Translation and language metadata</td>
        <td>Which languages are configured, and which language was identified,
          are used to pick a model and label the result. They are not written
          against a message, an account or a Connection.</td>
      </tr>
      <tr>
        <td>Google ML Kit&rsquo;s own network use</td>
        <td>Google&rsquo;s component can use the network for its own purposes:
          delivering language packs, reading its remote configuration, and
          reporting diagnostics and usage analytics about the component. Google
          documents that it collects app and device information, a
          per-installation identifier, performance data, API configuration,
          feature events, error codes, the configured translation languages and
          the identified language.</td>
      </tr>
      <tr>
        <td>ULMOX server data</td>
        <td>Unchanged. Our servers hold the original message only, exactly as
          described elsewhere in this policy.</td>
      </tr>
    </table>
    <div class="callout">
      <p>
        <strong>Three things we will not claim.</strong> We do not claim that
        Google receives the text of your messages &mdash; Google&rsquo;s
        documentation for this feature does not say that it is uploaded. And
        we do not claim that nothing ever leaves your device: Google&rsquo;s
        component makes its own network connections for the purposes listed
        above. And we do not claim to have ruled the question out &mdash;
        Google&rsquo;s privacy declaration for its machine-learning kit covers
        every feature in that kit, including ones that do handle user content,
        and the component is not open source, so we cannot inspect it ourselves.
        We tell you what we can verify rather than filling the gap with a
        reassurance.
      </p>
    </div>
    <p>
      Translation data is never used for advertising or profiling, by us or on
      our behalf. A translation never becomes moderation evidence: reports and
      the people who review them use the original message.
    </p>

    <h3>Device and technical information</h3>
    <ul>
      <li>Device and installation identifiers, app version and platform.</li>
      <li>Push notification tokens, so we can deliver notifications.</li>
      <li>Signals used to protect the service against abuse, such as whether
        several accounts share one device.</li>
    </ul>

    <h3>Usage and diagnostics</h3>
    <ul>
      <li>Firebase Analytics: aggregate product usage.</li>
      <li>Firebase Crashlytics: crash reports.</li>
      <li>Firebase Performance Monitoring: performance measurements.</li>
      <li>Operational server logs, used to run and secure the service.</li>
    </ul>

    <h3>Age assurance</h3>
    <p>
      To confirm you are 18 or older, ULMOX uses the age signal your platform
      provides where that is available, and otherwise asks you for your date of
      birth.
    </p>
    <div class="callout">
      <p>
        <strong>Your date of birth is not stored.</strong> It is used only while
        the request is being processed, to work out whether you are 18 or older.
        We keep the outcome &mdash; whether you are eligible &mdash; and not the
        date itself, not your exact age and not an age band.
      </p>
    </div>
    <p>
      Age information is never used for advertising, profiling, ranking or
      analytics.
    </p>

    <h3>Reporting, moderation and blocking</h3>
    <ul>
      <li>Reports about content and about users, including a dedicated child
        safety category.</li>
      <li>Moderation records created when a report is reviewed.</li>
      <li>Blocks you create. Blocking is a private safety action; the person you
        block is not told.</li>
    </ul>
    <p>
      Reported content may be placed in a reversible quarantine while a human
      reviews it. Reports do not ban accounts. Only an authorised ULMOX
      administrator can ban an account, and only after human review.
    </p>
    <p>
      ULMOX does not automatically analyse video frames, audio or transcripts.
    </p>

    <h2>3. Deactivation and deletion</h2>

    <h3>Deactivation</h3>
    <p>
      Deactivation is reversible: you restore the account by signing back in and
      choosing <strong>Reactivate</strong>, which signing in alone does not do.
      Your profile and Global content are hidden and
      your account is not selected for new deliveries. Your data is retained so
      the account can be restored. Videos you already sent may remain with the
      people who received them for their normal retention period.
    </p>
    <p>
      Deactivation is not an erasure and it does not clear safety records.
      Reports, moderation decisions, blocks and other safety evidence are
      unaffected by deactivating and by reactivating. Reactivation restores your
      access; it does not undo a moderation decision, does not bring back
      content that was removed or hidden by moderation, and does not reopen a
      Connection that was ended. Ending a Connection is final for that pair.
      Blocking works differently: a block ends the Connection you have now and
      stops contact in both directions while it stands. Removing a block does
      not restore the old Connection either &mdash; the two accounts would have
      to qualify again from the beginning, through two fresh qualifying video
      exchanges and a fresh approval from each person.
    </p>

    <h3>Deletion</h3>
    <p>
      Deletion is permanent. Access and discoverability are removed as soon as
      deletion is successfully started, and physical erasure continues in the
      background, targeted for completion within 30 days unless a justified
      safety or legal obligation requires limited retention. Your username is
      held for 90 days before it can be reused. See
      <a href="delete_account.html">Delete your ULMOX account</a>.
    </p>
    <p>
      If your account is linked with Sign in with Apple, permanent deletion on an
      Apple device asks you to confirm once more directly with Apple, so that
      ULMOX can revoke its own Sign in with Apple authorisation before the
      account is deleted. We do not receive your Apple password. If that step
      does not finish, nothing is deleted. An Apple-linked account cannot
      complete this step on an Android device; ULMOX stops before removing
      anything and asks you to finish on an Apple device.
    </p>
    <p>
      Deleting your ULMOX account does not delete your Apple ID or your Google
      Account. ULMOX cannot delete either of them. Revoking ULMOX&rsquo;s Sign in
      with Apple authorisation is also a different action from deleting your
      account, and on its own it does not erase your ULMOX data.
    </p>
    <p>
      Deleting your account removes your data. It does not remove another
      person&rsquo;s: a Connection has two people in it, and the messages,
      videos and records belonging to the other participant stay with them.
      Where safety evidence has to be kept for a justified reason, the links
      that tie it to your identity are scrubbed as part of the erasure, so what
      remains is a record of what happened rather than a record of you.
    </p>

    <h2>4. How long we keep things</h2>
    <table>
      <caption class="effective">Retention is driven by the conditions below rather than by a single fixed period.</caption>
      <tr><th scope="col">Data</th><th scope="col">How long</th></tr>
      <tr><td>Account profile and settings</td><td>While your account exists.</td></tr>
      <tr><td>Videos that were never opened</td><td>Removed about 7 days after they were sent.</td></tr>
      <tr><td>Videos that were opened but not shared to Global</td><td>Removed about 15 days after they were sent.</td></tr>
      <tr><td>Global content</td><td>Kept while it remains available, until its owner deletes it or moderation removes it. We do not delete Global content on a fixed timer.</td></tr>
      <tr><td>Unfinished uploads</td><td>Cleaned up about 24 hours after they are abandoned.</td></tr>
      <tr><td>Push tokens and device records</td><td>While registered; removed on deactivation and deletion.</td></tr>
      <tr><td>Age eligibility result</td><td>While your account exists. Your date of birth is never stored.</td></tr>
      <tr><td>Username reservation after deletion</td><td>90 days.</td></tr>
      <tr><td>Internal deletion record</td><td>90 days, kept so a deletion can be audited.</td></tr>
      <tr><td>Connection messages</td><td>An ordinary message in a Connection is treated as expiring about seven days after it is sent, and stops being part of the conversation then. That is a rule about the message, not a promise about a timer: automatic expiry of the stored record is not currently switched on, so removal happens through routine cleanup rather than at a fixed moment.</td></tr>
      <tr><td>Reports, moderation records, blocks and safety events</td><td>Kept as safety evidence, including after an account is deleted, for as long as there is a justified safety or legal reason. Safety evidence is not ordinary message history: once a message is attached to a report, seven-day expiry no longer governs it, and it is kept while a review is open and afterwards where the outcome justifies keeping it.</td></tr>
      <tr><td>Analytics, crash and performance data</td><td>Retained according to the retention setting configured in the relevant Google service.</td></tr>
    </table>

    <h2>5. Who processes data for us</h2>
    <p>ULMOX uses the following services:</p>
    <ul>
      <li>Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud
        Functions and Cloud Messaging (Google).</li>
      <li>Firebase Analytics, Crashlytics and Performance Monitoring (Google).</li>
      <li>Firebase App Check, a device-integrity check used, where the platform
        supports it, to reduce automated abuse of the service.</li>
      <li>Google Sign-In, and Sign in with Apple for accounts linked with it,
        for authentication.</li>
      <li>Google ML Kit Translation and Language Identification, which run
        message translation on your device and may use the network as described
        under &ldquo;Message translation&rdquo; above.</li>
      <li>Firebase Remote Config and Firebase Installations, which ML Kit uses
        for its own configuration and for the per-installation identifier
        described above.</li>
      <li>Platform age signals from Google Play and Apple, where the platform
        makes them available and you choose to share them.</li>
    </ul>
    <p>
      We do not sell personal information, and we do not use it for
      advertising or cross-app tracking.
    </p>

    <h2>6. International processing</h2>
    <p>
      ULMOX is available worldwide and our providers operate data centres in
      several countries, so your data may be processed outside the country where
      you live. We rely on the safeguards our providers offer for those
      transfers.
    </p>

    <h2>7. Your rights</h2>
    <p>
      Depending on where you live, you may have the right to access, correct or
      delete your data, to object to or restrict certain processing, and to
      withdraw consent where processing is based on consent. You can delete your
      account yourself in the app, and you can exercise other rights by writing
      to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
    </p>
    <p>
      If you are not satisfied with our response, you may complain to your local
      data protection authority.
    </p>

    <h2>8. Security</h2>
    <p>
      Data is transmitted over encrypted connections and stored using our
      providers&rsquo; managed infrastructure. Access to moderation evidence is
      limited to authorised reviewers. No online service can promise perfect
      security, and we do not claim to.
    </p>

    <h2>9. Changes</h2>
    <p>
      We will update this page when our practices change and will update the
      effective date above. Material changes may require you to accept updated
      Terms in the app.
    </p>

    <h2>10. Related pages</h2>
    <p>
      <a href="delete_account.html">Delete your account</a> &middot;
      <a href="terms.html">Terms of Service</a> &middot;
      <a href="safety.html">Child Safety Standards</a> &middot;
      <a href="support.html">Support</a>
    </p>`,
});

/* -------------------------------------------------------------------------- */
/* Terms of Service                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Stage 1.6W — the public description of Connections.
 *
 * Every rule in section 3 is real product behaviour, verified read-only against
 * the application repository README's Stage 1.1 / 1.1.1 / 1.4 sections and the
 * Connections eligibility, messaging and moderation implementation they cover:
 * persistent non-anonymous accounts; two separate qualifying video encounters
 * before a pair is eligible; independent approval by both people; no user
 * search anywhere in the product; text only, with no attachment of any kind;
 * Report User and Report Message; Block and End Connection, both terminal, both
 * deliberately reachable even when the feature gate is closed because leaving
 * must never be the thing that breaks; human review of reports; optional
 * on-device translation; and 18+ only.
 *
 * What is deliberately absent, and must stay absent from every public page:
 * the store-review pair and the configuration document that names it, reviewer
 * account identifiers, isolated review routing, the legacy test-recipient
 * override, App Check exemption lists or enforcement state, and moderation
 * thresholds, queue states or lease behaviour. The reviewer pair is a review
 * mechanism, not a consumer feature, and describing it publicly would both
 * mislead readers and hand an attacker the shape of the bypass. The
 * credential-free reviewer procedure stays in PUBLICATION_CHECKLIST.md.
 */
const terms = page({
  file: "terms.html",
  title: "Terms of Service - ULMOX",
  description:
    "The rules for using ULMOX, including eligibility, prohibited content, moderation and account removal.",
  heading: "Terms of Service",
  body: `    <p>
      These Terms apply when you use ULMOX. If you do not agree with them, please
      do not use the service.
    </p>

    <h2>1. Who may use ULMOX</h2>
    <ul>
      <li>You must be <strong>18 years of age or older</strong>.</li>
      <li>You must give truthful information about your age.</li>
      <li>You must not attempt to evade the age requirement, and you must not
        help anyone else do so.</li>
      <li>Accounts are persistent and non-anonymous. You sign in with a
        supported provider and keep one identity across the service.</li>
    </ul>

    <h2>2. Your content</h2>
    <p>
      You are responsible for the videos and profile content you create and
      upload. You must have the right to share what you upload, and it must not
      break these Terms or the law.
    </p>

    <h3>Ownership and licence</h3>
    <p>
      <strong>You keep ownership of your content.</strong> To operate the
      service, you grant ULMOX a non-exclusive, worldwide, royalty-free licence
      to host, store, reproduce and transmit your content, solely so that we can
      deliver it to the recipient chosen for it, generate thumbnails, and
      display it in the Global feed if a recipient shares it there. The licence
      exists only for running ULMOX and ends when the content is removed, except
      where we must keep a copy as safety evidence or to meet a legal obligation.
    </p>
    <p>
      When someone shares a video they received to the Global feed, they do
      <strong>not</strong> become its owner. The person who recorded it remains
      the owner.
    </p>

    <h2>3. Connections</h2>
    <div class="callout">
      <p><strong>${T.LOCALES.en.webGradualRollout}</strong></p>
    </div>
    <p>
      A Connection is a mutual, text-only conversation between two adults who
      have already exchanged video moments. It is not a chat directory and it is
      not open messaging. These are the rules it works by:
    </p>
    <ul>
      <li><strong>Adults only.</strong> Connections are part of an 18+ service
        and are available only to accounts that have passed the age
        requirement.</li>
      <li><strong>You cannot search for people.</strong> ULMOX has no user
        search and no way to look someone up in order to contact them. A
        Connection can only grow out of contact you already had.</li>
      <li><strong>Two prior qualifying video encounters.</strong> A pair becomes
        eligible only after two separate qualifying video exchanges between
        those two accounts. One is not enough.</li>
      <li><strong>Both people have to approve.</strong> Each person approves
        independently. Until both have, there is no Connection and no message
        can be sent.</li>
      <li><strong>Text only, and nothing attached.</strong> A Connection carries
        written messages. There are no attachments &mdash; no photos, no videos,
        no files, no voice notes.</li>
      <li><strong>Accounts are persistent and non-anonymous.</strong> The person
        you are connected to has the same single identity across ULMOX that
        everyone else does.</li>
      <li><strong>Messages expire.</strong> An ordinary message is treated as
        expiring about seven days after it is sent. Reported messages are
        handled differently &mdash; see the Privacy Policy.</li>
      <li><strong>Reporting and leaving always work.</strong> You can use
        <strong>Report User</strong> and <strong>Report Message</strong>, you
        can <strong>Block</strong>, and you can <strong>End Connection</strong>.
        Ending a Connection is final for that pair: it does not resume, and a
        later encounter does not reopen it. A block is not the same thing. A
        block ends the Connection you have now and stops contact in both
        directions while it stands. Removing a block does not restore the old
        Connection: the pair would have to qualify again from the beginning,
        through two fresh qualifying video exchanges and a fresh approval from
        each person.</li>
      <li><strong>People review reports, not machines.</strong> A reported
        message is judged by a person.</li>
      <li><strong>Translation is optional.</strong> You may translate a message
        you have received, on your own device. The original is what counts and
        what a reviewer reads. See
        <a href="translation.html">Translation information</a>.</li>
    </ul>

    <h2>4. What is not allowed</h2>
    <p>The following are prohibited on ULMOX:</p>
    <ul>
      <li>Child sexual abuse and exploitation (CSAE) and child sexual abuse
        material (CSAM), in any form.</li>
      <li>Sexual exploitation of any person.</li>
      <li>Non-consensual sexual content, and sexual content involving anyone
        who may be under 18.</li>
      <li>Threats, incitement to violence, and content glorifying violence.</li>
      <li>Hate speech and targeted harassment.</li>
      <li>Impersonating another person or organisation.</li>
      <li>Scams, fraud and spam.</li>
      <li>Illegal content and illegal activity.</li>
      <li>Sharing someone else&rsquo;s private information without their
        permission.</li>
    </ul>

    <h2>5. Reporting, blocking and moderation</h2>
    <ul>
      <li>You can report content and you can report users, from inside the app.
        There is a dedicated child safety category.</li>
      <li>You can block another user. Blocking stops interaction in both
        directions, and the person you block is not told.</li>
      <li>Reported content may be placed in a <strong>reversible
        quarantine</strong> while it is reviewed. Quarantine hides content
        temporarily; it does not delete it and it is not a penalty against the
        account.</li>
      <li>Moderation decisions are made by people, not automatically. Reported
        videos and reported messages are both reviewed by a person.</li>
      <li>A message that is held back by an automated safety filter is
        <strong>not</strong> a decision about your account. Holding a message,
        or quarantining content, restricts that item and nothing else.</li>
      <li>If a reviewer approves a video, it returns to the Global feed only if
        it independently still qualifies for it. A video whose owner has left,
        been restricted or been banned, or which is unavailable for a separate
        reason, stays unavailable whatever the report decision was.</li>
      <li>When a report is resolved it leaves the active review list. It is not
        erased: the evidence and the record of what was decided are kept where
        there is a justified reason to keep them.</li>
      <li>A report is always about the original content. A translation you chose
        to read is never the thing that is reviewed and is never evidence.</li>
      <li>We do not publish the internal thresholds, tooling or working
        procedures our safety systems use.</li>
    </ul>

    <div class="callout">
      <p>
        <strong>Reports do not ban accounts.</strong> No number of reports bans
        an account automatically. Nothing else does either: not an automated
        filter holding a message back, not a quarantine, not a translation, and
        not a decision to remove a single piece of content.
        Only an authorised ULMOX administrator can ban an account, as a separate
        and deliberate decision, and only after reviewing the case.
      </p>
    </div>

    <p>
      ULMOX does not automatically analyse video frames, audio or transcripts.
      Safety relies on reporting, reversible quarantine, blocking and human
      review.
    </p>

    <h2>6. Deactivation and deletion</h2>
    <ul>
      <li><strong>Deactivation</strong> is reversible: you restore the account by
        signing back in and choosing <strong>Reactivate</strong>, which signing
        in alone does not do. Your profile and Global
        content are hidden and your data is kept so the account can be restored.
        Videos you already sent may remain with the people who received them for
        their normal retention period.</li>
      <li><strong>Deletion</strong> is permanent and cannot be undone. Access and
        discoverability end immediately, and erasure continues in the background.
        Limited safety, legal or transactional records may be kept where
        justified. See <a href="delete_account.html">Delete your account</a>.</li>
    </ul>

    <h2>7. Enforcement and appeals</h2>
    <p>
      We may hide content while it is being reviewed, remove content that breaks
      these Terms, and, through an authorised administrator, suspend or terminate
      an account. If you believe a decision about your content or your account
      was wrong, write to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      and a person will review it. See <a href="support.html">Support</a>.
    </p>

    <h2>Machine translation</h2>
    <ul>
      <li>ULMOX may offer an optional machine translation of a message you have
        received. <strong>Machine translations can be incomplete or
        inaccurate.</strong></li>
      <li>Where meaning matters, rely on the original message. The original stays
        visible and is the authoritative version.</li>
      <li>Translating a message does not change your responsibility for content
        you wrote. You remain responsible for your original message.</li>
      <li>Translation does not create an exception to these Terms. Content that
        breaks the rules breaks them in every language.</li>
      <li>Google provides the translation technology. Google does not write,
        review, approve or endorse any message sent through ULMOX.</li>
    </ul>
    <p>
      See <a href="translation.html">Translation information</a>.
    </p>

    <h2 id="ulmox-music">ULMOX Music</h2>
    <p>
      ULMOX may provide music for use in Moments. Subject to these Terms, you may synchronize that music with videos you create in ULMOX and share those completed videos through ULMOX. You may not extract, redistribute, sell, or make the music available as standalone audio.
    </p>

    <h2>8. Changes to these Terms</h2>
    <p>
      We may update these Terms. The effective date above shows the current
      version. When a change is material, we may ask you to accept the updated
      Terms in the app before continuing to use ULMOX.
    </p>

    <h2>9. Related pages</h2>
    <p>
      <a href="privacy.html">Privacy Policy</a> &middot;
      <a href="safety.html">Child Safety Standards</a> &middot;
      <a href="support.html">Support</a> &middot;
      <a href="delete_account.html">Delete your account</a>
    </p>`,
});

/* -------------------------------------------------------------------------- */
/* Child Safety Standards                                                     */
/* -------------------------------------------------------------------------- */

const safety = page({
  file: "safety.html",
  title: "ULMOX Child Safety Standards",
  description:
    "ULMOX child safety standards: 18+ only, zero tolerance for CSAE, reporting, blocking and human review.",
  heading: "ULMOX Child Safety Standards",
  body: `    <p>
      ULMOX is restricted to adults aged <strong>18 or older</strong>. This page
      sets out how we prevent, detect and act on child sexual abuse and
      exploitation.
    </p>

    <div class="callout">
      <p>
        <strong>If a child is in immediate danger, contact your local emergency
        services first.</strong> Reporting to ULMOX is not a substitute for
        contacting the authorities.
      </p>
    </div>

    <h2>Zero tolerance</h2>
    <p>
      ULMOX has zero tolerance for child sexual abuse and exploitation (CSAE)
      and for child sexual abuse material (CSAM). Accounts and content involved
      in it are removed.
    </p>

    <h2>What is prohibited</h2>
    <p>
      In plain terms, the following are never allowed on ULMOX:
    </p>
    <ul>
      <li>Any sexual content involving a person under 18, real or depicted.</li>
      <li>Grooming: building trust with a minor in order to sexually exploit
        them, including asking a minor to keep contact secret from their parents
        or guardians.</li>
      <li>Sexualising a minor, or asking a minor for sexual images or contact.</li>
      <li>Coercion, blackmail (including sexual extortion), trafficking, or any
        conduct that places a minor in serious danger.</li>
      <li>Advertising, seeking or linking to material of this kind.</li>
    </ul>

    <h2>How to report</h2>
    <p>
      Inside the app you can <strong>Report Content</strong> and
      <strong>Report User</strong>. Both offer a dedicated
      <strong>Child Safety</strong> category. You can also block a user, which
      stops all interaction between you in both directions.
    </p>
    <p>
      You can also write to us:
    </p>
    <p>
      <strong>${CHILD_SAFETY_LABEL}</strong><br />
      <a href="mailto:${CONTACT_EMAIL}?subject=ULMOX%20Child%20Safety%20Report">${CONTACT_EMAIL}</a>
    </p>

    <h2>What happens next</h2>
    <ul>
      <li>Child safety reports are given the <strong>highest priority</strong>
        for human review.</li>
      <li>The specific reported content is immediately placed in a
        <strong>reversible quarantine</strong> so it is no longer shown publicly
        or delivered, while a person reviews it.</li>
      <li>Evidence is preserved for review and is accessible only to authorised
        moderators.</li>
      <li>Reports do <strong>not</strong> automatically ban an account. Neither
        does the number of reports, an automated filter holding a message back,
        a quarantine, or a translation. A ban is a separate, deliberate decision
        that only an authorised ULMOX administrator can make, and only after
        reviewing the case.</li>
      <li>Resolving a report takes it off the active review list. It does not
        erase it: the evidence and the record of what was decided are kept where
        there is a justified reason to keep them, so a decision can be audited
        and an appeal can be answered.</li>
      <li>If a reviewer approves a reported video, it returns to the Global feed
        only if it independently still qualifies. Content whose owner has left,
        been restricted or been banned, or which is unavailable for a separate
        reason, stays unavailable whatever the report decision was.</li>
      <li>Where applicable law requires it, we report to the appropriate legally
        designated authority.</li>
    </ul>

    <div class="callout">
      <p>
        <strong>Our target is to review urgent child safety reports within 24
        hours.</strong> This is a target for beginning human review. It is not a
        guarantee that every case is finally resolved within 24 hours, and
        complex cases can take longer.
      </p>
    </div>

    <p>
      Other safety reports are reviewed as quickly as reasonably possible.
    </p>

    <h2>Safety in Connections</h2>
    <div class="callout">
      <p><strong>${T.LOCALES.en.webGradualRollout}</strong></p>
    </div>
    <p>
      A Connection is a text-only conversation between two adults who both
      approved it after two separate qualifying video exchanges. ULMOX has no
      user search, so nobody can look you up in order to message you. These are
      the safety controls inside a Connection:
    </p>
    <ul>
      <li><strong>Report Message.</strong> Available on a message you have
        received. Reporting sends a person the original message to review.</li>
      <li><strong>Reporting hides the message for you, and only for you.</strong>
        After you report a message it disappears from your view of the
        conversation. The sender&rsquo;s copy is unchanged and the sender is not
        told that you reported it. Hiding it is for your benefit; it is not a
        penalty applied to them, and the decision about the message is still a
        person&rsquo;s to make.</li>
      <li><strong>Report User.</strong> Available separately, for the person
        rather than a single message. There is a dedicated child safety
        category on both.</li>
      <li><strong>Block.</strong> Blocking stops interaction in both directions.
        It is offered after a report as a separate choice, never bundled into
        it, and declining it leaves your report intact. A block also ends the
        Connection you have now. Removing the block does not bring that
        Connection back: the pair would have to qualify again from the
        beginning, through two fresh qualifying video exchanges and a fresh
        approval from each person.</li>
      <li><strong>End Connection.</strong> Ends the conversation for both
        people. It cannot be restored and it does not reopen on a future
        encounter. Ending is not the same as blocking, and it does not erase
        reports you have already made.</li>
      <li><strong>Leaving always works.</strong> Blocking and ending a
        Connection stay available to you whatever else is happening &mdash; a
        safety action is never the thing that is unavailable.</li>
      <li><strong>Messages expire.</strong> An ordinary message in a Connection
        is treated as expiring about seven days after it is sent. A message you
        report is treated differently: once it is evidence in a review, seven-day
        expiry no longer governs it, and it is kept while the review is open and
        afterwards where the outcome justifies keeping it.</li>
      <li><strong>Nothing is attached.</strong> Connections carry written
        messages only &mdash; no photos, videos, files or voice notes.</li>
    </ul>

    <h2>Translated messages</h2>
    <ul>
      <li>A report always concerns the <strong>original message</strong>. The
        report carries the original, and that is what a moderator reads.</li>
      <li>An optional translation shown to a reader is not a moderation decision
        and is not evidence.</li>
      <li>A translation cannot make a message deliverable. Content that is
        blocked or held stays blocked or held whatever language it is read
        in.</li>
      <li>No account is banned because of what a translation produced. Only an
        authorised ULMOX administrator can ban an account, and only after
        reviewing the original evidence.</li>
    </ul>
    <p>
      See <a href="translation.html">Translation information</a>.
    </p>

    <h2>What ULMOX does not do</h2>
    <ul>
      <li>ULMOX does not automatically analyse video frames, audio or
        transcripts. Video safety relies on reporting, reversible quarantine,
        blocking and human review.</li>
      <li>ULMOX does not ban accounts automatically, and no number of reports
        produces an automatic ban.</li>
      <li>ULMOX does not claim that any automated check finds every violation.
        Reporting and human review are what the safety of this service rests
        on.</li>
      <li>ULMOX does not publish the internal thresholds, tooling or working
        procedures its safety systems use, because publishing them would tell
        the people we are trying to stop exactly what to avoid.</li>
    </ul>

    <h2>Appeals</h2>
    <p>
      If you believe content or an account was actioned in error, write to
      <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> and a person will
      review it. See <a href="support.html">Support</a> for what to include.
    </p>

    <h2>Related pages</h2>
    <p>
      <a href="terms.html">Terms of Service</a> &middot;
      <a href="privacy.html">Privacy Policy</a> &middot;
      <a href="support.html">Support</a> &middot;
      <a href="delete_account.html">Delete your account</a>
    </p>`,
});

/* -------------------------------------------------------------------------- */
/* Support                                                                    */
/* -------------------------------------------------------------------------- */

const supportRow = (label, subject, note) =>
  `      <tr><td>${label}</td><td><a href="mailto:${CONTACT_EMAIL}?subject=${subject}">${decodeURIComponent(
    subject
  )}</a></td><td>${note}</td></tr>`;

const support = page({
  file: "support.html",
  title: "Support - ULMOX",
  description:
    "Contact ULMOX support: account deletion, age corrections, moderation appeals, ban appeals and child safety reports.",
  heading: "ULMOX Support",
  body: `    <p>
      Write to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. Using one
      of the subject lines below helps us route your message correctly.
    </p>

    <table>
      <tr>
        <th scope="col">I need help with</th>
        <th scope="col">Subject line</th>
        <th scope="col">Notes</th>
      </tr>
${supportRow("General support", "ULMOX%20Support", "Anything not covered below.")}
${supportRow("Deleting my account", "ULMOX%20Account%20Deletion%20Request", 'See <a href="delete_account.html">Delete your account</a> first &mdash; the in-app route is faster.')}
${supportRow("Correcting my age verification", "ULMOX%20Age%20Verification%20Correction", "If you entered your date of birth incorrectly. You cannot change this yourself.")}
${supportRow("Appealing a content decision", "ULMOX%20Content%20Appeal", "If content of yours was hidden or removed.")}
${supportRow("Appealing an account restriction", "ULMOX%20Account%20Appeal", "If your account was suspended or banned.")}
${supportRow("Reporting a child safety concern", "ULMOX%20Child%20Safety%20Report", 'Highest priority. See <a href="safety.html">Child Safety Standards</a>.')}
    </table>

    <h2>How quickly we respond</h2>
    <ul>
      <li><strong>Urgent child safety reports</strong> are targeted for human
        review <strong>within 24 hours</strong>. That is a target for starting
        review, not a guarantee that a case is finally resolved within 24
        hours.</li>
      <li><strong>Everything else</strong> is handled as quickly as reasonably
        possible.</li>
    </ul>

    <div class="callout">
      <p>
        <strong>We will never ask you for a password, an Apple or Google
        password, a one-time authentication code, an authorisation code or a
        sign-in token, and we will never ask you
        to email a passport or other identity document.</strong> Please do not
        send them. If a message claiming to be from ULMOX asks for any of these,
        it is not from us.
      </p>
    </div>

    <h2>Connections and message translation</h2>
    <div class="callout">
      <p><strong>${T.LOCALES.en.webGradualRollout}</strong></p>
    </div>
    <p>
      If Connections is not on your account, there is nothing to fix and nothing
      to ask us for: it is not an error, not a fault with your account, and not
      something support can switch on for you. Updating to the current version
      of the app is the only thing worth doing.
    </p>
    <p>
      When translation is available to you, these are the things that usually go
      wrong and what to do about them. See
      <a href="translation.html">Translation information</a> for how the feature
      works.
    </p>
    <table>
      <tr><th scope="col">What you see</th><th scope="col">What it means</th></tr>
      <tr><td>The language pack is still downloading</td><td>A language has to be downloaded once before it can be translated. Leave the screen open; the original message stays readable throughout.</td></tr>
      <tr><td>The download will not start</td><td>Downloads use Wi-Fi by default. On mobile data you have to choose to use it explicitly &mdash; ULMOX will not spend your data without being asked.</td></tr>
      <tr><td>The download failed</td><td>Try again on a stable connection. Nothing about the message changes if a download fails.</td></tr>
      <tr><td>&ldquo;This message cannot be translated&rdquo;</td><td>The language is outside the supported set, or it could not be identified confidently. ULMOX shows nothing rather than guessing.</td></tr>
      <tr><td>The translation reads oddly</td><td>Machine translation can be wrong while sounding certain, and a pair with no English in it may be translated through English. Read the original.</td></tr>
      <tr><td>You want the space back</td><td>Delete downloaded language packs in Translation models, in the app.</td></tr>
      <tr><td>The message is a safety problem</td><td>Report it in the app. The report carries the original message, which is what a person reviews.</td></tr>
    </table>
    <div class="callout">
      <p>
        <strong>Do not email us the message.</strong> Please do not send message
        text, screenshots of a private conversation, authentication data or
        device identifiers. Report the message in the app instead &mdash; that
        gives a reviewer the original safely, and we never need a copy from you.
      </p>
    </div>

    <h2>Appeals</h2>
    <p>
      Appeals are available whether or not you can currently use the app, and
      the in-app Support link remains reachable if your account is restricted.
    </p>
    <ul>
      <li>An appeal is read by an authorised person.</li>
      <li>Submitting an appeal does not automatically restore your account or
        your content.</li>
      <li>Appeals do not erase reports or safety records.</li>
      <li>We do not tell you who reported you, and we do not explain the internal
        thresholds our safety systems use.</li>
    </ul>
    <p>
      Please include your ULMOX username and, if relevant, roughly when the
      decision happened. Do not include passwords or identity documents.
    </p>

    <h2>Related pages</h2>
    <p>
      <a href="privacy.html">Privacy Policy</a> &middot;
      <a href="terms.html">Terms of Service</a> &middot;
      <a href="safety.html">Child Safety Standards</a> &middot;
      <a href="delete_account.html">Delete your account</a>
    </p>`,
});

/* -------------------------------------------------------------------------- */
/* Translation Information                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Google's attribution rules require an application using its translation to
 * "state in the application description and help documentation that Google
 * Translate is used to power translation within the application and provide
 * links to the Cloud Translation site". This page is the help-documentation
 * half; the application-description half is a store-listing edit tracked in
 * PUBLICATION_CHECKLIST.md.
 *
 * No Google graphic is reproduced here. Google's badge requirement is that the
 * "powered by Google Translate" graphic appear "adjacent any translation
 * results" — this page renders no translation result, so the badge is not
 * required on it, and placing a Google mark on a page that carries none would
 * suggest an endorsement ULMOX does not have. The word marks below are Google's
 * own approved terminology, used unmodified, and nothing recreates a mark.
 */
const translation = page({
  file: "translation.html",
  title: "Translation Information - ULMOX",
  description:
    "How optional, on-device message translation works in ULMOX, what leaves the device, and why the original message is always the one that counts.",
  heading: "Translation information",
  body: `    <div class="callout">
      <p>
        <strong>${T.LOCALES.en.webGradualRollout}</strong>
      </p>
    </div>

    <p>${T.LOCALES.en.translationInfoPoweredBy}</p>

    <h2>How it works</h2>
    <ul>
      <li>${T.LOCALES.en.translationInfoOptional} Nothing is translated until you
        choose <strong>${T.TRANSLATE_ACTION}</strong> on a message you have
        received.</li>
      <li>${T.LOCALES.en.translationInfoOnDevice}</li>
      <li>${T.LOCALES.en.translationInfoModels}</li>
      <li>${T.LOCALES.en.webNoCopy}</li>
    </ul>

    <h2>What uses the network</h2>
    <p>${T.LOCALES.en.translationInfoNetwork}</p>
    <p>
      We do not claim that nothing ever leaves your device. What we can say is
      what the message itself does: the text you received and the translation of
      it are handled on your device, and ULMOX does not send either of them
      anywhere to be translated.
    </p>

    <h2>Accuracy</h2>
    <p>${T.LOCALES.en.translationInfoAccuracy}</p>
    <p>${T.LOCALES.en.translationInfoPivot}</p>
    <p>${T.LOCALES.en.translationInfoOriginal}</p>

    <h2>Reporting, blocking and moderation</h2>
    <p>${T.LOCALES.en.webModeration}</p>
    <p>
      A translation is not a moderation decision. It cannot make a message that
      was blocked or held deliverable, and no account is ever banned because of
      what a translation produced. Only an authorised ULMOX administrator can ban
      an account, and only after human review. See
      <a href="safety.html">Child Safety Standards</a>.
    </p>

    <h2>Managing downloaded language packs</h2>
    <p>${T.LOCALES.en.webModels}</p>

    <h2>${T.LOCALES.en.translationDisclaimerTitle}</h2>
    <div class="callout">
      <p>${T.DISCLAIMER}</p>
    </div>
    <p>${T.LOCALES.en.translationDisclaimerNote}</p>

    <h2>${T.LOCALES.en.translationLinksTitle}</h2>
    <p>
      Translation in ULMOX is powered by
      <a href="${T.GOOGLE_TRANSLATE_URL}" target="_blank" rel="noopener noreferrer">${T.GOOGLE_TRANSLATE_WORDMARK}</a>.
      Google&rsquo;s translation documentation is at
      <a href="${T.CLOUD_TRANSLATION_URL}" target="_blank" rel="noopener noreferrer">${T.CLOUD_TRANSLATION_NAME}</a>.
    </p>
    <p>
      Google provides the translation technology. Google does not write, review,
      approve or endorse any message sent through ULMOX, and it does not endorse
      ULMOX.
    </p>

    <h2>Related pages</h2>
    <p>
      <a href="privacy.html">Privacy Policy</a> &middot;
      <a href="terms.html">Terms of Service</a> &middot;
      <a href="safety.html">Child Safety Standards</a> &middot;
      <a href="support.html">Support</a> &middot;
      <a href="delete_account.html">Delete your account</a>
    </p>`,
});

/* -------------------------------------------------------------------------- */

const OUTPUTS = [
  ["delete_account.html", deleteAccount],
  ["privacy.html", privacy],
  ["terms.html", terms],
  ["safety.html", safety],
  ["support.html", support],
  ["translation.html", translation],
];

/* -------------------------------------------------------------------------- */
/* Localized Translation Information routes                                   */
/* -------------------------------------------------------------------------- */

/**
 * One localized Translation Information page.
 *
 * Every ULMOX-authored sentence comes from scripts/translation-content.js,
 * which holds the same hand-written translations the application ships. The
 * only text that is identical in every locale is Google's: the two word marks
 * and the disclaimer Google requires to be reproduced exactly.
 *
 * The localized routes are deliberately linked back to their own locale's
 * pages, never to the English ones, so a reader never falls out of their
 * language by following a link.
 */
function localizedTranslationPage(locale) {
  const t = T.LOCALES[locale];
  const isEnglish = locale === "en";

  // Stage 1.6W.1: this footer used to offer two links. A reader who landed on
  // a localized Translation Information page could reach Privacy and the
  // deletion page and nothing else — not Terms, not Child Safety Standards,
  // not Support. It now emits the same seven-route navigation every other
  // ULMOX page carries, from scripts/page-shell.js, in this locale's own words.
  const footerHtml = siteFooter(`${locale}/translation.html`);

  return page({
    file: "translation.html",
    lang: locale,
    title: `${t.translationInformationTitle} - ULMOX`,
    description: t.translationInfoPoweredBy,
    heading: t.translationInformationTitle,
    skipLabel: t.translationInformationTitle,
    effective: false,
    footerHtml,
    body: `    <div class="callout">
      <p><strong>${t.webGradualRollout}</strong></p>
    </div>

    <p>${t.translationInfoPoweredBy}</p>

    <ul>
      <li>${t.translationInfoOptional}</li>
      <li>${t.translationInfoOnDevice}</li>
      <li>${t.translationInfoModels}</li>
      <li>${t.translationInfoNetwork}</li>
      <li>${t.translationInfoAccuracy}</li>
      <li>${t.translationInfoPivot}</li>
      <li>${t.translationInfoOriginal}</li>
      <li>${t.webModeration}</li>
      <li>${t.webNoCopy}</li>
      <li>${t.webModels}</li>
    </ul>

    <h2>${t.translationDisclaimerTitle}</h2>
    <div class="callout">
      <p>${T.DISCLAIMER}</p>
    </div>
    <p>${t.translationDisclaimerNote}</p>

    <h2>${t.translationLinksTitle}</h2>
    <p>
      <a href="${T.GOOGLE_TRANSLATE_URL}" target="_blank" rel="noopener noreferrer">${T.GOOGLE_TRANSLATE_WORDMARK}</a>
      &middot;
      <a href="${T.CLOUD_TRANSLATION_URL}" target="_blank" rel="noopener noreferrer">${T.CLOUD_TRANSLATION_NAME}</a>
    </p>${isEnglish ? "" : ""}`,
  });
}

/** Localized "Delete Account" link labels, matching each locale's own page. */
const DELETE_LABELS = Object.freeze({
  en: "Delete Account",
  sv: "Radera konto",
  tr: "Hesabı sil",
  de: "Konto löschen",
  es: "Eliminar cuenta",
  fr: "Supprimer le compte",
  it: "Elimina account",
  pt: "Excluir conta",
  nl: "Account verwijderen",
  pl: "Usuń konto",
  fi: "Poista tili",
  ru: "Удалить аккаунт",
  ja: "アカウントを削除",
  ko: "계정 삭제",
  zh: "删除账号",
  ar: "حذف الحساب",
  hi: "खाता हटाएँ",
  th: "ลบบัญชี",
  vi: "Xóa tài khoản",
});

function generate(targetRoot = ROOT) {
  const written = [];
  for (const [file, html] of OUTPUTS) {
    fs.writeFileSync(path.join(targetRoot, file), html, "utf8");
    written.push(file);
  }
  for (const locale of T.LOCALE_CODES) {
    const file = path.join(locale, "translation.html");
    fs.writeFileSync(
      path.join(targetRoot, file),
      localizedTranslationPage(locale),
      "utf8"
    );
    written.push(file);
  }
  return written;
}

if (require.main === module) {
  const written = generate();
  console.log(`Generated ${written.length} pages: ${written.join(", ")}`);
}

module.exports = { generate, OUTPUTS, localizedTranslationPage, DELETE_LABELS };
