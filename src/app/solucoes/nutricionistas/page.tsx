import type { Metadata } from "next"
import { sanityClient } from "@/lib/sanity"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/sanity-products"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Soluções para Nutricionistas | COMALI",
  description:
    "Produtos químicos profissionais para nutricionistas que atuam em UANs, restaurantes, padarias e indústrias de alimentos.",
  openGraph: {
    title: "Soluções para Nutricionistas | COMALI",
    description:
      "Parceria com nutricionistas em UANs, restaurantes e indústrias de alimentos com segurança alimentar e conformidade ANVISA.",
    type: "website",
    locale: "pt_BR",
  },
}

const productsQuery = `*[_type == "product" && status == "active"] | order(sortOrder asc, title asc){
  _id,
  _type,
  title,
  slug,
  description,
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

const RECOMMENDED_TITLES = [
  "sanyx",
  "bacter plus",
  "1000 plus",
  "espuma clor",
  "alumex",
  "all clear",
]

async function getRecommendedProducts(): Promise<Product[]> {
  const all = await sanityClient.fetch<Product[]>(productsQuery)
  return all.filter((p) => {
    const title = (p.title || "").toLowerCase()
    return RECOMMENDED_TITLES.some((kw) => title.includes(kw))
  })
}

export default async function NutricionistasPage() {
  const products = await getRecommendedProducts()
  const whatsappUrl = getWhatsAppUrl(
    "SOU NUTRICIONISTA E QUERO UMA CONSULTORIA"
  )

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src="/imagens/nutricionistas.jpg"
          alt="Profissional de nutrição em ambiente hospitalar"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Soluções para Nutricionistas
              </h1>
              <p className="mt-4 text-lg text-slate-300 sm:text-xl">
                A COMALI é parceira de nutricionistas que atuam em UANs,
                restaurantes, padarias e indústrias de alimentos, com produtos que
                garantem segurança alimentar e conformidade com as normas da
                ANVISA.
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
                SOU NUTRICIONISTA E QUERO UMA CONSULTORIA
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Por que a higiene profissional importa? */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-2xl font-bold text-slate-900 sm:text-3xl">
            Por que a higiene profissional importa?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Segurança alimentar
              </h3>
              <p className="text-slate-600">
                Produtos que eliminam riscos de contaminação cruzada e atendem
                às exigências da Vigilância Sanitária.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Conformidade com a ANVISA
              </h3>
              <p className="text-slate-600">
                Linha profissional com fichas técnicas para auditorias e manuais
                de boas práticas.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Produtividade da equipe
              </h3>
              <p className="text-slate-600">
                Produtos concentrados com diluição padronizada, reduzindo custo
                e retrabalho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos recomendados */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-slate-900 sm:text-3xl">
            Produtos recomendados por especialistas
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-lg text-slate-500">
                Em breve novos produtos para esta linha.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            Seja um(a) nutricionista parceiro(a) COMALI
          </h2>
          <p className="mb-8 text-lg text-slate-600 max-w-2xl mx-auto">
            Ofereça produtos profissionais de higiene e limpeza aos seus
            clientes. Parceria com condições especiais para nutricionistas.
          </p>
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
            QUERO SER UM(A) PARCEIRO(A) COMALI
          </a>
        </div>
      </section>
    </div>
  )
}
