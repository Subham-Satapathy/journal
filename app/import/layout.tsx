import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import Trades",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
