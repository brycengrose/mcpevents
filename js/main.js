/* MCP Events — vanilla JS: mobile nav, hero slider, click-to-play videos, gallery lightbox */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav--drawer");
  var navScrim = document.querySelector(".nav-scrim");

  function setNav(open) {
    if (!siteNav || !navScrim) return;
    siteNav.classList.toggle("open", open);
    navScrim.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      setNav(!siteNav.classList.contains("open"));
    });
    navScrim.addEventListener("click", function () { setNav(false); });
    siteNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* ---------- Homepage hero slider ---------- */
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".slide"));
    var dotsWrap = slider.querySelector(".slider-dots");
    var counterCur = slider.querySelector("[data-cur]");
    var counterTot = slider.querySelector("[data-tot]");
    var total = slides.length;
    var idx = 0;
    var timer = null;
    var INTERVAL = 7000;

    if (counterTot) {
      counterTot.textContent = String(total).padStart(2, "0");
    }

    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (s, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", function () { goTo(i, true); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function goTo(i, force) {
      idx = (i + total) % total;
      slides.forEach(function (s, k) {
        s.classList.toggle("active", k === idx);
        s.setAttribute("aria-hidden", k === idx ? "false" : "true");
      });
      dots.forEach(function (d, k) { d.classList.toggle("active", k === idx); });
      if (counterCur) {
        counterCur.textContent = String(idx + 1).padStart(2, "0");
      }
      if (force) restart();
    }

    function next() { goTo(idx + 1, true); }
    function prev() { goTo(idx - 1, true); }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, INTERVAL);
    }

    var prevBtn = slider.querySelector("[data-prev]");
    var nextBtn = slider.querySelector("[data-next]");
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    slider.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    slider.addEventListener("mouseleave", restart);

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    goTo(0);
    restart();
  }

  /* ---------- Homepage collection cards (navigate on click) ---------- */
  var cardLinks = document.querySelectorAll(".video-card[data-href]");
  Array.prototype.forEach.call(cardLinks, function (card) {
    function go() {
      var href = card.getAttribute("data-href");
      if (href) window.location.href = href;
    }
    card.addEventListener("click", go);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });

  /* ---------- Click-to-play video cards ---------- */
  var cards = document.querySelectorAll("[data-video]");
  Array.prototype.forEach.call(cards, function (card) {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Play video");
    function play() {
      if (card.querySelector("iframe.player")) return;
      var id = card.getAttribute("data-video");
      var iframe = document.createElement("iframe");
      iframe.className = "player";
      iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      card.appendChild(iframe);
    }
    card.addEventListener("click", function (e) {
      if (e.target.closest("a.open")) return;
      play();
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); }
    });
  });

  /* ---------- Staging gallery lightbox ---------- */
  var gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    var shots = Array.prototype.slice.call(gallery.querySelectorAll("figure[data-src]"));
    var box = document.querySelector(".lightbox");
    if (box) {
      var lbImg = box.querySelector("img");
      var lbCountCur = box.querySelector("[data-count-cur]");
      var lbCountTot = box.querySelector("[data-count-tot]");
      if (lbCountTot) lbCountTot.textContent = String(shots.length).padStart(2, "0");
      var cur = 0; // but shots start later
    }

    var lightboxImages = null;
    var lightboxOpen = false;

    function openLb(i) {
      if (!box) return;
      cur = (i + shots.length) % shots.length;
      lightboxImages = shots.map(function (f) { return f.getAttribute("data-src"); });
      lbImg.src = lightboxImages[cur];
      if (lbCountCur) lbCountCur.textContent = String(cur + 1).padStart(2, "0");
      box.classList.add("open");
      lightboxOpen = true;
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      if (!box) return;
      box.classList.remove("open");
      lightboxOpen = false;
      document.body.style.overflow = "";
    }
    function step(d) {
      if (!box || !lightboxImages) return;
      cur = (cur + d + lightboxImages.length) % lightboxImages.length;
      lbImg.src = lightboxImages[cur];
      if (lbCountCur) lbCountCur.textContent = String(cur + 1).padStart(2, "0");
    }

    shots.forEach(function (fig, i) {
      fig.addEventListener("click", function () { openLb(i); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(i); }
      });
    });

    if (box) {
      var closeBtn = box.querySelector(".lb-close");
      var prevBtn = box.querySelector(".lb-prev");
      var nextBtn = box.querySelector(".lb-next");
      if (closeBtn) closeBtn.addEventListener("click", closeLb);
      if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
      box.addEventListener("click", function (e) {
        if (e.target === box) closeLb();
      });
      document.addEventListener("keydown", function (e) {
        if (!lightboxOpen) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
  }
})();