// smabo — interactive roadmap / skill-tree (no dependencies)
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var STORE_KEY = "smabo-roadmap-progress-v1";
  // Path prefix to the guide pages, relative to the page hosting the roadmap.
  // Defaults to the top-level location; pages in another directory override it
  // via `data-guide-dir` on the #rmap-svg element (e.g. "" when the guides sit
  // in the same folder as the roadmap page).
  var GUIDE_DIR = "docs/guides/";
  // Path prefix to the design-doc pages. Override via `data-design-dir`.
  var DESIGN_DIR = "docs/architecture/";

  // ---- data ------------------------------------------------------------
  // Coordinates are taken verbatim from docs/architecture/smabo_guides.drawio.svg
  // design: true  → show 設計書 button linking to DESIGN_DIR + id + ".html"
  // design: false (default) → no button (design page not yet created)
  var NODES = [
    { id: "baseparts", icon: "🧩", label: "ベースパーツの印刷",        x: 630, y: 0,   w: 120, h: 60, phase: "app" },
    { id: "app",       icon: "📱", label: "スマホアプリ", sub: "インストール・概要", x: 630, y: 100, w: 120, h: 50, phase: "app" },
    { id: "esp32",     icon: "🔌", label: "ESP32ソフト", sub: "書き込み・概要",   x: 630, y: 190, w: 120, h: 60, phase: "esp32" },
    { id: "hand",      icon: "🤏", label: "ハンド",                  x: 290, y: 330, w: 120, h: 60, phase: "esp32" },
    { id: "neck",      icon: "🔄", label: "首振り",                  x: 470, y: 330, w: 120, h: 60, phase: "esp32" },
    { id: "mobile",    icon: "🚗", label: "移動ロボット",             x: 630, y: 330, w: 120, h: 60, phase: "esp32" },
    { id: "arm",       icon: "🦾", label: "ロボットアーム",           x: 780, y: 330, w: 120, h: 60, phase: "esp32" },
    { id: "encmobile", icon: "⚙️", label: "エンコーダ付", sub: "移動ロボット",  x: 630, y: 430, w: 120, h: 60, phase: "esp32" },
    { id: "brain",     icon: "🧠", label: "brain", sub: "セットアップ・概要",   x: 930, y: 520, w: 120, h: 60, phase: "brain" },
    { id: "imgproc",   icon: "👁️", label: "画像処理",                x: 930, y: 630, w: 120, h: 60, phase: "brain" },
    { id: "brainros",  icon: "🤖", label: "brain-ros", sub: "セットアップ・概要", x: 1100, y: 740, w: 120, h: 60, phase: "brainros" },
    { id: "nav",       icon: "🗺️", label: "ナビゲーション",           x: 630, y: 900, w: 120, h: 60, phase: "brainros" },
    { id: "plan",      icon: "📐", label: "動作計画",                x: 780, y: 900, w: 120, h: 60, phase: "brainros" }
  ];

  // edges: from = prerequisite, to = unlocked. d = path taken straight from drawio.
  var EDGES = [
    { from: "baseparts", to: "app",       d: "M 690 60 L 690 98" },
    { from: "app",       to: "esp32",     d: "M 690 150 L 690 188" },
    { from: "esp32",     to: "hand",      d: "M 690.14 250 L 690.14 280 Q 690.14 290 680.14 290 L 359.86 290 Q 349.86 290 349.89 300 L 349.98 328" },
    { from: "esp32",     to: "neck",      d: "M 690.14 250 L 690.14 280 Q 690.14 290 680.14 290 L 539.86 290 Q 529.86 290 529.86 300 L 529.86 328" },
    { from: "esp32",     to: "mobile",    d: "M 690 250 L 690 328" },
    { from: "esp32",     to: "arm",       d: "M 690.14 250 L 690.14 280 Q 690.14 290 700.14 290 L 830.14 290 Q 840.14 290 840.11 300 L 840.02 328" },
    { from: "esp32",     to: "brain",     d: "M 690.14 250 L 690.14 280 Q 690.14 290 700.14 290 L 980.14 290 Q 990.14 290 990.14 300 L 990 518" },
    { from: "mobile",    to: "encmobile", d: "M 690 390 L 690 428" },
    { from: "brain",     to: "imgproc",   d: "M 990 580 L 990 628" },
    { from: "brain",     to: "brainros",  d: "M 990.14 580 L 990.14 590 Q 990.14 600 1000.14 600 L 1150.14 600 Q 1160.14 600 1160.13 610 L 1160.01 738" },
    { from: "encmobile", to: "nav",       d: "M 690 490 L 690 898" },
    { from: "arm",       to: "plan",      d: "M 840 390 L 840 898" },
    { from: "brainros",  to: "plan",      d: "M 1160 800 L 1160.11 830 Q 1160.14 840 1150.14 840 L 850.14 840 Q 840.14 840 840.12 850 L 840.02 898" },
    { from: "brainros",  to: "nav",       d: "M 1160.14 800 L 1160.14 830 Q 1160.14 840 1150.14 840 L 858 840 C 858 816.6 822 816.6 822 840 L 700.14 840 Q 690.14 840 690.12 850 L 690.02 898" }
  ];

  // phase bands: [y-top, y-bottom, label, requirement]
  var BANDS = [
    { cls: "app",      top: -16, bot: 169,  label: "STEP 1",  req: "smabo-app" },
    { cls: "esp32",    top: 169, bot: 509,  label: "STEP 2",  req: "+ smabo-esp32" },
    { cls: "brain",    top: 509, bot: 719,  label: "STEP 3",  req: "+ smabo-brain" },
    { cls: "brainros", top: 719, bot: 980,  label: "STEP 4",  req: "+ smabo-brain-ros" }
  ];

  // ---- derived graph ---------------------------------------------------
  var byId = {};
  NODES.forEach(function (n) { byId[n.id] = n; });

  var parents = {}, children = {};
  NODES.forEach(function (n) { parents[n.id] = []; children[n.id] = []; });
  EDGES.forEach(function (e) {
    parents[e.to].push(e.from);
    children[e.from].push(e.to);
  });

  function collect(start, map) {
    var seen = {}, stack = map[start].slice();
    while (stack.length) {
      var id = stack.pop();
      if (seen[id]) continue;
      seen[id] = true;
      map[id].forEach(function (x) { stack.push(x); });
    }
    return seen;
  }
  var ancestorsOf = {}, descendantsOf = {};
  NODES.forEach(function (n) {
    ancestorsOf[n.id] = collect(n.id, parents);
    descendantsOf[n.id] = collect(n.id, children);
  });

  // ---- progress state --------------------------------------------------
  var done = loadDone();
  function loadDone() {
    var s = {};
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      raw.forEach(function (id) { if (byId[id]) s[id] = true; });
    } catch (e) {}
    return s;
  }
  function saveDone() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Object.keys(done))); } catch (e) {}
  }
  function statusOf(id) {
    if (done[id]) return "done";
    return parents[id].every(function (p) { return done[p]; }) ? "available" : "locked";
  }

  // ---- build the SVG ---------------------------------------------------
  var svg = document.getElementById("rmap-svg");
  if (!svg) return;
  if (svg.hasAttribute("data-guide-dir")) GUIDE_DIR = svg.getAttribute("data-guide-dir");
  if (svg.hasAttribute("data-design-dir")) DESIGN_DIR = svg.getAttribute("data-design-dir");
  var nodeEls = {}, edgeEls = [];

  function el(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // arrow marker (uses context-stroke so head matches the line colour)
  var defs = el("defs", {});
  var marker = el("marker", {
    id: "rmap-arrow", viewBox: "0 0 10 10", refX: "8", refY: "5",
    markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse"
  });
  marker.appendChild(el("path", { d: "M 0 1 L 9 5 L 0 9 z", class: "edge-arrow" }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  // bands (background)
  var gBands = el("g", {});
  BANDS.forEach(function (b) {
    gBands.appendChild(el("rect", { class: "band band--" + b.cls, x: -10, y: b.top, width: 1290, height: b.bot - b.top }));
    if (b.top > 0) gBands.appendChild(el("line", { class: "band-sep", x1: -10, y1: b.top, x2: 1280, y2: b.top }));
    var t = el("text", { class: "band-label", x: 175, y: b.top + 44 });
    t.textContent = b.label;
    var req = el("tspan", { class: "req", x: 175, dy: 22 });
    req.textContent = b.req;
    t.appendChild(req);
    gBands.appendChild(t);
  });
  svg.appendChild(gBands);

  // edges
  var gEdges = el("g", {});
  EDGES.forEach(function (e) {
    var p = el("path", { class: "edge", d: e.d, "marker-end": "url(#rmap-arrow)" });
    p._edge = e;
    gEdges.appendChild(p);
    edgeEls.push(p);
  });
  svg.appendChild(gEdges);

  // nodes
  var gNodes = el("g", {});
  NODES.forEach(function (n) {
    var cx = n.x + n.w / 2;
    var g = el("g", { class: "node", "data-id": n.id });

    var link = el("a", {});
    link.setAttributeNS("http://www.w3.org/1999/xlink", "href", GUIDE_DIR + n.id + ".html");
    link.setAttribute("href", GUIDE_DIR + n.id + ".html");

    link.appendChild(el("rect", { class: "node__box", x: n.x, y: n.y, width: n.w, height: n.h, rx: 11, ry: 11 }));

    var icon = el("text", { class: "node__icon", x: cx, y: n.y + 21, "text-anchor": "middle" });
    icon.textContent = n.icon;
    link.appendChild(icon);

    var labelY = n.sub ? n.y + 39 : n.y + 41;
    var label = el("text", { class: "node__label", x: cx, y: labelY, "text-anchor": "middle" });
    label.textContent = n.label;
    link.appendChild(label);
    if (n.sub) {
      var sub = el("text", { class: "node__sub", x: cx, y: n.y + 52, "text-anchor": "middle" });
      sub.textContent = n.sub;
      link.appendChild(sub);
    }
    g.appendChild(link);

    // design-doc button (top-left corner) — shown only when n.design is truthy
    if (n.design) {
      var dw = 40, dh = 18;
      var dx = n.x + 4, dy = n.y + 4;
      var designA = el("a", { class: "node__design" });
      designA.setAttributeNS("http://www.w3.org/1999/xlink", "href", DESIGN_DIR + n.id + ".html");
      designA.setAttribute("href", DESIGN_DIR + n.id + ".html");
      designA.appendChild(el("rect", { class: "node__design-box", x: dx, y: dy, width: dw, height: dh, rx: 9, ry: 9 }));
      var dlbl = el("text", { class: "node__design-label", x: dx + dw / 2, y: dy + dh / 2, "text-anchor": "middle", "dominant-baseline": "central" });
      dlbl.textContent = "設計書";
      designA.appendChild(dlbl);
      designA.addEventListener("click", function (ev) { ev.stopPropagation(); });
      g.appendChild(designA);
    }

    // complete toggle (top-right corner) — 「未完了」 before / 「完了」 after
    var chk = el("g", { class: "node__check" });
    var bw = 44, bh = 18;
    var bx = n.x + n.w - bw - 4, by = n.y + 4;
    chk.appendChild(el("rect", { class: "node__check-box", x: bx, y: by, width: bw, height: bh, rx: 9, ry: 9 }));
    var clabel = el("text", { class: "node__check-label", x: bx + bw / 2, y: by + bh / 2, "text-anchor": "middle", "dominant-baseline": "central" });
    clabel.textContent = "未完了";
    chk.appendChild(clabel);
    chk.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      toggleDone(n.id);
    });
    g.appendChild(chk);

    // hover highlight of prerequisite chain + unlocked chain
    g.addEventListener("mouseenter", function () { highlight(n.id); });
    g.addEventListener("mouseleave", clearHighlight);

    gNodes.appendChild(g);
    nodeEls[n.id] = g;
  });
  svg.appendChild(gNodes);

  // ---- rendering states ------------------------------------------------
  function render() {
    NODES.forEach(function (n) {
      var g = nodeEls[n.id];
      var st = statusOf(n.id);
      g.classList.remove("is-done", "is-available", "is-locked");
      g.classList.add("is-" + st);
      var lbl = g.querySelector(".node__check-label");
      if (lbl) lbl.textContent = (st === "done") ? "完了" : "未完了";
    });
    updateProgress();
  }

  function updateProgress() {
    var total = NODES.length;
    var count = Object.keys(done).length;
    var pct = Math.round((count / total) * 100);
    var fill = document.getElementById("rmap-fill");
    var cnt = document.getElementById("rmap-count");
    if (fill) fill.style.width = pct + "%";
    if (cnt) cnt.textContent = count + " / " + total + " 記事クリア（" + pct + "%）";
  }

  // ---- interactions ----------------------------------------------------
  function highlight(id) {
    svg.classList.add("rmap--hovering");
    var anc = ancestorsOf[id], desc = descendantsOf[id];
    NODES.forEach(function (n) {
      var g = nodeEls[n.id];
      g.classList.remove("is-hover", "is-prereq", "is-unlock");
      if (n.id === id) g.classList.add("is-hover");
      else if (anc[n.id]) g.classList.add("is-prereq");
      else if (desc[n.id]) g.classList.add("is-unlock");
    });
    edgeEls.forEach(function (p) {
      p.classList.remove("is-prereq", "is-unlock");
      var e = p._edge;
      var inAnc = (e.to === id || anc[e.to]) && (e.from === id || anc[e.from]);
      var inDesc = (e.from === id || desc[e.from]) && (e.to === id || desc[e.to]);
      if (inAnc) p.classList.add("is-prereq");
      else if (inDesc) p.classList.add("is-unlock");
    });
  }
  function clearHighlight() {
    svg.classList.remove("rmap--hovering");
    NODES.forEach(function (n) { nodeEls[n.id].classList.remove("is-hover", "is-prereq", "is-unlock"); });
    edgeEls.forEach(function (p) { p.classList.remove("is-prereq", "is-unlock"); });
  }

  function snapshotAvailable() {
    var s = {};
    NODES.forEach(function (n) { if (statusOf(n.id) === "available") s[n.id] = true; });
    return s;
  }

  function toggleDone(id) {
    if (!done[id] && statusOf(id) === "locked") {
      flashLocked(id);
      return;
    }
    var before = snapshotAvailable();
    if (done[id]) delete done[id]; else done[id] = true;
    saveDone();
    render();

    if (done[id]) {
      // celebrate newly unlocked nodes
      var after = snapshotAvailable();
      var newly = Object.keys(after).filter(function (x) { return !before[x]; });
      newly.forEach(function (x) { pulse(x); });

      if (isPhaseComplete(byId[id].phase)) confetti();
    }
  }

  function isPhaseComplete(phase) {
    return NODES.filter(function (n) { return n.phase === phase; })
                .every(function (n) { return done[n.id]; });
  }

  function pulse(id) {
    var box = nodeEls[id];
    box.classList.add("just-unlocked");
    setTimeout(function () { box.classList.remove("just-unlocked"); }, 1900);
  }

  function flashLocked(id) {
    // briefly highlight the missing prerequisites
    highlight(id);
    setTimeout(clearHighlight, 1100);
  }

  // ---- reset button ----------------------------------------------------
  var resetBtn = document.getElementById("rmap-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (!confirm("クリア状況をすべてリセットしますか？")) return;
      done = {};
      saveDone();
      render();
    });
  }

  // ---- confetti --------------------------------------------------------
  function confetti() {
    var colors = ["#4f46e5", "#06b6d4", "#16a34a", "#f59e0b", "#ec4899"];
    for (var i = 0; i < 70; i++) {
      var p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      var dx = (Math.random() * 2 - 1) * 220;
      var dur = 1400 + Math.random() * 1200;
      var rot = (Math.random() * 2 - 1) * 720;
      document.body.appendChild(p);
      p.animate([
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + dx + "px, 105vh) rotate(" + rot + "deg)", opacity: 0.9 }
      ], { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" }).onfinish = function () { this.effect.target.remove(); };
    }
  }

  render();
})();
