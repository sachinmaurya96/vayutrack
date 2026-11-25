import { CircleCheck, House, PackageCheck, Truck, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import { faq } from "@/content/faq";
import { timelineStates } from "@/content/journey";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { ContactAside } from "@/components/pages/Common";
import { Faq } from "@/components/sections/Faq";
import { TrackingWidget } from "@/components/sections/TrackingWidget";
import { Breadcrumbs } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Track your shipment",
  description: "Enter your AWB or tracking number, or try the illustrative sample journey.",
};

const meanings: Record<string, { icon: typeof Truck; body: string }> = {
  booked: { icon: CircleCheck, body: "Shipment details are confirmed and a tracking number is issued." },
  "picked-up": { icon: House, body: "The shipment has been collected from the sender." },
  "at-hub": { icon: Warehouse, body: "Sorted and prepared at the hub for the next leg." },
  "in-transit": { icon: Truck, body: "On the way to the destination city." },
  delivered: { icon: PackageCheck, body: "Handed over at the destination." },
};

const trackingFaq = faq.filter((f) => ["how-to-track", "delivery-time", "cancel"].includes(f.id));

export default function TrackPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section aria-labelledby="page-heading" className="border-b border-line bg-bg">
        <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-14 lg:py-16">
          <div className="lg:col-span-7">
            <Breadcrumbs items={[{ label: "Track shipment" }]} />
            <p className="eyebrow mt-6">Track</p>
            <h1 id="page-heading" className="type-page-title mt-3">
              Track your shipment.
            </h1>
            <p className="type-lead mt-5 max-w-[36rem]">Enter the AWB or tracking number from your booking. Want to see how it works first? Try the sample journey.</p>
            <div className="mt-8 max-w-[36rem]">
              <TrackingWidget />
            </div>
          </div>
          <aside aria-labelledby="statuses-heading" className="lg:col-span-5">
            <div className="panel overflow-hidden">
              <div className="relative aspect-[16/9] border-b border-line bg-bg">
                <IsoScene className="absolute inset-0 h-full w-full" label="Illustration of a parcel being delivered at its destination" view="journey" framing="journey:3" aspect={1.78} serviceMode="express" journeyStage={3} selected={null} />
              </div>
              <div className="p-6">
                <h2 id="statuses-heading" className="text-[1.25rem] font-extrabold">
                  What each status means
                </h2>
                <ol className="mt-5 grid gap-4">
                  {timelineStates.map((s) => {
                    const m = meanings[s.key];
                    const Icon = m.icon;
                    return (
                      <li key={s.key} className="flex gap-3.5">
                        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue">
                          <Icon className="size-[1.125rem]" />
                        </span>
                        <div>
                          <p className="font-extrabold text-navy">{s.label}</p>
                          <p className="text-[0.9375rem] text-muted">{m.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-5 text-[0.875rem] text-muted">Statuses shown here explain the illustrative journey.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Faq items={trackingFaq} id="tracking-faq" eyebrow="Tracking help" heading="Questions about your shipment?" tone="white" />

      <section aria-label="Contact the desk" className="bg-white pb-20 lg:pb-28">
        <div className="container-page max-w-[48rem]">
          <ContactAside title="Need help with a shipment?" body="Share your AWB or tracking number with the desk and we will look into it." />
        </div>
      </section>
    </main>
  );
}
