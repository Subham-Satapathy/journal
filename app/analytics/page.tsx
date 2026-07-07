"use client";

import { useEffect, useState } from "react";
import { CalendarHeatmap } from "@/components/analytics/CalendarHeatmap";
import { HourDayHeatmap } from "@/components/analytics/HourDayHeatmap";
import { DistributionCharts } from "@/components/analytics/DistributionCharts";
import { MentalStateCard } from "@/components/analytics/MentalStateCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeatmapCell, MentalStateMetrics } from "@/lib/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Flame, TrendingUp } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import { computeStreakFromDailySeries } from "@/lib/streak";

// Stable top-level component — avoids white-screen crash from defining
// components inside render (IIFE pattern breaks React's rules of hooks).
function MonthlyBarChart({
  data,
  fmt,
  symbol,
}: {
  data: Array<{ month: string; pnl: number }>;
  fmt: (v: number) => string;
  symbol: string;
}) {
  const minPnl = Math.min(...data.map((d) => d.pnl));
  const maxPnl = Math.max(...data.map((d) => d.pnl));
  const yMin = Math.min(minPnl * 1.1, 0);
  const yMax = Math.max(maxPnl * 1.1, 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={48}
          tickFormatter={(v) => `${symbol}${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(v) => [fmt(Number(v ?? 0)), "P&L"]}
          labelStyle={{ color: "#a1a1aa", fontSize: 11 }}
          contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
          itemStyle={{ color: "#f4f4f5" }}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={80}>
          {data.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? "#10b981" : "#ef4444"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface AnalyticsData {
  heatmap: HeatmapCell[];
  mental: MentalStateMetrics;
  calendar: Array<{ date: string; count: number; pnl: number }>;
  distribution: Array<{ symbol: string; count: number; pnl: number }>;
  weekly: Array<{ week: string; pnl: number; trades: number; cumulative: number }>;
  monthly: Array<{ month: string; pnl: number; trades: number; cumulative: number }>;
  overview: { longWinRate: number; shortWinRate: number; totalTrades: number; currentStreak: number; currentStreakType: string };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mixedCurrencies, setMixedCurrencies] = useState(false);
  const { fmtDisplay, symbol, analyticsQuery } = useCurrency();

  useEffect(() => {
    const fetchAll = async () => {
      const q = analyticsQuery();
      const [heatmapRes, mentalRes, calendarRes, distRes, weeklyRes, monthlyRes, overviewRes, detectRes] = await Promise.all([
        fetch(`/api/analytics?type=heatmap&${q}`, { cache: "no-store" }),
        fetch(`/api/analytics?type=mental&${q}`, { cache: "no-store" }),
        fetch(`/api/analytics?type=calendar&${q}`, { cache: "no-store" }),
        fetch(`/api/analytics?type=distribution&${q}`, { cache: "no-store" }),
        fetch(`/api/analytics?type=weekly&${q}`, { cache: "no-store" }),
        fetch(`/api/analytics?type=monthly&${q}`, { cache: "no-store" }),
        fetch(`/api/analytics?type=overview&${q}`, { cache: "no-store" }),
        fetch("/api/settings/currency", { cache: "no-store" }),
      ]);
      const [heatmap, mental, calendar, distribution, weekly, monthly, overview, detect] = await Promise.all([
        heatmapRes.json(), mentalRes.json(), calendarRes.json(),
        distRes.json(), weeklyRes.json(), monthlyRes.json(), overviewRes.json(),
        detectRes.json(),
      ]);
      if (detect?.mixed) setMixedCurrencies(true);
      setData({
        heatmap: Array.isArray(heatmap) ? heatmap : [],
        mental: mental && typeof mental.psychologyScore === "number" ? mental : {
          revengeTradingInstances: 0, overtradingDays: 0, avgTradesPerDay: 0,
          maxTradesInDay: 0, profitableHours: [], worstHours: [],
          bestDayOfWeek: "N/A", worstDayOfWeek: "N/A", psychologyScore: 0, alerts: [],
        },
        calendar: Array.isArray(calendar) ? calendar : [],
        distribution: Array.isArray(distribution) ? distribution : [],
        weekly: Array.isArray(weekly) ? weekly : [],
        monthly: Array.isArray(monthly) ? monthly : [],
        overview: overview && typeof overview.totalTrades === "number" ? overview : {
          longWinRate: 0, shortWinRate: 0, totalTrades: 0, currentStreak: 0, currentStreakType: "none",
        },
      });
      setLoading(false);
    };
    fetchAll();
  }, [analyticsQuery]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-zinc-900 rounded-xl border border-zinc-800" />
        ))}
      </div>
    );
  }

  const { heatmap, mental, calendar, distribution, weekly, monthly, overview } = data!;
  const streak = computeStreakFromDailySeries(calendar.map((d) => ({ date: d.date, pnl: d.pnl })));

  const convertedMonthly = monthly;

  const longShortRatio = {
    long: overview.totalTrades > 0 ? Math.round(overview.totalTrades * (overview.longWinRate / 100)) : 0,
    short: overview.totalTrades > 0 ? Math.round(overview.totalTrades * (overview.shortWinRate / 100)) : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Deep dive into your trading patterns</p>
        </div>
        <div className="md:hidden">
          <CurrencyToggle />
        </div>
      </div>

      {/* Calendar Heatmap */}
      <CalendarHeatmap data={calendar} />

      {/* Streak Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <CardTitle className="text-base font-semibold text-white">Streak Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-4xl font-black" style={{ color: streak.type === "win" ? "#10b981" : streak.type === "loss" ? "#ef4444" : "#a1a1aa" }}>
                {streak.current}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {streak.type === "win" ? "🔥 Win streak" : streak.type === "loss" ? "❄️ Loss streak" : "No streak"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly P&L Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Monthly P&L Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {monthly.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No data</div>
          ) : (
            <MonthlyBarChart data={convertedMonthly} fmt={fmtDisplay} symbol={symbol} />
          )}
        </CardContent>
      </Card>

      {/* Hour × Day Heatmap */}
      <HourDayHeatmap data={heatmap} />

      {/* Distribution Charts */}
      <DistributionCharts data={distribution} longShortRatio={longShortRatio} />

      {/* Mental State */}
      <MentalStateCard data={mental} />
    </div>
  );
}
