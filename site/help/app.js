const app = document.querySelector("#app");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const staticMode = window.FEEDOPS_HELP_MODE === "static";
const apiBase = window.FEEDOPS_HELP_API_BASE || "";
const popularSlugs = [
  "connect-shopify",
  "fix-google-merchant-center-permission-issues",
  "connect-google-merchant-center",
  "why-products-are-not-importing",
  "connect-meta",
  "why-a-feed-is-not-updating"
];

let articles = [];

window.addEventListener("hashchange", renderRoute);
searchInput.addEventListener("input", renderArticleList);
searchForm.addEventListener("submit", handleSearchSubmit);
document.addEventListener("click", handleSearchShortcut);

load();

async function load() {
  try {
    articles = await fetchArticles();
    renderRoute();
  } catch (error) {
    app.innerHTML = `<div class="empty">Unable to load help articles. ${escapeHtml(error.message)}</div>`;
  }
}

async function renderRoute() {
  const [route, slug] = parseHash();
  if (route === "article" && slug) {
    await renderArticle(slug);
    return;
  }
  document.body.classList.remove("article-active");
  document.title = "FeedOps Help";
  renderArticleList();
}

function renderArticleList() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query ? articles.filter((article) => {
    const haystack = [
      article.title,
      article.excerpt,
      article.category,
      article.content,
      ...(article.tags || [])
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }) : popularArticles();

  app.innerHTML = `
    <div class="section-heading">
      <div>
        <h2>${query ? `Search results for "${escapeHtml(searchInput.value.trim())}"` : "Popular connection docs"}</h2>
        ${query ? `<p>${filtered.length} article${filtered.length === 1 ? "" : "s"} found</p>` : ""}
      </div>
    </div>
    ${
      filtered.length
        ? `<div class="doc-grid">${filtered.map(renderDocLink).join("")}</div>`
        : '<div class="empty">No help articles match that search.</div>'
    }
  `;
}

async function renderArticle(slug) {
  try {
    const article = await fetchArticle(slug);
    document.body.classList.add("article-active");
    document.title = `${article.title} | FeedOps Help`;
    app.innerHTML = `
      <article class="article-page">
        <a class="back-link" href="#/">Back to articles</a>
        <p class="article-meta"><span>${escapeHtml(article.category)}</span><span>${formatDate(article.updatedAt)}</span></p>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.excerpt || "")}</p>
        <div class="article-body">${renderArticleContent(article)}</div>
      </article>
    `;
  } catch {
    app.innerHTML = '<div class="empty">Article not found.</div>';
  }
}

function renderDocLink(article) {
  return `
    <a class="doc-link" href="#/article/${encodeURIComponent(article.slug)}">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" />
        <path d="M14 3v5h5" />
      </svg>
      <span>${escapeHtml(article.title)}</span>
    </a>
  `;
}

function popularArticles() {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  const featured = popularSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  const remaining = articles.filter((article) => !popularSlugs.includes(article.slug));
  return [...featured, ...remaining].slice(0, 6);
}

function handleSearchSubmit(event) {
  event.preventDefault();
  if (window.location.hash.startsWith("#/article/")) {
    window.location.hash = "#/";
    return;
  }
  renderArticleList();
}

function handleSearchShortcut(event) {
  const link = event.target.closest("[data-search]");
  if (!link) return;
  event.preventDefault();
  searchInput.value = link.dataset.search || "";
  if (window.location.hash.startsWith("#/article/")) {
    window.location.hash = "#/";
    return;
  }
  renderArticleList();
  searchInput.focus();
}

async function fetchArticles() {
  const path = staticMode ? "./content/articles.json" : `${apiBase}/api/help/articles`;
  const response = await fetch(path);
  if (!response.ok) throw new Error("The article index is unavailable.");
  const data = await response.json();
  return Array.isArray(data) ? data : data.articles;
}

async function fetchArticle(slug) {
  const path = staticMode
    ? `./content/articles/${encodeURIComponent(slug)}.json`
    : `${apiBase}/api/help/articles/${encodeURIComponent(slug)}`;
  const response = await fetch(path);
  if (!response.ok) throw new Error("The article is unavailable.");
  const data = await response.json();
  return data.article || data;
}

function parseHash() {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return parts;
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listOpen = false;

  for (const line of lines) {
    if (!line.trim()) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      continue;
    }

    if (line.startsWith("### ")) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }

    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  if (listOpen) html.push("</ul>");
  return html.join("");
}

function renderArticleContent(article) {
  const content = article.content || "";
  if (article.contentFormat === "html" || looksLikeHtml(content)) {
    return sanitizeRichHtml(content);
  }
  return renderMarkdown(content);
}

function sanitizeRichHtml(html) {
  const allowedTags = new Set([
    "a",
    "blockquote",
    "br",
    "em",
    "figcaption",
    "figure",
    "h2",
    "h3",
    "h4",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "strong",
    "u",
    "ul"
  ]);
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  cleanNode(template.content);
  return template.innerHTML;

  function cleanNode(node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove();
        continue;
      }

      const tag = child.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const fragment = document.createDocumentFragment();
        while (child.firstChild) fragment.append(child.firstChild);
        child.replaceWith(fragment);
        cleanNode(node);
        return;
      }

      cleanAttributes(child, tag);
      cleanNode(child);
    }
  }

  function cleanAttributes(element, tag) {
    const href = element.getAttribute("href") || "";
    const src = element.getAttribute("src") || "";
    const alt = element.getAttribute("alt") || "";
    element.getAttributeNames().forEach((name) => element.removeAttribute(name));

    if (tag === "a" && isSafeLink(href)) {
      element.setAttribute("href", href);
      element.setAttribute("rel", "noreferrer");
      if (/^https?:\/\//i.test(href)) element.setAttribute("target", "_blank");
    }

    if (tag === "img" && isSafeImageSrc(src)) {
      element.setAttribute("src", src);
      element.setAttribute("alt", alt);
      return;
    }

    if (tag === "img") element.remove();
  }
}

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function isSafeLink(value) {
  return /^(https?:|mailto:|tel:|#|\/)/i.test(String(value || "").trim());
}

function isSafeImageSrc(value) {
  return /^(https?:\/\/|\/help\/uploads\/|\/uploads\/|\.\/uploads\/|data:image\/)/i.test(
    String(value || "").trim()
  );
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
