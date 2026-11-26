---
title: "brain-ros（セットアップ・概要）"
description: "必要な構成：smabo-app + smabo-esp32 + smabo-brain-ros"
---

## ロードマップ

本ページは、以下ロードマップ「smabo-brain-ros」のガイドページです。

また、本ページは「[smabo-brain](/guides/smabo-brain/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="brainros"
       aria-label="smabo 製作ガイドのロードマップ図（brain-ros をハイライト）"></svg>
</div>

## 概要

本ページでは「smabo-brain-ros」のセットアップ手順について解説します。

smabo-brain-rosはsmaboの中で

- smaboのセンサ値や制御値をROS2通信として扱う

役割を担います。

ROS2通信を使うことで、以降のガイドで登場する「ナビゲーション」や「動作計画」で使用するライブラリ（Nav2やMoveIt2など）を利用することができます。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["制御値"]},{"from":"brain","to":"web","transport":"ws","lines":["センサ値"]},{"from":"brain","to":"web","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"esp32","transport":"ws","lines":["制御値"]},{"from":"esp32","to":"brain","transport":"ws","lines":["センサ値"]},{"from":"app","to":"brain","transport":"ws","lines":["スマホセンサ値"]},{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"app","transport":"ws","lines":["制御値"]}]' data-active="brain"
       data-variant="brainros"
       aria-label="smabo システム構成図（smabo-brain-ros は smabo-brain の位置で動き、内部で WebSocket・WebRTC を ROS 2 通信に変換する）"></svg>
</div>


<br>

smabo-brain, smabo-brain-rosを比較すると下図のようになります。



<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 540" role="img" data-variant="brainros-detail"
       aria-label="smabo-brain と smabo-brain-ros の比較図（どちらも計算部分は同じ。smabo-brain は WebSocket・WebRTC で直接通信し、smabo-brain-ros は ROS 2 トピックに変換してから、ROS2 ノードや Nav2・MoveIt2 とやり取りする）"></svg>
</div>

## 必要パーツ

必要なパーツはありません。

## パーツの印刷

今回、新たに追加されるパーツはありません。

## 組み立て手順

今回、組み立てはありません。

## 配線

今回、配線はありません。

## 完成形

今回、完成形の変更はありません。

## 環境の構築

smabo-brain-rosの環境構築手順を以下に示します。

### Dockerのインストール

smabo-brain-rosはDockerで動かすため、PC/SBCにDockerをインストールしてください。

- Windows
  - WSLに[Docker Engine (ubuntu)](https://docs.docker.com/engine/install/ubuntu/) をインストールします。
  - インストールが完了したら、sudoなしでDockerを使えるようにします。
    - [参考：Dockerコマンドをsudoなしで実行する方法](https://qiita.com/DQNEO/items/da5df074c48b012152ee)
- Mac
  - [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/) をインストールします。
- Linux（Ubuntu・ラズパイなど）
  - [Docker Engine](https://docs.docker.com/engine/install/)をインストールします。
    - 使用するLinuxディストリビューションに応じて、インストール手順が異なります。
  - インストールが完了したら、sudoなしでDockerを使えるようにします。
    - [参考：Dockerコマンドをsudoなしで実行する方法](https://qiita.com/DQNEO/items/da5df074c48b012152ee)

<br />


### smabo-brain-rosのクローン

以下コマンドでsmabo-brain-rosリポジトリをクローンします。

<br>

smabo-brain-rosは、実行時にsmabo-brainのプログラムを読み込むため、「smabo-brainと同じディレクトリ（以下の例は、ホームディレクトリ）」にクローンしてください。

```bash
# ホームディレクトリへ移動
cd ~
```

```bash
# smabo-brain-rosリポジトリのクローン
git clone https://github.com/smabo-smartphone-robot/smabo-brain-ros
```

<br>

以下のように、2つのリポジトリが同じディレクトリに存在することを確認してください。

```
~/
├── smabo-brain
└── smabo-brain-ros
```

### Docker Imageのビルド

以下コマンドで、Docker Imageをビルドします。  
※ 初回はビルドに時間がかかります（数十分程度）。

```bash
cd ~/smabo-brain-ros
```

```bash
docker compose build
```



<br>

エラーが出ずに完了すればOKです。

<br>

:::note[プログラムを更新したとき]
smabo-brain-rosを更新したときは、もう一度`docker compose build`を実行してください。
:::

## 動作手順

以下手順で、動作の確認を行います。

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brain-rosの起動,smabo-webの起動,smabo-brain-ros---smabo-webの接続">こちらの起動手順</a>」の内容を実行してください。

<br />

各種プログラムの起動、通信が確認できればOKです。

## 次回

次回は、以下ロードマップの

- [ナビゲーション](/guides/nav/)
- [動作計画](/guides/plan/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="nav,plan"
       aria-label="smabo 製作ガイドのロードマップ図（ナビゲーション・動作計画 をハイライト）"></svg>
</div>
