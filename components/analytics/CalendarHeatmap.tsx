"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { eachDayOfInterval, getDay, startOfWeek } from "date-fns";
import { formatISTDateKey, formatTimeIST, istDayRangeUTC, getISTDateKey } from "@/lib/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";
import { X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface CalendarDay {
  date: string;
  count: number;
  pnl: number;
}

interface CalendarHeatmapProps {
  data: CalendarDay[];
}

interface Trade {
  id: string;
  symbol: string;
  side: string;
  pnl: number | null;
  quantity: number;
  date: string;
  entryPrice: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getCellColor(pnl: number, hasTrades: boolean): string {
  if (!hasTrades) return "bg-zinc-800/50";
  if (pnl > 500) return "bg-emerald-500";
  if (pnl > 200) return "bg-emerald-500/80";
  if (pnl > 50) return "bg-emerald-500/60";
  if (pnl > 0) return "bg-emerald-500/40";
  if (pnl < -500) return "bg-red-600";
  if (pnl < -200) return "bg-red-500/80";
  if (pnl < -50) return "bg-red-500/60";
  return "bg-red-500/40";
}

function DayTradesModal({ dateStr, summary, onClose }: { dateStr: string; summary: CalendarDay; onClose: () => void }) {
  const { fmt } = useCurrency();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch trades for this specific day (from start to end of day)
      const { from, to } = istDayRangeUTC(dateStr);
      const res = await fetch(`/api/trades?from=${from.toISOString()}&to=${to.toISOString()}&limit=200`);
      const data = await res.json();
      setTrades(data.trades ?? []);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length;
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  // Format date nicely
  const displayDate = formatISTDateKey(dateStr);

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
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">{displayDate}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {summary.count} trade{summary.count !== 1 ? "s" : ""} · {wins}W / {summary.count - wins}L
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {fmt(totalPnl)}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading trades...</span>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-600">No trades found for this day</div>
          ) : (
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-8" />
                <col className="w-[28%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-zinc-950">
                <tr className="text-zinc-600 border-b border-zinc-800/60">
                  <th className="text-left py-2 px-3 font-medium">#</th>
                  <th className="text-left py-2 px-3 font-medium">Symbol</th>
                  <th className="text-left py-2 px-3 font-medium">Side</th>
                  <th className="text-right py-2 px-3 font-medium">Amount</th>
                  <th className="text-right py-2 px-3 font-medium">P&L</th>
                  <th className="text-right py-2 px-3 font-medium">Time (IST)</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, idx) => {
                  const win = (t.pnl ?? 0) >= 0;
                  const isCall = ["BUY", "CALL", "LONG"].includes(t.side.toUpperCase());
                  return (
                    <tr key={t.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/40 transition-colors">
                      <td className="py-2 px-3 text-zinc-700">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-white">{t.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isCall ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                        }`}>
                          {isCall ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {t.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-zinc-400">{fmt(t.quantity)}</td>
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
              {trades.length > 1 && (
                <tfoot className="sticky bottom-0 z-10 bg-zinc-950">
                  <tr className="border-t border-zinc-700">
                    <td />
                    <td colSpan={3} className="py-2.5 px-3 text-zinc-500 text-xs text-right">Total</td>
                    <td className={`py-2.5 px-3 text-right font-bold text-xs ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {fmt(totalPnl)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const { fmt } = useCurrency();
  const [selectedDay, setSelectedDay] = useState<{ dateStr: string; summary: CalendarDay } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const adjustedStart = startOfWeek(
      new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
      { weekStartsOn: 1 }
    );
    const end = today;

    const days = eachDayOfInterval({ start: adjustedStart, end });

    const weeksArr: Array<Array<{ date: Date; dayStr: string } | null>> = [];
    let week: Array<{ date: Date; dayStr: string } | null> = [];

    const firstDay = getDay(adjustedStart);
    const mondayAdj = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < mondayAdj; i++) week.push(null);

    for (const day of days) {
      week.push({ date: day, dayStr: getISTDateKey(day) });
      if (week.length === 7) { weeksArr.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeksArr.push(week);
    }

    const labels: Array<{ month: string; col: number }> = [];
    let lastMonth = -1;
    for (let i = 0; i < weeksArr.length; i++) {
      const firstValid = weeksArr[i].find((d) => d !== null);
      if (firstValid) {
        const m = firstValid.date.getMonth();
        if (m !== lastMonth) { labels.push({ month: MONTHS[m], col: i }); lastMonth = m; }
      }
    }

    return { weeks: weeksArr, monthLabels: labels };
  }, []);

  const dataMap = useMemo(() => new Map(data.map((d) => [d.date, d])), [data]);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white leading-snug">
            Trading Calendar — P&L Heatmap{" "}
            <span className="text-zinc-600 font-normal text-xs sm:text-sm block sm:inline mt-0.5 sm:mt-0">
              last 12 months · tap a day
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          {/* Horizontal scroll on mobile; full-width flex on desktop */}
          <div className="overflow-x-auto overscroll-x-contain touch-pan-x -mx-1 px-1 sm:mx-0 sm:px-0 md:overflow-visible">
            <div className="inline-block md:block w-max md:w-full">
              {/* Month labels */}
              <div className="relative mb-2 ml-8 md:ml-9 h-4">
                {monthLabels.map(({ month, col }, idx) => (
                  <div key={`${month}-${idx}`}>
                    <div
                      className="absolute md:hidden text-[10px] text-zinc-500 font-medium whitespace-nowrap"
                      style={{ left: `calc(2rem + ${col} * 18px)` }}
                    >
                      {month}
                    </div>
                    <div
                      className="absolute hidden md:block text-[11px] text-zinc-500 font-medium whitespace-nowrap"
                      style={{ left: `calc(2.25rem + ${col} * ((100% - 2.25rem) / ${weeks.length}))` }}
                    >
                      {month}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 w-8 shrink-0">
                  {DAY_LABELS.map((d, i) => (
                    <div
                      key={i}
                      className="h-[14px] md:h-auto md:flex-1 md:min-h-[16px] flex items-center justify-end pr-1 text-[9px] sm:text-[10px] text-zinc-600 font-medium"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                {weeks.map((week, wi) => (
                  <div
                    key={wi}
                    className="flex flex-col gap-1 w-[14px] shrink-0 md:w-auto md:flex-1 md:min-w-[8px]"
                  >
                    {week.map((day, di) => {
                      if (!day) {
                        return (
                          <div
                            key={di}
                            className="w-[14px] h-[14px] md:w-full md:h-auto md:aspect-square md:min-h-[14px] md:max-h-[28px] shrink-0"
                          />
                        );
                      }
                      const d = dataMap.get(day.dayStr);
                      const hasTrades = !!d && d.count > 0;
                      const color = getCellColor(d?.pnl ?? 0, hasTrades);
                      return (
                        <div
                          key={di}
                          onClick={() => hasTrades && d && setSelectedDay({ dateStr: day.dayStr, summary: d })}
                          className={`w-[14px] h-[14px] md:w-full md:h-auto md:aspect-square md:min-h-[14px] md:max-h-[28px] shrink-0 rounded-sm ${color} transition-all ${
                            hasTrades
                              ? "cursor-pointer active:scale-110 md:hover:scale-110 md:hover:ring-2 md:hover:ring-white/30"
                              : "cursor-default"
                          }`}
                          title={`${day.dayStr}: ${d && hasTrades ? `${d.count} trade(s), ${fmt(d.pnl)}` : "No trades"}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 sm:gap-3 mt-4 ml-8 md:ml-9 text-[10px] sm:text-[11px] text-zinc-500 flex-wrap">
                <span>Less</span>
                {["bg-zinc-800/50", "bg-red-500/40", "bg-red-500/80", "bg-emerald-500/40", "bg-emerald-500/80", "bg-emerald-500"].map((c, i) => (
                  <div key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm ${c}`} />
                ))}
                <span>More</span>
                <span className="text-zinc-700 md:hidden w-full">← scroll →</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDay && (
        <DayTradesModal
          dateStr={selectedDay.dateStr}
          summary={selectedDay.summary}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}
