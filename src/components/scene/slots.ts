import type { SceneView } from "./store";

/**
 * Registry of the DOM "slots" the single canvas can occupy, plus how much
 * each slot wants the camera target nudged to keep clear of overlaid panels.
 */

export type SlotEntry = {
  view: SceneView;
  root: HTMLElement;
  mount: HTMLElement;
  /** Fractions of frame width/height; +x moves the subject right, +y moves it down. */
  offset: () => readonly [number, number];
  /** Visible area in px², updated by an IntersectionObserver. */
  visibleArea: number;
  /** Shows a captured still of this slot's composition; resolves once decoded. */
  showPoster: (url: string) => Promise<void>;
};

const slots = new Map<SceneView, SlotEntry>();
const listeners = new Set<() => void>();

export function registerSlot(entry: SlotEntry) {
  slots.set(entry.view, entry);
  notify();
  return () => {
    // A slot that leaves (page change, hidden route) is no longer visible anywhere.
    entry.visibleArea = 0;
    if (slots.get(entry.view) === entry) slots.delete(entry.view);
    notify();
  };
}

export function updateSlotVisibility(view: SceneView, area: number) {
  const s = slots.get(view);
  if (!s || s.visibleArea === area) return;
  s.visibleArea = area;
  notify();
}

export function getSlot(view: SceneView) {
  return slots.get(view);
}

export function allSlots() {
  return [...slots.values()];
}

export function getSlotOffset(view: SceneView): readonly [number, number] {
  return slots.get(view)?.offset() ?? [0, 0];
}

export function onSlotsChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((l) => l());
}
