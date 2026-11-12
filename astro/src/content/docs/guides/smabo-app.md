---
title: "smabo-app"
description: "smaboの「顔」とセンサを担う smabo-app をスマホにインストールし、接続・顔設定・センサ可視化・音声認識・発話・視線操作を確認します。"
---

## ロードマップ

本ページは、以下ロードマップ「smabo-app」のガイドページです。

また、本ページは「[smabo-web](/guides/smabo-web/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="app"
       aria-label="smabo 製作ガイドのロードマップ図（smabo-app をハイライト）"></svg>
</div>

## 概要

本ページでは「smabo-app」のセットアップ手順について解説します。

smabo-appはsmaboの中で

- smaboの顔
- smaboのセンサー（スマホのセンサーを使用）

の役割を担います。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]},{"from":"app","to":"brain","transport":"ws","lines":["スマホセンサ値"]},{"from":"brain","to":"app","transport":"ws","lines":["制御値"]}]' data-active="app"
       aria-label="smabo システム構成図（smabo-app をハイライト）"></svg>
</div>

## 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| スマートフォン | - | お手持ちのスマートフォン |

### smabo-appのインストール

スマホにsmabo-appをインストールします。

なお、ここではandroidの手順のみを記載します。

> IOSの場合、flutterのインストールなどが必要になり、少し手順が多くなるため、詳しくは[smabo-appのリポジトリ](https://github.com/smabo-smartphone-robot/smabo-app)のREADMEを確認してください。
>
> また、IOSの場合、アプリのインストールに、mac OSのPCが必要です。

スマホから[smabo-appのReleaseページ](https://github.com/smabo-smartphone-robot/smabo-app/releases)にアクセスします。

いくつかあるバージョンの中で、一番最新バージョンのapkファイルをダウンロードしてください。

ダウンロードしたapkファイルを実行するとsmabo-appがインストールされます。

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webのテンプレート一覧から、テンプレート「smabo-app」を選択してください（選択方法は「[テンプレートの選択](/guides/smabo-web/#テンプレートの選択)」を参照）。

<br>

各種プログラムの起動、通信が確認できればOKです。

## 次回

次回は、以下ロードマップの

- [smaboの顔](/guides/smabo_face/)
- [スマホのセンサー](/guides/smabo_sensors/)
- [音声処理](/guides/audioproc/)
- [画像処理](/guides/imgproc/)
- [ベースパーツの作成](/guides/base/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="face,sensors,voice,imgproc,baseparts"
       aria-label="smabo 製作ガイドのロードマップ図（次回：顔・スマホセンサ・音声処理・画像処理・ベースパーツの作成 を順番にハイライト）"></svg>
</div>
