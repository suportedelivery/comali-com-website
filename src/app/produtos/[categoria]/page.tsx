import { getProductsByCategory, getAllCategories } from "@/lib/sanity-products"
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

interface CategoryPageProps {
  params: Promise<{ categoria: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categoria } = await params
  const categories = await getAllCategories()
  const category = categories.find((c) => c.slug.current === categoria)
  if (!category) return { title: "Categoria não encontrada" }
  return {
    title: category.title,
    description: `Produtos da categoria ${category.title}`,
  }
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({
    categoria: category.slug.current,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoria } = await params
  const products = await getProductsByCategory(categoria)
  const categories = await getAllCategories()
  const category = categories.find((c) => c.slug.current === categoria)

  if (!category) notFound()

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
            <BreadcrumbPage>{category.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-slate-200 p-4 rounded-lg mb-8 border-l-4 border-blue-900">
        <h1 className="text-4xl font-extrabold text-blue-900 uppercase tracking-wide">
          {category.title}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {products.length} produtos encontrados
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
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
                  `Olá! Gostaria de saber mais sobre ${category.title}.`
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
