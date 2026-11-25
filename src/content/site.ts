/**
 * Site-wide facts and destinations.
 *
 * Every destination stays on this page: links point to sections by id, and
 * the only outbound actions are the company's phone and email.
 */

export const links = {
  top: "#top",
  track: "#track",
  services: "#services",
  /** Service anchors also select the matching tab in the service explorer. */
  express: "#tab-express",
  air: "#tab-air",
  ocean: "#tab-ocean",
  howItWorks: "#how-it-works",
  about: "#about",
  grow: "#grow",
  faq: "#faq",
  insights: "#insights",
  contact: "#contact",
} as const;

export const brand = {
  name: "VayuTrack",
  logo: {
    src: "/brand/vayutrack-logo.webp",
    /** Intrinsic size of the supplied artwork; keep this ratio when scaling. */
    width: 1254,
    height: 690,
    alt: "VayuTrack Express",
  },
  summary:
    "VayuTrack provides courier delivery and Express, Air and Ocean Freight solutions for individuals and businesses.",
} as const;

export const contact = {
  phone: "+91 9599898007",
  phoneHref: "tel:+919599898007",
  email: "info@vayutrack.com",
  emailHref: "mailto:info@vayutrack.com",
  office: "Ithum Tower, Sector 62, Noida",
  days: "Monday–Saturday",
  hours: "10:00 AM–6:00 PM",
  timezone: "India time",
} as const;

/** Opens the visitor's email app with a subject line filled in. */
export const emailWithSubject = (subject: string) => `${contact.emailHref}?subject=${encodeURIComponent(subject)}`;

export type NavLink = { label: string; href: string; description?: string };
export type NavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "menu"; label: string; id: string; items: NavLink[] };

export const primaryNav: NavItem[] = [
  {
    kind: "menu",
    label: "Services",
    id: "services",
    items: [
      { label: "Express Freight", href: links.express, description: "Road freight and courier" },
      { label: "Air Freight", href: links.air, description: "Urgent and time-critical cargo" },
      { label: "Ocean Freight", href: links.ocean, description: "Larger and containerized cargo" },
      { label: "Compare services", href: links.services, description: "See all three side by side" },
    ],
  },
  { kind: "link", label: "How It Works", href: links.howItWorks },
  { kind: "link", label: "About", href: links.about },
  { kind: "link", label: "Grow With Us", href: links.grow },
];

export const utilityNav: NavLink[] = [
  { label: "Contact", href: links.contact },
  { label: "FAQ", href: links.faq },
];

export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Express Freight", href: links.express },
      { label: "Air Freight", href: links.air },
      { label: "Ocean Freight", href: links.ocean },
    ],
  },
  {
    title: "Ship & Track",
    links: [
      { label: "Track shipment", href: links.track },
      { label: "How it works", href: links.howItWorks },
      { label: "Plan a shipment", href: links.contact },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About VayuTrack", href: links.about },
      { label: "Grow with us", href: links.grow },
      { label: "Insights", href: links.insights },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", href: links.contact },
      { label: "Frequently asked questions", href: links.faq },
    ],
  },
];
