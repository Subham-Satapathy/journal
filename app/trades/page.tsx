"use client";
import { TradesTable } from "@/components/trades/TradesTable";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function TradesPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Trade History</h1>
            <p className="text-sm text-zinc-500 mt-0.5">All your recorded trades</p>
          </div>
          <Link
            href="/import"
            className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" /> Import
          </Link>
        </div>
        <div className="md:hidden">
          <CurrencyToggle />
        </div>
      </div>
      <TradesTable />
    </div>
  );
}
