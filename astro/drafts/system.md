---
title: "system"
---

## 概要

本ページでは、smabo システム全体の構成について記載します。

smabo は、スマートフォンを顔として載せる小型ロボットです。システムは以下の 5 つのリポジトリで構成されます。

| リポジトリ | 動作環境 | 役割 |
| --- | --- | --- |
| smabo-app | スマートフォン（Flutter） | 顔の表示、IMU・GPS の送信、カメラ映像の送信（WebRTC）、ウェイクワード検出と録音、発話（TTS） |
| smabo-web | ブラウザ（React / TypeScript） | 操作・可視化 UI（走行、サーボ、画像処理、ナビゲーション、動作計画、ESP32 の設定） |
| smabo-esp32 | ESP32（MicroPython） | サーボ（PCA9685）・DC モータ（TB6612FNG）・エンコーダ・LiDAR（LD06）の制御、設定の保存と REST API |
| smabo-brain | PC など（Python / aiohttp） | WebSocket の中継サーバ。オドメトリ積分・画像処理・音声認識（STT）・WebRTC の終端 |
| smabo-brain-ros | PC など（ROS 2 Humble / Docker） | smabo-brain の ROS 2 版。rosbridge を入口に、Nav2（ナビゲーション）・MoveIt2（動作計画）・ロボットモデルを提供 |

中継役（brain）には、次の 2 つの実装があります。どちらもポート 9090 で待ち受け、rosbridge v2.0 互換の JSON で通信します。

- **smabo-brain**：WebSocket の中継サーバ。各クライアントから受けたメッセージを、宛先ごとに振り分けて再送信します。
- **smabo-brain-ros**：rosbridge_suite を入口にした ROS 2 のグラフ。smabo-brain の処理ロジック（`brain.odometry`・`brain.vision`・`brain.stt`・`brain.webrtc_hub`・`brain.topics`）を import して再利用します。

## 構成図

### 全体構成

<pre class="mermaid">
flowchart LR
  subgraph phone["スマートフォン"]
    app["smabo-app"]
  end
  subgraph browser["ブラウザ"]
    web["smabo-web"]
  end
  subgraph robot["ロボット本体"]
    esp32["smabo-esp32"]
    pca["PCA9685&lt;br/&gt;サーボ"]
    dc["TB6612FNG&lt;br/&gt;DC モータ"]
    enc["エンコーダ"]
    lidar["LD06&lt;br/&gt;LiDAR"]
  end
  subgraph host["brain ホスト（PC など）"]
    brain["smabo-brain&lt;br/&gt;または&lt;br/&gt;smabo-brain-ros"]
  end

  app -- "WebSocket :9090（/app 付き）" --&gt; brain
  app == "WebRTC（カメラ映像）" ==&gt; brain
  web -- "WebSocket :9090（/web 付き）" --&gt; brain
  esp32 -- "WebSocket :9090（/esp32 付き）" --&gt; brain
  web -- "REST :80（/config, /mode）" --&gt; esp32
  esp32 --- pca
  esp32 --- dc
  esp32 --- enc
  esp32 --- lidar
</pre>

### smabo-brain の構成

<pre class="mermaid">
flowchart LR
  app["smabo-app"] -- "ws /" --&gt; appws["_app_ws"]
  web["smabo-web"] -- "ws /ui" --&gt; uiws["_ui_ws"]
  esp32["smabo-esp32"] -- "ws /esp32" --&gt; espws["_esp32_ws"]

  subgraph brain["smabo-brain（brain/relay.py）"]
    appws
    uiws
    espws
    odom["Odometry&lt;br/&gt;（brain/odometry.py）"]
    hub["WebRtcHub&lt;br/&gt;（brain/webrtc_hub.py）"]
    vision["vision&lt;br/&gt;（brain/vision.py）"]
    stt["SttEngine&lt;br/&gt;（brain/stt.py）"]
  end

  espws -- "/wheel_vel" --&gt; odom
  app == "WebRTC" ==&gt; hub
  hub -- "フレーム" --&gt; vision
  appws -- "/speech/audio" --&gt; stt
</pre>

### smabo-brain-ros の構成

| パッケージ | 内容 |
| --- | --- |
| `smabo_interfaces` | カスタムメッセージ `WheelVel`（left / right / dt）、サービス `GetFile`（URDF・SRDF・メッシュの取得） |
| `smabo_brain_ros` | `odom_node`、`servo_trajectory_bridge`、`webrtc_camera_node`、`image_processor_node`、`gaze_policy_node`、`neck_policy_node`、`drive_policy_node`、`speech_recognizer_node`、`robot_model_server`、送信元 prefix を外す `relays.launch.py` |
| `smabo_description` | ロボットモデル（URDF / xacro、メッシュ、メッシュ生成スクリプト） |
| `smabo_moveit_config` | MoveIt2 の設定（SRDF / xacro、IK、コントローラ） |
| `smabo_navigation` | Nav2 の設定（AMCL / slam_toolbox、costmap、プレースホルダ地図） |
| `smabo_bringup` | 一括起動の launch と rosbridge の launch |

<pre class="mermaid">
flowchart LR
  clients["smabo-web / smabo-app / smabo-esp32"] -- "WebSocket :9090" --&gt; rb["rosbridge_server"]
  rb --&gt; relays["relays&lt;br/&gt;（topic_tools relay）"]
  relays -- "/wheel_vel" --&gt; odom["odom_node"]
  odom -- "/odom, tf" --&gt; nav["Nav2"]
  relays -- "/scan" --&gt; nav
  nav -- "/cmd_vel" --&gt; rb
  rsp["robot_state_publisher"]
  mg["move_group（MoveIt2）"] -- "FollowJointTrajectory" --&gt; bridge["servo_trajectory_bridge"]
  bridge -- "/servo/command" --&gt; rb
  app["smabo-app"] == "WebRTC" ==&gt; cam["webrtc_camera_node"]
  cam -- "/camera/image_raw" --&gt; ip["image_processor_node"]
  ip -- "/vision/detections" --&gt; pol["gaze / neck / drive&lt;br/&gt;policy_node"]
  relays -- "/speech/audio" --&gt; sr["speech_recognizer_node"]
  rb -- "/smabo/get_file" --&gt; ms["robot_model_server"]
</pre>

## ロボットモデル

ロボットモデルは `smabo_description` の URDF / xacro で定義します。メッシュは smabo-hardware の STEP から `scripts/split_smabo_meshes.py` で生成します。

![ロボットモデルの構成](/images/system_robot_configs.png)

### 座標系

- x：前（スマートフォン側）、y：左、z：上
- `base_link`：ベースの箱の底面中央。全構成で共通の土台です。
- 関節が動くリンクの原点は、関節の軸上に置きます。

### 構成の切り替え

`smabo.urdf.xacro` の xacro 引数で、`base_link` に取り付けるモジュールを選びます。

| 引数 | 既定 | 内容 |
| --- | --- | --- |
| `arm` | `true` | 3 軸アーム＋グリッパ（上面） |
| `hand` | `false` | 左右のハンド（側面） |
| `breadboard` | `false` | 背面のブレッドボード・PCA9685 の固定具 |
| `mount` | `none` | `none`／`tt_motor`（TT モータの移動台車）／`neck`（床置きのパン台） |

`mount:=neck` のときは、URDF の根が `pan_stand_link` になります。それ以外の構成では `base_link` が根です。

<pre class="mermaid">
flowchart TD
  subgraph neck["mount:=neck"]
    stand["pan_stand_link"] -- "head_pan" --&gt; pan["pan_link"]
  end
  pan -. "fixed" .-&gt; base["base_link"]
  base -- "fixed" --&gt; bb["breadboard_link"]
  base -- "fixed" --&gt; amb["arm_base_link"]
  subgraph arm["arm:=true"]
    amb -- "arm_joint_1" --&gt; a1["arm_link_1"]
    a1 -- "arm_joint_2" --&gt; a2["arm_link_2"]
    a2 -- "arm_joint_3" --&gt; a3["arm_link_3"]
    a3 -- "arm_joint_4" --&gt; a4["arm_link_4"]
    a3 -- "fixed" --&gt; tool["arm_tool0"]
  end
  base -- "fixed" --&gt; hm["hand_mount_link"]
  subgraph hand["hand:=true"]
    hm -- "left_hand" --&gt; lh["left_hand_link"]
    hm -- "right_hand" --&gt; rh["right_hand_link"]
  end
  base -- "fixed" --&gt; ch["chassis_link"]
  subgraph tt["mount:=tt_motor"]
    ch -- "left_wheel_joint" --&gt; lw["left_wheel_link"]
    ch -- "right_wheel_joint" --&gt; rw["right_wheel_link"]
  end
  base -- "fixed" --&gt; laser["laser"]
</pre>

矢印のラベルは関節名です（fixed は固定）。`breadboard_link` は `breadboard:=true`、`laser` は `mount:=tt_motor` のときに追加されます。

### リンク

| モジュール | リンク | 含まれるパーツ |
| --- | --- | --- |
| base | `base_link` | base、各カバー、スマホホルダー |
| breadboard | `breadboard_link` | bread_board_stopper、pca9685_stopper、mini_bread_board_stand |
| arm | `arm_base_link` | sg90_1_L/R、pca9685 stopper、SG90（J1） |
| arm | `arm_link_1` | sg90_2、sg90_3、SG90（J2） |
| arm | `arm_link_2` | sg90_4、SG90（J3） |
| arm | `arm_link_3` | sg90_5（固定側の指）、SG90（ハンド） |
| arm | `arm_link_4` | sg90_5_hand（動く指） |
| arm | `arm_tool0` | 指先の間のツールフレーム（形状なし） |
| hand | `hand_mount_link` | 左右の sg90_plate、SG90 × 2 |
| hand | `left_hand_link` / `right_hand_link` | sg90_base、arm_hand |
| tt_motor | `chassis_link` | 底板、モータ固定具、キャスター固定具、TT モータ × 2、キャスター |
| tt_motor | `left_wheel_link` / `right_wheel_link` | 車輪 |
| tt_motor | `laser` | LiDAR のフレーム（形状なし、仮の位置） |
| neck | `pan_stand_link` | pan_stand_left/right、MG996R |
| neck | `pan_link` | pan_plate_top、pan_adapter |

SG90・MG996R・TT モータ・車輪・キャスターは STEP に含まれないため、簡易形状で追加しています。

### 関節

| 関節 | 種類 | 軸 | 範囲 | 0 の姿勢 / ＋の向き |
| --- | --- | --- | --- | --- |
| `arm_joint_1` | revolute | z | −90〜90° | アームが真上 / 左回り |
| `arm_joint_2` | revolute | y | −90〜90° | アームが真上 / 前へ倒れる |
| `arm_joint_3` | revolute | y | −90〜90° | アームが真上 / 前へ倒れる |
| `arm_joint_4` | revolute | x | −90〜90° | −90° で閉、＋90° で全開 |
| `left_hand` / `right_hand` | revolute | −y | −90〜90° | 腕が下向き / 前へ上がる |
| `left_wheel_joint` / `right_wheel_joint` | continuous | y | − | − |
| `head_pan` | revolute | z | −90〜90° | 正面 / 左回り |

関節名は smabo-esp32 の `servos.joints` と一致させています。

次の図は、各関節を＋方向に回したときの動きです（灰色が基準の姿勢）。

![関節の＋方向](/images/system_robot_joints.png)

### 車輪とキャスター

- 車輪の半径：0.030 m
- 車輪の間隔：0.130 m（左右のタイヤの幅の中心どうし）
- 地面は `base_link` の 0.04985 m 下です。キャスターの高さは、本体が水平になる値にしています。

## 通信構成

### 接続先

| 接続元 | 接続先 | プロトコル | smabo-brain のパス | smabo-brain-ros のパス |
| --- | --- | --- | --- | --- |
| smabo-app | brain :9090 | WebSocket | `/` | `/` |
| smabo-web | brain :9090 | WebSocket | `/ui` | `/ui`（ヘッダの接続）、`/`（Navigation・Motion Plan タブの roslib 接続） |
| smabo-esp32 | brain :9090 | WebSocket | `/esp32` | `/`（`brain.rosbridge: true` のとき） |
| smabo-web | smabo-esp32 :80 | HTTP（REST） | − | − |
| smabo-app | brain | WebRTC（映像） | シグナリングは WebSocket 経由 | シグナリングは rosbridge 経由 |

### 送信元 prefix

各クライアントは、publish するトピックの先頭に送信元を表す prefix を付けます。

| クライアント | prefix |
| --- | --- |
| smabo-web | `/web` |
| smabo-app | `/app` |
| smabo-esp32 | `/esp32` |

brain は prefix を外した名前（canonical 名）で宛先へ再送信します。受信側は常に canonical 名で受け取ります。prefix の定義は smabo-brain の `brain/topics.py` に集約し、smabo-brain-ros の `relays.launch.py` も同じ定義を import します。

<pre class="mermaid">
flowchart LR
  web["smabo-web"] -- "/web/cmd_vel" --&gt; strip["brain&lt;br/&gt;prefix を外す"]
  strip -- "/cmd_vel" --&gt; esp32["smabo-esp32"]
  esp32 -- "/esp32/joint_states" --&gt; strip2["brain&lt;br/&gt;prefix を外す"]
  strip2 -- "/joint_states" --&gt; web2["smabo-web"]
</pre>

### smabo-brain の振り分け

| 受信元 | 処理 |
| --- | --- |
| smabo-app | `/webrtc/offer`・`/webrtc/app_ice` は WebRTC ハブが処理、`/speech/audio` は STT、それ以外は smabo-web へ転送 |
| smabo-web | `/vision/config` は設定を更新して全 web へ配信、`/webrtc/preview`・`/webrtc/web_answer`・`/webrtc/web_ice` は WebRTC ハブが処理、`/speech/say`・`/expression`・`/look_at` は smabo-app へ、それ以外は smabo-esp32 へ転送 |
| smabo-esp32 | `/wheel_vel` は積分して `/odom` を web へ、`/joint_states` は角度を保持して web へ、`set_config` は内部の同期に使用、それ以外は web へ転送 |

<pre class="mermaid">
flowchart LR
  app["smabo-app"] -- "/app/..." --&gt; B{"smabo-brain"}
  web["smabo-web"] -- "/web/..." --&gt; B
  esp["smabo-esp32"] -- "/esp32/..." --&gt; B
  B -- "/speech/say, /expression, /look_at" --&gt; app2["smabo-app"]
  B -- "/cmd_vel, /servo/command, /ping" --&gt; esp2["smabo-esp32"]
  B -- "/odom, /joint_states, /imu/data, /gps/fix,&lt;br/&gt;/vision/*, /speech/recognized, notice など" --&gt; web2["smabo-web"]
  B --- inner["brain 内部の処理&lt;br/&gt;WebRTC ハブ・画像処理・STT・オドメトリ"]
</pre>

### smabo-brain-ros の通信

- 外部のクライアントとは、rosbridge_suite（WebSocket :9090）で接続します。
- ESP32 は rosbridge に接続するとき、送信トピックを advertise、受信トピックを subscribe します。
- 送信元 prefix は、`relays.launch.py` が起動する `topic_tools relay` で canonical 名に付け替えます。
- カメラ映像は rosbridge を通さず、`webrtc_camera_node` が WebRTC で受けて `/camera/image_raw`（`sensor_msgs/Image`）として ROS 2 に流します。
- ROS 2 のノードどうしは DDS で通信します。`docker-compose.yml` は `network_mode: host`・`ROS_DOMAIN_ID=0` で、DDS の通信範囲は制限していません（同じ LAN に届きます）。

<pre class="mermaid">
flowchart LR
  subgraph lan["LAN"]
    app["smabo-app"]
    web["smabo-web"]
    esp["smabo-esp32"]
    other["ほかの ROS 2 機器&lt;br/&gt;（同じドメイン ID）"]
    subgraph host["brain ホスト（Docker, network_mode: host）"]
      rb["rosbridge_server :9090"]
      nodes["ROS 2 ノード&lt;br/&gt;（Nav2・MoveIt2・odom など）"]
      rb &lt;-- "DDS" --&gt; nodes
    end
  end
  app -- "WebSocket" --&gt; rb
  web -- "WebSocket" --&gt; rb
  esp -- "WebSocket" --&gt; rb
  app == "WebRTC" ==&gt; nodes
  other &lt;-. "DDS（制限なし）" .-&gt; nodes
</pre>

### 設定の経路

ESP32 の設定（config・mode）は brain を経由せず、smabo-web が ESP32 の REST API に直接アクセスします。ESP32 は smabo-brain への接続時と設定・モードの変更時に、設定の全体（`set_config`）を smabo-brain へ送ります（smabo-brain-ros に接続しているときは送りません）。smabo-brain はこれをオドメトリのパラメータと、実在する関節名の把握に使います。

<pre class="mermaid">
flowchart LR
  web["smabo-web&lt;br/&gt;（Config タブ）"] -- "GET / POST /config&lt;br/&gt;POST /mode" --&gt; esp["smabo-esp32&lt;br/&gt;config.json"]
  esp -- "set_config（WebSocket）" --&gt; brain["smabo-brain&lt;br/&gt;オドメトリ・関節名"]
</pre>

## 画面仕様書

本機能の画面仕様を記載します。

### smabo-web

#### 共通（ヘッダとタブ）

![smabo-web のヘッダとタブ](/images/system_web_header.png)

| No. | 項目 | 内容 |
| --- | --- | --- |
| 1 | brain の接続先 | brain の `host:port`。Enter または ② で `ws://<host>/ui` に WebSocket 接続 |
| 2 | Connect / Disconnect | brain との接続・切断。左の丸が接続状態 |
| 3 | ESP32 の接続先 | REST API（`/config`・`/mode`）の宛先 |
| 4 | Get Config | ESP32 から設定を取得（`GET /config`） |
| 5 | msg/s | brain から 1 秒間に受信したメッセージ数 |
| 6 | タブ | 画面の切り替え（下表） |

| タブ | 内容 |
| --- | --- |
| Face | 表情の名前（`/expression`）、視線（`/look_at`）、発話（`/speech/say`）の送信。音声認識の結果（`/speech/recognized`）の表示（上図） |
| Sensors | IMU・GPS の表示、カメラ映像のプレビュー（WebRTC） |
| two wheel mobile robot | ジョイスティックによる `/cmd_vel` の送信、速度上限、`/odom` の表示、走行軌跡（Trail Map） |
| Servo | ESP32 の `servos.joints` から生成したスライダーによる `/servo/command` の送信。Home で `init_angle` に戻す |
| Vision | 画像処理の設定（`/vision/config`：検出方法・色・ArUco・発話・追従動作）、検出結果の表示、カメラ映像のプレビュー |
| Navigation | rosbridge への接続（roslib）、`/initialpose` の送信、`/navigate_to_pose` のゴール送信、3D 表示（地図・`/scan`・ロボット） |
| Motion Plan | MoveIt の MotionPlanning パネル相当（下記） |
| Config | ESP32 の設定の表示と編集（Modes・各サブシステム・Advanced（ピン・バス・Wi-Fi、変更時は再起動）・設定全体の JSON）、接続確認（REST の ping、WebSocket の `/ping`→`/pong`） |
| Log | brain から受信したメッセージの一覧・絞り込み、JSON の手動送信 |

Sensors・two wheel mobile robot・Servo・Config の各パネルは、ドラッグで並べ替えられます（順序はブラウザに保存）。

#### Sensors

![Sensors タブ](/images/system_web_sensors.png)

#### two wheel mobile robot

![two wheel mobile robot タブ](/images/system_web_two_wheel_mobile_robot.png)

#### Servo

![Servo タブ](/images/system_web_servo.png)

#### Vision

![Vision タブ](/images/system_web_vision.png)

#### Navigation

![Navigation タブ](/images/system_web_navigation.png)

#### Motion Plan

![Motion Plan タブ](/images/system_web_motion_plan.png)

| 項目 | 内容 |
| --- | --- |
| Connect ROS | rosbridge（ヘッダの brain の接続先）へ roslib で接続。接続後、URDF・SRDF・メッシュを `/smabo/get_file` で取得して 3D 表示 |
| Planning group | SRDF のグループ（`arm`：`arm_joint_1`〜`3`、`gripper`：`arm_joint_4`）を選択 |
| Goal state | `current`（今の姿勢）・SRDF の登録姿勢（home / ready / open / close）・関節スライダーで目標を設定。`arm` グループでは、3D の緑の球（`arm_tool0`）をドラッグすると `/compute_ik`（位置のみ）で関節角を求める。解が無いときは球と案内が赤になる |
| Planning parameters | 速度・加速度のスケール、計画時間、試行回数 |
| Plan | `/plan_kinematic_path` で計画し、軌道を 3D でアニメーション表示 |
| Execute | 計画した軌道を `/execute_trajectory` で実行 |
| Plan & Execute | 計画して、成功したら続けて実行 |
| Stop | 実行中のアクションを取り消す |
| Execute direct | 計画した軌道を `/servo/command` へ直接送る（rosbridge がアクションに対応していない場合） |
| Send goal direct | 目標姿勢を MoveIt を通さず `/servo/command` へ送る |
| 3D View | 白：現在の姿勢（`/joint_states`）、オレンジ：目標姿勢、水色：計画した軌道（関節が動くリンクのみ表示） |

#### Config

![Config タブ](/images/system_web_config.png)

#### Log

![Log タブ](/images/system_web_log.png)

### smabo-app

#### 顔画面

![smabo-app の顔画面](/images/system_app_face.png)

| No. | 項目 | 内容 |
| --- | --- | --- |
| 1 | Brain | brain との接続状態 |
| 2 | 音声の状態 | 待受中・録音中・無効 |
| 3 | 視線モード | Random（ランダムに動く）／Follow（`/look_at` に追従）の切り替え |
| 4 | Bubble / Speak | `/speech/say` を受けたときの吹き出し表示・読み上げ（TTS）の ON/OFF |
| 5 | Face settings | 顔の設定画面を開く |
| 6 | センサー切替 | Voice・Camera・IMU・GPS の ON/OFF |
| 7 | 設定 | 設定画面を開く |

- 目のアニメーションを全画面に表示します。`/expression` で表情、`/look_at`（Follow 時）で視線が変わります。
- 1 回タップで手動の録音開始、ダブルタップで操作用の表示（1〜7）を出します。操作用の表示は一定時間で自動的に隠れます。

#### 顔の設定

![smabo-app の顔の設定](/images/system_app_face_settings.png)

| No. | 項目 | 内容 |
| --- | --- | --- |
| 1 | プレビュー | 編集中の表情をそのまま表示 |
| 2 | 表情の一覧 | 表情の選択・追加・初期状態への復元。番号が `/expression` で指定する ID |
| 3 | 表情の操作 | 複製・名前変更・ID 変更・削除 |

目の形・色・まばたき・左右別の設定は、この画面の下部で編集します。

#### 設定画面

| 項目 | 内容 |
| --- | --- |
| Connections | brain の接続先（ホスト・ポート） |
| Camera | 前面／背面 |
| IMU | 送信周期 |
| Sensor preview | センサーの値とカメラ映像の確認 |
| Voice | ウェイクワード・言語・読み上げ（TTS）など |
| Overlay UI | 操作用の表示を自動で隠すまでの時間 |
| Log | アプリのログ |

## シーケンス図

本機能の処理の流れを、以下のシーケンスに示します。

### 起動と接続（smabo-brain）

<pre class="mermaid">
sequenceDiagram
  participant E as smabo-esp32
  participant B as smabo-brain
  participant W as smabo-web
  participant A as smabo-app

  E-&gt;&gt;E: config.json を読み込み、Wi-Fi 接続
  E-&gt;&gt;B: WebSocket 接続（/esp32）
  B-&gt;&gt;W: notice（esp32 connected）
  E-&gt;&gt;B: set_config（設定の全体）
  B-&gt;&gt;B: オドメトリのパラメータと関節名を更新
  W-&gt;&gt;B: WebSocket 接続（/ui）
  B-&gt;&gt;W: /vision/config（現在の画像処理設定）
  B-&gt;&gt;W: notice（接続中のクライアント）
  A-&gt;&gt;B: WebSocket 接続（/）
  B-&gt;&gt;W: notice（app connected）
  W-&gt;&gt;E: GET /config
  E--&gt;&gt;W: 設定の全体
</pre>

### 手動走行

<pre class="mermaid">
sequenceDiagram
  participant W as smabo-web
  participant B as brain
  participant E as smabo-esp32

  W-&gt;&gt;B: /web/cmd_vel（geometry_msgs/Twist）
  B-&gt;&gt;E: /cmd_vel
  E-&gt;&gt;E: DC モータを駆動（cmd_timeout 内に次の指令が無ければ停止）
  E-&gt;&gt;B: /esp32/wheel_vel（left, right, dt）
  B-&gt;&gt;B: オドメトリ積分
  B-&gt;&gt;W: /odom（nav_msgs/Odometry）
</pre>

### サーボの直接操作

<pre class="mermaid">
sequenceDiagram
  participant W as smabo-web
  participant B as brain
  participant E as smabo-esp32

  W-&gt;&gt;B: /web/servo/command（trajectory_msgs/JointTrajectory）
  B-&gt;&gt;E: /servo/command
  E-&gt;&gt;E: 各点を time_from_start に従って反映、最終角度を保存
  loop servos.joint_states_rate
    E-&gt;&gt;B: /esp32/joint_states
    B-&gt;&gt;W: /joint_states
  end
</pre>

### 動作計画（smabo-brain-ros）

<pre class="mermaid">
sequenceDiagram
  participant W as smabo-web（Motion Plan タブ）
  participant RB as rosbridge
  participant MS as robot_model_server
  participant MG as move_group
  participant SB as servo_trajectory_bridge
  participant E as smabo-esp32

  W-&gt;&gt;RB: call_service /smabo/get_file（URDF・SRDF・メッシュ）
  RB-&gt;&gt;MS: GetFile
  MS--&gt;&gt;W: ファイルの中身（base64）
  W-&gt;&gt;W: three.js でロボットを描画
  opt 先端をドラッグ（arm グループ）
    W-&gt;&gt;RB: call_service /compute_ik（位置のみ）
    RB-&gt;&gt;MG: GetPositionIK
    MG--&gt;&gt;W: 関節角（目標姿勢）
  end
  W-&gt;&gt;RB: call_service /plan_kinematic_path
  RB-&gt;&gt;MG: GetMotionPlan
  MG--&gt;&gt;W: 軌道（RobotTrajectory）
  W-&gt;&gt;W: 軌道をアニメーション表示
  W-&gt;&gt;RB: send_action_goal /execute_trajectory
  RB-&gt;&gt;MG: ExecuteTrajectory
  MG-&gt;&gt;SB: FollowJointTrajectory（smabo_arm_controller / smabo_gripper_controller）
  SB-&gt;&gt;RB: /servo/command（軌道全体）
  RB-&gt;&gt;E: /servo/command
  SB-&gt;&gt;SB: 軌道の時間が経過するまで待機
  SB--&gt;&gt;MG: 成功
  MG--&gt;&gt;W: 結果
</pre>

### ナビゲーション（smabo-brain-ros）

<pre class="mermaid">
sequenceDiagram
  participant W as smabo-web（Navigation タブ）
  participant RB as rosbridge
  participant N as Nav2
  participant O as odom_node
  participant E as smabo-esp32

  W-&gt;&gt;RB: /web/initialpose
  RB-&gt;&gt;N: /initialpose（AMCL）
  W-&gt;&gt;RB: send_action_goal /navigate_to_pose
  RB-&gt;&gt;N: NavigateToPose ゴール
  loop 走行中
    E-&gt;&gt;RB: /esp32/wheel_vel・/esp32/scan
    RB-&gt;&gt;O: /wheel_vel
    O-&gt;&gt;N: /odom・tf（odom→base_link）
    RB-&gt;&gt;N: /scan
    N-&gt;&gt;RB: /cmd_vel
    RB-&gt;&gt;E: /cmd_vel
  end
  N--&gt;&gt;RB: 結果
  RB--&gt;&gt;W: 結果
</pre>

### 画像処理（smabo-brain）

<pre class="mermaid">
sequenceDiagram
  participant A as smabo-app
  participant B as smabo-brain
  participant W as smabo-web
  participant E as smabo-esp32

  A-&gt;&gt;B: /app/webrtc/offer
  B--&gt;&gt;A: /webrtc/answer
  A-)B: カメラ映像（WebRTC）
  W-&gt;&gt;B: /web/vision/config（検出方法・追従動作）
  B-&gt;&gt;W: /vision/config（更新後の設定）
  loop フレームごと（処理中のフレームは間引く）
    B-&gt;&gt;B: 検出（aruco / color / face / qr）
    B-&gt;&gt;W: /vision/detections・/vision/markers
    B-&gt;&gt;A: /look_at（behaviors.look_at）
    B-&gt;&gt;E: /servo/command（behaviors.servo）
    B-&gt;&gt;E: /cmd_vel（behaviors.drive）
    B-&gt;&gt;A: /speech/say（speak、内容が変わったときだけ）
  end
</pre>

smabo-brain-ros では、`webrtc_camera_node` → `image_processor_node` → `gaze_policy_node`・`neck_policy_node`・`drive_policy_node` の順に処理します。smabo-brain との違いは次のとおりです。

- 各 policy ノードは `/vision/config` の `behaviors`（look_at・servo・drive）を参照しません。`/vision/detections` を受けるたびに、それぞれ `/look_at`・`/servo/command`・`/cmd_vel` を出力します。
- 首と走行の追従は PID の状態を持たず、ゲイン（`servo_gain`、`drive_k_ang`・`drive_k_lin`）による比例制御です。

### 音声認識

<pre class="mermaid">
sequenceDiagram
  participant A as smabo-app
  participant B as brain
  participant W as smabo-web

  A-&gt;&gt;A: ウェイクワード（smabo）を検出し、発話を録音
  A-&gt;&gt;B: /app/speech/audio（base64 の WAV）
  B-&gt;&gt;B: STT（vosk または faster-whisper）
  B-&gt;&gt;W: /speech/recognized
</pre>

### ESP32 の設定変更

<pre class="mermaid">
sequenceDiagram
  participant W as smabo-web
  participant E as smabo-esp32
  participant B as smabo-brain

  W-&gt;&gt;E: POST /config（変更部分）
  E-&gt;&gt;E: config.json に保存
  alt i2c・pca9685・wifi・dc.pins・エンコーダのピンを含む
    E-&gt;&gt;E: 再起動
  else それ以外
    E-&gt;&gt;E: 該当サブシステムを再読み込み
  end
  E--&gt;&gt;W: {"ok": true}
  E-&gt;&gt;B: set_config（設定の全体、brain.rosbridge が false のとき）
</pre>

## API仕様書

本機能で使用するAPI仕様を下記に記載します。

### WebSocket のメッセージ形式

rosbridge v2.0 互換の JSON です。

| op | 方向 | 形式 |
| --- | --- | --- |
| `publish` | 双方向 | `{"op":"publish","topic":"/web/cmd_vel","msg":{...}}` |
| `set_config` | smabo-esp32 → smabo-brain | `{"op":"set_config","config":{設定の全体}}` |
| `notice` | smabo-brain → smabo-web | `{"op":"notice","source":"app","event":"connected","total":N}`（source は app／esp32、event は connected／disconnected） |
| `notice` | smabo-esp32 → brain | `{"op":"notice","message":"..."}` |
| `advertise` / `subscribe` | smabo-esp32 → rosbridge | `brain.rosbridge: true` のとき |
| `send_action_goal` | smabo-web → rosbridge | Navigation・Motion Plan タブ（roslib） |
| `call_service` | smabo-web → rosbridge | Motion Plan タブ（roslib） |

### トピック

トピック名は canonical 名です。送信時は送信元の prefix が付きます。

| トピック | 型 | 送信元 | 受信先 |
| --- | --- | --- | --- |
| `/cmd_vel` | geometry_msgs/Twist | smabo-web、画像処理（drive）、Nav2 | smabo-esp32 |
| `/servo/command` | trajectory_msgs/JointTrajectory | smabo-web、画像処理（servo / neck）、servo_trajectory_bridge | smabo-esp32 |
| `/wheel_vel` | smabo_interfaces/WheelVel（left, right [m/s], dt [s]） | smabo-esp32 | smabo-brain、odom_node |
| `/odom` | nav_msgs/Odometry | smabo-brain、odom_node | smabo-web、Nav2 |
| `/joint_states` | sensor_msgs/JointState | smabo-esp32、servo_trajectory_bridge（simulate 時） | smabo-web、smabo-brain、robot_state_publisher、MoveIt2 |
| `/scan` | sensor_msgs/LaserScan | smabo-esp32 | Nav2、slam_toolbox、smabo-web |
| `/ping` / `/pong` | std_msgs/String | smabo-web / smabo-esp32 | smabo-esp32 / smabo-web |
| `/imu/data` | sensor_msgs/Imu | smabo-app | smabo-web |
| `/gps/fix` | sensor_msgs/NavSatFix | smabo-app | smabo-web |
| `/speech/audio` | audio_common_msgs/AudioData（base64 の WAV） | smabo-app | smabo-brain、speech_recognizer_node |
| `/speech/recognized` | std_msgs/String | smabo-brain、speech_recognizer_node | smabo-web |
| `/speech/say` | std_msgs/String | smabo-web、画像処理（speak） | smabo-app |
| `/expression` | std_msgs/String（表情の名前） | smabo-web | smabo-app |
| `/look_at` | geometry_msgs/PoseStamped | smabo-web、画像処理（look_at） | smabo-app |
| `/vision/config` | std_msgs/String（data に JSON） | smabo-web、smabo-brain | smabo-brain、画像処理ノード、smabo-web |
| `/vision/detections` | vision_msgs/Detection2DArray | smabo-brain、image_processor_node | smabo-web、policy ノード |
| `/vision/markers` | std_msgs/String | smabo-brain、image_processor_node | smabo-web |
| `/webrtc/offer` / `/webrtc/app_ice` | std_msgs/String（data に JSON） | smabo-app | smabo-brain、webrtc_camera_node |
| `/webrtc/answer` | std_msgs/String（data に JSON） | smabo-brain、webrtc_camera_node | smabo-app |
| `/webrtc/preview` / `/webrtc/web_answer` / `/webrtc/web_ice` | std_msgs/String（data に JSON） | smabo-web | smabo-brain、webrtc_camera_node |
| `/webrtc/web_offer` | std_msgs/String（data に JSON） | smabo-brain、webrtc_camera_node | smabo-web |
| `/initialpose` | geometry_msgs/PoseWithCovarianceStamped | smabo-web | AMCL |
| `/map` | nav_msgs/OccupancyGrid | map_server、slam_toolbox | Nav2、smabo-web |
| `/camera/image_raw` | sensor_msgs/Image（bgr8） | webrtc_camera_node | image_processor_node |

### アクション（smabo-brain-ros）

| アクション | 型 | サーバ | クライアント |
| --- | --- | --- | --- |
| `/navigate_to_pose` | nav2_msgs/action/NavigateToPose | Nav2 | smabo-web（Navigation タブ） |
| `/execute_trajectory` | moveit_msgs/action/ExecuteTrajectory | move_group | smabo-web（Motion Plan タブ） |
| `smabo_arm_controller/follow_joint_trajectory` | control_msgs/action/FollowJointTrajectory | servo_trajectory_bridge | move_group（`arm_joint_1`〜`3`） |
| `smabo_gripper_controller/follow_joint_trajectory` | control_msgs/action/FollowJointTrajectory | servo_trajectory_bridge | move_group（`arm_joint_4`） |

### サービス（smabo-brain-ros）

| サービス | 型 | サーバ | クライアント |
| --- | --- | --- | --- |
| `/smabo/get_file` | smabo_interfaces/srv/GetFile（`uri` → `success`・`message`・`data`） | robot_model_server | smabo-web（Motion Plan タブ） |
| `/compute_ik` | moveit_msgs/srv/GetPositionIK | move_group | smabo-web（Motion Plan タブ） |
| `/plan_kinematic_path` | moveit_msgs/srv/GetMotionPlan | move_group | smabo-web（Motion Plan タブ） |

`/smabo/get_file` の `uri` は `robot_description`（URDF）、`robot_description_semantic`（SRDF）、`package://<パッケージ>/<パス>`（パッケージ内のメッシュファイルのみ）のいずれかです。`data` は rosbridge では base64 の文字列になります。

### REST API（smabo-esp32）

| メソッド | パス | 本文 | 応答 |
| --- | --- | --- | --- |
| GET | `/config` | − | 設定の全体（JSON） |
| POST | `/config` | 設定の変更部分（JSON） | `{"ok": true}`、不正な JSON は 400 |
| POST | `/mode` | `modes` の変更部分（JSON） | `{"ok": true}`、不正な JSON は 400 |
| OPTIONS | 任意 | − | 204（CORS の事前確認） |

### MoveIt2 のグループ

| グループ | 内容 | 有効になる条件 |
| --- | --- | --- |
| `arm` | `arm_base_link` → `arm_tool0` のチェーン（`arm_joint_1`〜`3`）、位置のみの IK | `arm:=true` |
| `gripper` | `arm_joint_4` | `arm:=true` |
| `head` | `head_pan` | `mount:=neck` |

登録姿勢：`home`・`ready`（arm）、`close`・`open`（gripper）、`center`（head）

## 設定項目

本機能で設定可能な項目を下記に記載します。

### smabo-esp32（config.json）

既定値は `config.py` の `DEFAULTS` です。変更は `config.json` に保存され、既定値に上書きされます。

| 項目 | 既定 | 内容 |
| --- | --- | --- |
| `wifi.ssid` / `wifi.password` | `your-ssid` / `your-password` | Wi-Fi の接続先 |
| `wifi.hostname` | `esp32-robot` | ホスト名 |
| `brain.host` / `brain.port` | `192.168.1.100` / `9090` | brain の接続先 |
| `brain.rosbridge` | `false` | `true` で smabo-brain-ros（rosbridge）に接続 |
| `brain.path` | `""` | WebSocket のパス。空なら rosbridge 時 `/`、それ以外 `/esp32` |
| `i2c.sda` / `i2c.scl` / `i2c.freq` | `21` / `22` / `400000` | I2C |
| `pca9685.address` / `pca9685.freq` | `0x40` / `50` | PCA9685 |
| `modes.servos` | `true` | サーボを有効化 |
| `modes.dc_drive` | `false` | DC モータ（エンコーダなし）を有効化 |
| `modes.encoder_drive` | `false` | DC モータ＋エンコーダを有効化（`dc_drive` と同時に有効にすると `encoder_drive` を優先） |
| `modes.lidar` | `false` | LD06 を有効化 |
| `servos.behavior` | `manual` | `manual`／`random` |
| `servos.joints.<関節名>` | 下表 | 各サーボの設定 |
| `servos.random_groups` | `[]` | `random` 時に同時に動かす関節のグループ |
| `servos.joint_states_rate` | `20.0` | `/joint_states` の送信周期 [Hz]（0 で停止） |
| `dc.pins` | `pwma 32, ain2 33, ain1 25, stby 26, bin1 27, bin2 14, pwmb 12` | TB6612FNG のピン |
| `dc.pwm_freq` | `1000` | PWM 周波数 [Hz] |
| `dc.max_linear` / `dc.max_angular` | `0.30` / `1.50` | デューティ 100% に対応する速度 [m/s] / [rad/s] |
| `dc.wheel_radius` | `0.030` | 車輪の半径 [m] |
| `dc.wheel_separation` | `0.130` | 車輪の間隔 [m] |
| `dc.invert_left` / `dc.invert_right` | `false` | モータの回転方向を反転 |
| `dc.cmd_timeout` | `0.5` | この時間 `/cmd_vel` が来なければ停止 [s] |
| `encoder.left` / `encoder.right` | `a 34, b 35` / `a 36, b 39` | エンコーダのピン |
| `encoder.cpr` | `1440` | 車輪 1 回転あたりのカウント数 |
| `encoder.publish_rate` | `20.0` | 送信周期 [Hz] |
| `encoder.odom_frame` / `encoder.base_frame` | `odom` / `base_link` | オドメトリのフレーム名 |
| `encoder.covariance` | すべて `0.001` | `pose_xx`・`pose_yy`・`pose_aa`・`twist_vv`・`twist_ww` |
| `lidar.uart` / `lidar.rx` / `lidar.tx` / `lidar.baud` | `1` / `20` / `-1` / `230400` | LD06 の UART |
| `lidar.frame_id` | `laser` | `/scan` のフレーム名 |
| `lidar.bins` / `lidar.range_min` / `lidar.range_max` | `360` / `0.05` / `12.0` | `/scan` の分割数と距離範囲 [m] |

サーボの既定値（`min_us` 500、`max_us` 2500、`enabled` true、`invert` false は共通）

| 関節 | チャンネル | 角度範囲 | 初期角度 | 最大速度 [deg/s] |
| --- | --- | --- | --- | --- |
| `left_hand` | 0 | −90〜90 | 0 | 0（即時） |
| `right_hand` | 1 | −90〜90 | 0 | 0（即時） |
| `head_pan` | 2 | −90〜90 | 0 | 120 |
| `arm_joint_1`〜`arm_joint_4` | 3〜6 | −90〜90 | 0 | 90 |

### smabo-brain（起動引数）

| 引数 | 環境変数 | 既定 | 内容 |
| --- | --- | --- | --- |
| `--host` | − | `0.0.0.0` | 待ち受けアドレス |
| `--port` | − | `9090` | 待ち受けポート |
| `--vision-config` | `SMABO_VISION_CONFIG` | `vision_config.json` | 画像処理設定の保存先（起動時に読み込み、変更のたびに保存） |
| `--stt-engine` | `SMABO_STT_ENGINE` | `vosk` | `vosk`／`whisper` |
| `--stt-model` | `SMABO_STT_MODEL` | `""` | vosk はモデルのパス（空なら自動取得）、whisper はサイズ名 |
| `--stt-language` | `SMABO_STT_LANGUAGE` | `ja` | 音声認識の言語 |

### 画像処理設定（/vision/config）

smabo-web から変更します。送った項目だけが現在の設定に上書きされます。

| 項目 | 既定 | 内容 |
| --- | --- | --- |
| `enabled` | `false` | 画像処理を有効化 |
| `mode` | `off` | `off`／`aruco`／`color`／`face`／`qr` |
| `color` / `color_rgb` | `red` / なし | 検出する色（`color_rgb` があればそちらを優先） |
| `color_hue_tol` / `color_s_min` / `color_v_min` | `12` / `70` / `60` | 色の判定範囲 |
| `min_area_frac` | `0.0008` | 検出の最小面積（画面に対する割合） |
| `capture_fps` | `30.0` | 処理するフレームレート（1〜30） |
| `speak` | `false` | 認識した文字列を発話 |
| `aruco_dict` | `DICT_4X4_50` | ArUco の辞書 |
| `target_marker_id` | なし | 追従するマーカー（なしなら最大面積） |
| `hfov_deg` | `60.0` | カメラの水平画角 [deg] |
| `target_joints` | `pan head_pan, tilt "", kp 0.5, ki 0.0, kd 0.03, lost_tolerance 0` | 首（servo）の追従 |
| `behaviors` | `look_at true, servo false, drive false` | 検出結果で動かすもの |
| `drive` | `target_area_frac 0.10, kp_ang 1.5, kd_ang 0.15, kp_lin 2.0, max_ang 1.0, max_lin 0.20, deadzone 0.02, lost_tolerance 0` | 走行（drive）の追従 |

### smabo-app（設定画面）

| 項目 | 既定 | 内容 |
| --- | --- | --- |
| brain のホスト / ポート | `smabo-brain.local` / `9090` | 接続先 |
| カメラ | 前面 | 前面／背面 |
| IMU の送信周期 | `20` Hz | `/imu/data` |
| IMU・GPS・カメラ | 無効 | 送信の有無 |
| 音声 | 有効 | ウェイクワード `smabo`、TTS `ja-JP`、STT `ja_JP` |

### smabo-brain-ros（launch 引数）

`bringup.launch.py`

| 引数 | 既定 | 内容 |
| --- | --- | --- |
| `sim` | `false` | 実機なしで動かす（servo_trajectory_bridge が `/joint_states` を送信） |
| `slam` | `false` | AMCL の代わりに slam_toolbox で地図を作成 |
| `use_nav` / `use_moveit` / `use_vision` / `use_speech` / `use_rosbridge` | `true` | 各機能の起動 |
| `rosbridge_port` | `9090` | rosbridge のポート |
| `arm` / `hand` / `breadboard` / `mount` | `true` / `false` / `false` / `none` | ロボットの構成（URDF と SRDF に渡す） |

主なノードのパラメータ

| ノード | パラメータ | 既定 |
| --- | --- | --- |
| `odom_node` | `wheel_separation`、`odom_frame`、`base_frame`、`publish_tf`、共分散 | `0.13`、`odom`、`base_link`、`true`、`0.001` |
| `servo_trajectory_bridge` | `action_names`、`command_topic`、`simulate`、`joint_states_rate` | arm・gripper の 2 つ、`/servo/command`、`false`、`20.0` |
| `speech_recognizer_node` | `stt_engine`、`stt_model`、`stt_language` | `vosk`、`""`、`ja` |
| `vision.launch.py` | `mode`、`color`、`image_width`、`image_height`、`hfov_deg`、`capture_fps` | `off`、`red`、`640`、`480`、`60.0`、`30.0` |

Nav2 の主な設定（`nav2_params.yaml`）：DWB の `max_vel_x` 0.30 m/s、`max_vel_theta` 1.50 rad/s、costmap の `robot_radius` 0.12 m、解像度 0.05 m

## 起動方法

### smabo-brain

```bash
cd smabo-brain
./run.sh                 # 初回は venv の作成と依存の導入も行う
./run.sh --port 9091     # 引数は python -m brain に渡る
```

### smabo-brain-ros

```bash
cd smabo-brain-ros
docker compose build
docker compose up        # bringup.launch.py を起動

# 実機なし
docker compose run --rm smabo-ros ros2 launch smabo_bringup bringup.launch.py sim:=true

# 構成の指定（例：ハンド＋ブレッドボード＋移動台車）
docker compose run --rm smabo-ros ros2 launch smabo_bringup bringup.launch.py arm:=false hand:=true breadboard:=true mount:=tt_motor
```

smabo-brain と smabo-brain-ros は同じディレクトリに並べて置きます（smabo-brain は実行時にマウントされます）。

### smabo-web

```bash
cd smabo-web
npm install
npm run dev              # http://localhost:5173
```

ヘッダに brain の `host:port` と ESP32 のホストを入力して接続します。

### smabo-esp32

MicroPython を書き込んだ ESP32 に各 `.py` を転送し、`config.json` で Wi-Fi と brain の接続先を設定します。ボードごとの設定例は `configs/` にあります。

### smabo-app

```bash
cd smabo-app
~/development/flutter/bin/flutter run
```

設定画面で brain のホストとポートを入力します。
