import { createClient } from "next-sanity"

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const TOKEN = process.env.SANITY_API_TOKEN || ""
const API_VERSION = "2024-01-01"

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
})

interface Product {
  _id: string
  title: string
  sortOrder?: number | null
}

async function main() {
  console.log("Buscando todos os produtos ativos...")
  const products: Product[] = await client.fetch(
    `*[_type == "product" && status == "active"]{ _id, title, sortOrder }`
  )
  console.log(`Encontrados ${products.length} produtos ativos.`)

  const toOrder = products.filter((p) => !p.sortOrder || p.sortOrder === 0)
  console.log(`${toOrder.length} produtos precisam de ordenação.`)

  if (toOrder.length === 0) {
    console.log("Todos os produtos já estão ordenados. Nada a fazer.")
    return
  }

  toOrder.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))

  console.log("\nAtribuindo sortOrder (0, 10, 20, 30...) via API...")

  const BATCH_SIZE = 20
  for (let i = 0; i < toOrder.length; i += BATCH_SIZE) {
    const batch = toOrder.slice(i, i + BATCH_SIZE)
    const mutations = batch.map((product, index) => ({
      patch: {
        id: product._id,
        set: { sortOrder: (i + index) * 10 },
      },
    }))

    const response = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mutations }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error(`  Erro no batch ${i}:`, error)
      continue
    }

    console.log(`  Processados ${Math.min(i + BATCH_SIZE, toOrder.length)}/${toOrder.length}...`)
  }

  console.log(`\n✅ Concluído! ${toOrder.length} produtos ordenados alfabeticamente.`)
  console.log("Produtos com sortOrder=0 aparecem primeiro, depois 10, 20, etc.")
}

main().catch(console.error)
