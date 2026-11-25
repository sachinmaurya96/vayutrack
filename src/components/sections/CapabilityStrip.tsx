import { Headset, Route, ScanLine, ShieldCheck } from "lucide-react";
import { capabilities, type CapabilityIcon } from "@/content/home";

const icons: Record<CapabilityIcon, typeof Route> = {
  handling: ShieldCheck,
  visibility: ScanLine,
  modes: Route,
  support: Headset,
};

export function CapabilityStrip() {
  return (
    <section aria-labelledby="capabilities-heading" className="border-y border-line bg-white">
      <h2 id="capabilities-heading" className="sr-only">
        What VayuTrack offers
      </h2>
      <ul className="container-page grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {capabilities.map((c, i) => {
          const Icon = icons[c.icon];
          return (
            <li key={c.title} className={`flex gap-4 py-6 sm:py-8 lg:px-7 ${i === 0 ? "lg:pl-0" : ""} ${i === capabilities.length - 1 ? "lg:pr-0" : ""}`}>
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue">
                <Icon className="size-[1.375rem]" />
              </span>
              <div>
                <h3 className="text-[1.0625rem] font-extrabold tracking-[-0.01em]">{c.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{c.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
