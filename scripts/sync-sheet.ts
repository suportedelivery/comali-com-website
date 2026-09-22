import { createClient } from "@sanity/client"
import { readFileSync } from "fs"
import { parse } from "csv-parse/sync"
import { config as dotenvConfig } from "dotenv"

dotenvConfig({ path: ".env.local" })

const tokenCheck = process.env.SANITY_API_TOKEN || "(NAO CARREGADO)"
console.log("🔑 Token Sanity:", tokenCheck.substring(0, 10) + "..." + tokenCheck.substring(tokenCheck.length - 5))
console.log("📁 Arquivo .env.local carregado:", require("path").resolve(".env.local"))

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
  descriptionHTML: string | null
  externalImages: string | null
  status: string | null
  categories: any
  segments: any
  ean: string | null
  reference: string | null
  dimensions: string | null
  warranty: string | null
  weight: string | null
  stock: string | null
  availability: string | null
  whatsappMessage: string | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizeToArray(v: any): string[] {
  if (v === null || v === undefined) return []
  if (typeof v === "string") {
    const s = v.trim()
    if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return []
    return s
      .split("|")
      .map((x) => x.trim())
      .filter((x) => x && x.toLowerCase() !== "null" && x.toLowerCase() !== "undefined")
  }
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? x.trim() : x))
      .filter(
        (x): x is string =>
          typeof x === "string" &&
          x.length > 0 &&
          x.toLowerCase() !== "null" &&
          x.toLowerCase() !== "undefined"
      )
  }
  return []
}

/** Compara externalImages apenas pelas URLs, na ordem (ignora _type/_key/alt). */
function extractExternalImageUrls(val: any): string[] {
  if (!val) return []
  if (typeof val === "string") {
    return val
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === "string") return item.trim()
        if (item && typeof item === "object" && typeof item.url === "string") return item.url.trim()
        return ""
      })
      .filter(Boolean)
  }
  return []
}

function parseExternalImages(pipeSeparated: string | null | undefined, title: string): Array<{ _type: string; _key: string; url: string; alt: string }> {
  if (!pipeSeparated || !pipeSeparated.trim()) return []
  return pipeSeparated
    .split("|")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, i) => ({
      _type: "image" as const,
      _key: `ext-${i}`,
      url,
      alt: title || "Imagem do produto",
    }))
}

function normalizeValue(val: any, fieldName: string): any {
  if (val === null || val === undefined || val === "") return ""

  // externalImages: comparar SOMENTE a lista ordenada de URLs
  if (fieldName === "externalImages") {
    return JSON.stringify(extractExternalImageUrls(val))
  }

  // categories/segments: "null"/"undefined"/vazio => lista vazia; split por "|"
  if (fieldName === "categories" || fieldName === "segments") {
    return JSON.stringify(normalizeToArray(val).map((s) => s.toLowerCase()))
  }

  if (fieldName === "status") {
    return String(val).toLowerCase().trim()
  }

  if (fieldName === "descriptionHTML") {
    return String(val)
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  }

  if (Array.isArray(val)) {
    const cleaned = val.map((item) => {
      if (typeof item === "object" && item !== null) {
        const copy: any = {}
        for (const k of Object.keys(item).sort()) {
          if (["_key", "_rev", "_updatedAt", "_createdAt", "_system", "_type", "_id"].includes(k)) continue
          copy[k] = normalizeValue(item[k], k)
        }
        return copy
      }
      return typeof item === "string" ? item.trim().toLowerCase() : item
    })
    cleaned.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
    return JSON.stringify(cleaned)
  }

  if (typeof val === "object" && val !== null) {
    const copy: any = {}
    for (const k of Object.keys(val).sort()) {
      if (["_key", "_rev", "_updatedAt", "_createdAt", "_system", "_type", "_id"].includes(k)) continue
      copy[k] = normalizeValue(val[k], k)
    }
    return JSON.stringify(copy)
  }

  if (typeof val === "string") {
    return val.trim()
  }

  return String(val).trim()
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
      descriptionHTML,
      externalImages[]{url, alt},
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
  const statusReportLines: string[] = []
  const updateReportItems: { title: string; diffs: { field: string; sheetVal: string; sanityVal: string }[] }[] = []

  const fieldsToCheck = [
    "title", "brand", "description", "descriptionHTML", "status",
    "ean", "reference", "dimensions", "warranty", "weight", "stock",
    "availability", "whatsappMessage", "externalImages", "categories", "segments"
  ]

  // Processar cada linha do CSV
  for (const row of products) {
    const title = (row.title || "").toLowerCase().trim()
    if (!title) continue

    let existing = null
    if (row._id) {
      existing = sanityProducts.find((p: any) => p._id === row._id)
    }
    if (!existing) {
      existing = sanityMap.get(title)
    }

    if (!existing) {
      toCreate++
      continue
    }

    // Status alvo
    const normalizedStatus = (row.status || "").toLowerCase().trim()
    const targetStatus =
      normalizedStatus === "inactive" || normalizedStatus === "inativo"
        ? "discontinued"
        : ["active", "draft", "discontinued"].includes(normalizedStatus)
        ? normalizedStatus
        : "active"

    const existingStatus = (existing.status || "active").toLowerCase().trim()
    if (targetStatus !== existingStatus) {
      statusChanged++
      statusReportLines.push(`${row.title} | ${existing._id} | planilha: ${targetStatus} | sanity: ${existingStatus}`)
    }

    const rowParsed = {
      title: row.title,
      brand: row.brand || null,
      description: row.description || null,
      descriptionHTML: row.descriptionHTML?.trim() || (row.description ? `<p>${row.description}</p>` : null),
      status: targetStatus,
      ean: row.ean || null,
      reference: row.reference || null,
      dimensions: row.dimensions || null,
      warranty: row.warranty || null,
      weight: row.weight || null,
      stock: row.stock ? parseInt(row.stock, 10) || 0 : 0,
      availability: row.availability || null,
      whatsappMessage: row.whatsappMessage || null,
      externalImages: parseExternalImages(row.externalImages, row.title),
      categories: normalizeToArray(row.categories),
      segments: normalizeToArray(row.segments),
    }

    const existingParsed = {
      title: existing.title,
      brand: existing.brand || null,
      description: existing.description || null,
      descriptionHTML: existing.descriptionHTML || null,
      status: existing.status || "active",
      ean: existing.ean || null,
      reference: existing.reference || null,
      dimensions: existing.dimensions || null,
      warranty: existing.warranty || null,
      weight: existing.weight || null,
      stock: existing.stock || 0,
      availability: existing.availability || null,
      whatsappMessage: existing.whatsappMessage || null,
      externalImages: existing.externalImages || [],
      categories: existing.categories || [],
      segments: existing.segments || [],
    }

    const diffs: { field: string; sheetVal: string; sanityVal: string }[] = []
    for (const field of fieldsToCheck) {
      const vSheet = normalizeValue((rowParsed as any)[field], field)
      const vSanity = normalizeValue((existingParsed as any)[field], field)
      if (vSheet !== vSanity) {
        diffs.push({
          field,
          sheetVal: String(JSON.stringify((rowParsed as any)[field]) ?? "").slice(0, 60),
          sanityVal: String(JSON.stringify((existingParsed as any)[field]) ?? "").slice(0, 60),
        })
      }
    }

    if (diffs.length > 0) {
      toUpdate++
      updateReportItems.push({
        title: row.title,
        diffs,
      })
    }
  }

  console.log(`📦 Planilha: ${products.length} linhas`)
  console.log(`📦 Sanity: ${sanityProducts.length} produtos ativos`)
  console.log(`
📝 RELATÓRIO:`)
  console.log(`   CRIAR: ${toCreate}`)
  console.log(`   ATUALIZAR: ${toUpdate}`)
  console.log(`   STATUS: ${statusChanged}`)

  if (statusReportLines.length > 0) {
    console.log(`\n📋 Relatório Completo de Mudanças de Status (${statusReportLines.length}):`)
    for (const line of statusReportLines) {
      console.log(`   ${line}`)
    }
  }

  if (updateReportItems.length > 0) {
    console.log(`\n📋 Relatório de Atualizações (Primeiros ${Math.min(5, updateReportItems.length)} de ${updateReportItems.length}):`)
    for (let i = 0; i < Math.min(5, updateReportItems.length); i++) {
      const item = updateReportItems[i]
      const fieldsStr = item.diffs.map((d) => d.field).join(", ")
      console.log(`   ${item.title} | campos: [${fieldsStr}]`)
      for (const d of item.diffs) {
        console.log(`      - ${d.field}: planilha = "${d.sheetVal}" vs sanity = "${d.sanityVal}"`)
      }
    }
  } else {
    console.log(`\n📋 Relatório de Atualizações: 0 produtos precisam de atualização (comparador idêntico).`)
  }

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

    const slug = slugify(row.title)
    const docId = `product-${slug}`

    try {
      const categoriesRefs = normalizeToArray(row.categories)
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

      const segmentsRefs = normalizeToArray(row.segments)
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

      const descriptionHTML =
        row.descriptionHTML?.trim() ||
        (row.description ? `<p>${row.description}</p>` : null)

      const externalImages = parseExternalImages(row.externalImages, row.title)

      const payload = {
        _id: docId,
        _type: "product",
        title: row.title,
        slug: { _type: "slug", current: slug },
        status,
        brand: row.brand || null,
        description: row.description || null,
        descriptionHTML: descriptionHTML || null,
        externalImages,
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
      }

      const created = await client.create(payload)
      console.log(`✅ ${row.title} -> _id: ${created._id}`)
    } catch (error: any) {
      console.error(`\n❌ Erro ao criar "${row.title}"`)
      console.error(`   _id tentado: ${docId}`)
      console.error(`   Erro: ${error.message || error}`)
    }
  }

  // Atualizar produtos existentes
  for (const row of products) {
    if (!row.title) continue

    let existing = null
    if (row._id) {
      existing = sanityProducts.find((p: any) => p._id === row._id)
    }
    if (!existing) {
      existing = sanityMap.get(row.title.toLowerCase().trim())
    }
    if (!existing) continue

    try {
      const normalizedStatus = (row.status || "").toLowerCase().trim()
      const targetStatus =
        normalizedStatus === "inactive" || normalizedStatus === "inativo"
          ? "discontinued"
          : ["active", "draft", "discontinued"].includes(normalizedStatus)
          ? normalizedStatus
          : "active"

      const categoriesRefs = normalizeToArray(row.categories)
        .filter((c) => c.trim())
        .map((c) => {
          const ref = categoryMap.get(c.trim().toLowerCase())
          return ref ? { _type: "reference", _ref: ref } : null
        })
        .filter(Boolean)

      const segmentsRefs = normalizeToArray(row.segments)
        .filter((c) => c.trim())
        .map((c) => {
          const ref = segmentMap.get(c.trim().toLowerCase())
          return ref ? { _type: "reference", _ref: ref } : null
        })
        .filter(Boolean)

      const rowParsed = {
        title: row.title,
        brand: row.brand || null,
        description: row.description || null,
        descriptionHTML: row.descriptionHTML?.trim() || (row.description ? `<p>${row.description}</p>` : null),
        status: targetStatus,
        ean: row.ean || null,
        reference: row.reference || null,
        dimensions: row.dimensions || null,
        warranty: row.warranty || null,
        weight: row.weight || null,
        stock: row.stock ? parseInt(row.stock, 10) || 0 : 0,
        availability: row.availability || null,
        whatsappMessage: row.whatsappMessage || null,
        externalImages: parseExternalImages(row.externalImages, row.title),
        categories: normalizeToArray(row.categories),
        segments: normalizeToArray(row.segments),
      }

      const existingParsed = {
        title: existing.title,
        brand: existing.brand || null,
        description: existing.description || null,
        descriptionHTML: existing.descriptionHTML || null,
        status: existing.status || "active",
        ean: existing.ean || null,
        reference: existing.reference || null,
        dimensions: existing.dimensions || null,
        warranty: existing.warranty || null,
        weight: existing.weight || null,
        stock: existing.stock || 0,
        availability: existing.availability || null,
        whatsappMessage: existing.whatsappMessage || null,
        externalImages: existing.externalImages || [],
        categories: existing.categories || [],
        segments: existing.segments || [],
      }

      const patch: Record<string, any> = {}

      for (const field of fieldsToCheck) {
        const vSheet = normalizeValue((rowParsed as any)[field], field)
        const vSanity = normalizeValue((existingParsed as any)[field], field)
        if (vSheet !== vSanity) {
          if (field === "categories") {
            patch.categories = categoriesRefs
          } else if (field === "segments") {
            patch.segments = segmentsRefs
          } else {
            patch[field] = (rowParsed as any)[field]
          }
        }
      }

      if (Object.keys(patch).length > 0) {
        await client.patch(existing._id).set(patch).commit()
        console.log(`✅ Atualizado: ${row.title} (campos: ${Object.keys(patch).join(", ")})`)
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
