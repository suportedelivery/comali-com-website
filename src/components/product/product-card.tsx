"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import type { Product } from "@/lib/sanity-products"

interface ProductCardProps {
  product: Product
}

function optimizeImageUrl(url: string, width: number, height: number): string {
  if (!url) return ""
  if (url.includes("cdn.sanity.io")) {
    return `${url}?w=${width}&h=${height}&fit=max&auto=format`
  }
  if (url.includes("tcdn.com.br")) {
    return `${url}?w=${width}&h=${height}&fit=fill`
  }
  return url
}

export function ProductCard({ product }: ProductCardProps) {
  // Use externalImages if available, fallback to images
  const externalImg = (product as any).externalImages?.[0]
  const internalImg = product.images?.[0]
  const imageUrl = externalImg?.url || (internalImg as any)?.url
  const optimizedUrl = imageUrl ? optimizeImageUrl(imageUrl, 400, 400) : null
  const categoryName = (product.categories?.[0] as any)?.title
  const categorySlug = (product.categories?.[0] as any)?.slug || "produtos"
  const productSlug = product.slug?.current || ""

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border border-gray-200 hover:border-gray-300 bg-white">
      <Link href={`/produtos/${categorySlug}/${productSlug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 p-4">
{optimizedUrl ? (
              <img
                src={optimizedUrl}
                alt={product.title}
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
                className="h-full w-full object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem imagem
              </div>
            )}
          {product.featured && (
            <Badge className="absolute top-2 left-2">Destaque</Badge>
          )}
          {product.hasVariations && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Variações
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          {categoryName && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {categoryName}
            </p>
          )}
          <h3 className="mt-1 font-semibold leading-tight line-clamp-2">
            {product.title}
          </h3>

        </CardContent>
      </Link>
      <div className="px-4 pb-4">
        <Button
          render={
            <a
              href={getWhatsAppUrl(
                `Olá! Gostaria de solicitar um orçamento para: ${product.reference ? `${product.reference}: ` : ""}${product.title}`,
                product.title
              )}
              target="_blank"
            />
          }
          className="w-full"
          size="sm"
        >
          Solicitar Orçamento
        </Button>
      </div>
    </Card>
  )
}
