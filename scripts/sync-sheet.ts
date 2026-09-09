import { createClient } from "@sanity/client"
import { readFileSync } from "fs"
import { parse } from "csv-parse/sync"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

interface SheetProduct {
  _id: string
  title: string
  brand: string | null
  description: string | null
  status: string | null
  categories: string[]
  segments: string[]
  ean: string | null
  reference: string | null
  dimensions: string | null
  warranty: string | null
  weight: string | null
  stock: string | null
  availability: string | null
  whatsappMessage: string | null
}

async function syncSheet() {
  const args = process.argv.slice(2)
  const apply = args.includes("--apply")

  console.log(`🚀 Iniciando sincronização planilha → Sanity (DRY-RUN${apply ? " + APPLY" : ""})\n`)

  // Ler CSV
  console.log("Lendo CSV: scripts/sheet-input.csv (delimitador: vírgula)")
  const csvContent = readFileSync("scripts/sheet-input.csv", "utf8")
  const products: SheetProduct[] = parse(csvContent, {
    delimiter: ",",
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  })

  // Buscar categorias e segmentos existentes
  const allCategories = await client.fetch(`*[_type == "category"]{ _id, title, "slug": slug.current }`)
  const allSegments = await client.fetch(`*[_type == "segment"]{ _id, title, "slug": slug.current }`)

  // Mapear títulos → _ref
  const categoryMap = new Map<string, string>()
  for (const cat of allCategories) {
    categoryMap.set(cat.title.toLowerCase().trim(), cat._id)
  }

  const segmentMap = new Map<string, string>()
  for (const seg of allSegments) {
    segmentMap.set(seg.title.toLowerCase().trim(), seg._id)
  }

  // Buscar produtos atuais no Sanity
  const sanityProducts = await client.fetch(
    `*[_type=="product" && !(_id in path("drafts.**"))]{
      _id,
      title,
      brand,
      description,
      status,
      "categories": categories[]->title,
      "segments": segments[]->title,
      ean,
      reference,
      dimensions,
      warranty,
      weight,
      stock,
      availability,
      whatsappMessage
    }`
  )

  // Construir mapa de produtos por título para comparação
  const sanityMap = new Map<string, any>()
  for (const p of sanityProducts) {
    sanityMap.set(p.title.toLowerCase().trim(), p)
  }

  // Relatório
  let toCreate = 0
  let toUpdate = 0
  let statusChanged = 0
  const warnings: string[] = []

  // Processar cada linha do CSV
  for (const row of products) {
    const title = (row.title || "").toLowerCase().trim()
    const existing = sanityMap.get(title)

    if (!row._id && title) {
      // Criar novo produto
      toCreate++
    } else if (existing && row._id === existing._id) {
      // Atualizar existente
      toUpdate++

      // Verificar mudanças em campos-chave
      if (row.status !== undefined && row.status !== null) {
        const normalizedStatus = row.status.toLowerCase().trim()
        const targetStatus =
          normalizedStatus === "inactive" || normalizedStatus === "inativo"
            ? "discontinued"
            : normalizedStatus === "active" || normalizedStatus === "draft" || normalizedStatus === "discontinued"
            ? normalizedStatus
            : "active"

        if (targetStatus !== existing.status) {
          statusChanged++
        }
      }
    } else {
      // Linha com _id mas não encontrado
      warnings.push(`⚠️ ID ${row._id} não encontrado no Sanity`)
    }
  }

  console.log(`📦 Planilha: ${products.length} linhas`)
  console.log(`📦 Sanity: ${sanityProducts.length} produtos ativos`)
  console.log(`
📝 RELATÓRIO:`)
  console.log(`   CRIAR: ${toCreate}`)
  console.log(`   ATUALIZAR: ${toUpdate}`)
  console.log(`   STATUS: ${statusChanged}`)
  if (warnings.length > 0) {
    console.log(`   AVISOS:`)
    for (const w of warnings) console.log(`     ${w}`)
  }

  if (!apply) {
    console.log(`\n✅ DRY-RUN concluído. Rode com --apply para executar.`)
    return
  }

  // Executar sincronização
  console.log(`\n🔄 EXECUTANDO...`)

  // Criar novos produtos
  for (const row of products) {
    if (row._id || !row.title) continue

    try {
      const categoriesRefs = row.categories
        .filter((c) => c.trim())
        .map((c) => {
          const ref = categoryMap.get(c.trim().toLowerCase())
          if (!ref) {
            warnings.push(`⚠️ Categoria '${c}' não encontrada para '${row.title}'`)
            return null
          }
          return { _type: "reference", _ref: ref }
        })
        .filter(Boolean)

      const segmentsRefs = row.segments
        .filter((c) => c.trim())
        .map((c) => {
          const ref = segmentMap.get(c.trim().toLowerCase())
          if (!ref) {
            warnings.push(`⚠️ Segmento '${c}' não encontrado para '${row.title}'`)
            return null
          }
          return { _type: "reference", _ref: ref }
        })
        .filter(Boolean)

      const status =
        row.status?.toLowerCase().trim() === "inactive" ||
        row.status?.toLowerCase().trim() === "inativo"
          ? "discontinued"
          : ["active", "draft", "discontinued"].includes(row.status?.toLowerCase().trim() || "")
          ? row.status?.toLowerCase().trim()
          : "active"

      await client.create({
        _type: "product",
        title: row.title,
        status,
        brand: row.brand || null,
        description: row.description || null,
        ean: row.ean || null,
        reference: row.reference || null,
        dimensions: row.dimensions || null,
        warranty: row.warranty || null,
        weight: row.weight || null,
        stock: row.stock ? parseInt(row.stock) || 0 : 0,
        availability: row.availability || null,
        whatsappMessage: row.whatsappMessage || null,
        categories: categoriesRefs,
        segments: segmentsRefs,
      })

      console.log(`✅ Criado: ${row.title}`)
    } catch (error) {
      console.error(`❌ Erro ao criar ${row.title}:`, error)
    }
  }

  // Atualizar produtos existentes
  for (const row of products) {
    if (!row._id || !row.title) continue

    const existing = sanityMap.get(row.title.toLowerCase().trim())
    if (!existing) continue

    try {
      const patch: Record<string, any> = {}

      if (row.title !== existing.title) patch.title = row.title
      if (row.brand !== existing.brand) patch.brand = row.brand || null
      if (row.description !== existing.description) patch.description = row.description || null
      if (row.status !== undefined && row.status !== null) {
        const normalizedStatus = row.status.toLowerCase().trim()
        const targetStatus =
          normalizedStatus === "inactive" || normalizedStatus === "inativo"
            ? "discontinued"
            : normalizedStatus === "active" || normalizedStatus === "draft" || normalizedStatus === "discontinued"
            ? normalizedStatus
            : "active"
        if (targetStatus !== existing.status) patch.status = targetStatus
      }
      if (row.ean !== existing.ean) patch.ean = row.ean || null
      if (row.reference !== existing.reference) patch.reference = row.reference || null
      if (row.dimensions !== existing.dimensions) patch.dimensions = row.dimensions || null
      if (row.warranty !== existing.warranty) patch.warranty = row.warranty || null
      if (row.weight !== existing.weight) patch.weight = row.weight || null
      if (row.stock !== existing.stock) patch.stock = row.stock ? parseInt(row.stock) || 0 : 0
      if (row.availability !== existing.availability) patch.availability = row.availability || null
      if (row.whatsappMessage !== existing.whatsappMessage)
        patch.whatsappMessage = row.whatsappMessage || null

      // Categorias
      const categoriesRefs = row.categories
        .filter((c) => c.trim())
        .map((c) => {
          const ref = categoryMap.get(c.trim().toLowerCase())
          if (!ref) {
            warnings.push(`⚠️ Categoria '${c}' não encontrada para '${row.title}'`)
            return null
          }
          return { _type: "reference", _ref: ref }
        })
        .filter(Boolean)

      if (JSON.stringify(categoriesRefs) !== JSON.stringify(existing.categories)) {
        patch.categories = categoriesRefs
      }

      // Segmentos
      const segmentsRefs = row.segments
        .filter((c) => c.trim())
        .map((c) => {
          const ref = segmentMap.get(c.trim().toLowerCase())
          if (!ref) {
            warnings.push(`⚠️ Segmento '${c}' não encontrado para '${row.title}'`)
            return null
          }
          return { _type: "reference", _ref: ref }
        })
        .filter(Boolean)

      if (JSON.stringify(segmentsRefs) !== JSON.stringify(existing.segments)) {
        patch.segments = segmentsRefs
      }

      if (Object.keys(patch).length > 0) {
        await client.patch(existing._id).set(patch).commit()
        console.log(`✅ Atualizado: ${row.title}`)
      }
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${row.title}:`, error)
    }
  }

  // Gravar log
  const now = new Date().toISOString().slice(0, 10)
  const logPath = `scripts/sync-log-${now}.txt`
  const logContent = [
    `Sincronização realizada em: ${new Date().toISOString()}`,
    `Planilha: ${products.length} linhas`,
    `Sanity: ${sanityProducts.length} produtos ativos`,
    `CRIAR: ${toCreate}`,
    `ATUALIZAR: ${toUpdate}`,
    `STATUS: ${statusChanged}`,
    `AVISOS: ${warnings.length}`,
    ...warnings,
  ].join("\n")

  await import("fs").then((fs) => fs.writeFileSync(logPath, logContent))
  console.log(`\n✅ Log gravado: ${logPath}`)
}

syncSheet().catch(console.error)
