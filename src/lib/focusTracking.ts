/** Scrolls to the hero tracking widget and focuses its input. */
export function focusTrackingInput() {
  const input = document.getElementById("awb") as HTMLInputElement | null;
  if (!input) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  input.closest("[data-tracking]")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  input.focus({ preventScroll: true });
  return true;
}
