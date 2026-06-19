import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
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
  "product-feed-management/",
  "shopping-feed-agency/",
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

const assetPathMap = [];
const legacyAssetAliases = [
  [
    "assets/feedops.com/wp-content/uploads/2022/05/Feedops-staggered-logo-Final-2-e1653522818889.png",
    "assets/feedops.com/wp-content/uploads/2022/05/Feedops-staggered-logo-Final-2-600x600.png"
  ]
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitiseSegment(segment) {
  return segment.replace(/_/g, "-");
}

function toUrlPath(value) {
  return value.split("/").join("/");
}

function copyFile(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}

function copySanitisedAssets(sourceDir, outputDir, originalParts = [], publicParts = []) {
  for (const entry of readdirSync(sourceDir)) {
    const source = join(sourceDir, entry);
    const stats = statSync(source);
    const nextOriginalParts = [...originalParts, entry];
    const nextPublicParts = [...publicParts, sanitiseSegment(entry)];

    if (stats.isDirectory()) {
      copySanitisedAssets(source, outputDir, nextOriginalParts, nextPublicParts);
      continue;
    }

    if (entry.endsWith(".html") || entry.endsWith(".asset")) {
      continue;
    }

    const originalPath = toUrlPath(join("assets", ...nextOriginalParts));
    const publicPath = toUrlPath(join("assets", ...nextPublicParts));
    assetPathMap.push([originalPath, publicPath]);
    copyFile(source, join(outputDir, ...nextPublicParts));
  }
}

function rewriteAssetReferences(content) {
  let output = content;
  for (const [originalPath, publicPath] of legacyAssetAliases) {
    output = output.replace(new RegExp(escapeRegExp(originalPath), "g"), publicPath);
  }
  for (const [originalPath, publicPath] of assetPathMap.sort((a, b) => b[0].length - a[0].length)) {
    output = output.replace(new RegExp(escapeRegExp(originalPath), "g"), publicPath);
  }
  return output.replace(/assets\//g, "assets/");
}

function copyTextPath(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, rewriteAssetReferences(readFileSync(from, "utf8")));
}

function copyPage(page) {
  const source = page ? join(sourceRoot, page, "index.html") : join(sourceRoot, "index.html");
  const target = page ? join(outputRoot, page, "index.html") : join(outputRoot, "index.html");
  copyTextPath(source, target);
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

copySanitisedAssets(join(sourceRoot, "assets"), join(outputRoot, "assets"));

for (const file of sharedFiles) {
  copyTextPath(join(sourceRoot, file), join(outputRoot, file));
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
