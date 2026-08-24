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

  // ---------- 3D 地球（标记浙江） ----------
  function initGlobe() {
    const container = document.getElementById("globe-viz");
    if (!container || typeof Globe === "undefined") return;

    // 浙江省（以省会杭州坐标代表，约 30.27°N, 120.16°E）
    const ZHEJIANG = { lat: 30.2741, lng: 120.1551 };

    const globe = Globe({ rendererConfig: { antialias: true, alpha: true } })(container)
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-day.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundColor("rgba(0,0,0,0)")
      .globeResolution(128)
      .showAtmosphere(true)
      .atmosphereColor("#c7cbf3")
      .atmosphereAltitude(0.18)

      // 发光标记点（杏桃色）
      .pointsData([ZHEJIANG])
      .pointLat("lat")
      .pointLng("lng")
      .pointColor(function () { return "#f6cda4"; })
      .pointAltitude(0.02)
      .pointRadius(0.4)

      // 脉冲圆环（薰衣草）
      .ringsData([ZHEJIANG])
      .ringLat("lat")
      .ringLng("lng")
      .ringColor(function () {
        return function (t) { return "rgba(199, 203, 243, " + (1 - t) + ")"; };
      })
      .ringMaxRadius(6)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(900)

      // 文字标签（石墨墨）
      .labelsData([Object.assign({ text: "中国 · 浙江省" }, ZHEJIANG)])
      .labelLat("lat")
      .labelLng("lng")
      .labelText("text")
      .labelSize(1.2)
      .labelDotRadius(0.5)
      .labelColor(function () { return "#3a3a3e"; })
      .labelResolution(2)

      // 缓慢自转
      .autoRotate(true)
      .autoRotateSpeed(0.5);

    // 初始视角对准浙江
    globe.pointOfView({ lat: ZHEJIANG.lat, lng: ZHEJIANG.lng, altitude: 2.4 }, 0);

    // 固定视角：禁用缩放/平移，仅保留拖拽旋转 + 自动旋转
    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // 响应式尺寸
    function resize() {
      globe.width(container.clientWidth).height(container.clientHeight);
    }
    resize();
    window.addEventListener("resize", resize);

    // 清理函数（预留，供后续需要时调用）
    window.__globe = globe;
  }

  initGlobe();

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
})();
