(function () {
  var loaded = false;

  function createAuditForm() {
    if (!window.hbspt || !window.hbspt.forms) {
      return;
    }

    window.hbspt.forms.create({
      portalId: "20083726",
      formId: "34103a8f-c0af-4b86-9400-feb31017b795",
      target: "#audit-hubspot-form"
    });

    var loader = document.getElementById("audit-form-loader");
    var panel = document.querySelector(".form-panel");
    if (loader) loader.classList.add("is-hidden");
    if (panel) panel.classList.remove("is-loading");
  }

  function loadAuditForm() {
    if (loaded) return;
    loaded = true;

    var button = document.getElementById("load-audit-form");
    var panel = document.querySelector(".form-panel");
    if (button) {
      button.disabled = true;
      button.textContent = "Loading form...";
    }
    if (panel) panel.classList.add("is-loading");

    if (window.hbspt && window.hbspt.forms) {
      createAuditForm();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.charset = "utf-8";
    script.onload = createAuditForm;
    document.head.appendChild(script);
  }

  var loadButton = document.getElementById("load-audit-form");
  if (loadButton) {
    loadButton.addEventListener("click", loadAuditForm);
  }
})();
