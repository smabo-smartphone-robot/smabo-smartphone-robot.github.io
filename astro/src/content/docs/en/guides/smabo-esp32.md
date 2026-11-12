---
title: "smabo-esp32"
description: "Set up smabo-esp32 — the firmware that controls sensors and actuators connected to the ESP32."
---

## Roadmap

This page is the guide for the 'smabo-esp32' node on the roadmap below.

This guide assumes you have completed the [Base Parts](/en/guides/base/) guide.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="esp32"
       aria-label="smabo build guide roadmap (smabo-esp32 highlighted)"></svg>
</div>

## Overview

This page explains how to set up smabo-esp32.

smabo-esp32 is responsible for:

- Controlling sensors and actuators connected to the ESP32

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"esp32","transport":"rest","lines":["ESP32 config"]},{"from":"brain","to":"esp32","transport":"ws","lines":["Control values"]},{"from":"esp32","to":"brain","transport":"ws","lines":["Sensor values"]}]' data-active="esp32"
       aria-label="smabo system diagram (smabo-esp32 highlighted)"></svg>
</div>

## Required Parts

The following parts are required to implement this feature.

| Part | Product URL | Notes |
| --- | --- | --- |
| ESP32-DevKitC | [link](https://www.amazon.co.jp/ESP32-DevKitC-Bluetooth-機能マイクロコントローラー-TYPE-C-デュアルコアボード/dp/B0GTY64KDC/ref=asc_df_B0GTY64KDC?mcid=350a4550c70e3d30953041512ffe110a&tag=jpgo-22&linkCode=df0&hvadid=792079627413&hvpos=&hvnetw=g&hvrand=17366440597157412973&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9199153&hvtargid=pla-2484301629565&hvocijid=17366440597157412973-B0GTY64KDC-&hvexpln=0&th=1) | Compatible alternatives OK |
| Breadboard (SAD101)<br> | [link](https://www.amazon.co.jp/サンハヤト-ニューブレッドボード-SAD-101/dp/B00DSKCS68?th=1) | Standard breadboards have 5 holes per row, but this one has 6 — required for the ESP32's width. |
| Jump wires | [link](https://www.amazon.co.jp/ELEGOO-120pcs%E5%A4%9A%E8%89%B2%E3%83%87%E3%83%A5%E3%83%9D%E3%83%B3%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC%E3%80%81arduino%E7%94%A8%E3%83%AF%E3%82%A4%E3%83%A4%E2%80%94%E3%82%B2%E2%80%94%E3%82%B828AWG-%E3%82%AA%E3%82%B9-%E3%83%A1%E3%82%B9-%E3%82%AA%E3%82%B9-%E3%82%AA%E3%82%B9-%E2%80%93%E3%83%A1%E3%82%B9-%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B8%E3%83%A3%E3%83%B3%E3%83%91%E3%83%BC%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%BC/dp/B06Y48V9DL) | \- |
| Battery box (AA ×4, battery-snap compatible) | [link](https://www.amazon.co.jp/dp/B011IJQ4DI?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_3) | Battery snap version is recommended for easier handling. |
| Battery snap (for battery box) | [link](https://www.monotaro.com/p/6866/1105/) | A version with connector pins is recommended — easier to insert into the breadboard and less likely to come loose. |
| Rechargeable AA batteries × 4 | [link](https://www.amazon.co.jp/Amazon%E3%83%99%E3%83%BC%E3%82%B7%E3%83%83%E3%82%AF-AmazonBasics-HR-3UTG-AMZN-%E5%85%85%E9%9B%BB%E5%BC%8F%E3%83%8B%E3%83%83%E3%82%B1%E3%83%AB%E6%B0%B4%E7%B4%A0%E9%9B%BB%E6%B1%A0-%E6%9C%80%E5%B0%8F%E5%AE%B9%E9%87%8F1900mAh%E3%80%81%E7%B4%841000%E5%9B%9E%E4%BD%BF%E7%94%A8%E5%8F%AF%E8%83%BD/dp/B00CWNMV4G/) | Rechargeable batteries are recommended. |
| Battery charger | [link](https://www.amazon.co.jp/%E3%80%90Amazon-co-jp%E9%99%90%E5%AE%9A%E3%80%91%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF-%E6%80%A5%E9%80%9F%E5%85%85%E9%9B%BB%E5%99%A8-%E5%8D%983%E5%BD%A2%E3%83%BB%E5%8D%984%E5%BD%A2-%E9%BB%92-BQ-CC73AM-K/dp/B07FQJJ58Z/) | \- |
| Servo motor driver PCA9685 | [link](https://www.amazon.co.jp/HiLetgo-PCA9685-16%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB-12-%E3%83%93%E3%83%83%E3%83%88-Arduino%E3%81%AB%E5%AF%BE%E5%BF%9C/dp/B01D1D0CX2/) | Compatible alternatives OK, but only needed if implementing Hand / Neck / Robot Arm features. |
| Mini breadboard | [link](https://www.amazon.co.jp/Rasbee-SYB-170-%E3%83%9F%E3%83%8B%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%83%9C%E3%83%BC%E3%83%89-%E3%83%9B%E3%83%AF%E3%82%A4%E3%83%881%E5%80%8B-%E4%B8%A6%E8%A1%8C%E8%BC%B8%E5%85%A5%E5%93%81/dp/B01KRAS4NC/) | Choose one with an adhesive backing. |
| TB6612FNG dual motor driver | [link](https://www.amazon.co.jp/TB6612FNG%E6%90%AD%E8%BC%89-%E3%83%87%E3%83%A5%E3%82%A2%E3%83%AB%E3%83%A2%E3%83%BC%E3%82%BF%E3%83%BC%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90-%E3%83%94%E3%83%B3%E3%83%98%E3%83%83%E3%83%80%E4%BB%98%E3%81%8D-%E5%AE%9F%E8%A3%85%E6%B8%88%E3%81%A7%E3%81%99%E3%81%90%E4%BD%BF%E3%81%88%E3%81%BE%E3%81%99-1-2A%C3%972%E5%87%BA%E5%8A%9B/dp/B09C5MSYCC/) | Compatible alternatives OK (though a version without pre-soldered pin headers will require soldering yourself).<br><br>Only needed if implementing Mobile Robot / Encoder Mobile Robot features. |

## Setting Up smabo-esp32

### Installing Thonny (Flash Tool)

Download and install Thonny for your OS from:

[https://thonny.org/](https://thonny.org/)

<br />

Once installation is complete, launch Thonny.

#### Flashing the Source Code

Connect the ESP32 to your PC via USB, then click the bottom-right button and select 'MicroPython (ESP32)'.

![Thonny — select interpreter](/images/esp32_thonny_select_interpreter.jpg)

<br />

Select all Python files inside 'smabo-esp32', right-click and choose 'Upload to /' to flash them to the ESP32.

![Thonny — upload source](/images/esp32_thonny_upload_source.jpg)

#### Flashing the Config File

Next, flash the config file.

From the config directory, select the JSON file matching your ESP32 model and copy it as 'config.json'.

![Copy config file](/images/esp32_config_copy.jpg)

<br />

Fill in the following fields for your environment:

- `wifi/ssid` — SSID of the network to connect to
- `wifi/password` — password of that network

:::note[WiFi frequency note]
ESP32 only supports 2.4 GHz WiFi.

- SSIDs ending in 'G' (e.g., Buffalo-G-xxxx) are 2.4 GHz
- SSIDs ending in 'A' (e.g., Buffalo-A-xxxx) are 5 GHz

Use the 'G' SSID here.
:::

![Config WiFi and IP settings](/images/esp32_config_wifi_ip.jpg)

<br />

Once you have filled in the settings, flash config.json to the ESP32 the same way you flashed the source code.

![Upload config to ESP32](/images/esp32_config_upload.jpg)

## 3D Printing Parts

Print the newly added parts on your 3D printer.

> Because slicer software varies by printer model, only key points are noted here rather than step-by-step slicer instructions.

Print the following parts oriented as shown in the images.

:::note[Printing tips]
- Orient the convex parts sideways to prevent breakage at the base when attaching/detaching.
- Always enable support material.
:::

- smabo-hardware/stl/base/bread\_board\_stopper\_bottom\_l.stl

    <br />

    ![bread_board_stopper_bottom_l](/images/esp32_print_bread_board_stopper_bottom_l.png)

<br />

- smabo-hardware/stl/base/bread\_board\_stopper\_bottom\_r.stl

    <br />

    ![bread_board_stopper_bottom_r](/images/esp32_print_bread_board_stopper_bottom_r.png)

<br />

- smabo-hardware/stl/base/bread\_board\_stopper.stl

    <br />

    ![bread_board_stopper](/images/esp32_print_bread_board_stopper.png)

<br />

- smabo-hardware/stl/base/mini\_bread\_boad\_stand.stl

    <br />

    ![mini_bread_board_stand](/images/esp32_print_mini_bread_board_stand.png)

<br />

- smabo-hardware/stl/base/pca9685\_stopper\_l.stl

    <br />

    ![pca9685_stopper_l](/images/esp32_print_pca9685_stopper_l.png)

<br />

- smabo-hardware/stl/base/pca9685\_stopper\_r\_bottom.stl

    <br />

    ![pca9685_stopper_r_bottom](/images/esp32_print_pca9685_stopper_r_bottom.png)

<br />

- smabo-hardware/stl/base/pca9685\_stopper\_r\_top.stl

    <br />

    ![pca9685_stopper_r_top](/images/esp32_print_pca9685_stopper_r_top.png)

<br />

- \[Optional\] smabo-hardware/stl/base/in\_base\_plate\_wire\_hole.stl

    <br />

    ![in_base_plate_wire_hole](/images/esp32_print_in_base_plate_wire_hole.png)
    - This part can be used as an internal divider inside smabo.

        <br />

        ![Partition inside base plate](/images/esp32_in_base_plate_partition.jpg)

## About the Breadboard

The SAD101 ships with a jumper wire inserted in the middle of the + rail.

In smabo, the + rail is split into two zones:

- **Right** side of + rail → 6 V (battery box)
- **Left** side of + rail → 5 V (ESP32 output)

![Breadboard power rails](/images/esp32_breadboard_power_rails.png)

<br />

Therefore, remove the factory-installed jumper wire in the center of the + rail.

![Remove jumper wire](/images/esp32_breadboard_remove_jumper.png)

:::note[Inside the breadboard]
Looking at the back of the breadboard, you can see metal strips running along each row.

![Metal strips on the back of the breadboard](/images/esp32_breadboard_back.png)

<br />

<br />

Any holes connected to the same strip are electrically connected, so multiple jump wires inserted in those holes form a circuit.

![Breadboard connections](/images/esp32_breadboard_connection.png)

On the SAD101 in particular, the + rail is split in the middle — left and right are separate. The factory jumper wire was there to bridge them into one continuous rail.

Because we use different voltages on each side, that jumper must be removed.
:::

## Assembly

Assemble the required parts as shown in the video below.

Note: the video also includes parts printed in previous steps.

<p>
  <iframe src="/assembly_movie/base_bread_board.html" title="smabo-esp32 Assembly"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[Assembly tips]
Use the printed parts to mount the breadboard, PCA9685, and mini breadboard. Pay particular attention to the following:

- Insert the ESP32 into the left end of the breadboard.
- Attach the mini breadboard using its adhesive backing.
- Place the battery box inside smabo and route only the jump wires outside, connecting them to the breadboard.
    - Wiring positions are explained in the Wiring section below.

![Assembly key points](/images/esp32_assembly_points.jpg)
:::

## Wiring

:::caution[About the breadboard + rail]
Always remove the + rail jumper wire that came with the SAD101. Leaving it in may <strong class="red">damage the ESP32 and actuators</strong>.

![Remove jumper wire](/images/esp32_breadboard_remove_jumper.png)
:::

<br />

For this step we are not yet driving any actuators, so only the battery wiring is needed as preparation for later steps.

In the table below, "Point A" and "Point B" are directly connected in the circuit.

| Point A | Point B | Notes |
| --- | --- | --- |
| Battery box (+) | Breadboard + rail (<strong class="red">right</strong> side) | Right rail = 6 V; do not mix with 5 V side |
| Battery box (-) | Breadboard - rail | \- |
| ESP32 5 V pin | Breadboard + rail (<strong class="red">left</strong> side) | Left rail = 5 V; do not mix with 6 V side |
| ESP32 GND | Breadboard - rail | \- |

As noted above, the left and right sides of the + rail carry different voltages.

- Mixing 6 V and 5 V on the same rail half will <strong class="red">damage the ESP32 and actuators</strong>.

Please wire carefully.

<br />

Wiring diagram for ESP32-DevKitC:

![Wiring diagram](/fritzing/png/esp32_battery_box.png)

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動,smabo-webの起動,smabo-brain---smabo-webの接続,smabo-brain---esp32の接続,smabo-web---esp32の接続">Follow the startup procedure here</a>.

<br />

Setup is complete once all programs start and communication is confirmed.

## Next

Next, follow the guide for:

- [Hand](/en/guides/hand/)
- [Head Rotation (Neck)](/en/guides/neck/)
- [Mobile Robot](/en/guides/mobile/)
- [Robot Arm](/en/guides/arm/)
- [smabo-brain-ros](/en/guides/brainros/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="hand,neck,mobile,arm,brainros"
       aria-label="smabo build guide roadmap (next: Hand, Neck, Mobile, Arm, smabo-brain-ros highlighted alternately)"></svg>
</div>
