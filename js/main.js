// ============================================
// 个人网站 - 交互脚本
// ============================================

(function () {
  "use strict";

  // ---------- 页脚年份 ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- 移动端菜单 ----------
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  navToggle.addEventListener("click", function () {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
  });

  navLinks.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
    });
  });

  // ---------- 导航高亮当前 Section ----------
  const sections = document.querySelectorAll("section[id]");
  const navLinkEls = document.querySelectorAll(".nav-link");

  function highlightNav() {
    const scrollPos = window.scrollY + 120;
    let currentId = "";

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.id;
      }
    });

    navLinkEls.forEach(function (link) {
      const target = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", target === currentId);
    });
  }

  // ---------- 滚动淡入动画 ----------
  const revealEls = document.querySelectorAll(
    ".section-title, .section-subtitle, .about-grid, .work-card, .skill-card, .contact-links"
  );

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(function (el) {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  // ---------- 滚动监听（节流） ----------
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        highlightNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  highlightNav();

  // ---------- 光线背景（LightRays） ----------
  var raysEl = document.getElementById("hero-rays");
  if (raysEl && typeof window.initLightRays === "function") {
    window.initLightRays(raysEl, {
      raysOrigin: "top-center",
      raysColor: "#f0bd91",
      raysSpeed: 0.6,
      lightSpread: 1,
      rayLength: 1.8,
      pulsating: true,
      fadeDistance: 1.0,
      saturation: 0.55,
      followMouse: true,
      mouseInfluence: 0.08,
      noiseAmount: 0,
      distortion: 0.35
    });
  }
})();
