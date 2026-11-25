import { ArrowRight } from "lucide-react";
import { partnership } from "@/content/home";
import { AppLink } from "@/components/ui/AppLink";

/** Abstract connected points; decorative only. */
export function NetworkMotif() {
  const pts: [number, number][] = [
    [40, 60], [120, 30], [200, 80], [280, 40], [340, 110], [90, 150], [180, 170], [270, 190], [360, 220], [60, 240], [150, 260], [240, 280],
  ];
  const links: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 2], [6, 7], [7, 4], [7, 8], [5, 9], [9, 10], [10, 6], [10, 11], [11, 7],
  ];
  return (
    <svg viewBox="0 0 400 320" aria-hidden className="h-full w-full">
      {links.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#9cc0ff" strokeOpacity="0.35" strokeWidth="1.5" />
      ))}
      {links.slice(0, 6).map(([a, b], i) => (
        <line key={`f${i}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="vt-flow" data-ambient="" />
      ))}
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i % 4 === 0 ? 10 : 6} fill={i % 4 === 0 ? "#2563eb" : "#0f3660"} stroke="#9cc0ff" strokeOpacity="0.6" strokeWidth="1.5" />
          {i % 4 === 0 && <circle cx={x} cy={y} r={3.5} fill="#ffffff" />}
        </g>
      ))}
    </svg>
  );
}

export function Partnerships() {
  return (
    <section id={partnership.id} aria-labelledby="grow-heading" className="bg-white pb-20 lg:pb-28">
      <div className="container-page">
        <div className="on-dark relative overflow-hidden rounded-[var(--radius-stage)] bg-navy text-white">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-12 lg:p-16">
            <div className="lg:col-span-7">
              <p className="text-[0.875rem] font-bold uppercase tracking-[0.12em] text-[#9cc0ff]">{partnership.eyebrow}</p>
              <h2 id="grow-heading" className="type-h2 mt-3 !text-white">
                {partnership.heading}
              </h2>
              <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-relaxed text-white/80">{partnership.body}</p>
              <div className="mt-8 flex flex-col gap-4 xs:flex-row xs:flex-wrap xs:items-center">
                <AppLink href={partnership.primary.href} className="btn btn-primary">
                  {partnership.primary.label} <ArrowRight aria-hidden className="size-4" />
                </AppLink>
                <AppLink href={partnership.secondary.href} className="link-arrow !text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                  {partnership.secondary.label} <ArrowRight aria-hidden className="size-4" />
                </AppLink>
                <AppLink href={partnership.tertiary.href} className="link-arrow !text-white/85 hover:!text-white">
                  {partnership.tertiary.label} <ArrowRight aria-hidden className="size-4" />
                </AppLink>
              </div>
            </div>
            <div className="hidden h-64 lg:col-span-5 lg:block">
              <NetworkMotif />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
