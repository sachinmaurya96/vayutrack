import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { articles } from "@/content/blog";
import { links } from "@/content/site";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { AppLink } from "@/components/ui/AppLink";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest updates from VayuTrack on business shipping, tracking and the courier network.",
};

export default function BlogPage() {
  const [featured, ...rest] = articles;
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero eyebrow="Blog" title="Latest updates from VayuTrack." lead="Notes on business shipping, shipment tracking and how the courier network fits together." crumbs={[{ label: "Blog" }]} />

      <section aria-label="Articles" className="bg-white py-14 lg:py-20">
        <div className="container-page">
          <article aria-labelledby={`post-${featured.slug}`} className="group relative grid overflow-hidden rounded-[var(--radius-stage)] border border-line bg-white lg:grid-cols-12">
            <div className="relative aspect-[16/10] bg-bg lg:col-span-7 lg:aspect-auto lg:min-h-[24rem]">
              <IsoScene className="absolute inset-0 h-full w-full" label={`Illustration for ${featured.title}`} view={featured.art.view} framing={featured.art.framing} aspect={1.5} serviceMode="express" journeyStage={featured.art.stage ?? 0} selected={null} />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-5">
              <p className="text-[0.875rem] font-semibold text-muted">
                <span className="font-bold text-blue">{featured.topic}</span> · <time dateTime={featured.date}>{featured.dateLabel}</time>
              </p>
              <h2 id={`post-${featured.slug}`} className="type-h3 mt-3">
                <AppLink href={`${links.blog}/${featured.slug}`} className="after:absolute after:inset-0 group-hover:text-blue">
                  {featured.title}
                </AppLink>
              </h2>
              <p className="mt-3 text-muted">{featured.excerpt}</p>
              <span aria-hidden className="mt-6 inline-flex items-center gap-1.5 font-bold text-blue">
                Read article <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </article>

          <ul className="mt-10 grid gap-x-10 md:grid-cols-2">
            {rest.map((a) => (
              <li key={a.slug} className="border-t-2 border-navy">
                <article aria-labelledby={`post-${a.slug}`} className="group relative grid gap-5 py-7 sm:grid-cols-[11rem_1fr]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-bg">
                    <IsoScene className="absolute inset-0 h-full w-full" label={`Illustration for ${a.title}`} view={a.art.view} framing={a.art.framing} aspect={1.33} serviceMode="express" journeyStage={a.art.stage ?? 0} selected={null} />
                  </div>
                  <div>
                    <p className="text-[0.875rem] font-semibold text-muted">
                      <span className="font-bold text-blue">{a.topic}</span> · <time dateTime={a.date}>{a.dateLabel}</time>
                    </p>
                    <h2 id={`post-${a.slug}`} className="mt-2 text-[1.25rem] font-extrabold leading-snug">
                      <AppLink href={`${links.blog}/${a.slug}`} className="after:absolute after:inset-0 group-hover:text-blue">
                        {a.title}
                      </AppLink>
                    </h2>
                    <p className="mt-2 text-[0.9375rem] text-muted">{a.excerpt}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
