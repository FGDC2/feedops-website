import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const sourceRoot = "site";
const outputRoot = "render-site";
const origin = "https://feedops.com";

const pages = [
  "",
  "company/",
  "learning/",
  "contact-us/",
  "privacy-policy/",
  "executive/",
  "agency/",
  "pricing/",
  "book-live-demo/",
  "free-google-shopping-feed-audit/",
  "faq/",
  "guide/google-shopping-feed-optimization-guide/",
  "guide/google-shopping-ads-management/",
  "guide/google-local-inventory-ads-performance-max/",
  "google-shopping-product-title-optimization/",
  "feedops/google-shopping-free-listings/",
  "what-is-a-google-shopping-feed/",
  "google-shopping-graph-explained/",
  "product-type-google-shopping/",
  "google-product-category/",
  "google-merchant-center-errors/",
  "google-shopping-ads-not-showing/",
  "feedonomics-alternative-competitor/",
  "intelligent-reach-alternative/"
];

const sharedFiles = [
  "header-standard.css",
  "header-standard.js",
  "footer-standard.css",
  "footer-standard.js",
  "cookie-consent.js"
];

function copyPath(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

function copyPage(page) {
  const source = page ? join(sourceRoot, page, "index.html") : join(sourceRoot, "index.html");
  const target = page ? join(outputRoot, page, "index.html") : join(outputRoot, "index.html");
  copyPath(source, target);
}

function pruneHtmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    const stats = statSync(file);
    if (stats.isDirectory()) {
      pruneHtmlFiles(file);
    } else if (entry.endsWith(".html")) {
      rmSync(file, { force: true });
    }
  }
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

copyPath(join(sourceRoot, "_assets"), join(outputRoot, "_assets"));
pruneHtmlFiles(join(outputRoot, "_assets"));

for (const file of sharedFiles) {
  copyPath(join(sourceRoot, file), join(outputRoot, file));
}

for (const page of pages) {
  copyPage(page);
}

const sitemapUrls = pages
  .map((page) => `  <url><loc>${origin}/${page}</loc></url>`)
  .join("\n");

writeFileSync(
  join(outputRoot, "sitemap.xml"),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapUrls,
    "</urlset>",
    ""
  ].join("\n")
);

writeFileSync(
  join(outputRoot, "robots.txt"),
  [
    "# FeedOps robots.txt",
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://feedops.com/sitemap.xml",
    ""
  ].join("\n")
);

writeFileSync(
  join(outputRoot, "llms.txt"),
  [
    "# FeedOps",
    "",
    "## Public Pages",
    ...pages.map((page) => `- ${origin}/${page}`),
    ""
  ].join("\n")
);

console.log(`Built ${outputRoot} with ${pages.length} public pages.`);
