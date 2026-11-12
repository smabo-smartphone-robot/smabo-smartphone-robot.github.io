---
title: "ナビゲーション"
description: "必要な構成：smabo-app + smabo-esp32 + smabo-brain-ros"
---

## ロードマップ

本ページは、以下ロードマップ「ナビゲーション」のガイドページです。

また、本ページは「[エンコーダ付移動ロボット](/guides/encmobile/)」と「[brain-ros](/guides/brainros/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="nav"
       aria-label="smabo 製作ガイドのロードマップ図（ナビゲーション をハイライト）"></svg>
</div>

## できること

本ページでは「ナビゲーション」機能の実装について解説します。

<br>

具体的には、以下の内容を実施します。

- 目標地点を指定しての自律移動

## 構成

今回は、下図のようになります。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"brain","to":"esp32","transport":"ws","lines":["速度指令"]},{"from":"esp32","to":"brain","transport":"ws","lines":["ホイール速度","LiDAR"]}]' data-active="brain,esp32"
       aria-label="smabo システム構成図（smabo-brain・smabo-esp32 をハイライト）"></svg>
</div>

## ナビゲーションとは

ナビゲーションは、エンコーダによるオドメトリ（自己位置）をもとに、

- 目標地点までの経路の生成
- 経路に沿った走行制御

を行う機能です。

<br>

smaboでは、smabo-brain-rosで公開される`/odom`をもとに、ROS 2のナビゲーションスタック（Nav2）を用いて実現します。

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
