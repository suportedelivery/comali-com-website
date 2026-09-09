import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@sanity/client"
import fs from "fs"

config({ path: resolve(__dirname, "../.env.local") })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "e")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

async function main() {
  const products = await client.fetch<Array<{
    _id: string
    title: string
    slug: { current: string } | null
  }>>(`*[_type == "product"]{ _id, title, slug }`)

  console.log(`📦 ${products.length} produtos carregados\n`)

  let fixed = 0

  for (const p of products) {
    const decoded = decodeEntities(p.title)
    if (decoded === p.title) continue

    const newSlug = slugify(decoded)
    const oldSlug = p.slug?.current || "(sem slug)"

    await client
      .patch(p._id)
      .set({ title: decoded, slug: { _type: "slug", current: newSlug } })
      .commit()

    console.log(`FIX: ${p.title} → ${decoded} | slug: ${oldSlug} → ${newSlug}`)
    fixed++
  }

  console.log(`\n✅ ${fixed} produtos corrigidos!`)
}

main().catch((err) => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})
