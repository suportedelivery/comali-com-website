import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import readline from "readline"
import { createClient } from "@sanity/client"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

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
  console.error("❌ SANITY_API_TOKEN não está definido no .env.local — necessário para upload de imagens")
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false })

const SEGMENT_ALTS: Record<string, string> = {
  "construtoras-e-obras": "Funcionário descartando resíduos em contentor no pátio de construtora",
  "panificadoras-e-confeitarias": "Profissional limpando piso de cozinha industrial de padaria",
  "restaurantes-e-food-service": "Profissional desengordurando cozinha industrial de restaurante",
  "acougues-e-industrias-de-alimentos": "Higienização de inox em açougue",
  "hospitais-clinicas-e-laboratorios": "Carrinho de limpeza, dispensers e lixeiras de pedal em hospital",
  "empresas-condominios-e-industrias": "Limpeza profissional em escritório com coleta seletiva",
  "escolas": "Crianças usando lixeiras de coleta seletiva na escola",
}

const SEGMENT_slugs = [
  "construtoras-e-obras",
  "panificadoras-e-confeitarias",
  "restaurantes-e-food-service",
  "acougues-e-industrias-de-alimentos",
  "hospitais-clinicas-e-laboratorios",
  "empresas-condominios-e-industrias",
  "escolas",
]

const SEGMENT_NAMES = [
  "Construtoras",
  "Panificadoras",
  "Restaurantes",
  "Açougues",
  "Hospitais",
  "Empresas",
  "Escolas",
]

function findRecentImages(): string[] {
  const root = process.cwd()
  const exts = [".png", ".jpg", ".jpeg", ".webp"]
  const cutoff = Date.now() - 60 * 60 * 1000

  const files = fs.readdirSync(root).filter((f) => {
    const ext = path.extname(f).toLowerCase()
    if (!exts.includes(ext)) return false
    try {
      const stat = fs.statSync(path.join(root, f))
      return stat.isFile() && stat.mtimeMs >= cutoff
    } catch {
      return false
    }
  })

  files.sort((a, b) => {
    const statA = fs.statSync(path.join(root, a))
    const statB = fs.statSync(path.join(root, b))
    return statA.mtimeMs - statB.mtimeMs
  })

  return files
}

function askConfirmation(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function main() {
  const images = findRecentImages()

  console.log("🔍 Buscando imagens na raiz do projeto modificadas nos últimos 60 minutos...\n")

  if (images.length === 0) {
    console.log("⚠️  Nenhuma imagem encontrada. Verifique se as imagens estão na raiz do projeto.")
    console.log("   Formatos aceitos: .png, .jpg, .jpeg, .webp")
    process.exit(0)
  }

  console.log(`📁 ${images.length} imagem(ns) encontrada(s):\n`)
  images.forEach((img, i) => {
    console.log(`   ${i + 1}. ${img}`)
  })

  console.log("\n📋 Associação prevista:\n")
  const limit = Math.min(images.length, 8)
  for (let i = 0; i < limit; i++) {
    if (i < 7) {
      console.log(`   Imagem ${i + 1} (${images[i]}) → ${SEGMENT_NAMES[i]}`)
    } else {
      console.log(`   Imagem ${i + 1} (${images[i]}) → Banner Home`)
    }
  }

  if (images.length < 8) {
    console.log(`\n⚠️  Menos de 8 imagens encontradas (${images.length}). Serão processadas apenas as disponíveis.`)
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await askConfirmation(rl, "\n✅ Confirmar importação? (S/N): ")
  rl.close()

  if (answer.toLowerCase() !== "s") {
    console.log("❌ Importação cancelada pelo usuário.")
    process.exit(0)
  }

  const publicDir = path.join(process.cwd(), "public", "imagens")
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
    console.log("\n📂 Pasta public/imagens/ criada.")
  }

  console.log("\n🚀 Iniciando importação...\n")

  // Upload dos 7 segmentos
  for (let i = 0; i < Math.min(images.length, 7); i++) {
    const filename = images[i]
    const slug = SEGMENT_slugs[i]
    const alt = SEGMENT_ALTS[slug]
    const filePath = path.join(process.cwd(), filename)
    const buffer = fs.readFileSync(filePath)

    try {
      console.log(`📤 Fazendo upload: ${filename}...`)
      const asset = await client.assets.upload("image", buffer, { filename })
      console.log(`   Asset criado: ${asset._id}`)

      const segment = await client.fetch(
        '*[_type == "segment" && slug.current == $slug][0]',
        { slug }
      )

      if (!segment) {
        console.log(`   ⚠️  Segmento "${slug}" não encontrado — pulando`)
        continue
      }

      await client
        .patch(segment._id)
        .set({
          illustrativeImage: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
            alt,
          },
        })
        .commit()

      console.log(`   ✅ ${SEGMENT_NAMES[i]} — imagem vinculada (alt: "${alt}")`)
    } catch (err) {
      console.error(`   ❌ Erro ao processar ${filename}:`, err)
    }
  }

  // Copiar banner (8ª imagem)
  if (images.length >= 8) {
    const bannerSrc = path.join(process.cwd(), images[7])
    const bannerDest = path.join(publicDir, "banner-home.jpg")
    fs.copyFileSync(bannerSrc, bannerDest)
    console.log(`\n🖼️  Banner copiado: ${images[7]} → public/imagens/banner-home.jpg`)
  }

  console.log("\n✅ Imagens importadas e vinculadas com sucesso!")
}

main().catch((err) => {
  console.error("❌ Erro fatal:", err)
  process.exit(1)
})
