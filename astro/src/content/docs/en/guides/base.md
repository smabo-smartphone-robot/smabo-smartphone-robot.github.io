---
title: "Base Parts"
description: "Customize and 3D-print the base parts to fit your smartphone, then assemble smabo's body."
---

## Roadmap

This page is the guide for the 'Base Parts' node on the roadmap below.

This guide assumes you have completed the [smabo-app](/en/guides/smabo-app/) setup.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="baseparts"
       aria-label="smabo build guide roadmap (Base Parts highlighted)"></svg>
</div>

## Overview

This page explains how to create the base parts.

<br />

Specifically, you will:

- Modify the 3D model to fit your smartphone

    ![Adjusting inner extrude](/images/base_long_inner_extrude.jpg)

- Print base parts with a 3D printer

    ![Printed base](/images/base_print_base.jpg)

## Required Parts

The following parts are required to implement this feature.

| Part | Product URL | Notes |
| --- | --- | --- |
| Smartphone | \- | Your own smartphone |

## Downloading the smabo-hardware Repository

First, download the smabo-hardware repository, which contains:

- STL and STEP files for 3D parts used in smabo

[https://github.com/smabo-smartphone-robot/smabo-hardware](https://github.com/smabo-smartphone-robot/smabo-hardware)

> The smabo-hardware repository contains all parts. Download it to a convenient location — you'll use it throughout the build.

## Adjusting Smartphone Mounting Parts

smabo can hold your smartphone, but phone sizes vary from person to person. This section explains how to adjust the mounting parts to fit your phone.

### Measuring Your Smartphone

First, measure your smartphone's:

- Long side
- Short side
- Thickness (measure the thickest point if the camera protrudes)

Measure in millimeters. If you use a case, measure with the case on.

:::note[Caliper]
You can check the manufacturer's spec sheet, use a ruler, or — recommended — use a caliper.<br />
A caliper is a precision measuring tool that gives more accurate readings than a ruler. It is commonly used in robot building. If you don't have one, consider purchasing one.
:::

### Adjusting Part Dimensions

Next, follow these steps to resize each part to match your phone.

:::note[CAD software]
Any CAD software works. Fusion 360 steps are shown as an example in the notes below.
:::

#### Left/Right Mounting Parts

Import "smabo-hardware/step/smart\_phone/smartphone\_long\_width\_75\_height\_11.step" and adjust so the distance from part tip to inner face equals:

- (phone long side / 2) + 1 mm

:::note[Fusion 360 step-by-step]
Click "Upload" in the left panel.<br />
![Fusion upload](/images/base_fusion_upload.jpg)

Click "Select Files".<br />
![Fusion select files](/images/base_fusion_select_files.jpg)

Select "smartphone\_long\_width\_75\_height\_11.step".<br />
![Fusion select long step](/images/base_fusion_select_long_step.jpg)

After the import completes, open smartphone\_long\_width\_75\_height\_11.

Select the outer face and click "Extrude".<br />
![Long outer extrude](/images/base_long_outer_extrude.jpg)

Set the length to (phone long side / 2) + 3 + 1.<br />
![Long outer length](/images/base_long_outer_length.jpg)

Select the inner face and click "Extrude".<br />
![Long inner extrude](/images/base_long_inner_extrude.jpg)

Set the length to (phone long side / 2) + 1.<br />
![Long inner length](/images/base_long_inner_length.jpg)
:::

<br />

Also adjust the distance from the top to the bottom face of the clamp section to:

- phone thickness + 1 mm

:::note[Fusion 360 step-by-step]
Select the top face and click "Extrude".<br />
![Long top extrude](/images/base_long_top_extrude.jpg)

Set the length to phone thickness + 1 + 3.<br />
![Long top length](/images/base_long_top_length.jpg)

Select the bottom face and click "Extrude".<br />
![Long bottom extrude](/images/base_long_bottom_extrude.jpg)

Set the length to phone thickness + 1.<br />
![Long bottom length](/images/base_long_bottom_length.jpg)
:::

#### Top/Bottom Mounting Parts

Import "smabo-hardware/step/smart\_phone/smartphone\_short\_width\_37\_height\_11.step" and adjust so the distance from part tip to inner face equals:

- (phone short side / 2) + 1 mm

:::note[Fusion 360 step-by-step]
Follow the same steps as for the Left/Right Mounting Parts, using the phone's short side as the reference dimension.
:::

<br />

Also adjust the clamp height:

- phone thickness + 1 mm

:::note[Fusion 360 step-by-step]
Follow the same steps as for the Left/Right Mounting Parts.
:::

### Exporting the Parts

Once you have finished resizing, export the parts as STL files.

:::note[Fusion 360 step-by-step]
From the top menu, choose File → Export.<br />
![Fusion export menu](/images/base_fusion_export_menu.jpg)

Set the following options and click "Export" to save the file:

- Name: any name you like
- Type: STL
- Location: any folder you like

![Fusion export settings](/images/base_fusion_export_settings.jpg)
:::

## 3D Printing Parts

Print the newly added parts on your 3D printer.

> Because slicer software varies by printer model, only key points are noted here rather than step-by-step slicer instructions.

<br />

<br />

Print the following parts oriented as shown in the images.

:::note[Printing tips]
- Orient convex protrusions sideways to prevent fractures at the base when attaching/detaching.
- Always enable support material.
:::

### Common

- smabo-hardware/stl/base/base.stl

    <br />

    ![base.stl](/images/base_print_base.jpg)

<br />

- smabo-hardware/stl/base/cover\_back\_bread\_board.stl

    <br />

    ![cover_back_bread_board.stl](/images/base_print_cover_back_bread_board.jpg)

<br />

- smabo-hardware/stl/smart\_phone/cover\_smartphone\_base.stl

    <br />

    ![cover_smartphone_base.stl](/images/base_print_cover_smartphone_base.jpg)

<br />

- smabo-hardware/stl/smart\_phone/smartphone\_long\_width\_75\_height\_11.stl (adjusted from original size for your phone) × 2
    - Print 2 copies — same part used on the left and right.

        <br />

        ![smartphone_long part](/images/base_print_smartphone_long.jpg)

<br />

- smabo-hardware/stl/smart\_phone/smartphone\_short\_width\_37\_height\_11.stl (adjusted from original size for your phone) × 2
    - Print 2 copies — same part used on the top and bottom.

        <br />

        ![smartphone_short part](/images/base_print_smartphone_short.jpg)

### If smabo-brain Is Set Up on an SBC

#### For Raspberry Pi (4 or 5)

- smabo-hardware/stl/raspi/raspi\_stand.stl

    <br />

    ![3D-printed Raspberry Pi stand (raspi_stand)](/images/raspi_print_stand.jpg)

<br />

- smabo-hardware/stl/raspi/raspi\_stopper1.stl

    <br />

    ![3D-printed Raspberry Pi stopper (raspi_stopper1)](/images/raspi_print_stopper1.jpg)

<br />

- smabo-hardware/stl/raspi/raspi\_stopper2.stl

    <br />

    ![3D-printed Raspberry Pi stopper (raspi_stopper2)](/images/raspi_print_stopper2.jpg)

## Assembly

Assemble the required parts as shown in the video below.

Note: the video also includes parts printed in previous steps.

### Common

<p>
  <iframe src="/assembly_movie/base.html" title="Base Parts Assembly"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[Assembly tip]
If you plan to remove your phone frequently, you can leave only the bottom part installed and slide the phone in and out from the top. Note that if the robot is inverted the phone will fall out in this configuration.
:::

### If smabo-brain Is Set Up on an SBC

#### For Raspberry Pi (4 or 5)

<p>
  <iframe src="/assembly_movie/smabo_raspi.html" title="Raspberry Pi mounting parts assembly"
          loading="lazy" allowfullscreen
          style="width:100%; height:520px; max-height:80vh; border:1px solid var(--line); border-radius:var(--radius-sm); background:#0a0e16;"></iframe>
</p>

:::note[Assembly tip]
Fix the Raspberry Pi to raspi\_stand using the parts shown below.<br />
![Raspberry Pi mounted on raspi_stand](/images/assemble_raspi_stand.jpg)
:::

### Attaching Your Smartphone

Verify that your smartphone fits securely.

## Finished Result

The completed base looks like this:<br />
![Completed base](/images/base_complete.jpg)

## Next

Next, follow the guide for:

- [smabo-esp32](/en/guides/smabo-esp32/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="esp32"
       aria-label="smabo build guide roadmap (next: smabo-esp32 highlighted)"></svg>
</div>
