---
title: "Audio Processing"
description: "Wake smabo with a wake word and talk to it — smabo-brain recognizes your speech, and smabo-web makes smabo say any text."
---

## Roadmap

This page is the guide for the "Audio Processing" node on the roadmap below.

This guide assumes you have completed the [smabo-app](/en/guides/smabo-app/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="voice"
       aria-label="smabo build guide roadmap (Audio Processing highlighted)"></svg>
</div>

## Overview

This page explains the **Audio Processing feature** of smabo.

Specifically, you will:

- Recognize speech captured by the phone

    - Display the recognition result in smabo-web

    ![Speech recognition result from smabo-app shown in smabo-web](/images/app_recognized_speech.png)

- Make smabo speak a text string entered in smabo-web

    ![smabo speaking text entered in smabo-web](/images/app_speech_say.jpg)

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"app","to":"brain","transport":"ws","lines":["Audio"]},{"from":"brain","to":"web","transport":"ws","lines":["Speech recognition result"]},{"from":"web","to":"brain","transport":"ws","lines":["Text to speak"]},{"from":"brain","to":"app","transport":"ws","lines":["Text to speak"]}]'
       aria-label="smabo system diagram (Audio Processing highlighted)"></svg>
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

### Speech Recognition

Say **"smabo"** to smabo and its eyes light up in rainbow colors (the wake word can be changed in smabo-app's settings screen).

While the eyes are rainbow-colored, say something and speech recognition starts (the recognition language can be changed in smabo-app's settings screen).

![smabo-app listening for voice input](/images/app_voice_listening.png)

<br />

After the eye color returns to normal, check **Recognized speech** in the **Face** tab of smabo-web — it shows what you just said.

![Speech recognition result from smabo-app shown in smabo-web](/images/app_recognized_speech.png)

### Speech Output

In **Speech / Say** in the **Face** tab of smabo-web, enter any text and click the **Say** button — the phone speaks the text (the speech language can be changed in smabo-app's settings screen).

![smabo speaking text entered in smabo-web](/images/app_speech_say.jpg)

<br />

The **Bubble ON** and **Speak ON** buttons turn the speech output and the speech bubble on or off.

![smabo-app toggles for speech output and speech bubble](/images/app_speech_toggle.png)

## Next

Next, the following node on the roadmap is explained:

- [Base Parts](/en/guides/base/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo build guide roadmap (next: Base Parts highlighted)"></svg>
</div>
