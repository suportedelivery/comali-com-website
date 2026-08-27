import Link from "next/link"
import fs from "fs"
import path from "path"

export const revalidate = 60
import { Button } from "@/components/ui/button"
import { CategoryGrid } from "@/components/catalog/category-grid"
import { ProductCard } from "@/components/product/product-card"

import { getAllProducts, getFeaturedProducts } from "@/lib/sanity-products"
import { sanityClient } from "@/lib/sanity"
import { siteConfig } from "@/lib/config"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import {
  ShieldCheck,
  Truck,
  Users,
  Star,
  ArrowRight,
  MessageCircle,
  Building2,
  Cake,
  UtensilsCrossed,
  Beef,
  Hospital,
  Building,
  GraduationCap,
} from "lucide-react"

interface Segment {
  _id: string
  title: string
  slug: { current: string }
  subtitle: string | null
  icon: string | null
  description: string | null
  whatsappMessage: string | null
  illustrativeImage: { asset: { url: string }; alt: string | null } | null
}

interface HeroTile {
  key: string
  url: string
  alt: string
}

const segmentsQuery = `*[_type == "segment" && status == "active"] | order(order asc){
  _id,
  title,
  slug,
  subtitle,
  icon,
  description,
  whatsappMessage,
  illustrativeImage{
    asset->{url},
    alt
  }
}`

const featuredForHeroQuery = `*[_type == "product" && featured == true && status == "active"] | order(sortOrder asc)[0...6]{
  _id,
  title,
  images[0]{
    asset->{url},
    alt
  }
}`

const segmentIcons: Record<string, React.ReactNode> = {
  "construtoras-e-obras": <Building2 className="h-8 w-8" />,
  "panificadoras-e-confeitarias": <Cake className="h-8 w-8" />,
  "restaurantes-e-food-service": <UtensilsCrossed className="h-8 w-8" />,
  "acougues-e-industrias-de-alimentos": <Beef className="h-8 w-8" />,
  "hospitais-clinicas-e-laboratorios": <Hospital className="h-8 w-8" />,
  "empresas-condominios-e-industrias": <Building className="h-8 w-8" />,
  escolas: <GraduationCap className="h-8 w-8" />,
}

const segmentDescriptions: Record<string, string> = {
  "construtoras-e-obras":
    "Soluções para canteiros, áreas administrativas e empreendimentos.",
  "panificadoras-e-confeitarias":
    "Higienização específica para ambientes com farinha, massa e fermentação.",
  "restaurantes-e-food-service":
    "Produtos para cozinhas profissionais, áreas de preparo e atendimento.",
  "acougues-e-industrias-de-alimentos":
    "Soluções para cortes, processamento e embalagem de alimentos.",
  "hospitais-clinicas-e-laboratorios":
    "Higienização de alto nível para áreas críticas e controladas.",
  "empresas-condominios-e-industrias":
    "Produtos para escritórios, áreas comuns e ambientes industriais.",
  escolas: "Soluções para salas de aula, banheiros e áreas de alimentação.",
}

function getMosaicDirImages(): HeroTile[] {
  const dir = path.join(process.cwd(), "public", "imagens", "mosaico")
  try {
    const files = fs.readdirSync(dir)
    return files
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort()
      .map((f) => ({
        key: `mos-${f}`,
        url: `/imagens/mosaico/${f}`,
        alt: f.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      }))
  } catch {
    return []
  }
}

export default async function Home() {
  const allProducts = await getAllProducts()
  const featuredProducts = await getFeaturedProducts(8)
  const segments: Segment[] = await sanityClient.fetch(segmentsQuery)
  const featuredForHero: Array<{
    _id: string
    title: string
    images: { asset: { url: string }; alt: string } | null
  }> = await sanityClient.fetch(featuredForHeroQuery)

  // Build hero mosaic tiles: 12 tiles total
  // Desktop: 6 cols x 2 rows = 12 | Mobile: 3 cols x 4 rows = 12
  const TILES_COUNT = 12

  const mosaicDirImages = getMosaicDirImages()

  const segmentImageUrls = segments
    .filter((s) => s.illustrativeImage?.asset?.url)
    .map((s) => ({
      key: `seg-${s._id}`,
      url: `${s.illustrativeImage!.asset.url}?w=400&h=400&fit=max&auto=format`,
      alt: s.illustrativeImage!.alt || s.title,
    }))

  const productImageUrls = featuredForHero
    .filter((p) => p.images?.asset?.url)
    .map((p) => ({
      key: `prod-${p._id}`,
      url: `${p.images!.asset.url}?w=400&h=400&fit=max&auto=format`,
      alt: p.images!.alt || p.title,
    }))

  // Fill 12 tiles: mosaic dir → segments → banner-home → products → cycle
  const allSources = [
    ...mosaicDirImages,
    ...segmentImageUrls,
    {
      key: "banner-home",
      url: "/imagens/banner-home.jpg",
      alt: "Comali - Soluções profissionais",
    },
    ...productImageUrls,
  ]

  const heroTiles: HeroTile[] = []
  for (let i = 0; i < TILES_COUNT; i++) {
    if (i < allSources.length) {
      heroTiles.push(allSources[i])
    } else {
      // Cycle back
      const src = allSources[i % allSources.length]
      heroTiles.push({ ...src, key: `cycle-${i}-${src.key}` })
    }
  }

  // Breathing animation durations (staggered, alternating)
  const breatheDurations = ["12s", "16s", "20s", "14s", "18s", "15s"]

  return (
    <>
      {/* Hero principal — full-bleed image mosaic background */}
      <section className="relative min-h-[560px] md:min-h-[640px] lg:min-h-[720px] overflow-hidden bg-slate-950">
        {/* Image mosaic grid — covers 100% of the section */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 md:grid-cols-6 md:grid-rows-2 gap-[3px]">
          {heroTiles.map((tile, idx) => (
            <div key={tile.key} className="relative overflow-hidden">
              {tile.url ? (
                <img
                  src={tile.url}
                  alt={tile.alt}
                  className={`h-full w-full object-cover saturate-[1.3] contrast-[1.08] brightness-[1.05] ${
                    idx % 2 === 0
                      ? `animate-[mosaic-breathe_${breatheDurations[idx % breatheDurations.length]}_ease-in-out_infinite_alternate]`
                      : ""
                  }`}
                  loading={idx < 6 ? "eager" : "lazy"}
                />
              ) : (
                <div className="h-full w-full bg-slate-800" />
              )}
            </div>
          ))}
        </div>

        {/* Directional overlay — darkens left side (text area), fades right */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-slate-950/25" />
        {/* Bottom gradient — softens lower edge */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex h-full min-h-[560px] md:min-h-[640px] lg:min-h-[720px] items-center">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-lg">
                Soluções profissionais para{" "}
                <span className="text-cyan-400">higiene, limpeza</span> e{" "}
                <span className="text-cyan-400">gestão de resíduos</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-slate-200 max-w-xl">
                Produtos químicos, dispensers, lixeiras, contentores e
                equipamentos para empresas e ambientes profissionais.
              </p>
              <Button
                render={<Link href="/segmentos" />}
                size="lg"
                className="mt-8 px-8 py-4 font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-lg shadow-cyan-500/40 hover:scale-105 transition-all duration-200"
              >
                CONHEÇA NOSSAS SOLUÇÕES
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Segmentos de público */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Encontre a solução para sua empresa
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Atendemos empresas que precisam de produtos profissionais, alto
            rendimento e soluções para ambientes de grande circulação.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {segments.map((seg) => {
            const imageUrl = seg.illustrativeImage?.asset?.url
            const imageAlt = seg.illustrativeImage?.alt || seg.title
            const slug = seg.slug?.current || ""
            const icon = segmentIcons[slug] || (
              <Building2 className="h-8 w-8" />
            )
            const description =
              seg.description || segmentDescriptions[slug] || ""

            if (imageUrl) {
              return (
                <Link
                  key={seg._id}
                  href={`/segmentos/${slug}`}
                  className="group relative h-72 overflow-hidden rounded-xl transition-all hover:shadow-lg"
                >
                  {/* Imagem de fundo */}
                  <img
                    src={`${imageUrl}?w=600&h=400&fit=max&auto=format`}
                    alt={imageAlt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  {/* Texto */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="font-semibold text-lg text-white mb-1">
                      {seg.title}
                    </h3>
                    {seg.subtitle && (
                      <p className="text-sm text-white/80 mb-3 line-clamp-2">
                        {seg.subtitle}
                      </p>
                    )}
                    <span className="text-sm font-medium text-primary group-hover:underline">
                      Ver soluções →
                    </span>
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={seg._id}
                href={`/segmentos/${slug}`}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {icon}
                </div>
                <h3 className="font-semibold text-lg mb-1">{seg.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {description}
                </p>
                <span className="text-sm font-medium text-primary group-hover:underline">
                  Ver soluções →
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Categorias */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Nossas Categorias
          </h2>
          <p className="mt-2 text-muted-foreground">
            Soluções completas em higiene e limpeza profissional
          </p>
        </div>
        <CategoryGrid />
      </section>

      {/* Produtos em Destaque */}
      {featuredProducts.length > 0 && (
        <section className="bg-muted/50">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Produtos em Destaque
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Confira alguns dos nossos produtos mais procurados
                </p>
              </div>
              <Button render={<Link href="/produtos" />} variant="outline">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Por que escolher */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Por que escolher a {siteConfig.name}?
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {[
            {
              icon: <ShieldCheck className="h-8 w-8" />,
              title: "Qualidade Garantida",
              description:
                "Produtos de marcas reconhecidas no mercado profissional.",
            },
            {
              icon: <Truck className="h-8 w-8" />,
              title: "Entrega Rápida",
              description: "Logística eficiente para todo o Brasil.",
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Atendimento B2B",
              description: "Equipe especializada para atender sua empresa.",
            },
            {
              icon: <Star className="h-8 w-8" />,
              title: "Preços Competitivos",
              description: "Condições especiais para compras em volume.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                {item.icon}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-primary p-8 md:p-12 text-primary-foreground text-center space-y-4">
          <h2 className="text-3xl font-bold">
            Pronto para solicitar um orçamento?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Entre em contato pelo WhatsApp e receba uma proposta personalizada
            para sua empresa.
          </p>
          <Button
            render={
              <a
                href={getWhatsAppUrl(
                  "Olá! Gostaria de solicitar um orçamento para minha empresa."
                )}
                target="_blank"
              />
            }
            size="lg"
            variant="secondary"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Solicitar Orçamento via WhatsApp
          </Button>
        </div>
      </section>
    </>
  )
}
