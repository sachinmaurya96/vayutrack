"use client";

import { Line } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALLETS, TREES, type RoutePath } from "../../layout";
import { PALETTE as C, shade } from "../../palette";
import { basic, cylinder, getDashTexture, getGlowTexture, mat, rbox, sphere, unitBox, unitPlane } from "../resources";

/** All parcels on all pallets in two instanced draws. */
export function PalletStacks() {
  const parcels = useRef<THREE.InstancedMesh>(null);
  const tape = useRef<THREE.InstancedMesh>(null);
  const layout = useMemo(() => {
    const boxes: [number, number, number, number][] = [];
    for (const p of PALLETS) {
      if (p.wrapped) continue;
      for (let l = 0; l < p.layers; l++)
        for (const dx of [-0.53, 0.53])
          for (const dz of [-0.53, 0.53]) {
            if (l === p.layers - 1 && p.layers > 1 && dx > 0 && dz > 0 && (p.x * 7 + p.z) % 3 < 1) continue;
            boxes.push([p.x + dx, 0.32 + l * 1.02 + 0.5, p.z + dz, ((p.x * 13 + p.z * 7 + l) % 5) / 5]);
          }
    }
    return boxes;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const color = new THREE.Color();
    layout.forEach(([x, y, z, v], i) => {
      m.makeTranslation(x, y, z);
      parcels.current!.setMatrixAt(i, m);
      parcels.current!.setColorAt(i, color.set(shade(C.cardboard, (v - 0.5) * 0.12)));
      m.makeScale(0.2, 1, 1.02).setPosition(x, y + 0.5, z);
      tape.current!.setMatrixAt(i, m);
    });
    parcels.current!.instanceMatrix.needsUpdate = true;
    if (parcels.current!.instanceColor) parcels.current!.instanceColor.needsUpdate = true;
    tape.current!.instanceMatrix.needsUpdate = true;
  }, [layout]);
  return (
    <group>
      {PALLETS.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh geometry={rbox(2.3, 0.3, 2.3, 0.05)} material={mat(C.pallet, { rough: 0.9 })} position={[0, 0.16, 0]} castShadow receiveShadow />
          {p.wrapped && <mesh geometry={rbox(2.15, p.layers * 1.02, 2.15, 0.14)} material={mat(C.wrapBlue, { rough: 0.35 })} position={[0, 0.32 + (p.layers * 1.02) / 2, 0]} castShadow />}
        </group>
      ))}
      <instancedMesh ref={parcels} args={[rbox(1, 1, 1, 0.06), mat("#ffffff", { rough: 0.9 }), layout.length]} castShadow receiveShadow />
      <instancedMesh ref={tape} args={[unitPlane(), mat(C.tape, { rough: 0.7, polygonOffset: 1 }), layout.length]} />
    </group>
  );
}

export function Trees() {
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    TREES.forEach((t, i) => {
      m.makeScale(1.9 * t.s, 2.2 * t.s, 1.9 * t.s).setPosition(t.x, 3.7 * t.s, t.z);
      crowns.current!.setMatrixAt(i, m);
      crowns.current!.setColorAt(i, c.set(i % 3 === 0 ? C.treeCrownLight : C.treeCrown));
      m.makeScale(t.s, t.s, t.s).setPosition(t.x, 1.3 * t.s, t.z);
      trunks.current!.setMatrixAt(i, m);
    });
    crowns.current!.instanceMatrix.needsUpdate = true;
    if (crowns.current!.instanceColor) crowns.current!.instanceColor.needsUpdate = true;
    trunks.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={crowns} args={[sphere(1, 14, 10), mat("#ffffff", { rough: 0.85 }), TREES.length]} castShadow receiveShadow />
      <instancedMesh ref={trunks} args={[cylinder(0.2, 0.28, 2.6, 6), mat(C.trunk, { rough: 0.8 }), TREES.length]} castShadow />
    </group>
  );
}

/** Location pin, like a map marker, floating above a point. */
export const Pin = forwardRef<THREE.Group, ThreeElements["group"] & { color?: string }>(function Pin({ color = C.pin, ...props }, ref) {
  const m = mat(color, { rough: 0.35, emissive: color, emissiveIntensity: 0.15 });
  return (
    <group ref={ref} {...props}>
      <mesh geometry={sphere(0.95, 20, 14)} material={m} position={[0, 1.9, 0]} castShadow />
      <mesh geometry={cylinder(0.78, 0.02, 1.7, 20)} material={m} position={[0, 0.95, 0]} castShadow />
      <mesh geometry={sphere(0.42, 16, 10)} material={mat("#ffffff", { rough: 0.4 })} position={[0, 1.95, 0.62]} />
    </group>
  );
});

/** A single parcel used for the sample shipment and the journey. */
export const Parcel = forwardRef<THREE.Group, ThreeElements["group"] & { highlighted?: boolean }>(function Parcel({ highlighted = false, ...props }, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh geometry={rbox(1.25, 1.15, 1.25, 0.08)} material={highlighted ? mat(C.highlight, { rough: 0.45, emissive: C.highlight, emissiveIntensity: 0.18 }) : mat(C.cardboard, { rough: 0.9 })} position={[0, 0.58, 0]} castShadow />
      <mesh geometry={unitBox()} material={mat(highlighted ? "#dbe7ff" : C.highlight, { rough: 0.6 })} position={[0, 1.16, 0]} scale={[0.22, 0.02, 1.27]} />
      <mesh geometry={unitBox()} material={mat(highlighted ? "#dbe7ff" : "#ffffff", { rough: 0.6 })} position={[0.3, 0.6, 0.63]} scale={[0.5, 0.35, 0.02]} />
    </group>
  );
});

/** Corner brackets and a soft footprint around a selected object. */
export function SelectionMarker({ center, size, visible }: { center: readonly number[]; size: readonly number[]; visible: boolean }) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size;
  const segments = useMemo(() => {
    const k = Math.min(sx, sy, sz) * 0.22 + 0.6;
    const pts: [number, number, number][] = [];
    for (const x of [-sx / 2, sx / 2])
      for (const y of [-sy / 2, sy / 2])
        for (const z of [-sz / 2, sz / 2]) {
          const dx = x < 0 ? k : -k;
          const dy = y < 0 ? k : -k;
          const dz = z < 0 ? k : -k;
          pts.push([x, y, z], [x + dx, y, z], [x, y, z], [x, y + dy, z], [x, y, z], [x, y, z + dz]);
        }
    return pts;
  }, [sx, sy, sz]);
  return (
    <group position={[cx, cy, cz]} visible={visible}>
      <Line points={segments} segments color={C.highlight} lineWidth={2.6} transparent opacity={0.95} depthTest={false} renderOrder={10} />
      <mesh geometry={unitPlane()} material={basic(C.highlight, 0.32, getGlowTexture())} position={[0, -sy / 2 + 0.08, 0]} scale={[sx + 2.4, 1, sz + 2.4]} />
    </group>
  );
}

/** Flat ribbon following a route, with an animated dashed centre line. */
export function RouteRibbon({ route, width = 2.2, dashRef }: { route: RoutePath; width?: number; dashRef: React.Ref<THREE.Mesh> }) {
  const [base, dash] = useMemo(() => {
    const make = (w: number) => {
      const pts = route.sample(160);
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      let along = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x, z] = pts[i];
        const [nx0, nz0] = pts[Math.min(i + 1, pts.length - 1)];
        const [px0, pz0] = pts[Math.max(i - 1, 0)];
        let dx = nx0 - px0;
        let dz = nz0 - pz0;
        const len = Math.hypot(dx, dz) || 1;
        dx /= len;
        dz /= len;
        if (i) along += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]);
        pos.push(x - dz * (w / 2), 0, z + dx * (w / 2), x + dz * (w / 2), 0, z - dx * (w / 2));
        uv.push(along / 4, 0, along / 4, 1);
        if (i) {
          const a = (i - 1) * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };
    return [make(width), make(width * 0.42)];
  }, [route, width]);
  const dashMat = useMemo(() => {
    const tex = getDashTexture().clone();
    tex.needsUpdate = true;
    return new THREE.MeshBasicMaterial({ color: "#ffffff", map: tex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  }, []);
  const baseMat = useMemo(() => new THREE.MeshBasicMaterial({ color: C.highlight, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }), []);
  return (
    <group position={[0, 0.09, 0]}>
      <mesh geometry={base} material={baseMat} renderOrder={2} />
      <mesh ref={dashRef} geometry={dash} material={dashMat} position={[0, 0.02, 0]} renderOrder={3} />
    </group>
  );
}

/** Soft blue disc that marks a delivery point. */
export function DropZone(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh geometry={unitPlane()} material={basic(C.highlight, 0.28, getGlowTexture())} position={[0, 0.08, 0]} scale={[4.2, 1, 4.2]} />
    </group>
  );
}

export function Checkmark(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh geometry={sphere(0.9, 20, 14)} material={mat(C.success, { rough: 0.4, emissive: C.success, emissiveIntensity: 0.15 })} castShadow />
      <mesh geometry={unitBox()} material={mat("#ffffff")} position={[-0.2, -0.05, 0.78]} rotation={[0, 0, Math.PI / 4]} scale={[0.45, 0.14, 0.2]} />
      <mesh geometry={unitBox()} material={mat("#ffffff")} position={[0.17, 0.08, 0.78]} rotation={[0, 0, -Math.PI / 3.6]} scale={[0.75, 0.14, 0.2]} />
    </group>
  );
}
