"use client";

import { ArrowRight, Briefcase, Clock, MapPin, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { jobLocations, jobs, type JobType } from "@/content/careers";
import { links } from "@/content/site";

/** Filterable list of open roles. */
export function JobsBrowser() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"" | JobType>("");

  const results = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (!k || `${j.title} ${j.summary}`.toLowerCase().includes(k)) &&
        (!location || j.location === location) &&
        (!type || j.type === type),
    );
  }, [keyword, location, type]);

  const filtered = keyword || location || type;
  const control = "h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-ink placeholder:text-muted";

  return (
    <div>
      <form role="search" aria-label="Filter open roles" onSubmit={(e) => e.preventDefault()} className="panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="job-keyword" className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
            Keyword
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input id="job-keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Job title or keyword" className={`${control} pl-10`} />
          </div>
        </div>
        <div>
          <label htmlFor="job-location" className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
            Location
          </label>
          <select id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} className={`${control} select-chevron appearance-none pr-10`}>
            <option value="">All locations</option>
            {jobLocations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="job-type" className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
            Job type
          </label>
          <select id="job-type" value={type} onChange={(e) => setType(e.target.value as "" | JobType)} className={`${control} select-chevron appearance-none pr-10`}>
            <option value="">All types</option>
            <option>Full Time</option>
            <option>Part Time</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            setLocation("");
            setType("");
          }}
          disabled={!filtered}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X aria-hidden className="size-4" /> Clear
        </button>
      </form>

      <p role="status" className="mt-6 text-[0.9375rem] font-semibold text-muted">
        {results.length === 1 ? "1 open role" : `${results.length} open roles`}
        {filtered ? (results.length === 1 ? " matches your filters" : " match your filters") : ""}
      </p>

      {results.length ? (
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
          {results.map((j) => (
            <li key={j.slug}>
              <Link href={`/jobs/${j.slug}`} className="group grid gap-3 p-5 hover:bg-blue-50/60 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
                <div>
                  <h2 className="text-[1.25rem] font-extrabold group-hover:text-blue">{j.title}</h2>
                  <p className="mt-1 max-w-[40rem] text-[0.9375rem] text-muted">{j.summary}</p>
                  <ul className="mt-3 flex flex-wrap gap-2 text-[0.875rem] font-semibold text-navy" aria-label="Role details">
                    <li className="inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1">
                      <MapPin aria-hidden className="size-3.5 text-blue" /> {j.location}
                    </li>
                    <li className="inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1">
                      <Briefcase aria-hidden className="size-3.5 text-blue" /> {j.type}
                    </li>
                    <li className="inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1">
                      <Clock aria-hidden className="size-3.5 text-blue" /> {j.experience}
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-between gap-6 lg:flex-col lg:items-end">
                  <p className="font-extrabold text-navy">{j.pay}</p>
                  <span className="inline-flex items-center gap-1.5 font-bold text-blue">
                    View role <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-[var(--radius-card)] border border-line bg-white p-8 text-center">
          <p className="font-bold text-navy">No roles match these filters</p>
          <p className="mt-1 text-[0.9375rem] text-muted">
            Try another location or clear the filters. You can also{" "}
            <Link href={links.contact} className="font-bold text-blue underline underline-offset-2">
              write to us
            </Link>{" "}
            about future openings.
          </p>
        </div>
      )}
    </div>
  );
}
