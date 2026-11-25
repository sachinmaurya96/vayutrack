import type { Metadata } from "next";
import { partnerSteps } from "@/content/forms";
import { SchemaForm } from "@/components/forms/SchemaForm";
import { ContactAside, FormPanel, PageBody, StepsList } from "@/components/pages/Common";
import { NetworkMotif } from "@/components/sections/Partnerships";
import { Breadcrumbs } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Become a partner",
  description: "Interested in joining the VayuTrack network? Share your details and our team will be in touch.",
};

export default function PartnerPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section aria-labelledby="page-heading" className="on-dark bg-navy text-white">
        <div className="container-page grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <div className="[&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white/90 [&_svg]:text-white/50 [&_ol]:text-white/80">
              <Breadcrumbs items={[{ label: "Become a partner" }]} />
            </div>
            <p className="mt-6 text-[0.875rem] font-bold uppercase tracking-[0.12em] text-[#9cc0ff]">Grow with us</p>
            <h1 id="page-heading" className="type-page-title mt-3 !text-white">
              Grow with the VayuTrack network.
            </h1>
            <p className="mt-5 max-w-[36rem] text-[1.125rem] leading-relaxed text-white/80">
              Interested in becoming a VayuTrack network partner? Share a few details about yourself and your location, and our team will get in touch to talk through the opportunity.
            </p>
          </div>
          <div className="hidden h-72 lg:col-span-5 lg:block">
            <NetworkMotif />
          </div>
        </div>
      </section>
      <PageBody
        tone="light"
        main={
          <FormPanel title="Tell us about yourself" intro="We only use these details to contact you about partnering with VayuTrack.">
            <SchemaForm form="partner" steps={partnerSteps} submitLabel="Send partner enquiry" emailSubject="Network partner enquiry" noun="partner enquiry" initialValues={{ country: "India" }} />
          </FormPanel>
        }
        side={
          <>
            <aside aria-labelledby="partner-how" className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <h2 id="partner-how" className="text-[1.125rem] font-extrabold">
                How partnering starts
              </h2>
              <StepsList
                className="mt-5"
                steps={[
                  { title: "Share your details", body: "Who you are and the area you would like to cover." },
                  { title: "Talk to our team", body: "We discuss the opportunity and answer your questions." },
                  { title: "Decide together", body: "Partnership details are agreed directly with you." },
                ]}
              />
            </aside>
            <ContactAside title="Questions first?" body="Call or write to the desk to talk about partnering." />
          </>
        }
      />
    </main>
  );
}
