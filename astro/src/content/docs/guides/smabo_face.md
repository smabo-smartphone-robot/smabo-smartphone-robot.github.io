---
title: "smaboの顔"
description: "スマホ画面に表示される smabo の顔をカスタマイズし、表情の変更やコントローラーでの視線操作を行います。"
---

## ロードマップ

本ページは、以下ロードマップ「smaboの顔」のガイドページです。

また、本ページは「smabo-app」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="face"
       aria-label="smabo 製作ガイドのロードマップ図（smaboの顔 をハイライト）"></svg>
</div>

## 概要

本ページでは「smaboの顔機能」について解説します。

具体的には、以下の内容を実施します。

- smabo-webから、smaboの表情を変更
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_change.mp4" type="video/mp4"></video>

- smabo-webから、smaboの目をコントロール
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_manual.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["表情変更","目の制御"]},{"from":"brain","to":"app","transport":"ws","lines":["表情変更","目の制御"]}]'
       aria-label="smabo システム構成図（smaboの顔 をハイライト）"></svg>
</div>

## 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| スマートフォン | - | smabo-appをインストールしたスマートフォン |

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webのテンプレート一覧から、テンプレート「smaboの顔」を選択してください（選択方法は「[テンプレートの選択](/guides/smabo-web/#テンプレートの選択)」を参照）。

### smaboの顔のカスタマイズ

smaboの顔は、「Face Settings」から設定を変更できます。

![smabo-appの「Face Settings」ボタン](/images/app_face_settings_button.png)

<br>

設定では「目の大きさ」「目の種類」「背景色の変更」などができます。

![smabo-appの顔の設定画面（目の種類・背景色など）](/images/app_face_settings.png)

### smaboの表情の変更

smabo-webの「Expression」パネルで表情の名前（smabo-appのFace settingsで付けた名前）を入力して「Set」をクリックするか、表情名のボタンをクリックすると、smaboの目の種類が変化します。名前の大文字・小文字は区別しません。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_change.mp4" type="video/mp4"></video>

### smaboの目をコントローラーで動かす

smaboの目はデフォルトでは、ランダムに動きますが、モードを「Follow」に変更すると、外部からの通信により自由に動かすことができます。

![smabo-appの顔のモードを「Follow」に設定](/images/app_eye_follow_mode.png)

<br>

例えば、smabo-webの「Gaze control」パネルでコントローラを操作すると、それに合わせて目が動くことが確認できます。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_manual.mp4" type="video/mp4"></video>

## 次回

次回は、以下ロードマップの

- [ベースパーツの作成](/guides/base/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo 製作ガイドのロードマップ図（次回：ベースパーツの作成 をハイライト）"></svg>
</div>
