---
title: "起動手順"
description: "各コンポーネント（smabo-brain / smabo-web / smabo-app / esp32）の起動・接続手順をまとめた共通ページです。各ガイドの「動作手順」から参照されます。"
---

**スマホ、PC、SBC、ESP32は全て「同一ネットワーク」に接続した状態で、以下手順を実行してください。**

## smabo-brainの起動

最初に、PC/SBCからsmabo-brainを起動します。

```bash
cd ~/smabo-brain
```

```bash
python3 -m brain
```

## smabo-webの起動

次に、PCからsmabo-webを起動します。

```bash
cd ~/smabo-web
```
```bash
npm run dev
```

この状態で、ブラウザから`http://localhost:5173`にアクセスしてください。

## smabo-brain <-> smabo-webの接続

smabo-webアクセス時に、右下に「Brain connected」と表示されればOKです。

![smabo-web右下の「Brain connected」表示](/images/web_brain_connected.png)

## smabo-appの接続

smabo-appを起動し、しばらくして「Brain connected」と表示されればOKです。

![smabo-appの「Brain connected」表示](/images/app_brain_connected.png)

## smabo-brain <-> esp32の接続

smabo-webの「Config」パネルにて、「WS (brain <-> ESP32)」の右側にある「Ping」ボタンをクリックし、OKと表示されれば良いです。

![smabo-webからESP32へのWebSocket疎通確認（OK表示）](/images/esp32_web_ws_ping.png)

:::note[接続できなかった場合]
上記手順で通信の疎通が失敗した場合は、`config.json`のWiFiの設定を確認してください。もし、間違っている箇所があった場合、修正した後esp32に再書き込みしてください。
:::

## smabo-web <-> esp32の接続

「Config」パネルの「REST(web <-> ESP32)」の右の「Ping」ボタンをクリックし、OKと表示されれば良いです。

![smabo-webからESP32へのREST疎通確認（OK表示）](/images/esp32_web_rest_ping.png)
