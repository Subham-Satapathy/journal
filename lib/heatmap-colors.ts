import type { CSSProperties } from "react";

/** Continuous green/red heatmap colors scaled by P&L magnitude. */

export function getMaxAbsPnl(values: number[]): number {
  if (values.length === 0) return 1;
  const max = Math.max(...values.map((v) => Math.abs(v)));
  return max > 0 ? max : 1;
}

export function getPnlHeatStyle(
  pnl: number,
  hasData: boolean,
  maxAbsPnl: number
): CSSProperties {
  if (!hasData) {
    return { backgroundColor: "rgba(39, 39, 42, 0.45)" };
  }

  const ratio = Math.min(1, Math.abs(pnl) / maxAbsPnl);
  // Small P&L = lighter, large P&L = darker/saturated
  const alpha = 0.18 + ratio * 0.82;

  if (pnl > 0) {
    // emerald: light mint → deep green
    const g = Math.round(180 - ratio * 100);
    return { backgroundColor: `rgba(16, ${g}, 129, ${alpha})` };
  }
  if (pnl < 0) {
    // red: light pink → deep red
    const r = Math.round(200 + ratio * 39);
    return { backgroundColor: `rgba(${r}, 68, 68, ${alpha})` };
  }

  return { backgroundColor: "rgba(82, 82, 91, 0.6)" };
}

export function getPnlHeatTextClass(pnl: number, hasData: boolean, maxAbsPnl: number): string {
  if (!hasData) return "";
  const ratio = Math.min(1, Math.abs(pnl) / maxAbsPnl);
  if (ratio > 0.45) return "text-white";
  if (pnl > 0) return "text-emerald-100";
  if (pnl < 0) return "text-red-100";
  return "text-zinc-300";
}
