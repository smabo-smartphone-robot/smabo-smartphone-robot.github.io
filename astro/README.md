# smabo サイト（Astro Starlight）

smabo の製作ガイドと設計書のサイトです。[Astro Starlight](https://starlight.astro.build) で作っています。

## 原稿の場所

| 内容 | ファイル | URL |
| --- | --- | --- |
| 日本語ガイド | `src/content/docs/guides/<id>.md` | `/guides/<id>/` |
| 英語ガイド | `src/content/docs/en/guides/<id>.md` | `/en/guides/<id>/` |
| トップページ | `src/content/docs/index.md`、`src/content/docs/en/index.md` | `/`、`/en/` |
| 設計書 | `src/content/docs/architecture/design.md` | `/architecture/design/` |
| 下書き（公開されません） | `drafts/`（準備中ガイド、`system.md`） | ― |
| 組み立て動画ページのひな形 | `templates/assembly-viewer-template.html` | ― |

- ガイド一覧（サイドバー）の並びとグループは `astro.config.mjs` の `sidebar` で設定します（ロードマップと同じ順）。
- 画像・動画・配線図・組み立て動画は `public/` の `images/`、`video/`、`fritzing/`、`assembly_movie/` に置きます。
- ロードマップ図・構成図の描画、起動手順ポップアップ、Mermaid の描画は `public/js/` のスクリプトが行います。

## md の書き方

- 見出しは `##` から始めます（ページタイトルが `#` の代わり）。タイトルと説明文は先頭の `title` / `description` に書きます。
- タイトル付きの注記は `:::note[タイトル]` 〜 `:::`。特に目立たせる注記は `:::caution[タイトル]`。タイトルなしの注記は `>` の引用で書きます。
- 赤字の太字は `<strong class="red">…</strong>`。
- 起動手順のポップアップは `<a href="/guides/startup/" data-steps="smabo-brainの起動,…">こちらの起動手順</a>`（`data-steps` は起動手順ページの見出し id）。
- ロードマップ図は `<div class="rmap-wrap">…<svg class="rmap-svg" data-active="<ノードid>" …></svg></div>`、構成図は `<div class="sys-wrap">…<svg class="sys-svg" data-flows='[…]' data-active="…"></svg></div>`（書き方は既存のガイドを参照）。
- 組み立て動画は `<iframe src="/assembly_movie/<名前>.html" …>` で埋め込みます。
- Mermaid の図は `<pre class="mermaid">…</pre>` で書きます（`<`、`>`、`&` は `&lt;` などにします）。
- 画像・動画は `/images/…`、`/video/…` のように `/` から書きます。

## ローカルでプレビューしながら編集する

1. 初回だけ、`astro/` で依存パッケージをインストールします。

   ```bash
   cd astro
   npm install
   ```

2. 開発サーバーを起動します。

   ```bash
   npm run dev
   ```

3. ブラウザで <http://localhost:4321/> を開きます（日本語ガイドは `/guides/<id>/`、英語は `/en/guides/<id>/`）。
4. `src/content/docs/` の md を編集して保存すると、ブラウザの表示が自動で更新されます。
   - `astro.config.mjs`（サイドバーなど）を保存すると、サーバーが自動で再起動します。
   - `public/` のファイル（`js/`、画像など）を変えたときは、ブラウザを再読み込みしてください。
5. 終わったら、ターミナルで `Ctrl + C` を押してサーバーを止めます。
   - 起動時に「すでに開発サーバーが動いている」と表示されたときは、`npx astro dev stop` で前のサーバーを止めてから起動し直してください。

サイト内検索は開発サーバーでは動きません。検索も含めて公開時と同じ状態で確かめるときは、ビルドしてから確認用サーバーで開きます。

```bash
npm run build
npm run preview
```

## コマンド（`astro/` で実行）

| コマンド | 内容 |
| --- | --- |
| `npm install` | 依存パッケージのインストール |
| `npm run dev` | 開発サーバー（`localhost:4321`） |
| `npm run build` | `dist/` に静的サイトを出力 |
| `npm run preview` | ビルド結果の確認 |

`npm run build` では、サイト内リンク（`[…](/guides/…/)`、`<a href="…">`、見出しへの `#…`）の切れも調べます（[starlight-links-validator](https://github.com/HiDeoo/starlight-links-validator)）。切れたリンクがあるとファイル名と行番号が表示され、ビルドが止まります。開発サーバー（`npm run dev`）では調べません。

## アクセス解析などの外部スクリプト（Partytown）

[Partytown](https://docs.astro.build/ja/guides/integrations-guide/partytown/) を入れてあります。`type="text/partytown"` を付けたスクリプトは、ページの表示とは別のスレッド（Web Worker）で動くので、ページが重くなりません。今は該当するスクリプトはありません。

Google Analytics を入れるときは、`astro.config.mjs` の `head` に次の2つを足します（`G-XXXXXXXXXX` は自分の測定 ID）。

```js
{ tag: 'script', attrs: { type: 'text/partytown', src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX' } },
{ tag: 'script', attrs: { type: 'text/partytown' }, content: "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');" },
```

## 公開

`main` に push すると GitHub Actions がビルドして GitHub Pages に公開します（リポジトリ直下の `.github/workflows/deploy.yml`）。
