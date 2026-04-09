(function () {
  function hasGtag() {
    return typeof window.gtag === "function";
  }

  function track(eventName, params) {
    if (!hasGtag()) return;
    window.gtag("event", eventName, params || {});
  }

  // ---- CTA click tracking ----
  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-analytics='cta']");
    if (!el) return;
    track("cta_click", {
      cta_name: el.getAttribute("data-cta-name") || "unknown_cta",
      location: el.getAttribute("data-cta-location") || "unknown_location",
      target: el.getAttribute("href") || "",
    });
  });

  // CTA form submit
  var ctaForm = document.querySelector(".cta-form");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function () {
      track("cta_submit", {
        location: "waitlist",
      });
    });
  }

  // ---- Section dwell tracking ----
  var trackedSections = Array.prototype.slice.call(
    document.querySelectorAll("section[id], footer[id]")
  );
  var activeId = null;
  var activeName = null;
  var activeStart = 0;
  var ratioMap = {};

  function humanize(id) {
    return id.replace(/-/g, " ");
  }

  function flushActive(reason) {
    if (!activeId || !activeStart) return;
    var dwellMs = Date.now() - activeStart;
    if (dwellMs < 800) return;
    track("section_dwell", {
      section_id: activeId,
      section_name: activeName || humanize(activeId),
      dwell_ms: dwellMs,
      end_reason: reason || "switch",
    });
  }

  function pickMostVisible() {
    var picked = null;
    var bestRatio = 0;
    trackedSections.forEach(function (node) {
      var id = node.id;
      var ratio = ratioMap[id] || 0;
      if (ratio > bestRatio && ratio >= 0.35) {
        bestRatio = ratio;
        picked = node;
      }
    });
    return picked;
  }

  if (trackedSections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          ratioMap[entry.target.id] = entry.intersectionRatio;
        });
        var next = pickMostVisible();
        var nextId = next ? next.id : null;
        if (nextId !== activeId) {
          flushActive("switch");
          activeId = nextId;
          activeName = nextId ? humanize(nextId) : null;
          activeStart = nextId ? Date.now() : 0;
          if (nextId) {
            track("section_view", {
              section_id: activeId,
              section_name: activeName,
            });
          }
        }
      },
      { threshold: [0, 0.25, 0.35, 0.5, 0.75, 1] }
    );

    trackedSections.forEach(function (node) {
      ratioMap[node.id] = 0;
      sectionObserver.observe(node);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        flushActive("hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      flushActive("pagehide");
    });
  }

  // ---- Video analytics ----
  var previewFrame = document.querySelector("[data-video-preview]");
  var inlineVideo = document.getElementById("video-inline");
  var modalVideo = document.getElementById("video-modal-player");

  if (previewFrame) {
    previewFrame.addEventListener("click", function () {
      track("video_preview_click", {
        video_id: "bumi_video",
        location: "see-bumi",
      });
    });
  }

  function wireVideo(videoEl, label) {
    if (!videoEl) return;
    var sent = { 25: false, 50: false, 75: false };

    videoEl.addEventListener("play", function () {
      track("video_play", {
        video_id: "bumi_video",
        player: label,
        position_sec: Math.floor(videoEl.currentTime || 0),
      });
    });

    videoEl.addEventListener("pause", function () {
      track("video_pause", {
        video_id: "bumi_video",
        player: label,
        position_sec: Math.floor(videoEl.currentTime || 0),
      });
    });

    videoEl.addEventListener("timeupdate", function () {
      var duration = videoEl.duration || 0;
      if (!duration || !isFinite(duration)) return;
      var pct = (videoEl.currentTime / duration) * 100;
      [25, 50, 75].forEach(function (mark) {
        if (!sent[mark] && pct >= mark) {
          sent[mark] = true;
          track("video_progress", {
            video_id: "bumi_video",
            player: label,
            progress_pct: mark,
          });
        }
      });
    });

    videoEl.addEventListener("ended", function () {
      track("video_complete", {
        video_id: "bumi_video",
        player: label,
      });
    });
  }

  wireVideo(inlineVideo, "inline_preview");
  wireVideo(modalVideo, "modal_player");
})();
