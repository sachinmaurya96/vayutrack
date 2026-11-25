"use client";

import { ArrowRight, Building2, Package, Truck, Warehouse } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { sceneIntro, sceneObjectById, sceneObjects, type SceneObjectId } from "@/content/sceneObjects";
import { sampleShipment, SAMPLE_NOTICE } from "@/lib/tracking/sample";
import { timelineStates } from "@/content/journey";
import { links } from "@/content/site";
import { focusTrackingInput } from "@/lib/focusTracking";
import { SceneControls } from "@/components/scene/SceneControls";
import { SceneSlot } from "@/components/scene/SceneSlot";
import { useScene } from "@/components/scene/store";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";
import { AppLink } from "@/components/ui/AppLink";

const icons: Record<SceneObjectId, typeof Truck> = { truck: Truck, hub: Warehouse, parcel: Package, destination: Building2 };
const sampleIndex = timelineStates.findIndex((s) => s.key === sampleShipment.currentKey);

/** Right edge of the 1280px content grid, measured from the viewport edge. */
const GRID_RIGHT = "xl:right-[max(2rem,calc((100vw-1280px)/2))]";

function ScenePanel() {
  const selected = useScene((s) => s.heroSelected);
  const reduce = useReducedMotion();
  const info = selected ? sceneObjectById[selected] : null;
  return (
    <section aria-labelledby="scene-panel-title" className="panel w-full p-5 xl:w-[22.5rem]">
      <span className="demo-badge">
        <span aria-hidden className="size-2 rounded-full bg-blue" /> Illustrative demo
      </span>
      <div aria-live="polite" className="mt-3.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected ?? "intro"}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[0.875rem] font-bold uppercase tracking-[0.1em] text-blue">{info ? info.eyebrow : "Explore the scene"}</p>
            <h2 id="scene-panel-title" className="mt-1 text-[1.25rem] font-extrabold leading-snug tracking-[-0.015em]">
              {info ? info.title : sceneIntro.title}
            </h2>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{info ? info.body : sceneIntro.body}</p>
            {info?.showsSample && (
              <div className="mt-3.5 rounded-2xl border border-line bg-bg p-3">
                <ShipmentTimeline currentIndex={sampleIndex} label="Sample shipment DEMO-VT-001 status" />
                <p className="mt-2.5 text-[0.875rem] font-semibold text-navy">{SAMPLE_NOTICE}</p>
              </div>
            )}
            {info && (
              <AppLink
                href={info.action.href}
                onClick={(e) => {
                  if (info.action.href === links.track && focusTrackingInput()) e.preventDefault();
                }}
                className="link-arrow mt-1"
              >
                {info.action.label} <ArrowRight aria-hidden className="size-4" />
              </AppLink>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <SceneControls className="mt-3 flex-nowrap border-t border-line pt-3.5 [&_.btn]:flex-1 [&_.btn]:!px-3" />
    </section>
  );
}

function ObjectChooser() {
  const selected = useScene((s) => s.heroSelected);
  const select = useScene((s) => s.select);
  return (
    <fieldset className="panel w-full p-2 xl:w-auto">
      <legend className="sr-only">Select a part of the scene to learn more</legend>
      <div className="flex flex-wrap items-center gap-1.5">
        <span aria-hidden className="hidden px-2.5 text-[0.875rem] font-bold text-muted xl:inline">
          Explore
        </span>
        {sceneObjects.map((o) => {
          const Icon = icons[o.id];
          const pressed = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => select(pressed ? null : o.id)}
              className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3.5 text-[0.9375rem] font-bold transition-colors xl:flex-none ${
                pressed ? "bg-blue text-white" : "text-navy hover:bg-blue-50"
              }`}
            >
              <Icon aria-hidden className="size-[1.125rem] shrink-0" />
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function HeroScene() {
  return (
    <div className="relative xl:absolute xl:inset-0">
      <div className="container-page xl:contents">
        <SceneSlot
          view="hero"
          aspect={1.15}
          label="Illustrative logistics scene: a blue-roofed VayuTrack hub with loading bays, a branded truck, a forklift moving pallets, parcels, and a road leading to a destination building."
          className="aspect-[4/3] rounded-[var(--radius-stage)] border border-line sm:aspect-[16/10] xl:absolute xl:inset-0 xl:aspect-auto xl:rounded-none xl:border-0 scene-fade-hero"
          offsets={{ xl: [-0.07, 0.03] }}
        />
      </div>
      <div className={`container-page mt-3 xl:absolute xl:bottom-8 xl:mt-0 xl:w-auto xl:max-w-none xl:px-0 ${GRID_RIGHT}`}>
        <ObjectChooser />
      </div>
      <div className={`container-page mt-3 xl:absolute xl:top-8 xl:mt-0 xl:w-auto xl:max-w-none xl:px-0 ${GRID_RIGHT}`}>
        <ScenePanel />
      </div>
    </div>
  );
}
