"use client";

import { ArrowRight, CircleAlert, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { timelineStates } from "@/content/journey";
import { useScene } from "@/components/scene/store";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";
import { getTrackingAdapter, type TrackingResult } from "@/lib/tracking/adapter";
import { sampleShipment } from "@/lib/tracking/sample";
import { validateTrackingNumber } from "@/lib/tracking/validate";
import { links } from "@/content/site";
import { AppLink } from "@/components/ui/AppLink";

type Status =
  | { kind: "idle" }
  | { kind: "unavailable"; awb: string }
  | { kind: "loading"; awb: string }
  | { kind: "not-found"; awb: string }
  | { kind: "error"; awb: string; message: string }
  | { kind: "found"; result: TrackingResult };

const sampleIndex = timelineStates.findIndex((s) => s.key === sampleShipment.currentKey);

export function TrackingWidget() {
  const adapter = useMemo(() => getTrackingAdapter(), []);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [sampleOpen, setSampleOpen] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const select = useScene((s) => s.select);

  useEffect(() => () => abort.current?.abort(), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const check = validateTrackingNumber(value);
    if (!check.ok) {
      setError(check.message);
      setStatus({ kind: "idle" });
      input.current?.focus();
      return;
    }
    setError(null);
    if (adapter.mode === "unavailable") {
      setStatus({ kind: "unavailable", awb: check.value });
      return;
    }
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setStatus({ kind: "loading", awb: check.value });
    try {
      const outcome = await adapter.lookup(check.value, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (outcome.kind === "found") setStatus({ kind: "found", result: outcome.result });
      else if (outcome.kind === "not-found") setStatus({ kind: "not-found", awb: check.value });
      else setStatus({ kind: "error", awb: check.value, message: outcome.message });
    } catch {
      if (!ctrl.signal.aborted) setStatus({ kind: "error", awb: check.value, message: "Something went wrong while checking this number." });
    }
  }

  function openSample() {
    setSampleOpen(true);
    select("parcel");
  }

  const errorId = error ? "awb-error" : undefined;

  return (
    <div id="track" data-tracking className="panel scroll-mt-28 p-5 sm:p-6">
      <form noValidate onSubmit={submit} aria-busy={status.kind === "loading"}>
        <label htmlFor="awb" className="block text-[1.125rem] font-extrabold tracking-[-0.01em] text-navy">
          Track your shipment
        </label>
        <p id="awb-hint" className="mt-0.5 text-[0.9375rem] text-muted">
          Enter your AWB or tracking number.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted" />
            <input
              ref={input}
              id="awb"
              name="awb"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="AWB or tracking number"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              aria-describedby={["awb-hint", errorId].filter(Boolean).join(" ")}
              aria-invalid={!!error}
              className={`h-12 w-full rounded-full border bg-white pl-11 pr-4 font-semibold tracking-wide text-ink placeholder:font-medium placeholder:tracking-normal placeholder:text-muted focus-visible:outline-offset-1 ${
                error ? "border-error" : "border-line-strong"
              }`}
            />
          </div>
          <button type="submit" className="btn btn-blue shrink-0" disabled={status.kind === "loading"}>
            {status.kind === "loading" ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
            Track Shipment
          </button>
        </div>
        {error && (
          <p id="awb-error" role="alert" className="mt-2 flex items-start gap-1.5 text-[0.9375rem] font-semibold text-error">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </form>

      <div role="status" aria-live="polite">
        {status.kind === "unavailable" && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="font-bold text-navy">Live tracking isn’t connected yet</p>
            <p className="mt-1 text-[0.9375rem] text-ink">
              No status was looked up for <span className="font-mono font-bold">{status.awb}</span>. Use the sample journey below to see how shipment updates appear, or contact our team for help with this shipment.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={openSample} className="btn btn-blue">
                Try the sample journey <ArrowRight aria-hidden className="size-4" />
              </button>
              <AppLink href={links.contact} className="btn btn-secondary">
                Contact our team
              </AppLink>
            </div>
          </div>
        )}
        {status.kind === "loading" && <p className="mt-4 text-[0.9375rem] font-semibold text-muted">Checking {status.awb}…</p>}
        {status.kind === "not-found" && (
          <div className="mt-4 rounded-2xl border border-line bg-bg p-4">
            <p className="font-bold text-navy">We couldn’t find {status.awb}</p>
            <p className="mt-1 text-[0.9375rem] text-ink">Check the number and try again, or contact our team for help.</p>
          </div>
        )}
        {status.kind === "error" && (
          <div className="mt-4 rounded-2xl border border-error/30 bg-error-bg p-4">
            <p className="font-bold text-error">Tracking is unavailable right now</p>
            <p className="mt-1 text-[0.9375rem] text-ink">{status.message} Please try again, or contact our team for help.</p>
            <AppLink href={links.contact} className="link-arrow">
              Contact our team <ArrowRight aria-hidden className="size-4" />
            </AppLink>
          </div>
        )}
        {status.kind === "found" && (
          <div className="mt-4 rounded-2xl border border-line bg-white p-4">
            <p className="font-mono font-bold text-navy">{status.result.awb}</p>
            <p className="font-bold text-success">{status.result.status}</p>
            <ol className="mt-2 space-y-1.5 text-[0.9375rem]">
              {status.result.events.map((ev, i) => (
                <li key={i} className="text-ink">
                  <span className="font-semibold">{ev.status}</span>
                  {ev.location && <span className="text-muted"> · {ev.location}</span>}
                  {ev.time && <span className="text-muted"> · {ev.time}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3">
        <button type="button" onClick={openSample} aria-expanded={sampleOpen} aria-controls="sample-result" className="link-arrow">
          Try the sample journey <ArrowRight aria-hidden className="size-4" />
        </button>
        <span className="text-[0.875rem] text-muted">Sample uses demo data</span>
      </div>

      <div id="sample-result" hidden={!sampleOpen}>
        {sampleOpen && (
          <div className="mt-3 rounded-2xl border border-line bg-bg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[1rem] font-bold text-navy">{sampleShipment.id}</p>
                <p className="text-[0.875rem] text-muted">
                  {sampleShipment.service} · {sampleShipment.from} → {sampleShipment.to}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSampleOpen(false)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy"
                aria-label="Close sample journey"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
            <p className="demo-badge mt-3">{sampleShipment.notice}</p>
            <ShipmentTimeline className="mt-4" currentIndex={sampleIndex} label="Sample shipment DEMO-VT-001 status" />
          </div>
        )}
      </div>
    </div>
  );
}
