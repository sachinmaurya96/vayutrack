"use client";

import { useSyncExternalStore } from "react";
import { bookingSteps } from "@/content/forms";
import { SchemaForm } from "@/components/forms/SchemaForm";

const noop = () => () => {};
const MODES = new Set(["express", "air", "ocean"]);

/** Booking form; `?service=air` on the URL pre-selects that service. */
export function BookingForm() {
  const service = useSyncExternalStore(
    noop,
    () => {
      const s = new URLSearchParams(window.location.search).get("service");
      return s && MODES.has(s) ? s : "";
    },
    () => "",
  );
  return (
    <SchemaForm
      key={service}
      form="booking"
      steps={bookingSteps}
      submitLabel="Submit booking request"
      emailSubject="Shipment booking request"
      noun="booking request"
      initialValues={service ? { service, is_liquid: "no" } : { is_liquid: "no" }}
    />
  );
}
