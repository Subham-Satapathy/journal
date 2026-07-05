import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const routes = [
    { path: "/", changeFrequency: "daily" as const, priority: 1 },
    { path: "/import", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/trades", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/analytics", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/insights", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.9 },
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
