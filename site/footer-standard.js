(function () {
  var script = document.currentScript;
  var root = script && script.dataset ? script.dataset.siteRoot || "/" : "/";
  window.feedopsInstallStandardFooter = installFooter;

  function href(path) {
    if (root === "/" || /^https?:\/\//.test(root)) {
      return root + path;
    }
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
      '        <img src="' + href("assets/feedops.com/wp-content/uploads/2022/12/Feedops-logo-Final-2-4-300x110.png") + '" alt="FeedOps" width="300" height="110">',
      "      </a>",
      "      <p>Product feed optimisation software, feed strategy, and expert support for ecommerce teams.</p>",
      '      <a class="footer-cta" href="' + href("book-live-demo/") + '">',
      '        <span>Book a demo</span>',
      '        <strong>See a clearer feed plan</strong>',
      "      </a>",
      "    </div>",
      '      <div class="footer-brand-guides">',
      '        <div class="footer-heading">Guides</div>',
      '        <div class="footer-column">',
      '        <a href="' + href("guide/google-shopping-feed-optimization-guide/") + '">Google Shopping Feed Optimization</a>',
      '        <a href="' + href("guide/google-shopping-ads-management/") + '">Google Shopping Ads Management</a>',
      '        <a href="' + href("guide/google-local-inventory-ads-performance-max/") + '">Google Local Inventory Ads Performance Max</a>',
      '        <a href="' + href("google-shopping-product-title-optimization/") + '">Google Shopping Title Optimization</a>',
      '        <a href="' + href("feedops/google-shopping-free-listings/") + '">Google Shopping Free Listings</a>',
      "        </div>",
      "      </div>",
      '    <div class="footer-group footer-company-column">',
      '      <div class="footer-heading">Company</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("") + '">Home</a>',
      '        <a href="' + href("company/") + '">Company</a>',
      '        <a href="' + href("learning/") + '">Learning</a>',
      '        <a href="' + href("privacy-policy/") + '">Privacy</a>',
      "      </div>",
      "    </div>",
      '    <div class="footer-group footer-platform-column">',
      '      <div class="footer-heading">Platform</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("") + '">Product Feed Optimisation</a>',
      '        <a href="' + href("product-feed-management/") + '">Product Feed Management</a>',
      '        <a href="' + href("shopping-feed-agency/") + '">Shopping Feed Agency</a>',
      '        <a href="' + href("pricing/") + '">Pricing Model</a>',
      '        <a href="' + href("book-live-demo/") + '">Book a demo</a>',
      '        <a href="' + href("free-google-shopping-feed-audit/") + '">Google Shopping Feed Audit</a>',
      "      </div>",
      "    </div>",
      '    <div class="footer-group footer-support-column">',
      '      <div class="footer-heading">Support</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("faq/") + '">FAQ</a>',
      "        " + externalLink("https://app.feedops.com/feed_ops/sign_in", "Login"),
      '        <a href="' + href("contact_us/") + '">Contact</a>',
      "        " + externalLink("https://kb.feedops.com/knowledge", "Help Docs"),
      "      </div>",
      "    </div>",
      '    <div class="footer-group footer-explainers-column">',
      '      <div class="footer-heading">Explainers</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("what-is-a-google-shopping-feed/") + '">Google Shopping Feed</a>',
      '        <a href="' + href("google-shopping-graph-explained/") + '">Google Shopping Graph</a>',
      '        <a href="' + href("product-type-google-shopping/") + '">Product Type Google Shopping</a>',
      '        <a href="' + href("google-product-category/") + '">Google Product Category</a>',
      "      </div>",
      "    </div>",
      '    <div class="footer-group footer-troubleshooting-column">',
      '      <div class="footer-heading">Troubleshooting</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("google-merchant-center-errors/") + '">Google Merchant Center Errors</a>',
      '        <a href="' + href("google-shopping-ads-not-showing/") + '">Google Shopping Ads Not Showing</a>',
      "      </div>",
      "    </div>",
      '    <a class="footer-learning-cta" href="' + href("learning/") + '">',
      '      <span>Feed guides and explainers</span>',
      '      <strong>View Learning Hub</strong>',
      "    </a>",
      '    <div class="footer-group footer-comparison-column">',
      '      <div class="footer-heading">Compare Us</div>',
      '      <div class="footer-column">',
      '        <a href="' + href("feedonomics-alternative-competitor/") + '">Feedonomics Alternative</a>',
      '        <a href="' + href("intelligent-reach-alternative/") + '">Intelligent Reach Alternative</a>',
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
