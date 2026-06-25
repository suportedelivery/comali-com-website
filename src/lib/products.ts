// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined'

// Initialize variables
let readFileSync: ((path: string, encoding?: string) => string) | undefined = undefined
let join: ((...paths: string[]) => string) | undefined = undefined

// Only load Node.js modules if we're on the server
if (!isBrowser) {
  // Dynamic import for Node.js modules (only available on server)
  const fs = require("fs")
  const path = require("path")
  readFileSync = fs.readFileSync
  join = path.join
}

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

let cachedProducts: ImportedProduct[] = []

function sanitizeText(text: string | null | undefined, brand?: string | null): string {
  if (!text) return "";
  let sanitized = text;
  
  // Remove "Bralimpia" explicitly
  sanitized = sanitized.replace(/Bralimpia/gi, "");
  
  // Also dynamically remove the product's own brand if it exists
  if (brand && brand.trim() !== "") {
    const safeBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const brandRegex = new RegExp(`\\b${safeBrand}\\b`, 'gi');
    sanitized = sanitized.replace(brandRegex, "");
  }
  
  return sanitized.replace(/  +/g, " ").trim();
}

function loadProducts(): ImportedProduct[] {
  // If we're in the browser, return empty array (cannot access filesystem)
  if (isBrowser || !readFileSync || !join) {
    return []
  }

  if (cachedProducts.length > 0) return cachedProducts

  try {
    const filePath = join(process.cwd(), "data", "tray-products-imported.json")
    const fileContent = readFileSync(filePath, "utf-8")
    const data = JSON.parse(fileContent)
    cachedProducts = data.products
      .filter((p: ImportedProduct) => p.active)
      .map((p: ImportedProduct) => ({
        ...p,
        title: sanitizeText(p.title, p.brand),
        description: sanitizeText(p.description, p.brand),
        descriptionHTML: sanitizeText(p.descriptionHTML, p.brand),
        reference: sanitizeText(p.reference, p.brand)
      }))
    return cachedProducts
  } catch (error) {
    console.error("Erro ao carregar produtos:", error)
    return []
  }
}

export function getAllProducts(): ImportedProduct[] {
  return loadProducts()
}

export function getProductBySlug(slug: string): ImportedProduct | undefined {
  const products = loadProducts()
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): ImportedProduct[] {
  const products = loadProducts()
  return products.filter((p) =>
    p.categories.some((c) => c.slug === categorySlug)
  )
}

export function getFeaturedProducts(limit = 8): ImportedProduct[] {
  const products = loadProducts()
  return products.filter((p) => p.featured).slice(0, limit)
}

export function getProductsByBrand(brand: string): ImportedProduct[] {
  const products = loadProducts()
  return products.filter((p) => p.brand === brand)
}

export function getAllCategories(): Array<{ name: string; slug: string; count: number }> {
  const products = loadProducts()
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
}

export function getAllBrands(): Array<{ name: string; count: number }> {
  const products = loadProducts()
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

export function searchProducts(query: string): ImportedProduct[] {
  const products = loadProducts()
  const searchLower = query.toLowerCase()

  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.brand?.toLowerCase().includes(searchLower) ||
      p.reference?.toLowerCase().includes(searchLower)
  )
}
