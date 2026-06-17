import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "overview";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { date: "asc" },
    });

    switch (type) {
      case "overview":
        return NextResponse.json(computeOverviewStats(trades));
      case "daily":
        return NextResponse.json(computeDailyPnl(trades));
      case "weekly":
        return NextResponse.json(computeWeeklyPnl(trades));
      case "monthly":
        return NextResponse.json(computeMonthlyPnl(trades));
      case "heatmap":
        return NextResponse.json(computeHourDayHeatmap(trades));
      case "mental":
        return NextResponse.json(computeMentalStateMetrics(trades));
      case "calendar":
        return NextResponse.json(computeCalendarData(trades));
      case "equity":
        return NextResponse.json(computeEquityCurve(trades));
      case "distribution":
        return NextResponse.json(computeSymbolDistribution(trades));
      case "all": {
        const [overview, daily, weekly, monthly, heatmap, mental, calendar, equity, distribution] =
          await Promise.all([
            computeOverviewStats(trades),
            computeDailyPnl(trades),
            computeWeeklyPnl(trades),
            computeMonthlyPnl(trades),
            computeHourDayHeatmap(trades),
            computeMentalStateMetrics(trades),
            computeCalendarData(trades),
            computeEquityCurve(trades),
            computeSymbolDistribution(trades),
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
