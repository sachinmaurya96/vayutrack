"use client";

import { ArrowUpRight, Mail, Phone, Plus } from "lucide-react";
import { useState } from "react";
import { faq } from "@/content/faq";
import { contact } from "@/content/site";

export function Faq() {
  const [open, setOpen] = useState<string | null>(faq[0].id);
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-bg py-20 lg:py-28">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-heading" className="type-h2 mt-3">
            Before you send.
          </h2>
          <p className="mt-4 text-[1.0625rem] text-muted">Can’t find what you need? Our team is available {contact.days}, {contact.hours}.</p>
          <ul className="mt-6 grid gap-2">
            <li>
              <a href={contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 font-bold text-navy hover:text-blue">
                <Phone aria-hidden className="size-4 text-blue" /> {contact.phone}
              </a>
            </li>
            <li>
              <a href={contact.emailHref} className="inline-flex min-h-11 items-center gap-2 font-bold text-navy hover:text-blue">
                <Mail aria-hidden className="size-4 text-blue" /> {contact.email}
              </a>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-8">
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {faq.map((item) => {
              const expanded = open === item.id;
              return (
                <li key={item.id}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${item.id}`}
                      aria-expanded={expanded}
                      aria-controls={`faq-a-${item.id}`}
                      onClick={() => setOpen(expanded ? null : item.id)}
                      className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left text-[1.0625rem] font-bold text-navy hover:bg-blue-50/60 sm:px-7"
                    >
                      {item.question}
                      <span aria-hidden className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] ${expanded ? "rotate-45 border-blue bg-blue text-white" : "border-line-strong text-navy"}`}>
                        <Plus className="size-4" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-a-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-q-${item.id}`}
                    hidden={!expanded}
                    className="px-5 pb-6 sm:px-7"
                  >
                    <p className="max-w-[44rem] leading-relaxed text-ink">{item.answer}</p>
                    {item.link && (
                      <a href={item.link.href} className="link-arrow mt-1">
                        {item.link.label} <ArrowUpRight aria-hidden className="size-4" />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
