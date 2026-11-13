/* sysmap.js — interactive system-architecture diagram.
 *
 * Each page specifies active flows + labels via data-flows (JSON array).
 * Only those flows are highlighted; others are dimmed with no label.
 * Transport colours: ws=blue, webrtc=amber, rest=green  (matches drawio reference).
 *
 * Embed:
 *   <svg class="sys-svg" viewBox="0 0 1200 520"
 *        data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]}]'>
 *   </svg>
 *
 * data-flows keys: from/to = node id (app|brain|esp32|web), transport = ws|webrtc|rest
 *
 * REST (settings) goes through the brain: smabo-web sends it to the brain's
 * /devices/esp32/… or /devices/app/… with its Bearer token, and the brain
 * passes it on to the device with the relay key (X-Smabo-Relay-Key). A paired
 * device refuses REST from anyone else. So a page's
 *   {"from":"web","to":"esp32","transport":"rest", ...}
 * is drawn as web → brain → esp32 (and web → app likewise), with the label on
 * both legs. (Only a brain started with --no-auth lets the web
 * talk to the devices directly; the diagram shows the normal, paired setup.)
 */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---- layout (viewBox 0 0 1200 520) ------------------------------------ */
  var CONTAINERS = [
    { label: "外部ツール", labelEn: "External Tool", members: ["web"],
      x: 403, y: 16,  w: 394, h: 190 },
    { label: "smabo本体",  labelEn: "smabo body", members: ["app", "brain", "esp32"],
      x: 28,  y: 298, w: 1144, h: 200, lblBottom: true },
  ];

  var NODES = [
    { id: "web",   icon: "🖥️", label: "smabo-web",   sub: "PC",             x: 430, y: 60,  w: 340, h: 120 },
    { id: "app",   icon: "📱", label: "smabo-app",   sub: "スマートフォン", subEn: "Smartphone", x: 46,  y: 332, w: 210, h: 120 },
    { id: "brain", icon: "🧠", label: "smabo-brain", sub: "SBC or PC",      x: 430, y: 332, w: 340, h: 120 },
    { id: "esp32", icon: "🔌", label: "smabo-esp32", sub: "ESP32",          x: 944, y: 332, w: 210, h: 120 },
  ];

  /* Geometry only — labels come from data-flows at runtime.
   * Arrows between the same two boxes are evenly spaced (28 px across,
   * 100 px down) and every label sits in its own free space:
   *   horizontal: label = [x, lineY, anchor]      one line just above the arrow
   *   vertical:   label = [x, refY, anchor, "top"|"bottom", maxWidth]
   *               a stack of lines in the gap between the two containers
   *               (y 206–298), wrapped to maxWidth so it never reaches the
   *               next arrow; "top" stacks down from refY, "bottom" up,
   *               "middle" centres the stack on (x, refY) — on the arrow
   *               itself, over a white halo (web ⇄ brain arrows).          */
  var FLOWS = [
    /* smabo-app ⇄ smabo-brain (y 350 / 378 / 406 / 434) */
    { from: "app",   to: "brain", transport: "webrtc",
      pts: [[256, 350], [430, 350]], label: [262, 350, "start"] },

    { from: "app",   to: "brain", transport: "ws",
      pts: [[256, 378], [430, 378]], label: [262, 378, "start"] },

    { from: "brain", to: "app",   transport: "rest",
      pts: [[430, 406], [256, 406]], label: [424, 406, "end"] },

    { from: "brain", to: "app",   transport: "ws",
      pts: [[430, 434], [256, 434]], label: [424, 434, "end"] },

    /* smabo-brain ⇄ smabo-esp32 (y 364 / 392 / 420) */
    { from: "brain", to: "esp32", transport: "ws",
      pts: [[770, 364], [944, 364]], label: [776, 364, "start"] },

    { from: "brain", to: "esp32", transport: "rest",
      pts: [[770, 392], [944, 392]], label: [776, 392, "start"] },

    { from: "esp32", to: "brain", transport: "ws",
      pts: [[944, 420], [770, 420]], label: [938, 420, "end"] },

    /* smabo-web ⇄ smabo-brain (x 450 / 550 / 650 / 750) */
    { from: "web",   to: "brain", transport: "ws",
      pts: [[450, 180], [450, 332]], label: [450, 256, "middle", "middle", 92] },

    { from: "web",   to: "brain", transport: "rest",
      pts: [[550, 180], [550, 332]], label: [550, 256, "middle", "middle", 92] },

    { from: "brain", to: "web",   transport: "webrtc",
      pts: [[650, 332], [650, 180]], label: [650, 256, "middle", "middle", 92] },

    { from: "brain", to: "web",   transport: "ws",
      pts: [[750, 332], [750, 180]], label: [750, 256, "middle", "middle", 92] },
  ];

  /* A flow drawn as several legs: [from, to, transport]; every leg is labelled. */
  var ROUTES = {
    "web>esp32>rest": [["web", "brain", "rest"], ["brain", "esp32", "rest"]],
    "web>app>rest":   [["web", "brain", "rest"], ["brain", "app",   "rest"]],
  };

  /* data-flows entries → one entry per drawn leg (same leg twice: lines merged). */
  function expandFlows(specs) {
    var out = [];
    function add(from, to, transport, lines) {
      for (var i = 0; i < out.length; i++) {
        var o = out[i];
        if (o.from === from && o.to === to && o.transport === transport) {
          (lines || []).forEach(function (s) { if (o.lines.indexOf(s) < 0) o.lines.push(s); });
          return;
        }
      }
      out.push({ from: from, to: to, transport: transport, lines: (lines || []).slice() });
    }
    specs.forEach(function (af) {
      var legs = ROUTES[af.from + ">" + af.to + ">" + af.transport];
      if (!legs) { add(af.from, af.to, af.transport, af.lines); return; }
      legs.forEach(function (l) { add(l[0], l[1], l[2], af.lines); });
    });
    return out;
  }

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
    var isEn = window.location.pathname.indexOf('/en/') !== -1;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    /* parse data-flows */
    var activeFlows = [];
    try { activeFlows = JSON.parse(svg.getAttribute("data-flows") || "[]"); } catch(e) {}
    if (!Array.isArray(activeFlows)) activeFlows = [];
    activeFlows = expandFlows(activeFlows);

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
      f._lines = match && match.lines.length ? match.lines : null;
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
      var clabel = isEn && c.labelEn ? c.labelEn : c.label;
      g.appendChild(text(lx, ly, clabel, "sys-container__label" + (c.lblBottom ? " sys-container__label--body" : ""), "middle"));
      gC.appendChild(g);
    });
    svg.appendChild(gC);

    /* edges (all lines first, then the labels, so no line crosses a label) */
    var gE = el("g"), gL = el("g");
    FLOWS.forEach(function (f) {
      var d = "M " + f.pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L ");
      var mkId = f._on ? ("sys-arrow-" + f.transport) : "sys-arrow-dim";
      gE.appendChild(el("path", {
        class: "sys-edge sys-edge--" + f.transport + (f._on ? " is-flow" : ""),
        d: d, fill: "none", "marker-end": "url(#" + mkId + ")" }));
      if (f._on && f._lines) gL.appendChild(flowLabel(f));
    });
    svg.appendChild(gE);

    /* nodes */
    var gN = el("g");
    NODES.forEach(function (n) {
      var on = hi[n.id], cx = n.x + n.w / 2, cy = n.y + n.h / 2;
      var g = el("g", { class: "sys-node" + (anyActive ? (on ? " is-active" : " is-dim") : "") });
      g.appendChild(el("rect", { class: "sys-node__box", x: n.x, y: n.y, width: n.w, height: n.h, rx: 14, ry: 14 }));
      g.appendChild(text(cx, cy - 6,  n.icon + "  " + n.label, "sys-node__label", "middle"));
      g.appendChild(text(cx, cy + 16, (isEn && n.subEn ? n.subEn : n.sub), "sys-node__sub", "middle"));
      gN.appendChild(g);
    });
    svg.appendChild(gN);
    svg.appendChild(gL);

    svg.appendChild(legend(isEn));
  }

  /* ---- label on active arrow -------------------------------------------- */
  var LINE_H = 17;

  /* Rough width of 13px bold text: CJK ≈ 1em, latin ≈ 0.58em. */
  function textWidth(str) {
    var w = 0;
    for (var i = 0; i < str.length; i++) w += str.charCodeAt(i) > 0x2e80 ? 13 : 7.6;
    return w;
  }

  /* Break one item into lines no wider than maxW, at spaces or between
   * CJK characters (a latin word such as "esp32" is never split).        */
  function wrap(str, maxW) {
    if (textWidth(str) <= maxW) return [str];
    var tokens = str.match(/[\x21-\x7e]+|\s+|[^\x00-\x7f]/g) || [str];
    var out = [], cur = "";
    tokens.forEach(function (t) {
      var next = cur + t;
      if (cur && textWidth(next.trim()) > maxW) {
        out.push(cur.trim());
        cur = /^\s+$/.test(t) ? "" : t;
      } else {
        cur = next;
      }
    });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  function flowLabel(f) {
    var x = f.label[0], ry = f.label[1], anchor = f.label[2];
    /* labels inside a container sit on its fill, not on the page */
    var inside = CONTAINERS.some(function (c) {
      return x > c.x && x < c.x + c.w && ry > c.y && ry < c.y + c.h;
    });
    var g = el("g", { class: "sys-flabel sys-flabel--" + f.transport + " is-on" + (inside ? " sys-flabel--in" : "") });

    if (f.label.length > 3) {
      /* vertical arrow: stack the items (wrapped) beside the arrow */
      var rows = [];
      f._lines.forEach(function (s) { rows = rows.concat(wrap(s, f.label[4])); });
      var top = f.label[3] === "top" ? ry
              : f.label[3] === "bottom" ? ry - (rows.length - 1) * LINE_H
              : ry + 4.5 - (rows.length - 1) * LINE_H / 2;   /* "middle": centred on the arrow */
      rows.forEach(function (s, i) {
        g.appendChild(text(x, top + i * LINE_H, s, "sys-flabel__item", anchor));
      });
    } else {
      /* horizontal arrow: one line just above it */
      g.appendChild(text(x, ry - 8, f._lines.join("・"), "sys-flabel__item", anchor));
    }
    return g;
  }

  /* ---- transport legend (top-right) -------------------------------------- */
  function legend(isEn) {
    var g  = el("g", { class: "sys-legend" });
    var x0 = 1050, y0 = 28;
    g.appendChild(text(x0, y0 - 16, isEn ? "Legend (Transport)" : "凡例（通信方式）", "sys-legend__title", "start"));
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

  window.sysmapBuild = build;
})();
