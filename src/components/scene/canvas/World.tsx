"use client";

import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { sceneObjectById, type SceneObjectId } from "@/content/sceneObjects";
import {
  AIRPORT,
  DELIVERY_ROUTE,
  DEST_DOORSTEP,
  PICKUP_ROUTE,
  PORT,
  SAMPLE_PARCEL_SPOT,
  SELECTION_BOUNDS,
} from "../layout";
import { PALETTE as C } from "../palette";
import {
  JOURNEY_TRUCK_U,
  JOURNEY_VAN_U,
  brandedTruckPose,
  craneTrolley,
  forkliftPose,
  journeyParcelAnchor,
  pickupVanPose,
  secondTruckPose,
  trafficTruckPose,
  tugPose,
  yardTruckPose,
  type Pose,
} from "../poses";
import { useScene } from "../store";
import { damp, useUpdater, type FrameCtx } from "./engine";
import { Aircraft, AirportTerminal, Dolly, HighLoader, Tug } from "./models/Airport";
import { Annex, CityBlocks, Destination, Hub, OriginHouse } from "./models/Buildings";
import { Ground } from "./models/Ground";
import { ContainerYard, Crane, Ship } from "./models/Port";
import { Checkmark, DropZone, PalletStacks, Parcel, Pin, RouteRibbon, SelectionMarker, Trees } from "./models/Props";
import { Forklift, Truck, Van } from "./models/Vehicles";

function apply(obj: THREE.Object3D | null, p: Pose, y = 0) {
  if (!obj) return;
  obj.position.set(p.x, y, p.z);
  obj.rotation.set(0, p.heading, 0);
  obj.visible = p.visible;
  obj.scale.setScalar(p.scale);
}

/** Pointer helpers: objects are only selectable in the hero view. */
function useSelectable(id: SceneObjectId) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (useScene.getState().activeView !== "hero") return;
      e.stopPropagation();
      useScene.getState().select(id);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (useScene.getState().activeView !== "hero") return;
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "";
    },
  };
}

function SceneTag({ id }: { id: SceneObjectId }) {
  const selected = useScene((s) => s.heroSelected === id && s.activeView === "hero");
  const b = SELECTION_BOUNDS[id];
  if (!selected) return null;
  return (
    <Html position={[b.c[0], b.c[1] + b.s[1] / 2 + 1.6, b.c[2]]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <div aria-hidden="true" className="whitespace-nowrap rounded-full border border-line bg-white px-3 py-1.5 text-sm font-bold text-navy shadow-[var(--shadow-soft)]">
        <span className="mr-1.5 inline-block size-2 rounded-full bg-blue align-middle" />
        {sceneObjectById[id].label}
        <span className="font-semibold text-muted"> · {sceneObjectById[id].eyebrow}</span>
      </div>
    </Html>
  );
}

function Selection() {
  const selected = useScene((s) => (s.activeView === "hero" ? s.heroSelected : null));
  return (
    <>
      {(Object.keys(SELECTION_BOUNDS) as SceneObjectId[]).map((id) => (
        <SelectionMarker key={id} center={SELECTION_BOUNDS[id].c} size={SELECTION_BOUNDS[id].s} visible={selected === id} />
      ))}
      {(Object.keys(SELECTION_BOUNDS) as SceneObjectId[]).map((id) => (
        <SceneTag key={`t${id}`} id={id} />
      ))}
    </>
  );
}

function Vehicles() {
  const truck = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  const van = useRef<THREE.Group>(null);
  const traffic = useRef<THREE.Group>(null);
  const forklift = useRef<THREE.Group>(null);
  const lift = useRef<THREE.Group>(null);
  const load = useRef<THREE.Group>(null);
  const truckU = useRef(0);
  const vanU = useRef(0);
  const scratch = useRef({ x: 0, z: 0, heading: 0 });
  const select = useSelectable("truck");

  useUpdater((ctx: FrameCtx) => {
    const input = { view: ctx.view, serviceMode: ctx.s.serviceMode, journeyStage: ctx.s.journeyStage, t: ctx.t };
    let busy = false;
    // Branded truck: eased along the route during the journey.
    if (ctx.view === "journey") {
      const target = JOURNEY_TRUCK_U[ctx.s.journeyStage];
      let u = target;
      if (!ctx.capture) {
        if (ctx.snap) truckU.current = target;
        else truckU.current += (target - truckU.current) * damp(1.4, ctx.dt);
        if (Math.abs(target - truckU.current) > 0.0005) busy = true;
        else truckU.current = target;
        u = truckU.current;
      }
      const p = DELIVERY_ROUTE.at(u, scratch.current);
      apply(truck.current, { ...p, visible: true, scale: 1 });
      const vt = JOURNEY_VAN_U[ctx.s.journeyStage];
      let vu = vt;
      if (!ctx.capture) {
        if (ctx.snap) vanU.current = vt;
        else vanU.current += (vt - vanU.current) * damp(1.4, ctx.dt);
        if (Math.abs(vt - vanU.current) > 0.0005) busy = true;
        else vanU.current = vt;
        vu = vanU.current;
      }
      apply(van.current, { ...PICKUP_ROUTE.at(vu, scratch.current), visible: true, scale: 1 });
    } else {
      apply(truck.current, brandedTruckPose(input));
      apply(van.current, pickupVanPose(input));
    }
    apply(second.current, secondTruckPose());
    apply(traffic.current, trafficTruckPose(input));
    const f = forkliftPose(ctx.t);
    apply(forklift.current, f);
    if (lift.current) lift.current.position.y = f.lift;
    if (load.current) load.current.visible = f.carrying;
    return busy;
  });

  return (
    <>
      <Truck ref={truck} branded {...select} />
      <Truck ref={second} />
      <Van ref={van} />
      <Truck ref={traffic} cabColor="#c9d6ea" />
      <Forklift ref={forklift} liftRef={lift} loadRef={load} />
    </>
  );
}

/** Sample parcel (hero), journey parcel and their pins. */
function Parcels() {
  const sample = useRef<THREE.Group>(null);
  const samplePin = useRef<THREE.Group>(null);
  const journey = useRef<THREE.Group>(null);
  const journeyPin = useRef<THREE.Group>(null);
  const check = useRef<THREE.Group>(null);
  const drop = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(SAMPLE_PARCEL_SPOT[0], 0, SAMPLE_PARCEL_SPOT[1]));
  const selectedSample = useScene((s) => s.heroSelected === "parcel");
  const select = useSelectable("parcel");
  const truckScratch = useRef({ x: 0, z: 0, heading: 0 });

  useUpdater((ctx) => {
    const bob = Math.sin(ctx.t * 2.2) * 0.25;
    const inJourney = ctx.view === "journey";
    if (sample.current) sample.current.visible = !inJourney;
    if (samplePin.current) {
      samplePin.current.visible = ctx.view === "hero" && ctx.s.heroSelected === "parcel";
      samplePin.current.position.y = 3.2 + bob;
    }
    let busy = false;
    if (journey.current && journeyPin.current) {
      journey.current.visible = inJourney;
      journeyPin.current.visible = inJourney;
      if (inJourney) {
        const stage = ctx.s.journeyStage;
        const anchor = journeyParcelAnchor(stage);
        const target = new THREE.Vector3();
        let inTruck = false;
        if (anchor) target.set(anchor[0], anchor === SAMPLE_PARCEL_SPOT ? 0.32 : 0, anchor[1]);
        else {
          const p = DELIVERY_ROUTE.at(JOURNEY_TRUCK_U[stage], truckScratch.current);
          target.set(p.x, 2.2, p.z);
          inTruck = true;
        }
        const p = ctx.capture ? target.clone() : pos.current;
        if (!ctx.capture) {
          if (ctx.snap) p.copy(target);
          else {
            const k = damp(inTruck ? 1.4 : 2.6, ctx.dt);
            p.lerp(target, k);
          }
          if (p.distanceTo(target) > 0.02) busy = true;
          else p.copy(target);
        }
        journey.current.position.copy(p);
        journey.current.visible = !inTruck || p.distanceTo(target) > 4;
        journeyPin.current.position.set(p.x, p.y + (inTruck ? 4.4 : 2.4) + bob, p.z);
      }
    }
    if (check.current) check.current.visible = inJourney && ctx.s.journeyStage === 3;
    if (drop.current) drop.current.visible = inJourney && ctx.s.journeyStage === 3;
    return busy;
  });

  return (
    <>
      <group position={[SAMPLE_PARCEL_SPOT[0], 0, SAMPLE_PARCEL_SPOT[1]]} {...select}>
        <mesh position={[0, 0.16, 0]} scale={[2.3, 0.3, 2.3]} castShadow receiveShadow>
          <boxGeometry />
          <meshStandardMaterial color={C.pallet} roughness={0.9} />
        </mesh>
        <Parcel ref={sample} position={[0, 0.32, 0]} highlighted={selectedSample} />
        <Pin ref={samplePin} scale={0.8} visible={false} />
      </group>
      <Parcel ref={journey} highlighted visible={false} />
      <Pin ref={journeyPin} visible={false} />
      <group ref={drop} position={[DEST_DOORSTEP[0], 0, DEST_DOORSTEP[1]]} visible={false}>
        <DropZone />
      </group>
      <group ref={check} position={[DEST_DOORSTEP[0] + 2.2, 2.2, DEST_DOORSTEP[1]]} visible={false}>
        <Checkmark />
      </group>
    </>
  );
}

function Route() {
  const group = useRef<THREE.Group>(null);
  const dash = useRef<THREE.Mesh>(null);
  useUpdater((ctx) => {
    const show = (ctx.view === "services" && ctx.s.serviceMode === "express") || (ctx.view === "journey" && ctx.s.journeyStage >= 2);
    if (group.current) group.current.visible = show;
    const map = (dash.current?.material as THREE.MeshBasicMaterial | undefined)?.map;
    if (map) map.offset.x = -ctx.t * 0.55;
  });
  return (
    <group ref={group} visible={false}>
      <RouteRibbon route={DELIVERY_ROUTE} dashRef={dash} />
    </group>
  );
}

function AirportActors() {
  const tug = useRef<THREE.Group>(null);
  const dollies = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const loader = useRef<THREE.Group>(null);
  useUpdater((ctx) => {
    apply(tug.current, tugPose(ctx.t));
    dollies.forEach((d, i) => apply(d.current, tugPose(ctx.t, (i + 1) * 0.024)));
    if (loader.current) loader.current.position.y = 3.4 + Math.sin(ctx.t * 0.6) * 1.4;
  });
  return (
    <>
      <AirportTerminal />
      <Aircraft position={[AIRPORT.aircraft.x, 4.3, AIRPORT.aircraft.z]} />
      <Tug ref={tug} />
      {dollies.map((d, i) => (
        <Dolly key={i} ref={d} />
      ))}
      <HighLoader ref={loader} position={[AIRPORT.aircraft.x - 8, 0, AIRPORT.aircraft.z + 6.2]} />
      {/* Loaded dollies waiting by the terminal doors. */}
      {[-122, -118, -88, -84, -80].map((z) => (
        <Dolly key={z} position={[AIRPORT.terminal.x + AIRPORT.terminal.w / 2 + 5, 0, z]} rotation-y={Math.PI / 2} />
      ))}
    </>
  );
}

function PortActors() {
  const ship = useRef<THREE.Group>(null);
  const trolleys = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const hoists = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const yard = useRef<THREE.Group>(null);
  useUpdater((ctx) => {
    if (ship.current) ship.current.position.y = Math.sin(ctx.t * 0.7) * 0.12;
    PORT.cranes.forEach((_, i) => {
      const { reach, drop } = craneTrolley(ctx.t, i);
      if (trolleys[i].current) trolleys[i].current!.position.x = 4 - reach * 18;
      if (hoists[i].current) hoists[i].current!.position.y = 12 - drop * 4;
    });
    apply(yard.current, yardTruckPose(ctx.t));
  });
  return (
    <>
      <ContainerYard />
      <Ship ref={ship} />
      {PORT.cranes.map((cz, i) => (
        <Crane
          key={cz}
          ref={trolleys[i]}
          hoistRef={hoists[i]}
          position={[PORT.quayX, 0, cz]}
          containerColor={C.containers[(i * 3 + 2) % C.containers.length]}
        />
      ))}
      <group ref={yard}>
        <mesh position={[1.6, 1.5, 0]} castShadow>
          <boxGeometry args={[2, 2.2, 2.2]} />
          <meshStandardMaterial color={C.tug} roughness={0.5} />
        </mesh>
        <mesh position={[-1.6, 2.1, 0]} castShadow>
          <boxGeometry args={[5.6, 2.4, 2.3]} />
          <meshStandardMaterial color={C.containers[4]} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[8, 0.6, 2]} />
          <meshStandardMaterial color={C.chassis} />
        </mesh>
      </group>
    </>
  );
}

export function World() {
  const hub = useSelectable("hub");
  const destination = useSelectable("destination");
  return (
    <group>
      <Ground />
      <group {...hub}>
        <Hub />
        <Annex />
      </group>
      <OriginHouse />
      <group {...destination}>
        <Destination />
      </group>
      <CityBlocks />
      <PalletStacks />
      <Trees />
      <Vehicles />
      <Parcels />
      <Route />
      <Selection />
      <AirportActors />
      <PortActors />
    </group>
  );
}
