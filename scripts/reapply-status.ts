import { createClient } from "@sanity/client"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { parse } from "csv-parse/sync"
import { config as dotenvConfig } from "dotenv"

dotenvConfig({ path: ".env.local" })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const VALID_STATUSES = new Set(["active", "discontinued", "draft"])

async function main() {
  const args = process.argv.slice(2)
  const apply = args.includes("--apply")

  const csvPath = "scripts/mudancas-input.csv"
  if (!existsSync(csvPath)) {
    console.error(`❌ Arquivo ${csvPath} não encontrado. Crie o arquivo com as mudanças antes de rodar o script.`)
    process.exit(1)
  }

  console.log(`🚀 Reaplicando status a partir de ${csvPath} (DRY-RUN${apply ? " + APPLY" : ""})\n`)

  const csvContent = readFileSync(csvPath, "utf8")
  // Sem cabeçalho: colunas = [data, usuario, _id, title, status_antigo, status_novo]
  const rows: string[][] = parse(csvContent, {
    delimiter: ",",
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  })

  // Para cada _id, registrar o último status_novo (ordem cronológica das linhas)
  const statusMap = new Map<string, { status: string; title: string }>()

  for (const row of rows) {
    // row[2] = _id, row[3] = title, row[5] = status_novo
    const _id = (row[2] || "").trim()
    const title = (row[3] || "").trim()
    const statusNovo = (row[5] || "").toLowerCase().trim()

    if (!_id) continue

    if (VALID_STATUSES.has(statusNovo)) {
      statusMap.set(_id, { status: statusNovo, title })
    }
  }

  console.log(`📦 Total de _ids únicos encontrados no CSV com status válidos: ${statusMap.size}`)

  // Buscar _ids existentes no Sanity
  console.log("🔍 Verificando produtos no Sanity...")
  const sanityProducts: any[] = await client.fetch(`*[_type == "product" && !(_id in path("drafts.**"))]._id`)
  const existingIds = new Set(sanityProducts)

  const actions: Array<{ _id: string; title: string; status: string; exists: boolean }> = []
  let missingCount = 0

  for (const [_id, data] of statusMap.entries()) {
    const exists = existingIds.has(_id)
    if (!exists) {
      missingCount++
      console.log(`⚠️ Aviso: _id '${_id}' (${data.title}) não encontrado no Sanity (será ignorado).`)
    }
    actions.push({ _id, title: data.title, status: data.status, exists })
  }

  console.log(`\n📝 PLANO DE REAPLICAÇÃO:`)
  console.log(`   Total a processar: ${actions.length}`)
  console.log(`   Encontrados no Sanity: ${actions.length - missingCount}`)
  console.log(`   Não encontrados (ignorados): ${missingCount}\n`)

  for (const act of actions) {
    const marker = act.exists ? "✅" : "❌ (não existe)"
    console.log(`   ${marker} ${act._id} (${act.title}) -> ${act.status}`)
  }

  if (!apply) {
    console.log(`\n✅ DRY-RUN concluído. Rode com --apply para executar as alterações.`)
    return
  }

  // Executar patches
  console.log(`\n🔄 EXECUTANDO PATCHES NO SANITY...`)
  let reappliedCount = 0
  const logLines: string[] = [
    `Reaplicação de status realizada em: ${new Date().toISOString()}`,
    `Total processados: ${actions.length}`,
    `--------------------------------------------------`,
  ]

  for (const act of actions) {
    if (!act.exists) {
      logLines.push(`IGNORADO (não existe): ${act._id} - ${act.title}`)
      continue
    }

    try {
      await client.patch(act._id).set({ status: act.status }).commit()
      reappliedCount++
      console.log(`✅ Aplicado: ${act._id} (${act.title}) -> ${act.status}`)
      logLines.push(`SUCESSO: ${act._id} | ${act.title} | ${act.status}`)
    } catch (error: any) {
      console.error(`❌ Erro ao atualizar ${act._id}:`, error.message || error)
      logLines.push(`ERRO: ${act._id} | ${act.title} | ${act.status} | ${error.message || error}`)
    }
  }

  const summary = `${reappliedCount} status reaplicados`
  console.log(`\n✨ Resumo: ${summary}`)
  logLines.push(`--------------------------------------------------`)
  logLines.push(`RESUMO: ${summary}`)

  const now = new Date().toISOString().slice(0, 10)
  const logPath = `scripts/reapply-log-${now}.txt`
  writeFileSync(logPath, logLines.join("\n"), "utf8")
  console.log(`📁 Log gravado em: ${logPath}`)
}

main().catch(console.error)
