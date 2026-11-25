import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { about } from "@/content/company";
import { links } from "@/content/site";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { FinalCta } from "@/components/sections/FinalCta";
import { NetworkIllustration } from "@/components/sections/CompanyStory";
import { AppLink } from "@/components/ui/AppLink";
import { ArtFrame, PageHero, SectionHeader } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "About us",
  description: "VayuTrack is a courier and delivery company helping individuals and businesses send parcels, documents and cargo with care.",
};

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero
        eyebrow={about.eyebrow}
        title={about.title}
        lead={about.lead}
        crumbs={[{ label: "About us" }]}
        actions={
          <>
            <AppLink href={links.booking} className="btn btn-primary">
              Ship with VayuTrack <ArrowRight aria-hidden className="size-4" />
            </AppLink>
            <AppLink href={links.contact} className="btn btn-secondary">
              Talk to the desk
            </AppLink>
          </>
        }
        art={
          <ArtFrame caption="Illustration: a VayuTrack hub preparing shipments for dispatch.">
            <IsoScene className="absolute inset-0 h-full w-full" label="Illustration of a blue-roofed VayuTrack hub with loading bays and trucks" view="hero" framing="hero:hub" aspect={1.25} serviceMode="express" journeyStage={0} selected={null} />
          </ArtFrame>
        }
      />

      <section aria-labelledby="who-heading" className="bg-white py-20 lg:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader id="who-heading" eyebrow={about.who.eyebrow} title={about.who.heading} />
          </div>
          <div className="lg:col-span-7">
            {about.who.paragraphs.map((p) => (
              <p key={p} className="mb-5 text-[1.125rem] leading-relaxed text-ink">
                {p}
              </p>
            ))}
            <p className="mt-8 border-l-4 border-red pl-5 text-[clamp(1.375rem,1.1rem+0.9vw,1.875rem)] font-extrabold leading-snug tracking-[-0.02em] text-navy">
              {about.who.tagline}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="focus-heading" className="bg-bg py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader id="focus-heading" eyebrow="What we focus on" title="Four things every shipment can count on." />
          <ol className="mt-12 grid gap-x-12 sm:grid-cols-2">
            {about.focus.map((f, i) => (
              <li key={f.title} className="flex gap-5 border-t border-line-strong py-7">
                <span aria-hidden className="font-mono text-[1.75rem] font-bold leading-none text-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[1.25rem] font-extrabold">{f.title}</h3>
                  <p className="mt-1.5 text-muted">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="leadership-heading" className="bg-white py-20 lg:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader id="leadership-heading" eyebrow={about.leadership.eyebrow} title={about.leadership.heading} intro={about.leadership.body} />
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {about.leadership.people.map((p) => (
              <li key={p.name} className="panel flex flex-col items-start gap-5 p-7">
                <span aria-hidden className="flex size-20 items-center justify-center rounded-full bg-navy text-[1.5rem] font-extrabold tracking-wide text-white shadow-[0_0_0_8px_var(--color-blue-50)]">
                  {p.initials}
                </span>
                <div>
                  <h3 className="text-[1.375rem] font-extrabold">{p.name}</h3>
                  <p className="font-semibold text-blue">{p.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="bg-bg py-20 lg:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <NetworkIllustration />
          </div>
          <div className="lg:col-span-6">
            <SectionHeader id="how-heading" eyebrow="How we work" title="People, process and visibility." intro="Pickup, hub handling, the journey and the final handoff are planned as one connected route, with a team you can reach at every step." />
            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <AppLink href={links.services} className="btn btn-blue">
                Explore our services <ArrowRight aria-hidden className="size-4" />
              </AppLink>
              <AppLink href={links.howItWorks} className="btn btn-secondary">
                See how it works
              </AppLink>
            </div>
          </div>
        </div>
      </section>

      <FinalCta id="about-contact" tone="white" />
    </main>
  );
}
