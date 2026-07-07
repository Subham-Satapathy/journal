import { Trade } from "@prisma/client";
import {
  getISTDateKey,
  getISTWeekKey,
  getISTMonthKey,
  getISTHour,
  getISTDay,
  formatDateTimeISTExport,
} from "@/lib/datetime";

export interface DailyPnl {
  date: string;
  pnl: number;
  trades: number;
  cumulative: number;
}

export interface WeeklyPnl {
  week: string;
  pnl: number;
  trades: number;
  cumulative: number;
}

export interface MonthlyPnl {
  month: string;
  pnl: number;
  trades: number;
  cumulative: number;
}

export interface HeatmapCell {
  hour: number;
  day: number;
  pnl: number;
  trades: number;
  winRate: number;
}

export interface OverviewStats {
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  bestDay: number;
  maxDrawdown: number;
  profitFactor: number;
  avgRiskReward: number;
  totalFees: number;
  longWinRate: number;
  shortWinRate: number;
  currentStreak: number;
  currentStreakType: "win" | "loss" | "none";
  consistencyScore: number;
  disciplineScore: number;
}

export interface StreakData {
  current: number;
  type: "win" | "loss" | "none";
  longest: { wins: number; losses: number };
}

export interface MentalStateMetrics {
  revengeTradingInstances: number;
  overtradingDays: number;
  avgTradesPerDay: number;
  maxTradesInDay: number;
  profitableHours: number[];
  worstHours: number[];
  bestDayOfWeek: string;
  worstDayOfWeek: string;
  psychologyScore: number;
  alerts: string[];
}

export function computeOverviewStats(trades: Trade[]): OverviewStats {
  if (trades.length === 0) {
    return {
      totalPnl: 0, totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0,
      bestTrade: 0, worstTrade: 0, bestDay: 0, maxDrawdown: 0,
      profitFactor: 0, avgRiskReward: 0, totalFees: 0,
      longWinRate: 0, shortWinRate: 0, currentStreak: 0,
      currentStreakType: "none", consistencyScore: 0, disciplineScore: 0,
    };
  }

  const closedTrades = trades.filter((t) => t.pnl !== null);
  const pnls = closedTrades.map((t) => t.pnl!);
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);

  const totalPnl = pnls.reduce((a, b) => a + b, 0);
  const totalFees = trades.reduce((a, t) => a + (t.fees || 0), 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;
  const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
  const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

  // Best day & max drawdown — use IST daily equity (not per-trade, which inflates drawdown)
  const dailyPnl = groupByDay(closedTrades);
  const dailyEntries = Object.entries(dailyPnl)
    .map(([date, ts]) => ({ date, pnl: ts.reduce((a, t) => a + t.pnl!, 0) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const dailyTotals = dailyEntries.map((d) => d.pnl);
  const bestDay = dailyTotals.length > 0 ? Math.max(...dailyTotals) : 0;
  const maxDrawdown = computeMaxDrawdownDaily(dailyEntries);

  // Profit factor
  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Risk/Reward
  const avgRiskReward = avgLoss > 0 ? avgWin / avgLoss : 0;

  // Long/Short win rates
  const longs = closedTrades.filter((t) => ["LONG", "BUY", "CALL"].includes(t.side.toUpperCase()));
  const shorts = closedTrades.filter((t) => ["SHORT", "SELL", "PUT"].includes(t.side.toUpperCase()));
  const longWinRate = longs.length > 0 ? (longs.filter((t) => t.pnl! > 0).length / longs.length) * 100 : 0;
  const shortWinRate = shorts.length > 0 ? (shorts.filter((t) => t.pnl! > 0).length / shorts.length) * 100 : 0;

  // Streaks
  const streak = computeStreak(closedTrades);

  // Consistency: % of profitable days
  const profitableDays = dailyTotals.filter((d) => d > 0).length;
  const consistencyScore = dailyTotals.length > 0 ? (profitableDays / dailyTotals.length) * 100 : 0;

  // Discipline score (simplified)
  const disciplineScore = computeDisciplineScore(closedTrades, winRate, profitFactor, consistencyScore);

  return {
    totalPnl, totalTrades: trades.length, winRate, avgWin, avgLoss,
    bestTrade, worstTrade, bestDay, maxDrawdown, profitFactor,
    avgRiskReward, totalFees, longWinRate, shortWinRate,
    currentStreak: streak.current, currentStreakType: streak.type,
    consistencyScore, disciplineScore,
  };
}

/** Max drawdown on daily IST equity curve (peak-to-trough). */
function computeMaxDrawdownDaily(dailyEntries: Array<{ date: string; pnl: number }>): number {
  let peak = 0;
  let maxDD = 0;
  let running = 0;
  for (const { pnl } of dailyEntries) {
    running += pnl;
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

function computeStreak(trades: Trade[]): StreakData {
  // Streak is defined by net result per day (user-approved rule):
  // each day contributes one outcome: win (net > 0) or loss (net < 0).
  const dailyMap = new Map<string, number>();
  for (const t of trades) {
    if (t.pnl === null) continue;
    const key = getISTDateKey(new Date(t.closeDate ?? t.date));
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + t.pnl);
  }
  const dailyOutcomes = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, pnl]) => pnl)
    .filter((pnl) => pnl !== 0);

  let current = 0;
  let type: "win" | "loss" | "none" = "none";
  let longestWins = 0;
  let longestLosses = 0;
  let tempStreak = 0;
  let tempType: "win" | "loss" | "none" = "none";

  for (const pnl of dailyOutcomes) {
    const isWin = pnl > 0;
    const thisType: "win" | "loss" = isWin ? "win" : "loss";

    if (tempType === thisType) {
      tempStreak++;
    } else {
      if (tempType === "win") longestWins = Math.max(longestWins, tempStreak);
      if (tempType === "loss") longestLosses = Math.max(longestLosses, tempStreak);
      tempType = thisType;
      tempStreak = 1;
    }
  }
  if (tempType === "win") longestWins = Math.max(longestWins, tempStreak);
  if (tempType === "loss") longestLosses = Math.max(longestLosses, tempStreak);

  if (dailyOutcomes.length > 0) {
    current = tempStreak;
    type = tempType;
  }

  return { current, type, longest: { wins: longestWins, losses: longestLosses } };
}

function computeDisciplineScore(
  trades: Trade[],
  winRate: number,
  profitFactor: number,
  consistencyScore: number
): number {
  let score = 0;

  // Win rate contribution (max 30)
  score += Math.min(30, (winRate / 100) * 30);

  // Profit factor contribution (max 25)
  if (profitFactor >= 2) score += 25;
  else if (profitFactor >= 1.5) score += 20;
  else if (profitFactor >= 1) score += 10;

  // Consistency contribution (max 25)
  score += Math.min(25, (consistencyScore / 100) * 25);

  // Penalty for overtrading (max -10)
  const dailyGroups = groupByDay(trades);
  const dailyCounts = Object.values(dailyGroups).map((ts) => ts.length);
  const avgPerDay = dailyCounts.reduce((a, b) => a + b, 0) / (dailyCounts.length || 1);
  if (avgPerDay > 10) score -= 10;
  else if (avgPerDay > 6) score -= 5;

  // Consistency bonus (max 20)
  score += Math.min(20, (consistencyScore / 100) * 20);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function groupByDay(trades: Trade[]): Record<string, Trade[]> {
  return trades.reduce<Record<string, Trade[]>>((acc, t) => {
    const key = getISTDateKey(new Date(t.date));
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
}

export function computeDailyPnl(trades: Trade[], days = 90): DailyPnl[] {
  const closedTrades = trades.filter((t) => t.pnl !== null);
  const grouped = groupByDay(closedTrades);

  const sorted = Object.entries(grouped)
    .map(([date, ts]) => ({
      date,
      pnl: ts.reduce((a, t) => a + t.pnl!, 0),
      trades: ts.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);

  let cumulative = 0;
  return sorted.map((d) => {
    cumulative += d.pnl;
    return { ...d, cumulative };
  });
}

export function computeWeeklyPnl(trades: Trade[]): WeeklyPnl[] {
  const closedTrades = trades.filter((t) => t.pnl !== null);
  const grouped = closedTrades.reduce<Record<string, Trade[]>>((acc, t) => {
    const key = getISTWeekKey(new Date(t.date));
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  let cumulative = 0;
  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, ts]) => {
      const pnl = ts.reduce((a, t) => a + t.pnl!, 0);
      cumulative += pnl;
      return { week, pnl, trades: ts.length, cumulative };
    });
}

export function computeMonthlyPnl(trades: Trade[]): MonthlyPnl[] {
  const closedTrades = trades.filter((t) => t.pnl !== null);
  const grouped = closedTrades.reduce<Record<string, Trade[]>>((acc, t) => {
    const key = getISTMonthKey(new Date(t.date));
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  let cumulative = 0;
  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, ts]) => {
      const pnl = ts.reduce((a, t) => a + t.pnl!, 0);
      cumulative += pnl;
      return { month, pnl, trades: ts.length, cumulative };
    });
}

export function computeHourDayHeatmap(trades: Trade[]): HeatmapCell[] {
  const closedTrades = trades.filter((t) => t.pnl !== null);
  const cells: Record<string, { pnl: number; trades: number; wins: number }> = {};

  for (const t of closedTrades) {
    const d = new Date(t.date);
    const hour = getISTHour(d);
    const day = getISTDay(d);
    const key = `${day}-${hour}`;
    if (!cells[key]) cells[key] = { pnl: 0, trades: 0, wins: 0 };
    cells[key].pnl += t.pnl!;
    cells[key].trades++;
    if (t.pnl! > 0) cells[key].wins++;
  }

  return Object.entries(cells).map(([key, val]) => {
    const [day, hour] = key.split("-").map(Number);
    return {
      hour,
      day,
      pnl: val.pnl,
      trades: val.trades,
      winRate: val.trades > 0 ? (val.wins / val.trades) * 100 : 0,
    };
  });
}

export function computeMentalStateMetrics(trades: Trade[]): MentalStateMetrics {
  const closedTrades = trades.filter((t) => t.pnl !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const alerts: string[] = [];

  // Revenge trading: big loss followed by immediate trade with larger position
  let revengeTradingInstances = 0;
  for (let i = 1; i < closedTrades.length; i++) {
    const prev = closedTrades[i - 1];
    const curr = closedTrades[i];
    const timeDiff = new Date(curr.date).getTime() - new Date(prev.date).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    if (prev.pnl! < -50 && hoursDiff < 2 && curr.quantity > prev.quantity * 1.5) {
      revengeTradingInstances++;
    }
  }
  if (revengeTradingInstances > 0) {
    alerts.push(`⚠️ ${revengeTradingInstances} potential revenge trade(s) detected`);
  }

  // Overtrading days (>6 trades/day is a flag)
  const dailyGroups = groupByDay(closedTrades);
  const dailyCounts = Object.values(dailyGroups).map((ts) => ts.length);
  const overtradingDays = dailyCounts.filter((c) => c > 6).length;
  const maxTradesInDay = dailyCounts.length > 0 ? Math.max(...dailyCounts) : 0;
  const avgTradesPerDay = dailyCounts.length > 0
    ? dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length
    : 0;

  if (overtradingDays > 0) {
    alerts.push(`⚠️ ${overtradingDays} overtrading day(s) detected (>6 trades)`);
  }

  // Hour performance
  const hourPnl: Record<number, number> = {};
  const hourTrades: Record<number, number> = {};
  for (const t of closedTrades) {
    const h = getISTHour(new Date(t.date));
    hourPnl[h] = (hourPnl[h] || 0) + t.pnl!;
    hourTrades[h] = (hourTrades[h] || 0) + 1;
  }
  const hourEntries = Object.entries(hourPnl).sort((a, b) => b[1] - a[1]);
  const profitableHours = hourEntries.filter(([, v]) => v > 0).slice(0, 3).map(([h]) => Number(h));
  const worstHours = hourEntries.filter(([, v]) => v < 0).slice(-3).map(([h]) => Number(h));

  // Day of week performance
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayPnl: Record<number, number> = {};
  for (const t of closedTrades) {
    const d = getISTDay(new Date(t.date));
    dayPnl[d] = (dayPnl[d] || 0) + t.pnl!;
  }
  const dayEntries = Object.entries(dayPnl).sort((a, b) => b[1] - a[1]);
  const bestDayOfWeek = dayNames[Number(dayEntries[0]?.[0])] || "N/A";
  const worstDayOfWeek = dayNames[Number(dayEntries[dayEntries.length - 1]?.[0])] || "N/A";

  // Psychology score
  let psych = 70;
  psych -= revengeTradingInstances * 10;
  psych -= overtradingDays * 5;
  const totalPnl = closedTrades.reduce((a, t) => a + t.pnl!, 0);
  if (totalPnl > 0) psych += 10;
  if (avgTradesPerDay < 3) psych += 10;
  const psychologyScore = Math.max(0, Math.min(100, Math.round(psych)));

  return {
    revengeTradingInstances,
    overtradingDays,
    avgTradesPerDay,
    maxTradesInDay,
    profitableHours,
    worstHours,
    bestDayOfWeek,
    worstDayOfWeek,
    psychologyScore,
    alerts,
  };
}

export function computeCalendarData(trades: Trade[]): Array<{ date: string; count: number; pnl: number }> {
  const closedTrades = trades.filter((t) => t.pnl !== null);
  const grouped = groupByDay(closedTrades);
  return Object.entries(grouped).map(([date, ts]) => ({
    date,
    count: ts.length,
    pnl: ts.reduce((a, t) => a + t.pnl!, 0),
  }));
}

export function computeEquityCurve(trades: Trade[]): Array<{ date: string; equity: number; drawdown: number }> {
  const closedTrades = trades
    .filter((t) => t.pnl !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let equity = 0;
  let peak = 0;
  return closedTrades.map((t) => {
    equity += t.pnl!;
    if (equity > peak) peak = equity;
    const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    return {
      date: formatDateTimeISTExport(new Date(t.date)),
      equity,
      drawdown,
    };
  });
}

export function computeSymbolDistribution(trades: Trade[]): Array<{ symbol: string; count: number; pnl: number }> {
  const closedTrades = trades.filter((t) => t.pnl !== null);
  const grouped = closedTrades.reduce<Record<string, { count: number; pnl: number }>>((acc, t) => {
    if (!acc[t.symbol]) acc[t.symbol] = { count: 0, pnl: 0 };
    acc[t.symbol].count++;
    acc[t.symbol].pnl += t.pnl!;
    return acc;
  }, {});
  return Object.entries(grouped)
    .map(([symbol, val]) => ({ symbol, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
