<!--
以下は、md -> html 生成の際の指示（html生成時に直接出力する箇所ではない。以降、コメントアウトしてある箇所は、html生成時の注意事項が記載してあるものとする）

- markdownにて記載した文章は、誤字・脱字を除き、一切省略せずに、全く同じ文章でhtmlに反映すること（改行のタイミングなども含む）
    - 追記、修正した方がいい文章があった場合は、必ずユーザーに確認した上で、了承を得られた場合のみmarkdown, htmlともに修正すること
- 誤字、脱字があった場合は、markdown,html両方とも修正すること
- 表記揺れがあった場合は、どちらに統一するかユーザー側に確認したのちに、markdown, htmlともに、指定された表記に統一されるように修正すること
- 処理内容などに言及する部分に関しては、間違いがないか（コードが存在する場合は）コードの内容と照らし合わせて確認すること。その際、不整合があった場合は、ユーザー側に確認した上で了承が得られたら、markdown,htmlともに修正すること
- その他不正確な内容が含まれている場合は、ユーザー側に確認した上で了承が得られたら、markdown,htmlともに修正すること
-->

# 目次 <!-- omit in toc -->

- [ロードマップ](#ロードマップ)
- [前提](#前提)
- [できること](#できること)
- [smabo-brainとは](#smabo-brainとは)
  - [smabo-webのクローン](#smabo-webのクローン)
  - [パッケージのインストール](#パッケージのインストール)
- [動作手順](#動作手順)
  - [smabo-brainの起動](#smabo-brainの起動)
  - [smabo-webの起動](#smabo-webの起動)
  - [smabo-brain \<-\> smabo-webの接続](#smabo-brain---smabo-webの接続)
- [次回](#次回)

# ロードマップ

本ページは、以下ロードマップの「smabo-web」になります。

<!--
htmlに変換する際は、以下のsvgファイルの代わりに、roadmap.htmlに記載してあるロードマップを添付すること。ただし、本ページのノードをハイライトした状態にすること。また、roadmap.htmlに記載のロードマップの0.5倍のサイズとすること。
-->

![](../images/smabo_roadmap.drawio.svg)

!!! note
    本ページの内容の設計書は、以下ページにて閲覧できます。
    - [ooo]()


# 前提

本ページは、以下ページの内容を実施している前提とします。

- [smabo-brain](./smabo-brain.md)


# できること

本ページでは「smabo-web」のセットアップ手順について解説します。

<br>

具体的には、以下の内容を実施します。

- smabo-webのセットアップ

# smabo-brainとは

smabo-webはsmaboの中で

- smaboの設定の変更、手動操作、センサの可視化などの補助的ツール

の役割を担います。


## smabo-webのクローン

以下コマンドでsmabo-webリポジトリをクローンします。

```bash
# ホームディレクトリへ移動
cd ~ 
```

```bash
# smabo-brainリポジトリのクローン
git clone https://github.com/smabo-smartphone-robot/smabo-web
```

## パッケージのインストール

各種プログラムの実行に必要なパッケージをインストールします。

```bash
cd ~/smabo-web
```

```bash
npm install
```


# 動作手順

以下手順で、動作の確認を行います。


## smabo-brainの起動

最初に、smabo-brainを起動します。

```bash
cd ~/smabo-brain
```

```bash
python3 -m brain
```

## smabo-webの起動

次に、別ターミナルで、smabo-webを起動します。

```bash
cd ~/smabo-web
```
```bash
npm run dev
```

<br>

この状態で、ブラウザから`localhost:******`に接続し、以下のように表示されればOKです。


## smabo-brain <-> smabo-webの接続

最後に、smabo-brainとsmabo-webの接続テストを行います。

smabo-webの「接続」ボタンをクリックし、接続が成功すればOKです。


# 次回

次回は、以下ロードマップの

- smabo-app

について解説します。


<!--
htmlに変換する際は、以下のsvgファイルの代わりに、roadmap.htmlに記載してあるロードマップを添付すること。ただし、次回につながるノードをハイライトした状態にすること。また、roadmap.htmlに記載のロードマップの0.5倍のサイズとすること。
-->

![](../images/smabo_roadmap.drawio.svg)
