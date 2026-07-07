import { readFileSync } from "fs"

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const TOKEN = process.env.SANITY_API_TOKEN || ""
const API_VERSION = "2024-01-01"

interface CSVRow {
  sortOrder: number
  id: string
  title: string
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.split("\n").filter((l) => l.trim())
  const header = lines[0]
  const dataLines = lines.slice(1)

  return dataLines.map((line) => {
    const cols: string[] = []
    let current = ""
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        cols.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    cols.push(current.trim())

    return {
      sortOrder: parseInt(cols[0]) || 0,
      title: cols[1] || "",
      id: cols[5] || "",
    }
  })
}

async function main() {
  const csvPath = process.argv[2] || "ordem-produtos.csv"

  console.log(`Lendo ${csvPath}...`)
  const csv = readFileSync(csvPath, "utf-8")
  const rows = parseCSV(csv)

  const valid = rows.filter((r) => r.id && !r.id.startsWith("_") && r.sortOrder !== undefined)
  console.log(`${valid.length} produtos válidos encontrados.`)

  if (valid.length === 0) {
    console.log("Nenhum produto para atualizar.")
    return
  }

  console.log("Preparando atualizações...")
  const mutations = valid.map((row) => ({
    patch: {
      id: row.id,
      set: { sortOrder: row.sortOrder },
    },
  }))

  const BATCH_SIZE = 20
  let success = 0
  let errors = 0

  for (let i = 0; i < mutations.length; i += BATCH_SIZE) {
    const batch = mutations.slice(i, i + BATCH_SIZE)

    const response = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mutations: batch }),
      }
    )

    if (response.ok) {
      success += batch.length
      console.log(`  ${success}/${mutations.length} atualizados...`)
    } else {
      const error = await response.text()
      console.error(`  Erro no batch ${i}:`, error)
      errors += batch.length
    }
  }

  console.log(`\n✅ Concluído! ${success} produtos atualizados, ${errors} erros.`)
}

main().catch(console.error)
