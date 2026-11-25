import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { contact, links } from "@/content/site";
import { AppLink } from "@/components/ui/AppLink";

/** "Prefer to talk?" card with the real company contact details. */
export function ContactAside({ title = "Prefer to talk?", body = "Call the desk during working hours, or write to us and we will reply." }: { title?: string; body?: string }) {
  const rows = [
    { icon: Phone, label: contact.phone, href: contact.phoneHref },
    { icon: Mail, label: contact.email, href: contact.emailHref },
    { icon: Clock, label: `${contact.days}, ${contact.hours} (${contact.timezone})` },
    { icon: MapPin, label: contact.office, href: links.locations },
  ];
  return (
    <aside aria-label={title} className="rounded-[var(--radius-card)] border border-line bg-white p-6">
      <h2 className="text-[1.125rem] font-extrabold">{title}</h2>
      <p className="mt-1.5 text-[0.9375rem] text-muted">{body}</p>
      <ul className="mt-4 grid gap-1">
        {rows.map((r) => {
          const Icon = r.icon;
          const inner = (
            <>
              <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue">
                <Icon className="size-4" />
              </span>
              <span>{r.label}</span>
            </>
          );
          return (
            <li key={r.label}>
              {r.href ? (
                <AppLink href={r.href} className="flex min-h-11 items-center gap-3 rounded-lg font-semibold text-navy hover:text-blue">
                  {inner}
                </AppLink>
              ) : (
                <span className="flex min-h-11 items-center gap-3 text-[0.9375rem] text-ink">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/** Numbered vertical steps joined by a rule. */
export function StepsList({ steps, className = "" }: { steps: readonly { title: string; body: string }[]; className?: string }) {
  return (
    <ol className={`relative grid gap-6 ${className}`}>
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-4">
          {i < steps.length - 1 && <span aria-hidden className="absolute left-[19px] top-11 h-[calc(100%-1.25rem)] w-0.5 bg-line" />}
          <span aria-hidden className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-navy font-mono text-[0.875rem] font-bold text-white">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="pt-1.5">
            <h3 className="text-[1.0625rem] font-extrabold">{s.title}</h3>
            <p className="mt-1 text-[0.9375rem] text-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Two-column page body: content and a sticky side column. */
export function PageBody({ main, side, tone = "white" }: { main: ReactNode; side: ReactNode; tone?: "white" | "light" }) {
  return (
    <section className={`${tone === "white" ? "bg-white" : "bg-bg"} py-12 lg:py-16`}>
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">{main}</div>
        <div className="lg:col-span-4">
          <div className="grid gap-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">{side}</div>
        </div>
      </div>
    </section>
  );
}

export function FormPanel({ children, title, intro }: { children: ReactNode; title?: string; intro?: string }) {
  return (
    <div className="panel p-6 sm:p-8">
      {title && <h2 className="text-[1.375rem] font-extrabold">{title}</h2>}
      {intro && <p className="mt-1.5 text-[0.9375rem] text-muted">{intro}</p>}
      <div className={title || intro ? "mt-6" : ""}>{children}</div>
    </div>
  );
}
