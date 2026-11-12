---
title: "smabo-web"
description: "Set up smabo-web — the browser-based tool for configuration, manual control, and sensor visualization."
---

## Roadmap

This page is the guide for the "smabo-web" node on the roadmap below.

This guide assumes you have completed the [smabo-brain](/en/guides/smabo-brain/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="web"
       aria-label="smabo build guide roadmap (smabo-web highlighted)"></svg>
</div>

## Overview

This page explains the setup procedure for "smabo-web".

smabo-web serves as:

- An auxiliary tool for smabo configuration, manual operation, and sensor visualization

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["Control values"]},{"from":"brain","to":"web","transport":"ws","lines":["Sensor values"]},{"from":"brain","to":"web","transport":"webrtc","lines":["Camera feed"]},{"from":"web","to":"esp32","transport":"rest","lines":["ESP32 config"]}]' data-active="web"
       aria-label="smabo system diagram (smabo-web highlighted)"></svg>
</div>

### Cloning smabo-web

Clone the smabo-web repository with the following commands.

```bash
# Move to home directory
cd ~ 
```

```bash
# Clone smabo-web repository
git clone https://github.com/smabo-smartphone-robot/smabo-web
```

### Installing Packages

Install the required packages.

```bash
cd ~/smabo-web
```

```bash
npm install
```

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続">Follow the startup procedure here</a>.

<br />

Setup is complete once all programs start and communication is confirmed.

## Next

Next, follow the guide for:

- [smabo-app](/en/guides/smabo-app/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="app"
       aria-label="smabo build guide roadmap (next: smabo-app highlighted)"></svg>
</div>
