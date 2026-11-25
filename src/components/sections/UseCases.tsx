import { ArrowUpRight } from "lucide-react";
import { useCases } from "@/content/home";
import { Vignette } from "@/components/scene/fallback/Vignette";

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Typical shipments">
      {tags.map((t) => (
        <li key={t} className="rounded-full border border-line bg-white px-3 py-1 text-[0.875rem] font-semibold text-navy">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function UseCases() {
  const [individuals, ecommerce, business] = useCases;
  return (
    <section aria-labelledby="usecases-heading" className="bg-white py-20 lg:py-28">
      <div className="container-page">
        <div className="max-w-[44rem]">
          <p className="eyebrow">Who we help</p>
          <h2 id="usecases-heading" className="type-h2 mt-3">
            Built around what you need to send.
          </h2>
        </div>

        {/* 1 — Individuals: art left, text right */}
        <article aria-labelledby={`uc-${individuals.id}`} className="mt-14 grid items-center gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="rounded-[var(--radius-stage)] bg-bg p-6 sm:p-10 lg:col-span-5">
            <Vignette art={individuals.art} className="mx-auto w-full max-w-[26rem]" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[0.9375rem] font-bold text-blue">{individuals.audience}</p>
            <h3 id={`uc-${individuals.id}`} className="type-h3 mt-2 !text-[clamp(1.625rem,1.2rem+1.2vw,2.25rem)]">
              {individuals.title}
            </h3>
            <p className="mt-4 max-w-[34rem] text-[1.0625rem] leading-relaxed text-muted">{individuals.body}</p>
            <div className="mt-5">
              <Tags tags={individuals.tags} />
            </div>
            <a href={individuals.action.href} className="btn btn-primary mt-7">
              {individuals.action.label} <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </article>

        {/* 2 — Ecommerce: text left in a tinted column, wide art right */}
        <article aria-labelledby={`uc-${ecommerce.id}`} className="mt-16 overflow-hidden rounded-[var(--radius-stage)] border border-line bg-bg lg:mt-24 lg:grid lg:grid-cols-12">
          <div className="p-7 sm:p-10 lg:col-span-5 lg:p-12">
            <p className="text-[0.9375rem] font-bold text-blue">{ecommerce.audience}</p>
            <h3 id={`uc-${ecommerce.id}`} className="type-h3 mt-2">
              {ecommerce.title}
            </h3>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">{ecommerce.body}</p>
            <div className="mt-5">
              <Tags tags={ecommerce.tags} />
            </div>
            <a href={ecommerce.action.href} className="btn btn-blue mt-7">
              {ecommerce.action.label} <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
          <div className="relative flex items-center justify-center bg-white px-6 py-8 lg:col-span-7 lg:border-l lg:border-line lg:px-10">
            <Vignette art={ecommerce.art} className="w-full max-w-[34rem]" />
          </div>
        </article>

        {/* 3 — Business teams: wide art with an overlapping text card */}
        <article aria-labelledby={`uc-${business.id}`} className="relative mt-16 lg:mt-24">
          <div className="rounded-[var(--radius-stage)] bg-gradient-to-b from-blue-50 to-bg px-6 pb-40 pt-10 sm:pb-24 lg:px-16 lg:py-10">
            <Vignette art={business.art} className="ml-auto w-full max-w-[40rem] lg:mr-2" />
          </div>
          <div className="panel relative -mt-32 mx-4 p-7 sm:mx-8 sm:-mt-16 sm:max-w-[30rem] sm:p-9 lg:absolute lg:bottom-12 lg:left-12 lg:m-0">
            <p className="text-[0.9375rem] font-bold text-blue">{business.audience}</p>
            <h3 id={`uc-${business.id}`} className="type-h3 mt-2">
              {business.title}
            </h3>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">{business.body}</p>
            <div className="mt-5">
              <Tags tags={business.tags} />
            </div>
            <a href={business.action.href} className="btn btn-blue mt-7">
              {business.action.label} <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
