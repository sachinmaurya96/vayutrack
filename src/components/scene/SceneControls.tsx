"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useScene } from "./store";

/** Reset View and Pause Motion, shared by every scene. */
export function SceneControls({ className = "", onReset, showReset = true }: { className?: string; onReset?: () => void; showReset?: boolean }) {
  const paused = useScene((s) => s.userPaused);
  const reduced = useScene((s) => s.reducedMotion);
  const setPaused = useScene((s) => s.setPaused);
  const resetView = useScene((s) => s.resetView);
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showReset && (
        <button
          type="button"
          onClick={() => {
            resetView();
            onReset?.();
          }}
          className="btn btn-secondary !min-h-12 !px-4 text-[0.9375rem] shadow-[var(--shadow-soft)]"
        >
          <RotateCcw aria-hidden className="size-4" /> Reset view
        </button>
      )}
      <button
        type="button"
        aria-pressed={reduced ? true : paused}
        disabled={reduced}
        onClick={() => setPaused(!paused)}
        className="btn btn-secondary !min-h-12 !px-4 text-[0.9375rem] shadow-[var(--shadow-soft)] disabled:cursor-not-allowed disabled:opacity-80"
      >
        {reduced ? (
          <>
            <Pause aria-hidden className="size-4" /> Motion reduced
          </>
        ) : paused ? (
          <>
            <Play aria-hidden className="size-4" /> Play motion
          </>
        ) : (
          <>
            <Pause aria-hidden className="size-4" /> Pause motion
          </>
        )}
      </button>
    </div>
  );
}

/** Mirrors the pause state onto <html> so CSS ambient animations stop too. */
export function MotionClassSync() {
  const paused = useScene((s) => s.userPaused);
  useEffect(() => {
    document.documentElement.classList.toggle("motion-paused", paused);
  }, [paused]);
  return null;
}
