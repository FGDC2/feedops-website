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
const gtmContainerId = "GTM-KR4TR7B";

const gtmHeadSnippet = `<!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${gtmContainerId}');</script>
  <!-- End Google Tag Manager -->`;

const gtmBodySnippet = `<!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmContainerId}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`;

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
  "cookie-consent.js",
  "free-google-shopping-feed-audit.js",
  "book-live-demo.js",
  "sitemap.xml",
  "robots.txt",
  "llms.txt"
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

function injectGoogleTagManager(content) {
  let output = content
    .replace(/\n?\s*<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->\s*/g, "\n")
    .replace(/\n?\s*<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->\s*/g, "\n");

  output = output.replace(/<head>/i, `<head>\n  ${gtmHeadSnippet}`);
  output = output.replace(/<body([^>]*)>/i, `<body$1>\n  ${gtmBodySnippet}`);
  return output;
}

function copyTextPath(from, to, transform = (content) => content) {
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, rewriteAssetReferences(transform(readFileSync(from, "utf8"))));
}

function copyPage(page) {
  const source = page ? join(sourceRoot, page, "index.html") : join(sourceRoot, "index.html");
  const target = page ? join(outputRoot, page, "index.html") : join(outputRoot, "index.html");
  copyTextPath(source, target, injectGoogleTagManager);
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

console.log(`Built ${outputRoot} with ${pages.length} public pages.`);
