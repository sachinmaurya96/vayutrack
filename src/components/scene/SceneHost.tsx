"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DESKTOP_SCENE_QUERY, detectSceneCapability } from "./capability";
import { getCanvasBridge, onCanvasBridge } from "./canvas/engine";
import { allSlots, onSlotsChange, type SlotEntry } from "./slots";
import { compositionKey, useScene } from "./store";

const LogisticsCanvas = dynamic(() => import("./canvas/LogisticsCanvas"), { ssr: false });

class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function createHost() {
  const div = document.createElement("div");
  div.className = "absolute inset-0 transition-opacity duration-500";
  div.style.opacity = "0";
  return div;
}

function revealHost(el: HTMLElement) {
  el.style.opacity = "1";
}

function detachHost(el: HTMLElement) {
  el.style.opacity = "0";
  el.remove();
}

/**
 * Owns the one WebGL canvas on the page. It loads after the essential HTML,
 * lives in whichever scene slot is most visible, leaves a captured still
 * behind when it moves, and stops rendering when nothing is on screen.
 */
export function SceneHost() {
  const renderMode = useScene((s) => s.renderMode);
  const [host] = useState<HTMLDivElement | null>(() => (typeof document === "undefined" ? null : createHost()));
  const [active, setActive] = useState(false);
  const current = useRef<SlotEntry | null>(null);
  const posterKeys = useRef(new Map<string, string>());
  const busy = useRef(false);
  const pending = useRef(false);

  // Reduced-motion preference.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => useScene.getState().setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Decide on WebGL once a page has a scene slot and the browser is idle;
  // revisit if the viewport crosses the breakpoint.
  useEffect(() => {
    const decide = () => {
      const cap = detectSceneCapability();
      const { setRenderMode } = useScene.getState();
      if (!cap.ok) {
        setRenderMode("fallback", cap.reason);
        return;
      }
      setRenderMode("webgl");
    };
    const idle = "requestIdleCallback" in window;
    let id = 0;
    let scheduled = false;
    const scheduleDecide = () => {
      if (scheduled || allSlots().length === 0) return;
      scheduled = true;
      id = idle ? window.requestIdleCallback(decide, { timeout: 1200 }) : window.setTimeout(decide, 400);
    };
    const offSlots = onSlotsChange(scheduleDecide);
    scheduleDecide();
    const mq = window.matchMedia(DESKTOP_SCENE_QUERY);
    const onChange = () => {
      const { renderMode: mode, fallbackReason } = useScene.getState();
      if (mode === "webgl" && !mq.matches && !location.search.includes("scene=3d")) useScene.getState().setRenderMode("fallback", "small-screen");
      else if (mode === "fallback" && fallbackReason === "small-screen" && mq.matches) decide();
    };
    mq.addEventListener("change", onChange);
    return () => {
      offSlots();
      mq.removeEventListener("change", onChange);
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  // Leaving WebGL (context loss, error, small screen): detach the canvas host.
  useEffect(() => {
    if (renderMode === "webgl" || !host) return;
    detachHost(host);
    current.current = null;
    posterKeys.current.clear();
    useScene.getState().setActiveView(null);
  }, [renderMode, host]);

  const capturePoster = useCallback(async (slot: SlotEntry) => {
    const bridge = getCanvasBridge();
    if (!bridge) return;
    const key = compositionKey(slot.view, useScene.getState());
    if (posterKeys.current.get(slot.view) === key) return;
    const url = bridge.capture(slot.view, slot.mount.clientWidth, slot.mount.clientHeight);
    if (!url) return;
    posterKeys.current.set(slot.view, key);
    await slot.showPoster(url);
  }, []);

  const evaluate = useCallback(async () => {
    if (!host) return;
    if (busy.current) {
      // A capture is in flight; the running pass loops again so no visibility change is lost.
      pending.current = true;
      return;
    }
    busy.current = true;
    try {
      do {
        pending.current = false;
        const slots = allSlots();
        let best: SlotEntry | null = null;
        for (const s of slots) if (s.visibleArea > 0 && (!best || s.visibleArea > best.visibleArea)) best = s;
        // The slot holding the canvas may have been unregistered by a page change.
        const cur = current.current && slots.includes(current.current) ? current.current : null;
        // Small hysteresis so the canvas does not flip between two half-visible slots.
        if (best && cur && best !== cur && cur.visibleArea > 0 && best.visibleArea < cur.visibleArea * 1.15) best = cur;

        if (best && best !== cur) {
          if (cur && getCanvasBridge()) {
            posterKeys.current.delete(cur.view);
            await capturePoster(cur);
          }
          best.mount.appendChild(host);
          current.current = best;
          useScene.getState().setActiveView(best.view);
          getCanvasBridge()?.present(best.view, best.mount.clientWidth, best.mount.clientHeight);
        }
        setActive(!!best && !document.hidden);

        // Keep stills of other visible slots in step with their state.
        for (const s of slots) if (s !== current.current && s.visibleArea > 0) await capturePoster(s);
      } while (pending.current);
    } finally {
      busy.current = false;
    }
  }, [host, capturePoster]);

  useEffect(() => {
    if (!host || renderMode !== "webgl") return;
    // First placement: the most visible slot, or the hero.
    const first = [...allSlots()].sort((a, b) => b.visibleArea - a.visibleArea)[0];
    if (first && !host.parentElement) {
      first.mount.appendChild(host);
      current.current = first;
      useScene.getState().setActiveView(first.view);
    }
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        void evaluate();
      });
    };
    const offSlots = onSlotsChange(schedule);
    const offBridge = onCanvasBridge(schedule);
    const offStore = useScene.subscribe((s, prev) => {
      if (s.heroSelected !== prev.heroSelected || s.serviceMode !== prev.serviceMode || s.journeyStage !== prev.journeyStage || s.resetCount !== prev.resetCount) schedule();
    });
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      offSlots();
      offBridge();
      offStore();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [host, evaluate, renderMode]);

  const onFirstFrame = useCallback(() => {
    if (host) revealHost(host);
  }, [host]);

  const fail = useCallback((reason: "context-lost" | "error") => {
    useScene.getState().setRenderMode("fallback", reason);
  }, []);

  if (renderMode !== "webgl" || !host) return null;
  return createPortal(
    <CanvasBoundary onError={() => fail("error")}>
      <LogisticsCanvas active={active} onContextLost={() => fail("context-lost")} onFirstFrame={onFirstFrame} />
    </CanvasBoundary>,
    host,
  );
}
