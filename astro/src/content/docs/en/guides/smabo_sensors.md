---
title: "Smartphone Sensors"
description: "Visualize camera, IMU, and GPS sensor data from the smabo-app in the smabo-web Sensors tab."
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

This page explains how to visualize smartphone sensor data in smabo.

Specifically, you will:

- Visualize phone sensor data (camera image, IMU, GPS) in smabo-web

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/smabo-web-sensor.mp4" type="video/mp4"></video>

## Operation

### Startup Procedure

Follow <a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">the startup procedure here</a>.

### Enabling Sensors

Use the button in the bottom-left of smabo-app to toggle each sensor on or off.

![Sensor on/off buttons at the bottom left of smabo-app](/images/app_sensor_toggle.png)

### Viewing Sensor Data

With sensors enabled, open the **Sensors** tab in smabo-web to view real-time data:

- Camera image (from the phone's camera)
- IMU data (accelerometer, gyroscope)
- GPS data

![Smartphone sensor data visualized in smabo-web](/images/app_sensor_web.png)

## Next

This is a terminal node on the roadmap.

To explore other features, pick another page from the roadmap.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active=""
       aria-label="smabo build guide roadmap (next)"></svg>
</div>
