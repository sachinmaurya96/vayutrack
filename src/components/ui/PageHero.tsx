import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { AppLink } from "./AppLink";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-[0.875rem] font-semibold text-muted">
        {[{ label: "Home", href: "/" }, ...items].map((c, i, all) => (
          <li key={c.label} className="flex items-center gap-1">
            {c.href && i < all.length - 1 ? (
              <AppLink href={c.href} className="rounded px-0.5 hover:text-blue hover:underline hover:underline-offset-4">
                {c.label}
              </AppLink>
            ) : (
              <span aria-current="page" className="text-navy">
                {c.label}
              </span>
            )}
            {i < all.length - 1 && <ChevronRight aria-hidden className="size-3.5" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  actions?: ReactNode;
  art?: ReactNode;
  /** Extra content under the lead (e.g. a search box). */
  children?: ReactNode;
  tone?: "light" | "white";
};

/** Inner-page hero: breadcrumb, heading and a framed illustration. */
export function PageHero({ eyebrow, title, lead, crumbs, actions, art, children, tone = "light" }: Props) {
  return (
    <section aria-labelledby="page-heading" className={`relative overflow-hidden border-b border-line ${tone === "white" ? "bg-white" : "bg-bg"}`}>
      <div className="container-page grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className={art ? "lg:col-span-6" : "lg:col-span-9"}>
          <Breadcrumbs items={crumbs} />
          <p className="eyebrow mt-6">{eyebrow}</p>
          <h1 id="page-heading" className="type-page-title mt-3">
            {title}
          </h1>
          {lead && <p className="type-lead mt-5 max-w-[38rem]">{lead}</p>}
          {actions && <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap">{actions}</div>}
          {children}
        </div>
        {art && <div className="lg:col-span-6">{art}</div>}
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, intro, id, className = "" }: { eyebrow?: string; title: string; intro?: string; id: string; className?: string }) {
  return (
    <div className={`max-w-[46rem] ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="type-h2 mt-3">
        {title}
      </h2>
      {intro && <p className="type-lead mt-4">{intro}</p>}
    </div>
  );
}

/** Rounded stage that frames an illustration. */
export function ArtFrame({ children, caption, className = "" }: { children: ReactNode; caption?: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-stage)] border border-line bg-white shadow-[var(--shadow-soft)]">{children}</div>
      {caption && <figcaption className="mt-2.5 text-[0.875rem] text-muted">{caption}</figcaption>}
    </figure>
  );
}
