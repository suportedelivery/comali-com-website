import { getProductBySlug, getAllProducts } from "@/lib/products"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ImageGallery } from "@/components/product/image-gallery"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { MessageCircle, Ruler, Phone } from "lucide-react"

interface ProductPageProps {
  params: Promise<{ categoria: string; slug: string }>
}

function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    azul: "#1e40af",
    marrom: "#78350f",
    amarela: "#facc15",
    amarelo: "#facc15",
    branca: "#f9fafb",
    branco: "#f9fafb",
    laranja: "#f97316",
    vermelha: "#dc2626",
    vermelho: "#dc2626",
    cinza: "#6b7280",
    verde: "#15803d",
    "verde escuro": "#166534",
    "verde-escuro": "#166534",
  }
  const normalized = colorName.toLowerCase().trim()
  return colors[normalized] || "#d1d5db"
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return { title: "Produto não encontrado" }
  return {
    title: product.meta.title,
    description: product.meta.description,
  }
}

export async function generateStaticParams() {
  const products = getAllProducts()
  return products.map((product) => ({
    categoria: product.categories[0]?.slug || "produtos",
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) notFound()

  const mainCategory = product.categories[0]
  const whatsappMessage = `Olá! Gostaria de solicitar um orçamento para: ${product.title}${product.reference ? ` (Ref: ${product.reference})` : ""}`

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/produtos" />}>
              Produtos
            </BreadcrumbLink>
          </BreadcrumbItem>
          {mainCategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/produtos/${mainCategory.slug}`} />}>
                  {mainCategory.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} productName={product.title} />

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {product.reference && (
                <span className="text-[10px] text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                  Ref: CMI{product.reference}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
              {product.title}
            </h1>
          </div>

          <div className="space-y-2">
            <Button
              render={
                <a href={getWhatsAppUrl(whatsappMessage)} target="_blank" />
              }
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-9 py-2"
            >
              <MessageCircle className="mr-1.5 h-4 w-4 animate-pulse" />
              Solicitar Orçamento via WhatsApp
            </Button>
          </div>

          {product.dimensions.length && product.dimensions.width && product.dimensions.height && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="h-3.5 w-3.5 text-purple-600" />
              <span>
                Dimensões: {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
              </span>
            </div>
          )}

          {product.hasVariations && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Variações Disponíveis
              </h2>
              <div className="flex flex-wrap gap-1">
                {product.variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 bg-white text-[11px] font-medium text-gray-700 shadow-sm"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                      style={{
                        backgroundColor: getColorHex(variation.value),
                      }}
                      aria-label={`Cor ${variation.value}`}
                    />
                    <span>
                      {variation.value}
                      {variation.sku && (
                        <span className="text-gray-400 font-mono text-[9px] ml-1">
                          ({variation.sku})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-12">
          <div className="bg-gray-900 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Descrição</h2>
            <div
              className="max-w-none text-white space-y-2 [&_*]:!text-white [&_*]:!bg-transparent [&_*]:!font-sans [&_*]:!text-[15px] [&_*]:!leading-normal [&_*]:!not-italic [&_strong]:!font-bold [&_b]:!font-bold [&_a]:!text-cyan-400 [&_ul]:!list-disc [&_ul]:!pl-5 [&_ol]:!list-decimal [&_ol]:!pl-5"
              dangerouslySetInnerHTML={{ __html: product.descriptionHTML || product.description }}
            />
          </div>
        </div>
      )}

      <div className="mt-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-lg">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Precisa de mais informações?
          </h2>
          <p className="text-gray-300">
            Nossa equipe está pronta para atender sua empresa
          </p>
          <Button
            render={
              <a href={getWhatsAppUrl(whatsappMessage)} target="_blank" />
            }
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Falar com Consultor
          </Button>
        </div>
      </div>
    </div>
  )
}
