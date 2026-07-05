const DEFAULT_SITE_URL = "https://tradejournal.so";

export const siteConfig = {
  name: "TradeJournal",
  title: "Pocket Option Trading Journal",
  description:
    "Track imported trades, analyze performance, and improve discipline with AI-powered trading journal analytics.",
  url: DEFAULT_SITE_URL,
  locale: "en_US",
};

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return siteConfig.url;

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, "");
  } catch {
    return siteConfig.url;
  }
}
