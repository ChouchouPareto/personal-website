// ============================================
// 光线背景（LightRays）— 原生 WebGL 移植
// 来源：React Bits（reactbits.dev）LightRays-JS-CSS
// 不依赖 ogl / React；带 IntersectionObserver：
// 仅在元素进入视口时创建 WebGL 并渲染，离开时释放
// ============================================
(function () {
  "use strict";

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
      ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
      : [1, 1, 1];
  }

  function getAnchorAndDir(origin, w, h) {
    var outside = 0.2;
    switch (origin) {
      case "top-left": return { anchor: [0, -outside * h], dir: [0, 1] };
      case "top-right": return { anchor: [w, -outside * h], dir: [0, 1] };
      case "left": return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
      case "right": return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
      case "bottom-left": return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
      case "bottom-center": return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
      case "bottom-right": return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
      default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
    }
  }

  var VERT = [
    "attribute vec2 position;",
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = position * 0.5 + 0.5;",
    "  gl_Position = vec4(position, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "",
    "uniform float iTime;",
    "uniform vec2  iResolution;",
    "",
    "uniform vec2  rayPos;",
    "uniform vec2  rayDir;",
    "uniform vec3  raysColor;",
    "uniform float raysSpeed;",
    "uniform float lightSpread;",
    "uniform float rayLength;",
    "uniform float pulsating;",
    "uniform float fadeDistance;",
    "uniform float saturation;",
    "uniform vec2  mousePos;",
    "uniform float mouseInfluence;",
    "uniform float noiseAmount;",
    "uniform float distortion;",
    "",
    "varying vec2 vUv;",
    "",
    "float noise(vec2 st) {",
    "  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);",
    "}",
    "",
    "float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,",
    "                  float seedA, float seedB, float speed) {",
    "  vec2 sourceToCoord = coord - raySource;",
    "  vec2 dirNorm = normalize(sourceToCoord);",
    "  float cosAngle = dot(dirNorm, rayRefDirection);",
    "",
    "  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;",
    "",
    "  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));",
    "",
    "  float distance = length(sourceToCoord);",
    "  float maxDistance = iResolution.x * rayLength;",
    "  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);",
    "",
    "  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);",
    "  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;",
    "",
    "  float baseStrength = clamp(",
    "    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +",
    "    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),",
    "    0.0, 1.0",
    "  );",
    "",
    "  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;",
    "}",
    "",
    "void mainImage(out vec4 fragColor, in vec2 fragCoord) {",
    "  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);",
    "",
    "  vec2 finalRayDir = rayDir;",
    "  if (mouseInfluence > 0.0) {",
    "    vec2 mouseScreenPos = mousePos * iResolution.xy;",
    "    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);",
    "    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));",
    "  }",
    "",
    "  vec4 rays1 = vec4(1.0) *",
    "               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,",
    "                           1.5 * raysSpeed);",
    "  vec4 rays2 = vec4(1.0) *",
    "               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,",
    "                           1.1 * raysSpeed);",
    "",
    "  fragColor = rays1 * 0.5 + rays2 * 0.4;",
    "",
    "  if (noiseAmount > 0.0) {",
    "    float n = noise(coord * 0.01 + iTime * 0.1);",
    "    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);",
    "  }",
    "",
    "  float brightness = 1.0 - (coord.y / iResolution.y);",
    "  fragColor.x *= 0.1 + brightness * 0.8;",
    "  fragColor.y *= 0.3 + brightness * 0.6;",
    "  fragColor.z *= 0.5 + brightness * 0.5;",
    "",
    "  if (saturation != 1.0) {",
    "    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));",
    "    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);",
    "  }",
    "",
    "  fragColor.rgb *= raysColor;",
    "}",
    "",
    "void main() {",
    "  vec4 color;",
    "  mainImage(color, gl_FragCoord.xy);",
    "  gl_FragColor = color;",
    "}"
  ].join("\n");

  function initLightRays(container, options) {
    if (!container || typeof IntersectionObserver === "undefined") return null;
    options = options || {};

    var raysOrigin = options.raysOrigin || "top-center";
    var raysColor = options.raysColor || "#f0bd91";
    var raysSpeed = typeof options.raysSpeed === "number" ? options.raysSpeed : 0.6;
    var lightSpread = typeof options.lightSpread === "number" ? options.lightSpread : 1;
    var rayLength = typeof options.rayLength === "number" ? options.rayLength : 1.8;
    var pulsating = !!options.pulsating;
    var fadeDistance = typeof options.fadeDistance === "number" ? options.fadeDistance : 1.0;
    var saturation = typeof options.saturation === "number" ? options.saturation : 0.55;
    var followMouse = options.followMouse !== false;
    var mouseInfluence = typeof options.mouseInfluence === "number" ? options.mouseInfluence : 0.08;
    var noiseAmount = typeof options.noiseAmount === "number" ? options.noiseAmount : 0;
    var distortion = typeof options.distortion === "number" ? options.distortion : 0.35;

    var canvas = null;
    var gl = null;
    var program = null;
    var UL = null;
    var rafId = null;
    var started = false;
    var failed = false;
    var observer = null;
    var mouse = { x: 0.5, y: 0.5 };
    var smoothMouse = { x: 0.5, y: 0.5 };

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("LightRays shader compile error:", gl.getShaderInfoLog(sh));
      }
      return sh;
    }

    function setVec2(name, x, y) { if (UL[name] != null) gl.uniform2f(UL[name], x, y); }
    function setVec3(name, r, g, b) { if (UL[name] != null) gl.uniform3f(UL[name], r, g, b); }
    function setFloat(name, v) { if (UL[name] != null) gl.uniform1f(UL[name], v); }

    function resize() {
      if (!gl) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = container.clientWidth;
      var h = container.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      setVec2("iResolution", canvas.width, canvas.height);
      var p = getAnchorAndDir(raysOrigin, canvas.width, canvas.height);
      setVec2("rayPos", p.anchor[0], p.anchor[1]);
      setVec2("rayDir", p.dir[0], p.dir[1]);
    }

    function loop(t) {
      if (!gl) return;
      setFloat("iTime", t * 0.001);
      if (followMouse && mouseInfluence > 0) {
        smoothMouse.x = smoothMouse.x * 0.92 + mouse.x * 0.08;
        smoothMouse.y = smoothMouse.y * 0.92 + mouse.y * 0.08;
        setVec2("mousePos", smoothMouse.x, smoothMouse.y);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(loop);
    }

    function onMouseMove(e) {
      var rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = (e.clientY - rect.top) / rect.height;
    }

    function setup() {
      if (started || failed) return;

      canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      container.appendChild(canvas);

      gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
      if (!gl) {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        canvas = null;
        failed = true;
        return;
      }

      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn("LightRays program link error:", gl.getProgramInfoLog(program));
      }
      gl.useProgram(program);

      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

      var posLoc = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      UL = {};
      ["iTime", "iResolution", "rayPos", "rayDir", "raysColor", "raysSpeed",
        "lightSpread", "rayLength", "pulsating", "fadeDistance", "saturation",
        "mousePos", "mouseInfluence", "noiseAmount", "distortion"].forEach(function (name) {
        UL[name] = gl.getUniformLocation(program, name);
      });

      var rgb = hexToRgb(raysColor);
      setVec3("raysColor", rgb[0], rgb[1], rgb[2]);
      setFloat("raysSpeed", raysSpeed);
      setFloat("lightSpread", lightSpread);
      setFloat("rayLength", rayLength);
      setFloat("pulsating", pulsating ? 1.0 : 0.0);
      setFloat("fadeDistance", fadeDistance);
      setFloat("saturation", saturation);
      setFloat("mouseInfluence", mouseInfluence);
      setFloat("noiseAmount", noiseAmount);
      setFloat("distortion", distortion);

      if (followMouse) window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("resize", resize);
      resize();
      rafId = requestAnimationFrame(loop);
    }

    function teardown() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      window.removeEventListener("resize", resize);
      if (followMouse) window.removeEventListener("mousemove", onMouseMove);
      if (gl) {
        var lose = gl.getExtension("WEBGL_lose_context");
        if (lose) { try { lose.loseContext(); } catch (e) { /* ignore */ } }
      }
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvas = null;
      gl = null;
      program = null;
      UL = null;
    }

    observer = new IntersectionObserver(function (entries) {
      var visible = entries[0] && entries[0].isIntersecting;
      if (visible && !started) {
        started = true;
        setup();
      } else if (!visible && started) {
        started = false;
        teardown();
      }
    }, { threshold: 0.05, rootMargin: "120px" });
    observer.observe(container);

    return {
      destroy: function () {
        if (observer) observer.disconnect();
        if (started) { started = false; teardown(); }
      }
    };
  }

  window.initLightRays = initLightRays;
})();
