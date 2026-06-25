import { sanityClient } from "./sanity"

export interface Product {
  _id: string
  _type: "product"
  title: string
  slug: { current: string }
  description: string | null
  brand: string | null
  reference: string | null
  ean: string | null
  price: number | null
  stock: number
  availability: string | null
  warranty: string | null
  weight: number | null
  dimensions: { length: number | null; width: number | null; height: number | null } | null
  featured: boolean
  new: boolean
  status: string
  categories: Array<{ _ref: string; _type: "reference" }>
  images: Array<{
    _type: "image"
    asset: { _ref: string }
    alt: string
  }>
  externalImages: Array<{
    _type: "image"
    _key: string
    url: string
    alt: string
  }>
  hasVariations: boolean
  variations: any[]
  whatsappMessage: string | null
  meta: { title: string; description: string; keywords: string | null } | null
}

export interface Category {
  _id: string
  _type: "category"
  title: string
  slug: { current: string }
  description: string | null
  order: number
  parentCategory: { _ref: string; _type: "reference" } | null
}

const productQuery = `*[_type == "product" && status == "active"]{
  _id,
  _type,
  title,
  slug,
  description,
  brand,
  reference,
  ean,
  price,
  stock,
  availability,
  warranty,
  weight,
  dimensions,
  featured,
  new,
  status,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  images[]{
    _type,
    "url": asset->url,
    alt
  },
  externalImages[]{
    _type,
    _key,
    url,
    alt
  },
  hasVariations,
  variations,
  whatsappMessage,
  meta
}`

const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0]{
  _id,
  _type,
  title,
  slug,
  description,
  brand,
  reference,
  ean,
  price,
  stock,
  availability,
  warranty,
  weight,
  dimensions,
  featured,
  new,
  status,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  images[]{
    _type,
    "url": asset->url,
    alt
  },
  externalImages[]{
    _type,
    _key,
    url,
    alt
  },
  hasVariations,
  variations,
  whatsappMessage,
  meta
}`

const productsByCategoryQuery = `*[_type == "product" && status == "active" && $categorySlug in categories[]->slug.current]{
  _id,
  _type,
  title,
  slug,
  description,
  brand,
  reference,
  ean,
  price,
  stock,
  availability,
  warranty,
  weight,
  dimensions,
  featured,
  new,
  status,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  images[]{
    _type,
    "url": asset->url,
    alt
  },
  externalImages[]{
    _type,
    _key,
    url,
    alt
  },
  hasVariations,
  variations,
  whatsappMessage,
  meta
}`

const featuredProductsQuery = `*[_type == "product" && status == "active" && featured == true]{
  _id,
  _type,
  title,
  slug,
  description,
  brand,
  reference,
  ean,
  price,
  stock,
  availability,
  warranty,
  weight,
  dimensions,
  featured,
  new,
  status,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  images[]{
    _type,
    "url": asset->url,
    alt
  },
  externalImages[]{
    _type,
    _key,
    url,
    alt
  },
  hasVariations,
  variations,
  whatsappMessage,
  meta
}`

const categoryQuery = `*[_type == "category"]{
  _id,
  _type,
  title,
  slug,
  description,
  order,
  "parentCategory": parentCategory->{
    _id,
    title,
    "slug": slug.current
  }
}`

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

function sanitizeProduct(p: Product): Product {
  if (!p) return p;
  return {
    ...p,
    title: sanitizeText(p.title, p.brand) || p.title,
    description: sanitizeText(p.description, p.brand) || p.description,
    reference: sanitizeText(p.reference, p.brand) || p.reference
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await sanityClient.fetch(productQuery)
  return products.map(sanitizeProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await sanityClient.fetch(productBySlugQuery, { slug })
  return product ? sanitizeProduct(product) : undefined
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await sanityClient.fetch(productsByCategoryQuery, { categorySlug })
  return products.map(sanitizeProduct)
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await sanityClient.fetch(featuredProductsQuery)
  return products.slice(0, limit).map(sanitizeProduct)
}

export async function getAllCategories(): Promise<Category[]> {
  return sanityClient.fetch(categoryQuery)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const searchQuery = `*[_type == "product" && status == "active" && (
    title match $query ||
    description match $query ||
    brand match $query ||
    reference match $query
  )]{
    _id,
    _type,
    title,
    slug,
    description,
    brand,
    reference,
    ean,
    price,
    stock,
    availability,
    warranty,
    weight,
    dimensions,
    featured,
    new,
    status,
    "categories": categories[]->{
      _id,
      title,
      "slug": slug.current
    },
    images[]{
      _type,
      "url": asset->url,
      alt
    },
    externalImages[]{
      _type,
      _key,
      url,
      alt
    },
    hasVariations,
    variations,
    whatsappMessage,
    meta
  }`
  const products = await sanityClient.fetch(searchQuery, { query: `*${query}*` } as any)
  return products.map(sanitizeProduct)
}
