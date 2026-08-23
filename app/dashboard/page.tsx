"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PnlChart } from "@/components/dashboard/PnlChart";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { useCurrency } from "@/lib/currency-context";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  TrendingUp, TrendingDown, Target, Zap, Trophy, Shield, DollarSign, Scale
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
  const [mixedCurrencies, setMixedCurrencies] = useState(false);
  const { fmtDisplay, symbol, displayCurrency: currency, analyticsQuery, rateReady } = useCurrency();

  useEffect(() => {
    // Wait for the live FX rate to load first — fetching with the placeholder default
    // rate produces a wrong total that then visibly jumps once the real rate arrives.
    if (!rateReady) return;

    const fetchAll = async () => {
      try {
        const q = analyticsQuery();
        const [overviewRes, dailyRes, weeklyRes, monthlyRes, equityRes, detectRes] = await Promise.all([
          fetch(`/api/analytics?type=overview&${q}`, { cache: "no-store" }),
          fetch(`/api/analytics?type=daily&${q}`, { cache: "no-store" }),
          fetch(`/api/analytics?type=weekly&${q}`, { cache: "no-store" }),
          fetch(`/api/analytics?type=monthly&${q}`, { cache: "no-store" }),
          fetch(`/api/analytics?type=equity&${q}`, { cache: "no-store" }),
          fetch("/api/settings/currency", { cache: "no-store" }),
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
        if (detect?.mixed) setMixedCurrencies(true);
      } catch {
        // DB not connected — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [analyticsQuery, rateReady]);

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
  const streak = {
    current: overview.currentStreak,
    type: overview.currentStreakType,
  };
  const isEmpty = overview.totalTrades === 0;

  return (
    <div className="space-y-6">
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

      {mixedCurrencies && (
        <div className="px-4 py-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-300">
          Mixed USD & INR trades detected — stats are converted to your selected display currency.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
              title={`Total P&L (${currency})`}
              value={fmtDisplay(overview.totalPnl)}
              icon={DollarSign}
              iconColor={overview.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
              trend={overview.totalPnl >= 0 ? "up" : "down"}
              description="Sum of every trade's profit/loss, converted to your display currency."
            />
            <StatsCard
              title="Win Rate"
              value={`${overview.winRate.toFixed(1)}%`}
              subValue={`${overview.totalTrades} trades`}
              icon={Target}
              iconColor="text-indigo-400"
              trend={overview.winRate >= 50 ? "up" : "down"}
              description="Share of closed trades that were wins."
            />
            <StatsCard
              title={`Best Day (${currency})`}
              value={fmtDisplay(overview.bestDay)}
              icon={Trophy}
              iconColor="text-amber-400"
              trend="up"
              description="Your single most profitable day, by total P&L on that day."
            />
            <StatsCard
              title={`Max Drawdown (${currency})`}
              value={fmtDisplay(overview.maxDrawdown)}
              icon={TrendingDown}
              iconColor="text-red-400"
              trend="down"
              description="The largest drop from a peak to a low point in your cumulative daily P&L."
            />
            <StatsCard
              title="Payout Edge"
              value={`${overview.edgeVsBreakeven >= 0 ? "+" : ""}${overview.edgeVsBreakeven.toFixed(1)}pp`}
              subValue={`Breakeven ${overview.breakevenWinRate.toFixed(1)}% @ ${(overview.avgPayoutRatio * 100).toFixed(0)}% payout`}
              icon={Zap}
              iconColor="text-cyan-400"
              trend={overview.edgeVsBreakeven >= 0 ? "up" : "down"}
              description="Binary options pay a fixed % on a win and lose the full stake — so what matters is whether your win rate clears the breakeven rate implied by that payout. This shows how many percentage points above (+) or below (-) breakeven you are."
            />
            {overview.maxStakeTrade ? (
              <Link href={`/trades?symbol=${encodeURIComponent(overview.maxStakeTrade.symbol)}`} className="block">
                <StatsCard
                  title="Stake Discipline"
                  value={`${overview.stakeEscalationRatio.toFixed(2)}x`}
                  subValue={`Largest: ${overview.maxStakeTrade.symbol} · ${new Date(overview.maxStakeTrade.date).toLocaleDateString()} →`}
                  icon={Scale}
                  iconColor="text-fuchsia-400"
                  trend={overview.stakeEscalationRatio <= 1.5 ? "up" : overview.stakeEscalationRatio <= 3 ? "neutral" : "down"}
                  description="Your largest single stake divided by your average stake. Near 1x means flat, disciplined sizing; a high ratio flags martingale-style stake doubling after losses. Tap to find the trade driving this."
                />
              </Link>
            ) : (
              <StatsCard
                title="Stake Discipline"
                value={`${overview.stakeEscalationRatio.toFixed(2)}x`}
                subValue="Max stake vs. avg stake"
                icon={Scale}
                iconColor="text-fuchsia-400"
                trend={overview.stakeEscalationRatio <= 1.5 ? "up" : overview.stakeEscalationRatio <= 3 ? "neutral" : "down"}
                description="Your largest single stake divided by your average stake. Near 1x means flat, disciplined sizing; a high ratio flags martingale-style stake doubling after losses."
              />
            )}
            <StatsCard
              title="Consistency"
              value={`${overview.consistencyScore.toFixed(0)}%`}
              subValue="Profitable days"
              icon={Shield}
              iconColor="text-teal-400"
              trend={overview.consistencyScore >= 60 ? "up" : "neutral"}
              description="Share of your trading days that ended net profitable."
            />
            <StatsCard
              title={`${streak.type === "win" ? "🔥" : streak.type === "loss" ? "❄️" : "•"} Current Streak`}
              value={`${streak.current} ${streak.type === "win" ? "W" : streak.type === "loss" ? "L" : ""}`}
              subValue={`Fees: ${fmtDisplay(overview.totalFees)}`}
              icon={TrendingUp}
              iconColor={streak.type === "win" ? "text-emerald-400" : streak.type === "loss" ? "text-red-400" : "text-zinc-400"}
              trend={streak.type === "win" ? "up" : streak.type === "loss" ? "down" : "neutral"}
              description="Consecutive winning or losing days in a row, based on each day's net P&L."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-1 mb-2">
                <div className="text-xs text-zinc-500">Call Win Rate</div>
                <InfoTooltip text="Win rate on CALL / up-direction trades only." />
              </div>
              <div className="text-xl font-bold text-emerald-400">{overview.callWinRate.toFixed(1)}%</div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overview.callWinRate}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-1 mb-2">
                <div className="text-xs text-zinc-500">Put Win Rate</div>
                <InfoTooltip text="Win rate on PUT / down-direction trades only." />
              </div>
              <div className="text-xl font-bold text-red-400">{overview.putWinRate.toFixed(1)}%</div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${overview.putWinRate}%` }} />
              </div>
            </div>
          </div>

          <PnlChart daily={daily} weekly={weekly} monthly={monthly} />
          <EquityCurve data={equity} />
        </>
      )}
    </div>
  );
}
