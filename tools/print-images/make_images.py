"""Render the guides' print images (astro/public/images/*_print_*) from the STEP files.

    python make_images.py                 # every image in orientations.json
    python make_images.py arm_ neck_      # only images whose name contains one of these

orientations.json maps each image name to its STEP file (relative to
smabo-hardware/step/) and the rotation R that puts the part in its print
orientation. The image keeps its name and extension, so the guides need no change.

Options (environment variables):
    SMABO_HARDWARE  path to the smabo-hardware repo (default: ../../../smabo-hardware)
    OUT_DIR         where to write (default: ../../astro/public/images)
"""
import json
import os
import sys

from render import render

HERE = os.path.dirname(os.path.abspath(__file__))
HW = os.environ.get("SMABO_HARDWARE", os.path.join(HERE, "..", "..", "..", "smabo-hardware"))
OUT = os.environ.get("OUT_DIR", os.path.join(HERE, "..", "..", "astro", "public", "images"))


def main():
    only = sys.argv[1:]
    table = json.load(open(os.path.join(HERE, "orientations.json")))
    for name, v in table.items():
        if only and not any(o in name for o in only):
            continue
        step = os.path.join(HW, "step", v["step"])
        if not os.path.exists(step):
            print("missing STEP:", step, file=sys.stderr)
            continue
        render(step, os.path.join(OUT, name), v["R"])


if __name__ == "__main__":
    main()
