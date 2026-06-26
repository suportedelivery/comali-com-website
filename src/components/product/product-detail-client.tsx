"use client"

import { useState, useCallback } from "react"
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
  const [activeVariationImageIndex, setActiveVariationImageIndex] = useState<number | null>(null)
  const whatsappMessage = `Olá! Gostaria de solicitar um orçamento para: ${product.title}${product.reference ? ` (Ref: ${product.reference})` : ""}`

  const varWithImages = product.variations.filter((v) => v.image)
  const productImagesCount = product.images.length
  const varImageStartIndex = productImagesCount

  const handleVariationClick = useCallback(
    (v: Variation) => {
      const varIdx = varWithImages.indexOf(v)
      if (varIdx >= 0) {
        setActiveVariationImageIndex(varImageStartIndex + varIdx)
      }
    },
    [varWithImages, varImageStartIndex]
  )

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery
          images={product.images}
          productName={product.title}
          variations={product.variations}
          onVariationImageIndex={setActiveVariationImageIndex}
        />

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

          {product.variations.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Variações Disponíveis
              </h2>
              <div className="flex flex-wrap gap-1">
                {product.variations.map((v) => {
                  const isActive = varWithImages.includes(v) && activeVariationImageIndex !== null
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVariationClick(v)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 border-primary"
                          : "border-gray-200 bg-white hover:border-primary/50 cursor-pointer"
                      }`}
                    >
                      {v.type === "Cor" && (
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: getColorHex(v.value) }}
                        />
                      )}
                      <span>{v.value}</span>
                      {v.sku && (
                        <span className="text-[10px] text-gray-400 font-mono">({v.sku})</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
