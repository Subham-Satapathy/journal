"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency-context";
import { DailyPnl, WeeklyPnl, MonthlyPnl } from "@/lib/analytics";

type Period = "daily" | "weekly" | "monthly";

interface PnlChartProps {
  daily: DailyPnl[];
  weekly: WeeklyPnl[];
  monthly: MonthlyPnl[];
}

export function PnlChart({ daily, weekly, monthly }: PnlChartProps) {
  const [period, setPeriod] = useState<Period>("daily");
  const { fmt, symbol } = useCurrency();

  const dataMap: Record<Period, (DailyPnl | WeeklyPnl | MonthlyPnl)[]> = { daily, weekly, monthly };
  const data = dataMap[period];

  const getXKey = () => {
    if (period === "daily") return "date";
    if (period === "weekly") return "week";
    return "month";
  };

  const formatX = (val: string) => val.substring(5);

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.cumulative)), 1);
  void maxAbs;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const pnl = payload.find((p) => p.name === "pnl")?.value ?? 0;
      const cum = payload.find((p) => p.name === "cumulative")?.value ?? 0;
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs">
          <div className="text-zinc-400 mb-1">{label}</div>
          <div className={`font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {period === "daily" ? "Day" : period === "weekly" ? "Week" : "Month"} P&L: {fmt(pnl)}
          </div>
          <div className={`${cum >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            Cumulative: {fmt(cum)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-white">Cumulative P&L</CardTitle>
          <div className="flex gap-1">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod(p)}
                className="capitalize text-xs"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey={getXKey()}
              tickFormatter={formatX}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${symbol}${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradPos)"
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#6366f1"
              strokeWidth={1.5}
              fill="transparent"
              dot={false}
              activeDot={{ r: 3, fill: "#6366f1" }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-400" /> Cumulative</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-indigo-400" /> Period P&L</div>
        </div>
      </CardContent>
    </Card>
  );
}
