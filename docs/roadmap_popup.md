<!--
以下内容をroadmap.jsのNODESのtipの中身にしてください。
各章のタイトルはNODESの「id」になります
-->

# brain

smabo-brainのセットアップ手順について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->

smabo-brainは   
- **各コンポーネントを中継するハブ**
- **画像処理やAIなどの高度な処理の実行**

の役割を担います。

<!-- 以下の、smabo_sysytem_architecture.drawio.svgの代わりに、sysmap.jsをもとに作成したアーキテクチャ図を配置する。-->

<!-- 以下例のように記述するので、ハイライトするノードと矢印、およびラベルに記述する内容を確認し、アーキテクチャ図を作成してください -->
<!-- 例）コンポーネント1 -[websocket]-> コンポーネント2：データ種類1, データ種類2 -->
<!-- 上記の場合、-->
<!-- 1. コンポーネント1、コンポーネント2をハイライト>
<!-- 2. コンポーネント1 -> コンポーネント2方向の、websocketにあたる矢印をハイライト-->
<!-- 3. 矢印には、「データ種類1、データ種類2」とラベルを記述。ここで、読点ごとに改行すること（読点はラベルには含まない）>
<!-- 4. ラベルの行数が増えると、ラベルがノードや矢印通しで重なる可能性があるので、重なっていないことを確認すること-->

<!-- 今回の、具体的な構成は以下になります。 -->
<!-- smabo-web-[websocket]->smabo-brain：制御値 -->
<!-- smabo-brain-[websocket]->smabo-web：センサ値 -->
<!-- smabo-brain-[webRTC]->smabo-web：画像 -->
<!-- smabo-brain-[websocket]->smabo-esp32：制御値 -->
<!-- smabo-esp32-[websocket]->smabo-brain：センサ値 -->
<!-- smabo-app-[websocket]->smabo-brain：スマホセンサ値 -->
<!-- smabo-app-[webRTC]->smabo-brain：画像 -->
<!-- smabo-brain-[websocket]->smabo-app：制御値 -->

![](../images/smabo_system_architecture.drawio.svg)

# web

smabo-webのセットアップ手順について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->


smabo-webは
- **smaboの設定の変更、手動操作、センサの可視化などの補助的ツール**

の役割を担います。

<!-- 以下の、smabo_sysytem_architecture.drawio.svgの代わりに、sysmap.jsをもとに作成したアーキテクチャ図を配置する。-->

<!-- 以下例のように記述するので、ハイライトするノードと矢印、およびラベルに記述する内容を確認し、アーキテクチャ図を作成してください -->
<!-- 例）コンポーネント1 -[websocket]-> コンポーネント2：データ種類1, データ種類2 -->
<!-- 上記の場合、-->
<!-- 1. コンポーネント1、コンポーネント2をハイライト>
<!-- 2. コンポーネント1 -> コンポーネント2方向の、websocketにあたる矢印をハイライト-->
<!-- 3. 矢印には、「データ種類1、データ種類2」とラベルを記述。ここで、読点ごとに改行すること（読点はラベルには含まない）>
<!-- 4. ラベルの行数が増えると、ラベルがノードや矢印通しで重なる可能性があるので、重なっていないことを確認すること-->

<!-- 今回の、具体的な構成は以下になります。 -->
<!-- smabo-web-[websocket]->smabo-brain：制御値 -->
<!-- smabo-brain-[websocket]->smabo-web：センサ値 -->
<!-- smabo-brain-[webRTC]->smabo-web：画像 -->
<!-- smabo-web-[REST API]->smabo-esp32：esp32設定変更 -->

![](../images/smabo_system_architecture.drawio.svg)

# app

「smabo-app」のセットアップ手順について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->


smabo-appは
- **smaboの顔**
- **smaboのセンサー**

の役割を担います。

<!-- 以下の、smabo_sysytem_architecture.drawio.svgの代わりに、sysmap.jsをもとに作成したアーキテクチャ図を配置する。-->

<!-- 以下例のように記述するので、ハイライトするノードと矢印、およびラベルに記述する内容を確認し、アーキテクチャ図を作成してください -->
<!-- 例）コンポーネント1 -[websocket]-> コンポーネント2：データ種類1, データ種類2 -->
<!-- 上記の場合、-->
<!-- 1. コンポーネント1、コンポーネント2をハイライト>
<!-- 2. コンポーネント1 -> コンポーネント2方向の、websocketにあたる矢印をハイライト-->
<!-- 3. 矢印には、「データ種類1、データ種類2」とラベルを記述。ここで、読点ごとに改行すること（読点はラベルには含まない）>
<!-- 4. ラベルの行数が増えると、ラベルがノードや矢印通しで重なる可能性があるので、重なっていないことを確認すること-->

<!-- 今回の、具体的な構成は以下になります。 -->
<!-- smabo-app-[websocket]->smabo-brain：スマホセンサ値 -->
<!-- smabo-app-[webRTC]->smabo-brain：画像 -->
<!-- smabo-brain-[websocket]->smabo-app：制御値 -->

# face

「smaboの顔機能」の使い方について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->



- **smabo-webから、smaboの表情を変更**
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/eye_change.mp4" type="video/mp4"></video>

- **smabo-webから、smaboの目をコントロール**
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/eye_control_manual.mp4" type="video/mp4"></video>


# sensors

「smaboのセンサー」について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->


- **スマホのセンサデータ（画像、IMU、GPS）をsmabo-webで可視化**

<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/smabo-web-sensor.mp4" type="video/mp4"></video>


# voice

「音声処理機能」について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->



- **スマホで取得した音声を、音声認識**

![alt text](../images/app_recognized_speech.png)


- **smabo-webで指定した文字列を発話**
![alt text](../images/app_speech_say.jpg)


# imgproc


「画像処理機能」について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->


- **カメラから取得した画像をもとに、対象物体を識別**

<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/img_proc_smabo_web.mp4" type="video/mp4"></video>
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/eye_control_img_proc.mp4" type="video/mp4"></video>

# baseparts

「ベースパーツの作成」手順について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->


- **自分のスマホのサイズに合わせた3Dモデルの修正**
![alt text](../images/base_long_inner_extrude.jpg)

- **ベースパーツの3Dプリンタによる印刷**
![alt text](../images/base_print_base.jpg)

# esp32

「smabo-esp32」のセットアップ手順について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->


smabo-esp32は
- **esp32に繋いだセンサやアクチュエータの制御**

の役割を担います。

<!-- 以下の、smabo_sysytem_architecture.drawio.svgの代わりに、sysmap.jsをもとに作成したアーキテクチャ図を配置する。-->

<!-- 以下例のように記述するので、ハイライトするノードと矢印、およびラベルに記述する内容を確認し、アーキテクチャ図を作成してください -->
<!-- 例）コンポーネント1 -[websocket]-> コンポーネント2：データ種類1, データ種類2 -->
<!-- 上記の場合、-->
<!-- 1. コンポーネント1、コンポーネント2をハイライト>
<!-- 2. コンポーネント1 -> コンポーネント2方向の、websocketにあたる矢印をハイライト-->
<!-- 3. 矢印には、「データ種類1、データ種類2」とラベルを記述。ここで、読点ごとに改行すること（読点はラベルには含まない）>
<!-- 4. ラベルの行数が増えると、ラベルがノードや矢印通しで重なる可能性があるので、重なっていないことを確認すること-->

<!-- 今回の、具体的な構成は以下になります。 -->
<!-- smabo-web-[REST API]->smabo-esp32：esp32設定 -->
<!-- smabo-brain-[websocket]->smabo-esp32：制御値 -->
<!-- smabo-esp32-[websocket]->smabo-brain：センサ値 -->

![](../images/smabo_system_architecture.drawio.svg)

# hand
「ハンド機能」について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->



- **ハンドのコントローラー制御**
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/smabo_hand_manual.mp4" type="video/mp4"></video>

- **ハンドのランダム制御**
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/smabo_hand_random.mp4" type="video/mp4"></video>

# neck

「首振り機能」について解説します。

<!--ここに、「ガイドを読む」「設計書を読む」ボタン-->



- 首振りのコントローラー制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/smabo_neck_manual.mp4" type="video/mp4"></video>


- 首振りのランダム制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/smabo_neck_random.mp4" type="video/mp4"></video>

- 画像認識による首振り制御
<video autoplay loop muted playsinline style="max-width:100%"><source src="./video/smabo_neck_img_proc.mp4" type="video/mp4"></video>