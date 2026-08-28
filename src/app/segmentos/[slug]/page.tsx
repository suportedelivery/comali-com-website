import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { sanityClient, urlFor } from "@/lib/sanity"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/sanity-products"

export const revalidate = 60

interface SegmentPageProps {
  params: Promise<{ slug: string }>
}

interface Segment {
  _id: string
  title: string
  slug: { current: string }
  subtitle: string | null
  description: string | null
  icon: string | null
  whatsappMessage: string | null
  illustrativeImage: { asset: { url: string }; alt: string | null } | null
  produtosDoSegmento: Product[]
  meta: { title: string; description: string; keywords: string | null } | null
}

interface ProductWithParent {
  _id: string
  _type: "product"
  title: string
  slug: { current: string }
  description: string | null
  descriptionHTML?: string | null
  brand: string | null
  reference: string | null
  ean: string | null
  price: number | null
  stock: number
  availability: string | null
  warranty: string | null
  weight: number | null
  dimensions: { length: number | null; width: number | null; height: number | null } | null
  sortOrder: number
  featured: boolean
  new: boolean
  status: string
  categories: Array<{
    _id: string
    title: string
    slug: string | { current: string }
    parent?: string
    parentCategory?: { title: string; slug: { current: string } }
  }>
  categoryParents: string[]
  images: Array<{
    _type: string
    asset: { url: string }
    alt: string | null
  }>
  externalImages: any[]
  hasVariations: boolean
  variations: any[]
  whatsappMessage: string | null
  meta: { title: string; description: string; keywords: string | null } | null
}

interface CategoryGroup {
  name: string
  products: ProductWithParent[]
}

const QUIMICOS_PARENT = "Produtos Químicos Concentrados"

function isChemical(p: ProductWithParent): boolean {
  if (p.categoryParents.includes(QUIMICOS_PARENT)) return true
  if (p.categories) {
    for (const cat of p.categories) {
      if (cat.title === QUIMICOS_PARENT) return true
      if (cat.parentCategory?.title === QUIMICOS_PARENT) return true
    }
  }
  return false
}

function isGroupChemical(products: ProductWithParent[]): boolean {
  return products.some(isChemical)
}

function groupProducts(products: ProductWithParent[]): CategoryGroup[] {
  const map = new Map<string, ProductWithParent[]>()

  for (const p of products) {
    const cats = p.categories
    if (cats && cats.length > 0) {
      for (const cat of cats) {
        const catName = cat.title || "Outros"
        const list = map.get(catName) || []
        list.push(p)
        map.set(catName, list)
      }
    } else {
      const list = map.get("Outros") || []
      list.push(p)
      map.set("Outros", list)
    }
  }

  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        a.title.localeCompare(b.title)
    )
  }

  const groups: CategoryGroup[] = Array.from(map.entries()).map(
    ([name, prods]) => ({ name, products: prods })
  )

  groups.sort((a, b) => {
    const aChem = isGroupChemical(a.products)
    const bChem = isGroupChemical(b.products)
    if (aChem !== bChem) return aChem ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return groups
}

const segmentQuery = `*[_type == "segment" && slug.current == $slug && status == "active"][0]{
  _id,
  title,
  slug,
  subtitle,
  description,
  icon,
  whatsappMessage,
  illustrativeImage{
    asset->{url},
    alt
  },
  "produtosDoSegmento": *[_type == "product" && references(^._id)] | order(sortOrder asc, title asc){
    _id,
    _type,
    title,
    slug,
    description,
    descriptionHTML,
    brand,
    reference,
    ean,
    price,
    stock,
    availability,
    warranty,
    weight,
    dimensions,
    sortOrder,
    featured,
    new,
    status,
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
    "categoryParents": categories[]->parentCategory->title,
    images[]{ _type, asset->{url}, alt },
    "externalImages": externalImages[],
    hasVariations,
    variations,
    whatsappMessage,
    meta
  },
  meta
}`

async function getSegment(slug: string): Promise<Segment | null> {
  return sanityClient.fetch(segmentQuery, { slug })
}

export async function generateMetadata({
  params,
}: SegmentPageProps): Promise<Metadata> {
  const { slug } = await params
  const segment = await getSegment(slug)

  if (!segment) {
    return { title: "Segmento não encontrado" }
  }

  const metaTitle = segment.meta?.title || `${segment.title} | Comali`
  const metaDescription =
    segment.meta?.description ||
    segment.description ||
    `Soluções profissionais para ${segment.title}`
  const metaKeywords = segment.meta?.keywords || undefined

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      locale: "pt_BR",
    },
  }
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { slug } = await params
  const segment = await getSegment(slug)

  if (!segment) {
    notFound()
  }

  const heroImageUrl = segment.illustrativeImage?.asset?.url
  const heroAlt = segment.illustrativeImage?.alt || segment.title
  const whatsappText = segment.whatsappMessage || `Quero uma solução para ${segment.title}`
  const whatsappUrl = getWhatsAppUrl(whatsappText)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        {heroImageUrl ? (
          <img
            src={`${heroImageUrl}?w=1600&h=800&fit=max&auto=format`}
            alt={heroAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              {segment.icon && (
                <span className="mb-4 block text-5xl">{segment.icon}</span>
              )}
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {segment.title}
              </h1>
              {segment.subtitle && (
                <p className="mt-4 text-lg text-slate-200 sm:text-xl">
                  {segment.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {segment.description && (
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-lg leading-relaxed text-slate-600">
                {segment.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-green-700"
          >
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {whatsappText}
          </a>
        </div>
      </section>

      {/* Produtos deste segmento */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-slate-900 sm:text-3xl">
            Catálogo completo
          </h2>
          {segment.produtosDoSegmento.length > 0 ? (
            (() => {
              const products = segment.produtosDoSegmento.map((p) => ({
                ...p,
                categoryParents:
                  (p as unknown as { categoryParents?: string[] })
                    .categoryParents || [],
              })) as unknown as ProductWithParent[]
              const groups = groupProducts(products)
              return (
                <div className="space-y-10">
                  {groups.map((group) => (
                    <div key={group.name}>
                      <h3 className="mb-4 text-lg font-semibold text-slate-800">
                        {group.name}
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {group.products.map((product) => (
                          <ProductCard key={product._id} product={product as unknown as Product} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <p className="text-lg text-slate-500">
                Em breve novos produtos para este segmento.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
