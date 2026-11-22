"""Suggest print orientations for a new part from a reference picture.

For each image, try the 24 axis-aligned rotations of its STEP part and rank them by
how well the part's silhouette (seen from render.py's camera) matches the green
part in a reference picture (e.g. a slicer screenshot). The ranking only narrows
the choice: a flat plate looks the same from the front and the back, so always
check the top candidates with compare.py before writing R into orientations.json.

    python search.py parts.json reference_dir candidates.json [name_substring]

parts.json: {"image_name.png": {"step": "/abs/path/part.step"}, ...}
reference_dir: holds a reference picture with the same name as each image.
candidates.json gets, per image, the 8 best rotations as [[score, R], ...].
"""
import itertools
import json
import os
import sys

import numpy as np
import vtk
from PIL import Image, ImageFilter
from vtk.util.numpy_support import vtk_to_numpy

from render import polydata, step_mesh

N = 96


def rotations():
    out = []
    for perm in itertools.permutations(range(3)):
        for signs in itertools.product((1, -1), repeat=3):
            R = np.zeros((3, 3))
            for i, (p, s) in enumerate(zip(perm, signs)):
                R[i, p] = s
            if np.linalg.det(R) > 0:
                out.append(R)
    return out


def norm_mask(m):
    """crop to bbox, pad to square (keeping aspect), resize to N x N."""
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return np.zeros((N, N), bool), 1.0
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = m.shape
    s = max(h, w)
    sq = np.zeros((s, s), bool)
    sq[(s - h) // 2:(s - h) // 2 + h, (s - w) // 2:(s - w) // 2 + w] = m
    im = Image.fromarray(sq.astype(np.uint8) * 255).resize((N, N), Image.BILINEAR)
    return np.array(im) > 127, w / h


def orig_mask(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (g > 110) & (g > r + 45) & (g > b + 45)
    # drop thin things (axis arrows, bed labels): erode, keep the bbox of what survives
    im = Image.fromarray(m.astype(np.uint8) * 255)
    er = np.array(im.filter(ImageFilter.MinFilter(7))) > 0
    ys, xs = np.nonzero(er)
    if len(xs):
        pad = 6
        box = np.zeros_like(m)
        box[max(ys.min() - pad, 0):ys.max() + pad + 1, max(xs.min() - pad, 0):xs.max() + pad + 1] = True
        m = m & box
    return norm_mask(m)


class Silhouette:
    def __init__(self, size=320):
        self.ren = vtk.vtkRenderer()
        self.ren.SetBackground(0, 0, 0)
        self.win = vtk.vtkRenderWindow()
        self.win.SetOffScreenRendering(1)
        self.win.SetSize(size, size)
        self.win.AddRenderer(self.ren)
        self.actor = vtk.vtkActor()
        self.mapper = vtk.vtkPolyDataMapper()
        self.actor.SetMapper(self.mapper)
        self.actor.GetProperty().SetColor(1, 1, 1)
        self.actor.GetProperty().LightingOff()
        self.ren.AddActor(self.actor)

    def mask(self, v, faces):
        lo, hi = v.min(0), v.max(0)
        v = v - np.array([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]])
        self.mapper.SetInputData(polydata(v, faces))
        cam = self.ren.GetActiveCamera()
        el, az = np.radians(32), np.radians(-120)
        d = 1000
        c = np.array([0, 0, (hi[2] - lo[2]) / 2])
        cam.SetFocalPoint(*c)
        cam.SetPosition(*(c + d * np.array([np.cos(el) * np.cos(az), np.cos(el) * np.sin(az), np.sin(el)])))
        cam.SetViewUp(0, 0, 1)
        cam.SetViewAngle(30)
        self.ren.ResetCamera()
        self.ren.ResetCameraClippingRange()
        self.win.Render()
        w2i = vtk.vtkWindowToImageFilter()
        w2i.SetInput(self.win)
        w2i.Update()
        img = w2i.GetOutput()
        x, y, _ = img.GetDimensions()
        a = vtk_to_numpy(img.GetPointData().GetScalars()).reshape(y, x, -1)[::-1, :, 0]
        return norm_mask(a > 127)


def main():
    lst = json.load(open(sys.argv[1]))
    imgdir, outp = sys.argv[2], sys.argv[3]
    only = sys.argv[4] if len(sys.argv) > 4 else ""
    res = json.load(open(outp)) if os.path.exists(outp) else {}
    sil = Silhouette()
    Rs = rotations()
    for img, info in lst.items():
        if only and only not in img:
            continue
        om, oasp = orig_mask(os.path.join(imgdir, os.path.basename(img)))
        mesh = step_mesh(info["step"], lin=0.3, ang=0.5)
        scores = []
        for R in Rs:
            m, asp = sil.mask(mesh.vertices @ R.T, mesh.faces)
            iou = (m & om).sum() / max((m | om).sum(), 1)
            scores.append((iou, R.tolist()))
        scores.sort(key=lambda t: -t[0])
        res[img] = {"step": info["step"], "cands": [[round(a, 3), r] for a, r in scores[:8]]}
        print(os.path.basename(img), [c[0] for c in res[img]["cands"][:3]], flush=True)
        json.dump(res, open(outp, "w"), indent=1)


if __name__ == "__main__":
    main()
