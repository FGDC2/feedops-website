import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("../render-site/", import.meta.url)));
const port = Number(process.env.PORT || 10000);
const host = process.env.HOST || undefined;
const renderHost = "feedops-website.onrender.com";
const canonicalOrigin = "https://feedops.com";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

const pathRedirects = [
  [/^\/executive(?:\/|$)/, "/product-feed-management/"],
  [/^\/agency(?:\/|$)/, "/shopping-feed-agency/"],
  [/^\/admin(?:\/|$)/, "/"]
];

function getHost(request) {
  return String(request.headers.host || "").split(":")[0].toLowerCase();
}

function redirectToCanonical(request, response) {
  const target = new URL(request.url || "/", canonicalOrigin);
  response.writeHead(301, {
    Location: target.href,
    "Cache-Control": "public, max-age=3600"
  });
  response.end();
}

function redirectToPath(destination, response) {
  response.writeHead(301, {
    Location: destination,
    "Cache-Control": "public, max-age=3600"
  });
  response.end();
}

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const clean = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  return join(rootDir, clean);
}

function findFile(pathname) {
  const basePath = safePath(pathname);
  const candidates = pathname.endsWith("/")
    ? [join(basePath, "index.html")]
    : [basePath, join(basePath, "index.html"), `${basePath}.html`];

  return candidates.find((candidate) => {
    const resolved = resolve(candidate);
    return resolved === rootDir || resolved.startsWith(`${rootDir}${sep}`)
      ? existsSync(resolved) && statSync(resolved).isFile()
      : false;
  });
}

function serveFile(request, response, filePath) {
  const type = contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": filePath.endsWith(".html") ? "no-cache" : "public, max-age=31536000, immutable"
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

createServer((request, response) => {
  if (getHost(request) === renderHost) {
    redirectToCanonical(request, response);
    return;
  }

  const url = new URL(request.url || "/", canonicalOrigin);
  const pathRedirect = pathRedirects.find(([pattern]) => pattern.test(url.pathname));

  if (pathRedirect) {
    redirectToPath(pathRedirect[1], response);
    return;
  }

  const filePath = findFile(url.pathname);

  if (filePath) {
    serveFile(request, response, filePath);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}).listen(port, host, () => {
  console.log(`Serving ${rootDir} on port ${port}`);
});
