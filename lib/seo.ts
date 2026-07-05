import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site";

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function createPublicPageMetadata(input: PublicMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const absoluteUrl = `${siteUrl}${canonical}`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords ?? [],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: absoluteUrl,
      siteName: siteConfig.name,
      title: `${input.title} | ${siteConfig.name}`,
      description: input.description,
      images: ["/logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${input.title} | ${siteConfig.name}`,
      description: input.description,
      images: ["/logo.png"],
    },
  };
}
