"""Render a STEP part on a slicer-like bed in its print orientation (VTK, off screen).

    python render.py part.step out.png '[[1,0,0],[0,1,0],[0,0,1]]'

R (3x3) rotates the STEP into its print orientation (bed = XY, up = +Z). The part
is drawn from the STEP's own geometry: a fine tessellation with smooth normals,
plus the B-rep edges as thin dark lines, centred on a 220 mm bed. A .jpg output
path is written as JPEG, anything else as PNG.
"""
import json
import sys

import numpy as np
import vtk
from vtk.util.numpy_support import numpy_to_vtk, numpy_to_vtkIdTypeArray
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE, TopAbs_FACE, TopAbs_REVERSED
from OCP.BRep import BRep_Tool
from OCP.TopLoc import TopLoc_Location
import trimesh
from OCP.TopoDS import TopoDS
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GCPnts import GCPnts_QuasiUniformDeflection


BG = (0x33 / 255, 0x33 / 255, 0x36 / 255)
PLATE = (0x4a / 255, 0x4a / 255, 0x4e / 255)
GRID = (0x6a / 255, 0x6a / 255, 0x70 / 255)
GREEN = (0.23, 0.62, 0.17)
EDGE = (0.08, 0.25, 0.06)


def step_mesh(path, lin=0.05, ang=0.2):
    r = STEPControl_Reader()
    r.ReadFile(path)
    r.TransferRoots()
    shape = r.OneShape()
    BRepMesh_IncrementalMesh(shape, lin, False, ang, True)
    verts, faces, off = [], [], 0
    ex = TopExp_Explorer(shape, TopAbs_FACE)
    while ex.More():
        f = TopoDS.Face_s(ex.Current())
        loc = TopLoc_Location()
        tri = BRep_Tool.Triangulation_s(f, loc)
        if tri is not None:
            tr = loc.Transformation()
            for i in range(1, tri.NbNodes() + 1):
                p = tri.Node(i).Transformed(tr)
                verts.append((p.X(), p.Y(), p.Z()))
            rev = f.Orientation() == TopAbs_REVERSED
            for i in range(1, tri.NbTriangles() + 1):
                a, b, c = tri.Triangle(i).Get()
                faces.append((off + a - 1, off + c - 1, off + b - 1) if rev else (off + a - 1, off + b - 1, off + c - 1))
            off += tri.NbNodes()
        ex.Next()
    return trimesh.Trimesh(np.array(verts), np.array(faces), process=True)


def step_edges(path, deflection=0.05):
    r = STEPControl_Reader()
    r.ReadFile(path)
    r.TransferRoots()
    shape = r.OneShape()
    lines = []
    ex = TopExp_Explorer(shape, TopAbs_EDGE)
    while ex.More():
        c = BRepAdaptor_Curve(TopoDS.Edge_s(ex.Current()))
        d = GCPnts_QuasiUniformDeflection(c, deflection)
        if d.IsDone() and d.NbPoints() > 1:
            lines.append(np.array([(p.X(), p.Y(), p.Z()) for p in (d.Value(i) for i in range(1, d.NbPoints() + 1))]))
        ex.Next()
    return lines


def polydata(verts, faces=None, lines=None):
    pd = vtk.vtkPolyData()
    pts = vtk.vtkPoints()
    pts.SetData(numpy_to_vtk(np.ascontiguousarray(verts, dtype=float), deep=True))
    pd.SetPoints(pts)
    if faces is not None:
        cells = np.hstack([np.full((len(faces), 1), 3), faces]).astype(np.int64).ravel()
        ca = vtk.vtkCellArray()
        ca.SetCells(len(faces), numpy_to_vtkIdTypeArray(cells, deep=True))
        pd.SetPolys(ca)
    if lines is not None:
        ca = vtk.vtkCellArray()
        for a, b in lines:
            ca.InsertNextCell(2)
            ca.InsertCellPoint(a)
            ca.InsertCellPoint(b)
        pd.SetLines(ca)
    return pd


def actor(pd, color, *, line_width=None, normals=False, lighting=True):
    src = pd
    if normals:
        n = vtk.vtkPolyDataNormals()
        n.SetInputData(pd)
        n.SetFeatureAngle(30)
        n.SplittingOn()
        n.ConsistencyOn()
        n.Update()
        src = n.GetOutput()
    m = vtk.vtkPolyDataMapper()
    m.SetInputData(src)
    a = vtk.vtkActor()
    a.SetMapper(m)
    p = a.GetProperty()
    p.SetColor(*color)
    if line_width:
        p.SetLineWidth(line_width)
    if not lighting:
        p.LightingOff()
    return a


def render(path, out, R, size=(1028, 672)):
    R = np.array(R, float)
    mesh = step_mesh(path, lin=0.02, ang=0.1)
    edges = step_edges(path)
    v = mesh.vertices @ R.T
    lo, hi = v.min(0), v.max(0)
    shift = np.array([-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]])
    v = v + shift
    edges = [e @ R.T + shift for e in edges]

    half = max(110, int(np.ceil((hi - lo)[:2].max() / 2 / 10 + 1) * 10))
    ren = vtk.vtkRenderer()
    ren.SetBackground(*BG)

    plate = polydata(np.array([(-half, -half, -0.4), (half, -half, -0.4), (half, half, -0.4), (-half, half, -0.4)]),
                     np.array([(0, 1, 2), (0, 2, 3)]))
    ren.AddActor(actor(plate, PLATE, lighting=False))
    g = np.arange(-half, half + 1, 10)
    gp = [(x, -half, -0.1) for x in g] + [(x, half, -0.1) for x in g] + [(-half, y, -0.1) for y in g] + [(half, y, -0.1) for y in g]
    k = len(g)
    ren.AddActor(actor(polydata(np.array(gp), lines=[(i, i + k) for i in range(k)] + [(2 * k + i, 3 * k + i) for i in range(k)]),
                       GRID, line_width=1, lighting=False))
    border = [(-half, -half, -0.05), (half, -half, -0.05), (half, half, -0.05), (-half, half, -0.05)]
    ren.AddActor(actor(polydata(np.array(border), lines=[(0, 1), (1, 2), (2, 3), (3, 0)]), (0.6, 0.6, 0.62),
                       line_width=1.5, lighting=False))

    part = actor(polydata(v, mesh.faces), GREEN, normals=True)
    pr = part.GetProperty()
    pr.SetAmbient(0.25); pr.SetDiffuse(0.75); pr.SetSpecular(0.15); pr.SetSpecularPower(20)
    # push the faces back a little so their own edges draw on top, hidden ones stay hidden
    part.GetMapper().SetResolveCoincidentTopologyToPolygonOffset()
    part.GetMapper().SetRelativeCoincidentTopologyPolygonOffsetParameters(1.5, 1.5)
    ren.AddActor(part)
    pts, segs, off = [], [], 0
    for e in edges:
        pts.append(e)
        segs += [(off + i, off + i + 1) for i in range(len(e) - 1)]
        off += len(e)
    if pts:
        ea = actor(polydata(np.vstack(pts), lines=segs), EDGE, line_width=1.2, lighting=False)
        ren.AddActor(ea)

    cam = ren.GetActiveCamera()
    el, az = np.radians(32), np.radians(-120)
    dist = half * 4.2
    cam.SetFocalPoint(0, 0, 0)
    cam.SetPosition(dist * np.cos(el) * np.cos(az), dist * np.cos(el) * np.sin(az), dist * np.sin(el))
    cam.SetViewUp(0, 0, 1)
    cam.SetViewAngle(30)
    ren.ResetCameraClippingRange()
    light = vtk.vtkLight()
    light.SetLightTypeToSceneLight()
    light.SetPosition(-half * 2, -half * 3, half * 5)
    light.SetFocalPoint(0, 0, 0)
    light.SetIntensity(0.9)
    ren.AddLight(light)
    head = vtk.vtkLight()
    head.SetLightTypeToHeadlight()
    head.SetIntensity(0.45)
    ren.AddLight(head)

    win = vtk.vtkRenderWindow()
    win.SetOffScreenRendering(1)
    win.SetMultiSamples(8)
    win.SetSize(*size)
    win.AddRenderer(ren)
    win.Render()
    w2i = vtk.vtkWindowToImageFilter()
    w2i.SetInput(win)
    w2i.SetInputBufferTypeToRGB()
    w2i.ReadFrontBufferOff()
    w2i.Update()
    if out.lower().endswith((".jpg", ".jpeg")):
        wr = vtk.vtkJPEGWriter()
        wr.SetQuality(90)
    else:
        wr = vtk.vtkPNGWriter()
    wr.SetFileName(out)
    wr.SetInputConnection(w2i.GetOutputPort())
    wr.Write()
    print(out, np.round(hi - lo, 1))


if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2], json.loads(sys.argv[3]))
