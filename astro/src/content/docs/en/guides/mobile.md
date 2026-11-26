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

In addition to the parts from [smabo-esp32](/en/guides/smabo-esp32/), you need the following.

| Part | Product URL | Notes |
| --- | --- | --- |
| Tires for the toy DC motor | [link](https://www.amazon.co.jp/EQWQSIXD-2枚スマートカーシャーシおもちゃのホイールTTギアモーターホイールタイヤ/dp/B0GGBJ28H4/ref=sr_1_26?dib=eyJ2IjoiMSJ9.4FTlNQNg2PNhrQWHWCq1VDVSeuya5EkUmhYpxFsDFUfHp1VRahy96A67RIHQH9ibIRlLIzizRUjQypePRfeWYEjC4Xkv__iO89CGUyja83DKpYSqAtFlpw3HK3JZXC8l_7CbgBxyj25WMxgNvs0Vj_mTJEgCx11oV4jH8gcaw_nnoLEoOy27waXHHP1D9GAx5wk3YoJOf7mkinbBhxyengmzAsVi34v89FbE-kC8HFcbjWRNl9fKWyn4gzRqsQEidM-blg7h4gtymWS6XWF3wP_bhkNSn8PJfFi5vSQob90.NxbnVCRKi4zdC1WBt2D3W5p2zgN_rLX3CwbBS3SBa10&dib_tag=se&keywords=TTモーター+タイヤ&qid=1780323553&sr=8-26) | Compatible tires are fine too. |
| TT motor | [link](https://www.amazon.co.jp/DIANN-Motor-Gearbox-200RPM-Ratio/dp/B0F87YT715/ref=asc_df_B0F87YT715?mcid=9b7fc4990dc0322a82a20101948464a3&tag=jpgo-22&linkCode=df0&hvadid=781176336697&hvpos=&hvnetw=g&hvrand=18345257182238334739&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-2449268817747&psc=1&hvocijid=18345257182238334739-B0F87YT715-&hvexpln=0) | The version with connector pins is recommended — easier to plug into a breadboard and less likely to slip out.<br><br>Many compatible motors exist, but if the dimensions differ significantly from a [standard TT motor](https://docs.sunfounder.com/projects/3in1-kit/ja/latest/components/component_tt_motor.html), it may not mount correctly — please check carefully. |
| Universal caster S | [link](https://www.amazon.co.jp/YAHATA-%E3%81%A9%E3%81%93%E3%81%A7%E3%82%82%E3%82%AD%E3%83%A3%E3%82%B9%E3%82%BF%E3%83%BC-S%E3%83%96%E3%83%AB%E3%83%BC-S/dp/B0091GH8YU) | \- |

## 3D Printing Parts

Print the newly added parts on your 3D printer.

> The software used to drive a 3D printer varies by model, so this section only covers the key points rather than exact settings.

<br />

Print the following parts in the orientation shown.

:::note[Printing notes]
- Print protruding features sideways so they don't snap off at the base when attaching/detaching parts
- Always print with supports turned ON
:::

- smabo-hardware/stl/mobile\_robot/dc\_motor\_caster.stl

    <br />

    ![3D-printed mobile robot part dc_motor_caster](/images/mobile_print_dc_motor_caster.png)

<br />

- smabo-hardware/stl/mobile\_robot/tt\_motor/tt\_motor\_bottom.stl

    <br />

    ![3D-printed mobile robot part tt_motor_bottom](/images/mobile_print_tt_motor_bottom.png)

<br />

- smabo-hardware/stl/mobile\_robot/tt\_motor/tt\_motor\_stopper1.stl × 2
    - Print two — one for each motor (left/right).

        <br />

        ![3D-printed TT motor stopper tt_motor_stopper1](/images/mobile_print_tt_motor_stopper1.png)

<br />

- smabo-hardware/stl/mobile\_robot/tt\_motor/tt\_motor\_stopper2\_LR.stl
    - Print one — the left and right stoppers are joined into a single part.

        <br />

        ![3D-printed TT motor stopper tt_motor_stopper2_LR](/images/mobile_print_tt_motor_stopper2_LR.png)

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

Next, secure the TT motors to "tt\_motor\_bottom.stl" using "tt\_motor\_stopper1.stl" and "tt\_motor\_stopper2\_LR.stl".<br />
![TT motors fixed with tt_motor_stopper parts](/images/tt_motor_assemble.jpg)
:::

## Wiring

Wire according to the tables below.

In the tables below, "Point A" and "Point B" are directly connected in the circuit.

### Battery

| Point A | Point B | Notes |
| --- | --- | --- |
| Battery box (+) | Breadboard + rail (<strong class="red">right</strong> side) | From here on, the right side is the 6 V rail |
| Battery box (-) | Breadboard - rail | \- |

### ESP32

| Point A | Point B | Notes |
| --- | --- | --- |
| ESP32 5V | Breadboard + rail (<strong class="red">left</strong> side) | From here on, the left side is the 5 V rail |
| ESP32 GND | Breadboard - rail | \- |

### TB6612FNG

| Point A | Point B | Notes |
| --- | --- | --- |
| TB6612FNG PWMA | ESP32 pin set in config.json `dc/pins/pwma` | Default pins:<br>- config.esp32-classic.json: GPIO 32<br>- config.esp32s3-devkitc1.json: GPIO 4 |
| TB6612FNG AIN2 | ESP32 pin set in config.json `dc/pins/ain2` | Default pins:<br>- config.esp32-classic.json: GPIO 33<br>- config.esp32s3-devkitc1.json: GPIO 5 |
| TB6612FNG AIN1 | ESP32 pin set in config.json `dc/pins/ain1` | Default pins:<br>- config.esp32-classic.json: GPIO 25<br>- config.esp32s3-devkitc1.json: GPIO 6 |
| TB6612FNG STBY | ESP32 pin set in config.json `dc/pins/stby` | Default pins:<br>- config.esp32-classic.json: GPIO 26<br>- config.esp32s3-devkitc1.json: GPIO 7 |
| TB6612FNG BIN1 | ESP32 pin set in config.json `dc/pins/bin1` | Default pins:<br>- config.esp32-classic.json: GPIO 27<br>- config.esp32s3-devkitc1.json: GPIO 15 |
| TB6612FNG BIN2 | ESP32 pin set in config.json `dc/pins/bin2` | Default pins:<br>- config.esp32-classic.json: GPIO 14<br>- config.esp32s3-devkitc1.json: GPIO 16 |
| TB6612FNG PWMB | ESP32 pin set in config.json `dc/pins/pwmb` | Default pins:<br>- config.esp32-classic.json: GPIO 12<br>- config.esp32s3-devkitc1.json: GPIO 17 |
| TB6612FNG VM | Breadboard + rail (<strong class="red">right</strong> side) | Motor power (6 V) |
| TB6612FNG VCC | Breadboard + rail (<strong class="red">left</strong> side) | \- |
| TB6612FNG GND | Breadboard - rail | The TB6612FNG has three GND pins; connect all of them to the breadboard's - rail |

### TT motor (left wheel)

| Point A | Point B | Notes |
| --- | --- | --- |
| TT motor (left wheel) terminal 1 | TB6612FNG A01 | \- |
| TT motor (left wheel) terminal 2 | TB6612FNG A02 | If the wheel turns the wrong way, swap terminals 1 and 2 |

### TT motor (right wheel)

| Point A | Point B | Notes |
| --- | --- | --- |
| TT motor (right wheel) terminal 1 | TB6612FNG B02 | \- |
| TT motor (right wheel) terminal 2 | TB6612FNG B01 | If the wheel turns the wrong way, swap terminals 1 and 2 |

<br />

The wiring diagram for the ESP32-DevKitC (with the defaults in config.esp32-classic.json) is shown below (the breadboard alone doesn't have enough holes, so the TB6612FNG is wired on a mini breadboard).

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

Then open the "Config" tab in smabo-web.

### Enabling the DC Motor

In the smabo-web "Config" tab, enable:

- "Modes/dc\_drive"

![Enabling Modes/dc_drive in the smabo-web Config tab](/images/mobile_config_dc_drive_enable.png)

### Manual Control

This section explains controller-based control.

You can control smabo's mobile robot using the controller on the "Drive" tab.

![Drive controller in the smabo-web Drive tab](/images/mobile_web_drive_tab.png)

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/tt_motor_manual_control.mp4" type="video/mp4"></video>

### Image-Processing Control

This section explains image-processing based control.

In the "Vision" tab's "Detection" section:

- enable "Enabled", and
- set any recognition mode (here, "color" mode is configured to recognize a blue object)

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
