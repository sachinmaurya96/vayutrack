import { CapabilityStrip } from "@/components/sections/CapabilityStrip";
import { CompanyStory } from "@/components/sections/CompanyStory";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Insights } from "@/components/sections/Insights";
import { Journey } from "@/components/sections/Journey";
import { Partnerships } from "@/components/sections/Partnerships";
import { ServiceExplorer } from "@/components/sections/ServiceExplorer";
import { UseCases } from "@/components/sections/UseCases";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <CapabilityStrip />
        <ServiceExplorer />
        <Journey />
        <CompanyStory />
        <UseCases />
        <Partnerships />
        <Faq />
        <Insights />
        <FinalCta />
    </main>
  );
}
