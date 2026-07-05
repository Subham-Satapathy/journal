"use client";

import { useCurrency, type Currency } from "@/lib/currency-context";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function CurrencyToggle({ className }: { className?: string }) {
  const { displayCurrency, setDisplayCurrency, canToggleDisplayCurrency, allowedDisplayCurrencies, rate, loading, mixedCurrencies } = useCurrency();
  const isInr = displayCurrency === "INR";

  return (
    <div className={cn("w-full sm:w-auto", className)}>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 sm:bg-transparent sm:border-0 sm:p-0">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-[10px] sm:text-[11px] text-zinc-500">{canToggleDisplayCurrency ? "Show as" : "Display"}</span>
          {canToggleDisplayCurrency ? (
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {(allowedDisplayCurrencies as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setDisplayCurrency(c)}
                  className={cn(
                    "px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all",
                    displayCurrency === c
                      ? c === "INR"
                        ? "bg-orange-600 text-white"
                        : "bg-indigo-600 text-white"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {c === "INR" ? "₹ INR" : "$ USD"}
                </button>
              ))}
            </div>
          ) : (
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold",
                isInr
                  ? "border-orange-500/30 bg-orange-600/20 text-orange-300"
                  : "border-indigo-500/30 bg-indigo-600/20 text-indigo-300"
              )}
            >
              {isInr ? "₹ INR" : "$ USD"}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] text-zinc-600">
          {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
          <span>1 USD = INR {rate.toFixed(1)}</span>
          {mixedCurrencies && (
            <span className="text-zinc-700 hidden sm:inline">· mixed USD/INR trades auto-converted</span>
          )}
        </div>
      </div>
    </div>
  );
}
