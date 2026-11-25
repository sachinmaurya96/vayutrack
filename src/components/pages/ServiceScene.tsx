"use client";

import { Plane, Ship, Truck } from "lucide-react";
import { useEffect } from "react";
import type { ServiceMode } from "@/content/services";
import { SceneControls } from "@/components/scene/SceneControls";
import { SceneSlot } from "@/components/scene/SceneSlot";
import { useScene } from "@/components/scene/store";

const icons: Record<ServiceMode, typeof Truck> = { express: Truck, air: Plane, ocean: Ship };

/** The shared logistics world, framed on one service's zone. */
export function ServiceScene({ mode, name, caption }: { mode: ServiceMode; name: string; caption: string }) {
  const setServiceMode = useScene((s) => s.setServiceMode);
  useEffect(() => {
    setServiceMode(mode);
  }, [mode, setServiceMode]);
  const Icon = icons[mode];
  return (
    <div className="relative">
      <SceneSlot
        view="services"
        aspect={1.2}
        label={`Illustration for ${name}: ${caption}`}
        className="h-[20rem] rounded-[var(--radius-stage)] border border-line bg-white sm:h-[26rem] lg:h-[32rem]"
      />
      <div className="mt-3 flex flex-col gap-2 sm:pointer-events-none sm:absolute sm:inset-x-4 sm:bottom-4 sm:mt-0 sm:flex-row sm:items-end sm:justify-between">
        <div className="panel flex items-start gap-3 p-3.5 sm:pointer-events-auto sm:max-w-[22rem]">
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-[0.875rem] font-bold uppercase tracking-[0.1em] text-blue">Illustrative demo</p>
            <p className="text-[0.9375rem] font-semibold leading-snug text-navy">{caption}</p>
          </div>
        </div>
        <SceneControls showReset={false} className="self-end sm:pointer-events-auto" />
      </div>
    </div>
  );
}
