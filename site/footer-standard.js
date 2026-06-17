(function () {
  var script = document.currentScript;
  var root = script && script.dataset ? script.dataset.siteRoot || "" : "";
  window.feedopsInstallStandardFooter = installFooter;

  function href(path) {
    return root + path;
  }

  function externalLink(url, text) {
    return '<a href="' + url + '" target="_blank" rel="noopener">' + text + "</a>";
  }

  function standardFooter() {
    return [
      '<footer id="feedops-standard-footer" class="site-footer">',
      '  <div class="footer-inner">',
      '    <div class="footer-brand">',
      '      <a href="' + href("") + '" aria-label="FeedOps home">',
      '        <img src="' + href("_assets/feedops.com/wp-content/uploads/2022/12/Feedops-logo_Final-2-4.png") + '" alt="FeedOps">',
      "      </a>",
      "      <p>Product feed optimisation software, feed strategy, and expert support for ecommerce teams.</p>",
      '      <a class="footer-cta" href="' + href("book-live-demo/") + '">',
      '        <span>Book a feed strategy call</span>',
      '        <strong>Get a clearer feed plan</strong>',
      "      </a>",
      '      <div class="footer-brand-guides">',
      '        <div class="footer-heading">Guides</div>',
      '        <div class="footer-column">',
      '          <a href="' + href("guide/google-shopping-feed-optimization-guide/") + '">Google Shopping Feed Optimization Guide</a>',
      '          <a href="' + href("guide/google-shopping-ads-management/") + '">Google Shopping Ads Management Guide</a>',
      '          <a href="' + href("google-shopping-product-title-optimization/") + '">Google Shopping Title Optimization</a>',
      '          <a href="/feedops/google-shopping-free-listings/">Google Shopping Free Listings Guide</a>',
      "        </div>",
      "      </div>",
      "    </div>",
      '    <div class="footer-group">',
      '      <div class="footer-heading">Company</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("") + '">Home</a>',
      '        <a href="' + href("company/") + '">Company</a>',
      '        <a href="' + href("contact-us/") + '">Contact</a>',
      '        <a href="' + href("privacy-policy/") + '">Privacy Policy</a>',
      "      </div>",
      "    </div>",
      '    <div class="footer-group">',
      '      <div class="footer-heading">Platform</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("") + '">Expert</a>',
      '        <a href="' + href("executive/") + '">Executive</a>',
      '        <a href="' + href("agency/") + '">Agency</a>',
      '        <a href="' + href("pricing/") + '">Pricing</a>',
      '        <a href="' + href("book-live-demo/") + '">Strategy Call</a>',
      '        <a href="' + href("free-google-shopping-feed-audit/") + '">Google Feed Audit</a>',
      "      </div>",
      "    </div>",
      '    <div class="footer-group">',
      '      <div class="footer-heading">Support</div>',
      '      <div class="footer-column">',
      "        " + externalLink("https://app.feedops.com/authentication/login", "Login"),
      "        " + externalLink("https://kb.feedops.com/knowledge", "Help Docs"),
      "      </div>",
      "    </div>",
      "  </div>",
      "</footer>"
    ].join("");
  }

  function installFooter() {
    document.querySelectorAll([
      "#feedops-standard-footer",
      "footer.site-footer",
      "footer.elementor-location-footer",
      "footer[data-elementor-type='footer']"
    ].join(",")).forEach(function (footer) {
      footer.remove();
    });

    document.body.insertAdjacentHTML("beforeend", standardFooter());
    window.feedopsStandardFooterInstalled = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installFooter);
  } else {
    installFooter();
  }
})();
