---
title: "smabo システム設計"
description: "smabo（スマホロボット）システム全体の構成と、smabo-esp32 ファームウェアの詳細設計。"
---

- **対象**: smabo（スマホロボット）システム全体（smabo-app / smabo-web / smabo-brain / smabo-brain-ros / smabo-esp32 / smabo-sim / smabo-protocol）
- **通信プロトコル**: rosbridge v2.0 互換 WebSocket JSON。中継サーバ **smabo-brain**（または smabo-brain-ros）を中心としたハブ&スポーク構成
- **設定系**: ESP32・スマホの config / mode は各機器の REST API。smabo-web は smabo-brain の `/devices/…` に送り、smabo-brain が機器へ中継する
- **認証**: 既定はなし（LAN 内利用前提）。smabo-brain を `--pairing` で起動したときだけペアリングを使う
- **更新日**: 2026-11-22

> 本ドキュメントは、smabo システム全体の構成（[システム全体構成](#システム全体構成) / [コンポーネント概要](#コンポーネント概要) / [画像処理](#画像処理物体検出と追従)）と、
> 各コンポーネントのうち最も実装詳細の多い **smabo-esp32（ファームウェア）の詳細**（§1〜§8）をまとめます。

---

## システム全体構成

smabo は、中継サーバ **smabo-brain** を中心に各コンポーネントが WebSocket クライアントとして
ぶら下がる**ハブ&スポーク構成**です。各コンポーネントは smabo-brain の宛先だけを知っていればよく、
相互の直接接続は持ちません（設定系の REST も smabo-brain が中継します）。
smabo-brain の代わりに **smabo-brain-ros**（rosbridge_suite）を置いても、クライアント側の手順は同じです。

### コンポーネント構成

| コンポーネント | 役割 | 実装 | brain との接続 |
|---|---|---|---|
| smabo-app | smabo の「顔（目）」とスマホセンサ（IMU / GPS / カメラ / ウェイクワード検出＋音声録音） | Flutter（スマートフォン） | WS クライアント（`/app` prefix）＋ 設定の REST（`:8081`） |
| smabo-web | 制御 UI・テレメトリ可視化・設定 | React / TypeScript（ブラウザ） | WS クライアント（`/web` prefix）＋ brain の HTTP API（`/devices/…`・ペアリング） |
| smabo-brain | 中継ハブ＋マイコンでできない上位処理（オドメトリ積分・画像処理・音声認識） | Python / aiohttp（PC / SBC） | **サーバ**（`ws://<host>:9090/`） |
| smabo-brain-ros | smabo-brain の ROS 2 版（rosbridge_suite / Nav2 / MoveIt2） | ROS 2 Humble（Docker） | **サーバ**（rosbridge、`ws://<host>:9090/`） |
| smabo-esp32 | アクチュエータ制御・センサ取得 | MicroPython（ESP32） | WS クライアント（`/esp32` prefix）＋ 設定の REST（`:80`） |
| smabo-sim | 実機なしで ESP32 とスマホの代わりをするシミュレータ | Python | ESP32・スマホと同じ（WS クライアント＋ REST） |
| smabo-protocol | トピック表（誰が何を送り、何を受け取るか）の一次情報 | JSON ＋ 生成スクリプト | ―（各リポジトリに写しを生成） |

### 通信トポロジ

<pre class="mermaid">
graph TB
    app["smabo-app（顔・センサ）"]
    web["smabo-web（制御UI）"]
    esp32["smabo-esp32（アクチュエータ／センサ）"]
    brain{{"smabo-brain / smabo-brain-ros　ws://host:9090/"}}

    app &lt;--&gt; |"WS（/app prefix）"| brain
    web &lt;--&gt; |"WS（/web prefix）"| brain
    esp32 &lt;--&gt; |"WS（/esp32 prefix）"| brain
    web -.-&gt; |"HTTP /devices/esp32/… /devices/app/…"| brain
    brain -.-&gt; |"REST /config /mode（中継）"| esp32
    brain -.-&gt; |"REST /config（中継）"| app
</pre>

### 通信モデル

| 項目 | 内容 |
|---|---|
| プロトコル | RFC 6455 WebSocket、UTF-8 JSON（rosbridge v2.0 互換）、1 メッセージ = 1 フレーム |
| 待受 | brain が `:9090` の **`/` 1 か所**で待ち受ける。smabo-brain と smabo-brain-ros で同じ |
| 接続手順 | 接続 → 送るトピックを `advertise`、読むトピックを `subscribe` → 送信元 prefix 付きで `publish` → `/hello` を 1 回送る（[接続と役割の判別](#接続と役割の判別)） |
| 設定系 | ESP32（`:80`）とスマホ（`:8081`）がそれぞれ REST API を持つ。smabo-web は smabo-brain の `/devices/esp32/…`・`/devices/app/…` へ送り、smabo-brain が機器へ**中継**する。smabo-brain-ros のときは機器へ直接送る |
| 認証 | 既定はなし（信頼済み LAN 内利用前提）。smabo-brain を `--pairing` で起動したときだけペアリングを使う（[設定の中継とペアリング](#設定の中継とペアリング)） |

### 接続と役割の判別

すべてのクライアントが同じ `ws://<brain>:9090/` につなぐので、smabo-brain は最初のフレームから
クライアントの役割（web / app / esp32）を判別します。送信元 prefix 付きの `publish` / `advertise`
（`/web/…`・`/app/…`・`/esp32/…`）か、その役割だけが読むトピックの `subscribe` が手掛かりです。
ペアリング時は、token の控えに記録された役割で決まります。

接続直後の流れは次のとおりです。

1. ペアリング済みなら最初のフレームで token を見せる（`{"op":"auth","token":…}`）。招待コードでペアリングするときは `{"op":"pair","code":…}`。
2. 送るトピックを `advertise`、読むトピックを `subscribe` する（トピックと型は smabo-protocol の表どおり）。
3. `/hello` を 1 回 publish する：`{"protocol": N, "client": 名前, "version": x.y.z}`。
4. brain は `/brain/info`（`{"protocol": N, "brain": 名前, "version": x.y.z}`）を返し、5 秒ごとにも送る。プロトコル番号が違えば、brain と各クライアントの両方が警告する（smabo-web には `hello` の notice で表示）。

smabo-brain は 5 秒ごとに WebSocket の ping を送るので、電源を切った ESP32 もおよそ 10 秒で切断として検知します。

<pre class="mermaid">
flowchart TD
    c["クライアントが ws://brain:9090/ に接続"] --&gt; p{"brain は --pairing で起動?"}
    p -- "いいえ（既定）" --&gt; f["届いたフレームの送信元 prefix&lt;br/&gt;または その役割だけが読む subscribe"]
    p -- "はい" --&gt; a{"最初のフレームの auth / pair"}
    a -- "通らない" --&gt; x["切断"]
    a -- "通る" --&gt; t["token の控えにある役割"]
    f -- "/web/…" --&gt; w["web"]
    f -- "/app/…" --&gt; ap["app"]
    f -- "/esp32/…" --&gt; e["esp32"]
    t --&gt; h
    w --&gt; h
    ap --&gt; h
    e --&gt; h["/hello を受けて /brain/info を返す&lt;br/&gt;（以後 5 秒ごと・プロトコル番号を照合）"]
</pre>

### 設定の中継とペアリング

**設定の中継**: smabo-web は ESP32・スマホの設定（config / mode）を smabo-brain の
`/devices/esp32/…`・`/devices/app/…` へ送り、smabo-brain が各機器の REST API
（ESP32 `:80`、スマホ `:8081`）へ転送します（`brain.gateway`）。転送先は、その機器が
smabo-brain につないでいる WebSocket の相手のアドレスです。

| 項目 | 内容 |
|---|---|
| 目印 | smabo-brain は `/brain/info` に `relay: true` を付ける。smabo-web はこれを見て中継を使う（smabo-brain-ros は付けないので、機器へ直接送る） |
| 機器の場所 | 機器は自分の REST の場所を `/config_url`（ESP32）・`/phone/config_url`（スマホ）で 5 秒ごとに知らせる。smabo-web はアドレスを入力しなくても設定 API を見つけられる |
| 変更の知らせ | 設定が変わると、機器は `/config`（ESP32、Wi-Fi を除く）・`/phone/config`（スマホ）を送る。smabo-web はそれを見て REST で読み直す |
| 機器が未接続 | 機器が smabo-brain につながっていないときは `504 device_offline`（直接送る予備の経路はない） |
| 例外 | ペアリング前の機器への招待コードと、Bluetooth の Wi-Fi 設定（Improv）は、smabo-web が機器へ直接送る |

設定を変えるときの流れ（smabo-brain の中継と、smabo-brain-ros での直接送信）:

<pre class="mermaid">
sequenceDiagram
    participant web as smabo-web
    participant brain as smabo-brain
    participant dev as ESP32 / スマホ（REST）

    dev-&gt;&gt;brain: /config_url・/phone/config_url（5 秒ごと）
    brain-&gt;&gt;web: REST の場所を配信
    alt smabo-brain（/brain/info に relay: true）
        web-&gt;&gt;brain: POST /devices/esp32/config（部分パッチ）
        brain-&gt;&gt;dev: POST /config（WebSocket の相手のアドレスへ転送）
        dev--&gt;&gt;brain: {"ok": true}
        brain--&gt;&gt;web: {"ok": true}
    else smabo-brain-ros（relay なし）
        web-&gt;&gt;dev: POST /config（直接）
        dev--&gt;&gt;web: {"ok": true}
    end
    dev-&gt;&gt;brain: /config・/phone/config（変更の知らせ）
    brain-&gt;&gt;web: 配信
    web-&gt;&gt;dev: GET /config で読み直す（上と同じ経路）
</pre>

**ペアリング**: 既定ではなし（教育用途で、教室や家庭の LAN 内で使う前提）。smabo-brain を
`--pairing`（または `SMABO_PAIRING=1`）で起動したときだけ有効になります。

| 項目 | 既定（ペアリングなし） | `--pairing` |
|---|---|---|
| 接続 | 誰でもつながる。最初のフレームの `{"op":"auth"}` には `{"auth":false,"reason":"no_auth"}` で即答 | ペアリングで受け取った token を最初のフレームで見せる。最初のブラウザは smabo-brain のログに出るコード、2 台目以降は smabo-web が出す招待コード（5 分間・1 回だけ有効）でペアリング |
| 役割の判別 | 最初に届いたフレームの送信元 prefix | token の控えに記録された役割（違う prefix のトピックは捨てる） |
| 設定の中継 | 鍵なしで転送 | smabo-web は Bearer token を付け、smabo-brain は機器の中継用の鍵（`X-Smabo-Relay-Key`）を付けて転送 |
| 機器の REST | 誰からでも受け付ける | ペアリング済みの機器は、中継用の鍵のない要求を 401 で断る |
| 控え | ― | token の SHA-256 だけを `~/.smabo/brain/pairings.json` に保存 |

招待コードは 5 回続けて間違えると、開いているコードがすべて無効になります。
ペアリング済みの機器（ESP32・スマホ・smabo-sim）がペアリングなしの smabo-brain につながったときは、
token と鍵のハッシュを持ったまま REST を誰からでも受け付けます。`--pairing` の smabo-brain に
つなぐと、smabo-brain 以外からの要求を断ります。brain が token を知らないと答えたとき
（smabo-web でペアリングを解除した、brain をリセットした）は、機器はペアリングを忘れて招待を待ちます。

smabo-brain の HTTP API（`brain.gateway`、OPTIONS 以外は `--pairing` のとき Bearer token が必要）:

| メソッド・パス | 内容 |
|---|---|
| `GET /pairings` | ペアリング済みのクライアント一覧と、自分がどれか |
| `POST /invites {role, name?}` | 新しいクライアント用の招待コード（5 分間・1 回だけ） |
| `PATCH /pairings/{id} {name}` | 名前の変更 |
| `DELETE /pairings/{id}` | ペアリング解除（そのクライアントの接続も閉じる） |
| `* /devices/{app\|esp32}/{path}` | その機器の REST API へ転送 |

### 操作権（同時に操縦できるのは 1 つのブラウザだけ）

複数の smabo-web（タブ・人）が同時にロボットを見られますが、走行（`/cmd_vel`）とアーム
（`/servo/command`）を送れるのは、その時点で**操作権を持つ 1 つのブラウザ**だけです
（smabo-brain の `brain.control`）。2 つのジョイスティックが互いの指令を打ち消し合うのを防ぎます。

- 誰も操作権を持っていなければ、最初に走行かアームの指令を送ったブラウザが、そのまま操作権を得る。
- 誰かが持っている間、ほかのブラウザの指令は捨てられる。ほかのブラウザには「〇〇が操縦中」と「Take over」ボタン（`{"op":"control","action":"claim"}`）が出て、押すとすぐ操作権が移る。
- 停止（速度 0 の `/cmd_vel`）は誰からでも通る（操作権は取らない）。
- 操作権は `{"op":"control","action":"release"}`、タブを閉じる、接続が切れる、のいずれかで手放される。
- 操作権が移るとき（手放されたときも）、smabo-brain はロボットを止め（速度 0 の `/cmd_vel`）、全ブラウザに今の持ち主を知らせる（`control` の notice）。

<pre class="mermaid">
stateDiagram-v2
    [*] --&gt; 空き
    空き --&gt; Aが操縦中 : A が走行かアームの指令を送る
    Aが操縦中 --&gt; Aが操縦中 : A の指令は通る、B の指令は捨てる（停止は通す）
    Aが操縦中 --&gt; Bが操縦中 : B が Take over（claim）、ロボットを停止
    Aが操縦中 --&gt; 空き : release・タブを閉じる・切断、ロボットを停止
    Bが操縦中 --&gt; 空き : release・タブを閉じる・切断、ロボットを停止
</pre>

### 送信元 prefix 規約

各クライアントは publish するトピックに**送信元 prefix** を付けて送ります
（smabo-app → `/app`、smabo-web → `/web`、smabo-esp32 → `/esp32`）。
brain はこの prefix を**剥がしてから** canonical なトピック名で宛先へ配信します
（例: web が送る `/web/cmd_vel` → `/cmd_vel`、esp32 が送る `/esp32/wheel_vel` → `/wheel_vel` と、積分した `/odom`）。
受信側は常に prefix 無しの canonical 名で受け取ります。
`advertise` / `subscribe` / `auth` / `pair` / `control` / `notice` など publish 以外の op には prefix は付きません。

<pre class="mermaid">
flowchart LR
    subgraph send["送り手（prefix 付き）"]
        w1["smabo-web&lt;br/&gt;/web/cmd_vel"]
        e1["smabo-esp32&lt;br/&gt;/esp32/wheel_vel"]
        a1["smabo-app&lt;br/&gt;/app/imu/data"]
    end
    b{{"brain&lt;br/&gt;prefix を剥がす"}}
    subgraph recv["受け手（canonical 名）"]
        e2["smabo-esp32&lt;br/&gt;/cmd_vel"]
        w2["smabo-web&lt;br/&gt;/wheel_vel・/odom・/imu/data"]
    end
    w1 --&gt; b
    e1 --&gt; b
    a1 --&gt; b
    b --&gt; e2
    b --&gt; w2
</pre>

### トピック一覧

トピック・型・送り手・受け手は **smabo-protocol の `protocol.json`** が一次情報です（プロトコル番号 1）。
`gen.py` が各リポジトリ向けの写し（smabo-brain・smabo-sim・smabo-esp32 は Python、smabo-web は TypeScript、smabo-app は Dart）を生成し、
各リポジトリの CI が写しの古さを検出します。「brain」は brain 自身が作って送る、または brain が受け取って使うトピックです。

| トピック | 型 | 送る | 受け取る | 内容 |
|---|---|---|---|---|
| `/brain/info` | std_msgs/String | brain | web, app, esp32 | brain のプロトコル番号と版（JSON）。接続時と `/hello` の後、5 秒ごと |
| `/hello` | std_msgs/String | web, app, esp32 | brain | クライアントのプロトコル番号と版（JSON）。接続のたびに 1 回 |
| `/cmd_vel` | geometry_msgs/Twist | web | esp32 | 走行指令（速度と角速度） |
| `/servo/command` | trajectory_msgs/JointTrajectory | web | esp32 | サーボの軌道 |
| `/joint_states` | sensor_msgs/JointState | esp32 | brain | サーボの角度 |
| `/wheel_vel` | smabo_interfaces/WheelVel | esp32 | web, brain | 左右の車輪の速度。brain が `/odom` に積分し、web にもそのまま送る（車輪ごとの回転の確認用） |
| `/odom` | nav_msgs/Odometry | brain | web | 車輪の速度から積分した自己位置 |
| `/scan` | sensor_msgs/LaserScan | esp32 | web | LiDAR の距離。web では Sensors タブの点群表示に使う |
| `/ping` / `/pong` | std_msgs/String | web / esp32 | esp32 / web | WebSocket の往復確認（esp32 が `/ping` の中身をそのまま `/pong` で返す） |
| `/config` | std_msgs/String | esp32 | web, brain | ESP32 の設定の写し（Wi-Fi を除く JSON）。変わったとき。brain はオドメトリに使う |
| `/config_url` | std_msgs/String | esp32 | web | ESP32 の設定 REST API の場所（`http://ip:port`）。5 秒ごと |
| `/phone/config` | std_msgs/String | app | web | スマホの設定の全体（JSON）。変わったとき |
| `/phone/config_url` | std_msgs/String | app | web | スマホの設定 REST API の場所。5 秒ごと |
| `/imu/data` | sensor_msgs/Imu | app | web | スマホの IMU |
| `/gps/fix` | sensor_msgs/NavSatFix | app | web | スマホの GPS |
| `/look_at` | geometry_msgs/PoseStamped | web | app | 目で追う先 |
| `/expression` | std_msgs/String | web | app | 表情の名前（大文字小文字は区別しない） |
| `/speech/say` | std_msgs/String | web | app | 読み上げる文字列 |
| `/speech/audio` | audio_common_msgs/AudioData | app | brain | 録音した音声（base64 の WAV）。brain が文字にする |
| `/speech/recognized` | std_msgs/String | brain | web | 音声認識の結果 |
| `/vision/config` | std_msgs/String | web | web, brain | 画像処理の設定（JSON） |
| `/vision/detections` | vision_msgs/Detection2DArray | brain | web | 画像処理の検出結果 |
| `/vision/markers` | std_msgs/String | brain | web | AR マーカー番号・QR の内容 |
| `/webrtc/offer` / `/webrtc/app_ice` | std_msgs/String | app | brain | WebRTC のシグナリング（app → brain） |
| `/webrtc/answer` | std_msgs/String | brain | app | WebRTC のシグナリング（brain → app） |
| `/webrtc/preview` | std_msgs/String | web | brain | プレビュー映像の開始・停止 |
| `/webrtc/web_answer` / `/webrtc/web_ice` | std_msgs/String | web | brain | WebRTC のシグナリング（web → brain） |
| `/webrtc/web_offer` | std_msgs/String | brain | web | WebRTC のシグナリング（brain → web） |
| `/initialpose` | geometry_msgs/PoseWithCovarianceStamped | web | ― | 自己位置の初期値（smabo-brain-ros のみ） |
| `/goal_pose` | geometry_msgs/PoseStamped | web | ― | ナビゲーションの目的地（smabo-brain-ros のみ） |
| `/nav/command` | std_msgs/String | web | ― | SLAM・地図保存・ナビゲーションの指示（JSON、smabo-brain-ros のみ） |
| `/mode/command` | std_msgs/String | web | ― | ナビゲーション／動作計画モードの起動・終了の指示（JSON、smabo-brain-ros のみ） |

> smabo-brain-ros のみのトピックは、smabo-brain では捨てられます。

### smabo-brain の振り分け

smabo-brain は受け取った publish の送信元 prefix を外し、役割ごとに次の宛先へ配信します（`brain.server`）。

| 送り手 | smabo-brain の処理 |
|---|---|
| web | `/speech/say`・`/expression`・`/look_at` は **app へ**（`APP_TOPICS`）。`/vision/config` と `/webrtc/*` は **brain が受け取る**。それ以外は **esp32 へ**（`/cmd_vel`・`/servo/command` は操作権の確認を通る） |
| app | `/webrtc/offer`・`/webrtc/app_ice`・`/speech/audio` は **brain が受け取る**（WebRTC ピアと音声認識）。それ以外は **web へ** |
| esp32 | `/wheel_vel` は積分して `/odom` を **web へ**（`/wheel_vel` 自体も web へ）。`/config` は **brain も受け取り**（オドメトリの車輪寸法・共分散・frame 名）、変更の知らせとして web へも流す。それ以外は **web へ** |

smabo-brain-ros では、この振り分けを rosbridge_server と relay ノードが担います。prefix 付きトピックを
canonical 名へ中継する relay は、smabo-protocol の表から 1 トピックにつき 1 本ずつ起動します
（ESP32 の `/joint_states`・`/scan` は、ESP32 の時計を ROS の時刻に換算して stamp を付け直す `restamp_relay`。[LiDAR スキャンの時刻](#lidar-スキャンの時刻と回転中の歪み補正)）。

### WebSocket 通信シーケンス（全経路）

<pre class="mermaid">
sequenceDiagram
    participant app as smabo-app
    participant brain as smabo-brain
    participant web as smabo-web
    participant esp32 as smabo-esp32

    Note over app,esp32: ⓪ 接続（各クライアント共通）
    esp32-&gt;&gt;brain: advertise / subscribe（protocol の表どおり）
    esp32-&gt;&gt;brain: publish /esp32/hello {"protocol":1,…}
    brain-&gt;&gt;esp32: /brain/info {"protocol":1,…}（以後 5 秒ごと）

    Note over app,esp32: ① スマホセンサ（app → web）
    app-&gt;&gt;brain: publish /app/imu/data・/app/gps/fix
    brain-&gt;&gt;web: /app を剥がし /imu/data・/gps/fix を配信
    Note over app,brain: カメラ映像は WebRTC（app → brain、シグナリングは /webrtc/*）

    Note over app,esp32: ② 顔・発話の制御（web → app）
    web-&gt;&gt;brain: publish /web/look_at（/expression・/speech/say）
    brain-&gt;&gt;app: APP_TOPICS なので /look_at を app へ配信

    Note over app,esp32: ③ 走行・サーボ（web → esp32）
    web-&gt;&gt;brain: publish /web/cmd_vel・/web/servo/command
    Note over brain: 操作権の確認（持ち主以外の指令は捨てる。停止は通す）
    brain-&gt;&gt;esp32: /web を剥がし /cmd_vel・/servo/command を配信

    Note over app,esp32: ④ ロボット状態（esp32 → web）
    esp32-&gt;&gt;brain: publish /esp32/wheel_vel・/esp32/joint_states・/esp32/scan
    brain-&gt;&gt;web: /wheel_vel を積分した /odom と、/wheel_vel・/scan を配信
</pre>

### メッセージ定義（app / web）

rosbridge v2.0 互換の JSON です（`{"op":"publish","topic":...,"msg": <下記>}` の `msg` 部分）。
すべての `header` は `{"stamp":{"sec":<int>,"nanosec":<int>}, "frame_id":<string>}` 形式です。
smabo-esp32 が扱う `/cmd_vel`・`/servo/command`・`/joint_states`・`/wheel_vel`・`/scan`・`/config` の定義は §5 を参照してください。

**`/hello` — std_msgs/String**（各クライアント → brain） / **`/brain/info` — std_msgs/String**（brain → 各クライアント）

```json
{"data": "{\"protocol\": 1, \"client\": \"smabo-web\", \"version\": \"0.2.0\"}"}
{"data": "{\"protocol\": 1, \"brain\": \"smabo-brain\", \"version\": \"0.2.0\", \"relay\": true}"}
```

> 互換性を決めるのは `protocol` だけで、`version` は表示用です。`relay` は smabo-brain だけが付けます。

**`/imu/data` — sensor_msgs/Imu**（smabo-app → smabo-web）

```json
{
  "header": {"stamp": {"sec": 0, "nanosec": 0}, "frame_id": "imu_link"},
  "orientation": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0},
  "orientation_covariance": [0,0,0, 0,0,0, 0,0,0],
  "angular_velocity": {"x": 0.0, "y": 0.0, "z": 0.0},
  "angular_velocity_covariance": [0,0,0, 0,0,0, 0,0,0],
  "linear_acceleration": {"x": 0.0, "y": 0.0, "z": 9.81},
  "linear_acceleration_covariance": [0,0,0, 0,0,0, 0,0,0]
}
```

**`/gps/fix` — sensor_msgs/NavSatFix**（smabo-app → smabo-web）

```json
{
  "header": {"stamp": {"sec": 0, "nanosec": 0}, "frame_id": "gps"},
  "status": {"status": 0, "service": 1},
  "latitude": 35.681,
  "longitude": 139.767,
  "altitude": 40.0,
  "position_covariance": [c,0,0, 0,c,0, 0,0,c],
  "position_covariance_type": 1
}
```

> `position_covariance` の対角 `c` は水平精度の二乗（`horizontalAccuracy²`）。
> `status.status`=0（FIX）/ `service`=1（GPS）、`position_covariance_type`=1（APPROXIMATED）。

**カメラ映像 — WebRTC**（smabo-app → smabo-brain）

カメラ映像は WebRTC で smabo-app から smabo-brain へ送られます。映像メディア本体は
P2P（ローカル Wi-Fi のホスト候補のみ、STUN/TURN なし）で流れ、`/camera/image/compressed`
のような WebSocket トピックは使用しません。シグナリング（SDP / ICE 交換）だけが brain の
WebSocket を経由します。brain の ICE 候補は SDP に同梱します（non-trickle）。

| トピック | 向き | 内容 |
|---|---|---|
| `/webrtc/offer` | app → brain | オファー SDP（`{"data": "<JSON: sdp/type>"}`） |
| `/webrtc/answer` | brain → app | アンサー SDP（brain の ICE 候補を SDP に同梱） |
| `/webrtc/app_ice` | app → brain | app の ICE 候補 |
| `/webrtc/preview` | web → brain | プレビューの開始・停止（`{on}`） |
| `/webrtc/web_offer` | brain → web | プレビュー用のオファー SDP |
| `/webrtc/web_answer`・`/webrtc/web_ice` | web → brain | プレビューのアンサー SDP と web の ICE 候補 |

> smabo-brain は受信した映像からフレームを取り出して画像処理（[画像処理](#画像処理物体検出と追従)）に通し、
> smabo-web がプレビューを ON にしている間だけ、同じ映像（再エンコードなし）を web へ中継します。
> 検出枠は smabo-web が `/vision/detections` から重ねて描きます。aiortc（と PyAV）が入っていない環境では、
> WebRTC だけが無効になり、ほかの中継は動きます。

**`/look_at` — geometry_msgs/PoseStamped**（smabo-web → smabo-app、視線追従の目標）

```json
{
  "header": {"stamp": {"sec": 0, "nanosec": 0}, "frame_id": "base_link"},
  "pose": {
    "position":    {"x": 1.0, "y": -0.3, "z": 0.2},
    "orientation": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}
  }
}
```

> `position` を方向ベクトルとして解釈します（REP-103: x=前 / y=左 / z=上）。
> smabo-app は `gazeX = -y/x`・`gazeY = -z/x` で画面上の視線方向へ変換します（`pose` 無しの bare `Pose` も受理）。

**`/expression` — std_msgs/String**（smabo-web → smabo-app、表情の名前）

```json
{"data": "Angry"}
```

> 名前は大文字小文字と前後の空白を区別せずに照らし合わせます。知らない名前は無視されます（表示は変わらず、smabo-app のログに残る）。表情の名前は smabo-app の中で重ならないようになっています。

**`/speech/say` — std_msgs/String**（smabo-web → smabo-app、読み上げテキスト）
**`/speech/recognized` — std_msgs/String**（smabo-brain → smabo-web、認識テキスト）

```json
{"data": "こんにちは"}
```

**`/speech/audio` — audio_common_msgs/AudioData**（smabo-app → smabo-brain、wake 後に録音した発話音声）

```json
{"data": "<base64 エンコードした 16kHz モノラル WAV>"}
```

> `data` は `uint8[]`（rosbridge では base64 文字列）。中身は自己記述的な WAV（ヘッダに
> フォーマット / サンプルレート / チャンネルを持つ）なので追加フィールドは不要です。

> **音声認識の流れ**：smabo-app は**ウェイクワード検出だけ**を担当します。端末内の音声認識
> （speech_to_text）でウェイクワード（カタカナ表記などの揺れも含めて照合）を見つけると、発話を録音し
> （16kHz モノラル、無音が 1.5 秒続いたら停止）、WAV を base64 化して `/speech/audio` で smabo-brain に送ります。
> 顔をタップしても録音を始められます。smabo-brain は受信音声を STT エンジン
> （既定 vosk、`--stt-engine whisper` で faster-whisper も選択可）で文字起こしし、結果を
> `/speech/recognized` として配信します（smabo-web で確認できます）。

**`/odom` — nav_msgs/Odometry**（smabo-brain が `/wheel_vel` を積分して生成 → smabo-web / Nav2）

```json
{
  "header": {"stamp": {"sec": 0, "nanosec": 0}, "frame_id": "odom"},
  "child_frame_id": "base_link",
  "pose":  {"pose":  {"position": {"x": 0.0, "y": 0.0, "z": 0.0},
                      "orientation": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}},
            "covariance": ["…6×6 行優先 36 要素…"]},
  "twist": {"twist": {"linear":  {"x": 0.0, "y": 0.0, "z": 0.0},
                      "angular": {"x": 0.0, "y": 0.0, "z": 0.0}},
            "covariance": ["…6×6 行優先 36 要素…"]}
}
```

> `covariance`（各 36 要素）と frame 名は、smabo-brain が ESP32 の `/config` の `encoder.*` から付与します。

**`/ping` / `/pong` — std_msgs/String**（疎通確認。web → esp32 が `/ping`、esp32 → web が `/pong` でエコー）

```json
{"data": "<往復照合用トークン>"}
```

---

## コンポーネント概要

### smabo-app

smabo の「顔（目）」を表示し、スマートフォンの IMU / GPS / カメラをセンサとして提供します。
音声はウェイクワード検出と録音だけを担当し（STT は smabo-brain）、ウェイクワード後の録音音声を
`/speech/audio` で送ります。brain に WebSocket でつなぎ、`/app` prefix でセンサを publish、
`/look_at`・`/expression`・`/speech/say` を受けて目や発話を制御します。
設定は端末の REST API（`:8081`、`GET/POST /config`、表情は `/face/…`）で読み書きします。

スマホの IMU（`/imu/data`）は smabo-brain-ros では `/app/imu/data` → `/imu/data` に中継されます。
SLAM での使い道は [スマホ IMU の評価](#スマホ-imu-の評価2026-11-22-の実測) を参照してください。

### smabo-web

ブラウザ上の制御 UI（React / TypeScript）。タブは Face / Sensors / Drive / Servo / Vision /
Navigation / Motion Plan / Config / Log です。Navigation と Motion Plan は smabo-brain-ros 用で、
roslib と 3D ビューアで Nav2 / MoveIt2 を操作します。brain に WebSocket でつなぎ（`/web` prefix）、
ESP32・スマホの config / mode は smabo-brain の `/devices/…` を通して各機器の **REST** へ送ります（smabo-brain-ros では機器へ直接）。
Bluetooth（Web Bluetooth、Improv）で ESP32 に Wi-Fi の設定を送ることもできます。

#### Navigation タブ

Navigation タブは、地図を作る **SLAM** と、保存した地図の上で動く **Navigation** の 2 つのサブタブに分かれます。
どちらも smabo-brain-ros の同じ `nav` モード（Nav2）を使い、3D ビューは共通です。

<pre class="mermaid">
flowchart TB
    subgraph nav["Navigation タブ"]
        direction TB
        sub{"サブタブ"}
        subgraph slam["SLAM"]
            s1["Start SLAM ⇄ Stop（1 つのボタン）"]
            s2["マップ名 + Save&lt;br/&gt;保存できたら SLAM を止める"]
        end
        subgraph navi["Navigation"]
            n1["保存済みの地図を選ぶ"]
            n2["Start Navigation ⇄ Stop"]
        end
        subgraph view["3D ビュー（共通）"]
            v1["Pose Estimate・Nav2 Goal・Cancel goal&lt;br/&gt;（Navigation で地図ナビ中だけ）"]
            v2["Display（レイヤーの表示切り替え、右上）"]
            v3["ポインタの座標（map / odom / base_link）"]
        end
        sub --&gt; slam
        sub --&gt; navi
    end
    slam -. "もう片方が動いていれば&lt;br/&gt;止めてよいか確認" .- navi
</pre>

| 部分 | 動き |
|---|---|
| Start / Stop | 1 つのボタン。そのサブタブの側（SLAM か地図ナビ）が動いていれば Stop、止まっていれば Start。起動中・停止中は押せない |
| 起動の仕方 | Nav2 が止まっていれば `/mode/command`（`{"op":"start","mode":"nav","map":""}` で SLAM、`"map":"<名前>"` で地図ナビ）。動いていれば Nav2 を止めずに `/nav/command`（`mapping` / `navigate`）で切り替える |
| 切り替えの確認 | もう片方が動いているときは「Stop it and start …?」と確認してから切り替える（SLAM を止めると保存していない地図は消える） |
| Save | `/nav/command {"op":"save"}` を送り、nav_manager が保存を終えたと知らせたら（busy の後に `map` が保存名）モードを止める。失敗したら SLAM を続ける |
| 矢印ツール | SLAM 中は出さない（SLAM が自分で位置を推定する）。Cancel goal は Nav2 Goal を送ってから、着く・断られる・取り消すまでの間だけ押せる |
| Display | レイヤー（Map・Global / Local costmap・Plan・Footprint・Particles・Scan・Robot）。Particles は既定で非表示 |

#### 走行（Drive タブ）のキー操作

矢印キーを押している間だけ速度指令を送り、**キーを離したら**（またはウィンドウからフォーカスが外れたら）
すぐ停止（速度 0）を送ります。短く押しただけで、ESP32 のデッドマン（`dc.cmd_timeout`）まで進み続けることはありません。

#### リロード後の状態保持

ページを読み込み直しても、利用者が選んだ状態はブラウザの `localStorage` から戻します。
測定値・接続状態・実行中かどうかなどの「その場の状態」は保存しません。

<pre class="mermaid">
flowchart LR
    ui["利用者の操作&lt;br/&gt;（入力・選択・開閉）"] --&gt;|"usePersistentState"| ls[("localStorage&lt;br/&gt;smabo-ui:*")]
    ls --&gt;|"読み込み時に型を確認して復元&lt;br/&gt;（壊れた値は既定値）"| ui
    ros["Connect ROS"] --&gt;|"smabo-ros-connected"| ls2[("localStorage")]
    ls2 --&gt;|"Disconnect ROS まで&lt;br/&gt;リロード後に再接続"| ros
</pre>

| 保存するもの | キー |
|---|---|
| ROS の接続（Connect ROS を押してから Disconnect ROS まで） | `smabo-ros-connected` |
| brain・ESP32・スマホの接続先 | `smabo-brain-host`・`smabo-esp32-host`・`smabo-phone-host` |
| Navigation のサブタブ・2D / 3D・非表示レイヤー・選んだ地図 | `smabo-ui:nav.*` |
| Drive の速度上限、Motion Plan の group・関節の目標・計画パラメータ | `smabo-ui:drive.*`・`smabo-ui:plan.*` |
| Face の表情名・発話の履歴、Log のフィルタ・送信欄、表情エディタの選択 | `smabo-ui:face.*`・`smabo-ui:log.*`・`smabo-ui:expr.*` |
| Config の各セクションの開閉 | `smabo-ui:details.*` |

### smabo-brain

全コンポーネントが接続する中継ハブ（aiohttp）。送信元 prefix を剥がして canonical 名で配信し、
マイコンではできない上位処理（**オドメトリ積分** `/wheel_vel` → `/odom`、カメラ映像の**画像処理**、
`/speech/audio` の**音声認識（STT）** → `/speech/recognized`）を担います。STT エンジンは
既定 vosk、`--stt-engine whisper` で faster-whisper も選択できます（`brain.stt`、未導入なら無効）。
純ロジック（`brain.odometry`・`brain.vision`・`brain.stt`・`brain.topics`・`brain.control`・`brain.pairing`）は
transport から分離されており、smabo-brain-ros が import して再利用します。rosbridge 形式の JSON と時刻付けは
WebSocket 版だけの `brain.frames` が担います。
smabo-web の設定（REST）を ESP32・スマホへ転送する中継（`brain.gateway`、`/devices/…`）、
操作権の管理（`brain.control`）、`--pairing` で有効にするペアリング（`brain.pairing`）も持ちます。

<pre class="mermaid">
flowchart LR
    subgraph core["純ロジック（transport なし）"]
        odo["brain.odometry"]
        vis["brain.vision"]
        stt["brain.stt"]
        top["brain.topics"]
        ctl["brain.control"]
        pai["brain.pairing"]
    end
    subgraph ws["smabo-brain（WebSocket）"]
        srv["brain.server&lt;br/&gt;中継・振り分け"]
        fr["brain.frames&lt;br/&gt;JSON と時刻付け"]
        gw["brain.gateway&lt;br/&gt;/devices/… 中継"]
    end
    subgraph ros["smabo-brain-ros（ROS 2）"]
        nodes["odom_node・image_processor_node&lt;br/&gt;speech_recognizer_node・relay …"]
    end
    srv --&gt; core
    gw --&gt; pai
    nodes --&gt;|"import して再利用"| core
</pre>

### smabo-brain-ros

smabo-brain の ROS 2 版で、ROS 2 ランタイムでもあります。rosbridge_suite（WS ↔ ROS 2）と relay ノードが
smabo-brain と同じ接続口・同じトピックを提供し、smabo-brain の純ロジックを ROS 2 ノードで包んで再利用します。

| ノード | 役割 |
|---|---|
| relay / `restamp_relay` | prefix 付きトピックを canonical 名へ中継（ESP32 由来は ESP32 の時計を ROS の時刻に換算して stamp を付け直す） |
| `protocol_node` | `/brain/info` を 5 秒ごとと `/hello` の後に送り、プロトコル番号の違いを記録 |
| `odom_node` | `/wheel_vel` → `/odom` ＋ tf（`brain.odometry`） |
| `robot_state_publisher` / `robot_model_server` | URDF の配信と、rosbridge 越しの URDF・SRDF・メッシュの提供（`/smabo/get_file`） |
| `mode_manager` | Navigation（Nav2）と Motion Plan（MoveIt2）の排他的な起動・停止と、ロボットモデルの切り替え |
| `nav_manager` | Navigation の中で、SLAM（Cartographer）と地図上の自己位置推定（AMCL）を切り替え、地図を保存 |
| `servo_trajectory_bridge` | MoveIt2 の軌道を `/servo/command` として ESP32 へ渡す |
| `webrtc_camera_node` / `image_processor_node` / `gaze_policy_node` / `neck_policy_node` / `drive_policy_node` | 画像処理（`brain.vision`） |
| `speech_recognizer_node` | `/speech/audio` → STT → `/speech/recognized`（`brain.stt`） |

重いスタックは必要なときだけ子プロセス（`ros2 launch`）として動かします。`mode_manager` が Navigation と
Motion Plan のどちらか一方を起動し、起動する前に robot_state_publisher の URDF をそのモードのロボット
（Navigation は DG01D-E の台車＋ LD19、Motion Plan はアーム）に切り替えます。smabo-web は
`/mode/command` で起動・停止を指示し、`/mode/state`（ラッチ、変化時と毎秒）で状態を受け取ります。
子プロセスの起動と停止は、`mode_manager` と `nav_manager` で共通の `child_process.py`
（`start_group` / `stop_group`）にまとめてあります。プロセスグループ全体に SIGINT → SIGTERM → SIGKILL を
段階的に送り、古いノードが消えてから次のスタックを起動します。

<pre class="mermaid">
flowchart TB
    subgraph bringup["bringup（常に動く）"]
        rb["rosbridge :9090"]
        rl["relay / restamp_relay"]
        od["odom_node"]
        rsp["robot_state_publisher&lt;br/&gt;robot_model_server"]
        pn["protocol_node"]
        mm["mode_manager"]
    end
    mm --&gt;|"start nav（子プロセス）"| nav["nav.launch.py"]
    mm --&gt;|"start plan（子プロセス）"| plan["plan.launch.py"]
    mm -.-&gt;|"URDF を切り替え"| rsp
    nav --&gt; nav2["Nav2&lt;br/&gt;planner・controller・bt_navigator"]
    nav --&gt; nm["nav_manager"]
    nm --&gt;|"mapping（子プロセス）"| carto["Cartographer"]
    nm --&gt;|"navigation（子プロセス）"| amcl["map_server + AMCL"]
    plan --&gt; mg["move_group（MoveIt2）"]
    plan --&gt; stb["servo_trajectory_bridge"]
</pre>

コンテナ内の DDS（Fast DDS）は UDP だけを使い、共有メモリのトランスポートは使いません（`docker/fastdds_udp.xml`）。

> 共有メモリ（SHM）を使うと、ノードの再起動を繰り返したときに残った共有メモリのせいで `mode_manager` の
> 送信が止まる（デッドロックする）ことがありました。`FASTRTPS_DEFAULT_PROFILES_FILE` で UDP だけのプロファイルを
> 既定にし、コンテナの起動時に `/dev/shm` の Fast DDS のファイルを消します。

#### Navigation の起動と、SLAM / 地図ナビの切り替え

`mode_manager` は `/mode/command` の `map` で起動の仕方を決めます。`""`（空）なら SLAM、名前なら
その地図で AMCL です（`nav.launch.py` の `slam` / `map` 引数）。地図が無ければ何も止めずに `no such map` を返します。
Nav2 が動いている間の切り替えは `nav_manager`（`/nav/command`）が担い、Nav2 は動かしたままです。

<pre class="mermaid">
stateDiagram-v2
    direction LR
    [*] --&gt; 停止
    停止 --&gt; mapping : /mode/command start nav, map ""
    停止 --&gt; navigation : /mode/command start nav, map "名前"
    mapping --&gt; navigation : /nav/command navigate（同じ地図なら位置を引き継ぐ）
    navigation --&gt; mapping : /nav/command mapping
    mapping --&gt; mapping : /nav/command save（地図を保存）
    mapping --&gt; 停止 : /mode/command stop
    navigation --&gt; 停止 : /mode/command stop
    state mapping {
        [*] --&gt; Cartographer
    }
    state navigation {
        [*] --&gt; map_server_AMCL
    }
</pre>

smabo-web の SLAM タブで保存したときの流れ:

<pre class="mermaid">
sequenceDiagram
    participant web as smabo-web（SLAM タブ）
    participant nm as nav_manager
    participant mm as mode_manager

    web-&gt;&gt;nm: /nav/command {"op":"save","name":"room_1"}
    nm--&gt;&gt;web: /nav/state busy: true
    Note over nm: map_saver_cli で room_1.yaml / .pgm を書く
    alt 保存できた
        nm--&gt;&gt;web: /nav/state busy: false, map: "room_1"
        web-&gt;&gt;mm: /mode/command {"op":"stop"}
        Note over web: Navigation タブで room_1 を選んで Start Navigation
    else 失敗
        nm--&gt;&gt;web: /nav/state message: "map_saver failed …"
        Note over web: SLAM は続ける（地図を失わない）
    end
</pre>

#### Nav2 の調整（smabo 向け）

`smabo_navigation/config/nav2_params.yaml` のうち、smabo の重さとモータに合わせて変えた値です。

| 項目 | 値 | 理由 |
|---|---|---|
| `FollowPath.rotate_to_goal_heading` | `true` | ゴールに着いたあとの向き合わせを RotationShim がその場回転で行う（DWB に任せると止まりかけの低速で時間がかかった） |
| `FollowPath.max_angular_accel` | `10.0` | RotationShim は「今の速度＋加速度÷周波数」までしか出さないので、2.0 では止まった状態から 0.2 rad/s しか出ず回らなかった |
| `acc_lim_theta` / `decel_lim_theta` | `8.0` / `-8.0` | DWB の探索範囲が最低回転速度に届くように |
| `min_speed_xy` / `min_speed_theta` | `0.05` / `0.75` | 遅すぎる指令ではモータが鳴るだけで動かない。どちらかを超える軌道だけを候補にする（OR） |
| `always_send_full_costmap` | `true`（global / local） | 差分（`costmap_updates`）を使わない表示でも、コストマップがずれて見えないように |
| velocity_smoother `feedback` | `OPEN_LOOP` | 実測の速度に引きずられず、指令を素直に滑らかにする |

> **カメラ映像は rosbridge をバイパス**します。rosbridge は JSON over WebSocket のため、映像を
> `/camera/image/compressed`（base64 JSON）として通すとリアルタイム性が落ちます。そこで
> smabo-brain-ros は **WebRTC 終端ノード**（`webrtc_camera_node`、`brain.webrtc_hub` を再利用）を
> 持ち、smabo-app からの WebRTC 映像を終端してフレームを取り出し、**ネイティブ ROS の
> `sensor_msgs/Image`（`/camera/image_raw`）として DDS に publish** します。これを
> `image_processor_node` が購読するため、ROS グラフ内は高速なネイティブ転送になります。
> WebRTC のシグナリング（`/webrtc/*`、小さい JSON）は rosbridge 経由で問題ありません。

#### LiDAR スキャンの時刻と回転中の歪み補正

LiDAR は 1 周を約 0.1 秒かけて測ります。ロボットがその場で 1 rad/s で回ると、1 周の間に約 6° 向きが変わるので、
1 枚のスキャンが「ねじれ」ます。Cartographer は、i 番目の光線を `stamp + i × time_increment` に測ったとして、
オドメトリ（と IMU）からその瞬間の姿勢で光線を置き直し、このねじれを取り除きます。そのために次の 2 つをそろえています。

| どこで | 何を |
|---|---|
| smabo-esp32（`lidar_ld06.py`） | 光線を**測った順**（1 周の始まり＝LiDAR の生の角度 0 から）に並べる。時計回りの LiDAR では `angle_increment` が負。`stamp` は 1 周の始まり、`time_increment = scan_time / bins` |
| smabo-brain-ros（`restamp_relay`） | ESP32 の時計（起動からの ms）を ROS の時刻に換算する。受信した時刻をそのまま使わない |

<pre class="mermaid">
sequenceDiagram
    participant L as LiDAR（時計回り）
    participant E as smabo-esp32
    participant R as restamp_relay
    participant C as Cartographer

    Note over L,E: 1 周（約 0.1 秒）：生の角度 0° → 359° の順に測る
    L-&gt;&gt;E: 点（UART）
    E-&gt;&gt;E: ranges[i] = 生の角度 i° の距離（測った順）
    E-&gt;&gt;R: /esp32/scan（stamp = 1 周の始まり[ESP32 の時計]、time_increment、scan_time）
    Note over E,R: Wi-Fi の遅れ：ふつう数 ms、まれに 1 秒近く
    R-&gt;&gt;R: 時計のずれ = 直近 30 秒の min(受信時刻 − (stamp + scan_time))
    R-&gt;&gt;C: /scan（stamp = ESP32 の stamp + 時計のずれ）
    C-&gt;&gt;C: 光線 i の時刻 = stamp + i × time_increment で姿勢を補間して置き直す
</pre>

- **受信時刻を使わない理由**: 実測では、スキャンの遅れは中央値で数 ms ですが、まとめて届くことがあり、90% 点で 50 ms、最大 1 秒でした。受信時刻を付けると、そのスキャンを「別の向きで測った」ことになります。
- **時計のずれの求め方**（`ClockSync`）: 直近 30 秒でいちばん速く届いたメッセージの「受信時刻 − 送信時刻」を時計のずれとします。ESP32 の時計の進み方のずれ（数十 ppm）は 30 秒の窓で追従し、ESP32 が再起動して時計が 0 に戻ったら（5 秒以上の飛び）推定し直します。実測では、換算後の stamp は前のスキャンの終わりと 0.2 ms 以内でつながりました。
- **シミュレータ**: smabo-sim の LiDAR は全方向を一瞬で測るので、`time_increment = 0`（補正しない）。
- **注意**: 古いファームウェア（反時計回りに並べ直して先頭が 1 周の始まりでない）に新しい `restamp_relay` を組み合わせると、補正が逆向きにかかります。smabo-esp32 と smabo-brain-ros は一緒に更新してください。

#### スマホ IMU の評価（2026-11-22 の実測）

smabo-app の `/imu/data`（加速度・角速度）を、SLAM の回転推定に使えるかを実機で確かめました。
基準は LiDAR のスキャン照合（回転の前後で止まった状態のスキャンを比べ、一致誤差 4〜5 mm）です。

| 項目 | 結果 |
|---|---|
| 頻度・遅れ | 約 20 Hz。スマホの時計はホストより約 0.13 秒進んでいた（受信側で付け直す必要がある） |
| 静止時 | ジャイロの平均はほぼ 0、ばらつき 0.0005〜0.0015 rad/s（OS が補正済み） |
| 付け方 | 横向き・画面が前。スマホの x 軸が真上（加速度 +9.76 m/s²）。重力の向きでどちら向きに付けたかを判別できる |
| 回転量（実際 +370° / −365°） | ジャイロ +383° / −385°（**+4%**）、オドメトリ +353° / −351°（**−4%**） |
| 回転の速さの一致 | ジャイロとオドメトリの相関 0.99、時間のずれ 0.02 秒 |

<pre class="mermaid">
xychart-beta
    title "その場回転 1 回あたりの回転量（LiDAR = 基準）"
    x-axis ["左回り", "右回り"]
    y-axis "回転量 (deg, 絶対値)" 330 --&gt; 400
    bar [383, 385]
    bar [370, 365]
    bar [353, 351]
</pre>

> 棒は左から順にジャイロ・LiDAR（実際）・オドメトリ。ジャイロは多め、オドメトリは少なめで、どちらも一定の倍率（約 0.96 と約 1.045）で直せる。

結論: スマホ IMU は雑音が少なく使えますが、倍率の補正が要ります。1 スキャンの間（約 0.1 秒）の誤差は 0.3° 程度で
スキャン照合が直せるため、回転で地図がずれる主な原因ではありませんでした。主な原因は上の「スキャンのねじれ」と回転の速さで、
SLAM 中は回転を遅く（例えば 0.5 rad/s 程度に）すると改善が見込めます（未検証）。

### smabo-esp32（概要）

ESP32 上の MicroPython ファームウェア。サーボ（PCA9685）・DC モータ（TB6612FNG）・エンコーダ・
LiDAR（LD06 / LD19）を制御 / 取得します。brain に WebSocket でつなぎ（`/esp32` prefix）、
設定とモードは自身の REST API（`:80`）で受けます。**詳細は §1 以降**を参照してください。

### smabo-sim

実機なしで ESP32 とスマホの代わりをするシミュレータです。brain への接続、トピック、REST API
（`GET/POST /config`、`POST /mode`。ポート 80 が使えないときは 8080）は実機と同じなので、
smabo-web と brain はシミュレータと実機を区別しません。走行の制御部（`firmware.DriveFirmware`）と設定の既定値
（`config.DEFAULTS`）は smabo-esp32 の `dc_motors.py`・`config.py` の写しで、
`tests/test_firmware_parity.py` が隣にある smabo-esp32 のファイルを読み込み、既定値と駆動の出力（duty）が
一致することを確認します（smabo-esp32 が無いときは skip）。

<pre class="mermaid">
flowchart LR
    subgraph esp["smabo-esp32（実機）"]
        dc["dc_motors.py"]
        cf["config.py DEFAULTS"]
        wp["wheel_publisher.py（trim）"]
    end
    subgraph sim["smabo-sim"]
        fw["firmware.DriveFirmware"]
        sc["config.DEFAULTS"]
        rb["robot.py（/wheel_vel・/scan）"]
    end
    t{{"tests/test_firmware_parity.py"}}
    dc -. "写し" .-&gt; fw
    cf -. "写し" .-&gt; sc
    wp -. "写し" .-&gt; rb
    t --&gt;|"両方を読み込んで比べる"| esp
    t --&gt; sim
    sim --&gt;|"同じトピック・同じ REST"| brain["smabo-brain / brain-ros"]
</pre>

### smabo-protocol

トピック表（[トピック一覧](#トピック一覧)）の一次情報 `protocol.json` と、各リポジトリ向けの写しを作る
`gen.py` を持ちます。トピックを足すときは `protocol.json` を直して `gen.py` を実行し、
生成された写しを各リポジトリに入れます。

<pre class="mermaid">
flowchart LR
    pj[("protocol.json&lt;br/&gt;トピック・型・送り手・受け手")] --&gt; gen["gen.py"]
    gen --&gt; b["smabo-brain&lt;br/&gt;brain/protocol_gen.py"]
    gen --&gt; s["smabo-sim&lt;br/&gt;（Python）"]
    gen --&gt; e["smabo-esp32&lt;br/&gt;protocol_gen.py"]
    gen --&gt; w["smabo-web&lt;br/&gt;（TypeScript）"]
    gen --&gt; a["smabo-app&lt;br/&gt;protocol.g.dart"]
    b --&gt; ci{{"各リポジトリの CI&lt;br/&gt;写しが古ければ失敗"}}
    s --&gt; ci
    e --&gt; ci
    w --&gt; ci
    a --&gt; ci
</pre>

---

## 画像処理（物体検出と追従）

smabo-app のカメラ映像（**WebRTC**）を smabo-brain（および smabo-brain-ros）が受け取り、
`capture_fps`（`/vision/config`）の頻度でフレームを取り出して物体の**画像内位置**を算出し、
`vision_msgs/Detection2DArray` 互換で配信します。
その検出結果から、<strong>目（`/look_at`）・首サーボ（`/servo/command`）・走行（`/cmd_vel`）</strong>の
各 behavior が「対象を向く／追従する」動きを生成します。検出（知覚）と振る舞い（behavior）を
分離し、同じ検出結果を複数アクチュエータで再利用できる構成です。

> 純ロジック（検出・幾何変換・各 policy）は `brain.vision` に集約し、smabo-brain（WS）と
> smabo-brain-ros（ROS2）が import して再利用します（`brain.odometry` と同じ分離方針）。
> OpenCV は使うときに読み込むので、画像処理なしでも smabo-brain は動きます。

### データフロー

<pre class="mermaid">
sequenceDiagram
    participant app as smabo-app
    participant brain as smabo-brain / brain-ros
    participant web as smabo-web
    participant esp32 as smabo-esp32

    web-&gt;&gt;brain: /vision/config（mode/color/speak/behaviors/capture_fps …）
    app-&gt;&gt;brain: カメラ映像（WebRTC）
    Note over brain: フレームを取り出し brain.vision で検出（aruco/color/face/qr）
    brain-&gt;&gt;web: /vision/detections（Detection2DArray）・/vision/markers（String）
    Note over brain: 最大面積の検出 → 方向に変換 → 各 policy
    brain-&gt;&gt;app: /look_at（目を向ける）
    brain-&gt;&gt;esp32: /servo/command（首を向ける）
    brain-&gt;&gt;esp32: /cmd_vel（台車で追従）
    brain-&gt;&gt;app: /speech/say（AR/QR 文字列の発話・任意）
    brain-&gt;&gt;web: カメラ映像中継（WebRTC、プレビュー ON 時のみ）
</pre>

### 処理モード

| モード | 内容 | 文字列配信 |
|---|---|---|
| `off` | 無効 | — |
| `aruco` | AR マーカー検出（位置＋ID）。辞書は `aruco_dict`（`"ALL"` で全辞書走査） | マーカー番号 → `/vision/markers` |
| `color` | 指定色の物体の中心（HSV しきい値）。色はカラーパレットの任意 RGB（`color_rgb`）または名前付きプリセット | — |
| `face` | 顔検出（OpenCV Haar） | — |
| `qr` | QR コード（位置＋内容） | 内容 → `/vision/markers` |

> `speak=true` のとき、`aruco` の番号 / `qr` の内容を `/speech/say` に流して smabo-app が発話します。
> 同じ文字列の連投は brain 側で抑制（変化時のみ送出）します。

### コンポーネントと配置

| 役割 | smabo-brain（WS） | smabo-brain-ros（ROS2） |
|---|---|---|
| 検出 | カメラ受信 → `brain.vision` → `/vision/detections`・`/vision/markers` を配信 | `image_processor_node`（`/camera/image_raw` → Detection2DArray ＋ String） |
| gaze policy | detections → `/look_at` | `gaze_policy_node` |
| neck policy | detections → `/servo/command` | `neck_policy_node` |
| drive policy | detections → `/cmd_vel`（台車で追従） | `drive_policy_node` |
| 制御 | `/vision/config` を brain が受け取る | `image_processor_node` が subscribe |

> CV は重いので、smabo-brain では**別スレッド（executor）で実行**して中継ループを止めません。
> 検出の前に、幅 640 px を超えるフレームは縮小します。smabo-brain-ros では 1 本の作業スレッドが
> 常に最新のフレームだけを処理し、古いフレームは捨てます。

### 制御メッセージ（/vision/config）

smabo-web → brain。`std_msgs/String` の `data` に設定 JSON（文字列）を入れます。**部分指定**でよく、brain は現在値に **deep-merge**（`target_joints` / `behaviors` / `drive` はキー単位でマージ、スカラは置換）して保持します。更新後は brain が**正規化済みスナップショットを全 UI に配信**し、新しく接続した UI には接続直後に現在値を 1 通送って同期します。

```json
{
  "enabled": true,
  "mode": "color",
  "color": "red",
  "color_rgb": "#1e90ff",
  "color_hue_tol": 12,
  "color_s_min": 70,
  "color_v_min": 60,
  "min_area_frac": 0.0008,
  "capture_fps": 30,
  "aruco_dict": "DICT_4X4_50",
  "speak": false,
  "hfov_deg": 60.0,
  "target_marker_id": null,
  "target_joints": {"pan": "head_pan", "tilt": "", "pan_sign": 1.0, "tilt_sign": 1.0,
                    "kp": 0.5, "ki": 0.0, "kd": 0.03, "lost_tolerance": 0},
  "behaviors": {"look_at": true, "servo": false, "drive": false},
  "drive": {"target_area_frac": 0.10,
            "kp_ang": 1.5, "ki_ang": 0.0, "kd_ang": 0.15,
            "kp_lin": 2.0, "ki_lin": 0.0, "kd_lin": 0.0,
            "max_ang": 1.0, "max_lin": 0.20, "deadzone": 0.02, "lost_tolerance": 0}
}
```

| キー | 説明 |
|---|---|
| `enabled` / `mode` | 有効無効 / 検出モード（off / aruco / color / face / qr） |
| `color` | 色モードの**名前付きプリセット**（red / orange / … / purple）。`color_rgb` が未設定のときに使う |
| `color_rgb` | 色モードの**任意の対象色**（カラーパレットから取得した `#RRGGBB` または `[r,g,b]`）。設定時は `color` より優先 |
| `color_hue_tol` | `color_rgb` の色相許容幅（OpenCV H 0–179 の±半幅。大きいほど広く拾う） |
| `color_s_min` / `color_v_min` | 色モードの彩度・明度の下限（0–255）。下げるほど淡い/暗い色も拾う（誤検出増） |
| `min_area_frac` | 検出の最小サイズ（フレーム面積に対する割合）。これ未満の検出を全モードで除外（微小ノイズ・ALL の誤検出抑制） |
| `capture_fps` | 検出に回すフレームの頻度（1〜30 fps）。高いほど追従の反応が速く、CPU と帯域を使う |
| `aruco_dict` | AR モードの辞書（例 `DICT_4X4_50`）。印刷したマーカーと一致が必要。`"ALL"` で代表的な全辞書を走査（少し重く・誤検出増）。検出器はキャッシュ |
| `speak` | 検出文字列を `/speech/say` に流すか |
| `hfov_deg` | カメラ水平画角（pixel → 角度の変換に使用） |
| `target_marker_id` | 追従を優先する AR ID（null＝最大面積） |
| `target_joints` | 首 policy が動かす関節（`pan`、`tilt` は空なら動かさない）・符号・PID ゲイン・見失いを許すフレーム数 |
| `behaviors` | look_at / servo / drive の個別有効化 |
| `drive` | 追従の目標サイズ率・旋回と前後の PID ゲイン・上限速度・不感帯・見失いを許すフレーム数 |

### 起動時初期値とメッセージ型の選定

**起動時初期値と保存**：smabo-brain は画像処理の設定を JSON ファイルに持ちます。

- ファイルは `--vision-config <path.json>`（または環境変数 `SMABO_VISION_CONFIG`、既定 `vision_config.json`）。中身は上の `/vision/config` の `data` と同形（**部分指定可**、欠けたキーは組み込み既定で補完）。
- 起動時に読み込み、`/vision/config` で変わるたびに保存します。ファイルが無ければ組み込み既定（`mode=off`・検出無効・`behaviors.look_at=true`・首は `head_pan` のみ・tilt なし）で起動します。
- 「**起動時初期値＋実行時上書き**」が smabo-brain（WS）でも smabo-brain-ros（ROS）でも成立します。

**型の選定（なぜ String + JSON か）**：検出結果のような**データプレーンは標準型**（`vision_msgs/Detection2DArray`・`geometry_msgs/PoseStamped`）で相互運用性を確保する一方、設定のような**コントロールプレーンは `std_msgs/String`＋JSON** にしています。設定は mode/color/target_joints/behaviors/drive と異種・入れ子・追加が多く、これに合う標準 ROS メッセージ型が無いこと、1 トピックに集約でき型変更なしでフィールド追加できること、rosbridge/Web から扱いやすいことが理由です。

> ROS 的には設定はノードパラメータが本来の場所なので、**smabo-brain-ros 側では `image_processor_node` の ROS 2 パラメータとしても公開**し、`ros2 param` で操作できます（Web↔brain は String/JSON、ROS 側はパラメータ、の二段構え）。両者の初期値・上書きは `brain.vision.merge_config`（純ロジック）で同一に適用します。

### メッセージ定義（vision）

**`/vision/detections` — vision_msgs/Detection2DArray**（brain → web。smabo-brain-ros は ROS2 型）

```json
{
  "header": {"stamp": {"sec": 0, "nanosec": 0}, "frame_id": "camera"},
  "source_img_width": 640, "source_img_height": 480,
  "detections": [{
    "header": {"stamp": {"sec": 0, "nanosec": 0}, "frame_id": "camera"},
    "bbox": {"center": {"position": {"x": 320.0, "y": 180.0}, "theta": 0.0},
             "size_x": 96.0, "size_y": 96.0},
    "results": [{"hypothesis": {"class_id": "face", "score": 0.92}}]
  }]
}
```

> `class_id` は AR=マーカー番号、color=色名、face=`"face"`、qr=内容。`center.position` は**画素**座標。
> `source_img_width/height` は標準外の補助フィールド（消費側が画素→正規化する手掛かり）。

**`/vision/markers` — std_msgs/String**（AR 番号 / QR 内容。複数はカンマ区切り）

```json
{"data": "3,7"}
```

### policy（pixel→方向→各指令）

最大面積（または指定 AR ID）の検出を対象に、画素位置と画角から**ロボット座標系の方向ベクトル**
`(x=前, y=左, z=上)` を求め（`bbox_to_direction`）、各 behavior に変換します。

<pre class="mermaid">
flowchart LR
    det["/vision/detections"] --&gt; pick["対象を選ぶ&lt;br/&gt;target_marker_id か 最大面積"]
    pick --&gt; dir["bbox_to_direction&lt;br/&gt;画素 + hfov → (x 前, y 左, z 上)"]
    dir --&gt;|"behaviors.look_at"| g["gaze&lt;br/&gt;/look_at"]
    dir --&gt;|"behaviors.servo"| n["neck PID&lt;br/&gt;/servo/command"]
    dir --&gt;|"behaviors.drive"| d["drive PID&lt;br/&gt;/cmd_vel"]
    pick --&gt;|"見失った"| stop["lost_tolerance を超えたら&lt;br/&gt;PID リセット・停止"]
</pre>

- **gaze → `/look_at`（PoseStamped）**：`position` に方向ベクトルをそのまま入れる
- **neck → `/servo/command`**：誤差 `pan = atan2(y, x)`、`tilt = atan2(z, hypot(x, y))`（符号は `pan_sign` / `tilt_sign`）を PID に通し、今の関節角に足した角度を送る
- **drive → `/cmd_vel`**：
  - 旋回：画像中心からの横ずれ `u_n`（−1〜1）を 0 にする PID で `angular.z` を決める。
  - 前後：見かけの大きさ `sqrt(面積率)`（距離にほぼ反比例）を `sqrt(target_area_frac)` に近づける PID で `linear.x` を決める。不感帯 `deadzone` の中では止まる。
  - 対象が正面から大きく外れている（`|u_n| > 0.5`）間は前進しない。対象を見失ったら停止する。

PID の積分と微分はフレームをまたいで保持し、`lost_tolerance` フレームを超えて見失うとリセットします。

> 手動操作との競合：vision 有効時のみ各 policy が出力します。gaze は smabo-web の Face タブの手動 GazePad と同じ `/look_at` を共有するため、**vision の gaze が有効な間は Face タブの GazePad を無効化**して排他にします（「Vision is controlling gaze」と表示）。neck / drive も vision 有効時はその出力が優先されます。

---

> **以下 §1〜§8 は smabo-esp32（ファームウェア）の詳細**です。
> ESP32 は brain（smabo-brain / smabo-brain-ros）へ WebSocket **クライアント**として接続し
> （`ws://<brain-host>:<port>/`）、アクチュエータ制御とセンサ取得を担います。
> 制御指令は smabo-web → brain 経由で届き、ホイール速度・関節角・LiDAR は brain へ送ります。
> 設定とモードは、ESP32 自身の REST API（`:80`）で受けます。

## 1. モジュール構成

```
smabo-esp32/
├── main.py              # 起動エントリ・asyncio イベントループ
├── config.py            # 永続設定（RAM + config.json）・DEFAULTS
├── wifi_manager.py      # Wi-Fi 接続・自動再接続
├── improv.py            # Bluetooth LE での Wi-Fi 設定（Improv Wi-Fi）。Wi-Fi につながらないときだけ
├── ws_client.py         # RFC 6455 WebSocket クライアント（brain へ接続・自動再接続・送信キュー）
├── brain_link.py        # brain とのメッセージ（ハンドシェイク・publish・notice・/brain/info の確認）
├── protocol_gen.py      # トピック表とプロトコル番号（smabo-protocol の gen.py が生成。手で編集しない）
├── pairing.py           # brain とのペアリング（token・招待コード・中継用の鍵）
├── http_server.py       # 設定とモードの REST API（GET/POST /config、POST /mode）
├── robot.py             # オーケストレータ（サブシステムとモードの管理・受信の振り分け）
├── pca9685.py           # PCA9685 PWM ドライバ（サーボ用 I2C）
├── servo_controller.py  # JointGroup（全サーボ共通）
├── random_motion.py     # グループ単位のランダム動作（タイミンググループ管理）
├── dc_motors.py         # TB6612FNG 差動駆動（cmd_vel・車輪の速度制御・デッドマン停止）
├── encoder.py           # GPIO 割り込みによるエンコーダカウント
├── wheel_publisher.py   # エンコーダ → ホイール速度（/wheel_vel）送信と速度制御への入力
├── lidar_ld06.py        # LD06 / LD19（LD06 形式・YDLIDAR 形式）→ /scan
├── fastpath.py          # 重いバイト処理の native（viper）版（LiDAR パケット処理・WebSocket のマスク）
├── config.json          # 実機の差分設定（DEFAULTS へ deep-merge。Wi-Fi / brain 接続先 等。git 管理外）
└── configs/             # ボード別 config.json テンプレート（後述 §8）
    ├── config.esp32-classic.json     # ESP32（無印）DevKitC
    └── config.esp32s3-devkitc1.json  # ESP32-S3-DevKitC-1 / DevKitM-1 系
```

> `config.json` は `config.py` の `DEFAULTS` に対する**差分のみ**を保持します（起動時に deep-merge）。
> ボードを変えるときは `configs/` の該当ファイルをデバイス直下に `config.json` としてコピーします。
>
> **既定値は `DEFAULTS` の 1 か所だけ**です。`Config` は起動時に必ず `DEFAULTS` をマージするので、各モジュールは
> `cfg.get("dc.max_linear")` のように**既定値（第 2 引数）を書かずに**読みます。

モジュールのつながり（矢印は「呼び出す・使う」）:

<pre class="mermaid">
flowchart TB
    main["main.py"] --&gt; wifi["wifi_manager"]
    main --&gt; improv["improv（BLE）"]
    main --&gt; ws["ws_client"]
    main --&gt; http["http_server"]
    main --&gt; robot["robot"]
    main --&gt; cfg["config"]
    ws --&gt; bl["brain_link"]
    bl --&gt; pg["protocol_gen"]
    bl --&gt; pr["pairing"]
    http --&gt; robot
    robot --&gt; sv["servo_controller"]
    robot --&gt; rm["random_motion"]
    robot --&gt; dcm["dc_motors"]
    robot --&gt; wp["wheel_publisher"]
    robot --&gt; li["lidar_ld06"]
    sv --&gt; pca["pca9685"]
    wp --&gt; enc["encoder"]
    wp --&gt; dcm
    li --&gt; fp["fastpath"]
    ws --&gt; fp
</pre>
>
> `fastpath.py` は MicroPython 専用です。呼び出し側は起動時に native 版と Python 版の結果を一度比べ、
> 一致しなければ Python 版を使います（CPython のテストでは常に Python 版）。

---

## 2. クラス図

<pre class="mermaid">
classDiagram
    direction TB

    class Config {
        +data : dict
        +get(path, default) any
        +update(partial)
        +save_now()
        +mark_dirty()
        +autosave_task() async
    }

    class WSClient {
        +host : str
        +port : int
        +path : str
        +on_message : callable
        +on_connect : callable
        +run() async
        +restart()
        +broadcast(text, key)
        -_send_loop() async
        -_authenticate() async
        -_read_loop() async
    }

    class BrainLink {
        +ws : WSClient
        +handshake(config, config_url)
        +publish(topic, msg)
        +notice(message)
        +send_config(config)
        +send_config_url(url)
        +check_brain_info(msg) str
        +parse(text)$ tuple
    }

    class Pairing {
        +token() str
        +locked() bool
        +set_invite(code)
        +first_frame() dict
        +handle_reply(frame) bool
        +relay_allowed(headers) bool
        +status() dict
    }

    class ConfigHTTPServer {
        +robot : Robot
        +run() async
        -_route(method, path, body) async
    }

    class Robot {
        +cfg : Config
        +pca : PCA9685
        +ws  : WSClient
        +link : BrainLink
        +servo_group   : JointGroup
        +random_motion : RandomMotion
        +drive     : DiffDrive
        +encoders  : tuple
        +wheel_pub : WheelPublisher
        +lidar     : Ld06
        -_drive_mode : str
        +start()
        +on_brain_connect()
        +on_message(client, text)
        +config_json() dict
        +set_config(patch)
        +set_mode(partial)
        +apply_modes(modes)
        +publish(topic, msg)
        -_on_set_config(config_dict)
        -_reload_subsystems(changed_keys)
        -_on_publish(topic, msg)
        -_joint_states_task() async
        -_persist_angles_task() async
        -_reboot_after(ms, reasons) async
    }

    class PCA9685 {
        +set_freq(freq)
        +set_us(channel, us)
        +off(channel)
    }

    class JointGroup {
        +joints : dict
        -_traj_queue : list
        +set_angle_deg(name, angle)
        +load_trajectory(names, points)
        +final_angles(names, points) dict
        +inject_current_for_disable(patch)
        +get_state() dict
        +run(dt) async
    }

    class RandomMotion {
        +run_group(group_name) async
    }

    class DiffDrive {
        +closed_loop : bool
        +left  : _Motor
        +right : _Motor
        +set_closed_loop(on)
        +set_cmd_vel(linear_x, angular_z)
        +update_speed(meas_l, meas_r, dt)
        +stop()
        +watchdog_task() async
        -_full_duty_speed() float
    }

    class _Motor {
        +drive(value, start_duty, kick_ms, brake)
        +stop(brake)
    }

    class QuadEncoder {
        +read_and_reset() int
    }

    class WheelPublisher {
        +run(publish) async
    }

    class Ld06 {
        +protocol : str
        +run(publish) async
        +deinit()
    }

    Robot --&gt; Config         : 参照
    Robot --&gt; BrainLink      : 送信
    BrainLink --&gt; WSClient   : フレーム送信
    WSClient --&gt; Pairing     : 最初のフレーム
    ConfigHTTPServer --&gt; Robot : set_config / set_mode
    ConfigHTTPServer --&gt; Pairing : 中継用の鍵の確認
    Robot --&gt; PCA9685        : 参照
    Robot "1" *-- "0..1" JointGroup   : servo_group
    Robot "1" *-- "0..1" RandomMotion
    Robot "1" *-- "0..1" DiffDrive
    Robot "1" *-- "0..1" WheelPublisher
    Robot "1" *-- "0..1" Ld06
    JointGroup   --&gt; PCA9685    : PWM 出力
    RandomMotion --&gt; JointGroup : 角度指令
    RandomMotion --&gt; Config     : 参照（毎ループ読み直し）
    DiffDrive "1" *-- "2" _Motor : left / right
    WheelPublisher --&gt; QuadEncoder : カウント読み取り
    WheelPublisher --&gt; DiffDrive   : update_speed（実測速度）
    DiffDrive --&gt; Config        : 参照（毎回読み直し）
</pre>

> **共通化ポイント**: 首・ハンド・アームを含む全サーボを `servo_group`（`JointGroup` の単一インスタンス）で管理します。
> ランダム動作のグループ分けは `RandomMotion` が担い、`JointGroup` 自体はグループを意識しません。
>
> **brain との通信の分担**: `WSClient` は WebSocket の接続・再接続・送信キューだけを持ち、
> どのトピックをどの形で送るか（ハンドシェイク、prefix、notice）は `BrainLink` が持ちます。
> トピック表は smabo-protocol から生成した `protocol_gen.py` を使います。
>
> **オドメトリの分担**: ESP32 はエンコーダから算出したホイール速度（`/wheel_vel`）を送るだけで、
> x/y/θ への積分と `nav_msgs/Odometry` の生成は brain 側で行います（IMU/GPS と融合できるようにするため）。

---

## 3. 非同期タスク構成

起動後に asyncio 上で動作するタスクの一覧です。サブシステムのタスクは `Robot._tasks` で名前管理され、
モード変更や設定変更のときに個別にキャンセル・再生成されます。

<pre class="mermaid">
flowchart LR
    subgraph modes["modes（POST /mode）"]
        ms["servos"]
        md["dc_drive"]
        me["encoder_drive"]
        ml["lidar"]
    end
    ms --&gt; t1["servo_follower・servo_persist&lt;br/&gt;random_*・joint_states"]
    md --&gt; t2["drive_wd"]
    me --&gt; t2
    me --&gt; t3["odom（/wheel_vel・速度制御）"]
    ml --&gt; t4["scan（/scan）"]
</pre>

| タスク名 | コルーチン | 役割 | 起動条件 |
|---|---|---|---|
| `servo_follower` | `JointGroup.run()` | サーボ角度の速度制限追従・軌道キュー処理（20 ms 周期） | `modes.servos = true` |
| `servo_persist` | `Robot._persist_angles_task()` | 関節角を 2 秒ごとに `last_angle` として保存（0.5° 以上動いたときだけ） | `modes.servos = true` |
| `random_<name>` | `RandomMotion.run_group(name)` | グループ単位のランダムタイマー（グループ数分起動） | `modes.servos = true` |
| `joint_states` | `Robot._joint_states_task()` | `/joint_states` 送信（MoveIt2 連携用） | `modes.servos = true` |
| `drive_wd` | `DiffDrive.watchdog_task()` | cmd_vel デッドマン監視（100 ms 周期） | `dc_drive` or `encoder_drive` |
| `odom` | `WheelPublisher.run()` | エンコーダ読み取り・速度制御への入力・`/wheel_vel` 送信 | `modes.encoder_drive = true` |
| `scan` | `Ld06.run()` | LiDAR の UART 読み取り・1 回転ごとの `/scan` 送信 | `modes.lidar = true` |

サブシステムとは別に、`main.py` が次のタスクを常時動かします。

| コルーチン | 役割 |
|---|---|
| `WSClient.run()` | brain への接続と再接続（送信用の `_send_loop` も接続ごとに動く） |
| `ConfigHTTPServer.run()` | 設定の REST API（`http.port`、既定 80） |
| `Robot.announce_config_url_task()` | `/config_url` を 5 秒ごとに送信 |
| `Config.autosave_task()` | 変更された設定のデバウンス保存（2 秒） |
| `wifi_manager.keepalive_task()` | Wi-Fi 再接続監視 |
| `improv`（BLE） | 起動時に Wi-Fi につながらなかったときだけ、Bluetooth で Wi-Fi 設定を受け付ける |

> `random_<name>` のタスク名はグループ名から自動生成されます（例: `random_neck`, `random_hands`）。
> グループを追加・削除すると `servos` サブシステムが再起動され、新しいグループ数に合わせてタスクが再生成されます。

---

## 4. シーケンス図

> 以降の図で `WSClient` は ESP32 内の WebSocket クライアント層（`ws_client.py`）、
> `HTTP` は設定の REST API（`http_server.py`）です。
> ESP32 と外部（smabo-web / SBC 等）の WebSocket 通信はすべて brain を経由します。
> 図中で外部アクターから `WSClient` への矢印は、実際には brain によって中継されたものです。
> 同じく smabo-web から `HTTP` への矢印は、smabo-brain の `/devices/esp32/…` が中継したものです。
>
> **送信元 prefix 規約**: ESP32 が物理的に送出するトピックは `/esp32/wheel_vel`・`/esp32/joint_states` などで、
> brain が prefix を剥がしてから配信します。ESP32 が受信する `/cmd_vel`・`/servo/command` は、
> smabo-web が送った `/web/cmd_vel`・`/web/servo/command` から brain が prefix を剥がしたものです。
> 図中の `/cmd_vel` 等は**剥がされた後の canonical 名**で表記しています。

### 4-1. 起動シーケンス

<pre class="mermaid">
sequenceDiagram
    participant main
    participant Config
    participant WiFi as wifi_manager
    participant PCA as I2C / PCA9685
    participant WSClient
    participant Robot
    participant HTTP as ConfigHTTPServer

    main-&gt;&gt;Config: Config()
    Config-&gt;&gt;Config: _load() — config.json を読み DEFAULTS とマージ
    main-&gt;&gt;WiFi: connect(cfg)
    WiFi--&gt;&gt;main: WLAN オブジェクト
    main-&gt;&gt;PCA: I2C() + PCA9685()（未接続ならサーボ機能なし）
    main-&gt;&gt;WSClient: WSClient(brain.host, brain.port, "/", on_message, on_connect, pairing)
    main-&gt;&gt;Robot: Robot(cfg, pca, ws, pairing)
    main-&gt;&gt;main: improv.start()（Wi-Fi 未接続のときだけ BLE で設定を受け付ける）
    main-&gt;&gt;WSClient: create_task(ws.run())  ← brain へ接続（自動再接続）
    main-&gt;&gt;HTTP: create_task(ConfigHTTPServer(robot, http.port).run())
    main-&gt;&gt;Robot: robot.start()
    Robot-&gt;&gt;Robot: apply_modes(cfg.modes)
    main-&gt;&gt;main: create_task: announce_config_url / autosave / wifi keepalive
    Note over main: イベントループ開始 (sleep forever)
</pre>

---

### 4-2. brain への接続（ハンドシェイク）

ESP32 はクライアントとして brain へ接続しに行きます。接続が切れたら 3 秒後に再接続します
（brain に token を断られた後は 15 秒）。

<pre class="mermaid">
sequenceDiagram
    participant WSClient as ESP32 (WSClient)
    participant BL as BrainLink / Robot
    participant Brain as brain

    loop run()
        WSClient-&gt;&gt;Brain: TCP connect → HTTP GET / (Upgrade: websocket)
        Brain--&gt;&gt;WSClient: HTTP 101 Switching Protocols
        alt ペアリング済み
            WSClient-&gt;&gt;Brain: {"op":"auth","token":…}
            Brain--&gt;&gt;WSClient: {"op":"auth","ok":true,…}（--pairing）／{"auth":false,"reason":"no_auth"}（既定）
        else 招待コードあり
            WSClient-&gt;&gt;Brain: {"op":"pair","code":…}
            Brain--&gt;&gt;WSClient: token と中継用の鍵（token を brain.token、鍵のハッシュを http.relay_key_sha256 に保存）
        end
        WSClient-&gt;&gt;BL: on_connect()
        BL-&gt;&gt;Brain: advertise（/esp32/wheel_vel …）・subscribe（/cmd_vel …）
        BL-&gt;&gt;Brain: publish /esp32/config・/esp32/config_url・/esp32/hello
        Brain--&gt;&gt;BL: /brain/info（プロトコル番号が違えば notice で smabo-web に警告）
        Note over WSClient,Brain: 以降 RFC 6455 フレームで双方向通信（client→server フレームはマスク必須）
    end
</pre>

> 送信は 1 本のキューを 1 つの送信タスクが書き出します。回線が遅いときは、待ちが 6144 バイトを超えた
> 新しいフレームを捨てます。`/scan` は「最新だけ」で、まだ送られていない古い `/scan` は新しいものに置き換わります。

---

### 4-3. 走行制御 (cmd_vel)

<pre class="mermaid">
sequenceDiagram
    participant Client
    participant WSClient
    participant Robot
    participant DiffDrive

    Client-&gt;&gt;WSClient: {"op":"publish","topic":"/cmd_vel",\n"msg":{"linear":{"x":0.2},"angular":{"z":0.3}}}
    WSClient-&gt;&gt;Robot: on_message(client, text)
    Robot-&gt;&gt;Robot: _on_publish("/cmd_vel", msg)
    Robot-&gt;&gt;DiffDrive: set_cmd_vel(0.2, 0.3)
    DiffDrive-&gt;&gt;DiffDrive: 差動運動学 v_l = v − ω·sep/2、v_r = v + ω·sep/2
    alt 速度制御（encoder_drive かつ dc.speed_control）
        DiffDrive-&gt;&gt;DiffDrive: 目標の車輪速度を更新（止まっていた車輪・逆転する車輪はすぐ動かし始める）
    else 開ループ（dc_drive）
        DiffDrive-&gt;&gt;DiffDrive: v_l / v_r を _full_duty_speed() で duty に正規化（min_duty・start_duty を適用）
        DiffDrive-&gt;&gt;DiffDrive: left.drive(duty_l)、right.drive(duty_r)
    end
    Note over DiffDrive: _last_cmd_ms を更新

    loop 100 ms ごと (watchdog_task)
        DiffDrive-&gt;&gt;DiffDrive: 最後の cmd_vel から cmd_timeout 経過?
        alt タイムアウト
            DiffDrive-&gt;&gt;DiffDrive: stop()（dc.brake ならショートブレーキ）
        end
    end
</pre>

> `_full_duty_speed()` は duty 1.0 に対応する車輪速度（`max_linear + max_angular × wheel_separation / 2`）です。
> 開ループの duty 変換と、速度制御のフィードフォワードの両方がこの値を使います。
> 速度制御の 1 ステップは 4-12 を参照してください。

---

### 4-4. サーボ手動制御 — 単一点 (JointTrajectory 1 点)

<pre class="mermaid">
sequenceDiagram
    participant Client
    participant WSClient
    participant Robot
    participant JointGroup as servo_group

    Client-&gt;&gt;WSClient: {"op":"publish","topic":"/servo/command",\n"msg":{"joint_names":["head_pan","arm_joint_1"],\n"points":[{"positions":[0.5,-0.2],"time_from_start":{"sec":0}}]}}
    WSClient-&gt;&gt;Robot: on_message()
    Robot-&gt;&gt;Robot: _on_publish("/servo/command", msg)
    Robot-&gt;&gt;JointGroup: load_trajectory(names, points)
    JointGroup-&gt;&gt;JointGroup: deadline = ticks_ms() + 0ms
    JointGroup-&gt;&gt;JointGroup: _traj_queue = [(deadline, {head_pan:28.6°, arm_joint_1:-11.5°})]
    Robot-&gt;&gt;Robot: 最終角度を last_angle として保存（電源断に備える）

    loop 20 ms ごと (servo_follower タスク)
        JointGroup-&gt;&gt;JointGroup: deadline 到達 → _target 更新
        JointGroup-&gt;&gt;JointGroup: max_speed 制限で _current を _target に近づける
        JointGroup-&gt;&gt;PCA9685: set_us(channel, us)
    end
</pre>

---

### 4-5. サーボ軌道制御 — 複数点 (MoveIt2 / time-parameterised)

<pre class="mermaid">
sequenceDiagram
    participant SBC as SBC (MoveIt2)
    participant WSClient
    participant Robot
    participant JointGroup as servo_group

    SBC-&gt;&gt;WSClient: {"op":"publish","topic":"/servo/command",\n"msg":{"joint_names":["arm_joint_1","arm_joint_2"],\n"points":[\n  {"positions":[0.0,0.0],"time_from_start":{"sec":0}},\n  {"positions":[0.5,0.3],"time_from_start":{"sec":1}},\n  {"positions":[1.0,0.6],"time_from_start":{"sec":2}}\n]}}
    WSClient-&gt;&gt;Robot: on_message()
    Robot-&gt;&gt;Robot: _on_publish("/servo/command", msg)
    Note over Robot: points が複数 → load_trajectory（時系列）
    Robot-&gt;&gt;JointGroup: load_trajectory(names, points)
    JointGroup-&gt;&gt;JointGroup: start_ms = ticks_ms()
    JointGroup-&gt;&gt;JointGroup: _traj_queue = [(0ms,…),(1000ms,…),(2000ms,…)]

    loop 20 ms ごと (servo_follower タスク)
        JointGroup-&gt;&gt;JointGroup: ticks_diff(now, deadline) &gt;= 0 ?
        alt 次のポイントの時刻に到達
            JointGroup-&gt;&gt;JointGroup: _target を該当ポイントの角度に更新
        end
        JointGroup-&gt;&gt;JointGroup: max_speed 制限で _current を _target に追従
        JointGroup-&gt;&gt;PCA9685: set_us(channel, us)
    end
</pre>

> `time_from_start` は `load_trajectory()` 呼び出し時刻からの相対時間です。
> 各ポイントへの移動は `max_speed` (deg/s) の上限内でなめらかに追従します。
> smabo-brain-ros では `servo_trajectory_bridge` が MoveIt2 の軌道をこの形で送り、軌道の時間が過ぎたら成功を返します。

---

### 4-6. ナビゲーション連携（Nav2 + cmd_vel / odom）

ESP32 はホイール速度（`/wheel_vel`）と LiDAR（`/scan`）を送り、smabo-brain-ros の `odom_node` が
`/wheel_vel` を積分して `nav_msgs/Odometry`（`/odom`）と `odom → base_link` の tf を生成します。
covariance も `odom_node` が ESP32 の `/config` から付与します。

<pre class="mermaid">
sequenceDiagram
    participant Web as smabo-web（Navigation タブ）
    participant ROS as smabo-brain-ros（rosbridge + Nav2）
    participant ESP32

    Web-&gt;&gt;ROS: /web/goal_pose（目標位置）
    Note over ROS: Nav2 がパス計画・速度計算

    loop Nav2 制御ループ
        ESP32-&gt;&gt;ROS: publish /esp32/wheel_vel {left,right,dt}・/esp32/scan
        ROS-&gt;&gt;ROS: relay → odom_node が積分 → /odom・tf（odom → base_link）
        Note over ROS: /odom・/scan で自己位置を更新（AMCL / SLAM）
        ROS-&gt;&gt;ESP32: /cmd_vel（Nav2 の速度指令）
        Note over ESP32: DiffDrive.set_cmd_vel() → 速度制御で車輪を回す
    end
</pre>

---

### 4-7. ランダム動作（グループ独立タイマー）

<pre class="mermaid">
sequenceDiagram
    participant Client as smabo-web 設定画面
    participant HTTP
    participant Robot
    participant RM as RandomMotion
    participant JG as servo_group (JointGroup)

    Client-&gt;&gt;HTTP: POST /config {"servos":{"behavior":"random","random_groups":[…]}}
    HTTP-&gt;&gt;Robot: set_config(patch)
    Note over Robot: servos の変更 → servos サブシステムを再起動し、グループごとのタスクを起動

    par neck グループ (independent timer)
        loop random interval [1.0, 3.0] s
            RM-&gt;&gt;RM: cfg から neck グループ設定を読む
            RM-&gt;&gt;JG: set_angle_deg("head_pan",  ドリフト or サッカード)
            RM-&gt;&gt;RM: sleep( random(1.0, 3.0) )
        end
    and hands グループ (independent timer)
        loop random interval [2.0, 5.0] s
            RM-&gt;&gt;RM: cfg から hands グループ設定を読む
            RM-&gt;&gt;JG: set_angle_deg("left_hand",  ドリフト or サッカード)
            RM-&gt;&gt;JG: set_angle_deg("right_hand", ドリフト or サッカード)
            RM-&gt;&gt;RM: sleep( random(2.0, 5.0) )
        end
    end
</pre>

> グループ内のサーボは**同じ瞬間**に動き出しますが、目標角度はそれぞれ独立に決まります。
> グループ間のタイマーは完全に独立しており、自然にずれていきます。
> 動きは、ふだんは中立角へ引き戻しながらの小さなゆらぎ（ドリフト）で、ときどき大きく素早い注視（サッカード）が入ります。

---

### 4-8. 設定変更（サブシステム再起動）

<pre class="mermaid">
sequenceDiagram
    participant Client as smabo-web 設定画面
    participant HTTP
    participant Robot
    participant Config

    Client-&gt;&gt;HTTP: POST /config {"servos":{"joints":{"head_pan":{"max_angle":80}}}}
    HTTP-&gt;&gt;Robot: set_config(patch)
    Robot-&gt;&gt;Robot: _on_set_config(patch)
    Robot-&gt;&gt;Robot: _reboot_reasons() → [] (ピン変更なし)
    Robot-&gt;&gt;Config: update({"servos":...}) → save_now()（すぐ config.json へ）
    Robot-&gt;&gt;Robot: _reload_subsystems(["servos"])
    Robot-&gt;&gt;Robot: _teardown_servos()  ← タスクキャンセル・インスタンス解放
    Robot-&gt;&gt;Robot: enable_servos(True) ← 新設定で JointGroup + RandomMotion 再生成（last_angle から復帰）
    Robot-&gt;&gt;Robot: sync_config_to_brain() → publish /esp32/config
    HTTP--&gt;&gt;Client: 200 {"ok": true}
</pre>

---

### 4-9. 設定変更（ハード設定 — ピン変更 → 強制再起動）

<pre class="mermaid">
sequenceDiagram
    participant Client as smabo-web 設定画面
    participant HTTP
    participant Robot
    participant Config
    participant MCU as machine.reset()

    Client-&gt;&gt;HTTP: POST /config {"dc":{"pins":{"pwma":18}}}
    HTTP-&gt;&gt;Robot: set_config(patch)
    Robot-&gt;&gt;Robot: _on_set_config(patch)
    Robot-&gt;&gt;Robot: _reboot_reasons() → ["dc.pins"]
    Robot-&gt;&gt;Config: update({"dc":...}) → save_now()（再起動前に必ず保存）
    Robot-&gt;&gt;Robot: create_task(_reboot_after(500ms, reasons))
    HTTP--&gt;&gt;Client: 200 {"ok": true}
    Robot--&gt;&gt;Client: {"op":"notice","message":"Rebooting to apply pin/hw changes: dc.pins"}（brain 経由）
    Note over Client: UI に「再起動中...」を表示し再接続を待つ
    Robot-&gt;&gt;MCU: (500 ms 後) machine.reset()
    MCU-&gt;&gt;MCU: 新しいピン設定で起動
</pre>

---

### 4-10. モード切り替え

<pre class="mermaid">
sequenceDiagram
    participant Client as smabo-web
    participant HTTP
    participant Robot
    participant Config

    Client-&gt;&gt;HTTP: POST /mode {"encoder_drive":true,"dc_drive":false}
    HTTP-&gt;&gt;Robot: set_mode(partial)
    Robot-&gt;&gt;Robot: apply_modes(merged_modes)
    Note over Robot: encoder_drive と dc_drive の排他チェック（encoder_drive が優先）
    Robot-&gt;&gt;Robot: enable_servos(true)  ← 動いていればそのまま
    Robot-&gt;&gt;Robot: enable_lidar(false)  ← 同上
    Note over Robot: 駆動モード（encoder / dc / なし）が _drive_mode から変わったときだけ駆動系を作り直す
    alt 駆動モードが変わった
        Robot-&gt;&gt;Robot: disable_drive()  ← 既存タスクをキャンセル・モーター停止
        Robot-&gt;&gt;Robot: enable_drive(with_encoder=true)（速度制御を有効化）
        Robot-&gt;&gt;Robot: _drive_mode = "encoder"
    else 変わらない（サーボや LiDAR だけの切り替え）
        Note over Robot: 駆動系はそのまま（走行中でも止まらない）
    end
    Robot-&gt;&gt;Config: update({"modes": ...})  ← 永続化
    Robot-&gt;&gt;Robot: sync_config_to_brain() → publish /esp32/config
    HTTP--&gt;&gt;Client: 200 {"ok": true}
</pre>

---

### 4-11. /joint_states 送信ループ

<pre class="mermaid">
sequenceDiagram
    participant JointGroup as servo_group
    participant Robot
    participant Brain as brain

    loop 1/joint_states_rate 秒ごと (デフォルト 20 Hz)
        Robot-&gt;&gt;JointGroup: get_state()
        JointGroup--&gt;&gt;Robot: {"left_hand": 0.0, "right_hand": 0.0, "head_pan": 0.5, ...}（rad）
        Robot-&gt;&gt;Brain: {"op":"publish","topic":"/esp32/joint_states",\n"msg":{"name":[...],"position":[...],...}}
        Note over Robot,Brain: brain が /esp32 を剥がし /joint_states として配信
    end
</pre>

> `servos.joint_states_rate = 0` で無効化できます。`modes.servos = false` のときは送信しません。
> stamp は ESP32 の起動からの時間です。smabo-brain-ros は受信時刻で付け直します（`restamp_relay`）。

---

### 4-12. ホイール速度送信ループ（/wheel_vel）と車輪の速度制御

ESP32 はエンコーダのホイール速度を送るだけで、x/y/θ への積分は brain が行います。
同じ実測値で、`encoder_drive` のときは車輪の速度制御（PI）も回します。

<pre class="mermaid">
sequenceDiagram
    participant QuadEncoder
    participant WheelPublisher
    participant DiffDrive
    participant Robot
    participant Brain as brain

    loop 1/publish_rate 秒ごと (デフォルト 20 Hz)
        WheelPublisher-&gt;&gt;QuadEncoder: enc_left.read_and_reset()
        WheelPublisher-&gt;&gt;QuadEncoder: enc_right.read_and_reset()
        WheelPublisher-&gt;&gt;WheelPublisher: count → 距離 → 速度 (m/s)、実 dt を計測
        WheelPublisher-&gt;&gt;DiffDrive: update_speed(v_l, v_r, dt)
        DiffDrive-&gt;&gt;DiffDrive: 車輪ごとに duty = ff·目標 + kp·誤差 + I（I += ki·誤差·dt）
        WheelPublisher-&gt;&gt;Robot: publish("/wheel_vel", {left, right, dt})
        Robot-&gt;&gt;Brain: {"op":"publish","topic":"/esp32/wheel_vel","msg":{...}}
        Brain-&gt;&gt;Brain: /esp32 を剥がす → 積分 → /odom を生成・配信（/wheel_vel も web へ）
    end
</pre>

**車輪の速度制御（`encoder_drive` かつ `dc.speed_control`）**

| 項目 | 内容 |
|---|---|
| フィードフォワード | `ff = 1 / _full_duty_speed()`（開ループと同じ対応）。積分は摩擦と電池電圧の分だけを補う |
| 積分の上限 | `dc.speed_i_max`。エンコーダが壊れても車輪が全開にならない |
| 積分の下限 | フィードフォワードを打ち消すほどには貯めない（逆向きに貯めて動き出しが遅れるのを防ぐ） |
| 出力の下限 | 目標と逆向きには回さず、0 にもしない（最小 0.01）。ブレーキとキックの繰り返しを防ぐ |
| 動き出し | 止まっていた車輪・逆転する車輪は、次の実測を待たずにフィードフォワード＋前回学んだ摩擦分の duty で回し始める |
| 停止 | 目標がほぼ 0（1e-4 m/s 未満）の車輪はブレーキ。そのときの積分値を摩擦として覚えておく |
| 使わないもの | 速度制御中は `min_duty`・`start_duty`・キックは使わない |
| 左右差の補正（`dc.trim`） | 直進で左右に寄るのを補正する。速度制御中は実測の左右の速度に掛ける（`v_l × (1 + trim)`、`v_r × (1 − trim)`）。左が速く測られると制御は左を遅くするので、右に寄るなら正。開ループでは duty に掛ける（`v_l × (1 − trim)`、`v_r × (1 + trim)`） |

<pre class="mermaid">
flowchart LR
    cmd["/cmd_vel"] --&gt; tgt["目標の車輪速度&lt;br/&gt;v_l*, v_r*"]
    tgt --&gt; pi["PI 制御&lt;br/&gt;duty = ff·目標 + kp·誤差 + I"]
    pi --&gt; mot["TB6612FNG → モータ"]
    mot --&gt; enc["エンコーダ"]
    enc --&gt; meas["実測 v_l, v_r"]
    meas --&gt; trim["trim を掛ける&lt;br/&gt;v_l(1+trim), v_r(1−trim)"]
    trim --&gt;|"誤差 = 目標 − 実測"| pi
    meas --&gt;|"/wheel_vel"| brain["brain → /odom"]
</pre>

---

### 4-13. 設定の読み出し

<pre class="mermaid">
sequenceDiagram
    participant Client as smabo-web 設定画面
    participant HTTP
    participant Robot
    participant Config

    Client-&gt;&gt;HTTP: GET /config
    HTTP-&gt;&gt;Robot: config_json()
    Robot-&gt;&gt;Config: cfg.data (全設定 dict)
    Robot-&gt;&gt;Robot: wifi.password を "****" に、ペアリングの秘密を除外、brain.paired を追加
    HTTP--&gt;&gt;Client: 200 {...全設定...}
</pre>

> smabo-web は、ESP32 が送る `/config`（設定が変わったとき）を見て、この `GET /config` で読み直します。

---

### 4-14. LiDAR（/scan）

<pre class="mermaid">
sequenceDiagram
    participant LiDAR as LD06 / LD19
    participant Ld06
    participant Robot
    participant Brain as brain

    loop scan タスク
        LiDAR-&gt;&gt;Ld06: UART（既定 230400 bps、LiDAR の TX → ESP32 の RX）
        Ld06-&gt;&gt;Ld06: パケットを CRC / チェックサムで確認（LD06 形式か YDLIDAR 形式かを自動判別）
        Ld06-&gt;&gt;Ld06: 点を lidar.bins 個の角度ビンに振り分け（mm、0 = 反射なし）
        alt 1 回転分そろった（生の角度が 0° を越えた）
            Ld06-&gt;&gt;Ld06: ranges を測った順（生の角度 0° から）に並べ、stamp = 1 周の始まり
            Ld06-&gt;&gt;Robot: publish("/scan", 組み立て済み JSON)
            Robot-&gt;&gt;Brain: {"op":"publish","topic":"/esp32/scan",…}（送信キューでは最新だけ）
        end
    end
</pre>

> ESP32 のメモリは少ないので、`/scan` は dict を作らずに JSON の文字列を直接組み立てて送ります。
> パケット処理は `fastpath.py` の native 版を使います（1 秒あたり約 4000 点）。
>
> `ranges[i]` は生の角度 i° の距離で、i の順に測っています（`stamp + i × time_increment`）。時計回りの LiDAR では
> `angle_increment` を負にしてロボットの角度（反時計回りが正）に合わせます。SLAM はこの時刻で回転中のスキャンの
> ねじれを補正します（[LiDAR スキャンの時刻](#lidar-スキャンの時刻と回転中の歪み補正)）。

<pre class="mermaid">
flowchart LR
    subgraph rev["1 周（scan_time ≈ 0.1 秒）"]
        r0["ranges[0]&lt;br/&gt;生 0°・t = stamp"] --&gt; r1["ranges[1]&lt;br/&gt;生 1°・+Δt"] --&gt; rd["…"] --&gt; r359["ranges[359]&lt;br/&gt;生 359°・+359Δt"]
    end
    r0 -.-&gt; a0["ロボットの角度&lt;br/&gt;angle_min = angle_offset"]
    r1 -.-&gt; a1["angle_min + angle_increment&lt;br/&gt;（時計回りなら −1°）"]
</pre>

---

## 5. 通信仕様

### 接続情報

| 項目 | 値 |
|---|---|
| WebSocket | RFC 6455（テキストフレーム）。ESP32 が **クライアント**として brain へ接続 |
| 接続先 | `ws://<brain-host>:<port>/`（`brain.host` / `brain.port`、既定ポート `9090`、`brain.path` 既定 `/`） |
| フォーマット | UTF-8 JSON、1 メッセージ = 1 フレーム |
| 認証 | 既定はなし（信頼済み LAN 内利用前提）。brain が `--pairing` のときは、接続直後の最初のフレームで token を見せる（[設定の中継とペアリング](#設定の中継とペアリング)） |
| REST API | `http://<ESP32 の IP>:<http.port>/`（既定 80）。設定とモード（5-3） |

> 以下「brain → ESP32」「ESP32 → brain」の publish は、smabo-web などとの論理的な送受信を
> brain が中継したものです（物理的な接続先は常に brain）。
>
> **送信元 prefix**: ESP32 が送出する publish は `BrainLink.publish()` で `/esp32` prefix が付きます
> （物理フレームは `/esp32/wheel_vel` 等）。brain がこの prefix を剥がし、canonical 名で配信します。
> ESP32 が受信する `/cmd_vel`・`/servo/command` は、smabo-web 等が `/web` prefix 付きで送ったものを
> brain が剥がした後の canonical 名です。

---

### 5-1. brain → ESP32（受信）

ESP32 が処理するのは `publish` だけで、ほかの op は無視します（設定とモードは REST で受けます）。

**走行制御** `/cmd_vel` — `geometry_msgs/Twist`

```json
{
  "op": "publish",
  "topic": "/cmd_vel",
  "msg": {
    "linear":  {"x": 0.2,  "y": 0.0, "z": 0.0},
    "angular": {"x": 0.0,  "y": 0.0, "z": 0.3}
  }
}
```

| フィールド | 単位 | 説明 |
|---|---|---|
| `linear.x` | m/s | 前進速度 |
| `angular.z` | rad/s | 旋回速度（反時計回りが正） |

> `dc.cmd_timeout` 秒以内に次のメッセージが届かない場合、モータは自動停止します。
> 開ループ（`dc_drive`）では、`max_linear` / `max_angular` から決まる `_full_duty_speed()` が duty 1.0 です。

**サーボ制御** `/servo/command` — `trajectory_msgs/JointTrajectory`

```json
{
  "op": "publish",
  "topic": "/servo/command",
  "msg": {
    "joint_names": ["head_pan", "arm_joint_1"],
    "points": [
      {
        "positions": [0.5, -0.2],
        "velocities": [],
        "time_from_start": {"sec": 1, "nanosec": 0}
      }
    ]
  }
}
```

> - `joint_names` で対象サーボを指定。`servos.joints` に登録されていない名前と、`enabled=false` の関節は無視されます
> - `positions` の単位は **ラジアン**（ROS 標準）
> - 1 点・複数点どちらも `load_trajectory()` で統一処理されます
> - 各点は `time_from_start` を絶対時刻に変換してキューに積み、`run()` ループで到達時刻になったら `_target` を更新します
> - 1 点で `time_from_start=0` の場合は次の `run()` tick（≤20ms）で即時適用されます
> - `max_speed` (deg/s) による速度制限でなめらかに追従します（`0` = 即時移動）
> - `behavior` が `"random"` の場合でも手動コマンドは受け付けます（次のランダム発火で上書きされます）
> - 最後の点の角度を `last_angle` としてすぐ保存し、電源を切っても次の起動でその角度に戻ります

**疎通確認** `/ping` — `std_msgs/String`

```json
{"op": "publish", "topic": "/ping", "msg": {"data": "<トークン>"}}
```

→ ESP32 は同じ `data` を `/pong` で返します。

**プロトコルの確認** `/brain/info` — `std_msgs/String`

```json
{"op": "publish", "topic": "/brain/info", "msg": {"data": "{\"protocol\": 1, \"brain\": \"smabo-brain\", \"version\": \"0.2.0\"}"}}
```

> プロトコル番号が ESP32 の `protocol_gen.PROTOCOL_VERSION` と違うとき、ESP32 は notice で警告します（同じ警告は 1 回だけ）。

---

### 5-2. ESP32 → brain（送信）

**接続直後**（`BrainLink.handshake`）: 送るトピックを `advertise`、読むトピックを `subscribe` してから、
`/config`・`/config_url`・`/hello` を送ります。

```json
{"op": "advertise", "topic": "/esp32/wheel_vel", "type": "smabo_interfaces/msg/WheelVel"}
{"op": "subscribe", "topic": "/cmd_vel", "type": "geometry_msgs/msg/Twist"}
```

#### `/joint_states` — `sensor_msgs/JointState`

```json
{
  "op": "publish",
  "topic": "/esp32/joint_states",
  "msg": {
    "header": {"stamp": {"sec": 1234, "nanosec": 0}, "frame_id": ""},
    "name":     ["left_hand", "right_hand", "head_pan",
                 "arm_joint_1", "arm_joint_2", "arm_joint_3", "arm_joint_4"],
    "position": [0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0],
    "velocity": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    "effort":   [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  }
}
```

> `position` の単位は **ラジアン**（ROS 標準）。デフォルト **20 Hz** で送信。
> `servos.joint_states_rate` で変更可（`0` で無効）。`modes.servos = true` のときのみ送信。

#### `/wheel_vel` — `smabo_interfaces/WheelVel`

```json
{
  "op": "publish",
  "topic": "/esp32/wheel_vel",
  "msg": {
    "left":  0.182,
    "right": 0.205,
    "dt":    0.050
  }
}
```

| フィールド | 単位 | 説明 |
|---|---|---|
| `left` | m/s | 左ホイールの周速度 |
| `right` | m/s | 右ホイールの周速度 |
| `dt` | s | 前回送信からの実測経過時間（brain 側の積分に使用） |

> brain が積分して `/odom` を配信し、`/wheel_vel` 自体も smabo-web へ送ります。
> デフォルト **20 Hz** で送信（`encoder.publish_rate`）。`encoder_drive` モードが無効のときは送信しません。
> `nav_msgs/Odometry` 形式・covariance（`encoder.covariance.*` 由来）の生成は brain 側で行います。

#### `/scan` — `sensor_msgs/LaserScan`

```json
{
  "op": "publish",
  "topic": "/esp32/scan",
  "msg": {
    "header": {"stamp": {"sec": 0, "nanosec": 0}, "frame_id": "laser"},
    "angle_min": 0.0,
    "angle_max": -6.26573,
    "angle_increment": -0.0174533,
    "time_increment": 0.000277778,
    "scan_time": 0.1,
    "range_min": 0.05,
    "range_max": 12.0,
    "ranges": ["…lidar.bins 個の距離 (m)。0.0 は反射なし…"]
  }
}
```

> 1 回転ごとに送ります。`modes.lidar = true` のときのみ。角度はロボットの向き（反時計回りが正）に変換済みで、
> `lidar.clockwise` と `lidar.angle_offset` で LiDAR の向きを合わせます（オフセットは `angle_min` に入る）。
> `ranges` は測った順（1 周の始まり＝生の角度 0 から）で、`header.stamp` は 1 周の始まり（ESP32 の時計）です。
> 時計回りの LiDAR（既定）では `angle_increment` が負になります（上の例）。

#### `/config` — `std_msgs/String`

```json
{"op": "publish", "topic": "/esp32/config", "msg": {"data": "{…Wi-Fi とペアリングの秘密を除く全設定…}"}}
```

> brain への接続のたびと、REST で設定・モードが変わるたびに送ります。brain はオドメトリ（車輪寸法・共分散・frame 名）に使い、
> smabo-web は変更の知らせとして受け取ります。smabo-brain-ros ではどのクライアントも購読できるため、Wi-Fi は含めません。

#### `/config_url` — `std_msgs/String`

```json
{"op": "publish", "topic": "/esp32/config_url", "msg": {"data": "http://192.168.1.50"}}
```

> 接続直後と 5 秒ごと。ポートが 80 以外のときは `http://ip:port`。Wi-Fi 未接続のときは送りません。

#### `/hello` / `/pong` — `std_msgs/String`

```json
{"op": "publish", "topic": "/esp32/hello", "msg": {"data": "{\"protocol\": 1, \"client\": \"smabo-esp32\", \"version\": \"0.2.0\"}"}}
{"op": "publish", "topic": "/esp32/pong", "msg": {"data": "<受け取った /ping のトークン>"}}
```

#### `notice` — お知らせ（smabo-web に表示）

```json
{"op": "notice", "message": "Rebooting to apply pin/hw changes: dc.pins"}
```

> 再起動の予告（約 500 ms 後に再起動。再起動にかかる時間は約 3–5 秒）と、プロトコル番号の不一致の警告に使います。

---

### 5-3. REST API（設定とモード）

`http_server.py` の `ConfigHTTPServer` です。smabo-web は smabo-brain の `/devices/esp32/…` 経由で呼びます
（smabo-brain-ros のとき、またはペアリング前の招待コードは直接）。

| メソッド・パス | 本文 | 応答 | 内容 |
|---|---|---|---|
| `GET /config` | ― | 全設定（JSON） | `wifi.password` は `"****"`、ペアリングの秘密は除外、`brain.paired` を追加 |
| `POST /config` | 設定の部分パッチ | `{"ok": true}` | deep-merge して保存。ピン・バス系の変更は再起動（§7） |
| `POST /mode` | モードの部分指定 | `{"ok": true}` | サブシステムの有効・無効（§4-10） |
| `OPTIONS *` | ― | 204 | CORS の事前確認 |

```json
{"servos": {"behavior": "random",
            "random_groups": [{"name": "neck", "joints": ["head_pan"], "interval": [1.0, 3.0]}]}}
```

```json
{"servos": true, "encoder_drive": true, "lidar": true}
```

> - `POST /config` は送った部分だけを deep-merge します（省略したキーは変更なし）。`wifi.password` が `"****"` のときは無視するので、`GET` した内容をそのまま送り返してもパスワードは消えません。
> - `{"brain": {"invite": "<コード>"}}` を送ると、次の接続でその招待コードでペアリングします。
> - `POST /mode` の `modes` は部分指定可。未指定のモードは現在値を維持します。`dc_drive` と `encoder_drive` は同時 `true` にできません（`encoder_drive` が優先）。
> - 本文が JSON でなければ 400、知らないパスは 404。
> - ペアリング前は CORS をすべて許可します。ペアリング後は `X-Smabo-Relay-Key`（brain が付ける中継用の鍵）のない要求を 401 で断り、CORS ヘッダも返しません。

---

## 6. 設定項目一覧

### Wi-Fi

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `wifi.ssid` | string | `"your-ssid"` | 接続先 SSID |
| `wifi.password` | string | `"your-password"` | パスワード（`GET /config` では `"****"`） |
| `wifi.hostname` | string | `"esp32-robot"` | ホスト名 |

> Wi-Fi は、Bluetooth の Improv（smabo-web の Wi-Fi 設定）か、`config.json` の直接編集で設定します。
> REST で変えると再起動後に新しい設定で接続するため、間違えるとネットワークから外れます（そのときは Improv で設定し直せます）。

### Bluetooth の Wi-Fi 設定（Improv）

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `improv.enabled` | bool | `true` | 起動時に Wi-Fi につながらないとき、Bluetooth で Wi-Fi 設定を受け付ける |
| `improv.name` | string | `""` | Bluetooth の表示名（空なら `"smabo-" + wifi.hostname`） |

> Improv は Wi-Fi が切れているときだけ動き、設定が済むとすぐ止まります。ネットワークにつながっているロボットは、無線で新しい資格情報を受け付けません。
> 招待コードを一緒に送ると、そのままペアリングもできます。

### 接続先 brain（WebSocket）

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `brain.host` | string | `"192.168.1.100"` | brain のホスト / IP（**実環境に合わせて要設定**） |
| `brain.port` | int | `9090` | brain の待ち受けポート |
| `brain.path` | string | `""` | WebSocket のパス（空なら `/`。smabo-brain と smabo-brain-ros のどちらでも同じ） |
| `brain.token` | string | `""` | ペアリングで受け取った token（REST では見せない） |
| `brain.invite` | string | `""` | 使う前の招待コード（REST では見せない） |

### REST API

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `http.port` | int | `80` | REST API のポート |
| `http.relay_key_sha256` | string | `""` | 中継用の鍵の SHA-256（鍵そのものは持たない。REST では見せない） |

### I2C / PCA9685

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `i2c.sda` | int | `18` | SDA ピン番号 |
| `i2c.scl` | int | `5` | SCL ピン番号 |
| `i2c.freq` | int | `400000` | クロック周波数 (Hz) |
| `pca9685.address` | int | `0x40` | I2C アドレス |
| `pca9685.freq` | int | `50` | PWM 周波数 (Hz)。サーボ標準は 50 Hz |

### モード

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `modes.servos` | bool | `true` | サーボ制御（首・ハンド・アームを含む全サーボ） |
| `modes.dc_drive` | bool | `false` | DC モータ走行（開ループ） |
| `modes.encoder_drive` | bool | `false` | エンコーダ付き走行（車輪の速度制御と `/wheel_vel`） |
| `modes.lidar` | bool | `false` | LiDAR → `/scan` |

> 複数のモードを同時に有効にできます。ただし `dc_drive` と `encoder_drive` は排他です（`encoder_drive` が優先）。

### サーボ共通スペック

各サーボ設定（`servos.joints.*`）が持つフィールドです。

| フィールド | 型 | 説明 |
|---|---|---|
| `channel` | int | PCA9685 チャンネル番号 (0–15) |
| `min_angle` | float | 最小角度 (deg) |
| `max_angle` | float | 最大角度 (deg) |
| `min_us` | int | 最小パルス幅 (µs)。デフォルト `500` |
| `max_us` | int | 最大パルス幅 (µs)。デフォルト `2500` |
| `init_angle` | float | `last_angle` が無いときの起動時の角度 (deg) |
| `max_speed` | float | 最大角速度 (deg/s)。`0` = 即時移動 |
| `enabled` | bool | `true` で角度を保持、`false` で脱力（PWM 停止）。デフォルト `true` |
| `invert` | bool | 角度を可動域の中央で反転して出力（左右のハンドを対称に動かす）。デフォルト `false` |
| `last_angle` | float | 最後の角度 (deg)。自動で保存され、起動時と `enabled` に戻したときにこの角度から始める |

### サーボ（`servos`）

首・ハンド・アームを含む全サーボを一括管理します。

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `servos.behavior` | string | `"manual"` | `"manual"` / `"random"` |
| `servos.joints` | dict | 下記参照 | 全サーボ定義。`joint名 → servo spec` |
| `servos.random_groups` | list | `[]` | ランダム動作のタイミンググループ定義 |
| `servos.joint_states_rate` | float | `20.0` | `/joint_states` 送信レート (Hz)。`0` で無効 |

**デフォルトの `servos.joints`**

| キー | デフォルト |
|---|---|
| `servos.joints.left_hand` | ch=0, ±90°, max_speed=0（即時） |
| `servos.joints.right_hand` | ch=1, ±90°, max_speed=0（即時） |
| `servos.joints.head_pan` | ch=2, ±90°, max_speed=120 |
| `servos.joints.arm_joint_1` | ch=3, ±90°, max_speed=90 |
| `servos.joints.arm_joint_2` | ch=4, ±90°, max_speed=90 |
| `servos.joints.arm_joint_3` | ch=5, ±90°, max_speed=90 |
| `servos.joints.arm_joint_4` | ch=6, ±90°, max_speed=90 |

> 首はパン（`head_pan`）だけです。首チルトが必要な場合は `servos.joints.head_tilt` を追加してください。
> アームの軸数を変えるには `servos.joints` に `arm_joint_N` エントリを追加・削除します。`POST /config` で変更すると `servos` サブシステムが再起動されます。

**`servos.random_groups` — グループ定義**

| フィールド | 型 | 説明 |
|---|---|---|
| `name` | string | グループ識別名（タスク名 `random_<name>` に使用） |
| `joints` | list of string | このグループに属するサーボ名のリスト |
| `interval` | [float, float] | ランダム発火の待機時間範囲 (s)。`[最小, 最大]` |
| `saccade_prob` | float | 大きく素早い注視（サッカード）の確率 0–1（既定 0.18） |
| `drift` | float | ドリフト幅（可動域に対する割合・ガウス step、既定 0.07） |
| `center_pull` | float | 中立角への引き戻しの強さ 0–1（既定 0.12） |
| `drift_speed` | float | ドリフト速度（`max_speed` に対する割合、既定 0.4） |
| `long_pause_prob` | float | 時々の長い静止（settle）の確率 0–1（既定 0.22） |

> `saccade_prob` 以降は**生物的ランダム動作のチューニング**用です（すべて任意）。
> 省略時は既定値。サッカード時はフル `max_speed`、ドリフト時は `max_speed × drift_speed`。
> 中立角は `init_angle`（可動域外なら中央）です。`max_speed`=0 のサーボはランダム時 120°/s で滑らかに動きます。

**グループ構成の例**

```
neck  グループ: ["head_pan"]                — 1.0〜3.0 秒ごとに発火
hands グループ: ["left_hand","right_hand"] — 2.0〜5.0 秒ごとに同時発火
```

> グループに属さないサーボは手動コマンド（`/servo/command`）でのみ動きます。

### DCモータ

> デフォルトは**ESP32（無印）DevKitC** 向け。左ヘッダの出力可能な連続パッド
> `32,33,25,26,27,14,12` に TB6612FNG 制御 7 本を**基板の印字順**で割り当てており、
> 剥く前の連結ジャンプワイヤを一直線に挿せます。ESP32-S3 は `configs/` のプリセットを使用してください。

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `dc.pins.pwma` | int | `32` | 左モータ PWM |
| `dc.pins.ain2` | int | `33` | 左モータ IN2 |
| `dc.pins.ain1` | int | `25` | 左モータ IN1 |
| `dc.pins.stby` | int | `26` | TB6612 STBY ピン |
| `dc.pins.bin1` | int | `27` | 右モータ IN1 |
| `dc.pins.bin2` | int | `14` | 右モータ IN2 |
| `dc.pins.pwmb` | int | `12` | 右モータ PWM |
| `dc.pwm_freq` | int | `1000` | PWM 周波数 (Hz) |
| `dc.max_linear` | float | `0.30` | duty 1.0 に対応する直進速度 (m/s) |
| `dc.max_angular` | float | `1.50` | duty 1.0 に対応する旋回速度 (rad/s) |
| `dc.wheel_radius` | float | `0.030` | 車輪半径 (m) |
| `dc.wheel_separation` | float | `0.130` | 車輪間距離（タイヤ中心間, m） |
| `dc.trim` | float | `0.0` | 直進の左右差の補正。右に寄るなら正、左に寄るなら負（0.01 = 1 %）。目安 0.13 × 横ずれ (m) ÷ 走った距離 (m)²。§4-12 |
| `dc.min_duty` | float | `0.0` | 回っている車輪の duty の下限（止まりかけを防ぐ。`0` で無効、開ループのみ） |
| `dc.start_duty` | float | `0.0` | 停止から・逆転時のキック duty（静止摩擦を破る。`0` で無効、開ループのみ） |
| `dc.kick_ms` | int | `150` | キックを続ける時間 (ms) |
| `dc.speed_control` | bool | `true` | `encoder_drive` のとき車輪の速度制御（PI）を使う |
| `dc.speed_kp` | float | `2.0` | 速度誤差 1 m/s あたりの duty |
| `dc.speed_ki` | float | `15.0` | 誤差の積分 1 m あたりの duty |
| `dc.speed_i_max` | float | `0.6` | 積分の上限（エンコーダ故障時に出せる duty の上限） |
| `dc.brake` | bool | `true` | 停止をショートブレーキで行う（`false` で惰性停止） |
| `dc.invert_left` | bool | `false` | 左モータ回転方向反転 |
| `dc.invert_right` | bool | `false` | 右モータ回転方向反転 |
| `dc.cmd_timeout` | float | `0.5` | デッドマンタイムアウト (s) |

### エンコーダ / オドメトリ

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `encoder.left.a` | int | `19` | 左エンコーダ A 相ピン |
| `encoder.left.b` | int | `21` | 左エンコーダ B 相ピン |
| `encoder.right.a` | int | `22` | 右エンコーダ A 相ピン |
| `encoder.right.b` | int | `23` | 右エンコーダ B 相ピン |
| `encoder.cpr` | int | `1440` | 車輪 1 回転あたりのカウント数 |
| `encoder.publish_rate` | float | `20.0` | `/wheel_vel` 送信レート (Hz)。速度制御の周期も同じ |
| `encoder.odom_frame` | string | `"odom"` | odom の frame_id |
| `encoder.base_frame` | string | `"base_link"` | child_frame_id |
| `encoder.covariance.pose_xx` | float | `0.001` | x位置分散 (m²) |
| `encoder.covariance.pose_yy` | float | `0.001` | y位置分散 (m²) |
| `encoder.covariance.pose_aa` | float | `0.001` | yaw分散 (rad²) |
| `encoder.covariance.twist_vv` | float | `0.001` | 線速度分散 ((m/s)²) |
| `encoder.covariance.twist_ww` | float | `0.001` | 角速度分散 ((rad/s)²) |

> `encoder.odom_frame` 以降は ESP32 では使わず、brain が `/config` から読んで `/odom` に使います。

### LiDAR

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `lidar.uart` | int | `2` | UART 番号 |
| `lidar.rx` | int | `4` | ESP32 の RX ピン（LiDAR の TX をつなぐ） |
| `lidar.tx` | int | `0` | ESP32 の TX ピン（配線しない。UART が既定の TX ピンを使わないように指定） |
| `lidar.baud` | int | `230400` | ボーレート |
| `lidar.frame_id` | string | `"laser"` | `/scan` の frame_id（smabo_description の LiDAR の frame と同じ） |
| `lidar.bins` | int | `360` | `ranges` の個数（1 ビン ≈ 1°） |
| `lidar.range_min` | float | `0.05` | 最小距離 (m) |
| `lidar.range_max` | float | `12.0` | 最大距離 (m) |
| `lidar.clockwise` | bool | `true` | LiDAR の角度が時計回り（LD06 / LD19 / YDLIDAR 系） |
| `lidar.angle_offset` | float | `0.0` | ロボットの角度 = (時計回りなら −生の角度) + `angle_offset`（deg、反時計回りが正）。正面の物が左（+90°）に出るなら −90 |

---

## 7. 設定変更の反映ルール

`POST /config` で送られた内容は、まず `config.json` に**すぐ保存**され（`save_now()`）、次のルールで反映されます。
最後に `/config` を brain へ送ります。

<pre class="mermaid">
flowchart TD
    p["POST /config（部分パッチ）"] --&gt; save["config.json にすぐ保存"]
    save --&gt; k{"変わったキー"}
    k --&gt;|"i2c・pca9685・wifi・dc.pins&lt;br/&gt;encoder.left / right"| reset["notice を送り 500 ms 後に&lt;br/&gt;machine.reset()"]
    k --&gt;|"servos・dc・encoder・lidar&lt;br/&gt;（ピン以外）"| restart["そのサブシステムのタスクを作り直す"]
    k --&gt;|"ループで毎回読む値"| next["次の処理サイクルから効く"]
    k --&gt;|"brain・http・improv"| boot["次の起動から"]
    restart --&gt; pub["/config を brain へ送る"]
    next --&gt; pub
    boot --&gt; pub
</pre>

### ループ内で毎回読み直す値

次の値は使う処理が毎回 Config から読むため、新しい値は次の処理サイクルから効きます。

| 設定 | 反映タイミング |
|---|---|
| `servos.behavior`・`servos.random_groups[*]` の `interval`・`joints`・チューニング値 | 各ランダムグループの次のループ・次の発火 |
| `servos.joint_states_rate` | 次の `/joint_states` 送信後 |
| `dc.cmd_timeout` | 次の watchdog チェック (100 ms 以内) |
| `dc.max_linear` などの走行パラメータ・速度制御のゲイン | 次の `/cmd_vel`・次の速度制御ステップ |
| `encoder.publish_rate` | 次の `/wheel_vel` 送信後 |
| `encoder.covariance.*`・frame 名 | ESP32 では使わない（brain が `/config` から読む） |

### サブシステム再起動

ピン以外の変更は、変更されたトップレベルのキーに応じて、そのサブシステムのタスクをキャンセルし、
新設定でインスタンスを作り直します。サブシステムのモードが無効なら何もしません。

| 変更キー | 再起動されるサブシステム | 具体的なトリガー例 |
|---|---|---|
| `servos.*` | `servo_follower`・`servo_persist`・`random_*` 全タスク・`joint_states` | サーボのチャンネル・角度範囲変更、グループ追加・削除、アーム軸の追加・削除 |
| `dc.*`（`pins` 以外） | `drive_wd`・`odom`（`dc_drive` / `encoder_drive` のとき） | 速度上限・反転設定・速度制御のゲイン変更 |
| `encoder.*`（ピン以外） | `drive_wd`・`odom`（`encoder_drive` のとき） | CPR 値変更 |
| `lidar.*` | `scan`（UART も開き直す。`lidar` のとき） | UART ピン・ボーレート・角度の向き |

> サーボは作り直しても `last_angle` から始めるので、今の角度を保ちます。`enabled` を `false` にする変更では、
> その時点の角度を `last_angle` として一緒に保存します。

### 強制再起動（`machine.reset()`）

ピン割り当て・バスパラメータはペリフェラルの再初期化が必要なため、
設定を保存してから ESP32 をリセットします。

| 変更キー | 理由 |
|---|---|
| `i2c.*` | `machine.I2C` の再生成が必要 |
| `pca9685.*` | I2C バス上のデバイス再初期化 |
| `wifi.*` | `network.WLAN` の再接続 |
| `dc.pins.*` | `machine.PWM` / `machine.Pin` の再生成 |
| `encoder.left.*` | `machine.Pin` + IRQ の再設定 |
| `encoder.right.*` | 同上 |

**再起動フロー:**
1. `config.json` に保存（`save_now()`）
2. `{"op":"notice","message":"Rebooting to apply pin/hw changes: ..."}` を送信
3. 500 ms 後に `machine.reset()`
4. 起動後に新設定が自動的に読み込まれる

### そのほかのキー

`brain.*`・`http.*`・`improv.*` は保存だけで、次の起動から使われます（招待コード `brain.invite` だけは、
受け取るとすぐ brain に接続し直してペアリングします）。モードは `POST /mode` で変えます。

---

## 8. ハードウェア構成メモ

### PWM バスの分離

```
PCA9685 (I2C)  ←→  サーボ全軸（首・ハンド・アーム）  @ 50 Hz
ESP32 LEDC PWM ←→  DCモータドライバ（TB6612FNG）    @ 1 kHz
```

> PCA9685 の PWM 周波数は 16ch 共通のため、サーボ(50 Hz)とモータ(1 kHz)を
> 同一デバイスに混在させると両立しません。

<pre class="mermaid">
flowchart LR
    esp["ESP32"] --&gt;|"I2C"| pca["PCA9685（16ch 共通 50 Hz）"]
    pca --&gt; s1["首・ハンド・アームのサーボ"]
    esp --&gt;|"LEDC PWM 1 kHz&lt;br/&gt;+ 方向ピン・STBY"| tb["TB6612FNG"]
    tb --&gt; m1["左モータ"]
    tb --&gt; m2["右モータ"]
    e1["左右のエンコーダ（A/B 相）"] --&gt;|"GPIO 割り込み"| esp
    lidar["LD06 / LD19"] --&gt;|"UART TX → RX"| esp
</pre>

### エンコーダピンの注意

- A/B 相のピンは内部プルアップを有効にするので、オープンコレクタのエンコーダも外付け抵抗なしで使えます
- GPIO **34–39** は入力専用・内部プルアップ無し → このピンにつなぐなら**外部プルアップ抵抗が必須**
- ソフトウェア IRQ カウントのため高速回転では取りこぼしが発生します
- 高精度が必要な場合は ESP32 PCNT バインディング入りカスタムファームウェアを推奨

### LiDAR の配線

- LD06 / LD19 は UART で ESP32 に直接つなぎます。必要なのは LiDAR の TX → ESP32 の RX の 1 本だけです
- LD19 として売られているものには YDLIDAR 形式で話す互換品があります。ドライバはパケットの CRC / チェックサムで形式を自動判別し、見つけた形式をログに出します

### デフォルト PCA9685 チャンネル割り当て

| ch | `servos.joints` のキー名 | デフォルト用途 |
|---|---|---|
| 0 | `left_hand` | 左ハンド |
| 1 | `right_hand` | 右ハンド |
| 2 | `head_pan` | 首 パン |
| 3 | `arm_joint_1` | アーム 第1軸 |
| 4 | `arm_joint_2` | アーム 第2軸 |
| 5 | `arm_joint_3` | アーム 第3軸 |
| 6 | `arm_joint_4` | アーム 第4軸 |

### ボード別ピンプリセット（`configs/`）

TB6612FNG の制御 7 本（`PWMA → AIN2 → AIN1 → STBY → BIN1 → BIN2 → PWMB`）・I2C・エンコーダ・LiDAR を、
**ヘッダ上で隣り合うパッド**に割り当てたボード別テンプレートです。使うボードのファイルを
デバイス直下に `config.json` としてコピーするだけで、起動時に `DEFAULTS` へ deep-merge されます。
走行を使うには `"modes": {"dc_drive": true}`（エンコーダ付きなら `encoder_drive`）を追記して有効化します。

| ボード | ファイル | DC 7本 (PWMA→PWMB) | I2C (SCL / SDA) | エンコーダ（左 A/B・右 A/B） | LiDAR（UART / RX） |
|---|---|---|---|---|---|
| ESP32（無印）DevKitC | `config.esp32-classic.json` | 32, 33, 25, 26, 27, 14, 12 | 5 / 18 | 19/21・22/23 | 2 / 4 |
| ESP32-S3-DevKitC-1 / M-1 系 | `config.esp32s3-devkitc1.json` | 4, 5, 6, 7, 15, 16, 17 | 10 / 11 | 41/42・2/1 | 1 / 18 |

> 無印 ESP32 のデフォルト（`config.py` の `DEFAULTS`）は `config.esp32-classic.json` と同じピン並びです。
> GPIO 34–39 は入力専用のためモータ出力には使いません。互換クローンは印字順が異なる場合があるので、
> 基板のシルク印刷と必ず照合してください。
