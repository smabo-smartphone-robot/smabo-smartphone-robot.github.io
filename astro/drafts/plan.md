---
title: "動作計画"
description: "必要な構成：smabo-app + smabo-esp32 + smabo-brain-ros"
---

## ロードマップ

本ページは、以下ロードマップ「動作計画」のガイドページです。

また、本ページは「[ロボットアーム](/guides/arm/)」と「[brain-ros](/guides/brainros/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo 製作ガイドのロードマップ図（動作計画 をハイライト）"></svg>
</div>

## できること

本ページでは「動作計画」機能の実装について解説します。

<br>

具体的には、以下の内容を実施します。

- ロボットアームの目標姿勢を指定しての動作計画・制御

## 構成

今回は、下図のようになります。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"brain","to":"esp32","transport":"ws","lines":["速度指令","サーボ制御"]},{"from":"esp32","to":"brain","transport":"ws","lines":["ホイール速度","LiDAR"]}]' data-active="brain,esp32"
       aria-label="smabo システム構成図（smabo-brain・smabo-esp32 をハイライト）"></svg>
</div>

## 動作計画とは

動作計画は、ロボットアームについて

- 目標とする手先の位置・姿勢から、各関節の角度を求める
- 障害物や可動範囲を考慮した、関節の動かし方を計算する

を行う機能です。

<br>

smaboでは、smabo-esp32が公開する`/joint_states`をもとに、ROS 2の動作計画フレームワーク（MoveIt2）を用いて実現します。

> 具体的な手順は oooo

## 動作手順

以下手順で、動作の確認を行います。

oooo

## 次回

本ページはロードマップ上の終着点のひとつです。

他の機能も実装する場合は、ロードマップから次のページへ進んでください。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active=""
       aria-label="smabo 製作ガイドのロードマップ図（次回）"></svg>
</div>
