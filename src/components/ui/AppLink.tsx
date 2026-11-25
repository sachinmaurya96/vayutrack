import Link from "next/link";
import type { ComponentProps } from "react";

/** Client-side navigation for routes on this site; plain anchors for tel:/mailto:. */
export function AppLink({ href, ...props }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} {...props} />;
  return <a href={href} {...props} />;
}
