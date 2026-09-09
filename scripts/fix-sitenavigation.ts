import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@sanity/client"

config({ path: resolve(__dirname, "../.env.local") })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const NAV_ID = "siteNavigation"
const SLUGS_TO_REMOVE = ["/solucoes/food-service", "/solucoes/nutricionistas"]

async function main() {
  const doc = await client.getDocument(NAV_ID)
  if (!doc) {
    console.error(`❌ Documento ${NAV_ID} não encontrado`)
    process.exit(1)
  }

  const items = (doc as any).items || []
  const filtered = items.filter((item: any) => !SLUGS_TO_REMOVE.includes(item.href))

  if (filtered.length === items.length) {
    console.log("✅ Nenhum link de /solucoes/ encontrado — nada a fazer")
    return
  }

  const removed = items.filter((item: any) => SLUGS_TO_REMOVE.includes(item.href))
  console.log("Removendo itens:")
  removed.forEach((r: any) => console.log(`  - "${r.title}" → ${r.href}`))

  await client
    .patch(NAV_ID)
    .set({ items: filtered })
    .commit()

  console.log(`✅ Publicado — ${items.length} → ${filtered.length} itens`)
}

main().catch((err) => {
  console.error("Erro:", err.message)
  process.exit(1)
})
