---
title: "smabo-brain"
description: "各コンポーネントを中継するハブと、画像処理・AIなどの高度な処理を担う「smabo-brain」をセットアップします。"
---

## ロードマップ

本ページは、以下ロードマップ「smabo-brain」のガイドページです。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="brain"
       aria-label="smabo 製作ガイドのロードマップ図（smabo-brain をハイライト）"></svg>
</div>

## 概要

本ページでは「smabo-brain」のセットアップ手順について解説します。

smabo-brainはsmaboの中で

- 各コンポーネントを中継するハブ
- 画像処理やAIなどの高度な処理の実行

の役割を担います。

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["制御値"]},{"from":"brain","to":"web","transport":"ws","lines":["センサ値"]},{"from":"brain","to":"web","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"esp32","transport":"ws","lines":["制御値"]},{"from":"esp32","to":"brain","transport":"ws","lines":["センサ値"]},{"from":"app","to":"brain","transport":"ws","lines":["スマホセンサ値"]},{"from":"app","to":"brain","transport":"webrtc","lines":["画像"]},{"from":"brain","to":"app","transport":"ws","lines":["制御値"]}]' data-active="brain"
       aria-label="smabo システム構成図（smabo-brain をハイライト）"></svg>
</div>

## セットアップ先（PC or SBC）

smabo-brainのセットアップ先には、以下の2パターンがあります。
- 外部PC
  - 「smaboとは別に用意されたPC」にsmabo-brainをセットアップ
- SBC(Single Board Computer)
  - smaboにSBCを取り付け、そのSBCにsmabo-brainをセットアップ

<br>

smabo-brain自体のセットアップ手順は同じですが、SBCの場合は
- SBC取り付け用パーツの印刷
- SBCのsmaboへの取り付け

が追加で必要になります（なお、SBCに必要なパーツの印刷手順は[ベースパーツの作成](/guides/base/)にて解説します。）

そのため、最初は「外部PCへのセットアップ」をおすすめします。

:::note[対応SBCについて]
現状、「取り付けパーツ」が用意されているSBCは以下になります。
- ラズパイ（4 or 5）

上記以外のSBCを取り付けたい場合は「取り付けパーツの3Dモデル」をCADなどで自作する必要があります。
:::

<br>

## 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| 【任意】Raspberry Pi4 or 5 | - | SBCを使用する場合のみ |

## smabo-brainのセットアップ

ここからは、smabo-brainのセットアップ手順について解説します。

なお、ここからは「ターミナル」を使ったコマンド入力が発生します。

:::note[ターミナル]
ターミナルとは、キーボードによる入力だけでパソコンを操作する画面（CUI）のことを言います。

一般に、システム開発ではターミナルを使って、コマンドなどを実行することが多いです。
:::

### VSCodeのインストール

最初に、ターミナルを使用する環境を構築します。

<br>

今回は、Visual Studio Code（VSCode）を使用します（VSCodeはコードエディタの一つです）。

<br>

以下サイトから、ご自身のPCのOSにあったインストーラをダウンロードしてください。

https://code.visualstudio.com

<br>

ダウンロードが完了したら、VSCodeをインストール、起動します。

### ターミナルの使い方（Linux, macの場合）

画面下部の「TREMINAL」というタブがターミナルになります。

![VS Code下部のTERMINALタブ](/images/vscode_terminal.png)

以降、コマンドの記載がある際は、こちらにのタブにて、コマンドを入力してください。

### ターミナルの使い方（Windows）

Windows PCを使用する場合は、WSLをインストールしてください。

<br>

WSL(Windows for Linux)は、
- WindowsでLinuxの環境を使用できるシステム

です。

ロボット開発ではLinuxを使用できた方が後々便利なことが多いので、以降はWSL上で作業を進めます。

<br>

#### WSLのインストール

WSLのインストール手順については、以下の記事を参考にしてください。

[WSL2 のインストールとアンインストール](https://qiita.com/zakoken/items/61141df6aeae9e3f8e36)

#### mirroredモードの有効化

WSL2のデフォルト設定では、外部環境との通信ができません。

以降で、スマホやESP32といった外部機器との通信が必要になるため、以下の記事を参考にmirroredモードに設定してください。

[wsl2 mirroredネットワーク、WindowsとLinuxの良いとこどり！](https://qiita.com/shansukey/items/008669cdf392315a656f)

#### 拡張機能のインストール

WSLのインストールが完了したら、VScodeにて以下の拡張機能をインストールしてください。
- WSL

![VS Codeの拡張機能「WSL」をインストール](/images/install_wsl.jpg)

#### WSLの中に入る

拡張機能のインストールが完了したら、

1. 「><」マークをクリック
2. 「Connected to WSL」をクリックしてください。

![VS Codeの「Connected to WSL」を選択してWSLに接続](/images/connect_wsl.jpg)

<br>

画面左下に「WSL：Ubuntu」と表示されていればOKです。ここで、画面下部の「TERMINAL」というタブがターミナルになります。

![WSLに接続したVS CodeのTERMINALタブ](/images/wsl_terminal.png)

以降、コマンドの記載がある際は、こちらにコマンドを入力してください。

### smabo-brainのクローン

以下コマンドでsmabo-brainリポジトリをクローンします。

```bash
# ホームディレクトリへ移動
cd ~ 
```

```bash
# smabo-brainリポジトリのクローン
git clone https://github.com/smabo-smartphone-robot/smabo-brain
```

### パッケージのインストール

各種プログラムの実行に必要なパッケージをインストールします。

```bash
cd ~/smabo-brain
```

```bash
pip3 install -r requirements.txt
```

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動">こちらの起動手順</a>」の内容を実行してください。

<br>

エラーが発生せずに、起動が完了すればOKです。

## 次回

次回は、以下ロードマップの

- [smabo-web](/guides/smabo-web/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="web"
       aria-label="smabo 製作ガイドのロードマップ図（次回：smabo-web をハイライト）"></svg>
</div>
