import { createClient } from "@sanity/client"
import { readFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function addImageUrls() {
  console.log("🚀 Adicionando URLs de imagens aos produtos...\n")

  const fileContent = readFileSync("data/tray-products-imported.json", "utf-8")
  const data = JSON.parse(fileContent)
  const products = data.products.filter((p: any) => p.active)

  console.log(`📦 Total de produtos: ${products.length}\n`)

  let success = 0
  let errors = 0

  for (const product of products) {
    try {
      const images = product.images
        ? product.images.map((img: any, idx: number) => ({
            _type: "image",
            _key: `img-${idx}`,
            url: img.url,
            alt: img.alt || product.title,
          }))
        : []

      await client.patch(`product-${product.id}`).set({
        externalImages: images,
      }).commit()
      
      success++
      if (success % 50 === 0) {
        console.log(`✅ Atualizados: ${success}/${products.length}`)
      }
    } catch (error) {
      errors++
      // Silent fail for products that don't exist
    }
  }

  console.log(`\n✨ URLs de imagens adicionadas!`)
  console.log(`✅ Sucesso: ${success}`)
  console.log(`❌ Erros: ${errors}`)
}

addImageUrls().catch(console.error)
