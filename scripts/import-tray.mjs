import { writeFileSync } from "fs"

const BASE_URL = "https://www.comali.com.br"

const CATEGORY_URLS = [
  "/dispensers",
  "/lixeirasecontentores",
  "/equipamentosdelimpeza",
  "/produtosquimicos",
  "/dispenser/dispenser-inox",
  "/dispenser/dispenser-plastico",
  "/secadordemaos",
  "/papeltoalha",
  "/papelhigienico",
  "/dispensers/sabonete",
  "/dispenser-alcool-gel",
  "/copos",
  "/fiodental",
  "/dispenser/equipamentos-de-inox",
  "/lixeiras-e-contentores/contentores-acima-de-100-litros",
  "/lixeiras-e-contentores/lixeiras-inox",
  "/lixeiras-e-contentores/lixeiras-plastico",
  "/coletaseletiva",
  "/lixeirascompedal",
  "/lixeirassempedal",
  "/cinzeirosebituqueiras",
  "/lixeiraparacopos",
  "/carros",
  "/carrocamareira",
  "/carrofuncional",
  "/carrocuba",
  "/baldes",
  "/acessorios",
  "/aplicadordecera",
  "/limpavidros",
  "/placassinalizacao",
  "/panodelimpeza",
  "/refil",
  "/burrifadores",
  "/mop",
  "/equipamentos-de-limpeza/mop/mop-umido-limpeza-umida",
  "/refilmop",
  "/produtosdelimpeza",
  "/interfolhado",
  "/bobina",
  "/caicai",
  "/rolao",
  "/saboneteliquido",
  "/saboneteespuma",
]

const CATEGORY_PATHS = new Set([
  "dispensers", "lixeirasecontentores", "equipamentosdelimpeza", "produtosquimicos",
  "dispenser", "secadordemaos", "papeltoalha", "papelhigienico", "dispenser-alcool-gel",
  "copos", "fiodental", "lixeiras-e-contentores", "coletaseletiva", "lixeirascompedal",
  "lixeirassempedal", "cinzeirosebituqueiras", "lixeiraparacopos", "carros",
  "carrocamareira", "carrofuncional", "carrocuba", "baldes", "acessorios",
  "aplicadordecera", "limpavidros", "placassinalizacao", "panodelimpeza", "refil",
  "burrifadores", "mop", "equipamentos-de-limpeza", "refilmop", "produtosdelimpeza",
  "interfolhado", "bobina", "caicai", "rolao", "saboneteliquido", "saboneteespuma",
])

const SKIP_PATHS = new Set([
  "contato", "central-do-cliente", "cadastro", "my-account", "loja",
  "central_anteriores.php", "busca.php", "redirect_cart_service.php",
])

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    })
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

function extractDataLayer(html) {
  const match = html.match(/dataLayer\s*=\s*(\[[\s\S]*?\]);/)
  if (!match) return null
  try {
    const data = JSON.parse(match[1])
    return data[0] || null
  } catch {
    return null
  }
}

function isProductUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname !== "www.comali.com.br") return false
    const parts = u.pathname.split("/").filter(Boolean)
    if (parts.length < 2) return false
    const lastPart = parts[parts.length - 1]
    if (CATEGORY_PATHS.has(lastPart)) return false
    if (SKIP_PATHS.has(lastPart)) return false
    if (lastPart.includes(".php")) return false
    if (lastPart.includes("busca")) return false
    return true
  } catch {
    return false
  }
}

function extractProductUrls(html) {
  const urls = new Set()
  const regex = /href="(https:\/\/www\.comali\.com\.br\/[^"#]+)"/g
  let match
  while ((match = regex.exec(html)) !== null) {
    if (isProductUrl(match[1])) {
      urls.add(match[1])
    }
  }
  return Array.from(urls)
}

function extractOgData(html) {
  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1]
  const description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1]
  const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
  return { title, description, image }
}

function extractProductDescription(html) {
  const match = html.match(/<div class="product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/)
  if (!match) return null
  return match[1].replace(/<[^>]+>/g, "").trim()
}

function extractProductImages(html) {
  const images = []
  const regex = /https:\/\/images\.tcdn\.com\.br\/img\/img_prod\/746334\/[^"'\s]+/g
  let match
  while ((match = regex.exec(html)) !== null) {
    if (!images.includes(match[0])) {
      images.push(match[0])
    }
  }
  return images
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function importProducts() {
  const allProducts = []
  const productUrls = new Set()
  const seenIds = new Set()

  console.log("=== Phase 1: Collecting product URLs from categories ===\n")

  for (const catPath of CATEGORY_URLS) {
    const url = `${BASE_URL}${catPath}`
    console.log(`Scanning: ${url}`)
    const html = await fetchPage(url)
    if (!html) {
      console.log(`  ✗ Failed to fetch`)
      continue
    }
    const urls = extractProductUrls(html)
    const newUrls = urls.filter((u) => !productUrls.has(u))
    newUrls.forEach((u) => productUrls.add(u))
    console.log(`  Found ${urls.length} links, ${newUrls.length} new product URLs (total: ${productUrls.size})`)
    await sleep(300)
  }

  console.log(`\n=== Phase 2: Importing ${productUrls.size} products ===\n`)

  for (const productUrl of productUrls) {
    console.log(`Fetching: ${productUrl}`)
    const html = await fetchPage(productUrl)
    if (!html) {
      console.log(`  ✗ Failed to fetch`)
      continue
    }

    const dataLayer = extractDataLayer(html)
    const ogData = extractOgData(html)
    const images = extractProductImages(html)

    if (dataLayer && dataLayer.idProduct) {
      if (seenIds.has(dataLayer.idProduct)) {
        console.log(`  ⊘ Duplicate ID: ${dataLayer.idProduct}`)
        continue
      }
      seenIds.add(dataLayer.idProduct)

      const product = {
        id: dataLayer.idProduct,
        name: dataLayer.nameProduct,
        slug: productUrl.split("/").pop(),
        category: dataLayer.category,
        categoryId: dataLayer.idCategory,
        brand: dataLayer.brand,
        reference: dataLayer.reference,
        model: dataLayer.model,
        availability: dataLayer.availability,
        availabilityDetails: dataLayer.availabilityDetails,
        url: productUrl,
        imageUrl: dataLayer.urlImage,
        images: images,
        description: ogData.description || "",
        ogTitle: ogData.title || "",
        ogImage: ogData.image || "",
        skus: (dataLayer.listSku || []).map((sku) => ({
          id: sku.idSku,
          name: sku.nameSku,
          reference: sku.reference,
          price: sku.price,
          sellPrice: sku.sellPrice,
          availability: sku.availability,
          ean: sku.EAN,
        })),
        breadcrumb: dataLayer.breadcrumb,
      }
      allProducts.push(product)
      console.log(`  ✓ ${product.name} (ID: ${product.id}, ${product.skus.length} SKUs, ${product.images.length} images)`)
    } else {
      console.log(`  ✗ No product data found`)
    }

    await sleep(400)
  }

  const categories = [...new Set(allProducts.map((p) => p.category))]

  const result = {
    importedAt: new Date().toISOString(),
    source: "Tray e-commerce (comali.com.br)",
    storeId: "746334",
    totalProducts: allProducts.length,
    totalSkus: allProducts.reduce((sum, p) => sum + p.skus.length, 0),
    categories: categories.map((cat) => ({
      name: cat,
      count: allProducts.filter((p) => p.category === cat).length,
    })),
    products: allProducts,
  }

  writeFileSync("data/tray-products.json", JSON.stringify(result, null, 2))

  console.log(`\n=== Import Complete ===`)
  console.log(`Products: ${result.totalProducts}`)
  console.log(`SKUs: ${result.totalSkus}`)
  console.log(`Categories: ${categories.length}`)
  console.log(`Saved to: data/tray-products.json`)
  console.log(`\nCategories found:`)
  result.categories.forEach((c) => console.log(`  ${c.name}: ${c.count} products`))
}

importProducts().catch(console.error)
