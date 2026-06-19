(function () {
  var storageKey = "feedops_cookie_choice_v1";
  var cookieName = "feedops_cookie_choice";
  var previewMode = window.location.search.indexOf("cookie-preview=1") !== -1;

  function getStoredChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      var match = document.cookie.match(new RegExp("(^| )" + cookieName + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    }
  }

  function storeChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // Browsers can block storage in private modes, so a small cookie fallback keeps the notice polite.
    }

    document.cookie = cookieName + "=" + encodeURIComponent(choice) + "; Max-Age=15552000; Path=/; SameSite=Lax";
  }

  function loadGoogleTagManager() {
    if (window.FeedOpsGTM && typeof window.FeedOpsGTM.load === "function") {
      window.FeedOpsGTM.load();
    }
  }

  function injectStyles() {
    if (document.getElementById("feedops-cookie-styles")) return;

    var styles = document.createElement("style");
    styles.id = "feedops-cookie-styles";
    styles.textContent = [
      ".feedops-cookie {",
      "  position: fixed;",
      "  left: 20px;",
      "  right: 20px;",
      "  bottom: 20px;",
      "  z-index: 9999;",
      "  display: grid;",
      "  justify-items: center;",
      "  pointer-events: none;",
      "  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
      "}",
      ".feedops-cookie__panel {",
      "  width: min(920px, 100%);",
      "  display: grid;",
      "  grid-template-columns: auto minmax(0, 1fr) auto;",
      "  gap: 18px;",
      "  align-items: center;",
      "  padding: 16px;",
      "  border: 1px solid rgba(216, 222, 232, .95);",
      "  border-radius: 14px;",
      "  background: rgba(255, 255, 255, .96);",
      "  box-shadow: 0 24px 70px rgba(16, 24, 32, .18);",
      "  backdrop-filter: blur(14px);",
      "  pointer-events: auto;",
      "}",
      ".feedops-cookie__mark {",
      "  width: 48px;",
      "  height: 48px;",
      "  display: grid;",
      "  place-items: center;",
      "  border-radius: 12px;",
      "  color: #1c8c6f;",
      "  background: linear-gradient(135deg, #eaf7f1 0%, #fff4df 100%);",
      "  border: 1px solid rgba(28, 140, 111, .15);",
      "}",
      ".feedops-cookie__mark svg {",
      "  width: 25px;",
      "  height: 25px;",
      "  stroke: currentColor;",
      "  stroke-width: 2.2;",
      "  fill: none;",
      "  stroke-linecap: round;",
      "  stroke-linejoin: round;",
      "}",
      ".feedops-cookie__copy strong {",
      "  display: block;",
      "  color: #101820;",
      "  font-size: 16px;",
      "  line-height: 1.2;",
      "  letter-spacing: 0;",
      "}",
      ".feedops-cookie__copy p {",
      "  margin: 5px 0 0;",
      "  color: #4b5565;",
      "  font-size: 14px;",
      "  line-height: 1.45;",
      "}",
      ".feedops-cookie__copy a {",
      "  color: #176e58;",
      "  font-weight: 800;",
      "  text-decoration: none;",
      "  border-bottom: 1px solid rgba(23, 110, 88, .35);",
      "}",
      ".feedops-cookie__actions {",
      "  display: flex;",
      "  align-items: center;",
      "  gap: 10px;",
      "}",
      ".feedops-cookie__button {",
      "  min-height: 42px;",
      "  appearance: none;",
      "  border: 1px solid transparent;",
      "  border-radius: 999px;",
      "  padding: 0 16px;",
      "  cursor: pointer;",
      "  font: inherit;",
      "  font-size: 14px;",
      "  font-weight: 900;",
      "  white-space: nowrap;",
      "}",
      ".feedops-cookie__button--secondary {",
      "  color: #1f2937;",
      "  background: #fff;",
      "  border-color: #d8dee8;",
      "}",
      ".feedops-cookie__button--primary {",
      "  color: #101820;",
      "  background: #ffca28;",
      "  box-shadow: 0 10px 24px rgba(255, 202, 40, .24);",
      "}",
      ".feedops-cookie__button:hover {",
      "  transform: translateY(-1px);",
      "}",
      ".feedops-cookie.is-saved .feedops-cookie__panel {",
      "  grid-template-columns: auto minmax(0, 1fr);",
      "}",
      ".feedops-cookie.is-saved .feedops-cookie__actions {",
      "  display: none;",
      "}",
      ".feedops-cookie.is-saved .feedops-cookie__mark {",
      "  color: #101820;",
      "  background: #ffca28;",
      "}",
      ".feedops-cookie.is-hiding {",
      "  opacity: 0;",
      "  transform: translateY(10px);",
      "  transition: opacity .18s ease, transform .18s ease;",
      "}",
      "@media (max-width: 760px) {",
      "  .feedops-cookie { left: 12px; right: 12px; bottom: 12px; }",
      "  .feedops-cookie__panel { grid-template-columns: 1fr; gap: 14px; padding: 15px; }",
      "  .feedops-cookie__mark { display: none; }",
      "  .feedops-cookie__actions { width: 100%; display: grid; grid-template-columns: 1fr; }",
      "  .feedops-cookie__button { width: 100%; }",
      "}"
    ].join("\n");

    document.head.appendChild(styles);
  }

  function updateConfirmation(banner, choice) {
    var copy = banner.querySelector(".feedops-cookie__copy");
    var mark = banner.querySelector(".feedops-cookie__mark");
    var actions = banner.querySelector(".feedops-cookie__actions");
    if (!copy) return;

    if (choice === "accepted") {
      copy.innerHTML = [
        "<strong>Cookies accepted.</strong>",
        "<p>Thanks. Analytics cookies can now help us understand what visitors use and improve the FeedOps site.</p>"
      ].join("");
    } else {
      copy.innerHTML = [
        "<strong>Necessary cookies only.</strong>",
        "<p>Saved. We will only use the cookies needed to keep the site working.</p>"
      ].join("");
    }

    if (mark) {
      mark.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>';
    }
    if (actions) {
      actions.remove();
    }
    banner.classList.add("is-saved");
  }

  function closeBanner(banner, choice) {
    storeChoice(choice);
    if (choice === "accepted") {
      loadGoogleTagManager();
    }
    updateConfirmation(banner, choice);
    window.setTimeout(function () {
      banner.classList.add("is-hiding");
      window.setTimeout(function () {
        banner.remove();
      }, 190);
    }, 1200);
  }

  function buildBanner() {
    var banner = document.createElement("section");
    banner.className = "feedops-cookie";
    banner.setAttribute("aria-label", "Cookie notice");
    banner.innerHTML = [
      '<div class="feedops-cookie__panel" role="dialog" aria-live="polite" aria-label="Cookie notice">',
      '  <div class="feedops-cookie__mark" aria-hidden="true">',
      '    <svg viewBox="0 0 24 24"><path d="M12 3v4"></path><path d="M12 17v4"></path><path d="M5.6 5.6l2.8 2.8"></path><path d="M15.6 15.6l2.8 2.8"></path><path d="M3 12h4"></path><path d="M17 12h4"></path><path d="M5.6 18.4l2.8-2.8"></path><path d="M15.6 8.4l2.8-2.8"></path></svg>',
      "  </div>",
      '  <div class="feedops-cookie__copy">',
      "    <strong>We use cookies to keep FeedOps useful.</strong>",
      '    <p>We use essential cookies and, with your permission, analytics cookies to understand what is working on the site. Read our <a href="/privacy-policy/">privacy policy</a>.</p>',
      "  </div>",
      '  <div class="feedops-cookie__actions">',
      '    <button class="feedops-cookie__button feedops-cookie__button--secondary" type="button" data-cookie-choice="necessary">Necessary only</button>',
      '    <button class="feedops-cookie__button feedops-cookie__button--primary" type="button" data-cookie-choice="accepted">Accept all</button>',
      "  </div>",
      "</div>"
    ].join("");

    banner.addEventListener("click", function (event) {
      var button = event.target.closest("[data-cookie-choice]");
      if (!button) return;
      closeBanner(banner, button.getAttribute("data-cookie-choice"));
    });

    document.body.appendChild(banner);
  }

  function init() {
    var storedChoice = getStoredChoice();
    if (!previewMode && storedChoice) {
      if (storedChoice === "accepted") {
        loadGoogleTagManager();
      }
      return;
    }
    injectStyles();
    buildBanner();
  }

  window.FeedOpsCookieConsent = {
    reset: function () {
      try {
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        // Ignore storage failures.
      }
      document.cookie = cookieName + "=; Max-Age=0; Path=/; SameSite=Lax";
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
