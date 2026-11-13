---
title: "smabo-web"
description: "設定変更・手動制御・センサ可視化を行うブラウザツール「smabo-web」をセットアップします。"
---

## ロードマップ

本ページは、以下ロードマップ「smabo-web」のガイドページです。

また、本ページは「[smabo-brain](/guides/smabo-brain/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="web"
       aria-label="smabo 製作ガイドのロードマップ図（smabo-web をハイライト）"></svg>
</div>

## 概要

本ページでは「smabo-web」のセットアップ手順について解説します。

smabo-webはsmaboの中で

- smaboの設定の変更、手動操作、センサの可視化などの補助的ツール

の役割を担います。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["制御値"]},{"from":"brain","to":"web","transport":"ws","lines":["センサ値"]},{"from":"brain","to":"web","transport":"webrtc","lines":["画像"]},{"from":"web","to":"esp32","transport":"rest","lines":["esp32設定変更"]}]' data-active="web"
       aria-label="smabo システム構成図（smabo-web をハイライト）"></svg>
</div>

### smabo-webのクローン

以下コマンドでsmabo-webリポジトリをクローンします。

```bash
# ホームディレクトリへ移動
cd ~ 
```

```bash
# smabo-brainリポジトリのクローン
git clone https://github.com/smabo-smartphone-robot/smabo-web
```

### パッケージのインストール

各種プログラムの実行に必要なパッケージをインストールします。

```bash
cd ~/smabo-web
```

```bash
npm install
```

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続">こちらの起動手順</a>」の内容を実行してください。

<br>

各種プログラムの起動、通信が確認できればOKです。

## 次回

次回は、以下ロードマップの

- [smabo-app](/guides/smabo-app/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="app"
       aria-label="smabo 製作ガイドのロードマップ図（次回：smabo-app をハイライト）"></svg>
</div>
