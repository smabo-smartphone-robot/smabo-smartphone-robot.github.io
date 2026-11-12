---
title: "Head Rotation (Neck)"
description: "Assemble and control smabo's neck servo — supports manual, random, and image-recognition-based head rotation."
---

## Roadmap

This page is the guide for the 'Head Rotation (Neck)' node on the roadmap below.

This guide assumes you have completed the [smabo-esp32](/en/guides/smabo-esp32/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="neck"
       aria-label="smabo build guide roadmap (Head Rotation highlighted)"></svg>
</div>

## Overview

This page explains the Head Rotation (Neck) feature.

<br />

Specifically, you will implement:

- Manual controller control

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_manual.mp4" type="video/mp4"></video>

- Random motion control

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_random.mp4" type="video/mp4"></video>

- Image-recognition-based head tracking

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_img_proc.mp4" type="video/mp4"></video>

<br />

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["Servo control values"]},{"from":"brain","to":"esp32","transport":"ws","lines":["Servo control values"]},{"from":"web","to":"esp32","transport":"rest","lines":["ESP32 config"]},{"from":"app","to":"brain","transport":"webrtc","lines":["Camera feed"]},{"from":"brain","to":"web","transport":"webrtc","lines":["Camera feed"]},{"from":"brain","to":"web","transport":"ws","lines":["Image processing result"]}]' data-active="web,brain,esp32,app"
       aria-label="smabo system diagram (Head Rotation highlighted)"></svg>
</div>

## Required Parts

The following parts are required to implement this feature.

| Part | Product URL | Notes |
| --- | --- | --- |
| ESP32-DevKitC | [link](https://www.amazon.co.jp/ESP32-DevKitC-Bluetooth-%E6%A9%9F%E8%83%BD%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B3%E3%83%B3%E3%83%88%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%BC-TYPE-C-%E3%83%87%E3%83%A5%E3%82%A2%E3%83%AB%E3%82%B3%E3%82%A2%E3%83%9C%E3%83%BC%E3%83%89/dp/B0GTY64KDC/) | Compatible alternatives OK |
| Breadboard (SAD101)<br> | [link](https://www.amazon.co.jp/%E3%82%B5%E3%83%B3%E3%83%8F%E3%83%A4%E3%83%88-%E3%83%8B%E3%83%A5%E3%83%BC%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89-SAD-101/dp/B00DSKCS68?th=1) | Standard breadboards have 5 holes per row, but this one has 6 — required for the ESP32's width. |
| Jump wires | [link](https://www.amazon.co.jp/ELEGOO-120pcs%E5%A4%9A%E8%89%B2%E3%83%87%E3%83%A5%E3%83%9D%E3%83%B3%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC%E3%80%81arduino%E7%94%A8%E3%83%AF%E3%82%A4%E3%83%A4%E2%80%94%E3%82%B2%E2%80%94%E3%82%B828AWG-%E3%82%AA%E3%82%B9-%E3%83%A1%E3%82%B9-%E3%82%AA%E3%82%B9-%E3%82%AA%E3%82%B9-%E2%80%93%E3%83%A1%E3%82%B9-%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B8%E3%83%A3%E3%83%B3%E3%83%91%E3%83%BC%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC/dp/B06Y48V9DL) | \- |
| Battery box (AA ×4, battery-snap compatible) | [link](https://www.amazon.co.jp/dp/B011IJQ4DI) | Battery snap version is recommended for easier handling. |
| Battery snap (for battery box) | [link](https://www.monotaro.com/p/6866/1105/) | A version with connector pins is recommended — easier to insert into the breadboard and less likely to come loose. |
| Rechargeable AA batteries × 4 | [link](https://www.amazon.co.jp/Amazon%E3%83%99%E3%83%BC%E3%82%B7%E3%83%83%E3%82%AF-AmazonBasics-HR-3UTG-AMZN-%E5%85%85%E9%9B%BB%E5%BC%8F%E3%83%8B%E3%83%83%E3%82%B1%E3%83%AB%E6%B0%B4%E7%B4%A0%E9%9B%BB%E6%B1%A0-%E6%9C%80%E5%B0%8F%E5%AE%B9%E9%87%8F1900mAh%E3%80%81%E7%B4%841000%E5%9B%9E%E4%BD%BF%E7%94%A8%E5%8F%AF%E8%83%BD/dp/B00CWNMV4G/) | Rechargeable batteries are recommended. |
| Battery charger | [link](https://www.amazon.co.jp/%E3%80%90Amazon-co-jp%E9%99%90%E5%AE%9A%E3%80%91%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF-%E6%80%A5%E9%80%9F%E5%85%85%E9%9B%BB%E5%99%A8-%E5%8D%983%E5%BD%A2%E3%83%BB%E5%8D%984%E5%BD%A2-%E9%BB%92-BQ-CC73AM-K/dp/B07FQJJ58Z/) | \- |
| Servo motor driver PCA9685 | [link](https://www.amazon.co.jp/HiLetgo-PCA9685-16%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB-12-%E3%83%93%E3%83%83%E3%83%88-Arduino%E3%81%AB%E5%AF%BE%E5%BF%9C/dp/B01D1D0CX2/) | Compatible alternatives OK |
| MG996R | [link](https://akizukidenshi.com/catalog/g/g112534/) | Compatible alternatives OK, but if the horn size differs from the genuine part, the printed parts may not fit — horn trimming or 3D model modification may be required. |

## 3D Printing Parts

Print the newly added parts on your 3D printer.

> Because slicer software varies by printer model, only key points are noted here rather than step-by-step slicer instructions.

<br />

Print the following parts oriented as shown in the images.

:::note[Printing tips]
- Orient convex protrusions sideways to prevent fractures at the base when attaching/detaching.
- Always enable support material.
:::

- smabo-hardware/stl/pan/mg996r/pan\_adapter.stl

    ![pan_adapter](/images/neck_print_pan_adapter.png)

<br />

- smabo-hardware/stl/pan/mg996r/pan\_plate\_top.stl

    ![pan_plate_top](/images/neck_print_pan_plate_top.png)

<br />

- smabo-hardware/stl/pan/mg996r/pan\_stand\_left.stl

    ![pan_stand_left](/images/neck_print_pan_stand_left.png)

<br />

- smabo-hardware/stl/pan/mg996r/pan\_stand\_right.stl

    ![pan_stand_right](/images/neck_print_pan_stand_right.png)

## Assembly

Assemble the required parts as shown in the video below.

Note: the video also includes parts printed in previous steps.

<div style="width:100%;aspect-ratio:16/9;margin-block:1em">
  <iframe src="/assembly_movie/neck.html" style="width:100%;height:100%;border:none;border-radius:12px" title="Neck Assembly" loading="lazy"></iframe>
</div>

:::note[Assembly tips]
The assembly video does not show how to attach the MG996R servo, so the steps are described here.

<br />

First, fix the MG996R between pan\_stand\_left and pan\_stand\_right as shown below.

![Neck assembly step 1](/images/neck_create_1.jpg)

<br />

Slide pan\_plate\_top over from the top and fit the horn in. No tools required, but you may optionally screw the horn to the servo using the included screws.

![Neck assembly step 2](/images/neck_create_2.jpg)
:::

## Wiring

Wire according to the table below.

In the table, "Point A" and "Point B" are directly connected in the circuit.

| Point A | Point B | Notes |
| --- | --- | --- |
| Battery box (+) | Breadboard + rail (<strong class="red">right</strong> side) | Right rail = 6 V; do not mix with 5 V side |
| Battery box (-) | Breadboard - rail | \- |
| ESP32 5 V pin | Breadboard + rail (<strong class="red">left</strong> side) | Left rail = 5 V; do not mix with 6 V side |
| ESP32 GND | Breadboard - rail | \- |
| PCA9685 V++ | Breadboard + rail (right side) | \- |
| PCA9685 VCC | Breadboard + rail (left side) | \- |
| PCA9685 SDA | Pin set in config.json `i2c/sda` | \- |
| PCA9685 SCL | Pin set in config.json `i2c/scl` | \- |
| PCA9685 GND | Breadboard - rail | \- |

<br />

Wiring diagram for ESP32-DevKitC:

In default config, connect the neck servo to channel=2.

![Neck wiring diagram](/fritzing/png/neck.png)

## Finished Result

The completed robot looks like this.

![smabo with neck servo](/images/smabo_neck.jpg)

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">Follow the startup procedure here</a>.

### Servo Settings

Servo settings can be changed in the 'Modes/servos' section of the 'Config' tab in smabo-web.

Here, enable:

- 'head\_pan'

![Enable head_pan](/images/neck_config_head_pan_enable.jpg)

### Manual Control

Steps for manual controller control.

In the 'Config' tab → 'Modes/servos', for head\_pan, set:

- 'mode' to 'manual'

![Mode set to manual](/images/neck_config_mode_manual.jpg)

<br />

Adjust the servo angle in the 'Servo' tab to rotate smabo left and right.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_manual.mp4" type="video/mp4"></video>

### Random Control

Steps for random motion control.

In the 'Config' tab → 'Modes/servos', for head\_pan, set:

- 'mode' to 'random'
- 'group' to 'neck'

![Mode set to random](/images/neck_config_mode_random.jpg)

:::note[random_group]
Servos assigned to the same random\_group will move at the same random time.

<br />

New random\_groups can be added by clicking the "Add random Group" button.

![Add random group](/images/hand_add_random_group.png)
:::

<br />

After a moment, smabo will turn left/right at random intervals.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_random.mp4" type="video/mp4"></video>

### Image-Recognition Control

Steps for image-recognition-based control.

In the 'Config' tab → 'Modes/servos', set head\_pan's:

- 'mode' to 'manual'

![Mode set to manual for image control](/images/neck_config_mode_manual.jpg)

<br />

In the 'Vision' tab → 'Detection':

- Enable 'Enabled', and
- Select your detection mode (e.g., color mode to track a blue object)

![Vision detection settings](/images/neck_vision_detection.jpg)

<br />

In 'Behaviors':

- Enable 'Servo follow', and set
- 'Pan joint' to 'head\_pan'
- 'Pan Direction' to 'reversed(-1)'

![Servo follow settings](/images/neck_vision_servo_follow.jpg)

<br />

After configuring, place the target object in front of the phone camera. smabo will rotate its head to track the object.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_neck_img_proc.mp4" type="video/mp4"></video>

## Next

This is a terminal node on the roadmap.

To explore other features, pick another page from the roadmap.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="neck"
       aria-label="smabo build guide roadmap (Head Rotation highlighted)"></svg>
</div>
