---
name: feedops-conversion-tracking-tests
description: Test, diagnose, and repair FeedOps HubSpot-to-GTM-to-GA4 conversion tracking for demo bookings, free audits, and contact forms. Use when validating conversion events, changing HubSpot embeds or dataLayer pushes, checking GTM-KR4TR7B, verifying GA4 stream G-E0STBHGGMQ, or investigating missing FeedOps conversions.
---

# FeedOps Conversion Tracking Tests

Use `scripts/test-conversion-tracking.mjs` to verify the browser-side path from HubSpot success through `dataLayer`, GTM, and GA4. Keep live submissions opt-in and never send personal data, especially email addresses, as GA4 event parameters.

## Conversion contract

Use these exact event names and destinations:

- Demo booking: `FeedOps_Meeting_Booked`
- Free audit/account creation: `FeedOps_Account_Created`
- Contact form: `FeedOps_Contact_Form`
- GTM container: `GTM-KR4TR7B`
- GA4 measurement ID: `G-E0STBHGGMQ`

Use successful HubSpot submission or meeting callbacks as the source signal. Do not use thank-you pages alone as conversion triggers because users can visit them directly and create duplicate conversions.

## Test workflow

1. Inspect the source and deployed GTM configuration. Confirm the HubSpot form IDs, GTM container, and GA4 measurement ID.

2. Run the safe static test:

   ```bash
   npm install
   npm run test:conversion:static
   ```

   This checks source event emissions, HubSpot IDs, the target measurement ID, and whether the published GTM payload contains all three event tags.

3. Run the synthetic check only with explicit approval because it sends marked test events to the live GA4 property:

   ```bash
   ALLOW_SYNTHETIC_EVENTS=1 npm run test:conversion:synthetic
   ```

   Verify that each request contains the expected `en` event value and `tid=G-E0STBHGGMQ`. Use test markers, DebugView, or appropriate filtering so test traffic is not mistaken for production conversions.

   Synthetic and live browser runs start with these UTM defaults:

   ```text
   utm_source=test-script-source
   utm_medium=test-script-medium
   utm_campaign=test-script-campaign
   ```

   Override them with `--utm-source`, `--utm-medium`, and `--utm-campaign`. Treat these as session-attribution inputs; do not add them as custom GA4 event parameters.

4. Run one controlled live flow at a time. The harness opens a visible browser and waits for manual submission:

   ```bash
   ALLOW_LIVE_SUBMISSION=1 node scripts/test-conversion-tracking.mjs --mode=live --flow=contact
   ALLOW_LIVE_SUBMISSION=1 node scripts/test-conversion-tracking.mjs --mode=live --flow=audit
   ALLOW_LIVE_SUBMISSION=1 node scripts/test-conversion-tracking.mjs --mode=live --flow=meeting
   ```

   Use controlled test data. The meeting flow creates an actual HubSpot appointment and must not be run casually.

5. Confirm the event in GTM Preview and GA4 DebugView. Check that it is received once, uses the target stream, and is marked as a conversion in GA4.

## Diagnosis rules

- If the source check fails, fix the page-side HubSpot callback or `dataLayer` push first.
- If source checks pass but GTM checks fail, publish the missing GA4 Event tag and trigger in `GTM-KR4TR7B`; do not keep changing website code to compensate.
- If `dataLayer` contains the event but no GA4 request appears, inspect the GTM trigger, tag firing, consent state, and measurement ID.
- If GA4 receives the request but reports no conversion, check GA4 event registration, conversion status, DebugView timing, and property/stream selection.
- Treat missing or malformed HubSpot success messages as an integration issue, not a GA4 reporting issue.
- Never include email, name, phone, or other directly identifying form values in GA4 parameters.
