import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInsights } from "@/lib/gemini";
import { computeOverviewStats, computeMentalStateMetrics } from "@/lib/analytics";
import { subDays, subWeeks, subMonths } from "date-fns";
import { fetchUsdInrRate } from "@/lib/exchange-rate";
import { normalizeTradeMonetary, type TradeCurrency } from "@/lib/trade-currency";
import { requireActiveSubscription } from "@/lib/api-auth";
import { normalizeRequestedDisplayCurrency } from "@/lib/geo-currency";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    const { period = "month", currency, rate } = await req.json();

    let from: Date;
    const to = new Date();
    if (period === "day") from = subDays(to, 1);
    else if (period === "week") from = subWeeks(to, 1);
    else if (period === "month") from = subMonths(to, 1);
    else if (period === "quarter") from = subMonths(to, 3);
    else from = subDays(to, 30);

    const trades = await prisma.trade.findMany({
      where: { userId: auth.user.id, date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });

    if (trades.length === 0) {
      return NextResponse.json({ insights: "No trades found for the selected period. Add some trades first!" });
    }

    const displayCurrency: TradeCurrency = normalizeRequestedDisplayCurrency(req, currency);
    const fxRate = Number(rate) > 0 ? Number(rate) : await fetchUsdInrRate();
    const normalized = trades.map((t) => normalizeTradeMonetary(t, displayCurrency, fxRate));
    const currencySymbol = displayCurrency === "INR" ? "₹" : "$";

    const overview = computeOverviewStats(normalized);
    const mental = computeMentalStateMetrics(normalized);

    const summary = {
      period,
      currency: displayCurrency,
      fxRateUsed: fxRate,
      currencySymbol,
      totalTrades: overview.totalTrades,
      totalPnl: `${currencySymbol}${overview.totalPnl.toFixed(2)}`,
      winRate: `${overview.winRate.toFixed(2)}%`,
      profitFactor: overview.profitFactor.toFixed(4),
      maxDrawdown: `${currencySymbol}${overview.maxDrawdown.toFixed(2)}`,
      disciplineScore: overview.disciplineScore,
      revengeTradingInstances: mental.revengeTradingInstances,
      overtradingDays: mental.overtradingDays,
      bestDayOfWeek: mental.bestDayOfWeek,
      worstDayOfWeek: mental.worstDayOfWeek,
      profitableHours: mental.profitableHours,
      worstHours: mental.worstHours,
      psychologyScore: mental.psychologyScore,
      topTrades: normalized
        .filter((t) => t.pnl !== null)
        .sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0))
        .slice(0, 5)
        .map((t) => ({ symbol: t.symbol, side: t.side, pnl: `${currencySymbol}${t.pnl?.toFixed(2)}`, date: t.date })),
    };

    const insights = await generateInsights(JSON.stringify(summary, null, 2), period);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("POST /api/insights error:", error);
    return NextResponse.json({ error: "Insights generation failed" }, { status: 500 });
  }
}
