"use client";

import { ArrowRight, Mail, Phone, Plus } from "lucide-react";
import { useState } from "react";
import { faq, type FaqItem } from "@/content/faq";
import { contact } from "@/content/site";
import { AppLink } from "@/components/ui/AppLink";

type Props = { items?: FaqItem[]; id?: string; eyebrow?: string; heading?: string; tone?: "light" | "white" };

export function Faq({ items = faq, id = "faq", eyebrow = "FAQ", heading = "Before you send.", tone = "light" }: Props) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`${tone === "white" ? "bg-white" : "bg-bg"} py-20 lg:py-28`}>
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-heading`} className="type-h2 mt-3">
            {heading}
          </h2>
          <p className="mt-4 text-[1.0625rem] text-muted">Can’t find what you need? Our team is available {contact.days}, {contact.hours}.</p>
          <ul className="mt-6 grid gap-2">
            <li>
              <AppLink href={contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 font-bold text-navy hover:text-blue">
                <Phone aria-hidden className="size-4 text-blue" /> {contact.phone}
              </AppLink>
            </li>
            <li>
              <AppLink href={contact.emailHref} className="inline-flex min-h-11 items-center gap-2 font-bold text-navy hover:text-blue">
                <Mail aria-hidden className="size-4 text-blue" /> {contact.email}
              </AppLink>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-8">
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {items.map((item) => {
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
                      <AppLink href={item.link.href} className="link-arrow mt-1">
                        {item.link.label} <ArrowRight aria-hidden className="size-4" />
                      </AppLink>
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
