"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#14b8a6"];

interface SymbolDist {
  symbol: string;
  count: number;
  pnl: number;
}

export function DistributionCharts({ data, longShortRatio }: { data: SymbolDist[]; longShortRatio: { long: number; short: number } }) {
  const { fmt } = useCurrency();
  const pieData = data.slice(0, 8).map((d) => ({ name: d.symbol, value: d.count, pnl: d.pnl }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { pnl: number; count: number } }> }) => {
    if (active && payload?.length) {
      const { name, value, payload: item } = payload[0];
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs">
          <div className="font-bold text-white">{name}</div>
          <div className="text-zinc-400">{value} trades</div>
          {item.pnl !== undefined && (
            <div className={item.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>{fmt(item.pnl)}</div>
          )}
        </div>
      );
    }
    return null;
  };
  const lsData = [
    { name: "Long", value: longShortRatio.long, fill: "#10b981" },
    { name: "Short", value: longShortRatio.short, fill: "#ef4444" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Symbol Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {data.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No data</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-zinc-300 truncate flex-1">{d.name}</span>
                    <span className="text-zinc-500">{d.value}</span>
                    <span className={d.pnl >= 0 ? "text-emerald-400" : "text-red-400"} style={{ fontSize: 10 }}>
                      {fmt(d.pnl)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Long vs Short</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {longShortRatio.long + longShortRatio.short === 0 ? (
            <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">No data</div>
          ) : (
            <div className="flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={lsData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip formatter={(v) => [`${v} trades`]} contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {lsData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-400">{longShortRatio.long}</div>
                  <div className="text-xs text-zinc-500">Long trades</div>
                </div>
                <div className="w-px bg-zinc-800" />
                <div>
                  <div className="text-lg font-bold text-red-400">{longShortRatio.short}</div>
                  <div className="text-xs text-zinc-500">Short trades</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
