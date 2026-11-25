import type { JourneyStage } from "@/content/journey";
import type { SceneObjectId } from "@/content/sceneObjects";
import type { ServiceMode } from "@/content/services";
import {
  AIRPORT,
  ANNEX,
  APRON,
  CITY_BLOCKS,
  DELIVERY_ROUTE,
  DEST,
  DOCK_DOOR,
  DOCK_XS,
  FRAMINGS,
  HUB,
  OPEN_DOCKS,
  ORIGIN,
  PALLETS,
  PORT,
  ROAD_A,
  ROAD_B,
  ROAD_C,
  SAMPLE_PARCEL_SPOT,
  SELECTION_BOUNDS,
  SIDEWALK,
  TREES,
  mulberry32,
  type FramingId,
} from "../layout";
import { PALETTE as C, shade } from "../palette";
import {
  CLOCK_START,
  brandedTruckPose,
  craneTrolley,
  forkliftPose,
  journeyParcelAnchor,
  pickupVanPose,
  secondTruckPose,
  trafficTruckPose,
  tugPose,
  yardTruckPose,
  type Pose,
  type View,
} from "../poses";
import {
  IsoCanvas,
  boxShapes,
  eastRect,
  faceImage,
  flat,
  pathOf,
  project,
  rect,
  sortBoxes,
  southRect,
  type AABB,
  type BoxSpec,
  type Shape,
} from "./iso";

export type IsoState = {
  view: View;
  framing: FramingId;
  aspect: number;
  serviceMode: ServiceMode;
  journeyStage: JourneyStage;
  selected: SceneObjectId | null;
  /** Same subject offset the 3D camera uses (fractions of width/height). */
  offset?: readonly [number, number];
};

const LOGO = "/brand/vayutrack-logo-512.png";
const LOGO_W = 512;
const LOGO_H = 282;

export function viewBoxFor(framing: FramingId, aspect: number, offset: readonly [number, number] = [0, 0]) {
  const f = FRAMINGS[framing];
  let w: number = f.width;
  let h = w / aspect;
  const minH = "height" in f ? f.height : 0;
  if (h < minH) {
    h = minH;
    w = h * aspect;
  }
  const [cx, cy] = project(f.target[0], f.target[1], f.target[2]);
  const ox = offset[0] + ("offset" in f ? f.offset[0] : 0);
  const oy = offset[1] + ("offset" in f ? f.offset[1] : 0);
  return { x: cx - w / 2 - ox * w, y: cy - h / 2 - oy * h, w, h };
}

export function buildIsoWorld(state: IsoState) {
  const vb = viewBoxFor(state.framing, state.aspect, state.offset);
  const iso = new IsoCanvas(vb);
  const input = { view: state.view, serviceMode: state.serviceMode, journeyStage: state.journeyStage, t: CLOCK_START };

  ground(iso);
  hub(iso);
  annex(iso);
  originHouse(iso);
  destination(iso);
  for (const b of CITY_BLOCKS) cityBlock(iso, b);
  for (const p of PALLETS) palletStack(iso, p.x, p.z, p.layers, p.wrapped);
  for (const t of TREES) tree(iso, t.x, t.z, t.s);
  airport(iso);
  port(iso);

  // Vehicles.
  vehicle(iso, brandedTruckPose(input), "truck", true);
  vehicle(iso, secondTruckPose(), "truck", false);
  vehicle(iso, pickupVanPose(input), "van", true);
  vehicle(iso, trafficTruckPose(input), "truck", false);
  forklift(iso, forkliftPose(CLOCK_START));

  // Route highlight for express service and the moving journey stages.
  const showRoute = (state.view === "services" && state.serviceMode === "express") || (state.view === "journey" && state.journeyStage >= 2);
  if (showRoute) route(iso);

  // The highlighted parcel.
  if (state.view === "journey") {
    const anchor = journeyParcelAnchor(state.journeyStage);
    if (anchor) parcel(iso, anchor[0], anchor[1], true, state.journeyStage === 3);
    else {
      const truck = brandedTruckPose(input);
      pin(iso, truck.x, 6.4, truck.z);
    }
  } else {
    parcel(iso, SAMPLE_PARCEL_SPOT[0], SAMPLE_PARCEL_SPOT[1], state.view === "hero" && state.selected === "parcel", false);
  }

  if (state.view === "hero" && state.selected) selection(iso, state.selected);

  return { viewBox: vb, shapes: [...iso.ground, ...iso.markings, ...iso.orderedShapes(), ...iso.overlay] };
}

/* ---------------------------------------------------------------- */

function ground(iso: IsoCanvas) {
  const g = iso.ground;
  const m = iso.markings;
  // Water and quay.
  g.push(rect(PORT.water.x0, PORT.water.z0, PORT.water.x1, PORT.water.z1, 0, C.water));
  g.push(rect(PORT.water.x1 - 1.4, PORT.water.z0, PORT.water.x1, PORT.water.z1, 0, C.waterEdge));
  g.push(rect(PORT.quayX, PORT.yard.z0 - 6, PORT.yard.x1 + 4, PORT.yard.z1 + 4, 0, C.quay));
  // Airport.
  const ap = AIRPORT.apron;
  g.push(rect(ap.x0 - 6, ap.z0 - 6, ap.x1 + 6, ap.z1 + 6, 0, C.apron));
  const rw = AIRPORT.runway;
  g.push(rect(rw.x - rw.half - 6, rw.z0, rw.x + rw.half + 6, rw.z1, 0, C.grass));
  g.push(rect(rw.x - rw.half, rw.z0, rw.x + rw.half, rw.z1, 0, C.runway));
  for (let z = rw.z0 + 6; z < rw.z1; z += 14) m.push(rect(rw.x - 0.35, z, rw.x + 0.35, z + 7, 0, C.laneMark));
  m.push(flat([[ap.x0 + 8, -100], [AIRPORT.aircraft.x - 18, -100]], 0, "none", { stroke: C.bayLine, sw: 0.4 }));
  // Roads and sidewalks.
  const { z, half, x0, x1 } = ROAD_A;
  g.push(rect(x0, z - half - SIDEWALK, x1, z + half + SIDEWALK, 0, C.sidewalk));
  g.push(rect(ROAD_B.x - ROAD_B.half - SIDEWALK, ROAD_B.z0, ROAD_B.x + ROAD_B.half + SIDEWALK, ROAD_B.z1, 0, C.sidewalk));
  g.push(rect(ROAD_C.x - ROAD_C.half - SIDEWALK, ROAD_C.z0, ROAD_C.x + ROAD_C.half + SIDEWALK, ROAD_C.z1, 0, C.sidewalk));
  g.push(rect(x0, z - half, x1, z + half, 0, C.road));
  g.push(rect(ROAD_B.x - ROAD_B.half, ROAD_B.z0, ROAD_B.x + ROAD_B.half, z, 0, C.road));
  g.push(rect(ROAD_C.x - ROAD_C.half, ROAD_C.z0, ROAD_C.x + ROAD_C.half, z, 0, C.road));
  for (let x = x0 + 2; x < x1; x += 7) {
    if (Math.abs(x - ROAD_B.x) < 8 || Math.abs(x - ROAD_C.x) < 8) continue;
    m.push(rect(x, z - 0.22, x + 3.4, z + 0.22, 0, C.laneMark));
  }
  // Hub yard with bay lines.
  g.push(rect(APRON.x0, APRON.z0, APRON.x1, z - half, 0, C.apron));
  for (const dx of DOCK_XS) {
    for (const s of [-1, 1]) m.push(rect(dx + s * 3.1 - 0.14, APRON.z0 + 0.6, dx + s * 3.1 + 0.14, APRON.z0 + 10, 0, C.bayLine));
  }
  // Destination forecourt and sender's path.
  g.push(rect(DEST.x - DEST.w / 2 - 4, DEST.z + DEST.d / 2, DEST.x + DEST.w / 2 + 4, z - half, 0, C.apron));
  g.push(rect(ORIGIN.x - ORIGIN.w / 2 - 3, ORIGIN.z - ORIGIN.d / 2 - 3, ORIGIN.x + ORIGIN.w / 2 + 3, ORIGIN.z + ORIGIN.d / 2 + 3, 0, C.grass));
  g.push(rect(ORIGIN.x - 1.4, ORIGIN.z + ORIGIN.d / 2, ORIGIN.x + 1.4, z - half, 0, C.sidewalk));
}

function hub(iso: IsoCanvas) {
  const x0 = HUB.x - HUB.w / 2;
  const x1 = HUB.x + HUB.w / 2;
  const z0 = HUB.z - HUB.d / 2;
  const z1 = HUB.z + HUB.d / 2;
  const h = HUB.h;
  const rise = HUB.roofRise;
  const ov = 0.7;
  const shapes: Shape[] = boxShapes({ x0, x1, y0: 0, y1: h, z0, z1, color: C.hubWall });
  // Plinth.
  shapes.push(southRect(z1, x0, x1, 0, 0.9, shade(C.hubWall, -0.22)));
  // Dock doors.
  for (const dx of DOCK_XS) {
    const w = DOCK_DOOR.w / 2;
    shapes.push(southRect(z1, dx - w - 0.35, dx + w + 0.35, 0.9, DOCK_DOOR.h + 0.35, C.hubTrim));
    const open = OPEN_DOCKS.has(dx);
    shapes.push(southRect(z1, dx - w, dx + w, 1.1, DOCK_DOOR.h, open ? C.doorOpen : C.door));
    if (!open) for (let y = 1.6; y < DOCK_DOOR.h; y += 0.55) shapes.push(southRect(z1, dx - w, dx + w, y, y + 0.08, C.doorLine));
  }
  // Canopy over the docks.
  shapes.push(...boxShapes({ x0: -21, x1: 21, y0: 6.1, y1: 6.45, z0: z1, z1: z1 + 2.2, color: C.canopy }));
  // Gable end and roof.
  const yr = h + rise;
  shapes.push({ k: "path", d: pathOf([project(x1, h, z1), project(x1, h, z0), project(x1, yr, 0)]), fill: shade(C.hubWall, -0.16) });
  shapes.push({ k: "path", d: pathOf([project(x0 - ov, h - 0.2, z0 - ov), project(x1 + ov, h - 0.2, z0 - ov), project(x1 + ov, yr, 0), project(x0 - ov, yr, 0)]), fill: shade(C.hubRoof, 0.08) });
  shapes.push({ k: "path", d: pathOf([project(x0 - ov, yr, 0), project(x1 + ov, yr, 0), project(x1 + ov, h - 0.2, z1 + ov), project(x0 - ov, h - 0.2, z1 + ov)]), fill: C.hubRoof });
  for (let x = x0 + 1.6; x < x1; x += 2.2) {
    shapes.push({ k: "path", d: pathOf([project(x, yr, 0), project(x + 0.25, yr, 0), project(x + 0.25, h - 0.2, z1 + ov), project(x, h - 0.2, z1 + ov)]), fill: C.hubRoofRib, op: 0.55 });
  }
  shapes.push({ k: "path", d: pathOf([project(x1 + ov, h - 0.2, z1 + ov), project(x1 + ov, yr, 0), project(x1 + ov, yr - 0.4, 0), project(x1 + ov, h - 0.6, z1 + ov)]), fill: shade(C.hubRoof, -0.25) });
  // Rooftop units on the south slope.
  for (const ux of [-16, -4, 8]) {
    const zz = 4;
    const yy = h + rise * (1 - zz / (HUB.d / 2 + ov));
    shapes.push(...boxShapes({ x0: ux, x1: ux + 3.2, y0: yy - 0.2, y1: yy + 1.2, z0: zz - 1.2, z1: zz + 1.2, color: "#f4f7fb" }));
  }
  iso.add({ x0, x1, y0: 0, y1: yr, z0, z1: z1 + 2.2 }, shapes);
}

function annex(iso: IsoCanvas) {
  const x0 = ANNEX.x - ANNEX.w / 2;
  const x1 = ANNEX.x + ANNEX.w / 2;
  const z0 = ANNEX.z - ANNEX.d / 2;
  const z1 = ANNEX.z + ANNEX.d / 2;
  const shapes = boxShapes({ x0, x1, y0: 0, y1: ANNEX.h, z0, z1, color: C.annex });
  shapes.push(southRect(z1, x0 + 0.8, x1 - 0.8, 1.3, 2.9, C.glass));
  shapes.push(southRect(z1, x0 + 4.8, x0 + 7.2, 0, 2.9, C.glassDark));
  shapes.push(eastRect(x1, z0 + 1, z1 - 1, 1.3, 2.9, shade(C.glass, -0.12)));
  shapes.push(eastRect(x1, z0 + 1, z1 - 1, 4, 5.2, shade(C.glass, -0.12)));
  // Logo on the white facade.
  shapes.push(faceImage([x0 + 1.2, 7.05, z1], [x1 - x0 - 2.4, 0, 0], [0, -((x1 - x0 - 2.4) * LOGO_H) / LOGO_W, 0], LOGO, LOGO_W, LOGO_H));
  shapes.push(...boxShapes({ x0, x1, y0: ANNEX.h, y1: ANNEX.h + 0.5, z0, z1, color: "#eef2f8" }));
  iso.add({ x0, x1, y0: 0, y1: ANNEX.h + 0.5, z0, z1 }, shapes);
}

function originHouse(iso: IsoCanvas) {
  const { x, z, w, d, h, roofRise } = ORIGIN;
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const z0 = z - d / 2;
  const z1 = z + d / 2;
  const shapes = boxShapes({ x0, x1, y0: 0, y1: h, z0, z1, color: C.house });
  shapes.push(southRect(z1, x - 1, x + 1, 0, 2.6, C.houseDoor));
  for (const wx of [x0 + 1.4, x1 - 3.4]) shapes.push(southRect(z1, wx, wx + 2, 1.2, 2.6, C.glassDark));
  for (const wx of [x0 + 1.4, x - 1, x1 - 3.4]) shapes.push(southRect(z1, wx, wx + 2, 3.7, 5, C.glassDark));
  shapes.push(eastRect(x1, z0 + 1.5, z0 + 3.5, 3.7, 5, shade(C.glassDark, -0.1)));
  shapes.push(eastRect(x1, z1 - 3.5, z1 - 1.5, 1.2, 2.6, shade(C.glassDark, -0.1)));
  const yr = h + roofRise;
  const ov = 0.6;
  shapes.push({ k: "path", d: pathOf([project(x1, h, z1), project(x1, h, z0), project(x1, yr, z)]), fill: shade(C.house, -0.14) });
  shapes.push({ k: "path", d: pathOf([project(x0 - ov, h - 0.3, z0 - ov), project(x1 + ov, h - 0.3, z0 - ov), project(x1 + ov, yr, z), project(x0 - ov, yr, z)]), fill: shade(C.houseRoof, 0.1) });
  shapes.push({ k: "path", d: pathOf([project(x0 - ov, yr, z), project(x1 + ov, yr, z), project(x1 + ov, h - 0.3, z1 + ov), project(x0 - ov, h - 0.3, z1 + ov)]), fill: C.houseRoof });
  iso.add({ x0, x1, y0: 0, y1: yr, z0, z1 }, shapes);
  // Hedges.
  iso.addBox({ x0: x0 - 1.5, x1: x - 2.2, y0: 0, y1: 1, z0: z1 + 2.2, z1: z1 + 3.2, color: C.hedge });
  iso.addBox({ x0: x + 2.2, x1: x1 + 1.5, y0: 0, y1: 1, z0: z1 + 2.2, z1: z1 + 3.2, color: C.hedge });
}

function destination(iso: IsoCanvas) {
  const { x, z, w, d, h } = DEST;
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const z0 = z - d / 2;
  const z1 = z + d / 2;
  const shapes = boxShapes({ x0, x1, y0: 0, y1: h, z0, z1, color: C.destWall });
  for (let f = 0; f < 3; f++) {
    const y0 = f * 4 + 1.2;
    shapes.push(southRect(z1, x0 + 1, x1 - 1, y0, y0 + 2.3, f === 0 ? shade(C.destGlass, -0.08) : C.destGlass));
    shapes.push(eastRect(x1, z0 + 1, z1 - 1, y0, y0 + 2.3, shade(C.destGlass, -0.14)));
  }
  shapes.push(southRect(z1, x - 2, x + 2, 0, 3.4, C.glassDark));
  shapes.push(...boxShapes({ x0, x1, y0: h, y1: h + 0.6, z0, z1, color: "#eef2f8" }));
  shapes.push(...boxShapes({ x0: x0 + 3, x1: x0 + 7, y0: h + 0.6, y1: h + 2, z0: z0 + 3, z1: z0 + 6, color: "#f4f7fb" }));
  iso.add({ x0, x1, y0: 0, y1: h + 2, z0, z1 }, shapes);
  iso.addBox({ x0: x - 3.4, x1: x + 3.4, y0: 3.4, y1: 3.8, z0: z1, z1: z1 + 2.4, color: C.destCanopy });
}

function cityBlock(iso: IsoCanvas, b: { x: number; z: number; w: number; d: number; h: number }) {
  const x0 = b.x - b.w / 2;
  const x1 = b.x + b.w / 2;
  const z0 = b.z - b.d / 2;
  const z1 = b.z + b.d / 2;
  const shapes = boxShapes({ x0, x1, y0: 0, y1: b.h, z0, z1, color: C.city, top: C.cityRoof });
  for (let y = 2; y < b.h - 1; y += 3) {
    shapes.push(southRect(z1, x0 + 1, x1 - 1, y, y + 1.1, C.cityWindow));
    shapes.push(eastRect(x1, z0 + 1, z1 - 1, y, y + 1.1, shade(C.cityWindow, -0.1)));
  }
  iso.add({ x0, x1, y0: 0, y1: b.h, z0, z1 }, shapes);
}

export function palletStack(iso: IsoCanvas, x: number, z: number, layers: number, wrapped: boolean) {
  const s = 1.15;
  const shapes = boxShapes({ x0: x - s, x1: x + s, y0: 0, y1: 0.32, z0: z - s, z1: z + s, color: C.pallet });
  const top = 0.32 + layers * 1.05;
  const color = wrapped ? C.wrapBlue : C.cardboard;
  shapes.push(...boxShapes({ x0: x - s + 0.08, x1: x + s - 0.08, y0: 0.32, y1: top, z0: z - s + 0.08, z1: z + s - 0.08, color }));
  if (!wrapped) {
    for (let l = 1; l < layers; l++) {
      const y = 0.32 + l * 1.05;
      shapes.push(southRect(z + s - 0.08, x - s + 0.08, x + s - 0.08, y - 0.03, y + 0.03, C.cardboardDark));
      shapes.push(eastRect(x + s - 0.08, z - s + 0.08, z + s - 0.08, y - 0.03, y + 0.03, shade(C.cardboardDark, -0.1)));
    }
    shapes.push(flat([[x - 0.12, z - s + 0.08], [x + 0.12, z - s + 0.08], [x + 0.12, z + s - 0.08], [x - 0.12, z + s - 0.08]], top, C.tape));
  }
  iso.add({ x0: x - s, x1: x + s, y0: 0, y1: top, z0: z - s, z1: z + s }, shapes);
}

export function tree(iso: IsoCanvas, x: number, z: number, s: number) {
  const r = 1.9 * s;
  const cy = 3.6 * s;
  const shapes = boxShapes({ x0: x - 0.22, x1: x + 0.22, y0: 0, y1: cy, z0: z - 0.22, z1: z + 0.22, color: C.trunk });
  const [px, py] = project(x, cy, z);
  shapes.push({ k: "circle", cx: px, cy: py, r, fill: C.treeCrown });
  shapes.push({ k: "circle", cx: px - r * 0.28, cy: py - r * 0.3, r: r * 0.52, fill: C.treeCrownLight, op: 0.85 });
  iso.add({ x0: x - r * 0.7, x1: x + r * 0.7, y0: 0, y1: cy + r, z0: z - r * 0.7, z1: z + r * 0.7 }, shapes);
}

/* ---------------------------- vehicles ---------------------------- */

type LocalBox = { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; color: string; top?: string; tag?: "body" | "cab" };

/** Transform a vehicle-local box (forward = +x) into world space for axis-aligned headings. */
function placeBox(b: LocalBox, p: Pose, dir: number): BoxSpec {
  const corners = [
    [b.x0, b.z0], [b.x1, b.z1],
  ].map(([lx, lz]) => {
    switch (dir) {
      case 0: return [p.x + lx, p.z + lz]; // east
      case 1: return [p.x + lz, p.z + lx]; // south (local +x -> world +z, local +z -> world... mirrored ok for symmetric boxes)
      case 2: return [p.x - lx, p.z - lz]; // west
      default: return [p.x - lz, p.z - lx]; // north
    }
  });
  const [[ax, az], [bx, bz]] = corners;
  return { x0: Math.min(ax, bx), x1: Math.max(ax, bx), z0: Math.min(az, bz), z1: Math.max(az, bz), y0: b.y0, y1: b.y1, color: b.color, top: b.top };
}

function headingDir(h: number): number {
  // heading = atan2(-dz, dx): 0 east, -pi/2 south, ±pi west, pi/2 north.
  const a = ((h % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return [0, 3, 2, 1][Math.round(a / (Math.PI / 2)) % 4];
}

export function vehicle(iso: IsoCanvas, p: Pose, kind: "truck" | "van", branded: boolean) {
  if (!p.visible) return;
  const dir = headingDir(p.heading);
  const truck = kind === "truck";
  const L = truck ? 12.4 : 6.6;
  const W = truck ? 3.1 : 2.5;
  const bodyLen = truck ? 8.6 : 4.4;
  const bodyH = truck ? 4.4 : 3;
  const cabLen = truck ? 2.9 : 2;
  const cabH = truck ? 3.6 : 2.4;
  const hw = W / 2;
  const back = -L / 2;
  const bodyColor = branded ? C.truckBody : C.otherBody;
  const cabColor = branded ? (truck ? C.truckCab : C.truckBody) : C.otherCab;
  const local: LocalBox[] = [
    { x0: back + 0.3, x1: L / 2 - 0.4, y0: 0.55, y1: 1.05, z0: -hw + 0.55, z1: hw - 0.55, color: C.chassis },
    { x0: back, x1: back + bodyLen, y0: 1.05, y1: bodyH + 0.6, z0: -hw, z1: hw, color: bodyColor, tag: "body" },
    { x0: L / 2 - cabLen, x1: L / 2, y0: 1.05, y1: cabH + 0.4, z0: -hw + 0.05, z1: hw - 0.05, color: cabColor, tag: "cab" },
  ];
  const wheelXs = truck ? [back + 1.5, back + 2.9, L / 2 - 1.4] : [back + 1.3, L / 2 - 1.3];
  for (const wx of wheelXs) for (const s of [-1, 1]) local.push({ x0: wx - 0.6, x1: wx + 0.6, y0: 0, y1: 1.05, z0: s > 0 ? hw - 0.5 : -hw, z1: s > 0 ? hw : -hw + 0.5, color: C.tyre });
  const parts = local.map((b) => ({ box: placeBox(b, p, dir), tag: b.tag }));
  const shapes: Shape[] = [];
  for (const { box, tag } of sortBoxes(parts)) {
    shapes.push(...boxShapes(box));
    // Windscreen on the cab front face where visible.
    if (tag === "cab" && (dir === 0 || dir === 1)) {
      if (dir === 0) shapes.push(eastRect(box.x1, box.z0 + 0.25, box.z1 - 0.25, cabH * 0.55, cabH + 0.15, C.windscreen));
      else shapes.push(southRect(box.z1, box.x0 + 0.25, box.x1 - 0.25, cabH * 0.55, cabH + 0.15, C.windscreen));
    }
    if (tag === "body" && branded) {
      const len = bodyLen - 1.2;
      const hgt = (len * LOGO_H) / LOGO_W;
      const yTop = (bodyH + 0.6 + 1.05) / 2 + hgt / 2;
      if (dir === 0) {
        shapes.push(southRect(box.z1, box.x0, box.x1, 1.05, 1.45, C.truckStripe));
        shapes.push(faceImage([box.x0 + 0.6, yTop, box.z1], [len, 0, 0], [0, -hgt, 0], LOGO, LOGO_W, LOGO_H));
      } else if (dir === 1) {
        shapes.push(eastRect(box.x1, box.z0, box.z1, 1.05, 1.45, C.truckStripe));
        shapes.push(faceImage([box.x1, yTop, box.z1 - 0.6], [0, 0, -len], [0, -hgt, 0], LOGO, LOGO_W, LOGO_H));
      } else if (dir === 2) {
        shapes.push(southRect(box.z1, box.x0, box.x1, 1.05, 1.45, C.truckStripe));
      } else {
        shapes.push(eastRect(box.x1, box.z0, box.z1, 1.05, 1.45, C.truckStripe));
      }
    }
  }
  const all = parts.map((q) => q.box);
  const bb: AABB = {
    x0: Math.min(...all.map((b) => b.x0)), x1: Math.max(...all.map((b) => b.x1)),
    y0: 0, y1: bodyH + 0.6,
    z0: Math.min(...all.map((b) => b.z0)), z1: Math.max(...all.map((b) => b.z1)),
  };
  iso.add(bb, shapes);
}

function forklift(iso: IsoCanvas, p: Pose & { carrying: boolean; lift: number }) {
  const dir = headingDir(p.heading);
  const local: LocalBox[] = [
    { x0: -1.6, x1: 0.9, y0: 0.35, y1: 1.6, z0: -0.85, z1: 0.85, color: C.forklift },
    { x0: -1.9, x1: -1.2, y0: 0.35, y1: 1.9, z0: -0.8, z1: 0.8, color: shade(C.forklift, -0.25) },
    { x0: -1.3, x1: 0.6, y0: 3, y1: 3.15, z0: -0.85, z1: 0.85, color: C.mast },
    { x0: 0.9, x1: 1.15, y0: 0.2, y1: 3.4, z0: -0.7, z1: 0.7, color: C.mast },
    { x0: 1.15, x1: 2.6, y0: 0.15 + p.lift, y1: 0.28 + p.lift, z0: -0.6, z1: 0.6, color: C.mast },
  ];
  if (p.carrying) {
    local.push({ x0: 1.2, x1: 2.9, y0: 0.28 + p.lift, y1: 0.5 + p.lift, z0: -0.85, z1: 0.85, color: C.pallet });
    local.push({ x0: 1.3, x1: 2.8, y0: 0.5 + p.lift, y1: 1.6 + p.lift, z0: -0.75, z1: 0.75, color: C.cardboard });
  }
  for (const wx of [-1.1, 0.4]) for (const s of [-1, 1]) local.push({ x0: wx - 0.35, x1: wx + 0.35, y0: 0, y1: 0.7, z0: s > 0 ? 0.6 : -0.9, z1: s > 0 ? 0.9 : -0.6, color: C.tyre });
  const parts = sortBoxes(local.map((b) => ({ box: placeBox(b, p, dir) })));
  const shapes = parts.flatMap(({ box }) => boxShapes(box));
  const all = parts.map((q) => q.box);
  iso.add(
    { x0: Math.min(...all.map((b) => b.x0)), x1: Math.max(...all.map((b) => b.x1)), y0: 0, y1: 3.4, z0: Math.min(...all.map((b) => b.z0)), z1: Math.max(...all.map((b) => b.z1)) },
    shapes,
  );
}

/* ---------------------------- markers ---------------------------- */

function route(iso: IsoCanvas) {
  const pts = DELIVERY_ROUTE.sample(40).map(([x, z]) => project(x, 0.05, z));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  iso.markings.push({ k: "path", d, fill: "none", stroke: C.highlight, sw: 2.4, op: 0.22, cap: "round" });
  iso.markings.push({ k: "path", d, fill: "none", stroke: C.highlight, sw: 0.9, op: 0.9, cap: "round", cls: "vt-flow", dash: "2.2 2.2" });
}

export function pin(iso: IsoCanvas, x: number, y: number, z: number) {
  const [px, py] = project(x, y, z);
  iso.overlay.push({ k: "path", d: `M${px.toFixed(1)} ${(py + 2.6).toFixed(1)}L${(px - 1.15).toFixed(1)} ${(py + 0.6).toFixed(1)}L${(px + 1.15).toFixed(1)} ${(py + 0.6).toFixed(1)}Z`, fill: C.pin });
  iso.overlay.push({ k: "circle", cx: px, cy: py, r: 1.5, fill: C.pin, stroke: "#ffffff", sw: 0.3 });
  iso.overlay.push({ k: "circle", cx: px, cy: py, r: 0.55, fill: "#ffffff" });
}

function parcel(iso: IsoCanvas, x: number, z: number, highlighted: boolean, delivered: boolean) {
  const s = 0.62;
  const palletH = Math.abs(x - SAMPLE_PARCEL_SPOT[0]) < 0.01 ? 0.32 : 0;
  const shapes: Shape[] = [];
  if (palletH) shapes.push(...boxShapes({ x0: x - 1.15, x1: x + 1.15, y0: 0, y1: 0.32, z0: z - 1.15, z1: z + 1.15, color: C.pallet }));
  const color = highlighted ? C.highlight : C.cardboard;
  shapes.push(...boxShapes({ x0: x - s, x1: x + s, y0: palletH, y1: palletH + 1.2, z0: z - s, z1: z + s, color }));
  shapes.push(flat([[x - 0.1, z - s], [x + 0.1, z - s], [x + 0.1, z + s], [x - 0.1, z + s]], palletH + 1.2, highlighted ? "#cfe0ff" : C.highlight));
  iso.add({ x0: x - 1.15, x1: x + 1.15, y0: 0, y1: palletH + 1.2, z0: z - 1.15, z1: z + 1.15 }, shapes);
  if (highlighted) {
    iso.markings.push(flat(roundedDiamond(x, z, 2.2), 0.04, C.highlight, { op: 0.18 }));
    pin(iso, x, palletH + 4.4, z);
    if (delivered) {
      const [px, py] = project(x + 2.2, 2.4, z);
      iso.overlay.push({ k: "circle", cx: px, cy: py, r: 1.3, fill: C.success, stroke: "#fff", sw: 0.3 });
      iso.overlay.push({ k: "path", d: `M${(px - 0.6).toFixed(1)} ${py.toFixed(1)}L${(px - 0.15).toFixed(1)} ${(py + 0.45).toFixed(1)}L${(px + 0.65).toFixed(1)} ${(py - 0.45).toFixed(1)}`, fill: "none", stroke: "#fff", sw: 0.35, cap: "round" });
    }
  }
}

function roundedDiamond(x: number, z: number, r: number): [number, number][] {
  return [[x - r, z - r], [x + r, z - r], [x + r, z + r], [x - r, z + r]];
}

function selection(iso: IsoCanvas, id: SceneObjectId) {
  const b = SELECTION_BOUNDS[id];
  const [cx, cy, cz] = b.c;
  const [sx, sy, sz] = b.s;
  const x0 = cx - sx / 2;
  const x1 = cx + sx / 2;
  const z0 = cz - sz / 2;
  const z1 = cz + sz / 2;
  const y0 = cy - sy / 2;
  const y1 = cy + sy / 2;
  iso.markings.push(rect(x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6, 0.03, C.highlight, { op: 0.14, stroke: C.highlight, sw: 0.35 }));
  const k = Math.min(sx, sy, sz) * 0.22 + 0.6;
  const corners: [number, number, number][] = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) corners.push([x, y, z]);
  let d = "";
  for (const [x, y, z] of corners) {
    // Skip the hidden back corner.
    if (x === x0 && z === z0 && y === y0) continue;
    const o = project(x, y, z);
    const dx = x === x0 ? k : -k;
    const dy = y === y0 ? k : -k;
    const dz = z === z0 ? k : -k;
    for (const q of [project(x + dx, y, z), project(x, y + dy, z), project(x, y, z + dz)]) d += `M${o[0].toFixed(1)} ${o[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  }
  iso.overlay.push({ k: "path", d, fill: "none", stroke: C.highlight, sw: 0.45, cap: "round" });
}

/* ---------------------------- airport ---------------------------- */

function airport(iso: IsoCanvas) {
  const t = AIRPORT.terminal;
  const x0 = t.x - t.w / 2;
  const x1 = t.x + t.w / 2;
  const z0 = t.z - t.d / 2;
  const z1 = t.z + t.d / 2;
  const shapes = boxShapes({ x0, x1, y0: 0, y1: t.h, z0, z1, color: "#f6f8fc", top: C.hubRoof });
  for (let z = z0 + 4; z < z1 - 6; z += 9) {
    shapes.push(eastRect(x1, z, z + 6, 0.2, 6, z > -110 && z < -95 ? C.doorOpen : C.door));
  }
  shapes.push(eastRect(x1, z0 + 1, z1 - 1, 7.4, 8.6, C.glass));
  iso.add({ x0, x1, y0: 0, y1: t.h, z0, z1 }, shapes);
  aircraftShape(iso);
  // ULD dollies pulled by a tug.
  const tp = tugPose(CLOCK_START);
  iso.addBox({ x0: tp.x - 1.4, x1: tp.x + 1.4, y0: 0, y1: 1.8, z0: tp.z - 1.1, z1: tp.z + 1.1, color: C.tug });
  for (let i = 1; i <= 3; i++) {
    const d = tugPose(CLOCK_START, i * 0.022);
    iso.addBox({ x0: d.x - 1.5, x1: d.x + 1.5, y0: 0.5, y1: 3.2, z0: d.z - 1.3, z1: d.z + 1.3, color: C.uld });
  }
  // High loader at the main deck door.
  iso.addBox({ x0: 91, x1: 97, y0: 0, y1: 4.3, z0: -96.6, z1: -92.6, color: "#e9edf4" });
  iso.addBox({ x0: 92, x1: 96, y0: 4.3, y1: 6.8, z0: -96.3, z1: -93.2, color: C.uld });
}

function aircraftShape(iso: IsoCanvas) {
  const cz = AIRPORT.aircraft.z;
  const wing = (side: 1 | -1, y: number) =>
    flat(
      [
        [94, cz + side * 2.4],
        [104, cz + side * 2.4],
        [112, cz + side * 19],
        [108, cz + side * 19],
      ],
      y,
      side > 0 ? C.aircraftGrey : shade(C.aircraftGrey, 0.05),
    );
  const stab = (side: 1 | -1) =>
    flat(
      [
        [117, cz + side * 1.5],
        [121, cz + side * 1.5],
        [124, cz + side * 8],
        [121.5, cz + side * 8],
      ],
      6.6,
      C.aircraftGrey,
    );
  const engine = (side: 1 | -1) => boxShapes({ x0: 95, x1: 101, y0: 0.9, y1: 3, z0: cz + side * 9 - 1.1, z1: cz + side * 9 + 1.1, color: C.engine });
  const shapes: Shape[] = [];
  shapes.push(stab(-1), wing(-1, 3.2), ...engine(-1));
  shapes.push(...boxShapes({ x0: 84, x1: 120, y0: 1.4, y1: 6.6, z0: cz - 2.6, z1: cz + 2.6, color: C.aircraft }));
  shapes.push(...boxShapes({ x0: 80.5, x1: 84, y0: 2, y1: 5.8, z0: cz - 1.9, z1: cz + 1.9, color: C.aircraft }));
  shapes.push(southRect(cz + 1.9, 80.8, 83, 4.4, 5.3, C.windscreen));
  shapes.push(southRect(cz + 2.6, 92, 96, 2.2, 6, shade(C.aircraftGrey, -0.05)));
  shapes.push(...boxShapes({ x0: 120, x1: 124, y0: 3.6, y1: 6.6, z0: cz - 1.4, z1: cz + 1.4, color: C.aircraft }));
  shapes.push({ k: "path", d: pathOf([project(113, 6.6, cz), project(123.6, 6.6, cz), project(124, 14, cz), project(120.5, 14, cz)]), fill: shade(C.aircraft, -0.06) });
  shapes.push(...engine(1), wing(1, 3.2), stab(1));
  iso.add({ x0: 80, x1: 124, y0: 0, y1: 14, z0: cz - 19, z1: cz + 19 }, shapes);
}

/* ------------------------------ port ------------------------------ */

function port(iso: IsoCanvas) {
  const rand = mulberry32(5);
  const y = PORT.yard;
  for (let x = y.x0 + 10; x < y.x1 - 4; x += 9.5) {
    for (let z = y.z0 + 6; z < y.z1 - 4; z += 3.2) {
      if (rand() < 0.18) continue;
      const layers = 1 + Math.floor(rand() * 3);
      containerStack(iso, x, z, layers, C.containers[Math.floor(rand() * C.containers.length)], false);
    }
  }
  ship(iso, rand);
  PORT.cranes.forEach((cz, i) => crane(iso, cz, i));
  const yt = yardTruckPose(CLOCK_START);
  iso.addBox({ x0: yt.x - 1.3, x1: yt.x + 1.3, y0: 0, y1: 2.6, z0: yt.z - 2, z1: yt.z + 2, color: C.tug });
}

function containerStack(iso: IsoCanvas, x: number, z: number, layers: number, color: string, alongZ: boolean, base = 0) {
  const lx = alongZ ? 1.2 : 3;
  const lz = alongZ ? 3 : 1.2;
  const top = base + layers * 2.6;
  const shapes = boxShapes({ x0: x - lx, x1: x + lx, y0: base, y1: top, z0: z - lz, z1: z + lz, color });
  for (let l = 1; l < layers; l++) {
    const yy = base + l * 2.6;
    shapes.push(southRect(z + lz, x - lx, x + lx, yy - 0.06, yy + 0.06, shade(color, -0.3)));
    shapes.push(eastRect(x + lx, z - lz, z + lz, yy - 0.06, yy + 0.06, shade(color, -0.35)));
  }
  iso.add({ x0: x - lx, x1: x + lx, y0: base, y1: top, z0: z - lz, z1: z + lz }, shapes);
}

function ship(iso: IsoCanvas, rand: () => number) {
  const { x, z, length, beam } = PORT.ship;
  const x0 = x - beam / 2;
  const x1 = x + beam / 2;
  const zs = z + length / 2; // stern (south)
  const zb = z - length / 2; // bow (north)
  const bowStart = zb + 9;
  const deckY = 5;
  const shapes: Shape[] = [];
  // Hull: east side, bow and stern.
  shapes.push({ k: "path", d: pathOf([project(x1, 0, zs), project(x1, 0, bowStart), project(x, 0, zb), project(x, deckY, zb), project(x1, deckY, bowStart), project(x1, deckY, zs)]), fill: shade(C.hull, -0.1) });
  shapes.push({ k: "path", d: pathOf([project(x1, 0, zs), project(x1, 0, bowStart), project(x, 0, zb), project(x, 1.2, zb), project(x1, 1.2, bowStart), project(x1, 1.2, zs)]), fill: C.hullBoot });
  shapes.push({ k: "path", d: pathOf([project(x0, 0, zs), project(x1, 0, zs), project(x1, deckY, zs), project(x0, deckY, zs)]), fill: C.hull });
  shapes.push({ k: "path", d: pathOf([project(x0, deckY, zs), project(x1, deckY, zs), project(x1, deckY, bowStart), project(x, deckY, zb), project(x0, deckY, bowStart)]), fill: C.deck });
  iso.add({ x0, x1, y0: 0, y1: deckY, z0: zb, z1: zs }, shapes);
  // Deck cargo.
  for (let cz = bowStart + 2; cz < zs - 12; cz += 6.4) {
    for (const cx of [x0 + 2, x, x1 - 2]) {
      if (rand() < 0.12) continue;
      containerStack(iso, cx, cz + 3, 1 + Math.floor(rand() * 3), C.containers[Math.floor(rand() * C.containers.length)], true, deckY);
    }
  }
  // Superstructure at the stern.
  iso.addBox({ x0: x0 + 1.5, x1: x1 - 1.5, y0: deckY, y1: deckY + 10, z0: zs - 9, z1: zs - 3, color: C.superstructure });
  iso.add({ x0: x0 + 1.5, x1: x1 - 1.5, y0: deckY + 7.6, y1: deckY + 8.8, z0: zs - 9, z1: zs - 3 }, [
    southRect(zs - 3, x0 + 1.5, x1 - 1.5, deckY + 7.6, deckY + 8.8, C.glassDark),
    eastRect(x1 - 1.5, zs - 9, zs - 3, deckY + 7.6, deckY + 8.8, shade(C.glassDark, -0.1)),
  ]);
  iso.addBox({ x0: x - 1.4, x1: x + 1.4, y0: deckY + 10, y1: deckY + 13.5, z0: zs - 7.5, z1: zs - 5, color: C.hull });
}

function crane(iso: IsoCanvas, cz: number, index: number) {
  const qx = PORT.quayX;
  const legX = [qx + 2, qx + 12];
  const parts: BoxSpec[] = [];
  for (const lx of legX) for (const dz of [-4.5, 4.5]) parts.push({ x0: lx - 0.6, x1: lx + 0.6, y0: 0, y1: 20, z0: cz + dz - 0.6, z1: cz + dz + 0.6, color: C.crane });
  parts.push({ x0: legX[0] - 0.6, x1: legX[1] + 0.6, y0: 17, y1: 18.4, z0: cz - 5.1, z1: cz + 5.1, color: C.crane });
  parts.push({ x0: qx - 30, x1: qx + 18, y0: 20, y1: 21.6, z0: cz - 1, z1: cz + 1, color: C.craneLight });
  parts.push({ x0: qx + 12, x1: qx + 18, y0: 21.6, y1: 24, z0: cz - 1.8, z1: cz + 1.8, color: C.craneLight });
  const { reach, drop } = craneTrolley(CLOCK_START, index);
  const tx = qx + 4 - reach * 18;
  parts.push({ x0: tx - 1.3, x1: tx + 1.3, y0: 18.8, y1: 20, z0: cz - 1.2, z1: cz + 1.2, color: C.crane });
  const hookY = 12 - drop * 4;
  parts.push({ x0: tx - 3, x1: tx + 3, y0: hookY - 2.6, y1: hookY, z0: cz - 1.2, z1: cz + 1.2, color: C.containers[(index * 3 + 2) % C.containers.length] });
  for (const p of parts) iso.addBox(p);
}
