export type StreakKind = "win" | "loss" | "none";

export interface DayPnlPoint {
  date: string;
  pnl: number;
}

export interface DayStreakStats {
  current: number;
  type: StreakKind;
  longest: {
    wins: number;
    losses: number;
  };
}

export function computeStreakFromDailySeries(days: DayPnlPoint[]): DayStreakStats {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const outcomes = sorted
    .map((d) => (d.pnl > 0 ? "win" : d.pnl < 0 ? "loss" : "none"))
    .filter((s): s is "win" | "loss" => s !== "none");

  if (outcomes.length === 0) {
    return { current: 0, type: "none", longest: { wins: 0, losses: 0 } };
  }

  let currentType: "win" | "loss" = outcomes[0];
  let currentLen = 1;
  let longestWins = currentType === "win" ? 1 : 0;
  let longestLosses = currentType === "loss" ? 1 : 0;

  for (let i = 1; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    if (outcome === currentType) {
      currentLen++;
    } else {
      if (currentType === "win") longestWins = Math.max(longestWins, currentLen);
      else longestLosses = Math.max(longestLosses, currentLen);
      currentType = outcome;
      currentLen = 1;
    }
  }

  if (currentType === "win") longestWins = Math.max(longestWins, currentLen);
  else longestLosses = Math.max(longestLosses, currentLen);

  return {
    current: currentLen,
    type: currentType,
    longest: { wins: longestWins, losses: longestLosses },
  };
}
