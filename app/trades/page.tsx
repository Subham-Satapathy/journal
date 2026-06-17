"use client";
import { TradesTable } from "@/components/trades/TradesTable";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function TradesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade History</h1>
          <p className="text-sm text-zinc-500 mt-0.5">All your recorded trades</p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyToggle />
          <Link
            href="/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" /> Import Trades
          </Link>
        </div>
      </div>
      <TradesTable />
    </div>
  );
}
