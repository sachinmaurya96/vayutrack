"use client";

import { ArrowUpRight, ChevronDown, Clock, Mail, Menu, Phone, ScanLine, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { contact, links, primaryNav, utilityNav, type NavItem } from "@/content/site";
import { focusTrackingInput } from "@/lib/focusTracking";
import { Logo } from "@/components/ui/Logo";

function trackClick(e: React.MouseEvent<HTMLAnchorElement>, after?: () => void) {
  if (focusTrackingInput()) {
    e.preventDefault();
    history.replaceState(null, "", "#track");
  }
  after?.();
}

export function UtilityBar() {
  return (
    <div className="on-dark hidden bg-navy text-[0.875rem] text-white/85 lg:block">
      <div className="container-page flex h-10 items-center justify-between gap-6">
        <ul className="flex items-center gap-6">
          <li>
            <a href={contact.phoneHref} className="inline-flex items-center gap-2 hover:text-white">
              <Phone aria-hidden className="size-4" /> {contact.phone}
            </a>
          </li>
          <li>
            <a href={contact.emailHref} className="inline-flex items-center gap-2 hover:text-white">
              <Mail aria-hidden className="size-4" /> {contact.email}
            </a>
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock aria-hidden className="size-4" /> {contact.days}, {contact.hours} <span className="text-white/65">({contact.timezone})</span>
          </li>
        </ul>
        <nav aria-label="Secondary">
          <ul className="flex items-center gap-5">
            {utilityNav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-white hover:underline underline-offset-4">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function DesktopMenu({ item, open, onToggle, onClose }: { item: Extract<NavItem, { kind: "menu" }>; open: boolean; onToggle: () => void; onClose: () => void }) {
  const panelId = useId();
  const wrap = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return (
    <li
      ref={wrap}
      className="relative"
      onBlur={(e) => {
        if (open && !wrap.current?.contains(e.relatedTarget as Node)) onClose();
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="inline-flex min-h-12 items-center gap-1.5 rounded-full px-3.5 text-[0.9375rem] font-semibold text-navy hover:bg-blue-50"
      >
        {item.label}
        <ChevronDown aria-hidden className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={panelId} hidden={!open} className="panel absolute left-1/2 top-[calc(100%+10px)] w-[22rem] -translate-x-1/2 p-2">
        <ul>
          {item.items.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={onClose} className="group flex items-start justify-between gap-3 rounded-xl px-4 py-3 hover:bg-blue-50">
                <span>
                  <span className="block font-bold text-navy">{l.label}</span>
                  {l.description && <span className="block text-[0.875rem] text-muted">{l.description}</span>}
                </span>
                <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-blue opacity-60 group-hover:opacity-100" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function MobileMenu({ open, onClose, returnFocus }: { open: boolean; onClose: () => void; returnFocus: React.RefObject<HTMLButtonElement | null> }) {
  const dialog = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const target = returnFocus.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      target?.focus();
    };
  }, [open, onClose, returnFocus]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          id="mobile-menu"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white lg:hidden"
        >
          <div className="container-page flex h-[72px] shrink-0 items-center justify-between border-b border-line">
            <a href="#top" onClick={onClose} aria-label="VayuTrack home">
              <Logo height={44} />
            </a>
            <button type="button" onClick={onClose} className="inline-flex size-12 items-center justify-center rounded-full border border-line text-navy" aria-label="Close menu">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="container-page flex-1 py-6">
            <ul className="space-y-6">
              {primaryNav.map((item) =>
                item.kind === "link" ? (
                  <li key={item.label}>
                    <a href={item.href} onClick={onClose} className="block py-2 text-xl font-bold text-navy">
                      {item.label}
                    </a>
                  </li>
                ) : (
                  <li key={item.label}>
                    <p className="eyebrow mb-2">{item.label}</p>
                    <ul className="divide-y divide-line rounded-2xl border border-line">
                      {item.items.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} onClick={onClose} className="flex min-h-12 items-center justify-between px-4 py-3 font-semibold text-navy">
                            {l.label}
                            <ArrowUpRight aria-hidden className="size-4 text-blue" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ),
              )}
              <li>
                <p className="eyebrow mb-2">Support</p>
                <ul className="divide-y divide-line rounded-2xl border border-line">
                  {utilityNav.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} onClick={onClose} className="flex min-h-12 items-center justify-between px-4 py-3 font-semibold text-navy">
                        {l.label}
                        <ArrowUpRight aria-hidden className="size-4 text-blue" />
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
            <div className="mt-8 grid gap-3">
              <a href="#track" onClick={(e) => trackClick(e, onClose)} className="btn btn-secondary w-full">
                <ScanLine aria-hidden className="size-5" /> Track Shipment
              </a>
              <a href={links.booking} className="btn btn-primary w-full">
                Ship With Us
              </a>
            </div>
            <dl className="mt-8 space-y-2 text-[0.9375rem] text-muted">
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a className="font-semibold text-navy" href={contact.phoneHref}>
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a className="font-semibold text-navy" href={contact.emailHref}>
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Hours</dt>
                <dd>
                  {contact.days}, {contact.hours} ({contact.timezone})
                </dd>
              </div>
            </dl>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenus = useCallback(() => setOpenMenu(null), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <a href="#top" className="shrink-0 rounded-lg" aria-label="VayuTrack home">
          <Logo height={50} eager />
        </a>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1.5">
            {primaryNav.map((item) =>
              item.kind === "link" ? (
                <li key={item.label}>
                  <a href={item.href} className="inline-flex min-h-12 items-center rounded-full px-3.5 text-[0.9375rem] font-semibold text-navy hover:bg-blue-50">
                    {item.label}
                  </a>
                </li>
              ) : (
                <DesktopMenu
                  key={item.label}
                  item={item}
                  open={openMenu === item.id}
                  onToggle={() => setOpenMenu((m) => (m === item.id ? null : item.id))}
                  onClose={closeMenus}
                />
              ),
            )}
          </ul>
        </nav>
        <div className="flex items-center gap-2 xl:gap-3">
          <a href="#track" onClick={(e) => trackClick(e)} className="btn btn-secondary hidden !px-4 sm:inline-flex">
            <ScanLine aria-hidden className="size-[1.125rem]" />
            Track Shipment
          </a>
          <a href={links.booking} className="btn btn-primary hidden md:inline-flex">
            Ship With Us
          </a>
          <button
            ref={menuButton}
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-full border border-line text-navy lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>
      <MobileMenu open={mobileOpen} onClose={closeMobile} returnFocus={menuButton} />
    </header>
  );
}
