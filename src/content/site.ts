/**
 * Site-wide facts and destinations.
 *
 * Every URL below was confirmed to respond on the current public site
 * (25 Nov 2026). Swap a value here to point the whole page at a new route.
 */

export const links = {
  home: "/",
  about: "https://vayutrack.com/about",
  express: "https://vayutrack.com/services/express-freight",
  air: "https://vayutrack.com/services/air-freight",
  ocean: "https://vayutrack.com/services/ocean-freight",
  booking: "https://vayutrack.com/ship-with-vayutrack",
  business: "https://vayutrack.com/business-enquiry",
  partner: "https://vayutrack.com/become-a-partner",
  tracking: "https://vayutrack.com/track",
  contact: "https://vayutrack.com/contact",
  locations: "https://vayutrack.com/locate-us",
  careers: "https://vayutrack.com/apply-jobs",
  culture: "https://vayutrack.com/life",
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
  hours: "10:00\u00a0AM–6:00\u00a0PM",
  timezone: "India time",
} as const;

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
      { label: "Compare services", href: "#services", description: "See all three side by side" },
    ],
  },
  { kind: "link", label: "How It Works", href: "#how-it-works" },
  { kind: "link", label: "About", href: "#about" },
  {
    kind: "menu",
    label: "Grow With Us",
    id: "grow",
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
      { label: "Ship with VayuTrack", href: links.booking },
      { label: "Track shipment", href: links.tracking },
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
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", href: links.contact },
      { label: "Frequently asked questions", href: "#faq" },
    ],
  },
];
