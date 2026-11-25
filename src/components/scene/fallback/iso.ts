import { shade } from "../palette";

/**
 * Minimal isometric SVG renderer.
 *
 * Projects world boxes with the same south-east camera as the WebGL scene
 * (azimuth 45°, elevation 35°) and orders them with a topological sort so
 * overlapping objects paint correctly.
 */

const EL = (35 * Math.PI) / 180;
const A = Math.SQRT1_2;
const SY = A * Math.sin(EL);
const SZ = Math.cos(EL);

export type V3 = readonly [number, number, number];
export type P2 = [number, number];

export function project(x: number, y: number, z: number): P2 {
  return [(x - z) * A, (x + z) * SY - y * SZ];
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function pathOf(points: P2[]): string {
  let d = "";
  for (let i = 0; i < points.length; i++) d += `${i ? "L" : "M"}${r1(points[i][0])} ${r1(points[i][1])}`;
  return d + "Z";
}

export type Shape =
  | { k: "path"; d: string; fill?: string; stroke?: string; sw?: number; op?: number; cls?: string; dash?: string; cap?: "round" }
  | { k: "circle"; cx: number; cy: number; r: number; fill: string; op?: number; stroke?: string; sw?: number }
  | { k: "image"; href: string; transform: string; w: number; h: number };

export type AABB = { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };

type Node = { box: AABB; shapes: Shape[]; sx0: number; sx1: number; sy0: number; sy1: number };

export type BoxSpec = AABB & { color: string; top?: string; south?: string; east?: string; stroke?: string };

export function boxShapes(b: BoxSpec): Shape[] {
  const { x0, x1, y0, y1, z0, z1 } = b;
  const stroke = b.stroke;
  const east = [project(x1, y0, z1), project(x1, y0, z0), project(x1, y1, z0), project(x1, y1, z1)];
  const south = [project(x0, y0, z1), project(x1, y0, z1), project(x1, y1, z1), project(x0, y1, z1)];
  const top = [project(x0, y1, z0), project(x1, y1, z0), project(x1, y1, z1), project(x0, y1, z1)];
  return [
    { k: "path", d: pathOf(east), fill: b.east ?? shade(b.color, -0.16), stroke, sw: stroke ? 0.12 : undefined },
    { k: "path", d: pathOf(south), fill: b.south ?? b.color, stroke, sw: stroke ? 0.12 : undefined },
    { k: "path", d: pathOf(top), fill: b.top ?? shade(b.color, 0.12), stroke, sw: stroke ? 0.12 : undefined },
  ];
}

/** A flat polygon on a horizontal plane at height y. */
export function flat(points: readonly (readonly [number, number])[], y: number, fill: string, extra: Partial<Extract<Shape, { k: "path" }>> = {}): Shape {
  return { k: "path", d: pathOf(points.map(([x, z]) => project(x, y, z))), fill, ...extra };
}

export function rect(x0: number, z0: number, x1: number, z1: number, y: number, fill: string, extra: Partial<Extract<Shape, { k: "path" }>> = {}): Shape {
  return flat([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y, fill, extra);
}

/** Rectangle on the south face (z fixed) spanning x and y. */
export function southRect(z: number, x0: number, x1: number, y0: number, y1: number, fill: string, extra: Partial<Extract<Shape, { k: "path" }>> = {}): Shape {
  return { k: "path", d: pathOf([project(x0, y0, z), project(x1, y0, z), project(x1, y1, z), project(x0, y1, z)]), fill, ...extra };
}

/** Rectangle on the east face (x fixed) spanning z and y. */
export function eastRect(x: number, z0: number, z1: number, y0: number, y1: number, fill: string, extra: Partial<Extract<Shape, { k: "path" }>> = {}): Shape {
  return { k: "path", d: pathOf([project(x, y0, z1), project(x, y0, z0), project(x, y1, z0), project(x, y1, z1)]), fill, ...extra };
}

/** Places an image on a face given its top-left corner and right/down edge vectors. */
export function faceImage(origin: V3, right: V3, down: V3, href: string, w: number, h: number): Shape {
  const o = project(...origin);
  const r = project(origin[0] + right[0], origin[1] + right[1], origin[2] + right[2]);
  const d = project(origin[0] + down[0], origin[1] + down[1], origin[2] + down[2]);
  const m = [(r[0] - o[0]) / w, (r[1] - o[1]) / w, (d[0] - o[0]) / h, (d[1] - o[1]) / h, o[0], o[1]].map((n) => Math.round(n * 10000) / 10000);
  return { k: "image", href, transform: `matrix(${m.join(" ")})`, w, h };
}

const EPS = 0.01;

/** True when a must be painted before b. */
function before(a: AABB, b: AABB): boolean | null {
  if (a.x1 <= b.x0 + EPS) return true;
  if (b.x1 <= a.x0 + EPS) return false;
  if (a.z1 <= b.z0 + EPS) return true;
  if (b.z1 <= a.z0 + EPS) return false;
  if (a.y1 <= b.y0 + EPS) return true;
  if (b.y1 <= a.y0 + EPS) return false;
  return null;
}

export function sortBoxes<T extends { box: AABB }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const o = before(a.box, b.box);
    if (o === null) return a.box.x0 + a.box.x1 + a.box.z0 + a.box.z1 - (b.box.x0 + b.box.x1 + b.box.z0 + b.box.z1);
    return o ? -1 : 1;
  });
}

export class IsoCanvas {
  readonly ground: Shape[] = [];
  readonly markings: Shape[] = [];
  readonly overlay: Shape[] = [];
  private nodes: Node[] = [];

  constructor(readonly view: { x: number; y: number; w: number; h: number }) {}

  /** Cheap visibility test against the view box (with margin). */
  visible(box: AABB): boolean {
    const b = this.screenBounds(box);
    const m = 6;
    return !(b.sx1 < this.view.x - m || b.sx0 > this.view.x + this.view.w + m || b.sy1 < this.view.y - m || b.sy0 > this.view.y + this.view.h + m);
  }

  private screenBounds(box: AABB) {
    let sx0 = Infinity;
    let sx1 = -Infinity;
    let sy0 = Infinity;
    let sy1 = -Infinity;
    for (const x of [box.x0, box.x1])
      for (const y of [box.y0, box.y1])
        for (const z of [box.z0, box.z1]) {
          const [px, py] = project(x, y, z);
          if (px < sx0) sx0 = px;
          if (px > sx1) sx1 = px;
          if (py < sy0) sy0 = py;
          if (py > sy1) sy1 = py;
        }
    return { sx0, sx1, sy0, sy1 };
  }

  add(box: AABB, shapes: Shape[]) {
    if (!this.visible(box)) return;
    this.nodes.push({ box, shapes, ...this.screenBounds(box) });
  }

  addBox(spec: BoxSpec) {
    this.add(spec, boxShapes(spec));
  }

  /** Topologically ordered shapes for all nodes that overlap on screen. */
  orderedShapes(): Shape[] {
    const nodes = this.nodes;
    const n = nodes.length;
    const after: number[][] = Array.from({ length: n }, () => []);
    const indegree = new Array<number>(n).fill(0);
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        if (a.sx1 <= b.sx0 || b.sx1 <= a.sx0 || a.sy1 <= b.sy0 || b.sy1 <= a.sy0) continue;
        let o = before(a.box, b.box);
        if (o === null) o = a.box.x0 + a.box.x1 + a.box.z0 + a.box.z1 <= b.box.x0 + b.box.x1 + b.box.z0 + b.box.z1;
        if (o) {
          after[i].push(j);
          indegree[j]++;
        } else {
          after[j].push(i);
          indegree[i]++;
        }
      }
    }
    // Kahn's algorithm with a depth-ordered ready queue; any cycle falls back to depth order.
    const depth = (k: number) => nodes[k].box.x0 + nodes[k].box.x1 + nodes[k].box.z0 + nodes[k].box.z1;
    const done = new Array<boolean>(n).fill(false);
    const order: number[] = [];
    const ready = nodes.map((_, k) => k).filter((k) => indegree[k] === 0);
    while (order.length < n) {
      if (!ready.length) {
        let pick = -1;
        for (let k = 0; k < n; k++) if (!done[k] && (pick < 0 || depth(k) < depth(pick))) pick = k;
        ready.push(pick);
      }
      ready.sort((p, q) => depth(q) - depth(p));
      const k = ready.pop()!;
      if (done[k]) continue;
      done[k] = true;
      order.push(k);
      for (const m of after[k]) if (--indegree[m] === 0 && !done[m]) ready.push(m);
    }
    return order.flatMap((k) => nodes[k].shapes);
  }
}
