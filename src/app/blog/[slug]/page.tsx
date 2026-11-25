import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleBySlug, articles } from "@/content/blog";
import { links } from "@/content/site";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { FinalCta } from "@/components/sections/FinalCta";
import { AppLink } from "@/components/ui/AppLink";
import { Breadcrumbs } from "@/components/ui/PageHero";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug[slug];
  return a ? { title: a.title, description: a.excerpt } : {};
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = articleBySlug[slug];
  if (!article) notFound();
  const more = articles.filter((a) => a.slug !== article.slug);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <article aria-labelledby="page-heading">
        <header className="border-b border-line bg-bg">
          <div className="container-page max-w-[52rem] py-10 sm:py-14">
            <Breadcrumbs items={[{ label: "Blog", href: links.blog }, { label: article.title }]} />
            <p className="mt-6 text-[0.9375rem] font-semibold text-muted">
              <span className="font-bold text-blue">{article.topic}</span> · <time dateTime={article.date}>{article.dateLabel}</time>
            </p>
            <h1 id="page-heading" className="type-page-title mt-3">
              {article.title}
            </h1>
            <p className="type-lead mt-5">{article.excerpt}</p>
          </div>
        </header>
        <div className="bg-white">
          <div className="container-page max-w-[52rem] py-10 lg:py-14">
            <figure>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-stage)] border border-line bg-bg">
                <IsoScene className="absolute inset-0 h-full w-full" label={`Illustration for ${article.title}`} view={article.art.view} framing={article.art.framing} aspect={1.78} serviceMode="express" journeyStage={article.art.stage ?? 0} selected={null} />
              </div>
              <figcaption className="mt-2.5 text-[0.875rem] text-muted">Illustration from the VayuTrack logistics world.</figcaption>
            </figure>
            <div className="mt-10">
              {article.body.map((p, i) => (
                <p key={p} className={`mb-6 leading-relaxed text-ink ${i === 0 ? "text-[1.3125rem] font-semibold text-navy" : "text-[1.125rem]"}`}>
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 xs:flex-row xs:flex-wrap">
              <AppLink href={links.blog} className="btn btn-secondary">
                All articles
              </AppLink>
              <AppLink href={links.track} className="btn btn-blue">
                Track a shipment <ArrowRight aria-hidden className="size-4" />
              </AppLink>
            </div>
          </div>
        </div>
      </article>

      <section aria-labelledby="more-heading" className="bg-bg py-16 lg:py-20">
        <div className="container-page">
          <h2 id="more-heading" className="type-h3">
            More from the blog
          </h2>
          <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
            {more.map((a) => (
              <li key={a.slug} className="border-t-2 border-navy">
                <AppLink href={`${links.blog}/${a.slug}`} className="group block py-6">
                  <time dateTime={a.date} className="text-[0.875rem] font-semibold text-muted">
                    {a.dateLabel}
                  </time>
                  <h3 className="mt-2 text-[1.25rem] font-extrabold leading-snug group-hover:text-blue">{a.title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-muted">{a.excerpt}</p>
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta id="article-contact" tone="white" />
    </main>
  );
}
