import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CurrencyProvider } from "@/lib/currency-context";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { AppFrame } from "@/components/layout/AppFrame";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });
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
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
    images: [
      {
        url: "/logo.png?v=20260706t1823",
        width: 1024,
        height: 1024,
        alt: "Pnlogix logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
    images: ["/logo.png?v=20260706t1823"],
  },
  icons: {
    icon: "/favicon.ico?v=20260706t1834",
    shortcut: "/favicon.ico?v=20260706t1834",
    apple: "/favicon.ico?v=20260706t1834",
  },
  category: "finance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-WJST62K8WJ";
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
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans bg-zinc-950 text-zinc-100 antialiased`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <CurrencyProvider>
          <AppFrame>{children}</AppFrame>
        </CurrencyProvider>
        <Analytics />
      </body>
    </html>
  );
}
