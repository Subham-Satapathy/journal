"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPercent, pnlColor } from "@/lib/utils";
import { useCurrency } from "@/lib/currency-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTimeIST } from "@/lib/datetime";
import { Trash2, ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  pnl: number | null;
  pnlPercent: number | null;
  fees: number;
  date: string;
  exchange: string | null;
  tags: string | null;
  notes: string | null;
  importSource: string | null;
}

export function TradesTable() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { fmt } = useCurrency();
  const limit = 20;

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("symbol", search);
      if (sideFilter) params.set("side", sideFilter);
      const res = await fetch(`/api/trades?${params}`);
      const data = await res.json();
      setTrades(data.trades || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, sideFilter]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} trade(s)?`)) return;
    await fetch(`/api/trades?ids=${[...selected].join(",")}`, { method: "DELETE" });
    setSelected(new Set());
    fetchTrades();
  };

  const exportCsv = () => window.open("/api/export", "_blank");

  const totalPages = Math.ceil(total / limit);

  const sideBadgeClass = (side: string) =>
    cn(
      "px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium shrink-0",
      ["LONG", "BUY", "CALL"].includes(side.toUpperCase())
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-red-500/15 text-red-400"
    );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search symbol..."
            className="bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none flex-1"
          />
        </div>
        <select
          value={sideFilter}
          onChange={(e) => { setSideFilter(e.target.value); setPage(1); }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none cursor-pointer"
        >
          <option value="">All sides</option>
          <option value="CALL">Call</option>
          <option value="PUT">Put</option>
          <option value="BUY">Buy / Long</option>
          <option value="SELL">Sell / Short</option>
        </select>
        {selected.size > 0 && (
          <Button variant="danger" size="sm" onClick={deleteSelected}>
            <Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Mobile card list */}
      <div className="lg:hidden space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 animate-pulse space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-2/3" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
            </div>
          ))
        ) : trades.length === 0 ? (
          <Card className="p-8 text-center text-zinc-600 text-sm">
            No trades found. Import some trades to get started.
          </Card>
        ) : (
          trades.map((t) => (
            <Card
              key={t.id}
              className={cn(
                "p-3 transition-colors",
                selected.has(t.id) && "border-indigo-500/40 bg-indigo-500/5"
              )}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSelect(t.id)}
                  className="accent-indigo-500 mt-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-white text-sm truncate">{t.symbol}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{formatDateTimeIST(t.date)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={sideBadgeClass(t.side)}>{t.side}</span>
                      <span className={cn("text-sm font-semibold font-mono tabular-nums", pnlColor(t.pnl ?? 0))}>
                        {t.pnl !== null ? fmt(t.pnl) : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <div className="text-zinc-600">Entry</div>
                      <div className="text-zinc-300 font-mono tabular-nums">{fmt(t.entryPrice)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600">Exit</div>
                      <div className="text-zinc-400 font-mono tabular-nums">
                        {t.exitPrice ? fmt(t.exitPrice) : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-600">Qty</div>
                      <div className="text-zinc-400">{t.quantity}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-3 text-zinc-500">
                      <span className={pnlColor(t.pnlPercent ?? 0)}>
                        {t.pnlPercent !== null ? formatPercent(t.pnlPercent) : "—"}
                      </span>
                      {t.fees > 0 && <span>Fees {fmt(t.fees)}</span>}
                      {t.importSource && (
                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">{t.importSource}</span>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this trade?")) return;
                        await fetch(`/api/trades/${t.id}`, { method: "DELETE" });
                        fetchTrades();
                      }}
                      className="p-1.5 hover:text-red-400 text-zinc-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table */}
      <Card className="overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === trades.length && trades.length > 0}
                    onChange={() => {
                      if (selected.size === trades.length) setSelected(new Set());
                      else setSelected(new Set(trades.map((t) => t.id)));
                    }}
                    className="accent-indigo-500"
                  />
                </th>
                {["Date (IST)", "Symbol", "Side", "Entry", "Exit", "Qty", "P&L", "P&L%", "Fees", "Source"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
                <th className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-zinc-600">
                    No trades found. Import some trades to get started.
                  </td>
                </tr>
              ) : (
                trades.map((t) => (
                  <tr
                    key={t.id}
                    className={cn(
                      "border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors",
                      selected.has(t.id) && "bg-indigo-500/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="accent-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-3 text-zinc-400 whitespace-nowrap">
                      {formatDateTimeIST(t.date)}
                    </td>
                    <td className="px-3 py-3 font-mono font-medium text-white">{t.symbol}</td>
                    <td className="px-3 py-3">
                      <span className={sideBadgeClass(t.side)}>
                        {t.side}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-zinc-300 font-mono">{fmt(t.entryPrice)}</td>
                    <td className="px-3 py-3 text-zinc-400 font-mono">
                      {t.exitPrice ? fmt(t.exitPrice) : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-3 py-3 text-zinc-400">{t.quantity}</td>
                    <td className={cn("px-3 py-3 font-medium font-mono", pnlColor(t.pnl ?? 0))}>
                      {t.pnl !== null ? fmt(t.pnl) : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className={cn("px-3 py-3 text-xs", pnlColor(t.pnlPercent ?? 0))}>
                      {t.pnlPercent !== null ? formatPercent(t.pnlPercent) : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-3 py-3 text-zinc-600 text-xs">{t.fees > 0 ? fmt(t.fees) : "—"}</td>
                    <td className="px-3 py-3">
                      {t.importSource && (
                        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {t.importSource}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this trade?")) return;
                          await fetch(`/api/trades/${t.id}`, { method: "DELETE" });
                          fetchTrades();
                        }}
                        className="p-1 hover:text-red-400 text-zinc-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-2">
          <span className="text-xs text-zinc-500">{total} total trades</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-zinc-400">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {totalPages <= 1 && total > 0 && (
        <p className="text-xs text-zinc-500 text-center lg:hidden">{total} total trades</p>
      )}
    </div>
  );
}
