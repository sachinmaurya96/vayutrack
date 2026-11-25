"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "../palette";
import { CLOCK_START } from "../poses";
import { motionEnabled, useScene, type SceneView } from "../store";
import { runUpdaters, setCanvasBridge } from "./engine";
import { Rig } from "./Rig";
import { World } from "./World";

/** Shared between the frame driver and the capture bridge. */
const clock = { t: CLOCK_START, lastView: null as SceneView | null };

/** Ambient-only motion renders at ~30fps; camera and journey transitions run at full rate. */
const AMBIENT_FRAME_MS = 1000 / 30;

function Driver({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const ambientTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(ambientTimer.current), []);
  useEffect(() => useScene.subscribe(() => invalidate()), [invalidate]);
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => invalidate(), 0);
    return () => window.clearTimeout(id);
  }, [active, invalidate]);

  useFrame((_, delta) => {
    const s = useScene.getState();
    const view = s.activeView ?? "hero";
    const motion = motionEnabled(s);
    const dt = Math.min(delta, 1 / 20);
    if (motion) clock.t += dt;
    const snap = clock.lastView !== view;
    clock.lastView = view;
    const busy = runUpdaters({ view, s, t: clock.t, dt, snap, motion, capture: false });
    if (busy) invalidate();
    else if (motion) {
      window.clearTimeout(ambientTimer.current);
      ambientTimer.current = window.setTimeout(() => invalidate(), AMBIENT_FRAME_MS - 16);
    }
  });
  return null;
}

/** Exposes poster capture and instant re-homing to the DOM host. */
function Bridge() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    setCanvasBridge({
      capture(view, width, height) {
        const { gl, scene, camera, size } = get();
        const cam = camera as THREE.PerspectiveCamera;
        const canvas = gl.domElement;
        const bw = canvas.width;
        const bh = canvas.height;
        if (!bw || !bh || !width || !height) return null;
        const aspect = width / height;
        let w = bw;
        let h = Math.round(bw / aspect);
        if (h > bh) {
          h = bh;
          w = Math.round(bh * aspect);
        }
        const s = useScene.getState();
        const pr = gl.getPixelRatio();
        const savedAspect = cam.aspect;
        cam.aspect = aspect;
        cam.updateProjectionMatrix();
        runUpdaters({ view, s, t: clock.t, dt: 0, snap: true, motion: false, capture: true });
        gl.setViewport(0, 0, w / pr, h / pr);
        gl.setScissor(0, 0, w / pr, h / pr);
        gl.setScissorTest(true);
        gl.render(scene, cam);
        const out = document.createElement("canvas");
        const scale = Math.min(1, 1600 / w);
        out.width = Math.round(w * scale);
        out.height = Math.round(h * scale);
        out.getContext("2d")!.drawImage(canvas, 0, bh - h, w, h, 0, 0, out.width, out.height);
        // Restore the live view before the browser paints.
        gl.setScissorTest(false);
        gl.setViewport(0, 0, size.width, size.height);
        cam.aspect = savedAspect;
        cam.updateProjectionMatrix();
        runUpdaters({ view: s.activeView ?? "hero", s, t: clock.t, dt: 0, snap: false, motion: false, capture: false });
        gl.render(scene, cam);
        try {
          return out.toDataURL("image/webp", 0.86);
        } catch {
          return null;
        }
      },
      present(view, width, height) {
        const state = get();
        state.setSize(width, height, 0, 0);
        const s = useScene.getState();
        clock.lastView = view;
        runUpdaters({ view, s, t: clock.t, dt: 0, snap: true, motion: false, capture: false });
        state.gl.render(state.scene, state.camera);
        state.invalidate();
      },
    });
    return () => setCanvasBridge(null);
  }, [get]);
  return null;
}

export type LogisticsCanvasProps = {
  active: boolean;
  onContextLost: () => void;
  onFirstFrame: () => void;
};

function FirstFrame({ onFirstFrame }: { onFirstFrame: () => void }) {
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(onFirstFrame));
    return () => cancelAnimationFrame(id);
  }, [onFirstFrame]);
  return null;
}

export default function LogisticsCanvas({ active, onContextLost, onFirstFrame }: LogisticsCanvasProps) {
  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={[1, 1.75]}
      shadows={{ enabled: true, type: THREE.PCFShadowMap }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.02 }}
      camera={{ fov: 30, near: 2, far: 1200, position: [120, 90, 120] }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <color attach="background" args={[PALETTE.page]} />
      <fog attach="fog" args={[PALETTE.page, 160, 420]} />
      <Environment resolution={128} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 40, 0]} rotation-x={Math.PI / 2} scale={[80, 80, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#dbe8ff" position={[-40, 10, 30]} rotation-y={Math.PI / 3} scale={[60, 20, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#fff4e6" position={[40, 10, -20]} rotation-y={-Math.PI / 3} scale={[60, 20, 1]} />
      </Environment>
      <Rig />
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <Driver active={active} />
      <Bridge />
      <FirstFrame onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}
