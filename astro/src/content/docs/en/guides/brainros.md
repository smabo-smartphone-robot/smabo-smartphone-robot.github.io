---
title: "brain-ros (Setup & Overview)"
description: "Required setup: smabo-app + smabo-esp32 + smabo-brain-ros"
---

## Roadmap

This page is the guide for the 'smabo-brain-ros' node on the roadmap below.

This guide assumes you have completed the [smabo-brain](/en/guides/smabo-brain/) guide.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="brainros"
       aria-label="smabo build guide roadmap (brain-ros highlighted)"></svg>
</div>

## Overview

This page explains how to set up smabo-brain-ros.

In smabo, smabo-brain-ros is responsible for:

- Handling smabo's sensor values and control values as ROS 2 messages

Using ROS 2 lets you use the libraries (such as Nav2 and MoveIt2) needed for "Navigation" and "Motion Planning" in the later guides.

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["Control values"]},{"from":"brain","to":"web","transport":"ws","lines":["Sensor values"]},{"from":"brain","to":"web","transport":"webrtc","lines":["Camera feed"]},{"from":"brain","to":"esp32","transport":"ws","lines":["Control values"]},{"from":"esp32","to":"brain","transport":"ws","lines":["Sensor values"]},{"from":"app","to":"brain","transport":"ws","lines":["Phone sensor values"]},{"from":"app","to":"brain","transport":"webrtc","lines":["Camera feed"]},{"from":"brain","to":"app","transport":"ws","lines":["Control values"]}]' data-active="brain"
       data-variant="brainros"
       aria-label="smabo system diagram (smabo-brain-ros runs at smabo-brain's position and converts WebSocket / WebRTC into ROS 2 topics inside)"></svg>
</div>

Comparing smabo-brain and smabo-brain-ros gives the diagram below.

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 540" role="img" data-variant="brainros-detail"
       aria-label="smabo-brain and smabo-brain-ros side by side (the same calculation in both; smabo-brain talks WebSocket / WebRTC directly, smabo-brain-ros converts them into ROS 2 topics first and exchanges them with its ROS 2 nodes and Nav2 / MoveIt2)"></svg>
</div>

## Required Parts

No parts are needed.

## 3D Printing Parts

No new parts are added this time.

## Assembly

There is no assembly this time.

## Wiring

There is no wiring this time.

## Finished Result

The finished robot does not change this time.

## Setting Up the Environment

The steps to set up the smabo-brain-ros environment are shown below.

### Installing Docker

smabo-brain-ros runs in Docker, so install Docker on your PC/SBC.

- Windows
  - Install [Docker Engine (ubuntu)](https://docs.docker.com/engine/install/ubuntu/) in WSL.
  - Once installed, make Docker usable without sudo.
    - [Reference: running Docker commands without sudo (Japanese)](https://qiita.com/DQNEO/items/da5df074c48b012152ee)
- Mac
  - Install [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/).
- Linux (Ubuntu, Raspberry Pi, etc.)
  - Install [Docker Engine](https://docs.docker.com/engine/install/).
    - The installation steps differ depending on your Linux distribution.
  - Once installed, make Docker usable without sudo.
    - [Reference: running Docker commands without sudo (Japanese)](https://qiita.com/DQNEO/items/da5df074c48b012152ee)

<br />

### Cloning smabo-brain-ros

Clone the smabo-brain-ros repository with the commands below.

<br>

smabo-brain-ros loads the smabo-brain programs when it runs, so clone it into "the same directory as smabo-brain (your home directory in the example below)".

```bash
# Move to your home directory
cd ~
```

```bash
# Clone the smabo-brain-ros repository
git clone https://github.com/smabo-smartphone-robot/smabo-brain-ros
```

<br>

Check that both repositories are in the same directory, like this.

```
~/
├── smabo-brain
└── smabo-brain-ros
```

### Building the Docker Image

Build the Docker image with the commands below.  
Note: the first build takes a while (tens of minutes).

```bash
cd ~/smabo-brain-ros
```

```bash
docker compose build
```

<br>

You're done once it finishes without errors.

<br>

:::note[When you update the program]
After updating smabo-brain-ros, run `docker compose build` again.
:::

## Operation

Check that everything works with the steps below.

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brain-rosの起動,smabo-webの起動,smabo-brain-ros---smabo-webの接続">Follow the startup procedure here</a>.

<br />

Setup is complete once all programs start and communication is confirmed.

## Next

Next, the following nodes on the roadmap are explained:

- [Navigation](/en/guides/nav/)
- [Motion Planning](/en/guides/plan/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="nav,plan"
       aria-label="smabo build guide roadmap (Navigation and Motion Planning highlighted)"></svg>
</div>
