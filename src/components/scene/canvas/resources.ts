import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Shared GPU resources. Materials and geometries are cached by key so every
 * repeated prop reuses the same objects.
 */

type MatOpts = {
  rough?: number;
  metal?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  map?: THREE.Texture | null;
  side?: THREE.Side;
  depthWrite?: boolean;
  polygonOffset?: number;
};

const materials = new Map<string, THREE.MeshStandardMaterial>();

export function mat(color: string, opts: MatOpts = {}): THREE.MeshStandardMaterial {
  const key = `${color}|${opts.rough ?? ""}|${opts.metal ?? ""}|${opts.emissive ?? ""}|${opts.emissiveIntensity ?? ""}|${opts.transparent ?? ""}|${opts.opacity ?? ""}|${opts.map?.uuid ?? ""}|${opts.side ?? ""}|${opts.depthWrite ?? ""}|${opts.polygonOffset ?? ""}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.82,
      metalness: opts.metal ?? 0,
      emissive: opts.emissive ?? "#000000",
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      transparent: opts.transparent ?? false,
      opacity: opts.opacity ?? 1,
      map: opts.map ?? null,
      side: opts.side ?? THREE.FrontSide,
      depthWrite: opts.depthWrite ?? true,
    });
    if (opts.polygonOffset) {
      m.polygonOffset = true;
      m.polygonOffsetFactor = -opts.polygonOffset;
      m.polygonOffsetUnits = -opts.polygonOffset;
    }
    materials.set(key, m);
  }
  return m;
}

const basics = new Map<string, THREE.MeshBasicMaterial>();

export function basic(color: string, opacity = 1, map: THREE.Texture | null = null): THREE.MeshBasicMaterial {
  const key = `${color}|${opacity}|${map?.uuid ?? ""}`;
  let m = basics.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1 || !!map, opacity, map, depthWrite: false, toneMapped: false });
    basics.set(key, m);
  }
  return m;
}

const geometries = new Map<string, THREE.BufferGeometry>();

function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geometries.get(key) as T | undefined;
  if (!g) {
    g = make();
    geometries.set(key, g);
  }
  return g;
}

/** Unit box; scale the mesh to size it. */
export const unitBox = () => cached("unitBox", () => new THREE.BoxGeometry(1, 1, 1));
/** Unit plane lying flat (facing +y). */
export const unitPlane = () => cached("unitPlane", () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));

export function rbox(w: number, h: number, d: number, r = 0.15, seg = 2) {
  const k = (n: number) => n.toFixed(2);
  return cached(`rbox|${k(w)}|${k(h)}|${k(d)}|${k(r)}|${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r));
}

export function cylinder(rTop: number, rBottom: number, h: number, seg = 16) {
  return cached(`cyl|${rTop}|${rBottom}|${h}|${seg}`, () => new THREE.CylinderGeometry(rTop, rBottom, h, seg));
}

export function sphere(r: number, w = 16, h = 12) {
  return cached(`sph|${r}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h));
}

/** Prism from a 2D profile in the XY plane, extruded along Z and centred on Z. */
export function profile(key: string, points: [number, number][], depth: number, bevel = 0.06) {
  return cached(`prof|${key}|${depth}|${bevel}`, () => {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 4,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    return g;
  });
}

/** Flat polygon (in world XZ) extruded upward by `height`. */
export function slab(key: string, points: readonly (readonly [number, number])[], height: number, bevel = 0) {
  return cached(`slab|${key}|${height}|${bevel}`, () => {
    const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  });
}

/* ---------------------- procedural textures ---------------------- */

let dashTexture: THREE.CanvasTexture | null = null;

/** Rounded dash used for the animated route line. */
export function getDashTexture() {
  if (dashTexture) return dashTexture;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 32;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(8, 8, 56, 16, 8);
  ctx.fill();
  dashTexture = new THREE.CanvasTexture(c);
  dashTexture.wrapS = THREE.RepeatWrapping;
  dashTexture.anisotropy = 4;
  return dashTexture;
}

let ribTexture: THREE.CanvasTexture | null = null;

/** Light vertical ribbing multiplied over container colours. */
export function getRibTexture() {
  if (ribTexture) return ribTexture;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 8;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 64, 8);
  ctx.fillStyle = "#c9d0db";
  for (let x = 0; x < 64; x += 8) ctx.fillRect(x, 0, 3, 8);
  ribTexture = new THREE.CanvasTexture(c);
  ribTexture.wrapS = THREE.RepeatWrapping;
  ribTexture.repeat.set(6, 1);
  ribTexture.colorSpace = THREE.SRGBColorSpace;
  return ribTexture;
}

let glowTexture: THREE.CanvasTexture | null = null;

/** Soft rounded-rectangle glow for selection footprints. */
export function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.roundRect(10, 10, 108, 108, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,1)";
  ctx.lineWidth = 5;
  ctx.stroke();
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}

let blobTexture: THREE.CanvasTexture | null = null;

/** Soft contact shadow used under buildings and vehicles. */
export function getBlobTexture() {
  if (blobTexture) return blobTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
  g.addColorStop(0, "rgba(20,40,80,0.55)");
  g.addColorStop(0.6, "rgba(20,40,80,0.18)");
  g.addColorStop(1, "rgba(20,40,80,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  blobTexture = new THREE.CanvasTexture(c);
  return blobTexture;
}
