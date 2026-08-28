import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@sanity/client"
import fs from "fs"
import path from "path"

config({ path: resolve(__dirname, "../.env.local") })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const ROOT = path.resolve(__dirname, "..")
const TARGET_DIR = path.join(__dirname, "imagens", "higiene-automotiva")
const SLUG = "higiene-automotiva"
const ALT = "Profissional aplicando espuma ativa em veículo com produtos químicos profissionais"

const EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"]

async function main() {
  console.log("🔍 Buscando imagens modificadas nos últimos 30 minutos na raiz do projeto...\n")

  const now = Date.now()
  const THIRTY_MIN = 30 * 60 * 1000

  const candidates: Array<{ file: string; mtimeMs: number }> = []

  for (const entry of fs.readdirSync(ROOT)) {
    const ext = path.extname(entry).toLowerCase()
    if (!EXTENSIONS.includes(ext)) continue

    const fullPath = path.join(ROOT, entry)
    const stat = fs.statSync(fullPath)
    if (!stat.isFile()) continue

    if (now - stat.mtimeMs <= THIRTY_MIN) {
      candidates.push({ file: fullPath, mtimeMs: stat.mtimeMs })
    }
  }

  candidates.sort((a, b) => a.mtimeMs - b.mtimeMs)

  console.log(`   Encontradas ${candidates.length} imagem(ns) recente(s)\n`)

  if (candidates.length === 0) {
    console.log("⚠️  Nenhuma imagem encontrada modificada nos últimos 30 minutos.")
    console.log("   Coloque uma imagem (.png/.jpg/.jpeg/.webp) na raiz do projeto e rode novamente.")
    process.exit(0)
  }

  if (candidates.length > 1) {
    console.log("⚠️  Mais de uma imagem encontrada. Abortando para evitar conflito.\n")
    for (const c of candidates) {
      console.log(`   - ${path.basename(c.file)}`)
    }
    console.log("\n   Deixe apenas 1 imagem na raiz e rode novamente.")
    process.exit(0)
  }

  const chosen = candidates[0]
  const filename = path.basename(chosen.file)
  const ext = path.extname(filename)

  console.log(`🖼️  Imagem selecionada: ${filename}\n`)

  // 1) Copiar para scripts/imagens/higiene-automotiva
  fs.mkdirSync(TARGET_DIR, { recursive: true })
  const dest = path.join(TARGET_DIR, `higiene-automotiva${ext}`)
  fs.copyFileSync(chosen.file, dest)
  console.log(`📁 Copiada para: scripts/imagens/higiene-automotiva/higiene-automotiva${ext}`)

  // 2) Upload no Sanity
  console.log("☁️  Fazendo upload para Sanity...")
  const fileBuffer = fs.readFileSync(dest)
  const asset = await client.assets.upload("image", fileBuffer, {
    filename,
  })
  console.log(`   Asset ID: ${asset._id}`)

  // 3) Buscar segmento
  const segment = await client.fetch<{
    _id: string
    title: string
  } | null>(
    `*[_type == "segment" && slug.current == $slug][0]{ _id, title }`,
    { slug: SLUG }
  )

  if (!segment) {
    console.error(`❌ Segmento com slug "${SLUG}" não encontrado no Sanity`)
    process.exit(1)
  }

  // 4) Patch no segmento
  await client
    .patch(segment._id)
    .set({
      illustrativeImage: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: ALT,
      },
    })
    .commit()

  console.log(`\n✅ Foto da Higiene Automotiva vinculada!`)
  console.log(`   Segmento: ${segment.title}`)
  console.log(`   Imagem: ${filename}`)
  console.log(`   Alt: ${ALT}`)
}

main().catch((err) => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})
