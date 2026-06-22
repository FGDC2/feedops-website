const keywords = [
  row("product feed optimisation", "/", "Commercial", "commercial", "high", "Decision", "Primary homepage target for the Australian spelling and core FeedOps positioning."),
  row("product feed optimization", "/", "Commercial", "commercial", "high", "Decision", "US spelling variant for the homepage and broader international searches."),
  row("product feed management", "/product-feed-management/", "Commercial", "commercial", "high", "Decision", "Main service-page keyword for ecommerce teams comparing feed support."),
  row("product feed management services", "/product-feed-management/", "Commercial", "commercial", "high", "Decision", "Service buyer variant for agency and outsourced execution intent."),
  row("ai product feed optimisation", "/", "Commercial", "commercial", "high", "Consideration", "Connect FeedOps AI positioning back to feed quality and revenue outcomes."),
  row("ecommerce product feed management", "/product-feed-management/", "Commercial", "commercial", "high", "Decision", "Ecommerce-specific service query for the product feed management page."),
  row("shopping feed agency", "/shopping-feed-agency/", "Commercial", "commercial", "high", "Decision", "Agency partner keyword for media teams and outsourced feed support."),
  row("feedops pricing", "/pricing/", "Commercial", "branded commercial", "medium", "Decision", "Branded pricing query for prospects already evaluating FeedOps."),

  row("google shopping feed optimization", "/guide/google-shopping-feed-optimization-guide/", "Guides", "commercial research", "high", "Consideration", "Core Google Shopping guide target."),
  row("google shopping feed optimisation", "/guide/google-shopping-feed-optimization-guide/", "Guides", "commercial research", "high", "Consideration", "Australian spelling variant for the core guide."),
  row("google shopping feed optimization guide", "/guide/google-shopping-feed-optimization-guide/", "Guides", "informational", "high", "Consideration", "Long-tail guide query for users looking for a full framework."),
  row("google shopping ads management", "/guide/google-shopping-ads-management/", "Guides", "commercial research", "high", "Consideration", "Guide target for Shopping and Performance Max management."),
  row("google shopping ads management guide", "/guide/google-shopping-ads-management/", "Guides", "informational", "medium", "Consideration", "Educational variant for people looking for a process guide."),
  row("google local inventory ads performance max", "/guide/google-local-inventory-ads-performance-max/", "Guides", "informational", "medium", "Consideration", "Local inventory and Performance Max topic target."),
  row("local inventory ads performance max", "/guide/google-local-inventory-ads-performance-max/", "Guides", "informational", "medium", "Consideration", "Shorter variant for the local inventory guide."),

  row("google shopping feed audit", "/free-google-shopping-feed-audit/", "Lead Generation", "lead generation", "high", "Decision", "Lead-capture keyword for the free audit page."),
  row("free google shopping feed audit", "/free-google-shopping-feed-audit/", "Lead Generation", "lead generation", "high", "Decision", "High-intent free-audit variant."),
  row("google shopping ads not showing", "/google-shopping-ads-not-showing/", "Troubleshooting", "troubleshooting", "high", "Support", "Troubleshooting keyword for zero-impression Shopping issues."),
  row("google merchant center errors", "/google-merchant-center-errors/", "Troubleshooting", "troubleshooting", "high", "Support", "Merchant Center error guide keyword."),
  row("merchant center errors", "/google-merchant-center-errors/", "Troubleshooting", "troubleshooting", "medium", "Support", "Shorter error-guide variant."),

  row("google shopping title optimization", "/google-shopping-product-title-optimization/", "Education", "informational", "high", "Consideration", "Product-title optimization guide target."),
  row("what is a google shopping feed", "/what-is-a-google-shopping-feed/", "Education", "informational", "medium", "Awareness", "Explainer keyword for users learning the feed basics."),
  row("google shopping graph", "/google-shopping-graph-explained/", "Education", "informational", "medium", "Awareness", "Explainer keyword for Shopping Graph and product data discovery."),
  row("feedonomics alternative", "/feedonomics-alternative-competitor/", "Comparison", "comparison", "high", "Decision", "Competitor-alternative keyword for comparison-stage prospects."),
  row("intelligent reach alternative", "/intelligent-reach-alternative/", "Comparison", "comparison", "high", "Decision", "Competitor-alternative keyword for comparison-stage prospects.")
];

const views = {
  all: { title: "24 Targeted Keywords", subtitle: "The FeedOps keyword targets mapped to the website pages built in the Codex workflow." }
};

const viewClusters = {};

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  title: document.getElementById("view-title"),
  subtitle: document.getElementById("view-subtitle"),
  search: document.getElementById("search-input"),
  tableBody: document.getElementById("table-body"),
  tableCount: document.getElementById("table-count"),
  exportButton: document.getElementById("export-button"),
  copyButton: document.getElementById("copy-button"),
  metricKeywords: document.getElementById("metric-keywords"),
  metricPages: document.getElementById("metric-pages"),
  metricHigh: document.getElementById("metric-high"),
  metricClusters: document.getElementById("metric-clusters")
};

let activeView = "all";

elements.navItems.forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    elements.navItems.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

[elements.search].forEach((control) => {
  control.addEventListener("input", render);
});

elements.exportButton.addEventListener("click", () => {
  const csv = toCsv(filteredKeywords());
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "feedops-target-keywords.csv";
  link.click();
  URL.revokeObjectURL(url);
});

elements.copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(toCsv(filteredKeywords()));
  elements.copyButton.textContent = "Copied";
  window.setTimeout(() => {
    elements.copyButton.textContent = "Copy CSV";
  }, 1200);
});

render();

function row(keyword, targetPage, cluster, intent, priority, funnel, action) {
  return { keyword, targetPage, cluster, intent, priority, funnel, action };
}

function filteredKeywords() {
  const query = elements.search.value.trim().toLowerCase();
  const allowedClusters = viewClusters[activeView];

  return keywords.filter((item) => {
    const matchesView = !allowedClusters || allowedClusters.includes(item.cluster);
    const searchable = Object.values(item).join(" ").toLowerCase();
    return matchesView && (!query || searchable.includes(query));
  });
}

function render() {
  const view = views[activeView];
  const rows = filteredKeywords();
  elements.title.textContent = view.title;
  elements.subtitle.textContent = view.subtitle;
  elements.tableCount.textContent = `Showing ${rows.length} keyword${rows.length === 1 ? "" : "s"}`;
  renderMetrics(rows);
  renderTable(rows);
}

function renderMetrics(rows) {
  elements.metricKeywords.textContent = rows.length;
  elements.metricPages.textContent = new Set(rows.map((item) => item.targetPage)).size;
  elements.metricHigh.textContent = rows.filter((item) => item.priority === "high").length;
  elements.metricClusters.textContent = new Set(rows.map((item) => item.cluster)).size;
}

function renderTable(rows) {
  elements.tableBody.innerHTML = "";

  rows.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(item.keyword)}</strong></td>
      <td><code>${escapeHtml(item.targetPage)}</code></td>
      <td class="rank-cell"></td>
      <td class="rank-cell"></td>
      <td class="rank-cell"></td>
      <td class="rank-cell"></td>
      <td class="rank-cell"></td>
    `;
    elements.tableBody.appendChild(tr);
  });

  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td class="empty" colspan="7">No keywords match the current filters.</td>';
    elements.tableBody.appendChild(tr);
  }
}

function toCsv(rows) {
  const headers = ["keyword", "target_page", "cluster", "intent", "priority", "funnel", "page_action"];
  const lines = rows.map((item) => [
    item.keyword,
    item.targetPage,
    item.cluster,
    item.intent,
    item.priority,
    item.funnel,
    item.action
  ].map(csvCell).join(","));
  return [headers.join(","), ...lines].join("\n");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
