import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CurrencyProvider } from "@/lib/currency-context";
import { getSiteUrl, siteConfig } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.title} | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "pocket option trading journal",
    "trading journal",
    "binary options journal",
    "trade analytics",
    "trade tracker",
    "trading psychology",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
  },
  category: "finance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: siteConfig.description,
  };

  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} bg-zinc-950 text-zinc-100 antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <CurrencyProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-h-screen min-w-0 ml-0 md:ml-56 pb-20 md:pb-0 overflow-x-hidden">
              <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {children}
              </div>
            </main>
            <MobileNav />
          </div>
        </CurrencyProvider>
      </body>
    </html>
  );
}
