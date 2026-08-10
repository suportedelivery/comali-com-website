import { sanityClient } from "./sanity"

interface ImportedProduct {
  id: string
  title: string
  slug: string
  description: string
  descriptionHTML: string
  brand: string | null
  model: string | null
  reference: string | null
  ean: string | null
  categories: Array<{
    name: string
    slug: string
    parent?: string
  }>
  images: Array<{
    url: string
    alt: string
  }>
  price: number | null
  weight: number | null
  dimensions: {
    length: number | null
    width: number | null
    height: number | null
  }
  stock: number
  availability: string | null
  warranty: string | null
  featured: boolean
  new: boolean
  active: boolean
  sortOrder: number
  variations: Array<{
    id: string
    name: string
    type: string
    value: string
    type2: string | null
    value2: string | null
    sku: string
    ean: string | null
    price: number | null
    stock: number
    weight: number | null
    dimensions: {
      length: number | null
      width: number | null
      height: number | null
    }
    image: string | null
    availability: string | null
  }>
  hasVariations: boolean
  meta: {
    title: string
    description: string
    keywords: string | null
  }
  trayUrl: string | null
  createdAt: string | null
}

function sanitizeText(text: string | null | undefined, brand?: string | null): string {
  if (!text) return "";
  let sanitized = text;
  
  sanitized = sanitized.replace(/Bralimpia/gi, "");
  
  if (brand && brand.trim() !== "") {
    const safeBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const brandRegex = new RegExp(`\\b${safeBrand}\\b`, 'gi');
    sanitized = sanitized.replace(brandRegex, "");
  }
  
  return sanitized.replace(/  +/g, " ").trim();
}

function mapSanityProduct(p: any): ImportedProduct {
  return {
    id: p._id,
    title: sanitizeText(p.title, p.brand) || p.title,
    slug: p.slug?.current || p.slug || "",
    description: sanitizeText(p.description, p.brand) || "",
    descriptionHTML: sanitizeText(p.descriptionHTML || p.description, p.brand) || "",
    brand: p.brand || null,
    model: p.model || null,
    reference: sanitizeText(p.reference, p.brand) || null,
    ean: p.ean || null,
    categories: (p.categories || []).map((c: any) => ({
      name: c.title || c.name || "",
      slug: c.slug?.current || c.slug || "",
      parent: c.parent?.slug?.current || c.parent || undefined,
    })),
    images: (p.images || []).map((img: any) => ({
      url: img.url || "",
      alt: img.alt || p.title,
    })),
    price: p.price ?? null,
    weight: p.weight ?? null,
    dimensions: p.dimensions || { length: null, width: null, height: null },
    stock: p.stock ?? 0,
    availability: p.availability || null,
    warranty: p.warranty || null,
    featured: p.featured ?? false,
    new: p.new ?? false,
    active: p.status === "active",
    sortOrder: p.sortOrder ?? 0,
    variations: (p.variations || []).map((v: any) => ({
      id: v.id || v._key || "",
      name: v.name || "",
      type: v.type || "",
      value: v.value || "",
      type2: v.type2 || null,
      value2: v.value2 || null,
      sku: v.sku || "",
      ean: v.ean || null,
      price: v.price ?? null,
      stock: v.stock ?? 0,
      weight: v.weight ?? null,
      dimensions: v.dimensions || { length: null, width: null, height: null },
      image: v.image || null,
      availability: v.availability || null,
    })),
    hasVariations: p.hasVariations ?? (p.variations?.length > 0),
    meta: p.meta || { title: p.title, description: "", keywords: null },
    trayUrl: p.trayUrl || null,
    createdAt: p.createdAt || null,
  }
}

const imageProjection = `externalImages[]{url, alt}`

const productQuery = `*[_type == "product" && status == "active"] | order(sortOrder asc, title asc){
  _id,
  title,
  "slug": slug.current,
  description,
  descriptionHTML,
  brand,
  model,
  reference,
  ean,
  price,
  weight,
  stock,
  availability,
  warranty,
  dimensions,
  sortOrder,
  featured,
  "new": new,
  status,
  "categories": categories[]->{
    _id,
    "title": coalesce(name, title),
    "slug": slug.current,
    "parent": parentCategory->slug.current
  },
  "images": ${imageProjection},
  variations,
  hasVariations,
  meta,
  trayUrl,
  createdAt
}`

const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  descriptionHTML,
  brand,
  model,
  reference,
  ean,
  price,
  weight,
  stock,
  availability,
  warranty,
  dimensions,
  sortOrder,
  featured,
  "new": new,
  status,
  "categories": categories[]->{
    _id,
    "title": coalesce(name, title),
    "slug": slug.current,
    "parent": parentCategory->slug.current
  },
  "images": ${imageProjection},
  variations,
  hasVariations,
  meta,
  trayUrl,
  createdAt
}`

const productsByCategoryQuery = `*[_type == "product" && status == "active" && $categorySlug in categories[]->slug.current] | order(sortOrder asc, title asc){
  _id,
  title,
  "slug": slug.current,
  description,
  descriptionHTML,
  brand,
  model,
  reference,
  ean,
  price,
  weight,
  stock,
  availability,
  warranty,
  dimensions,
  sortOrder,
  featured,
  "new": new,
  status,
  "categories": categories[]->{
    _id,
    "title": coalesce(name, title),
    "slug": slug.current,
    "parent": parentCategory->slug.current
  },
  "images": ${imageProjection},
  variations,
  hasVariations,
  meta,
  trayUrl,
  createdAt
}`

const featuredProductsQuery = `*[_type == "product" && status == "active" && featured == true] | order(sortOrder asc, title asc){
  _id,
  title,
  "slug": slug.current,
  description,
  descriptionHTML,
  brand,
  model,
  reference,
  ean,
  price,
  weight,
  stock,
  availability,
  warranty,
  dimensions,
  sortOrder,
  featured,
  "new": new,
  status,
  "categories": categories[]->{
    _id,
    "title": coalesce(name, title),
    "slug": slug.current,
    "parent": parentCategory->slug.current
  },
  "images": ${imageProjection},
  variations,
  hasVariations,
  meta,
  trayUrl,
  createdAt
}`

const categoryQuery = `*[_type == "category"] | order(order asc, title asc){
  _id,
  "name": coalesce(name, title),
  "slug": slug.current,
  "parent": parentCategory->slug.current
}`

const searchQuery = `*[_type == "product" && status == "active" && (
  title match $query || description match $query || brand match $query || reference match $query
)] | order(sortOrder asc, title asc){
  _id,
  title,
  "slug": slug.current,
  description,
  descriptionHTML,
  brand,
  model,
  reference,
  ean,
  price,
  weight,
  stock,
  availability,
  warranty,
  dimensions,
  sortOrder,
  featured,
  "new": new,
  status,
  "categories": categories[]->{
    _id,
    "title": coalesce(name, title),
    "slug": slug.current,
    "parent": parentCategory->slug.current
  },
  "images": ${imageProjection},
  variations,
  hasVariations,
  meta,
  trayUrl,
  createdAt
}`

async function loadProducts(): Promise<ImportedProduct[]> {
  try {
    const products: any[] = await sanityClient.fetch(productQuery)
    return products.map(mapSanityProduct)
  } catch (error) {
    console.error("Erro ao carregar produtos do Sanity:", error)
    return []
  }
}

export async function getAllProducts(): Promise<ImportedProduct[]> {
  return loadProducts()
}

export async function getProductBySlug(slug: string): Promise<ImportedProduct | undefined> {
  try {
    const product = await sanityClient.fetch(productBySlugQuery, { slug })
    return product ? mapSanityProduct(product) : undefined
  } catch (error) {
    console.error("Erro ao buscar produto por slug:", error)
    return undefined
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<ImportedProduct[]> {
  try {
    const products = await sanityClient.fetch(productsByCategoryQuery, { categorySlug })
    return products.map(mapSanityProduct)
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error)
    return []
  }
}

export async function getFeaturedProducts(limit = 8): Promise<ImportedProduct[]> {
  try {
    const products = await sanityClient.fetch(featuredProductsQuery)
    return products.slice(0, limit).map(mapSanityProduct)
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error)
    return []
  }
}

export async function getProductsByBrand(brand: string): Promise<ImportedProduct[]> {
  const products = await loadProducts()
  return products.filter((p) => p.brand === brand)
}

export async function getAllCategories(): Promise<Array<{ name: string; slug: string; count: number }>> {
  try {
    const products = await loadProducts()
    const categoryMap = new Map<string, { name: string; count: number }>()

    products.forEach((product) => {
      product.categories.forEach((cat) => {
        const existing = categoryMap.get(cat.slug)
        if (existing) {
          existing.count++
        } else {
          categoryMap.set(cat.slug, { name: cat.name, count: 1 })
        }
      })
    })

    return Array.from(categoryMap.entries())
      .map(([slug, data]) => ({ slug, ...data }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }
}

export async function getAllBrands(): Promise<Array<{ name: string; count: number }>> {
  const products = await loadProducts()
  const brandMap = new Map<string, number>()

  products.forEach((product) => {
    if (product.brand) {
      brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1)
    }
  })

  return Array.from(brandMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function searchProducts(query: string): Promise<ImportedProduct[]> {
  try {
    const products: any[] = await sanityClient.fetch(searchQuery, { query: `*${query}*` } as any)
    return products.map(mapSanityProduct)
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}
