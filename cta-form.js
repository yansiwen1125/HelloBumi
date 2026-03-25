(function () {
  var form = document.querySelector(".cta-form");
  if (!form) return;

  var statusEl = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector('button[type="submit"]');
  var originalBtnText = submitBtn ? submitBtn.textContent : "";
  var emailInput = form.querySelector('input[name="email"]');
  var honeyInput = form.querySelector('input[name="_gotcha"]');

  function setStatus(message, isError) {
    if (!statusEl) return;
    if (message) {
      statusEl.textContent = message;
      statusEl.removeAttribute("hidden");
    } else {
      statusEl.textContent = "";
      statusEl.setAttribute("hidden", "");
    }
    statusEl.classList.toggle("cta-form-status--error", !!isError);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var url = (window.BUMI_SUBMIT_URL || "/api/submit").trim();
    if (!url) {
      setStatus("Submit URL is not configured.", true);
      return;
    }

    setStatus("");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    var payload = {
      email: emailInput ? emailInput.value.trim() : "",
      _gotcha: honeyInput ? String(honeyInput.value || "") : "",
    };

    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch (_) {}
          return { res: res, data: data };
        });
      })
      .then(function (_ref) {
        var res = _ref.res;
        var data = _ref.data;
        if (res.ok && data.ok) {
          setStatus("Thanks — we received your email.");
          form.reset();
          return;
        }
        var msg =
          data.error ||
          (res.status === 503 ? "Service unavailable. Try again later." : null) ||
          "Something went wrong. Please try again.";
        setStatus(msg, true);
      })
      .catch(function () {
        setStatus(
          "Could not reach the server. If you opened this file directly, use a dev server (e.g. vercel dev) or deploy to Vercel.",
          true
        );
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
  });
})();
