import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/lib/currency-context";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { AppFrame } from "@/components/layout/AppFrame";

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
          <AppFrame>{children}</AppFrame>
        </CurrencyProvider>
      </body>
    </html>
  );
}
