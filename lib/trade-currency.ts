/** Per-trade currency helpers — USD from broker sheets maps to USDT storage. */

export type TradeCurrency = "USDT" | "INR";

export function normalizeTradeCurrency(raw: string | null | undefined): TradeCurrency {
  if (!raw) return "USDT";
  const u = raw.toUpperCase().trim();
  if (u === "INR" || u === "₹" || u === "RS" || u.includes("INR") || u.includes("RUPEE")) {
    return "INR";
  }
  // USD, USDT, $, EUR — binary options USD account
  return "USDT";
}

export function convertTradeAmount(
  amount: number,
  from: TradeCurrency,
  to: TradeCurrency,
  rate: number
): number {
  if (from === to) return amount;
  if (from === "USDT" && to === "INR") return amount * rate;
  if (from === "INR" && to === "USDT") return amount / rate;
  return amount;
}

export function tradeCurrencyOf(trade: { currency?: string | null }): TradeCurrency {
  return normalizeTradeCurrency(trade.currency);
}

export function convertTradePnl(
  trade: { pnl: number | null; fees?: number | null; currency?: string | null },
  to: TradeCurrency,
  rate: number
): { pnl: number | null; fees: number } {
  const from = tradeCurrencyOf(trade);
  return {
    pnl: trade.pnl !== null ? convertTradeAmount(trade.pnl, from, to, rate) : null,
    fees: convertTradeAmount(trade.fees ?? 0, from, to, rate),
  };
}

/** Normalize all monetary fields on a trade clone for analytics aggregation. */
export function normalizeTradeMonetary<T extends { pnl: number | null; fees?: number | null; currency?: string | null; entryPrice?: number; exitPrice?: number | null }>(
  trade: T,
  to: TradeCurrency,
  rate: number
): T {
  const from = tradeCurrencyOf(trade);
  if (from === to) return trade;
  return {
    ...trade,
    pnl: trade.pnl !== null ? convertTradeAmount(trade.pnl, from, to, rate) : null,
    fees: trade.fees != null ? convertTradeAmount(trade.fees, from, to, rate) : trade.fees,
    entryPrice: trade.entryPrice != null ? convertTradeAmount(trade.entryPrice, from, to, rate) : trade.entryPrice,
    exitPrice: trade.exitPrice != null ? convertTradeAmount(trade.exitPrice!, from, to, rate) : trade.exitPrice,
  };
}
