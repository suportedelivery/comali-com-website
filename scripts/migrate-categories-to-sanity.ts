import { createClient } from "@sanity/client"
import { readFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function migrateCategories() {
  console.log("🚀 Iniciando migração de categorias...\n")

  const fileContent = readFileSync("data/tray-products-imported.json", "utf-8")
  const data = JSON.parse(fileContent)
  const products = data.products

  // Extrair categorias únicas
  const categoryMap = new Map<string, { name: string; slug: string; parent?: string }>()
  
  products.forEach((p: any) => {
    p.categories.forEach((cat: any) => {
      if (!categoryMap.has(cat.slug)) {
        categoryMap.set(cat.slug, {
          name: cat.name,
          slug: cat.slug,
          parent: cat.parent,
        })
      }
    })
  })

  console.log(`📦 Total de categorias: ${categoryMap.size}\n`)

  let success = 0
  let errors = 0

  for (const [slug, cat] of categoryMap) {
    try {
      await client.createOrReplace({
        _type: "category",
        _id: `category-${slug}`,
        title: cat.name,
        slug: { _type: "slug", current: slug },
        description: null,
        order: 0,
      })
      success++
      console.log(`✅ ${cat.name}`)
    } catch (error) {
      errors++
      console.error(`❌ Erro em ${cat.name}:`, error)
    }
  }

  console.log(`\n✨ Migração de categorias concluída!`)
  console.log(`✅ Sucesso: ${success}`)
  console.log(`❌ Erros: ${errors}`)
}

migrateCategories().catch(console.error)
