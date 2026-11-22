# ガイドの印刷パーツ画像の作り方

各ガイドの「パーツの印刷」に載せている画像（`astro/public/images/*_print_*`）は、
smabo-hardware の **STEP ファイル**から、このフォルダのスクリプトで描いています。
ガイドの文章に書くファイル名は `.stl` のままです。

- 描き方：STEP を細かくポリゴン化し、面の境界線（B-rep のエッジ）を細い線で重ねて、
  220 mm の造形ベッドの上に置いた形で描きます（VTK のオフスクリーン描画）。
- 向き：各部品を印刷するときの置き方を、`orientations.json` に回転行列 `R` で持っています。
  STEP の座標に `R` をかけると、ベッドが XY 平面、上が +Z になります。
  向きは、以前のスライサーのスクリーンショットに合わせています（凸部は横向き、サポート材はできるだけ少なく）。

## ファイル

| ファイル | 役割 |
| --- | --- |
| `orientations.json` | 画像名 → STEP ファイル（`smabo-hardware/step/` からの相対パス）と回転 `R` |
| `make_images.py` | `orientations.json` のとおりに画像を描き、`astro/public/images/` を上書き |
| `render.py` | 1 部品を描く本体（カメラ・色・ベッド） |
| `search.py` | 新しい部品の向きの候補を、参考画像のシルエットと比べて順位付け |
| `compare.py` | 候補を参考画像と並べた一覧画像を作り、目で選ぶ |

## 準備（初回のみ）

何も入っていない環境から始める場合の手順です。macOS（Apple Silicon）で、まっさらな clone と新しい venv から
全画像が今の画像と同じに描けることを確認しています。

1. Python 3.11 と git を入れる（どちらかの方法で）。
   ```bash
   brew install python@3.11 git        # Homebrew の場合
   ```
   Homebrew を使わない場合は、python.org のインストーラーで 3.11 を入れても構いません。
   `requirements.txt` の版は Python 3.11 で確認しています。
2. 2 つのリポジトリを**同じフォルダに並べて** clone する。
   ```bash
   mkdir -p ~/smabo-repos && cd ~/smabo-repos
   git clone https://github.com/smabo-smartphone-robot/smabo-smartphone-robot.github.io.git
   git clone https://github.com/smabo-smartphone-robot/smabo-hardware.git
   ```
   `make_images.py` は、`tools/print-images` から 3 つ上のフォルダにある `smabo-hardware` を読みます。
   別の場所に置いた場合は、実行するときに `SMABO_HARDWARE=/path/to/smabo-hardware` を付けます。
3. ライブラリを入れる（このフォルダの中に `.venv` を作ります。git には入りません）。
   ```bash
   cd ~/smabo-repos/smabo-smartphone-robot.github.io/tools/print-images
   python3.11 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```
   `cadquery-ocp`（STEP の読み込み）と `vtk`（描画）は大きいので、少し時間がかかります。
4. 動作確認：描き直して、`git status` で画像が変わっていなければ準備完了です
   （STEP も向きも変えていなければ、同じ画像になります）。
   ```bash
   .venv/bin/python make_images.py
   git -C ../.. status --short astro/public/images
   ```

画面のない Linux サーバーで動かす場合は、VTK のオフスクリーン描画のために
`xvfb-run .venv/bin/python make_images.py` のように仮想ディスプレイが必要になることがあります（未確認）。

## 画像を描き直す

```bash
.venv/bin/python make_images.py            # 全部
.venv/bin/python make_images.py arm_ neck_ # 名前の一部で絞る
```

STEP を更新したときも、これを実行すれば同じ向き・同じ見た目で描き直せます。

## 部品を追加する・向きを変える

1. ガイドに `- smabo-hardware/stl/…/部品名.stl` と画像 `![…](/images/ガイド名_print_部品名.png)` を書く。
2. 向きを決める。
   - 参考画像（スライサーのスクリーンショットなど）がある場合：
     ```bash
     # parts.json: {"ガイド名_print_部品名.png": {"step": "/abs/path/部品名.step"}}
     .venv/bin/python search.py parts.json 参考画像のフォルダ candidates.json
     .venv/bin/python compare.py top candidates.json 参考画像のフォルダ top.jpg ガイド名_print_部品名.png
     ```
     `top.jpg` の左端が参考画像、右に候補 #0〜#4 が並びます。
     板のように裏表でシルエットが同じ部品は順位が当てにならないので、必ず目で選びます。
   - 候補に合うものがない場合は、24 通りすべてを並べて選びます。
     ```bash
     .venv/bin/python compare.py all /abs/path/部品名.step 参考画像.png all.jpg
     ```
     `r0`〜`r23` の番号は `search.rotations()` の順番です。
3. 選んだ回転を `orientations.json` に追加します（`"R"` は 3×3 の整数行列）。
   ```python
   from search import rotations
   rotations()[17].astype(int).tolist()  # compare.py all の r17
   ```
4. `make_images.py 部品名` で描いて、ガイドで確認します。

印刷の向きの決まり（ガイドの「印刷の際の注意点」と同じ）：
- パーツのつけ外しで根本から折れないよう、凸部は横向きにする
- サポート材が少なくなる置き方を選ぶ
