import { links } from "./site";

export type SceneObjectId = "truck" | "hub" | "parcel" | "destination";

export type SceneObjectInfo = {
  id: SceneObjectId;
  /** Short label for buttons and the in-scene tag. */
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  action: { label: string; href: string };
  /** Parcel shows the illustrative sample timeline. */
  showsSample?: boolean;
};

export const sceneIntro = {
  eyebrow: "Illustrative demo",
  title: "Explore a delivery journey",
  body: "Select the truck, hub, parcel or destination to see how a shipment moves from pickup to delivery.",
} as const;

export const sceneObjects: SceneObjectInfo[] = [
  {
    id: "truck",
    label: "Truck",
    eyebrow: "Express Freight",
    title: "Road freight that keeps shipments moving",
    body: "Express Freight carries parcels and business shipments by road, coordinated from pickup to delivery with tracking along the way.",
    action: { label: "Explore Express Freight", href: links.express },
  },
  {
    id: "hub",
    label: "Hub",
    eyebrow: "Preparation & handling",
    title: "Organized before it moves on",
    body: "At the hub, shipments are sorted, handled with care and prepared for dispatch to the next leg of the journey.",
    action: { label: "See how it works", href: links.howItWorks },
  },
  {
    id: "parcel",
    label: "Parcel",
    eyebrow: "Shipment progress",
    title: "Sample parcel DEMO-VT-001",
    body: "Every shipment carries a tracking number, so you can follow its progress from booking to delivery.",
    action: { label: "Track a real shipment", href: links.track },
    showsSample: true,
  },
  {
    id: "destination",
    label: "Destination",
    eyebrow: "Final delivery",
    title: "The final handoff",
    body: "The journey ends with delivery to the recipient, completing the route from one doorstep to another.",
    action: { label: "Plan a shipment", href: links.contact },
  },
];

export const sceneObjectById = Object.fromEntries(sceneObjects.map((o) => [o.id, o])) as Record<
  SceneObjectId,
  SceneObjectInfo
>;
