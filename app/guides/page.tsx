import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { guides } from "@/lib/guides";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Trading Guides",
  description:
    "Read practical Pocket Option and binary options journaling guides focused on discipline, review frameworks, and performance analytics.",
  path: "/guides",
  keywords: [
    "pocket option trading guides",
    "binary options journal guide",
    "trading review checklist",
  ],
});

export default function GuidesPage() {
  return (
    <div className="space-y-6 px-4 sm:px-6 pb-10">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Trading Journal Guides</h1>
        <p className="text-sm text-zinc-500 max-w-3xl">
          Practical playbooks for Pocket Option and binary options review workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <Card key={guide.slug} className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="space-y-2">
              <div className="text-xs text-zinc-500">
                {new Date(guide.publishedAt).toLocaleDateString()} · {guide.readTimeMinutes} min read
              </div>
              <CardTitle className="text-lg text-white leading-tight">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">{guide.excerpt}</p>
              <Link
                href={`/guides/${guide.slug}`}
                className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-500"
              >
                Read Guide
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
