import { createClient } from "@sanity/client"
import { readFileSync } from "fs"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function fixDescriptionColors() {
  console.log("🎨 Padronizando cores das descrições para branco...\n")

  // Buscar todos os produtos com descrição HTML
  const products = await client.fetch(
    `*[_type == "product" && defined(descriptionHTML)]{_id, title, descriptionHTML}`
  )

  console.log(`📦 Total de produtos com descrição: ${products.length}\n`)

  let updated = 0
  let errors = 0
  let unchanged = 0

  for (const product of products) {
    try {
      let html = product.descriptionHTML || ""
      const originalHtml = html

      // 1. Remover style="color: ..." (todas as variações)
      html = html.replace(/\s*style="color:\s*[^"]*"/gi, "")

      // 2. Remover <font color="..."> (deixar só a tag <font> ou remover tudo)
      html = html.replace(/<font\s+color="[^"]*"\s*>/gi, "<font>")
      html = html.replace(/<font\s+color=[^>]*>/gi, "<font>")

      // 3. Substituir qualquer color: no CSS inline por white
      html = html.replace(/color:\s*[^;"]+;?/gi, "color: #fff;")

      // 4. Substituir cores específicas comuns por white
      const colorReplacements: Record<string, string> = {
        "color: #333": "color: #fff",
        "color: #000": "color: #fff",
        "color: #666": "color: #fff",
        "color: #999": "color: #fff",
        "color: #555": "color: #fff",
        "color: #444": "color: #fff",
        "color: #222": "color: #fff",
        "color: #111": "color: #fff",
        "color: black": "color: #fff",
        "color: gray": "color: #fff",
        "color: grey": "color: #fff",
        "color: yellow": "color: #fff",
        "color: red": "color: #fff",
        "color: blue": "color: #fff",
        "color: green": "color: #fff",
        "color: darkgray": "color: #fff",
      }

      for (const [oldColor, newColor] of Object.entries(colorReplacements)) {
        const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
        html = html.replace(regex, newColor)
      }

      // 5. Garantir que style="color: white" ou similar seja o padrão
      // Se houver style sem color, adicionar color:white para parágrafos
      html = html.replace(/<p\s+style="(?!.*color)/gi, '<p style="color: #fff;')
      html = html.replace(/<span\s+style="(?!.*color)/gi, '<span style="color: #fff;')
      html = html.replace(/<div\s+style="(?!.*color)/gi, '<div style="color: #fff;')
      html = html.replace(/<li\s+style="(?!.*color)/gi, '<li style="color: #fff;')
      html = html.replace(/<h[1-6]\s+style="(?!.*color)/gi, '<h$& style="color: #fff;')

      if (html !== originalHtml) {
        await client
          .patch(product._id)
          .set({ descriptionHTML: html })
          .commit()
        updated++
        if (updated % 20 === 0) {
          console.log(`✅ Atualizados: ${updated}`)
        }
      } else {
        unchanged++
      }
    } catch (error) {
      errors++
      console.error(`❌ Erro no produto ${product._id}:`, error)
    }

    // Delay para evitar rate limiting
    if (updated % 10 === 0 && updated > 0) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  console.log(`\n✨ Concluído!`)
  console.log(`✅ Atualizados: ${updated}`)
  console.log(`➡️  Sem alterações: ${unchanged}`)
  console.log(`❌ Erros: ${errors}`)
}

fixDescriptionColors().catch(console.error)
