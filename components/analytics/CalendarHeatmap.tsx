"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, getDay, startOfWeek, subYears } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency-context";

interface CalendarDay {
  date: string;
  count: number;
  pnl: number;
}

interface CalendarHeatmapProps {
  data: CalendarDay[];
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

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const { fmt } = useCurrency();
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    // Show last 12 months of data so older trades are visible
    const adjustedStart = startOfWeek(
      new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
      { weekStartsOn: 1 }
    );
    const end = today;

    const days = eachDayOfInterval({ start: adjustedStart, end });
    const dataMap = new Map(data.map((d) => [d.date, d]));

    const weeksArr: Array<Array<{ date: Date; dayStr: string } | null>> = [];
    let week: Array<{ date: Date; dayStr: string } | null> = [];

    // Pad start
    const firstDay = getDay(adjustedStart);
    const mondayAdj = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < mondayAdj; i++) week.push(null);

    for (const day of days) {
      week.push({ date: day, dayStr: format(day, "yyyy-MM-dd") });
      if (week.length === 7) {
        weeksArr.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeksArr.push(week);
    }

    // Month labels
    const labels: Array<{ month: string; col: number }> = [];
    let lastMonth = -1;
    for (let i = 0; i < weeksArr.length; i++) {
      const firstValid = weeksArr[i].find((d) => d !== null);
      if (firstValid) {
        const m = firstValid.date.getMonth();
        if (m !== lastMonth) {
          labels.push({ month: MONTHS[m], col: i });
          lastMonth = m;
        }
      }
    }

    return { weeks: weeksArr, monthLabels: labels, dataMap };
  }, [data]);

  const dataMap = useMemo(() => new Map(data.map((d) => [d.date, d])), [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white">Trading Calendar — P&L Heatmap <span className="text-zinc-600 font-normal text-sm">(last 12 months)</span></CardTitle>
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
                <div key={i} className="w-3 h-3 flex items-center justify-center text-[9px] text-zinc-600">
                  {d}
                </div>
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
                      className={`w-3 h-3 rounded-sm ${color} cursor-pointer transition-transform hover:scale-125 group relative`}
                      title={`${day.dayStr}: ${d ? `${d.count} trade(s), ${fmt(d.pnl)}` : "No trades"}`}
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
  );
}
