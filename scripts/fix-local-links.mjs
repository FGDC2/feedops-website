import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_DIR = path.resolve("site");

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function relativeReference(fromFile, targetFromSiteRoot) {
  const toFile = path.join(SITE_DIR, targetFromSiteRoot);
  let rel = path.relative(path.dirname(fromFile), toFile).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function repairHtml(html, file) {
  let output = html;
  const localHomeAsset = relativeReference(file, "assets/feedops.com/index.html");
  const localHomePage = relativeReference(file, "index.html");

  output = output.replaceAll(localHomeAsset, localHomePage);

  for (const root of ["wp-content", "wp-includes"]) {
    const assetRoot = `${relativeReference(file, `assets/feedops.com/${root}/`)}/`;
    output = output.replaceAll(`./index.html${root}/`, assetRoot);
    output = output.replaceAll(`../index.html${root}/`, assetRoot);
  }

  output = output.replaceAll("/wp-contentthemes/", "/wp-content/themes/");
  output = output.replaceAll("/wp-contentuploads/", "/wp-content/uploads/");
  output = output.replaceAll("/wp-contentplugins/", "/wp-content/plugins/");
  output = output.replaceAll("/wp-contentmu-plugins/", "/wp-content/mu-plugins/");
  output = output.replaceAll("/wp-includesjs/", "/wp-includes/js/");
  output = output.replaceAll("/wp-includescss/", "/wp-includes/css/");

  output = output.replace(/(["'])\.\/index\.html([a-z0-9][a-z0-9-]*\/)(["'#?])/gi, (_match, quote, slug, suffix) => {
    return `${quote}${relativeReference(file, `${slug}index.html`)}${suffix}`;
  });

  output = output.replace(/(["'])\.\.\/index\.html([a-z0-9][a-z0-9-]*\/)(["'#?])/gi, (_match, quote, slug, suffix) => {
    return `${quote}${relativeReference(file, `${slug}index.html`)}${suffix}`;
  });

  return output;
}

let changed = 0;
for (const file of await htmlFiles(SITE_DIR)) {
  const original = await readFile(file, "utf8");
  const repaired = repairHtml(original, file);
  if (repaired !== original) {
    await writeFile(file, repaired);
    changed += 1;
  }
}

console.log(`Repaired local links in ${changed} HTML files.`);
