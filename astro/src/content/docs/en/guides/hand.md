---
title: "Hand"
description: "Implement controller control and random control of the hand."
---

## Roadmap

This page is the guide for the 'Hand' node on the roadmap below.

This guide assumes you have completed the [smabo-esp32](/en/guides/smabo-esp32/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="hand"
       aria-label="smabo build guide roadmap (Hand highlighted)"></svg>
</div>

## Overview

This page explains the Hand feature.

Specifically, you will implement:

- Manual controller control of the hand

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_manual.mp4" type="video/mp4"></video>

- Random motion control of the hand

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_random.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["Servo control values"]},{"from":"brain","to":"esp32","transport":"ws","lines":["Servo control values"]},{"from":"web","to":"esp32","transport":"rest","lines":["ESP32 config"]}]' data-active="web,brain,esp32"
       aria-label="smabo system diagram (smabo-web, smabo-brain, smabo-esp32 highlighted)"></svg>
</div>

## Required Parts

In addition to the parts from [smabo-esp32](/en/guides/smabo-esp32/), you need the following.

| Part | Product URL | Notes |
| --- | --- | --- |
| SG90 × 2 | [link](https://akizukidenshi.com/catalog/g/gM-08761/) | Compatible alternatives OK, but if the horn size differs from the genuine part, the printed parts will not fit well.<br>In that case, you may need to trim the horn or modify the 3D model. |


## 3D Printing Parts

Print the newly added parts on your 3D printer.

> Because slicer software varies by printer model, only key points are noted here rather than step-by-step slicer instructions.

<br />

Print the following parts oriented as shown in the images.

:::note[Printing tips]
- Orient convex protrusions sideways to prevent fractures at the base when attaching/detaching.
- Always enable support material.
:::

- smabo-hardware/stl/hand/sg90/sg90\_plate\_1.stl × 2

    <br />

    Print 2 (same part used on left and right)

    <br />

    ![sg90_plate_1](/images/hand_print_sg90_plate_1.png)

<br />

- smabo-hardware/stl/hand/sg90/sg90\_plate\_2.stl × 2

    <br />

    Print 2 (same part used on left and right)

    <br />

    ![sg90_plate_2](/images/hand_print_sg90_plate_2.png)

<br />

- smabo-hardware/stl/hand/sg90/sg90\_base.stl × 2

    <br />

    Print 2 (same part used on left and right)

    <br />

    ![sg90_base](/images/hand_print_sg90_base.png)

<br />

- smabo-hardware/stl/hand/sg90/arm\_hand.stl × 2

    <br />

    Print 2 (same part used on left and right)

    <br />

    ![arm_hand](/images/hand_print_arm_hand.png)

## Assembly

Assemble the required parts as shown in the video below.

Note: the video also includes parts printed in previous steps.

<p>
  <iframe src="/assembly_movie/hand.html" title="Hand Assembly"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[Assembly tips]
The assembly video does not show how to attach the SG90 servos, so the steps are described here.

The range of motion of each hand is shown below; use it as a reference while assembling.
<p>
  <iframe src="/assembly_movie/hand_joint_range.html" title="Hand Range of Motion"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

<br />

First, fix the SG90 between sg90\_plate\_1 and sg90\_plate\_2 as shown, then attach the assembly to the body.

![Hand assembly step 1](/images/hand_create_1.jpg)

![Hand assembly step 2](/images/hand_create_2.jpg)

<br />

Slide sg90\_base over from the top and fit the horn in. No tools required, but you may optionally screw the horn to the servo using the included screws.

![Hand assembly step 3](/images/hand_create_3.jpg)
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

### SG90 (left hand)

| Point A | Point B | Notes |
| --- | --- | --- |
| SG90 (left hand) connector | PCA9685 channel 0 | Insert so the brown wire (GND) is on the PCA9685's GND side |

### SG90 (right hand)

| Point A | Point B | Notes |
| --- | --- | --- |
| SG90 (right hand) connector | PCA9685 channel 1 | Insert so the brown wire (GND) is on the PCA9685's GND side |

<br />

The wiring diagram for the ESP32-DevKitC (with the defaults in config.esp32-classic.json) is shown below.

Note: with the default settings, connect the left arm servo to channel=0, and the right arm servo to channel=1.

![Hand wiring diagram](/fritzing/png/hand.png)

:::note[Wiring tip]
Route the SG90 cables through the gap at the bottom-right of the smabo back panel to reach the PCA9685.
:::

## Finished Result

The completed robot looks like this.

![smabo with hands](/images/smabo_hand.jpg)

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">Follow the startup procedure here</a>.

Then open the 'Config' tab in smabo-web.

### Servo Settings

Servo settings can be changed in the 'Modes/servos' section of the 'Config' tab in smabo-web.

First, since the left and right hand servos are mounted in opposite directions, enable:

- 'inverse' for 'right\_hand' only

![Enable inverse for right_hand](/images/hand_servo_inverse.png)

<br />

Next, enable:

- 'left\_hand' and 'right\_hand'

![Enable left_hand and right_hand](/images/hand_servo_enable.png)

### Manual Control

Steps for manual controller control.

In the 'Config' tab → 'Modes/servos', for left\_hand and right\_hand, set:

- 'mode' to 'manual'

![Mode set to manual](/images/hand_mode_manual.png)

<br />

Adjust servo angles in the 'Servo' tab to move both arms.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_manual.mp4" type="video/mp4"></video>

### Random Control

Steps for random motion control.

In the 'Config' tab → 'Modes/servos', for left\_hand and right\_hand, set:

- 'mode' to 'random'
- 'group' to 'hands'

![Mode set to random](/images/hand_mode_random.png)

:::note[random_group]
Servos assigned to the same random\_group will move at the same random time.

<br />

If you want the left and right hands to move at independent random times, assign left\_hand and right\_hand to different random\_groups.

<br />

New random\_groups can be added by clicking the "Add Random group" button.

![Add random group](/images/hand_add_random_group.png)
:::

<br />

After a moment, both hands will move at random intervals.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo_hand_random.mp4" type="video/mp4"></video>

## Next

This is a terminal node on the roadmap.

<br />

smabo has many other features to explore.

If you want to explore other features, pick another page from the roadmap.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active=""
       aria-label="smabo build guide roadmap"></svg>
</div>
