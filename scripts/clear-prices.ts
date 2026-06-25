import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function clearPrices() {
  console.log("🚀 Removendo preços dos produtos...\n")

  // Buscar todos os produtos com preço
  const products = await client.fetch(`*[_type == "product" && defined(price)]{_id, title, price}`)
  
  console.log(`📦 Produtos com preço: ${products.length}\n`)

  let success = 0
  let errors = 0

  for (const product of products) {
    try {
      await client.patch(product._id).unset(["price"]).commit()
      success++
      if (success % 50 === 0) {
        console.log(`✅ Atualizados: ${success}/${products.length}`)
      }
    } catch (error) {
      errors++
      console.error(`❌ Erro em ${product.title}:`, error)
    }
  }

  console.log(`\n✨ Preços removidos!`)
  console.log(`✅ Sucesso: ${success}`)
  console.log(`❌ Erros: ${errors}`)
}

clearPrices().catch(console.error)
