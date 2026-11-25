import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { finalCta } from "@/content/home";
import { contact, links } from "@/content/site";
import { AppLink } from "@/components/ui/AppLink";

type Action = { label: string; href: string };

type Props = {
  id?: string;
  heading?: string;
  body?: string;
  primary?: Action;
  secondary?: Action;
  tone?: "light" | "white";
};

/** Contact call-to-action with the real company details. Reused at the end of most pages. */
export function FinalCta({ id = "contact", heading = finalCta.heading, body = finalCta.body, primary = finalCta.primary, secondary = finalCta.secondary, tone = "light" }: Props) {
  const rows = [
    { icon: Phone, label: "Call our team", value: contact.phone, href: contact.phoneHref },
    { icon: Mail, label: "Email", value: contact.email, href: contact.emailHref },
    { icon: MapPin, label: "Office", value: contact.office, href: links.locations },
    { icon: Clock, label: "Working hours", value: `${contact.days}, ${contact.hours}`, note: contact.timezone },
  ];
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`${tone === "white" ? "bg-white" : "bg-bg"} py-20 lg:py-28`}>
      <div className="container-page">
        <div className="panel grid gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-12 lg:gap-16 lg:p-16">
          <div className="lg:col-span-6">
            <h2 id={`${id}-heading`} className="type-h2">
              {heading}
            </h2>
            <p className="type-lead mt-5 max-w-[30rem]">{body}</p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
              <AppLink href={primary.href} className="btn btn-primary">
                {primary.label} <ArrowRight aria-hidden className="size-4" />
              </AppLink>
              <AppLink href={secondary.href} className="btn btn-secondary">
                {secondary.label}
              </AppLink>
            </div>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:col-span-6">
            {rows.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.label} className="flex flex-col gap-2 bg-white p-5">
                  <dt className="flex items-center gap-2 text-[0.875rem] font-bold uppercase tracking-[0.08em] text-muted">
                    <Icon aria-hidden className="size-4 text-blue" /> {r.label}
                  </dt>
                  <dd className="text-[1.0625rem] font-bold text-navy">
                    {r.href ? (
                      <AppLink href={r.href} className="hover:text-blue hover:underline hover:underline-offset-4">
                        {r.value}
                      </AppLink>
                    ) : (
                      r.value
                    )}
                    {r.note && <span className="block text-[0.9375rem] font-medium text-muted">{r.note}</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
