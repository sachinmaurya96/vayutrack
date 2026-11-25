/**
 * Shared layout for the VayuTrack logistics world.
 *
 * Units are roughly metres. +x runs east, +z runs south (towards the camera),
 * y is up. The camera looks from the south-east, so south (+z) and east (+x)
 * faces are the visible ones. Vehicles keep left, as on Indian roads.
 *
 * Both the WebGL world and the SVG fallback read from this file.
 */

export type Vec2 = readonly [number, number];

export const HUB = { x: 0, z: 0, w: 52, d: 26, h: 9, roofRise: 2.8 } as const; // x -26..26, z -13..13
export const ANNEX = { x: 33, z: 4.5, w: 14, d: 17, h: 7.5 } as const; // x 26..40
export const DOCK_XS = [-16, -8, 0, 8, 16] as const;
export const DOCK_DOOR = { w: 4.4, h: 4.8 } as const;
export const OPEN_DOCKS = new Set([0, 8, 16]);
export const APRON = { x0: -36, x1: 46, z0: 13, z1: 24.5 } as const;

export const ROAD_A = { z: 30, half: 5.5, x0: -260, x1: 240 } as const;
export const LANE_EAST = 27.6; // eastbound keeps left (north lane)
export const LANE_WEST = 32.4;
export const SIDEWALK = 2.2;
export const ROAD_B = { x: 128, half: 5, z0: -70, z1: ROAD_A.z - ROAD_A.half } as const; // to airport
export const ROAD_C = { x: -112, half: 5, z0: -46, z1: ROAD_A.z - ROAD_A.half } as const; // to port

export const ORIGIN = { x: -78, z: 3, w: 12, d: 10, h: 6, roofRise: 3.2 } as const; // the sender's doorstep
export const ORIGIN_DOORSTEP: Vec2 = [-78, 10.2];
export const DEST = { x: 82, z: 3, w: 22, d: 15, h: 12 } as const; // the recipient's building
export const DEST_DOORSTEP: Vec2 = [82, 15.4];

export const TRUCK_DOCK_X = 8;
export const TRUCK_LEN = 12.4;
export const TRUCK_DOCKED: Vec2 = [TRUCK_DOCK_X, HUB.d / 2 + 0.4 + TRUCK_LEN / 2];
export const SECOND_TRUCK_DOCKED: Vec2 = [16, HUB.d / 2 + 0.4 + TRUCK_LEN / 2];
export const SAMPLE_PARCEL_SPOT: Vec2 = [2.6, 17.6];

export const AIRPORT = {
  terminal: { x: 54, z: -102, w: 18, d: 54, h: 10 },
  apron: { x0: 63, x1: 150, z0: -132, z1: -70 },
  runway: { x: 168, half: 7, z0: -260, z1: 40 },
  aircraft: { x: 102, z: -100, heading: Math.PI }, // nose points west to the terminal
} as const;

export const PORT = {
  quayX: -128,
  yard: { x0: -128, x1: -86, z0: -122, z1: -48 },
  water: { x0: -340, x1: -128, z0: -260, z1: 60 },
  ship: { x: -142, z: -86, length: 64, beam: 13 },
  cranes: [-104, -74] as readonly number[],
} as const;

/** A few low background blocks to suggest the wider city. */
export const CITY_BLOCKS: { x: number; z: number; w: number; d: number; h: number }[] = [
  { x: -150, z: 62, w: 22, d: 16, h: 9 },
  { x: -118, z: 66, w: 16, d: 20, h: 14 },
  { x: -60, z: 60, w: 26, d: 14, h: 7 },
  { x: -26, z: 64, w: 18, d: 18, h: 11 },
  { x: 14, z: 60, w: 24, d: 14, h: 8 },
  { x: 52, z: 66, w: 18, d: 20, h: 13 },
  { x: 96, z: 60, w: 26, d: 14, h: 9 },
  { x: 136, z: 66, w: 18, d: 18, h: 15 },
  { x: 182, z: 58, w: 22, d: 14, h: 8 },
  { x: -44, z: -46, w: 22, d: 18, h: 8 },
  { x: -14, z: -52, w: 16, d: 14, h: 12 },
  { x: 18, z: -48, w: 20, d: 16, h: 7 },
  { x: 92, z: -38, w: 20, d: 14, h: 10 },
  { x: 190, z: -40, w: 18, d: 22, h: 12 },
  { x: -70, z: -60, w: 18, d: 14, h: 9 },
];

/* ------------------------------------------------------------------ */
/* Deterministic randomness (identical on server and client).          */
/* ------------------------------------------------------------------ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PalletSpec = { x: number; z: number; layers: number; wrapped: boolean };

/** Pallet rows on the west of the hub yard, clear of the forklift lane. */
export const PALLETS: PalletSpec[] = (() => {
  const rand = mulberry32(21);
  const out: PalletSpec[] = [];
  for (const x of [-32, -28.6, -25.2]) for (const z of [15.8, 19.2, 22.6]) out.push({ x, z, layers: 1 + Math.floor(rand() * 3), wrapped: false });
  out.push({ x: -15.2, z: 15.8, layers: 2, wrapped: true });
  out.push({ x: -15.2, z: 22.4, layers: 1, wrapped: true });
  out.push({ x: 4.6, z: 21.4, layers: 1, wrapped: false });
  return out;
})();

export type TreeSpec = { x: number; z: number; s: number };

export const TREES: TreeSpec[] = (() => {
  const rand = mulberry32(7);
  const trees: TreeSpec[] = [];
  const add = (x: number, z: number, s = 1) => trees.push({ x, z, s: s * (0.85 + rand() * 0.3) });
  // South verge of the main road.
  for (let x = -200; x <= 200; x += 13) {
    if (Math.abs(x - ROAD_B.x) < 10 || Math.abs(x - ROAD_C.x) < 10) continue;
    add(x + rand() * 3, ROAD_A.z + ROAD_A.half + SIDEWALK + 3 + rand() * 1.5);
  }
  // North verge, leaving the hub apron and building fronts clear.
  for (let x = -200; x <= 200; x += 15) {
    if (x > APRON.x0 - 6 && x < APRON.x1 + 4) continue;
    if (Math.abs(x - ORIGIN.x) < 10 || Math.abs(x - DEST.x) < 16) continue;
    if (Math.abs(x - ROAD_B.x) < 10 || Math.abs(x - ROAD_C.x) < 10) continue;
    add(x + rand() * 2, ROAD_A.z - ROAD_A.half - SIDEWALK - 2.6);
  }
  // Behind the hub.
  for (let i = 0; i < 9; i++) add(-30 + i * 8 + rand() * 3, -21 - rand() * 6, 1.1);
  // Around the sender's home.
  add(ORIGIN.x - 10, ORIGIN.z - 4, 1.2);
  add(ORIGIN.x - 9, ORIGIN.z + 6, 0.9);
  add(ORIGIN.x + 10, ORIGIN.z - 2, 1.1);
  add(ORIGIN.x + 9, ORIGIN.z + 7, 0.8);
  // Destination plaza.
  add(DEST.x - 16, DEST.z + 8, 1);
  add(DEST.x + 16, DEST.z + 9, 1.1);
  add(DEST.x + 17, DEST.z - 4, 1.2);
  add(DEST.x - 15, DEST.z - 6, 0.9);
  // Airport and port edges.
  for (let z = -60; z >= -140; z -= 14) add(AIRPORT.terminal.x - 16, z + rand() * 4, 1);
  for (let x = -84; x <= -40; x += 11) add(x, PORT.yard.z1 + 8 + rand() * 3, 1);
  // Loose clusters to soften the edges of the world.
  const clusters: Vec2[] = [
    [-150, -10], [-40, 46], [36, 46], [150, 10], [112, -20], [-170, 40], [205, 12], [60, -34],
  ];
  for (const [cx, cz] of clusters) for (let i = 0; i < 4; i++) add(cx + (rand() - 0.5) * 14, cz + (rand() - 0.5) * 10, 0.9 + rand() * 0.4);
  return trees;
})();

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

export type PathPoint = { x: number; z: number; heading: number };

/**
 * Polyline with rounded corners, sampled by arc length.
 * heading is the yaw (radians) that turns local +x towards the direction of travel.
 */
export class RoutePath {
  readonly xs: number[] = [];
  readonly zs: number[] = [];
  readonly cum: number[] = [];
  readonly length: number;

  constructor(points: readonly Vec2[], radius = 4, readonly closed = false) {
    const pts = closed ? [...points, points[0], points[1]] : [...points];
    const push = (x: number, z: number) => {
      const n = this.xs.length;
      if (n && Math.hypot(x - this.xs[n - 1], z - this.zs[n - 1]) < 1e-6) return;
      this.xs.push(x);
      this.zs.push(z);
    };
    const start = closed ? 1 : 0;
    if (!closed) push(pts[0][0], pts[0][1]);
    for (let i = start + (closed ? 0 : 1); i < pts.length - 1; i++) {
      const a = pts[i - 1];
      const p = pts[i];
      const b = pts[i + 1];
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]);
      const lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const r = Math.min(radius, la / 2, lb / 2);
      const p0: Vec2 = [p[0] + ((a[0] - p[0]) / la) * r, p[1] + ((a[1] - p[1]) / la) * r];
      const p1: Vec2 = [p[0] + ((b[0] - p[0]) / lb) * r, p[1] + ((b[1] - p[1]) / lb) * r];
      const steps = 10;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const mt = 1 - t;
        push(mt * mt * p0[0] + 2 * mt * t * p[0] + t * t * p1[0], mt * mt * p0[1] + 2 * mt * t * p[1] + t * t * p1[1]);
      }
    }
    if (!closed) push(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    else push(this.xs[0], this.zs[0]);

    let total = 0;
    this.cum.push(0);
    for (let i = 1; i < this.xs.length; i++) {
      total += Math.hypot(this.xs[i] - this.xs[i - 1], this.zs[i] - this.zs[i - 1]);
      this.cum.push(total);
    }
    this.length = total;
  }

  /** u in [0, 1] along the arc length. */
  at(u: number, out: PathPoint = { x: 0, z: 0, heading: 0 }): PathPoint {
    const d = (this.closed ? ((u % 1) + 1) % 1 : Math.min(1, Math.max(0, u))) * this.length;
    let lo = 0;
    let hi = this.cum.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (this.cum[mid] <= d) lo = mid;
      else hi = mid;
    }
    const seg = this.cum[hi] - this.cum[lo] || 1;
    const t = (d - this.cum[lo]) / seg;
    const dx = this.xs[hi] - this.xs[lo];
    const dz = this.zs[hi] - this.zs[lo];
    out.x = this.xs[lo] + dx * t;
    out.z = this.zs[lo] + dz * t;
    out.heading = Math.atan2(-dz, dx);
    return out;
  }

  /** Evenly spaced points, used for route ribbons and SVG polylines. */
  sample(count: number, u0 = 0, u1 = 1): Vec2[] {
    const out: Vec2[] = [];
    const p: PathPoint = { x: 0, z: 0, heading: 0 };
    for (let i = 0; i <= count; i++) {
      this.at(u0 + ((u1 - u0) * i) / count, p);
      out.push([p.x, p.z]);
    }
    return out;
  }
}

/** Branded truck: out of dock, east along the road to the destination kerb. */
export const DELIVERY_ROUTE = new RoutePath(
  [TRUCK_DOCKED, [TRUCK_DOCK_X, LANE_EAST], [DEST.x - 2, LANE_EAST]],
  4.5,
);
/** Continues past the destination and out of frame (express loop). */
export const DELIVERY_EXIT = new RoutePath([[DEST.x - 2, LANE_EAST], [ROAD_A.x1 - 20, LANE_EAST]]);

/** Pickup van: sender's kerb, along the road and into the hub yard. */
export const PICKUP_ROUTE = new RoutePath(
  [[ORIGIN.x, LANE_EAST], [-24, LANE_EAST], [-24, 18.6]],
  4,
);

export const TRAFFIC_EAST = new RoutePath([[ROAD_A.x0 + 30, LANE_EAST], [ROAD_A.x1 - 30, LANE_EAST]]);
export const TRAFFIC_WEST = new RoutePath([[ROAD_A.x1 - 30, LANE_WEST], [ROAD_A.x0 + 30, LANE_WEST]]);

/** Forklift: from the pallet rows to open dock door 0. */
export const FORKLIFT_ROUTE = new RoutePath([[-10.5, 19.6], [-0.2, 19.6], [-0.2, 14.6]], 3);

/** Airport tug pulling cargo dollies around the aircraft (closed loop). */
export const TUG_LOOP = new RoutePath(
  [
    [70, -84], [86, -78], [118, -78], [132, -88], [132, -112], [118, -124], [86, -124], [70, -116],
  ],
  7,
  true,
);

/** Yard truck along the quay (closed loop). */
export const YARD_LOOP = new RoutePath(
  [
    [-120, -54], [-120, -118], [-112, -118], [-112, -54],
  ],
  4,
  true,
);

/* ------------------------------------------------------------------ */
/* Selectable objects and camera presets                               */
/* ------------------------------------------------------------------ */

/** Bounding boxes (center + size) for selection brackets. */
export const SELECTION_BOUNDS = {
  truck: { c: [TRUCK_DOCKED[0], 2.4, TRUCK_DOCKED[1]], s: [3.6, 4.8, TRUCK_LEN + 0.6] },
  hub: { c: [7, 6, 0], s: [HUB.w + ANNEX.w + 2, HUB.h + HUB.roofRise + 0.6, HUB.d + 2] },
  parcel: { c: [SAMPLE_PARCEL_SPOT[0], 1.25, SAMPLE_PARCEL_SPOT[1]], s: [2.2, 2.5, 2.2] },
  destination: { c: [DEST.x, DEST.h / 2 + 0.6, DEST.z], s: [DEST.w + 1.2, DEST.h + 1.6, DEST.d + 1.2] },
} as const;

export type Framing = {
  /** World point to frame. */
  target: readonly [number, number, number];
  /** Visible world width at the target. */
  width: number;
  /** Minimum visible world height at the target. */
  height?: number;
  /** Degrees above the horizon. */
  elevation: number;
  /** Degrees; 45 looks from the south-east. */
  azimuth: number;
  /** Where the target sits in the frame, as a fraction of width/height from centre. */
  offset?: readonly [number, number];
};

export const FRAMINGS = {
  "hero:overview": { target: [12, 2, 8], width: 118, height: 70, elevation: 34, azimuth: 45 },
  "hero:truck": { target: [TRUCK_DOCKED[0], 2, TRUCK_DOCKED[1] - 2], width: 60, height: 40, elevation: 33, azimuth: 42 },
  "hero:hub": { target: [7, 4, 2], width: 100, height: 62, elevation: 34, azimuth: 45 },
  "hero:parcel": { target: [SAMPLE_PARCEL_SPOT[0], 1, SAMPLE_PARCEL_SPOT[1]], width: 44, height: 30, elevation: 36, azimuth: 46 },
  "hero:destination": { target: [DEST.x - 2, 3, DEST.z + 6], width: 74, height: 48, elevation: 33, azimuth: 44, offset: [-0.08, 0.07] },
  "services:express": { target: [40, 0, 18], width: 128, height: 62, elevation: 36, azimuth: 45 },
  "services:air": { target: [96, 3, -99], width: 86, height: 56, elevation: 35, azimuth: 50 },
  "services:ocean": { target: [-122, 0, -84], width: 108, height: 66, elevation: 36, azimuth: 42 },
  "journey:0": { target: [ORIGIN.x + 4, 2, ORIGIN.z + 12], width: 56, height: 46, elevation: 34, azimuth: 45 },
  "journey:1": { target: [-2, 2, 12], width: 72, height: 56, elevation: 34, azimuth: 45 },
  "journey:2": { target: [40, 1, 22], width: 92, height: 64, elevation: 36, azimuth: 45 },
  "journey:3": { target: [DEST.x - 2, 3, DEST.z + 12], width: 58, height: 46, elevation: 34, azimuth: 45 },
} as const satisfies Record<string, Framing>;

export type FramingId = keyof typeof FRAMINGS;
