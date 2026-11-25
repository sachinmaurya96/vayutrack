"use client";

import { useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { FRAMINGS, type Framing } from "../layout";
import { getSlotOffset } from "../slots";
import { cameraPresetFor } from "../store";
import { damp, useUpdater } from "./engine";

const DEG = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
const SUN = new THREE.Vector3(-0.38, 0.84, 0.42).normalize();

type Frame = { center: THREE.Vector3; dist: number; az: number; el: number; width: number };

function solveFraming(f: Framing, aspect: number, fov: number, offset: readonly [number, number], out: Frame): Frame {
  const tanV = Math.tan((fov * DEG) / 2);
  const tanH = tanV * aspect;
  const dist = Math.max(f.width / 2 / tanH, (f.height ?? 0) / 2 / tanV);
  const W = 2 * dist * tanH;
  const H = 2 * dist * tanV;
  const az = f.azimuth * DEG;
  const el = f.elevation * DEG;
  const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  const forward = dir.clone().negate();
  const right = forward.clone().cross(UP).normalize();
  const up = right.clone().cross(forward).normalize();
  const ox = offset[0] + (f.offset?.[0] ?? 0);
  const oy = offset[1] + (f.offset?.[1] ?? 0);
  out.center
    .set(f.target[0], f.target[1], f.target[2])
    .addScaledVector(right, -ox * W)
    .addScaledVector(up, oy * H);
  out.dist = dist;
  out.az = f.azimuth;
  out.el = f.elevation;
  out.width = W;
  return out;
}

export function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const light = useRef<THREE.DirectionalLight>(null);
  const current = useRef<Frame & { init: boolean }>({ center: new THREE.Vector3(), dist: 150, az: 45, el: 34, width: 100, init: false });
  const desired = useRef<Frame>({ center: new THREE.Vector3(), dist: 150, az: 45, el: 34, width: 100 });
  const scratch = useRef<Frame>({ center: new THREE.Vector3(), dist: 150, az: 45, el: 34, width: 100 });

  useUpdater((ctx) => {
    const framing = FRAMINGS[cameraPresetFor(ctx.view, ctx.s)];
    const want = solveFraming(framing, camera.aspect, camera.fov, getSlotOffset(ctx.view), ctx.capture ? scratch.current : desired.current);
    const cur = current.current;
    let frame: Frame = cur;
    let busy = false;
    let travel = 0;
    if (ctx.capture) {
      frame = want;
    } else if (ctx.snap || !cur.init || ctx.s.reducedMotion) {
      cur.center.copy(want.center);
      cur.dist = want.dist;
      cur.az = want.az;
      cur.el = want.el;
      cur.width = want.width;
      cur.init = true;
    } else {
      travel = cur.center.distanceTo(want.center);
      const k = damp(3.2, ctx.dt);
      cur.center.lerp(want.center, k);
      cur.dist += (want.dist - cur.dist) * k;
      cur.az += (want.az - cur.az) * k;
      cur.el += (want.el - cur.el) * k;
      cur.width += (want.width - cur.width) * k;
      busy = travel > 0.02 || Math.abs(want.dist - cur.dist) > 0.02 || Math.abs(want.az - cur.az) > 0.01 || Math.abs(want.el - cur.el) > 0.01;
    }

    // Long moves arc outward a little so the world reads as one connected place.
    const dist = frame.dist + Math.min(travel * 0.4, 140);
    const az = frame.az * DEG;
    const el = frame.el * DEG;
    camera.position.set(
      frame.center.x + dist * Math.cos(el) * Math.cos(az),
      frame.center.y + dist * Math.sin(el),
      frame.center.z + dist * Math.cos(el) * Math.sin(az),
    );
    camera.near = Math.max(1, dist * 0.2);
    camera.far = dist * 4;
    camera.lookAt(frame.center);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = dist * 1.05;
      scene.fog.far = dist * 2.6;
    }

    const l = light.current;
    if (l) {
      l.position.copy(frame.center).addScaledVector(SUN, 220);
      l.target.position.copy(frame.center);
      l.target.updateMatrixWorld();
      const half = THREE.MathUtils.clamp(frame.width * 0.75, 30, 130);
      const cam = l.shadow.camera;
      if (cam.right !== half) {
        cam.left = -half;
        cam.right = half;
        cam.top = half;
        cam.bottom = -half;
        cam.near = 60;
        cam.far = 420;
        cam.updateProjectionMatrix();
      }
    }
    return busy;
  }, -10);

  return (
    <>
      <hemisphereLight args={["#ffffff", "#cdd8ec", 1.35]} />
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={light}
        castShadow
        intensity={2.4}
        color="#fffaf3"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
        shadow-radius={3}
      />
    </>
  );
}
