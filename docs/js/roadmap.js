// smabo — interactive roadmap / skill-tree (no dependencies)
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var GUIDE_DIR = "docs/guides/";
  var DESIGN_DIR = "docs/architecture/";

  // ---- data ------------------------------------------------------------
  // design: true  → show 設計書 button linking to DESIGN_DIR + id + ".html"
  // ext: true → 別リポジトリの外部ツール（必須）。色を分けて区別する。
  var NODES = [
    { id: "baseparts", file: "base", icon: "🧩", label: "ベースパーツの印刷",        x: 600, y: 0,    w: 140, h: 70, phase: "app",
      tip: "（仮）ロボットの土台となる3Dプリントパーツを用意できます。" },
    { id: "brain",     icon: "🧠", label: "smabo-brain",   x: 600, y: 130, w: 140, h: 70, phase: "brain",
      tip: "（仮）SBC上でPythonプログラムを動かしてロボットを制御できます。" },
    { id: "web",       icon: "🖥️", label: "smabo-web",     x: 600, y: 250, w: 140, h: 70, phase: "brain", ext: true,
      tip: "（仮）設定変更・手動制御・センサ可視化を行うブラウザUI。手動制御などに必要な外部ツールです。" },
    { id: "app",       icon: "📱", label: "スマホアプリ", x: 600, y: 380, w: 140, h: 70, phase: "brain",
      tip: "（仮）スマホからロボットのカメラ映像を確認・操作できます。" },
    { id: "imgproc",   icon: "👁️", label: "画像処理",                x: 810, y: 510, w: 140, h: 70, phase: "brain",
      tip: "（仮）カメラ映像をリアルタイムに解析・物体認識できます。" },
    { id: "esp32",     icon: "🔌", label: "ESP32ソフト",   x: 600, y: 600, w: 140, h: 70, phase: "esp32",
      tip: "（仮）ロボットの基本的な通信・制御ができるようになります。" },
    { id: "hand",      icon: "🤏", label: "ハンド",                  x: 355, y: 740, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホアプリからグリッパーを開閉操作できます。" },
    { id: "neck",      icon: "🔄", label: "首振り",                  x: 535, y: 740, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホのカメラをパン（左右）方向に向けられます。" },
    { id: "mobile",    icon: "🚗", label: "移動ロボット",             x: 695, y: 740, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホアプリでロボットを前後左右に走行させられます。" },
    { id: "arm",       icon: "🦾", label: "ロボットアーム",           x: 845, y: 740, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホアプリでアームを手動操作できます。" },
    { id: "encmobile", icon: "⚙️", label: "エンコーダ付",  x: 695, y: 870, w: 140, h: 70, phase: "esp32",
      tip: "（仮）エンコーダにより精度の高い直進・旋回ができます。" },
    { id: "brainros",  icon: "🤖", label: "brain-ros", x: 995, y: 740, w: 140, h: 70, phase: "brainros",
      tip: "（仮）ROSを使ってセンサーとアクチュエータを統合制御できます。" },
    { id: "nav",       icon: "🗺️", label: "ナビゲーション",           x: 695, y: 1000, w: 140, h: 70, phase: "brainros",
      tip: "（仮）地図を生成して自律的に目的地へ移動できます。" },
    { id: "plan",      icon: "📐", label: "動作計画",                x: 845, y: 1000, w: 140, h: 70, phase: "brainros",
      tip: "（仮）障害物を回避しながらアームや機体を自律動作させられます。" }
  ];

  // node centers (cx = x + w/2):
  //   baseparts/app/brain/web/esp32 = 670
  //   imgproc = 880, hand = 425, neck = 605, mobile/encmobile = 765, arm = 915, brainros = 1065
  //   nav = 765, plan = 915

  var EDGES = [
    { from: "baseparts", to: "brain",     d: "M 670 70 L 670 128" },
    { from: "brain",     to: "web",       d: "M 670 200 L 670 248" },
    { from: "web",       to: "app",       d: "M 670 320 L 670 378" },
    { from: "app",       to: "imgproc",   d: "M 670 450 L 670 468 Q 670 478 680 478 L 870 478 Q 880 478 880 508" },
    { from: "app",       to: "esp32",     d: "M 670 450 L 670 598" },
    { from: "esp32",     to: "hand",      d: "M 670 670 L 670 696 Q 670 706 660 706 L 435 706 Q 425 706 425 716 L 425 738" },
    { from: "esp32",     to: "neck",      d: "M 670 670 L 670 696 Q 670 706 660 706 L 615 706 Q 605 706 605 716 L 605 738" },
    { from: "esp32",     to: "mobile",    d: "M 670 670 L 670 696 Q 670 706 680 706 L 755 706 Q 765 706 765 716 L 765 738" },
    { from: "esp32",     to: "arm",       d: "M 670 670 L 670 696 Q 670 706 680 706 L 905 706 Q 915 706 915 716 L 915 738" },
    { from: "mobile",    to: "encmobile", d: "M 765 810 L 765 868" },
    { from: "esp32",     to: "brainros",  d: "M 670 670 L 670 696 Q 670 706 680 706 L 1055 706 Q 1065 706 1065 716 L 1065 738" },
    { from: "encmobile", to: "nav",       d: "M 765 940 L 765 998" },
    { from: "arm",       to: "plan",      d: "M 915 810 L 915 998" },
    { from: "brainros",  to: "nav",       d: "M 1065 810 L 1065 958 Q 1065 968 1055 968 L 925 968 M 905 968 L 775 968 Q 765 968 765 978 L 765 998", jumps: [{x: 915, y: 968}] },
    { from: "brainros",  to: "plan",      d: "M 1065 810 L 1065 858 Q 1065 868 1055 868 L 925 868 Q 915 868 915 878 L 915 998" }
  ];

  var BANDS = [
    { cls: "app",      top: -24, bot: 110  },
    { cls: "brain",    top: 110, bot: 580  },
    { cls: "esp32",    top: 580, bot: 950  },
    { cls: "brainros", top: 950, bot: 1095 }
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

  // ---- build the SVG (one instance per .rmap-svg element on the page) ---
  function buildRoadmap(svg, idx) {
  var guideDir = GUIDE_DIR, designDir = DESIGN_DIR;
  if (svg.hasAttribute("data-guide-dir")) guideDir = svg.getAttribute("data-guide-dir");
  if (svg.hasAttribute("data-design-dir")) designDir = svg.getAttribute("data-design-dir");
  var markerId = "rmap-arrow-" + idx;
  var nodeEls = {}, edgeEls = [];

  function el(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // arrow marker (uses context-stroke so head matches the line colour)
  var defs = el("defs", {});
  var marker = el("marker", {
    id: markerId, viewBox: "0 0 10 10", refX: "8", refY: "5",
    markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse"
  });
  marker.appendChild(el("path", { d: "M 0 1 L 9 5 L 0 9 z", class: "edge-arrow" }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  // bands (background)
  var gBands = el("g", {});
  BANDS.forEach(function (b) {
    gBands.appendChild(el("rect", { class: "band band--" + b.cls, x: -10, y: b.top, width: 1450, height: b.bot - b.top }));
  });
  svg.appendChild(gBands);

  // edges
  var gEdges = el("g", {});
  EDGES.forEach(function (e) {
    if (e.logical) return;
    var p = el("path", { class: "edge", d: e.d, "marker-end": "url(#" + markerId + ")" });
    p._edge = e;
    gEdges.appendChild(p);
    edgeEls.push(p);
  });
  svg.appendChild(gEdges);

  // jump crossings – white gap then colored arc, rendered over all edges
  var gJumps = el("g", {});
  EDGES.forEach(function (e) {
    if (!e.jumps) return;
    e.jumps.forEach(function (j) {
      var r = j.r || 10, mx = j.x, my = j.y;
      // horizontal white mask: erases the "over" line gap so endpoints meet the arc cleanly
      gJumps.appendChild(el("path", {
        d: "M " + (mx + r) + " " + my + " L " + (mx - r) + " " + my,
        fill: "none", stroke: "#fff", "stroke-width": 10,
      }));
      // vertical white mask: erases the "under" line(s) at the crossing
      gJumps.appendChild(el("path", {
        d: "M " + mx + " " + (my - r - 1) + " L " + mx + " " + (my + r + 1),
        fill: "none", stroke: "#fff", "stroke-width": 10,
      }));
      // colored arc bridging the gap
      var arc = el("path", { class: "edge",
        d: "M " + (mx + r) + " " + my + " A " + r + " " + r + " 0 0 0 " + (mx - r) + " " + my });
      arc._edge = e;
      edgeEls.push(arc);
      gJumps.appendChild(arc);
    });
  });
  svg.appendChild(gJumps);

  // nodes
  var gNodes = el("g", {});
  NODES.forEach(function (n) {
    var cx = n.x + n.w / 2;
    var g = el("g", { class: n.ext ? "node is-ext" : "node", "data-id": n.id });

    var link = el("a", {});

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
      designA.setAttributeNS("http://www.w3.org/1999/xlink", "href", designDir + n.id + ".html");
      designA.setAttribute("href", designDir + n.id + ".html");
      designA.appendChild(el("rect", { class: "node__design-box", x: dx, y: dy, width: dw, height: dh, rx: 9, ry: 9 }));
      var dlbl = el("text", { class: "node__design-label", x: dx + dw / 2, y: dy + dh / 2, "text-anchor": "middle", "dominant-baseline": "central" });
      dlbl.textContent = "設計書";
      designA.appendChild(dlbl);
      designA.addEventListener("click", function (ev) { ev.stopPropagation(); });
      g.appendChild(designA);
    }

    g.addEventListener("mouseenter", (function (node, gEl) {
      return function () { highlight(node.id); showTooltip(node, gEl, false); };
    })(n, g));
    g.addEventListener("mouseleave", function () {
      hideTooltip();
    });
    g.addEventListener("touchend", (function (node, gEl) {
      return function (ev) {
        ev.preventDefault();
        if (activeNode === node.id) {
          activeNode = null;
          clearHighlight();
          hideTooltipImmediate();
        } else {
          activeNode = node.id;
          highlight(node.id);
          showTooltip(node, gEl, true);
        }
      };
    })(n, g));

    gNodes.appendChild(g);
    nodeEls[n.id] = g;
  });
  svg.appendChild(gNodes);

  // ---- tooltip ---------------------------------------------------------
  var activeNode  = null;
  var tooltip     = document.getElementById("rmap-tooltip");
  var tipBody       = tooltip && tooltip.querySelector(".rmap-tooltip__body");
  var tipImg        = tooltip && tooltip.querySelector(".rmap-tooltip__img");
  var tipLink       = tooltip && tooltip.querySelector(".rmap-tooltip__link:not(.rmap-tooltip__link--design)");
  var tipDesignLink = tooltip && tooltip.querySelector(".rmap-tooltip__link--design");

  var hideTimer = null;

  function showTooltip(n, nodeEl, lock) {
    clearTimeout(hideTimer);
    if (!tooltip || !n.tip) return;
    tipBody.textContent = n.tip;
    if (tipLink) tipLink.href = guideDir + (n.file || n.id) + ".html";
    if (lock) svg.classList.add("has-tooltip");
    else svg.classList.remove("has-tooltip");
    if (tipDesignLink) {
      if (n.design) {
        tipDesignLink.href = designDir + n.id + ".html";
        tipDesignLink.hidden = false;
      } else {
        tipDesignLink.hidden = true;
      }
    }
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
    var vw  = window.innerWidth;
    var vh  = window.innerHeight;
    var left, top;
    if (r.right + gap + tw <= vw - 8) {
      left = r.right + gap;
    } else if (r.left - gap - tw >= 8) {
      left = r.left - tw - gap;
    } else {
      left = Math.max(8, (vw - tw) / 2);
    }
    top = r.top + (r.height - th) / 2;
    top = Math.max(8, Math.min(top, vh - th - 8));
    tooltip.style.left = left + "px";
    tooltip.style.top  = top  + "px";
  }
  function hideTooltip() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (tooltip) tooltip.hidden = true;
      svg.classList.remove("has-tooltip");
      clearHighlight();
      if (initialActive && byId[initialActive]) highlight(initialActive);
    }, 120);
  }
  function hideTooltipImmediate() {
    clearTimeout(hideTimer);
    if (tooltip) tooltip.hidden = true;
    svg.classList.remove("has-tooltip");
    clearHighlight();
    if (initialActive && byId[initialActive]) highlight(initialActive);
  }

  if (tooltip) {
    tooltip.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    tooltip.addEventListener("mouseleave", function () { if (!isDragging) hideTooltip(); });

    var isDragging = false, justDragged = false, dragOffX = 0, dragOffY = 0;

    function startDrag(clientX, clientY) {
      isDragging = true;
      var rect = tooltip.getBoundingClientRect();
      dragOffX = clientX - rect.left;
      dragOffY = clientY - rect.top;
      tooltip.classList.add("is-dragging");
    }
    function moveDrag(clientX, clientY) {
      if (!isDragging) return;
      var left = clientX - dragOffX;
      var top  = clientY - dragOffY;
      left = Math.max(8, Math.min(left, window.innerWidth  - tooltip.offsetWidth  - 8));
      top  = Math.max(8, Math.min(top,  window.innerHeight - tooltip.offsetHeight - 8));
      tooltip.style.left = left + "px";
      tooltip.style.top  = top  + "px";
    }
    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      tooltip.classList.remove("is-dragging");
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 0);
    }

    tooltip.addEventListener("mousedown", function (ev) {
      if (ev.target.closest("a")) return;
      startDrag(ev.clientX, ev.clientY);
      ev.preventDefault();
    });
    document.addEventListener("mousemove", function (ev) { moveDrag(ev.clientX, ev.clientY); });
    document.addEventListener("mouseup", endDrag);

    tooltip.addEventListener("touchstart", function (ev) {
      if (ev.target.closest("a")) return;
      startDrag(ev.touches[0].clientX, ev.touches[0].clientY);
      ev.stopPropagation();
    }, { passive: true });
    document.addEventListener("touchmove", function (ev) {
      if (!isDragging) return;
      ev.preventDefault();
      moveDrag(ev.touches[0].clientX, ev.touches[0].clientY);
    }, { passive: false });
    document.addEventListener("touchend", function (ev) {
      if (!isDragging) return;
      endDrag();
      ev.preventDefault();
    });
  }

  document.addEventListener("click", function (ev) {
    if (justDragged) return;
    // keep the popup when clicking a node (or the popup itself); only dismiss
    // when clicking outside any node (empty space / elsewhere on the page).
    if (ev.target && ev.target.closest &&
        (ev.target.closest(".node") || ev.target.closest("#rmap-tooltip"))) return;
    activeNode = null;
    hideTooltipImmediate();
  });

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

  // ---- initial highlight (guide pages set data-active to their node) ----
  var initialActive = svg.getAttribute("data-active");
  if (initialActive && byId[initialActive]) {
    activeNode = initialActive;
    highlight(initialActive);
  }
  } // ---- end buildRoadmap ----

  var rmapSvgs = document.querySelectorAll(".rmap-svg");
  for (var rmapI = 0; rmapI < rmapSvgs.length; rmapI++) buildRoadmap(rmapSvgs[rmapI], rmapI);
})();
