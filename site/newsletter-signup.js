(function () {
  var formCreated = false;
  var previousFocus = null;
  var modalId = "feedops-newsletter-modal";
  var targetId = "feedops-newsletter-form";

  function getModal() {
    var existing = document.getElementById(modalId);
    if (existing) return existing;

    var modal = document.createElement("div");
    modal.className = "newsletter-modal";
    modal.id = modalId;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "feedops-newsletter-title");
    modal.hidden = true;
    modal.innerHTML = [
      '<button class="newsletter-modal-backdrop" type="button" data-newsletter-close aria-label="Close newsletter signup"></button>',
      '<div class="newsletter-modal-panel">',
      '<button class="newsletter-modal-close" type="button" data-newsletter-close aria-label="Close newsletter signup">&times;</button>',
      '<h2 id="feedops-newsletter-title">Subscribe to FeedOps updates</h2>',
      '<p>Get practical product feed, Google Shopping, Merchant Center, and ecommerce ad performance updates.</p>',
      '<div class="newsletter-modal-form">',
      '<div class="hbspt-form" id="' + targetId + '"></div>',
      "</div>",
      "</div>"
    ].join("");
    document.body.appendChild(modal);
    return modal;
  }

  function createNewsletterForm() {
    if (formCreated || !window.hbspt || !window.hbspt.forms) return;
    formCreated = true;
    window.hbspt.forms.create({
      portalId: "20083726",
      formId: "99ef4288-0f9a-401c-8487-57ef5a3331ca",
      region: "na1",
      inlineMessage: "Success - thanks for subscribing. You are on the FeedOps newsletter list.",
      target: "#" + targetId
    });
  }

  function loadNewsletterForm() {
    if (window.hbspt && window.hbspt.forms) {
      createNewsletterForm();
      return;
    }

    if (document.querySelector("script[data-hubspot-newsletter]")) return;

    var script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.defer = true;
    script.dataset.hubspotNewsletter = "true";
    script.onload = createNewsletterForm;
    document.head.appendChild(script);
  }

  function openModal() {
    var modal = getModal();
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    loadNewsletterForm();
    modal.querySelector(".newsletter-modal-close").focus();
  }

  function closeModal() {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (previousFocus) previousFocus.focus();
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-newsletter-open]")) {
      openModal();
      return;
    }

    if (event.target.closest("[data-newsletter-close]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    var modal = document.getElementById(modalId);
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });
})();
