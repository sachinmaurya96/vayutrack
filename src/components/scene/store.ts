"use client";

import { create } from "zustand";
import type { JourneyStage } from "@/content/journey";
import type { SceneObjectId } from "@/content/sceneObjects";
import type { ServiceMode } from "@/content/services";

/**
 * Single state machine shared by the 3D canvas, the SVG fallback and every
 * HTML control. One WebGL canvas moves between the three scene "views".
 */

export type SceneView = "hero" | "services" | "journey";
export type RenderMode = "pending" | "webgl" | "fallback";
export type FallbackReason =
  | "unsupported"
  | "low-power"
  | "small-screen"
  | "context-lost"
  | "error"
  | "forced";

export type CameraPresetId =
  | "hero:overview"
  | `hero:${SceneObjectId}`
  | `services:${ServiceMode}`
  | `journey:${JourneyStage}`;

export type SceneState = {
  heroSelected: SceneObjectId | null;
  serviceMode: ServiceMode;
  journeyStage: JourneyStage;
  /** Pause Motion control. */
  userPaused: boolean;
  /** prefers-reduced-motion. */
  reducedMotion: boolean;
  /** Where the live canvas currently sits, if anywhere. */
  activeView: SceneView | null;
  renderMode: RenderMode;
  fallbackReason: FallbackReason | null;
  /** Bumped by Reset View so the camera snaps back even if state is unchanged. */
  resetCount: number;

  select: (id: SceneObjectId | null) => void;
  setServiceMode: (mode: ServiceMode) => void;
  setJourneyStage: (stage: JourneyStage) => void;
  setPaused: (paused: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  resetView: () => void;
  setActiveView: (view: SceneView | null) => void;
  setRenderMode: (mode: RenderMode, reason?: FallbackReason | null) => void;
};

export const useScene = create<SceneState>()((set) => ({
  heroSelected: null,
  serviceMode: "express",
  journeyStage: 0,
  userPaused: false,
  reducedMotion: false,
  activeView: null,
  renderMode: "pending",
  fallbackReason: null,
  resetCount: 0,

  select: (id) => set({ heroSelected: id }),
  setServiceMode: (mode) => set({ serviceMode: mode }),
  setJourneyStage: (stage) => set({ journeyStage: stage }),
  setPaused: (paused) => set({ userPaused: paused }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  resetView: () => set((s) => ({ heroSelected: null, resetCount: s.resetCount + 1 })),
  setActiveView: (view) => set({ activeView: view }),
  setRenderMode: (mode, reason = null) => set({ renderMode: mode, fallbackReason: reason }),
}));

export const motionEnabled = (s: Pick<SceneState, "userPaused" | "reducedMotion">) =>
  !s.userPaused && !s.reducedMotion;

export function cameraPresetFor(view: SceneView, s: SceneState): CameraPresetId {
  switch (view) {
    case "hero":
      return s.heroSelected ? `hero:${s.heroSelected}` : "hero:overview";
    case "services":
      return `services:${s.serviceMode}`;
    case "journey":
      return `journey:${s.journeyStage}`;
  }
}

/** Identifies a composition so stale posters can be re-captured. */
export function compositionKey(view: SceneView, s: SceneState): string {
  return `${cameraPresetFor(view, s)}|${s.resetCount}`;
}
