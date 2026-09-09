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

// ── Regras por título ─────────────────────────────────────────────────
const titleRules: Array<{ match: string; description: string }> = [
  { match: "1000 PLUS", description: "Detergente concentrado para limpeza diária de superfícies laváveis, indicado para ambientes profissionais e cozinhas." },
  { match: "ALL CLEAR", description: "Desengordurante e desengraxante alcalino para remoção de gorduras e sujeiras pesadas." },
  { match: "ESPUMA CLOR", description: "Detergente alcalino clorado para limpeza pesada e remoção de sujeiras incrustadas." },
  { match: "ALUMEX", description: "Produto ácido para limpeza e abrilhantamento de superfícies de inox e alumínio." },
  { match: "BACTER PLUS", description: "Produto à base de hipoclorito de sódio, destinado à higienização dentro das aplicações indicadas pelo fabricante." },
  { match: "SANYX", description: "Limpador, desinfetante e desodorizante para manutenção de ambientes." },
  { match: "GLASS", description: "Multiuso e limpa vidros concentrado de alto rendimento." },
  { match: "DETCOL", description: "Detergente de uso geral, limpador multi-uso concentrado." },
  { match: "FLASH COMBAT", description: "Detergente limpa pisos de baixa espuma, ideal para limpeza e conservação de pisos tratados." },
  { match: "AROMATIZER", description: "Aromatizador de ambientes para difusores de fragrâncias." },
  { match: "FORCE ACID", description: "Limpador ácido para remoção de incrustações minerais e sujeiras pesadas." },
  { match: "FORCE CLORIGEL", description: "Detergente alcalino clorado em gel para limpeza pesada e desinfecção." },
  { match: "DISSOLVINI", description: "Removedor concentrado para resíduos e incrustações diversas." },
  { match: "FITA PARA MEDIÇÃO", description: "Fita para medição de cloro ativo, essencial para o controle de higienização." },
  { match: "LIXEIRA", description: "Lixeira profissional para coleta e organização de resíduos em ambientes de grande circulação." },
  { match: "CONTENTOR", description: "Contentor de resíduos de alta capacidade, ideal para condomínios, obras e áreas externas." },
  { match: "DISPENSER", description: "Dispensador profissional para sabonete, papel ou álcool, ideal para banheiros e áreas de higiene." },
  { match: "SECADOR", description: "Secador de mãos elétrico de alta velocidade para banheiros profissionais." },
]

// ── Fallback por categoria ────────────────────────────────────────────
const categoryFallback: Record<string, string> = {
  "produtos químicos concentrados": "Produto químico concentrado de alto rendimento para limpeza profissional.",
  "lixeiras e contentores": "Solução profissional para gerenciamento de resíduos.",
  dispensers: "Solução profissional de higiene para banheiros e áreas de atendimento.",
  "equipamentos de limpeza": "Equipamento profissional para rotinas de limpeza e higienização.",
}

function matchTitle(title: string): string | null {
  const upper = (title || "").toUpperCase()
  for (const rule of titleRules) {
    if (upper.includes(rule.match)) return rule.description
  }
  return null
}

function matchCategory(categories: Array<{ title: string }> | null): string | null {
  if (!categories || categories.length === 0) return null
  const catTitle = (categories[0].title || "").toLowerCase()
  for (const [key, desc] of Object.entries(categoryFallback)) {
    if (catTitle.includes(key) || key.includes(catTitle)) return desc
  }
  return null
}

async function main() {
  const products: Array<{
    _id: string
    title: string
    description: string | null
    categories: Array<{ title: string }> | null
  }> = await client.fetch(
    `*[_type == "product"]{
      _id,
      title,
      description,
      categories[]->{ title }
    }`
  )

  console.log(`\n📦 ${products.length} produtos carregados\n`)

  let filled = 0

  for (const product of products) {
    const desc = (product.description || "").trim()
    if (desc.length >= 20) continue

    const newDesc = matchTitle(product.title) || matchCategory(product.categories)
    if (!newDesc) continue

    await client.patch(product._id).set({ description: newDesc }).commit()
    filled++
    console.log(`  ✔ ${product.title} → "${newDesc.slice(0, 60)}..."`)
  }

  console.log(`\n✅ ${filled} descrições preenchidas!\n`)
}

main().catch((err) => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})
