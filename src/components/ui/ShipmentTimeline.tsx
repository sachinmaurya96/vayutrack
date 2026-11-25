import { Check } from "lucide-react";
import { timelineStates } from "@/content/journey";

/**
 * Compact five-state stepper for the illustrative shipment.
 * Always rendered with a visible label stating that it is illustrative.
 */
export function ShipmentTimeline({ currentIndex, label, className = "" }: { currentIndex: number; label: string; className?: string }) {
  const pct = (currentIndex / (timelineStates.length - 1)) * 100;
  return (
    <div className={className}>
      <ol aria-label={label} className="relative grid grid-cols-5">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[13px] h-[3px] rounded-full bg-line" />
        <span
          aria-hidden
          className="absolute left-[10%] top-[13px] h-[3px] rounded-full bg-blue transition-[width] duration-500"
          style={{ width: `${pct * 0.8}%` }}
        />
        {timelineStates.map((s, i) => {
          const done = i < currentIndex || (i === currentIndex && i === timelineStates.length - 1);
          const current = i === currentIndex;
          return (
            <li key={s.key} aria-current={current ? "step" : undefined} className="relative flex flex-col items-center gap-1.5 text-center">
              <span
                aria-hidden
                className={`relative z-10 flex size-[29px] items-center justify-center rounded-full border-2 transition-colors ${
                  done ? "border-blue bg-blue text-white" : current ? "border-blue bg-white" : "border-line-strong bg-white"
                } ${current ? "ring-4 ring-blue-100" : ""}`}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : current ? <span className="size-2.5 rounded-full bg-blue" /> : null}
              </span>
              <span className={`text-[0.875rem] leading-tight ${current ? "font-bold text-navy" : "font-medium text-muted"}`}>{s.label}</span>
              <span className="sr-only">{done ? "(completed)" : current ? "(current)" : "(upcoming)"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
