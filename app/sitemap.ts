import type { MetadataRoute } from "next"

const routes = [
  "",
  "/top",
  "/new",
  "/best",
  "/ask",
  "/show",
  "/jobs",
  "/privacy",
  "/terms",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return routes.map((route) => ({
    url: `https://cgnews.app${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "hourly" : "daily",
    priority: route === "" ? 1 : 0.8,
  }))
}
