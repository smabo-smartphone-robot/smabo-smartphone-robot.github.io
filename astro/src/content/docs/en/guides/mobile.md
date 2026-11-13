---
title: "Mobile Robot"
description: "Implement controller and image-processing driven mobile robot control using a TT motor and a universal caster."
---

## Roadmap

This page is the guide for the 'Mobile Robot' node on the roadmap below.

This guide assumes you have completed the [smabo-esp32](/en/guides/smabo-esp32/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="mobile"
       aria-label="smabo build guide roadmap (Mobile Robot highlighted)"></svg>
</div>

## Overview

This page explains how to implement the "Mobile Robot" feature.

<br />

Specifically, you will implement:

- Controller control of the mobile robot

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_manual_control.mp4" type="video/mp4"></video>

- Image-processing based control of the mobile robot

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_img_proc.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["Image"]},{"from":"brain","to":"esp32","transport":"ws","lines":["Velocity command"]},{"from":"web","to":"brain","transport":"ws","lines":["Velocity command"]},{"from":"brain","to":"web","transport":"webrtc","lines":["Image"]},{"from":"brain","to":"web","transport":"ws","lines":["Image processing result"]}]'
       aria-label="smabo system architecture diagram (data flow for the mobile robot highlighted)"></svg>
</div>

## Required Parts

The parts required to implement this feature are listed below.

| Part | Product URL | Notes |
| --- | --- | --- |
| ESP32-DevKitC | [link](https://www.amazon.co.jp/ESP32-DevKitC-Bluetooth-機能マイクロコントローラー-TYPE-C-デュアルコアボード/dp/B0GTY64KDC/ref=asc_df_B0GTY64KDC?mcid=350a4550c70e3d30953041512ffe110a&tag=jpgo-22&linkCode=df0&hvadid=792079627413&hvpos=&hvnetw=g&hvrand=17366440597157412973&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-2484301629565&hvocijid=17366440597157412973-B0GTY64KDC-&hvexpln=0&th=1) | Compatible boards are fine too |
| Smartphone | \- | \- |
| Breadboard (SAD101)<br> | [link](https://www.amazon.co.jp/サンハヤト-ニューブレッドボード-SAD-101/dp/B00DSKCS68?th=1) | Common breadboards have 5 holes across; this one has 6.<br>You need the 6-hole version — the ESP32 won't fit widthwise on a 5-hole board. |
| Jumper wires | [link](https://www.amazon.co.jp/ELEGOO-120pcs%E5%A4%9A%E8%89%B2%E3%83%87%E3%83%A5%E3%83%9D%E3%83%B3%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC%E3%80%81arduino%E7%94%A8%E3%83%AF%E3%82%A4%E3%83%A4%E2%80%94%E3%82%B2%E2%80%94%E3%82%B828AWG-%E3%82%AA%E3%82%B9-%E3%83%A1%E3%82%B9-%E3%82%AA%E3%82%B9-%E3%82%AA%E3%82%B9-%E2%80%93%E3%83%A1%E3%82%B9-%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B8%E3%83%A3%E3%83%B3%E3%83%91%E3%83%BC%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC/dp/B06Y48V9DL?ref_=Oct_d_obs_d_3332721051_0&pd_rd_w=uPj7Z&content-id=amzn1.sym.017d4a3b-167e-4891-9b01-9ac16ba095fb&pf_rd_p=017d4a3b-167e-4891-9b01-9ac16ba095fb&pf_rd_r=D57C194X1NH6BZACFEPS&pd_rd_wg=FydDx&pd_rd_r=327745d6-16b1-418c-b484-4cea112fb00b&pd_rd_i=B06Y48V9DL) | \- |
| Battery box (4× AA, with battery snap connector) | [link](https://www.amazon.co.jp/dp/B011IJQ4DI?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_3) | The snap-connector version is easier to work with — recommended. |
| Battery snap connector (for the battery box) | [link](https://www.monotaro.com/p/6866/1105/?cq_med=pla&cq_plt=gp&utm_medium=cpc&utm_source=google&utm_campaign=246-833-4061_23030379799_shopping&utm_content=&utm_term=__x_&utm_id=68661105&gad_source=1&gad_campaignid=23030381413&gbraid=0AAAAADNqOHDvKsE6jsbG6KMsfUBQKF9m5&gclid=Cj0KCQjw2_TQBhCnARIsAF3-XhxFdH-a3GLjp_a8Hy-Uc7kuFklTykWT1kFLZzA1D76_B6tY7Rw4P34aAsPaEALw_wcB) | The version with connector pins is recommended — easier to plug into a breadboard and less likely to slip out. |
| Rechargeable AA batteries × 4 | [link](https://www.amazon.co.jp/Amazon%E3%83%99%E3%83%BC%E3%82%B7%E3%83%83%E3%82%AF-AmazonBasics-HR-3UTG-AMZN-%E5%85%85%E9%9B%BB%E5%BC%8F%E3%83%8B%E3%83%83%E3%82%B1%E3%83%AB%E6%B0%B4%E7%B4%A0%E9%9B%BB%E6%B1%A0-%E6%9C%80%E5%B0%8F%E5%AE%B9%E9%87%8F1900mAh%E3%80%81%E7%B4%841000%E5%9B%9E%E4%BD%BF%E7%94%A8%E5%8F%AF%E8%83%BD/dp/B00CWNMV4G/ref=sr_1_5?qid=1700364346&refinements=p_n_feature_thirteen_browse-bin%3A2314244051&s=electronics&sr=1-5&th=1) | \- |
| Battery charger | [link](https://www.amazon.co.jp/%E3%80%90Amazon-co-jp%E9%99%90%E5%AE%9A%E3%80%91%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF-%E6%80%A5%E9%80%9F%E5%85%85%E9%9B%BB%E5%99%A8-%E5%8D%983%E5%BD%A2%E3%83%BB%E5%8D%984%E5%BD%A2-%E9%BB%92-BQ-CC73AM-K/dp/B07FQJJ58Z/ref=sr_1_5?keywords=%E9%9B%BB%E6%B1%A0+%E5%85%85%E9%9B%BB%E5%99%A8&qid=1700402201&sr=8-5) | \- |
| Tires for the toy DC motor | [link](https://www.amazon.co.jp/EQWQSIXD-2枚スマートカーシャーシおもちゃのホイールTTギアモーターホイールタイヤ/dp/B0GGBJ28H4/ref=sr_1_26?dib=eyJ2IjoiMSJ9.4FTlNQNg2PNhrQWHWCq1VDVSeuya5EkUmhYpxFsDFUfHp1VRahy96A67RIHQH9ibIRlLIzizRUjQypePRfeWYEjC4Xkv__iO89CGUyja83DKpYSqAtFlpw3HK3JZXC8l_7CbgBxyj25WMxgNvs0Vj_mTJEgCx11oV4jH8gcaw_nnoLEoOy27waXHHP1D9GAx5wk3YoJOf7mkinbBhxyengmzAsVi34v89FbE-kC8HFcbjWRNl9fKWyn4gzRqsQEidM-blg7h4gtymWS6XWF3wP_bhkNSn8PJfFi5vSQob90.NxbnVCRKi4zdC1WBt2D3W5p2zgN_rLX3CwbBS3SBa10&dib_tag=se&keywords=TTモーター+タイヤ&qid=1780323553&sr=8-26) | Compatible tires are fine too. |
| TT motor | [link](https://www.amazon.co.jp/DIANN-Motor-Gearbox-200RPM-Ratio/dp/B0F87YT715/ref=asc_df_B0F87YT715?mcid=9b7fc4990dc0322a82a20101948464a3&tag=jpgo-22&linkCode=df0&hvadid=781176336697&hvpos=&hvnetw=g&hvrand=18345257182238334739&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-2449268817747&psc=1&hvocijid=18345257182238334739-B0F87YT715-&hvexpln=0) | The version with connector pins is recommended — easier to plug into a breadboard and less likely to slip out.<br><br>Many compatible motors exist, but if the dimensions differ significantly from a [standard TT motor](https://docs.sunfounder.com/projects/3in1-kit/ja/latest/components/component_tt_motor.html), it may not mount correctly — please check carefully. |
| Universal caster S | [link](https://www.amazon.co.jp/YAHATA-%E3%81%A9%E3%81%93%E3%81%A7%E3%82%82%E3%82%AD%E3%83%A3%E3%82%B9%E3%82%BF%E3%83%BC-S%E3%83%96%E3%83%AB%E3%83%BC-S/dp/B0091GH8YU) | \- |
| TB6612FNG dual motor driver | [link](https://www.switch-science.com/products/3586) | \- |
| Mini breadboard | [link](https://www.amazon.co.jp/Rasbee-SYB-170-%E3%83%9F%E3%83%8B%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89-%E3%83%9B%E3%83%AF%E3%82%A4%E3%83%881%E5%80%8B-%E4%B8%A6%E8%A1%8C%E8%BC%B8%E5%85%A5%E5%93%81/dp/B01KRAS4NC/ref=asc_df_B01KRAS4NC?mcid=320216956bbd38fd8ecf662666249eee&tag=jpgo-22&linkCode=df0&hvadid=707442675525&hvpos=&hvnetw=g&hvrand=452252090448367071&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-1457964925645&psc=1&hvocijid=452252090448367071-B01KRAS4NC-&hvexpln=0) | Get the version with an adhesive backing. |

## 3D Printing Parts

Print the newly added parts on your 3D printer.

> The software used to drive a 3D printer varies by model, so this section only covers the key points rather than exact settings.

<br />

Print the following parts in the orientation shown.

:::note[Printing notes]
- Print protruding features sideways so they don't snap off at the base when attaching/detaching parts
- Always print with supports turned ON
:::

- smabo-repos/smabo-hardware/stl/mobile\_robot/dc\_motor\_caster.stl

    <br />

    ![3D-printed mobile robot part dc_motor_caster](/images/mobile_print_dc_motor_caster.png)

<br />

- smabo-repos/smabo-hardware/stl/mobile\_robot/tt\_motor/tt\_motor\_bottom.stl

    <br />

    ![3D-printed mobile robot part tt_motor_bottom](/images/mobile_print_tt_motor_bottom.png)

<br />

- smabo-repos/smabo-hardware/stl/mobile\_robot/tt\_motor/tt\_motor\_stopper1.stl × 2
    - Print two — one for each motor (left/right).

        <br />

        ![3D-printed TT motor stopper tt_motor_stopper1](/images/mobile_print_tt_motor_stopper1.png)

<br />

- smabo-repos/smabo-hardware/stl/mobile\_robot/tt\_motor/tt\_motor\_stopper2.stl
    - Print two — one for each motor (left/right).

        <br />

        ![3D-printed TT motor stopper tt_motor_stopper2](/images/mobile_print_tt_motor_stopper2.png)

## Assembly

Assemble the required parts as shown in the video below.

※ The video also includes parts printed in earlier guides.

<p>
  <iframe src="/assembly_movie/smabo_tt_motor.html" title="Mobile Robot Assembly"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[Assembly tips]
The assembly video doesn't show how to attach the TT motors and the universal caster S, so the steps are described below.

<br />

First, attach the universal caster S to "dc\_motor\_caster.stl" as shown below.<br />
![dc_motor_caster before attaching the caster](/images/dc_motor_caster_before.jpg) ![dc_motor_caster with the caster attached](/images/dc_motor_caster_after.jpg)

<br />

Next, secure the TT motors to "tt\_motor\_bottom.stl" using "tt\_motor\_stopper1.stl" and "tt\_motor\_stopper2.stl".<br />
![TT motors fixed with tt_motor_stopper parts](/images/tt_motor_assemble.jpg)
:::

## Wiring

Wire everything according to the table below.

※ In the table below, "Connection 1" and "Connection 2" indicate that the two are directly connected electrically.

| Connection 1 | Connection 2 | Notes |
| --- | --- | --- |
| \+ terminal of the dry-cell battery box | <strong class="red">Right</strong> + rail of the breadboard | From here on, the right rail is treated as the 6V supply — take note |
| \- terminal of the dry-cell battery box | \- rail of the breadboard | \- |
| ESP32 5V pin | <strong class="red">Left</strong> + rail of the breadboard | From here on, the left rail is treated as the 5V supply — take note |
| ESP32 GND | \- rail of the breadboard | \- |
| Pin set as `dc/pins/pwma` in config.json | TB6612FNG PWMA pin | \- |
| Pin set as `dc/pins/ain2` in config.json | TB6612FNG AIN2 pin | \- |
| Pin set as `dc/pins/ain1` in config.json | TB6612FNG AIN1 pin | \- |
| Pin set as `dc/pins/stby` in config.json | TB6612FNG STBY pin | \- |
| Pin set as `dc/pins/bin1` in config.json | TB6612FNG BIN1 pin | \- |
| Pin set as `dc/pins/bin2` in config.json | TB6612FNG BIN2 pin | \- |
| Pin set as `dc/pins/pwmb` in config.json | TB6612FNG PWMB pin | \- |
| TB6612FNG VM pin | <strong class="red">Right</strong> + rail of the breadboard | \- |
| TB6612FNG VCC pin | <strong class="red">Left</strong> + rail of the breadboard | \- |
| TB6612FNG GND pin | \- rail of the breadboard | TB6612FNG has three GND pins — connect all of them to the breadboard's - rail |

<br />

The wiring diagram for the ESP32-DevKitC case is shown below (the breadboard alone doesn't have enough holes, so the TB6612FNG is wired on a mini breadboard).

![Wiring diagram for TT motors with the TB6612FNG driver and ESP32](/fritzing/png/tt_motor.png)

:::note[TB6612FNG wiring tip 1]
The TB6612FNG has each pin's role printed on the back — check it carefully before wiring.

※ Of course, once plugged into the breadboard the pin positions are mirrored left-right compared to viewing the back side — keep that in mind.<br />
![Pin layout on the back of the TB6612FNG motor driver](/images/mobile_tb6612fng_backside.png)<br />
[Reference image: TB6612FNG dual motor driver (max 1.2A continuous) (Switch Science)](https://www.switch-science.com/products/385?srsltid=AfmBOopaI6nY3Kyny25gDpjTx1m8gO5k-UhwiDTIQxFYU8d_kZrGWxxc)
:::

:::note[TB6612FNG wiring tip]
For the TB6612FNG's PWMA–PWMB pins, if you set the corresponding ESP32-side pins to be consecutive, you can

- handle all 7 jumper wires as a single bundle instead of stripping/routing them one by one

which keeps the wiring much tidier.

![TB6612FNG wired on a mini breadboard](/images/TB6612FNG_%20wiring.jpg)
:::

## Finished Result

The finished robot from this guide looks like this:<br />
![Completed mobile smabo driven by TT motors](/images/smabo_tt_motor.jpg)

## Operation

### Startup Procedure

Follow the steps in <a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">this startup procedure</a>.

### Enabling the DC Motor

In the smabo-web "Config" tab,

- enable "Modes/dc\_drive"

.

![Enabling Modes/dc_drive in the smabo-web Config tab](/images/mobile_config_dc_drive_enable.png)

### Controller Control

This section explains controller-based control.

You can control smabo's mobile robot using the controller on the "Drive" tab.

![Drive controller in the smabo-web Drive tab](/images/mobile_web_drive_tab.png)

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_manual_control.mp4" type="video/mp4"></video>

### Image-Processing Control

This section explains image-processing based control.

In the "Vision" tab's "Detection" section,

- enable "Enabled", and
- set any recognition mode (here, "color" mode is configured to recognize a blue object)

.

![Setting smabo-web to detect an object of a chosen color](/images/neck_vision_detection.jpg)

<br />

Next, under "Behaviors",

- enable "Drive follow".

![Enabling Drive follow in Behaviors](/images/mobile_vision_drive_follow_enable.png)

<br />

In Drive follow mode, the mobile robot moves forward/backward so that the recognized object's apparent size (as seen by the camera) matches the "Target size" (you can check the exact size via the blue box in the preview screen).

![Checking the target size with the blue frame in preview](/images/mobile_vision_target_size_preview.png)

<br />

Once configured, bring the recognition target in front of the smartphone camera and smabo's mobile robot will move to follow it.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_img_proc.mp4" type="video/mp4"></video>

## Next

Next, we'll cover the following node on the roadmap:

- [Encoder Mobile Robot](/en/guides/encmobile/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="encmobile"
       aria-label="smabo build guide roadmap (next: Encoder Mobile Robot highlighted)"></svg>
</div>
