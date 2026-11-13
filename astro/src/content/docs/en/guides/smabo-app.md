---
title: "smabo-app"
description: "Install smabo-app — smabo's face and sensors — on your phone, then check the connection, face settings, sensor visualization, speech recognition, speech output and gaze control."
---

## Roadmap

This page is the guide for the "smabo-app" node on the roadmap below.

This guide assumes you have completed the [smabo-web](/en/guides/smabo-web/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="app"
       aria-label="smabo build guide roadmap (smabo-app highlighted)"></svg>
</div>

## Overview

This page explains the setup procedure for "smabo-app".

smabo-app serves as:

- smabo's face
- smabo's sensor hub (using the phone's built-in sensors)

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["Camera feed"]},{"from":"app","to":"brain","transport":"ws","lines":["Phone sensor values"]},{"from":"brain","to":"app","transport":"ws","lines":["Control values"]}]' data-active="app"
       aria-label="smabo system diagram (smabo-app highlighted)"></svg>
</div>

## Required Parts

Parts required to implement this feature:

| Part | Product URL | Notes |
| --- | --- | --- |
| Smartphone | \- | Your own smartphone |

### Installing smabo-app

Install smabo-app on your smartphone.

Note: The following steps are for Android only.

> For iOS, Flutter installation and additional steps are required. See the README on the [smabo-app repository](https://github.com/smabo-smartphone-robot/smabo-app) for details.
>
> Note: Installing on iOS requires a macOS PC.

Access the [smabo-app Releases page](https://github.com/smabo-smartphone-robot/smabo-app/releases) from your phone.

Download the latest APK file from the available versions.

Run the downloaded APK to install smabo-app.

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">Follow the startup procedure here</a>.

<br />

Setup is complete once all programs start and communication is confirmed.

## Next

Next, follow the guides for:

- [smabo's face](/en/guides/smabo_face/)
- [Phone sensors](/en/guides/smabo_sensors/)
- [Audio processing](/en/guides/audioproc/)
- [Image processing](/en/guides/imgproc/)
- [Base parts assembly](/en/guides/base/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="face,sensors,voice,imgproc,baseparts"
       aria-label="smabo build guide roadmap (next: face, phone sensors, audio processing, image processing, base parts highlighted)"></svg>
</div>
