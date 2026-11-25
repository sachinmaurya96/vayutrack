"use client";

import { useEffect, useRef } from "react";
import type { SceneState, SceneView } from "../store";

/**
 * One frame driver for the whole world. Components register updaters that
 * position their objects from (view, state, clock). An updater returns true
 * while it is still easing towards a target, which keeps on-demand rendering
 * alive only as long as something is actually moving.
 */

export type FrameCtx = {
  view: SceneView;
  s: SceneState;
  /** Ambient clock (seconds). Frozen while paused or under reduced motion. */
  t: number;
  /** Frame delta in seconds (0 during captures). */
  dt: number;
  /** Jump straight to targets (view change, reset, reduced motion). */
  snap: boolean;
  /** Ambient motion currently allowed. */
  motion: boolean;
  /** Rendering a poster for another view: apply target poses without touching eased state. */
  capture: boolean;
};

export type Updater = (ctx: FrameCtx) => boolean | void;

const updaters = new Set<{ current: Updater }>();
const priorities = new Map<{ current: Updater }, number>();

export function useUpdater(fn: Updater, priority = 0) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    updaters.add(ref);
    priorities.set(ref, priority);
    return () => {
      updaters.delete(ref);
      priorities.delete(ref);
    };
  }, [priority]);
}

export function runUpdaters(ctx: FrameCtx): boolean {
  let busy = false;
  const ordered = [...updaters].sort((a, b) => (priorities.get(a) ?? 0) - (priorities.get(b) ?? 0));
  for (const u of ordered) if (u.current(ctx)) busy = true;
  return busy;
}

/** Exponential smoothing factor for a given rate and frame delta. */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

/** Imperative bridge used by the host to capture posters and re-home the canvas. */
export type CanvasBridge = {
  capture: (view: SceneView, width: number, height: number) => string | null;
  present: (view: SceneView, width: number, height: number) => void;
};

let bridge: CanvasBridge | null = null;
const bridgeListeners = new Set<(b: CanvasBridge | null) => void>();

export function setCanvasBridge(b: CanvasBridge | null) {
  bridge = b;
  bridgeListeners.forEach((l) => l(b));
}

export function getCanvasBridge() {
  return bridge;
}

export function onCanvasBridge(listener: (b: CanvasBridge | null) => void) {
  bridgeListeners.add(listener);
  return () => {
    bridgeListeners.delete(listener);
  };
}
