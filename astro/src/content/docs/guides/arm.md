---
title: "ロボットアーム"
description: "必要な構成：smabo-app + smabo-esp32"
---

## ロードマップ

本ページは、以下ロードマップ「ロボットアーム」のガイドページです。

また、本ページは「[smabo-esp32](/guides/smabo-esp32/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="arm"
       aria-label="smabo 製作ガイドのロードマップ図（ロボットアーム をハイライト）"></svg>
</div>

## 概要

本ページでは「ロボットアーム機能」について解説します。

具体的には、以下の内容を実施します。
- ロボットアームのコントローラー制御
    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_arm_manual.mp4" type="video/mp4"></video>

## 必要パーツ

「[smabo-esp32](/guides/smabo-esp32/)」のパーツに加えて、以下のパーツが必要です。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| SG90 × 4 | [link](https://akizukidenshi.com/catalog/g/gM-08761/) | 互換品でも良いですが、ホーンのサイズが純正と異なる場合は、パーツにうまくはまりません。<br>そのため、ホーンを削るか、3Dモデルの修正が発生する可能性があります。 |
## パーツの印刷

今回、新たに追加されるパーツを3Dプリンタで印刷します。

> 3Dプリンタは機種によって「印刷する際に使用するソフト」が異なるため、ここでは具体的な設定手順ではなく、ポイントのみを記載します。

<br>

以下のパーツを図の向きに設定して、印刷してください。

:::note[印刷の際の注意点]
- パーツのつけ外しの際に、根本から折れにくくするため、凸部は横向きにして印刷
- サポート材は必ずONにした状態で印刷
:::

- smabo-hardware/stl/arm/sg90/sg90_1_L.stl
    ![alt text](/images/arm_print_sg90_1_l.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_1_R.stl
    ![alt text](/images/arm_print_sg90_1_r.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_2.stl
    ![alt text](/images/arm_print_sg90_2.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_3_concave.stl
  ![alt text](/images/arm_print_sg90_3_concave.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_3_convex.stl
    ![alt text](/images/arm_print_sg90_3_convex.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_4_concave.stl
    ![alt text](/images/arm_print_sg90_4_concave.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_4_convex.stl
    ![alt text](/images/arm_print_sg90_4_convex.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_5_concave.stl
    ![alt text](/images/arm_print_sg90_5_concave.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_5_convex.stl
    ![alt text](/images/arm_print_sg90_5_convex.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_5_hand.stl
    ![alt text](/images/arm_print_sg90_5_hand.png)

<br>

- smabo-hardware/stl/base/pca9685_stopper_l.stl
  背面でpca9895を固定していた時と同じパーツを使用します。
    ![](/images/esp32_print_pca9685_stopper_l.png)

<br>

- smabo-hardware/stl/base/pca9685_stopper_r_top.stl × 2
    背面でpca9895を固定していた時と同じパーツを使用します。
    また、左右で同じパーツを使用するため、2つ印刷します
    ![](/images/esp32_print_pca9685_stopper_r_top.png)

## 組み立て手順

以下動画のように、必要パーツを組み立てます。

※ 動画には、前回までに印刷したパーツも含まれます

<p>
  <iframe src="/assembly_movie/smabo_arm.html" title="ロボットアーム 組み立て手順"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[組み立ての際のポイント]
組み立て動画では、SG90、pca9685の取り付け手順は分からないため、以下に記載します。


なお、各関節の可動範囲は下動画のようになるため、参考にしながら組み立ててください。
<p>
  <iframe src="/assembly_movie/arm_joint_range.html" title="ロボットアーム 可動範囲"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

<br>

下図のように「sg90_1_L」と「sg90_1_R」でsg90を固定し、ボディに取り付けます。
（凹んでいる部分に、ケーブルが通るように取り付けてください）

![alt text](/images/arm_assemble_sg90_1.webp)
![alt text](/images/arm_assemble_sg90_1_body.webp)

<br>

smaboの背面に設置されていたpca9685のサーボモータドライバを、「pca9685_stopper_l.stl」「pca9685_stopper_r_top.stl × 2」でsmaboの上部に付け替えます（ケーブルの長さが足りないため）。

![alt text](/images/arm_assemble_pca9685_top.webp)

<br>


「sg90_2」を上から被せてホーンをはめ込みます（工具不要でも組み立て可能ですが、SG90に付属のネジでホーンとサーボを固定してもOKです）。

![alt text](/images/arm_assemble_sg90_2.webp)


<br>



アームの本体部分を組み立てます。　
「sg90_3_concave」と「sg90_3_convex」、「sg90_4_concave」と「sg90_4_convex」、「sg90_5_concave」と「sg90_5_convex」をそれぞれ組み合わせて、アームの本体部分を作ります。


![alt text](/images/arm_assemble_sg90_3.webp)
![alt text](/images/arm_assemble_sg90_4.webp)
![alt text](/images/arm_assemble_sg90_5.webp)

<br>

ハンドを取り付けます。
「sg90_5_hand」を取り付けます。

![alt text](/images/arm_assemble_hand.webp)

<br>

最後に、ボディにアームを取り付けます。
![alt text](/images/arm_complete.webp)



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

### SG90（アームの関節1）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| SG90（アームの関節1）のコネクタ | PCA9685のchannel 3 | 茶色の線（GND）がPCA9685のGND側になる向きで挿す |

### SG90（アームの関節2）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| SG90（アームの関節2）のコネクタ | PCA9685のchannel 4 | 茶色の線（GND）がPCA9685のGND側になる向きで挿す |

### SG90（アームの関節3）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| SG90（アームの関節3）のコネクタ | PCA9685のchannel 5 | 茶色の線（GND）がPCA9685のGND側になる向きで挿す |

### SG90（アームの関節4）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| SG90（アームの関節4）のコネクタ | PCA9685のchannel 6 | 茶色の線（GND）がPCA9685のGND側になる向きで挿す |

<br>

ESP32-DevKitC（config.esp32-classic.jsonに記載のデフォルト設定の場合）の配線図は、以下になります。

※ デフォルト設定の場合、アームの根本の関節からchannel=3, channel=4, channel=5, channel=6に接続してください。



![アーム用サーボ4個とPCA9685・ESP32の配線図](/fritzing/png/arm.png)

## 完成系

今回作成したロボットの完成系は下図のようになります。

![alt text](/images/arm_complete.webp)


## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">こちらの起動手順</a>」の内容を実行してください。

### サーボ設定

smabo-webの「Config」タブの「Modes/servos」にて、各サーボの設定を変更可能です。

- 「arm_joint_1」「arm_joint_2」「arm_joint_3」「arm_joint_4」を有効化

します。

![alt text](/images/arm_servo_enable.webp)


### コントローラー制御

コントローラー制御の手順を説明します。

「Config」タブの「Modes/servos」にて、arm_joint_1～4の

- 「mode」を「manual」

に設定してください。

![alt text](/images/arm_servo_mode_manual.webp)


<br>

「Servo」タブで各サーボの角度を変更すると、それに合わせてアームが動作します。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_arm_manual.mp4" type="video/mp4"></video>

## 次回

次回は、以下ロードマップの

- [動作計画（準備中）]()

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo 製作ガイドのロードマップ図（次回：動作計画 をハイライト）"></svg>
</div>
