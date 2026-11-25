/**
 * "How it works": four explanatory chapters, kept separate from the five
 * illustrative shipment states shown in the sample timeline.
 */

export type JourneyStage = 0 | 1 | 2 | 3;

export const journey = {
  id: "how-it-works",
  eyebrow: "How it works",
  heading: "From your doorstep to theirs.",
  intro: "Four steps take a shipment from the first conversation to the final handoff.",
  chapters: [
    {
      title: "Plan the shipment",
      body: "Tell us what you need to send. Our team helps plan the right service.",
      sceneLabel: "Pickup point",
    },
    {
      title: "Prepare and dispatch",
      body: "Your shipment is organized, handled with care, and prepared for its journey.",
      sceneLabel: "Hub and loading bay",
    },
    {
      title: "Follow the movement",
      body: "Shipment updates help you stay informed as it moves through the network.",
      sceneLabel: "On the road",
    },
    {
      title: "Complete the delivery",
      body: "The final handoff brings the journey to its destination.",
      sceneLabel: "Destination",
    },
  ],
} as const;

export type TimelineKey = "booked" | "picked-up" | "at-hub" | "in-transit" | "delivered";

/** Illustrative shipment states. Not a statement of real scan codes. */
export const timelineStates: { key: TimelineKey; label: string }[] = [
  { key: "booked", label: "Booked" },
  { key: "picked-up", label: "Picked up" },
  { key: "at-hub", label: "At hub" },
  { key: "in-transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
];

/** Which illustrative state is "current" while each chapter is in view. */
export const chapterTimelineIndex: Record<JourneyStage, number> = {
  0: 0,
  1: 2,
  2: 3,
  3: 4,
};
