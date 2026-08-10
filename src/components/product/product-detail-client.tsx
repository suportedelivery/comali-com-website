"use client"

import { useState } from "react"
import { ImageGallery } from "@/components/product/image-gallery"
import { Button } from "@/components/ui/button"
import { MessageCircle, Ruler } from "lucide-react"
import { getWhatsAppUrl } from "@/lib/whatsapp"

interface Variation {
  id: string
  type: string
  value: string
  sku: string
  price: number | null
  stock: number
  image: string | null
  availability: string | null
}

interface ProductData {
  title: string
  reference: string | null
  description?: string | null
  descriptionHTML?: string | null
  images: Array<{ url: string; alt: string }>
  dimensions: { length: number | null; width: number | null; height: number | null }
  variations: Variation[]
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

export function ProductDetailClient({ product }: { product: ProductData }) {
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null)
  const whatsappMessage = `Olá! Gostaria de solicitar um orçamento para: ${product.reference ? `${product.reference}: ` : ""}${product.title}`

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery
          images={product.images}
          productName={product.title}
          variations={product.variations}
          onVariationChange={setSelectedVariationId}
          selectedVariationId={selectedVariationId}
        />

        <div className="space-y-4">
          <div className="space-y-1">
            {product.reference && (
              <span className="inline-block text-[10px] text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                Ref: {product.reference}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Variações, Tamanhos e Cores logo abaixo do Nome do Produto */}
          {product.variations.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Variações / Cores / Tamanhos
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {product.variations.map((v) => {
                  const isActive = selectedVariationId === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariationId(v.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 bg-white hover:border-primary/50 cursor-pointer text-gray-800"
                      }`}
                    >
                      {v.type === "Cor" && (
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: getColorHex(v.value) }}
                        />
                      )}
                      <span>{v.value}</span>
                      {v.sku && (
                        <span className={`text-[10px] font-mono ${isActive ? "text-slate-200" : "text-gray-400"}`}>
                          ({v.sku})
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {Boolean(product.dimensions?.length && product.dimensions?.width && product.dimensions?.height) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Ruler className="h-3.5 w-3.5 text-purple-600" />
              <span>
                Dimensões: {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
              </span>
            </div>
          )}

          <div className="pt-2">
            <Button
              render={
                <a href={getWhatsAppUrl(whatsappMessage)} target="_blank" />
              }
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-10 py-2 font-bold shadow-sm"
            >
              <MessageCircle className="mr-2 h-5 w-5 animate-pulse" />
              Solicitar Orçamento via WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Caixa de Descrição com Fundo Azul Escuro e Fonte Branca */}
      {product.description && (
        <div className="mt-10 rounded-xl bg-slate-900 text-white p-6 shadow-md border-l-4 border-blue-500 space-y-3">
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-blue-400 border-b border-slate-800 pb-2">
            Descrição do Produto
          </h2>
          <div
            className="prose prose-invert max-w-none text-slate-200 leading-relaxed space-y-2 text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: product.descriptionHTML || product.description }}
          />
        </div>
      )}
    </>
  )
}
