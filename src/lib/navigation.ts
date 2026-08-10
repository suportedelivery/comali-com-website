import { sanityClient } from "./sanity"
import { siteConfig } from "./config"

export interface NavItem {
  title: string
  href: string
}

export interface SubCategoryItem {
  name: string
  slug: string
}

export interface MenuCategoryItem {
  name: string
  slug: string
  icon?: string
  subcategories: SubCategoryItem[]
}

export interface SiteNavigation {
  nav: NavItem[]
  categories: MenuCategoryItem[]
}

const navigationQuery = `*[_type == "navigation" && _id in ["siteNavigation", "drafts.siteNavigation"]][0]{
  items[]{
    title,
    href
  },
  categories[]{
    name,
    slug,
    icon,
    subcategories[]{
      name,
      slug
    }
  }
}`

export async function getSiteNavigation(): Promise<SiteNavigation> {
  try {
    const data = await sanityClient.fetch(navigationQuery)
    
    const nav: NavItem[] = data?.items?.length
      ? data.items.map((item: any) => ({ title: item.title, href: item.href }))
      : [...siteConfig.nav]

    const categories: MenuCategoryItem[] = data?.categories?.length
      ? data.categories.map((cat: any) => ({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || undefined,
          subcategories: (cat.subcategories || []).map((sub: any) => ({
            name: sub.name,
            slug: sub.slug,
          })),
        }))
      : [...siteConfig.categories]

    return { nav, categories }
  } catch (error) {
    console.error("Erro ao buscar navegação do Sanity, usando fallback config:", error)
    return {
      nav: [...siteConfig.nav],
      categories: siteConfig.categories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        subcategories: cat.subcategories.map((sub) => ({
          name: sub.name,
          slug: sub.slug,
        })),
      })),
    }
  }
}
