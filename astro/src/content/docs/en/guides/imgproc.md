---
title: "Image Processing"
description: "Run image recognition (AR marker, color, face, QR code) on the phone camera feed in smabo-brain, and control smabo's eyes, servos and driving based on the results."
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

- Identify target objects from the camera image
    - Visualize the results in smabo-web
    - Control smabo's eyes based on the results

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/img_proc_smabo_web.mp4" type="video/mp4"></video>

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_img_proc.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["Image"]},{"from":"brain","to":"web","transport":"webrtc","lines":["Image"]},{"from":"brain","to":"app","transport":"ws","lines":["Eye control"]},{"from":"web","to":"brain","transport":"ws","lines":["Image processing settings"]},{"from":"brain","to":"web","transport":"ws","lines":["Image processing result"]}]'
       aria-label="smabo system diagram (Image Processing highlighted)"></svg>
</div>

## Operation

### Startup Procedure

Follow <a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">the startup procedure here</a>.

Then open the **Vision** tab in smabo-web.

### Image Recognition

Image recognition is configured in the **Vision** tab of smabo-web. Enable **enabled** under **Detection** to turn image recognition on.

![Enabling detection in the smabo-web Vision tab](/images/web_vision_detection.png)

<br />

Several kinds of recognition are available. Change **Mode** to recognize the following:

- AR markers
- Objects of a specified color
- Faces
- QR codes

![Choosing the detection mode: AR marker, color, face, or QR code](/images/web_vision_mode.png)

<br />

With **Min size** you can set:

- the minimum size of objects to recognize in the image (objects at least this size are recognized)

When the preview is enabled, a frame of the minimum size is shown at the bottom right.

![Minimum detection size setting and preview frame](/images/web_vision_min_size.png)

### Control Based on Object Recognition

Under **Behaviors**, smabo can be controlled based on the recognition results.

Specifically, it:

- controls smabo based on the position and image size of the **largest** recognized object

![Behaviors settings that act on the detected object position](/images/web_vision_behaviors.png)

<br />

The available kinds of control are:

- Eye control
    - smabo's eyes follow the recognized object
- Servo control
    - servos follow the recognized object
    - a servo can be set for each of the horizontal and vertical directions
    - see [Head Rotation](/en/guides/neck/) for details
- Two-wheel drive robot control
    - the robot follows the recognized object
    - the robot moves forward or backward to keep the object at the size set in target size
    - see [Mobile Robot](/en/guides/mobile/) for details

<br />

For example, for eye control,

- set smabo-app's face mode to **Follow**.

![Setting the smabo-app face mode to Follow](/images/app_eye_follow_mode.png)

Then bring the target object in front of the camera and smabo's eyes follow it.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_img_proc.mp4" type="video/mp4"></video>

## Next

Next, the following node on the roadmap is explained:

- [Base Parts](/en/guides/base/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo build guide roadmap (next: Base Parts highlighted)"></svg>
</div>
