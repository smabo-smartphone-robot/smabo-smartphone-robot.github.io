---
title: "首振り"
description: "MG996Rサーボを使った首振り機能。コントローラー・ランダム・画像処理による首振り制御を実装します。"
---

## ロードマップ

本ページは、以下ロードマップ「首振り」のガイドページです。

また、本ページは「[smabo-esp32](/guides/smabo-esp32/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="neck"
       aria-label="smabo 製作ガイドのロードマップ図（首振り をハイライト）"></svg>
</div>

## 概要

本ページでは「首振り機能」について解説します。

<br>

具体的には、以下の内容を実施します。

- 首振りのコントローラー制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_manual.mp4" type="video/mp4"></video>

- 首振りのランダム制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_random.mp4" type="video/mp4"></video>

- 画像認識による首振り制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_img_proc.mp4" type="video/mp4"></video>

<br>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["サーボ制御値"]},{"from":"brain","to":"esp32","transport":"ws","lines":["サーボ制御値"]},{"from":"web","to":"esp32","transport":"rest","lines":["esp32設定変更"]},{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"web","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"web","transport":"ws","lines":["画像処理結果"]}]' data-active="web,brain,esp32,app"
       aria-label="smabo システム構成図（首振り をハイライト）"></svg>
</div>

## 必要パーツ

「[smabo-esp32](/guides/smabo-esp32/)」のパーツに加えて、以下のパーツが必要です。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| MG996R | [link](https://akizukidenshi.com/catalog/g/g112534/) | 互換品でも良いですが、ホーンのサイズが純正と異なる場合は、パーツにうまくはまりません。<br>そのため、ホーンを削るか、3Dモデルの修正が発生する可能性があります。 |
## パーツの印刷

今回、新たに追加されるパーツを3Dプリンタで印刷します。

> 3Dプリンタは機種によって「印刷する際に使用するソフト」が異なるため、ここでは具体的な設定手順ではなく、ポイントのみを記載します。

<br>

以下のパーツを図の向きに設定して、印刷してください。

:::note[印刷の際の注意点]
- パーツのつけ外しの際に、根本から折れにくくするため、凸部は横向きにして印刷
- サポート材は必ずONにした状態で印刷
:::

- smabo-hardware/stl/pan/mg996r/pan_adapter.stl
    ![3Dプリントした首振り用パーツpan_adapter](/images/neck_print_pan_adapter.png)

<br>

- smabo-hardware/stl/pan/mg996r/pan_plate_top.stl
    ![3Dプリントした首振り用パーツpan_plate_top](/images/neck_print_pan_plate_top.png)

<br>

- smabo-hardware/stl/pan/mg996r/pan_stand_left.stl
    ![3Dプリントした首振り用パーツpan_stand_left](/images/neck_print_pan_stand_left.png)

<br>

- smabo-hardware/stl/pan/mg996r/pan_stand_right.stl
    ![3Dプリントした首振り用パーツpan_stand_right](/images/neck_print_pan_stand_right.png)

## 組み立て手順

以下動画のように、必要パーツを組み立てます。

※ 動画には、前回までに印刷したパーツも含まれます

<div style="width:100%;aspect-ratio:16/9;margin-block:1em">
  <iframe src="/assembly_movie/neck.html" style="width:100%;height:100%;border:none;border-radius:12px" title="首振り 組み立て動画" loading="lazy"></iframe>
</div>

:::note[組み立ての際のポイント]
組み立て動画では、MG996Rの取り付け手順は分からないため、以下に記載します。

<br>

最初に、下図のように「pan_stand_left」と「pan_stand_right」でsg90を固定します。
![pan_stand_leftとpan_stand_rightで首振り用サーボを固定](/images/neck_create_1.jpg)

<br>

そして、pan_plate_topを上から被せてホーンをはめ込みます（工具不要でも組み立て可能ですが、MG996Rに付属のネジでホーンとサーボを固定してもOKです）。
![pan_plate_topを上からスライドさせてサーボホーンにはめる](/images/neck_create_2.jpg)
:::

## 配線

下記表の内容に従って、配線します。

※ 下記表において、「接続先1」と「接続先2」は、両者が回路的に直接繋がっていることを指します。

### 乾電池

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| 乾電池バッテリーボックスの+極 | ブレッドボードの+極の<strong class="red">右側</strong> | 以降、右側を6V電圧として扱うため注意 |
| 乾電池バッテリーボックスの-極 | ブレッドボードの-極 | - |

### ESP32

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| ESP32の5V | ブレッドボードの+極の<strong class="red">左側</strong> | 以降、左側を5V電圧として扱うため注意 |
| ESP32のGND | ブレッドボードの-極 | - |

### PCA9685

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| PCA9685のV+ | ブレッドボードの+極の<strong class="red">右側</strong> | サーボの電源（6V） |
| PCA9685のVCC | ブレッドボードの+極の<strong class="red">左側</strong> | - |
| PCA9685のSDA | config.jsonの`i2c/sda`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 18<br>- config.esp32s3-devkitc1.json：GPIO 11 |
| PCA9685のSCL | config.jsonの`i2c/scl`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 5<br>- config.esp32s3-devkitc1.json：GPIO 10 |
| PCA9685のGND | ブレッドボードの-極 | - |

### SG90（首）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| SG90（首）のコネクタ | PCA9685のchannel 2 | 茶色の線（GND）がPCA9685のGND側になる向きで挿す |

<br>

ESP32-DevKitC（config.esp32-classic.jsonに記載のデフォルト設定の場合）の配線図は、以下になります。

※ デフォルト設定の場合、首のサーボをchannel=2に接続してください。

![首振り用サーボとPCA9685・ESP32の配線図](/fritzing/png/neck.png)

## 完成系

今回作成したロボットの完成系は下図のようになります。

![首振り機構を取り付けたsmaboの完成形](/images/smabo_neck.jpg)

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webの「Config」タブを開いてください。

### サーボ設定

smabo-webの「Config」タブの「Modes/servos」にて、各サーボの設定を変更可能です。

ここでは、
- 「head_pan」を有効化

します。

![smabo-webのConfigでhead_panを有効化](/images/neck_config_head_pan_enable.jpg)

### コントローラー制御

コントローラー制御の手順を説明します。

「Config」タブの「Modes/servos」にて、head_panの
- 「mode」を「manual」

に設定してください。

![head_panのmodeをmanualに設定](/images/neck_config_mode_manual.jpg)

<br>

「Servo」タブで各サーボの角度を変更すると、それに合わせてsmaboが左右に動作します。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_manual.mp4" type="video/mp4"></video>

### ランダム制御

ランダム制御の手順を説明します。

「Config」タブの「Modes/servos」にて、head_panの
- 「mode」を「random」
- 「group」を「neck」

に設定してください。 

![head_panのmodeをrandom、groupをneckに設定](/images/neck_config_mode_random.jpg)

:::note[random_group]
同じrandom_groupに設定されたサーボモーターは、同じタイミングでランダムに動作します。

<br>

なお、新規のrandom_groupは「Add random Group」をクリックすると、追加できます。

![smabo-webの「Add random Group」でランダム動作グループを追加](/images/hand_add_random_group.png)
:::

<br>

しばらく待つと、ランダムなタイミングでsmaboが左右に動作することが確認できます。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_random.mp4" type="video/mp4"></video>

### 画像処理による制御

画像処理による制御の手順を説明します。

「Config」タブの「Modes/servos」にて、head_panの
- 「mode」を「manual」

に設定してください。

![head_panのmodeをmanualに設定](/images/neck_config_mode_manual.jpg)

<br>

「Vision」タブの「Detection」にて、
- 「Enabled」を有効化し、
- 任意の認識モードを設定（ここでは、colorモードで青色の物体を認識するように設定しています）

します。

![smabo-webで指定した色の物体を認識する設定](/images/neck_vision_detection.jpg)

<br>

次に、「Behaviors」の
- 「Servo follow」を有効化し、
- 「Pan joint」を「head_pan」
- 「Pan Direction」を「reversed(-1)」

に設定します。

![BehaviorsでサーボをFollowさせPan Directionをreversedに設定](/images/neck_vision_servo_follow.jpg)

<br>

設定完了後、スマホカメラの前に認識対象の物体を近づけると、物体に追従するようにsmaboが首振りすることが確認できます。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_img_proc.mp4" type="video/mp4"></video>

## 次回

本ページはロードマップ上の終着点のひとつです。

他の機能も実装する場合は、ロードマップから次のページへ進んでください。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="neck"
       aria-label="smabo 製作ガイドのロードマップ図（首振り をハイライト）"></svg>
</div>
