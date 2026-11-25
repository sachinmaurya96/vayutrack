import Image from "next/image";
import { brand } from "@/content/site";

/** The supplied VayuTrack Express artwork at its native aspect ratio. */
export function Logo({ height = 48, eager = false, className = "" }: { height?: number; eager?: boolean; className?: string }) {
  const width = Math.round((height * brand.logo.width) / brand.logo.height);
  return (
    <Image
      src={brand.logo.src}
      alt={brand.logo.alt}
      width={width}
      height={height}
      sizes={`${width}px`}
      loading={eager ? "eager" : "lazy"}
      className={className}
      style={{ width, height }}
    />
  );
}
