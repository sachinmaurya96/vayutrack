import { ArrowRight } from "lucide-react";
import { articles } from "@/content/blog";
import { links } from "@/content/site";
import { AppLink } from "@/components/ui/AppLink";

export function Insights() {
  return (
    <section id="insights" aria-labelledby="insights-heading" className="bg-white py-20 lg:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <p className="eyebrow">Insights</p>
            <h2 id="insights-heading" className="type-h2 mt-3">
              Insights from the VayuTrack blog.
            </h2>
          </div>
          <AppLink href={links.blog} className="link-arrow">
            All articles <ArrowRight aria-hidden className="size-4" />
          </AppLink>
        </div>
        <ul className="mt-10 grid gap-x-10 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.slug} className="border-t-2 border-navy">
              <AppLink href={`${links.blog}/${a.slug}`} className="group flex h-full flex-col gap-3 py-6 lg:py-7">
                <time dateTime={a.date} className="text-[0.875rem] font-semibold text-muted">
                  {a.dateLabel}
                </time>
                <h3 className="text-[1.25rem] font-extrabold leading-snug tracking-[-0.015em] group-hover:text-blue group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                  {a.title}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-muted">{a.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-1 font-bold text-blue">
                  Read article <ArrowRight aria-hidden className="size-4" />
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
