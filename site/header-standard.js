(function () {
  var script = document.currentScript;
  var root = script && script.dataset ? script.dataset.siteRoot || "" : "";
  var expertDefaultEverywhere = !!(script && script.src && (script.src.indexOf("menu-default") !== -1 || script.src.indexOf("mode-nav") !== -1));
  window.feedopsInstallStandardHeader = installHeader;

  function href(path) {
    return root + path;
  }

  function currentMode() {
    var path = cleanPath(window.location.pathname);
    if (path === "/executive/") return "executive";
    if (path === "/agency/") return "agency";
    return "expert";
  }

  function navItems(mode) {
    var items = {
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
        ["Opportunity", "executive/#opportunity", "opportunity"],
        ["Accountability", "executive/#accountability", "accountability"],
        ["Responsibility", "executive/#responsibility", "responsibility"],
        ["Architecture", "executive/#architecture", "architecture"],
        ["Channels", "executive/#channels", "channels"],
        ["Pricing", "executive/#fit", "fit"]
      ],
      agency: [
        ["Model", "agency/#model", "model"],
        ["Issues", "agency/#feed-problems", "feed-problems"],
        ["Roles", "agency/#roles", "roles"],
        ["Process", "agency/#process", "process"],
        ["Partner", "agency/#partner-model", "partner-model"],
        ["FAQ", "agency/#agency-faq", "agency-faq"]
      ]
    };

    return items[mode || "expert"];
  }

  function standardNavLinks() {
    return navItems(currentMode()).map(function (item) {
      return '      <a data-feedops-section="' + item[2] + '" href="' + href(item[1]) + '">' + item[0] + '</a>';
    }).join("");
  }

  function standardHeader() {
    return [
      '<header id="feedops-standard-header" class="feedops-header">',
      '  <div class="feedops-mode-switch" aria-label="Choose FeedOps page mode">',
      '    <div class="feedops-mode-inner">',
      '      <div class="feedops-mode-label">Explore FeedOps as</div>',
      '      <div class="feedops-mode-controls">',
      '        <div class="feedops-mode-options">',
      '          <a class="feedops-mode-option" data-feedops-mode="expert" href="' + href("") + '">Performance expert</a>',
      '          <a class="feedops-mode-option" data-feedops-mode="executive" href="' + href("executive/") + '">Executive mode</a>',
      '          <a class="feedops-mode-option" data-feedops-mode="agency" href="' + href("agency/") + '">Media agency</a>',
      "        </div>",
      '        <a class="feedops-mode-login" href="https://app.feedops.com/feed_ops/sign_in" target="_blank" rel="noopener">Login</a>',
      "      </div>",
      "    </div>",
      "  </div>",
      '  <nav class="feedops-nav" aria-label="Main navigation">',
      '    <a class="feedops-logo" href="' + href("") + '" aria-label="FeedOps home">',
      '      <img src="' + href("_assets/feedops.com/wp-content/uploads/2022/12/Feedops-logo_Final-2-4.png") + '" alt="FeedOps">',
      "    </a>",
      '    <div class="feedops-nav-links" aria-label="Primary links">',
      standardNavLinks(),
      "    </div>",
      '    <div class="feedops-nav-actions">',
      '      <a class="feedops-nav-cta" href="' + href("book-live-demo/") + '">Book a feed strategy call</a>',
      "    </div>",
      "  </nav>",
      "</header>"
    ].join("");
  }

  function cleanPath(pathname) {
    return (pathname || "/").replace(/\/index\.html$/, "/").replace(/\/+$/, "/");
  }

  function setActiveStates() {
    var header = document.querySelector("#feedops-standard-header");
    if (!header) return;

    var path = cleanPath(window.location.pathname);
    var mode = currentMode();

    header.querySelectorAll("[data-feedops-mode]").forEach(function (link) {
      var isActive = link.dataset.feedopsMode === mode;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    var hash = (window.location.hash || "").replace("#", "");
    header.querySelectorAll("[data-feedops-section]").forEach(function (link) {
      var targetPath = cleanPath(link.pathname);
      var isActive = path === targetPath && hash && link.dataset.feedopsSection === hash;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    var cta = header.querySelector(".feedops-nav-cta");
    if (cta) {
      var isCtaActive = path === "/book-live-demo/";
      cta.classList.toggle("is-active", isCtaActive);
      if (isCtaActive) {
        cta.setAttribute("aria-current", "page");
      } else {
        cta.removeAttribute("aria-current");
      }
    }
  }

  function removeOldHeaders() {
    document.querySelectorAll([
      "#feedops-standard-header",
      "header.site-header",
      ".mode-switch[aria-label='Choose FeedOps page mode']"
    ].join(",")).forEach(function (node) {
      node.remove();
    });
  }

  function installHeader() {
    removeOldHeaders();
    document.body.insertAdjacentHTML("afterbegin", standardHeader());
    setActiveStates();
    window.feedopsStandardHeaderInstalled = true;
  }

  window.addEventListener("hashchange", setActiveStates);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installHeader);
  } else {
    installHeader();
  }
})();
