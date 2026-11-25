import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { links } from "@/content/site";
import { BookingForm } from "@/components/pages/BookingForm";
import { ContactAside, FormPanel, PageBody, StepsList } from "@/components/pages/Common";
import { AppLink } from "@/components/ui/AppLink";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Ship with VayuTrack",
  description: "Book a shipment with VayuTrack in four short steps: shipment, sender, receiver and package.",
};

export default function BookingPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero
        eyebrow="Ship with VayuTrack"
        title="Book your shipment."
        lead="Tell us about the shipment in four short steps. Our team confirms the service and the pickup with you."
        crumbs={[{ label: "Ship with VayuTrack" }]}
      />
      <PageBody
        tone="light"
        main={
          <FormPanel>
            <BookingForm />
          </FormPanel>
        }
        side={
          <>
            <aside aria-labelledby="booking-how" className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <h2 id="booking-how" className="text-[1.125rem] font-extrabold">
                How booking works
              </h2>
              <StepsList
                className="mt-5"
                steps={[
                  { title: "Share the details", body: "Shipment, sender, receiver and package." },
                  { title: "We confirm", body: "Our team confirms the service, pickup slot and charges with you." },
                  { title: "Pickup and tracking", body: "The shipment is collected and you receive a tracking number." },
                ]}
              />
            </aside>
            <ContactAside body="Booking a regular or larger shipment? Call the desk, or send a business enquiry." />
            <AppLink href={links.business} className="link-arrow">
              Make a business enquiry <ArrowRight aria-hidden className="size-4" />
            </AppLink>
          </>
        }
      />
    </main>
  );
}
