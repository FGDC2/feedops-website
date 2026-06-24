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
const legacyArchiveRoot = "archive/legacy-pages/site";
const outputRoot = "render-site";
const origin = "https://feedops.com";
const gtmContainerId = "GTM-KR4TR7B";

const gtmHeadSnippet = `<!-- Google Tag Manager -->
  <script>
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "feedops_consent_default", analytics_storage: "denied", ad_storage: "denied" });
    window.FeedOpsGTM = window.FeedOpsGTM || {
      id: "${gtmContainerId}",
      loaded: false,
      load: function () {
        if (this.loaded) return;
        this.loaded = true;
        window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var firstScript = document.getElementsByTagName("script")[0];
        var gtmScript = document.createElement("script");
        gtmScript.async = true;
        gtmScript.src = "https://www.googletagmanager.com/gtm.js?id=" + this.id;
        firstScript.parentNode.insertBefore(gtmScript, firstScript);
      }
    };
  </script>
  <!-- End Google Tag Manager -->`;

const gtmBodySnippet = `<!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmContainerId}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`;

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

const rootHtmlFiles = [
  "404.html"
];

const rootStaticFiles = [
  "favicon.ico"
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

function isPublicPagePath(page) {
  const firstSegment = page.replace(/\/$/, "").split("/")[0];
  return !["admin", "assets", "cdn-cgi"].includes(firstSegment);
}

function discoverPublicPages(directory = sourceRoot, page = "") {
  const pages = [];

  for (const entry of readdirSync(directory)) {
    const source = join(directory, entry);
    const stats = statSync(source);

    if (stats.isDirectory()) {
      const nextPage = `${page}${entry}/`;
      if (isPublicPagePath(nextPage)) {
        pages.push(...discoverPublicPages(source, nextPage));
      }
      continue;
    }

    if (entry === "index.html" && isPublicPagePath(page)) {
      pages.push(page);
    }
  }

  return pages.sort();
}

function discoverLegacyArchivePages(directory = legacyArchiveRoot, page = "") {
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) return [];
  const pages = [];

  for (const entry of readdirSync(directory)) {
    const source = join(directory, entry);
    const stats = statSync(source);

    if (stats.isDirectory()) {
      pages.push(...discoverLegacyArchivePages(source, `${page}${entry}/`));
      continue;
    }

    if (entry === "index.html") {
      pages.push(page);
    }
  }

  return pages.sort();
}

function injectGoogleTagManager(content) {
  let output = content
    .replace(/\n?\s*<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager[\s\S]*?-->\s*/g, "\n")
    .replace(/\n?\s*<!-- Google Tag Manager \(noscript\)[\s\S]*?<!-- End Google Tag Manager \(noscript\)[\s\S]*?-->\s*/g, "\n");

  output = output.replace(/<head>/i, `<head>\n  ${gtmHeadSnippet}`);
  output = output.replace(/<body([^>]*)>/i, `<body$1>\n  ${gtmBodySnippet}`);
  return output;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function minifyInlineStyles(content) {
  return content.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, function (_match, attributes, css) {
    if (!css.trim()) return `<style${attributes}></style>`;
    return `<style${attributes}>${minifyCss(css)}</style>`;
  });
}

function stabiliseSharedHeaderStyles(content) {
  return content.replace(
    /<link rel="preload" href="([^"]*header-standard\.css[^"]*)" as="style" onload="this\.onload=null;this\.rel='stylesheet'"><noscript><link rel="stylesheet" href="\1"><\/noscript>/g,
    '<link rel="stylesheet" href="$1">'
  );
}

function inlineSharedHeaderStyles(content) {
  if (content.includes('id="feedops-standard-header-css"')) return content;
  const headerCss = minifyCss(readFileSync(join(sourceRoot, "header-standard.css"), "utf8"));
  const inlineHeaderCss = `<style id="feedops-standard-header-css">${headerCss}</style>`;
  const output = content.replace(
    /<link rel="stylesheet" href="[^"]*header-standard\.css[^"]*">\s*/g,
    inlineHeaderCss
  );
  if (output !== content) return output;
  return content.replace(/<\/head>/i, `  ${inlineHeaderCss}\n</head>`);
}

function injectHeaderStabilityStyles(content) {
  if (content.includes('id="feedops-header-stability"')) return content;
  const stabilityStyles = [
    '<style id="feedops-header-stability">',
    'header.site-header{min-height:146px!important}',
    'header.site-header .mode-inner{min-height:56px!important;padding:6px 0!important}',
    '@media(max-width:620px){header.site-header{min-height:73px!important}header.site-header .mode-switch{display:none!important}header.site-header .nav{min-height:72px!important;height:auto!important;padding:12px 0!important}header.site-header .nav-links,header.site-header .nav-actions{display:none!important}}',
    '</style>'
  ].join("");
  return content.replace(/<\/head>/i, `  ${stabilityStyles}\n</head>`);
}

function pageDepth(page) {
  return page ? page.replace(/\/$/, "").split("/").length : 0;
}

function pageRoot(page) {
  return "../".repeat(pageDepth(page));
}

function pageMode(page) {
  if (page === "product-feed-platform/" || page === "software/") return "platform";
  if (page === "contact_us/" || (page || "").startsWith("contact_us/")) return "utility";
  if (page === "product-feed-management/") return "executive";
  if (page === "shopping-feed-agency/") return "agency";
  return "expert";
}

function navItems(mode, page = "") {
  if (page === "product-feed-platform/" || page === "software/") {
    return [
      ["Playbook", "#playbook", "playbook"],
      ["AI Settings", "#ai-settings", "ai-settings"],
      ["Product Data", "#product-data", "product-data"],
      ["Feed Rules", "#feed-rules", "feed-rules"],
      ["Orders", "#orders", "orders"],
      ["Alerts", "#alerts", "alerts"],
      ["Channels", "#connected-channels", "connected-channels"]
    ];
  }

  const items = {
    expert: [
      ["System", "#agent", "agent"],
      ["Operations", "#operations", "operations"],
      ["Sources", "#sources", "sources"],
      ["Channels", "#channels", "channels"],
      ["Playbook", "#workflow", "workflow"],
      ["Pricing", "#pricing", "pricing"],
      ["FAQ", "#seo-faq", "seo-faq"]
    ],
    executive: [
      ["Opportunity", "product-feed-management/#opportunity", "opportunity"],
      ["Accountability", "product-feed-management/#accountability", "accountability"],
      ["Responsibility", "product-feed-management/#responsibility", "responsibility"],
      ["Architecture", "product-feed-management/#architecture", "architecture"],
      ["Channels", "product-feed-management/#channels", "channels"],
      ["Pricing", "product-feed-management/#fit", "fit"]
    ],
    agency: [
      ["Model", "shopping-feed-agency/#model", "model"],
      ["Issues", "shopping-feed-agency/#feed-problems", "feed-problems"],
      ["Roles", "shopping-feed-agency/#roles", "roles"],
      ["Process", "shopping-feed-agency/#process", "process"],
      ["Partner", "shopping-feed-agency/#partner-model", "partner-model"],
      ["FAQ", "shopping-feed-agency/#agency-faq", "agency-faq"]
    ]
  };
  return items[mode] || items.expert;
}

function standardHeaderForPage(page) {
  const root = pageRoot(page);
  const mode = pageMode(page);
  const href = (path) => path.startsWith("#") ? path : `${root}${path}`;
  const active = (name) => name === mode ? " is-active" : "";
  const modeCurrent = (name) => name === mode ? ' aria-current="page"' : "";
  const platformActive = mode === "platform" ? " is-active" : "";
  const platformCurrent = mode === "platform" ? ' aria-current="page"' : "";
  const contactActive = mode === "utility" ? " is-active" : "";
  const contactCurrent = mode === "utility" ? ' aria-current="page"' : "";
  const navLinks = navItems(mode, page).map(([label, url, section]) =>
    `      <a data-feedops-section="${section}" href="${href(url)}">${label}</a>`
  ).join("");
  return [
    '<header id="feedops-standard-header" class="feedops-header">',
    '  <div class="feedops-mode-switch" aria-label="Explore FeedOps as">',
    '    <div class="feedops-mode-inner">',
    '      <div class="feedops-mode-label">Explore FeedOps as</div>',
    '      <div class="feedops-mode-controls">',
    '        <div class="feedops-mode-options">',
    `          <a class="feedops-mode-option${active("expert")}" data-feedops-mode="expert" href="${href("")}"${modeCurrent("expert")}>Performance expert</a>`,
    `          <a class="feedops-mode-option${active("executive")}" data-feedops-mode="executive" href="${href("product-feed-management/")}"${modeCurrent("executive")}>Executive mode</a>`,
    `          <a class="feedops-mode-option${active("agency")}" data-feedops-mode="agency" href="${href("shopping-feed-agency/")}"${modeCurrent("agency")}>Media agency</a>`,
    '        </div>',
    `        <a class="feedops-mode-link${platformActive}" data-feedops-platform-link href="${href("product-feed-platform/")}"${platformCurrent}>Platform</a>`,
    `        <a class="feedops-mode-link${contactActive}" data-feedops-contact-link href="${href("contact_us/")}"${contactCurrent}>Contact</a>`,
    '        <a class="feedops-mode-login" href="https://app.feedops.com/feed_ops/sign_in" target="_blank" rel="noopener">Login</a>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <nav class="feedops-nav" aria-label="Main navigation">',
    `    <a class="feedops-logo" href="${href("")}" aria-label="FeedOps home">`,
    `      <img src="${href("assets/feedops.com/wp-content/uploads/2022/12/Feedops-logo-Final-2-4-300x110.png")}" alt="FeedOps" width="300" height="110">`,
    '    </a>',
    '    <button class="feedops-menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="feedops-mobile-menu">',
    '      <span class="feedops-menu-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>',
    '    </button>',
    '    <div class="feedops-nav-links" aria-label="Primary links">',
    navLinks,
    '    </div>',
    '    <div class="feedops-nav-actions">',
    `      <a class="feedops-nav-cta" href="${href("book-live-demo/")}">Book a demo</a>`,
    '    </div>',
    '  </nav>',
    '  <div class="feedops-mobile-menu" id="feedops-mobile-menu" hidden>',
    '    <div class="feedops-mobile-panel">',
    '      <div class="feedops-mobile-label">Explore FeedOps as</div>',
    '      <div class="feedops-mobile-modes">',
    `        <a class="feedops-mode-option${active("expert")}" data-feedops-mode="expert" href="${href("")}"${modeCurrent("expert")}>Performance expert</a>`,
    `        <a class="feedops-mode-option${active("executive")}" data-feedops-mode="executive" href="${href("product-feed-management/")}"${modeCurrent("executive")}>Executive mode</a>`,
    `        <a class="feedops-mode-option${active("agency")}" data-feedops-mode="agency" href="${href("shopping-feed-agency/")}"${modeCurrent("agency")}>Media agency</a>`,
    '      </div>',
    '      <div class="feedops-mobile-links" aria-label="Mobile primary links">',
    navLinks,
    '      </div>',
    '      <div class="feedops-mobile-utility">',
    `        <a class="${platformActive.trim()}" data-feedops-platform-link href="${href("product-feed-platform/")}"${platformCurrent}>Platform</a>`,
    `        <a class="${contactActive.trim()}" data-feedops-contact-link href="${href("contact_us/")}"${contactCurrent}>Contact</a>`,
    '        <a href="https://app.feedops.com/feed_ops/sign_in" target="_blank" rel="noopener">Login</a>',
    '      </div>',
    `      <a class="feedops-mobile-cta" href="${href("book-live-demo/")}">Book a demo</a>`,
    '    </div>',
    '  </div>',
    '</header>'
  ].join("\n");
}

function installStandardHeaderMarkup(content, page) {
  if (!content.includes("<body")) return content;
  if (content.includes('id="feedops-standard-header"')) return content;
  return content.replace(/<header class="site-header">[\s\S]*?<\/header>/i, standardHeaderForPage(page));
}

function copyTextPath(from, to, transform = (content) => content) {
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, minifyInlineStyles(injectHeaderStabilityStyles(inlineSharedHeaderStyles(stabiliseSharedHeaderStyles(rewriteAssetReferences(transform(readFileSync(from, "utf8"))))))));
}

function copyPage(page) {
  const source = page ? join(sourceRoot, page, "index.html") : join(sourceRoot, "index.html");
  const target = page ? join(outputRoot, page, "index.html") : join(outputRoot, "index.html");
  copyTextPath(source, target, (content) => installStandardHeaderMarkup(injectGoogleTagManager(content), page));
}

function legacyArchivePageHtml(page) {
  const path = `/${page}`;
  const title = "Page archived - FeedOps";
  return `<!doctype html>
<html lang="en">
<head>
  ${gtmHeadSnippet}
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${title}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:0;color:#111827;background:#fff}
    main{max-width:720px;margin:12vh auto;padding:0 24px;line-height:1.55}
    a{color:#0f4c81}
  </style>
</head>
<body>
  ${gtmBodySnippet}
  <main>
    <h1>This page has been archived</h1>
    <p>The old page at <code>${path}</code> is no longer part of the public FeedOps site.</p>
    <p><a href="/">Go to FeedOps</a></p>
  </main>
</body>
</html>`;
}

function writeLegacyArchivePage(page) {
  const target = join(outputRoot, page, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, minifyInlineStyles(legacyArchivePageHtml(page)));
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

copySanitisedAssets(join(sourceRoot, "assets"), join(outputRoot, "assets"));

for (const file of sharedFiles) {
  copyTextPath(join(sourceRoot, file), join(outputRoot, file));
}

for (const file of rootHtmlFiles) {
  copyTextPath(join(sourceRoot, file), join(outputRoot, file), injectGoogleTagManager);
}

for (const file of rootStaticFiles) {
  copyFile(join(sourceRoot, file), join(outputRoot, file));
}

const pages = discoverPublicPages();

for (const page of pages) {
  copyPage(page);
}

const legacyArchivePages = discoverLegacyArchivePages();

for (const page of legacyArchivePages) {
  writeLegacyArchivePage(page);
}

console.log(`Built ${outputRoot} with ${pages.length} public pages and ${legacyArchivePages.length} archived page tombstones.`);
