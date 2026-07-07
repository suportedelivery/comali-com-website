import { createClient } from "next-sanity"
import { writeFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
})

async function main() {
  console.log("Buscando produtos ativos...")

  const products = await client.fetch(`*[_type == "product" && status == "active"] | order(sortOrder asc, title asc){
    _id,
    title,
    sortOrder,
    "categories": categories[]->title,
    reference,
    price
  }`)

  console.log(`${products.length} produtos encontrados.`)

  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const header = "sortOrder,titulo,categorias,referencia,preco,id"
  const rows = products.map((p: any) => {
    const cats = (p.categories || []).join(" / ")
    const price = p.price ? `R$ ${p.price.toFixed(2).replace(".", ",")}` : ""
    return [
      p.sortOrder ?? 0,
      escapeCSV(p.title || ""),
      escapeCSV(cats),
      escapeCSV(p.reference || ""),
      price,
      p._id,
    ].join(",")
  })

  const csv = [header, ...rows].join("\n")
  const filePath = "ordem-produtos.csv"
  writeFileSync(filePath, csv, "utf-8")

  console.log(`\n✅ CSV gerado: ${filePath}`)
  console.log(`${products.length} produtos exportados.`)
  console.log("\nPara importar alterações:")
  console.log("1. Edite a coluna 'sortOrder' no Excel/Google Sheets")
  console.log("2. Salve como CSV (UTF-8)")
  console.log("3. Rode: npx tsx scripts/import-product-order.ts")
}

main().catch(console.error)
