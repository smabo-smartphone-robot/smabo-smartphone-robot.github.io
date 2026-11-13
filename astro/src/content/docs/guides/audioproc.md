---
title: "音声処理"
description: "ウェイクワードで起動して話しかけると smabo-brain が音声認識し、smabo-web から任意の文章を発話させます。"
---

## ロードマップ

本ページは、以下ロードマップ「音声処理」のガイドページです。

また、本ページは「smabo-app」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="voice"
       aria-label="smabo 製作ガイドのロードマップ図（音声処理 をハイライト）"></svg>
</div>

## 概要

本ページでは「音声処理機能」について解説します。

具体的には、以下の内容を実施します。
- スマホで取得した音声を、音声認識
  - 認識結果をsmabo-webに表示
![smabo-webに表示されたsmabo-appの音声認識結果](/images/app_recognized_speech.png)

- smabo-webで指定した文字列を発話
![smabo-webで指定した文字列をsmaboが発話する画面](/images/app_speech_say.jpg)

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"ws","lines":["音声"]},{"from":"brain","to":"web","transport":"ws","lines":["音声認識結果"]},{"from":"web","to":"brain","transport":"ws","lines":["発話文字列"]},{"from":"brain","to":"app","transport":"ws","lines":["発話文字列"]}]'
       aria-label="smabo システム構成図（音声処理 をハイライト）"></svg>
</div>

## 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| スマートフォン | - | smabo-appをインストール済みのスマホ |

## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">こちらの起動手順</a>」の内容を実行してください。

その後、smabo-webの「Face」タブを開いてください。

### 音声認識

smaboに対して「smabo」と話しかけると、smaboの目が虹色に光ります（wake upワードはsmabo-appの設定画面から変更できます）。

目が虹色の状態で何か言葉を話すと、音声認識が開始されます（認識する言語は、smabo-appの設定画面から変更できます）。

![smabo-appが音声を聞き取っている画面](/images/app_voice_listening.png)

<br>

目の色が戻った後に、smabo-webの「Face」タブの「Recognized speech」を確認すると、先ほど話した言葉が表示されます。

![smabo-webに表示されたsmabo-appの音声認識結果](/images/app_recognized_speech.png)

### 音声発話

smabo-webの「Face」タブの「Speech / Say」で、任意の文章を入力し、「Say」ボタンをクリックすると入力された音声がスマホから発話されます（発話する言語は、smabo-appの設定画面から変更できます）。

![smabo-webで指定した文字列をsmaboが発話する画面](/images/app_speech_say.jpg)

<br>

なお、「Bubble ON」「Speak ON」ボタンにて発話のON/OFF、吹き出しの有無を設定可能です。

![smabo-appの発話ON/OFFと吹き出し表示の設定](/images/app_speech_toggle.png)

## 次回

次回は、以下ロードマップの

- [ベースパーツの作成](/guides/base/)

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo 製作ガイドのロードマップ図（次回：ベースパーツの作成 をハイライト）"></svg>
</div>
