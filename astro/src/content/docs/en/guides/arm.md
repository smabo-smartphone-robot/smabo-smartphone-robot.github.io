---
title: "Robot Arm"
description: "Required setup: smabo-app + smabo-esp32"
---

## Roadmap

This page is the guide for the 'Robot Arm' node on the roadmap below.

This guide assumes you have completed the [smabo-esp32](/en/guides/smabo-esp32/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="arm"
       aria-label="smabo build guide roadmap (Robot Arm highlighted)"></svg>
</div>

## Overview

This page explains the Robot Arm feature.

Specifically, you will implement:

- Manual controller control of the robot arm

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_arm_manual.mp4" type="video/mp4"></video>

## Required Parts

The following parts are required to implement this feature.

| Part | Product URL | Notes |
| --- | --- | --- |
| ESP32-DevKitC | [link](https://www.amazon.co.jp/ESP32-DevKitC-Bluetooth-機能マイクロコントローラー-TYPE-C-デュアルコアボード/dp/B0GTY64KDC/ref=asc_df_B0GTY64KDC?mcid=350a4550c70e3d30953041512ffe110a&tag=jpgo-22&linkCode=df0&hvadid=792079627413&hvpos=&hvnetw=g&hvrand=17366440597157412973&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-2484301629565&hvocijid=17366440597157412973-B0GTY64KDC-&hvexpln=0&th=1) | Compatible alternatives OK |
| Breadboard (SAD101)<br> | [link](https://www.amazon.co.jp/サンハヤト-ニューブレッドボード-SAD-101/dp/B00DSKCS68?th=1) | Standard breadboards have 5 holes per row, but this one has 6 — required for the ESP32's width. |
| Jump wires | [link](https://www.amazon.co.jp/ELEGOO-120pcs%E5%A4%9A%E8%89%B2%E3%83%87%E3%83%A5%E3%83%9D%E3%83%B3%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC%E3%80%81arduino%E7%94%A8%E3%83%AF%E3%82%A4%E3%83%A4%E2%80%94%E3%82%B2%E2%80%94%E3%82%B828AWG-%E3%82%AA%E3%82%B9-%E3%83%A1%E3%82%B9-%E3%82%AA%E3%82%B9-%E3%82%AA%E3%82%B9-%E2%80%93%E3%83%A1%E3%82%B9-%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B8%E3%83%A3%E3%83%B3%E3%83%91%E3%83%BC%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC/dp/B06Y48V9DL) | \- |
| Battery box (AA ×4, battery-snap compatible) | [link](https://www.amazon.co.jp/dp/B011IJQ4DI?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_3) | Battery snap version is recommended for easier handling. |
| Battery snap (for battery box) | [link](https://www.monotaro.com/p/6866/1105/) | A version with connector pins is recommended — easier to insert into the breadboard and less likely to come loose. |
| Rechargeable AA batteries × 4 | [link](https://www.amazon.co.jp/Amazon%E3%83%99%E3%83%BC%E3%82%B7%E3%83%83%E3%82%AF-AmazonBasics-HR-3UTG-AMZN-%E5%85%85%E9%9B%BB%E5%BC%8F%E3%83%8B%E3%83%83%E3%82%B1%E3%83%AB%E6%B0%B4%E7%B4%A0%E9%9B%BB%E6%B1%A0-%E6%9C%80%E5%B0%8F%E5%AE%B9%E9%87%8F1900mAh%E3%80%81%E7%B4%841000%E5%9B%9E%E4%BD%BF%E7%94%A8%E5%8F%AF%E8%83%BD/dp/B00CWNMV4G/) | Rechargeable batteries are recommended. |
| Battery charger | [link](https://www.amazon.co.jp/%E3%80%90Amazon-co-jp%E9%99%90%E5%AE%9A%E3%80%91%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF-%E6%80%A5%E9%80%9F%E5%85%85%E9%9B%BB%E5%99%A8-%E5%8D%983%E5%BD%A2%E3%83%BB%E5%8D%984%E5%BD%A2-%E9%BB%92-BQ-CC73AM-K/dp/B07FQJJ58Z/) | \- |
| Servo motor driver PCA9685 | [link](https://www.amazon.co.jp/HiLetgo-PCA9685-16%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB-12-%E3%83%93%E3%83%83%E3%83%88-Arduino%E3%81%AB%E5%AF%BE%E5%BF%9C/dp/B01D1D0CX2/) | Compatible alternatives OK |
| SG90 × 4 | [link](https://akizukidenshi.com/catalog/g/gM-08761/) | Compatible alternatives OK, but if the horn size differs from the genuine part, the printed parts may not fit — horn trimming or 3D model modification may be required. |

## 3D Printing Parts

Print the newly added parts on your 3D printer.

> Because slicer software varies by printer model, only key points are noted here rather than step-by-step slicer instructions.

<br />

Print the following parts oriented as shown in the images.

:::note[Printing tips]
- Orient convex protrusions sideways to prevent fractures at the base when attaching/detaching.
- Always enable support material.
:::

- smabo-hardware/stl/arm/sg90/sg90\_1\_L.stl
    ![sg90_1_L](/images/arm_print_sg90_1_l.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_1\_R.stl
    ![sg90_1_R](/images/arm_print_sg90_1_r.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_2.stl
    ![sg90_2](/images/arm_print_sg90_2.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_3\_concave.stl
    ![sg90_3_concave](/images/arm_print_sg90_3_concave.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_3\_convex.stl
    ![sg90_3_convex](/images/arm_print_sg90_3_convex.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_4\_concave.stl
    ![sg90_4_concave](/images/arm_print_sg90_4_concave.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_4\_convex.stl
    ![sg90_4_convex](/images/arm_print_sg90_4_convex.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_5\_concave.stl
    ![sg90_5_concave](/images/arm_print_sg90_5_concave.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_5\_convex.stl
    ![sg90_5_convex](/images/arm_print_sg90_5_convex.png)

<br />

- smabo-hardware/stl/arm/sg90/sg90\_5\_hand.stl
    ![sg90_5_hand](/images/arm_print_sg90_5_hand.png)

<br />

- smabo-hardware/stl/base/pca9685\_stopper\_l.stl

    The same part that held the PCA9685 on the back panel.

    ![pca9685_stopper_l](/images/esp32_print_pca9685_stopper_l.png)

<br />

- smabo-hardware/stl/base/pca9685\_stopper\_r\_top.stl × 2

    The same part that held the PCA9685 on the back panel.

    The same part is used on the left and right, so print 2.

    ![pca9685_stopper_r_top](/images/esp32_print_pca9685_stopper_r_top.png)

## Assembly

Assemble the required parts as shown in the video below.

Note: the video also includes parts printed in previous steps.

<p>
  <iframe src="/assembly_movie/smabo_arm.html" title="Robot Arm Assembly"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[Assembly tips]
The assembly video does not show how to attach the SG90 servos and the PCA9685, so the steps are described here.

The range of motion of each joint is shown below; use it as a reference while assembling.
<p>
  <iframe src="/assembly_movie/arm_joint_range.html" title="Robot Arm Range of Motion"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

<br />

Fix an SG90 between sg90\_1\_L and sg90\_1\_R as shown, then attach the assembly to the body.
(Route the cable through the recessed part.)

![sg90_1 holding an SG90](/images/arm_assemble_sg90_1.webp)
![sg90_1 attached to the body](/images/arm_assemble_sg90_1_body.webp)

<br />

Move the PCA9685 servo driver from the back of smabo to the top using pca9685\_stopper\_l.stl and pca9685\_stopper\_r\_top.stl × 2 (the cables are not long enough otherwise).

![PCA9685 moved to the top](/images/arm_assemble_pca9685_top.webp)

<br />

Slide sg90\_2 over from the top and fit the horn in. No tools required, but you may optionally screw the horn to the servo using the included screws.

![sg90_2 fitted on the horn](/images/arm_assemble_sg90_2.webp)

<br />

Assemble the arm body.
Combine sg90\_3\_concave with sg90\_3\_convex, sg90\_4\_concave with sg90\_4\_convex, and sg90\_5\_concave with sg90\_5\_convex to build the arm body.

![sg90_3 assembled](/images/arm_assemble_sg90_3.webp)
![sg90_4 assembled](/images/arm_assemble_sg90_4.webp)
![sg90_5 assembled](/images/arm_assemble_sg90_5.webp)

<br />

Attach the hand.
Attach sg90\_5\_hand.

![sg90_5_hand attached](/images/arm_assemble_hand.webp)

<br />

Finally, attach the arm to the body.
![Arm attached to the body](/images/arm_complete.webp)
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

In default config, connect the arm servos to channel=3, channel=4, channel=5 and channel=6, starting from the joint at the base of the arm.

![Robot arm wiring diagram](/fritzing/png/arm.png)

## Finished Result

The completed robot looks like this.

![smabo with the robot arm](/images/arm_complete.webp)

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">Follow the startup procedure here</a>.

### Servo Settings

Servo settings can be changed in the 'Modes/servos' section of the 'Config' tab in smabo-web.

Enable:

- 'arm\_joint\_1', 'arm\_joint\_2', 'arm\_joint\_3' and 'arm\_joint\_4'

![Enable arm_joint_1 to 4](/images/arm_servo_enable.webp)

### Manual Control

Steps for manual controller control.

In the 'Config' tab → 'Modes/servos', for arm\_joint\_1 to 4, set:

- 'mode' to 'manual'

![Mode set to manual](/images/arm_servo_mode_manual.webp)

<br />

Adjust servo angles in the 'Servo' tab to move the arm.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_arm_manual.mp4" type="video/mp4"></video>

## Next

Next, the following node on the roadmap is explained:

- [Motion Planning (coming soon)](/en/guides/plan/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="plan"
       aria-label="smabo build guide roadmap (next: Motion Planning highlighted)"></svg>
</div>
