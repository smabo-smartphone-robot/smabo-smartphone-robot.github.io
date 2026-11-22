---
title: "Head Rotation (Neck)"
description: "Head rotation with an MG996R servo. Implement head rotation driven by a controller, by random motion, and by image processing."
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

In addition to the parts from [smabo-esp32](/en/guides/smabo-esp32/), you need the following.

| Part | Product URL | Notes |
| --- | --- | --- |
| MG996R | [link](https://akizukidenshi.com/catalog/g/g112534/) | Compatible alternatives OK, but if the horn size differs from the genuine part, the printed parts will not fit well.<br>In that case, you may need to trim the horn or modify the 3D model. |


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

<p>
  <iframe src="/assembly_movie/neck.html" title="Neck Assembly"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[Assembly tips]
The assembly video does not show how to attach the MG996R servo, so the steps are described here.

The range of motion of the neck is shown below; use it as a reference while assembling.
<p>
  <iframe src="/assembly_movie/neck_joint_range.html" title="Neck Range of Motion"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

<br />

First, fix the MG996R between pan\_stand\_left and pan\_stand\_right as shown below.

![Neck assembly step 1](/images/neck_create_1.jpg)

<br />

Slide pan\_plate\_top over from the top and fit the horn in. No tools required, but you may optionally screw the horn to the servo using the included screws.

![Neck assembly step 2](/images/neck_create_2.jpg)
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

### MG996R (neck)

| Point A | Point B | Notes |
| --- | --- | --- |
| MG996R (neck) connector | PCA9685 channel 2 | Insert so the brown wire (GND) is on the PCA9685's GND side |

<br />

The wiring diagram for the ESP32-DevKitC (with the defaults in config.esp32-classic.json) is shown below.

Note: with the default settings, connect the neck servo to channel=2.

![Neck wiring diagram](/fritzing/png/neck.png)

## Finished Result

The completed robot looks like this.

![smabo with neck servo](/images/smabo_neck.jpg)

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">Follow the startup procedure here</a>.

Then open the 'Config' tab in smabo-web.

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

New random\_groups can be added by clicking the "Add Random group" button.

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
- 'Pan direction' to 'reversed (−1)'

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
