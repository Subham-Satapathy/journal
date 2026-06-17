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

      {/* Table */}
      <Card className="overflow-hidden">
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
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        ["LONG", "BUY", "CALL"].includes(t.side.toUpperCase())
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      )}>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
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
      </Card>
    </div>
  );
}
