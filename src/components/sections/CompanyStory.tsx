import { ArrowUpRight, Headset, House, PackageCheck, Plane, Ship, Truck, Warehouse, FileText, Handshake, MessageSquare } from "lucide-react";
import { story } from "@/content/home";

/** Role nodes positioned in percentages of the illustration box. */
const nodes = [
  { id: "pickup", label: "Pickup", icon: House, x: 12, y: 24 },
  { id: "hub", label: "Hub handling", icon: Warehouse, x: 40, y: 12 },
  { id: "road", label: "Road", icon: Truck, x: 78, y: 18 },
  { id: "air", label: "Air", icon: Plane, x: 90, y: 54 },
  { id: "ocean", label: "Ocean", icon: Ship, x: 70, y: 86 },
  { id: "delivery", label: "Delivery", icon: PackageCheck, x: 30, y: 84 },
] as const;

const centre = { x: 50, y: 50 };

function NetworkIllustration() {
  const W = 100;
  const H = 100;
  const curve = (a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return `M${a.x} ${a.y} Q${mx - dy * bend} ${my + dx * bend} ${b.x} ${b.y}`;
  };
  const ring = nodes.map((n, i) => curve(n, nodes[(i + 1) % nodes.length], 0.12));
  return (
    <figure className="relative">
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[var(--radius-stage)] border border-line bg-white">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.18" fill="#c5d2e3" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />
          {ring.map((d, i) => (
            <path key={`r${i}`} d={d} fill="none" stroke="#dce5f0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          ))}
          {nodes.map((n) => (
            <path key={`c${n.id}`} d={curve(centre, n, 0.08)} fill="none" stroke="#93b4f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ))}
          {nodes.map((n) => (
            <path key={`f${n.id}`} d={curve(centre, n, 0.08)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="vt-flow" data-ambient="" />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
          <span className="flex size-20 items-center justify-center rounded-full bg-navy text-white shadow-[0_0_0_10px_rgb(37_99_235/0.12),0_0_0_22px_rgb(37_99_235/0.06)] sm:size-24">
            <Headset aria-hidden className="size-9" />
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-[0.875rem] font-bold text-navy shadow-[var(--shadow-soft)]">VayuTrack team</span>
        </div>
        {nodes.map((n) => {
          const Icon = n.icon;
          return (
            <div key={n.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <span className="flex size-11 items-center justify-center rounded-2xl border border-line bg-white text-blue shadow-[var(--shadow-soft)] sm:size-12">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="whitespace-nowrap rounded-md bg-white/95 px-1.5 text-[0.875rem] font-bold text-navy">{n.label}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-3 text-[0.875rem] text-muted">Illustrative network: the roles in a shipment journey, not a map of locations.</figcaption>
    </figure>
  );
}

const pointIcons = [FileText, Handshake, MessageSquare];

export function CompanyStory() {
  return (
    <section id={story.id} aria-labelledby="story-heading" className="bg-bg py-20 lg:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 lg:order-2">
          <p className="eyebrow">{story.eyebrow}</p>
          <h2 id="story-heading" className="type-h2 mt-3">
            {story.heading}
          </h2>
          <p className="type-lead mt-5">{story.body}</p>
          <ul className="mt-8 grid gap-5">
            {story.points.map((p, i) => {
              const Icon = pointIcons[i];
              return (
                <li key={p.title} className="flex gap-4">
                  <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-blue">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-[1.0625rem] font-extrabold">{p.title}</h3>
                    <p className="mt-0.5 text-[0.9375rem] text-muted">{p.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-9 flex flex-col gap-3 xs:flex-row">
            {story.actions.map((a, i) => (
              <a key={a.href} href={a.href} className={`btn ${i === 0 ? "btn-blue" : "btn-secondary"}`}>
                {a.label} <ArrowUpRight aria-hidden className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 lg:order-1">
          <NetworkIllustration />
        </div>
      </div>
    </section>
  );
}
