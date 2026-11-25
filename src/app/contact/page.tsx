import { ArrowRight, Briefcase, Building2, Clock, Handshake, Mail, MapPin, Phone, ScanLine } from "lucide-react";
import type { Metadata } from "next";
import { contactSteps } from "@/content/forms";
import { contact, links } from "@/content/site";
import { SchemaForm } from "@/components/forms/SchemaForm";
import { FormPanel } from "@/components/pages/Common";
import { AppLink } from "@/components/ui/AppLink";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call the VayuTrack desk during working hours, or send a message and the desk will reply.",
};

const methods = [
  { icon: Phone, label: "Call the desk", value: contact.phone, href: contact.phoneHref },
  { icon: Mail, label: "Email", value: contact.email, href: contact.emailHref },
  { icon: MapPin, label: "Office", value: contact.office, href: links.locations },
  { icon: Clock, label: "Working hours", value: `${contact.days}, ${contact.hours}`, note: contact.timezone },
];

const shortcuts = [
  { icon: ScanLine, label: "Track a shipment", href: links.track },
  { icon: Building2, label: "Business enquiry", href: links.business },
  { icon: Handshake, label: "Become a partner", href: links.partner },
  { icon: Briefcase, label: "Careers", href: links.careers },
];

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHero eyebrow="Contact" title="Talk to the desk." lead="Call during working hours, or send a message and the desk will reply." crumbs={[{ label: "Contact" }]} />
      <section className="bg-bg py-12 lg:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="grid content-start gap-6 lg:col-span-5">
            <ul className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white" aria-label="Contact details">
              {methods.map((m) => {
                const Icon = m.icon;
                const body = (
                  <>
                    <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-[0.875rem] font-bold uppercase tracking-[0.08em] text-muted">{m.label}</span>
                      <span className="block text-[1.125rem] font-extrabold text-navy">{m.value}</span>
                      {m.note && <span className="block text-[0.9375rem] text-muted">{m.note}</span>}
                    </span>
                  </>
                );
                return (
                  <li key={m.label} className="border-b border-line last:border-0">
                    {m.href ? (
                      <AppLink href={m.href} className="flex items-center gap-4 p-5 hover:bg-blue-50/60">
                        {body}
                      </AppLink>
                    ) : (
                      <div className="flex items-center gap-4 p-5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <nav aria-labelledby="shortcuts-heading" className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <h2 id="shortcuts-heading" className="text-[1.125rem] font-extrabold">
                Looking for something specific?
              </h2>
              <ul className="mt-3 grid gap-1">
                {shortcuts.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.href}>
                      <AppLink href={s.href} className="group flex min-h-12 items-center justify-between gap-3 rounded-xl px-2 font-bold text-navy hover:bg-blue-50">
                        <span className="flex items-center gap-3">
                          <Icon aria-hidden className="size-[1.125rem] text-blue" /> {s.label}
                        </span>
                        <ArrowRight aria-hidden className="size-4 text-blue transition-transform group-hover:translate-x-0.5" />
                      </AppLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <div className="lg:col-span-7">
            <FormPanel title="Send a message" intro="Name, email, subject and a short note are enough.">
              <SchemaForm form="contact" steps={contactSteps} submitLabel="Send message" emailSubject="Website enquiry" noun="message" />
            </FormPanel>
          </div>
        </div>
      </section>
    </main>
  );
}
