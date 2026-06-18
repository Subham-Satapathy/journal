"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapCell } from "@/lib/analytics";
import { useCurrency } from "@/lib/currency-context";
import { formatTimeIST } from "@/lib/datetime";
import { X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

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

interface Trade {
  id: string;
  symbol: string;
  side: string;
  pnl: number | null;
  quantity: number;
  date: string;
  entryPrice: number;
  exitPrice: number | null;
}

interface SlotInfo {
  day: number;
  hour: number;
  cell: HeatmapCell;
}

function TradesModal({ slot, onClose }: { slot: SlotInfo; onClose: () => void }) {
  const { fmt } = useCurrency();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trades?dayOfWeek=${slot.day}&hour=${slot.hour}&limit=200`);
      const data = await res.json();
      setTrades(data.trades ?? []);
    } finally {
      setLoading(false);
    }
  }, [slot.day, slot.hour]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white">
              {DAYS[slot.day]} · {HOURS[slot.hour]}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {slot.cell.trades} trades · {slot.cell.winRate.toFixed(0)}% win rate
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {fmt(totalPnl)}
              </div>
              <div className="text-[10px] text-zinc-600">{wins}W / {trades.length - wins}L</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading trades...</span>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-600">No trades found for this slot</div>
          ) : (
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[14%]" />
                <col className="w-[15%]" />
                <col className="w-[13%]" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-zinc-950">
                <tr className="text-zinc-600 border-b border-zinc-800/60">
                  <th className="text-left py-2 px-3 font-medium">Symbol</th>
                  <th className="text-left py-2 px-3 font-medium">Side</th>
                  <th className="text-right py-2 px-3 font-medium">Qty</th>
                  <th className="text-right py-2 px-3 font-medium">Entry</th>
                  <th className="text-right py-2 px-3 font-medium">P&L</th>
                  <th className="text-right py-2 px-3 font-medium">Time (IST)</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const win = (t.pnl ?? 0) >= 0;
                  return (
                    <tr key={t.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                      <td className="py-2 px-3 font-medium text-white">{t.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          t.side === "BUY" || t.side === "CALL" || t.side === "LONG"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}>
                          {t.side === "BUY" || t.side === "CALL" || t.side === "LONG"
                            ? <TrendingUp className="w-2.5 h-2.5" />
                            : <TrendingDown className="w-2.5 h-2.5" />}
                          {t.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-zinc-400">{t.quantity}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">{t.entryPrice}</td>
                      <td className={`py-2 px-3 text-right font-semibold ${win ? "text-emerald-400" : "text-red-400"}`}>
                        {t.pnl !== null ? fmt(t.pnl) : "—"}
                      </td>
                      <td className="py-2 px-3 text-right text-zinc-600">
                        {formatTimeIST(t.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function HourDayHeatmap({ data }: { data: HeatmapCell[] }) {
  const { fmt } = useCurrency();
  const [selected, setSelected] = useState<SlotInfo | null>(null);

  const grid: Record<string, HeatmapCell> = {};
  for (const cell of data) {
    grid[`${cell.day}-${cell.hour}`] = cell;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Performance Heatmap — Hour × Day
            <span className="ml-2 text-[11px] font-normal text-zinc-600">click any cell to see trades</span>
          </CardTitle>
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
                  const hasData = cell && cell.trades > 0;
                  return (
                    <div
                      key={d}
                      onClick={() => hasData && setSelected({ day: d, hour: h, cell })}
                      className={`flex-1 h-5 rounded-sm ${color} flex items-center justify-center text-[9px] font-medium transition-all
                        ${hasData ? "cursor-pointer hover:scale-110 hover:z-10 hover:ring-1 hover:ring-white/30" : "cursor-default"}`}
                      title={cell ? `${DAYS[d]} ${hour}: ${cell.trades} trades, ${fmt(cell.pnl)}, ${cell.winRate.toFixed(0)}% WR` : `${DAYS[d]} ${hour}: No data`}
                    >
                      {hasData && cell.trades}
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

      {selected && <TradesModal slot={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
