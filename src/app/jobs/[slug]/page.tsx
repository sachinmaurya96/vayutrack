import { ArrowRight, Briefcase, Clock, IndianRupee, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { applicationSteps } from "@/content/forms";
import { jobBySlug, jobs } from "@/content/careers";
import { links } from "@/content/site";
import { SchemaForm } from "@/components/forms/SchemaForm";
import { FormPanel } from "@/components/pages/Common";
import { AppLink } from "@/components/ui/AppLink";
import { Breadcrumbs } from "@/components/ui/PageHero";

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/jobs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = jobBySlug[slug];
  return job ? { title: `${job.title} — Careers`, description: job.summary } : {};
}

export default async function JobPage({ params }: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const job = jobBySlug[slug];
  if (!job) notFound();
  const facts = [
    { icon: MapPin, label: "Location", value: job.location },
    { icon: Briefcase, label: "Type", value: job.type },
    { icon: Clock, label: "Experience", value: job.experience },
    { icon: IndianRupee, label: "Pay", value: job.pay },
  ];
  const others = jobs.filter((j) => j.slug !== job.slug).slice(0, 3);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section aria-labelledby="page-heading" className="border-b border-line bg-bg">
        <div className="container-page py-10 sm:py-14">
          <Breadcrumbs items={[{ label: "Careers", href: links.careers }, { label: job.title }]} />
          <p className="eyebrow mt-6">Open role</p>
          <h1 id="page-heading" className="type-page-title mt-3">
            {job.title}
          </h1>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Role details">
            {facts.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[0.9375rem] font-semibold text-navy">
                  <Icon aria-hidden className="size-4 text-blue" />
                  <span className="sr-only">{f.label}: </span>
                  {f.value}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="type-h3">About this role</h2>
            <p className="mt-4 text-[1.125rem] leading-relaxed text-ink">{job.summary}</p>
            {job.details.map((d) => (
              <p key={d} className="mt-4 text-[1.0625rem] leading-relaxed text-ink">
                {d}
              </p>
            ))}
            <div id="apply" className="mt-12 scroll-mt-28">
              <FormPanel title="Apply now" intro="Name, email and phone are enough. The hiring desk replies on the details you enter.">
                <SchemaForm form="job-application" steps={applicationSteps} submitLabel="Submit application" emailSubject={`Application: ${job.title} (${job.location})`} noun="application" />
              </FormPanel>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="grid gap-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <div className="rounded-[var(--radius-card)] border border-line bg-bg p-6">
                <h2 className="text-[1.125rem] font-extrabold">Role at a glance</h2>
                <dl className="mt-4 grid gap-3">
                  {facts.map((f) => (
                    <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                      <dt className="text-[0.9375rem] text-muted">{f.label}</dt>
                      <dd className="text-right font-bold text-navy">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <AppLink href="#apply" className="btn btn-primary mt-6 w-full">
                  Apply for this role
                </AppLink>
              </div>
              <nav aria-labelledby="other-roles" className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <h2 id="other-roles" className="text-[1.125rem] font-extrabold">
                  Other open roles
                </h2>
                <ul className="mt-3 divide-y divide-line">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <AppLink href={`/jobs/${o.slug}`} className="group flex items-center justify-between gap-3 py-3">
                        <span>
                          <span className="block font-bold text-navy group-hover:text-blue">{o.title}</span>
                          <span className="block text-[0.875rem] text-muted">{o.location}</span>
                        </span>
                        <ArrowRight aria-hidden className="size-4 text-blue" />
                      </AppLink>
                    </li>
                  ))}
                </ul>
                <AppLink href={links.careers} className="link-arrow mt-2">
                  All open roles <ArrowRight aria-hidden className="size-4" />
                </AppLink>
              </nav>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
