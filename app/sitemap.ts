import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { guides } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const routes = [
    { path: "/", changeFrequency: "daily" as const, priority: 1 },
    { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/guides", changeFrequency: "weekly" as const, priority: 0.85 },
    ...guides.map((guide) => ({
      path: `/guides/${guide.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
