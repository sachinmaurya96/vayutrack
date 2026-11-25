import type { JourneyStage } from "@/content/journey";
import type { ServiceMode } from "@/content/services";
import {
  DELIVERY_EXIT,
  DELIVERY_ROUTE,
  DEST_DOORSTEP,
  FORKLIFT_ROUTE,
  ORIGIN_DOORSTEP,
  PICKUP_ROUTE,
  SAMPLE_PARCEL_SPOT,
  SECOND_TRUCK_DOCKED,
  TRAFFIC_EAST,
  TRAFFIC_WEST,
  TRUCK_DOCKED,
  TUG_LOOP,
  YARD_LOOP,
  type PathPoint,
} from "./layout";

/**
 * Pure pose functions shared by the WebGL world and the SVG fallback.
 *
 * `t` is the ambient clock in seconds. It starts at CLOCK_START, which is
 * tuned to give a good still composition, and only advances while motion is
 * allowed. With reduced motion the clock never moves, so every renderer shows
 * the same calm frame.
 */

export const CLOCK_START = 6;

export type View = "hero" | "services" | "journey";

export type PoseInput = {
  view: View;
  serviceMode: ServiceMode;
  journeyStage: JourneyStage;
  t: number;
};

export type Pose = { x: number; z: number; heading: number; visible: boolean; scale: number };

const pose = (p: PathPoint, visible = true, scale = 1): Pose => ({ x: p.x, z: p.z, heading: p.heading, visible, scale });
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const scratch: PathPoint = { x: 0, z: 0, heading: 0 };

export const DOCKED_HEADING = -Math.PI / 2; // facing south, away from the dock

/** Route progress targets for the branded truck in the journey. */
export const JOURNEY_TRUCK_U: Record<JourneyStage, number> = { 0: 0, 1: 0, 2: 0.5, 3: 1 };
/** Route progress targets for the pickup van in the journey. */
export const JOURNEY_VAN_U: Record<JourneyStage, number> = { 0: 0, 1: 1, 2: 1, 3: 1 };

const EXPRESS_CYCLE = 21;

export function brandedTruckPose(input: PoseInput): Pose {
  const { view, serviceMode, journeyStage, t } = input;
  if (view === "services" && serviceMode === "express") {
    const phase = (t + 1.2) % EXPRESS_CYCLE;
    if (phase < 2.5) return pose(DELIVERY_ROUTE.at(0, scratch), true, 0.85 + 0.15 * clamp01(phase / 0.45));
    if (phase < 12) return pose(DELIVERY_ROUTE.at(easeInOut((phase - 2.5) / 9.5), scratch));
    if (phase < 14.5) return pose(DELIVERY_ROUTE.at(1, scratch));
    if (phase < 19) return pose(DELIVERY_EXIT.at(Math.pow((phase - 14.5) / 4.5, 1.6), scratch));
    return pose(DELIVERY_ROUTE.at(0, scratch), false);
  }
  if (view === "journey") return pose(DELIVERY_ROUTE.at(JOURNEY_TRUCK_U[journeyStage], scratch));
  return { x: TRUCK_DOCKED[0], z: TRUCK_DOCKED[1], heading: DOCKED_HEADING, visible: true, scale: 1 };
}

export function secondTruckPose(): Pose {
  return { x: SECOND_TRUCK_DOCKED[0], z: SECOND_TRUCK_DOCKED[1], heading: DOCKED_HEADING, visible: true, scale: 1 };
}

export function pickupVanPose(input: PoseInput): Pose {
  if (input.view === "journey") return pose(PICKUP_ROUTE.at(JOURNEY_VAN_U[input.journeyStage], scratch));
  const speed = 9 / TRAFFIC_EAST.length;
  return pose(TRAFFIC_EAST.at((input.t * speed + 0.4) % 1, scratch));
}

export function trafficTruckPose(input: PoseInput): Pose {
  const speed = 8 / TRAFFIC_WEST.length;
  return pose(TRAFFIC_WEST.at((input.t * speed + 0.25) % 1, scratch));
}

const FORKLIFT_CYCLE = 9;

/** Forklift shuttles pallets from the yard into open dock door 0. */
export function forkliftPose(t: number): Pose & { carrying: boolean; lift: number } {
  const phase = t % FORKLIFT_CYCLE;
  let u: number;
  let carrying: boolean;
  let lift: number;
  if (phase < 1) {
    u = 0;
    carrying = phase > 0.5;
    lift = carrying ? (phase - 0.5) * 0.9 : 0;
  } else if (phase < 4.2) {
    u = easeInOut((phase - 1) / 3.2);
    carrying = true;
    lift = 0.45;
  } else if (phase < 5.2) {
    u = 1;
    carrying = phase < 4.7;
    lift = carrying ? 0.45 + (phase - 4.2) * 0.6 : 0.2;
  } else if (phase < 8.4) {
    u = 1 - easeInOut((phase - 5.2) / 3.2);
    carrying = false;
    lift = 0.12;
  } else {
    u = 0;
    carrying = false;
    lift = 0;
  }
  const p = FORKLIFT_ROUTE.at(u, scratch);
  return { ...pose(p), carrying, lift };
}

export function tugPose(t: number, offset = 0): Pose {
  const speed = 6 / TUG_LOOP.length;
  return pose(TUG_LOOP.at(t * speed + 0.15 - offset, scratch));
}

export function yardTruckPose(t: number): Pose {
  const speed = 7 / YARD_LOOP.length;
  return pose(YARD_LOOP.at(t * speed + 0.2, scratch));
}

/** 0 = over the quay, 1 = over the ship; plus hoist drop (0 = up). */
export function craneTrolley(t: number, index: number): { reach: number; drop: number } {
  const phase = (t + index * 4.5) % 12;
  if (phase < 4) return { reach: easeInOut(phase / 4), drop: 0 };
  if (phase < 6) return { reach: 1, drop: Math.sin(((phase - 4) / 2) * Math.PI) };
  if (phase < 10) return { reach: 1 - easeInOut((phase - 6) / 4), drop: 0 };
  return { reach: 0, drop: Math.sin(((phase - 10) / 2) * Math.PI) };
}

/** Where the highlighted parcel rests in each journey stage. `null` = riding in the truck. */
export function journeyParcelAnchor(stage: JourneyStage): readonly [number, number] | null {
  switch (stage) {
    case 0:
      return ORIGIN_DOORSTEP;
    case 1:
      return SAMPLE_PARCEL_SPOT;
    case 2:
      return null;
    case 3:
      return DEST_DOORSTEP;
  }
}
