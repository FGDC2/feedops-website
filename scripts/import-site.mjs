import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const START_URL = "https://feedops.com/";
const OUT_DIR = path.resolve("site");
const MAX_PAGES = Number(process.env.MAX_PAGES || 500);
const USER_AGENT = "Mozilla/5.0 (compatible; LocalWebsiteImporter/1.0)";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 15000);
const execFileAsync = promisify(execFile);

const pageUrls = new Set();
const assetUrls = new Set();
const downloaded = new Set();
const failures = [];

function normalizeUrl(raw, base = START_URL) {
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) {
    return "";
  }
  try {
    const url = new URL(raw, base);
    url.hash = "";
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

function isFeedOpsPage(url) {
  const parsed = new URL(url);
  if (!["feedops.com", "www.feedops.com"].includes(parsed.hostname)) return false;
  if (/\.(css|js|json|png|jpe?g|gif|webp|svg|ico|avif|pdf|zip|mp4|webm|woff2?|ttf|eot)$/i.test(parsed.pathname)) return false;
  return true;
}

function localPathFor(url, kind = "asset") {
  const parsed = new URL(url);
  const querySlug = parsed.search
    ? `query-${parsed.search
        .slice(1)
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()}`
    : "";
  let pathname = decodeURIComponent(parsed.pathname);
  if (!pathname || pathname === "/") pathname = "/index.html";

  if (kind === "page") {
    if (querySlug && pathname === "/index.html") pathname = `/${querySlug}/index.html`;
    if (pathname.endsWith("/")) pathname += "index.html";
    if (!path.extname(pathname)) pathname = `${pathname.replace(/\/$/, "")}/index.html`;
    return path.join(OUT_DIR, pathname);
  }

  const hostDir = parsed.hostname.replace(/^www\./, "");
  if (pathname.endsWith("/")) pathname += "index";
  let target = path.join(OUT_DIR, "_assets", hostDir, pathname);
  if (!path.extname(target)) target += ".asset";
  return target;
}

function relativeReference(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function htmlAttributes(html) {
  const attrs = [];
  const attrPattern = /\s(?:href|src|poster|data-src|data-background-image)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrPattern.exec(html))) attrs.push(match[1]);

  const srcsetPattern = /\s(?:srcset|data-srcset)=["']([^"']+)["']/gi;
  while ((match = srcsetPattern.exec(html))) {
    for (const part of match[1].split(",")) {
      const candidate = part.trim().split(/\s+/)[0];
      if (candidate) attrs.push(candidate);
    }
  }
  return attrs;
}

function cssUrls(css) {
  const urls = [];
  const pattern = /url\((?!['"]?data:)(['"]?)([^'")]+)\1\)/gi;
  let match;
  while ((match = pattern.exec(css))) urls.push(match[2]);
  return urls;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceHtmlReference(html, raw, replacement) {
  const escaped = escapeRegExp(raw);
  const attrPattern = new RegExp(`((?:href|src|poster|data-src|data-background-image)=["'])${escaped}(["'])`, "gi");
  let output = html.replace(attrPattern, `$1${replacement}$2`);

  const srcsetPattern = /((?:srcset|data-srcset)=["'])([^"']+)(["'])/gi;
  output = output.replace(srcsetPattern, (_match, prefix, value, suffix) => {
    const updated = value
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return part;
        const [candidate, ...descriptor] = trimmed.split(/\s+/);
        if (candidate !== raw) return part;
        return [replacement, ...descriptor].join(" ");
      })
      .join(", ");
    return `${prefix}${updated}${suffix}`;
  });

  return output;
}

async function fetchText(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["--location", "--silent", "--show-error", "--compressed", "--max-time", String(Math.ceil(REQUEST_TIMEOUT_MS / 1000)), "--user-agent", USER_AGENT, url],
    { encoding: "utf8", maxBuffer: 80 * 1024 * 1024, timeout: REQUEST_TIMEOUT_MS + 2000 }
  );
  return {
    body: stdout,
    contentType: ""
  };
}

async function fetchBytes(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["--location", "--silent", "--show-error", "--compressed", "--max-time", String(Math.ceil(REQUEST_TIMEOUT_MS / 1000)), "--user-agent", USER_AGENT, url],
    { encoding: "buffer", maxBuffer: 120 * 1024 * 1024, timeout: REQUEST_TIMEOUT_MS + 2000 }
  );
  return {
    body: stdout,
    contentType: ""
  };
}

async function discoverFromSitemap() {
  const sitemapSeeds = [
    "https://feedops.com/sitemap.xml",
    "https://feedops.com/sitemap_index.xml",
    "https://feedops.com/page-sitemap.xml"
  ];
  const queue = [...sitemapSeeds];
  const seen = new Set();

  while (queue.length) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const { body } = await fetchText(url);
      const locs = [...body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
      for (const loc of locs) {
        const normalized = normalizeUrl(loc);
        if (!normalized) continue;
        if (/sitemap.*\.xml$/i.test(new URL(normalized).pathname)) queue.push(normalized);
        else if (isFeedOpsPage(normalized) && pageUrls.size < MAX_PAGES) pageUrls.add(normalized);
      }
    } catch (error) {
      failures.push({ url, error: error.message });
    }
  }
}

async function downloadAsset(url, fromFile) {
  const normalized = normalizeUrl(url);
  if (!normalized || downloaded.has(normalized)) return normalized ? localPathFor(normalized) : "";
  downloaded.add(normalized);

  const outFile = localPathFor(normalized);
  try {
    const { body, contentType } = await fetchBytes(normalized);
    let output = body;
    if (/text\/css/i.test(contentType) || /\.css(?:$|\?)/i.test(new URL(normalized).pathname)) {
      let css = body.toString("utf8");
      for (const raw of cssUrls(css)) {
        const assetUrl = normalizeUrl(raw, normalized);
        if (!assetUrl) continue;
        const nestedFile = await downloadAsset(assetUrl, outFile);
        css = css.split(raw).join(relativeReference(outFile, nestedFile));
      }
      output = Buffer.from(css);
    }
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, output);
    return outFile;
  } catch (error) {
    failures.push({ url: normalized, error: error.message });
    return outFile;
  }
}

async function crawlAndWritePage(url) {
  const outFile = localPathFor(url, "page");
  try {
    const { body, contentType } = await fetchText(url);
    if (!/html/i.test(contentType) && !/^\s*(?:<!doctype\s+html|<html[\s>])/i.test(body)) return;
    let html = body;

    const references = [...new Set(htmlAttributes(body))].sort((a, b) => b.length - a.length);
    for (const raw of references) {
      const absolute = normalizeUrl(raw, url);
      if (!absolute) continue;
      if (isFeedOpsPage(absolute) && pageUrls.size < MAX_PAGES) {
        pageUrls.add(absolute);
        html = replaceHtmlReference(html, raw, relativeReference(outFile, localPathFor(absolute, "page")));
      } else {
        assetUrls.add(absolute);
        const assetFile = await downloadAsset(absolute, outFile);
        html = replaceHtmlReference(html, raw, relativeReference(outFile, assetFile));
      }
    }

    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, html);
  } catch (error) {
    failures.push({ url, error: error.message });
  }
}

await mkdir(OUT_DIR, { recursive: true });
pageUrls.add(START_URL);
process.stdout.write("Discovering FeedOps pages from sitemaps...\n");
await discoverFromSitemap();

const queue = [...pageUrls];
for (let index = 0; index < queue.length && index < MAX_PAGES; index += 1) {
  const url = queue[index];
  await crawlAndWritePage(url);
  for (const discovered of pageUrls) {
    if (!queue.includes(discovered)) queue.push(discovered);
  }
  process.stdout.write(`\rImported pages: ${Math.min(index + 1, MAX_PAGES)}/${queue.length} | assets: ${downloaded.size}`);
}

const report = {
  source: START_URL,
  output: OUT_DIR,
  pages: [...pageUrls].length,
  assets: downloaded.size,
  failures
};

await writeFile(path.join(OUT_DIR, "import-report.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`\nDone. Pages: ${report.pages}. Assets: ${report.assets}. Failures: ${report.failures.length}.\n`);

if (!existsSync(path.join(OUT_DIR, "index.html"))) {
  const rootPage = localPathFor(START_URL, "page");
  if (existsSync(rootPage)) {
    await writeFile(path.join(OUT_DIR, "index.html"), await readFile(rootPage));
  }
}
