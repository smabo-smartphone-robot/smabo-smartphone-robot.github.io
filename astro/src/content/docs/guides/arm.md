---
title: "ロボットアーム"
description: "必要な構成：smabo-app + smabo-esp32"
---

## ロードマップ

本ページは、以下ロードマップ「ハンド」のガイドページです。

また、本ページは「[smabo-esp32](/guides/smabo-esp32/)」のガイドを実施している前提で話を進めます。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="arm"
       aria-label="smabo 製作ガイドのロードマップ図（ロボットアーム をハイライト）"></svg>
</div>

## 概要

本ページでは「ハンド機能」について解説します。

具体的には、以下の内容を実施します。
- ロボットアームのコントローラー制御
    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_arm_manual.mp4" type="video/mp4"></video>

## 必要パーツ

本機能の実装に必要なパーツを以下に記載します。

| 部品名 | 商品URL | 備考 |
| --- | --- | --- |
| ESP32-DevKitC | [link](https://www.amazon.co.jp/ESP32-DevKitC-Bluetooth-機能マイクロコントローラー-TYPE-C-デュアルコアボード/dp/B0GTY64KDC/ref=asc_df_B0GTY64KDC?mcid=350a4550c70e3d30953041512ffe110a&tag=jpgo-22&linkCode=df0&hvadid=792079627413&hvpos=&hvnetw=g&hvrand=17366440597157412973&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-2484301629565&hvocijid=17366440597157412973-B0GTY64KDC-&hvexpln=0&th=1) | 互換品でも可 |
| ブレッドボード（SAD101）<br> | [link](https://www.amazon.co.jp/サンハヤト-ニューブレッドボード-SAD-101/dp/B00DSKCS68?th=1) | 一般的なブレッドボードは5穴ですが、こちらは6穴になっています。<br>6穴でないとESP32のサイズ的に横幅が足りないので注意してください |
| ジャンプワイヤー | [link](https://www.amazon.co.jp/ELEGOO-120pcs%E5%A4%9A%E8%89%B2%E3%83%87%E3%83%A5%E3%83%9D%E3%83%B3%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC%E3%80%81arduino%E7%94%A8%E3%83%AF%E3%82%A4%E3%83%A4%E2%80%94%E3%82%B2%E2%80%94%E3%82%B828AWG-%E3%82%AA%E3%82%B9-%E3%83%A1%E3%82%B9-%E3%82%AA%E3%82%B9-%E3%82%AA%E3%82%B9-%E2%80%93%E3%83%A1%E3%82%B9-%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B8%E3%83%A3%E3%83%B3%E3%83%91%E3%83%BC%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC/dp/B06Y48V9DL?ref_=Oct_d_obs_d_3332721051_0&pd_rd_w=uPj7Z&content-id=amzn1.sym.017d4a3b-167e-4891-9b01-9ac16ba095fb&pf_rd_p=017d4a3b-167e-4891-9b01-9ac16ba095fb&pf_rd_r=D57C194X1NH6BZACFEPS&pd_rd_wg=FydDx&pd_rd_r=327745d6-16b1-418c-b484-4cea112fb00b&pd_rd_i=B06Y48V9DL) | - |
| 電池ボックス（単3×4本、電池スナップ対応） | [link](https://www.amazon.co.jp/dp/B011IJQ4DI?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_3) | 電池スナップ対応の方が、取り回しが良いのでお勧めです。 |
| 電池スナップ（電池ボックス用） | [link](https://www.monotaro.com/p/6866/1105/?cq_med=pla&cq_plt=gp&utm_medium=cpc&utm_source=google&utm_campaign=246-833-4061_23030379799_shopping&utm_content=&utm_term=__x_&utm_id=68661105&gad_source=1&gad_campaignid=23030381413&gbraid=0AAAAADNqOHDvKsE6jsbG6KMsfUBQKF9m5&gclid=Cj0KCQjw2_TQBhCnARIsAF3-XhxFdH-a3GLjp_a8Hy-Uc7kuFklTykWT1kFLZzA1D76_B6tY7Rw4P34aAsPaEALw_wcB) | コネクタピン付きの方が、ブレッドボードに差しやすくて、抜けにくいのでお勧めです。 |
| 充電式単三電池 × 4 | [link](https://www.amazon.co.jp/Amazon%E3%83%99%E3%83%BC%E3%82%B7%E3%83%83%E3%82%AF-AmazonBasics-HR-3UTG-AMZN-%E5%85%85%E9%9B%BB%E5%BC%8F%E3%83%8B%E3%83%83%E3%82%B1%E3%83%AB%E6%B0%B4%E7%B4%A0%E9%9B%BB%E6%B1%A0-%E6%9C%80%E5%B0%8F%E5%AE%B9%E9%87%8F1900mAh%E3%80%81%E7%B4%841000%E5%9B%9E%E4%BD%BF%E7%94%A8%E5%8F%AF%E8%83%BD/dp/B00CWNMV4G/ref=sr_1_5?qid=1700364346&refinements=p_n_feature_thirteen_browse-bin%3A2314244051&s=electronics&sr=1-5&th=1) | 充電式の方がおすすめです。 |
| 電池充電器 | [link](https://www.amazon.co.jp/%E3%80%90Amazon-co-jp%E9%99%90%E5%AE%9A%E3%80%91%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF-%E6%80%A5%E9%80%9F%E5%85%85%E9%9B%BB%E5%99%A8-%E5%8D%983%E5%BD%A2%E3%83%BB%E5%8D%984%E5%BD%A2-%E9%BB%92-BQ-CC73AM-K/dp/B07FQJJ58Z/ref=sr_1_5?keywords=%E9%9B%BB%E6%B1%A0+%E5%85%85%E9%9B%BB%E5%99%A8&qid=1700402201&sr=8-5) | - |
| サーボモータドライバ PCA9685 | [link](https://www.amazon.co.jp/HiLetgo-PCA9685-16%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB-12-%E3%83%93%E3%83%83%E3%83%88-Arduino%E3%81%AB%E5%AF%BE%E5%BF%9C/dp/B01D1D0CX2/ref=asc_df_B01D1D0CX2/?tag=jpgo-22&linkCode=df0&hvadid=218134682078&hvpos=&hvnetw=g&hvrand=18016470498878566809&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=1009487&hvtargid=pla-439629573722&psc=1&mcid=d238c727398c34ec915ad739f9f6f977) | 互換品でも可 |
| SG90 × 4 | [link](https://akizukidenshi.com/catalog/g/gM-08761/) | 互換品でも良いですが、ホーンのサイズが純正と異なる場合は、パーツにうまくはまりません。<br>そのため、ホーンを削るか、3Dモデルの修正が発生する可能性があります。 |

## パーツの印刷

今回、新たに追加されるパーツを3Dプリンタで印刷します。

> 3Dプリンタは機種によって「印刷する際に使用するソフト」が異なるため、ここでは具体的な設定手順ではなく、ポイントのみを記載します。

<br>

以下のパーツを図の向きに設定して、印刷してください。

:::note[印刷の際の注意点]
- パーツのつけ外しの際に、根本から折れにくくするため、凸部は横向きにして印刷
- サポート材は必ずONにした状態で印刷
:::

- smabo-hardware/stl/arm/sg90/sg90_1_L.stl
    ![alt text](/images/arm_print_sg90_1_l.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_1_R.stl
    ![alt text](/images/arm_print_sg90_1_r.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_2.stl
    ![alt text](/images/arm_print_sg90_2.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_3_concave.stl
  ![alt text](/images/arm_print_sg90_3_concave.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_3_convex.stl
    ![alt text](/images/arm_print_sg90_3_convex.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_4_concave.stl
    ![alt text](/images/arm_print_sg90_4_concave.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_4_convex.stl
    ![alt text](/images/arm_print_sg90_4_convex.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_5_concave.stl
    ![alt text](/images/arm_print_sg90_5_concave.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_5_convex.stl
    ![alt text](/images/arm_print_sg90_5_convex.png)

<br>

- smabo-hardware/stl/arm/sg90/sg90_5_hand.stl
    ![alt text](/images/arm_print_sg90_5_hand.png)

<br>

- smabo-hardware/stl/base/pca9685_stopper_l.stl
  背面でpca9895を固定していた時と同じパーツを使用します。
    ![](/images/esp32_print_pca9685_stopper_l.png)

<br>

- smabo-hardware/stl/base/pca9685_stopper_r_top.stl × 2
    背面でpca9895を固定していた時と同じパーツを使用します。
    また、左右で同じパーツを使用するため、2つ印刷します
    ![](/images/esp32_print_pca9685_stopper_r_top.png)

## 組み立て手順

以下動画のように、必要パーツを組み立てます。

※ 動画には、前回までに印刷したパーツも含まれます

<p>
  <iframe src="/assembly_movie/smabo_arm.html" title="ロボットアーム 組み立て手順"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[組み立ての際のポイント]
組み立て動画では、SG90、pca9685の取り付け手順は分からないため、以下に記載します。


なお、各関節の可動範囲は下動画のようになるため、参考にしながら組み立ててください。
<p>
  <iframe src="/assembly_movie/arm_joint_range.html" title="ロボットアーム 可動範囲"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

<br>

下図のように「sg90_1_L」と「sg90_1_R」でsg90を固定し、ボディに取り付けます。
（凹んでいる部分に、ケーブルが通るように取り付けてください）

![alt text](/images/arm_assemble_sg90_1.webp)
![alt text](/images/arm_assemble_sg90_1_body.webp)

<br>

smaboの背面に設置されていたpca9685のサーボモータドライバを、「pca9685_stopper_l.stl」「pca9685_stopper_r_top.stl × 2」でsmaboの上部に付け替えます（ケーブルの長さが足りないため）。

![alt text](/images/arm_assemble_pca9685_top.webp)

<br>


「sg90_2」を上から被せてホーンをはめ込みます（工具不要でも組み立て可能ですが、SG90に付属のネジでホーンとサーボを固定してもOKです）。

![alt text](/images/arm_assemble_sg90_2.webp)


<br>



アームの本体部分を組み立てます。　
「sg90_3_concave」と「sg90_3_convex」、「sg90_4_concave」と「sg90_4_convex」、「sg90_5_concave」と「sg90_5_convex」をそれぞれ組み合わせて、アームの本体部分を作ります。


![alt text](/images/arm_assemble_sg90_3.webp)
![alt text](/images/arm_assemble_sg90_4.webp)
![alt text](/images/arm_assemble_sg90_5.webp)

<br>

ハンドを取り付けます。
「sg90_5_hand」を取り付けます。

![alt text](/images/arm_assemble_hand.webp)

<br>

最後に、ボディにアームを取り付けます。
![alt text](/images/arm_complete.webp)



:::

## 配線

下記表の内容に従って、配線します。

※ 下記表において、「接続先1」と「接続先2」は、両者が回路的に直接繋がっていることを指します。

| 接続先1 | 接続先2 | 補足 |
| --- | --- | --- |
| 乾電池バッテリーボックスの+極 | ブレッドボードの+極の<strong class="red">右側</strong> | 以降、右側を6V電圧として扱うため注意 |
| 乾電池バッテリーボックスの-極 | ブレッドボードの-極 | - |
| ESP32の5V電源 | ブレッドボードの+極の<strong class="red">左側</strong> | 以降、左側を5V電圧として扱うため注意 |
| ESP32のGND | ブレッドボードの-極 | - |
| PCA9685のV++ | ブレッドボードの＋極の**右側** | - |
| PCA9685のVCC | ブレッドボードの＋極の**左側** | - |
| PCA9685のSDA | config.jsonの`i2c/sda`に設定されているピン | - |
| PCA9685のSCL | config.jsonの`i2c/scl`に設定されているピン | - |
| PCA9685のGND | ブレッドボードの-極 | - |

<br>

ESP32-DevKitCの場合の配線図は、以下になります。

※ デフォルト設定の場合、アームの根本の関節からchannel=3, channel=4, channel=5, channel=6に接続してください。



![](/fritzing/png/arm.png)

## 完成系

今回作成したロボットの完成系は下図のようになります。

![alt text](/images/arm_complete.webp)


## 動作手順

### 起動手順

「<a href="/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">こちらの起動手順</a>」の内容を実行してください。

### サーボ設定

smabo-webの「Config」タブの「Modes/servos」にて、各サーボの設定を変更可能です。

- 「arm_joint_1」「arm_joint_2」「arm_joint_3」「arm_joint_4」を有効化

します。

![alt text](/images/arm_servo_enable.webp)


### コントローラー制御

コントローラー制御の手順を説明します。

「Config」タブの「Modes/servos」にて、arm_joint_1～4の

- 「mode」を「manual」

に設定してください。

![alt text](/images/arm_servo_mode_manual.webp)


<br>

「Servo」タブで各サーボの角度を変更すると、それに合わせてアームが動作します。

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_arm_manual.mp4" type="video/mp4"></video>

## 次回

次回は、以下ロードマップの

- [動作計画（準備中）]()

について解説します。

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo 製作ガイドのロードマップ図（次回：動作計画 をハイライト）"></svg>
</div>
