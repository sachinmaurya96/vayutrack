"use client";

import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { AIRPORT } from "../../layout";
import { PALETTE as C, shade } from "../../palette";
import { cylinder, mat, profile, rbox, sphere, unitBox } from "../resources";

/** Swept flat surface (wing/stabiliser) from a plan-view outline (x along fuselage, z outward). */
function useSurface(key: string, outline: [number, number][], thickness: number) {
  return useMemo(() => {
    const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, z)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 1 });
    g.rotateX(Math.PI / 2); // shape y -> world z, depth -> world -y
    g.translate(0, thickness / 2, 0);
    g.computeVertexNormals();
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Generic unbranded cargo aircraft. Local nose = -x. */
export function Aircraft(props: ThreeElements["group"]) {
  const white = mat(C.aircraft, { rough: 0.35 });
  const grey = mat(C.aircraftGrey, { rough: 0.45 });
  const engineMat = mat(C.engine, { rough: 0.4, metal: 0.3 });
  const dark = mat("#1b2638", { rough: 0.3 });
  const r = 2.7;
  const wing = useSurface("wing", [[-5, 0], [5, 0], [12, 20], [8, 20]], 0.5);
  const stab = useSurface("stab", [[-1.5, 0], [2.5, 0], [5, 8], [2.6, 8]], 0.3);
  const fin = profile("fin", [[0, 0], [8.5, 0], [10, 9], [6.6, 9]], 0.45, 0.06);
  return (
    <group {...props}>
      {/* Fuselage */}
      <mesh geometry={cylinder(r, r, 30, 28)} material={white} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow />
      <mesh geometry={sphere(r, 28, 20)} material={white} position={[-15, 0, 0]} scale={[1.9, 1, 1]} castShadow />
      <mesh geometry={cylinder(r, 0.7, 10, 28)} material={white} position={[20, 0.8, 0]} rotation={[0, 0, Math.PI / 2 + 0.06]} castShadow />
      {/* Belly fairing */}
      <mesh geometry={rbox(14, 1.6, 4.2, 0.7)} material={grey} position={[-2, -2.1, 0]} castShadow />
      {/* Cockpit windows */}
      <mesh geometry={rbox(1.6, 0.7, 3.6, 0.3)} material={dark} position={[-18.2, 1.05, 0]} rotation={[0, 0, -0.35]} />
      {/* Main deck cargo door outline (left/south side) */}
      <mesh geometry={unitBox()} material={mat(shade(C.aircraftGrey, -0.1))} position={[-8, 0.6, r - 0.02]} scale={[4.2, 3.4, 0.08]} />
      {/* Wings and engines */}
      {[1, -1].map((s) => (
        <group key={s} scale={[1, 1, s]}>
          <mesh geometry={wing} material={grey} position={[-2, -1.2, 1.4]} castShadow receiveShadow />
          <group position={[-3.5, -2.5, 8]}>
            <mesh geometry={cylinder(1.15, 1.0, 5, 20)} material={engineMat} rotation={[0, 0, Math.PI / 2]} castShadow />
            <mesh geometry={cylinder(0.95, 0.95, 0.1, 20)} material={dark} position={[-2.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
            <mesh geometry={unitBox()} material={grey} position={[1, 1.1, 0]} scale={[3, 0.9, 0.3]} />
          </group>
          <mesh geometry={stab} material={grey} position={[19.5, 1.7, 0.8]} castShadow />
        </group>
      ))}
      <mesh geometry={fin} material={white} position={[15.5, 2.2, 0]} castShadow />
      {/* Landing gear */}
      {[
        [-14, 0],
        [0.5, 2],
        [0.5, -2],
      ].map(([x, z], i) => (
        <mesh key={i} geometry={cylinder(0.55, 0.55, 0.6, 14)} material={mat(C.tyre)} position={[x, -r - 1.05, z]} rotation={[Math.PI / 2, 0, 0]} castShadow />
      ))}
    </group>
  );
}

export function AirportTerminal() {
  const t = AIRPORT.terminal;
  const doorOpen = mat(C.doorOpen, { rough: 0.9 });
  const doorClosed = mat(C.door, { rough: 0.6 });
  return (
    <group position={[t.x, 0, t.z]}>
      <mesh geometry={rbox(t.w, t.h, t.d, 0.25)} material={mat("#f6f8fc", { rough: 0.6 })} position={[0, t.h / 2, 0]} castShadow receiveShadow />
      <mesh geometry={rbox(t.w + 1.4, 0.8, t.d + 1.4, 0.2)} material={mat(C.hubRoof, { rough: 0.55 })} position={[0, t.h + 0.3, 0]} castShadow />
      {[-20, -10, 0, 10, 20].map((z, i) => (
        <group key={z} position={[t.w / 2, 0, z]}>
          <mesh geometry={unitBox()} material={mat(C.hubTrim)} position={[0.05, 3.3, 0]} scale={[0.2, 6.6, 7]} />
          <mesh geometry={unitBox()} material={i === 2 || i === 1 ? doorOpen : doorClosed} position={[0.2, 3, 0]} scale={[0.1, 5.8, 6.2]} />
        </group>
      ))}
      <mesh geometry={unitBox()} material={mat(C.glass, { rough: 0.2, metal: 0.3 })} position={[t.w / 2 + 0.05, 8, 0]} scale={[0.1, 1.2, t.d - 2]} />
      {/* Control tower */}
      <group position={[-t.w / 2 - 6, 0, t.d / 2 - 6]}>
        <mesh geometry={cylinder(1.4, 1.8, 18, 16)} material={mat("#f3f6fb", { rough: 0.6 })} position={[0, 9, 0]} castShadow />
        <mesh geometry={cylinder(3.2, 2.6, 2.6, 16)} material={mat(C.glassDark, { rough: 0.2, metal: 0.3 })} position={[0, 19.3, 0]} castShadow />
        <mesh geometry={cylinder(3.4, 3.4, 0.6, 16)} material={mat("#f3f6fb")} position={[0, 20.9, 0]} castShadow />
      </group>
    </group>
  );
}

export const Tug = forwardRef<THREE.Group, ThreeElements["group"]>(function Tug(props, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh geometry={rbox(2.8, 1.2, 1.9, 0.2)} material={mat(C.tug, { rough: 0.45 })} position={[0, 0.9, 0]} castShadow />
      <mesh geometry={rbox(1.2, 1.1, 1.7, 0.15)} material={mat(C.windscreen, { rough: 0.2, metal: 0.3 })} position={[-0.4, 2, 0]} castShadow />
      {[-0.9, 0.9].flatMap((x) => [-0.9, 0.9].map((z) => (
        <mesh key={`${x}${z}`} geometry={cylinder(0.38, 0.38, 0.3, 12)} material={mat(C.tyre)} position={[x, 0.38, z]} rotation={[Math.PI / 2, 0, 0]} />
      )))}
    </group>
  );
});

export const Dolly = forwardRef<THREE.Group, ThreeElements["group"]>(function Dolly(props, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh geometry={unitBox()} material={mat(C.chassis)} position={[0, 0.55, 0]} scale={[3.1, 0.25, 2.4]} castShadow />
      <mesh geometry={profile("uld", [[-1.4, 0], [1.4, 0], [1.4, 1.7], [0.7, 2.4], [-1.4, 2.4]], 2.1, 0.08)} material={mat(C.uld, { rough: 0.35, metal: 0.4 })} position={[0, 0.7, 0]} castShadow />
      {[-1.1, 1.1].flatMap((x) => [-1, 1].map((z) => (
        <mesh key={`${x}${z}`} geometry={cylinder(0.28, 0.28, 0.2, 10)} material={mat(C.tyre)} position={[x, 0.28, z]} rotation={[Math.PI / 2, 0, 0]} />
      )))}
    </group>
  );
});

/** High loader at the main deck door; platform height is animated. */
export const HighLoader = forwardRef<THREE.Group, ThreeElements["group"]>(function HighLoader(props, ref) {
  return (
    <group {...props}>
      <mesh geometry={rbox(6, 1.1, 4, 0.2)} material={mat("#eef2f8", { rough: 0.5 })} position={[0, 0.8, 0]} castShadow />
      <mesh geometry={rbox(1.8, 1.6, 2.2, 0.2)} material={mat(C.tug, { rough: 0.45 })} position={[3.6, 1.2, 0]} castShadow />
      <group ref={ref}>
        <mesh geometry={unitBox()} material={mat(C.chassis)} position={[0, 0, 0]} scale={[5.4, 0.3, 3.6]} castShadow />
        <mesh geometry={profile("uld", [[-1.4, 0], [1.4, 0], [1.4, 1.7], [0.7, 2.4], [-1.4, 2.4]], 2.1, 0.08)} material={mat(C.uld, { rough: 0.35, metal: 0.4 })} position={[0.6, 0.15, 0]} castShadow />
      </group>
    </group>
  );
});
