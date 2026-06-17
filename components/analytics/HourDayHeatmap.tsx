"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapCell } from "@/lib/analytics";
import { useCurrency } from "@/lib/currency-context";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

function getColor(pnl: number, trades: number): string {
  if (trades === 0) return "bg-zinc-800/30";
  if (pnl > 200) return "bg-emerald-500 text-white";
  if (pnl > 50) return "bg-emerald-500/70 text-white";
  if (pnl > 0) return "bg-emerald-500/40 text-emerald-200";
  if (pnl < -200) return "bg-red-600 text-white";
  if (pnl < -50) return "bg-red-500/70 text-white";
  if (pnl < 0) return "bg-red-500/40 text-red-200";
  return "bg-zinc-700 text-zinc-300";
}

export function HourDayHeatmap({ data }: { data: HeatmapCell[] }) {
  const { fmt } = useCurrency();
  const grid: Record<string, HeatmapCell> = {};
  for (const cell of data) {
    grid[`${cell.day}-${cell.hour}`] = cell;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white">Performance Heatmap — Hour × Day</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Header */}
          <div className="flex items-center mb-1">
            <div className="w-10 flex-shrink-0" />
            {DAYS.map((d) => (
              <div key={d} className="flex-1 text-center text-[10px] text-zinc-500 font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Grid rows by hour */}
          {HOURS.map((hour, h) => (
            <div key={h} className="flex items-center gap-0.5 mb-0.5">
              <div className="w-10 text-[10px] text-zinc-600 text-right pr-2 flex-shrink-0">{hour}</div>
              {DAYS.map((_, d) => {
                const cell = grid[`${d}-${h}`];
                const color = getColor(cell?.pnl ?? 0, cell?.trades ?? 0);
                return (
                  <div
                    key={d}
                    className={`flex-1 h-5 rounded-sm ${color} flex items-center justify-center text-[9px] font-medium cursor-pointer transition-transform hover:scale-110`}
                    title={cell ? `${DAYS[d]} ${hour}: ${cell.trades} trades, ${fmt(cell.pnl)}, ${cell.winRate.toFixed(0)}% WR` : `${DAYS[d]} ${hour}: No data`}
                  >
                    {cell && cell.trades > 0 && cell.trades}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-[10px] text-zinc-500 flex-wrap">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Strong Profit</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500/40" /> Small Profit</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500/40" /> Small Loss</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-600" /> Big Loss</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-zinc-800/30" /> No trades</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
