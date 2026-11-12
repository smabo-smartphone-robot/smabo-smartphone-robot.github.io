# smabo-smartphone-robot.github.io

smabo プロジェクトの公式サイト（GitHub Pages）。

公開URL: <https://smabo-smartphone-robot.github.io/>

サイトは [Astro Starlight](https://starlight.astro.build) で作っています。原稿・設定・画像はすべて [astro/](astro/) にあります（書き方とコマンドは [astro/README.md](astro/README.md)）。

```
.
├── astro/                     # サイト本体（Astro Starlight）
│   ├── src/content/docs/      # 原稿（日本語・英語のガイド、トップページ、設計書）
│   ├── public/                # 画像・動画・配線図・組み立て動画・サイト用スクリプト
│   ├── drafts/                # 公開しない下書き
│   └── templates/             # 組み立て動画ページのひな形
├── slide/                     # 発表資料（サイトには含まれません）
└── .github/workflows/         # GitHub Pages への自動公開
```

## 公開（デプロイ）

`main` ブランチへ push すると、GitHub Actions（[deploy.yml](.github/workflows/deploy.yml)）が `astro/` をビルドして GitHub Pages に公開します。
Settings → Pages → Build and deployment の Source を「GitHub Actions」にしておく必要があります。
