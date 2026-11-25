import { SAMPLE_ID } from "./sample";

export type TrackingValidation =
  | { ok: true; value: string }
  | { ok: false; reason: "empty" | "format" | "sample"; message: string };

/**
 * Local sanity check only. The real AWB format has not been documented, so
 * this accepts 6–30 letters, numbers and dashes. Tighten once confirmed.
 */
const PATTERN = /^[A-Z0-9](?:[A-Z0-9-]{4,28})[A-Z0-9]$/;

export function normalizeTrackingInput(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

export function validateTrackingNumber(raw: string): TrackingValidation {
  const value = normalizeTrackingInput(raw);
  if (!value) {
    return { ok: false, reason: "empty", message: "Enter your AWB or tracking number." };
  }
  if (value === SAMPLE_ID) {
    return {
      ok: false,
      reason: "sample",
      message: `${SAMPLE_ID} is the sample ID. Use “Try the sample journey” to view the illustrative demo.`,
    };
  }
  if (!PATTERN.test(value)) {
    return {
      ok: false,
      reason: "format",
      message: "Tracking numbers use 6–30 letters, numbers or dashes. Check the number and try again.",
    };
  }
  return { ok: true, value };
}
