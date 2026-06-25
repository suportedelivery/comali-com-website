import { createClient } from "@sanity/client"
import { readFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function fixProductCategories() {
  console.log("🚀 Corrigindo categorias dos produtos...\n")

  const fileContent = readFileSync("data/tray-products-imported.json", "utf-8")
  const data = JSON.parse(fileContent)
  const products = data.products.filter((p: any) => p.active)

  console.log(`📦 Total de produtos para corrigir: ${products.length}\n`)

  let success = 0
  let errors = 0

  for (const product of products) {
    try {
      const categoryRefs = product.categories
        ? product.categories.map((cat: any) => ({
            _type: "reference",
            _ref: `category-${cat.slug}`,
          }))
        : []

      await client.patch(`product-${product.id}`).set({
        categories: categoryRefs,
      }).commit()
      
      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
      success++
      if (success % 50 === 0) {
        console.log(`✅ Corrigidos: ${success}/${products.length}`)
      }
    } catch (error) {
      errors++
      console.error(`❌ Erro no produto ${product.id}:`, error)
    }
  }

  console.log(`\n✨ Categorias corrigidas!`)
  console.log(`✅ Sucesso: ${success}`)
  console.log(` Erros: ${errors}`)
}

fixProductCategories().catch(console.error)
