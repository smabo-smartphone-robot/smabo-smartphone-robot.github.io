---
title: "brain-ros（セットアップ・概要）"
description: "必要な構成：smabo-app + smabo-esp32 + smabo-brain-ros"
---

## ロードマップ

本ページは、以下ロードマップ「brain-ros」のガイドページです。

また、本ページは「[smabo-brain](/guides/smabo-brain/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="brainros"
       aria-label="smabo 製作ガイドのロードマップ図（smabo-brain-ros をハイライト）"></svg>
</div>

## できること

本ページでは「smabo-brain-ros」のセットアップ手順について解説します。

<br>

具体的には、以下の内容を実施します。

- smabo-brain-rosのセットアップ

## 構成

今回は、下図のようになります。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"brain","to":"esp32","transport":"ws","lines":["速度指令","サーボ制御"]},{"from":"esp32","to":"brain","transport":"ws","lines":["ホイール速度","LiDAR"]}]' data-active="brain,esp32"
       aria-label="smabo システム構成図（smabo-brain・smabo-esp32 をハイライト）"></svg>
</div>

## smabo-brain-rosとは

smabo-brain-rosはsmaboの中で

- smabo-brainの純ロジック（オドメトリ積分など）をROS 2ノードとして公開する

役割を担います。

<br>

ROS 2を導入することで、ナビゲーション（Nav2）や動作計画（MoveIt2）といった既存のROSエコシステムを活用できるようになります。

> ROS 2（Humble以降）が必要です。また、smabo-brainがimport可能であること（`brain`パッケージ）が前提です。

### smabo-brain-rosのクローン

以下コマンドでsmabo-brain-rosリポジトリをクローンします。

```bash
# ホームディレクトリへ移動
cd ~
```

```bash
# smabo-brain-rosリポジトリのクローン
git clone https://github.com/smabo-smartphone-robot/smabo-brain-ros
```

### ビルド

付属のスクリプトで、ワークスペースの作成・リンク・ビルドを行います。

```bash
cd ~/smabo-brain-ros
```

```bash
./build.sh
```

## 動作手順

以下手順で、動作の確認を行います。

以下コマンドで、オドメトリノードを起動します。

```bash
cd ~/smabo-brain-ros
```

```bash
./run.sh
```

<br>

別ターミナルで`/odom`トピックが配信されていればOKです。

```bash
ros2 topic echo /odom
```

## 次回

次回は、以下ロードマップの

- [ナビゲーション](/guides/nav/)
- [動作計画](/guides/plan/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="nav,plan"
       aria-label="smabo 製作ガイドのロードマップ図（次回：ナビゲーション・動作計画 を交互にハイライト）"></svg>
</div>
