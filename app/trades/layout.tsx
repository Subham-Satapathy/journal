import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trades",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TradesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
