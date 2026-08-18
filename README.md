# FeedOps Local Website Import

This project contains a local mirror of the public FeedOps website.

## Open locally

```bash
python3 -m http.server 4173 --directory site
```

Then open:

```text
http://127.0.0.1:4173/
```

## Imported files

- `site/` contains the local website copy.
- `marketing/` contains marketing planning and reference material that can inform later website updates.
- `site/_assets/` contains downloaded CSS, JavaScript, images, fonts, and other page assets.
- `scripts/import-site.mjs` imports/crawls the public site.
- `scripts/fix-local-links.mjs` repairs local WordPress links after an import pass.

## Publishing boundary

The temporary public admin pages have been removed from `site/admin/`. Marketing and planning work should stay outside `site/` unless it is intentionally being turned into a public website change.

## Current import status

- Source: `https://feedops.com/`
- Crawl cap reached: 500 discovered pages
- Local output: 247 HTML files, 2,016 total files, about 340 MB
- Import report: `site/import-report.json`
- Verified locally: home, Platform, Book Live Demo, and Pricing pages render with local styles/assets.
- Known misses: 6 failed URLs, mostly invalid placeholder links, private/generated endpoints, or timed-out assets listed in the import report.

After rerunning the importer, run:

```bash
node scripts/fix-local-links.mjs
```

## Conversion tracking tests

Install the test dependency with `npm install`, then run the safe static check:

```bash
npm run test:conversion:static
```

The static check validates the website event emissions and the currently published GTM container. It will fail until all three GA4 event tags are published in GTM.

Synthetic GA4 checks are opt-in because they send marked test events to the live property:

```bash
npm run test:conversion:synthetic
```

Synthetic and live browser runs use these UTM defaults: `utm_source=test-script-source`, `utm_medium=test-script-medium`, and `utm_campaign=test-script-campaign`. Override them with `--utm-source`, `--utm-medium`, and `--utm-campaign` when needed.

Live checks open a browser and wait for a manually submitted, controlled test form or meeting. They require `ALLOW_LIVE_SUBMISSION=1` and a flow argument:

```bash
ALLOW_LIVE_SUBMISSION=1 node scripts/test-conversion-tracking.mjs --mode=live --flow=contact
ALLOW_LIVE_SUBMISSION=1 node scripts/test-conversion-tracking.mjs --mode=live --flow=audit
ALLOW_LIVE_SUBMISSION=1 node scripts/test-conversion-tracking.mjs --mode=live --flow=meeting
```
