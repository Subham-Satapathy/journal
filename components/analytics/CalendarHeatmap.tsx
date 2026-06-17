"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { format, eachDayOfInterval, getDay, startOfWeek } from "date-fns";
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
const DAYS = ["", "M", "", "W", "", "F", ""];

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
      const from = `${dateStr}T00:00:00.000Z`;
      const to = `${dateStr}T23:59:59.999Z`;
      const res = await fetch(`/api/trades?from=${from}&to=${to}&limit=200`);
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
  const displayDate = new Date(dateStr + "T12:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
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
        <div className="overflow-y-auto flex-1 p-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading trades...</span>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-600">No trades found for this day</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-950">
                <tr className="text-zinc-600 border-b border-zinc-800/60">
                  <th className="text-left py-2 px-2 font-medium">#</th>
                  <th className="text-left py-2 px-2 font-medium">Symbol</th>
                  <th className="text-left py-2 px-2 font-medium">Side</th>
                  <th className="text-right py-2 px-2 font-medium">Amount</th>
                  <th className="text-right py-2 px-2 font-medium">P&L</th>
                  <th className="text-right py-2 px-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, idx) => {
                  const win = (t.pnl ?? 0) >= 0;
                  const isCall = ["BUY", "CALL", "LONG"].includes(t.side.toUpperCase());
                  return (
                    <tr key={t.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/40 transition-colors">
                      <td className="py-2 px-2 text-zinc-700">{idx + 1}</td>
                      <td className="py-2 px-2 font-medium text-white">{t.symbol}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isCall ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                        }`}>
                          {isCall ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {t.side}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-zinc-400">{fmt(t.quantity)}</td>
                      <td className={`py-2 px-2 text-right font-semibold ${win ? "text-emerald-400" : "text-red-400"}`}>
                        {t.pnl !== null ? fmt(t.pnl) : "—"}
                      </td>
                      <td className="py-2 px-2 text-right text-zinc-600">
                        {new Date(t.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {trades.length > 1 && (
                <tfoot className="sticky bottom-0 bg-zinc-950">
                  <tr className="border-t border-zinc-800">
                    <td colSpan={4} className="py-2 px-2 text-zinc-600 text-xs">Total</td>
                    <td className={`py-2 px-2 text-right font-bold text-xs ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
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
      week.push({ date: day, dayStr: format(day, "yyyy-MM-dd") });
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
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Trading Calendar — P&L Heatmap{" "}
            <span className="text-zinc-600 font-normal text-sm">(last 12 months · click a day)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Month labels */}
            <div className="flex mb-1 ml-6">
              {monthLabels.map(({ month, col }, idx) => (
                <div
                  key={`${month}-${idx}`}
                  className="text-[10px] text-zinc-500 absolute"
                  style={{ left: `${col * 14 + 24}px`, position: "relative", minWidth: 0 }}
                >
                  {month}
                </div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="w-3 h-3 flex items-center justify-center text-[9px] text-zinc-600">{d}</div>
                ))}
              </div>

              {/* Weeks */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-3 h-3" />;
                    const d = dataMap.get(day.dayStr);
                    const hasTrades = !!d && d.count > 0;
                    const color = getCellColor(d?.pnl ?? 0, hasTrades);
                    return (
                      <div
                        key={di}
                        onClick={() => hasTrades && d && setSelectedDay({ dateStr: day.dayStr, summary: d })}
                        className={`w-3 h-3 rounded-sm ${color} transition-transform hover:scale-125 ${
                          hasTrades ? "cursor-pointer ring-0 hover:ring-1 hover:ring-white/40" : "cursor-default"
                        }`}
                        title={`${day.dayStr}: ${d && hasTrades ? `${d.count} trade(s), ${fmt(d.pnl)}` : "No trades"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-500">
              <span>Less</span>
              {["bg-zinc-800/50", "bg-red-500/40", "bg-red-500/80", "bg-emerald-500/40", "bg-emerald-500/80", "bg-emerald-500"].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
              <span>More</span>
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
