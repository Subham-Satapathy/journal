"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Upload, BarChart3, Brain, CreditCard, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/trades", icon: List, label: "Trades" },
  { href: "/import", icon: Upload, label: "Import" },
  { href: "/analytics", icon: BarChart3, label: "Stats" },
  { href: "/insights", icon: Brain, label: "AI" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/pricing", icon: BadgeDollarSign, label: "Plans" },
];

export function MobileNav() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup" || pathname === "/" || pathname === "/pricing") return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-stretch justify-around px-1 pt-1 pb-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg transition-colors min-w-0",
                active ? "text-indigo-400" : "text-zinc-500"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "text-indigo-400")} />
              <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
