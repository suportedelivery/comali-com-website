import { createClient } from "@sanity/client"
import { readFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

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
  categories: Array<{ name: string; slug: string; parent?: string }>
  images: Array<{ url: string; alt: string }>
  price: number | null
  weight: number | null
  dimensions: { length: number | null; width: number | null; height: number | null }
  stock: number
  availability: string | null
  warranty: string | null
  featured: boolean
  new: boolean
  active: boolean
  hasVariations: boolean
  variations: Array<{
    id: string
    name: string
    type: string
    value: string
    sku: string
    price: number | null
    stock: number
  }>
  meta: { title: string; description: string; keywords: string | null }
}

async function migrateProducts() {
  console.log("🚀 Iniciando migração de produtos para o Sanity...\n")

  const fileContent = readFileSync("data/tray-products-imported.json", "utf-8")
  const data = JSON.parse(fileContent)
  const products: ImportedProduct[] = data.products.filter((p: ImportedProduct) => p.active)

  console.log(`📦 Total de produtos para migrar: ${products.length}\n`)

  let success = 0
  let errors = 0

  for (const product of products) {
    try {
      const sanityProduct = {
        _type: "product",
        _id: `product-${product.id}`,
        title: product.title,
        slug: { _type: "slug", current: product.slug },
        status: "active",
        featured: product.featured || false,
        new: product.new || false,
        brand: product.brand || null,
        reference: product.reference || null,
        ean: product.ean || null,
        description: product.description || null,
        detailedDescription: product.descriptionHTML
          ? [
              {
                _type: "block",
                children: [{ _type: "span", text: product.description }],
              },
            ]
          : null,
        price: product.price || null,
        stock: product.stock || 0,
        availability: product.availability || null,
        warranty: product.warranty || null,
        weight: product.weight || null,
        dimensions: product.dimensions
          ? {
              length: product.dimensions.length || null,
              width: product.dimensions.width || null,
              height: product.dimensions.height || null,
            }
          : null,
        hasVariations: product.hasVariations || false,
        whatsappMessage: `Olá! Gostaria de solicitar um orçamento para: ${product.title}`,
        meta: {
          title: product.meta?.title || product.title,
          description: product.meta?.description || product.description || null,
          keywords: product.meta?.keywords || null,
        },
        images: [], // Images will be added manually later
        // images: product.images
        //   ? product.images.map((img, idx) => ({
        //       _type: "image",
        //       asset: {
        //         _type: "reference",
        //         _ref: `imported-image-${product.id}-${idx}`,
        //       },
        //       alt: img.alt || product.title,
        //     }))
        //   : [],
      }

      await client.createOrReplace(sanityProduct)
      success++
      
      if (success % 50 === 0) {
        console.log(`✅ Migrados: ${success}/${products.length}`)
      }
    } catch (error) {
      errors++
      console.error(`❌ Erro no produto ${product.id} (${product.title}):`, error)
    }
  }

  console.log(`\n✨ Migração concluída!`)
  console.log(`✅ Sucesso: ${success}`)
  console.log(`❌ Erros: ${errors}`)
}

migrateProducts().catch(console.error)
