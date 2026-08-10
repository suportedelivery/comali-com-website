import { getProductsByCategory, getAllCategories, getProductBySlug, getAllProducts } from "@/lib/sanity-products"
import { getProductBySlug as getProductDetails } from "@/lib/products"

export const revalidate = 60
import { ProductCard } from "@/components/product/product-card"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { MessageCircle } from "lucide-react"
import { ProductDetailClient } from "@/components/product/product-detail-client"

interface DynamicProductsRouteProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: DynamicProductsRouteProps) {
  const { slug } = await params
  const categories = await getAllCategories()
  
  if (slug.length === 1) {
    const catSlug = slug[0]
    const cat = categories.find((c) => c.slug.current === catSlug)
    const title = cat?.title || catSlug.replace(/-/g, " ").toUpperCase()
    return { title, description: `Produtos da categoria ${title}` }
  }

  if (slug.length === 2) {
    const [parentSlug, targetSlug] = slug
    // Check if target is a product or subcategory
    const product = await getProductBySlug(targetSlug)
    if (product) {
      return { title: product.title, description: product.description || product.title }
    }
    const cat = categories.find((c) => c.slug.current === targetSlug)
    const title = cat?.title || targetSlug.replace(/-/g, " ").toUpperCase()
    return { title, description: `Produtos da categoria ${title}` }
  }

  if (slug.length === 3) {
    const productSlug = slug[2]
    const product = await getProductBySlug(productSlug)
    if (product) {
      return { title: product.title, description: product.description || product.title }
    }
  }

  return { title: "Produtos" }
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  const allProds = await getAllProducts()
  const params: Array<{ slug: string[] }> = []

  // 1-level category pages: /produtos/lixeiras-inox, /produtos/produtos-quimicos-concentrados
  for (const cat of categories) {
    params.push({ slug: [cat.slug.current] })
  }

  // 2-level category pages: /produtos/produtos-quimicos-concentrados/supermercados
  for (const cat of categories) {
    if ((cat as any).parentCategory?.slug?.current) {
      params.push({ slug: [(cat as any).parentCategory.slug.current, cat.slug.current] })
    }
  }

  // Product detail pages
  for (const p of allProds) {
    const mainCat = (p as any).categories?.[0]
    const parentSlug = mainCat?.parent || mainCat?.parentCategory?.slug?.current
    const catSlug = mainCat?.slug?.current || mainCat?.slug || "produtos"
    const pSlug = p.slug?.current || (p as any).slug || ""

    if (pSlug) {
      if (parentSlug) {
        params.push({ slug: [parentSlug, catSlug, pSlug] })
      } else {
        params.push({ slug: [catSlug, pSlug] })
      }
    }
  }

  return params
}

export default async function DynamicProductsRoute({ params }: DynamicProductsRouteProps) {
  const { slug } = await params
  const categories = await getAllCategories()

  // 1-Level Route: /produtos/[categoria]
  if (slug.length === 1) {
    const catSlug = slug[0]
    const products = await getProductsByCategory(catSlug)
    const category = categories.find((c) => c.slug.current === catSlug)
    const categoryTitle = category?.title || catSlug.replace(/-/g, " ").toUpperCase()

    if (!category && products.length === 0) notFound()

    return (
      <div className="container mx-auto px-4 py-12 bg-slate-50 min-h-screen">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/produtos" />}>
                Produtos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{categoryTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-slate-200 p-4 rounded-lg mb-8 border-l-4 border-blue-900">
          <h1 className="text-4xl font-extrabold text-blue-900 uppercase tracking-wide">
            {categoryTitle}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {products.length} produtos encontrados
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} currentCategorySlug={catSlug} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center space-y-4">
            <p className="text-muted-foreground">
              Nenhum produto encontrado nesta categoria.
            </p>
            <Button
              render={
                <a
                  href={getWhatsAppUrl(
                    `Olá! Gostaria de saber mais sobre ${categoryTitle}.`
                  )}
                  target="_blank"
                />
              }
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Consultar pelo WhatsApp
            </Button>
          </div>
        )}
      </div>
    )
  }

  // 2-Level Route: Could be /produtos/[categoria]/[subcategoria] OR /produtos/[categoria]/[slug]
  if (slug.length === 2) {
    const [segment1, segment2] = slug

    // First check if segment2 matches a known subcategory/category
    const isCategory = categories.some((c) => c.slug.current === segment2)

    if (!isCategory) {
      // Check if segment2 matches a product slug
      const productDetail = await getProductDetails(segment2)
      if (productDetail) {
        const parentCategoryName = segment1.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
        return (
          <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/produtos" />}>
                    Produtos
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={`/produtos/${segment1}`} />}>
                    {parentCategoryName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{productDetail.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <ProductDetailClient product={productDetail} />
          </div>
        )
      }
    }

    // Otherwise, treat as Subcategory page: /produtos/[categoria]/[subcategoria]
    const products = await getProductsByCategory(segment2)
    const subcat = categories.find((c) => c.slug.current === segment2)
    const parentCat = categories.find((c) => c.slug.current === segment1)
    const title = subcat?.title || segment2.replace(/-/g, " ").toUpperCase()

    if (!subcat && products.length === 0) notFound()

    return (
      <div className="container mx-auto px-4 py-12 bg-slate-50 min-h-screen">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/produtos" />}>
                Produtos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {parentCat && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={`/produtos/${segment1}`} />}>
                    {parentCat.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-slate-200 p-4 rounded-lg mb-8 border-l-4 border-blue-900">
          <h1 className="text-4xl font-extrabold text-blue-900 uppercase tracking-wide">
            {title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {products.length} produtos encontrados
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} currentCategorySlug={segment2} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center space-y-4">
            <p className="text-muted-foreground">
              Nenhum produto encontrado nesta categoria.
            </p>
            <Button
              render={
                <a
                  href={getWhatsAppUrl(
                    `Olá! Gostaria de saber mais sobre ${title}.`
                  )}
                  target="_blank"
                />
              }
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Consultar pelo WhatsApp
            </Button>
          </div>
        )}
      </div>
    )
  }

  // 3-Level Route: /produtos/[categoria]/[subcategoria]/[slug]
  if (slug.length === 3) {
    const [segment1, segment2, productSlug] = slug
    const productDetail = await getProductDetails(productSlug)
    if (!productDetail) notFound()

    const parentCategoryName = segment1.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    const subcategoryName = segment2.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())

    return (
      <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/produtos" />}>
                Produtos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/produtos/${segment1}`} />}>
                {parentCategoryName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/produtos/${segment1}/${segment2}`} />}>
                {subcategoryName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{productDetail.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ProductDetailClient product={productDetail} />
      </div>
    )
  }

  notFound()
}
