import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeTradeCurrency, type TradeCurrency } from "@/lib/trade-currency";

// Legacy: bulk-set currency on all trades (prefer per-trade currency from import)
export async function POST(req: NextRequest) {
  try {
    const { currency } = await req.json();
    if (currency !== "INR" && currency !== "USDT") {
      return NextResponse.json({ error: "Currency must be INR or USDT" }, { status: 400 });
    }
    const result = await prisma.trade.updateMany({ data: { currency } });
    return NextResponse.json({ updated: result.count, currency });
  } catch (error) {
    console.error("Currency update error:", error);
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const groups = await prisma.trade.groupBy({
      by: ["currency"],
      _count: { _all: true },
    });

    if (groups.length === 0) {
      return NextResponse.json({ detected: "USDT", currencies: {} });
    }

    const currencies: Record<string, number> = {};
    for (const g of groups) {
      const key = normalizeTradeCurrency(g.currency);
      currencies[key] = (currencies[key] ?? 0) + g._count._all;
    }

    const detected: TradeCurrency =
      (currencies.INR ?? 0) > (currencies.USDT ?? 0) ? "INR" : "USDT";

    return NextResponse.json({
      detected,
      currencies,
      mixed: Object.keys(currencies).length > 1,
    });
  } catch (error) {
    return NextResponse.json({ detected: "USDT" });
  }
}
