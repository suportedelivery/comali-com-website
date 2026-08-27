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

const FORCE = process.env.FORCE === "1"

// ── Mapeamento categoria → segmentos ──────────────────────────────────
const categoryToSegments: Record<string, string[]> = {
  "produtos-quimicos-concentrados": [
    "panificadoras-e-confeitarias",
    "restaurantes-e-food-service",
    "acougues-e-industrias-de-alimentos",
    "hospitais-clinicas-e-laboratorios",
    "empresas-condominios-e-industrias",
    "escolas",
  ],
  "lixeiras-e-contentores": [
    "construtoras-e-obras",
    "restaurantes-e-food-service",
    "hospitais-clinicas-e-laboratorios",
    "empresas-condominios-e-industrias",
    "escolas",
  ],
  dispensers: [
    "panificadoras-e-confeitarias",
    "restaurantes-e-food-service",
    "hospitais-clinicas-e-laboratorios",
    "empresas-condominios-e-industrias",
    "escolas",
  ],
  "equipamentos-de-limpeza": [
    "construtoras-e-obras",
    "restaurantes-e-food-service",
    "hospitais-clinicas-e-laboratorios",
    "empresas-condominios-e-industrias",
    "escolas",
  ],
}

interface SanityRef {
  _ref: string
}

interface SanityProduct {
  _id: string
  title: string
  categories: Array<{ title: string }> | null
  segments: SanityRef[] | null
}

interface SanitySegment {
  _id: string
  slug: string
}

async function main() {
  // 1. Carregar segmentos
  const segments: SanitySegment[] = await client.fetch(
    `*[_type == "segment" && status == "active"]{ _id, "slug": slug.current }`
  )
  const slugToId = new Map(segments.map((s) => [s.slug, s._id]))

  console.log(`\n📋 ${segments.length} segmentos carregados\n`)

  // 2. Carregar produtos
  const products: SanityProduct[] = await client.fetch(
    `*[_type == "product"]{
      _id,
      title,
      categories[]->{ title },
      segments
    }`
  )

  console.log(`📦 ${products.length} produtos carregados\n`)

  // 3. Processar cada produto
  let tagged = 0

  for (const product of products) {
    // Pular se já tem segments (a menos que FORCE=1)
    if (!FORCE && product.segments && product.segments.length > 0) {
      continue
    }

    const segmentSlugs = new Set<string>()

    // Regras por categoria
    if (product.categories) {
      for (const cat of product.categories) {
        const catSlug = cat.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()

        for (const [ruleSlug, segmentSlugsList] of Object.entries(
          categoryToSegments
        )) {
          if (catSlug.includes(ruleSlug) || ruleSlug.includes(catSlug)) {
            for (const s of segmentSlugsList) {
              segmentSlugs.add(s)
            }
          }
        }
      }
    }

    // Regra extra: título contém "CONTENTOR" ou "LIXEIRA"
    const titleUpper = (product.title || "").toUpperCase()
    if (titleUpper.includes("CONTENTOR") || titleUpper.includes("LIXEIRA")) {
      segmentSlugs.add("construtoras-e-obras")
    }

    if (segmentSlugs.size === 0) continue

    // Montar array de referências
    const refs = Array.from(segmentSlugs)
      .filter((slug) => slugToId.has(slug))
      .map((slug, idx) => ({
        _key: `seg-${idx}`,
        _type: "reference" as const,
        _ref: slugToId.get(slug)!,
      }))

    if (refs.length === 0) continue

    // Patch no Sanity
    await client
      .patch(product._id)
      .set({ segments: refs })
      .commit()

    tagged++

    const names = refs
      .map((r) => {
        const slug = [...slugToId.entries()].find(([, id]) => id === r._ref)?.[0]
        return slug || r._ref
      })
      .join(", ")

    console.log(`  ✔ ${product.title} → segmentos: ${names}`)
  }

  console.log(`\n✅ ${tagged} produtos marcados com sucesso!\n`)
}

main().catch((err) => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})
