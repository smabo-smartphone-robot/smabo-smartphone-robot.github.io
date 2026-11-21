---
title: "Startup Procedure"
description: "Startup and connection procedures for each component (smabo-brain / smabo-web / smabo-app / esp32). Referenced from \"Operation\" sections in individual guides."
---

**All devices (smartphone, PC, SBC, ESP32) must be connected to the **same network** before proceeding.**

## Launch smabo-brain

First, launch smabo-brain from your PC or SBC.

```bash
cd ~/smabo-brain
```

```bash
python3 -m brain
```

## Launch smabo-web

Next, launch smabo-web from your PC.

```bash
cd ~/smabo-web
```

```bash
npm run dev
```

Then open your browser and access `http://localhost:5173`.

## smabo-brain <-> smabo-web Connection

When smabo-web loads, "Brain connected" should appear in the bottom-right corner.

![Brain connected shown at the bottom right of smabo-web](/images/web_brain_connected.png)

## Connect smabo-app

Launch smabo-app and wait a moment. When "Brain connected" appears, the connection is established.

![Brain connected shown in smabo-app](/images/app_brain_connected.png)

## smabo-brain <-> ESP32 Connection

Click the "Ping" button to the right of "WS (brain <-> ESP32)". If "OK" is displayed, the connection is successful.

![WebSocket ping from smabo-web to the ESP32 returning OK](/images/esp32_web_ws_ping.png)

:::note[If the connection fails]
If the ping test fails, check the WiFi settings in `config.json`. If there is an error, correct it and re-flash the firmware to the ESP32.
:::

## smabo-web <-> ESP32 Connection

In the "Config" tab, click the "Ping" button to the right of "REST (web <-> ESP32)". If "OK" is displayed, the connection is successful.

![REST ping from smabo-web to the ESP32 returning OK](/images/esp32_web_rest_ping.png)
