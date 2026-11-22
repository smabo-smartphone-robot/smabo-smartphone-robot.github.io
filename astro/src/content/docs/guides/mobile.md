---
title: "移動ロボット"
description: "TTモータとどこでもキャスターSを使い、コントローラー・画像処理による移動ロボット機能を実装します。"
---

## ロードマップ

本ページは、以下ロードマップ「移動ロボット」のガイドページです。

また、本ページは「[smabo-esp32](/guides/smabo-esp32/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="mobile"
       aria-label="smabo 製作ガイドのロードマップ図（移動ロボットをハイライト）"></svg>
</div>

## 概要

本ページでは「移動ロボット」機能の実装について解説します。

<br>

具体的には、以下の内容を実施します。

- 移動ロボットのコントローラー制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_manual_control.mp4" type="video/mp4"></video>

- 移動ロボットの画像処理による制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_img_proc.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"esp32","transport":"ws","lines":["速度指令"]},{"from":"web","to":"brain","transport":"ws","lines":["速度指令"]},{"from":"brain","to":"web","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"web","transport":"ws","lines":["画像処理結果"]}]'
       aria-label="smabo システム構成図（移動ロボットに関わるデータの流れをハイライト）"></svg>
</div>

## 必要パーツ

「[smabo-esp32](/guides/smabo-esp32/)」のパーツに加えて、以下のパーツが必要です。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| トイDCモータ用タイヤ | [link](https://www.amazon.co.jp/EQWQSIXD-2枚スマートカーシャーシおもちゃのホイールTTギアモーターホイールタイヤ/dp/B0GGBJ28H4/ref=sr_1_26?dib=eyJ2IjoiMSJ9.4FTlNQNg2PNhrQWHWCq1VDVSeuya5EkUmhYpxFsDFUfHp1VRahy96A67RIHQH9ibIRlLIzizRUjQypePRfeWYEjC4Xkv__iO89CGUyja83DKpYSqAtFlpw3HK3JZXC8l_7CbgBxyj25WMxgNvs0Vj_mTJEgCx11oV4jH8gcaw_nnoLEoOy27waXHHP1D9GAx5wk3YoJOf7mkinbBhxyengmzAsVi34v89FbE-kC8HFcbjWRNl9fKWyn4gzRqsQEidM-blg7h4gtymWS6XWF3wP_bhkNSn8PJfFi5vSQob90.NxbnVCRKi4zdC1WBt2D3W5p2zgN_rLX3CwbBS3SBa10&dib_tag=se&keywords=TTモーター+タイヤ&qid=1780323553&sr=8-26) | 互換品でも可。 |
| TTモータ | [link](https://www.amazon.co.jp/DIANN-Motor-Gearbox-200RPM-Ratio/dp/B0F87YT715/ref=asc_df_B0F87YT715?mcid=9b7fc4990dc0322a82a20101948464a3&tag=jpgo-22&linkCode=df0&hvadid=781176336697&hvpos=&hvnetw=g&hvrand=18345257182238334739&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-2449268817747&psc=1&hvocijid=18345257182238334739-B0F87YT715-&hvexpln=0) | コネクタピン付きの方が、ブレッドボードに差しやすくて、抜けにくいのでお勧めです。<br><br> 互換品は多数ありますが、[一般的なTTモーターの寸法](https://docs.sunfounder.com/projects/3in1-kit/ja/latest/components/component_tt_motor.html)と大きく異なる場合は、上手く取り付けることができないので注意してください。 |
| どこでもキャスターS | [link](https://www.amazon.co.jp/YAHATA-%E3%81%A9%E3%81%93%E3%81%A7%E3%82%82%E3%82%AD%E3%83%A3%E3%82%B9%E3%82%BF%E3%83%BC-S%E3%83%96%E3%83%AB%E3%83%BC-S/dp/B0091GH8YU) | - |

## パーツの印刷

今回、新たに追加されるパーツを3Dプリンタで印刷します。

> 3Dプリンタは機種によって「印刷する際に使用するソフト」が異なるため、ここでは具体的な設定手順ではなく、ポイントのみを記載します。

<br>

以下のパーツを図の向きに設定して、印刷してください。

:::note[印刷の際の注意点]
- パーツのつけ外しの際に、根本から折れにくくするため、凸部は横向きにして印刷
- サポート材は必ずONにした状態で印刷
:::

- smabo-hardware/stl/mobile_robot/dc_motor_caster.stl
    ![3Dプリントした移動ロボット用パーツdc_motor_caster](/images/mobile_print_dc_motor_caster.png)

<br>

- smabo-hardware/stl/mobile_robot/tt_motor/tt_motor_bottom.stl
    ![3Dプリントした移動ロボット用パーツtt_motor_bottom](/images/mobile_print_tt_motor_bottom.png)

<br>

- smabo-hardware/stl/mobile_robot/tt_motor/tt_motor_stopper1.stl × 2
  - 左右にモータをつけるので2つ印刷します。
    ![3Dプリントしたttモーター固定パーツtt_motor_stopper1](/images/mobile_print_tt_motor_stopper1.png)

<br>

- smabo-hardware/stl/mobile_robot/tt_motor/tt_motor_stopper2_LR.stl
  - 左右のモーター用のパーツがつながっているので、1つ印刷します。
    ![3Dプリントしたttモーター固定パーツtt_motor_stopper2_LR](/images/mobile_print_tt_motor_stopper2_LR.png)

## 組み立て手順

以下動画のように、必要パーツを組み立てます。

※ 動画には、前回までに印刷したパーツも含まれます

<p>
  <iframe src="/assembly_movie/smabo_tt_motor.html" title="移動ロボット 組み立て手順"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[組み立ての際のポイント]
組み立て動画では、ttモーター、及びどこでもキャスターSの取り付け手順は分からないため、以下に記載します。

<br>

最初に、下図のように「dc_motor_caster.stl」にどこでもキャスターSを貼り付けます。
![どこでもキャスターSを貼り付ける前のdc_motor_caster](/images/dc_motor_caster_before.jpg)
![どこでもキャスターSを貼り付けたdc_motor_caster](/images/dc_motor_caster_after.jpg)

<br>

次に、「tt_motor_bottom.stl」に対して「tt_motor_stopper1.stl」「tt_motor_stopper2_LR.stl」を使ってttモーターを固定します。
![tt_motor_stopperでttモーターを固定した状態](/images/tt_motor_assemble.jpg)
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

### TB6612FNG

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| TB6612FNGのPWMA | config.jsonの`dc/pins/pwma`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 32<br>- config.esp32s3-devkitc1.json：GPIO 4 |
| TB6612FNGのAIN2 | config.jsonの`dc/pins/ain2`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 33<br>- config.esp32s3-devkitc1.json：GPIO 5 |
| TB6612FNGのAIN1 | config.jsonの`dc/pins/ain1`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 25<br>- config.esp32s3-devkitc1.json：GPIO 6 |
| TB6612FNGのSTBY | config.jsonの`dc/pins/stby`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 26<br>- config.esp32s3-devkitc1.json：GPIO 7 |
| TB6612FNGのBIN1 | config.jsonの`dc/pins/bin1`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 27<br>- config.esp32s3-devkitc1.json：GPIO 15 |
| TB6612FNGのBIN2 | config.jsonの`dc/pins/bin2`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 14<br>- config.esp32s3-devkitc1.json：GPIO 16 |
| TB6612FNGのPWMB | config.jsonの`dc/pins/pwmb`に設定したESP32のピン | それぞれのデフォルトピンは以下<br>- config.esp32-classic.json：GPIO 12<br>- config.esp32s3-devkitc1.json：GPIO 17 |
| TB6612FNGのVM | ブレッドボードの+極の<strong class="red">右側</strong> | モーターの電源（6V） |
| TB6612FNGのVCC | ブレッドボードの+極の<strong class="red">左側</strong> | - |
| TB6612FNGのGND | ブレッドボードの-極 | TB6612FNGには3つGNDピンがありますが、全てブレッドボードの-極に挿してください |

### TTモーター（左車輪）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| TTモーター（左車輪）の端子1 | TB6612FNGのA01 | - |
| TTモーター（左車輪）の端子2 | TB6612FNGのA02 | 前後が逆に回るときは、端子1と端子2を入れ替える |

### TTモーター（右車輪）

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| TTモーター（右車輪）の端子1 | TB6612FNGのB02 | - |
| TTモーター（右車輪）の端子2 | TB6612FNGのB01 | 前後が逆に回るときは、端子1と端子2を入れ替える |

<br>

ESP32-DevKitC（config.esp32-classic.jsonに記載のデフォルト設定の場合）の配線図は、以下になります（ブレッドボードだけだと穴が足りないため、TB6612FNGは、ミニブレッドボードにて配線しています）。

![ttモーターとモータードライバTB6612FNG・ESP32の配線図](/fritzing/png/tt_motor.png)

:::note[TB6612FNG配線の際のポイント1]
TB6612FNGは、裏側に各ピンの役割が記載してあるため、配線前によく確認しておきましょう。

※ 当然ですが、ブレッドボードに挿すと裏面から見たピン位置と左右逆になるため注意しましょう。
![TB6612FNGモータードライバ裏面のピン配置](/images/mobile_tb6612fng_backside.png)
[参考画像：デュアル・モータードライバTB6612FNG(連続最大1.2A)（スイッチサイエンス）](https://www.switch-science.com/products/385?srsltid=AfmBOopaI6nY3Kyny25gDpjTx1m8gO5k-UhwiDTIQxFYU8d_kZrGWxxc)
:::

:::note[TB6612FNG配線の際のポイント]
TB6612FNGのPWMA〜PWMBピンについてですが、「ESP32側で対応するピン位置を連続になるように設定」しておけば、下図のように
- ジャンプワイヤーを一本ずつ剥かず、7本分まとめて扱うことができる

ため配線がすっきりします。

![ミニブレッドボード上のTB6612FNGの配線](/images/TB6612FNG_%20wiring.jpg)
:::

## 完成形

今回作成したロボットの完成形は下図のようになります。

![ttモーターで走る移動ロボット版smaboの完成形](/images/smabo_tt_motor.jpg)

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webの「Config」タブを開いてください。

### dcモータの有効化

smabo-webの「Config」タブにて

- 「Modes/dc_drive」を有効化

します。

![smabo-webのConfigでModes/dc_driveを有効化](/images/mobile_config_dc_drive_enable.png)

### コントローラー制御

コントローラー制御の手順を説明します。

「Drive」タブのコントローラで移動ロボットのsmaboを制御できます。

![smabo-webのDriveタブのコントローラ](/images/mobile_web_drive_tab.png)

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_manual_control.mp4" type="video/mp4"></video>

### 画像処理による制御

画像処理による制御の手順を説明します。

「Vision」タブの「Detection」にて、
- 「Enabled」を有効化し、
- 任意の認識モードを設定（ここでは、colorモードで青色の物体を認識するように設定しています）

します。

![smabo-webで指定した色の物体を認識する設定](/images/neck_vision_detection.jpg)

<br>

次に、「Behaviors」の
- 「Drive follow」を有効化します。

![BehaviorsのDrive followを有効化](/images/mobile_vision_drive_follow_enable.png)

<br>

なお、Drive followモードでは、カメラから見た認識物体のサイズが「Target size」を維持するように、移動ロボットが前後方向に動きます（具体的なサイズは、preview画面の青枠にて確認可能）。

![previewの青枠で目標サイズを確認](/images/mobile_vision_target_size_preview.png)

<br>

設定完了後、スマホカメラの前に認識対象の物体を近づけると、物体に追従するように移動ロボットのsmaboが動作します。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_img_proc.mp4" type="video/mp4"></video>

## 次回

次回は、以下ロードマップの

- [エンコーダ付移動ロボット](/guides/encmobile/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="encmobile"
       aria-label="smabo 製作ガイドのロードマップ図（次回：エンコーダ付移動ロボット をハイライト）"></svg>
</div>
