const app = document.querySelector("#app");
const quickLinks = document.querySelector("#quickLinks");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const staticMode = window.FEEDOPS_HELP_MODE === "static";
const apiBase = window.FEEDOPS_HELP_API_BASE || "";
const helpBasePath = getHelpBasePath();
const defaultHeadConfig = {
  gtmId: "GTM-KR4TR7B",
  title: "FeedOps Help Center",
  description: "Find FeedOps help articles for connecting stores, importing product data and troubleshooting feed issues.",
  robots: "noindex, nofollow"
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
const shopifyArticleOverride = {
  title: "Connect Shopify with a custom app",
  excerpt: "Use this guide to connect your Shopify store to FeedOps.",
  contentFormat: "html",
  content: `
    <blockquote><p>Shopify previously called this a private app. Shopify now uses the term custom app for store-specific integrations.</p></blockquote>
    <h2>Before you start</h2>
    <ul>
      <li>Confirm you can log in to Shopify as the store owner or as a staff member with permission to manage apps.</li>
      <li>Keep FeedOps open in another tab so you can return to the connection screen.</li>
      <li>Choose a time when a store admin is available, because Shopify may ask you to approve the app installation.</li>
    </ul>
    <h2>What this connection does</h2>
    <ul>
      <li>Allows FeedOps to read the product data needed to import and maintain your product feed.</li>
      <li>Helps FeedOps keep product, variant, inventory, collection, and availability data up to date.</li>
      <li>Lets FeedOps check whether products are available for feed processing.</li>
    </ul>
    <h2>What FeedOps does not need</h2>
    <ul>
      <li>FeedOps does not need your Shopify password.</li>
      <li>FeedOps does not need payment, theme, or customer write permissions.</li>
      <li>FeedOps does not need permission to change orders or checkout settings.</li>
    </ul>
    <h2>Step 1: Log in to Shopify</h2>
    <ol>
      <li>Go to your Shopify admin.</li>
      <li>Sign in to the store you want to connect to FeedOps.</li>
    </ol>
    <h2>Step 2: Open Shopify settings</h2>
    <ol>
      <li>In Shopify, go to the bottom-left corner of the admin screen.</li>
      <li>Select Settings.</li>
    </ol>
    <h2>Step 3: Open Apps and sales channels</h2>
    <ol>
      <li>In Settings, choose Apps and sales channels.</li>
      <li>Confirm you are managing the correct Shopify store.</li>
    </ol>
    <h2>Step 4: Open the Dev Dashboard</h2>
    <ol>
      <li>Open the Shopify Dev Dashboard or app development area.</li>
      <li>If app development is disabled, ask the store owner to enable it.</li>
    </ol>
    <h2>Step 5: Create the custom app</h2>
    <ol>
      <li>Create a new custom app for FeedOps.</li>
      <li>Name the app FeedOps so it is easy to recognise later.</li>
    </ol>
    <h2>Step 6: Create an app version</h2>
    <ol>
      <li>Create the first app version for the custom app.</li>
      <li>Use the version to review and confirm the permissions before installing the app.</li>
    </ol>
    <h2>Step 7: Add the required permissions</h2>
    <ol>
      <li>Add only the permissions requested by FeedOps.</li>
      <li>These are usually read permissions for products, variants, collections, inventory, and locations.</li>
      <li>Do not add write permissions unless FeedOps specifically asks for them.</li>
    </ol>
    <h2>Step 8: Install the app</h2>
    <ol>
      <li>Review the permissions.</li>
      <li>Install the custom app in Shopify.</li>
      <li>Copy the access token shown by Shopify and keep it secure.</li>
    </ol>
    <h2>Step 9: Return to FeedOps</h2>
    <ol>
      <li>Go back to FeedOps.</li>
      <li>Paste the Shopify store URL and access token into the Shopify connection screen.</li>
      <li>Save the connection.</li>
    </ol>
    <h2>Step 10: Confirm products are importing</h2>
    <ol>
      <li>Start the first import or wait for FeedOps to begin processing.</li>
      <li>Check that products, variants, prices, inventory, and availability appear as expected.</li>
    </ol>
    <h2>Troubleshooting</h2>
    <ul>
      <li>If Shopify rejects the token, confirm the token was copied from the correct custom app.</li>
      <li>If products do not import, review the app permissions and confirm products are active in Shopify.</li>
      <li>If the app development area is unavailable, ask the Shopify store owner to enable custom app development.</li>
    </ul>
    <h2>Security notes</h2>
    <ul>
      <li>Treat the Shopify access token like a password.</li>
      <li>Only share the token through the secure FeedOps connection screen.</li>
      <li>You can uninstall or revoke the custom app in Shopify if access ever needs to be removed.</li>
    </ul>
    <h2>Need help?</h2>
    <p>If you are unsure which permissions to select, contact FeedOps support and we can help you check the setup.</p>
  `
};

let articles = [];
let homeConfig = cloneDefaultHomeConfig();
let activeSearchAliases = [];

window.addEventListener("popstate", renderRoute);
window.addEventListener("hashchange", handleLegacyHashRoute);
searchInput.addEventListener("input", handleSearchInput);
searchForm.addEventListener("submit", handleSearchSubmit);
document.addEventListener("click", handleSearchShortcut);
document.addEventListener("click", handleArticleAnchorClick);
document.addEventListener("click", handleArticleMenuToggle);
document.addEventListener("click", handleInternalNavigation);

load();

async function load() {
  try {
    const [articleData, homeData] = await Promise.all([fetchArticles(), fetchHomeConfig()]);
    articles = articleData.map(applyArticleDisplayOverrides);
    homeConfig = homeData;
    applyHeadConfig();
    renderQuickLinks();
    if (!redirectLegacyHashRoute()) renderRoute();
  } catch (error) {
    app.innerHTML = `<div class="empty">Unable to load help articles. ${escapeHtml(error.message)}</div>`;
  }
}

async function renderRoute() {
  const articleSlug = currentArticleSlug();
  if (articleSlug) {
    redirectLegacyArticlePath(articleSlug);
    await renderArticle(articleSlug);
    return;
  }
  document.body.classList.remove("article-active");
  document.title = homeConfig.head.title;
  setMetaDescription(homeConfig.head.description);
  setMetaRobots(homeConfig.head.robots);
  renderArticleList();
}

function renderArticleList() {
  const query = searchInput.value.trim();
  const searchTerms = searchQueriesFor(query);
  const filtered = searchTerms.length
    ? articles.filter((article) => searchTerms.some((term) => articleMatchesSearch(article, term)))
    : popularArticles();

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
    const article = applyArticleDisplayOverrides(await fetchArticle(slug));
    const preparedArticle = prepareArticleBody(article);
    document.body.classList.add("article-active");
    document.title = `${article.title} | ${homeConfig.head.title}`;
    setMetaDescription(article.excerpt || homeConfig.head.description);
    setMetaRobots(homeConfig.head.robots);
    app.innerHTML = `
      ${renderArticleHero(article, preparedArticle)}
      <div class="article-layout">
        ${renderArticleSidebar(article)}
        <article class="article-page">
          <div class="article-body">${preparedArticle.html}</div>
          ${renderRelatedDoc(article)}
        </article>
        ${renderArticleToc(preparedArticle.toc)}
      </div>
    `;
    recordArticleView(article.slug);
  } catch {
    app.innerHTML = '<div class="empty">Article not found.</div>';
  }
}

function renderArticleHero(article, preparedArticle) {
  const category = article.category || "Help articles";
  return `
    <section class="article-hero" aria-labelledby="articleHeroTitle">
      <div class="article-hero-inner">
        <nav class="article-breadcrumbs" aria-label="Article breadcrumb">
          <a href="${homePath()}">Help Center</a>
          <span aria-hidden="true">/</span>
          <a href="${homePath()}" data-search="${escapeAttribute(category)}">${escapeHtml(category)}</a>
          <span aria-hidden="true">/</span>
          <span>${escapeHtml(article.title)}</span>
        </nav>
        <h1 id="articleHeroTitle">${escapeHtml(article.title)}</h1>
        <p>${escapeHtml(article.excerpt || "")}</p>
        <div class="article-hero-meta" aria-label="Article details">
          <span>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            ${estimateReadTime(preparedArticle.text)} min read
          </span>
          <span class="article-meta-divider" aria-hidden="true"></span>
          <span>${formatUpdatedLabel(article.updatedAt)}</span>
        </div>
      </div>
    </section>
  `;
}

function renderArticleSidebar(activeArticle) {
  const categoryGroups = articleCategoryGroups(activeArticle);
  return `
    <aside class="article-sidebar" aria-label="Help Center categories">
      <button class="article-menu-toggle" type="button" aria-expanded="false" aria-controls="articleMenuContent">
        <span class="hamburger-icon" aria-hidden="true"><span></span><span></span><span></span></span>
        <span>Menu</span>
      </button>
      <div id="articleMenuContent" class="article-menu-content">
        <nav class="help-category-tree">
          <p class="tree-heading">In this section</p>
          <a class="tree-link" href="${homePath()}">All articles</a>
          ${categoryGroups.map((group) => `
            <div class="tree-group">
              <p class="tree-category">${escapeHtml(group.category)}</p>
              <ul>
                ${group.articles.map((article) => `
                  <li>
                    <a class="${article.slug === activeArticle.slug ? "active" : ""}" href="${articlePath(article.slug)}">${escapeHtml(article.title)}</a>
                  </li>
                `).join("")}
              </ul>
            </div>
          `).join("")}
        </nav>
      </div>
    </aside>
  `;
}

function articleCategoryGroups(activeArticle) {
  const list = articles.some((article) => article.slug === activeArticle.slug)
    ? articles
    : [...articles, activeArticle];
  const groups = [];
  const byCategory = new Map();

  for (const article of list) {
    const category = String(article.category || "General").trim() || "General";
    if (!byCategory.has(category)) {
      const group = { category, articles: [] };
      byCategory.set(category, group);
      groups.push(group);
    }
    byCategory.get(category).articles.push(article);
  }

  return groups;
}

function renderArticleToc(items) {
  return `
    <aside class="article-toc" aria-label="On this page">
      <h2>On this page</h2>
      <nav>
        ${items.map((item) => `<a href="#${escapeAttribute(item.id)}" data-article-anchor="${escapeAttribute(item.id)}">${escapeHtml(item.label)}</a>`).join("")}
      </nav>
    </aside>
  `;
}

function renderDocLink(article) {
  return `
    <a class="doc-link" href="${articlePath(article.slug)}">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" />
        <path d="M14 3v5h5" />
      </svg>
      <span>${escapeHtml(article.title)}</span>
    </a>
  `;
}

function renderRelatedDoc(article) {
  const slug = String(article?.relatedDocSlug || "").trim();
  if (!slug || slug === article.slug) return "";
  const related = articles.find((candidate) => candidate.slug === slug);
  if (!related) return "";
  const displayArticle = applyArticleDisplayOverrides(related);
  return `
    <aside class="related-doc" aria-labelledby="relatedDocTitle">
      <p>Related doc</p>
      <a id="relatedDocTitle" href="${articlePath(displayArticle.slug)}">${escapeHtml(displayArticle.title)}</a>
      ${displayArticle.excerpt ? `<span>${escapeHtml(displayArticle.excerpt)}</span>` : ""}
    </aside>
  `;
}

function renderQuickLinks() {
  quickLinks.innerHTML = homeConfig.categories.map(renderQuickLink).join("");
}

function renderQuickLink(category) {
  return `
    <a class="quick-link" href="${homePath()}" data-search="${escapeAttribute(category.title || category.search)}" data-search-aliases="${escapeAttribute(searchAliasesForCategory(category).join("|"))}">
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

function handleSearchInput() {
  activeSearchAliases = [];
  renderArticleList();
}

function articleMatchesSearch(article, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystackText = normalizeSearchText([
    article.title,
    article.excerpt,
    article.category,
    article.content,
    ...(article.tags || [])
  ].join(" "));

  if (haystackText.includes(normalizedQuery)) return true;

  const haystackTokens = new Set(tokenizeSearchText(haystackText));
  const queryTokens = tokenizeSearchText(normalizedQuery);
  if (!queryTokens.length) return true;

  return queryTokens.every((queryToken) => tokenMatchesSearch(haystackTokens, queryToken));
}

function searchQueriesFor(query) {
  if (!String(query || "").trim()) return [];
  const terms = [query, ...activeSearchAliases]
    .map((term) => String(term || "").trim())
    .filter(Boolean);
  return [...new Set(terms)];
}

function searchAliasesForCategory(category) {
  const title = String(category?.title || "").trim();
  const search = String(category?.search || "").trim();
  if (!search || normalizeSearchText(search) === normalizeSearchText(title)) return [];
  return [search];
}

function normalizeSearchText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenizeSearchText(value) {
  return normalizeSearchText(value)
    .split(" ")
    .map(normalizeSearchToken)
    .filter(Boolean);
}

function normalizeSearchToken(token) {
  const value = String(token || "").trim();
  if (value.length <= 3) return value;
  return value
    .replace(/ies$/, "y")
    .replace(/sses$/, "ss")
    .replace(/(?:ing|ed|es|s)$/, "");
}

function tokenMatchesSearch(haystackTokens, queryToken) {
  for (const token of haystackTokens) {
    if (
      token === queryToken ||
      token.startsWith(queryToken) ||
      queryToken.startsWith(token)
    ) {
      return true;
    }
  }
  return false;
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
  if (isArticleRoute()) {
    navigateTo(homePath());
    return;
  }
  renderArticleList();
}

function handleSearchShortcut(event) {
  const link = event.target.closest("[data-search]");
  if (!link) return;
  event.preventDefault();
  searchInput.value = link.dataset.search || "";
  activeSearchAliases = String(link.dataset.searchAliases || "")
    .split("|")
    .map((term) => term.trim())
    .filter(Boolean);
  if (isArticleRoute()) {
    navigateTo(homePath());
    return;
  }
  renderArticleList();
  searchInput.focus();
}

function handleArticleAnchorClick(event) {
  const link = event.target.closest("[data-article-anchor]");
  if (!link) return;
  const section = document.getElementById(link.dataset.articleAnchor);
  if (!section) return;
  event.preventDefault();
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleArticleMenuToggle(event) {
  const toggle = event.target.closest(".article-menu-toggle");
  if (toggle) {
    const sidebar = toggle.closest(".article-sidebar");
    const isOpen = sidebar?.classList.toggle("open") || false;
    toggle.setAttribute("aria-expanded", String(isOpen));
    return;
  }

  const articleMenuLink = event.target.closest(".article-sidebar .article-menu-content a");
  if (!articleMenuLink) return;
  const sidebar = articleMenuLink.closest(".article-sidebar");
  const sidebarToggle = sidebar?.querySelector(".article-menu-toggle");
  sidebar?.classList.remove("open");
  sidebarToggle?.setAttribute("aria-expanded", "false");
}

function handleInternalNavigation(event) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest("a[href]");
  if (!link || link.target || link.hasAttribute("download")) return;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (!url.pathname.startsWith(helpBasePath)) return;
  if (url.hash && url.pathname === window.location.pathname && !url.hash.startsWith("#/")) return;

  event.preventDefault();
  navigateTo(`${url.pathname}${url.search}`);
}

async function fetchArticles() {
  const path = staticMode ? `${helpBasePath}content/articles.json` : `${apiBase}/api/help/articles`;
  const response = await fetch(path);
  if (!response.ok) throw new Error("The article index is unavailable.");
  const data = await response.json();
  return Array.isArray(data) ? data : data.articles;
}

async function fetchHomeConfig() {
  const path = staticMode ? `${helpBasePath}content/home.json` : `${apiBase}/api/help/home`;
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
    ? `${helpBasePath}content/articles/${encodeURIComponent(slug)}.json`
    : `${apiBase}/api/help/articles/${encodeURIComponent(slug)}`;
  const response = await fetch(path);
  if (!response.ok) throw new Error("The article is unavailable.");
  const data = await response.json();
  return data.article || data;
}

function recordArticleView(slug) {
  if (!slug || staticMode) return;
  const path = `${apiBase}/api/help/articles/${encodeURIComponent(slug)}/view`;
  fetch(path, { method: "POST", keepalive: true }).catch(() => {});
}

function applyArticleDisplayOverrides(article) {
  if (article?.slug !== "connect-shopify" || !usesDefaultShopifyArticle(article)) return article;
  return { ...article, ...shopifyArticleOverride };
}

function usesDefaultShopifyArticle(article) {
  const title = String(article?.title || "").trim();
  const content = String(article?.content || "");
  const hasUpdatedExample = title === shopifyArticleOverride.title
    && content.includes("Step 10: Confirm products are importing");
  if (hasUpdatedExample) return false;
  return title === "Connect Shopify."
    || title === "Connect Shopify"
    || content.includes("Use this checklist when connecting Shopify to FeedOps.");
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
    description: String(head.description || "").trim() || defaultHeadConfig.description,
    robots: String(head.robots || "").trim() || defaultHeadConfig.robots
  };
}

function normalizeGtmId(value) {
  const id = String(value || "").trim().toUpperCase();
  return /^GTM-[A-Z0-9]+$/.test(id) ? id : "";
}

function applyHeadConfig() {
  document.title = homeConfig.head.title;
  setMetaDescription(homeConfig.head.description);
  setMetaRobots(homeConfig.head.robots);
}

function setMetaDescription(description) {
  setMetaTag("description", description);
}

function setMetaRobots(robots) {
  setMetaTag("robots", robots || defaultHeadConfig.robots);
}

function setMetaTag(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.append(tag);
  }
  tag.setAttribute("content", content);
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

function handleLegacyHashRoute() {
  redirectLegacyHashRoute();
}

function redirectLegacyHashRoute() {
  if (!window.location.hash.startsWith("#/")) return false;
  const [route, slug] = parseHashRoute();
  const nextPath = route === "article" && slug
    ? articlePath(slug)
    : homePath();
  window.history.replaceState({}, "", `${nextPath}${window.location.search}`);
  renderRoute();
  return true;
}

function redirectLegacyArticlePath(slug) {
  const [route] = parseRoute();
  if (route !== "article") return false;
  const nextPath = `${articlePath(slug)}${window.location.search}`;
  if (`${window.location.pathname}${window.location.search}` !== nextPath) {
    window.history.replaceState({}, "", nextPath);
  }
  return true;
}

function parseRoute() {
  const path = window.location.pathname;
  const relative = path.startsWith(helpBasePath)
    ? path.slice(helpBasePath.length)
    : path.replace(/^\/+/, "");
  return relative
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
}

function parseHashRoute() {
  return window.location.hash
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
}

function isArticleRoute() {
  return Boolean(currentArticleSlug());
}

function navigateTo(path) {
  if (`${window.location.pathname}${window.location.search}` !== path) {
    window.history.pushState({}, "", path);
  }
  renderRoute();
  window.scrollTo({ top: 0 });
}

function homePath() {
  return helpBasePath;
}

function articlePath(slug) {
  return `${helpBasePath}${encodeURIComponent(slug)}`;
}

function currentArticleSlug() {
  const [route, slug] = parseRoute();
  if (route === "article") return slug || "";
  if (["assets", "content", "uploads"].includes(route)) return "";
  return route || "";
}

function getHelpBasePath() {
  const match = window.location.pathname.match(/^(.*?\/help)(?:\/|$)/);
  return match ? `${match[1]}/` : "/";
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

function prepareArticleBody(article) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = renderArticleContent(article);
  const usedIds = new Set();
  const toc = [];
  wrapper.querySelectorAll("h2").forEach((heading) => {
    const label = heading.textContent.trim();
    if (!label) return;
    const id = articleAnchorId(label, usedIds);
    heading.id = id;
    toc.push({ id, label });
  });
  return { html: wrapper.innerHTML, text: wrapper.textContent || "", toc };
}

function articleAnchorId(value, usedIds) {
  const base = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
  let id = base;
  let counter = 2;
  while (usedIds.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  usedIds.add(id);
  return id;
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
    const calloutType = normalizeCalloutType(element.getAttribute("data-callout"));
    element.getAttributeNames().forEach((name) => element.removeAttribute(name));

    if (tag === "blockquote" && calloutType) {
      element.setAttribute("data-callout", calloutType);
    }

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

function normalizeCalloutType(value) {
  const type = String(value || "").trim().toLowerCase();
  return ["info", "warning"].includes(type) ? type : "";
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

function formatUpdatedLabel(value) {
  if (!value) return "";
  const updated = new Date(value);
  if (Number.isNaN(updated.getTime())) return "";
  return formatDate(value);
}

function estimateReadTime(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
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
