import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@sanity/client"

config({ path: resolve(__dirname, "../.env.local") })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const FALLBACK = "Produto profissional de alto rendimento para limpeza e higienização."

const htmlEntities: Record<string, string> = {
  "&eacute;": "é", "&Eacute;": "É",
  "&ccedil;": "ç", "&Ccedil;": "Ç",
  "&atilde;": "ã", "&Atilde;": "Ã",
  "&oacute;": "ó", "&Oacute;": "Ó",
  "&uacute;": "ú", "&Uacute;": "Ú",
  "&iacute;": "í", "&Iacute;": "Í",
  "&agrave;": "à", "&Agrave;": "À",
  "&acirc;": "â", "&Acirc;": "Â",
  "&ecirc;": "ê", "&Ecirc;": "Ê",
  "&otilde;": "õ", "&Otilde;": "Õ",
  "&uuml;": "ü", "&Uuml;": "Ü",
  "&aacute;": "á", "&Aacute;": "Á",
  "&nbsp;": " ",
  "&amp;": "&", "&lt;": "<", "&gt;": ">",
  "&quot;": '"', "&#39;": "'",
}

function decodeEntities(text: string): string {
  return text.replace(/&[a-zA-Z]+;|&#\d+;/g, (entity) => htmlEntities[entity] || entity)
}

const cssMarkers = ["{", "}", "/*", "font-family", "px;", "<style", "<div"]

function hasCssMarkers(text: string): boolean {
  return cssMarkers.some((m) => text.includes(m))
}

async function main() {
  const products: Array<{
    _id: string
    title: string
    description: string | null
  }> = await client.fetch(
    `*[_type == "product"]{ _id, title, description }`
  )

  console.log(`\n📦 ${products.length} produtos carregados\n`)

  let cleaned = 0

  for (const product of products) {
    const desc = (product.description || "").trim()
    if (!desc) continue

    let newDesc = decodeEntities(desc)
    let changed = newDesc !== desc

    if (hasCssMarkers(newDesc)) {
      newDesc = FALLBACK
      changed = true
    }

    if (changed) {
      await client.patch(product._id).set({ description: newDesc }).commit()
      cleaned++
      console.log(`  LIMPO: ${product.title}`)
    }
  }

  console.log(`\n✅ ${cleaned} descrições limpas!\n`)
}

main().catch((err) => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})
