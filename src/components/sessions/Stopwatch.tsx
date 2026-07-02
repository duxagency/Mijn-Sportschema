"use client";

import { useEffect, useRef, useState } from "react";

function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Kleine stopwatch bij een tijd-veld. Loopt op en vult bij "Stop" de mm:ss-tijd
 * in via onStop. Alternatief voor handmatig typen.
 */
export function Stopwatch({ onStop }: { onStop: (value: string) => void }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds(Math.round((Date.now() - startRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  function start() {
    startRef.current = Date.now();
    setSeconds(0);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    onStop(clock(seconds));
    setSeconds(0);
  }

  if (!running) {
    return (
      <button
        type="button"
        onClick={start}
        className="self-start text-xs text-neutral-400 transition hover:text-neutral-200"
      >
        ⏱ Stopwatch
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="tabular-nums text-sm font-medium text-emerald-400">
        {clock(seconds)}
      </span>
      <button
        type="button"
        onClick={stop}
        className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-800"
      >
        Stop &amp; invullen
      </button>
    </div>
  );
}
