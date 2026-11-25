"use client";

import { useTexture } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { Suspense, forwardRef, useMemo } from "react";
import * as THREE from "three";
import { PALETTE as C, shade } from "../../palette";
import { cylinder, mat, profile, rbox, sphere, unitBox } from "../resources";

const LOGO_URL = "/brand/vayutrack-logo-512.png";
const LOGO_ASPECT = 512 / 282;

function LogoDecal({ length, y, z, x }: { length: number; y: number; z: number; x: number }) {
  const tex = useTexture(LOGO_URL);
  const material = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  }, [tex]);
  const h = length / LOGO_ASPECT;
  const geo = useMemo(() => new THREE.PlaneGeometry(length, h), [length, h]);
  return (
    <>
      <mesh geometry={geo} material={material} position={[x, y, z]} />
      <mesh geometry={geo} material={material} position={[x, y, -z]} rotation={[0, Math.PI, 0]} />
    </>
  );
}

type Box = { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; cast?: boolean };

function Boxes({ items }: { items: Box[] }) {
  const g = unitBox();
  return (
    <>
      {items.map((b, i) => (
        <mesh key={i} geometry={g} material={b.m} position={b.p} scale={b.s} castShadow={b.cast ?? true} />
      ))}
    </>
  );
}

function Wheels({ xs, halfWidth, r = 0.56 }: { xs: number[]; halfWidth: number; r?: number }) {
  const tyre = cylinder(r, r, 0.5, 20);
  const hub = cylinder(r * 0.48, r * 0.48, 0.52, 14);
  const tyreMat = mat(C.tyre, { rough: 0.9 });
  const hubMat = mat("#c9d2df", { rough: 0.5, metal: 0.3 });
  return (
    <>
      {xs.flatMap((x) =>
        [-1, 1].map((s) => (
          <group key={`${x}${s}`} position={[x, r, s * halfWidth]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={tyre} material={tyreMat} castShadow />
            <mesh geometry={hub} material={hubMat} position={[0, s * 0.02, 0]} />
          </group>
        )),
      )}
    </>
  );
}

type TruckProps = { branded?: boolean; cabColor?: string; bodyColor?: string } & ThreeElements["group"];

/** Box truck, local forward = +x, origin at ground centre. */
export const Truck = forwardRef<THREE.Group, TruckProps>(function Truck({ branded = false, cabColor, bodyColor, ...props }, ref) {
  const L = 12.4;
  const W = 3.1;
  const bodyLen = 8.6;
  const bodyH = 4.3;
  const cabLen = 2.9;
  const cabH = 3.5;
  const back = -L / 2;
  const cab = cabColor ?? (branded ? C.truckCab : C.otherCab);
  const body = bodyColor ?? (branded ? C.truckBody : C.otherBody);
  const cabGeo = profile(
    "truckCab",
    [
      [0, 0],
      [cabLen, 0],
      [cabLen, cabH * 0.52],
      [cabLen - 0.6, cabH],
      [0.15, cabH],
      [0, cabH - 0.15],
    ],
    W - 0.24,
    0.1,
  );
  const dark = mat(C.chassis, { rough: 0.7 });
  const glass = mat(C.windscreen, { rough: 0.15, metal: 0.4 });
  const slope = Math.atan2(0.6, cabH * 0.48);
  return (
    <group ref={ref} {...props}>
      <mesh geometry={rbox(bodyLen, bodyH, W, 0.22, 3)} material={mat(body, { rough: 0.55 })} position={[back + bodyLen / 2, 1.1 + bodyH / 2, 0]} castShadow receiveShadow />
      {branded && (
        <>
          <mesh geometry={unitBox()} material={mat(C.truckStripe, { rough: 0.6 })} position={[back + bodyLen / 2, 1.42, 0]} scale={[bodyLen - 0.3, 0.34, W + 0.03]} />
          <Suspense fallback={null}>
            <LogoDecal length={bodyLen - 1.6} x={back + bodyLen / 2} y={1.1 + bodyH / 2 + 0.25} z={W / 2 + 0.015} />
          </Suspense>
        </>
      )}
      {!branded && <mesh geometry={unitBox()} material={mat(C.hubWall, { rough: 0.6 })} position={[back + bodyLen / 2, 1.42, 0]} scale={[bodyLen - 0.3, 0.26, W + 0.03]} />}
      <group position={[L / 2 - cabLen, 0.75, 0]}>
        <mesh geometry={cabGeo} material={mat(cab, { rough: 0.45 })} castShadow />
        {/* Windscreen on the sloped face. */}
        <group position={[cabLen - 0.3, cabH * 0.76, 0]} rotation={[0, 0, slope]}>
          <mesh geometry={unitBox()} material={glass} scale={[0.06, cabH * 0.44, W - 0.5]} position={[0.1, 0, 0]} />
        </group>
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={unitBox()} material={glass} position={[cabLen * 0.42, cabH * 0.73, s * (W / 2 - 0.02)]} scale={[cabLen * 0.55, cabH * 0.32, 0.06]} />
        ))}
        <mesh geometry={unitBox()} material={dark} position={[cabLen + 0.05, 0.55, 0]} scale={[0.25, 0.9, W - 0.2]} />
        {[-1, 1].map((s) => (
          <mesh key={`l${s}`} geometry={unitBox()} material={mat("#fff7d6", { emissive: "#fff3c4", emissiveIntensity: 0.4 })} position={[cabLen + 0.16, 0.65, s * (W / 2 - 0.42)]} scale={[0.08, 0.3, 0.5]} />
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`m${s}`} geometry={unitBox()} material={dark} position={[cabLen - 0.35, cabH * 0.7, s * (W / 2 + 0.25)]} scale={[0.12, 0.7, 0.1]} />
        ))}
      </group>
      <Boxes items={[{ p: [0, 0.85, 0], s: [L - 0.8, 0.45, W - 0.5], m: dark }]} />
      <Wheels xs={[back + 1.5, back + 2.85, L / 2 - 1.35]} halfWidth={W / 2 - 0.22} />
    </group>
  );
});

/** Compact delivery van. */
export const Van = forwardRef<THREE.Group, ThreeElements["group"]>(function Van(props, ref) {
  const L = 6.6;
  const W = 2.5;
  const bodyLen = 4.5;
  const bodyH = 2.9;
  const cabLen = 2.1;
  const cabH = 2.7;
  const back = -L / 2;
  const cabGeo = profile(
    "vanCab",
    [
      [0, 0],
      [cabLen, 0],
      [cabLen, 1.05],
      [cabLen - 0.45, 1.35],
      [cabLen - 1.35, cabH],
      [0, cabH],
    ],
    W - 0.2,
    0.1,
  );
  const glass = mat(C.windscreen, { rough: 0.15, metal: 0.4 });
  return (
    <group ref={ref} {...props}>
      <mesh geometry={rbox(bodyLen, bodyH, W, 0.28, 3)} material={mat(C.truckBody, { rough: 0.5 })} position={[back + bodyLen / 2 + 0.1, 0.5 + bodyH / 2, 0]} castShadow receiveShadow />
      <mesh geometry={unitBox()} material={mat(C.truckStripe, { rough: 0.6 })} position={[back + bodyLen / 2 + 0.1, 0.92, 0]} scale={[bodyLen - 0.3, 0.26, W + 0.03]} />
      <Suspense fallback={null}>
        <LogoDecal length={bodyLen - 1.1} x={back + bodyLen / 2 + 0.1} y={0.5 + bodyH / 2 + 0.25} z={W / 2 + 0.015} />
      </Suspense>
      <group position={[L / 2 - cabLen, 0.5, 0]}>
        <mesh geometry={cabGeo} material={mat(C.truckBody, { rough: 0.45 })} castShadow />
        <group position={[cabLen - 0.88, 2.03, 0]} rotation={[0, 0, Math.atan2(1.35, 0.9)]}>
          <mesh geometry={unitBox()} material={glass} scale={[0.06, 1.25, W - 0.45]} position={[0.08, 0, 0]} />
        </group>
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={unitBox()} material={glass} position={[0.55, 1.9, s * (W / 2 - 0.02)]} scale={[0.8, 0.75, 0.06]} />
        ))}
        <mesh geometry={unitBox()} material={mat(C.truckCab)} position={[cabLen + 0.04, 0.45, 0]} scale={[0.2, 0.55, W - 0.15]} />
      </group>
      <Wheels xs={[back + 1.2, L / 2 - 1.15]} halfWidth={W / 2 - 0.18} r={0.46} />
    </group>
  );
});

/** Counterbalance forklift with optional pallet load. */
export const Forklift = forwardRef<
  THREE.Group,
  ThreeElements["group"] & { liftRef?: React.Ref<THREE.Group>; loadRef?: React.Ref<THREE.Group> }
>(function Forklift({ liftRef, loadRef, ...props }, ref) {
  const body = mat(C.forklift, { rough: 0.45 });
  const dark = mat(C.mast, { rough: 0.6 });
  return (
    <group ref={ref} {...props}>
      <mesh geometry={rbox(2.4, 1.15, 1.7, 0.18)} material={body} position={[-0.35, 0.95, 0]} castShadow />
      <mesh geometry={rbox(0.8, 1.5, 1.6, 0.2)} material={mat(shade(C.forklift, -0.3), { rough: 0.5 })} position={[-1.45, 1.1, 0]} castShadow />
      {[
        [-1.05, -0.72],
        [-1.05, 0.72],
        [0.55, -0.72],
        [0.55, 0.72],
      ].map(([x, z], i) => (
        <mesh key={i} geometry={unitBox()} material={dark} position={[x, 2.25, z]} scale={[0.1, 1.5, 0.1]} castShadow />
      ))}
      <mesh geometry={unitBox()} material={dark} position={[-0.25, 3.02, 0]} scale={[1.85, 0.1, 1.6]} castShadow />
      <mesh geometry={rbox(0.55, 0.7, 0.7, 0.12)} material={mat("#1d2738")} position={[-0.55, 1.75, 0]} />
      {/* Driver */}
      <mesh geometry={rbox(0.5, 0.75, 0.6, 0.2)} material={mat(C.truckCab)} position={[-0.45, 2.05, 0]} />
      <mesh geometry={sphere(0.24)} material={mat("#ffffff", { rough: 0.4 })} position={[-0.4, 2.62, 0]} />
      {/* Mast */}
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} geometry={unitBox()} material={dark} position={[0.98, 1.75, z]} scale={[0.14, 3.3, 0.14]} castShadow />
      ))}
      <group ref={liftRef}>
        <mesh geometry={unitBox()} material={dark} position={[1.12, 0.75, 0]} scale={[0.12, 0.9, 1.3]} />
        {[-0.38, 0.38].map((z) => (
          <mesh key={z} geometry={unitBox()} material={dark} position={[1.85, 0.32, z]} scale={[1.5, 0.08, 0.16]} />
        ))}
        <group ref={loadRef} position={[1.9, 0.36, 0]}>
          <mesh geometry={rbox(1.8, 0.24, 1.7, 0.04)} material={mat(C.pallet)} position={[0, 0.12, 0]} castShadow />
          <mesh geometry={rbox(1.6, 1.1, 1.5, 0.08)} material={mat(C.cardboard, { rough: 0.9 })} position={[0, 0.8, 0]} castShadow />
          <mesh geometry={unitBox()} material={mat(C.tape)} position={[0, 1.36, 0]} scale={[0.22, 0.02, 1.5]} />
        </group>
      </group>
      <Wheels xs={[-1.05, 0.5]} halfWidth={0.72} r={0.38} />
    </group>
  );
});
