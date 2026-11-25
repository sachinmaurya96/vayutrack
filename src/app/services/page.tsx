import { ArrowRight, Check, Plane, Ship, Truck } from "lucide-react";
import type { Metadata } from "next";
import { services, type ServiceMode } from "@/content/services";
import { links } from "@/content/site";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { FinalCta } from "@/components/sections/FinalCta";
import { AppLink } from "@/components/ui/AppLink";
import { ArtFrame, PageHero, SectionHeader } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Services",
  description: "Express, Air and Ocean Freight from VayuTrack — choose the movement that fits what you are sending.",
};

const icons: Record<ServiceMode, typeof Truck> = { express: Truck, air: Plane, ocean: Ship };

const comparison: { label: string; key: "bestFor" | "typical" | "handover" | "paperwork" | "updates" }[] = [
  { label: "Best suited for", key: "bestFor" },
  { label: "Typical shipments", key: "typical" },
  { label: "Handover", key: "handover" },
  { label: "Paperwork", key: "paperwork" },
  { label: "Updates", key: "updates" },
];

export default function ServicesPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero
        eyebrow="Services"
        title="Freight and courier services, planned around your shipment."
        lead="Express, Air and Ocean Freight for individuals and businesses. Choose the movement that fits what you are sending, and our team helps with the rest."
        crumbs={[{ label: "Services" }]}
        actions={
          <>
            <AppLink href={links.booking} className="btn btn-primary">
              Ship with VayuTrack <ArrowRight aria-hidden className="size-4" />
            </AppLink>
            <AppLink href="#compare" className="btn btn-secondary">
              Compare services
            </AppLink>
          </>
        }
        art={
          <ArtFrame caption="Illustration: a truck leaving the hub on a highlighted route.">
            <IsoScene className="absolute inset-0 h-full w-full" label="Illustration of a VayuTrack truck travelling from the hub to a destination" view="journey" framing="journey:2" aspect={1.25} serviceMode="express" journeyStage={2} selected={null} />
          </ArtFrame>
        }
      />

      <section aria-label="Our services" className="bg-white py-16 lg:py-24">
        <div className="container-page grid gap-20 lg:gap-28">
          {services.map((s, i) => {
            const Icon = icons[s.mode];
            return (
              <article key={s.mode} aria-labelledby={`svc-${s.mode}`} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <div className={`lg:col-span-6 ${i % 2 ? "lg:order-2" : ""}`}>
                  <ArtFrame>
                    <IsoScene className="absolute inset-0 h-full w-full" label={`Illustration for ${s.name}: ${s.sceneCaption}`} view="services" framing={`services:${s.mode}`} aspect={1.25} serviceMode={s.mode} journeyStage={0} selected={null} />
                  </ArtFrame>
                </div>
                <div className="lg:col-span-6">
                  <span aria-hidden className="flex size-12 items-center justify-center rounded-2xl bg-blue text-white">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-5 text-[0.9375rem] font-bold text-blue">{s.short}</p>
                  <h2 id={`svc-${s.mode}`} className="type-h2 mt-1">
                    {s.name}
                  </h2>
                  <p className="type-lead mt-4">{s.lead}</p>
                  <ul className="mt-6 grid gap-2.5">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-3 font-semibold text-navy">
                        <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                    <AppLink href={s.href} className="btn btn-blue">
                      Explore {s.name} <ArrowRight aria-hidden className="size-4" />
                    </AppLink>
                    <AppLink href={`${links.booking}?service=${s.mode}`} className="btn btn-secondary">
                      Book this service
                    </AppLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="compare" aria-labelledby="compare-heading" className="scroll-mt-24 bg-bg py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader id="compare-heading" eyebrow="Compare" title="Which service fits your shipment?" intro="A quick comparison to help you choose. Our team can recommend the right option for your cargo." />
          <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white" tabIndex={0} role="region" aria-labelledby="compare-heading">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">Comparison of Express, Air and Ocean Freight</caption>
              <thead>
                <tr className="border-b border-line">
                  <td className="w-44 p-5" />
                  {services.map((s) => {
                    const Icon = icons[s.mode];
                    return (
                      <th key={s.mode} scope="col" className="p-5 align-bottom">
                        <span className="flex items-center gap-2.5 text-[1.0625rem] font-extrabold text-navy">
                          <span aria-hidden className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue">
                            <Icon className="size-[1.125rem]" />
                          </span>
                          {s.name}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.key} className="border-b border-line last:border-0">
                    <th scope="row" className="p-5 align-top text-[0.875rem] font-bold uppercase tracking-[0.08em] text-muted">
                      {row.label}
                    </th>
                    {services.map((s) => (
                      <td key={s.mode} className="p-5 align-top text-[0.9375rem] text-ink">
                        {s[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FinalCta id="services-contact" tone="white" heading="Not sure which service fits?" body="Tell us what you are sending and where it is going. Our team will recommend the right movement." primary={{ label: "Book a shipment", href: links.booking }} secondary={{ label: "Business enquiry", href: links.business }} />
    </main>
  );
}
