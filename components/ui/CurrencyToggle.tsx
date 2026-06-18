"use client";

import { useCurrency, type Currency } from "@/lib/currency-context";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function CurrencyButtons({
  value,
  onChange,
  activeClass,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
  activeClass: (c: Currency) => string;
}) {
  return (
    <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
      {(["USDT", "INR"] as Currency[]).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            "px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all",
            value === c ? activeClass(c) : "text-zinc-600 hover:text-zinc-400"
          )}
        >
          {c === "INR" ? "₹" : "$"}{c}
        </button>
      ))}
    </div>
  );
}

export function CurrencyToggle({ className }: { className?: string }) {
  const { displayCurrency, baseCurrency, setDisplayCurrency, setBaseCurrency, rate, loading } = useCurrency();

  const bulkUpdate = async (c: Currency) => {
    setBaseCurrency(c);
    fetch("/api/settings/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: c }),
    }).catch(() => {});
  };

  return (
    <div className={cn("w-full sm:w-auto", className)}>
      {/* Mobile: compact 2-row grid */}
      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-2 items-center sm:hidden bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
        <span className="text-[10px] text-zinc-500">Trades in</span>
        <CurrencyButtons
          value={baseCurrency}
          onChange={bulkUpdate}
          activeClass={(c) => (c === "INR" ? "bg-orange-700 text-white" : "bg-blue-700 text-white")}
        />
        <span className="text-[10px] text-zinc-500">Show as</span>
        <CurrencyButtons
          value={displayCurrency}
          onChange={setDisplayCurrency}
          activeClass={(c) => (c === "INR" ? "bg-orange-600 text-white" : "bg-indigo-600 text-white")}
        />
        <div className="col-span-2 flex items-center justify-center gap-1 text-[10px] text-zinc-600 pt-0.5">
          {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
          <span>1$ = {rate.toFixed(1)}₹</span>
        </div>
      </div>

      {/* Desktop: inline row */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-600 whitespace-nowrap">Trades in:</span>
          <CurrencyButtons
            value={baseCurrency}
            onChange={bulkUpdate}
            activeClass={(c) => (c === "INR" ? "bg-orange-700 text-white" : "bg-blue-700 text-white")}
          />
        </div>
        <span className="text-zinc-700 text-xs">→</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-600 whitespace-nowrap">Show as:</span>
          <CurrencyButtons
            value={displayCurrency}
            onChange={setDisplayCurrency}
            activeClass={(c) => (c === "INR" ? "bg-orange-600 text-white" : "bg-indigo-600 text-white")}
          />
        </div>
        <div className="flex items-center gap-1 text-[11px] text-zinc-600">
          {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
          <span>1$={rate.toFixed(1)}₹</span>
        </div>
      </div>
    </div>
  );
}
