"use client";

import { ArrowRight, Check, Plane, Ship, Truck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { services, serviceByMode, type ServiceMode } from "@/content/services";
import { links } from "@/content/site";
import { SceneControls } from "@/components/scene/SceneControls";
import { SceneSlot } from "@/components/scene/SceneSlot";
import { useScene } from "@/components/scene/store";

const icons: Record<ServiceMode, typeof Truck> = { express: Truck, air: Plane, ocean: Ship };

export function ServiceExplorer() {
  const mode = useScene((s) => s.serviceMode);
  const setMode = useScene((s) => s.setServiceMode);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const active = serviceByMode[mode];
  const Icon = icons[mode];

  // Links such as #tab-air (header, footer, scene panel) open the matching tab.
  useEffect(() => {
    const select = (hash: string) => {
      const match = /^#tab-(express|air|ocean)$/.exec(hash);
      if (match) setMode(match[1] as ServiceMode);
      return !!match;
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#tab-']");
      if (!a || !select(a.getAttribute("href") ?? "")) return;
      e.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => document.getElementById("services")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }));
      history.replaceState(null, "", "#services");
    };
    if (select(location.hash)) document.getElementById("services")?.scrollIntoView();
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [setMode]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const last = services.length - 1;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    setMode(services[next].mode);
    tabs.current[next]?.focus();
  }

  return (
    <section id="services" aria-labelledby="services-heading" className="bg-bg py-20 lg:py-28">
      <div className="container-page">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Services</p>
            <h2 id="services-heading" className="type-h2 mt-3">
              The right route for every shipment.
            </h2>
          </div>
          <p className="type-lead lg:col-span-5">Express, Air and Ocean Freight, each planned around what you are sending and where it needs to go.</p>
        </div>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div role="tablist" aria-label="Freight services" aria-orientation="vertical" className="grid gap-2.5">
              {services.map((s, i) => {
                const TabIcon = icons[s.mode];
                const selected = s.mode === mode;
                return (
                  <button
                    key={s.mode}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    id={`tab-${s.mode}`}
                    aria-selected={selected}
                    aria-controls="service-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setMode(s.mode)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className={`group flex min-h-[4.5rem] items-center gap-4 rounded-[var(--radius-card)] border px-4 py-3 text-left transition-[background-color,border-color,box-shadow] ${
                      selected ? "border-blue bg-white shadow-[var(--shadow-panel)]" : "border-line bg-white/60 hover:border-line-strong hover:bg-white"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${selected ? "bg-blue text-white" : "bg-blue-50 text-blue"}`}
                    >
                      <TabIcon className="size-[1.375rem]" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[1.0625rem] font-extrabold text-navy">{s.name}</span>
                      <span className="block text-[0.9375rem] text-muted">{s.short}</span>
                    </span>
                    <ArrowRight aria-hidden className={`size-5 transition-all ${selected ? "translate-x-0 text-blue opacity-100" : "-translate-x-1 text-muted opacity-0 group-hover:opacity-60"}`} />
                  </button>
                );
              })}
            </div>

            <div id="service-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} tabIndex={0} className="mt-7 rounded-[var(--radius-card)]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                >
                  <h3 className="type-h3">{active.name}</h3>
                  <p className="mt-2 text-[1.0625rem] leading-relaxed text-ink">{active.description}</p>
                  <ul className="mt-5 grid gap-2.5" aria-label={`${active.name} benefits`}>
                    {active.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-3 font-semibold text-navy">
                        <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[0.9375rem] text-muted">
                    <span className="font-bold text-navy">Best suited for:</span> {active.bestFor}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                    <a href={active.enquiryHref} className="btn btn-blue">
                      Discuss this shipment<span className="sr-only"> ({active.name})</span> <ArrowRight aria-hidden className="size-4" />
                    </a>
                    <a href={links.howItWorks} className="btn btn-secondary">
                      See how it works
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative lg:col-span-7">
            <SceneSlot
              view="services"
              aspect={1.2}
              label={`Illustration for ${active.name}: ${active.sceneCaption}`}
              className="h-[22rem] rounded-[var(--radius-stage)] border border-line sm:h-[28rem] lg:h-full lg:min-h-[38rem]"
            />
            <div className="mt-3 flex flex-col gap-2 sm:pointer-events-none sm:absolute sm:inset-x-4 sm:bottom-4 sm:mt-0 sm:flex-row sm:items-end sm:justify-between">
              <div className="panel flex items-start gap-3 p-3.5 sm:pointer-events-auto sm:max-w-[24rem]" aria-live="polite">
                <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-[0.875rem] font-bold uppercase tracking-[0.1em] text-blue">Illustrative demo</p>
                  <p className="text-[0.9375rem] font-semibold leading-snug text-navy">{active.sceneCaption}</p>
                </div>
              </div>
              <SceneControls showReset={false} className="self-end sm:pointer-events-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
