(function () {
  var meetingConversionSent = false;
  var conversionState = window.__feedOpsConversionState = window.__feedOpsConversionState || {};

  function claimConversion(key) {
    var now = Date.now();
    var storageKey = "feedops_conversion_" + key;
    if (conversionState[key] && now - conversionState[key] < 10000) return false;
    try {
      var previous = Number(window.sessionStorage.getItem(storageKey) || 0);
      if (previous && now - previous < 10000) return false;
      window.sessionStorage.setItem(storageKey, String(now));
    } catch (error) {
      // Continue with the in-memory guard when storage is unavailable.
    }
    conversionState[key] = now;
    return true;
  }
  var backLink = document.querySelector("[data-history-back]");
  if (backLink) {
    backLink.addEventListener("click", function (event) {
      if (window.history.length > 1 && document.referrer) {
        event.preventDefault();
        window.history.back();
      }
    });
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== "https://meetings.hubspot.com" || !event.data.meetingBookSucceeded) {
      return;
    }
    if (meetingConversionSent || !claimConversion("meeting")) {
      return;
    }
    meetingConversionSent = true;

    var payload = event.data.meetingsPayload || {};
    var response = payload.bookingResponse || {};
    var postResponse = response.postResponse || {};
    var contact = postResponse.contact || {};

    window.referralJS = window.referralJS || {};
    window.referralJS.conversion = {
      debug: "false",
      parameters: {
        firstname: contact.firstName,
        lastname: contact.lastName,
        email: contact.email
      }
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "FeedOps_Meeting_Booked",
      meeting_name: "feed_strategy_call",
      meeting_source: "hubspot"
    });

    loadReferralScript();
    window.setTimeout(function () {
      window.location.href = "/book-live-demo/meeting-booked/";
    }, 600);
  });

  document.querySelectorAll(".meetings-iframe-container").forEach(function (container) {
    var loadButton = container.querySelector("[data-load-calendar]");

    function markLoaded() {
      container.classList.add("is-loaded");
      container.setAttribute("aria-busy", "false");
    }

    function loadCalendar() {
      if (container.querySelector("iframe")) {
        return;
      }

      container.classList.add("is-loading");
      container.setAttribute("aria-busy", "true");

      var iframe = document.createElement("iframe");
      iframe.src = container.getAttribute("data-src");
      iframe.title = "Book a FeedOps demo calendar";
      iframe.width = "100%";
      iframe.height = "1240";
      iframe.loading = "lazy";
      iframe.setAttribute("data-hs-ignore", "true");
      iframe.style.minWidth = "312px";
      iframe.style.minHeight = "1240px";
      iframe.style.height = "1240px";
      iframe.style.marginTop = "-180px";
      iframe.style.borderWidth = "0";
      iframe.addEventListener("load", markLoaded, { once: true });
      window.setTimeout(markLoaded, 900);
      container.appendChild(iframe);
    }

    if (loadButton) {
      loadButton.addEventListener("click", loadCalendar);
    }

    if (container.hasAttribute("data-auto-load-calendar")) {
      loadCalendar();
    }
  });

  function loadReferralScript() {
    if (document.getElementById("RR_DIVID_V5")) {
      return;
    }

    window.referralJS = window.referralJS || {};
    window.referralJS.scriptConfig = {
      parameters: {
        src: "//feedops.referralrock.com/ReferralSdk/referral.js",
        transactionKey: "7301c474-c959-4e64-9114-a9bde03e3465"
      }
    };

    var referralScript = document.createElement("script");
    var firstScript = document.getElementsByTagName("script")[0];
    referralScript.async = true;
    referralScript.src = window.referralJS.scriptConfig.parameters.src + "?referrer=" + encodeURIComponent(window.location.origin + window.location.pathname).replace(/[!'()*]/g, escape);
    referralScript.id = "RR_DIVID_V5";
    referralScript.setAttribute("transactionKey", window.referralJS.scriptConfig.parameters.transactionKey);
    firstScript.parentNode.insertBefore(referralScript, firstScript);
  }
})();
