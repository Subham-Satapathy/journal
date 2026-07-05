"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Upload,
  BarChart3,
  Brain,
  BadgeDollarSign,
  CreditCard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency, type Currency } from "@/lib/currency-context";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trades", icon: List, label: "Trades" },
  { href: "/import", icon: Upload, label: "Import" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/insights", icon: Brain, label: "AI Insights" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/pricing", icon: BadgeDollarSign, label: "Pricing" },
];

function SidebarCurrencyWidget() {
  const { displayCurrency, setDisplayCurrency, rate, mixedCurrencies } = useCurrency();

  return (
    <div className="px-3 py-3 border-t border-zinc-800/50 space-y-2">
      <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium px-1">Display</div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-zinc-500">Show as</span>
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-md p-0.5 gap-0.5">
            {(["USDT", "INR"] as Currency[]).map((c) => (
              <button key={c} onClick={() => setDisplayCurrency(c)}
                className={cn("px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                  displayCurrency === c
                    ? c === "INR" ? "bg-orange-600 text-white" : "bg-indigo-600 text-white"
                    : "text-zinc-600 hover:text-zinc-400"
                )}>
                {c === "INR" ? "₹" : "$"}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-zinc-700 px-1 text-center">1$ = ₹{rate.toFixed(1)}</div>
        {mixedCurrencies && (
          <div className="text-[9px] text-zinc-600 px-1 text-center leading-tight">USD & INR trades converted</div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup" || pathname === "/verify-email" || pathname === "/" || pathname === "/pricing") return null;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-zinc-950 border-r border-zinc-800/50 flex-col z-50">
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Pnlogix logo" className="w-8 h-8 rounded-md border border-zinc-700/60" />
          <div>
            <div className="text-sm font-bold text-white">Pnlogix</div>
            <div className="text-[10px] text-zinc-500">Personal Ledger</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-600/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Currency Widget */}
      <SidebarCurrencyWidget />

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg hover:border-zinc-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
        <div className="text-[10px] text-zinc-700 text-center">Pnlogix v1.0</div>
      </div>
    </aside>
  );
}
