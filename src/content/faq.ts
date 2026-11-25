import { links } from "./site";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  link?: { label: string; href: string };
  /**
   * PENDING CLIENT CONFIRMATION: answers flagged here restate the policy on the
   * current public FAQ. Confirm the wording with VayuTrack before launch.
   */
  policyNeedsConfirmation?: boolean;
};

export const faq: FaqItem[] = [
  {
    id: "what-can-i-ship",
    question: "What can VayuTrack help me ship?",
    answer:
      "VayuTrack offers courier delivery along with Express, Air and Ocean Freight for individuals and businesses. The right service depends on what you are sending, its size and where it needs to go, and our team can help you choose.",
    link: { label: "Compare services", href: "#services" },
  },
  {
    id: "how-to-track",
    question: "How do I track my shipment?",
    answer:
      "Enter your AWB or tracking number in the tracking box at the top of this page and continue to our tracking page for the latest status. If you need help, contact our team.",
    link: { label: "Go to tracking", href: links.tracking },
  },
  {
    id: "cancel",
    question: "Can I cancel a shipment?",
    answer:
      "A shipment can be cancelled before it is dispatched. Once it is in transit, contact our support team and they will advise you on the options available.",
    link: { label: "Contact support", href: links.contact },
    policyNeedsConfirmation: true,
  },
  {
    id: "returns",
    question: "Do you handle returns?",
    answer:
      "Yes. Return pickups can be arranged, and returned shipments can be tracked like any other shipment. Contact our team to arrange a return.",
    link: { label: "Contact our team", href: links.contact },
    policyNeedsConfirmation: true,
  },
  {
    id: "delivery-time",
    question: "How long will delivery take?",
    answer:
      "Delivery time depends on the distance, the service you choose and your shipment’s requirements. Ask our team for an estimate for your shipment.",
    link: { label: "Ask for an estimate", href: links.business },
  },
];
