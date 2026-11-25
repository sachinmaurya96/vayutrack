import { ArrowRight } from "lucide-react";
import { links } from "@/content/site";
import { Vignette } from "@/components/scene/fallback/Vignette";
import { AppLink } from "@/components/ui/AppLink";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="bg-bg outline-none">
      <section aria-labelledby="page-heading" className="container-page grid items-center gap-10 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <p className="eyebrow">Error 404</p>
          <h1 id="page-heading" className="type-page-title mt-3">
            This page took a wrong turn.
          </h1>
          <p className="type-lead mt-5 max-w-[32rem]">The page you are looking for doesn’t exist or has moved. These routes will get you back on track.</p>
          <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <AppLink href="/" className="btn btn-primary">
              Go to the homepage <ArrowRight aria-hidden className="size-4" />
            </AppLink>
            <AppLink href={links.track} className="btn btn-secondary">
              Track a shipment
            </AppLink>
            <AppLink href={links.contact} className="btn btn-secondary">
              Contact us
            </AppLink>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="rounded-[var(--radius-stage)] bg-white p-8 shadow-[var(--shadow-soft)]">
            <Vignette art="individual" className="mx-auto w-full max-w-[26rem]" />
          </div>
        </div>
      </section>
    </main>
  );
}
