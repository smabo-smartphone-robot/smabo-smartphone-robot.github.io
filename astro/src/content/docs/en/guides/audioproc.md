---
title: "Audio Processing"
description: "Say \"smabo\" to activate listening mode, let smabo-brain recognize your speech, and make smabo speak any text you enter in smabo-web."
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

- Recognize speech captured by the phone's microphone

    - Display the recognized text in smabo-web

    ![Speech recognition result from smabo-app shown in smabo-web](/images/app_recognized_speech.png)

- Make smabo speak a text string entered in smabo-web

    ![smabo speaking text entered in smabo-web](/images/app_speech_say.jpg)

## Operation

### Startup Procedure

Follow <a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-appの接続">the startup procedure here</a>.

### Wake Word

Say **"smabo"** near the phone to activate listening mode — smabo's eyes will light up in rainbow colors (the wake word can be changed in smabo-app Settings).

Once the eyes are rainbow-colored, speak any phrase to start speech recognition (the recognition language can also be changed in smabo-app Settings).

![smabo-app listening for voice input](/images/app_voice_listening.png)

### Speech Recognition

After smabo's eyes return to normal, check the **Recognized speech** field in the **Face** tab of smabo-web — it will display what you said.

![Speech recognition result from smabo-app shown in smabo-web](/images/app_recognized_speech.png)

### Text-to-Speech

In the **SPEECH / SAY** section of the **Face** tab in smabo-web, enter any text and click the **SAY** button — the phone's speaker will read it aloud (the language can be changed in smabo-app Settings).

![smabo speaking text entered in smabo-web](/images/app_speech_say.jpg)

<br />

Use the **Bubble ON** and **Speak ON** buttons to toggle the speech bubble and audio output independently.

![smabo-app toggles for speech output and speech bubble](/images/app_speech_toggle.png)

## Next

This is a terminal node on the roadmap.

To explore other features, pick another page from the roadmap.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active=""
       aria-label="smabo build guide roadmap (next)"></svg>
</div>
