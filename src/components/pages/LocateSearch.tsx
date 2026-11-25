"use client";

import { CircleAlert, Mail, MapPin, Phone, Search } from "lucide-react";
import { useState } from "react";
import { countries, indianStates } from "@/content/forms";
import { contact, emailWithSubject } from "@/content/site";

type Query = { country: string; state: string; city: string; pincode: string };

/**
 * Location search UI. No verified location list has been supplied, so a
 * search never invents branches: it explains that and offers the desk.
 */
export function LocateSearch() {
  const [q, setQ] = useState<Query>({ country: "India", state: "", city: "", pincode: "" });
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<Query | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const pincode = q.pincode.trim();
    if (pincode && !/^\d{6}$/.test(pincode)) return setError("Enter a 6-digit pincode, or leave it empty and use state and city.");
    if (!pincode && !q.state && !q.city.trim()) return setError("Enter a pincode, or choose a state or city to search.");
    setError(null);
    setSearched({ ...q, pincode, city: q.city.trim() });
  }

  const area = searched ? searched.pincode || [searched.city, searched.state].filter(Boolean).join(", ") : "";
  const control = "h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-ink placeholder:text-muted";

  return (
    <div className="mt-8">
      <form noValidate onSubmit={submit} className="panel p-5 sm:p-6" aria-describedby={error ? "locate-error" : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="loc-pincode" className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
              Pincode
            </label>
            <input id="loc-pincode" inputMode="numeric" autoComplete="postal-code" placeholder="e.g. 201309" value={q.pincode} onChange={(e) => setQ({ ...q, pincode: e.target.value })} className={control} />
          </div>
          <div>
            <label htmlFor="loc-city" className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
              City
            </label>
            <input id="loc-city" autoComplete="address-level2" value={q.city} onChange={(e) => setQ({ ...q, city: e.target.value })} className={control} />
          </div>
          <div>
            <label htmlFor="loc-state" className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
              State
            </label>
            <select id="loc-state" value={q.state} onChange={(e) => setQ({ ...q, state: e.target.value })} className={`${control} select-chevron appearance-none pr-10`}>
              <option value="">Any state</option>
              {indianStates.map((s) => (
                <option key={s.value}>{s.value}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="loc-country" className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
              Country
            </label>
            <select id="loc-country" value={q.country} onChange={(e) => setQ({ ...q, country: e.target.value })} className={`${control} select-chevron appearance-none pr-10`}>
              {countries.map((c) => (
                <option key={c.value}>{c.value}</option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <p id="locate-error" role="alert" className="mt-3 flex items-start gap-1.5 text-[0.9375rem] font-semibold text-error">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}
        <button type="submit" className="btn btn-blue mt-5 w-full sm:w-auto">
          <Search aria-hidden className="size-4" /> Find locations
        </button>
      </form>

      <div role="status" aria-live="polite">
        {searched && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-blue-100 bg-blue-50 p-6">
            <p className="font-bold text-navy">Location search isn’t connected yet</p>
            <p className="mt-1.5 max-w-[40rem] text-[0.9375rem] text-ink">
              We don’t show a location list on this site yet, so we can’t confirm a point of service for <strong>{area}</strong> here. Our team can tell you how pickup and delivery work in your area.
            </p>
            <div className="mt-4 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <a href={emailWithSubject(`Locations near ${area}`)} className="btn btn-blue">
                <Mail aria-hidden className="size-4" /> Ask about {searched.pincode ? "this pincode" : "this area"}
              </a>
              <a href={contact.phoneHref} className="btn btn-secondary">
                <Phone aria-hidden className="size-4" /> Call {contact.phone}
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
          <MapPin className="size-5" />
        </span>
        <div>
          <p className="text-[0.875rem] font-bold uppercase tracking-[0.08em] text-muted">Head office</p>
          <p className="text-[1.0625rem] font-bold text-navy">{contact.office}</p>
          <p className="text-[0.9375rem] text-muted">
            {contact.days}, {contact.hours} ({contact.timezone})
          </p>
        </div>
      </div>
    </div>
  );
}
