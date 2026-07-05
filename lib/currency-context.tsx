"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { convertTradeAmount, tradeCurrencyOf, type TradeCurrency } from "@/lib/trade-currency";

export type Currency = TradeCurrency;

interface CurrencyContextValue {
  displayCurrency: Currency;
  baseCurrency: Currency;
  rate: number;
  rateUpdatedAt: number | null;
  mixedCurrencies: boolean;
  setDisplayCurrency: (c: Currency) => void;
  setBaseCurrency: (c: Currency) => void;
  /** Format amount already in display currency (e.g. server-normalized stats). */
  fmtDisplay: (amount: number) => string;
  /** Convert amount from a trade's stored currency (or baseCurrency) to display currency. */
  convert: (amount: number, fromCurrency?: Currency | string | null) => number;
  fmt: (amount: number, fromCurrency?: Currency | string | null) => string;
  symbol: string;
  loading: boolean;
  analyticsQuery: () => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  displayCurrency: "USDT",
  baseCurrency: "USDT",
  rate: 84.5,
  rateUpdatedAt: null,
  mixedCurrencies: false,
  setDisplayCurrency: () => {},
  setBaseCurrency: () => {},
  convert: (v) => v,
  fmt: (v) => `$${v.toFixed(2)}`,
  fmtDisplay: (v) => `$${v.toFixed(2)}`,
  symbol: "$",
  loading: false,
  analyticsQuery: () => "",
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>("USDT");
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>("USDT");
  const [mixedCurrencies, setMixedCurrencies] = useState(false);
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

    fetch("/api/settings/currency")
      .then((r) => r.json())
      .then((d) => {
        if (d.mixed) setMixedCurrencies(true);
        if (!manuallySet && d.detected) {
          setBaseCurrencyState(d.detected);
          localStorage.setItem("base_currency", d.detected);
          if (!savedDisplay) {
            setDisplayCurrencyState(d.detected);
            localStorage.setItem("display_currency", d.detected);
          }
        }
      })
      .catch(() => {});
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

  const convert = useCallback((amount: number, fromCurrency?: Currency | string | null): number => {
    const from: TradeCurrency = fromCurrency
      ? tradeCurrencyOf({ currency: String(fromCurrency) })
      : baseCurrency;
    return convertTradeAmount(amount, from, displayCurrency, rate);
  }, [baseCurrency, displayCurrency, rate]);

  const fmtDisplay = useCallback((amount: number): string => {
    if (displayCurrency === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR",
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD",
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount);
  }, [displayCurrency]);

  const fmt = useCallback((amount: number, fromCurrency?: Currency | string | null): string => {
    const val = convert(amount, fromCurrency);
    return fmtDisplay(val);
  }, [convert, fmtDisplay]);

  const analyticsQuery = useCallback(
    () => `currency=${displayCurrency}&rate=${rate}`,
    [displayCurrency, rate]
  );

  return (
    <CurrencyContext.Provider value={{
      displayCurrency, baseCurrency, rate, rateUpdatedAt, mixedCurrencies,
      setDisplayCurrency, setBaseCurrency, convert, fmt, fmtDisplay,
      symbol: displayCurrency === "INR" ? "₹" : "$",
      loading, analyticsQuery,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
