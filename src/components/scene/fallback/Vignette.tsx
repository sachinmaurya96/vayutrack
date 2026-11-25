import type { UseCaseArt } from "@/content/home";
import { PALETTE as C, shade } from "../palette";
import { IsoCanvas, boxShapes, eastRect, flat, pathOf, project, southRect, type Shape } from "./iso";
import { palletStack, pin, tree, vehicle } from "./world";

type Bounds = { x0: number; x1: number; z0: number; z1: number; top: number };

function platform(iso: IsoCanvas, b: Bounds) {
  iso.ground.push(...boxShapes({ x0: b.x0, x1: b.x1, y0: -1.4, y1: 0, z0: b.z0, z1: b.z1, color: "#d9e2f0", top: "#e7edf7", east: "#c6d2e5" }));
}

function house(iso: IsoCanvas, x: number, z: number) {
  const w = 10;
  const d = 8;
  const h = 5.4;
  const rise = 3;
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const z0 = z - d / 2;
  const z1 = z + d / 2;
  const shapes: Shape[] = boxShapes({ x0, x1, y0: 0, y1: h, z0, z1, color: "#fbfcfe" });
  shapes.push(southRect(z1, x - 0.9, x + 0.9, 0, 2.4, C.houseDoor));
  for (const wx of [x0 + 1.2, x1 - 3]) shapes.push(southRect(z1, wx, wx + 1.8, 1, 2.3, C.glassDark));
  shapes.push(eastRect(x1, z0 + 1.5, z0 + 3.5, 1.2, 2.6, shade(C.glassDark, -0.1)));
  const yr = h + rise;
  shapes.push({ k: "path", d: pathOf([project(x1, h, z1), project(x1, h, z0), project(x1, yr, z)]), fill: shade(C.house, -0.14) });
  shapes.push({ k: "path", d: pathOf([project(x0 - 0.5, h - 0.3, z0 - 0.5), project(x1 + 0.5, h - 0.3, z0 - 0.5), project(x1 + 0.5, yr, z), project(x0 - 0.5, yr, z)]), fill: shade(C.houseRoof, 0.1) });
  shapes.push({ k: "path", d: pathOf([project(x0 - 0.5, yr, z), project(x1 + 0.5, yr, z), project(x1 + 0.5, h - 0.3, z1 + 0.5), project(x0 - 0.5, h - 0.3, z1 + 0.5)]), fill: C.houseRoof });
  iso.add({ x0, x1, y0: 0, y1: yr, z0, z1 }, shapes);
}

function shop(iso: IsoCanvas, x0: number, x1: number, z0: number, z1: number) {
  const h = 6;
  const shapes: Shape[] = boxShapes({ x0, x1, y0: 0, y1: h, z0, z1, color: "#fbfcfe" });
  shapes.push(southRect(z1, x0 + 1, x1 - 4, 0.8, 3.4, C.glass));
  shapes.push(southRect(z1, x1 - 3.2, x1 - 1.2, 0, 3.4, C.glassDark));
  shapes.push(eastRect(x1, z0 + 1, z1 - 1, 1.2, 3.4, shade(C.glass, -0.12)));
  // Striped awning.
  const stripes = 8;
  const step = (x1 - x0) / stripes;
  for (let i = 0; i < stripes; i++) {
    const sx = x0 + i * step;
    shapes.push({ k: "path", d: pathOf([project(sx, 4.6, z1 + 1.6), project(sx + step, 4.6, z1 + 1.6), project(sx + step, 5.4, z1), project(sx, 5.4, z1)]), fill: i % 2 ? "#ffffff" : C.highlight });
  }
  shapes.push(southRect(z1, x0, x1, 5.4, 6, C.truckCab));
  iso.add({ x0, x1, y0: 0, y1: h, z0, z1: z1 + 1.6 }, shapes);
}

function office(iso: IsoCanvas, x0: number, x1: number, z0: number, z1: number) {
  const h = 10;
  const shapes: Shape[] = boxShapes({ x0, x1, y0: 0, y1: h, z0, z1, color: C.destWall });
  for (let f = 0; f < 3; f++) {
    const y = f * 3.2 + 0.9;
    shapes.push(southRect(z1, x0 + 0.8, x1 - 0.8, y, y + 1.9, C.destGlass));
    shapes.push(eastRect(x1, z0 + 0.8, z1 - 0.8, y, y + 1.9, shade(C.destGlass, -0.14)));
  }
  shapes.push(...boxShapes({ x0: x0 + 2, x1: x0 + 5, y0: h, y1: h + 1.2, z0: z0 + 2, z1: z0 + 4.5, color: "#f1f5fa" }));
  iso.add({ x0, x1, y0: 0, y1: h + 1.2, z0, z1 }, shapes);
}

function documentSheet(iso: IsoCanvas, x: number, z: number) {
  const shapes = boxShapes({ x0: x - 0.9, x1: x + 0.9, y0: 0, y1: 0.18, z0: z - 0.65, z1: z + 0.65, color: "#ffffff", east: "#dbe3ef", south: "#eef2f8" });
  shapes.push(flat([[x - 0.6, z - 0.3], [x + 0.5, z - 0.3], [x + 0.5, z - 0.15], [x - 0.6, z - 0.15]], 0.19, C.highlight));
  shapes.push(flat([[x - 0.6, z + 0.05], [x + 0.2, z + 0.05], [x + 0.2, z + 0.18], [x - 0.6, z + 0.18]], 0.19, "#b9c7da"));
  iso.add({ x0: x - 0.9, x1: x + 0.9, y0: 0, y1: 0.18, z0: z - 0.65, z1: z + 0.65 }, shapes);
}

function parcelBox(iso: IsoCanvas, x: number, z: number, s = 0.75, color: string = C.cardboard) {
  const shapes = boxShapes({ x0: x - s, x1: x + s, y0: 0, y1: s * 1.7, z0: z - s, z1: z + s, color });
  shapes.push(flat([[x - 0.12, z - s], [x + 0.12, z - s], [x + 0.12, z + s], [x - 0.12, z + s]], s * 1.7, C.highlight));
  iso.add({ x0: x - s, x1: x + s, y0: 0, y1: s * 1.7, z0: z - s, z1: z + s }, shapes);
}

const builds: Record<UseCaseArt, { bounds: Bounds; build: (iso: IsoCanvas) => void }> = {
  individual: {
    bounds: { x0: -10, x1: 10, z0: -9, z1: 7, top: 9 },
    build(iso) {
      iso.markings.push(flat([[-5, 0], [-3, 0], [-3, 7], [-5, 7]], 0.01, "#f7f9fc"));
      house(iso, -4, -4);
      parcelBox(iso, -1.2, 2.2);
      documentSheet(iso, 1.3, 3.4);
      tree(iso, 6.5, -5, 1.1);
      tree(iso, 7, 3.5, 0.9);
      pin(iso, -1.2, 5.6, 2.2);
    },
  },
  ecommerce: {
    bounds: { x0: -13, x1: 12, z0: -10, z1: 9, top: 8 },
    build(iso) {
      shop(iso, -12, -1, -9, -2);
      palletStack(iso, 4, -6.5, 2, false);
      palletStack(iso, 7.2, -6.5, 1, false);
      palletStack(iso, 4, -3.2, 1, true);
      parcelBox(iso, 9, -2, 0.6);
      vehicle(iso, { x: 0, z: 5, heading: 0, visible: true, scale: 1 }, "van", true);
      pin(iso, 4, 4.6, -6.5);
      tree(iso, 10.5, 6.5, 0.9);
    },
  },
  business: {
    bounds: { x0: -15, x1: 15, z0: -11, z1: 11, top: 12 },
    build(iso) {
      office(iso, 1, 14, -10, -1);
      palletStack(iso, -6, -7, 2, false);
      palletStack(iso, -9.4, -7, 3, false);
      palletStack(iso, -6, -3.6, 1, true);
      palletStack(iso, -9.4, -3.6, 2, false);
      vehicle(iso, { x: -1, z: 6, heading: 0, visible: true, scale: 1 }, "truck", true);
      tree(iso, 12, 7.5, 1);
    },
  },
};

export function Vignette({ art, className = "" }: { art: UseCaseArt; className?: string }) {
  const { bounds: b, build } = builds[art];
  let sx0 = Infinity;
  let sx1 = -Infinity;
  let sy0 = Infinity;
  let sy1 = -Infinity;
  for (const x of [b.x0, b.x1])
    for (const z of [b.z0, b.z1])
      for (const y of [-1.4, b.top]) {
        const [px, py] = project(x, y, z);
        sx0 = Math.min(sx0, px);
        sx1 = Math.max(sx1, px);
        sy0 = Math.min(sy0, py);
        sy1 = Math.max(sy1, py);
      }
  const pad = 2;
  const view = { x: sx0 - pad, y: sy0 - pad, w: sx1 - sx0 + pad * 2, h: sy1 - sy0 + pad * 2 };
  const iso = new IsoCanvas(view);
  platform(iso, b);
  build(iso);
  const shapes = [...iso.ground, ...iso.markings, ...iso.orderedShapes(), ...iso.overlay];
  return (
    <svg viewBox={`${view.x.toFixed(1)} ${view.y.toFixed(1)} ${view.w.toFixed(1)} ${view.h.toFixed(1)}`} className={className} aria-hidden="true">
      <ellipse cx={(sx0 + sx1) / 2} cy={sy1 - 0.5} rx={(sx1 - sx0) * 0.42} ry={2.2} fill="#0a2c4e" opacity="0.08" />
      {shapes.map((s, i) =>
        s.k === "path" ? (
          <path
            key={i}
            d={s.d}
            fill={s.fill ?? "none"}
            stroke={s.stroke ?? (s.fill && s.fill !== "none" ? "#0a2c4e" : undefined)}
            strokeOpacity={s.stroke ? undefined : 0.14}
            strokeWidth={s.sw ?? 0.07}
            strokeLinejoin="round"
            opacity={s.op}
            strokeLinecap={s.cap}
          />
        ) : s.k === "circle" ? (
          <circle key={i} cx={s.cx.toFixed(1)} cy={s.cy.toFixed(1)} r={s.r.toFixed(2)} fill={s.fill} opacity={s.op} stroke={s.stroke} strokeWidth={s.sw} />
        ) : (
          <image key={i} href={s.href} width={s.w} height={s.h} transform={s.transform} preserveAspectRatio="none" />
        ),
      )}
    </svg>
  );
}
