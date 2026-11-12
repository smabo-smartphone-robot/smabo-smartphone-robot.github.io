---
title: "画像処理"
description: "スマホのカメラ映像を smabo-brain で画像認識（ARマーカー・色・顔・QR）し、認識結果をもとに smabo の目やサーボ、走行を制御します。"
---

## ロードマップ

本ページは、以下ロードマップ「画像処理」のガイドページです。

また、本ページは「[smabo-brain](/guides/smabo-brain/)」と「[smabo-app](/guides/smabo-app/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="imgproc"
       aria-label="smabo 製作ガイドのロードマップ図（画像処理 をハイライト）"></svg>
</div>

## 概要

本ページでは「画像処理機能」について解説します。

具体的には、以下の内容を実施します。
- カメラから取得した画像をもとに、対象物体を識別
  - 識別結果をsmabo-webで可視化
  - 識別結果をもとにsmaboの目を制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/img_proc_smabo_web.mp4" type="video/mp4"></video>
<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_img_proc.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"web","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"app","transport":"ws","lines":["目の制御"]},{"from":"web","to":"brain","transport":"ws","lines":["画像処理設定"]},{"from":"brain","to":"web","transport":"ws","lines":["画像処理結果"]}]'
       aria-label="smabo システム構成図（画像処理 をハイライト）"></svg>
</div>

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webのテンプレート一覧から、テンプレート「画像処理」を選択してください（選択方法は「[テンプレートの選択](/guides/smabo-web/#テンプレートの選択)」を参照）。

### 画像認識

smabo-webの「Vision」パネルにて画像認識に関する設定が可能で、「Detection」の「enabled」を有効化することで、画像認識機能を有効化できます。

![smabo-webのVisionパネルで画像認識を有効化](/images/web_vision_detection.png)

<br>

画像認識はいくつかの種類が用意してあり、「Mode」を変更することで、以下の物体を認識可能です。
- ARマーカー
- 指定した色の物体
- 顔認識
- QRコード

![画像認識モードの選択（ARマーカー・色・顔・QRコード）](/images/web_vision_mode.png)

<br>

なお、Min sizeを設定することで
- 画像内で認識対象とする物体の最小サイズ（このサイズ以上の物体は認識対象とする）

を設定可能です（プレビューを有効化すると、右下に最小サイズの枠が表示されます）。

![画像認識の最小サイズ設定とプレビューの枠](/images/web_vision_min_size.png)
 
### 物体認識をもとに制御

「Behaviors」にて、認識結果をもとにした制御も可能です。

具体的には、
- 認識した中で、「一番大きい物体」の座標や画像サイズをもとに制御

します。

![認識した物体の座標をもとに制御するBehaviors設定](/images/web_vision_behaviors.png)

<br>

制御の種類としては、以下になります。
- 目の制御
  - 認識した物体を追従するようにsmaboの目が動作
- サーボの制御
  - 認識した物体に追従するようにサーボが動作
  - 左右方向、上下方向それぞれにサーボを設定可能
  - 詳細は「[首振り](/guides/neck/)」にて解説
- 二輪駆動ロボットの制御
  - 認識した物体を追従するようにロボットを制御
  - 物体のサイズが、target sizeに設定されたサイズを維持するように、ロボットが前進、後退
  - 詳細は、「[移動ロボット](/guides/mobile/)」にて解説

<br>

例えば、「目の制御」の場合、
- smabo-appの顔のモードを「Follow」に

![smabo-appの顔のモードを「Follow」に設定](/images/app_eye_follow_mode.png)

設定します。

この状態で、認識対象の物体をカメラの前に持ってくると、smaboの目が追従することが確認できます。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_img_proc.mp4" type="video/mp4"></video>

## 次回

次回は、以下ロードマップの

- [ベースパーツの作成](/guides/base/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo 製作ガイドのロードマップ図（次回：ベースパーツの作成 をハイライト）"></svg>
</div>
