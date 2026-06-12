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
- `site/_assets/` contains downloaded CSS, JavaScript, images, fonts, and other page assets.
- `scripts/import-site.mjs` imports/crawls the public site.
- `scripts/fix-local-links.mjs` repairs local WordPress links after an import pass.

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
