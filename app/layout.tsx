import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { CurrencyProvider } from "@/lib/currency-context";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "TradeJournal — Personal Trading Ledger",
  description: "AI-powered trading journal with advanced analytics and psychology insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} bg-zinc-950 text-zinc-100 antialiased`}>
        <CurrencyProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-56 min-h-screen">
              <div className="max-w-7xl mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  );
}
