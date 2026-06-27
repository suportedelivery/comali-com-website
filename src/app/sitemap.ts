import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"
import { sanityClient } from "@/lib/sanity"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${siteConfig.url}/produtos`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/contato`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]

  const categories: Array<{ slug: string }> = await sanityClient.fetch(
    `*[_type == "category"]{ "slug": slug.current }`
  )

  const categoryPages = categories.map((category) => ({
    url: `${siteConfig.url}/produtos/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages]
}
