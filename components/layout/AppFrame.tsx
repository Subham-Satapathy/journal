"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/verify-email";
  const isMarketingPage = pathname === "/" || pathname === "/pricing";
  const showShellNav = !isAuthPage && !isMarketingPage;
  const showBackButton = pathname !== "/";

  return (
    <div className="flex min-h-screen">
      {showShellNav && <Sidebar />}
      <main
        className={cn(
          "flex-1 min-h-screen min-w-0 overflow-x-hidden",
          showShellNav ? "ml-0 md:ml-56 pb-20 md:pb-0" : "ml-0 pb-0"
        )}
      >
        <div className="w-full p-4 sm:p-6">
          {showBackButton && (
            <div className="mb-3 sm:mb-4">
              <BackButton fallbackHref={showShellNav ? "/dashboard" : "/"} />
            </div>
          )}
          {children}
        </div>
      </main>
      {showShellNav && <MobileNav />}
    </div>
  );
}
