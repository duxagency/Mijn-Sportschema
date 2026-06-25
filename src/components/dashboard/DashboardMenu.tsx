"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/workouts", label: "Mijn schema's" },
  { href: "/exercises", label: "Oefeningenbibliotheek" },
  { href: "/sessions", label: "Mijn trainingen" },
  { href: "/progress", label: "Voortgang" },
  { href: "/records", label: "Records" },
];

export function DashboardMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "block px-4 py-2.5 text-left text-sm text-neutral-200 transition hover:bg-neutral-800";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-lg border border-neutral-800 text-neutral-200 transition hover:bg-neutral-800"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-5"
          aria-hidden="true"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl shadow-black/40">
          <nav className="flex flex-col py-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-1 border-t border-neutral-800" />

            <Link href="/account" onClick={() => setOpen(false)} className={itemClass}>
              Account
            </Link>
            <form action={signOut}>
              <button type="submit" className={`${itemClass} w-full text-neutral-400`}>
                Uitloggen
              </button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
