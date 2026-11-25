/**
 * Site-wide facts and destinations.
 *
 * Every destination is a route in this site; the only outbound actions are
 * the company's phone and email.
 */

export const links = {
  home: "/",
  about: "/about",
  services: "/services",
  express: "/services/express-freight",
  air: "/services/air-freight",
  ocean: "/services/ocean-freight",
  booking: "/ship-with-vayutrack",
  business: "/business-enquiry",
  partner: "/become-a-partner",
  track: "/track",
  contact: "/contact",
  locations: "/locate-us",
  careers: "/apply-jobs",
  culture: "/life",
  blog: "/blog",
  howItWorks: "/#how-it-works",
  faq: "/#faq",
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

/** Opens the visitor's email app with a subject (and optional body) filled in. */
export function emailWithSubject(subject: string, body?: string) {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `${contact.emailHref}?${params.join("&")}`;
}

export type NavLink = { label: string; href: string; description?: string };
export type NavItem =
  | { kind: "link"; label: string; href: string; match?: string[] }
  | { kind: "menu"; label: string; id: string; items: NavLink[]; match: string[] };

export const primaryNav: NavItem[] = [
  {
    kind: "menu",
    label: "Services",
    id: "services",
    match: ["/services"],
    items: [
      { label: "Express Freight", href: links.express, description: "Road freight and courier" },
      { label: "Air Freight", href: links.air, description: "Urgent and time-critical cargo" },
      { label: "Ocean Freight", href: links.ocean, description: "Larger and containerized cargo" },
      { label: "All services", href: links.services, description: "Compare all three side by side" },
    ],
  },
  { kind: "link", label: "How It Works", href: links.howItWorks },
  { kind: "link", label: "About", href: links.about, match: ["/about"] },
  {
    kind: "menu",
    label: "Grow With Us",
    id: "grow",
    match: ["/become-a-partner", "/apply-jobs", "/jobs", "/life"],
    items: [
      { label: "Become a partner", href: links.partner, description: "Join the VayuTrack network" },
      { label: "Careers", href: links.careers, description: "Current openings" },
      { label: "Life at VayuTrack", href: links.culture, description: "Our people and culture" },
    ],
  },
];

export const utilityNav: NavLink[] = [
  { label: "Contact", href: links.contact },
  { label: "Locate us", href: links.locations },
  { label: "Careers", href: links.careers },
  { label: "Blog", href: links.blog },
];

export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Express Freight", href: links.express },
      { label: "Air Freight", href: links.air },
      { label: "Ocean Freight", href: links.ocean },
      { label: "All services", href: links.services },
    ],
  },
  {
    title: "Ship & Track",
    links: [
      { label: "Ship with VayuTrack", href: links.booking },
      { label: "Track shipment", href: links.track },
      { label: "Business enquiry", href: links.business },
      { label: "Locate us", href: links.locations },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About VayuTrack", href: links.about },
      { label: "Become a partner", href: links.partner },
      { label: "Careers", href: links.careers },
      { label: "Life at VayuTrack", href: links.culture },
      { label: "Blog", href: links.blog },
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
