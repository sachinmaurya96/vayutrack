import type { FramingId } from "@/components/scene/layout";

/** Articles from the current blog. Bodies are the published text. */

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  topic: string;
  body: string[];
  /** Illustration crop from the logistics world. */
  art: { framing: FramingId; view: "hero" | "services" | "journey"; stage?: 0 | 1 | 2 | 3 };
};

export const articles: Article[] = [
  {
    slug: "smart-logistics-for-growing-businesses",
    title: "Smart Logistics Solutions for Growing Businesses",
    excerpt: "Why keeping booking, dispatch and delivery updates in one place helps a growing team handle more orders.",
    date: "2025-05-10",
    dateLabel: "10 May 2025",
    topic: "Business shipping",
    body: [
      "Growing businesses need a courier partner that can add lanes without adding chaos.",
      "VayuTrack keeps booking, dispatch and delivery updates in one place so the same team can handle more orders without losing track of a single AWB.",
    ],
    art: { framing: "hero:hub", view: "hero" },
  },
  {
    slug: "real-time-tracking-improves-delivery",
    title: "How Real-Time Tracking Improves Delivery Efficiency",
    excerpt: "How shipment scans give the operations team and the customer the same view of where a parcel is.",
    date: "2025-05-10",
    dateLabel: "10 May 2025",
    topic: "Tracking",
    body: [
      "Real-time scans tell the operations team where a shipment is, and they tell the customer the same story.",
      "When a bag misses a connection, the status changes immediately so support can act before the delivery date slips.",
    ],
    art: { framing: "journey:2", view: "journey", stage: 2 },
  },
  {
    slug: "building-a-strong-courier-network",
    title: "Building a Strong Courier Network Across Cities",
    excerpt: "How pickup, linehaul and last-mile handoff stay connected under a single tracking number.",
    date: "2025-05-10",
    dateLabel: "10 May 2025",
    topic: "Network",
    body: [
      "VayuTrack is growing a city-to-city courier network so businesses can ship with the same process in every lane.",
      "Pickup, linehaul and last-mile handoff stay on one tracking number, which keeps the delivery promise visible to the sender and the receiver.",
    ],
    art: { framing: "services:express", view: "services" },
  },
];

export const articleBySlug = Object.fromEntries(articles.map((a) => [a.slug, a])) as Record<string, Article>;
