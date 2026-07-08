const app = document.querySelector("#app");
const quickLinks = document.querySelector("#quickLinks");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const staticMode = window.FEEDOPS_HELP_MODE === "static";
const apiBase = window.FEEDOPS_HELP_API_BASE || "";
const defaultHeadConfig = {
  gtmId: "GTM-KR4TR7B",
  title: "FeedOps Help Center",
  description: "Find FeedOps help articles for connecting stores, importing product data and troubleshooting feed issues."
};
const defaultHomeConfig = {
  head: { ...defaultHeadConfig },
  categories: [
    {
      title: "Connect your store",
      description: "Learn how to connect your eCommerce store and start importing your products.",
      search: "connect store",
      icon: "bag"
    },
    {
      title: "Feed ingestion",
      description: "Understand how product data is imported, processed and kept up to date.",
      search: "feed ingestion",
      icon: "download"
    },
    {
      title: "Troubleshoot connections",
      description: "Fix common connection issues and get your feeds back on track.",
      search: "troubleshoot connections",
      icon: "wrench"
    }
  ],
  popularHeading: "Popular connection docs",
  popularDocs: [
    "connect-shopify",
    "fix-google-merchant-center-permission-issues",
    "connect-google-merchant-center",
    "why-products-are-not-importing",
    "connect-meta",
    "why-a-feed-is-not-updating"
  ]
};

let articles = [];
let homeConfig = cloneDefaultHomeConfig();

window.addEventListener("hashchange", renderRoute);
searchInput.addEventListener("input", renderArticleList);
searchForm.addEventListener("submit", handleSearchSubmit);
document.addEventListener("click", handleSearchShortcut);

load();

async function load() {
  try {
    const [articleData, homeData] = await Promise.all([fetchArticles(), fetchHomeConfig()]);
    articles = articleData;
    homeConfig = homeData;
    applyHeadConfig();
    renderQuickLinks();
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
  document.title = homeConfig.head.title;
  setMetaDescription(homeConfig.head.description);
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
        <h2>${query ? `Search results for "${escapeHtml(searchInput.value.trim())}"` : escapeHtml(homeConfig.popularHeading)}</h2>
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
    document.title = `${article.title} | ${homeConfig.head.title}`;
    setMetaDescription(article.excerpt || homeConfig.head.description);
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

function renderQuickLinks() {
  quickLinks.innerHTML = homeConfig.categories.map(renderQuickLink).join("");
}

function renderQuickLink(category) {
  return `
    <a class="quick-link" href="#/" data-search="${escapeAttribute(category.search || category.title)}">
      <span class="quick-icon" aria-hidden="true">
        ${renderCategoryIcon(category.icon)}
      </span>
      <span class="quick-copy">
        <strong>${escapeHtml(category.title)}</strong>
        <span>${escapeHtml(category.description)}</span>
      </span>
      <svg class="quick-arrow" aria-hidden="true" viewBox="0 0 24 24">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </a>
  `;
}

function renderCategoryIcon(icon) {
  const icons = {
    bag: `<svg viewBox="0 0 24 24"><path d="M7 8V6a5 5 0 0 1 10 0v2" /><path d="M5 8h14l1 12H4L5 8Z" /></svg>`,
    document: `<svg viewBox="0 0 24 24"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" /><path d="M14 3v5h5" /></svg>`,
    download: `<svg viewBox="0 0 24 24"><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 16v4h14v-4" /></svg>`,
    feed: `<svg viewBox="0 0 24 24"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /><path d="M18 16l2 2 2-2" /><path d="M20 12v6" /></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" /><path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.9 2h-5.8L8.7 5a8 8 0 0 0-1.7 1l-2.5-1-2 3.4L4.6 10a7.8 7.8 0 0 0-.1 1 7.8 7.8 0 0 0 .1 1l-2.1 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1l.4 3h5.8l.4-3a8 8 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13Z" /></svg>`,
    wrench: `<svg viewBox="0 0 24 24"><path d="m14.7 6.3 3-3a5 5 0 0 1-6.2 6.2L4 17l-1 4 4-1 7.5-7.5a5 5 0 0 1 6.2-6.2l-3 3" /></svg>`
  };
  return icons[icon] || icons.document;
}

function popularArticles() {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  const popularSlugs = Array.isArray(homeConfig.popularDocs) ? homeConfig.popularDocs : [];
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

async function fetchHomeConfig() {
  const path = staticMode ? "./content/home.json" : `${apiBase}/api/help/home`;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("The Help Center homepage config is unavailable.");
    const data = await response.json();
    return normalizeHomeConfig(data.home || data);
  } catch {
    return cloneDefaultHomeConfig();
  }
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

function normalizeHomeConfig(config = {}) {
  const fallback = cloneDefaultHomeConfig();
  const categories = Array.isArray(config.categories)
    ? config.categories.map(normalizeHomeCategory).filter(Boolean)
    : fallback.categories;
  const popularDocs = Array.isArray(config.popularDocs)
    ? config.popularDocs.map((slug) => String(slug || "").trim()).filter(Boolean)
    : fallback.popularDocs;

  return {
    head: normalizeHeadConfig(config.head),
    categories: categories.length ? categories : fallback.categories,
    popularHeading: String(config.popularHeading || "").trim() || fallback.popularHeading,
    popularDocs: popularDocs.length ? popularDocs : fallback.popularDocs
  };
}

function normalizeHeadConfig(head = {}) {
  return {
    gtmId: normalizeGtmId(head.gtmId) || defaultHeadConfig.gtmId,
    title: String(head.title || "").trim() || defaultHeadConfig.title,
    description: String(head.description || "").trim() || defaultHeadConfig.description
  };
}

function normalizeGtmId(value) {
  const id = String(value || "").trim().toUpperCase();
  return /^GTM-[A-Z0-9]+$/.test(id) ? id : "";
}

function applyHeadConfig() {
  document.title = homeConfig.head.title;
  setMetaDescription(homeConfig.head.description);
}

function setMetaDescription(description) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.append(tag);
  }
  tag.setAttribute("content", description);
}

function normalizeHomeCategory(category) {
  const title = String(category?.title || "").trim();
  const description = String(category?.description || "").trim();
  if (!title || !description) return null;
  return {
    title,
    description,
    search: String(category?.search || title).trim(),
    icon: String(category?.icon || "document").trim()
  };
}

function cloneDefaultHomeConfig() {
  return JSON.parse(JSON.stringify(defaultHomeConfig));
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

function escapeAttribute(value) {
  return escapeHtml(value);
}
