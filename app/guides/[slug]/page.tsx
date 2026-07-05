import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGuideBySlug, guides } from "@/lib/guides";
import { createPublicPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const slug = resolved.slug;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return createPublicPageMetadata({
      title: "Guide Not Found",
      description: "Requested guide could not be found.",
      path: `/guides/${slug}`,
    });
  }

  return createPublicPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    keywords: guide.keywords,
  });
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const guide = getGuideBySlug(resolved.slug);
  if (!guide) notFound();

  return (
    <article className="max-w-4xl px-4 sm:px-6 pb-14 space-y-8">
      <header className="space-y-3">
        <div className="text-xs text-zinc-500">
          {new Date(guide.publishedAt).toLocaleDateString()} · {guide.readTimeMinutes} min read
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">{guide.title}</h1>
        <p className="text-sm sm:text-base text-zinc-400">{guide.description}</p>
      </header>

      <div className="space-y-6">
        {guide.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-100">{section.heading}</h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-7">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="pt-4">
        <Link
          href="/guides"
          className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-500"
        >
          Back to all guides
        </Link>
      </div>
    </article>
  );
}
