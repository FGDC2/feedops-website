(function () {
  var attempts = 0;

  function createAuditForm() {
    if (!window.hbspt || !window.hbspt.forms) {
      attempts += 1;
      if (attempts < 40) {
        window.setTimeout(createAuditForm, 250);
      }
      return;
    }

    window.hbspt.forms.create({
      portalId: "20083726",
      formId: "34103a8f-c0af-4b86-9400-feb31017b795",
      target: "#audit-hubspot-form"
    });
  }

  window.addEventListener("load", createAuditForm);
})();
