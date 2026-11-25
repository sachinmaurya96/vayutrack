import type { Metadata } from "next";
import { IsoScene } from "@/components/scene/fallback/IsoScene";
import { LocateSearch } from "@/components/pages/LocateSearch";
import { ArtFrame, PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Locate us",
  description: "Find a VayuTrack point of service near you, or contact the head office in Noida.",
};

export default function LocatePage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero
        eyebrow="Locate us"
        title="Find VayuTrack near you."
        lead="Search by pincode, city or state. Our team can confirm how pickup and delivery work in your area."
        crumbs={[{ label: "Locate us" }]}
        art={
          <ArtFrame caption="Illustration only — not a map of locations.">
            <IsoScene className="absolute inset-0 h-full w-full" label="Illustration of a pickup point with a location pin" view="journey" framing="journey:0" aspect={1.25} serviceMode="express" journeyStage={0} selected={null} />
          </ArtFrame>
        }
      >
        <LocateSearch />
      </PageHero>
    </main>
  );
}
