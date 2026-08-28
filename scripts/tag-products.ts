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

interface CategoryRule {
  match: string[]
  segments: string[]
}

const categoryRules: CategoryRule[] = [
  {
    match: ["food service", "cozinha", "restaurantes"],
    segments: [
      "restaurantes-e-food-service",
      "panificadoras-e-confeitarias",
      "acougues-e-industrias-de-alimentos",
    ],
  },
  {
    match: ["hospitalar", "saúde", "hospital"],
    segments: ["hospitais-clinicas-e-laboratorios"],
  },
  {
    match: ["educacional", "escola", "educação"],
    segments: ["escolas"],
  },
  {
    match: ["automotiva", "veículos", "carros"],
    segments: ["higiene-automotiva"],
  },
  {
    match: ["construção", "obras", "industrial"],
    segments: ["construtoras-e-obras", "empresas-condominios-e-industrias"],
  },
  {
    match: ["limpeza", "higiene", "profissional"],
    segments: ["empresas-condominios-e-industrias", "escolas"],
  },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
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

function computeSegments(
  product: SanityProduct,
  slugToId: Map<string, string>
): Array<{ _key: string; _type: "reference"; _ref: string }> | null {
  const segmentSlugs = new Set<string>()

  if (product.categories) {
    for (const cat of product.categories) {
      const catNorm = normalize(cat.title)
      for (const rule of categoryRules) {
        if (rule.match.some((m) => catNorm.includes(m))) {
          for (const s of rule.segments) {
            segmentSlugs.add(s)
          }
        }
      }
    }
  }

  const titleUpper = (product.title || "").toUpperCase()
  if (titleUpper.includes("LIXEIRA") || titleUpper.includes("CONTENTOR")) {
    segmentSlugs.add("construtoras-e-obras")
  }
  if (titleUpper.includes("DISPENSER")) {
    segmentSlugs.add("hospitais-clinicas-e-laboratorios")
    segmentSlugs.add("empresas-condominios-e-industrias")
    segmentSlugs.add("escolas")
  }

  if (segmentSlugs.size === 0) return null

  const refs = Array.from(segmentSlugs)
    .filter((slug) => slugToId.has(slug))
    .map((slug, idx) => ({
      _key: `seg-${idx}`,
      _type: "reference" as const,
      _ref: slugToId.get(slug)!,
    }))

  return refs.length > 0 ? refs : null
}

async function main() {
  const segments: SanitySegment[] = await client.fetch(
    `*[_type == "segment" && status == "active"]{ _id, "slug": slug.current }`
  )
  const slugToId = new Map(segments.map((s) => [s.slug, s._id]))

  console.log(`\n📋 ${segments.length} segmentos carregados\n`)

  const products: SanityProduct[] = await client.fetch(
    `*[_type == "product"]{
      _id,
      title,
      categories[]->{ title },
      segments
    }`
  )

  console.log(`📦 ${products.length} produtos carregados\n`)

  // Build batch mutations
  const mutations: object[] = []
  const meta: Array<{ title: string; names: string }> = []

  for (const product of products) {
    if (!FORCE && product.segments && product.segments.length > 0) {
      continue
    }

    const refs = computeSegments(product, slugToId)
    if (!refs) continue

    mutations.push({
      patch: {
        id: product._id,
        set: { segments: refs },
      },
    })

    const names = refs
      .map((r) => {
        const slug = [...slugToId.entries()].find(([, id]) => id === r._ref)?.[0]
        return slug || r._ref
      })
      .join(", ")

    meta.push({ title: product.title, names })
  }

  if (mutations.length === 0) {
    console.log("✅ Nenhum produto para atualizar")
    return
  }

  console.log(`\n🔄 Enviando ${mutations.length} mutações em lotes de 20...\n`)

  const BATCH = 20
  for (let i = 0; i < mutations.length; i += BATCH) {
    const batch = mutations.slice(i, i + BATCH)
    const batchMeta = meta.slice(i, i + BATCH)
    await client.mutate(batch)
    for (const m of batchMeta) {
      console.log(`  ✔ ${m.title} → ${m.names}`)
    }
  }

  console.log(`\n✅ ${mutations.length} produtos marcados com sucesso!\n`)
}

main().catch((err) => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})
