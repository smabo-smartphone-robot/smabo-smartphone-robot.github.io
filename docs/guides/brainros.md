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
- [構成](#構成)
- [smabo-brain-rosとは](#smabo-brain-rosとは)
  - [smabo-brain-rosのクローン](#smabo-brain-rosのクローン)
  - [ビルド](#ビルド)
- [動作手順](#動作手順)
- [次回](#次回)

# ロードマップ

本ページは、以下ロードマップ「brain-ros」のガイドページです。

また、本ページは「[smabo-brain](./smabo-brain.md)」のガイドを実施している前提で話を進めます。

<!--
htmlに変換する際は、以下のsvgファイルの代わりに、roadmap.htmlに記載してあるロードマップを添付すること。ただし、本ページのノードをハイライトした状態にすること。また、roadmap.htmlに記載のロードマップの0.5倍のサイズとすること。
-->

![](../images/smabo_roadmap.drawio.svg)




# できること

本ページでは「smabo-brain-ros」のセットアップ手順について解説します。

<br>

具体的には、以下の内容を実施します。

- smabo-brain-rosのセットアップ

# 構成

今回は、下図のようになります。

<!-- 以下の、smabo_sysytem_architecture.drawio.svgの代わりに、sysmap.jsをもとに作成したアーキテクチャ図を配置する。-->
<!-- 以下例のように記述するので、ハイライトするノードと矢印、およびラベルに記述する内容を確認し、アーキテクチャ図を作成してください -->
<!-- 例）コンポーネント1 -[websocket]-> コンポーネント2：データ種類1, データ種類2 -->
<!-- 今回の、具体的な構成は以下になります。 -->
<!-- smabo-brain -[websocket]-> smabo-esp32 : 速度指令, サーボ制御 -->
<!-- smabo-esp32 -[websocket]-> smabo-brain : ホイール速度, LiDAR -->

![](../images/smabo_sysytem_architecture.drawio.svg)

# smabo-brain-rosとは

smabo-brain-rosはsmaboの中で

- smabo-brainの純ロジック（オドメトリ積分など）をROS 2ノードとして公開する

役割を担います。

<br>

ROS 2を導入することで、ナビゲーション（Nav2）や動作計画（MoveIt2）といった既存のROSエコシステムを活用できるようになります。

!!! note
    ROS 2（Humble以降）が必要です。また、smabo-brainがimport可能であること（`brain`パッケージ）が前提です。


## smabo-brain-rosのクローン

以下コマンドでsmabo-brain-rosリポジトリをクローンします。

```bash
# ホームディレクトリへ移動
cd ~ 
```

```bash
# smabo-brain-rosリポジトリのクローン
git clone https://github.com/smabo-smartphone-robot/smabo-brain-ros
```

## ビルド

付属のスクリプトで、ワークスペースの作成・リンク・ビルドを行います。

```bash
cd ~/smabo-brain-ros
```

```bash
./build.sh
```


# 動作手順

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


# 次回

次回は、以下ロードマップの

- [ナビゲーション](./nav.md)
- [動作計画](./plan.md)

について解説します。


<!--
htmlに変換する際は、以下のsvgファイルの代わりに、roadmap.htmlに記載してあるロードマップを添付すること。ただし、次回につながるノードをハイライトした状態にすること。また、roadmap.htmlに記載のロードマップの0.5倍のサイズとすること。
-->

![](../images/smabo_roadmap.drawio.svg)
