import { memo } from "react";
import { PALETTE } from "../palette";
import type { Shape } from "./iso";
import { buildIsoWorld, type IsoState } from "./world";

type Props = IsoState & { className?: string; label: string };

/**
 * Static isometric illustration of the logistics world. Used while WebGL
 * loads, when it is unavailable, on small screens and in compact vignettes.
 */
export const IsoScene = memo(function IsoScene({ className, label, ...state }: Props) {
  const { viewBox, shapes } = buildIsoWorld(state);
  const vb = `${viewBox.x.toFixed(1)} ${viewBox.y.toFixed(1)} ${viewBox.w.toFixed(1)} ${viewBox.h.toFixed(1)}`;
  return (
    <svg
      className={className}
      viewBox={vb}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={viewBox.x - 200} y={viewBox.y - 200} width={viewBox.w + 400} height={viewBox.h + 400} fill={PALETTE.ground} />
      {shapes.map(renderShape)}
    </svg>
  );
});

function renderShape(s: Shape, i: number) {
  switch (s.k) {
    case "path":
      return (
        <path
          key={i}
          d={s.d}
          fill={s.fill ?? "none"}
          stroke={s.stroke}
          strokeWidth={s.sw}
          strokeLinecap={s.cap}
          strokeLinejoin={s.stroke ? "round" : undefined}
          strokeDasharray={s.dash}
          opacity={s.op}
          className={s.cls}
          data-ambient={s.cls ? "" : undefined}
        />
      );
    case "circle":
      return <circle key={i} cx={s.cx.toFixed(1)} cy={s.cy.toFixed(1)} r={s.r.toFixed(2)} fill={s.fill} opacity={s.op} stroke={s.stroke} strokeWidth={s.sw} />;
    case "image":
      return <image key={i} href={s.href} width={s.w} height={s.h} transform={s.transform} preserveAspectRatio="none" />;
  }
}
