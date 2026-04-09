(function () {
  const section = document.getElementById("see-bumi");
  const frame = document.querySelector("[data-video-preview]");
  const inline = document.getElementById("video-inline");
  const modal = document.getElementById("video-modal");
  const modalVideo = document.getElementById("video-modal-player");
  if (!section || !frame || !inline || !modal || !modalVideo) return;

  function isModalOpen() {
    return !modal.hasAttribute("hidden");
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) {
          inline.pause();
          continue;
        }
        if (!isModalOpen()) {
          inline.play().catch(function () {});
        }
      }
    },
    { threshold: 0.35 }
  );

  observer.observe(section);

  function openModal() {
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    inline.pause();
    try {
      modalVideo.currentTime = inline.currentTime;
    } catch (_err) {}
    modalVideo.play().catch(function () {});
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    modalVideo.pause();
    document.body.style.overflow = "";

    var rect = section.getBoundingClientRect();
    var inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      try {
        inline.currentTime = modalVideo.currentTime;
      } catch (_err) {}
      inline.play().catch(function () {});
    }
  }

  frame.addEventListener("click", openModal);

  modal.querySelectorAll("[data-video-modal-close]").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      closeModal();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isModalOpen()) closeModal();
  });
})();
