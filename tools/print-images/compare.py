"""Show orientation candidates next to the reference picture, to pick R by eye.

    python compare.py top  candidates.json reference_dir out.jpg name1[,name2...]
        one row per image: reference, then the 5 best rotations from search.py (#0..#4)
    python compare.py all  part.step reference.png out.jpg
        the reference, then all 24 rotations (r0..r23, same order as search.rotations())

Each tile is cropped around the green part, so small parts are readable.
Write the chosen R into orientations.json, then run make_images.py.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from render import render
from search import rotations

TMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".compare_tmp.png")


def crop(im):
    a = np.asarray(im).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (g > 90) & (g > r + 40) & (g > b + 40)
    m = np.array(Image.fromarray(m.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(5))) > 0
    ys, xs = np.nonzero(m)
    if len(xs) < 30:
        return im
    x0, x1 = np.percentile(xs, [1, 99])
    y0, y1 = np.percentile(ys, [1, 99])
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    h = max(x1 - x0, (y1 - y0) * 1.5) * 0.65 + 10
    return im.crop((int(cx - h), int(cy - h / 1.5), int(cx + h), int(cy + h / 1.5)))


def tile(step, R, label):
    render(step, TMP, R, size=(1500, 1000))
    im = crop(Image.open(TMP).convert("RGB")).resize((300, 200))
    ImageDraw.Draw(im).text((6, 6), label, fill="yellow")
    return im


def sheet(rows, cols, out):
    W = Image.new("RGB", (300 * cols, 200 * len(rows)), "white")
    for y, row in enumerate(rows):
        for x, im in enumerate(row):
            W.paste(im.resize((300, 200)), (300 * x, 200 * y))
    W.save(out, quality=88)
    if os.path.exists(TMP):
        os.remove(TMP)


def main():
    mode = sys.argv[1]
    if mode == "top":
        cands = json.load(open(sys.argv[2]))
        ref_dir, out, names = sys.argv[3], sys.argv[4], sys.argv[5].split(",")
        rows = []
        for n in names:
            v = cands[n]
            row = [crop(Image.open(os.path.join(ref_dir, n)).convert("RGB"))]
            row += [tile(v["step"], R, f"#{i} {sc}") for i, (sc, R) in enumerate(v["cands"][:5])]
            rows.append(row)
        sheet(rows, 6, out)
    elif mode == "all":
        step, ref, out = sys.argv[2], sys.argv[3], sys.argv[4]
        tiles = [crop(Image.open(ref).convert("RGB"))]
        tiles += [tile(step, R.tolist(), f"r{i}") for i, R in enumerate(rotations())]
        sheet([tiles[i:i + 5] for i in range(0, len(tiles), 5)], 5, out)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
