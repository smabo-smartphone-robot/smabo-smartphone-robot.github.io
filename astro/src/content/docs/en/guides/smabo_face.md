---
title: "smabo's Face"
description: "Customize smabo's face shown on the phone screen, change its expression, and move its eyes with a controller."
---

## Roadmap

This page is the guide for the "smabo's Face" node on the roadmap below.

This guide assumes you have completed the [smabo-app](/en/guides/smabo-app/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="face"
       aria-label="smabo build guide roadmap (smabo's Face highlighted)"></svg>
</div>

## Overview

This page explains the **Face feature** of smabo.

Specifically, you will:

- Change smabo's expression from smabo-web

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_change.mp4" type="video/mp4"></video>

- Control smabo's eyes from smabo-web

    <video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_manual.mp4" type="video/mp4"></video>

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["Expression change","Eye control"]},{"from":"brain","to":"app","transport":"ws","lines":["Expression change","Eye control"]}]'
       aria-label="smabo system diagram (smabo's Face highlighted)"></svg>
</div>

## Required Parts

The following parts are required to implement this feature.

| Part | Product URL | Notes |
| --- | --- | --- |
| Smartphone | \- | A smartphone with smabo-app installed |

## Operation

### Startup Procedure

Follow <a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">the startup procedure here</a>.

Then open the **Face** tab in smabo-web.

### Customizing smabo's Face

smabo's face can be changed from **Face Settings**.

![Face Settings button in smabo-app](/images/app_face_settings_button.png)

<br />

In the settings you can change the eye size, the eye type, the background color, and more.

![smabo-app face settings: eye type, background color and more](/images/app_face_settings.png)

### Changing smabo's Expression

In the **Expression** section of the **Face** tab in smabo-web, enter an expression name (the name given in smabo-app's Face settings) and click **Set**, or click one of the expression-name buttons — smabo's eye type changes. Names are not case-sensitive.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_change.mp4" type="video/mp4"></video>

### Moving smabo's Eyes with a Controller

By default smabo's eyes move randomly, but if you change the mode to **Follow**, they can be moved freely by commands from outside.

![Setting the smabo-app face mode to Follow](/images/app_eye_follow_mode.png)

<br />

For example, operate the controller in **Gaze control** in the **Face** tab of smabo-web and the eyes move along with it.

<video autoplay loop muted playsinline style="max-width:100%"><source src="/video/eye_control_manual.mp4" type="video/mp4"></video>

## Next

Next, the following node on the roadmap is explained:

- [Base Parts](/en/guides/base/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo build guide roadmap (next: Base Parts highlighted)"></svg>
</div>
