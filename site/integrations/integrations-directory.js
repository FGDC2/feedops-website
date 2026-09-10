(function () {
  "use strict";

  // Public website snapshot of the Operations Integrations Directory, the canonical editorial source.
  var categories = [
    { key: "all", label: "All" },
    { key: "commerce", label: "Ecommerce Platforms" },
    { key: "custom", label: "Custom Integration" },
    { key: "media", label: "Media" },
    { key: "marketplace", label: "Marketplaces" },
    { key: "affiliate", label: "Affiliate" },
    { key: "local", label: "Local Inventory" },
    { key: "ai", label: "AI Discovery" },
    { key: "other", label: "Other" }
  ];

  var integrations = [
    { name: "Google", category: "media", type: "Media", url: "https://shopping.google.com/", domain: "google.com", keywords: "google shopping merchant center ads" },
    { name: "Microsoft", category: "media", type: "Media", url: "https://about.ads.microsoft.com/", domain: "microsoft.com", keywords: "bing advertising shopping" },
    { name: "Amazon", category: "marketplace", type: "Marketplace", url: "https://sell.amazon.com.au/", domain: "amazon.com.au", keywords: "amazon seller marketplace" },
    { name: "Meta", category: "media", type: "Media", url: "https://www.facebook.com/business/tools/commerce-manager", domain: "meta.com", keywords: "facebook instagram commerce manager" },
    { name: "NetSuite / SuiteCommerce", category: "commerce", type: "Ecommerce Platform", url: "https://www.netsuite.com/portal/products/ecommerce.shtml", domain: "netsuite.com", keywords: "oracle shopping cart ecommerce" },
    { name: "Salesforce Commerce Cloud", category: "commerce", type: "Ecommerce Platform", url: "https://www.salesforce.com/commerce/", domain: "salesforce.com", keywords: "sfcc demandware shopping cart ecommerce" },
    { name: "Emarsys", category: "other", type: "Email / CRM", url: "https://emarsys.com/", domain: "emarsys.com", keywords: "email crm marketing automation" },
    { name: "Shopify", category: "commerce", type: "Ecommerce Platform", url: "https://www.shopify.com/", domain: "shopify.com", keywords: "shopping cart ecommerce" },
    { name: "Magento 2 / Adobe Commerce", category: "commerce", type: "Ecommerce Platform", url: "https://business.adobe.com/products/commerce.html", domain: "adobe.com", keywords: "magento adobe shopping cart ecommerce" },
    { name: "Bunnings", category: "marketplace", type: "Marketplace", url: "https://www.bunnings.com.au/", domain: "bunnings.com.au", keywords: "bunnings marketplace" },
    { name: "Kmart", category: "marketplace", type: "Marketplace", url: "https://www.kmart.com.au/", domain: "kmart.com.au", keywords: "kmart australia marketplace" },
    { name: "eBay", category: "marketplace", type: "Marketplace", url: "https://www.ebay.com.au/", domain: "ebay.com.au", keywords: "ebay marketplace" },

    { name: "BigCommerce", category: "commerce", type: "Ecommerce Platform", url: "https://www.bigcommerce.com/", domain: "bigcommerce.com", keywords: "shopping cart ecommerce" },
    { name: "WooCommerce", category: "commerce", type: "Ecommerce Platform", url: "https://woocommerce.com/", domain: "woocommerce.com", keywords: "wordpress shopping cart ecommerce" },
    { name: "Neto / Maropost Commerce Cloud", category: "commerce", type: "Ecommerce Platform", url: "https://www.maropost.com/commerce/", domain: "maropost.com", keywords: "neto maropost shopping cart ecommerce" },
    { name: "nopCommerce", category: "commerce", type: "Ecommerce Platform", url: "https://www.nopcommerce.com/", domain: "nopcommerce.com", keywords: "shopping cart ecommerce" },
    { name: "OpenCart", category: "commerce", type: "Ecommerce Platform", url: "https://www.opencart.com/", domain: "opencart.com", keywords: "shopping cart ecommerce" },
    { name: "Wix", category: "commerce", type: "Ecommerce Platform", url: "https://www.wix.com/ecommerce/website", domain: "wix.com", keywords: "shopping cart ecommerce website" },

    { name: "Google Sheets", category: "custom", type: "Custom Integration", url: "https://workspace.google.com/products/sheets/", domain: "sheets.google.com", keywords: "spreadsheet custom data source" },
    { name: "CSV", category: "custom", type: "Custom Integration", mark: "CSV", keywords: "comma separated file upload data source" },
    { name: "TSV", category: "custom", type: "Custom Integration", mark: "TSV", keywords: "tab separated file upload data source" },
    { name: "XML", category: "custom", type: "Custom Integration", mark: "XML", keywords: "extensible markup file feed data source" },
    { name: "SFTP", category: "custom", type: "Custom Integration", mark: "SFTP", keywords: "secure file transfer upload data source" },
    { name: "REST APIs", category: "custom", type: "Custom Integration", mark: "API", keywords: "rest api custom interface data source" },
    { name: "GraphQL APIs", category: "custom", type: "Custom Integration", mark: "GQL", keywords: "graphql api custom interface data source" },
    { name: "API Push / Webhooks", category: "custom", type: "Custom Integration", mark: "PUSH", keywords: "api push webhook webhooks event driven real time updates" },
    { name: "Existing Feed URLs", category: "custom", type: "Custom Integration", mark: "URL", keywords: "hosted feed url file custom data source" },

    { name: "Pinterest", category: "media", type: "Media", url: "https://www.pinterest.com/business/", domain: "pinterest.com", keywords: "pinterest advertising social shopping" },
    { name: "TikTok", category: "media", type: "Media", url: "https://www.tiktok.com/business/", domain: "tiktok.com", keywords: "tiktok advertising social shopping" },
    { name: "Criteo", category: "media", type: "Media", url: "https://www.criteo.com/", domain: "criteo.com", keywords: "criteo advertising media retargeting" },
    { name: "Reddit", category: "media", type: "Media", url: "https://www.redditforbusiness.com/", domain: "reddit.com", keywords: "reddit advertising social" },

    { name: "Lasoo", category: "marketplace", type: "Marketplace", url: "https://www.lasoo.com.au/", page: "/lasoo/", domain: "lasoo.com.au", keywords: "lasoo marketplace" },
    { name: "MyDeal", category: "marketplace", type: "Marketplace", url: "https://www.mydeal.com.au/", domain: "mydeal.com.au", keywords: "my deal marketplace" },
    { name: "Decathlon", category: "marketplace", type: "Marketplace", url: "https://www.decathlon.com/", domain: "decathlon.com", keywords: "decathlon marketplace" },
    { name: "Idealo", category: "marketplace", type: "Marketplace", url: "https://www.idealo.co.uk/", domain: "idealo.co.uk", keywords: "idealo marketplace comparison shopping" },
    { name: "JB Hi-Fi", category: "marketplace", type: "Marketplace", url: "https://www.jbhifi.com.au/", domain: "jbhifi.com.au", keywords: "jb hi fi marketplace" },
    { name: "Kogan", category: "marketplace", type: "Marketplace", url: "https://www.kogan.com/au/", domain: "kogan.com", keywords: "kogan marketplace" },
    { name: "Myer", category: "marketplace", type: "Marketplace", url: "https://www.myer.com.au/", domain: "myer.com.au", keywords: "myer marketplace" },
    { name: "MySale", category: "marketplace", type: "Marketplace", url: "https://www.mysale.com.au/", domain: "mysale.com.au", keywords: "my sale marketplace" },
    { name: "Reebelo", category: "marketplace", type: "Marketplace", url: "https://reebelo.com.au/", domain: "reebelo.com.au", keywords: "reebelo marketplace" },

    { name: "Commission Factory", category: "affiliate", type: "Affiliate", url: "https://commissionfactory.com/", domain: "commissionfactory.com", keywords: "commission factory affiliate network" },
    { name: "CJ Affiliate", category: "affiliate", type: "Affiliate", url: "https://www.cj.com/", domain: "cj.com", keywords: "commission junction affiliate network" },
    { name: "Rakuten", category: "affiliate", type: "Affiliate", url: "https://rakutenadvertising.com/", domain: "rakutenadvertising.com", keywords: "rakuten advertising affiliate network" },
    { name: "Impact", category: "affiliate", type: "Affiliate", url: "https://impact.com/", domain: "impact.com", keywords: "impact affiliate partnership network" },

    { name: "Google Local / LIA", category: "local", type: "Local Inventory", url: "https://support.google.com/merchants/answer/14615117", domain: "google.com", keywords: "google local inventory ads lia merchant center" },
    { name: "Microsoft Local Inventory Ads", category: "local", type: "Local Inventory", url: "https://about.ads.microsoft.com/en/solutions/ad-products-formats/retail/shopping-campaigns-v2", domain: "microsoft.com", keywords: "microsoft bing local inventory ads lia" },

    { name: "ChatGPT", category: "ai", type: "AI Discovery", url: "https://chatgpt.com/", domain: "chatgpt.com", keywords: "openai chatgpt shopping ai discovery" },
    { name: "Google AI Mode", category: "ai", type: "AI Discovery", url: "https://support.google.com/websearch/answer/16011537", domain: "google.com", keywords: "google ai mode overlay discovery shopping" },

    { name: "Bazaarvoice", category: "other", type: "Reviews / UGC", url: "https://www.bazaarvoice.com/", domain: "bazaarvoice.com", keywords: "reviews ugc user generated content" },
    { name: "Style Sourcebook", category: "other", type: "Product Sourcing", url: "https://stylesourcebook.com.au/", domain: "stylesourcebook.com.au", keywords: "product sourcing style sourcebook" },
    { name: "Confect", category: "other", type: "Other", url: "https://confect.io/", domain: "confect.io", keywords: "creative automation social ads other" }
  ];

  var filters = document.getElementById("integrations-filters");
  var grid = document.getElementById("integrations-grid");
  var search = document.getElementById("integrations-search-input");
  var showMore = document.getElementById("integrations-show-more");
  var selectorLinks = Array.prototype.slice.call(document.querySelectorAll("[data-directory-filter]"));
  if (!filters || !grid || !search || !showMore) return;

  var state = { category: "all", expanded: false, query: "" };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character];
    });
  }

  function categoryCount(key) {
    return key === "all" ? integrations.length : integrations.filter(function (item) { return item.category === key; }).length;
  }

  function logoMarkup(item) {
    if (!item.domain) return '<span class="integration-card-mark" aria-hidden="true">' + escapeHtml(item.mark || item.name.slice(0, 3)) + "</span>";
    var iconUrl = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(item.domain) + "&sz=64";
    return '<img class="integration-card-logo" src="' + iconUrl + '" alt="" width="34" height="34" loading="lazy">';
  }

  function cardMarkup(item) {
    var body = logoMarkup(item) + '<div class="integration-card-copy"><h3>' + escapeHtml(item.name) + '</h3><span class="integration-card-category ' + escapeHtml(item.category) + '">' + escapeHtml(item.type) + "</span></div>";
    if (item.page) return '<a class="integration-card is-linked" href="' + escapeHtml(item.page) + '" data-category="' + escapeHtml(item.category) + '">' + body + '<span class="integration-card-chevron" aria-hidden="true">›</span></a>';
    return '<article class="integration-card" data-category="' + escapeHtml(item.category) + '">' + body + "</article>";
  }

  function renderFilters() {
    filters.innerHTML = categories.map(function (category) {
      var selected = state.category === category.key;
      return '<button class="integrations-filter" type="button" data-filter="' + category.key + '" aria-pressed="' + selected + '" aria-controls="integrations-grid">' + escapeHtml(category.label) + " <strong>" + categoryCount(category.key) + "</strong></button>";
    }).join("");
  }

  function renderCards() {
    var query = state.query.trim().toLowerCase();
    var matches = integrations.filter(function (item) {
      if (state.category !== "all" && item.category !== state.category) return false;
      if (!query) return true;
      var category = categories.find(function (candidate) { return candidate.key === item.category; });
      var searchable = [item.name, item.type, item.keywords, category ? category.label : ""].join(" ").toLowerCase();
      return searchable.indexOf(query) !== -1;
    });
    var limit = 8;
    var visible = query || state.expanded ? matches : matches.slice(0, limit);

    grid.innerHTML = visible.length ? visible.map(cardMarkup).join("") : '<p class="integrations-empty">No connections match your search.</p>';
    showMore.hidden = Boolean(query) || matches.length <= limit;
    showMore.textContent = state.expanded ? "Show fewer connections" : "Show more connections";
  }

  filters.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-filter]");
    if (!button) return;
    state.category = button.getAttribute("data-filter");
    state.expanded = false;
    renderFilters();
    renderCards();
  });

  search.addEventListener("input", function () {
    state.query = search.value;
    state.expanded = false;
    renderCards();
  });

  showMore.addEventListener("click", function () {
    state.expanded = !state.expanded;
    renderCards();
  });

  selectorLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      state.category = link.getAttribute("data-directory-filter") || "all";
      state.expanded = false;
      state.query = "";
      search.value = "";
      renderFilters();
      renderCards();
    });
  });

  renderFilters();
  renderCards();
})();
