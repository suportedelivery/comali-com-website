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

function isValidSlug(current: string): boolean {
  if (!current) return false
  if (current.startsWith("/")) return false
  if (current === "produtos" || current.startsWith("produtos/")) return false
  return true
}

async function main() {
  const dryRun = !process.argv.includes("--apply")

  const products = await client.fetch<Array<{
    _id: string
    title: string
    slug: { current: string } | null
  }>>(`*[_type == "product"]{ _id, title, slug }`)

  console.log(`📦 ${products.length} produtos carregados (${dryRun ? "dry-run" : "apply"})\n`)

  let fixed = 0

  for (const p of products) {
    const current = p.slug?.current || ""

    if (isValidSlug(current) && current.length <= 100) continue

    const newSlug = (slugify(p.title) || `produto-${p._id}`).slice(0, 100)
    const oldSlug = current || "(sem slug)"

    if (!newSlug || newSlug === oldSlug) {
      console.log(`SKIP: ${p.title} | slug atual: ${oldSlug} (não foi possível gerar novo)`)
      continue
    }

    if (dryRun) {
      console.log(`DRY: ${p.title} | ${oldSlug} → ${newSlug}`)
    } else {
      await client
        .patch(p._id)
        .set({ slug: { _type: "slug", current: newSlug } })
        .commit()
      console.log(`FIX: ${p.title} | ${oldSlug} → ${newSlug}`)
    }
    fixed++
  }

  console.log(`\n✅ ${fixed} produtos ${dryRun ? "seriam corrigidos" : "corrigidos"}!`)
}

main().catch((err) => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})
