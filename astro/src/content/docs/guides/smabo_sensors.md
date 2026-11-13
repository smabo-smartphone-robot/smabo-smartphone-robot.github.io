---
title: "スマホのセンサー"
description: "スマホのマイク・カメラ・IMU・GPS を smabo のセンサーとして smabo-web で可視化します。"
---

## ロードマップ

本ページは、以下ロードマップ「スマホのセンサー」のガイドページです。

また、本ページは「smabo-app」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="sensors"
       aria-label="smabo 製作ガイドのロードマップ図（スマホのセンサー をハイライト）"></svg>
</div>

## 概要

本ページでは「smaboのセンサー」について解説します。

具体的には、以下の内容を実施します。
- スマホのセンサデータ（画像、IMU、GPS）をsmabo-webで可視化
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo-web-sensor.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]},{"from":"app","to":"brain","transport":"ws","lines":["IMU","GPS"]},{"from":"brain","to":"web","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"web","transport":"ws","lines":["IMU","GPS"]}]'
       aria-label="smabo システム構成図（スマホのセンサー をハイライト）"></svg>
</div>

## 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| スマートフォン | - | smabo-appをインストール済みのスマホ |

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webの「Sensors」タブを開いてください。

### 各種センサーの状態を可視化

smaboの各種センサのON/OFFは左下のボタンで設定できます。

![smabo-app左下のセンサーON/OFFボタン](/images/app_sensor_toggle.png)

<br>

センサをONにした状態で、smabo-webの「Sensors」タブを確認すると、各種センサの情報を可視化できます。

![smabo-webで可視化したスマホのセンサー情報](/images/app_sensor_web.png)

## 次回

次回は、以下ロードマップの

- [ベースパーツの作成](/guides/base/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo 製作ガイドのロードマップ図（次回：ベースパーツの作成 をハイライト）"></svg>
</div>
