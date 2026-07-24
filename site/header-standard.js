(function () {
  var script = document.currentScript;
  var root = script && script.dataset ? script.dataset.siteRoot || "/" : "/";
  window.feedopsInstallStandardHeader = installHeader;

  function href(path) {
    if (root === "/" || /^https?:\/\//.test(root)) return root + path;
    return root + path;
  }

  function calendarIcon() {
    return '<svg class="feedops-cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2Z"/></svg>';
  }

  function sparkleIcon() {
    return '<svg class="feedops-cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.7 4.7 2.7 6.7 7.4 7.4-4.7.7-6.7 2.7-7.4 7.4-.7-4.7-2.7-6.7-7.4-7.4C9.3 8.7 11.3 6.7 12 2Z"/><path d="M19 16c.3 2 1.2 2.9 3 3.2-1.8.3-2.7 1.2-3 3.1-.3-1.9-1.2-2.8-3-3.1 1.8-.3 2.7-1.2 3-3.2Z"/></svg>';
  }

  function desktopMenu() {
    return [
      '<div class="feedops-desktop-menu" aria-label="Primary links">',
      '  <a class="feedops-nav-link" href="' + href("product-feed-platform/") + '">Platform</a>',
      '  <a class="feedops-nav-link" href="' + href("learning/") + '">Learning</a>',
      '  <a class="feedops-nav-link" href="' + href("pricing/") + '">Pricing</a>',
      '  <a class="feedops-nav-link" href="' + href("company/") + '">About</a>',
      '  <a class="feedops-nav-link feedops-nav-login" href="https://app.feedops.com/feed_ops/sign_in" target="_blank" rel="noopener">Login</a>',
      '</div>'
    ].join("");
  }

  function mobileMenu() {
    return [
      '<div class="feedops-mobile-menu" id="feedops-mobile-menu" hidden>',
      '  <div class="feedops-mobile-panel">',
      '    <div class="feedops-global-mobile-links">',
      '      <a href="' + href("product-feed-platform/") + '">Platform</a>',
      '      <a href="' + href("learning/") + '">Learning</a>',
      '      <a href="' + href("pricing/") + '">Pricing</a>',
      '      <a href="' + href("company/") + '">About</a>',
      '      <a href="https://app.feedops.com/feed_ops/sign_in" target="_blank" rel="noopener">Login</a>',
      '    </div>',
      '    <div class="feedops-mobile-actions">',
      '      <a class="feedops-demo-cta" href="' + href("book-live-demo/") + '">' + calendarIcon() + '<span>Book a demo</span></a>',
      '      <a class="feedops-audit-cta" href="' + href("free-google-shopping-feed-audit/") + '">' + sparkleIcon() + '<span>Get Free Feed Audit</span></a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");
  }

  function standardHeader() {
    return [
      '<header id="feedops-standard-header" class="feedops-header">',
      '  <nav class="feedops-nav" aria-label="Main navigation">',
      '    <a class="feedops-logo" href="' + href("") + '" aria-label="FeedOps home">',
      '      <img src="' + href("assets/feedops.com/wp-content/uploads/2022/12/Feedops-logo-Final-2-4-300x110.png") + '" alt="FeedOps" width="300" height="110">',
      '    </a>',
      desktopMenu(),
      '    <div class="feedops-nav-actions">',
      '      <a class="feedops-demo-cta" href="' + href("book-live-demo/") + '">' + calendarIcon() + '<span>Book a demo</span></a>',
      '      <a class="feedops-audit-cta" href="' + href("free-google-shopping-feed-audit/") + '">' + sparkleIcon() + '<span>Get Free Feed Audit</span></a>',
      '    </div>',
      '    <button class="feedops-menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="feedops-mobile-menu">',
      '      <span class="feedops-menu-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>',
      '    </button>',
      '  </nav>',
      mobileMenu(),
      '</header>'
    ].join("");
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

  function bindHeaderInteractions() {
    var header = document.querySelector("#feedops-standard-header");
    if (!header) return;
    var button = header.querySelector(".feedops-menu-toggle");
    var menu = header.querySelector(".feedops-mobile-menu");

    if (button && menu) {
      setMenuOpen(header, false);
      button.addEventListener("click", function () {
        setMenuOpen(header, button.getAttribute("aria-expanded") !== "true");
      });
      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () { setMenuOpen(header, false); });
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      setMenuOpen(header, false);
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
    bindHeaderInteractions();
    window.feedopsStandardHeaderInstalled = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installHeader);
  } else {
    installHeader();
  }
})();
