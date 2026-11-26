---
title: "ハンド"
description: "ハンドのコントローラー制御とランダム制御を実装します。"
---

## ロードマップ

本ページは、以下ロードマップ「ハンド」のガイドページです。

また、本ページは「[smabo-esp32](/guides/smabo-esp32/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="hand"
       aria-label="smabo 製作ガイドのロードマップ図（ハンド をハイライト）"></svg>
</div>

## 概要

本ページでは「ハンド機能」について解説します。

具体的には、以下の内容を実施します。
- ハンドのコントローラー制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_manual.mp4" type="video/mp4"></video>

- ハンドのランダム制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_random.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["サーボ制御値"]},{"from":"brain","to":"esp32","transport":"ws","lines":["サーボ制御値"]},{"from":"web","to":"esp32","transport":"rest","lines":["esp32設定変更"]}]' data-active="web,brain,esp32"
       aria-label="smabo システム構成図（smabo-web・smabo-brain・smabo-esp32 をハイライト）"></svg>
</div>

## 必要パーツ

「[smabo-esp32](/guides/smabo-esp32/)」のパーツに加えて、以下のパーツが必要です。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| SG90 × 2 | [link](https://akizukidenshi.com/catalog/g/gM-08761/) | 互換品でも良いですが、ホーンのサイズが純正と異なる場合は、パーツにうまくはまりません。<br>そのため、ホーンを削るか、3Dモデルの修正が発生する可能性があります。 |

## パーツの印刷

今回、新たに追加されるパーツを3Dプリンタで印刷します。

> 3Dプリンタは機種によって「印刷する際に使用するソフト」が異なるため、ここでは具体的な設定手順ではなく、ポイントのみを記載します。

<br>

以下のパーツを図の向きに設定して、印刷してください。

:::note[印刷の際の注意点]
- パーツのつけ外しの際に、根本から折れにくくするため、凸部は横向きにして印刷
- サポート材は必ずONにした状態で印刷
:::

- smabo-hardware/stl/hand/sg90/sg90_plate_1.stl × 2
    左右で同じパーツを使用するため、2つ印刷します
    ![3Dプリントしたハンド用パーツsg90_plate_1](/images/hand_print_sg90_plate_1.png)

<br>

- smabo-hardware/stl/hand/sg90/sg90_plate_2.stl × 2
    左右で同じパーツを使用するため、2つ印刷します
    ![3Dプリントしたハンド用パーツsg90_plate_2](/images/hand_print_sg90_plate_2.png)

<br>

- smabo-hardware/stl/hand/sg90/sg90_base.stl × 2
    左右で同じパーツを使用するため、2つ印刷します
    ![3Dプリントしたハンド用パーツsg90_base](/images/hand_print_sg90_base.png)

<br>

- smabo-hardware/stl/hand/sg90/arm_hand.stl × 2
    左右で同じパーツを使用するため、2つ印刷します
    ![3Dプリントしたハンド用パーツarm_hand](/images/hand_print_arm_hand.png)

## 組み立て手順

以下動画のように、必要パーツを組み立てます。

※ 動画には、前回までに印刷したパーツも含まれます

<p>
  <iframe src="/assembly_movie/hand.html" title="ハンド 組み立て手順"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[組み立ての際のポイント]
組み立て動画では、SG90の取り付け手順は分からないため、以下に記載します。

なお、各ハンドの可動範囲は下動画のようになるため、参考にしながら組み立ててください。
<p>
  <iframe src="/assembly_movie/hand_joint_range.html" title="ハンド 可動範囲"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

<br>

最初に、下図のように「sg90_plate_1」と「sg90_plate_2」でsg90を固定し、ボディに取り付けます。
![sg90_plateでSG90サーボを固定する手順](/images/hand_create_1.jpg)
![SG90サーボを固定したハンドパーツをボディに取り付ける手順](/images/hand_create_2.jpg)

<br>

そして、sg90_baseを上から被せてホーンをはめ込みます（工具不要でも組み立て可能ですが、SG90に付属のネジでホーンとサーボを固定してもOKです）。
![sg90_baseを上からスライドさせてサーボホーンにはめる](/images/hand_create_3.jpg)
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

### SG90（左手）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| SG90（左手）のコネクタ | PCA9685のchannel 0 | - |

### SG90（右手）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| SG90（右手）のコネクタ | PCA9685のchannel 1 | - |

<br>

ESP32-DevKitC（config.esp32-classic.jsonに記載のデフォルト設定の場合）の配線図は、以下になります。

※ デフォルト設定の場合、左腕のサーボをchannel=0, 右腕のサーボをchannel=1に接続してください。

![ハンド用サーボ2個とPCA9685・ESP32の配線図](/fritzing/png/hand.png)

:::note[配線の際のポイント]
SG90のケーブルは、smabo背面右下の隙間から通す形でPCA9685に接続してください。
:::

## 完成形

今回作成したロボットの完成形は下図のようになります。

![ハンドを取り付けたsmaboの完成形](/images/smabo_hand.jpg)

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webの「Config」タブを開いてください。

### サーボ設定

smabo-webの「Config」タブの「Modes/servos」にて、各サーボの設定を変更可能です。

最初に、「ハンドの左右のサーボモータは反対方向についている」ため、回転方向を合わせるために、
- 「right_hand」のみ「inverse」を有効

にします。

![smabo-webのConfigでright_handのinverseを有効化](/images/hand_servo_inverse.png)

<br>

次に、
- 「left_hand」「right_hand」を有効化

します。

![smabo-webのConfigでleft_handとright_handを有効化](/images/hand_servo_enable.png)

### コントローラー制御

コントローラー制御の手順を説明します。

「Config」タブの「Modes/servos」にて、left_hand, right_handの

- 「mode」を「manual」

に設定してください。

![ハンドのサーボのmodeをmanualに設定](/images/hand_mode_manual.png)

<br>

「Servo」タブで各サーボの角度を変更すると、それに合わせて左右の腕が動作します。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_manual.mp4" type="video/mp4"></video>

### ランダム制御

ランダム制御の手順を説明します。

「Config」タブの「Modes/servos」にて、left_hand, right_handの

- 「mode」を「random」
- 「group」を「hands」

に設定してください。

![ハンドのサーボのmodeをrandom、groupをhandsに設定](/images/hand_mode_random.png)

:::note[random_group]
同じrandom_groupに設定されたサーボモーターは、同じタイミングでランダムに動作します。

<br>

逆に、左右のハンドを異なるタイミングでランダムに動かしたい場合は、left_hand, right_handそれぞれが別のrandom_groupに属するように設定してください。

<br>

なお、新規のrandom_groupは「Add Random group」をクリックすると、追加できます。

![smabo-webの「Add Random group」でランダム動作グループを追加](/images/hand_add_random_group.png)
:::

<br>

しばらく待つと、ランダムなタイミングで左右のハンドが動作することが確認できます。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_random.mp4" type="video/mp4"></video>

## 次回

本ページは、ロードマップの終端の1つです。

<br>

smaboには、他にも様々な機能があります。

他にも試したい機能がある場合は、ロードマップからお好きなページをご覧ください。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active=""
       aria-label="smabo 製作ガイドのロードマップ図（次回）"></svg>
</div>
