"use client";

import { useCurrency, type Currency } from "@/lib/currency-context";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function CurrencyToggle() {
  const { displayCurrency, baseCurrency, setDisplayCurrency, setBaseCurrency, rate, loading } = useCurrency();

  const bulkUpdate = async (c: Currency) => {
    setBaseCurrency(c);
    // Also update all DB trades to this currency (fire-and-forget)
    fetch("/api/settings/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: c }),
    }).catch(() => {});
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Base currency — what trades are stored as */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-zinc-600 whitespace-nowrap">Trades in:</span>
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {(["USDT", "INR"] as Currency[]).map((c) => (
            <button key={c} onClick={() => bulkUpdate(c)}
              className={cn("px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                baseCurrency === c
                  ? c === "INR" ? "bg-orange-700 text-white" : "bg-blue-700 text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              )}>
              {c === "INR" ? "₹" : "$"}{c}
            </button>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <span className="text-zinc-700 text-xs">→</span>

      {/* Display currency — what to show on screen */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-zinc-600 whitespace-nowrap">Show as:</span>
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {(["USDT", "INR"] as Currency[]).map((c) => (
            <button key={c} onClick={() => setDisplayCurrency(c)}
              className={cn("px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                displayCurrency === c
                  ? c === "INR" ? "bg-orange-600 text-white" : "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              )}>
              {c === "INR" ? "₹" : "$"}{c}
            </button>
          ))}
        </div>
      </div>

      {/* Live rate */}
      <div className="flex items-center gap-1 text-[11px] text-zinc-600">
        {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
        <span>1$={rate.toFixed(1)}₹</span>
      </div>
    </div>
  );
}
