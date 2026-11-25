import { links } from "./site";

export type ServiceMode = "express" | "air" | "ocean";

export type Service = {
  mode: ServiceMode;
  slug: string;
  name: string;
  short: string;
  description: string;
  benefits: string[];
  bestFor: string;
  sceneCaption: string;
  href: string;
  enquiryHref: string;
  /** Detail page */
  lead: string;
  overview: string[];
  highlights: { title: string; body: string }[];
  suitedFor: string[];
  steps: { title: string; body: string }[];
  /** Comparison table */
  typical: string;
  handover: string;
  paperwork: string;
  updates: string;
};

/**
 * Service content, adapted from the current service pages. No prices,
 * transit times, guarantees or 24/7 claims.
 */
export const services: Service[] = [
  {
    mode: "express",
    slug: "express-freight",
    name: "Express Freight",
    short: "Road freight & courier",
    description: "Keep parcels and business shipments moving with road freight and courier solutions.",
    benefits: ["Secure transportation", "Shipment tracking", "Pickup-to-delivery coordination"],
    bestFor: "Parcels and business shipments moving by road.",
    sceneCaption: "A truck leaves the hub along a highlighted road.",
    href: links.express,
    enquiryHref: links.business,
    lead: "Road freight and courier services that move parcels and business shipments securely between cities and regions.",
    overview: [
      "Express Freight is designed for shipments that need to move by road without fuss. We plan the pickup, keep the shipment moving through the network and coordinate the handover at the destination.",
      "Working with trusted carriers, we offer flexible pickup schedules, priority handling and door-to-door delivery — from documents to palletized shipments.",
    ],
    highlights: [
      { title: "Secure transportation", body: "Shipments are handled with care from pickup to the final handover." },
      { title: "Shipment tracking", body: "Follow progress at any time with your AWB or tracking number." },
      { title: "Pickup-to-delivery coordination", body: "One team plans the pickup, the movement and the final handoff." },
    ],
    suitedFor: ["Documents", "Parcels", "Palletized shipments", "Business consignments"],
    steps: [
      { title: "Book", body: "Share the shipment details online or call the desk." },
      { title: "Pickup", body: "Collected from the sender at an agreed time." },
      { title: "On the road", body: "Moved through the network with tracking updates." },
      { title: "Delivered", body: "Handed over at the destination." },
    ],
    typical: "Documents, parcels and palletized loads",
    handover: "Door-to-door",
    paperwork: "Booking and pickup coordination",
    updates: "Shipment tracking",
  },
  {
    mode: "air",
    slug: "air-freight",
    name: "Air Freight",
    short: "Urgent & time-critical",
    description: "Plan urgent and time-critical shipments with air freight support.",
    benefits: ["Priority cargo handling", "Documentation support", "Airport and door-to-door options"],
    bestFor: "Urgent documents and time-critical cargo.",
    sceneCaption: "A simplified airport cargo area with an unbranded aircraft.",
    href: links.air,
    enquiryHref: links.business,
    lead: "Air freight support for urgent and time-critical shipments, with documentation help and options from airport to door.",
    overview: [
      "Air Freight connects urgent shipments to major airports with priority handling and shipment monitoring. It suits documents, high-value cargo and time-critical spare parts.",
      "Choose airport-to-airport or door-to-door. We support the documentation and coordinate last-mile delivery, with updates from pickup through arrival.",
    ],
    highlights: [
      { title: "Priority cargo handling", body: "Urgent shipments are prepared and handed over with priority." },
      { title: "Documentation support", body: "Help with the paperwork that air cargo needs." },
      { title: "Airport and door-to-door", body: "Collect at the airport, or have it delivered to the door." },
    ],
    suitedFor: ["Urgent documents", "High-value cargo", "Time-critical spare parts"],
    steps: [
      { title: "Book", body: "Tell us about the cargo and when it needs to arrive." },
      { title: "Pickup & paperwork", body: "Collected and documented for the flight." },
      { title: "In the air", body: "Flown to the destination airport with shipment monitoring." },
      { title: "Arrival", body: "Collected at the airport or delivered to the door." },
    ],
    typical: "Documents, high-value items and spare parts",
    handover: "Airport-to-airport or door-to-door",
    paperwork: "Documentation support",
    updates: "Monitoring from pickup to arrival",
  },
  {
    mode: "ocean",
    slug: "ocean-freight",
    name: "Ocean Freight",
    short: "Larger cargo by sea",
    description: "Move larger cargo through coordinated ocean freight services.",
    benefits: ["Full/shared container options", "Port and paperwork coordination", "Cargo updates"],
    bestFor: "Larger, heavier and containerized cargo.",
    sceneCaption: "A miniature container terminal with an unbranded cargo ship.",
    href: links.ocean,
    enquiryHref: links.business,
    lead: "Coordinated ocean freight for larger cargo, with full and shared container options and help with port paperwork.",
    overview: [
      "Ocean Freight is for businesses that need dependable sea shipping for larger cargo. Full container and shared container options connect major ports.",
      "We help with booking, consolidation, port handling, customs paperwork and door-to-door delivery, so the cargo has a clear status at every stage.",
    ],
    highlights: [
      { title: "Full and shared containers", body: "Book a full container, or share space for smaller loads." },
      { title: "Port and paperwork coordination", body: "Port handling and customs paperwork, coordinated for you." },
      { title: "Cargo updates", body: "A clear status for your cargo at every stage." },
    ],
    suitedFor: ["Larger cargo", "Containerized freight", "Bulk business shipments"],
    steps: [
      { title: "Booking", body: "Booking and, where needed, consolidation of your cargo." },
      { title: "At the port", body: "Port handling and customs paperwork." },
      { title: "At sea", body: "Shipped to the destination port with cargo updates." },
      { title: "Delivered", body: "Released at the port or delivered door-to-door." },
    ],
    typical: "Full or shared containers and bulk cargo",
    handover: "Port-to-port or door-to-door",
    paperwork: "Booking, consolidation and customs paperwork",
    updates: "Cargo updates at each stage",
  },
];

export const serviceByMode = Object.fromEntries(services.map((s) => [s.mode, s])) as Record<ServiceMode, Service>;
export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s])) as Record<string, Service>;
