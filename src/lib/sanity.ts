import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
}

export const sanityClient = createClient(sanityConfig)

const builder = imageUrlBuilder(sanityConfig)

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  if (!sanityConfig.projectId) return null
  return builder.image(source)
}
