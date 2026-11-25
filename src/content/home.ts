import { links } from "./site";

/**
 * Homepage copy. Benefit statements only: no statistics, testimonials,
 * guarantees or coverage claims until the client supplies approved evidence.
 */

export const hero = {
  eyebrow: "Courier & freight solutions",
  headingLines: ["Every shipment.", "A connected journey."],
  body: "Courier delivery and freight solutions for individuals and growing businesses. Plan your shipment, follow its progress, and stay connected from pickup to delivery.",
  primary: { label: "Ship with VayuTrack", href: links.booking },
  secondary: { label: "Explore our services", href: "#services" },
} as const;

export type CapabilityIcon = "handling" | "visibility" | "modes" | "support";

export const capabilities: { icon: CapabilityIcon; title: string; body: string }[] = [
  { icon: "handling", title: "Careful handling", body: "Shipments are organized and prepared with care at every handoff." },
  { icon: "visibility", title: "Shipment visibility", body: "Follow progress with your AWB or tracking number." },
  { icon: "modes", title: "Road, air & ocean", body: "Express, Air and Ocean Freight for different shipment needs." },
  { icon: "support", title: "Business support", body: "A team to help plan recurring and larger shipments." },
];

export const story = {
  id: "about",
  eyebrow: "About VayuTrack",
  heading: "People, process, and visibility. Working together.",
  body: "VayuTrack helps individuals and businesses send parcels, documents, and cargo with a focus on careful handling, clear communication, and reliable service.",
  points: [
    { title: "Clear shipment information", body: "Know what has been booked and follow each shipment with its tracking number." },
    { title: "Coordinated handoffs", body: "Pickup, hub handling and delivery are planned as one connected journey." },
    { title: "A team customers can contact", body: "Speak to our team by phone or email, Monday to Saturday." },
  ],
  actions: [
    { label: "About VayuTrack", href: links.about },
    { label: "Locate us", href: links.locations },
  ],
} as const;

export type UseCaseArt = "individual" | "ecommerce" | "business";

export const useCases: {
  id: string;
  art: UseCaseArt;
  audience: string;
  title: string;
  body: string;
  tags: string[];
  action: { label: string; href: string };
}[] = [
  {
    id: "individuals",
    art: "individual",
    audience: "Individuals",
    title: "Documents and personal parcels",
    body: "Send documents, gifts and personal parcels with guidance on the right service and a tracking number to follow along the way.",
    tags: ["Documents", "Personal parcels"],
    action: { label: "Plan a shipment", href: links.booking },
  },
  {
    id: "ecommerce",
    art: "ecommerce",
    audience: "Ecommerce sellers",
    title: "Business dispatches with delivery visibility",
    body: "Keep orders moving to your customers. Each dispatch carries a tracking number, so you and your buyers can follow it to the door.",
    tags: ["Business dispatches", "Delivery visibility"],
    action: { label: "Discuss your shipping needs", href: links.business },
  },
  {
    id: "business",
    art: "business",
    audience: "Business teams",
    title: "Recurring courier and freight requirements",
    body: "Plan regular courier pickups alongside larger freight movements by road, air or ocean, with a team that takes the time to understand your requirements.",
    tags: ["Recurring pickups", "Road, air & ocean"],
    action: { label: "Make a business enquiry", href: links.business },
  },
];

export const partnership = {
  id: "grow",
  eyebrow: "Grow with us",
  heading: "Grow with the VayuTrack network.",
  body: "Interested in becoming a VayuTrack network partner? Share a few details about yourself and your location, and our team will get in touch to talk through the opportunity.",
  primary: { label: "Become a partner", href: links.partner },
  secondary: { label: "Explore careers", href: links.careers },
  tertiary: { label: "Life at VayuTrack", href: links.culture },
} as const;

export { articles } from "./blog";

export const finalCta = {
  heading: "Let’s plan your next shipment.",
  body: "Tell us what you need to move. We’ll help you take the next step.",
  primary: { label: "Ship With Us", href: links.booking },
  secondary: { label: "Business Enquiry", href: links.business },
} as const;
