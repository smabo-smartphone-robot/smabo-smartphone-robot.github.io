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
- [できること](#できること)
- [必要パーツ](#必要パーツ)
- [動作手順](#動作手順)
  - [起動手順](#起動手順)
  - [smaboの顔のカスタマイズ](#smaboの顔のカスタマイズ)
  - [smaboの表情の変更](#smaboの表情の変更)
  - [smaboの目をコントローラーで動かす](#smaboの目をコントローラーで動かす)
- [次回](#次回)

# ロードマップ

本ページは、以下ロードマップ「smaboの顔」のガイドページです。

また、本ページは「smabo-app」のガイドを実施している前提で話を進めます。

<!--
htmlに変換する際は、以下のsvgファイルの代わりに、roadmap.htmlに記載してあるロードマップを添付すること。ただし、本ページのノードをハイライトした状態にすること。また、roadmap.htmlに記載のロードマップの0.5倍のサイズとすること。
-->

![](../images/smabo_roadmap.drawio.svg)




# できること

本ページでは「smaboの顔機能」の使い方について解説します。

<br>

具体的には、以下の内容を実施します。

- smaboの顔のカスタマイズ
- smaboの表情の変更
- smaboの目をコントローラーで動かす

# 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| スマートフォン | - | smabo-appをインストールしたスマートフォン |


# 動作手順

## 起動手順

<!--
起動・接続手順は共通ページ「startup.md（startup.html）」に集約しているため、各ページでは直書きせず、ここで該当する項目だけを箇条書きで参照すること（ページにより項目を増減する）。
htmlに変換する際、「起動手順」へのリンク（startup.html）はクリックでポップアップ（モーダル）表示される。docs.js が a[href$="startup.html"] を捕捉して startup.html の .doc-content をモーダルに描画するため、html 側は通常のリンク（<a href="startup.html">起動手順</a>）のままでよい（JS 無効時は通常のページ遷移）。
-->

最初に、「[起動手順](./startup.md)」の

- smabo-brainの起動
- smabo-webの起動
- smabo-brain <-> smabo-webの接続
- smabo-appの接続

を実行してください。


## smaboの顔のカスタマイズ

smaboの顔は、「Face Settings」から設定を変更できます。

![alt text](../images/app_face_settings_button.png)

<br>

設定では「目の大きさ」「目の種類」「背景色の変更」などができます。

![alt text](../images/app_face_settings.png)

## smaboの表情の変更

smabo-webの「Face」タブの「Expression」に「Expression ID（smabo-app内のFace settingsで設定した表情のID）」を変更し、「Set」をクリックすると、smaboの目の種類が変化します。

![alt text](../images/app_expression_set.png)


## smaboの目をコントローラーで動かす

smaboの目はデフォルトでは、ランダムに動きますが、モードを「Follow」に変更すると、外部からの通信により自由に動かすことができます。

![alt text](../images/app_eye_follow_mode.png)


<br>

例えば、smabo-webの「Face」タブの「Gaze control」でコントローラを操作すると、それに合わせて目が動くことが確認できます。

![alt text](../images/app_gaze_control.png)

# 次回

次回は、以下ロードマップの

- メインパーツの作成

について解説します。


<!--
htmlに変換する際は、以下のsvgファイルの代わりに、roadmap.htmlに記載してあるロードマップを添付すること。ただし、次回につながるノードをハイライトした状態にすること。また、roadmap.htmlに記載のロードマップの0.5倍のサイズとすること。
-->

![](../images/smabo_roadmap.drawio.svg)