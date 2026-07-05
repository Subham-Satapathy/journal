"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <Sidebar />}
      <main
        className={cn(
          "flex-1 min-h-screen min-w-0 overflow-x-hidden",
          isAuthPage ? "ml-0 pb-0" : "ml-0 md:ml-56 pb-20 md:pb-0"
        )}
      >
        <div className={cn("max-w-7xl mx-auto", isAuthPage ? "p-4 sm:p-6" : "p-4 sm:p-6")}>{children}</div>
      </main>
      {!isAuthPage && <MobileNav />}
    </div>
  );
}
