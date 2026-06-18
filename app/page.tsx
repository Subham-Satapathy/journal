"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PnlChart } from "@/components/dashboard/PnlChart";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { useCurrency } from "@/lib/currency-context";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import {
  TrendingUp, TrendingDown, Target, BarChart3, Zap, Trophy, Shield, DollarSign
} from "lucide-react";
import type { OverviewStats, DailyPnl, WeeklyPnl, MonthlyPnl } from "@/lib/analytics";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardData {
  overview: OverviewStats;
  daily: DailyPnl[];
  weekly: WeeklyPnl[];
  monthly: MonthlyPnl[];
  equity: Array<{ date: string; equity: number; drawdown: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const { fmt, convert, symbol, displayCurrency: currency, baseCurrency, setBaseCurrency, setDisplayCurrency } = useCurrency();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, dailyRes, weeklyRes, monthlyRes, equityRes, detectRes] = await Promise.all([
          fetch("/api/analytics?type=overview"),
          fetch("/api/analytics?type=daily"),
          fetch("/api/analytics?type=weekly"),
          fetch("/api/analytics?type=monthly"),
          fetch("/api/analytics?type=equity"),
          fetch("/api/settings/currency"),
        ]);
        const [overview, daily, weekly, monthly, equity, detect] = await Promise.all([
          overviewRes.json(), dailyRes.json(), weeklyRes.json(), monthlyRes.json(), equityRes.json(),
          detectRes.json(),
        ]);
        if (overview && typeof overview.totalTrades === "number") {
          setData({
            overview,
            daily: Array.isArray(daily) ? daily : [],
            weekly: Array.isArray(weekly) ? weekly : [],
            monthly: Array.isArray(monthly) ? monthly : [],
            equity: Array.isArray(equity) ? equity : [],
          });
        }
        if (detect?.detected) setDetectedCurrency(detect.detected);
      } catch {
        // DB not connected — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-zinc-900 rounded-xl border border-zinc-800" />)}
        </div>
        <div className="h-72 bg-zinc-900 rounded-xl border border-zinc-800" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Your trading performance overview</p>
          </div>
          <Link href="/import"><Button>Import First Trades</Button></Link>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-zinc-700" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">No trades yet</h2>
          <p className="text-sm text-zinc-600 max-w-xs mb-6">
            Connect your database and import trades to start seeing insights.
          </p>
          <Link href="/import"><Button size="lg">Get Started — Import Trades</Button></Link>
        </div>
      </div>
    );
  }

  const { overview, daily, weekly, monthly, equity } = data;
  const isEmpty = overview.totalTrades === 0;

  // Convert chart data for selected currency
  const convertChartData = <T extends { pnl: number; cumulative: number }>(arr: T[]): T[] =>
    arr.map((d) => ({ ...d, pnl: convert(d.pnl), cumulative: convert(d.cumulative) }));

  const convertEquity = equity.map((e) => ({ ...e, equity: convert(e.equity) }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Your trading performance overview</p>
          </div>
          {isEmpty && (
            <Link href="/import" className="shrink-0">
              <Button size="sm">Import First Trades</Button>
            </Link>
          )}
        </div>
        <div className="md:hidden">
          <CurrencyToggle />
        </div>
      </div>

      {/* Currency mismatch banner */}
      {detectedCurrency && detectedCurrency !== baseCurrency && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-amber-950/50 border border-amber-800/60 rounded-xl">
          <div className="text-sm space-y-1">
            <div className="text-amber-400 font-semibold">⚠ Currency mismatch detected</div>
            <div className="text-amber-600 text-xs sm:text-sm">
              Your trades look like <strong className="text-amber-400">{detectedCurrency}</strong> amounts, but &quot;Trades in&quot; is set to <strong className="text-amber-400">{baseCurrency}</strong> — amounts will display incorrectly.
            </div>
          </div>
          <button
            onClick={() => {
              const c = detectedCurrency as "INR" | "USDT";
              setBaseCurrency(c);
              setDisplayCurrency(c);
              fetch("/api/settings/currency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currency: c }),
              }).catch(() => {});
              setDetectedCurrency(null);
            }}
            className="shrink-0 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Fix — Switch to {detectedCurrency}
          </button>
        </div>
      )}

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-zinc-700" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">No trades yet</h2>
          <p className="text-sm text-zinc-600 max-w-xs mb-6">
            Import your trades via CSV, Excel, or screenshot to start seeing insights.
          </p>
          <Link href="/import"><Button size="lg">Get Started — Import Trades</Button></Link>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
              title={`Total P&L (${currency})`}
              value={fmt(overview.totalPnl)}
              icon={DollarSign}
              iconColor={overview.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
              trend={overview.totalPnl >= 0 ? "up" : "down"}
            />
            <StatsCard
              title="Win Rate"
              value={`${overview.winRate.toFixed(1)}%`}
              subValue={`${overview.totalTrades} trades`}
              icon={Target}
              iconColor="text-indigo-400"
              trend={overview.winRate >= 50 ? "up" : "down"}
            />
            <StatsCard
              title="Profit Factor"
              value={overview.profitFactor === Infinity ? "∞" : overview.profitFactor.toFixed(2)}
              subValue="Gross P / Gross L"
              icon={BarChart3}
              iconColor="text-violet-400"
              trend={overview.profitFactor >= 1.5 ? "up" : overview.profitFactor >= 1 ? "neutral" : "down"}
            />
            <StatsCard
              title={`Best Day (${currency})`}
              value={fmt(overview.bestDay)}
              icon={Trophy}
              iconColor="text-amber-400"
              trend="up"
            />
            <StatsCard
              title={`Max Drawdown (${currency})`}
              value={fmt(overview.maxDrawdown)}
              icon={TrendingDown}
              iconColor="text-red-400"
              trend="down"
            />
            <StatsCard
              title="Avg R:R"
              value={`${overview.avgRiskReward.toFixed(2)}:1`}
              subValue={`Win ${symbol}${convert(overview.avgWin).toFixed(0)} / Loss ${symbol}${convert(overview.avgLoss).toFixed(0)}`}
              icon={Zap}
              iconColor="text-cyan-400"
              trend={overview.avgRiskReward >= 1.5 ? "up" : "neutral"}
            />
            <StatsCard
              title="Consistency"
              value={`${overview.consistencyScore.toFixed(0)}%`}
              subValue="Profitable days"
              icon={Shield}
              iconColor="text-teal-400"
              trend={overview.consistencyScore >= 60 ? "up" : "neutral"}
            />
            <StatsCard
              title={`${overview.currentStreakType === "win" ? "🔥" : "❄️"} Current Streak`}
              value={`${overview.currentStreak} ${overview.currentStreakType === "win" ? "W" : overview.currentStreakType === "loss" ? "L" : ""}`}
              subValue={`Fees: ${fmt(overview.totalFees)}`}
              icon={TrendingUp}
              iconColor={overview.currentStreakType === "win" ? "text-emerald-400" : "text-red-400"}
              trend={overview.currentStreakType === "win" ? "up" : "down"}
            />
          </div>

          {/* Long vs Short Win Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-xs text-zinc-500 mb-2">Long Win Rate</div>
              <div className="text-xl font-bold text-emerald-400">{overview.longWinRate.toFixed(1)}%</div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overview.longWinRate}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-xs text-zinc-500 mb-2">Short Win Rate</div>
              <div className="text-xl font-bold text-red-400">{overview.shortWinRate.toFixed(1)}%</div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${overview.shortWinRate}%` }} />
              </div>
            </div>
          </div>

          {/* Charts — pass currency-converted data */}
          <PnlChart
            daily={convertChartData(daily)}
            weekly={convertChartData(weekly)}
            monthly={convertChartData(monthly)}
          />
          <EquityCurve data={convertEquity} />
        </>
      )}
    </div>
  );
}
