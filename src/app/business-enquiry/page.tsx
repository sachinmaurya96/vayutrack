import { Building2, PackageCheck, Store } from "lucide-react";
import type { Metadata } from "next";
import { businessEnquirySteps } from "@/content/forms";
import { SchemaForm } from "@/components/forms/SchemaForm";
import { ContactAside, FormPanel, PageBody, StepsList } from "@/components/pages/Common";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Business enquiry",
  description: "Tell VayuTrack about your business shipping needs — corporate, domestic express or ecommerce.",
};

const audiences = [
  { icon: Building2, title: "Corporate customers", body: "Regular documents and business shipments between offices." },
  { icon: PackageCheck, title: "Domestic express", body: "Parcels and consignments moving within India." },
  { icon: Store, title: "Ecommerce sellers", body: "Orders shipped to your customers with a tracking number." },
];

export default function BusinessEnquiryPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero
        eyebrow="Business enquiry"
        title="Shipping for your business."
        lead="Tell us about your organisation and what you ship. Our team will get in touch to plan the right mix of courier and freight services."
        crumbs={[{ label: "Business enquiry" }]}
      />
      <PageBody
        tone="light"
        main={
          <FormPanel title="Your business details" intro="It takes about two minutes. Required fields are marked.">
            <SchemaForm form="business-enquiry" steps={businessEnquirySteps} submitLabel="Send enquiry" emailSubject="Business enquiry" noun="business enquiry" initialValues={{ country: "India" }} />
          </FormPanel>
        }
        side={
          <>
            <aside aria-labelledby="who-we-work-with" className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <h2 id="who-we-work-with" className="text-[1.125rem] font-extrabold">
                Who we work with
              </h2>
              <ul className="mt-4 grid gap-4">
                {audiences.map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.title} className="flex gap-3.5">
                      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue">
                        <Icon className="size-[1.125rem]" />
                      </span>
                      <div>
                        <p className="font-extrabold text-navy">{a.title}</p>
                        <p className="text-[0.9375rem] text-muted">{a.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>
            <aside aria-labelledby="next-steps" className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <h2 id="next-steps" className="text-[1.125rem] font-extrabold">
                What happens next
              </h2>
              <StepsList
                className="mt-5"
                steps={[
                  { title: "We review your enquiry", body: "Lanes, volumes and any special handling." },
                  { title: "We get in touch", body: "To understand your requirements in detail." },
                  { title: "We plan together", body: "The right services for your shipments." },
                ]}
              />
            </aside>
            <ContactAside />
          </>
        }
      />
    </main>
  );
}
