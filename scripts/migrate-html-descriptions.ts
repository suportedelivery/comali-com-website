import { createClient } from "@sanity/client"
import { readFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function migrateHTMLDescriptions() {
  console.log("📝 Criando descriptionHTML com texto branco para todos os produtos...\n")

  const fileContent = readFileSync("data/tray-products-imported.json", "utf-8")
  const data = JSON.parse(fileContent)
  const allProducts = data.products.filter((p: any) => p.active)

  console.log(`📦 Total de produtos no JSON: ${allProducts.length}\n`)

  let updated = 0
  let errors = 0

  for (const product of allProducts) {
    try {
      const productId = `product-${product.id}`

      // Verificar se o produto existe no Sanity
      const exists = await client.fetch(`*[_id == $id][0]`, { id: productId })

      if (!exists) {
        continue
      }

      let html = product.descriptionHTML || ""

      if (html) {
        // Padronizar cores para branco
        // 1. Remover style="color: ..."
        html = html.replace(/\s*style="color:\s*[^"]*"/gi, "")

        // 2. Remover <font color="...">
        html = html.replace(/<font\s+color="[^"]*"\s*>/gi, "<font>")

        // 3. Adicionar color:#fff a tags que não têm cor
        html = html.replace(/<p\s+style="(?!.*color)/gi, '<p style="color: #fff;')
        html = html.replace(/<span\s+style="(?!.*color)/gi, '<span style="color: #fff;')
        html = html.replace(/<div\s+style="(?!.*color)/gi, '<div style="color: #fff;')
        html = html.replace(/<li\s+style="(?!.*color)/gi, '<li style="color: #fff;')
        html = html.replace(/<h([1-6])\s+style="(?!.*color)/gi, '<h$1 style="color: #fff;')

        // 4. Adicionar color:#fff a tags sem style
        html = html.replace(/<p(?!\s*style)/gi, '<p style="color: #fff;"')
        html = html.replace(/<span(?!\s*style)/gi, '<span style="color: #fff;"')
        html = html.replace(/<li(?!\s*style)/gi, '<li style="color: #fff;"')

        await client
          .patch(productId)
          .set({ descriptionHTML: html })
          .commit()
        updated++

        if (updated % 20 === 0) {
          console.log(`✅ Atualizados: ${updated}`)
        }
      }

      // Delay para evitar rate limiting (500ms = ~2 req/sec)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      errors++
    }
  }

  console.log(`\n✨ Concluído!`)
  console.log(`✅ Atualizados: ${updated}`)
  console.log(`❌ Erros: ${errors}`)
}

migrateHTMLDescriptions().catch(console.error)
