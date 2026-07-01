/* sysmap.js — interactive system-architecture diagram.
 *
 * Each page specifies active flows + labels via data-flows (JSON array).
 * Only those flows are highlighted; others are dimmed with no label.
 * Transport colours: ws=blue, webrtc=amber, rest=green  (matches drawio reference).
 *
 * Embed:
 *   <svg class="sys-svg" viewBox="0 0 1200 480"
 *        data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]}]'>
 *   </svg>
 *
 * data-flows keys: from/to = node id (app|brain|esp32|web), transport = ws|webrtc|rest
 */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---- layout (viewBox 0 0 1200 480) ------------------------------------ */
  var CONTAINERS = [
    { label: "外部ツール", members: ["web"],
      x: 466, y: 16,  w: 278, h: 190 },
    { label: "smabo本体",  members: ["app", "brain", "esp32"],
      x: 28,  y: 298, w: 1144, h: 200, lblBottom: true },
  ];

  var NODES = [
    { id: "web",   icon: "🖥️", label: "smabo-web",   sub: "PC",             x: 493, y: 60,  w: 224, h: 120 },
    { id: "app",   icon: "📱", label: "smabo-app",   sub: "スマートフォン", x: 66,  y: 332, w: 224, h: 120 },
    { id: "brain", icon: "🧠", label: "smabo-brain", sub: "SBC or PC",      x: 493, y: 332, w: 224, h: 120 },
    { id: "esp32", icon: "🔌", label: "smabo-esp32", sub: "ESP32",          x: 924, y: 332, w: 224, h: 120 },
  ];

  /* Geometry only — labels come from data-flows at runtime.
   * label = [x, refY, text-anchor, valign("above"|"below"|"mid")]          */
  var FLOWS = [
    { from: "app",   to: "brain", transport: "webrtc",
      pts: [[290, 352], [493, 352]], label: [295, 352, "start", "above"] },

    { from: "app",   to: "brain", transport: "ws",
      pts: [[290, 383], [493, 383]], label: [295, 357, "start", "below"] },

    { from: "brain", to: "app",   transport: "ws",
      pts: [[493, 435], [290, 435]], label: [488, 435, "end", "above"] },

    { from: "brain", to: "esp32", transport: "ws",
      pts: [[717, 365], [924, 365]], label: [722, 340, "start", "below"] },

    { from: "esp32", to: "brain", transport: "ws",
      pts: [[924, 420], [717, 420]], label: [919, 420, "end", "above"] },

    { from: "web",   to: "brain", transport: "ws",
      pts: [[520, 180], [520, 332]], label: [520, 225, "start", "mid"] },

    { from: "brain",   to: "web", transport: "webrtc",
      pts: [[620, 332], [620, 180]], label: [620, 290, "start", "mid"] },

    { from: "brain", to: "web",   transport: "ws",
      pts: [[685, 332], [685, 180]], label: [685, 290, "start", "mid"] },

    { from: "web",   to: "esp32", transport: "rest",
      pts: [[717, 122], [1040, 122], [1040, 332]], label: [750, 110, "start", "mid"] },
  ];

  /* ---- SVG helpers ------------------------------------------------------- */
  function el(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function text(x, y, str, cls, anchor) {
    var t = el("text", { x: x, y: y, class: cls });
    if (anchor) t.setAttribute("text-anchor", anchor);
    t.textContent = str;
    return t;
  }
  function arrowMarker(id, cls) {
    var mk = el("marker", { id: id, viewBox: "0 0 10 10", refX: 9, refY: 5,
      markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
    mk.appendChild(el("path", { d: "M 0 0 L 10 5 L 0 10 z", class: cls }));
    return mk;
  }

  /* ---- main build -------------------------------------------------------- */
  function build(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    /* parse data-flows */
    var activeFlows = [];
    try { activeFlows = JSON.parse(svg.getAttribute("data-flows") || "[]"); } catch(e) {}

    /* parse data-active (comma-separated node IDs for node-only highlight) */
    var hi = {};
    (svg.getAttribute("data-active") || "").split(",").forEach(function (s) {
      s = s.trim(); if (s) hi[s] = true;
    });

    /* highlighted nodes = data-active + endpoints of all active flows */
    activeFlows.forEach(function (af) { hi[af.from] = true; hi[af.to] = true; });

    var anyActive = activeFlows.length > 0 || Object.keys(hi).length > 0;

    /* match FLOWS geometry entries against active flow specs */
    FLOWS.forEach(function (f) {
      var match = null;
      for (var i = 0; i < activeFlows.length; i++) {
        var af = activeFlows[i];
        if (af.from === f.from && af.to === f.to && af.transport === f.transport) {
          match = af; break;
        }
      }
      f._on    = !!match;
      f._lines = match ? match.lines : null;
    });

    /* defs: arrow markers */
    var defs = el("defs");
    defs.appendChild(arrowMarker("sys-arrow-dim",    "sys-arrow sys-arrow--dim"));
    defs.appendChild(arrowMarker("sys-arrow-ws",     "sys-arrow sys-arrow--ws"));
    defs.appendChild(arrowMarker("sys-arrow-webrtc", "sys-arrow sys-arrow--webrtc"));
    defs.appendChild(arrowMarker("sys-arrow-rest",   "sys-arrow sys-arrow--rest"));
    svg.appendChild(defs);

    /* containers */
    var gC = el("g");
    CONTAINERS.forEach(function (c) {
      var on = c.members.some(function (m) { return hi[m]; });
      var g = el("g", { class: "sys-cont" + (on ? " is-active" : "") });
      g.appendChild(el("rect", { class: "sys-container " + (c.lblBottom ? "sys-container--body" : "sys-container--ext"),
        x: c.x, y: c.y, width: c.w, height: c.h, rx: 20, ry: 20 }));
      var lx = c.x + c.w / 2;
      var ly = c.lblBottom ? c.y + c.h - 14 : c.y + 24;
      g.appendChild(text(lx, ly, c.label, "sys-container__label" + (c.lblBottom ? " sys-container__label--body" : ""), "middle"));
      gC.appendChild(g);
    });
    svg.appendChild(gC);

    /* edges */
    var gE = el("g");
    FLOWS.forEach(function (f) {
      var d = "M " + f.pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L ");
      var mkId = f._on ? ("sys-arrow-" + f.transport) : "sys-arrow-dim";
      gE.appendChild(el("path", {
        class: "sys-edge sys-edge--" + f.transport + (f._on ? " is-flow" : ""),
        d: d, fill: "none", "marker-end": "url(#" + mkId + ")" }));
      if (f._on && f._lines) gE.appendChild(flowLabel(f));
    });
    svg.appendChild(gE);

    /* nodes */
    var gN = el("g");
    NODES.forEach(function (n) {
      var on = hi[n.id], cx = n.x + n.w / 2, cy = n.y + n.h / 2;
      var g = el("g", { class: "sys-node" + (anyActive ? (on ? " is-active" : " is-dim") : "") });
      g.appendChild(el("rect", { class: "sys-node__box", x: n.x, y: n.y, width: n.w, height: n.h, rx: 14, ry: 14 }));
      g.appendChild(text(cx, cy - 6,  n.icon + "  " + n.label, "sys-node__label", "middle"));
      g.appendChild(text(cx, cy + 16, n.sub,                   "sys-node__sub",   "middle"));
      gN.appendChild(g);
    });
    svg.appendChild(gN);

    svg.appendChild(legend());
  }

  /* ---- label on active arrow -------------------------------------------- */
  function flowLabel(f) {
    var lines = f._lines;
    var x = f.label[0], ry = f.label[1], valign = f.label[3];
    var lh = 17, gap = 8;

    var firstPt = f.pts[0];
    var lastPt  = f.pts[f.pts.length - 1];
    var dx = lastPt[0] - firstPt[0];
    var dy = lastPt[1] - firstPt[1];

    var g = el("g", { class: "sys-flabel sys-flabel--" + f.transport + " is-on" });

    if (Math.abs(dy) > Math.abs(dx)) {
      /* 縦方向: x 中央揃え、向きで積む方向を決定 */
      var n = lines.length;
      if (dy >= 0) {
        /* 上から下: 上揃え（ry）、下へ積む */
        lines.forEach(function (s, i) {
          g.appendChild(text(x, ry + i * lh, s, "sys-flabel__item", "middle"));
        });
      } else {
        /* 下から上: 下揃え（ry）、上へ積む */
        lines.forEach(function (s, i) {
          g.appendChild(text(x, ry - (n - 1 - i) * lh, s, "sys-flabel__item", "middle"));
        });
      }
    } else {
      /* 横方向: 向きで left/right 揃えを決定、「・」で繋げて1行にする */
      var anchor = dx >= 0 ? "start" : "end";
      var y = valign === "above" ? ry - gap : ry + gap + 10;
      g.appendChild(text(x, y, lines.join("・"), "sys-flabel__item", anchor));
    }

    return g;
  }

  /* ---- transport legend (top-right) -------------------------------------- */
  function legend() {
    var g  = el("g", { class: "sys-legend" });
    var x0 = 1050, y0 = 28;
    g.appendChild(text(x0, y0 - 16, "凡例（通信方式）", "sys-legend__title", "start"));
    [
      ["ws",     "WebSocket"],
      ["webrtc", "WebRTC"],
      ["rest",   "REST API"],
    ].forEach(function (row, i) {
      var ly = y0 + i * 24;
      g.appendChild(el("line", { class: "sys-legend__line sys-legend__line--" + row[0],
        x1: x0, y1: ly, x2: x0 + 32, y2: ly }));
      g.appendChild(text(x0 + 42, ly + 4, row[1], "sys-legend__label", "start"));
    });
    return g;
  }

  /* ---- init -------------------------------------------------------------- */
  function init() {
    var svgs = document.querySelectorAll(".sys-svg");
    for (var i = 0; i < svgs.length; i++) build(svgs[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
