"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Currency = "USDT" | "INR";

interface CurrencyContextValue {
  displayCurrency: Currency;       // What the user wants to see
  baseCurrency: Currency;          // What the trades are stored in
  rate: number;                    // 1 USDT = rate INR (live)
  rateUpdatedAt: number | null;
  setDisplayCurrency: (c: Currency) => void;
  setBaseCurrency: (c: Currency) => void;
  convert: (amount: number) => number;   // base → display
  fmt: (amount: number) => string;
  symbol: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  displayCurrency: "USDT",
  baseCurrency: "USDT",
  rate: 84.5,
  rateUpdatedAt: null,
  setDisplayCurrency: () => {},
  setBaseCurrency: () => {},
  convert: (v) => v,
  fmt: (v) => `$${v.toFixed(2)}`,
  symbol: "$",
  loading: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>("USDT");
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>("USDT");
  const [rate, setRate] = useState(84.5);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedDisplay = localStorage.getItem("display_currency") as Currency | null;
    const savedBase = localStorage.getItem("base_currency") as Currency | null;
    const manuallySet = localStorage.getItem("currency_manually_set") === "1";

    if (savedDisplay === "INR" || savedDisplay === "USDT") {
      setDisplayCurrencyState(savedDisplay);
    }
    if (savedBase === "INR" || savedBase === "USDT") {
      setBaseCurrencyState(savedBase);
    }

    // Always auto-detect unless user manually set it
    if (!manuallySet) {
      fetch("/api/settings/currency")
        .then((r) => r.json())
        .then((d) => {
          if (d.detected) {
            setBaseCurrencyState(d.detected);
            localStorage.setItem("base_currency", d.detected);
            if (!savedDisplay || !manuallySet) {
              setDisplayCurrencyState(d.detected);
              localStorage.setItem("display_currency", d.detected);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const fetchRate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exchange-rate");
      const data = await res.json();
      if (data.rate) {
        setRate(data.rate);
        setRateUpdatedAt(data.fetchedAt ?? Date.now());
      }
    } catch { /* use default */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  const setDisplayCurrency = (c: Currency) => {
    setDisplayCurrencyState(c);
    localStorage.setItem("display_currency", c);
    localStorage.setItem("currency_manually_set", "1");
    fetchRate();
  };

  const setBaseCurrency = (c: Currency) => {
    setBaseCurrencyState(c);
    localStorage.setItem("base_currency", c);
    localStorage.setItem("currency_manually_set", "1");
  };

  // Convert base → display
  // base=INR, display=INR  → ×1
  // base=INR, display=USDT → ÷rate
  // base=USDT, display=USDT → ×1
  // base=USDT, display=INR  → ×rate
  const convert = useCallback((amount: number): number => {
    if (baseCurrency === displayCurrency) return amount;
    if (baseCurrency === "INR" && displayCurrency === "USDT") return amount / rate;
    if (baseCurrency === "USDT" && displayCurrency === "INR") return amount * rate;
    return amount;
  }, [baseCurrency, displayCurrency, rate]);

  const fmt = useCallback((amount: number): string => {
    const val = convert(amount);
    if (displayCurrency === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR",
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(val);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD",
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(val);
  }, [convert, displayCurrency]);

  return (
    <CurrencyContext.Provider value={{
      displayCurrency, baseCurrency, rate, rateUpdatedAt,
      setDisplayCurrency, setBaseCurrency, convert, fmt,
      symbol: displayCurrency === "INR" ? "₹" : "$",
      loading,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
