---
title: "動作計画"
description: "必要な構成：smabo-app + smabo-esp32 + smabo-brain-ros"
---

## ロードマップ

本ページは、以下ロードマップ「動作計画」のガイドページです。

また、本ページは「[ロボットアーム](/guides/arm/)」「[brain-ros](/guides/brainros/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo 製作ガイドのロードマップ図（動作計画 をハイライト）"></svg>
</div>

## 概要

本ページでは「動作計画」機能の実装について解説します。

<br>

具体的には、以下の内容を実施します。

- 動作計画の実施
  <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/plan_real.mp4" type="video/mp4"></video>


<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["目標姿勢","計画・実行の指示"]},{"from":"brain","to":"web","transport":"ws","lines":["計画した動作","関節角度"]},{"from":"brain","to":"esp32","transport":"ws","lines":["サーボ指令"]},{"from":"esp32","to":"brain","transport":"ws","lines":["関節角度"]}]' data-active="brain,esp32"
       data-variant="brainros"
       aria-label="smabo システム構成図（smabo-brain-ros・smabo-esp32 をハイライト）"></svg>
</div>


## 必要パーツ

新たに必要なパーツはありません。

## パーツの印刷

今回、新たに追加されるパーツはありません。

## 組み立て手順

今回、新たな組み立てはありません。  
「[ロボットアーム](/guides/arm/)」で組み立てたものをそのまま使います。

## 配線

今回、新たな配線はありません。  
「[ロボットアーム](/guides/arm/)」の配線のまま使います。

## 完成形

今回作成したロボットの完成形は下図のようになります。

※ 新たに配線はしていないため、「[ロボットアーム](/guides/arm/)」の時と同じになります。

![ロボットアームを取り付けたsmaboの完成形](/images/arm_complete.webp)


## 動作手順

以下手順で、動作の確認を行います。

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brain-rosの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain-ros---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">こちらの起動手順</a>」の内容を実行してください。

次に、smabo-webの「Motion Plan」タブを開いてください。

### サーボ設定

smabo-webの「Config」タブの「Modes/servos」にて、

- 「arm_joint_1」「arm_joint_2」「arm_joint_3」「arm_joint_4」を有効化
- 「mode」を「manual」

に設定してください。

![smabo-webのConfigタブ。「arm_joint_1」〜「arm_joint_4」の有効化と「mode」の「manual」を赤枠で囲んだ画面](/images/plan_servo_settings.png)

### 動作計画モードの起動

最初に「Start Motion Plan」をクリックして、動作計画モードを開始します。

![smabo-webのMotion Planタブ。「Start Motion Plan」ボタンを赤枠で囲んだ画面](/images/plan_start.png)


### 目標姿勢の指定

ロボットアームを動かしたい姿勢に設定します。


最初に、「Planning group」で動かすグループを選択します。

ここでは、「arm」を選択してください。

![smabo-webのMotion Planタブ。「Planning group」の「arm」を赤枠で囲んだ画面](/images/plan_group_arm.png)


<br>

次に、ロボットアームの姿勢を設定します。

arm_joint_1〜3を任意の角度に設定してください。

![smabo-webのMotion Planタブ。arm_joint_1〜3の目標角度のスライダーを赤枠で囲んだ画面](/images/plan_goal_joints.png)



### 計画と実行

動作計画のプランと実行を行います。

最初に、「Plan」をクリックすると、ロボットアームが現在姿勢から目標姿勢までに至る動作が計画されます。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/plan_web.mp4" type="video/mp4"></video>


<br>

そして、「Execute」をクリックすると、実際のsmaboのアームがPlanで計画した内容に従って、動作することを確認できます。


<br>

※ 下動画では、「Plan & Execute」ボタンにより、計画と動作を同時に実施しています。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/plan_real.mp4" type="video/mp4"></video>

## 次回

本ページは、ロードマップ上の終着点のひとつです。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo 製作ガイドのロードマップ図（動作計画 をハイライト）"></svg>
</div>
