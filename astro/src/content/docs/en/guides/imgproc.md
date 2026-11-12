---
title: "Image Processing"
description: "Run object detection (AR marker, color, face, QR code) on the phone camera feed via smabo-brain, and control smabo's eyes, servos, and drive based on the results."
---

## Roadmap

This page is the guide for the "Image Processing" node on the roadmap below.

This guide assumes you have completed the [smabo-brain](/en/guides/smabo-brain/) and [smabo-app](/en/guides/smabo-app/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="imgproc"
       aria-label="smabo build guide roadmap (Image Processing highlighted)"></svg>
</div>

## Overview

This page explains the **Image Processing feature** of smabo.

Specifically, you will:

- Detect objects in the camera feed and visualize results in smabo-web
    - Visualize detection results in smabo-web
    - Control smabo's eyes based on detection results

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/img_proc_smabo_web.mp4" type="video/mp4"></video>

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_img_proc.mp4" type="video/mp4"></video>

## Operation

### Startup Procedure

Follow <a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">the startup procedure here</a>.

### Detection Modes

In smabo-web, go to the **Vision** tab and enable **Detection** to activate image processing.

![Enabling detection in the smabo-web Vision tab](/images/web_vision_detection.png)

<br />

Several detection modes are available. Change the **Mode** to detect different types of objects:

- AR marker
- Color (specified color tracking)
- Face
- QR code

![Choosing the detection mode: AR marker, color, face, or QR code](/images/web_vision_mode.png)

<br />

You can also set a **Min size** to define the minimum object size to detect (objects at least this size will be recognized). Enable the preview to see the minimum size frame in the bottom-right corner.

![Minimum detection size setting and preview frame](/images/web_vision_min_size.png)

### Behaviors

Under **BEHAVIORS** in the Vision tab, you can control smabo based on detection results.

Behaviors act on the **largest detected object**, using its position and size in the frame.

![Behaviors settings that act on the detected object position](/images/web_vision_behaviors.png)

<br />

Available behavior types:

- **Eye follow** — smabo's eyes track the detected object
- **Servo follow** — a servo motor tracks the detected object (for neck movement; horizontal and vertical axes configurable — see [Head Tilt](/en/guides/neck/))
- **Differential drive** — the robot drives toward or away from the detected object to maintain a target size (see [Mobile Robot](/en/guides/mobile/))

<br />

For example, to use **Eye follow**: set smabo-app's face mode to **Follow**.

![Setting the smabo-app face mode to Follow](/images/app_eye_follow_mode.png)

Then hold the target object in front of the camera — smabo's eyes will track it.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_img_proc.mp4" type="video/mp4"></video>

## Next

This is a terminal node on the roadmap.

To explore other features, pick another page from the roadmap.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active=""
       aria-label="smabo build guide roadmap (next)"></svg>
</div>
