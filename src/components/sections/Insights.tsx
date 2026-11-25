import { articles } from "@/content/home";

export function Insights() {
  return (
    <section id="insights" aria-labelledby="insights-heading" className="bg-white py-20 lg:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Insights</p>
            <h2 id="insights-heading" className="type-h2 mt-3">
              Insights from the VayuTrack blog.
            </h2>
          </div>
        </div>
        <ul className="mt-10 grid gap-x-10 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.title} className="border-t-2 border-navy">
              <article className="flex h-full flex-col gap-3 py-6 lg:py-7">
                <time dateTime={a.date} className="text-[0.875rem] font-semibold text-muted">
                  {a.dateLabel}
                </time>
                <h3 className="text-[1.25rem] font-extrabold leading-snug tracking-[-0.015em]">{a.title}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-muted">{a.excerpt}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
