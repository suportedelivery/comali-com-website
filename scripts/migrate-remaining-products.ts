import { createClient } from "@sanity/client"
import { readFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function migrateRemainingProducts() {
  console.log("🚀 Migrando produtos restantes...\n")

  const fileContent = readFileSync("data/tray-products-imported.json", "utf-8")
  const data = JSON.parse(fileContent)
  const allProducts = data.products.filter((p: any) => p.active)

  // Get existing products from Sanity
  const existingIds = await client.fetch(`*[_type == "product"]{_id}`)
  const existingIdSet = new Set(existingIds.map((p: any) => p._id))

  const remaining = allProducts.filter((p: any) => !existingIdSet.has(`product-${p.id}`))
  
  console.log(`📦 Total de produtos no JSON: ${allProducts.length}`)
  console.log(`📦 Já existentes no Sanity: ${existingIds.length}`)
  console.log(`📦 Restantes para migrar: ${remaining.length}\n`)

  let success = 0
  let errors = 0

  for (const product of remaining) {
    try {
      const categoryRefs = product.categories
        ? product.categories.map((cat: any) => ({
            _type: "reference",
            _ref: `category-${cat.slug}`,
          }))
        : []

      const externalImages = product.images
        ? product.images.map((img: any, idx: number) => ({
            _type: "image",
            _key: `img-${idx}`,
            url: img.url,
            alt: img.alt || product.title,
          }))
        : []

      await client.create({
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
        price: null, // All "Sob Consulta"
        stock: product.stock || 0,
        availability: product.availability || null,
        warranty: product.warranty || null,
        weight: product.weight || null,
        dimensions: product.dimensions || null,
        hasVariations: product.hasVariations || false,
        categories: categoryRefs,
        externalImages: externalImages,
        whatsappMessage: `Olá! Gostaria de solicitar um orçamento para: ${product.title}`,
        meta: {
          title: product.meta?.title || product.title,
          description: product.meta?.description || product.description || null,
          keywords: product.meta?.keywords || null,
        },
      })
      
      success++
      if (success % 20 === 0) {
        console.log(`✅ Migrados: ${success}/${remaining.length}`)
      }
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      errors++
      console.error(` Erro no produto ${product.id}:`, error)
    }
  }

  console.log(`\n✨ Migração concluída!`)
  console.log(`✅ Sucesso: ${success}`)
  console.log(`❌ Erros: ${errors}`)
}

migrateRemainingProducts().catch(console.error)
