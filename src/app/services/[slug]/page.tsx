import { ArrowRight, Check, Mail, Phone, Plane, Ship, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceBySlug, services, type ServiceMode } from "@/content/services";
import { contact, links } from "@/content/site";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { ServiceScene } from "@/components/pages/ServiceScene";
import { AppLink } from "@/components/ui/AppLink";
import { Breadcrumbs, SectionHeader } from "@/components/ui/PageHero";

const icons: Record<ServiceMode, typeof Truck> = { express: Truck, air: Plane, ocean: Ship };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug[slug];
  return service ? { title: service.name, description: service.lead } : {};
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = serviceBySlug[slug];
  if (!service) notFound();
  const Icon = icons[service.mode];
  const bookHref = `${links.booking}?service=${service.mode}`;
  const others = services.filter((s) => s.mode !== service.mode);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section aria-labelledby="page-heading" className="border-b border-line bg-bg">
        <div className="container-page grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-16">
          <div className="lg:col-span-5">
            <Breadcrumbs items={[{ label: "Services", href: links.services }, { label: service.name }]} />
            <div className="mt-6 flex items-center gap-3">
              <span aria-hidden className="flex size-11 items-center justify-center rounded-xl bg-blue text-white">
                <Icon className="size-[1.375rem]" />
              </span>
              <p className="eyebrow">{service.short}</p>
            </div>
            <h1 id="page-heading" className="type-page-title mt-4">
              {service.name}
            </h1>
            <p className="type-lead mt-5">{service.lead}</p>
            <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <AppLink href={bookHref} className="btn btn-primary">
                Book this service <ArrowRight aria-hidden className="size-4" />
              </AppLink>
              <AppLink href={links.business} className="btn btn-secondary">
                Business enquiry
              </AppLink>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              <div className="bg-white p-4">
                <dt className="text-[0.875rem] font-bold uppercase tracking-[0.08em] text-muted">Handover</dt>
                <dd className="mt-1 font-bold text-navy">{service.handover}</dd>
              </div>
              <div className="bg-white p-4">
                <dt className="text-[0.875rem] font-bold uppercase tracking-[0.08em] text-muted">Updates</dt>
                <dd className="mt-1 font-bold text-navy">{service.updates}</dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-7">
            <ServiceScene mode={service.mode} name={service.name} caption={service.sceneCaption} />
          </div>
        </div>
      </section>

      <section aria-labelledby="overview-heading" className="bg-white py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeader id="overview-heading" eyebrow="Overview" title={service.description} />
            {service.overview.map((p) => (
              <p key={p} className="mt-5 text-[1.0625rem] leading-relaxed text-ink">
                {p}
              </p>
            ))}
            <h3 className="mt-10 text-[0.875rem] font-bold uppercase tracking-[0.1em] text-muted">Suited for</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {service.suitedFor.map((t) => (
                <li key={t} className="rounded-full border border-line bg-bg px-4 py-2 text-[0.9375rem] font-semibold text-navy">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <aside aria-labelledby="included-heading" className="lg:col-span-5">
            <div className="panel p-7">
              <h3 id="included-heading" className="text-[1.25rem] font-extrabold">
                What’s included
              </h3>
              <ul className="mt-5 grid gap-5">
                {service.highlights.map((h) => (
                  <li key={h.title} className="flex gap-4">
                    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                    <div>
                      <p className="font-extrabold text-navy">{h.title}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-muted">{h.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="bg-bg py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader id="steps-heading" eyebrow="How it works" title={`${service.name}, from booking to delivery.`} />
          <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute left-0 right-0 top-5 hidden h-0.5 bg-line-strong md:block" />
            {service.steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span aria-hidden className="relative z-10 flex size-10 items-center justify-center rounded-full border-4 border-bg bg-blue font-mono text-[0.875rem] font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-[1.125rem] font-extrabold">{s.title}</h3>
                <p className="mt-1 text-[0.9375rem] text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="book-heading" className="bg-white py-20 lg:py-24">
        <div className="container-page">
          <div className="on-dark grid gap-8 rounded-[var(--radius-stage)] bg-navy p-8 text-white sm:p-12 lg:grid-cols-12 lg:items-center lg:p-14">
            <div className="lg:col-span-7">
              <h2 id="book-heading" className="type-h2 !text-white">
                Book this service
              </h2>
              <p className="mt-4 max-w-[34rem] text-[1.0625rem] text-white/80">Book online, call the desk during working hours, or write to us and we will plan the pickup.</p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-5">
              <AppLink href={bookHref} className="btn btn-primary">
                Book {service.name} online <ArrowRight aria-hidden className="size-4" />
              </AppLink>
              <a href={contact.phoneHref} className="btn btn-ghost-dark">
                <Phone aria-hidden className="size-4" /> {contact.phone}
              </a>
              <a href={contact.emailHref} className="btn btn-ghost-dark">
                <Mail aria-hidden className="size-4" /> {contact.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="other-heading" className="bg-white pb-20 lg:pb-28">
        <div className="container-page">
          <h2 id="other-heading" className="type-h3">
            Other services
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {others.map((s) => (
              <li key={s.mode}>
                <AppLink href={s.href} className="group grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-shadow hover:shadow-[var(--shadow-panel)] sm:grid-cols-[14rem_1fr]">
                  <div className="relative aspect-[16/10] bg-bg sm:aspect-auto">
                    <IsoScene className="absolute inset-0 h-full w-full" label={`Illustration for ${s.name}`} view="services" framing={`services:${s.mode}`} aspect={1.4} serviceMode={s.mode} journeyStage={0} selected={null} />
                  </div>
                  <div className="p-6">
                    <p className="text-[0.875rem] font-bold text-blue">{s.short}</p>
                    <h3 className="mt-1 text-[1.375rem] font-extrabold group-hover:text-blue">{s.name}</h3>
                    <p className="mt-2 text-[0.9375rem] text-muted">{s.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-bold text-blue">
                      Explore <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
