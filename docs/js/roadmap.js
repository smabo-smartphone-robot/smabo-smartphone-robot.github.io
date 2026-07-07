// smabo — interactive roadmap / skill-tree (no dependencies)
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var GUIDE_DIR = "docs/guides/";

  // ---- data ------------------------------------------------------------
  // ext: true → 別リポジトリの外部ツール（必須）。色を分けて区別する。
  var NODES = [
    { id: "brain",     file: "smabo-brain", icon: "🧠", label: "smabo-brain",   x: 600, y: 0,    w: 140, h: 70, phase: "brain",
      tip: "smabo-brainのセットアップ手順について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>smabo-brainは<br>・<strong>各コンポーネントを中継するハブ</strong><br>・<strong>画像処理やAIなどの高度な処理の実行</strong><br>の役割を担います。<svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"web\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"制御値\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"ws\",\"lines\":[\"センサ値\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"webrtc\",\"lines\":[\"画像\"]},{\"from\":\"brain\",\"to\":\"esp32\",\"transport\":\"ws\",\"lines\":[\"制御値\"]},{\"from\":\"esp32\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"センサ値\"]},{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"スマホセンサ値\"]},{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"webrtc\",\"lines\":[\"画像\"]},{\"from\":\"brain\",\"to\":\"app\",\"transport\":\"ws\",\"lines\":[\"制御値\"]}]' data-active='brain'></svg>",
      tipEn: "Set up smabo-brain — the hub that relays all components and runs advanced processing.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>smabo-brain serves as:<br>・<strong>The hub relaying all components</strong><br>・<strong>Running advanced tasks such as image processing and AI</strong><br><svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"web\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"Control values\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"ws\",\"lines\":[\"Sensor values\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"webrtc\",\"lines\":[\"Camera feed\"]},{\"from\":\"brain\",\"to\":\"esp32\",\"transport\":\"ws\",\"lines\":[\"Control values\"]},{\"from\":\"esp32\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"Sensor values\"]},{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"Phone sensor values\"]},{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"webrtc\",\"lines\":[\"Camera feed\"]},{\"from\":\"brain\",\"to\":\"app\",\"transport\":\"ws\",\"lines\":[\"Control values\"]}]' data-active='brain'></svg>" },
    { id: "web",       file: "smabo-web", icon: "🖥️", label: "smabo-web",     x: 600, y: 130, w: 140, h: 70, phase: "brain", ext: true,
      tip: "smabo-webのセットアップ手順について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>smabo-webは<br>・<strong>smaboの設定の変更、手動操作、センサの可視化などの補助的ツール</strong><br>の役割を担います。<svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"web\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"制御値\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"ws\",\"lines\":[\"センサ値\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"webrtc\",\"lines\":[\"画像\"]},{\"from\":\"web\",\"to\":\"esp32\",\"transport\":\"rest\",\"lines\":[\"esp32設定変更\"]}]' data-active='web'></svg>",
      tipEn: "Set up smabo-web — the browser-based tool for configuration, manual control, and sensor visualization.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>smabo-web serves as:<br>・<strong>An auxiliary tool for configuring smabo, manual control, and sensor visualization</strong><br><svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"web\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"Control values\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"ws\",\"lines\":[\"Sensor values\"]},{\"from\":\"brain\",\"to\":\"web\",\"transport\":\"webrtc\",\"lines\":[\"Camera feed\"]},{\"from\":\"web\",\"to\":\"esp32\",\"transport\":\"rest\",\"lines\":[\"ESP32 config\"]}]' data-active='web'></svg>" },
    { id: "app",       file: "smabo-app", icon: "📱", label: "smabo-app", x: 600, y: 260, w: 140, h: 70, phase: "brain",
      tip: "「smabo-app」のセットアップ手順について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>smabo-appは<br>・<strong>smaboの顔</strong><br>・<strong>smaboのセンサー</strong><br>の役割を担います。<svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"スマホセンサ値\"]},{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"webrtc\",\"lines\":[\"画像\"]},{\"from\":\"brain\",\"to\":\"app\",\"transport\":\"ws\",\"lines\":[\"制御値\"]}]' data-active='app'></svg>",
      tipEn: "Set up smabo-app — the smartphone app that serves as smabo's face and sensor hub.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>smabo-app serves as:<br>・<strong>smabo's face</strong><br>・<strong>smabo's sensor hub</strong><br><svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"Phone sensor values\"]},{\"from\":\"app\",\"to\":\"brain\",\"transport\":\"webrtc\",\"lines\":[\"Camera feed\"]},{\"from\":\"brain\",\"to\":\"app\",\"transport\":\"ws\",\"lines\":[\"Control values\"]}]' data-active='app'></svg>" },
    { id: "face",      file: "smabo_face", icon: "😊", label: "smaboの顔",   labelEn: "smabo's Face",   x: 260, y: 390, w: 140, h: 70, phase: "brain",
      tip: "「smaboの顔機能」の使い方について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>smabo-webから、smaboの表情を変更</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/eye_change.mp4\" type=\"video/mp4\"></video><br>・<strong>smabo-webから、smaboの目をコントロール</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/eye_control_manual.mp4\" type=\"video/mp4\"></video>",
      tipEn: "Learn how to use smabo's face feature.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Change smabo's expressions via smabo-web</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/eye_change.mp4\" type=\"video/mp4\"></video><br>・<strong>Control smabo's eyes via smabo-web</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/eye_control_manual.mp4\" type=\"video/mp4\"></video>" },
    { id: "sensors",   file: "smabo_sensors", icon: "📲", label: "スマホセンサ", labelEn: "Phone Sensors", x: 470, y: 390, w: 140, h: 70, phase: "brain",
      tip: "「smaboのセンサー」について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>スマホのセンサデータ（画像、IMU、GPS）をsmabo-webで可視化</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/smabo-web-sensor.mp4\" type=\"video/mp4\"></video>",
      tipEn: "Learn about smabo's Smartphone Sensors.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Visualize smartphone sensor data (camera, IMU, GPS) in smabo-web</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/smabo-web-sensor.mp4\" type=\"video/mp4\"></video>" },
    { id: "voice",     file: "audioproc", icon: "🎤", label: "音声処理",     labelEn: "Audio Processing", x: 730, y: 390, w: 140, h: 70, phase: "brain",
      tip: "「音声処理機能」について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>スマホで取得した音声を、音声認識</strong><br><img data-src=\"../images/app_recognized_speech.png\"><br>・<strong>smabo-webで指定した文字列を発話</strong><br><img data-src=\"../images/app_speech_say.jpg\">",
      tipEn: "Learn about the Audio Processing feature.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Speech recognition from phone microphone</strong><br><img data-src=\"../../images/app_recognized_speech.png\"><br>・<strong>Text-to-speech via smabo-web</strong><br><img data-src=\"../../images/app_speech_say.jpg\">" },
    { id: "imgproc",   file: "imgproc", icon: "👁️", label: "画像処理",      labelEn: "Image Processing",   x: 940, y: 390, w: 140, h: 70, phase: "brain",
      tip: "「画像処理機能」について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>カメラから取得した画像をもとに、対象物体を識別</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/img_proc_smabo_web.mp4\" type=\"video/mp4\"></video><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/eye_control_img_proc.mp4\" type=\"video/mp4\"></video>",
      tipEn: "Learn about the Image Processing feature.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Object detection from camera feed</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/img_proc_smabo_web.mp4\" type=\"video/mp4\"></video><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/eye_control_img_proc.mp4\" type=\"video/mp4\"></video>" },
    { id: "baseparts", file: "base", icon: "🧩", label: "ベースパーツの作成", labelEn: "Base Parts",   x: 600, y: 520, w: 140, h: 70, phase: "esp32",
      tip: "「ベースパーツの作成」手順について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>自分のスマホのサイズに合わせた3Dモデルの修正</strong><br><img data-src=\"../images/base_long_inner_extrude.jpg\"><br>・<strong>ベースパーツの3Dプリンタによる印刷</strong><br><img data-src=\"../images/base_print_base.jpg\">",
      tipEn: "Learn how to create the Base Parts.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Modify 3D models to fit your smartphone</strong><br><img data-src=\"../../images/base_long_inner_extrude.jpg\"><br>・<strong>3D-print the base parts</strong><br><img data-src=\"../../images/base_print_base.jpg\">" },
    { id: "esp32",     file: "smabo-esp32", icon: "🔌", label: "smabo-esp32",   x: 600, y: 650, w: 140, h: 70, phase: "esp32",
      tip: "「smabo-esp32」のセットアップ手順について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>smabo-esp32は<br>・<strong>esp32に繋いだセンサやアクチュエータの制御</strong><br>の役割を担います。<svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"web\",\"to\":\"esp32\",\"transport\":\"rest\",\"lines\":[\"esp32設定\"]},{\"from\":\"brain\",\"to\":\"esp32\",\"transport\":\"ws\",\"lines\":[\"制御値\"]},{\"from\":\"esp32\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"センサ値\"]}]' data-active='esp32'></svg>",
      tipEn: "Set up smabo-esp32 — the firmware controlling sensors and actuators connected to the ESP32.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>smabo-esp32 is responsible for:<br>・<strong>Controlling sensors and actuators connected to the ESP32</strong><br><svg class='sys-svg rmap-tip-sysmap' viewBox='0 0 1200 520' data-flows='[{\"from\":\"web\",\"to\":\"esp32\",\"transport\":\"rest\",\"lines\":[\"ESP32 config\"]},{\"from\":\"brain\",\"to\":\"esp32\",\"transport\":\"ws\",\"lines\":[\"Control values\"]},{\"from\":\"esp32\",\"to\":\"brain\",\"transport\":\"ws\",\"lines\":[\"Sensor values\"]}]' data-active='esp32'></svg>" },
    { id: "hand",      file: "hand", icon: "🤏", label: "ハンド",              labelEn: "Hand",           x: 355, y: 790, w: 140, h: 70, phase: "esp32",
      tip: "「ハンド機能」について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>ハンドのコントローラー制御</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/smabo_hand_manual.mp4\" type=\"video/mp4\"></video><br>・<strong>ハンドのランダム制御</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/smabo_hand_random.mp4\" type=\"video/mp4\"></video>",
      tipEn: "Learn about the Hand feature.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Manual controller control of the hand</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/smabo_hand_manual.mp4\" type=\"video/mp4\"></video><br>・<strong>Random motion control of the hand</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/smabo_hand_random.mp4\" type=\"video/mp4\"></video>" },
    { id: "neck",      file: "neck", icon: "🔄", label: "首振り",              labelEn: "Head Rotation", x: 535, y: 790, w: 140, h: 70, phase: "esp32",
      tip: "「首振り機能」について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>首振りのコントローラー制御</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/smabo_neck_manual.mp4\" type=\"video/mp4\"></video><br>・<strong>首振りのランダム制御</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/smabo_neck_random.mp4\" type=\"video/mp4\"></video><br>・<strong>画像認識による首振り制御</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/smabo_neck_img_proc.mp4\" type=\"video/mp4\"></video>",
      tipEn: "Learn about the Head Rotation (Neck) feature.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Manual controller control</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/smabo_neck_manual.mp4\" type=\"video/mp4\"></video><br>・<strong>Random motion control</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/smabo_neck_random.mp4\" type=\"video/mp4\"></video><br>・<strong>Image-recognition-based head tracking</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/smabo_neck_img_proc.mp4\" type=\"video/mp4\"></video>" },
    { id: "mobile",    icon: "🚗", label: "移動ロボット",   labelEn: "Mobile Robot",   x: 695, y: 790, w: 140, h: 70, phase: "esp32",
      tip: "「移動ロボット機能」について解説します。<br><a class='rmap-tip-btn' data-guide-btn>ガイドを読む</a><br>・<strong>移動ロボットのコントローラー制御</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/tt_motor_manual_control.mp4\" type=\"video/mp4\"></video><br>・<strong>移動ロボットの画像処理による制御</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source src=\"../video/tt_motor_img_proc.mp4\" type=\"video/mp4\"></video>",
      tipEn: "Learn about the Mobile Robot feature.<br><a class='rmap-tip-btn' data-guide-btn>Read Guide</a><br>・<strong>Controller control of the mobile robot</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/tt_motor_manual_control.mp4\" type=\"video/mp4\"></video><br>・<strong>Image-processing based control of the mobile robot</strong><br><video autoplay loop muted playsinline style=\"max-width:100%\"><source data-vsrc=\"../../video/tt_motor_img_proc.mp4\" type=\"video/mp4\"></video>" },
    { id: "arm",       icon: "🦾", label: "ロボットアーム", labelEn: "Robot Arm",       x: 845, y: 790, w: 140, h: 70, phase: "esp32",
      tip: "（仮）スマホアプリでアームを手動操作できます。",
      tipEn: "(Coming soon) Manually operate the arm from the smartphone app." },
    { id: "encmobile", icon: "⚙️", label: "エンコーダ付",   labelEn: "w/ Encoder",     x: 695, y: 920, w: 140, h: 70, phase: "esp32",
      tip: "（仮）エンコーダにより精度の高い直進・旋回ができます。",
      tipEn: "(Coming soon) High-precision straight-line driving and turning via encoder feedback." },
    { id: "brainros",  icon: "🤖", label: "brain-ros",                                  x: 995, y: 790, w: 140, h: 70, phase: "brainros",
      tip: "（仮）ROSを使ってセンサーとアクチュエータを統合制御できます。",
      tipEn: "(Coming soon) Integrate sensor and actuator control using ROS." },
    { id: "nav",       icon: "🗺️", label: "ナビゲーション", labelEn: "Navigation",      x: 695, y: 1050, w: 140, h: 70, phase: "brainros",
      tip: "（仮）地図を生成して自律的に目的地へ移動できます。",
      tipEn: "(Coming soon) Generate a map and navigate autonomously to a target location." },
    { id: "plan",      icon: "📐", label: "動作計画",       labelEn: "Motion Planning", x: 845, y: 1050, w: 140, h: 70, phase: "brainros",
      tip: "（仮）障害物を回避しながらアームや機体を自律動作させられます。",
      tipEn: "(Coming soon) Autonomously move the arm and chassis while avoiding obstacles." }
  ];

  // node centers (cx = x + w/2):
  //   brain/web/app/baseparts/esp32 = 670（中央列）
  //   smabo-app の子機能を横一列に: face = 330, sensors = 540, voice = 800, imgproc = 1010
  //   baseparts は app の子（中央, esp32 の親）→ app → baseparts → esp32
  //   hand = 425, neck = 605, mobile/encmobile = 765, arm = 915, brainros = 1065
  //   nav = 765, plan = 915

  var EDGES = [
    { from: "brain",     to: "web",       d: "M 670 70 L 670 128" },
    { from: "web",       to: "app",       d: "M 670 200 L 670 258" },
    { from: "app",       to: "face",      d: "M 670 330 L 670 348 Q 670 358 660 358 L 340 358 Q 330 358 330 368 L 330 388" },
    { from: "app",       to: "sensors",   d: "M 670 330 L 670 348 Q 670 358 660 358 L 550 358 Q 540 358 540 368 L 540 388" },
    { from: "app",       to: "voice",     d: "M 670 330 L 670 348 Q 670 358 680 358 L 790 358 Q 800 358 800 368 L 800 388" },
    { from: "app",       to: "imgproc",   d: "M 670 330 L 670 348 Q 670 358 680 358 L 1000 358 Q 1010 358 1010 368 L 1010 388" },
    { from: "app",       to: "baseparts", d: "M 670 330 L 670 518" },
    { from: "baseparts", to: "esp32",     d: "M 670 590 L 670 648" },
    { from: "esp32",     to: "hand",      d: "M 670 720 L 670 746 Q 670 756 660 756 L 435 756 Q 425 756 425 766 L 425 788" },
    { from: "esp32",     to: "neck",      d: "M 670 720 L 670 746 Q 670 756 660 756 L 615 756 Q 605 756 605 766 L 605 788" },
    { from: "esp32",     to: "mobile",    d: "M 670 720 L 670 746 Q 670 756 680 756 L 755 756 Q 765 756 765 766 L 765 788" },
    { from: "esp32",     to: "arm",       d: "M 670 720 L 670 746 Q 670 756 680 756 L 905 756 Q 915 756 915 766 L 915 788" },
    { from: "esp32",     to: "brainros",  d: "M 670 720 L 670 746 Q 670 756 680 756 L 1055 756 Q 1065 756 1065 766 L 1065 788" },
    { from: "mobile",    to: "encmobile", d: "M 765 860 L 765 918" },
    { from: "encmobile", to: "nav",       d: "M 765 990 L 765 1048" },
    { from: "arm",       to: "plan",      d: "M 915 860 L 915 1048" },
    { from: "brainros",  to: "nav",       d: "M 1065 860 L 1065 1008 Q 1065 1018 1055 1018 L 925 1018 M 905 1018 L 775 1018 Q 765 1018 765 1028 L 765 1048", jumps: [{x: 915, y: 1018}] },
    { from: "brainros",  to: "plan",      d: "M 1065 860 L 1065 908 Q 1065 918 1055 918 L 925 918 Q 915 918 915 928 L 915 1048" }
  ];

  var BANDS = [
    { cls: "brain",    top: -24, bot: 470  },
    { cls: "esp32",    top: 470, bot: 1000 },
    { cls: "brainros", top: 1000, bot: 1130 }
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
  var isEn = window.location.pathname.indexOf('/en/') !== -1;
  var guideDir = GUIDE_DIR;
  if (svg.hasAttribute("data-guide-dir")) guideDir = svg.getAttribute("data-guide-dir");
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
    label.textContent = isEn && n.labelEn ? n.labelEn : n.label;
    link.appendChild(label);
    if (n.sub) {
      var sub = el("text", { class: "node__sub", x: cx, y: n.y + 58, "text-anchor": "middle" });
      sub.textContent = n.sub;
      link.appendChild(sub);
    }


    g.appendChild(link);

    g.addEventListener("mouseenter", (function (node, gEl) {
      return function () { stopBlink(); highlight(node.id); showTooltip(node, gEl, false); };
    })(n, g));
    g.addEventListener("mouseleave", function () {
      hideTooltip();
    });
    g.addEventListener("touchend", (function (node, gEl) {
      return function (ev) {
        var t = ev.changedTouches[0];
        var dx = t.clientX - touchStartX;
        var dy = t.clientY - touchStartY;
        if (dx * dx + dy * dy > 100) return;
        ev.preventDefault();
        if (activeNode === node.id) {
          activeNode = null;
          clearHighlight();
          hideTooltipImmediate();
        } else {
          stopBlink();
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
  var touchStartX = 0, touchStartY = 0;
  svg.addEventListener('touchstart', function(ev) {
    if (ev.touches.length === 1) {
      touchStartX = ev.touches[0].clientX;
      touchStartY = ev.touches[0].clientY;
    }
  }, { passive: true });
  var tooltip     = document.getElementById("rmap-tooltip");
  var tipBody     = tooltip && tooltip.querySelector(".rmap-tooltip__body");
  var tipImg      = tooltip && tooltip.querySelector(".rmap-tooltip__img");

  var hideTimer = null;

  /* close button + fullscreen title — added once, reused across tooltips */
  var titleEl = null;
  if (tooltip) {
    titleEl = document.createElement('p');
    titleEl.className = 'rmap-tooltip__title';
    tooltip.insertBefore(titleEl, tooltip.firstChild);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'rmap-tooltip__close';
    closeBtn.setAttribute('aria-label', '閉じる');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', function() { hideTooltipImmediate(); });
    tooltip.appendChild(closeBtn);
  }

  function showTooltip(n, nodeEl, lock) {
    clearTimeout(hideTimer);
    var activeTip = isEn && n.tipEn ? n.tipEn : n.tip;
    if (!tooltip || !activeTip) return;
    tipBody.innerHTML = activeTip;
    tipBody.querySelectorAll('img[data-src]').forEach(function(img) {
      img.src = guideDir + img.getAttribute('data-src');
    });
    tipBody.querySelectorAll('source[data-vsrc]').forEach(function(src) {
      src.src = guideDir + src.getAttribute('data-vsrc');
      var v = src.closest('video');
      if (v) v.load();
    });
    tipBody.querySelectorAll('a[data-guide-btn]').forEach(function(a) {
      a.href = guideDir + (n.file || n.id) + ".html";
    });
    if (lock) svg.classList.add("has-tooltip");
    else svg.classList.remove("has-tooltip");
    tooltip.classList.toggle('rmap-tooltip--fullscreen', !!lock);
    if (titleEl) titleEl.textContent = (n.icon ? n.icon + ' ' : '') + ((isEn && n.labelEn ? n.labelEn : n.label) || '');
    if (n.tipImg && tipImg) {
      tipImg.src = guideDir + n.tipImg;
      tipImg.hidden = false;
    } else if (tipImg) {
      tipImg.hidden = true;
    }
    tooltip.style.visibility = 'hidden';
    tooltip.hidden = false;
    if (window.sysmapBuild) {
      tipBody.querySelectorAll('.sys-svg').forEach(function(s) {
        window.sysmapBuild(s);
      });
    }
    var r = nodeEl.getBoundingClientRect();
    function reposition() {
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
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        reposition();
        tooltip.style.visibility = '';
        tipBody.querySelectorAll('img').forEach(function(img) {
          if (!img.complete) {
            img.addEventListener('load', function() {
              if (!tooltip.hidden) reposition();
            }, { once: true });
          }
        });
      });
    });
  }
  function hideTooltip() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (tooltip) {
        tooltip.hidden = true;
        tooltip.classList.remove('rmap-tooltip--fullscreen');
      }
      svg.classList.remove("has-tooltip");
      clearHighlight();
      applyInitial();
    }, 120);
  }
  function hideTooltipImmediate() {
    clearTimeout(hideTimer);
    if (tooltip) {
      tooltip.hidden = true;
      tooltip.classList.remove('rmap-tooltip--fullscreen');
    }
    svg.classList.remove("has-tooltip");
    clearHighlight();
    applyInitial();
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
      if (ev.target.closest("a, button")) return;
      if (tooltip.classList.contains('rmap-tooltip--fullscreen')) return;
      startDrag(ev.clientX, ev.clientY);
      ev.preventDefault();
    });
    document.addEventListener("mousemove", function (ev) { moveDrag(ev.clientX, ev.clientY); });
    document.addEventListener("mouseup", endDrag);

    tooltip.addEventListener("touchstart", function (ev) {
      if (ev.target.closest("a, button")) return;
      if (tooltip.classList.contains('rmap-tooltip--fullscreen')) return;
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
  // data-active may be a single id, or several comma-separated ids. With 2+
  // ids the highlight alternates between them — a blinking "next steps" cue.
  var initialIds = (svg.getAttribute("data-active") || "")
    .split(",").map(function (s) { return s.trim(); })
    .filter(function (id) { return id && byId[id]; });
  var initialActive = initialIds[0] || null;
  var blinkTimer = null, blinkIdx = 0;

  function startBlink() {
    stopBlink();
    if (!initialIds.length) return;
    blinkIdx = 0;
    highlight(initialIds[0]);
    if (initialIds.length < 2) return;
    blinkTimer = setInterval(function () {
      blinkIdx = (blinkIdx + 1) % initialIds.length;
      highlight(initialIds[blinkIdx]);
    }, 900);
  }
  function stopBlink() {
    if (blinkTimer) { clearInterval(blinkTimer); blinkTimer = null; }
  }
  // Restore the page's default highlight (single node, or the blink cycle).
  function applyInitial() {
    if (initialIds.length) startBlink();
  }

  if (initialIds.length) {
    activeNode = initialActive;
    startBlink();
  }
  } // ---- end buildRoadmap ----

  var rmapSvgs = document.querySelectorAll(".rmap-svg");
  for (var rmapI = 0; rmapI < rmapSvgs.length; rmapI++) buildRoadmap(rmapSvgs[rmapI], rmapI);
})();
