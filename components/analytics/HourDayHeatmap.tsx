"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapCell } from "@/lib/analytics";
import { useCurrency } from "@/lib/currency-context";
import { formatTimeIST } from "@/lib/datetime";
import { getMaxAbsPnl, getPnlHeatStyle, getPnlHeatTextClass } from "@/lib/heatmap-colors";
import { X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

function HeatmapLegend({ maxAbsPnl }: { maxAbsPnl: number }) {
  const steps = 7;
  return (
    <div className="flex items-center gap-2 mt-3 text-[10px] text-zinc-500 flex-wrap">
      <span>Loss</span>
      <div className="flex h-3 rounded overflow-hidden border border-zinc-800">
        {Array.from({ length: steps }).map((_, i) => {
          const pnl = -maxAbsPnl + (i / (steps - 1)) * maxAbsPnl * 2;
          return (
            <div
              key={i}
              className="w-5"
              style={getPnlHeatStyle(pnl, true, maxAbsPnl)}
            />
          );
        })}
      </div>
      <span>Profit</span>
      <div className="flex items-center gap-1 ml-2">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(39, 39, 42, 0.45)" }} />
        No trades
      </div>
    </div>
  );
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
  currency?: string | null;
}

interface SlotInfo {
  day: number;
  hour: number;
  cell: HeatmapCell;
}

function TradesModal({ slot, onClose }: { slot: SlotInfo; onClose: () => void }) {
  const { fmt, fmtDisplay, convert } = useCurrency();
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

  const totalPnl = trades.reduce((s, t) => s + convert(t.pnl ?? 0, t.currency), 0);
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl min-h-[40vh] sm:min-h-0 max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">
              {DAYS[slot.day]} · {HOURS[slot.hour]}–{String(slot.hour).padStart(2, "0")}:59 IST
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {slot.cell.trades} trades · {slot.cell.winRate.toFixed(0)}% win rate
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {fmtDisplay(totalPnl)}
              </div>
              <div className="text-[10px] text-zinc-600">{wins}W / {trades.length - wins}L</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 min-h-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading trades...</span>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-600">No trades found for this slot</div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden px-4 py-3 space-y-2">
                {trades.map((t) => {
                  const win = (t.pnl ?? 0) >= 0;
                  const isLong = t.side === "BUY" || t.side === "CALL" || t.side === "LONG";
                  return (
                    <div key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm truncate">{t.symbol}</div>
                          <div className="text-[11px] text-zinc-500 mt-1">{formatTimeIST(t.date)} IST</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isLong ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                          }`}>
                            {isLong ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {t.side}
                          </span>
                          <span className={`text-sm font-bold tabular-nums ${win ? "text-emerald-400" : "text-red-400"}`}>
                            {t.pnl !== null ? fmt(t.pnl, t.currency) : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-zinc-600">Qty </span>
                          <span className="text-zinc-300">{t.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-600">Entry </span>
                          <span className="text-zinc-300">{t.entryPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: table */}
              <table className="hidden md:table w-full text-xs table-fixed">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function HourDayHeatmap({ data }: { data: HeatmapCell[] }) {
  const { fmtDisplay } = useCurrency();
  const [selected, setSelected] = useState<SlotInfo | null>(null);

  const grid: Record<string, HeatmapCell> = {};
  for (const cell of data) {
    grid[`${cell.day}-${cell.hour}`] = cell;
  }

  const maxAbsPnl = useMemo(
    () => getMaxAbsPnl(data.filter((c) => c.trades > 0).map((c) => c.pnl)),
    [data]
  );

  // Only show hour rows where trades exist (±1h padding)
  const visibleHourIndices = useMemo(() => {
    const active = data.filter((c) => c.trades > 0);
    if (active.length === 0) return HOURS.map((_, i) => i);
    const minH = Math.min(...active.map((c) => c.hour));
    const maxH = Math.max(...active.map((c) => c.hour));
    const start = Math.max(0, minH - 1);
    const end = Math.min(23, maxH + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [data]);

  const hourRangeLabel =
    visibleHourIndices.length < 24
      ? `${HOURS[visibleHourIndices[0]]} – ${HOURS[visibleHourIndices[visibleHourIndices.length - 1]]}`
      : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white leading-snug">
            Performance Heatmap — Hour × Day
            <span className="block sm:inline sm:ml-2 text-[11px] font-normal text-zinc-600 mt-0.5 sm:mt-0">
              {hourRangeLabel ? `${hourRangeLabel} · tap a cell` : "tap a cell to see trades"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center mb-1">
              <div className="w-10 flex-shrink-0" />
              {DAYS.map((d) => (
                <div key={d} className="flex-1 text-center text-[10px] text-zinc-500 font-medium">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid rows by hour — only active hours */}
            {visibleHourIndices.map((h) => (
              <div key={h} className="flex items-center gap-0.5 mb-0.5">
                <div className="w-10 text-[10px] text-zinc-600 text-right pr-2 flex-shrink-0">{HOURS[h]}</div>
                {DAYS.map((_, d) => {
                  const cell = grid[`${d}-${h}`];
                  const hasData = cell && cell.trades > 0;
                  const pnl = cell?.pnl ?? 0;
                  return (
                    <div
                      key={d}
                      onClick={() => hasData && setSelected({ day: d, hour: h, cell })}
                      style={getPnlHeatStyle(pnl, !!hasData, maxAbsPnl)}
                      className={`flex-1 h-5 rounded-sm flex items-center justify-center text-[9px] font-medium transition-all ${getPnlHeatTextClass(pnl, !!hasData, maxAbsPnl)}
                        ${hasData ? "cursor-pointer hover:scale-110 hover:z-10 hover:ring-1 hover:ring-white/30" : "cursor-default"}`}
                      title={cell ? `${DAYS[d]} ${HOURS[h]}: ${cell.trades} trades, ${fmtDisplay(cell.pnl)}, ${cell.winRate.toFixed(0)}% WR` : `${DAYS[d]} ${HOURS[h]}: No data`}
                    >
                      {hasData && cell.trades}
                    </div>
                  );
                })}
              </div>
            ))}

            <HeatmapLegend maxAbsPnl={maxAbsPnl} />
          </div>
        </CardContent>
      </Card>

      {selected && <TradesModal slot={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
