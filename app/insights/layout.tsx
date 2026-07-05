import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Insights",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
