import type { NextRequest } from "next/server";
import type { TradeCurrency } from "@/lib/trade-currency";

export type SupportedCountryCode = "IN" | "OTHER";

export function getRequestCountryCode(req: NextRequest): SupportedCountryCode {
  const raw =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    process.env.DEFAULT_COUNTRY_CODE ||
    "";
  const countryCode = raw.trim().toUpperCase();
  return countryCode === "IN" ? "IN" : "OTHER";
}

export function getGeoDisplayCurrency(req: NextRequest): TradeCurrency {
  return getRequestCountryCode(req) === "IN" ? "INR" : "USDT";
}

export function getAllowedDisplayCurrencies(req: NextRequest): TradeCurrency[] {
  return getRequestCountryCode(req) === "IN" ? ["USDT", "INR"] : ["USDT"];
}

export function normalizeRequestedDisplayCurrency(
  req: NextRequest,
  requestedCurrency: string | null | undefined
): TradeCurrency {
  const allowed = getAllowedDisplayCurrencies(req);
  if (requestedCurrency === "INR" || requestedCurrency === "USDT") {
    if (allowed.includes(requestedCurrency)) {
      return requestedCurrency;
    }
  }
  return getGeoDisplayCurrency(req);
}
