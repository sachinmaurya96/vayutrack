"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import type { FramingId } from "./layout";
import { IsoScene } from "./fallback/IsoScene";
import { registerSlot, updateSlotVisibility } from "./slots";
import { cameraPresetFor, useScene, type SceneView } from "./store";

type Offsets = { base?: readonly [number, number]; lg?: readonly [number, number]; xl?: readonly [number, number] };

type Props = {
  view: SceneView;
  /** Typical aspect ratio of the slot, used to frame the SVG illustration. */
  aspect: number;
  label: string;
  className?: string;
  /** Nudges the subject away from overlaid panels. */
  offsets?: Offsets;
  children?: ReactNode;
};

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * A place the shared WebGL canvas can occupy. Always renders the SVG
 * illustration underneath, a captured still above it, then the live canvas.
 */
export function SceneSlot({ view, aspect, label, className = "", offsets, children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const offsetsRef = useRef(offsets);
  useEffect(() => {
    offsetsRef.current = offsets;
  });

  useEffect(() => {
    const el = root.current!;
    const lg = window.matchMedia("(min-width: 64rem)");
    const xl = window.matchMedia("(min-width: 80rem)");
    const unregister = registerSlot({
      view,
      root: el,
      mount: mount.current!,
      visibleArea: 0,
      offset: () =>
        (xl.matches ? offsetsRef.current?.xl : undefined) ?? (lg.matches ? offsetsRef.current?.lg : undefined) ?? offsetsRef.current?.base ?? [0, 0],
      showPoster: async (url) => {
        const img = poster.current;
        if (!img) return;
        img.src = url;
        try {
          await img.decode();
        } catch {
          /* still show whatever decoded */
        }
        img.style.opacity = "1";
      },
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        const r = entry.intersectionRect;
        updateSlotVisibility(view, entry.isIntersecting ? r.width * r.height : 0);
      },
      { threshold: THRESHOLDS },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unregister();
    };
  }, [view]);

  return (
    <div ref={root} className={`relative isolate overflow-hidden ${className}`} data-scene-slot={view}>
      <SlotIllustration view={view} aspect={aspect} label={label} offsets={offsets} />
      {/* Poster stills are captured canvas frames assigned imperatively, so next/image does not apply. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={poster} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0" />
      <div ref={mount} className="absolute inset-0" data-canvas-mount="" />
      {children}
    </div>
  );
}

const LG = "(min-width: 64rem)";
const XL = "(min-width: 80rem)";
const subscribeWidth = (cb: () => void) => {
  const queries = [window.matchMedia(LG), window.matchMedia(XL)];
  queries.forEach((mq) => mq.addEventListener("change", cb));
  return () => queries.forEach((mq) => mq.removeEventListener("change", cb));
};
const widthTier = () => (window.matchMedia(XL).matches ? 2 : window.matchMedia(LG).matches ? 1 : 0);

/** The SVG world, tracking state only when it is the visible renderer. */
function SlotIllustration({ view, aspect, label, offsets }: { view: SceneView; aspect: number; label: string; offsets?: Offsets }) {
  const tier = useSyncExternalStore(subscribeWidth, widthTier, () => 0);
  const offset = (tier === 2 ? offsets?.xl : undefined) ?? (tier >= 1 ? offsets?.lg : undefined) ?? offsets?.base;
  const live = useScene((s) => s.renderMode === "fallback");
  const framing = useScene((s) => (live ? cameraPresetFor(view, s) : cameraPresetFor(view, { ...s, heroSelected: null, serviceMode: "express", journeyStage: 0 }))) as FramingId;
  const serviceMode = useScene((s) => (live ? s.serviceMode : "express"));
  const journeyStage = useScene((s) => (live ? s.journeyStage : 0));
  const selected = useScene((s) => (live ? s.heroSelected : null));
  return (
    <IsoScene
      className="absolute inset-0 h-full w-full"
      label={label}
      view={view}
      framing={framing}
      aspect={aspect}
      serviceMode={serviceMode}
      journeyStage={journeyStage}
      selected={selected}
      offset={offset}
    />
  );
}
