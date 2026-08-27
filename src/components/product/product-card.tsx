import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import type { Product } from "@/lib/sanity-products"

interface ProductCardProps {
  product: Product
  currentCategorySlug?: string
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

export function ProductCard({ product, currentCategorySlug }: ProductCardProps) {
  // Use externalImages if available, fallback to images
  const externalImg = (product as any).externalImages?.[0]
  const internalImg = product.images?.[0]
  const imageUrl = externalImg?.url || (internalImg as any)?.url
  const optimizedUrl = imageUrl ? optimizeImageUrl(imageUrl, 400, 400) : null
  
  // parentCategory.slug vem como string plana da projeção GROQ ("slug": slug.current)
  // Então c.parentCategory?.slug é uma string, NÃO um objeto { current: string }
  const getCatSlug = (c: any): string => c?.slug?.current || c?.slug || ""
  const getParentSlug = (c: any): string | undefined => {
    const pc = c?.parentCategory
    if (!pc) return undefined
    // slug pode ser string plana (GROQ projeção) ou objeto { current: string }
    return typeof pc.slug === "string" ? pc.slug : pc.slug?.current
  }

  // Prioriza categoria que bate com currentCategorySlug E tem pai
  const matchedSubCat = currentCategorySlug
    ? product.categories?.find((c: any) => getCatSlug(c) === currentCategorySlug && getParentSlug(c))
    : undefined
  // Fallback: qualquer subcategoria com pai, depois a primeira categoria
  const subCat = matchedSubCat
    || product.categories?.find((c: any) => getParentSlug(c))
    || product.categories?.[0] as any

  const parentSlug = getParentSlug(subCat)
  const categorySlug = getCatSlug(subCat) || "produtos"
  const productSlug = product.slug?.current || (product.slug as any) || ""
  const categoryName = subCat?.title || subCat?.name

  const linkHref = parentSlug
    ? `/produtos/${parentSlug}/${categorySlug}/${productSlug}`
    : `/produtos/${categorySlug}/${productSlug}`

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border border-gray-200 hover:border-gray-300 bg-white">
      <Link href={linkHref}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 p-4">
          {optimizedUrl ? (
            <img
              src={optimizedUrl}
              alt={product.title}
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
          {product.description && (
            <p className="mt-1 text-sm text-sky-700 font-medium line-clamp-2">
              {product.description}
            </p>
          )}
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
