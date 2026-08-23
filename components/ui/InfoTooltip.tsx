"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small tap/click-to-reveal explainer, used to caption stat cards without cluttering the layout. */
export function InfoTooltip({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        onBlur={() => setOpen(false)}
        className="text-zinc-600 hover:text-zinc-400 transition-colors"
        aria-label="What is this?"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-20 top-5 left-0 w-44 sm:w-52 max-w-[70vw] rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-[11px] leading-snug text-zinc-300 shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
