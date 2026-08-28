import Link from "next/link"
import type { Metadata } from "next"
import { sanityClient, urlFor } from "@/lib/sanity"

export const metadata: Metadata = {
  title: "Soluções por Segmento",
  description:
    "Atendemos empresas que precisam de produtos profissionais, alto rendimento e soluções para ambientes de grande circulação.",
}

export const revalidate = 60

interface Segment {
  _id: string
  title: string
  slug: { current: string }
  subtitle: string | null
  icon: string | null
  illustrativeImage: { asset: { url: string }; alt: string | null } | null
}

const segmentsQuery = `*[_type == "segment" && status == "active"] | order(order asc){
  _id,
  title,
  slug,
  subtitle,
  icon,
  illustrativeImage{
    asset->{url},
    alt
  }
}`

async function getActiveSegments(): Promise<Segment[]> {
  return sanityClient.fetch(segmentsQuery)
}

export default async function SegmentsPage() {
  const segments = await getActiveSegments()

  return (
    <div>
      {/* Hero Header */}
      <section className="scroll-mt-40 bg-slate-900 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Encontre a solução para sua empresa
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Atendemos empresas que precisam de produtos profissionais, alto
            rendimento e soluções para ambientes de grande circulação.
          </p>
        </div>
      </section>

      {/* Segments Grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {segments.length === 0 ? (
            <p className="text-center text-lg text-slate-500">
              Nenhum segmento disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {segments.map((segment) => {
                const imageUrl = segment.illustrativeImage?.asset?.url
                const imageAlt =
                  segment.illustrativeImage?.alt || segment.title

                return (
                  <Link
                    key={segment._id}
                    href={`/segmentos/${segment.slug.current}`}
                    className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <img
                          src={`${imageUrl}?w=640&h=400&fit=max&auto=format`}
                          alt={imageAlt}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-6xl">
                            {segment.icon || "📦"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-3">
                        {segment.icon && (
                          <span className="text-2xl">{segment.icon}</span>
                        )}
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {segment.title}
                        </h2>
                      </div>
                      {segment.subtitle && (
                        <p className="mb-4 text-sm leading-relaxed text-slate-500">
                          {segment.subtitle}
                        </p>
                      )}
                      <span className="inline-flex items-center text-sm font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">
                        Ver soluções →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
