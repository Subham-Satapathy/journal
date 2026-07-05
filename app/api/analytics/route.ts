import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchUsdInrRate } from "@/lib/exchange-rate";
import {
  computeOverviewStats,
  computeDailyPnl,
  computeWeeklyPnl,
  computeMonthlyPnl,
  computeHourDayHeatmap,
  computeMentalStateMetrics,
  computeCalendarData,
  computeEquityCurve,
  computeSymbolDistribution,
} from "@/lib/analytics";
import { normalizeTradeMonetary, type TradeCurrency } from "@/lib/trade-currency";
import type { Trade } from "@prisma/client";
import { requireActiveSubscription } from "@/lib/api-auth";
import { normalizeRequestedDisplayCurrency } from "@/lib/geo-currency";

function normalizeTradesForDisplay(
  trades: Trade[],
  displayCurrency: TradeCurrency,
  rate: number
): Trade[] {
  return trades.map((t) => normalizeTradeMonetary(t, displayCurrency, rate));
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "overview";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = { userId: auth.user.id };
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { date: "asc" },
    });

    const displayParam = searchParams.get("currency");
    const displayCurrency: TradeCurrency = normalizeRequestedDisplayCurrency(req, displayParam);
    const rate = parseFloat(searchParams.get("rate") || "") || (await fetchUsdInrRate());
    const normalized = normalizeTradesForDisplay(trades, displayCurrency, rate);

    switch (type) {
      case "overview":
        return NextResponse.json(computeOverviewStats(normalized));
      case "daily":
        return NextResponse.json(computeDailyPnl(normalized));
      case "weekly":
        return NextResponse.json(computeWeeklyPnl(normalized));
      case "monthly":
        return NextResponse.json(computeMonthlyPnl(normalized));
      case "heatmap":
        return NextResponse.json(computeHourDayHeatmap(normalized));
      case "mental":
        return NextResponse.json(computeMentalStateMetrics(normalized));
      case "calendar":
        return NextResponse.json(computeCalendarData(normalized));
      case "equity":
        return NextResponse.json(computeEquityCurve(normalized));
      case "distribution":
        return NextResponse.json(computeSymbolDistribution(normalized));
      case "all": {
        const [overview, daily, weekly, monthly, heatmap, mental, calendar, equity, distribution] =
          await Promise.all([
            computeOverviewStats(normalized),
            computeDailyPnl(normalized),
            computeWeeklyPnl(normalized),
            computeMonthlyPnl(normalized),
            computeHourDayHeatmap(normalized),
            computeMentalStateMetrics(normalized),
            computeCalendarData(normalized),
            computeEquityCurve(normalized),
            computeSymbolDistribution(normalized),
          ]);
        return NextResponse.json({ overview, daily, weekly, monthly, heatmap, mental, calendar, equity, distribution });
      }
      default:
        return NextResponse.json({ error: "Unknown analytics type" }, { status: 400 });
    }
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Analytics failed" }, { status: 500 });
  }
}
