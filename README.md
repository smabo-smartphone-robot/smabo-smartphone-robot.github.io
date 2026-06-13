# smabo-smartphone-robot.github.io

smabo プロジェクトの公式サイト（GitHub Pages）。

公開URL: <https://smabo-smartphone-robot.github.io/>

ビルド不要の静的サイト（プレーンな HTML / CSS / JS、外部ライブラリ依存なし）です。

## ファイル構成

```
.
├── index.html            # トップページ（特徴・システム構成・できること・リポジトリ）
├── components.html       # コンポーネント詳細（app / esp32 / brain）
├── roadmap.html          # ロードマップ
├── css/
│   ├── style.css         # サイト共通スタイル
│   ├── roadmap.css       # ロードマップ用
│   └── docs.css          # ドキュメント本文用（Markdown→HTML 表示）
├── js/
│   ├── main.js           # ナビ開閉・フッター年号
│   ├── roadmap.js        # ロードマップ用
│   └── docs.js           # ドキュメント用（Mermaid 描画・TOCスクロール追従）
├── assets/
│   ├── favicon.svg       # ファビコン
│   └── robot.svg         # ヒーローのロボットイラスト
├── docs/                 # ドキュメント（Markdown 正本 ＋ 生成 HTML を併置）
│   ├── index.md / index.html       # ドキュメントのトップ
│   ├── architecture/
│   │   └── design.md / design.html # 設計書（ESP32 ファームウェア設計）
│   ├── guides/                     # 製作ガイド（*.html）
│   └── images/                     # 図・スクショ
└── .nojekyll             # Jekyll 処理を無効化
```

## ドキュメント（Markdown ↔ HTML）

`docs/` 配下は **Markdown 版（正本）と HTML 版（公開用）を同じ場所・同じ名前で併置**します
（例: `architecture/design.md` ↔ `architecture/design.html`）。

- **Markdown** が編集の正本。記事を書く／直すときは `.md` を編集します。
- **HTML** は `.md` を元に生成します（サイト共通の `css/style.css` ＋ `css/docs.css` を適用、
  本文は `<article class="doc-content">` に流し込み、見出しからサイドバー目次を生成）。
- ` ```mermaid ` ブロックは `<pre class="mermaid">` として出力し、`js/docs.js` が
  Mermaid を CDN から読み込んで描画します（図を含むページのみ読み込み）。
- 変換はビルド工程を持たず、`.md` の内容を元に都度 HTML を作成します。`.md` を更新したら
  対応する `.html` を作り直してください。

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
