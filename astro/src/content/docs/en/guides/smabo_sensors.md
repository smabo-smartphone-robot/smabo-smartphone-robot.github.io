---
title: "Smartphone Sensors"
description: "Use the phone's microphone, camera, IMU and GPS as smabo's sensors and visualize them in smabo-web."
---

## Roadmap

This page is the guide for the "Smartphone Sensors" node on the roadmap below.

This guide assumes you have completed the [smabo-app](/en/guides/smabo-app/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="sensors"
       aria-label="smabo build guide roadmap (Smartphone Sensors highlighted)"></svg>
</div>

## Overview

This page explains smabo's sensors.

Specifically, you will:

- Visualize the phone's sensor data (image, IMU, GPS) in smabo-web

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo-web-sensor.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"webrtc","lines":["Image"]},{"from":"app","to":"brain","transport":"ws","lines":["IMU","GPS"]},{"from":"brain","to":"web","transport":"webrtc","lines":["Image"]},{"from":"brain","to":"web","transport":"ws","lines":["IMU","GPS"]}]'
       aria-label="smabo system diagram (Smartphone Sensors highlighted)"></svg>
</div>

## Required Parts

The following parts are required to implement this feature.

| Part | Product URL | Notes |
| --- | --- | --- |
| Smartphone | \- | A smartphone with smabo-app installed |

## Operation

### Startup Procedure

Follow <a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">the startup procedure here</a>.

Then open the **Sensors** tab in smabo-web.

### Visualizing the Sensors

Each of smabo's sensors can be turned on or off with the buttons at the bottom left.

![Sensor on/off buttons at the bottom left of smabo-app](/images/app_sensor_toggle.png)

<br />

With the sensors turned on, open the **Sensors** tab in smabo-web to see each sensor's data.

![Smartphone sensor data visualized in smabo-web](/images/app_sensor_web.png)

## Next

Next, the following node on the roadmap is explained:

- [Base Parts](/en/guides/base/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo build guide roadmap (next: Base Parts highlighted)"></svg>
</div>
