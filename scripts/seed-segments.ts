import dotenv from "dotenv"
import path from "path"
import { createClient } from "@sanity/client"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

/**
 * Script de seed para popular os 7 segmentos de público da COMALI no Sanity.
 *
 * Execução:
 *   npx tsx scripts/seed-segments.ts
 *
 * Variáveis de ambiente necessárias (defina no .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID — ID do projeto Sanity
 *   NEXT_PUBLIC_SANITY_DATASET    — Nome do dataset (geralmente "production")
 *   SANITY_API_TOKEN              — Token de API com permissão de escrita
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_TOKEN

if (!projectId) {
  console.error("❌ NEXT_PUBLIC_SANITY_PROJECT_ID não está definido no .env.local")
  process.exit(1)
}

if (!dataset) {
  console.error("❌ NEXT_PUBLIC_SANITY_DATASET não está definido no .env.local")
  process.exit(1)
}

if (!token) {
  console.warn("⚠️  SANITY_API_TOKEN não está definido no .env.local — o script vai falhar ao criar documentos")
  console.warn("   Defina a variável SANITY_API_TOKEN no .env.local com um token de API do Sanity")
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
})

interface SegmentData {
  title: string
  slug: string
  subtitle: string
  description: string
  icon: string
  whatsappMessage: string
  order: number
  status: "active" | "inactive"
  imageAlt: string
  imageSearchQuery: string
}

const segments: SegmentData[] = [
  {
    title: "Construtoras e Obras",
    slug: "construtoras-e-obras",
    subtitle: "Soluções para canteiros, áreas administrativas e empreendimentos",
    description:
      "Da fase de execução à entrega do empreendimento, a COMALI oferece produtos e equipamentos para higiene, limpeza e gerenciamento de resíduos.",
    icon: "",
    whatsappMessage: "QUERO UMA SOLUÇÃO PARA MINHA OBRA",
    order: 1,
    status: "active",
    imageAlt: "Canteiro de obras com equipamentos de limpeza e contentores",
    imageSearchQuery: "construction site cleaning equipment",
  },
  {
    title: "Panificadoras e Confeitarias",
    slug: "panificadoras-e-confeitarias",
    subtitle: "Produtos químicos para limpeza de equipamentos, pisos, paredes, utensílios e áreas de produção",
    description:
      "Manter uma cozinha ou área de produção limpa exige produtos adequados para cada tipo de sujeira e superfície.",
    icon: "🥐",
    whatsappMessage: "QUERO CONHECER A LINHA PARA PANIFICADORAS",
    order: 2,
    status: "active",
    imageAlt: "Cozinha profissional de padaria sendo limpa",
    imageSearchQuery: "bakery kitchen cleaning professional",
  },
  {
    title: "Restaurantes e Food Service",
    slug: "restaurantes-e-food-service",
    subtitle: "Produtos para limpeza profissional, higiene e organização de cozinhas e áreas de atendimento",
    description:
      "Linha de produtos químicos para limpeza e higienização, dispensers, lixeiras e equipamentos profissionais.",
    icon: "🍽",
    whatsappMessage: "QUERO CONHECER A LINHA FOOD SERVICE",
    order: 3,
    status: "active",
    imageAlt: "Cozinha industrial de restaurante com equipamentos profissionais",
    imageSearchQuery: "commercial kitchen restaurant cleaning",
  },
  {
    title: "Açougues e Indústrias de Alimentos",
    slug: "acougues-e-industrias-de-alimentos",
    subtitle: "Soluções para limpeza, desengorduramento e higienização de ambientes e equipamentos",
    description:
      "Produtos químicos concentrados para diferentes etapas da rotina de limpeza profissional em estabelecimentos de alimentação.",
    icon: "🥩",
    whatsappMessage: "QUERO SOLUÇÕES PARA AÇOUGUES E INDÚSTRIAS",
    order: 4,
    status: "active",
    imageAlt: "Açougue profissional com equipamentos de higiene",
    imageSearchQuery: "butcher shop cleaning equipment professional",
  },
  {
    title: "Hospitais, Clínicas e Laboratórios",
    slug: "hospitais-clinicas-e-laboratorios",
    subtitle: "Soluções para higiene, limpeza, descarte e organização de ambientes",
    description:
      "Dispensers, lixeiras, produtos e equipamentos para ambientes que exigem alto padrão de higiene.",
    icon: "🏥",
    whatsappMessage: "QUERO SOLUÇÕES PARA ÁREA DA SAÚDE",
    order: 5,
    status: "active",
    imageAlt: "Hospital ou clínica com dispensers e equipamentos de higiene",
    imageSearchQuery: "hospital clinic cleaning hygiene professional",
  },
  {
    title: "Empresas, Condomínios e Indústrias",
    slug: "empresas-condominios-e-industrias",
    subtitle: "Produtos para limpeza profissional, banheiros, áreas comuns e gerenciamento de resíduos",
    description:
      "Produtos para manutenção, higiene, limpeza profissional e gerenciamento de resíduos.",
    icon: "🏢",
    whatsappMessage: "QUERO SOLUÇÕES PARA MINHA EMPRESA",
    order: 6,
    status: "active",
    imageAlt: "Escritório ou área comum com lixeiras e dispensers",
    imageSearchQuery: "office building cleaning supplies professional",
  },
  {
    title: "Escolas",
    slug: "escolas",
    subtitle: "Soluções para higiene e limpeza em ambientes educacionais",
    description:
      "Produtos e equipamentos para manter escolas limpas, organizadas e seguras para alunos e funcionários.",
    icon: "",
    whatsappMessage: "QUERO SOLUÇÕES PARA ESCOLAS",
    order: 7,
    status: "active",
    imageAlt: "Escola com coleta seletiva e equipamentos de limpeza",
    imageSearchQuery: "school cleaning recycling bins",
  },
]

async function seedSegments() {
  console.log("🚀 Iniciando seed de segmentos de público...\n")

  const existing = await client.fetch(
    '*[_type == "segment"] { _id, title, slug }'
  )
  console.log(`📋 Segmentos existentes: ${existing.length}`)
  if (existing.length > 0) {
    existing.forEach((s: { title: string; slug: { current: string } }) =>
      console.log(`   - ${s.title} (${s.slug?.current})`)
    )
    console.log()
  }

  let created = 0
  let skipped = 0

  for (const segment of segments) {
    const slugExists = existing.some(
      (e: { slug?: { current: string } }) =>
        e.slug?.current === segment.slug
    )

    if (slugExists) {
      console.log(`⏭️  Pulando "${segment.title}" — slug já existe`)
      skipped++
      continue
    }

    try {
      // illustrativeImage é criada sem asset — o upload deve ser feito manualmente no Studio
      // Veja as instruções ao final deste script
      const doc = {
        _type: "segment",
        title: segment.title,
        slug: { _type: "slug", current: segment.slug },
        subtitle: segment.subtitle,
        description: segment.description,
        icon: segment.icon,
        whatsappMessage: segment.whatsappMessage,
        order: segment.order,
        status: segment.status,
        illustrativeImage: {
          _type: "image",
          asset: { _type: "reference", _ref: "" },
          alt: segment.imageAlt,
        },
      }

      const result = await client.create(doc)
      console.log(
        `✅ Criado [${segment.order}/7]: ${segment.title} (ID: ${result._id})`
      )
      created++
    } catch (err) {
      console.error(`❌ Erro ao criar "${segment.title}":`, err)
    }
  }

  console.log(`\n📊 Resumo:`)
  console.log(`   Criados: ${created}`)
  console.log(`   Pulados: ${skipped}`)
  console.log(`   Total:   ${created + skipped}`)

  if (created === 7) {
    console.log("\n✅ 7 segmentos criados com sucesso!")
  } else if (created > 0) {
    console.log(`\n⚠️  ${created} segmento(s) criado(s). ${skipped} já existiam.`)
  }
}

seedSegments().catch((err) => {
  console.error("❌ Erro fatal:", err)
  process.exit(1)
})

/*
 ============================================================================
 IMAGENS ILUSTRATIVAS — INSTRUÇÕES MANUAIS
 ============================================================================

 O script cria os segmentos com o campo illustrativeImage vazio (sem asset).
 As imagens devem ser adicionadas manualmente no Sanity Studio:

 1. Acesse o Studio: https://comali-com-br.sanity.studio/
 2. Navegue até "Segmentos de Público"
 3. Para cada segmento, faça upload de uma imagem profissional correspondente
 4. Preencha o campo "Texto Alternativo (SEO)" com o alt text abaixo

 Sugestões de busca no Unsplash (imagens gratuitas):

  Segmento 1 — Construtoras e Obras
    Busca: "construction site cleaning equipment"
    Alt: Canteiro de obras com equipamentos de limpeza e contentores

  Segmento 2 — Panificadoras e Confeitarias
    Busca: "bakery kitchen cleaning professional"
    Alt: Cozinha profissional de padaria sendo limpa

  Segmento 3 — Restaurantes e Food Service
    Busca: "commercial kitchen restaurant cleaning"
    Alt: Cozinha industrial de restaurante com equipamentos profissionais

  Segmento 4 — Açougues e Indústrias de Alimentos
    Busca: "butcher shop cleaning equipment professional"
    Alt: Açougue profissional com equipamentos de higiene

  Segmento 5 — Hospitais, Clínicas e Laboratórios
    Busca: "hospital clinic cleaning hygiene professional"
    Alt: Hospital ou clínica com dispensers e equipamentos de higiene

  Segmento 6 — Empresas, Condomínios e Indústrias
    Busca: "office building cleaning supplies professional"
    Alt: Escritório ou área comum com lixeiras e dispensers

  Segmento 7 — Escolas
    Busca: "school cleaning recycling bins"
    Alt: Escola com coleta seletiva e equipamentos de limpeza

 Alternativa: Use URLs de imagens do Unsplash diretamente no campo de imagem
 do Studio, colando o link direto da imagem (ex: https://images.unsplash.com/...).
 ============================================================================
*/
