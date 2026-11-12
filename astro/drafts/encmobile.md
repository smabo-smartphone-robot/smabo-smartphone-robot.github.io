---
title: "エンコーダ付移動ロボット"
description: "必要な構成：smabo-app + smabo-esp32"
---

## ロードマップ

本ページは、以下ロードマップ「エンコーダ付移動ロボット」のガイドページです。

また、本ページは「[移動ロボット](/guides/mobile/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="encmobile"
       aria-label="smabo 製作ガイドのロードマップ図（エンコーダ付 をハイライト）"></svg>
</div>

## できること

本ページでは「エンコーダ付移動ロボット」機能の実装について解説します。

<br>

具体的には、以下の内容を実施します。

- 車輪へのエンコーダの取り付け
- エンコーダによる走行距離の計測（オドメトリ）

:::note[オドメトリの仕組み]
smabo-esp32はエンコーダから左右の車輪速度を計算し、`/wheel_vel`（left/right/dt）としてsmabo-brainへ送信します。
smabo-brainはこれを積分して自己位置（x/y/θ）を求め、`/odom`として配信します。
エンコーダ走行を使う場合は、smabo-esp32の`modes.encoder_drive`を有効にします。
:::

## 構成

今回は、下図のようになります。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"brain","to":"esp32","transport":"ws","lines":["速度指令"]},{"from":"esp32","to":"brain","transport":"ws","lines":["ホイール速度"]}]' data-active="brain,esp32"
       aria-label="smabo システム構成図（smabo-brain・smabo-esp32 をハイライト）"></svg>
</div>

## 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| ロータリーエンコーダ付きモータ または エンコーダ × 2 | link | 左右の車輪用 |

## パーツの印刷

今回、新たに追加されるパーツを3Dプリンタで印刷します。

> 3Dプリンタは機種によって「印刷する際に使用するソフト」が異なるため、ここでは具体的な設定手順ではなく、ポイントのみを記載します。

<br>

以下のパーツを図の向きに設定して、印刷してください。

:::note[印刷の際の注意点]
- パーツのつけ外しの際に、根本から折れにくくするため、凸部は横向きにして印刷
- サポート材は必ずONにした状態で印刷
:::

- ***.stl
    ここに画像

<br>

- ***.stl
    ここに画像

## 組み立て手順

以下動画のように、必要パーツを組み立てます。

※ 動画には、前回までに印刷したパーツも含まれます

<!--ここに、エンコーダ付移動ロボットの組み立て動画を置いてください-->

:::note[組み立ての際のポイント]
oooo
:::

## 配線

:::caution[ブレッドボードの+極について]
SAD101購入時についていた、<strong class="red">+極のジャンプワイヤーは必ず外してください</strong>。
ついたままだと、<strong class="red">ESP32, アクチュエータが破損する</strong>可能性があります。
![ブレッドボード中央のジャンプワイヤーを外す](/images/esp32_breadboard_remove_jumper.png)
:::

<br>

エンコーダは、smabo-esp32のデフォルト設定では、以下のピンが割り当てられています。

※ 下記表において、「接続先1」と「接続先2」は、両者が回路的に直接繋がっていることを指します。

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| 左車輪エンコーダの`a` | ESP32のGPIO 34 | - |
| 左車輪エンコーダの`b` | ESP32のGPIO 35 | - |
| 右車輪エンコーダの`a` | ESP32のGPIO 36 | - |
| 右車輪エンコーダの`b` | ESP32のGPIO 39 | - |

<br>

ESP32-DevKitCの場合の、具体的な配線図は、以下になります。

:::note[配線の際のポイント]
oooo
:::

## 完成系

今回作成したロボットの完成系は下図のようになります。

## 動作手順

以下手順で、動作の確認を行います。

smabo-webのテンプレート一覧から、テンプレート「エンコーダ付移動ロボット」を選択し（選択方法は「[テンプレートの選択](/guides/smabo-web/#テンプレートの選択)」を参照）、「Config」パネルで`encoder_drive`を有効にし、台車を手で動かしたときに「Drive」パネルのオドメトリ（位置・速度）やTrail Mapが更新されればOKです。

## 次回

次回は、以下ロードマップの

- [ナビゲーション](/guides/nav/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="nav"
       aria-label="smabo 製作ガイドのロードマップ図（次回：ナビゲーション をハイライト）"></svg>
</div>
