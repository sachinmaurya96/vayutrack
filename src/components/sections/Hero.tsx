import { ArrowDown, ArrowRight } from "lucide-react";
import { hero } from "@/content/home";
import { HeroScene } from "./HeroScene";
import { TrackingWidget } from "./TrackingWidget";
import { AppLink } from "@/components/ui/AppLink";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden bg-bg">
      <div className="relative flex flex-col xl:min-h-[clamp(700px,calc(100svh-112px),880px)]">
        <div className="container-page relative z-10 xl:pointer-events-none">
          <div className="max-w-[44rem] pb-8 pt-10 sm:pt-14 xl:pointer-events-auto xl:max-w-[35rem] xl:pb-12 xl:pt-14">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 id="hero-heading" className="type-display mt-4 xl:w-[42rem]">
              {hero.headingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="type-lead mt-5 max-w-[33rem]">{hero.body}</p>
            <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <AppLink href={hero.primary.href} className="btn btn-primary">
                {hero.primary.label} <ArrowRight aria-hidden className="size-4" />
              </AppLink>
              <AppLink href={hero.secondary.href} className="btn btn-secondary">
                {hero.secondary.label} <ArrowDown aria-hidden className="size-4" />
              </AppLink>
            </div>
            <div className="mt-8 max-w-[35rem]">
              <TrackingWidget />
            </div>
          </div>
        </div>
        <div className="relative pb-10 xl:absolute xl:inset-y-0 xl:left-[36%] xl:right-0 xl:pb-0">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
