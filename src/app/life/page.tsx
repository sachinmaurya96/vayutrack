import { ArrowRight, Award, BookOpen, CalendarDays, Check, HeartPulse, MessageSquare, Users } from "lucide-react";
import type { Metadata } from "next";
import { life } from "@/content/company";
import { links } from "@/content/site";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { AppLink } from "@/components/ui/AppLink";
import { ArtFrame, PageHero, SectionHeader } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Life at VayuTrack",
  description: "Culture, values and how we look after the people who move every VayuTrack shipment.",
};

const programmeIcons = [HeartPulse, Award, Users, MessageSquare, BookOpen, CalendarDays];

export default function LifePage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero
        eyebrow={life.eyebrow}
        title={life.title}
        lead={life.lead}
        crumbs={[{ label: "Careers", href: links.careers }, { label: "Life at VayuTrack" }]}
        actions={
          <AppLink href={links.careers} className="btn btn-primary">
            See open roles <ArrowRight aria-hidden className="size-4" />
          </AppLink>
        }
        art={
          <ArtFrame caption="Illustration: pickup, hub and road teams working on one route.">
            <IsoScene className="absolute inset-0 h-full w-full" label="Illustration of the hub with trucks, a forklift and parcels" view="hero" framing="hero:overview" aspect={1.25} serviceMode="express" journeyStage={0} selected={null} />
          </ArtFrame>
        }
      />

      <section aria-labelledby="culture-heading" className="bg-white py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeader id="culture-heading" eyebrow={life.culture.eyebrow} title={life.culture.heading} />
            {life.culture.paragraphs.map((p) => (
              <p key={p} className="mt-5 text-[1.0625rem] leading-relaxed text-ink">
                {p}
              </p>
            ))}
          </div>
          <div className="lg:col-span-6">
            <div className="panel p-7">
              <h3 className="text-[1.25rem] font-extrabold">What makes the work different</h3>
              <ul className="mt-5 grid gap-4">
                {life.culture.different.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-ink">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="bg-bg py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader id="values-heading" eyebrow="Core values" title="How a hard day is handled." intro="The checks we use when a shipment, a customer or a teammate is in the middle of a hard day." />
          <dl className="mt-12 grid gap-x-12 md:grid-cols-2">
            {life.values.map((v, i) => (
              <div key={v.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-line-strong py-6">
                <span aria-hidden className="font-mono text-[1.25rem] font-bold text-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <dt className="text-[1.25rem] font-extrabold text-navy">{v.title}</dt>
                  <dd className="mt-1 text-muted">{v.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="team-heading" className="bg-white py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader id="team-heading" eyebrow="The team" title="How we look after the team." intro="These programmes are part of the job, not a poster in the corridor." />
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {life.programmes.map((p, i) => {
              const Icon = programmeIcons[i];
              return (
                <li key={p.title}>
                  <span aria-hidden className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue">
                    <Icon className="size-[1.375rem]" />
                  </span>
                  <h3 className="mt-4 text-[1.1875rem] font-extrabold">{p.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] text-muted">{p.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="growth-heading" className="bg-bg py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeader id="growth-heading" eyebrow={life.growth.eyebrow} title={life.growth.heading} intro={life.growth.body} />
          </div>
          <ol className="grid content-start gap-3 lg:col-span-6">
            {life.growth.points.map((p, i) => (
              <li key={p} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
                <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy font-mono text-[0.875rem] font-bold text-white">
                  {i + 1}
                </span>
                <span className="font-semibold text-navy">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="join-heading" className="bg-white py-20 lg:py-24">
        <div className="container-page">
          <div className="on-dark grid gap-6 rounded-[var(--radius-stage)] bg-navy p-8 text-white sm:p-12 lg:grid-cols-12 lg:items-center lg:p-14">
            <div className="lg:col-span-8">
              <h2 id="join-heading" className="type-h2 !text-white">
                Ready to join the route?
              </h2>
              <p className="mt-4 max-w-[36rem] text-[1.0625rem] text-white/80">Open roles are listed with city, job type and pay. Apply from the role page and the hiring desk reads it.</p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <AppLink href={links.careers} className="btn btn-primary">
                See open roles <ArrowRight aria-hidden className="size-4" />
              </AppLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
