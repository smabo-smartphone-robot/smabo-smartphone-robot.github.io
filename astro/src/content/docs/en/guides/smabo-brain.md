---
title: "smabo-brain"
description: "Set up smabo-brain — the hub that relays all components and runs advanced processing like image recognition and AI."
---

## Roadmap

This page is the guide for the "smabo-brain" node on the roadmap below.

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="brain"
       aria-label="smabo build guide roadmap (smabo-brain highlighted)"></svg>
</div>

## Overview

This page explains the setup procedure for "smabo-brain".

smabo-brain serves as:

- The hub relaying all components
- Running advanced tasks such as image processing and AI

<div class="sys-wrap" style="max-width:760px;margin-inline:auto">
  <svg class="sys-svg" viewBox="0 0 1200 520" role="img"
       data-flows='[{"from":"web","to":"brain","transport":"ws","lines":["Control values"]},{"from":"brain","to":"web","transport":"ws","lines":["Sensor values"]},{"from":"brain","to":"web","transport":"webrtc","lines":["Camera feed"]},{"from":"brain","to":"esp32","transport":"ws","lines":["Control values"]},{"from":"esp32","to":"brain","transport":"ws","lines":["Sensor values"]},{"from":"app","to":"brain","transport":"ws","lines":["Phone sensor values"]},{"from":"app","to":"brain","transport":"webrtc","lines":["Camera feed"]},{"from":"brain","to":"app","transport":"ws","lines":["Control values"]}]' data-active="brain"
       aria-label="smabo system diagram (smabo-brain highlighted)"></svg>
</div>

## Setup Target (PC or SBC)

smabo-brain can be set up on:

- External PC
    - Install smabo-brain on a separate PC (not smabo itself)
- SBC (Single Board Computer)
    - Attach an SBC to smabo and install smabo-brain on it

<br />

<br />

The smabo-brain setup is the same for both. The SBC option additionally requires:

- 3D printing the SBC mounting parts
- Attaching the SBC to smabo

(Note: the 3D printing steps for the SBC mounting parts are covered in [Creating the Base Parts](/en/guides/base/).)

We recommend starting with the External PC option.

:::note[Supported SBCs]
The following SBCs currently have available mounting parts:

- Raspberry Pi (4 or 5)

For other SBCs, you will need to design custom mounting parts using CAD software.
:::

<br />

## Required Parts

Parts required to implement this feature:

| Part | Product URL | Notes |
| --- | --- | --- |
| \[Optional\] Raspberry Pi 4 or 5 | \- | Required only for SBC setup |

## Setting Up smabo-brain

The following explains the setup steps for smabo-brain.

From here, you will need to enter commands using the "terminal".

:::note[Terminal]
A terminal (also called a CLI or command-line interface) is a text-based screen for controlling a computer using only keyboard input.

In software development, the terminal is commonly used to run commands and scripts.
:::

### Installing VSCode

First, set up an environment for using the terminal.

<br />

We will use Visual Studio Code (VSCode), a popular code editor.

<br />

Download and install VSCode from the official site, selecting the installer for your operating system:

[https://code.visualstudio.com](https://code.visualstudio.com)

<br />

Once the download is complete, install and launch VSCode.

### Using the Terminal (Linux / macOS)

The TERMINAL tab at the bottom of the window is the terminal.

![TERMINAL tab at the bottom of VS Code](/images/vscode_terminal.png)

Whenever a command appears in this guide, enter it in this tab.

### Using the Terminal (Windows)

If you are using a Windows PC, please install WSL.

<br />

WSL (Windows Subsystem for Linux) lets you run a Linux environment inside Windows.

- Run a Linux environment on Windows

Linux is widely used in robotics development, so working inside WSL is recommended for future convenience.

#### Installing WSL

For WSL installation instructions, refer to the following article:

[WSL2 のインストールとアンインストール](https://qiita.com/zakoken/items/61141df6aeae9e3f8e36)

#### Enabling Mirrored Mode

By default, WSL2 cannot communicate with external devices on your network.

Since smabo requires communication with the smartphone and ESP32, configure WSL2 in mirrored network mode. Refer to the following article:

[wsl2 mirroredネットワーク、WindowsとLinuxの良いとこどり！](https://qiita.com/shansukey/articles/008669cdf392315a656f)

#### Installing the Extension

After installing WSL, install the following extension in VSCode:

- WSL

![Installing the WSL extension in VS Code](/images/install_wsl.jpg)

#### Entering WSL

After installing the extension:

1. Click the "><" icon in the bottom-left corner
2. Click "Connect to WSL"

![Connecting VS Code to WSL](/images/connect_wsl.jpg)

<br />

If "WSL: Ubuntu" is shown in the bottom-left corner, you are connected. The TERMINAL tab at the bottom of the window is now your terminal.

![VS Code TERMINAL tab connected to WSL](/images/wsl_terminal.png)

Whenever a command appears in this guide, enter it in this terminal.

### Cloning smabo-brain

Clone the smabo-brain repository with the following commands.

```bash
# Move to home directory
cd ~ 
```

```bash
# Clone smabo-brain repository
git clone https://github.com/smabo-smartphone-robot/smabo-brain
```

### Installing Packages

Install the packages required to run the programs.

```bash
cd ~/smabo-brain
```

```bash
pip3 install -r requirements.txt
```

## Operation

### Startup Procedure

<a href="/en/guides/startup/" data-steps="smabo-brainの起動">Follow the startup procedure here</a>.

<br />

If smabo-brain starts without errors, setup is complete.

## Next

Next, follow the guide for:

- [smabo-web](/en/guides/smabo-web/)

<div class="rmap-wrap" style="max-width:520px;margin-inline:auto">
  <svg id="rmap-svg-next" class="rmap-svg" viewBox="220 -28 920 1150" role="img"
       data-guide-dir="/en/guides/" data-design-dir="/architecture/" data-active="web"
       aria-label="smabo build guide roadmap (next: smabo-web highlighted)"></svg>
</div>
