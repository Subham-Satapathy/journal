"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentalStateMetrics } from "@/lib/analytics";
import { Brain, Flame, AlertTriangle, TrendingUp, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#27272a" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  const badges: Record<string, { icon: string; bg: string; text: string }> = {
    "Discipline Master": { icon: "🏆", bg: "bg-amber-500/15", text: "text-amber-400" },
    "Good Trader": { icon: "⭐", bg: "bg-emerald-500/15", text: "text-emerald-400" },
    "Developing": { icon: "📈", bg: "bg-blue-500/15", text: "text-blue-400" },
    "Needs Work": { icon: "⚠️", bg: "bg-orange-500/15", text: "text-orange-400" },
    "High Risk": { icon: "🔴", bg: "bg-red-500/15", text: "text-red-400" },
  };
  const b = badges[label] || badges["Developing"];
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", b.bg, b.text)}>
      <span>{b.icon}</span> {label}
    </div>
  );
}

function getPsychBadge(score: number) {
  if (score >= 85) return "Discipline Master";
  if (score >= 70) return "Good Trader";
  if (score >= 55) return "Developing";
  if (score >= 40) return "Needs Work";
  return "High Risk";
}

export function MentalStateCard({ data }: { data: MentalStateMetrics }) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <CardTitle className="text-base font-semibold text-white">Mental State & Psychology Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scores */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6">
              <ScoreRing score={data.psychologyScore} label="Psychology" color="#a855f7" />
            </div>
            <Badge label={getPsychBadge(data.psychologyScore)} color="" />
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">{data.revengeTradingInstances}</div>
                <div className="text-xs text-zinc-500">Revenge trade instances</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">{data.overtradingDays}</div>
                <div className="text-xs text-zinc-500">Overtrading days (&gt;6 trades)</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">{data.avgTradesPerDay.toFixed(1)} / day</div>
                <div className="text-xs text-zinc-500">Avg trades per day</div>
              </div>
            </div>
          </div>

          {/* Best/Worst patterns */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="flex gap-2 text-xs">
                  <span className="text-emerald-400 font-medium">Best: {data.bestDayOfWeek}</span>
                  <span className="text-red-400 font-medium">Worst: {data.worstDayOfWeek}</span>
                </div>
                <div className="text-xs text-zinc-500">Best/worst day of week</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-emerald-400 font-medium">
                  Best hours: {data.profitableHours.map((h) => `${h}:00`).join(", ") || "N/A"}
                </div>
                <div className="text-xs text-red-400 font-medium">
                  Avoid: {data.worstHours.map((h) => `${h}:00`).join(", ") || "N/A"}
                </div>
              </div>
            </div>
            {data.alerts.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                {data.alerts.map((a, i) => (
                  <div key={i} className="text-xs text-amber-300">{a}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
