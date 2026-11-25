import { links } from "@/content/site";

/**
 * Tracking integration boundary.
 *
 * No tracking API has been approved, so the default adapter is "handoff": the
 * widget validates locally and sends visitors to the existing tracking page.
 * It never fabricates shipment events.
 *
 * To connect an approved endpoint, set NEXT_PUBLIC_TRACKING_API_URL to a URL
 * template containing `{awb}`, e.g. https://api.example.com/v1/shipments/{awb}
 * and adapt `normalizeTrackingResponse` to the documented response shape.
 */

export type TrackingEvent = { status: string; location?: string; time?: string };
export type TrackingResult = { awb: string; status: string; events: TrackingEvent[] };

export type LookupOutcome =
  | { kind: "found"; result: TrackingResult }
  | { kind: "not-found" }
  | { kind: "error"; message: string };

export type TrackingAdapter =
  | { mode: "handoff"; trackingPageUrl: string }
  | {
      mode: "api";
      trackingPageUrl: string;
      lookup: (awb: string, signal: AbortSignal) => Promise<LookupOutcome>;
    };

export function getTrackingAdapter(): TrackingAdapter {
  const template = process.env.NEXT_PUBLIC_TRACKING_API_URL;
  if (!template || !template.includes("{awb}")) {
    return { mode: "handoff", trackingPageUrl: links.tracking };
  }
  return {
    mode: "api",
    trackingPageUrl: links.tracking,
    lookup: (awb, signal) => apiLookup(template, awb, signal),
  };
}

async function apiLookup(template: string, awb: string, signal: AbortSignal): Promise<LookupOutcome> {
  const url = template.replace("{awb}", encodeURIComponent(awb));
  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (error) {
    if (signal.aborted) throw error;
    return { kind: "error", message: "We couldn’t reach the tracking service." };
  }
  if (response.status === 404) return { kind: "not-found" };
  if (!response.ok) return { kind: "error", message: "The tracking service returned an error." };

  try {
    const result = normalizeTrackingResponse(await response.json(), awb);
    return result ? { kind: "found", result } : { kind: "not-found" };
  } catch {
    return { kind: "error", message: "The tracking response could not be read." };
  }
}

/**
 * Maps the approved API's JSON to the widget's shape. The expected structure
 * below is a placeholder contract: replace it with the documented response.
 */
export function normalizeTrackingResponse(data: unknown, awb: string): TrackingResult | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { status?: unknown; events?: unknown };
  if (typeof record.status !== "string" || !Array.isArray(record.events)) return null;
  const events = record.events
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map((e) => ({
      status: String(e.status ?? ""),
      location: typeof e.location === "string" ? e.location : undefined,
      time: typeof e.time === "string" ? e.time : undefined,
    }))
    .filter((e) => e.status);
  return { awb, status: record.status, events };
}
