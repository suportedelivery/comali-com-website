import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CategoryGrid } from "@/components/catalog/category-grid"
import { ProductCard } from "@/components/product/product-card"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { EnvironmentsSection } from "@/components/home/environments-section"
import { getAllProducts, getFeaturedProducts } from "@/lib/sanity-products"
import { siteConfig } from "@/lib/config"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import {
  ShieldCheck,
  Truck,
  Users,
  Star,
  ArrowRight,
  MessageCircle,
} from "lucide-react"

export default async function Home() {
  const allProducts = await getAllProducts()
  const featuredProducts = await getFeaturedProducts(8)

  return (
    <>
      <HeroCarousel featuredProducts={featuredProducts} allProducts={allProducts} />

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

      <EnvironmentsSection />

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
