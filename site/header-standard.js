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
    if (path === "/product-feed-management/") return "executive";
    if (path === "/shopping-feed-agency/") return "agency";
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

    return items[mode || "expert"];
  }

  function standardNavLinks() {
    return navItems(currentMode()).map(function (item) {
      return '      <a data-feedops-section="' + item[2] + '" href="' + href(item[1]) + '">' + item[0] + '</a>';
    }).join("");
  }

  function mobileNavLinks() {
    return navItems(currentMode()).map(function (item) {
      return '      <a data-feedops-section="' + item[2] + '" href="' + href(item[1]) + '">' + item[0] + '</a>';
    }).join("");
  }

  function standardHeader() {
    return [
      '<header id="feedops-standard-header" class="feedops-header">',
      '  <div class="feedops-mode-switch" aria-label="Explore FeedOps as">',
      '    <div class="feedops-mode-inner">',
      '      <div class="feedops-mode-label">Explore FeedOps as</div>',
      '      <div class="feedops-mode-controls">',
      '        <div class="feedops-mode-options">',
      '          <a class="feedops-mode-option" data-feedops-mode="expert" href="' + href("") + '">Performance expert</a>',
      '          <a class="feedops-mode-option" data-feedops-mode="executive" href="' + href("product-feed-management/") + '">Executive mode</a>',
      '          <a class="feedops-mode-option" data-feedops-mode="agency" href="' + href("shopping-feed-agency/") + '">Media agency</a>',
      "        </div>",
      '        <a class="feedops-mode-link" href="' + href("contact_us/") + '">Contact</a>',
      '        <a class="feedops-mode-login" href="https://app.feedops.com/feed_ops/sign_in" target="_blank" rel="noopener">Login</a>',
      "      </div>",
      "    </div>",
      "  </div>",
      '  <nav class="feedops-nav" aria-label="Main navigation">',
      '    <a class="feedops-logo" href="' + href("") + '" aria-label="FeedOps home">',
      '      <img src="' + href("assets/feedops.com/wp-content/uploads/2022/12/Feedops-logo-Final-2-4-300x110.png") + '" alt="FeedOps" width="300" height="110">',
      "    </a>",
      '    <button class="feedops-menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="feedops-mobile-menu">',
      '      <span class="feedops-menu-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>',
      "    </button>",
      '    <div class="feedops-nav-links" aria-label="Primary links">',
      standardNavLinks(),
      "    </div>",
      '    <div class="feedops-nav-actions">',
      '      <a class="feedops-nav-cta" href="' + href("book-live-demo/") + '">Book a demo</a>',
      "    </div>",
      "  </nav>",
      '  <div class="feedops-mobile-menu" id="feedops-mobile-menu" hidden>',
      '    <div class="feedops-mobile-panel">',
      '      <div class="feedops-mobile-label">Explore FeedOps as</div>',
      '      <div class="feedops-mobile-modes">',
      '        <a class="feedops-mode-option" data-feedops-mode="expert" href="' + href("") + '">Performance expert</a>',
      '        <a class="feedops-mode-option" data-feedops-mode="executive" href="' + href("product-feed-management/") + '">Executive mode</a>',
      '        <a class="feedops-mode-option" data-feedops-mode="agency" href="' + href("shopping-feed-agency/") + '">Media agency</a>',
      "      </div>",
      '      <div class="feedops-mobile-links" aria-label="Mobile primary links">',
      mobileNavLinks(),
      "      </div>",
      '      <div class="feedops-mobile-utility">',
      '        <a href="' + href("contact_us/") + '">Contact</a>',
      '        <a href="https://app.feedops.com/feed_ops/sign_in" target="_blank" rel="noopener">Login</a>',
      "      </div>",
      '      <a class="feedops-mobile-cta" href="' + href("book-live-demo/") + '">Book a demo</a>',
      "    </div>",
      "  </div>",
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

    var mobileCta = header.querySelector(".feedops-mobile-cta");
    if (mobileCta) {
      var isMobileCtaActive = path === "/book-live-demo/";
      mobileCta.classList.toggle("is-active", isMobileCtaActive);
      if (isMobileCtaActive) {
        mobileCta.setAttribute("aria-current", "page");
      } else {
        mobileCta.removeAttribute("aria-current");
      }
    }
  }

  function setMenuOpen(header, open) {
    var button = header.querySelector(".feedops-menu-toggle");
    var menu = header.querySelector(".feedops-mobile-menu");
    header.classList.toggle("is-menu-open", open);
    if (button) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) menu.toggleAttribute("hidden", !open);
  }

  function bindMobileMenu() {
    var header = document.querySelector("#feedops-standard-header");
    if (!header) return;

    var button = header.querySelector(".feedops-menu-toggle");
    var menu = header.querySelector(".feedops-mobile-menu");
    if (!button || !menu) return;

    setMenuOpen(header, false);

    button.addEventListener("click", function () {
      setMenuOpen(header, button.getAttribute("aria-expanded") !== "true");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(header, false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenuOpen(header, false);
      }
    });
  }

  function removeOldHeaders(exceptNode) {
    document.querySelectorAll([
      "#feedops-standard-header",
      "header.site-header",
      ".mode-switch[aria-label='Explore FeedOps as']"
    ].join(",")).forEach(function (node) {
      if (node === exceptNode || (exceptNode && exceptNode.contains(node))) return;
      node.remove();
    });
  }

  function installHeader() {
    var existingStandard = document.querySelector("#feedops-standard-header");
    if (existingStandard) {
      removeOldHeaders(existingStandard);
    } else {
      var placeholder = document.querySelector("header.site-header") || document.querySelector(".mode-switch[aria-label='Explore FeedOps as']");
      if (placeholder) {
        placeholder.insertAdjacentHTML("beforebegin", standardHeader());
        var installed = document.querySelector("#feedops-standard-header");
        placeholder.remove();
        removeOldHeaders(installed);
      } else {
        document.body.insertAdjacentHTML("afterbegin", standardHeader());
      }
    }
    bindMobileMenu();
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
