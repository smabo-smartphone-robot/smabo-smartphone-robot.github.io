# smabo-smartphone-robot.github.io

smabo プロジェクトの公式サイト（GitHub Pages）。

公開URL: <https://smabo-smartphone-robot.github.io/>

ビルド不要の静的サイト（プレーンな HTML / CSS / JS、外部ライブラリ依存なし）です。

## ファイル構成

```
.
├── index.html         # トップページ（特徴・システム構成・できること・リポジトリ）
├── components.html    # コンポーネント詳細（app / esp32 / brain）
├── css/
│   └── style.css      # サイト共通スタイル
├── js/
│   └── main.js        # ナビ開閉・フッター年号
├── assets/
│   ├── favicon.svg    # ファビコン
│   └── robot.svg      # ヒーローのロボットイラスト
├── DESIGN.md          # ESP32 ファームウェア設計ドキュメント（参考資料）
└── .nojekyll          # Jekyll 処理を無効化
```

## ローカルでの確認

```bash
# リポジトリ直下で簡易サーバを起動
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

## 公開（デプロイ）

`main` ブランチへ push すると GitHub Pages が自動で公開します
（Settings → Pages で Source を `main` / `/ (root)` に設定）。

## 編集メモ

- ヘッダーとフッターは各 HTML に直接記述しています（テンプレートエンジンなし）。
  ナビ項目を変更する場合は `index.html` と `components.html` の両方を更新してください。
- コンテンツは各リポジトリの README をもとにしています。仕様を変えたら本サイトも追従させてください。
