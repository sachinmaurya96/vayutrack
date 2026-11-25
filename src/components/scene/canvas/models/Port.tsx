"use client";

import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PORT, mulberry32 } from "../../layout";
import { PALETTE as C } from "../../palette";
import { getRibTexture, mat, rbox, slab, unitBox } from "../resources";

const CONTAINER = { l: 6, h: 2.55, w: 2.4 };

type Stack = { x: number; z: number; layers: number; color: string; alongZ: boolean; base: number };

function useContainerMaterial() {
  return useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", map: getRibTexture(), roughness: 0.6 }), []);
}

function Containers({ stacks }: { stacks: Stack[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const material = useContainerMaterial();
  const count = stacks.reduce((n, s) => n + s.layers, 0);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const yRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    const c = new THREE.Color();
    const one = new THREE.Vector3(1, 1, 1);
    let i = 0;
    for (const s of stacks)
      for (let l = 0; l < s.layers; l++) {
        m.compose(new THREE.Vector3(s.x, s.base + CONTAINER.h / 2 + l * (CONTAINER.h + 0.04), s.z), s.alongZ ? yRot : q, one);
        ref.current!.setMatrixAt(i, m);
        ref.current!.setColorAt(i, c.set(s.color));
        i++;
      }
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [stacks]);
  return <instancedMesh ref={ref} args={[rbox(CONTAINER.l, CONTAINER.h, CONTAINER.w, 0.08), material, count]} castShadow receiveShadow />;
}

export function ContainerYard() {
  const stacks = useMemo(() => {
    const rand = mulberry32(5);
    const out: Stack[] = [];
    const y = PORT.yard;
    for (let x = y.x0 + 10; x < y.x1 - 4; x += 9.5)
      for (let z = y.z0 + 6; z < y.z1 - 4; z += 3.2) {
        if (rand() < 0.18) continue;
        out.push({ x, z, layers: 1 + Math.floor(rand() * 3), color: C.containers[Math.floor(rand() * C.containers.length)], alongZ: false, base: 0 });
      }
    return out;
  }, []);
  return <Containers stacks={stacks} />;
}

/** Unbranded container ship berthed along the quay. Bobs gently via the forwarded ref. */
export const Ship = forwardRef<THREE.Group, ThreeElements["group"]>(function Ship(props, ref) {
  const { x, z, length, beam } = PORT.ship;
  const deckY = 5;
  const hull = useMemo(() => {
    const half = beam / 2;
    const zs = length / 2;
    const zb = -length / 2;
    return [
      [-half, zs - 1],
      [-half + 1, zs],
      [half - 1, zs],
      [half, zs - 1],
      [half, zb + 10],
      [half * 0.55, zb + 3],
      [0, zb],
      [-half * 0.55, zb + 3],
      [-half, zb + 10],
    ] as [number, number][];
  }, [beam, length]);
  const hullGeo = slab("shipHull", hull, deckY, 0.1);
  const bootGeo = slab("shipBoot", hull.map(([a, b]) => [a * 1.012, b * 1.004] as [number, number]), 1.4, 0.1);
  const stacks = useMemo(() => {
    const rand = mulberry32(9);
    const out: Stack[] = [];
    for (let cz = -length / 2 + 12; cz < length / 2 - 16; cz += 6.4)
      for (const cx of [-beam / 2 + 2, -beam / 2 + 4.6, beam / 2 - 4.6, beam / 2 - 2]) {
        if (rand() < 0.12) continue;
        out.push({ x: cx, z: cz + 3, layers: 1 + Math.floor(rand() * 3), color: C.containers[Math.floor(rand() * C.containers.length)], alongZ: true, base: deckY });
      }
    return out;
  }, [beam, length]);
  return (
    <group position={[x, 0, z]} {...props}>
      <group ref={ref}>
        <mesh geometry={hullGeo} material={[mat(C.deck, { rough: 0.7 }), mat(C.hull, { rough: 0.5 })]} castShadow receiveShadow />
        <mesh geometry={bootGeo} material={[mat(C.hullBoot), mat(C.hullBoot, { rough: 0.6 })]} position={[0, -0.6, 0]} />
        <Containers stacks={stacks} />
        <group position={[0, deckY, length / 2 - 7]}>
          <mesh geometry={rbox(beam - 2.6, 9, 6.5, 0.25)} material={mat(C.superstructure, { rough: 0.5 })} position={[0, 4.5, 0]} castShadow />
          <mesh geometry={unitBox()} material={mat(C.glassDark, { rough: 0.2, metal: 0.3 })} position={[0, 7.7, -3.27]} scale={[beam - 3, 1.1, 0.08]} />
          <mesh geometry={unitBox()} material={mat(C.superstructure)} position={[0, 8.3, -1]} scale={[beam + 1.6, 0.4, 2.4]} castShadow />
          <mesh geometry={rbox(2.6, 4, 2.8, 0.3)} material={mat(C.hull, { rough: 0.5 })} position={[0, 10.5, 1.4]} castShadow />
          <mesh geometry={unitBox()} material={mat(C.hullBoot)} position={[0, 11.4, 1.4]} scale={[2.66, 0.6, 2.86]} />
        </group>
      </group>
    </group>
  );
});

/** Ship-to-shore gantry crane; trolley and hoisted container are animated. */
export const Crane = forwardRef<THREE.Group, ThreeElements["group"] & { hoistRef?: React.Ref<THREE.Group>; containerColor: string }>(function Crane(
  { hoistRef, containerColor, ...props },
  ref,
) {
  const blue = mat(C.crane, { rough: 0.5 });
  const light = mat(C.craneLight, { rough: 0.5 });
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: containerColor, map: getRibTexture(), roughness: 0.6 }), [containerColor]);
  return (
    <group {...props}>
      {[2, 12].flatMap((lx) => [-4.5, 4.5].map((dz) => (
        <mesh key={`${lx}${dz}`} geometry={unitBox()} material={blue} position={[lx, 10, dz]} scale={[1.1, 20, 1.1]} castShadow />
      )))}
      {[2, 12].map((lx) => (
        <mesh key={lx} geometry={unitBox()} material={blue} position={[lx, 0.6, 0]} scale={[1.6, 1.2, 11]} castShadow />
      ))}
      <mesh geometry={unitBox()} material={blue} position={[7, 17.6, 0]} scale={[11.4, 1.4, 10.2]} castShadow />
      <mesh geometry={unitBox()} material={light} position={[-6, 20.8, 0]} scale={[48, 1.6, 2]} castShadow />
      <mesh geometry={rbox(6, 2.6, 3.6, 0.2)} material={light} position={[15, 22.9, 0]} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={unitBox()} material={blue} position={[11, 25, s * 0.8]} rotation={[0, 0, -0.5]} scale={[0.4, 9, 0.4]} />
      ))}
      <group ref={ref} position={[4, 0, 0]}>
        <mesh geometry={rbox(2.6, 1.2, 2.4, 0.15)} material={blue} position={[0, 19.4, 0]} castShadow />
        <group ref={hoistRef} position={[0, 12, 0]}>
          {[-0.6, 0.6].map((dx) => (
            <mesh key={dx} geometry={unitBox()} material={mat(C.mast)} position={[dx, 3.3, 0]} scale={[0.06, 6.6, 0.06]} />
          ))}
          <mesh geometry={unitBox()} material={blue} position={[0, 0.15, 0]} scale={[6.2, 0.3, 2.5]} />
          <mesh geometry={rbox(CONTAINER.l, CONTAINER.h, CONTAINER.w, 0.08)} material={material} position={[0, -1.35, 0]} castShadow />
        </group>
      </group>
    </group>
  );
});
