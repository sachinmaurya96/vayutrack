"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { chapterTimelineIndex, journey, timelineStates, type JourneyStage } from "@/content/journey";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { SceneControls } from "@/components/scene/SceneControls";
import { SceneSlot } from "@/components/scene/SceneSlot";
import { useScene } from "@/components/scene/store";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";

const LG = "(min-width: 64rem)";
const subscribeLg = (cb: () => void) => {
  const mq = window.matchMedia(LG);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** null on the server and until hydrated, so mobile-only art never renders on desktop. */
function useIsDesktop() {
  return useSyncExternalStore<boolean | null>(subscribeLg, () => window.matchMedia(LG).matches, () => null);
}

const shortLabels = ["Plan", "Prepare", "Follow", "Deliver"];

export function Journey() {
  const stage = useScene((s) => s.journeyStage);
  const setStage = useScene((s) => s.setJourneyStage);
  const chapters = useRef<(HTMLLIElement | null)[]>([]);
  const lockUntil = useRef(0);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (performance.now() < lockUntil.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) setStage(Number((entry.target as HTMLElement).dataset.stage) as JourneyStage);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    chapters.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [setStage]);

  function jump(i: JourneyStage, at: number) {
    setStage(i);
    lockUntil.current = at + 1100;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    chapters.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }

  return (
    <section id="how-it-works" aria-labelledby="journey-heading" className="bg-white py-20 lg:py-28">
      <div className="container-page">
        <div className="max-w-[46rem]">
          <p className="eyebrow">{journey.eyebrow}</p>
          <h2 id="journey-heading" className="type-h2 mt-3">
            {journey.heading}
          </h2>
          <p className="type-lead mt-4">{journey.intro}</p>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-6 lg:grid-cols-12">
          <ol className="lg:col-span-5">
            {journey.chapters.map((c, i) => {
              const current = stage === i;
              return (
                <li
                  key={c.title}
                  ref={(el) => {
                    chapters.current[i] = el;
                  }}
                  data-stage={i}
                  aria-current={isDesktop && current ? "step" : undefined}
                  className="relative flex border-l-2 pb-10 pl-6 last:pb-0 lg:min-h-[62svh] lg:items-center lg:border-l-0 lg:pb-0 lg:pl-0 lg:last:mb-[22svh]"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  <div className="relative w-full">
                    <span
                      aria-hidden
                      className={`absolute -left-6 top-0 hidden h-full w-1 rounded-full transition-colors duration-300 lg:block ${isDesktop && current ? "bg-blue" : "bg-line"}`}
                    />
                    <span
                      aria-hidden
                      className={`absolute -left-[33px] top-0 size-4 rounded-full border-2 lg:hidden ${current ? "border-blue bg-blue" : "border-line-strong bg-white"}`}
                    />
                    <p className={`font-mono text-[0.875rem] font-bold tracking-[0.08em] ${!isDesktop || current ? "text-blue" : "text-muted"}`}>STEP 0{i + 1}</p>
                    <h3 className="type-h3 mt-2">{c.title}</h3>
                    <p className="mt-3 max-w-[30rem] text-[1.0625rem] leading-relaxed text-muted">{c.body}</p>
                    {isDesktop === false && (
                      <IsoScene
                        className="mt-5 aspect-[16/10] w-full rounded-[var(--radius-card)] border border-line"
                        label={`Illustration: ${c.sceneLabel}`}
                        view="journey"
                        framing={`journey:${i as JourneyStage}`}
                        aspect={1.6}
                        serviceMode="express"
                        journeyStage={i as JourneyStage}
                        selected={null}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Mobile and tablet: a compact sample status after the steps. */}
          <div className="rounded-[var(--radius-card)] border border-line bg-bg p-4 lg:hidden">
            <p className="mb-3 text-[0.875rem] font-bold text-navy">Sample shipment status · Illustrative</p>
            <ShipmentTimeline currentIndex={timelineStates.length - 1} label="Illustrative shipment states" />
          </div>

          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-[calc(var(--header-h)+1.5rem)] h-[calc(100svh-var(--header-h)-3rem)] max-h-[48rem] min-h-[34rem]">
              <SceneSlot
                view="journey"
                aspect={1}
                label={`Illustration of step ${stage + 1}: ${journey.chapters[stage].sceneLabel}`}
                className="h-full rounded-[var(--radius-stage)] border border-line"
                offsets={{ lg: [0, -0.06] }}
              />
              <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                <div role="group" aria-label="Jump to a step" className="panel flex gap-1 p-1">
                  {shortLabels.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={stage === i}
                      onClick={(e) => jump(i as JourneyStage, e.timeStamp)}
                      className={`min-h-11 rounded-[12px] px-3.5 text-[0.9375rem] font-bold transition-colors ${stage === i ? "bg-blue text-white" : "text-navy hover:bg-blue-50"}`}
                    >
                      <span className="sr-only">Step {i + 1}: </span>
                      {label}
                    </button>
                  ))}
                </div>
                <SceneControls showReset={false} />
              </div>
              <div className="panel absolute inset-x-4 bottom-4 p-4" aria-live="polite">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[0.9375rem] font-bold text-navy">
                    Sample shipment status <span className="font-semibold text-muted">· Illustrative</span>
                  </p>
                  <p className="text-[0.875rem] font-semibold text-muted">
                    Step {stage + 1} of 4 · {journey.chapters[stage].sceneLabel}
                  </p>
                </div>
                <ShipmentTimeline currentIndex={chapterTimelineIndex[stage]} label="Illustrative shipment state for this step" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
