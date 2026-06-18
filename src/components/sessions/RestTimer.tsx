"use client";

import { useEffect, useState } from "react";

const PRESETS = [60, 90, 120, 180];

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Geeft een trilsignaal + korte piep wanneer de rusttijd voorbij is. */
function notifyDone() {
  navigator.vibrate?.([200, 100, 200]);
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => ctx.close();
  } catch {
    // Audio niet beschikbaar — trilsignaal is voldoende.
  }
}

/** Rust-timer voor tussen de sets. Beheert z'n eigen aftel-state. */
export function RestTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining == null) return;
    const id = window.setTimeout(() => {
      if (remaining <= 1) {
        setRemaining(0);
        setRunning(false);
        notifyDone();
      } else {
        setRemaining(remaining - 1);
      }
    }, 1000);
    return () => window.clearTimeout(id);
  }, [running, remaining]);

  function start(seconds: number) {
    setRemaining(seconds);
    setRunning(true);
  }

  const btn =
    "rounded-md border border-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-40";

  if (remaining == null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500">Rust</span>
        {PRESETS.map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => start(seconds)}
            className={btn}
          >
            {format(seconds)}
          </button>
        ))}
      </div>
    );
  }

  const done = remaining <= 0;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`min-w-[3.25rem] text-lg font-semibold tabular-nums ${
          done ? "text-emerald-400" : "text-neutral-100"
        }`}
      >
        {format(remaining)}
      </span>
      <button
        type="button"
        onClick={() => setRemaining((r) => (r ?? 0) + 30)}
        className={btn}
      >
        +30s
      </button>
      {!done && (
        <button
          type="button"
          onClick={() => setRunning((p) => !p)}
          className={btn}
        >
          {running ? "Pauze" : "Hervat"}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setRunning(false);
          setRemaining(null);
        }}
        className={btn}
      >
        {done ? "Klaar" : "Stop"}
      </button>
    </div>
  );
}
