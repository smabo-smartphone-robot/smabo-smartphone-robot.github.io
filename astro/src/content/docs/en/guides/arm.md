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

In addition to the parts from [smabo-esp32](/en/guides/smabo-esp32/), you need the following.

| Part | Product URL | Notes |
| --- | --- | --- |
| SG90 × 4 | [link](https://akizukidenshi.com/catalog/g/gM-08761/) | Compatible alternatives OK, but if the horn size differs from the genuine part, the printed parts will not fit well.<br>In that case, you may need to trim the horn or modify the 3D model. |


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

    - The same part that held the PCA9685 on the back.

    ![pca9685_stopper_l](/images/esp32_print_pca9685_stopper_l.png)

<br />

- smabo-hardware/stl/base/pca9685\_stopper\_r\_top.stl × 2

    - The same part that held the PCA9685 on the back.
    - The same part is used on the left and right, so print 2.

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

### PCA9685

| Point A | Point B | Notes |
| --- | --- | --- |
| PCA9685 V+ | Breadboard + rail (<strong class="red">right</strong> side) | Servo power (6 V) |
| PCA9685 VCC | Breadboard + rail (<strong class="red">left</strong> side) | \- |
| PCA9685 SDA | ESP32 pin set in config.json `i2c/sda` | Default pins:<br>- config.esp32-classic.json: GPIO 18<br>- config.esp32s3-devkitc1.json: GPIO 11 |
| PCA9685 SCL | ESP32 pin set in config.json `i2c/scl` | Default pins:<br>- config.esp32-classic.json: GPIO 5<br>- config.esp32s3-devkitc1.json: GPIO 10 |
| PCA9685 GND | Breadboard - rail | \- |

### SG90 (arm joint 1)

| Point A | Point B | Notes |
| --- | --- | --- |
| SG90 (arm joint 1) connector | PCA9685 channel 3 | Insert so the brown wire (GND) is on the PCA9685's GND side |

### SG90 (arm joint 2)

| Point A | Point B | Notes |
| --- | --- | --- |
| SG90 (arm joint 2) connector | PCA9685 channel 4 | Insert so the brown wire (GND) is on the PCA9685's GND side |

### SG90 (arm joint 3)

| Point A | Point B | Notes |
| --- | --- | --- |
| SG90 (arm joint 3) connector | PCA9685 channel 5 | Insert so the brown wire (GND) is on the PCA9685's GND side |

### SG90 (arm joint 4)

| Point A | Point B | Notes |
| --- | --- | --- |
| SG90 (arm joint 4) connector | PCA9685 channel 6 | Insert so the brown wire (GND) is on the PCA9685's GND side |

<br />

The wiring diagram for the ESP32-DevKitC (with the defaults in config.esp32-classic.json) is shown below.

Note: with the default settings, connect the arm servos to channel=3, channel=4, channel=5 and channel=6, starting from the joint at the base of the arm.

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
