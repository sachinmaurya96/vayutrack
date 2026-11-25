"use client";

import { useTexture } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ANNEX, CITY_BLOCKS, DEST, DOCK_DOOR, DOCK_XS, HUB, OPEN_DOCKS, ORIGIN } from "../../layout";
import { PALETTE as C, shade } from "../../palette";
import { mat, profile, rbox, unitBox } from "../resources";

const box = unitBox;

function Gable({ x, w, d, h, rise, color, ...props }: { x: number; w: number; d: number; h: number; rise: number; color: string } & ThreeElements["group"]) {
  const tri = profile(`gable|${d}|${rise}`, [[-d / 2, 0], [d / 2, 0], [0, rise]], 0.2, 0);
  return (
    <group {...props}>
      {[x - w / 2 + 0.1, x + w / 2 - 0.1].map((gx) => (
        <mesh key={gx} geometry={tri} material={mat(color)} position={[gx, h, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      ))}
    </group>
  );
}

/** Two sloped slabs meeting at a ridge along x. */
function GableRoof({ w, d, h, rise, color, overhang = 0.7, thickness = 0.35 }: { w: number; d: number; h: number; rise: number; color: string; overhang?: number; thickness?: number }) {
  const half = d / 2 + overhang;
  const angle = Math.atan2(rise, d / 2);
  const len = Math.hypot(half, rise * (half / (d / 2)));
  const m = mat(color, { rough: 0.6 });
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          geometry={box()}
          material={m}
          position={[0, h + rise / 2 - (overhang * rise) / (d / 2) / 2, (s * half) / 2]}
          rotation={[s * angle, 0, 0]}
          scale={[w + overhang * 2, thickness, len]}
          castShadow
          receiveShadow
        />
      ))}
      <mesh geometry={box()} material={mat(shade(color, -0.15))} position={[0, h + rise + 0.05, 0]} scale={[w + overhang * 2, 0.3, 0.8]} castShadow />
    </>
  );
}

function Ribs({ w, d, h, rise, overhang = 0.7, spacing = 2.2 }: { w: number; d: number; h: number; rise: number; overhang?: number; spacing?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const half = d / 2 + overhang;
  const angle = Math.atan2(rise, d / 2);
  const len = Math.hypot(half, rise * (half / (d / 2)));
  const xs = useMemo(() => {
    const out: number[] = [];
    for (let x = -w / 2 + 1; x < w / 2; x += spacing) out.push(x);
    return out;
  }, [w, spacing]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    let i = 0;
    for (const s of [-1, 1])
      for (const x of xs) {
        e.set(s * angle, 0, 0);
        q.setFromEuler(e);
        const y = h + rise / 2 - (overhang * rise) / (d / 2) / 2 + 0.2;
        m.compose(new THREE.Vector3(x, y, (s * half) / 2), q, new THREE.Vector3(0.22, 0.12, len));
        ref.current!.setMatrixAt(i++, m);
      }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [xs, angle, h, rise, overhang, d, half, len]);
  return <instancedMesh ref={ref} args={[box(), mat(C.hubRoofRib, { rough: 0.6 }), xs.length * 2]} receiveShadow />;
}

export function Hub(props: ThreeElements["group"]) {
  const { w, d, h, roofRise } = HUB;
  const z1 = d / 2;
  const wall = mat(C.hubWall, { rough: 0.7 });
  const trim = mat(C.hubTrim, { rough: 0.5 });
  const doorClosed = mat(C.door, { rough: 0.6 });
  const doorOpen = mat(C.doorOpen, { rough: 0.9 });
  const seal = mat(C.bumper, { rough: 0.9 });
  const lines = mat(C.doorLine, { rough: 0.6 });
  return (
    <group {...props}>
      <mesh geometry={box()} material={wall} position={[0, h / 2, 0]} scale={[w, h, d]} castShadow receiveShadow />
      <mesh geometry={box()} material={mat(shade(C.hubWall, -0.25))} position={[0, 0.45, 0]} scale={[w + 0.12, 0.9, d + 0.12]} receiveShadow />
      <mesh geometry={box()} material={trim} position={[0, h - 0.25, 0]} scale={[w + 0.1, 0.5, d + 0.1]} castShadow />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} geometry={box()} material={trim} position={[(sx * w) / 2, h / 2, (sz * d) / 2]} scale={[0.5, h, 0.5]} />
      )))}
      <Gable x={0} w={w} d={d} h={h} rise={roofRise} color={C.hubWall} />
      <GableRoof w={w} d={d} h={h} rise={roofRise} color={C.hubRoof} />
      <Ribs w={w} d={d} h={h} rise={roofRise} />
      {/* Roof units and skylights */}
      {[-17, -5, 7, 18].map((x, i) => {
        const z = i % 2 ? -5 : 4.5;
        const y = h + roofRise * (1 - Math.abs(z) / (d / 2 + 0.7)) + 0.35;
        return (
          <group key={x} position={[x, y, z]}>
            <mesh geometry={rbox(3.4, 1.3, 2.4, 0.18)} material={mat("#f3f6fb", { rough: 0.5 })} position={[0, 0.5, 0]} castShadow />
            <mesh geometry={rbox(1.2, 0.2, 1.2, 0.08)} material={mat("#c3cddc")} position={[0.8, 1.2, 0]} />
          </group>
        );
      })}
      {/* Dock doors on the south face */}
      {DOCK_XS.map((x) => {
        const open = OPEN_DOCKS.has(x);
        return (
          <group key={x} position={[x, 0, z1]}>
            <mesh geometry={box()} material={trim} position={[0, (DOCK_DOOR.h + 1.2) / 2, 0.06]} scale={[DOCK_DOOR.w + 0.7, DOCK_DOOR.h + 0.5, 0.2]} />
            <mesh geometry={box()} material={open ? doorOpen : doorClosed} position={[0, 1.1 + (DOCK_DOOR.h - 1.1) / 2 + 0.1, 0.19]} scale={[DOCK_DOOR.w, DOCK_DOOR.h - 0.9, 0.08]} />
            {!open &&
              Array.from({ length: 6 }, (_, i) => (
                <mesh key={i} geometry={box()} material={lines} position={[0, 1.7 + i * 0.6, 0.24]} scale={[DOCK_DOOR.w - 0.1, 0.06, 0.04]} />
              ))}
            {open && (
              <>
                <mesh geometry={box()} material={seal} position={[-DOCK_DOOR.w / 2 - 0.2, 3, 0.3]} scale={[0.35, 4, 0.5]} />
                <mesh geometry={box()} material={seal} position={[DOCK_DOOR.w / 2 + 0.2, 3, 0.3]} scale={[0.35, 4, 0.5]} />
                <mesh geometry={box()} material={seal} position={[0, DOCK_DOOR.h + 0.2, 0.3]} scale={[DOCK_DOOR.w + 0.75, 0.4, 0.5]} />
              </>
            )}
            {[-1, 1].map((s) => (
              <mesh key={s} geometry={box()} material={seal} position={[s * 1.6, 0.75, 0.25]} scale={[0.4, 0.5, 0.3]} />
            ))}
            <mesh geometry={box()} material={mat("#9aa6b8", { rough: 0.6 })} position={[0, 1.02, 0.6]} scale={[DOCK_DOOR.w - 0.6, 0.1, 1.1]} receiveShadow />
          </group>
        );
      })}
      {/* Dock canopy */}
      <mesh geometry={box()} material={mat(C.canopy, { rough: 0.5 })} position={[0, 6.3, z1 + 1.15]} scale={[43, 0.3, 2.3]} castShadow receiveShadow />
      <mesh geometry={box()} material={mat(C.hubWall)} position={[0, 6.3, z1 + 2.32]} scale={[43, 0.34, 0.08]} />
    </group>
  );
}

function AnnexLogo({ x, y, z, width }: { x: number; y: number; z: number; width: number }) {
  const tex = useTexture("/brand/vayutrack-logo-512.png");
  const material = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  }, [tex]);
  const h = (width * 282) / 512;
  return (
    <mesh material={material} position={[x, y, z]}>
      <planeGeometry args={[width, h]} />
    </mesh>
  );
}

export function Annex(props: ThreeElements["group"]) {
  const { w, d, h } = ANNEX;
  const glass = mat(C.glass, { rough: 0.2, metal: 0.3 });
  return (
    <group position={[ANNEX.x, 0, ANNEX.z]} {...props}>
      <mesh geometry={rbox(w, h, d, 0.2)} material={mat(C.annex, { rough: 0.6 })} position={[0, h / 2, 0]} castShadow receiveShadow />
      <mesh geometry={box()} material={mat("#e9eef6")} position={[0, h + 0.25, 0]} scale={[w + 0.2, 0.5, d + 0.2]} castShadow />
      <mesh geometry={box()} material={glass} position={[0, 2.1, d / 2 + 0.03]} scale={[w - 1.6, 1.7, 0.08]} />
      <mesh geometry={box()} material={mat(C.glassDark, { rough: 0.2, metal: 0.3 })} position={[-1.2, 1.5, d / 2 + 0.06]} scale={[2.6, 3, 0.08]} />
      {[2.1, 4.6].map((y) => (
        <mesh key={y} geometry={box()} material={glass} position={[w / 2 + 0.03, y, 0]} scale={[0.08, 1.4, d - 2]} />
      ))}
      <mesh geometry={box()} material={mat(C.canopy)} position={[-1.2, 3.3, d / 2 + 1]} scale={[4.6, 0.2, 2]} castShadow />
      <Suspense fallback={null}>
        <AnnexLogo x={0} y={h - 1.75} z={d / 2 + 0.03} width={w - 3} />
      </Suspense>
      <mesh geometry={rbox(3, 1.1, 2.4, 0.15)} material={mat("#f3f6fb")} position={[3, h + 1, -3]} castShadow />
    </group>
  );
}

export function OriginHouse(props: ThreeElements["group"]) {
  const { w, d, h, roofRise } = ORIGIN;
  const glass = mat(C.glassDark, { rough: 0.25, metal: 0.3 });
  const white = mat(C.house, { rough: 0.7 });
  return (
    <group position={[ORIGIN.x, 0, ORIGIN.z]} {...props}>
      <mesh geometry={box()} material={white} position={[0, h / 2, 0]} scale={[w, h, d]} castShadow receiveShadow />
      <Gable x={0} w={w} d={d} h={h} rise={roofRise} color={C.house} />
      <GableRoof w={w} d={d} h={h} rise={roofRise} color={C.houseRoof} overhang={0.6} thickness={0.3} />
      <mesh geometry={box()} material={mat(C.houseDoor)} position={[0, 1.3, d / 2 + 0.04]} scale={[1.6, 2.6, 0.1]} />
      <mesh geometry={box()} material={mat(C.canopy)} position={[0, 2.8, d / 2 + 0.6]} scale={[2.6, 0.15, 1.2]} castShadow />
      {[-3.6, 3.6].map((x) => (
        <mesh key={x} geometry={box()} material={glass} position={[x, 1.9, d / 2 + 0.04]} scale={[2, 1.4, 0.08]} />
      ))}
      {[-3.6, 0, 3.6].map((x) => (
        <mesh key={x} geometry={box()} material={glass} position={[x, 4.4, d / 2 + 0.04]} scale={[2, 1.3, 0.08]} />
      ))}
      {[-2.5, 2.5].map((z) => (
        <mesh key={z} geometry={box()} material={glass} position={[w / 2 + 0.04, 4.4, z]} scale={[0.08, 1.3, 2]} />
      ))}
      <mesh geometry={box()} material={glass} position={[w / 2 + 0.04, 1.9, 2.5]} scale={[0.08, 1.4, 2]} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={rbox(4.6, 1, 1, 0.3)} material={mat(C.hedge, { rough: 0.95 })} position={[s * 4.3, 0.5, d / 2 + 2.7]} castShadow />
      ))}
      <mesh geometry={box()} material={mat(C.sidewalk)} position={[0, 0.06, d / 2 + 6]} scale={[2.6, 0.12, 12]} receiveShadow />
    </group>
  );
}

export function Destination(props: ThreeElements["group"]) {
  const { w, d, h } = DEST;
  const glass = mat(C.destGlass, { rough: 0.15, metal: 0.35 });
  const glassSide = mat(shade(C.destGlass, -0.08), { rough: 0.15, metal: 0.35 });
  return (
    <group position={[DEST.x, 0, DEST.z]} {...props}>
      <mesh geometry={rbox(w, h, d, 0.25)} material={mat(C.destWall, { rough: 0.6 })} position={[0, h / 2, 0]} castShadow receiveShadow />
      {[0, 1, 2].map((f) => (
        <group key={f}>
          <mesh geometry={box()} material={glass} position={[0, f * 4 + 2.4, d / 2 + 0.03]} scale={[w - 1.8, 2.4, 0.08]} />
          <mesh geometry={box()} material={glassSide} position={[w / 2 + 0.03, f * 4 + 2.4, 0]} scale={[0.08, 2.4, d - 1.8]} />
        </group>
      ))}
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} geometry={box()} material={mat(C.destWall)} position={[x, h / 2, d / 2 + 0.08]} scale={[0.25, h - 1, 0.1]} />
      ))}
      <mesh geometry={box()} material={mat(C.glassDark, { rough: 0.2, metal: 0.3 })} position={[0, 1.6, d / 2 + 0.1]} scale={[4, 3.2, 0.1]} />
      <mesh geometry={box()} material={mat(C.destCanopy, { rough: 0.5 })} position={[0, 3.6, d / 2 + 1.3]} scale={[7, 0.35, 2.6]} castShadow />
      <mesh geometry={box()} material={mat("#eef2f8")} position={[0, h + 0.3, 0]} scale={[w + 0.2, 0.6, d + 0.2]} castShadow />
      {[-6, 4].map((x) => (
        <mesh key={x} geometry={rbox(3.6, 1.4, 3, 0.2)} material={mat("#f3f6fb")} position={[x, h + 1.3, -2]} castShadow />
      ))}
      {[-8.5, 8.5].map((x) => (
        <mesh key={x} geometry={rbox(2.2, 0.8, 2.2, 0.2)} material={mat("#dfe6f0")} position={[x, 0.4, d / 2 + 3.4]} castShadow />
      ))}
      {[-8.5, 8.5].map((x) => (
        <mesh key={`p${x}`} geometry={rbox(1.8, 0.8, 1.8, 0.5)} material={mat(C.hedge, { rough: 0.95 })} position={[x, 1.1, d / 2 + 3.4]} castShadow />
      ))}
    </group>
  );
}

export function CityBlocks() {
  const bands = useRef<THREE.InstancedMesh>(null);
  const count = useMemo(() => CITY_BLOCKS.reduce((n, b) => n + Math.floor((b.h - 2) / 3) * 2, 0), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    for (const b of CITY_BLOCKS) {
      for (let y = 2.6; y < b.h - 0.6; y += 3) {
        if (i >= count) break;
        m.makeScale(b.w - 2, 1.1, 0.06).setPosition(b.x, y, b.z + b.d / 2 + 0.03);
        bands.current!.setMatrixAt(i++, m);
        if (i >= count) break;
        m.makeScale(0.06, 1.1, b.d - 2).setPosition(b.x + b.w / 2 + 0.03, y, b.z);
        bands.current!.setMatrixAt(i++, m);
      }
    }
    bands.current!.count = i;
    bands.current!.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <group>
      {CITY_BLOCKS.map((b, i) => (
        <group key={i}>
          <mesh geometry={rbox(b.w, b.h, b.d, 0.3)} material={mat(C.city, { rough: 0.8 })} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow />
          <mesh geometry={box()} material={mat(C.cityRoof)} position={[b.x, b.h + 0.02, b.z]} scale={[b.w - 1, 0.04, b.d - 1]} />
        </group>
      ))}
      <instancedMesh ref={bands} args={[box(), mat(C.cityWindow, { rough: 0.3, metal: 0.2 }), count]} />
    </group>
  );
}
