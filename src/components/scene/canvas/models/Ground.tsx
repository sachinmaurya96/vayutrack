"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { AIRPORT, APRON, DEST, DOCK_XS, ORIGIN, PORT, ROAD_A, ROAD_B, ROAD_C, SIDEWALK } from "../../layout";
import { PALETTE as C } from "../../palette";
import { mat, unitBox, unitPlane } from "../resources";

type Rect = { x0: number; x1: number; z0: number; z1: number; y: number; color: string; raised?: number };

function Flat({ r }: { r: Rect }) {
  const w = r.x1 - r.x0;
  const d = r.z1 - r.z0;
  if (r.raised) {
    return <mesh geometry={unitBox()} material={mat(r.color, { rough: 0.95 })} position={[(r.x0 + r.x1) / 2, r.y + r.raised / 2, (r.z0 + r.z1) / 2]} scale={[w, r.raised, d]} receiveShadow />;
  }
  return <mesh geometry={unitPlane()} material={mat(r.color, { rough: 0.95 })} position={[(r.x0 + r.x1) / 2, r.y, (r.z0 + r.z1) / 2]} scale={[w, 1, d]} receiveShadow />;
}

/** Instanced flat rectangles (lane dashes, bay lines, runway marks). */
function Marks({ rects, color, y }: { rects: [number, number, number, number][]; color: string; y: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    rects.forEach(([x0, z0, x1, z1], i) => {
      m.makeScale(x1 - x0, 1, z1 - z0).setPosition((x0 + x1) / 2, y, (z0 + z1) / 2);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [rects, y]);
  return <instancedMesh ref={ref} args={[unitPlane(), mat(color, { rough: 0.8, polygonOffset: 1 }), rects.length]} receiveShadow />;
}

export function Ground() {
  const { z, half, x0, x1 } = ROAD_A;
  const surfaces = useMemo<Rect[]>(
    () => [
      // Water and quay.
      { x0: PORT.water.x0, x1: PORT.water.x1, z0: PORT.water.z0, z1: PORT.water.z1, y: 0.02, color: C.water },
      { x0: PORT.water.x1 - 1.4, x1: PORT.water.x1, z0: PORT.water.z0, z1: PORT.water.z1, y: 0.03, color: C.waterEdge },
      { x0: PORT.quayX, x1: PORT.yard.x1 + 4, z0: PORT.yard.z0 - 6, z1: PORT.yard.z1 + 4, y: 0.02, color: C.quay },
      // Airport.
      { x0: AIRPORT.apron.x0 - 6, x1: AIRPORT.apron.x1 + 6, z0: AIRPORT.apron.z0 - 6, z1: AIRPORT.apron.z1 + 6, y: 0.02, color: C.apron },
      { x0: AIRPORT.runway.x - AIRPORT.runway.half - 6, x1: AIRPORT.runway.x + AIRPORT.runway.half + 6, z0: AIRPORT.runway.z0, z1: AIRPORT.runway.z1, y: 0.015, color: C.grass },
      { x0: AIRPORT.runway.x - AIRPORT.runway.half, x1: AIRPORT.runway.x + AIRPORT.runway.half, z0: AIRPORT.runway.z0, z1: AIRPORT.runway.z1, y: 0.03, color: C.runway },
      // Hub yard, destination forecourt, sender's garden.
      { x0: APRON.x0, x1: APRON.x1, z0: APRON.z0, z1: z - half, y: 0.03, color: C.apron },
      { x0: DEST.x - DEST.w / 2 - 4, x1: DEST.x + DEST.w / 2 + 4, z0: DEST.z + DEST.d / 2, z1: z - half, y: 0.03, color: C.apron },
      { x0: ORIGIN.x - ORIGIN.w / 2 - 3, x1: ORIGIN.x + ORIGIN.w / 2 + 3, z0: ORIGIN.z - ORIGIN.d / 2 - 3, z1: ORIGIN.z + ORIGIN.d / 2 + 3, y: 0.02, color: C.grass },
      // Roads.
      { x0, x1, z0: z - half, z1: z + half, y: 0.04, color: C.road },
      { x0: ROAD_B.x - ROAD_B.half, x1: ROAD_B.x + ROAD_B.half, z0: ROAD_B.z0, z1: z - half, y: 0.04, color: C.road },
      { x0: ROAD_C.x - ROAD_C.half, x1: ROAD_C.x + ROAD_C.half, z0: ROAD_C.z0, z1: z - half, y: 0.04, color: C.road },
    ],
    [z, half, x0, x1],
  );

  // Raised kerbs/sidewalks, leaving gaps for driveways and junctions.
  const sidewalks = useMemo<Rect[]>(() => {
    const out: Rect[] = [];
    const north = z - half - SIDEWALK;
    const south = z + half;
    const gapsNorth: [number, number][] = [
      [APRON.x0, APRON.x1],
      [DEST.x - DEST.w / 2 - 4, DEST.x + DEST.w / 2 + 4],
      [ROAD_B.x - ROAD_B.half, ROAD_B.x + ROAD_B.half],
      [ROAD_C.x - ROAD_C.half, ROAD_C.x + ROAD_C.half],
      [ORIGIN.x - 1.3, ORIGIN.x + 1.3],
    ].sort((a, b) => a[0] - b[0]) as [number, number][];
    let cursor: number = x0;
    for (const [g0, g1] of gapsNorth) {
      if (g0 > cursor) out.push({ x0: cursor, x1: g0, z0: north, z1: north + SIDEWALK, y: 0, color: C.sidewalk, raised: 0.2 });
      cursor = Math.max(cursor, g1);
    }
    out.push({ x0: cursor, x1, z0: north, z1: north + SIDEWALK, y: 0, color: C.sidewalk, raised: 0.2 });
    out.push({ x0, x1, z0: south, z1: south + SIDEWALK, y: 0, color: C.sidewalk, raised: 0.2 });
    for (const r of [ROAD_B, ROAD_C]) {
      out.push({ x0: r.x - r.half - SIDEWALK, x1: r.x - r.half, z0: r.z0, z1: north, y: 0, color: C.sidewalk, raised: 0.2 });
      out.push({ x0: r.x + r.half, x1: r.x + r.half + SIDEWALK, z0: r.z0, z1: north, y: 0, color: C.sidewalk, raised: 0.2 });
    }
    return out;
  }, [z, half, x0, x1]);

  const laneDashes = useMemo(() => {
    const out: [number, number, number, number][] = [];
    for (let x = x0 + 2; x < x1; x += 7) {
      if (Math.abs(x - ROAD_B.x) < 8 || Math.abs(x - ROAD_C.x) < 8) continue;
      out.push([x, z - 0.22, x + 3.4, z + 0.22]);
    }
    for (const r of [ROAD_B, ROAD_C]) for (let zz = r.z0 + 2; zz < z - half - 4; zz += 7) out.push([r.x - 0.2, zz, r.x + 0.2, zz + 3.4]);
    const rw = AIRPORT.runway;
    for (let zz = rw.z0 + 6; zz < rw.z1; zz += 14) out.push([rw.x - 0.35, zz, rw.x + 0.35, zz + 7]);
    // Zebra crossing at the hub entrance.
    for (let i = 0; i < 6; i++) out.push([APRON.x0 - 7, z - half + 0.8 + i * 1.7, APRON.x0 - 3.5, z - half + 1.6 + i * 1.7]);
    return out;
  }, [z, half, x0, x1]);

  const bayLines = useMemo(() => {
    const out: [number, number, number, number][] = [];
    for (const dx of DOCK_XS) for (const s of [-1, 1]) out.push([dx + s * 3.1 - 0.14, APRON.z0 + 0.6, dx + s * 3.1 + 0.14, APRON.z0 + 10]);
    // Stand lead-in line on the apron.
    out.push([AIRPORT.apron.x0 + 4, -100.18, AIRPORT.aircraft.x - 20, -99.82]);
    // Yard walkway.
    for (let x = APRON.x0 + 1; x < APRON.x0 + 14; x += 2.2) out.push([x, APRON.z0 + 0.4, x + 1.2, APRON.z0 + 0.7]);
    return out;
  }, []);

  return (
    <group>
      <mesh geometry={unitPlane()} material={mat(C.ground, { rough: 1 })} position={[0, 0, -40]} scale={[900, 1, 700]} receiveShadow />
      {surfaces.map((r, i) => (
        <Flat key={i} r={r} />
      ))}
      {sidewalks.map((r, i) => (
        <Flat key={`s${i}`} r={r} />
      ))}
      <Marks rects={laneDashes} color={C.laneMark} y={0.06} />
      <Marks rects={bayLines} color={C.bayLine} y={0.06} />
    </group>
  );
}
