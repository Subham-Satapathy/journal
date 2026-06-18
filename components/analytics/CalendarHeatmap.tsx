"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { eachDayOfInterval, getDay, startOfWeek } from "date-fns";
import { formatISTDateKey, formatTimeIST, istDayRangeUTC, getISTDateKey } from "@/lib/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";
import { X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { getMaxAbsPnl, getPnlHeatStyle } from "@/lib/heatmap-colors";

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

function HeatmapLegend({ maxAbsPnl }: { maxAbsPnl: number }) {
  const steps = 7;
  return (
    <div className="flex items-center gap-2 sm:gap-3 mt-4 ml-8 md:ml-9 text-[10px] sm:text-[11px] text-zinc-500 flex-wrap">
      <span>Loss</span>
      <div className="flex h-3.5 sm:h-4 rounded overflow-hidden border border-zinc-800">
        {Array.from({ length: steps }).map((_, i) => {
          const pnl = -maxAbsPnl + (i / (steps - 1)) * maxAbsPnl * 2;
          return (
            <div
              key={i}
              className="w-5 sm:w-6"
              style={getPnlHeatStyle(pnl, true, maxAbsPnl)}
            />
          );
        })}
      </div>
      <span>Profit</span>
      <span className="text-zinc-700 md:hidden w-full">Swipe for earlier weeks →</span>
    </div>
  );
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
        <div className="overflow-y-auto flex-1 min-h-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading trades...</span>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-600">No trades found for this day</div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden px-4 py-3 space-y-2">
                {trades.map((t, idx) => {
                  const win = (t.pnl ?? 0) >= 0;
                  const isCall = ["BUY", "CALL", "LONG"].includes(t.side.toUpperCase());
                  return (
                    <div
                      key={t.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-600 font-medium">#{idx + 1}</span>
                            <span className="font-medium text-white text-sm truncate">{t.symbol}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-1">{formatTimeIST(t.date)} IST</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isCall ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                          }`}>
                            {isCall ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {t.side}
                          </span>
                          <span className={`text-sm font-bold tabular-nums ${win ? "text-emerald-400" : "text-red-400"}`}>
                            {t.pnl !== null ? fmt(t.pnl) : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500">
                        Qty <span className="text-zinc-300">{t.quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: table */}
              <table className="hidden md:table w-full text-xs table-fixed">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const { fmt } = useCurrency();
  const [selectedDay, setSelectedDay] = useState<{ dateStr: string; summary: CalendarDay } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dataMap = useMemo(() => new Map(data.map((d) => [d.date, d])), [data]);
  const maxAbsPnl = useMemo(
    () => getMaxAbsPnl(data.filter((d) => d.count > 0).map((d) => d.pnl)),
    [data]
  );

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

    // Trim leading empty weeks so mobile view starts where trades exist
    let firstDataWeek = weeksArr.length;
    for (let wi = 0; wi < weeksArr.length; wi++) {
      const hasTrades = weeksArr[wi].some(
        (d) => d !== null && (dataMap.get(d.dayStr)?.count ?? 0) > 0
      );
      if (hasTrades) {
        firstDataWeek = wi;
        break;
      }
    }
    const trimStart = firstDataWeek < weeksArr.length ? Math.max(0, firstDataWeek - 2) : 0;
    const weeksToShow = weeksArr.slice(trimStart);

    const labels: Array<{ month: string; col: number }> = [];
    let lastMonth = -1;
    for (let i = 0; i < weeksToShow.length; i++) {
      const firstValid = weeksToShow[i].find((d) => d !== null);
      if (firstValid) {
        const m = firstValid.date.getMonth();
        if (m !== lastMonth) { labels.push({ month: MONTHS[m], col: i }); lastMonth = m; }
      }
    }

    return { weeks: weeksToShow, monthLabels: labels };
  }, [dataMap]);

  // On mobile, scroll to the most recent data if the grid still overflows
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollToData = () => {
      if (window.innerWidth >= 768) return;
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    };
    scrollToData();
    const t = window.setTimeout(scrollToData, 50);
    return () => window.clearTimeout(t);
  }, [weeks, data]);

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
          <div
            ref={scrollRef}
            className="overflow-x-auto overscroll-x-contain touch-pan-x -mx-1 px-1 sm:mx-0 sm:px-0"
          >
            <div className="inline-block w-max">
              {/* Month labels — fixed column width at all breakpoints */}
              <div className="relative mb-2 ml-8 md:ml-9 h-4">
                {monthLabels.map(({ month, col }, idx) => (
                  <div
                    key={`${month}-${idx}`}
                    className="absolute text-[10px] md:text-[11px] text-zinc-500 font-medium whitespace-nowrap"
                    style={{ left: `calc(2rem + ${col} * 18px)` }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 w-8 shrink-0">
                  {DAY_LABELS.map((d, i) => (
                    <div
                      key={i}
                      className="h-[14px] md:h-[18px] flex items-center justify-end pr-1 text-[9px] sm:text-[10px] text-zinc-600 font-medium"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Weeks — fixed square cells (no flex-1 stretch on desktop) */}
                {weeks.map((week, wi) => (
                  <div
                    key={wi}
                    className="flex flex-col gap-1 w-[14px] md:w-[18px] shrink-0"
                  >
                    {week.map((day, di) => {
                      if (!day) {
                        return (
                          <div
                            key={di}
                            className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] shrink-0"
                          />
                        );
                      }
                      const d = dataMap.get(day.dayStr);
                      const hasTrades = !!d && d.count > 0;
                      const pnl = d?.pnl ?? 0;
                      return (
                        <div
                          key={di}
                          onClick={() => hasTrades && d && setSelectedDay({ dateStr: day.dayStr, summary: d })}
                          style={getPnlHeatStyle(pnl, hasTrades, maxAbsPnl)}
                          className={`w-[14px] h-[14px] md:w-[18px] md:h-[18px] shrink-0 rounded-sm transition-all ${
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

              <HeatmapLegend maxAbsPnl={maxAbsPnl} />
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
