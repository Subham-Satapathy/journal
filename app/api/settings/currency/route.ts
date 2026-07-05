import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeTradeCurrency, type TradeCurrency } from "@/lib/trade-currency";
import { requireUser } from "@/lib/api-auth";
import {
  getAllowedDisplayCurrencies,
  getGeoDisplayCurrency,
  getRequestCountryCode,
} from "@/lib/geo-currency";

// Legacy: bulk-set currency on all trades (prefer per-trade currency from import)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const geoCurrency = getGeoDisplayCurrency(req);
    const allowedDisplayCurrencies = getAllowedDisplayCurrencies(req);
    const { currency } = await req.json();
    if (currency !== "INR" && currency !== "USDT") {
      return NextResponse.json({ error: "Currency must be INR or USDT" }, { status: 400 });
    }
    if (!allowedDisplayCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: `Currency locked by region. Allowed currencies: ${allowedDisplayCurrencies.join(", ")}` },
        { status: 403 }
      );
    }

    const result = await prisma.trade.updateMany({
      where: { userId: auth.user.id },
      data: { currency },
    });
    return NextResponse.json({ updated: result.count, currency });
  } catch (error) {
    console.error("Currency update error:", error);
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;
    const geoCurrency = getGeoDisplayCurrency(req);
    const allowedDisplayCurrencies = getAllowedDisplayCurrencies(req);
    const country = getRequestCountryCode(req);

    const groups = await prisma.trade.groupBy({
      by: ["currency"],
      where: { userId: auth.user.id },
      _count: { _all: true },
    });

    if (groups.length === 0) {
      return NextResponse.json({
        detected: geoCurrency,
        displayCurrency: geoCurrency,
        allowedDisplayCurrencies,
        currencies: {},
        mixed: false,
        country,
      });
    }

    const currencies: Record<string, number> = {};
    for (const g of groups) {
      const key = normalizeTradeCurrency(g.currency);
      currencies[key] = (currencies[key] ?? 0) + g._count._all;
    }

    const detected: TradeCurrency = geoCurrency;

    return NextResponse.json({
      detected,
      displayCurrency: geoCurrency,
      allowedDisplayCurrencies,
      currencies,
      mixed: Object.keys(currencies).length > 1,
      country,
    });
  } catch (error) {
    return NextResponse.json({
      detected: "USDT",
      displayCurrency: "USDT",
      allowedDisplayCurrencies: ["USDT"],
      country: "OTHER",
    });
  }
}
