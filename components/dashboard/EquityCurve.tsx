"use client";

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";

interface EquityPoint {
  date: string;
  equity: number;
  drawdown: number;
}

export function EquityCurve({ data }: { data: EquityPoint[] }) {
  const { fmt, symbol } = useCurrency();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const eq = payload.find((p) => p.name === "equity")?.value ?? 0;
      const dd = payload.find((p) => p.name === "drawdown")?.value ?? 0;
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs">
          <div className="text-zinc-400 mb-1">{label}</div>
          <div className={eq >= 0 ? "text-emerald-400" : "text-red-400"}>Equity: {fmt(eq)}</div>
          <div className="text-red-400">Drawdown: -{dd.toFixed(1)}%</div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold text-white">Equity Curve</CardTitle></CardHeader>
        <CardContent><div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No trade data yet</div></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white">Equity Curve & Drawdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.substring(5, 10)} />
            <YAxis yAxisId="equity" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={60}
              tickFormatter={(v) => `${symbol}${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
            <YAxis yAxisId="dd" orientation="right" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={40}
              tickFormatter={(v) => `-${v.toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#52525b", strokeWidth: 1 }} />
            <ReferenceLine yAxisId="equity" y={0} stroke="#52525b" strokeDasharray="3 3" />
            <Bar yAxisId="dd" dataKey="drawdown" fill="#ef4444" opacity={0.25} name="drawdown" />
            <Line yAxisId="equity" type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} dot={false} name="equity" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
