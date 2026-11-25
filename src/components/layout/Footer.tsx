import { brand, contact, footerGroups } from "@/content/site";
import { AppLink } from "@/components/ui/AppLink";
import { Logo } from "@/components/ui/Logo";
import { CurrentYear } from "./CurrentYear";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-4">
          <Logo height={60} />
          <p className="mt-5 max-w-[22rem] text-[0.9375rem] leading-relaxed text-muted">{brand.summary}</p>
          <address className="mt-6 grid gap-1.5 text-[0.9375rem] not-italic text-ink">
            <a href={contact.phoneHref} className="font-bold text-navy hover:text-blue">
              {contact.phone}
            </a>
            <a href={contact.emailHref} className="font-bold text-navy hover:text-blue">
              {contact.email}
            </a>
            <span>{contact.office}</span>
            <span className="text-muted">
              {contact.days}, {contact.hours} ({contact.timezone})
            </span>
          </address>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
          {footerGroups.map((g) => (
            <div key={g.title}>
              <h2 className="text-[0.875rem] font-bold uppercase tracking-[0.1em] text-navy">{g.title}</h2>
              <ul className="mt-4 grid gap-1">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <AppLink href={l.href} className="inline-flex min-h-10 items-center text-[0.9375rem] text-muted hover:text-blue hover:underline hover:underline-offset-4">
                      {l.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-[0.875rem] text-muted sm:flex-row sm:justify-between">
          <p>
            © <CurrentYear /> VayuTrack. All rights reserved.
          </p>
          <p>Scene illustrations are illustrative and do not show live operations.</p>
        </div>
      </div>
    </footer>
  );
}
