import { links } from "./site";

export type ServiceMode = "express" | "air" | "ocean";

export type Service = {
  mode: ServiceMode;
  name: string;
  short: string;
  description: string;
  benefits: string[];
  bestFor: string;
  sceneCaption: string;
  enquiryHref: string;
};

/**
 * Service explorer content. No prices, transit times or capacity claims.
 * Scene captions describe the illustration, not real operations.
 */
export const services: Service[] = [
  {
    mode: "express",
    name: "Express Freight",
    short: "Road freight & courier",
    description: "Keep parcels and business shipments moving with road freight and courier solutions.",
    benefits: ["Secure transportation", "Shipment tracking", "Pickup-to-delivery coordination"],
    bestFor: "Parcels and business shipments moving by road.",
    sceneCaption: "A truck leaves the hub along a highlighted road.",
    enquiryHref: links.contact,
  },
  {
    mode: "air",
    name: "Air Freight",
    short: "Urgent & time-critical",
    description: "Plan urgent and time-critical shipments with air freight support.",
    benefits: ["Priority cargo handling", "Documentation support", "Airport and door-to-door options"],
    bestFor: "Urgent documents and time-critical cargo.",
    sceneCaption: "A simplified airport cargo area with an unbranded aircraft.",
    enquiryHref: links.contact,
  },
  {
    mode: "ocean",
    name: "Ocean Freight",
    short: "Larger cargo by sea",
    description: "Move larger cargo through coordinated ocean freight services.",
    benefits: ["Full/shared container options", "Port and paperwork coordination", "Cargo updates"],
    bestFor: "Larger, heavier and containerized cargo.",
    sceneCaption: "A miniature container terminal with an unbranded cargo ship.",
    enquiryHref: links.contact,
  },
];

export const serviceByMode = Object.fromEntries(services.map((s) => [s.mode, s])) as Record<ServiceMode, Service>;
