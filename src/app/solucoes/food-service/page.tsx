import type { Metadata } from "next"
import { sanityClient } from "@/lib/sanity"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/sanity-products"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Produtos Químicos para Food Service | COMALI",
  description:
    "Linha profissional de produtos químicos concentrados para cozinhas industriais, restaurantes e padarias.",
  openGraph: {
    title: "Produtos Químicos para Food Service | COMALI",
    description:
      "Linha profissional organizada por necessidade: do desengordurante ao desinfetante, tudo para cozinhas industriais.",
    type: "website",
    locale: "pt_BR",
  },
}

interface NeedSection {
  name: string
  description: string
  keywords: string[]
  products: Product[]
}

const QUIMICOS_PARENT = "Produtos Químicos Concentrados"

const NEEDS: Omit<NeedSection, "products">[] = [
  {
    name: "Limpeza Diária e Multiuso",
    description:
      "Detergentes concentrados para a rotina diária de pisos, bancadas e superfícies.",
    keywords: ["1000 plus", "detcol"],
  },
  {
    name: "Desengorduramento de Gorduras",
    description:
      "Alcalinos de alta performance para coifas, fogões e gorduras pesadas.",
    keywords: ["all clear"],
  },
  {
    name: "Limpeza Pesada e Desincrustação",
    description:
      "Clorados para sujeiras incrustadas e limpeza profunda.",
    keywords: ["espuma clor", "force"],
  },
  {
    name: "Brilho em Inox e Alumínio",
    description:
      "Produtos que limpam e devolvem o brilho de inox e alumínio.",
    keywords: ["alumex"],
  },
  {
    name: "Higienização e Desinfecção",
    description:
      "Desinfetantes e clorados para higienização de ambientes e superfícies.",
    keywords: ["bacter plus", "sanyx"],
  },
  {
    name: "Vidros e Superfícies",
    description:
      "Limpa vidros e multiuso de alto rendimento para acabamento.",
    keywords: ["glass"],
  },
]

const productsQuery = `*[_type == "product" && status == "active"] | order(sortOrder asc, title asc){
  _id,
  _type,
  title,
  slug,
  description,
  "categoryParents": categories[]->parentCategory->title,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current,
    "parentCategory": parentCategory->{
      _id,
      title,
      "slug": slug.current
    }
  },
  images[]{
    _type,
    "url": asset->url,
    alt
  },
  externalImages[]{
    _type,
    _key,
    url,
    alt
  },
  hasVariations,
  variations,
  price
}`

async function getChemicalProducts(): Promise<Product[]> {
  const all = await sanityClient.fetch<Product[]>(productsQuery)
  return all.filter((p) => {
    const parents = (p as unknown as { categoryParents?: string[] }).categoryParents || []
    return parents.includes(QUIMICOS_PARENT)
  })
}

function classifyByNeed(products: Product[]): NeedSection[] {
  const sections: NeedSection[] = NEEDS.map((n) => ({ ...n, products: [] }))
  const otherProducts: Product[] = []

  for (const p of products) {
    const title = (p.title || "").toLowerCase()
    let matched = false
    for (const section of sections) {
      if (section.keywords.some((kw) => title.includes(kw))) {
        section.products.push(p)
        matched = true
        break
      }
    }
    if (!matched) otherProducts.push(p)
  }

  const result = sections.filter((s) => s.products.length > 0)
  if (otherProducts.length > 0) {
    result.push({
      name: "Outros produtos químicos",
      description: "Demais produtos da linha química profissional.",
      keywords: [],
      products: otherProducts,
    })
  }
  return result
}

export default async function FoodServicePage() {
  const products = await getChemicalProducts()
  const sections = classifyByNeed(products)
  const whatsappUrl = getWhatsAppUrl("QUERO CONHECER A LINHA FOOD SERVICE")

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src="/imagens/food-service.jpg"
          alt="Cozinha profissional de restaurante"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Produtos Químicos para Food Service
              </h1>
              <p className="mt-4 text-lg text-slate-300 sm:text-xl">
                Linha profissional organizada por necessidade: do desengordurante
                ao desinfetante, tudo para cozinhas industriais, restaurantes e
                padarias.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-green-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                QUERO CONHECER A LINHA FOOD SERVICE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {sections.map((section) => (
            <div key={section.name}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {section.name}
                </h2>
                <p className="mt-2 text-lg text-slate-600">
                  {section.description}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
