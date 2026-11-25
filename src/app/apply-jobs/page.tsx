import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { links } from "@/content/site";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { JobsBrowser } from "@/components/pages/JobsBrowser";
import { AppLink } from "@/components/ui/AppLink";
import { ArtFrame, PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at VayuTrack, with city, job type, experience and pay on every role.",
};

export default function CareersPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero
        eyebrow="Careers"
        title="Open roles."
        lead="City, job type and pay are listed on every role. Open a role to read about the work and send your application to the hiring desk."
        crumbs={[{ label: "Careers" }]}
        actions={
          <AppLink href={links.culture} className="btn btn-secondary">
            Life at VayuTrack <ArrowRight aria-hidden className="size-4" />
          </AppLink>
        }
        art={
          <ArtFrame caption="Illustration: the hub team loading the day’s shipments.">
            <IsoScene className="absolute inset-0 h-full w-full" label="Illustration of the hub loading bays with a forklift and trucks" view="journey" framing="journey:1" aspect={1.25} serviceMode="express" journeyStage={1} selected={null} />
          </ArtFrame>
        }
      />
      <section aria-label="Open roles" className="bg-bg py-12 lg:py-16">
        <div className="container-page">
          <JobsBrowser />
        </div>
      </section>
    </main>
  );
}
