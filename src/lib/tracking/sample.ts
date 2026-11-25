import { timelineStates, type TimelineKey } from "@/content/journey";

/**
 * Deterministic fixture for the "Try the sample journey" action.
 * It is never produced from user input and always carries the demo notice.
 */

export const SAMPLE_ID = "DEMO-VT-001";
export const SAMPLE_NOTICE = "Illustrative demo — not a live shipment.";

export type SampleShipment = {
  id: string;
  notice: string;
  service: string;
  from: string;
  to: string;
  currentKey: TimelineKey;
  states: { key: TimelineKey; label: string; note: string }[];
};

const notes: Record<TimelineKey, string> = {
  booked: "Shipment details confirmed",
  "picked-up": "Collected from the sender",
  "at-hub": "Sorted and prepared for dispatch",
  "in-transit": "On the way to the destination",
  delivered: "Handed over to the recipient",
};

export const sampleShipment: SampleShipment = {
  id: SAMPLE_ID,
  notice: SAMPLE_NOTICE,
  service: "Express Freight (sample)",
  from: "Sender’s doorstep",
  to: "Recipient’s doorstep",
  currentKey: "in-transit",
  states: timelineStates.map((s) => ({ ...s, note: notes[s.key] })),
};
