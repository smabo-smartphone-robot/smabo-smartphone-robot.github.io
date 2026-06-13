// smabo — interactive roadmap / skill-tree (no dependencies)
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var GUIDE_DIR = "docs/guides/";
  var DESIGN_DIR = "docs/architecture/";

  // ---- data ------------------------------------------------------------
  // design: true  → show 設計書 button linking to DESIGN_DIR + id + ".html"
  var NODES = [
    { id: "baseparts", icon: "🧩", label: "ベースパーツの印刷",        x: 620, y: 0,   w: 140, h: 70, phase: "app",
      tip: "（仮）ロボットの土台となる3Dプリントパーツを用意できます。" },
    { id: "app",       icon: "📱", label: "スマホアプリ", sub: "インストール・概要", x: 620, y: 110, w: 140, h: 70, phase: "app",
      tip: "（仮）スマホからロボットのカメラ映像を確認・操作できます。" },
    { id: "esp32",     icon: "🔌", label: "ESP32ソフト", sub: "書き込み・概要",   x: 620, y: 210, w: 140, h: 70, phase: "esp32",
      tip: "（仮）ロボットの基本的な通信・制御ができるようになります。" },
    { id: "hand",      icon: "🤏", label: "ハンド",                  x: 300, y: 360, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホアプリからグリッパーを開閉操作できます。" },
    { id: "neck",      icon: "🔄", label: "首振り",                  x: 460, y: 360, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホのカメラをパン・チルトで向きを変えられます。" },
    { id: "mobile",    icon: "🚗", label: "移動ロボット",             x: 620, y: 360, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホアプリでロボットを前後左右に走行させられます。" },
    { id: "arm",       icon: "🦾", label: "ロボットアーム",           x: 780, y: 360, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホアプリでアームを手動操作できます。" },
    { id: "encmobile", icon: "⚙️", label: "エンコーダ付", sub: "移動ロボット",  x: 620, y: 470, w: 140, h: 70, phase: "esp32",
      tip: "（仮）エンコーダにより精度の高い直進・旋回ができます。" },
    { id: "brain",     icon: "🧠", label: "brain", sub: "セットアップ・概要",   x: 920, y: 570, w: 140, h: 70, phase: "brain",
      tip: "（仮）SBC上でPythonプログラムを動かしてロボットを制御できます。" },
    { id: "imgproc",   icon: "👁️", label: "画像処理",                x: 920, y: 680, w: 140, h: 70, phase: "brain",
      tip: "（仮）カメラ映像をリアルタイムに解析・物体認識できます。" },
    { id: "brainros",  icon: "🤖", label: "brain-ros", sub: "セットアップ・概要", x: 1090, y: 800, w: 140, h: 70, phase: "brainros",
      tip: "（仮）ROSを使ってセンサーとアクチュエータを統合制御できます。" },
    { id: "nav",       icon: "🗺️", label: "ナビゲーション",           x: 620, y: 960, w: 140, h: 70, phase: "brainros",
      tip: "（仮）地図を生成して自律的に目的地へ移動できます。" },
    { id: "plan",      icon: "📐", label: "動作計画",                x: 780, y: 960, w: 140, h: 70, phase: "brainros",
      tip: "（仮）障害物を回避しながらアームや機体を自律動作させられます。" }
  ];

  // node centers (cx = x + w/2):
  //   baseparts/app/esp32/mobile/encmobile/nav = 690
  //   hand = 370, neck = 530, arm = 850
  //   brain/imgproc = 990, brainros = 1160, plan = 850

  var EDGES = [
    { from: "baseparts", to: "app",       d: "M 690 70 L 690 108" },
    { from: "app",       to: "esp32",     d: "M 690 180 L 690 208" },
    { from: "esp32",     to: "hand",      d: "M 690 280 L 690 315 Q 690 328 680 328 L 380 328 Q 370 328 370 338 L 370 358" },
    { from: "esp32",     to: "neck",      d: "M 690 280 L 690 315 Q 690 328 680 328 L 540 328 Q 530 328 530 338 L 530 358" },
    { from: "esp32",     to: "mobile",    d: "M 690 280 L 690 358" },
    { from: "esp32",     to: "arm",       d: "M 690 280 L 690 315 Q 690 328 700 328 L 840 328 Q 850 328 850 338 L 850 358" },
    { from: "esp32",     to: "brain",     d: "M 690 280 L 690 315 Q 690 328 700 328 L 980 328 Q 990 328 990 338 L 990 568" },
    { from: "mobile",    to: "encmobile", d: "M 690 430 L 690 468" },
    { from: "brain",     to: "imgproc",   d: "M 990 640 L 990 678" },
    { from: "brain",     to: "brainros",  d: "M 990 640 L 990 652 Q 990 662 1000 662 L 1150 662 Q 1160 662 1160 672 L 1160 798" },
    { from: "encmobile", to: "nav",       d: "M 690 540 L 690 958" },
    { from: "arm",       to: "plan",      d: "M 850 430 L 850 958" },
    { from: "brainros",  to: "plan",      d: "M 1160 870 L 1160 900 Q 1160 912 1150 912 L 860 912 Q 850 912 850 922 L 850 958" },
    { from: "brainros",  to: "nav",       d: "M 1160 870 L 1160 900 Q 1160 912 1150 912 L 858 912 C 858 888 822 888 822 912 L 700 912 Q 690 912 690 922 L 690 958" }
  ];

  var BANDS = [
    { cls: "app",      top: -16, bot: 185,  label: "STEP 1",  req: "smabo-app" },
    { cls: "esp32",    top: 185, bot: 555,  label: "STEP 2",  req: "+ smabo-esp32" },
    { cls: "brain",    top: 555, bot: 775,  label: "STEP 3",  req: "+ smabo-brain" },
    { cls: "brainros", top: 775, bot: 1045, label: "STEP 4",  req: "+ smabo-brain-ros" }
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
    gBands.appendChild(el("rect", { class: "band band--" + b.cls, x: -10, y: b.top, width: 1450, height: b.bot - b.top }));
    if (b.top > 0) gBands.appendChild(el("line", { class: "band-sep", x1: -10, y1: b.top, x2: 1440, y2: b.top }));
    var t = el("text", { class: "band-label band-label--" + b.cls, x: 175, y: b.top + 44 });
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

    var icon = el("text", { class: "node__icon", x: cx, y: n.y + 24, "text-anchor": "middle" });
    icon.textContent = n.icon;
    link.appendChild(icon);

    var labelY = n.sub ? n.y + 44 : n.y + 46;
    var label = el("text", { class: "node__label", x: cx, y: labelY, "text-anchor": "middle" });
    label.textContent = n.label;
    link.appendChild(label);
    if (n.sub) {
      var sub = el("text", { class: "node__sub", x: cx, y: n.y + 58, "text-anchor": "middle" });
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

    g.addEventListener("mouseenter", function () { highlight(n.id); showTooltip(n, g); });
    g.addEventListener("mouseleave", function () { clearHighlight(); hideTooltip(); });

    gNodes.appendChild(g);
    nodeEls[n.id] = g;
  });
  svg.appendChild(gNodes);

  // ---- tooltip ---------------------------------------------------------
  var tooltip     = document.getElementById("rmap-tooltip");
  var tipBody     = tooltip && tooltip.querySelector(".rmap-tooltip__body");
  var tipImg      = tooltip && tooltip.querySelector(".rmap-tooltip__img");

  function showTooltip(n, nodeEl) {
    if (!tooltip || !n.tip) return;
    tipBody.textContent = n.tip;
    if (n.tipImg && tipImg) {
      tipImg.src = n.tipImg;
      tipImg.hidden = false;
    } else if (tipImg) {
      tipImg.hidden = true;
    }
    tooltip.hidden = false;
    var r   = nodeEl.getBoundingClientRect();
    var tw  = tooltip.offsetWidth;
    var th  = tooltip.offsetHeight;
    var gap = 14;
    var left = r.right + gap;
    if (left + tw > window.innerWidth - 8) left = r.left - tw - gap;
    var top = r.top + (r.height - th) / 2;
    top = Math.max(8, Math.min(top, window.innerHeight - th - 8));
    tooltip.style.left = left + "px";
    tooltip.style.top  = top  + "px";
  }
  function hideTooltip() {
    if (tooltip) tooltip.hidden = true;
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
})();
